from __future__ import annotations

from pathlib import Path

from .config import CATEGORIES


def get_downloads_folder() -> Path:
    downloads = Path.home() / "Downloads"
    downloads.mkdir(exist_ok=True)
    return downloads


def get_category_for_file(path: Path) -> str:
    extension = path.suffix.lower().lstrip(".")
    for category, extensions in CATEGORIES.items():
        if extension in extensions:
            return category
    return "Others"


def ensure_category_folders(downloads_folder: Path) -> None:
    for category in (*CATEGORIES.keys(), "Others"):
        (downloads_folder / category).mkdir(exist_ok=True)


def get_unique_destination(path: Path, target_dir: Path) -> Path:
    destination = target_dir / path.name
    if not destination.exists():
        return destination

    if path.is_dir():
        stem = path.name
        suffix = ""
    else:
        stem = path.stem
        suffix = path.suffix

    counter = 1

    while True:
        candidate = target_dir / f"{stem} ({counter}){suffix}"
        if not candidate.exists():
            return candidate
        counter += 1
