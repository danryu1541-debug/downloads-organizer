from __future__ import annotations

from pathlib import Path


CATEGORIES: dict[str, set[str]] = {
    "Images": {"jpg", "jpeg", "png", "gif", "webp"},
    "Documents": {"pdf", "docx", "doc", "xlsx", "xls", "pptx", "txt"},
    "Archives": {"zip", "rar", "7z"},
    "Installers": {"exe", "msi"},
    "Videos": {"mp4", "mov", "mkv"},
    "Audio": {"mp3", "wav", "flac"},
}

TEMP_EXTENSIONS = {"crdownload", "part", "tmp"}

POLL_INTERVAL_SECONDS = 2
STABLE_CHECK_INTERVAL_SECONDS = 2
STABLE_CHECKS_REQUIRED = 3

APP_NAME = "DownloadsOrganizer"
LOG_FILE = Path.home() / "DownloadsOrganizer.log"

