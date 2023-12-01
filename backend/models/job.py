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
    """
    Database model for a job object. A job object represents a download job.
    Token : Unique token generated for the job.
    Progress : Progress of the job in percentage.
    Status : Status of the job (pending, running, done, failed).
    Username : Username of the user who created the job.
    Download_path : Path where the file is being stored temporarily.
    Size : Size of the file/folder being downloaded.
    Start_time : Time when the job was created.
    Exp_time : Time when the job will expire and can be cleaned up.

    """
    token = StringField(required=True, unique=True)
    progress = IntField(required=True, default=0)
    status = EnumField(Status, required=True, default=Status.PENDING)
    username = StringField()
    download_path = StringField()
    size = IntField()

    start_time = DateTimeField(required=True)
    exp_time = DateTimeField()
    expired = BooleanField(required=True, default=False)
