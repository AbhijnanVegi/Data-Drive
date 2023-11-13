from datetime import datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Body, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr

from backend.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from backend.dependencies import oauth2_scheme, get_auth_user, MessageResponse
from backend.models.user import User
from backend.models.file import File

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

    user = User(username=username, email=email, password=data.password).save()

    # Create home directory for user
    File(path=username, size=0, owner=user).save()
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
            "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        },
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return {"access_token": access_token, "token_type": "bearer"}


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("username")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return username


class UserSession(BaseModel):
    username: str | None


@auth_router.get("/user", response_model=UserSession)
def user(username: Annotated[UserSession, Depends(get_auth_user)]):
    return {"username": username}
