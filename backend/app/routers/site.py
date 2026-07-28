from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/site", tags=["site"])


@router.get("", response_model=schemas.SiteSettingsRead)
def get_site_settings(db: Session = Depends(get_db)):
    row = crud.get_site_settings(db)
    if not row:
        raise HTTPException(status_code=404, detail="Site settings not found")
    return row


@router.patch("", response_model=schemas.SiteSettingsRead)
def update_site_settings(
    payload: schemas.SiteSettingsUpdate, db: Session = Depends(get_db)
):
    row = crud.get_site_settings(db)
    if not row:
        raise HTTPException(status_code=404, detail="Site settings not found")
    return crud.update_site_settings(db, row, payload)
