from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.config import settings
from app.database import get_db
from app.services.uploads import save_upload

router = APIRouter(prefix="/gallery-items", tags=["gallery"])


@router.get("", response_model=list[schemas.GalleryItemRead])
def list_gallery_items(db: Session = Depends(get_db)):
    return crud.list_gallery_items(db)


@router.post(
    "/upload",
    response_model=schemas.GalleryItemRead,
    status_code=status.HTTP_201_CREATED,
)
async def upload_gallery_item(
    file: UploadFile = File(...),
    item_id: str = Form(...),
    alt: str = Form(...),
    category: str = Form(...),
    tag: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    offset: str = Form("none"),
    aspect_ratio: str = Form("4/5"),
    permalink: str | None = Form(None),
    sort_order: int = Form(0),
    series_id: str | None = Form(None),
    db: Session = Depends(get_db),
):
    if crud.get_gallery_item(db, item_id):
        raise HTTPException(status_code=409, detail="Gallery item id already exists")
    resolved_series = (series_id or "").strip() or None
    if resolved_series and not crud.get_gallery_series(db, resolved_series):
        raise HTTPException(status_code=404, detail="Series not found")
    src = await save_upload(file, settings.upload_dir)
    payload = schemas.GalleryItemCreate(
        id=item_id,
        src=src,
        alt=alt,
        category=category,  # type: ignore[arg-type]
        tag=tag,
        title=title,
        description=description,
        offset=offset,  # type: ignore[arg-type]
        aspect_ratio=aspect_ratio,
        permalink=permalink or None,
        sort_order=sort_order,
        series_id=resolved_series,
    )
    return crud.create_gallery_item(db, payload)


@router.get("/{item_id}", response_model=schemas.GalleryItemRead)
def get_gallery_item(item_id: str, db: Session = Depends(get_db)):
    row = crud.get_gallery_item(db, item_id)
    if not row:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    return row


@router.post("", response_model=schemas.GalleryItemRead, status_code=status.HTTP_201_CREATED)
def create_gallery_item(payload: schemas.GalleryItemCreate, db: Session = Depends(get_db)):
    if crud.get_gallery_item(db, payload.id):
        raise HTTPException(status_code=409, detail="Gallery item id already exists")
    return crud.create_gallery_item(db, payload)


@router.patch("/{item_id}", response_model=schemas.GalleryItemRead)
def update_gallery_item(
    item_id: str, payload: schemas.GalleryItemUpdate, db: Session = Depends(get_db)
):
    row = crud.get_gallery_item(db, item_id)
    if not row:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    return crud.update_gallery_item(db, row, payload)


@router.post(
    "/{item_id}/upload",
    response_model=schemas.GalleryItemRead,
    status_code=status.HTTP_200_OK,
)
async def replace_gallery_image(
    item_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    row = crud.get_gallery_item(db, item_id)
    if not row:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    src = await save_upload(file, settings.upload_dir)
    return crud.update_gallery_item(db, row, schemas.GalleryItemUpdate(src=src))


@router.delete("/{item_id}", response_model=schemas.MessageRead)
def delete_gallery_item(item_id: str, db: Session = Depends(get_db)):
    row = crud.get_gallery_item(db, item_id)
    if not row:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    crud.delete_gallery_item(db, row)
    return schemas.MessageRead(message="Gallery item deleted")
