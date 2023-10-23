from backend.models.orm import db

class User(db.Document):
    email = db.EmailField(required=True, unique=True)
    password = db.StringField(required=True)
    username = db.StringField(required=True, unique=True)

    meta = {
        'indexes': [
            'email',
            'username',
        ]
    }