#!/usr/bin/env python3
"""Upload local image files to the portfolio API."""

from __future__ import annotations

import argparse
import mimetypes
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

try:
    import httpx
except ImportError:
    print("Install httpx: pip install httpx", file=sys.stderr)
    raise SystemExit(1)


def upload_photo(
    api_base: str,
    file_path: Path,
    photo_id: str | None,
    alt: str,
    sort_order: int,
) -> dict:
    with file_path.open("rb") as handle:
        files = {"file": (file_path.name, handle, mimetypes.guess_type(file_path.name)[0])}
        data: dict[str, str | int] = {"alt": alt, "sort_order": sort_order}
        if photo_id:
            data["photo_id"] = photo_id
        response = httpx.post(
            f"{api_base.rstrip('/')}/api/v1/photos/upload",
            files=files,
            data=data,
            timeout=60,
        )
    response.raise_for_status()
    return response.json()


def main() -> None:
    parser = argparse.ArgumentParser(description="Upload photos to daathwi.jpg API")
    parser.add_argument("files", nargs="+", help="Image files to upload")
    parser.add_argument("--api", default="http://127.0.0.1:8000", help="API base URL")
    parser.add_argument("--alt", default="Portfolio photograph", help="Alt text for all uploads")
    parser.add_argument("--id-prefix", default="", help="Optional prefix for generated photo ids")
    args = parser.parse_args()

    for index, raw in enumerate(args.files):
        path = Path(raw)
        if not path.is_file():
            print(f"skip: not found {path}", file=sys.stderr)
            continue
        photo_id = f"{args.id_prefix}{path.stem}" if args.id_prefix else path.stem
        row = upload_photo(args.api, path, photo_id, args.alt, index)
        print(f"uploaded {path.name} → {row['src']} (id={row['id']})")


if __name__ == "__main__":
    main()
