from __future__ import annotations

import logging
from pathlib import Path

from .config import LOG_FILE


def setup_logger(log_file: Path = LOG_FILE) -> logging.Logger:
    logger = logging.getLogger("download_organizer")
    logger.setLevel(logging.INFO)

    if logger.handlers:
        return logger

    try:
        handler = logging.FileHandler(log_file, encoding="utf-8")
    except OSError:
        fallback = Path.cwd() / LOG_FILE.name
        handler = logging.FileHandler(fallback, encoding="utf-8")

    handler.setFormatter(
        logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")
    )
    logger.addHandler(handler)
    return logger
