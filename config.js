// Default configuration for AI Translator
const DEFAULT_CONFIG = {
  apiUrl: "http://localhost:8045/v1/chat/completions",
  model: "gemini-3.8-flash-low",
  apiKey: "",
  batchSize: 20,
  sourceLang: "auto",
  targetLang: "ru"
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = DEFAULT_CONFIG;
}
