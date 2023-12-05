from datetime import datetime, timedelta
from typing import Annotated

from fastapi import Depends, HTTPException, status, Response

# from fastapi.security import OAuth2PasswordBearer
from utils.oauth2 import OAuth2PasswordBearerWithCookie
from jose import JWTError, jwt
from pydantic import BaseModel
from models.user import InvalidToken
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="/api/auth/login")


def decode_jwt(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_auth_user(token: Annotated[str, Depends(oauth2_scheme)], response: Response):
    if InvalidToken.objects(token=token).first() is not None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_jwt(token)
    username: str = payload.get("username")
    exp: datetime = payload.get("exp")

    if (
        username is not None
        and exp > datetime.utcnow().timestamp()
        and exp
        < (
            datetime.utcnow() + timedelta(minutes=5)
        ).timestamp()
    ):
        access_token = jwt.encode(
            {
                "username": username,
                "admin": payload.get("admin"),
                "exp": datetime.utcnow()
                + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
            },
            SECRET_KEY,
            algorithm=ALGORITHM,
        )
        InvalidToken(token=token, exp=exp).save()
        response.set_cookie(
            key="access_token", value=f"Bearer {access_token}", httponly=True
        )

    if username is None or exp is None or exp < datetime.utcnow().timestamp():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return username


def get_auth_user_optional(token: Annotated[str, Depends(oauth2_scheme)]):
    if InvalidToken.objects(token=token).first() is not None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No user logged in!",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_jwt(token)
    username: str = payload.get("username")
    exp: datetime = payload.get("exp")
    if username is None or exp is None or exp < datetime.utcnow().timestamp():
        return None
    return username


def get_admin(token: Annotated[str, Depends(oauth2_scheme)]):
    payload = decode_jwt(token)
    admin: bool = payload.get("admin")
    exp: datetime = payload.get("exp")
    if not admin or exp is None or exp < datetime.utcnow().timestamp():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to be an admin to access this resource",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return admin


class MessageResponse(BaseModel):
    message: str
