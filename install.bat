@echo off
title AI Translator - Installer
cd /d "%~dp0"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0installer.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] PowerShell script exited with code %ERRORLEVEL%.
    pause
)
