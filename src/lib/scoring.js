import {
  API_ENDPOINT,
  DEFAULT_FEEDBACK_LANGUAGE,
  FEATURE_FLAG_IDS,
  FEATURE_FLAGS,
  isFeatureEnabled,
  isTask1,
  MAX_ESSAY_LENGTH,
  MAX_SCORE,
  MIN_ESSAY_LENGTH,
  parseFeatureFlags,
  SCORE_STEP,
  snapToHalfBand,
  TASK_TYPE_OPTIONS,
  TASK_TYPES
} from "@shared/ielts-contract.js";

export {
  API_ENDPOINT,
  DEFAULT_FEEDBACK_LANGUAGE,
  FEATURE_FLAG_IDS,
  FEATURE_FLAGS,
  MAX_ESSAY_LENGTH,
  MAX_SCORE,
  MIN_ESSAY_LENGTH,
  SCORE_STEP,
  TASK_TYPE_OPTIONS,
  TASK_TYPES,
  isTask1
};

const WORD_BOUNDARY_PATTERN = /\s+/;

export const EMPTY_RESULT = {
  overall: 0,
  taskResponse: 0,
  coherenceCohesion: 0,
  lexicalResource: 0,
  grammarAccuracy: 0,
  summary: "",
  criteria: [],
  corrections: [],
  improvedVocabulary: []
};

export const DEFAULT_OPTIONS = {
  taskType: TASK_TYPES[0],
  featureFlags: [...FEATURE_FLAG_IDS]
};

export async function readJsonPayload(response) {
  const responseText = await response.text();

  if (!responseText.trim()) {
    throw new Error("Server returned an empty response. Restart the dev server and try again.");
  }

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error("Server returned an invalid response. Try again.");
  }
}

export function normalizeResult(payload, enabledFlags = FEATURE_FLAG_IDS) {
  const flags = parseFeatureFlags(enabledFlags);

  return {
    overall: normalizeScore(payload.overall),
    taskResponse: normalizeScore(payload.taskResponse),
    coherenceCohesion: normalizeScore(payload.coherenceCohesion),
    lexicalResource: normalizeScore(payload.lexicalResource),
    grammarAccuracy: normalizeScore(payload.grammarAccuracy),
    summary: isFeatureEnabled(flags, "aiReasoning") ? payload.summary || "" : "",
    criteria:
      isFeatureEnabled(flags, "detailedFeedback") && Array.isArray(payload.criteria)
        ? payload.criteria
        : [],
    corrections:
      isFeatureEnabled(flags, "improveWordChoice") && Array.isArray(payload.corrections)
        ? payload.corrections
        : [],
    improvedVocabulary:
      isFeatureEnabled(flags, "improveWordChoice") && Array.isArray(payload.improvedVocabulary)
        ? payload.improvedVocabulary
        : []
  };
}

export function normalizeScore(score) {
  return snapToHalfBand(score);
}

export function formatScore(score) {
  return normalizeScore(score).toFixed(1).replace(".0", "");
}

export function formatScoreRange(score) {
  const center = normalizeScore(score);
  const low = formatScore(Math.max(0, center - SCORE_STEP));
  const high = formatScore(Math.min(MAX_SCORE, center + SCORE_STEP));
  return `${low}–${high}`;
}

export function countWords(value) {
  return value.trim() ? value.trim().split(WORD_BOUNDARY_PATTERN).length : 0;
}

export function getSubmitBlockReason({ essay, taskType, questionImage, isChecking }) {
  if (isChecking) {
    return null;
  }

  const trimmed = String(essay || "").trim();

  if (trimmed.length < MIN_ESSAY_LENGTH) {
    return `Write at least ${MIN_ESSAY_LENGTH} characters before checking.`;
  }

  if (isTask1(taskType) && !questionImage?.base64) {
    return "Upload the Task 1 question image before checking.";
  }

  return null;
}
