from __future__ import annotations

import os
import sys
import traceback
from pathlib import Path


def log_startup_failure() -> None:
    log_file = Path.home() / "DownloadsOrganizer.log"
    try:
        with log_file.open("a", encoding="utf-8") as handle:
            handle.write("\nFailed to start background organizer:\n")
            traceback.print_exc(file=handle)
    except OSError:
        pass


if __name__ == "__main__":
    try:
        script_dir = Path(__file__).resolve().parent
        os.chdir(script_dir)
        sys.path.insert(0, str(script_dir))
        sys.argv = [sys.argv[0], "run"]

        from download_organizer.cli import main

        main()
    except Exception:
        log_startup_failure()
