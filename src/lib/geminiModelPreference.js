import {
  DEFAULT_GEMINI_MODEL_ID,
  isValidGeminiModelId
} from "@shared/gemini-models.js";

const STORAGE_KEY = "ielts-gemini-model";

export function getGeminiModelId() {
  if (typeof localStorage === "undefined") {
    return DEFAULT_GEMINI_MODEL_ID;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  return isValidGeminiModelId(stored) ? stored : DEFAULT_GEMINI_MODEL_ID;
}

export function setGeminiModelId(modelId) {
  const resolvedId = isValidGeminiModelId(modelId) ? modelId : DEFAULT_GEMINI_MODEL_ID;

  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, resolvedId);
  }

  return resolvedId;
}
