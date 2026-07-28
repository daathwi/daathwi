from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/blog-posts", tags=["blog"])


@router.get("", response_model=list[schemas.BlogPostRead])
def list_blog_posts(db: Session = Depends(get_db)):
    return crud.list_blog_posts(db)


@router.get("/{slug}", response_model=schemas.BlogPostRead)
def get_blog_post(slug: str, db: Session = Depends(get_db)):
    row = crud.get_blog_post(db, slug)
    if not row:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return row


@router.post("", response_model=schemas.BlogPostRead, status_code=status.HTTP_201_CREATED)
def create_blog_post(payload: schemas.BlogPostCreate, db: Session = Depends(get_db)):
    if crud.get_blog_post_by_id(db, payload.id):
        raise HTTPException(status_code=409, detail="Blog post id already exists")
    if crud.get_blog_post(db, payload.slug):
        raise HTTPException(status_code=409, detail="Blog post slug already exists")
    return crud.create_blog_post(db, payload)


@router.patch("/{slug}", response_model=schemas.BlogPostRead)
def update_blog_post(
    slug: str, payload: schemas.BlogPostUpdate, db: Session = Depends(get_db)
):
    row = crud.get_blog_post(db, slug)
    if not row:
        raise HTTPException(status_code=404, detail="Blog post not found")
    if payload.slug and payload.slug != slug and crud.get_blog_post(db, payload.slug):
        raise HTTPException(status_code=409, detail="Blog post slug already exists")
    return crud.update_blog_post(db, row, payload)


@router.delete("/{slug}", response_model=schemas.MessageRead)
def delete_blog_post(slug: str, db: Session = Depends(get_db)):
    row = crud.get_blog_post(db, slug)
    if not row:
        raise HTTPException(status_code=404, detail="Blog post not found")
    crud.delete_blog_post(db, row)
    return schemas.MessageRead(message="Blog post deleted")
