@echo off
title AI Translator - Uninstaller
cd /d "%~dp0"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0installer.ps1" -Mode uninstall
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Uninstaller exited with code %ERRORLEVEL%.
)
pause
