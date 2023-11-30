from mongoengine import (
    Document,
    StringField,
    IntField,
    ReferenceField,
    EnumField,
    BooleanField,
    BooleanField,
)

from models.common import Permission
from models.user import User


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
            return min(Permission.WRITE, user.permission)

        shared_file = SharedFile.objects(file=self, user=user).first()
        if shared_file:
            return shared_file.permission

        return self.public

    def can_write(self, user):
        return self.get_permission(user) == Permission.WRITE

    def can_read(self, user):
        return self.get_permission(user) in [Permission.WRITE, Permission.READ]

    def get_size(self):
        if not self.is_dir:
            return self.size

        pipeline = [
            {"$match": {"path": {"$regex": f"^{self.path}/"}}},
            {"$group": {"_id": None, "size": {"$sum": "$size"}}},
        ]

        result = File.objects.aggregate(*pipeline)
        return result.next()["size"]


class SharedFile(Document):
    file = ReferenceField(File, required=True)
    user = ReferenceField(User, required=True)
    permission = EnumField(Permission, required=True)
    explicit = BooleanField(required=True, default=False)
    owner = ReferenceField(User, required=True)

    explicit = BooleanField(required=True, default=False)
    meta = {
        "indexes": [
            "file",
            "user",
            "owner",
        ]
    }
