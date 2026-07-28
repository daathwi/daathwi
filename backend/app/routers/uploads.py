from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, status

from app import schemas
from app.config import settings
from app.services.uploads import save_upload

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.get("", response_model=list[schemas.UploadListRead])
def list_uploads():
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    items: list[schemas.UploadListRead] = []
    for path in sorted(
        upload_dir.iterdir(),
        key=lambda p: p.stat().st_mtime if p.is_file() else 0,
        reverse=True,
    ):
        if not path.is_file():
            continue
        stat = path.stat()
        items.append(
            schemas.UploadListRead(
                filename=path.name,
                src=f"/uploads/{path.name}",
                size_bytes=stat.st_size,
                modified_at=stat.st_mtime,
            )
        )
    return items


@router.post("", response_model=schemas.UploadRead, status_code=status.HTTP_201_CREATED)
async def upload_file(file: UploadFile):
    src = await save_upload(file, settings.upload_dir)
    filename = src.rsplit("/", 1)[-1]
    return schemas.UploadRead(src=src, filename=filename)


@router.delete("/{filename}", response_model=schemas.MessageRead)
def delete_upload(filename: str):
    upload_dir = Path(settings.upload_dir)
    path = upload_dir / filename
    if not path.is_file() or ".." in filename or "/" in filename:
        raise HTTPException(status_code=404, detail="Upload not found")
    path.unlink()
    return schemas.MessageRead(message="Upload deleted")
