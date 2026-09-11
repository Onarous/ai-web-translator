# AI Web Translator

[English](README.md) | [Русский](README.ru.md)

[![Manifest V3](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-4285F4?logo=googlechrome&logoColor=white)](manifest.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![AI Providers](https://img.shields.io/badge/AI_Providers-Gemini_%7C_OpenAI_%7C_Claude_%7C_DeepSeek_%7C_Groq_%7C_Ollama-blueviolet)](https://github.com/Onarous/ai-web-translator)
[![OpenAI & Claude API](https://img.shields.io/badge/API-OpenAI_%26_Claude_Compatible-orange)](https://github.com/Onarous/ai-web-translator)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Onarous/ai-web-translator/pulls)

> **High-performance, 100% DOM-safe browser extension** for AI-driven web translation powered by Cloud & Local Large Language Models (LLMs). Built specifically for modern dynamic Single Page Applications (SPAs), React/Vue virtual DOMs, and complex enterprise web interfaces.

---

## 🔍 Overview

**AI Web Translator** solves the critical problem with traditional browser translators (such as Google Translate or DeepL): broken web layouts, damaged React/Vue virtual DOM state, lost event handlers, and frozen interactive menus.

By strictly updating `TextNode.nodeValue` and live DOM attributes, it translates web pages natively without modifying or rebuilding DOM elements.

- **Universal Model Support**: Connect directly to Google Gemini, OpenAI, Anthropic Claude, DeepSeek, Groq, OpenRouter, or run completely offline with Ollama, LM Studio, and vLLM.
- **Resilient Multi-Profile Failover**: Store multiple API profiles. If your active model hits an API rate limit or quota exhaustion (HTTP 429), the extension automatically switches to the next profile and continues translating seamlessly.
- **Native Browser Localization (i18n)**: Extension UI automatically adapts to your browser language (Russian, English, Simplified Chinese) with instant fallback.

---

## 📥 Installation

### Option 1: Windows 1-Click Installer (Recommended)

1. Download or clone this repository and double-click **`install.bat`**.
2. Choose from the interactive menu:
   - **`[1] Copy extension path to clipboard (without opening browser)`**: Prepares files and copies the path `%LOCALAPPDATA%\AI-Translator\extension` directly to your clipboard for quick `Ctrl + V` pasting in the browser folder dialog.
   - **`[2] Install to browser`**: Prepares files, opens the extension folder in File Explorer, and displays step-by-step instructions with direct links (`chrome://extensions`, `edge://extensions`).
   - **`[3] Launch browser with extension`**: Starts your browser with the `--load-extension` flag for immediate testing.
   - **`[4] Build release ZIP package`**: Compiles a clean production archive in `dist/AI-Translator-v1.0.0.zip`.
   - **`[5] Remove extension from AppData`**: Removes installed files from the AppData directory.

### Option 2: Manual Installation (All Operating Systems)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Onarous/ai-web-translator.git
   ```
2. **Open the extensions page** in your Chromium-based browser:
   - Google Chrome: `chrome://extensions/`
   - Microsoft Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
   - Yandex Browser: `browser://extensions/`
3. Enable **Developer mode** toggle in the top-right corner.
4. Click **Load unpacked** and select the project directory (or the `dist/extension` folder).

### Uninstallation
- Run **`uninstall.bat`** to cleanly remove all files from `AppData`, then click **Remove** next to the extension in your browser's extensions page.

---

## ⚡ Highlights & Comparison

| Feature | Standard Translators (Google, DeepL) | AI Web Translator |
| :--- | :--- | :--- |
| **DOM Safety & React/Vue VDOM** | ❌ Replaces innerHTML, breaks component state | ✅ **100% Safe**: Updates only `TextNode.nodeValue` |
| **Complex Portals & Menus** | ❌ Detaches event listeners, freezes UI | ✅ **Protected**: Portal detection & safe event propagation |
| **Tooltips & Attributes** | ❌ Ignores `data-tooltip`, `placeholder` | ✅ **Live Scan**: Translates attributes dynamically |
| **AI Provider Freedom** | ❌ Locked to vendor engine | ✅ **Universal**: Gemini, Claude, DeepSeek, OpenAI, Ollama, Groq, LM Studio |
| **Multi-Profile Management** | ❌ Single static configuration | ✅ **Multi-Profiles**: Switch instantly between models & keys |
| **Auto-Rotation on Rate Limits** | ❌ Hard stop on HTTP 429 quota exhaustion | ✅ **Automatic Failover**: Auto-rotates to next profile on 429 |
| **Config Portability** | ❌ Manual setup on every machine | ✅ **JSON Import & Export**: 1-click backup and migration |
| **Token & Quota Optimization** | ❌ Sends entire page to API | ✅ **Viewport-Only**: Translates visible screen + lazy scroll observer |
| **Translation Caching** | ❌ Re-queries API on navigation | ✅ **Dual-Tier**: Fast `pageCache` + 5,000 LRU persistent storage |
| **Original Text Restoration** | ❌ Requires full page reload | ✅ **Bit-Exact**: Instant rollback via `WeakMap` with 1 click |
| **Interactive Floating Widget** | ❌ Fixed or intrusive banner | ✅ **Draggable Widget**: Live counter, Original/Translate toggle, refresh button `⟳`, close `✕` |

---

## 🚀 Core Features

### 1. 🛡️ 100% DOM-Safe Translation Engine
- Mutates **only** `TextNode.nodeValue` without modifying DOM element hierarchy or CSS classes.
- React fiber nodes, Vue reactive observers, and Angular zone listeners remain fully functional.
- Accurately identifies and handles UI portals, popovers (`.semi-portal`, `.ant-popover`), and custom dropdown menus.

### 2. 🤖 Universal AI Provider & Model Support
- **Google Gemini Cloud**: Official OpenAI-compatible endpoint with default model `gemini-3.5-flash-lite`.
- **Anthropic Claude**: Native Claude API adapter (`/v1/messages`) supporting Claude 3.5 Sonnet and Haiku.
- **DeepSeek API**: Support for `deepseek-chat` (DeepSeek-V3) and `deepseek-reasoner` (DeepSeek-R1).
- **OpenAI**: Native `gpt-4o-mini`, `gpt-4o`, and compatible endpoints.
- **Groq Cloud**: Ultra-fast LPU inference (`llama-3.3-70b-versatile`).
- **Local Offline Models**: Ollama (`localhost:11434`), LM Studio (`localhost:1234`), vLLM, and LocalAI.
- **Aggregators & Reverse Proxies**: OpenRouter, Mistral AI, and custom corporate endpoints.

### 3. 👥 Multi-Profile Management & Automatic Failover
- **Named Profiles**: Create profiles for different tasks (e.g., *"Gemini Flash"*, *"DeepSeek V3"*, *"Ollama Local"*, *"OpenAI Backup"*), each with its own endpoint URL, API key, model name, and batch size.
- **Instant Switching**: Switch profiles instantly from the dropdown inside the extension popup.
- **Smart Auto-Rotation (HTTP 429)**: When rate limits or quota errors occur (`RESOURCE_EXHAUSTED`, `insufficient_quota`, `rate_limit_exceeded`), the extension automatically switches to the next available profile and continues translating.
- **JSON Import / Export**: Export all profiles to a timestamped JSON file (`ai_translator_profiles_YYYY-MM-DD.json`) with one click, or import them on any new device.

### 4. 🌐 Multilingual Support & Native Localization (i18n)
- **Automatic UI Localization**: Popup interface, buttons, tabs, and status messages automatically match your browser's language (`RU`, `EN`, `ZH`).
- **Smart Source Detection**: Default source language is set to **Auto (AUTO)**, automatically identifying the page language.
- **Target Languages**: Translates into Russian (RU), English (EN), Chinese (ZH), Spanish (ES), German (DE), Japanese (JA), and French (FR).

### 5. 👁️ Viewport-Only Scan & Lazy Scroll Observer
- Translates only elements currently visible in the browser viewport.
- Elements below the fold are registered with an `IntersectionObserver` and translated lazily as you scroll, saving up to 80% in token costs.

### 6. ⚡ Dual-Tier High-Performance Caching
- **In-Memory Cache (`pageCache`)**: Instant synchronous translation for repetitive UI elements, buttons, and navigation menus.
- **Persistent LRU Cache**: Stores up to 5,000 translation pairs in `chrome.storage.local`.
- **In-Batch Deduplication**: Repeated strings in the same translation batch are sent to the model only once.

### 7. 🪟 Interactive Floating Widget
- **Status & Progress Counter**: Displays real-time progress, translated elements counter, and active profile name.
- **"Original" / "Translated" Button**: Instant toggle between translated text and original page content without page reloading.
- **Refresh Button (`⟳`)**: Scans and translates dynamically added DOM nodes (AJAX content, infinite feeds, modals).
- **Close Button (`✕`)**: Hides the widget from the screen.

---

## 🛠️ Architecture

```text
Web Page DOM
     │
     ├──► TreeWalker(NodeFilter.SHOW_TEXT) ──► Filter Ignored Tags (script, style, code, pre...)
     │
     ├──► collectTranslatableAttributes() ──► Filter (data-tooltip, placeholder, title, aria-label)
     │
     ▼
Viewport Check (isElementInViewport)
     ├──► In-Viewport  ──► Check pageCache & LRU Cache
     │                          ├──► Cache Hit  ──► Instant nodeValue mutation
     │                          └──► Cache Miss ──► Batch Request (deduplicated)
     │                                                    │
     │                                                    ▼
     │                                            background.js Service Worker
     │                                                    │
     │                                     ┌──────────────┴──────────────┐
     │                                     ▼                             ▼
     │                             OpenAI / Gemini / Groq        Anthropic Claude
     │                             /v1/chat/completions          /v1/messages
     │                                     │                             │
     │                                     └──────────────┬──────────────┘
     │                                                    ▼
     │                                       Rate Limit / 429 Occurred?
     │                                      ┌─────────────┴─────────────┐
     │                                     YES                          NO
     │                                      │                            │
     │                                      ▼                            ▼
     │                            Auto-Rotate Profile              Return Translated
     │                                & Retry Batch                      Array
     │                                                                   │
     │                                                                   ▼
     │                                                      Atomic DOM nodeValue Update
     │
     └──► Below Fold   ──► Register in IntersectionObserver ──► Translate on User Scroll
```

---

## 📦 Supported Providers & Configurations

| Provider | Endpoint URL | API Key | Model Name Example |
| :--- | :--- | :--- | :--- |
| **Google Gemini Cloud** | `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` | Google AI Studio Key (`AIzaSy...`) | `gemini-3.5-flash-lite` *(Default)* |
| **DeepSeek API** | `https://api.deepseek.com/chat/completions` | DeepSeek Key (`sk-...`) | `deepseek-chat` / `deepseek-reasoner` |
| **OpenAI (ChatGPT)** | `https://api.openai.com/v1/chat/completions` | OpenAI Key (`sk-proj-...`) | `gpt-4o-mini` / `gpt-4o` |
| **Groq Cloud** | `https://api.groq.com/openai/v1/chat/completions` | Groq Key (`gsk_...`) | `llama-3.3-70b-versatile` |
| **Anthropic Claude** | `https://api.anthropic.com/v1/messages` | Anthropic Key (`sk-ant-...`) | `claude-3-5-haiku-20241022` |
| **OpenRouter** | `https://openrouter.ai/api/v1/chat/completions` | OpenRouter Key (`sk-or-...`) | `meta-llama/llama-3.3-70b-instruct` |
| **Mistral AI** | `https://api.mistral.ai/v1/chat/completions` | Mistral Key | `mistral-small-latest` |
| **Ollama (Local)** | `http://localhost:11434/v1/chat/completions` | *Leave empty* | `qwen2.5:latest` |
| **LM Studio (Local)** | `http://localhost:1234/v1/chat/completions` | *Leave empty* | `model-identifier` |
| **Custom Proxy** | `http://localhost:8045/v1/chat/completions` | *Optional* | Custom model name |

---

## ⚙️ How to Use

### Quick Start
1. Open any web page.
2. Click the **AI Web Translator** icon in the browser toolbar.
3. Choose your language direction (e.g., **"Auto (AUTO) → English (EN)"** or **"Auto (AUTO) → Russian (RU)"**).
4. Click **"Translate Page"**.

### Setting Up Profiles & Auto-Rotation
1. In the popup, click **"API Settings"** to expand the configuration drawer.
2. Under **"Configuration Profiles"**:
   - Select an existing profile from the dropdown.
   - Or click **"➕ New"** to create a new profile.
   - Enter profile name, API URL, API key, model name, and batch size, then click **"💾 Save"**.
   - Enable **"Auto-rotate profile on rate limit"**: when your active API hits rate limits (HTTP 429), the extension seamlessly switches to your next configured profile.
3. **Backup & Share**:
   - Click **"📤 Export JSON"** to download all saved profiles into a JSON backup file.
   - Click **"📥 Import JSON"** to restore configurations on any computer.

### On-Page Floating Widget Controls
When translation begins, an interactive widget appears in the bottom-right corner:
- **Status & Counter**: Displays progress and the currently active profile name.
- **"Original" / "Translated"**: Instantly toggles between translated text and original content.
- **"⟳" (Refresh)**: Force-scans the DOM and translates newly rendered dynamic elements.
- **"✕" (Close)**: Closes the widget.

---

## 🔒 Security & Privacy

- **Zero Third-Party Telemetry**: The extension contains no analytics, trackers, or external scripts.
- **Direct API Communication**: Network requests go strictly and directly to the endpoint URL specified in your active profile.
- **Masked Logging**: Authorization headers (`Bearer ***`, `sk-***`) are automatically masked in browser console logs.

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
