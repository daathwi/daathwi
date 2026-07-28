from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class PhotoBase(BaseModel):
    src: str
    src_mobile: str | None = None
    alt: str = "Portfolio photograph"
    permalink: str | None = None
    slide_index: int = 0
    slide_count: int = 1
    sort_order: int = 0
    meta: dict | None = None


class PhotoCreate(PhotoBase):
    id: str = Field(..., max_length=64)


class PhotoUpdate(BaseModel):
    src: str | None = None
    src_mobile: str | None = None
    alt: str | None = None
    permalink: str | None = None
    slide_index: int | None = None
    slide_count: int | None = None
    sort_order: int | None = None
    meta: dict | None = None


class PhotoRead(PhotoBase):
    model_config = ConfigDict(from_attributes=True)
    id: str


class GallerySeriesBase(BaseModel):
    slug: str
    title: str
    subtitle: str = ""
    description: str = ""
    cover_src: str | None = None
    sort_order: int = 0
    published: bool = True


class GallerySeriesCreate(GallerySeriesBase):
    id: str


class GallerySeriesUpdate(BaseModel):
    slug: str | None = None
    title: str | None = None
    subtitle: str | None = None
    description: str | None = None
    cover_src: str | None = None
    sort_order: int | None = None
    published: bool | None = None


