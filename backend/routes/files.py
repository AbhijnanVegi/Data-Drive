import os, mimetypes, io
from datetime import datetime
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Body, status, UploadFile, Form
from fastapi.responses import FileResponse
from werkzeug.utils import secure_filename
from pydantic import BaseModel

from backend.dependencies import get_auth_user, get_auth_user_optional, MessageResponse
from backend.models.user import User
from backend.models.file import File, SharedFile, Permission

from backend.storage.client import minio_client as mc

files_router = APIRouter(
    prefix="",
    tags=["files"],
    responses={404: {"description": "Not found"}},
)


class PathForm(BaseModel):
    path: str

class ObjectModel(BaseModel):
    path: str
    is_dir: bool
    last_modified: datetime | None
    size: int | None
    metadata: dict | None

@files_router.post("/upload", response_model=MessageResponse)
async def upload_file(path: Annotated[str, Form()], file: UploadFile, username: Annotated[str, Depends(get_auth_user)]):
    fileObj = File.objects(path=path).first()
    if fileObj:
        return {"message": "File already exists!"}

    directory = File.objects(path=os.path.dirname(path)).first()
    if not directory:
        return {"message": "Directory does not exist!"}

    user = User.objects(username=username).first()
    if not directory.can_write(user):
        return {"message": "You do not have permission to upload to this directory!"}
        
    content_type = mimetypes.guess_type(path)[0]
    if content_type is None:
        content_type = "application/octet-stream"

    try:
        # mc.fput_object(
            # "data-drive", data.path, "/tmp/" + secure_filename(data.path), content_type
        # )
        # mc.fput_object('data-drive', path, file.file.fileno(), content_type)
        mc.put_object("data-drive", path, file.file, -1, content_type, part_size=10*1024*1024)

        # Create database entry for file
        file = File(
            path=path,
            size=file.size,
            owner=user,
            public=directory.public,
        ).save()

        # Inherit permissions from parent directory
        shares = SharedFile.objects(file=directory)
        for share in shares:
            SharedFile(file=file, user=share.user, permission=share.permission).save()

        return {"message": "File uploaded successfully!"}

    except Exception as err:
        print(err)
        return {"message": str(err)}


@files_router.post("/mkdir", response_model=MessageResponse)
def mkdir(
    data: Annotated[PathForm, Body(embed=True)],
    username: Annotated[str, Depends(get_auth_user)],
):
    directory = File.objects(path=data.path).first()
    if directory:
        return {"message": "Directory already exists!"}

    parent = File.objects(path=os.path.dirname(data.path)).first()
    print(os.path.dirname(data.path))
    if not parent:
        return {"message": "Parent directory does not exist!"}

    user = User.objects(username=username).first()
    if not parent.can_write(user):
        return {"message": "You do not have permission to create a directory here!"}

    directory = File(path=data.path, owner=user).save()
    mc.put_object("data-drive", data.path + "/_", io.BytesIO(b""), 0)
    return {"message": "Directory created successfully!"}


@files_router.post("/create_home", response_model=MessageResponse)
def create_home(username: Annotated[str, Depends(get_auth_user)]):
    File(path=user.username, size=0, owner=user).save()
    return {"message": "Home directory created successfully!"}


@files_router.post("/list", response_model=List[ObjectModel])
def list(data: Annotated[PathForm, Body(embed=True)], username: Annotated[str, Depends(get_auth_user_optional)]):
    directory = File.objects(path=data.path).first()
    if not directory:
        raise HTTPException(status_code=400, detail="Directory does not exist!")

    if username:
        user = User.objects(username=username).first()
    else:
        user = None
    if not directory.can_read(user):
        return (
            jsonify(
                {"message": "You do not have permission to access this directory!"}
            ),
            400,
        )

    objJSON = []
    for obj in mc.list_objects("data-drive", data.path+'/', recursive=False):
        objJSON.append(
            {
                "path": obj.object_name,
                "is_dir": obj.is_dir,
                "last_modified": obj.last_modified,
                "size": obj.size,
                "metadata": obj.metadata,
            }
        )
    
    return objJSON


@files_router.get("/get/<path:path>", response_class=FileResponse)
def get_file(path : str, username: Annotated[str, Depends(get_auth_user_optional)]):
    file = File.objects(path=path).first()
    if not file:
        return jsonify({"message": "File does not exist!"}), 400

    user = None
    if username:
        user = User.objects(username=username).first()
    if not file.can_read(user):
        raise HTTPException(status_code=400, detail="You do not have permission to access this file!")

    try:
        mc.fget_object("data-drive", path, "/tmp/" + path)
        return "/tmp/" + path
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))


@files_router.get("/download/<path:path>")
def download_file(path):
    """
    Desc: Download file from storage
    Params: path = string
    """
    file = File.objects(path=path).first()
    if not file:
        raise HTTPException(status_code=400, detail="File does not exist!")

    user = User.objects(id=session.get("user_id")).first()
    if not file.can_read(user):
        raise HTTPException(status_code=400, detail="You do not have permission to access this file!")

    try:
        mc.fget_object("data-drive", path, "/tmp/" + path)
        return send_file("/tmp/" + path, as_attachment=True)
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))
