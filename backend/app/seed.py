"""Seed database with site settings only — no stock photos or blog posts."""

from sqlalchemy.orm import Session

from app import crud, models
from app.database import SessionLocal


def seed_database() -> None:
    db = SessionLocal()
    try:
        if db.query(models.SiteSettings).count() == 0:
            _seed_site_settings(db)
    finally:
        db.close()


def _seed_site_settings(db: Session) -> None:
    crud.create_site_settings(
        db,
        {
            "site_url": "https://daathwi.jpg",
            "domain": "daathwi.jpg",
            "tagline": "Street photography and visual stories from across India — captured by Daathwi Naagh.",
            "contact_email": "daathwi.031@gmail.com",
            "instagram_url": "https://www.instagram.com/daathwi.jpg/",
            "hero_fallback_url": "",
            "nav_links": [
                {"href": "/", "label": "Home"},
                {"href": "/gallery", "label": "Gallery"},
                {"href": "/blog", "label": "Blog"},
                {"href": "/about", "label": "About"},
                {"href": "/contact", "label": "Contact"},
            ],
            "licensing": {
                "headline": "",
                "description": "",
                "email": "daathwi.031@gmail.com",
                "inquiries": [],
            },
            "instagram_proof": {
                "handle": "@daathwi.jpg",
                "url": "https://www.instagram.com/daathwi.jpg/",
                "headline": "Also on Instagram",
                "description": (
                    "Daily street frames and cultural notes — Instagram is the ongoing "
                    "sketchbook beside this site."
                ),
            },
            "about": {
                "hero_title": "A story from the street.",
                "hero_quote": (
                    "I'm Daathwi Naagh. I walk Indian streets looking for light that arrives "
                    "sideways, culture in motion, and faces that only exist for a second."
                ),
                "mission_title": "Why I raise the camera.",
                "mission_paragraphs": [
                    (
                        "I started photographing because monuments alone never felt alive enough. "
                        "What stays with me is the everyday — chai steam, a shoe seller in side light, "
                        "the hush after crowds leave a gate. Street photography is how I stay honest "
                        "about place and people."
                    ),
                    (
                        "What you see on this site are visual essays: lanes in Old Delhi, monuments "
                        "in the dark, craft and food, strangers mid-step. Each series is meant to "
                        "read as a story, not a random pile of frames."
                    ),
                    (
                        "I finish everything in Lightroom, then publish here and on Instagram. "
                        "If a frame stays with you — or you want to walk a city with a camera — "
                        "you're welcome to get in touch."
                    ),
                ],
                "stats": [
                    {"value": "5+", "label": "Years Shooting"},
                    {"value": "India", "label": "Primary Ground"},
                    {"value": "Street", "label": "Core Practice"},
                    {"value": "∞", "label": "Golden Hours"},
                ],
                "toolkit": [
                    {
                        "title": "DIGITAL CAPTURE",
                        "items": [
                            "Mirrorless & smartphone",
                            "RAW workflow",
                            "Available light priority",
                        ],
                    },
                    {
                        "title": "OPTICS",
                        "items": [
                            "Street-ready primes",
                            "Fast low-light glass",
                            "Compact travel kits",
                        ],
                    },
                    {
                        "title": "LIGHTING",
                        "items": [
                            "Side light & shadow",
                            "Golden & blue hour",
                            "Urban night scenes",
                        ],
                    },
                    {
                        "title": "POST-PRODUCTION",
                        "items": [
                            "Adobe Lightroom (Develop)",
                            "Color, mood & local masks",
                            "Export for web",
                        ],
                    },
                ],
                "profile_image": "",
                "profile_alt": "Portrait of Daathwi Naagh",
                "moodboard": [],
            },
            "contact": {
                "hero_title": "Let's Frame Your",
                "hero_title_italic": "Next Story.",
                "hero_description_suffix": (
                    "Questions, collaborations, or a street photowalk — tell me what "
                    "you're after and I'll reply with clear next steps."
                ),
                "location": {
                    "city": "",
                    "country": "India",
                    "detail": "Available for photowalks & cultural assignments",
                    "map_image": "",
                    "map_alt": "India",
                },
                "inquiry_options": [
                    {"value": "collab", "label": "Photowalk / collab"},
                    {"value": "assignment", "label": "Assignment / story"},
                    {"value": "general", "label": "General inquiry"},
                    {"value": "other", "label": "Something else"},
                ],
                "guidelines": [
                    {
                        "step": "01. REACH OUT",
                        "text": (
                            "Send a short note about what you have in mind — a photowalk, "
                            "collaboration, or question about the work."
                        ),
                    },
                    {
                        "step": "02. PROCESS",
                        "text": (
                            "I'll reply to understand the context, timing, and whether it's "
                            "a fit — then we decide next steps together."
                        ),
                    },
                    {
                        "step": "03. NEXT STEPS",
                        "text": (
                            "If we move forward, I'll confirm details clearly so you know "
                            "exactly what to expect."
                        ),
                    },
                ],
                "service_tags": ["STREET STORIES", "COLLABS", "PHOTOWALKS"],
            },
        },
    )
