@echo off
chcp 65001 >nul
title AI Translator - Установщик
cd /d "%~dp0"

echo Запуск установщика AI Translator...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0installer.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Ошибка при запуске PowerShell скрипта.
    pause
)
