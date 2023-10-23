from backend.models.orm import db
from backend.models.user import User

class Permission(db.Enum):
    READ = 'read'
    WRITE = 'write'
    NONE = 'none'

class File(db.Document):
    name = db.StringField(required=True)
    path = db.StringField(required=True, unique=True)
    size = db.IntField(required=True)
    owner = db.ReferenceField(User, required=True)
    created_at = db.DateTimeField(required=True)
    updated_at = db.DateTimeField(required=True)

    public = db.EnumField(Permission, required=True, default=Permission.NONE)

    meta = {
        'indexes': [
            'path',
        ]
    }

class SharedFile(db.Document):
    file = db.ReferenceField(File, required=True)
    user = db.ReferenceField(User, required=True)
    permission = db.EnumField(Permission, required=True)

    meta = {
        'indexes': [
            'file',
            'user',
        ]
    }