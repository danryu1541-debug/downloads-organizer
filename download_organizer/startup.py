from __future__ import annotations

import sys
import winreg
from pathlib import Path

from .config import APP_NAME


RUN_KEY = r"Software\Microsoft\Windows\CurrentVersion\Run"


def build_startup_command() -> str:
    executable = Path(sys.executable)
    script = Path(__file__).resolve().parent.parent / "downloads_organizer.py"
    return f'"{executable}" "{script}" run'


def enable_startup() -> None:
    command = build_startup_command()
    with winreg.OpenKey(
        winreg.HKEY_CURRENT_USER, RUN_KEY, 0, winreg.KEY_SET_VALUE
    ) as key:
        winreg.SetValueEx(key, APP_NAME, 0, winreg.REG_SZ, command)


def disable_startup() -> None:
    with winreg.OpenKey(
        winreg.HKEY_CURRENT_USER, RUN_KEY, 0, winreg.KEY_SET_VALUE
    ) as key:
        try:
            winreg.DeleteValue(key, APP_NAME)
        except FileNotFoundError:
            pass


def is_startup_enabled() -> bool:
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, RUN_KEY, 0, winreg.KEY_READ) as key:
            winreg.QueryValueEx(key, APP_NAME)
            return True
    except FileNotFoundError:
        return False
