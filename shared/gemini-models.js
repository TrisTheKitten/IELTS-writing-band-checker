export const DEFAULT_GEMINI_MODEL_ID = "gemini-3.1-flash-lite";

export const GEMINI_THINKING_LEVEL_LOW = "low";
export const GEMINI_THINKING_LEVEL_MEDIUM = "medium";

export const GEMINI_MODEL_OPTIONS = [
  {
    id: "gemini-3.1-flash-lite",
    label: "Flash Lite",
    shortLabel: "Lite",
    menuHint: "Fast · Lowest cost",
    tooltip:
      "Usually ready in a few seconds. Lowest API cost per check. Best for quick practice when you want fast feedback."
  },
  {
    id: "gemini-3.5-flash",
    label: "Flash",
    shortLabel: "Flash",
    thinkingLevel: GEMINI_THINKING_LEVEL_LOW,
    menuHint: "Balanced · Medium cost",
    tooltip:
      "Typically under 15 seconds. Good balance of band accuracy and cost. Recommended for most essays."
  },
  {
    id: "gemini-3.1-pro",
    label: "Pro",
    shortLabel: "Pro",
    thinkingLevel: GEMINI_THINKING_LEVEL_MEDIUM,
    menuHint: "Slowest · Highest cost",
    tooltip:
      "Can take 30 seconds or more. Highest API cost. Use when you want the most careful band judgement."
  }
];

export const GEMINI_MODEL_MENU_INTRO =
  "Models differ in wait time, API cost, and feedback depth.";

export const GEMINI_MODEL_TRIGGER_TOOLTIP =
  "Choose which Gemini model scores your essay. Open the menu to compare speed, cost, and quality.";

const GEMINI_MODEL_ID_SET = new Set(GEMINI_MODEL_OPTIONS.map((option) => option.id));

export function isValidGeminiModelId(id) {
  return GEMINI_MODEL_ID_SET.has(String(id || "").trim());
}

export function getGeminiModelOption(id) {
  const resolvedId = isValidGeminiModelId(id) ? String(id).trim() : DEFAULT_GEMINI_MODEL_ID;
  return GEMINI_MODEL_OPTIONS.find((option) => option.id === resolvedId) || GEMINI_MODEL_OPTIONS[0];
}

export function getGeminiThinkingConfig(modelId) {
  const { thinkingLevel } = getGeminiModelOption(modelId);
  if (!thinkingLevel) {
    return null;
  }
  return { thinkingLevel };
}

export function resolveGeminiModel({ clientModel, envModel }) {
  const client = String(clientModel || "").trim();
  if (client && isValidGeminiModelId(client)) {
    return client;
  }

  const env = String(envModel || "").trim();
  if (env && isValidGeminiModelId(env)) {
    return env;
  }

  return DEFAULT_GEMINI_MODEL_ID;
}
