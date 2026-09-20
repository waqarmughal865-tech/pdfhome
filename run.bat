@echo off
title PDF Home
cd /d "%~dp0"

echo ============================================================
echo   Starting PDF Home...
echo ============================================================
echo.

REM Check if dependencies are installed
if not exist node_modules (
    echo [INFO] First time setup: Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies. Please ensure Node.js is installed.
        pause
        exit /b 1
    )
    echo.
)

echo [INFO] Opening PDF Home at http://localhost:3000 in your browser...
start http://localhost:3000

echo [INFO] Dev server is starting... (Press Ctrl+C to stop)
echo.
call npm run dev

pause
