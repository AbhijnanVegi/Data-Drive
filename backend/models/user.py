from mongoengine import (
    Document,
    EmailField,
    StringField,
    DateTimeField,
    BooleanField,
    EnumField,
    IntField,
)

from models.common import Permission


class User(Document):
    """
    Database model for a user object.
    email : Email of the user.
    password : Password of the user.
    username : Username of the user.
    """

    email = EmailField(required=True, unique=True)
    password = StringField(required=True)
    username = StringField(required=True, unique=True)

    admin = BooleanField(default=False)
    permission = EnumField(Permission, required=True, default=Permission.WRITE)

    storage_quota = IntField(required=True)
    storage_used = IntField(required=True, default=0)

    meta = {
        "indexes": [
            "email",
            "username",
        ]
    }


class InvalidToken(Document):
    """
    Database model for a invalid token object. An invalid token object represents an access token which is invalid.
    (When a user logs out, the access token is added to the invalid token database)
    token :  The invalidated access token.
    exp : The expiry time of the access token.
    """

    token = StringField(required=True, unique=True)
    exp = DateTimeField(required=True)
