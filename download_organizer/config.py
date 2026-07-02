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

POLL_INTERVAL_SECONDS = 300
STABLE_CHECKS_REQUIRED = 3
MINIMUM_FILE_AGE_SECONDS = 30 * 60
MINIMUM_FOLDER_AGE_SECONDS = 30 * 60

APP_NAME = "DownloadsOrganizer"
LOG_FILE = Path.home() / "DownloadsOrganizer.log"
