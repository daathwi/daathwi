from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.config import settings
from app.database import get_db

router = APIRouter(prefix="/admin", tags=["admin"])

STORAGE_LIMIT_BYTES = 100 * 1024 * 1024 * 1024


@router.get("/overview", response_model=schemas.AdminOverviewRead)
def admin_overview(db: Session = Depends(get_db)):
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    photos = crud.list_photos(db)
    gallery_items = crud.list_gallery_items(db)
    featured = crud.list_featured_items(db)
    blog_posts = crud.list_blog_posts(db)
    inquiries = crud.list_contact_inquiries(db)

    storage_bytes = sum(
        f.stat().st_size for f in upload_dir.iterdir() if f.is_file()
    )
    asset_count = sum(1 for f in upload_dir.iterdir() if f.is_file())

    latest_photo = photos[0] if photos else None
    latest_blog = blog_posts[0] if blog_posts else None

    return schemas.AdminOverviewRead(
        counts=schemas.AdminCounts(
            photos=len(photos),
            gallery=len(gallery_items),
            featured=len(featured),
            assets=asset_count,
            blog_posts=len(blog_posts),
            inquiries=len(inquiries),
        ),
        storage_bytes=storage_bytes,
        storage_limit_bytes=STORAGE_LIMIT_BYTES,
        latest_photo_src=latest_photo.src if latest_photo else None,
        latest_photo_alt=latest_photo.alt if latest_photo else None,
        recent_inquiries=[
            schemas.AdminInquirySummary(
                id=row.id,
                name=row.name,
                email=row.email,
                service=row.service,
                message=row.message,
                created_at=row.created_at,
            )
            for row in inquiries[:5]
        ],
        latest_blog_title=latest_blog.title if latest_blog else None,
        latest_blog_slug=latest_blog.slug if latest_blog else None,
    )
