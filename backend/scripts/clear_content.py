#!/usr/bin/env python3
"""Remove portfolio media and blog content from the database (keeps site settings)."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import models
from app.database import SessionLocal
from app.seed import seed_database


def main() -> None:
    db = SessionLocal()
    try:
        db.query(models.Photo).delete()
        db.query(models.GalleryItem).delete()
        db.query(models.FeaturedItem).delete()
        db.query(models.BlogPost).delete()
        db.query(models.ContactInquiry).delete()
        db.commit()
        print("Media and blog content cleared.")
    finally:
        db.close()

    seed_database()
    print("Site settings ensured.")


if __name__ == "__main__":
    main()
