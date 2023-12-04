# Data-Drive
A cloud file storage/ hosting platform for data foundation systems.

## Production Setup
Configure `credentials.toml` in `/backend` to point to the correct database and minio server. If you are using docker for mongodb and minio, uncomment the commented host addresses.

Then start the docker containers
```
docker-compose up -d
```

## Development Setup

### Backend Configuration
The backend is configured through to two TOML files. The first is `credentials.toml` which contains the credentials for the JWT tokens and other services. The second is `settings.toml` which contains the configuration for the database and the server.

```toml
# credentials.toml
[auth]
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
