from __future__ import annotations

import logging
import time
from pathlib import Path

from .config import POLL_INTERVAL_SECONDS
from .organizer import DownloadOrganizer


def watch(downloads_folder: Path, logger: logging.Logger) -> None:
    organizer = DownloadOrganizer(downloads_folder, logger)
    logger.info("Watching '%s'", downloads_folder)

    while True:
        try:
            organizer.scan_once()
        except Exception:
            logger.exception("Unexpected watcher error")
        time.sleep(POLL_INTERVAL_SECONDS)

