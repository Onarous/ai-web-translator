# AI Translator | Universal Web Translator

[![Manifest V3](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-4285F4?logo=googlechrome&logoColor=white)](manifest.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![AI Providers](https://img.shields.io/badge/AI_Providers-Gemini_%7C_OpenAI_%7C_Claude_%7C_DeepSeek_%7C_Groq_%7C_Ollama-blueviolet)](https://github.com/Onarous/ai-web-translator)
[![OpenAI & Claude API](https://img.shields.io/badge/API-OpenAI_%26_Claude_Compatible-orange)](https://github.com/Onarous/ai-web-translator)
[![Tests Passing](https://img.shields.io/badge/Tests-100%25_Passed-brightgreen)](test_dom_translation.js)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Onarous/ai-web-translator/pulls)

> **High-performance, 100% DOM-safe browser extension** for seamless web translation powered by Cloud & Local Large Language Models (LLMs). Built specifically for modern dynamic Single Page Applications (SPAs), React/Vue virtual DOMs, and complex enterprise web interfaces.

---

## 🔍 Overview / Краткий обзор

**AI Translator** solves the fundamental flaw of traditional web translators (such as Google Translate or DeepL): broken UI layouts, corrupted React/Vue component state, detached event handlers, and frozen dropdowns. By operating strictly on `TextNode.nodeValue` and live DOM attributes, it translates web pages natively without re-rendering or modifying the underlying DOM hierarchy.

- **English**: Universal browser extension (Manifest V3) for AI-powered web translation with support for cloud LLMs (Google Gemini, OpenAI, Anthropic Claude, DeepSeek, Groq, OpenRouter) and local offline backends (Ollama, LM Studio, vLLM, LocalAI).
- **Русский**: Универсальное браузерное расширение (Manifest V3) для умного перевода страниц через любые облачные и локальные нейросети. Поддерживает множественные профили, авторотацию при лимитах (429), автоопределение языка и гарантирует полную сохранность React/Vue разметки.
- **中文**: 基于大语言模型（云端 API 与本地模型）的高性能 Chrome 网页翻译扩展 (Manifest V3)，100% 保护 React / Vue DOM 树，支持多配置管理、限流自动轮询切换与 JSON 导入导出。

---

## ⚡ Key Highlights & Comparison / Сравнение

| Feature / Критерий | Standard Translators (Google, DeepL) | AI Translator (Ours) |
| :--- | :--- | :--- |
| **DOM Safety & React VDOM** | ❌ Replaces innerHTML, crashes React/Vue | ✅ **100% safe**: updates only `TextNode.nodeValue` |
| **Complex UI & Selects** | ❌ Breaks portals, freezes dropdowns | ✅ **Protected**: portal detection & safe event propagation |
| **Hover Tooltips & Attributes** | ❌ Ignores `data-tooltip`, `placeholder` | ✅ **Live scan**: translates attributes dynamically |
| **AI Provider Freedom** | ❌ Locked to proprietary vendor engine | ✅ **Universal**: Gemini, Claude, DeepSeek, OpenAI, Groq, Ollama, LM Studio |
| **Multi-Profile Management** | ❌ Single fixed endpoint | ✅ **Multi-profiles**: switch instantly between models & providers |
| **Auto-Rotation on Rate Limits** | ❌ Hard stop on quota errors (HTTP 429) | ✅ **Automatic Failover**: auto-switches to next profile on 429/quota error |
| **Config Portability** | ❌ Manual setup on each machine | ✅ **JSON Import & Export**: 1-click backup and migration |
| **Language Selection** | ⚠️ Often requires manual pair selection | ✅ **Auto-Detection**: `AUTO → RU` by default + custom pairs |
| **Token & Quota Consumption** | ❌ Floods LLM with entire document | ✅ **Viewport-Only**: translates visible screen + lazy scroll observer |
| **Translation Caching** | ❌ Re-queries API on navigation | ✅ **Dual-Tier**: instant `pageCache` + 5,000 LRU persistent storage |
| **Original Text Restoration** | ❌ Requires full page reload | ✅ **Bit-Exact**: instant rollback via `WeakMap` with 1 click |
| **Interactive Floating Widget** | ❌ Fixed or intrusive banner | ✅ **Draggable Widget**: live status, Original/Translate toggle, refresh button `⟳`, close `✕` |

---

## 🚀 Key Features / Ключевые возможности

### 1. 🛡️ 100% DOM-Safe Translation Engine
- Mutates **only** `TextNode.nodeValue` without altering DOM node references or CSS styling.
- React fibers, Vue reactive proxies, and Angular zones remain completely intact.
- Seamlessly handles portals, popovers (`.semi-portal`, `.ant-popover`), and dropdown option lists.

### 2. 🤖 Universal AI Provider & Model Support
- Built-in adapters for:
  - **Google Gemini Cloud**: native OpenAI-compatible endpoint with default model `gemini-3.5-flash-lite`.
  - **Anthropic Claude**: native Claude API format (`/v1/messages`) with `anthropic-version: 2023-06-01`.
  - **DeepSeek API**: `deepseek-chat` (DeepSeek-V3) and `deepseek-reasoner` (DeepSeek-R1).
  - **OpenAI**: official ChatGPT models (`gpt-4o-mini`, `gpt-4o`).
  - **Groq Cloud**: ultra-fast LPU inference (`llama-3.3-70b-versatile`).
  - **Local Offline Models**: Ollama (`qwen2.5:latest`), LM Studio (`localhost:1234`), vLLM, LocalAI.
  - **Aggregators & Proxies**: OpenRouter, Mistral AI, custom corporate reverse proxies.

### 3. 👥 Multi-Profile Management & Auto-Rotation (Failover)
- **Profile Profiles Storage**: Create and name distinct profiles (e.g., *"Gemini Flash"*, *"DeepSeek V3"*, *"Ollama Local"*, *"OpenAI Backup"*), each with its own API URL, API Key, Model, and Batch Size.
- **Instant Switching**: Switch active configuration directly from the profile dropdown in the popup.
- **Smart Auto-Rotation on Rate Limit (429)**: If the active provider returns HTTP 429 (`RESOURCE_EXHAUSTED`, `insufficient_quota`, or `rate_limit_exceeded`), the extension automatically rotates to the next configured profile and retries translating seamlessly.
- **JSON Import / Export**: One-click export (`📤 Экспорт JSON`) saves all profiles into a timestamped JSON file (`ai_translator_profiles_YYYY-MM-DD.json`). One-click import (`📥 Импорт JSON`) restores configurations across devices.

### 4. 🌐 Auto-Detection & Multilingual Translation (i18n)
- **Automatic Extension UI Localization**: The popup interface, buttons, tabs, and notifications automatically adapt to the browser's language (`RU`, `EN`, `ZH`) via `chrome.i18n.getUILanguage()` / `navigator.language` with instant fallback.
- **Smart Source Detection**: Default source language is set to **Авто (AUTO)**, automatically detecting original page language on the fly.
- **Multi-Target Languages**: Supports translating into Russian (RU), English (EN), Chinese (ZH), Spanish (ES), German (DE), Japanese (JA), and French (FR).

### 5. 👁️ Viewport-Only Scan & Lazy Scroll
- Translates only the content currently visible on the screen.
- Offscreen elements are registered in an `IntersectionObserver` and translated lazily as the user scrolls, cutting token costs by up to 80%.

### 6. ⚡ Dual-Tier High-Performance Caching
- **Memory Cache (`pageCache`)**: Instant synchronous translation for recurring UI labels and navigation items.
- **Persistent LRU Cache**: Up to 5,000 entries saved in `chrome.storage.local`.
- **In-Batch Deduplication**: Identical strings in the same batch are sent to the LLM only once.

### 7. 🪟 Interactive On-Page Status Widget
- Displays live progress: spinner icon, translated elements counter, and active profile name.
- **"Оригинал" / "Перевод" Button**: One-click instant toggle between translated text and bit-exact original text (restored from internal `WeakMap`).
- **Refresh Button (`⟳`)**: Force-scans and translates newly rendered dynamic elements (AJAX, modals, infinite scroll).
- **Close Button (`✕`)**: Hides the floating widget from view.

---

## 🛠️ Architecture / Архитектура

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

## 📦 Supported Providers & Configurations / Провайдеры и настройки

| Provider | Endpoint URL | API Key | Model Name Example |
| :--- | :--- | :--- | :--- |
| **Google Gemini Cloud** | `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` | AI Studio API key (`AIzaSy...`) | `gemini-3.5-flash-lite` *(Default)* |
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

## 📥 Installation / Установка

### Вариант 1: Быстрый установщик в 1 клик для Windows (Рекомендуется)

1. Скачайте репозиторий и дважды кликните по файлу **`install.bat`**.
2. В появившемся меню:
   - **`[1] Скопировать путь в буфер обмена (без открытия браузера)`**: подготавливает и копирует путь к расширению `%LOCALAPPDATA%\AI-Translator\extension` в буфер обмена для быстрой вставки через `Ctrl + V` в диалоге выбора папки.
   - **`[2] Установить в браузер`**: готовит файлы, открывает папку расширения в проводнике и выводит наглядную инструкцию со ссылками на страницы расширений (`chrome://extensions`, `edge://extensions`).
   - **`[3] Прямой запуск`**: мгновенно запускает браузер с ключом `--load-extension` для быстрого теста.
   - **`[4] Собрать чистый ZIP`**: компилирует релизный архив `dist/AI-Translator-v1.0.0.zip` для публикации или передачи.
   - **`[5] Удалить расширение из AppData`**: очищает установленную директорию.

### Вариант 2: Ручная установка (Любая ОС)

1. **Клонируйте репозиторий**:
   ```bash
   git clone https://github.com/Onarous/ai-web-translator.git
   ```
2. **Откройте страницу расширений** в вашем Chromium-браузере:
   - Google Chrome: `chrome://extensions/`
   - Microsoft Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
   - Яндекс Браузер: `browser://extensions/`
3. Включите **«Режим разработчика»** (Developer mode) в правом верхнем углу.
4. Нажмите **«Загрузить распакованное»** (Load unpacked) и укажите папку проекта (или папку `dist/extension`).

### Удаление расширения
- Запустите **`uninstall.bat`** для быстрой очистки файлов из `AppData` и удаления ярлыка с Рабочего стола, затем нажмите «Удалить» в списке расширений браузера.

---

## ⚙️ How to Use / Инструкция по использованию

### Quick Start
1. Open any web page.
2. Click the **AI Translator** icon in the browser toolbar.
3. Choose your language direction (e.g., **"Авто (AUTO) → Русский (RU)"**).
4. Click **"Перевести страницу"** (Translate Page).

### Profile Management & Auto-Rotation
1. In the popup, click **"Настройки API"** to expand configuration options.
2. Under **"Профили конфигурации"**:
   - Select an existing profile from the dropdown.
   - Or click **"➕ Новый"** to create a new profile.
   - Enter profile name, API URL, API key, model name, and batch size, then click **"💾 Сохранить"**.
   - Enable **"Авторотация при исчерпании лимитов"**: if an API key hits rate limits (HTTP 429), the extension switches to your next profile automatically!
3. **Backup & Share**:
   - Click **"📤 Экспорт JSON"** to download all saved profiles.
   - Click **"📥 Импорт JSON"** to import profiles on any device.

### On-Page Widget Controls
When translation begins, a floating widget appears in the bottom-right corner:
- **Status & Counter**: Shows translation progress and active profile name.
- **"Оригинал" / "Перевод"**: Toggle back and forth between translated text and original page content without refreshing.
- **"⟳" (Refresh)**: Force-scans the DOM and translates newly loaded dynamic blocks (infinite feeds, popups, comments).
- **"✕" (Close)**: Hides the floating widget.

---

## 🧪 Testing / Тестирование

Run the automated test suite verifying DOM extraction, attribute translation, LRU cache eviction, in-batch deduplication, and 100% exact rollback:

```bash
node test_dom_translation.js
```

Expected output:
```text
=== AI Web Translator Test Suite ===
Running test 1: TreeWalker extracts only visible translatable text nodes... [PASS]
Running test 2: Ignored tags are skipped... [PASS]
Running test 3: Translatable attributes are extracted... [PASS]
Running test 4: LRU Cache stores and evicts correctly... [PASS]
Running test 5: Batch deduplication logic... [PASS]
Running test 6: Restore original text fidelity via WeakMap... [PASS]
Running test 7: Multi-profile schema validation & JSON import/export... [PASS]
Running test 8: Anthropic Claude payload adapter format... [PASS]
Running test 9: Profile auto-rotation on HTTP 429 quota exhaustion... [PASS]
Running test 10: Automatic browser language localization (i18n)... [PASS]
Running test 11: Installer packaging and manifest verification... [PASS]
All tests passed successfully!
```

---

## 🔒 Security & Privacy / Безопасность

- **Zero Third-Party Tracking**: The extension contains no analytics, telemetry, or external tracking scripts.
- **Direct API Communication**: Network requests go strictly and directly to the endpoint URL specified in your active profile.
- **Masked Logging**: The background logger automatically redacts sensitive authorization tokens (`Bearer ***`, `sk-***`) from console logs.

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).

