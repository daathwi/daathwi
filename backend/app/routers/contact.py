import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/contact-inquiries", tags=["contact"])


@router.get("", response_model=list[schemas.ContactInquiryRead])
def list_contact_inquiries(db: Session = Depends(get_db)):
    return crud.list_contact_inquiries(db)


@router.post(
    "", response_model=schemas.ContactInquiryRead, status_code=status.HTTP_201_CREATED
)
def create_contact_inquiry(
    payload: schemas.ContactInquiryCreate, db: Session = Depends(get_db)
):
    inquiry_id = uuid.uuid4().hex
    return crud.create_contact_inquiry(db, payload, inquiry_id)
