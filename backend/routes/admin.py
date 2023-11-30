from typing import Annotated, List
from pydantic import BaseModel

from fastapi import APIRouter, Depends, HTTPException, Body, status

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
