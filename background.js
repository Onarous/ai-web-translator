try {
  importScripts("config.js");
} catch (e) {
  // Ignore in environments where importScripts is not available
}

const DEFAULT_API_URL = typeof DEFAULT_CONFIG !== "undefined" ? DEFAULT_CONFIG.apiUrl : "http://localhost:8045/v1/chat/completions";
const DEFAULT_MODEL = typeof DEFAULT_CONFIG !== "undefined" ? DEFAULT_CONFIG.model : "gemini-3.8-flash-low";
const DEFAULT_API_KEY = typeof DEFAULT_CONFIG !== "undefined" ? DEFAULT_CONFIG.apiKey : "";
const DEFAULT_SOURCE_LANG = typeof DEFAULT_CONFIG !== "undefined" ? (DEFAULT_CONFIG.sourceLang || "auto") : "auto";
const DEFAULT_TARGET_LANG = typeof DEFAULT_CONFIG !== "undefined" ? (DEFAULT_CONFIG.targetLang || "ru") : "ru";
const LOGGER_ENDPOINT = "http://127.0.0.1:8046/log";

const LANG_NAMES = {
  zh: "Chinese",
  ru: "Russian",
  en: "English",
  ja: "Japanese",
  ko: "Korean",
  de: "German",
  fr: "French",
  es: "Spanish",
  it: "Italian",
  auto: "the original web page language"
};

function buildSystemPrompt(sourceLang = "zh", targetLang = "ru") {
  const srcName = LANG_NAMES[sourceLang] || sourceLang;
  const tgtName = LANG_NAMES[targetLang] || targetLang;

  const prompt = [
    `You are a professional ${srcName} to ${tgtName} translator for web pages.`,
    `Translate each text string in the input JSON array into natural, fluent ${tgtName}.`,
    "Maintain the exact tone, terminology, and formatting tags/placeholders if any.",
    `UI CONCISENESS & COMPACTNESS: For buttons, navigation menus, tags, badges, and table headers (short strings under 15 characters), keep ${tgtName} translations VERY SHORT and compact (1-2 words max) to preserve web layout and prevent buttons from overflowing.`,
    "CRITICAL REQUIREMENT: Output ONLY a valid JSON array of strings in the exact same length and order as the input array.",
    "Do NOT include markdown formatting, explanations, keys, or code blocks."
  ];
  return prompt.join(" ");
}

/**
 * Sends masked log entries to the local file logger (http://127.0.0.1:8046/log)
 * and persists to chrome.storage.local for popup access.
 */
function writeLog(level, tag, message, meta = {}) {
  const timestamp = new Date().toISOString();
  fetch(LOGGER_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timestamp, level, tag, message, meta })
  }).catch(() => {});

  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get({ logs: [] }, (res) => {
      const logs = res.logs || [];
      logs.push({ timestamp, level, tag, message, meta });
      if (logs.length > 100) logs.shift();
      chrome.storage.local.set({ logs });
    });
  }
}

/**
 * Strips markdown code fences from LLM output if present.
 * @param {string} raw
 * @returns {string}
 */
function cleanJsonOutput(raw) {
  const trimmed = raw.trim();
  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }
  return trimmed;
}

const MAX_CACHE_SIZE = 5000;
const translationCache = new Map();
let isCacheLoaded = false;
let saveCacheDebounce = null;

/**
 * Loads cached translations from chrome.storage.local into in-memory Map.
 */
async function loadCache() {
  if (isCacheLoaded) return;
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    try {
      const res = await new Promise((resolve) => {
        chrome.storage.local.get({ translation_cache: {} }, resolve);
      });
      const entries = Object.entries(res.translation_cache || {});
      for (const [k, v] of entries) {
        if (typeof k === "string" && typeof v === "string") {
          translationCache.set(k, v);
        }
      }
      isCacheLoaded = true;
      writeLog("INFO", "CACHE_INIT", `Loaded ${translationCache.size} translation pairs from storage`);
    } catch (e) {
      isCacheLoaded = true;
    }
  } else {
    isCacheLoaded = true;
  }
}

/**
 * Debounced persistence of translationCache to chrome.storage.local.
 */
function scheduleSaveCache() {
  if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) return;
  clearTimeout(saveCacheDebounce);
  saveCacheDebounce = setTimeout(() => {
    while (translationCache.size > MAX_CACHE_SIZE) {
      const oldestKey = translationCache.keys().next().value;
      translationCache.delete(oldestKey);
    }
    const obj = {};
    for (const [k, v] of translationCache.entries()) {
      obj[k] = v;
    }
    chrome.storage.local.set({ translation_cache: obj }, () => {
      writeLog("DEBUG", "CACHE_SAVED", `Persisted ${translationCache.size} entries to storage`);
    });
  }, 1000);
}

