import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile


ALLOWED = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


async def save_upload(file: UploadFile, upload_dir: str) -> str:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED:
        raise HTTPException(status_code=400, detail="Unsupported image type")

    dest_dir = Path(upload_dir)
    dest_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{suffix}"
    dest = dest_dir / filename

    content = await file.read()
    dest.write_bytes(content)

    return f"/uploads/{filename}"
