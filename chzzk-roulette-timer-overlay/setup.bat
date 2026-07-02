@echo off
setlocal
cd /d "%~dp0"

echo.
echo [Chzzk Roulette Timer] Setup
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  echo Install Node.js LTS from https://nodejs.org/
  pause
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Reinstall Node.js LTS.
  pause
  exit /b 1
)

if not exist ".env" (
  copy ".env.example" ".env" >nul
  echo Created .env from .env.example
)

if not exist "state.json" (
  copy "state.example.json" "state.json" >nul
  echo Created state.json from state.example.json
)

if not exist "config.json" (
  copy "config.example.json" "config.json" >nul
  echo Created config.json from config.example.json
)

echo Installing dependencies...
call npm.cmd install
if errorlevel 1 (
  echo npm install failed.
  pause
  exit /b 1
)

echo.
echo Setup complete.
echo Run start.bat to launch the program.
pause
