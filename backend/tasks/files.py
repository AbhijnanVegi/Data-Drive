import os
import pathlib
import zipfile

from typing import List
from datetime import datetime, timedelta

from models.file import File
from models.job import Job, Status
from storage.client import minio_client as mc
from config import app_config, MINIO_BUCKET


def create_job(token: str, files: List[File], username=None, prefix=None):
    job = Job(token=token, username=username, start_time=datetime.now())
    job.save()

    folder_name = f"{token}"
    size = 0
    for i, file in enumerate(files):
        try:
            mc.fget_object(
                MINIO_BUCKET,
                file.path,
                f"/tmp/{folder_name}/{os.path.relpath(file.path, prefix) if prefix else os.path.basename(file.path)}",
            )
            job.progress = (i + 1) / len(files) * 100
            job.save()
            size += file.size
        except Exception as e:
            print(e)
            job.status = Status.FAILED
            job.save()
            return

    if len(files) > 1:
        directory = pathlib.Path(f"/tmp/{folder_name}")
        with zipfile.ZipFile(
            f"/tmp/{os.path.basename(prefix)}.zip", mode="w"
        ) as archive:
            for file_path in directory.rglob("*"):
                archive.write(file_path, arcname=file_path.relative_to(directory))
        job.download_path = f"/tmp/{os.path.basename(prefix)}.zip"
    else:
        job.download_path = f"/tmp/{folder_name}/{os.path.basename(files[0].path)}"

    job.exp_time = datetime.now() + timedelta(
        minutes=size / (60 * app_config.min_bandwidth)
    )
    job.size = size
    job.status = Status.DONE
    job.progress = 100
    job.save()


def clean_expired_jobs():
    jobs = Job.objects(exp_time__lte=datetime.now(), status=Status.DONE)

    for job in jobs:
        job.expired = True
        job.save()
        if os.path.exists(job.download_path):
            os.remove(job.download_path)
        if os.path.exists(f"/tmp/{job.token}"):
            # forcefully remove directory
            os.system(f"rm -rf /tmp/{job.token}")

        job.delete()

def upload_file_to_minio(path, file, content_type, user, directory):
    print("Uploading")
    try:
        mc.put_object(
            MINIO_BUCKET,
            path,
            file.file,
            -1,
            content_type=content_type,
            part_size=10*1024*1024,
        )

        file = File(
                path=path,
                size=file.size,
                owner=user,
                public=directory.public,
            ).save()

        # Update user storage used
        user.storage_used += file.size
        user.save()

        # Inherit permissions from parent directory
        shares = SharedFile.objects(file=directory)
        for share in shares:
            SharedFile(
                file=file,
                user=share.user,
                permission=share.permission,
                owner=share.owner,
            ).save()

        print(f"File uploaded to {path}")
    except Exception as e:
        print(e)
