/**
 * Popup Script for Local AI Web Translator
 */

document.addEventListener("DOMContentLoaded", () => {
  const apiUrlInput = document.getElementById("apiUrl");
  const apiKeyInput = document.getElementById("apiKey");
  const modelInput = document.getElementById("model");
  const batchSizeInput = document.getElementById("batchSize");
  const translateBtn = document.getElementById("translateBtn");
  const restoreBtn = document.getElementById("restoreBtn");
  const toggleSettings = document.getElementById("toggleSettings");
  const settingsPanel = document.getElementById("settingsPanel");
  const testApiBtn = document.getElementById("testApiBtn");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  const cacheStats = document.getElementById("cacheStats");
  const clearCacheBtn = document.getElementById("clearCacheBtn");
  const providerSelect = document.getElementById("providerSelect");
  const sourceLangSelect = document.getElementById("sourceLang");
  const targetLangSelect = document.getElementById("targetLang");
  const swapLangsBtn = document.getElementById("swapLangsBtn");
  const langPairBadge = document.getElementById("langPairBadge");
  const statusDot = document.getElementById("statusDot");
  const statusText = document.getElementById("statusText");

  const PROVIDERS = {
    gemini: {
      name: "Google Gemini Cloud",
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      model: "gemini-3.5-flash-lite",
      keyPlaceholder: "AIzaSy... (Google AI Studio)"
    },
    deepseek: {
      name: "DeepSeek API",
      url: "https://api.deepseek.com/chat/completions",
      model: "deepseek-chat",
      keyPlaceholder: "sk-... (DeepSeek Platform)"
    },
    openai: {
      name: "OpenAI",
      url: "https://api.openai.com/v1/chat/completions",
      model: "gpt-4o-mini",
      keyPlaceholder: "sk-proj-... (OpenAI Platform)"
    },
    groq: {
      name: "Groq Cloud",
      url: "https://api.groq.com/openai/v1/chat/completions",
      model: "llama-3.3-70b-versatile",
      keyPlaceholder: "gsk_... (Groq Console)"
    },
    openrouter: {
      name: "OpenRouter",
      url: "https://openrouter.ai/api/v1/chat/completions",
      model: "deepseek/deepseek-chat",
      keyPlaceholder: "sk-or-v1-... (OpenRouter Keys)"
    },
    anthropic: {
      name: "Anthropic Claude",
      url: "https://api.anthropic.com/v1/messages",
      model: "claude-3-5-haiku-20241022",
      keyPlaceholder: "sk-ant-... (Anthropic Console)"
    },
    mistral: {
      name: "Mistral AI",
      url: "https://api.mistral.ai/v1/chat/completions",
      model: "mistral-small-latest",
      keyPlaceholder: "API-ключ Mistral Console"
    },
    ollama: {
      name: "Ollama (Локально)",
      url: "http://localhost:11434/v1/chat/completions",
      model: "qwen2.5:latest",
      keyPlaceholder: "Не требуется (локальный сервер)"
    },
    lmstudio: {
      name: "LM Studio (Локально)",
      url: "http://localhost:1234/v1/chat/completions",
      model: "local-model",
      keyPlaceholder: "Не требуется (локальный сервер)"
    },
    local8045: {
      name: "Локальный прокси 8045",
      url: "http://localhost:8045/v1/chat/completions",
      model: "gemini-3.8-flash-low",
      keyPlaceholder: "sk-..."
    }
  };

  const DEFAULTS = {
    apiUrl: typeof DEFAULT_CONFIG !== "undefined" ? DEFAULT_CONFIG.apiUrl : "http://localhost:8045/v1/chat/completions",
    model: typeof DEFAULT_CONFIG !== "undefined" ? DEFAULT_CONFIG.model : "gemini-3.8-flash-low",
    apiKey: typeof DEFAULT_CONFIG !== "undefined" ? DEFAULT_CONFIG.apiKey : "",
    batchSize: 20,
    sourceLang: typeof DEFAULT_CONFIG !== "undefined" ? (DEFAULT_CONFIG.sourceLang || "zh") : "zh",
    targetLang: typeof DEFAULT_CONFIG !== "undefined" ? (DEFAULT_CONFIG.targetLang || "ru") : "ru"
  };

  function updateBadge(src, tgt) {
    if (langPairBadge) {
      langPairBadge.textContent = `${(src || "zh").toUpperCase()} → ${(tgt || "ru").toUpperCase()}`;
    }
  }

  function refreshCacheStats() {
    if (!cacheStats) return;
    chrome.runtime.sendMessage({ type: "GET_CACHE_STATS" }, (res) => {
      if (!chrome.runtime.lastError && res) {
        cacheStats.textContent = `Кэш: ${res.size || 0} записей`;
      }
    });
  }

  function setStatus(text, type = "normal") {
    statusText.textContent = text;
    statusDot.className = "status-dot";
    if (type === "active") statusDot.classList.add("active");
    if (type === "error") statusDot.classList.add("error");
  }

  function detectProvider(url) {
    if (!url) return "";
    for (const [key, p] of Object.entries(PROVIDERS)) {
      try {
        if (new URL(url).hostname === new URL(p.url).hostname) {
          return key;
        }
      } catch (e) {
        if (url.includes(key)) return key;
      }
    }
    return "";
  }

  // Load saved options
  chrome.storage.sync.get(DEFAULTS, (items) => {
    apiUrlInput.value = items.apiUrl || DEFAULTS.apiUrl;
    apiKeyInput.value = items.apiKey || DEFAULTS.apiKey;
    let savedModel = items.model || DEFAULTS.model;
    if (savedModel === "gemini-2.0-flash") {
      savedModel = "gemini-3.5-flash-lite";
    }
    modelInput.value = savedModel;
    batchSizeInput.value = items.batchSize || DEFAULTS.batchSize;
    if (sourceLangSelect) sourceLangSelect.value = items.sourceLang || DEFAULTS.sourceLang;
    if (targetLangSelect) targetLangSelect.value = items.targetLang || DEFAULTS.targetLang;
    updateBadge(items.sourceLang || DEFAULTS.sourceLang, items.targetLang || DEFAULTS.targetLang);

    const matched = detectProvider(items.apiUrl || DEFAULTS.apiUrl);
    if (matched && providerSelect) {
      providerSelect.value = matched;
      if (PROVIDERS[matched]) {
        apiKeyInput.placeholder = PROVIDERS[matched].keyPlaceholder;
      }
    }
  });

  function saveLanguageSelection() {
    const src = sourceLangSelect ? sourceLangSelect.value : "zh";
    const tgt = targetLangSelect ? targetLangSelect.value : "ru";
    updateBadge(src, tgt);
    chrome.storage.sync.set({ sourceLang: src, targetLang: tgt });
  }

  if (sourceLangSelect) sourceLangSelect.addEventListener("change", saveLanguageSelection);
  if (targetLangSelect) targetLangSelect.addEventListener("change", saveLanguageSelection);

  if (swapLangsBtn) {
    swapLangsBtn.addEventListener("click", () => {
      if (!sourceLangSelect || !targetLangSelect) return;
      if (sourceLangSelect.value === "auto") {
        sourceLangSelect.value = "ru";
        targetLangSelect.value = "en";
      } else {
        const temp = sourceLangSelect.value;
        sourceLangSelect.value = targetLangSelect.value;
        targetLangSelect.value = temp;
      }
      saveLanguageSelection();
    });
  }

  // Toggle settings view
  toggleSettings.addEventListener("click", () => {
    settingsPanel.classList.toggle("open");
  });

  // Provider presets selector
  if (providerSelect) {
    providerSelect.addEventListener("change", () => {
      const p = PROVIDERS[providerSelect.value];
      if (p) {
        apiUrlInput.value = p.url;
        modelInput.value = p.model;
        apiKeyInput.placeholder = p.keyPlaceholder;
        setStatus(`Выбран: ${p.name}`, "active");
        setTimeout(() => setStatus("Готов к переводу"), 2000);
      }
    });
  }

  // Save settings
  saveSettingsBtn.addEventListener("click", () => {
    const newSettings = {
      apiUrl: apiUrlInput.value.trim() || DEFAULTS.apiUrl,
      apiKey: apiKeyInput.value.trim(),
      model: modelInput.value.trim() || DEFAULTS.model,
      batchSize: parseInt(batchSizeInput.value, 10) || DEFAULTS.batchSize,
      sourceLang: sourceLangSelect ? sourceLangSelect.value : DEFAULTS.sourceLang,
      targetLang: targetLangSelect ? targetLangSelect.value : DEFAULTS.targetLang
    };
    chrome.storage.sync.set(newSettings, () => {
      setStatus("Настройки сохранены", "active");
      setTimeout(() => setStatus("Готов к переводу"), 2000);
    });
  });

  // Clear translation cache
  if (clearCacheBtn) {
    clearCacheBtn.addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "CLEAR_CACHE" }, (res) => {
        if (!chrome.runtime.lastError && res && res.success) {
          if (cacheStats) cacheStats.textContent = "Кэш: 0 записей";
          setStatus("Кэш очищен", "active");
          setTimeout(() => setStatus("Готов к переводу"), 2000);
        }
      });
    });
  }

  refreshCacheStats();

  // Test local API connection
  testApiBtn.addEventListener("click", () => {
    const url = apiUrlInput.value.trim() || DEFAULTS.apiUrl;
    const key = apiKeyInput.value.trim() || DEFAULTS.apiKey;
    const model = modelInput.value.trim() || DEFAULTS.model;
    setStatus("Проверка связи с API...");
    chrome.runtime.sendMessage({ type: "CHECK_CONNECTION", apiUrl: url, apiKey: key, model }, (res) => {
      if (chrome.runtime.lastError) {
        setStatus("Ошибка фонового сервиса", "error");
        return;
      }
      if (res && res.ok) {
        setStatus(`API доступен (HTTP ${res.status})`, "active");
      } else {
        setStatus("API недоступен: " + (res?.error || "проверьте порт"), "error");
      }
    });
  });

  // Send action to active tab
  function sendTabAction(actionName) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) {
        setStatus("Вкладка не найдена", "error");
        return;
      }
      const tabId = tabs[0].id;
      setStatus("Отправка запроса на страницу...");

      chrome.tabs.sendMessage(tabId, { action: actionName }, (response) => {
        if (chrome.runtime.lastError) {
          setStatus("Обновите страницу для подключения скрипта", "error");
          return;
        }
        if (actionName === "TRANSLATE_PAGE") {
          setStatus("Перевод запущен на странице", "active");
        } else if (actionName === "RESTORE_ORIGINAL") {
          setStatus(`Восстановлено узлов: ${response?.restoredCount || 0}`, "active");
        }
      });
    });
  }

  translateBtn.addEventListener("click", () => sendTabAction("TRANSLATE_PAGE"));
  restoreBtn.addEventListener("click", () => sendTabAction("RESTORE_ORIGINAL"));

  // Check current page translation status on open
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "GET_STATUS" }, (res) => {
        if (!chrome.runtime.lastError && res) {
          if (res.isTranslating) {
            setStatus("Идет перевод страницы...", "active");
          } else if (res.isTranslated) {
            setStatus(`Страница переведена (${res.activeNodesCount} узлов)`, "active");
          }
        }
      });
    }
  });

  // Export logs handler
  const downloadLogsBtn = document.getElementById("downloadLogsBtn");
  if (downloadLogsBtn) {
    downloadLogsBtn.addEventListener("click", () => {
      chrome.storage.local.get({ logs: [] }, (res) => {
        const text = (res.logs || []).map((l) => `[${l.timestamp}] [${l.level}] [${l.tag}] ${l.message} ${l.meta ? JSON.stringify(l.meta) : ""}`).join("\n");
        const blob = new Blob([text || "Логи отсутствуют\n"], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `translator_${new Date().toISOString().slice(0, 10)}.log`;
        a.click();
        URL.revokeObjectURL(url);
      });
    });
  }
});
