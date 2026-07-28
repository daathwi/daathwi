#!/usr/bin/env python3
"""Re-seed site settings if missing (safe to run anytime)."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.seed import seed_database


def main() -> None:
    seed_database()
    print("Site settings seeded (skipped if already present).")


if __name__ == "__main__":
    main()
