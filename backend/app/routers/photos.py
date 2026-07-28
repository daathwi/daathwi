from pathlib import Path
import json

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.config import settings
from app.database import get_db
from app.services.uploads import save_upload

router = APIRouter(prefix="/photos", tags=["photos"])


@router.get("", response_model=list[schemas.PhotoRead])
def list_photos(db: Session = Depends(get_db)):
    return crud.list_photos(db)


@router.post("/upload", response_model=schemas.PhotoRead, status_code=status.HTTP_201_CREATED)
async def upload_photo(
    file: UploadFile = File(...),
    file_mobile: UploadFile = File(...),
    photo_id: str | None = Form(None),
    alt: str = Form("Portfolio photograph"),
    permalink: str | None = Form(None),
    sort_order: int = Form(0),
    meta: str | None = Form(None),
    db: Session = Depends(get_db),
):
    resolved_id = photo_id or Path(file.filename or "photo").stem
    if crud.get_photo(db, resolved_id):
        raise HTTPException(status_code=409, detail="Photo id already exists")
    src = await save_upload(file, settings.upload_dir)
    src_mobile = await save_upload(file_mobile, settings.upload_dir)
    parsed_meta = json.loads(meta) if meta else None
    payload = schemas.PhotoCreate(
        id=resolved_id,
        src=src,
        src_mobile=src_mobile,
        alt=alt,
        permalink=permalink,
        sort_order=sort_order,
        meta=parsed_meta,
    )
    return crud.create_photo(db, payload)


@router.post(
    "/{photo_id}/upload",
    response_model=schemas.PhotoRead,
    status_code=status.HTTP_200_OK,
)
async def replace_photo_file(
    photo_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    row = crud.get_photo(db, photo_id)
    if not row:
        raise HTTPException(status_code=404, detail="Photo not found")
    src = await save_upload(file, settings.upload_dir)
    return crud.update_photo(db, row, schemas.PhotoUpdate(src=src))


@router.get("/{photo_id}", response_model=schemas.PhotoRead)
def get_photo(photo_id: str, db: Session = Depends(get_db)):
    row = crud.get_photo(db, photo_id)
    if not row:
        raise HTTPException(status_code=404, detail="Photo not found")
    return row


@router.post("", response_model=schemas.PhotoRead, status_code=status.HTTP_201_CREATED)
def create_photo(payload: schemas.PhotoCreate, db: Session = Depends(get_db)):
    if crud.get_photo(db, payload.id):
        raise HTTPException(status_code=409, detail="Photo id already exists")
    return crud.create_photo(db, payload)


@router.patch("/{photo_id}", response_model=schemas.PhotoRead)
def update_photo(
    photo_id: str, payload: schemas.PhotoUpdate, db: Session = Depends(get_db)
):
    row = crud.get_photo(db, photo_id)
    if not row:
        raise HTTPException(status_code=404, detail="Photo not found")
    return crud.update_photo(db, row, payload)


@router.delete("/{photo_id}", response_model=schemas.MessageRead)
def delete_photo(photo_id: str, db: Session = Depends(get_db)):
    row = crud.get_photo(db, photo_id)
    if not row:
        raise HTTPException(status_code=404, detail="Photo not found")
    crud.delete_photo(db, row)
    return schemas.MessageRead(message="Photo deleted")
