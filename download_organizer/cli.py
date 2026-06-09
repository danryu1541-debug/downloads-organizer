from __future__ import annotations

import argparse
import time

from .config import POLL_INTERVAL_SECONDS, STABLE_CHECKS_REQUIRED
from .logger import setup_logger
from .organizer import DownloadOrganizer
from .paths import get_downloads_folder
from .startup import disable_startup, enable_startup, is_startup_enabled
from .watcher import watch


def main() -> None:
    parser = argparse.ArgumentParser(description="Organize the Windows Downloads folder.")
    parser.add_argument(
        "command",
        choices=["run", "scan", "startup-enable", "startup-disable", "startup-status"],
        help="Action to perform.",
    )
    args = parser.parse_args()

    if args.command == "run":
        logger = setup_logger()
        downloads_folder = get_downloads_folder()
        watch(downloads_folder, logger)
    elif args.command == "scan":
        logger = setup_logger()
        downloads_folder = get_downloads_folder()
        organizer = DownloadOrganizer(downloads_folder, logger)
        for _ in range(STABLE_CHECKS_REQUIRED + 1):
            organizer.scan_once()
            time.sleep(POLL_INTERVAL_SECONDS)
    elif args.command == "startup-enable":
        enable_startup()
        print("Startup enabled.")
    elif args.command == "startup-disable":
        disable_startup()
        print("Startup disabled.")
    elif args.command == "startup-status":
        print("enabled" if is_startup_enabled() else "disabled")


if __name__ == "__main__":
    main()
