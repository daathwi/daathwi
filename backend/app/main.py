from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine
from app.routers import admin, blog, contact, featured, gallery, photos, series, site, uploads
from app.migrate import migrate_schema
from app.seed import seed_database


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    migrate_schema()
    seed_database()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=settings.cors_origin_regex or None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

upload_path = Path(settings.upload_dir)
upload_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_path), name="uploads")

app.include_router(photos.router, prefix="/api/v1")
app.include_router(gallery.router, prefix="/api/v1")
app.include_router(series.router, prefix="/api/v1")
app.include_router(featured.router, prefix="/api/v1")
app.include_router(blog.router, prefix="/api/v1")
app.include_router(site.router, prefix="/api/v1")
app.include_router(contact.router, prefix="/api/v1")
app.include_router(uploads.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok"}
