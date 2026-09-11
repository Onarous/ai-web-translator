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
  const profileSelect = document.getElementById("profileSelect");
  const profileNameInput = document.getElementById("profileName");
  const autoRotateCheckbox = document.getElementById("autoRotateCheckbox");
  const addProfileBtn = document.getElementById("addProfileBtn");
  const deleteProfileBtn = document.getElementById("deleteProfileBtn");
  const exportProfilesBtn = document.getElementById("exportProfilesBtn");
  const importProfilesBtn = document.getElementById("importProfilesBtn");
  const importProfilesFile = document.getElementById("importProfilesFile");
  const providerSelect = document.getElementById("providerSelect");
  const sourceLangSelect = document.getElementById("sourceLang");
  const targetLangSelect = document.getElementById("targetLang");
  const swapLangsBtn = document.getElementById("swapLangsBtn");
  const langPairBadge = document.getElementById("langPairBadge");
  const statusDot = document.getElementById("statusDot");
  const statusText = document.getElementById("statusText");

  let profiles = [];
  let activeProfileId = "";
  let autoRotate = true;

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
    sourceLang: typeof DEFAULT_CONFIG !== "undefined" ? (DEFAULT_CONFIG.sourceLang || "auto") : "auto",
    targetLang: typeof DEFAULT_CONFIG !== "undefined" ? (DEFAULT_CONFIG.targetLang || "ru") : "ru"
  };

  function updateBadge(src, tgt) {
    if (langPairBadge) {
      langPairBadge.textContent = `${(src || "auto").toUpperCase()} → ${(tgt || "ru").toUpperCase()}`;
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

  function renderProfileSelect() {
    if (!profileSelect) return;
    profileSelect.innerHTML = "";
    for (const prof of profiles) {
      const opt = document.createElement("option");
      opt.value = prof.id;
      opt.textContent = prof.name || "Без названия";
      if (prof.id === activeProfileId) {
        opt.selected = true;
      }
      profileSelect.appendChild(opt);
    }
  }

  function loadProfileIntoForm(profileId) {
    const prof = profiles.find((p) => p.id === profileId) || profiles[0];
    if (!prof) return;
    activeProfileId = prof.id;
    if (profileSelect) profileSelect.value = prof.id;
    if (profileNameInput) profileNameInput.value = prof.name || "";
    if (apiUrlInput) apiUrlInput.value = prof.apiUrl || "";
    if (apiKeyInput) apiKeyInput.value = prof.apiKey || "";
    if (modelInput) modelInput.value = prof.model || "";
    if (batchSizeInput) batchSizeInput.value = prof.batchSize || 20;

    const matched = detectProvider(prof.apiUrl);
    if (matched && providerSelect) {
      providerSelect.value = matched;
      if (PROVIDERS[matched]) {
        apiKeyInput.placeholder = PROVIDERS[matched].keyPlaceholder;
      }
    } else if (providerSelect) {
      providerSelect.value = "";
      apiKeyInput.placeholder = "sk-... или API-ключ";
    }
  }

  function saveCurrentFormToProfile() {
    const prof = profiles.find((p) => p.id === activeProfileId);
    if (!prof) return;
    prof.name = profileNameInput ? (profileNameInput.value.trim() || prof.name || "Профиль") : prof.name;
    prof.apiUrl = apiUrlInput.value.trim() || DEFAULTS.apiUrl;
    prof.apiKey = apiKeyInput.value.trim();
    prof.model = modelInput.value.trim() || DEFAULTS.model;
    prof.batchSize = parseInt(batchSizeInput.value, 10) || 20;
  }

  function persistProfilesState(callback) {
    const activeProf = profiles.find((p) => p.id === activeProfileId) || profiles[0] || {};
    const dataToSave = {
      profiles,
      activeProfileId,
      autoRotate: autoRotateCheckbox ? autoRotateCheckbox.checked : true,
      apiUrl: activeProf.apiUrl || DEFAULTS.apiUrl,
      apiKey: activeProf.apiKey || "",
      model: activeProf.model || DEFAULTS.model,
      batchSize: activeProf.batchSize || 20,
      sourceLang: sourceLangSelect ? sourceLangSelect.value : DEFAULTS.sourceLang,
      targetLang: targetLangSelect ? targetLangSelect.value : DEFAULTS.targetLang
    };
    chrome.storage.sync.set(dataToSave, () => {
      renderProfileSelect();
      if (typeof callback === "function") callback();
    });
  }

  // Load saved options and profiles
  chrome.storage.sync.get(
    {
      profiles: [],
      activeProfileId: "",
      autoRotate: true,
      apiUrl: DEFAULTS.apiUrl,
      apiKey: DEFAULTS.apiKey,
      model: DEFAULTS.model,
      batchSize: DEFAULTS.batchSize,
      sourceLang: DEFAULTS.sourceLang,
      targetLang: DEFAULTS.targetLang
    },
    (items) => {
      profiles = Array.isArray(items.profiles) ? items.profiles : [];
      if (profiles.length === 0) {
        const initialProf = {
          id: "prof_default",
          name: "Основной профиль",
          apiUrl: items.apiUrl || DEFAULTS.apiUrl,
          apiKey: items.apiKey || DEFAULTS.apiKey,
          model: items.model || DEFAULTS.model,
          batchSize: items.batchSize || DEFAULTS.batchSize,
          enabled: true
        };
        profiles = [initialProf];
        activeProfileId = initialProf.id;
        chrome.storage.sync.set({ profiles, activeProfileId });
      } else {
        activeProfileId = items.activeProfileId;
        if (!activeProfileId || !profiles.some((p) => p.id === activeProfileId)) {
          activeProfileId = profiles[0].id;
        }
      }

      autoRotate = items.autoRotate !== false;
      if (autoRotateCheckbox) {
        autoRotateCheckbox.checked = autoRotate;
      }

      if (sourceLangSelect) sourceLangSelect.value = items.sourceLang || DEFAULTS.sourceLang;
      if (targetLangSelect) targetLangSelect.value = items.targetLang || DEFAULTS.targetLang;
      updateBadge(items.sourceLang || DEFAULTS.sourceLang, items.targetLang || DEFAULTS.targetLang);

      renderProfileSelect();
      loadProfileIntoForm(activeProfileId);
    }
  );

  // Profile selector change
  if (profileSelect) {
    profileSelect.addEventListener("change", () => {
      saveCurrentFormToProfile();
      activeProfileId = profileSelect.value;
      loadProfileIntoForm(activeProfileId);
      persistProfilesState();
      setStatus("Выбран профиль", "active");
      setTimeout(() => setStatus("Готов к переводу"), 1500);
    });
  }

  // Add profile button
  if (addProfileBtn) {
    addProfileBtn.addEventListener("click", () => {
      saveCurrentFormToProfile();
      const newId = "prof_" + Date.now();
      const newProf = {
        id: newId,
        name: `Профиль ${profiles.length + 1}`,
        apiUrl: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        apiKey: "",
        model: "gemini-3.5-flash-lite",
        batchSize: 20,
        enabled: true
      };
      profiles.push(newProf);
      activeProfileId = newId;
      renderProfileSelect();
      loadProfileIntoForm(newId);
      persistProfilesState();
      setStatus("Создан новый профиль", "active");
      setTimeout(() => setStatus("Готов к переводу"), 1500);
    });
  }

  // Delete profile button
  if (deleteProfileBtn) {
    deleteProfileBtn.addEventListener("click", () => {
      if (profiles.length <= 1) {
        setStatus("Нельзя удалить единственный профиль", "error");
        setTimeout(() => setStatus("Готов к переводу"), 2000);
        return;
      }
      const idx = profiles.findIndex((p) => p.id === activeProfileId);
      if (idx !== -1) {
        profiles.splice(idx, 1);
        activeProfileId = profiles[0].id;
        renderProfileSelect();
        loadProfileIntoForm(activeProfileId);
        persistProfilesState();
        setStatus("Профиль удален", "active");
        setTimeout(() => setStatus("Готов к переводу"), 1500);
      }
    });
  }

  // Export profiles to JSON
  if (exportProfilesBtn) {
    exportProfilesBtn.addEventListener("click", () => {
      saveCurrentFormToProfile();
      const exportData = {
        version: "1.0",
        app: "AI Translator",
        exportedAt: new Date().toISOString(),
        activeProfileId,
        autoRotate: autoRotateCheckbox ? autoRotateCheckbox.checked : true,
        profiles
      };
      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ai_translator_profiles_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setStatus(`Экспортировано ${profiles.length} профилей`, "active");
      setTimeout(() => setStatus("Готов к переводу"), 2000);
    });
  }

  // Import profiles from JSON
  if (importProfilesBtn && importProfilesFile) {
    importProfilesBtn.addEventListener("click", () => {
      importProfilesFile.value = "";
      importProfilesFile.click();
    });

    importProfilesFile.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const raw = event.target?.result;
          const parsed = JSON.parse(raw);
          let incomingProfiles = [];

          if (Array.isArray(parsed)) {
            incomingProfiles = parsed;
          } else if (Array.isArray(parsed?.profiles)) {
            incomingProfiles = parsed.profiles;
            if (typeof parsed.autoRotate === "boolean" && autoRotateCheckbox) {
              autoRotateCheckbox.checked = parsed.autoRotate;
            }
          } else {
            throw new Error("Неверный формат JSON (ожидался список профилей)");
          }

          if (incomingProfiles.length === 0) {
            throw new Error("Файл не содержит профилей");
          }

          const sanitized = incomingProfiles.map((p, idx) => ({
            id: p.id || ("prof_" + Date.now() + "_" + idx),
            name: p.name || `Профиль ${idx + 1}`,
            apiUrl: p.apiUrl || DEFAULTS.apiUrl,
            apiKey: p.apiKey || "",
            model: p.model || DEFAULTS.model,
            batchSize: Number(p.batchSize) || 20,
            enabled: p.enabled !== false
          }));

          profiles = sanitized;
          activeProfileId = (parsed?.activeProfileId && profiles.some((p) => p.id === parsed.activeProfileId))
            ? parsed.activeProfileId
            : profiles[0].id;

          renderProfileSelect();
          loadProfileIntoForm(activeProfileId);
          persistProfilesState(() => {
            setStatus(`Импортировано: ${profiles.length} профилей`, "active");
            setTimeout(() => setStatus("Готов к переводу"), 2500);
          });
        } catch (err) {
          console.error("[AI Translator] Import error:", err);
          setStatus(`Ошибка импорта: ${err.message}`, "error");
          setTimeout(() => setStatus("Готов к переводу"), 3500);
        }
      };
      reader.readAsText(file);
    });
  }

  // Auto-rotate checkbox change
  if (autoRotateCheckbox) {
    autoRotateCheckbox.addEventListener("change", () => {
      persistProfilesState();
      setStatus(autoRotateCheckbox.checked ? "Авторотация включена" : "Авторотация выключена", "active");
      setTimeout(() => setStatus("Готов к переводу"), 1500);
    });
  }

  function saveLanguageSelection() {
    const src = sourceLangSelect ? sourceLangSelect.value : "auto";
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
        if (profileNameInput && (!profileNameInput.value || profileNameInput.value.startsWith("Профиль") || profileNameInput.value === "Основной профиль")) {
          profileNameInput.value = p.name;
        }
        setStatus(`Выбран шаблон: ${p.name}`, "active");
        setTimeout(() => setStatus("Готов к переводу"), 2000);
      }
    });
  }

  // Save profile settings
  saveSettingsBtn.addEventListener("click", () => {
    saveCurrentFormToProfile();
    persistProfilesState(() => {
      setStatus("Профиль сохранен", "active");
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