class GallerySeriesRead(GallerySeriesBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    item_count: int = 0


class GallerySeriesDetail(GallerySeriesRead):
    items: list["GalleryItemRead"] = []


class SeriesItemsUpdate(BaseModel):
    item_ids: list[str] = []


class GalleryItemBase(BaseModel):
    src: str
    alt: str
    category: Literal["Street", "Culture", "Craft", "Night", "People"]
    tag: str
    title: str
    description: str
    offset: Literal["none", "down", "up"] = "none"
    aspect_ratio: str = "4/5"
    permalink: str | None = None
    sort_order: int = 0
    series_id: str | None = None


class GalleryItemCreate(GalleryItemBase):
    id: str


class GalleryItemUpdate(BaseModel):
    src: str | None = None
    alt: str | None = None
    category: Literal["Street", "Culture", "Craft", "Night", "People"] | None = None
    tag: str | None = None
    title: str | None = None
    description: str | None = None
    offset: Literal["none", "down", "up"] | None = None
    aspect_ratio: str | None = None
    permalink: str | None = None
    sort_order: int | None = None
    series_id: str | None = None


class GalleryItemRead(GalleryItemBase):
    model_config = ConfigDict(from_attributes=True)
    id: str


class FeaturedItemBase(BaseModel):
    src: str
    alt: str
    collection: str
    title: str
    subtitle: str
    offset: bool = False
    permalink: str | None = None
    sort_order: int = 0


class FeaturedItemCreate(FeaturedItemBase):
    id: str


class FeaturedItemUpdate(BaseModel):
    src: str | None = None
    alt: str | None = None
    collection: str | None = None
    title: str | None = None
    subtitle: str | None = None
    offset: bool | None = None
    permalink: str | None = None
    sort_order: int | None = None


class FeaturedItemRead(FeaturedItemBase):
    model_config = ConfigDict(from_attributes=True)
    id: str


class BlogPostBase(BaseModel):
    slug: str
    title: str
    excerpt: str
    image: str
    alt: str
    category: str
    date_display: str
    read_time: str = "5 Min Read"
    featured: bool = False
    aspect: Literal["16/9", "square", "4/3"] = "square"
    grid_offset: bool = False
    article: dict | None = None
    sort_order: int = 0
    published: bool = False


class BlogPostCreate(BlogPostBase):
    id: str


class BlogPostUpdate(BaseModel):
    slug: str | None = None
    title: str | None = None
    excerpt: str | None = None
    image: str | None = None
    alt: str | None = None
    category: str | None = None
    date_display: str | None = None
    read_time: str | None = None
    featured: bool | None = None
    aspect: Literal["16/9", "square", "4/3"] | None = None
    grid_offset: bool | None = None
    article: dict | None = None
    sort_order: int | None = None
    published: bool | None = None


class BlogPostRead(BlogPostBase):
    model_config = ConfigDict(from_attributes=True)
    id: str


class MessageRead(BaseModel):
    message: str


class UploadRead(BaseModel):
    src: str
    filename: str


class UploadListRead(BaseModel):
    filename: str
    src: str
    size_bytes: int
    modified_at: float | None = None


class AdminCounts(BaseModel):
    photos: int
    gallery: int
    featured: int
    assets: int
    blog_posts: int
    inquiries: int


class AdminInquirySummary(BaseModel):
    id: str
    name: str
    email: str
    service: str
    message: str
    created_at: datetime


class AdminOverviewRead(BaseModel):
    counts: AdminCounts
    storage_bytes: int
    storage_limit_bytes: int
    latest_photo_src: str | None
    latest_photo_alt: str | None
    recent_inquiries: list[AdminInquirySummary]
    latest_blog_title: str | None
    latest_blog_slug: str | None


class NavLink(BaseModel):
    href: str
    label: str


class AboutStat(BaseModel):
    value: str
    label: str


class AboutToolkitGroup(BaseModel):
    title: str
    items: list[str]


class AboutMoodboardImage(BaseModel):
    src: str
    alt: str
    className: str


class AboutContent(BaseModel):
    hero_title: str = "The eye behind the lens."
    hero_quote: str = (
        '"Photography is not about what is seen, but the feeling evoked when the light '
        'strikes the subject at exactly the right moment."'
    )
    mission_title: str = "A philosophy of stillness and light."
    mission_paragraphs: list[str]
    stats: list[AboutStat]
    toolkit: list[AboutToolkitGroup]
    profile_image: str
    profile_alt: str = "Editorial portrait of Daathwi Naagh in a minimalist studio setting"
    moodboard: list[AboutMoodboardImage]


class ContactLocation(BaseModel):
    city: str
    country: str
    detail: str
    map_image: str
    map_alt: str


class ContactInquiryOption(BaseModel):
    value: str
    label: str


class ContactGuideline(BaseModel):
    step: str
    text: str


class ContactContent(BaseModel):
    hero_title: str = "Let's Frame Your"
    hero_title_italic: str = "Next Vision."
    hero_description_suffix: str = (
        "Questions, collaborations, or a street photowalk — tell me what "
        "you're after and I'll reply with clear next steps."
    )
    location: ContactLocation
    inquiry_options: list[ContactInquiryOption]
    guidelines: list[ContactGuideline]
    service_tags: list[str]


class LicensingContent(BaseModel):
    headline: str
    description: str
    email: str
    inquiries: list[dict[str, str]]


class InstagramProofContent(BaseModel):
    handle: str
    url: str
    headline: str
    description: str


class SiteSettingsRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    site_url: str
    domain: str
    tagline: str
    contact_email: str
    instagram_url: str
    hero_fallback_url: str
    nav_links: list[NavLink]
    licensing: LicensingContent
    instagram_proof: InstagramProofContent
    about: AboutContent
    contact: ContactContent


class SiteSettingsUpdate(BaseModel):
    site_url: str | None = None
    domain: str | None = None
    tagline: str | None = None
    contact_email: str | None = None
    instagram_url: str | None = None
    hero_fallback_url: str | None = None
    nav_links: list[NavLink] | None = None
    licensing: LicensingContent | None = None
    instagram_proof: InstagramProofContent | None = None
    about: AboutContent | None = None
    contact: ContactContent | None = None


class ContactInquiryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=256)
    email: str = Field(..., min_length=3, max_length=256)
    service: str = Field(..., min_length=1, max_length=64)
    message: str = Field(..., min_length=1)


class ContactInquiryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: str
    service: str
    message: str
    created_at: datetime
