from mongoengine import Document, EmailField, StringField, DateTimeField


class User(Document):
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)
    username = StringField(required=True, unique=True)

    meta = {
        "indexes": [
            "email",
            "username",
        ]
    }


class InvalidToken(Document):
    token = StringField(required=True, unique=True)
    exp = DateTimeField(required=True)
