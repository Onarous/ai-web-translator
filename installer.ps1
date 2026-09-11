param(
    [string]$Mode = "interactive"
)

# Set UTF-8 Console output
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "AI Translator - Installer & Launcher"

function Write-Color([string]$Text, [ConsoleColor]$Color = [ConsoleColor]::White) {
    Write-Host $Text -ForegroundColor $Color
}

function Write-Banner {
    Clear-Host
    Write-Color "====================================================================" Cyan
    Write-Color "         AI Translator - Universal Web Translator                   " White
    Write-Color "             Автоматический установщик расширения                   " Yellow
    Write-Color "====================================================================" Cyan
    Write-Host ""
}

# Resolve paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }

$distExtensionDir = Join-Path $scriptDir "dist\extension"
$repoSourceDir = $scriptDir
$targetInstallDir = Join-Path $env:LOCALAPPDATA "AI-Translator\extension"

# Detect installed browsers
function Get-InstalledBrowsers {
    $browsers = @()

    $checkList = @(
        @{ Name = "Google Chrome"; Exe = "chrome.exe"; URL = "chrome://extensions/"; RegKey = "chrome.exe"; Paths = @(
            "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
            "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
            "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
        )},
        @{ Name = "Microsoft Edge"; Exe = "msedge.exe"; URL = "edge://extensions/"; RegKey = "msedge.exe"; Paths = @(
            "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
            "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
        )},
        @{ Name = "Brave Browser"; Exe = "brave.exe"; URL = "brave://extensions/"; RegKey = "brave.exe"; Paths = @(
            "$env:ProgramFiles\BraveSoftware\Brave-Browser\Application\brave.exe",
            "${env:ProgramFiles(x86)}\BraveSoftware\Brave-Browser\Application\brave.exe",
            "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser\Application\brave.exe"
        )},
        @{ Name = "Yandex Browser"; Exe = "browser.exe"; URL = "browser://extensions/"; RegKey = "browser.exe"; Paths = @(
            "$env:LOCALAPPDATA\Yandex\YandexBrowser\Application\browser.exe",
            "$env:ProgramFiles\Yandex\YandexBrowser\Application\browser.exe"
        )},
        @{ Name = "Opera"; Exe = "opera.exe"; URL = "opera://extensions/"; RegKey = "opera.exe"; Paths = @(
            "$env:LOCALAPPDATA\Programs\Opera\opera.exe",
            "$env:ProgramFiles\Opera\opera.exe"
        )},
        @{ Name = "Vivaldi"; Exe = "vivaldi.exe"; URL = "vivaldi://extensions/"; RegKey = "vivaldi.exe"; Paths = @(
            "$env:LOCALAPPDATA\Vivaldi\Application\vivaldi.exe",
            "$env:ProgramFiles\Vivaldi\Application\vivaldi.exe"
        )}
    )

    foreach ($item in $checkList) {
        $foundPath = $null
        foreach ($p in $item.Paths) {
            if (Test-Path $p) {
                $foundPath = $p
                break
            }
        }
        if (-not $foundPath) {
            try {
                $reg = Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\$($item.RegKey)" -ErrorAction SilentlyContinue
                if ($reg -and $reg.'(default)' -and (Test-Path $reg.'(default)')) {
                    $foundPath = $reg.'(default)'
                }
            } catch {}
        }
        if ($foundPath) {
            $browsers += [PSCustomObject]@{
                Name = $item.Name
                ExePath = $foundPath
                ExtensionsUrl = $item.URL
            }
        }
    }

    return $browsers
}

# Deploy extension files
function Install-ExtensionFiles {
    Write-Color "[1/2] Подготовка файлов расширения..." Yellow

    # Build fresh dist if node is available
    if (Test-Path (Join-Path $scriptDir "build_dist.js")) {
        try {
            $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
            if ($nodeCmd) {
                Write-Color "       Сборка чистых файлов через build_dist.js..." Gray
                & node "$scriptDir\build_dist.js" | Out-Null
            }
        } catch {}
    }

    $sourceToCopy = if (Test-Path $distExtensionDir) { $distExtensionDir } else { $repoSourceDir }

    if (-not (Test-Path $targetInstallDir)) {
        New-Item -ItemType Directory -Path $targetInstallDir -Force | Out-Null
    }

    $filesToCopy = @("manifest.json", "popup.html", "popup.js", "content.js", "background.js", "config.js", "i18n.js", "README.md", "LICENSE")
    foreach ($f in $filesToCopy) {
        $src = Join-Path $sourceToCopy $f
        if (Test-Path $src) {
            Copy-Item -Path $src -Destination $targetInstallDir -Force
        }
    }

    $dirsToCopy = @("_locales", "icons")
    foreach ($d in $dirsToCopy) {
        $src = Join-Path $sourceToCopy $d
        if (Test-Path $src) {
            Copy-Item -Path $src -Destination $targetInstallDir -Recurse -Force
        }
    }

    Write-Color "[2/2] Файлы успешно установлены в:" Green
    Write-Color "       $targetInstallDir" Cyan

    try {
        Set-Clipboard -Value $targetInstallDir
        Write-Color "       (Путь к папке автоматически скопирован в буфер обмена!)" Magenta
    } catch {}
}