/**
 * Executes direct network request to local AI API for an array of unique strings.
 * @param {string[]} texts
 * @param {string} apiUrl
 * @param {string} model
 * @param {string} apiKey
 * @returns {Promise<string[]>}
 */
async function requestAiTranslation(texts, apiUrl, model, apiKey, sourceLang = DEFAULT_SOURCE_LANG, targetLang = DEFAULT_TARGET_LANG) {
  if (!Array.isArray(texts) || texts.length === 0) return [];

  const endpoint = apiUrl || DEFAULT_API_URL;
  let targetModel = model || DEFAULT_MODEL;
  if (endpoint.includes("generativelanguage.googleapis.com")) {
    if (!model || model === "gemini-2.0-flash" || model === "gemini-3.8-flash-low") {
      targetModel = "gemini-3.5-flash-lite";
    }
  }
  const key = apiKey !== undefined ? apiKey : DEFAULT_API_KEY;
  const srcLang = sourceLang || DEFAULT_SOURCE_LANG;
  const tgtLang = targetLang || DEFAULT_TARGET_LANG;
  const startTime = Date.now();
  const totalChars = texts.reduce((acc, t) => acc + (t ? t.length : 0), 0);

  writeLog("INFO", "BATCH_REQ", `Sending batch to AI (${texts.length} unique nodes, ${totalChars} chars, ${srcLang}->${tgtLang})`, {
    model: targetModel,
    endpoint,
    sourceLang: srcLang,
    targetLang: tgtLang,
    nodeCount: texts.length,
    inputSample: texts.slice(0, 3)
  });

  const systemPrompt = buildSystemPrompt(srcLang, tgtLang);

  const isAnthropic = endpoint.includes("anthropic.com");
  const headers = {
    "Content-Type": "application/json"
  };
  let requestBody;

  if (isAnthropic) {
    if (key) headers["x-api-key"] = key;
    headers["anthropic-version"] = "2023-06-01";
    requestBody = {
      model: targetModel || "claude-3-5-haiku-20241022",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { role: "user", content: JSON.stringify(texts) }
      ]
    };
  } else {
    if (key) {
      headers["Authorization"] = `Bearer ${key}`;
    }
    requestBody = {
      model: targetModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(texts) }
      ],
      temperature: 0.1,
      stream: false
    };
  }

  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody)
    });
  } catch (networkErr) {
    writeLog("ERROR", "NETWORK", `Network connection to AI failed: ${networkErr.message}`, {
      endpoint,
      model: targetModel
    });
    throw networkErr;
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    writeLog("ERROR", "API_RES", `AI server returned HTTP ${response.status}`, {
      status: response.status,
      errorBody: errText
    });
    const err = new Error(`AI API error (${response.status}): ${errText || response.statusText}`);
    err.status = response.status;
    err.errorBody = errText;
    throw err;
  }

  const data = await response.json();
  const rawContent = isAnthropic
    ? data?.content?.[0]?.text
    : data?.choices?.[0]?.message?.content;
  if (typeof rawContent !== "string") {
    writeLog("ERROR", "PARSE", "Response missing text content", { rawData: data });
    throw new Error("Invalid response structure from AI API: missing message content");
  }

  const cleaned = cleanJsonOutput(rawContent);
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (parseErr) {
    writeLog("ERROR", "JSON_PARSE", `Failed to parse AI JSON: ${parseErr.message}`, {
      rawOutputPreview: rawContent.slice(0, 300)
    });
    console.error("[LocalAI Translator] JSON parse failure on output:", rawContent);
    throw new Error(`Failed to parse AI JSON response: ${parseErr.message}`);
  }

  if (!Array.isArray(parsed)) {
    writeLog("ERROR", "STRUCTURE", "AI output was not a JSON array", { parsedType: typeof parsed });
    throw new Error("AI output was not a JSON array");
  }

  if (parsed.length !== texts.length) {
    writeLog("WARN", "ALIGNMENT", `Array size mismatch: expected ${texts.length}, got ${parsed.length}. Performing fallback alignment.`, {
      expected: texts.length,
      received: parsed.length
    });
    const adjusted = [];
    for (let i = 0; i < texts.length; i++) {
      adjusted.push(typeof parsed[i] === "string" ? parsed[i] : (parsed[i] ? String(parsed[i]) : texts[i]));
    }
    parsed = adjusted;
  }

  const result = parsed.map((item, idx) => (typeof item === "string" ? item : (item ? String(item) : texts[idx])));
  const latencyMs = Date.now() - startTime;

  const pairs = texts.map((zh, idx) => ({
    zh,
    ru: result[idx],
    leadingLen: (zh.match(/^\s*/) || [""])[0].length,
    trailingLen: (zh.match(/\s*$/) || [""])[0].length
  }));

  writeLog("INFO", "BATCH_DONE", `Batch translated successfully in ${latencyMs}ms (${result.length} unique nodes)`, {
    latencyMs,
    model: targetModel,
    usage: data?.usage || null,
    pairs
  });

  return result;
}

