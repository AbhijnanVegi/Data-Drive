from datetime import datetime, timedelta
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Body, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr

from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from dependencies import oauth2_scheme, get_auth_user, MessageResponse
from models.user import User, InvalidToken
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
    """
    Register a new user.

    - **username**: Username of the user.
    - **email**: Email of the user.
    - **password**: Password of the user.

    Creates a new user with the given username, email and password and creates a home directory for the user.
    """
    # Get user data from request
    username = data.username
    email = data.email

    if User.objects(email=email).first() or User.objects(username=username).first():
        raise HTTPException(status_code=400, detail="User already exists")

    user = User(username=username, email=email, password=data.password).save()

    # Create home directory for user
    File(path=username, size=0, owner=user, is_dir=True).save()
    return {"message": "User registered successfully!"}


class Token(BaseModel):
    access_token: str
    token_type: str


@auth_router.post("/login", response_model=Token)
def login(data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    """
    Login a user.

    - **username**: Username of the user.
    - **password**: Password of the user.

    Checks if the user exists and the password is correct and returns an access token.
    """
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


@auth_router.post("/logout", response_model=MessageResponse)
def logout(
        token: Annotated[str, Depends(oauth2_scheme)]
):
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


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    """
    Get the username of the user from the access token.
    """
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
    """
    Get the username of the logged in user.
    """
    return {"username": username}


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
