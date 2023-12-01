import os
import mimetypes
import io
import secrets
from datetime import datetime, timedelta
from typing import Annotated, List

import minio.commonconfig
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Body,
    UploadFile,
    Form,
    BackgroundTasks,
)
from fastapi.responses import FileResponse
from pydantic import BaseModel
from minio.deleteobjects import DeleteObject

from config import MAX_PREVIEW_SIZE, MIN_BANDWIDTH
from dependencies import get_auth_user, get_auth_user_optional, MessageResponse
from models.user import User
from models.file import File, SharedFile
from models.file import Permission
from models.job import Job, Status

from storage.client import minio_client as mc
from tasks.files import create_job, clean_expired_jobs

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
            SharedFile(file=file, user=share.user,
                       permission=share.permission, owner=share.owner).save()

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
        raise HTTPException(
            status_code=400, detail="Directory does not exist!")

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
        raise HTTPException(
            status_code=400, detail="Cannot preview a directory!")

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
    file = File.objects(path=path).first()

    shared_list = []

    if not file:
        raise HTTPException(status_code=400, detail="File does not exist!")
    else:
        parent_usr = User.objects(username=parent_username).first()
        child_usr = User.objects(username=child_username).first()
        if parent_usr == child_usr:
            raise HTTPException(
                status_code=400, detail="You cannot share with yourself!")
        if file.owner != parent_usr:
            raise HTTPException(
                status_code=400, detail="You do not have permission to share this file!")

        shared_file = SharedFile.objects(file=file, user=child_usr, owner=parent_usr, explicit=True).first()

        if shared_file is None:
            shared_file = SharedFile(file=file, user=child_usr, permission=perm,
                                     owner=parent_usr, explicit=True)
            shared_file.save()

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
            shared_file = SharedFile.objects(file=file, user=child_usr, owner=parent_usr, explicit=False).first()

            if shared_file:
                if perm.value > shared_file.permission.value:
                    shared_file.permission = perm
                    shared_file.save()
            else:
                shared_file = SharedFile(file=file, user=child_usr,
                                         permission=perm, explicit=False, owner=parent_usr)
                shared_file.save()

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
            shared_file = SharedFile.objects(
                user=user, explicit=True, file=file).first()

            if shared_file:
                if shared_file.file.is_dir:
                    for obj in mc.list_objects("data-drive", prefix=path + "/", recursive=False):
                        if obj.object_name[-1] == '_':
                            continue

                        if obj.is_dir:
                            print(obj.object_name)
                            _shared_file = SharedFile.objects(user=user, file=File.objects(
                                path=obj.object_name[:-1]).first()).first()
                        else:
                            print(obj.object_name)
                            _shared_file = SharedFile.objects(user=user,
                                                              file=File.objects(path=obj.object_name).first()).first()
                        shared_list.append(
                            {
                                "path": obj.object_name,
                                "is_dir": obj.is_dir,
                                "last_modified": obj.last_modified,
                                "size": obj.size,
                                "metadata": obj.metadata,
                                "permission": _shared_file.permission,
                                "explicit": _shared_file.explicit,
                                "shared_with": _shared_file.user.username,
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
                            "permission": shared_file.permission,
                            "explicit": shared_file.explicit,
                            "shared_with": shared_file.user.username,
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


@files_router.post("/copy", response_model=MessageResponse)
def copy(
        src_path: Annotated[str, Body(embed=True)],
        dest_path: Annotated[str, Body(embed=True)],
):
    """
    Desc: Move the file specified by the path.
    """
    src_file = File.objects(path=src_path).first()
    dest_file = File.objects(path=dest_path).first()

    parent_path = os.path.dirname(src_path)

    if src_file is None:
        raise HTTPException(status_code=400, detail="Source file/folder does not exist!")

    if dest_file is None:
        raise HTTPException(status_code=400, detail="Destination folder does not exist!")
    elif not dest_file.is_dir:
        raise HTTPException(status_code=400, detail="Destination is not a directory!")

    if src_file.is_dir:
        for obj in mc.list_objects("data-drive", prefix=src_path + "/", recursive=True):
            mc.copy_object("data-drive", dest_path + obj.object_name[len(parent_path):],
                           minio.commonconfig.CopySource("data-drive", obj.object_name))

        for file in File.objects(path__startswith=src_path):
            File(path=dest_path + file.path[len(parent_path):], size=file.size, owner=file.owner, public=file.public,
                 is_dir=file.is_dir).save()
    else:
        mc.copy_object("data-drive", dest_path + src_path[len(src_path):],
                       minio.commonconfig.CopySource("data-drive", src_path))
        File(path=dest_path + src_file.path[len(parent_path):], size=src_file.size, owner=src_file.owner,
             public=src_file.public, is_dir=src_file.is_dir).save()

    return {"message": "File/folder copied successfully!"}


@files_router.post("/move", response_model=MessageResponse)
def move(
        src_path: Annotated[str, Body(embed=True)],
        dest_path: Annotated[str, Body(embed=True)],
):
    """
    Desc: Move the file specified by the path.
    src_path : File/folder to be moved
    dest_path : Destination folder (src_path will be moved to inside the folder pointed by dest_path)
    """

    src_file = File.objects(path=src_path).first()
    dest_file = File.objects(path=dest_path).first()

    parent_path = os.path.dirname(src_path)

    if src_file is None:
        raise HTTPException(status_code=400, detail="Source file/folder does not exist!")

    if dest_file is None:
        raise HTTPException(status_code=400, detail="Destination folder does not exist!")

    if not dest_file.is_dir:
        raise HTTPException(status_code=400, detail="Destination is not a directory!")

    if src_file.is_dir:
        for obj in mc.list_objects("data-drive", prefix=src_path + "/", recursive=True):
            mc.copy_object("data-drive", dest_path + obj.object_name[len(parent_path):],
                           minio.commonconfig.CopySource("data-drive", obj.object_name))
            mc.remove_object("data-drive", obj.object_name)

        to_move_share = File.objects(path=src_path).first()
        users_to_move_for = []

        for _share in SharedFile.objects(file=to_move_share):
            if _share.explicit:
                users_to_move_for.append(_share.user)

        for file in File.objects(path__startswith=src_path):
            shares = SharedFile.objects(file=file)
            file.path = dest_path + file.path[len(parent_path):]
            file.save()
            for _share in shares:
                if _share.user not in users_to_move_for:
                    _share.delete()

        return {"message": "File/folder moved successfully!"}

    else:
        obj = mc.copy_object("data-drive", dest_path + src_path[len(src_path):],
                             minio.commonconfig.CopySource("data-drive", src_path))
        mc.remove_object("data-drive", src_path)

        to_move_file = File.objects(path=src_path).first()
        to_move_file.path = dest_path + to_move_file.path[len(parent_path):]
        for _share in SharedFile.objects(file=to_move_file):
            if not _share.explicit:
                _share.delete()

        return {"message": "File/folder moved successfully!"}


class TokenResponse(BaseModel):
    token: str


@files_router.get("/token/{path:path}", response_model=TokenResponse)
def download_file(
        path: str,
        username: Annotated[str, Depends(get_auth_user_optional)],
        background_tasks: BackgroundTasks,
):
    background_tasks.add_task(clean_expired_jobs)
    file = File.objects(path=path).first()
    if not file:
        raise HTTPException(status_code=400, detail="File does not exist!")

    user = User.objects(username=username).first()
    if not file.can_read(user):
        raise HTTPException(
            status_code=400, detail="You do not have permission to access this file!"
        )

    # generate a token for download
    token = secrets.token_urlsafe(32)
    if file.is_dir:
        files = File.objects(path__startswith=path + '/')
        background_tasks.add_task(create_job, token, files, username, path)
    else:
        background_tasks.add_task(create_job, token, [file], username, None)

    return {"token": token}


class StatusResponse(BaseModel):
    status: str
    progress: int


@files_router.get("/status/{token}", response_model=StatusResponse)
def token_status(token: str):
    job = Job.objects(token=token).first()
    if not job:
        raise HTTPException(status_code=400, detail="Job does not exist!")

    return {"status": job.status.value, "progress": job.progress}


@files_router.get("/download/{token}", response_class=FileResponse)
def download(token: str):
    job = Job.objects(token=token).first()
    if not job or job.expired:
        raise HTTPException(status_code=400, detail="Job does not exist!")

    if job.status != Status.DONE:
        raise HTTPException(status_code=400, detail="Job not done yet!")

    job.expired = True
    job.exp_time = datetime.now() + timedelta(minutes=job.size / (60 * MIN_BANDWIDTH))
    job.save()

    return job.download_path


def refresh_share_perms(username: str):
    """
    Desc: When uploading a new file or making a change, call this to refresh the shares.
    """

    user = User.objects(usernname=username)

    for explicit_share in SharedFile.objects(user=user, explicit=True):
        for file in File.objects(path__startswith=explicit_share.file.path + '/'):
            existing_share = SharedFile.objects(user=explicit_share.user, file=file, explicit=False, owner=file.owner)

            if existing_share is None:
                SharedFile(file=file, user=explicit_share.user, permission=explicit_share.permission,
                           explicit=False, owner=file.owner).save()


