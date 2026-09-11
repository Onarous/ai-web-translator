/**
 * Internationalization (i18n) Module for AI Translator
 * Dynamically detects browser UI language and provides localized strings.
 */

const I18N_DICTIONARIES = {
  ru: {
    // Header & Badges
    appName: "AI Translator",
    
    // Languages in Dropdown
    lang_auto: "Автоопределение",
    lang_zh: "Китайский (ZH)",
    lang_en: "Английский (EN)",
    lang_ja: "Японский (JA)",
    lang_ko: "Корейский (KO)",
    lang_de: "Немецкий (DE)",
    lang_fr: "Французский (FR)",
    lang_es: "Испанский (ES)",
    lang_it: "Итальянский (IT)",
    lang_ru: "Русский (RU)",

    // Main Controls
    sourceLangLabel: "С какого:",
    targetLangLabel: "На какой:",
    swapLangsTitle: "Поменять местами",
    translateBtn: "Перевести",
    restoreBtn: "Оригинал",
    toggleSettings: "⚙️ Настройки API",

    // Presets & Fields
    providerSelectLabel: "Заполнить из шаблона (быстрый пресет):",
    providerSelectDefault: "-- Выберите шаблон провайдера --",
    apiUrlLabel: "API URL:",
    apiUrlPlaceholder: "http://localhost:8045/v1/chat/completions",
    apiKeyLabel: "API Key (Ключ авторизации):",
    apiKeyPlaceholder: "sk-... или AIzaSy...",
    modelLabel: "Модель ИИ:",
    modelPlaceholder: "Название модели (например, deepseek-chat)",
    batchSizeLabel: "Размер пачки (узлов):",

    // Profile Management
    profileSelectLabel: "Профиль настроек:",
    addProfileBtn: "+ Новый",
    addProfileTitle: "Создать новый профиль",
    deleteProfileTitle: "Удалить текущий профиль",
    profileNameLabel: "Название профиля:",
    profileNamePlaceholder: "Например: Google Gemini (Основной)",
    exportProfilesBtn: "📤 Экспорт JSON",
    exportProfilesTitle: "Экспортировать профили в JSON-файл",
    importProfilesBtn: "📥 Импорт JSON",
    importProfilesTitle: "Импортировать профили из JSON-файла",
    autoRotateLabel: "Авторотация при исчерпании лимита (429/Quota)",
    defaultProfileName: "Основной профиль",
    profileNumbered: "Профиль {n}",

    // Cache & Save Controls
    cacheStats: "Кэш: {n} записей",
    clearCacheBtn: "Очистить кэш",
    testApiBtn: "Проверить API",
    saveSettingsBtn: "Сохранить профиль",

    // Status Messages
    statusReady: "Готов к переводу",
    profileSelected: "Выбран профиль",
    profileCreated: "Создан новый профиль",
    profileDeleted: "Профиль удален",
    cannotDeleteOnlyProfile: "Нельзя удалить единственный профиль",
    exportedProfiles: "Экспортировано {n} профилей",
    importedProfiles: "Импортировано: {n} профилей",
    invalidJsonFormat: "Неверный формат JSON (ожидался список профилей)",
    emptyProfilesFile: "Файл не содержит профилей",
    importError: "Ошибка импорта: {msg}",
    autoRotateEnabled: "Авторотация включена",
    autoRotateDisabled: "Авторотация выключена",
    templateSelected: "Выбран шаблон: {name}",
    profileSaved: "Профиль сохранен",
    cacheCleared: "Кэш очищен",
    testingApi: "Проверка связи с API...",
    bgServiceError: "Ошибка фонового сервиса",
    apiAvailable: "API доступен (HTTP {status})",
    apiUnavailable: "API недоступен: {err}",
    tabNotFound: "Вкладка не найдена",
    reloadPagePrompt: "Обновите страницу для подключения скрипта",
    translationStarted: "Перевод запущен на странице",
    nodesRestored: "Восстановлено узлов: {n}",
    translatingPage: "Идет перевод страницы...",
    pageTranslated: "Страница переведена ({n} узлов)",
    viewLogsLink: "📄 Открыть файл логов",
    downloadLogsBtn: "Экспорт",
    noLogs: "Логи отсутствуют\n",

    // Provider Key Placeholders
    keyGemini: "AIzaSy... (Google AI Studio)",
    keyDeepSeek: "sk-... (DeepSeek Platform)",
    keyOpenAI: "sk-proj-... (OpenAI Platform)",
    keyGroq: "gsk_... (Groq Console)",
    keyOpenRouter: "sk-or-v1-... (OpenRouter Keys)",
    keyAnthropic: "sk-ant-... (Anthropic Console)",
    keyMistral: "API-ключ Mistral Console",
    keyOllama: "Не требуется (локальный сервер)",
    keyLmstudio: "Не требуется (локальный сервер)",
    keyDefault: "sk-... или API-ключ",

    // In-Page Floating Widget
    widgetOriginal: "Оригинал",
    widgetOriginalWithLang: "Оригинал ({lang})",
    widgetActionBtnTitleDone: "Вернуть оригинальный текст страницы",
    widgetActionBtnTitleIdle: "Перевести страницу",
    widgetRefreshBtnTitle: "Обновить перевод страницы",
    widgetCloseBtnTitle: "Скрыть панель",
    widgetTranslating: "Перевод {curr}/{total}...",
    widgetRotated: "🔄 Лимит: {target}",
    widgetRefreshed: "✓ Обновлено",
    widgetTranslateTo: "Перевести ({lang})",
    widgetNoText: "Нет текста",
    widgetApiError: "Ошибка API",
    widgetConnectError: "Ошибка подключения"
  },
  en: {
    // Header & Badges
    appName: "AI Translator",

    // Languages in Dropdown
    lang_auto: "Auto-detect",
    lang_zh: "Chinese (ZH)",
    lang_en: "English (EN)",
    lang_ja: "Japanese (JA)",
    lang_ko: "Korean (KO)",
    lang_de: "German (DE)",
    lang_fr: "French (FR)",
    lang_es: "Spanish (ES)",
    lang_it: "Italian (IT)",
    lang_ru: "Russian (RU)",

    // Main Controls
    sourceLangLabel: "From:",
    targetLangLabel: "To:",
    swapLangsTitle: "Swap languages",
    translateBtn: "Translate",
    restoreBtn: "Original",
    toggleSettings: "⚙️ API Settings",

    // Presets & Fields
    providerSelectLabel: "Fill from preset:",
    providerSelectDefault: "-- Select provider preset --",
    apiUrlLabel: "API URL:",
    apiUrlPlaceholder: "http://localhost:8045/v1/chat/completions",
    apiKeyLabel: "API Key (Authorization):",
    apiKeyPlaceholder: "sk-... or AIzaSy...",
    modelLabel: "AI Model:",
    modelPlaceholder: "Model name (e.g. deepseek-chat)",
    batchSizeLabel: "Batch Size (nodes):",

    // Profile Management
    profileSelectLabel: "Configuration Profile:",
    addProfileBtn: "+ New",
    addProfileTitle: "Create new profile",
    deleteProfileTitle: "Delete current profile",
    profileNameLabel: "Profile Name:",
    profileNamePlaceholder: "e.g. Google Gemini (Main)",
    exportProfilesBtn: "📤 Export JSON",
    exportProfilesTitle: "Export profiles to JSON file",
    importProfilesBtn: "📥 Import JSON",
    importProfilesTitle: "Import profiles from JSON file",
    autoRotateLabel: "Auto-rotate on quota/rate limit (429)",
    defaultProfileName: "Main Profile",
    profileNumbered: "Profile {n}",

    // Cache & Save Controls
    cacheStats: "Cache: {n} entries",
    clearCacheBtn: "Clear Cache",
    testApiBtn: "Test API",
    saveSettingsBtn: "Save Profile",

    // Status Messages
    statusReady: "Ready to translate",
    profileSelected: "Profile selected",
    profileCreated: "New profile created",
    profileDeleted: "Profile deleted",
    cannotDeleteOnlyProfile: "Cannot delete the only profile",
    exportedProfiles: "Exported {n} profiles",
    importedProfiles: "Imported: {n} profiles",
    invalidJsonFormat: "Invalid JSON format (expected list of profiles)",
    emptyProfilesFile: "File contains no profiles",
    importError: "Import error: {msg}",
    autoRotateEnabled: "Auto-rotation enabled",
    autoRotateDisabled: "Auto-rotation disabled",
    templateSelected: "Selected preset: {name}",
    profileSaved: "Profile saved",
    cacheCleared: "Cache cleared",
    testingApi: "Testing API connection...",
    bgServiceError: "Background service error",
    apiAvailable: "API reachable (HTTP {status})",
    apiUnavailable: "API unreachable: {err}",
    tabNotFound: "Tab not found",
    reloadPagePrompt: "Reload page to connect script",
    translationStarted: "Translation started on page",
    nodesRestored: "Restored nodes: {n}",
    translatingPage: "Translating page...",
    pageTranslated: "Page translated ({n} nodes)",
    viewLogsLink: "📄 Open log file",
    downloadLogsBtn: "Export",
    noLogs: "No logs available\n",

    // Provider Key Placeholders
    keyGemini: "AIzaSy... (Google AI Studio)",
    keyDeepSeek: "sk-... (DeepSeek Platform)",
    keyOpenAI: "sk-proj-... (OpenAI Platform)",
    keyGroq: "gsk_... (Groq Console)",
    keyOpenRouter: "sk-or-v1-... (OpenRouter Keys)",
    keyAnthropic: "sk-ant-... (Anthropic Console)",
    keyMistral: "Mistral Console API Key",
    keyOllama: "Not required (local server)",
    keyLmstudio: "Not required (local server)",
    keyDefault: "sk-... or API key",

    // In-Page Floating Widget
    widgetOriginal: "Original",
    widgetOriginalWithLang: "Original ({lang})",
    widgetActionBtnTitleDone: "Restore original page text",
    widgetActionBtnTitleIdle: "Translate page",
    widgetRefreshBtnTitle: "Refresh page translation",
    widgetCloseBtnTitle: "Hide widget",
    widgetTranslating: "Translating {curr}/{total}...",
    widgetRotated: "🔄 Limit: {target}",
    widgetRefreshed: "✓ Updated",
    widgetTranslateTo: "Translate ({lang})",
    widgetNoText: "No text found",
    widgetApiError: "API Error",
    widgetConnectError: "Connection error"
  },
  zh: {
    // Header & Badges
    appName: "AI Translator",

    // Languages in Dropdown
    lang_auto: "自动检测",
    lang_zh: "中文 (ZH)",
    lang_en: "英语 (EN)",
    lang_ja: "日语 (JA)",
    lang_ko: "韩语 (KO)",
    lang_de: "德语 (DE)",
    lang_fr: "法语 (FR)",
    lang_es: "西班牙语 (ES)",
    lang_it: "意大利语 (IT)",
    lang_ru: "俄语 (RU)",

    // Main Controls
    sourceLangLabel: "源语言:",
    targetLangLabel: "目标语言:",
    swapLangsTitle: "交换语言",
    translateBtn: "翻译页面",
    restoreBtn: "还原原文",
    toggleSettings: "⚙️ API 设置",

    // Presets & Fields
    providerSelectLabel: "从预设填充:",
    providerSelectDefault: "-- 选择服务商预设 --",
    apiUrlLabel: "API URL:",
    apiUrlPlaceholder: "http://localhost:8045/v1/chat/completions",
    apiKeyLabel: "API Key (授权密钥):",
    apiKeyPlaceholder: "sk-... 或 AIzaSy...",
    modelLabel: "AI 模型:",
    modelPlaceholder: "模型名称 (例如 deepseek-chat)",
    batchSizeLabel: "批次大小 (节点数):",

    // Profile Management
    profileSelectLabel: "配置档案:",
    addProfileBtn: "+ 新建",
    addProfileTitle: "创建新配置",
    deleteProfileTitle: "删除当前配置",
    profileNameLabel: "配置名称:",
    profileNamePlaceholder: "例如: Google Gemini (主配置)",
    exportProfilesBtn: "📤 导出 JSON",
    exportProfilesTitle: "导出配置到 JSON 文件",
    importProfilesBtn: "📥 导入 JSON",
    importProfilesTitle: "从 JSON 文件导入配置",
    autoRotateLabel: "限流/配额用尽自动轮询 (429)",
    defaultProfileName: "主配置",
    profileNumbered: "配置 {n}",

    // Cache & Save Controls
    cacheStats: "缓存: {n} 条",
    clearCacheBtn: "清除缓存",
    testApiBtn: "测试 API",
    saveSettingsBtn: "保存配置",

    // Status Messages
    statusReady: "就绪",
    profileSelected: "已选择配置",
    profileCreated: "已新建配置",
    profileDeleted: "配置已删除",
    cannotDeleteOnlyProfile: "无法删除唯一配置",
    exportedProfiles: "已导出 {n} 个配置",
    importedProfiles: "已导入: {n} 个配置",
    invalidJsonFormat: "无效的 JSON 格式 (需要配置列表)",
    emptyProfilesFile: "文件中未包含配置",
    importError: "导入错误: {msg}",
    autoRotateEnabled: "自动轮询已开启",
    autoRotateDisabled: "自动轮询已关闭",
    templateSelected: "已选择预设: {name}",
    profileSaved: "配置已保存",
    cacheCleared: "缓存已清除",
    testingApi: "正在测试 API 连接...",
    bgServiceError: "后台服务异常",
    apiAvailable: "API 连接正常 (HTTP {status})",
    apiUnavailable: "API 不可用: {err}",
    tabNotFound: "未找到活动标签页",
    reloadPagePrompt: "请刷新页面以加载翻译脚本",
    translationStarted: "页面翻译已启动",
    nodesRestored: "已还原节点: {n}",
    translatingPage: "正在翻译页面...",
    pageTranslated: "页面已翻译 ({n} 个节点)",
    viewLogsLink: "📄 查看日志文件",
    downloadLogsBtn: "导出",
    noLogs: "暂无日志\n",

    // Provider Key Placeholders
    keyGemini: "AIzaSy... (Google AI Studio)",
    keyDeepSeek: "sk-... (DeepSeek 平台密钥)",
    keyOpenAI: "sk-proj-... (OpenAI 密钥)",
    keyGroq: "gsk_... (Groq 控制台密钥)",
    keyOpenRouter: "sk-or-v1-... (OpenRouter 密钥)",
    keyAnthropic: "sk-ant-... (Anthropic 密钥)",
    keyMistral: "Mistral 控制台 API 密钥",
    keyOllama: "无需密钥 (本地服务)",
    keyLmstudio: "无需密钥 (本地服务)",
    keyDefault: "sk-... 或 API 密钥",

    // In-Page Floating Widget
    widgetOriginal: "原文",
    widgetOriginalWithLang: "原文 ({lang})",
    widgetActionBtnTitleDone: "还原网页原文",
    widgetActionBtnTitleIdle: "翻译页面",
    widgetRefreshBtnTitle: "刷新页面翻译",
    widgetCloseBtnTitle: "隐藏悬浮条",
    widgetTranslating: "翻译中 {curr}/{total}...",
    widgetRotated: "🔄 限流切换: {target}",
    widgetRefreshed: "✓ 已更新",
    widgetTranslateTo: "翻译 ({lang})",
    widgetNoText: "未找到文本",
    widgetApiError: "API 错误",
    widgetConnectError: "连接错误"
  }
};

