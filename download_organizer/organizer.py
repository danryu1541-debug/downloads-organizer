from __future__ import annotations

import logging
import shutil
import time
from pathlib import Path

from .config import (
    CATEGORIES,
    MINIMUM_FILE_AGE_SECONDS,
    MINIMUM_FOLDER_AGE_SECONDS,
    STABLE_CHECKS_REQUIRED,
)
from .file_state import (
    get_accessible_directory_signature,
    get_accessible_file_size,
    is_temporary_download,
)
from .paths import (
    ensure_category_folders,
    get_category_for_file,
    get_unique_destination,
)


class DownloadOrganizer:
    def __init__(self, downloads_folder: Path, logger: logging.Logger) -> None:
        self.downloads_folder = downloads_folder
        self.logger = logger
        self.observed_files: dict[Path, tuple[int, int]] = {}
        self.observed_folders: dict[Path, tuple[tuple[int, int], int]] = {}
        ensure_category_folders(downloads_folder)

    def scan_once(self) -> None:
        current_files: set[Path] = set()
        current_folders: set[Path] = set()

        for path in self.downloads_folder.iterdir():
            if path.is_file():
                current_files.add(path)
                self.process_file(path)
            elif path.is_dir():
                current_folders.add(path)
                self.process_folder(path)

        for path in list(self.observed_files):
            if path not in current_files:
                self.observed_files.pop(path, None)

        for path in list(self.observed_folders):
            if path not in current_folders:
                self.observed_folders.pop(path, None)

    def process_file(self, path: Path) -> None:
        if is_temporary_download(path):
            self.observed_files.pop(path, None)
            return

        try:
            if not self.is_old_enough(path, MINIMUM_FILE_AGE_SECONDS):
                self.observed_files.pop(path, None)
                return

            category = get_category_for_file(path)
            target_dir = self.downloads_folder / category

            if path.parent == target_dir:
                self.observed_files.pop(path, None)
                return

            size = get_accessible_file_size(path)
            if size is None:
                self.observed_files.pop(path, None)
                return

            previous = self.observed_files.get(path)
            if previous is None or previous[0] != size:
                self.observed_files[path] = (size, 0)
                return

            stable_checks = previous[1] + 1
            self.observed_files[path] = (size, stable_checks)

            if stable_checks < STABLE_CHECKS_REQUIRED:
                return

            destination = get_unique_destination(path, target_dir)
            shutil.move(str(path), str(destination))
            self.observed_files.pop(path, None)
            self.logger.info("Moved '%s' to '%s'", path, destination)
        except Exception:
            self.logger.exception("Failed to process '%s'", path)

    def process_folder(self, path: Path) -> None:
        if path.name in (*CATEGORIES.keys(), "Others"):
            self.observed_folders.pop(path, None)
            return

        try:
            if not self.is_old_enough(path, MINIMUM_FOLDER_AGE_SECONDS):
                self.observed_folders.pop(path, None)
                return

            target_dir = self.downloads_folder / "Others"
            signature = get_accessible_directory_signature(path)
            if signature is None:
                self.observed_folders.pop(path, None)
                return

            previous = self.observed_folders.get(path)
            if previous is None or previous[0] != signature:
                self.observed_folders[path] = (signature, 0)
                return

            stable_checks = previous[1] + 1
            self.observed_folders[path] = (signature, stable_checks)

            if stable_checks < STABLE_CHECKS_REQUIRED:
                return

            destination = get_unique_destination(path, target_dir)
            shutil.move(str(path), str(destination))
            self.observed_folders.pop(path, None)
            self.logger.info("Moved folder '%s' to '%s'", path, destination)
        except Exception:
            self.logger.exception("Failed to process folder '%s'", path)

    @staticmethod
    def is_old_enough(path: Path, minimum_age_seconds: int) -> bool:
        try:
            return time.time() - path.stat().st_mtime >= minimum_age_seconds
        except OSError:
            return False
