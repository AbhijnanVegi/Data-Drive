from mongoengine import Document, EmailField, StringField


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
