import os
import mimetypes
import io
from datetime import datetime
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Body, UploadFile, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel
from minio.deleteobjects import DeleteObject

from backend.dependencies import get_auth_user, get_auth_user_optional, MessageResponse
from backend.models.user import User
from backend.models.file import File, SharedFile
from backend.models.file import Permission

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


class SharedFileModel(BaseModel):
    path: str
    is_dir: bool
    last_modified: datetime | None
    size: int | None
    metadata: dict | None
    permission: Permission
    explicit: bool
    shared_with: str


@files_router.post("/upload", response_model=MessageResponse)
async def upload_file(
        path: Annotated[str, Form()],
        file: UploadFile,
        username: Annotated[str, Depends(get_auth_user)],
):
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
        mc.put_object(
            "data-drive", path, file.file, -1, content_type, part_size=10 * 1024 * 1024
        )

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
    if not parent:
        return {"message": "Parent directory does not exist!"}

    user = User.objects(username=username).first()
    if not parent.can_write(user):
        return {"message": "You do not have permission to create a directory here!"}

    directory = File(path=data.path, owner=user, is_dir=True).save()
    mc.put_object("data-drive", data.path + "/_", io.BytesIO(b""), 0)
    return {"message": "Directory created successfully!"}


@files_router.post("/list", response_model=List[ObjectModel])
def list(
        data: Annotated[PathForm, Body(embed=True)],
        username: Annotated[str, Depends(get_auth_user_optional)],
):
    directory = File.objects(path=data.path).first()
    if not directory or not directory.is_dir:
        raise HTTPException(status_code=400, detail="Directory does not exist!")

    if username:
        user = User.objects(username=username).first()
    else:
        user = None
    if not directory.can_read(user):
        raise HTTPException(
            status_code=400,
            detail="You do not have permission to access this directory!",
        )

    objJSON = []
    for obj in mc.list_objects("data-drive", data.path + "/", recursive=False):
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


@files_router.post("/delete", response_model=MessageResponse)
def delete(
        data: Annotated[PathForm, Body(embed=True)],
        username: Annotated[str, Depends(get_auth_user)],
):
    file = File.objects(path=data.path).first()
    if not file:
        raise HTTPException(status_code=400, detail="File does not exist!")

    is_dir = file.is_dir
    if is_dir:
        if file.path == username:
            raise HTTPException(
                status_code=400, detail="You cannot delete your home directory!"
            )

    user = User.objects(username=username).first()
    if not file.can_write(user):
        raise HTTPException(
            status_code=400, detail="You do not have permission to delete this file/folder!"
        )

    if is_dir:
        mc.remove_object("data-drive", data.path + "/_")
        delete_object_list = map(
            lambda x: DeleteObject(x.object_name),
            mc.list_objects("data-drive", data.path, recursive=True),
        )
        errors = mc.remove_objects("data-drive", delete_object_list)
        # delete shared file objects associated with files in the directory
        for file in File.objects(path__startswith=data.path):
            SharedFile.objects(file=file).delete()
            file.delete()

        for error in errors:
            print("Error occurred when deleting " + error.object_name)
        return {"message": "Folder deleted successfully!"}
    else:
        mc.remove_object("data-drive", data.path)
        SharedFile.objects(file=file).delete()
        file.delete()
        return {"message": "File deleted successfully!"}


@files_router.get("/get/<path:path>", response_class=FileResponse)
def get_file(path: str, username: Annotated[str, Depends(get_auth_user_optional)]):
    file = File.objects(path=path).first()
    if not file:
        raise HTTPException(status_code=400, detail="File does not exist!")

    if file.is_dir:
        raise HTTPException(status_code=400, detail="Cannot preview a directory!")

    user = None
    if username:
        user = User.objects(username=username).first()
    if not file.can_read(user):
        raise HTTPException(
            status_code=400, detail="You do not have permission to access this file!"
        )

    try:
        mc.fget_object("data-drive", path, "/tmp/" + path)
        return "/tmp/" + path
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))


@files_router.post("/share", response_model=MessageResponse)
def share(
        path: Annotated[str, Body(embed=True)],
        parent_username: Annotated[str, Depends(get_auth_user)],
        child_username: Annotated[str, Body(embed=True)],
        perm: Annotated[Permission, Body(embed=True)] = Permission.READ,
):
    # if parent_usr == share_usr:
    #     raise HTTPException(status_code=400, detail="You cannot share with yourself!")

    file = File.objects(path=path).first()

    shared_list = []

    if not file:
        raise HTTPException(status_code=400, detail="File does not exist!")
    else:
        parent_usr = User.objects(username=parent_username).first()
        child_usr = User.objects(username=child_username).first()
        if file.owner != parent_usr:
            raise HTTPException(status_code=400, detail="You do not have permission to share this file!")

        shared_file = SharedFile.objects(file=file, user=child_usr).first()

        if shared_file is None:
            SharedFile(file=file, user=child_usr, permission=perm, explicit=True).save()
        else:
            shared_file.permission = perm
            shared_file.save()

        shared_list.append(shared_file)

    for obj in mc.list_objects("data-drive", prefix=path + "/", recursive=True):
        if obj.object_name[-1] == '_':
            file_path = obj.object_name[:-2]
            file = File.objects(path=file_path).first()
        else:
            file = File.objects(path=obj.object_name).first()

        if file:
            shared_file = SharedFile.objects(file=file, user=child_usr).first()

            if shared_file:
                if perm.value > shared_file.permission.value:
                    shared_file.permission = perm
                    shared_file.save()
            else:
                SharedFile(file=file, user=child_usr, permission=perm, explicit=False).save()

            shared_list.append(shared_file)

    return {"message": "File shared successfully!"}


