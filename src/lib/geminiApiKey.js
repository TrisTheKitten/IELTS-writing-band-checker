const STORAGE_KEY = "ielts-gemini-api-key";
const HEADER_NAME = "x-gemini-api-key";

export function getGeminiApiKey() {
  if (typeof sessionStorage === "undefined") {
    return "";
  }

  return sessionStorage.getItem(STORAGE_KEY) || "";
}

export function setGeminiApiKey(value) {
  const trimmed = String(value || "").trim();

  if (!trimmed) {
    clearGeminiApiKey();
    return;
  }

  sessionStorage.setItem(STORAGE_KEY, trimmed);
}

export function clearGeminiApiKey() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function hasGeminiApiKey() {
  return Boolean(getGeminiApiKey());
}

export function buildGeminiApiKeyHeaders() {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return {};
  }

  return { [HEADER_NAME]: apiKey };
}