# Interactive Menu
function Show-Menu {
    Write-Banner

    $browsers = Get-InstalledBrowsers
    Write-Color "Обнаруженные браузеры в системе:" White
    if ($browsers.Count -gt 0) {
        for ($i = 0; $i -lt $browsers.Count; $i++) {
            Write-Color "  [$($i + 1)] $($browsers[$i].Name)" Green
        }
    } else {
        Write-Color "  (Браузеры по стандартным путям не обнаружены)" DarkYellow
    }

    Write-Host ""
    Write-Color "Выберите действие:" Yellow
    Write-Color "  [1] Установить в браузер (открыть chrome://extensions и скопировать путь)" Cyan
    Write-Color "  [2] Прямой запуск браузера с предзагруженным расширением (Тест)" Cyan
    Write-Color "  [3] Собрать чистый ZIP-архив расширения для распространения" Cyan
    Write-Color "  [4] Создать ярлык на Рабочем столе" Cyan
    Write-Color "  [5] Удалить расширение из AppData" Red
    Write-Color "  [0] Выход" Gray
    Write-Host ""

    $choice = Read-Host "Введите номер (0-5) [по умолчанию 1]"
    if ([string]::IsNullOrWhiteSpace($choice)) { $choice = "1" }

    switch ($choice) {
        "1" {
            Install-ExtensionFiles
            Write-Host ""
            $selectedBrowser = if ($browsers.Count -gt 0) { $browsers[0] } else { $null }
            if ($browsers.Count -gt 1) {
                Write-Color "В какой браузер установить?" White
                for ($i = 0; $i -lt $browsers.Count; $i++) {
                    Write-Color "  [$($i + 1)] $($browsers[$i].Name)" Cyan
                }
                $bChoice = Read-Host "Выберите браузер (1-$($browsers.Count)) [1]"
                $bIdx = 0
                if ([int]::TryParse($bChoice, [ref]$bIdx) -and $bIdx -ge 1 -and $bIdx -le $browsers.Count) {
                    $selectedBrowser = $browsers[$bIdx - 1]
                }
            }

            Write-Host ""
            Write-Color "================ ИНСТРУКЦИЯ ПО УСТАНОВКЕ ================" Yellow
            Write-Color "1. В открывшемся браузере включите тумблер: 'Режим разработчика'" White
            Write-Color "   (Developer mode в правом верхнем углу страницы)" Gray
            Write-Color "2. Нажмите кнопку: 'Загрузить распакованное' (Load unpacked)" White
            Write-Color "3. Вставьте путь из буфера обмена (Ctrl + V) и нажмите 'Выбор папки':" White
            Write-Color "   $targetInstallDir" Cyan
            Write-Color "==========================================================" Yellow
            Write-Host ""

            # Open folder in Explorer
            $manifestFile = Join-Path $targetInstallDir "manifest.json"
            if (Test-Path $manifestFile) {
                Start-Process explorer.exe -ArgumentList "/select,`"$manifestFile`""
            } else {
                Start-Process explorer.exe -ArgumentList "`"$targetInstallDir`""
            }

            # Open extensions page
            if ($selectedBrowser) {
                Start-Process $selectedBrowser.ExePath -ArgumentList $selectedBrowser.ExtensionsUrl
            } else {
                Start-Process "chrome://extensions/" -ErrorAction SilentlyContinue
            }

            Write-Color "Готово! Расширение готово к работе." Green
        }
        "2" {
            Install-ExtensionFiles
            Write-Host ""
            $selectedBrowser = if ($browsers.Count -gt 0) { $browsers[0] } else { $null }
            if ($browsers.Count -gt 1) {
                Write-Color "Выберите браузер для запуска:" White
                for ($i = 0; $i -lt $browsers.Count; $i++) {
                    Write-Color "  [$($i + 1)] $($browsers[$i].Name)" Cyan
                }
                $bChoice = Read-Host "Выберите браузер (1-$($browsers.Count)) [1]"
                $bIdx = 0
                if ([int]::TryParse($bChoice, [ref]$bIdx) -and $bIdx -ge 1 -and $bIdx -le $browsers.Count) {
                    $selectedBrowser = $browsers[$bIdx - 1]
                }
            }

            if ($selectedBrowser) {
                Write-Color "Запуск $($selectedBrowser.Name) с флагом --load-extension..." Green
                Start-Process $selectedBrowser.ExePath -ArgumentList @("--load-extension=$targetInstallDir", "https://github.com/XFN52/local-ai-web-translator")
            } else {
                Write-Color "Браузер не найден для прямого запуска." Red
            }
        }
        "3" {
            Write-Color "Сборка релизного архива..." Yellow
            & node "$scriptDir\build_dist.js"
            $distDir = Join-Path $scriptDir "dist"
            if (Test-Path $distDir) {
                Start-Process explorer.exe -ArgumentList $distDir
            }
            Write-Color "ZIP-архив успешно собран в папке dist!" Green
        }
        "4" {
            $desktopDir = [Environment]::GetFolderPath("Desktop")
            $shortcutPath = Join-Path $desktopDir "AI Translator - Установщик.lnk"
            $wshShell = New-Object -ComObject WScript.Shell
            $shortcut = $wshShell.CreateShortcut($shortcutPath)
            $shortcut.TargetPath = Join-Path $scriptDir "install.bat"
            $shortcut.WorkingDirectory = $scriptDir
            $shortcut.Description = "Установщик и запуск AI Translator"
            $iconPath = Join-Path $scriptDir "icons\icon128.png"
            if (Test-Path $iconPath) {
                $shortcut.IconLocation = "$iconPath,0"
            }
            $shortcut.Save()
            Write-Color "Ярлык успешно создан на Рабочем столе: $shortcutPath" Green
        }
        "5" {
            $parentDir = Join-Path $env:LOCALAPPDATA "AI-Translator"
            if (Test-Path $parentDir) {
                Remove-Item -Path $parentDir -Recurse -Force
                Write-Color "Папка расширения успешно удалена из AppData." Green
            } else {
                Write-Color "Расширение не было установлено в AppData." Yellow
            }
        }
        "0" {
            Write-Color "Выход." Gray
            return
        }
        Default {
            Write-Color "Неизвестный выбор." Red
        }
    }

    Write-Host ""
    if ($Mode -eq "interactive") {
        Write-Color "Нажмите любую клавишу для завершения..." Gray
        $null = [Console]::ReadKey($true)
    }
}

