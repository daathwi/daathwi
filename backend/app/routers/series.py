from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/gallery-series", tags=["gallery-series"])


def _series_read(db: Session, row) -> schemas.GallerySeriesRead:
    return schemas.GallerySeriesRead(
        id=row.id,
        slug=row.slug,
        title=row.title,
        subtitle=row.subtitle or "",
        description=row.description or "",
        cover_src=row.cover_src,
        sort_order=row.sort_order,
        published=row.published,
        item_count=crud.count_series_items(db, row.id),
    )


@router.get("", response_model=list[schemas.GallerySeriesRead])
def list_series(db: Session = Depends(get_db)):
    return [_series_read(db, row) for row in crud.list_gallery_series(db)]


@router.get("/{slug}", response_model=schemas.GallerySeriesDetail)
def get_series(slug: str, db: Session = Depends(get_db)):
    row = crud.get_gallery_series_by_slug(db, slug)
    if not row:
        raise HTTPException(status_code=404, detail="Series not found")
    items = crud.list_gallery_items_for_series(db, row.id)
    base = _series_read(db, row)
    return schemas.GallerySeriesDetail(**base.model_dump(), items=items)


@router.post("", response_model=schemas.GallerySeriesRead, status_code=status.HTTP_201_CREATED)
def create_series(payload: schemas.GallerySeriesCreate, db: Session = Depends(get_db)):
    if crud.get_gallery_series(db, payload.id):
        raise HTTPException(status_code=409, detail="Series id already exists")
    if crud.get_gallery_series_by_slug(db, payload.slug):
        raise HTTPException(status_code=409, detail="Series slug already exists")
    row = crud.create_gallery_series(db, payload)
    return _series_read(db, row)


@router.patch("/{series_id}", response_model=schemas.GallerySeriesRead)
def update_series(
    series_id: str, payload: schemas.GallerySeriesUpdate, db: Session = Depends(get_db)
):
    row = crud.get_gallery_series(db, series_id)
    if not row:
        raise HTTPException(status_code=404, detail="Series not found")
    if payload.slug and payload.slug != row.slug:
        existing = crud.get_gallery_series_by_slug(db, payload.slug)
        if existing and existing.id != series_id:
            raise HTTPException(status_code=409, detail="Series slug already exists")
    row = crud.update_gallery_series(db, row, payload)
    return _series_read(db, row)


@router.put("/{series_id}/items", response_model=schemas.GallerySeriesDetail)
def set_series_items(
    series_id: str,
    payload: schemas.SeriesItemsUpdate,
    db: Session = Depends(get_db),
):
    row = crud.get_gallery_series(db, series_id)
    if not row:
        raise HTTPException(status_code=404, detail="Series not found")

    # Clear current membership, then assign in order
    for item in crud.list_gallery_items_for_series(db, series_id):
        crud.update_gallery_item(
            db, item, schemas.GalleryItemUpdate(series_id=None, sort_order=0)
        )

    for index, item_id in enumerate(payload.item_ids):
        item = crud.get_gallery_item(db, item_id)
        if not item:
            raise HTTPException(status_code=404, detail=f"Gallery item not found: {item_id}")
        crud.update_gallery_item(
            db,
            item,
            schemas.GalleryItemUpdate(series_id=series_id, sort_order=index),
        )

    items = crud.list_gallery_items_for_series(db, series_id)
    base = _series_read(db, row)
    return schemas.GallerySeriesDetail(**base.model_dump(), items=items)


@router.delete("/{series_id}", response_model=schemas.MessageRead)
def delete_series(series_id: str, db: Session = Depends(get_db)):
    row = crud.get_gallery_series(db, series_id)
    if not row:
        raise HTTPException(status_code=404, detail="Series not found")
    crud.delete_gallery_series(db, row)
    return schemas.MessageRead(message="Series deleted")
