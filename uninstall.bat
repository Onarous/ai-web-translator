@echo off
chcp 65001 >nul
title AI Translator - Удаление
cd /d "%~dp0"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0installer.ps1" -Mode uninstall
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Ошибка при выполнении удаления.
)
pause
