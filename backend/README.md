# daathwi.jpg API

FastAPI backend with CRUD for portfolio content, stored in **PostgreSQL**. All photos are **uploaded directly** to `uploads/` — no Instagram CDN URLs.

## Setup

```bash
# From repo root — start PostgreSQL
docker compose up -d postgres

cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Open **http://127.0.0.1:8000/docs** for interactive API docs.

## Upload endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/v1/uploads` | Upload file → returns `{ src: "/uploads/…" }` |
| `POST /api/v1/photos/upload` | Upload + create photo record |
| `POST /api/v1/photos/{id}/upload` | Replace photo file |
| `POST /api/v1/gallery-items/upload` | Upload + create gallery item |
| `POST /api/v1/gallery-items/{id}/upload` | Replace gallery image |
| `POST /api/v1/featured-items/upload` | Upload + create featured item |
| `POST /api/v1/featured-items/{id}/upload` | Replace featured image |

## CLI upload helper

```bash
python scripts/upload_photo.py ~/Pictures/shot.jpg --alt "Golden hour"
python scripts/upload_photo.py ~/Pictures/*.jpg --id-prefix gallery-
```

## Other endpoints

| Resource | Base path |
|----------|-----------|
| Photos | `GET/POST /api/v1/photos` · `GET/PATCH/DELETE /api/v1/photos/{id}` |
| Gallery items | `GET/POST /api/v1/gallery-items` · `GET/PATCH/DELETE /api/v1/gallery-items/{id}` |
| Featured items | `GET/POST /api/v1/featured-items` · `GET/PATCH/DELETE /api/v1/featured-items/{id}` |
| Blog posts | `GET/POST /api/v1/blog-posts` · `GET/PATCH/DELETE /api/v1/blog-posts/{slug}` |
| Site settings | `GET/PATCH /api/v1/site` |
| Contact inquiries | `GET/POST /api/v1/contact-inquiries` |

On first startup, only **site settings** (text, nav, contact copy) are seeded. Media and blog tables start empty.

To clear media and blog content: `python scripts/clear_content.py` (keeps site settings).

If site settings are missing: `python scripts/seed_settings.py`

## Example

```bash
curl -X POST http://127.0.0.1:8000/api/v1/photos/upload \
  -F "file=@photo.jpg" \
  -F "photo_id=hero-1" \
  -F "alt=Hero photograph"
```

Uploaded files are served at `http://127.0.0.1:8000/uploads/<filename>`.
