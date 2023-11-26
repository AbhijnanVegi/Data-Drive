import os
import pathlib
import zipfile

from fastapi import BackgroundTasks
from typing import Optional, List
from datetime import datetime, timedelta

from models.file import File
from models.job import Job, Status
from storage.client import minio_client as mc
from config import MIN_BANDWIDTH


def create_job(token: str, files: List[File], username=None, prefix=None):
    job = Job(token=token, username=username, start_time=datetime.now())
    job.save()

    folder_name = f"{token}"
    size = 0
    for i, file in enumerate(files):
        try:
            mc.fget_object(
                "data-drive",
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
        with zipfile.ZipFile(f"/tmp/{os.path.basename(prefix)}.zip", mode="w") as archive:
            for file_path in directory.rglob("*"):
                archive.write(
                    file_path,
                    arcname=file_path.relative_to(directory)
                )
        job.download_path = f"/tmp/{os.path.basename(prefix)}.zip"
    else:
        job.download_path = f"/tmp/{folder_name}/{os.path.basename(files[0].path)}"

    job.exp_time = datetime.now() + timedelta(minutes=size / (60 * MIN_BANDWIDTH))
    job.size = size
    job.status = Status.DONE
    job.progress = 100
    job.save()
