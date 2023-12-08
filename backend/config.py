from dynaconf import Dynaconf
from typing import List

settings = Dynaconf(
    envvar_prefix="DCONF",
    settings_files=["settings.toml", "credentials.toml"],
)

MONGO_CONFIG = settings.get(
    "mongo", {"host": "localhost", "port": 27017, "db": "dfs-drive"}
)
MINIO_CONFIG = settings.get(
    "minio",
    {
        "host": "localhost:9000",
        "username": "minio",
        "password": "minio123",
        "bucket": "data-drive",
    },
)

auth_conf = settings.get("auth", {})

AUTH_URL = auth_conf.get("auth-url", "")
SECRET_KEY = auth_conf.get("secret-key", "secret")
ALGORITHM = auth_conf.get("algorithm", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = auth_conf.get("access-token-expire-minutes", 30)

MINIO_BUCKET = MINIO_CONFIG.get("bucket", "data-drive")

class Config:
    max_preview_size: int
    min_bandwidth: int
    default_user_quota: int
    default_user_permission: int
    allowed_file_extensions: List[str]


drive_conf = settings.get("drive", {})

app_config = Config()
app_config.max_preview_size = drive_conf.get("max-preview-size", 10 * 1024 * 1024)
app_config.min_bandwidth = drive_conf.get("min-bandwidth", 1024 * 1024)
app_config.default_user_quota = drive_conf.get(
    "default-user-quota", 10 * 1024 * 1024 * 1024
)
app_config.default_user_permission = drive_conf.get("default-user-permission", 2)
app_config.allowed_file_extensions = drive_conf.get("allowed-file-extensions", [])
