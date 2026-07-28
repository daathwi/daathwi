from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SiteSettings(Base):
    __tablename__ = "site_settings"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default="default")
    site_url: Mapped[str] = mapped_column(String(256), nullable=False)
    domain: Mapped[str] = mapped_column(String(128), nullable=False)
    tagline: Mapped[str] = mapped_column(String(512), nullable=False)
    contact_email: Mapped[str] = mapped_column(String(256), nullable=False)
    instagram_url: Mapped[str] = mapped_column(String(512), nullable=False)
    hero_fallback_url: Mapped[str] = mapped_column(String(512), nullable=False)
    nav_links: Mapped[list] = mapped_column(JSON, nullable=False)
    licensing: Mapped[dict] = mapped_column(JSON, nullable=False)
    instagram_proof: Mapped[dict] = mapped_column(JSON, nullable=False)
    about: Mapped[dict] = mapped_column(JSON, nullable=False)
    contact: Mapped[dict] = mapped_column(JSON, nullable=False)


class ContactInquiry(Base):
    __tablename__ = "contact_inquiries"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    email: Mapped[str] = mapped_column(String(256), nullable=False)
    service: Mapped[str] = mapped_column(String(64), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class Photo(Base):
    __tablename__ = "photos"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    src: Mapped[str] = mapped_column(String(512), nullable=False)
    src_mobile: Mapped[str | None] = mapped_column(String(512), nullable=True)
    alt: Mapped[str] = mapped_column(String(512), default="Portfolio photograph")
    permalink: Mapped[str | None] = mapped_column(String(512), nullable=True)
    slide_index: Mapped[int] = mapped_column(Integer, default=0)
    slide_count: Mapped[int] = mapped_column(Integer, default=1)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    meta: Mapped[dict | None] = mapped_column(JSON, nullable=True)


class GallerySeries(Base):
    """Photo essay / mini-series for narrative gallery grouping."""

    __tablename__ = "gallery_series"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    slug: Mapped[str] = mapped_column(String(128), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    subtitle: Mapped[str] = mapped_column(String(512), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    cover_src: Mapped[str | None] = mapped_column(String(512), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    published: Mapped[bool] = mapped_column(Boolean, default=True)


class GalleryItem(Base):
    __tablename__ = "gallery_items"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    src: Mapped[str] = mapped_column(String(512), nullable=False)
    alt: Mapped[str] = mapped_column(String(512), nullable=False)
    category: Mapped[str] = mapped_column(String(32), nullable=False)
    tag: Mapped[str] = mapped_column(String(32), nullable=False)
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    offset: Mapped[str] = mapped_column(String(16), default="none")
    aspect_ratio: Mapped[str] = mapped_column(String(16), default="4/5")
    permalink: Mapped[str | None] = mapped_column(String(512), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    series_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)


class FeaturedItem(Base):
    __tablename__ = "featured_items"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    src: Mapped[str] = mapped_column(String(512), nullable=False)
    alt: Mapped[str] = mapped_column(String(512), nullable=False)
    collection: Mapped[str] = mapped_column(String(64), nullable=False)
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    subtitle: Mapped[str] = mapped_column(String(512), nullable=False)
    offset: Mapped[bool] = mapped_column(Boolean, default=False)
    permalink: Mapped[str | None] = mapped_column(String(512), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id: Mapped[str] = mapped_column(String(128), primary_key=True)
    slug: Mapped[str] = mapped_column(String(128), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    excerpt: Mapped[str] = mapped_column(Text, nullable=False)
    image: Mapped[str] = mapped_column(String(512), nullable=False)
    alt: Mapped[str] = mapped_column(String(512), nullable=False)
    category: Mapped[str] = mapped_column(String(64), nullable=False)
    date_display: Mapped[str] = mapped_column(String(64), nullable=False)
    read_time: Mapped[str] = mapped_column(String(32), default="5 Min Read")
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    aspect: Mapped[str] = mapped_column(String(16), default="square")
    grid_offset: Mapped[bool] = mapped_column(Boolean, default=False)
    article: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    published: Mapped[bool] = mapped_column(Boolean, default=False)
