from enum import Enum

from mongoengine import (
    Document,
    StringField,
    DateTimeField,
    IntField,
    EnumField,
    BooleanField,
)


class Status(Enum):
    PENDING = "pending"
    RUNNING = "running"
    DONE = "done"
    FAILED = "failed"


class Job(Document):
    token = StringField(required=True, unique=True)
    progress = IntField(required=True, default=0)
    status = EnumField(Status, required=True, default=Status.PENDING)
    username = StringField()
    download_path = StringField()
    size = IntField()

    start_time = DateTimeField(required=True)
    exp_time = DateTimeField()
    expired = BooleanField(required=True, default=False)