@files_router.post("/list_shared_with", response_model=List[SharedFileModel])
def get_shared_with(
        username: Annotated[str, Depends(get_auth_user_optional)],
        path: Annotated[str, Body(embed=True)] = None,
):
    """
    Desc: List the shared files with the user, in the specified directory,
    if no directory is specified, list all the shared files with the user.
    """

    if username:
        user = User.objects(username=username).first()
    else:
        user = None
        return {"message": "You are not logged in!"}

    shared_list = []

    if path is None:
        for shared_file in SharedFile.objects(user=user, explicit=True):
            file = shared_file.file
            shared_list.append(
                {
                    "path": file.path,
                    "is_dir": file.is_dir,
                    "last_modified": None,
                    "size": file.size,
                    "metadata": None,
                    "permission": shared_file.permission,
                    "explicit": shared_file.explicit,
                    "shared_with": shared_file.user.username,
                }
            )
    else:
        file = File.objects(path=path).first()

        if file is None:
            raise HTTPException(status_code=400, detail="File does not exist!")
        else:
            shared_file = SharedFile.objects(user=user, explicit=True, file=file).first()

            if shared_file:
                if shared_file.file.is_dir:
                    for obj in mc.list_objects("data-drive", prefix=path + "/", recursive=False):
                        shared_list.append(
                            {
                                "path": obj.object_name,
                                "is_dir": obj.is_dir,
                                "last_modified": obj.last_modified,
                                "size": obj.size,
                                "metadata": obj.metadata,
                            }
                        )
                else:
                    shared_list.append(
                        {
                            "path": shared_file.file.path,
                            "is_dir": shared_file.file.is_dir,
                            "last_modified": None,
                            "size": shared_file.file.size,
                            "metadata": None,
                        }
                    )
    return shared_list


@files_router.post("/list_shared_by", response_model=List[SharedFileModel])
def get_shared_by(
        username: Annotated[str, Depends(get_auth_user_optional)],
):
    """
    Desc: List the explicit shared files by the user.
    """
    if username is not None:
        user = User.objects(username=username).first()
        shared_list = []

        for shared_file in SharedFile.objects(owner=user, explicit=True):
            file = shared_file.file
            shared_list.append(
                {
                    "path": file.path,
                    "is_dir": file.is_dir,
                    "last_modified": None,
                    "size": file.size,
                    "metadata": None,
                    "permission": shared_file.permission,
                    "explicit": shared_file.explicit,
                    "shared_with": shared_file.user.username,
                }
            )

        return shared_list
    else:
        user = None
        return {"message": "You are not logged in!"}


@files_router.post("/unshare", response_model=MessageResponse)
def unshare(
        path: Annotated[str, Body(embed=True)],
        child_username: Annotated[str, Body(embed=True)],
        parent_username: Annotated[str, Depends(get_auth_user)],
):
    """
    Desc: Unshare the file specified by the path.
    """
    file = File.objects(path=path).first()
    parent_usr = User.objects(username=parent_username).first()
    child_usr = User.objects(username=child_username).first()

    if file is None:
        raise HTTPException(status_code=400, detail="File does not exist!")
    else:
        shared_file = SharedFile.objects(file=file, user=child_usr).first()

        if shared_file.explicit:
            shared_file.delete()
            return {"message": "File unshared successfully!"}
        else:
            return {"message": "File is not explicitly shared, delete the parent share first!"}

# @files_router.post("/unshare", response_model=MessageResponse)
# def clear_shared(
#         username: Annotated[str, Depends(get_auth_user_optional)],
# ):
#     usr = User.objects(username=username).first()
#
#     if usr is None:
#         raise HTTPException(status_code=400, detail="User does not exist!")
#     else:
#         SharedFile.objects(user=usr).delete()
#         return {"message": "Shared files cleared successfully!"}

# @files_router.get("/download/<path:path>")
# def download_file(path):
#     """
#     Desc: Download file from storage
#     Params: path = string
#     """
#     file = File.objects(path=path).first()
#     if not file:
#         raise HTTPException(status_code=400, detail="File does not exist!")

#     user = User.objects(id=session.get("user_id")).first()
#     if not file.can_read(user):
#         raise HTTPException(status_code=400, detail="You do not have permission to access this file!")

#     try:
#         mc.fget_object("data-drive", path, "/tmp/" + path)
#         return send_file("/tmp/" + path, as_attachment=True)
#     except Exception as err:
#         raise HTTPException(status_code=400, detail=str(err))