/**
 * Resolves current browser UI language.
 * Defaults to "ru" if system is Russian/Belarusian/Ukrainian,
 * "zh" if Chinese, otherwise falls back to "en".
 */
function getBrowserLang() {
  let lang = "";
  try {
    if (typeof chrome !== "undefined" && chrome.i18n && typeof chrome.i18n.getUILanguage === "function") {
      lang = chrome.i18n.getUILanguage();
    } else if (typeof navigator !== "undefined") {
      lang = navigator.language || (navigator.languages && navigator.languages[0]) || "";
    }
  } catch (e) {}

  const code = (lang || "").toLowerCase().split(/[-_]/)[0];
  if (code === "ru" || code === "be" || code === "uk") return "ru";
  if (code === "zh") return "zh";
  return "en";
}

const currentLang = getBrowserLang();

/**
 * Returns translated string for given key, replacing {param} placeholders.
 */
function t(key, params = {}) {
  const dict = I18N_DICTIONARIES[currentLang] || I18N_DICTIONARIES.en;
  let text = dict[key];
  if (text === undefined) {
    text = I18N_DICTIONARIES.en[key] !== undefined ? I18N_DICTIONARIES.en[key] : (I18N_DICTIONARIES.ru[key] || key);
  }
  if (typeof text === "string" && params && typeof params === "object") {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return text;
}

/**
 * Translates all marked elements inside root DOM node.
 */
function localizeDOM(root = document) {
  if (!root) return;

  // Localize text content
  const textElements = root.querySelectorAll("[data-i18n]");
  for (const el of textElements) {
    const key = el.getAttribute("data-i18n");
    if (key) {
      el.textContent = t(key);
    }
  }

  // Localize placeholder attributes
  const placeholderElements = root.querySelectorAll("[data-i18n-placeholder]");
  for (const el of placeholderElements) {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key) {
      el.placeholder = t(key);
    }
  }

  // Localize title attributes
  const titleElements = root.querySelectorAll("[data-i18n-title]");
  for (const el of titleElements) {
    const key = el.getAttribute("data-i18n-title");
    if (key) {
      el.title = t(key);
    }
  }

  // Localize select options
  const optionElements = root.querySelectorAll("option[data-i18n-opt]");
  for (const opt of optionElements) {
    const key = opt.getAttribute("data-i18n-opt");
    if (key) {
      opt.textContent = t(key);
    }
  }

  if (typeof document !== "undefined" && root === document && document.documentElement) {
    document.documentElement.lang = currentLang;
  }
}

const I18N = {
  getBrowserLang,
  get currentLang() {
    return currentLang;
  },
  t,
  localizeDOM,
  DICTIONARIES: I18N_DICTIONARIES
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = I18N;
}
