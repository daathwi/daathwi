from sqlalchemy.orm import Session

from app import models, schemas


def list_photos(db: Session) -> list[models.Photo]:
    return db.query(models.Photo).order_by(models.Photo.sort_order, models.Photo.id).all()


def get_photo(db: Session, photo_id: str) -> models.Photo | None:
    return db.get(models.Photo, photo_id)


def create_photo(db: Session, data: schemas.PhotoCreate) -> models.Photo:
    row = models.Photo(**data.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def update_photo(db: Session, row: models.Photo, data: schemas.PhotoUpdate) -> models.Photo:
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


def delete_photo(db: Session, row: models.Photo) -> None:
    db.delete(row)
    db.commit()


def list_gallery_series(db: Session) -> list[models.GallerySeries]:
    return (
        db.query(models.GallerySeries)
        .order_by(models.GallerySeries.sort_order, models.GallerySeries.title)
        .all()
    )


def get_gallery_series(db: Session, series_id: str) -> models.GallerySeries | None:
    return db.get(models.GallerySeries, series_id)


def get_gallery_series_by_slug(db: Session, slug: str) -> models.GallerySeries | None:
    return (
        db.query(models.GallerySeries).filter(models.GallerySeries.slug == slug).first()
    )


def create_gallery_series(
    db: Session, data: schemas.GallerySeriesCreate
) -> models.GallerySeries:
    row = models.GallerySeries(**data.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def update_gallery_series(
    db: Session, row: models.GallerySeries, data: schemas.GallerySeriesUpdate
) -> models.GallerySeries:
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


def delete_gallery_series(db: Session, row: models.GallerySeries) -> None:
    db.query(models.GalleryItem).filter(
        models.GalleryItem.series_id == row.id
    ).update({models.GalleryItem.series_id: None})
    db.delete(row)
    db.commit()


def count_series_items(db: Session, series_id: str) -> int:
    return (
        db.query(models.GalleryItem)
        .filter(models.GalleryItem.series_id == series_id)
        .count()
    )


def list_gallery_items_for_series(
    db: Session, series_id: str
) -> list[models.GalleryItem]:
    return (
        db.query(models.GalleryItem)
        .filter(models.GalleryItem.series_id == series_id)
        .order_by(models.GalleryItem.sort_order, models.GalleryItem.id)
        .all()
    )


def list_gallery_items(db: Session) -> list[models.GalleryItem]:
    return (
        db.query(models.GalleryItem)
        .order_by(models.GalleryItem.sort_order, models.GalleryItem.id)
        .all()
    )


def get_gallery_item(db: Session, item_id: str) -> models.GalleryItem | None:
    return db.get(models.GalleryItem, item_id)


def create_gallery_item(db: Session, data: schemas.GalleryItemCreate) -> models.GalleryItem:
    row = models.GalleryItem(**data.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def update_gallery_item(
    db: Session, row: models.GalleryItem, data: schemas.GalleryItemUpdate
) -> models.GalleryItem:
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


def delete_gallery_item(db: Session, row: models.GalleryItem) -> None:
    db.delete(row)
    db.commit()


def list_featured_items(db: Session) -> list[models.FeaturedItem]:
    return (
        db.query(models.FeaturedItem)
        .order_by(models.FeaturedItem.sort_order, models.FeaturedItem.id)
        .all()
    )


def get_featured_item(db: Session, item_id: str) -> models.FeaturedItem | None:
    return db.get(models.FeaturedItem, item_id)


def create_featured_item(db: Session, data: schemas.FeaturedItemCreate) -> models.FeaturedItem:
    row = models.FeaturedItem(**data.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def update_featured_item(
    db: Session, row: models.FeaturedItem, data: schemas.FeaturedItemUpdate
) -> models.FeaturedItem:
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


def delete_featured_item(db: Session, row: models.FeaturedItem) -> None:
    db.delete(row)
    db.commit()


def list_blog_posts(db: Session) -> list[models.BlogPost]:
    return (
        db.query(models.BlogPost)
        .order_by(models.BlogPost.sort_order, models.BlogPost.date_display.desc())
        .all()
    )


def get_blog_post(db: Session, slug: str) -> models.BlogPost | None:
    return db.query(models.BlogPost).filter(models.BlogPost.slug == slug).first()


def get_blog_post_by_id(db: Session, post_id: str) -> models.BlogPost | None:
    return db.get(models.BlogPost, post_id)


def create_blog_post(db: Session, data: schemas.BlogPostCreate) -> models.BlogPost:
    row = models.BlogPost(**data.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def update_blog_post(
    db: Session, row: models.BlogPost, data: schemas.BlogPostUpdate
) -> models.BlogPost:
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


def delete_blog_post(db: Session, row: models.BlogPost) -> None:
    db.delete(row)
    db.commit()


def get_site_settings(db: Session) -> models.SiteSettings | None:
    return db.get(models.SiteSettings, "default")


def create_site_settings(db: Session, data: dict) -> models.SiteSettings:
    row = models.SiteSettings(id="default", **data)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def update_site_settings(
    db: Session, row: models.SiteSettings, data: schemas.SiteSettingsUpdate
) -> models.SiteSettings:
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


def list_contact_inquiries(db: Session) -> list[models.ContactInquiry]:
    return (
        db.query(models.ContactInquiry)
        .order_by(models.ContactInquiry.created_at.desc())
        .all()
    )


def create_contact_inquiry(
    db: Session, data: schemas.ContactInquiryCreate, inquiry_id: str
) -> models.ContactInquiry:
    row = models.ContactInquiry(
        id=inquiry_id,
        name=data.name,
        email=data.email,
        service=data.service,
        message=data.message,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
