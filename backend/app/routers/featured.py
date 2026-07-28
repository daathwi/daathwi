from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.config import settings
from app.database import get_db
from app.services.uploads import save_upload

router = APIRouter(prefix="/featured-items", tags=["featured"])


@router.get("", response_model=list[schemas.FeaturedItemRead])
def list_featured_items(db: Session = Depends(get_db)):
    return crud.list_featured_items(db)


@router.post(
    "/upload",
    response_model=schemas.FeaturedItemRead,
    status_code=status.HTTP_201_CREATED,
)
async def upload_featured_item(
    file: UploadFile = File(...),
    item_id: str = Form(...),
    alt: str = Form(...),
    collection: str = Form(...),
    title: str = Form(...),
    subtitle: str = Form(...),
    offset: bool = Form(False),
    permalink: str | None = Form(None),
    sort_order: int = Form(0),
    db: Session = Depends(get_db),
):
    if crud.get_featured_item(db, item_id):
        raise HTTPException(status_code=409, detail="Featured item id already exists")
    src = await save_upload(file, settings.upload_dir)
    payload = schemas.FeaturedItemCreate(
        id=item_id,
        src=src,
        alt=alt,
        collection=collection,
        title=title,
        subtitle=subtitle,
        offset=offset,
        permalink=permalink or None,
        sort_order=sort_order,
    )
    return crud.create_featured_item(db, payload)


@router.get("/{item_id}", response_model=schemas.FeaturedItemRead)
def get_featured_item(item_id: str, db: Session = Depends(get_db)):
    row = crud.get_featured_item(db, item_id)
    if not row:
        raise HTTPException(status_code=404, detail="Featured item not found")
    return row


@router.post("", response_model=schemas.FeaturedItemRead, status_code=status.HTTP_201_CREATED)
def create_featured_item(payload: schemas.FeaturedItemCreate, db: Session = Depends(get_db)):
    if crud.get_featured_item(db, payload.id):
        raise HTTPException(status_code=409, detail="Featured item id already exists")
    return crud.create_featured_item(db, payload)


@router.patch("/{item_id}", response_model=schemas.FeaturedItemRead)
def update_featured_item(
    item_id: str, payload: schemas.FeaturedItemUpdate, db: Session = Depends(get_db)
):
    row = crud.get_featured_item(db, item_id)
    if not row:
        raise HTTPException(status_code=404, detail="Featured item not found")
    return crud.update_featured_item(db, row, payload)


@router.post(
    "/{item_id}/upload",
    response_model=schemas.FeaturedItemRead,
    status_code=status.HTTP_200_OK,
)
async def replace_featured_image(
    item_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    row = crud.get_featured_item(db, item_id)
    if not row:
        raise HTTPException(status_code=404, detail="Featured item not found")
    src = await save_upload(file, settings.upload_dir)
    return crud.update_featured_item(db, row, schemas.FeaturedItemUpdate(src=src))


@router.delete("/{item_id}", response_model=schemas.MessageRead)
def delete_featured_item(item_id: str, db: Session = Depends(get_db)):
    row = crud.get_featured_item(db, item_id)
    if not row:
        raise HTTPException(status_code=404, detail="Featured item not found")
    crud.delete_featured_item(db, row)
    return schemas.MessageRead(message="Featured item deleted")