/**
 * Requests translation for a batch of strings, leveraging cache and deduplication.
 * @param {string[]} texts - Array of plain text strings in Chinese
 * @param {string} apiUrl - OpenAI-compatible endpoint URL
 * @param {string} model - Model identifier
 * @param {string} apiKey - Optional Bearer authentication token
 * @returns {Promise<string[]>} Translated Russian strings
 */
/**
 * Detects if an error is caused by rate limit or exhausted quota.
 */
function isQuotaOrRateLimitError(status, message = "", errorBody = "") {
  if (status === 429) return true;
  const combined = `${status} ${message} ${errorBody}`.toLowerCase();
  return (
    combined.includes("resource_exhausted") ||
    combined.includes("insufficient_quota") ||
    combined.includes("exceeded your current quota") ||
    combined.includes("rate limit") ||
    combined.includes("rate_limit") ||
    combined.includes("quota exceeded") ||
    combined.includes("out of credits") ||
    combined.includes("credit balance is too low") ||
    combined.includes("billing hard limit") ||
    combined.includes("free tier limit") ||
    combined.includes("too many requests")
  );
}

/**
 * Loads profiles and active profile configuration.
 */
async function getProfilesState() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      {
        profiles: [],
        activeProfileId: "",
        autoRotate: true,
        apiUrl: DEFAULT_API_URL,
        model: DEFAULT_MODEL,
        apiKey: DEFAULT_API_KEY,
        batchSize: 20
      },
      (res) => {
        let profiles = Array.isArray(res.profiles) ? res.profiles : [];
        if (profiles.length === 0) {
          const defaultProf = {
            id: "prof_default",
            name: "Основной профиль",
            apiUrl: res.apiUrl || DEFAULT_API_URL,
            model: res.model || DEFAULT_MODEL,
            apiKey: res.apiKey || DEFAULT_API_KEY,
            batchSize: res.batchSize || 20,
            enabled: true
          };
          profiles = [defaultProf];
          const activeId = defaultProf.id;
          chrome.storage.sync.set({ profiles, activeProfileId: activeId, autoRotate: res.autoRotate !== false });
          resolve({
            profiles,
            activeProfileId: activeId,
            autoRotate: res.autoRotate !== false,
            activeProfile: defaultProf
          });
          return;
        }

        let activeId = res.activeProfileId;
        let activeProf = profiles.find((p) => p.id === activeId);
        if (!activeProf) {
          activeProf = profiles[0];
          activeId = activeProf.id;
        }

        resolve({
          profiles,
          activeProfileId: activeId,
          autoRotate: res.autoRotate !== false,
          activeProfile: activeProf
        });
      }
    );
  });
}

/**
 * Rotates to the next available profile and saves it to chrome.storage.sync.
 */
async function rotateToNextProfile(currentProfileId) {
  const state = await getProfilesState();
  const eligible = state.profiles.filter((p) => p.enabled !== false);
  if (eligible.length <= 1) {
    return null;
  }

  const currentIndex = eligible.findIndex((p) => p.id === currentProfileId);
  const nextIndex = (currentIndex + 1) % eligible.length;
  const nextProfile = eligible[nextIndex];

  if (!nextProfile || nextProfile.id === currentProfileId) {
    return null;
  }

  await new Promise((resolve) => {
    chrome.storage.sync.set(
      {
        activeProfileId: nextProfile.id,
        apiUrl: nextProfile.apiUrl,
        apiKey: nextProfile.apiKey,
        model: nextProfile.model,
        batchSize: nextProfile.batchSize
      },
      resolve
    );
  });

  writeLog("WARN", "PROFILE_ROTATION", `Rotated active profile to "${nextProfile.name}" (${nextProfile.model}) due to API limit`, {
    fromProfileId: currentProfileId,
    toProfileId: nextProfile.id,
    toProfileName: nextProfile.name,
    toModel: nextProfile.model
  });

  return nextProfile;
}

/**
 * Translates a batch of texts using cache with automatic failover rotation.
 */
