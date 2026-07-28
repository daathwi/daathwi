# daathwi.jpg — Portfolio Monorepo

Photography portfolio with a **Next.js frontend** and **FastAPI backend** backed by **PostgreSQL**.

```
daathwi/
├── frontend/          Next.js site (gallery, blog, about, contact)
├── backend/           FastAPI CRUD API + file uploads
└── docker-compose.yml PostgreSQL database
```

## Quick start

### 1. Database

```bash
docker compose up -d postgres
```

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

On first startup the API creates tables and seeds **site settings only** (nav, about copy, contact info). Photos, gallery, featured work, and blog posts start empty — add them via the admin panel or API.

To wipe media and blog content (site settings are kept):

```bash
cd backend
python scripts/clear_content.py
```

To restore site settings only if missing:

```bash
python scripts/seed_settings.py
```

API docs: http://127.0.0.1:8000/docs

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Site: http://localhost:3000

Set `API_URL` / `NEXT_PUBLIC_API_URL` to `http://127.0.0.1:8000`. **The frontend requires the API to be running.**

## Uploading photos

All portfolio images are stored on the backend under `backend/uploads/` and served at `http://127.0.0.1:8000/uploads/…`.

### Upload a photo (creates a photo record)

```bash
curl -X POST http://127.0.0.1:8000/api/v1/photos/upload \
  -F "file=@/path/to/photo.jpg" \
  -F "photo_id=my-photo" \
  -F "alt=Description"
```

Or use the helper script:

```bash
cd backend
python scripts/upload_photo.py /path/to/*.jpg --alt "My photo"
```

### Upload only the file (returns `/uploads/…` path)

```bash
curl -X POST http://127.0.0.1:8000/api/v1/uploads \
  -F "file=@/path/to/photo.jpg"
```

Use the returned `src` when creating gallery, featured, or blog entries via the JSON API.

### Replace an existing photo file

```bash
curl -X POST http://127.0.0.1:8000/api/v1/photos/{photo_id}/upload \
  -F "file=@/path/to/new.jpg"
```

Similar `/upload` endpoints exist for gallery and featured items.

## Managing content

| What | How |
|------|-----|
| **Photos** (hero) | `POST /api/v1/photos/upload` |
| **Gallery page** | `POST /api/v1/gallery-items/upload` |
| **Featured work** | `POST /api/v1/featured-items/upload` |
| **Blog posts** | `POST /api/v1/blog-posts` (set `image` to an uploaded `/uploads/…` path) |
| **About, contact, nav** | `GET/PATCH /api/v1/site` |
| **Contact form** | `POST /api/v1/contact-inquiries` |
| **Admin panel** | http://localhost:3000/admin |

To reset the database entirely: `docker compose down -v && docker compose up -d postgres`, then restart the API.

## API resources

- `POST /api/v1/uploads` — upload file only
- `GET/POST /api/v1/photos` · `POST /api/v1/photos/upload`
- `GET/POST /api/v1/gallery-items` · `POST /api/v1/gallery-items/upload`
- `GET/POST /api/v1/featured-items` · `POST /api/v1/featured-items/upload`
- `GET/POST /api/v1/blog-posts`
- `GET/PATCH /api/v1/site`
- `GET/POST /api/v1/contact-inquiries`
- `GET /health`

See [backend/README.md](backend/README.md) for details.
