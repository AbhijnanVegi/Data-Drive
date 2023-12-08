# Data-Drive
Data drive is a cloud file hosting/sharing platform to allow researchers to share and collaborate on data. It is built on top of MinIO using FastAPI and ReactJS. It allows users to upload, download, share and visualize data as part of the Data Foundation Systems project. It is also uilt in an extensible manner to allow for data processing and analysis in the future.

Technologies - FastAPI, ReactJS, MongoDB, MinIO

## Features
- Multiple file upload/download
- Copy/Move/Rename files
- File sharing with user wise permissions
- Universal file sharing
- Preview files in browser (Markdown, Images, Videos)
- User management with storage quotas and permissions
- Dynamic server config updates without restart
- Easy to deploy using docker-compose

More documentation available in the [Here](/docs/).

## Production Setup
Configure `credentials.toml` in `/backend` to point to the correct database and minio server. If you are using docker for mongodb and minio, uncomment the commented host addresses.

Then start the docker containers
```bash
docker-compose up -d
```

## Development Setup

### Backend Configuration
The backend is configured through to two TOML files. The first is `credentials.toml` which contains the credentials for the JWT tokens and other services. The second is `settings.toml` which contains the configuration for the database and the server. To use the data foundation system's authentication, uncomment the `auth-url` field in `credentials.toml` and set it to `https://datafoundation.iiit.ac.in/api`.

```toml
# credentials.toml
[auth]
# auth-url = "https://datafoundation.iiit.ac.in/api"
secret-key = "supertopsecret"
algorithm = "HS256"
access-token-expire-minutes = 30

[mongo]
host = "localhost"
port = 27017
db = "dfs-drive"

[minio]
host = "localhost:9000"
username = "minio"
password = "minio123"
```

```toml
# settings.toml
[drive]
max-preview-size = 10980920
min-bandwidth = 3533931
default-user-quota = 54818350226
default-user-permission = 2
allowed-file-extensions = [
    ".png",
    ".jpg",
    ".webp",
    ".pdf",
    ".tex",
    ".md",
    ".mp4",
]
```

### Backend

Ensure that you have Docker installed

```
docker-compose -f docker-compose-dev.yml up
```

Ensure that you have fast API installed and run this from the backend

```
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload
```

To create an admin user, run the following command in the `/backend` directory
```bash
python manage.py create-admin
```

### Frontend

Installed the required packages

```
npm install 
```

Start the server 

```
npm start
```

### Minio
Login to Minio server at `localhost:9090` using the credentials from docker-compose file and create a bucket named `data-drive`
