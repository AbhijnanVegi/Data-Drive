from datetime import datetime, timedelta
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from pydantic import BaseModel, EmailStr

from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, app_config
from dependencies import get_auth_user, MessageResponse
from models.common import Permission
from models.user import User
from models.file import File

auth_router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    responses={404: {"description": "Not found"}},
)


class RegisterForm(BaseModel):
    username: str
    email: EmailStr
    password: str


@auth_router.post("/register", response_model=MessageResponse)
def register(data: Annotated[RegisterForm, Body(embed=True)]):
    # Get user data from request
    username = data.username
    email = data.email

    if User.objects(email=email).first() or User.objects(username=username).first():
        raise HTTPException(status_code=400, detail="User already exists")

    user = User(
        username=username,
        email=email,
        password=data.password,
        storage_quota=app_config.default_user_quota,
        permission=Permission(app_config.default_user_permission),
    ).save()

    # Create home directory for user
    File(path=username, size=0, owner=user, is_dir=True).save()
    return {"message": "User registered successfully!"}


class Token(BaseModel):
    access_token: str
    token_type: str


@auth_router.post("/login", response_model=Token)
def login(data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    # Get user data from request
    username = data.username
    password = data.password

    # Check if user exists in database
    user = User.objects(username=username).first()
    if not user:
        raise HTTPException(status_code=400, detail="User does not exist")

    # Verify password
    if not user.password == password:
        raise HTTPException(status_code=400, detail="Incorrect password")

    # Create access token
    access_token = jwt.encode(
        {
            "username": str(user.username),
            "admin": user.admin,
            "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        },
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return {"access_token": access_token, "token_type": "bearer"}


class UserSession(BaseModel):
    username: str | None
    admin: bool | None
    permission: int | None
    storage_quota: int | None
    storage_used: int | None


@auth_router.get("/user", response_model=UserSession)
def user(username: Annotated[UserSession, Depends(get_auth_user)]):
    user = User.objects(username=username).first()
    return {
        "username": username,
        "admin": user.admin,
        "permission": user.permission.value,
        "storage_quota": user.storage_quota,
        "storage_used": user.storage_used,
    }


class UserOut(BaseModel):
    username: str
    email: EmailStr


@auth_router.get("/users", response_model=List[UserOut])
def get_all_users():
    users = User.objects()
    return [{"username": user.username, "email": user.email} for user in users]