function Uninstall-ExtensionFiles {
    Write-Color "====================================================================" Cyan
    Write-Color "               AI Translator - Удаление расширения                  " White
    Write-Color "====================================================================" Cyan
    Write-Host ""
    $parentDir = Join-Path $env:LOCALAPPDATA "AI-Translator"
    if (Test-Path $parentDir) {
        Remove-Item -Path $parentDir -Recurse -Force
        Write-Color "[УСПЕШНО] Папка расширения удалена из AppData." Green
    } else {
        Write-Color "[ИНФО] Папка расширения не была найдена в AppData." Yellow
    }

    $desktopDir = [Environment]::GetFolderPath("Desktop")
    $shortcutPath = Join-Path $desktopDir "AI Translator - Установщик.lnk"
    if (Test-Path $shortcutPath) {
        Remove-Item $shortcutPath -Force
        Write-Color "[УСПЕШНО] Ярлык на Рабочем столе удален." Green
    }

    Write-Host ""
    Write-Color "Для завершения удаления из браузера:" White
    Write-Color "  1. Откройте chrome://extensions/ или edge://extensions/" Gray
    Write-Color "  2. Найдите 'AI Translator' и нажмите 'Удалить' (Remove)." Gray
    Write-Host ""
    Write-Color "Удаление завершено." Green
}

if ($Mode -eq "silent" -or $Mode -eq "install") {
    Install-ExtensionFiles
} elseif ($Mode -eq "uninstall") {
    Uninstall-ExtensionFiles
} elseif ($Mode -eq "build") {
    & node "$scriptDir\build_dist.js"
} else {
    Show-Menu
}

