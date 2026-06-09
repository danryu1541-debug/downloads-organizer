from __future__ import annotations

import time
from pathlib import Path

from .config import (
    STABLE_CHECK_INTERVAL_SECONDS,
    STABLE_CHECKS_REQUIRED,
    TEMP_EXTENSIONS,
)


def is_temporary_download(path: Path) -> bool:
    return path.suffix.lower().lstrip(".") in TEMP_EXTENSIONS


def get_accessible_file_size(path: Path) -> int | None:
    if not path.is_file() or is_temporary_download(path):
        return None

    try:
        size = path.stat().st_size
        with path.open("rb"):
            pass
        return size
    except OSError:
        return None


def directory_contains_temporary_download(path: Path) -> bool:
    try:
        return any(
            child.is_file() and is_temporary_download(child)
            for child in path.rglob("*")
        )
    except OSError:
        return True


def get_accessible_directory_signature(path: Path) -> tuple[int, int] | None:
    if not path.is_dir() or directory_contains_temporary_download(path):
        return None

    total_size = 0
    item_count = 0

    try:
        for child in path.rglob("*"):
            item_count += 1
            if child.is_file():
                total_size += child.stat().st_size
        return total_size, item_count
    except OSError:
        return None


def is_file_stable(path: Path) -> bool:
    if not path.is_file() or is_temporary_download(path):
        return False

    previous_size = -1
    stable_checks = 0

    while stable_checks < STABLE_CHECKS_REQUIRED:
        if not path.exists() or not path.is_file() or is_temporary_download(path):
            return False

        try:
            current_size = path.stat().st_size
            with path.open("rb"):
                pass
        except OSError:
            stable_checks = 0
            time.sleep(STABLE_CHECK_INTERVAL_SECONDS)
            continue

        if current_size == previous_size:
            stable_checks += 1
        else:
            previous_size = current_size
            stable_checks = 0

        time.sleep(STABLE_CHECK_INTERVAL_SECONDS)

    return True
