from datetime import datetime
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel

from config import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


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


def get_auth_user(token: Annotated[str, Depends(oauth2_scheme)]):
    payload = decode_jwt(token)
    username: str = payload.get("username")
    exp: datetime = payload.get("exp")
    if username is None or exp is None or exp < datetime.utcnow().timestamp():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return username


def get_auth_user_optional(token: Annotated[str, Depends(oauth2_scheme)]):
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
