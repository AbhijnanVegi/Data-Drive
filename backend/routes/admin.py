from typing import Annotated, List
from pydantic import BaseModel
from dynaconf.loaders.toml_loader import write
from fastapi import APIRouter, Depends, HTTPException, Body

from config import app_config
from dependencies import get_admin, MessageResponse
from models.user import User

admin_router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    responses={404: {"description": "Not found"}},
)


class Stats(BaseModel):
    username: str
    email: str
    permission: int
    storage_quota: int
    storage_used: int
    admin: bool


@admin_router.get("/users", response_model=List[Stats])
def stats(admin: Annotated[bool, Depends(get_admin)]):
    users = []
    for user in User.objects():
        users.append(
            Stats(
                username=user.username,
                email=user.email,
                permission=user.permission.value,
                storage_quota=user.storage_quota,
                storage_used=user.storage_used,
                admin = user.admin
            )
        )
    return users


class UpdateUserData(BaseModel):
    username: str
    permission: int
    storage_quota: int


@admin_router.post("/update_user", response_model=MessageResponse)
def update_user(
    admin: Annotated[bool, Depends(get_admin)],
    data: Annotated[UpdateUserData, Body(embed=True)],
):
    user = User.objects(username=data.username).first()
    if not user:
        raise HTTPException(status_code=400, detail="User does not exist")
    user.permission = data.permission
    user.storage_quota = data.storage_quota
    user.save()
    return {"message": "User updated successfully!"}


class Config(BaseModel):
    max_preview_size: int | None
    min_bandwidth: int | None
    default_user_quota: int | None
    default_user_permission: int | None
    allowed_file_extensions: List[str] | None


@admin_router.get("/config", response_model=Config)
def get_config(admin: Annotated[bool, Depends(get_admin)]):
    print(app_config.max_preview_size)
    return Config(
        max_preview_size=app_config.max_preview_size,
        min_bandwidth=app_config.min_bandwidth,
        default_user_quota=app_config.default_user_quota,
        default_user_permission=app_config.default_user_permission,
        allowed_file_extensions=app_config.allowed_file_extensions,
    )


@admin_router.post("/update_config", response_model=MessageResponse)
def update_config(
    admin: Annotated[bool, Depends(get_admin)],
    data: Annotated[Config, Body(embed=True)],
):
    app_config.max_preview_size = data.max_preview_size
    app_config.min_bandwidth = data.min_bandwidth
    app_config.default_user_quota = data.default_user_quota
    app_config.default_user_permission = data.default_user_permission
    app_config.allowed_file_extensions = data.allowed_file_extensions

    write(
        "settings.toml",
        {
            "drive": {
                "max-preview-size": app_config.max_preview_size,
                "min-bandwidth": app_config.min_bandwidth,
                "default-user-quota": app_config.default_user_quota,
                "default-user-permission": app_config.default_user_permission,
                "allowed-file-extensions": app_config.allowed_file_extensions,
            }
        },
        merge=False,
    )

    return {"message": "Config updated successfully!"}