async function translateBatch(texts, apiUrl, model, apiKey, sourceLang = DEFAULT_SOURCE_LANG, targetLang = DEFAULT_TARGET_LANG) {
  if (!Array.isArray(texts) || texts.length === 0) {
    return { translations: [], rotatedTo: null };
  }

  await loadCache();

  const srcLang = sourceLang || DEFAULT_SOURCE_LANG;
  const tgtLang = targetLang || DEFAULT_TARGET_LANG;
  const cachePrefix = `${srcLang}->${tgtLang}:`;

  const result = new Array(texts.length);
  const missingIndicesMap = new Map();
  let hitCount = 0;

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    const cacheKey = cachePrefix + text;
    if (translationCache.has(cacheKey)) {
      result[i] = translationCache.get(cacheKey);
      hitCount++;
    } else {
      if (!missingIndicesMap.has(text)) {
        missingIndicesMap.set(text, []);
      }
      missingIndicesMap.get(text).push(i);
    }
  }

  // 100% cache hit: return immediately without network call
  if (hitCount === texts.length) {
    writeLog("INFO", "CACHE_HIT", `All ${texts.length} nodes resolved from cache (${srcLang}->${tgtLang}, 0ms API latency, 0 quota spent)`);
    return { translations: result, rotatedTo: null };
  }

  const uniqueMissing = Array.from(missingIndicesMap.keys());
  writeLog("INFO", "CACHE_STATS", `Cache resolved ${hitCount}/${texts.length} nodes (${Math.round((hitCount / texts.length) * 100)}%). Sending ${uniqueMissing.length} unique missing texts to AI (${srcLang}->${tgtLang}).`);

  // Load profiles configuration for auto-rotation
  const profilesState = await getProfilesState();
  let currentApiUrl = apiUrl || profilesState.activeProfile?.apiUrl || DEFAULT_API_URL;
  let currentModel = model || profilesState.activeProfile?.model || DEFAULT_MODEL;
  let currentApiKey = apiKey !== undefined ? apiKey : profilesState.activeProfile?.apiKey;
  let currentProfileId = profilesState.activeProfileId;
  let rotatedToName = null;

  const maxAttempts = profilesState.autoRotate ? Math.max(1, profilesState.profiles.length) : 1;
  let aiTranslations = null;
  let lastError = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      aiTranslations = await requestAiTranslation(uniqueMissing, currentApiUrl, currentModel, currentApiKey, srcLang, tgtLang);
      break;
    } catch (err) {
      lastError = err;
      const isQuota = isQuotaOrRateLimitError(err.status, err.message, err.errorBody);
      if (profilesState.autoRotate && isQuota && attempt < maxAttempts - 1) {
        writeLog("WARN", "QUOTA_LIMIT", `API limit reached on ${currentModel}: ${err.message}. Rotating profile...`);
        const nextProfile = await rotateToNextProfile(currentProfileId);
        if (nextProfile) {
          currentProfileId = nextProfile.id;
          currentApiUrl = nextProfile.apiUrl;
          currentModel = nextProfile.model;
          currentApiKey = nextProfile.apiKey;
          rotatedToName = nextProfile.name;
          continue;
        }
      }
      throw err;
    }
  }

  if (!aiTranslations) {
    throw lastError || new Error("Translation failed across all available profiles");
  }

  for (let m = 0; m < uniqueMissing.length; m++) {
    const orig = uniqueMissing[m];
    const trans = aiTranslations[m] || orig;
    translationCache.set(cachePrefix + orig, trans);

    const indices = missingIndicesMap.get(orig);
    if (indices) {
      for (const idx of indices) {
        result[idx] = trans;
      }
    }
  }

  scheduleSaveCache();
  return { translations: result, rotatedTo: rotatedToName };
}

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "LOG_EVENT") {
    writeLog(message.level, message.tag, message.message, message.meta);
    sendResponse({ ok: true });
    return true;
  }

  if (message?.type === "TRANSLATE_BATCH") {
    translateBatch(message.texts, message.apiUrl, message.model, message.apiKey, message.sourceLang, message.targetLang)
      .then((res) => {
        const translations = Array.isArray(res) ? res : res.translations;
        const rotatedTo = res?.rotatedTo || null;
        sendResponse({ success: true, translations, rotatedTo });
      })
      .catch((err) => {
        writeLog("ERROR", "TRANSLATE", `Batch translation failed: ${err.message}`);
        console.error("[AI Translator] Batch translation error:", err);
        sendResponse({ success: false, error: err.message });
      });
    return true; // Keep channel open for async response
  }

  if (message?.type === "GET_PROFILES_STATE") {
    getProfilesState().then((state) => {
      sendResponse(state);
    });
    return true;
  }

  if (message?.type === "ROTATE_PROFILE_NOW") {
    rotateToNextProfile(message.currentProfileId).then((nextProf) => {
      sendResponse({ success: !!nextProf, profile: nextProf });
    });
    return true;
  }

  if (message?.type === "GET_CACHE_STATS") {
    loadCache().then(() => {
      sendResponse({ size: translationCache.size, maxSize: MAX_CACHE_SIZE });
    });
    return true;
  }

  if (message?.type === "CLEAR_CACHE") {
    translationCache.clear();
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.remove("translation_cache", () => {
        writeLog("INFO", "CACHE_CLEAR", "Translation cache cleared by user request");
        sendResponse({ success: true, size: 0 });
      });
    } else {
      writeLog("INFO", "CACHE_CLEAR", "Translation cache cleared");
      sendResponse({ success: true, size: 0 });
    }
    return true;
  }

  if (message?.type === "CHECK_CONNECTION") {
    const endpoint = message.apiUrl || DEFAULT_API_URL;
    const key = message.apiKey !== undefined ? message.apiKey : DEFAULT_API_KEY;
    let targetModel = message.model || DEFAULT_MODEL;
    if (endpoint.includes("generativelanguage.googleapis.com")) {
      if (!message.model || message.model === "gemini-2.0-flash" || message.model === "gemini-3.8-flash-low") {
        targetModel = "gemini-3.5-flash-lite";
      }
    }
    const headers = { "Content-Type": "application/json" };
    if (key) {
      headers["Authorization"] = `Bearer ${key}`;
    }
    writeLog("INFO", "API", `Checking connection to ${endpoint}`);

    if (endpoint.includes("anthropic.com")) {
      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key || "",
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: targetModel || "claude-3-5-haiku-20241022",
          max_tokens: 1,
          messages: [{ role: "user", content: "ping" }]
        })
      })
        .then(async (res) => {
          if (res.ok) {
            writeLog("INFO", "API", `Anthropic connection successful: HTTP ${res.status}`);
            sendResponse({ ok: true, status: res.status });
          } else {
            const errData = await res.json().catch(() => null);
            const errMsg = errData?.error?.message || `HTTP ${res.status}`;
            writeLog("WARN", "API", `Anthropic connection failed: ${errMsg}`);
            sendResponse({ ok: false, error: errMsg, status: res.status });
          }
        })
        .catch((err) => {
          writeLog("WARN", "API", `Anthropic connection check failed: ${err.message}`);
          sendResponse({ ok: false, error: err.message });
        });
      return true;
    }

    if (endpoint.includes("generativelanguage.googleapis.com")) {
      fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: targetModel,
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 1
        })
      })
        .then(async (res) => {
          if (res.ok) {
            writeLog("INFO", "API", `Gemini connection successful: HTTP ${res.status}`);
            sendResponse({ ok: true, status: res.status });
          } else {
            const errData = await res.json().catch(() => null);
            const errMsg = errData?.[0]?.error?.message || errData?.error?.message || `HTTP ${res.status}`;
            writeLog("WARN", "API", `Gemini connection failed: ${errMsg}`);
            sendResponse({ ok: false, error: errMsg, status: res.status });
          }
        })
        .catch((err) => {
          writeLog("WARN", "API", `Connection check failed: ${err.message}`);
          sendResponse({ ok: false, error: err.message });
        });
      return true;
    }

    fetch(endpoint.replace(/\/chat\/completions\/?$/, "/models"), { method: "GET", headers })
      .then((res) => {
        if (res.ok) {
          writeLog("INFO", "API", `Connection check successful: HTTP ${res.status}`);
          sendResponse({ ok: true, status: res.status });
        } else {
          fetch(endpoint, {
            method: "POST",
            headers,
            body: JSON.stringify({ model: targetModel, messages: [{ role: "user", content: "ping" }], max_tokens: 1 })
          })
            .then(async (r2) => {
              if (r2.ok) {
                sendResponse({ ok: true, status: r2.status });
              } else {
                const errText = await r2.text().catch(() => "");
                sendResponse({ ok: false, error: `HTTP ${r2.status}: ${errText.slice(0, 120)}` });
              }
            })
            .catch((e2) => sendResponse({ ok: false, error: e2.message }));
        }
      })
      .catch((err) => {
        writeLog("WARN", "API", `Connection check failed: ${err.message}`);
        sendResponse({ ok: false, error: err.message });
      });
    return true;
  }
});
