from datetime import datetime, timedelta
from typing import Annotated, List
import requests

from fastapi import APIRouter, Depends, HTTPException, Body, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt, JWTError
from pydantic import BaseModel, EmailStr

from config import AUTH_URL, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, app_config
from dependencies import get_auth_user, MessageResponse, oauth2_scheme
from models.common import Permission
from models.user import User, InvalidToken
from models.file import File

auth_router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    responses={404: {"description": "Not found"}},
)

class Token(BaseModel):
    access_token: str
    token_type: str


@auth_router.post("/login", response_model=Token)
def login(data: Annotated[OAuth2PasswordRequestForm, Depends()], response: Response):
    """
    Login a user.

    - **username**: Username of the user.
    - **password**: Password of the user.

    Checks if the user exists and the password is correct and returns an access token.
    """
    # Get user data from request
    username = data.username
    password = data.password

    # send request to auth server
    if AUTH_URL:
        r = requests.post(
            f"{AUTH_URL}/login",
            json={"email": username, "password": password},
        )

        if r.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid credentials")

        data = r.json().get("data", {})
        username = data.get("user").get("user_email")
        if not username:
            raise HTTPException(status_code=400, detail="Invalid credentials")
    else:
        if not username or not password:
            raise HTTPException(status_code=400, detail="Invalid credentials")

    # Check if user exists in database
    user = User.objects(username=username).first()
    if not user:
        user = User(
            username=username,
            email=username,
            password=password,
            storage_quota=app_config.default_user_quota,
            permission=Permission(app_config.default_user_permission),
        ).save()
        
        File(path=username, size=0, owner=user, is_dir=True).save()

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

    response.set_cookie(
        key="access_token", value=f"Bearer {access_token}", httponly=True
    )

    return {"access_token": access_token, "token_type": "bearer"}


@auth_router.post("/logout", response_model=MessageResponse)
def logout(token: Annotated[str, Depends(oauth2_scheme)]):
    """
    Handles logout of a user.

    - **token**: Access token of the user.

    Adds the access token to the invalid token database. So that the access token cannot be used again until it expires.
    """
    if token is None:
        raise HTTPException(status_code=400, detail="Auth token is missing")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        exp = payload.get("exp")
        exp = datetime.fromtimestamp(exp)
        username = payload.get("username")
        if username is None or exp is None:
            raise HTTPException(status_code=400, detail="Invalid token")
        if InvalidToken.objects(token=token).first() is None:
            InvalidToken(token=token, exp=exp).save()

        return {"message": "Logged out successfully!"}
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid token")


class UserSession(BaseModel):
    username: str | None
    admin: bool | None
    permission: int | None
    storage_quota: int | None
    storage_used: int | None


@auth_router.get("/user", response_model=UserSession)
def user(username: Annotated[UserSession, Depends(get_auth_user)]):
    """
    Returns the username, privilege level, storage quota and storage used of the user.
    """
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
    """
    Get a list of all users in the database.
    """
    users = User.objects()
    return [{"username": user.username, "email": user.email} for user in users]
