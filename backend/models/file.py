from enum import Enum
from mongoengine import Document, StringField, IntField, ReferenceField, EnumField, BooleanField, BooleanField

from backend.models.user import User


class Permission(Enum):
    READ = "read"
    WRITE = "write"
    NONE = "none"


class File(Document):
    path = StringField(required=True, unique=True)
    size = IntField(required=True, default=0)
    owner = ReferenceField(User, required=True)
    is_dir = BooleanField(required=True, default=False)

    public = EnumField(Permission, required=True, default=Permission.NONE)

    meta = {
        "indexes": [
            "path",
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


class SharedFile(Document):
    file = ReferenceField(File, required=True)
    user = ReferenceField(User, required=True)
    permission = EnumField(Permission, required=True)

    meta = {
        "indexes": [
            "file",
            "user",
        ]
    }
