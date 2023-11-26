import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import MONGO_CONFIG
from backend.models.orm import init_db, disconnect_db

from backend.routes.auth import auth_router
from backend.routes.files import files_router

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:5000",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_db_client():
    init_db(MONGO_CONFIG)


@app.on_event("shutdown")
async def shutdown_db_client():
    disconnect_db()


app.include_router(auth_router)
app.include_router(files_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True, reload_dirs=["backend"])
