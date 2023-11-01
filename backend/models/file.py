from enum import Enum

from backend.models.orm import db
from backend.models.user import User

class Permission(Enum):
    READ = 'read'
    WRITE = 'write'
    NONE = 'none'

class File(db.Document):
    path = db.StringField(required=True, unique=True)
    size = db.IntField(required=True, default = 0)
    owner = db.ReferenceField(User, required=True)

    public = db.EnumField(Permission, required=True, default=Permission.NONE)

    is_dir = db.BooleanField(required=True, default=False)

    meta = {
        'indexes': [
            'path',
        ]
    }

    def get_permission(self, user):
        if self.owner == user:
            return Permission.WRITE

        shared_file = SharedFile.objects(file=self, user=user).first()
        if shared_file:
            return shared_file.permission

        return self.public

    def can_write(self, user):
        return self.get_permission(user) == Permission.WRITE

    def can_read(self, user):
        return self.get_permission(user) in [Permission.WRITE, Permission.READ]


class SharedFile(db.Document):
    file = db.ReferenceField(File, required=True)
    user = db.ReferenceField(User, required=True)
    permission = db.EnumField(Permission, required=True)

    explicit = db.BooleanField(required=True, default=False)
    meta = {
        'indexes': [
            'file',
            'user',
        ]
    }
