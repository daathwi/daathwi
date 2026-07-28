"""Lightweight schema patches for columns added after initial deploy."""

from sqlalchemy import inspect, text

from app.database import engine


def migrate_schema() -> None:
    inspector = inspect(engine)
    if "photos" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("photos")}
    if "src_mobile" not in columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE photos ADD COLUMN src_mobile VARCHAR(512)"))
    if "meta" not in columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE photos ADD COLUMN meta JSON"))

    if "blog_posts" in inspector.get_table_names():
        blog_columns = {col["name"] for col in inspector.get_columns("blog_posts")}
        if "published" not in blog_columns:
            with engine.begin() as conn:
                conn.execute(
                    text(
                        "ALTER TABLE blog_posts ADD COLUMN published BOOLEAN NOT NULL DEFAULT FALSE"
                    )
                )
                conn.execute(
                    text("UPDATE blog_posts SET published = TRUE WHERE article IS NOT NULL")
                )
        # Long titles produce slugs > 64 chars; id was originally VARCHAR(64).
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE blog_posts ALTER COLUMN id TYPE VARCHAR(128)"))

    if "gallery_items" in inspector.get_table_names():
        gallery_columns = {col["name"] for col in inspector.get_columns("gallery_items")}
        if "aspect_ratio" not in gallery_columns:
            with engine.begin() as conn:
                conn.execute(
                    text(
                        "ALTER TABLE gallery_items ADD COLUMN aspect_ratio VARCHAR(16) NOT NULL DEFAULT '4/5'"
                    )
                )
        if "series_id" not in gallery_columns:
            with engine.begin() as conn:
                conn.execute(
                    text("ALTER TABLE gallery_items ADD COLUMN series_id VARCHAR(64)")
                )
                conn.execute(
                    text(
                        "CREATE INDEX IF NOT EXISTS ix_gallery_items_series_id "
                        "ON gallery_items (series_id)"
                    )
                )
