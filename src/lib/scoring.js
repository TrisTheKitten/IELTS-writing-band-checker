import {
  API_ENDPOINT,
  DEFAULT_FEEDBACK_LANGUAGE,
  FEATURE_FLAG_IDS,
  FEATURE_FLAGS,
  getEffectiveFeatureFlags,
  isFeatureEnabled,
  USER_TOGGLEABLE_FEATURE_FLAGS,
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
  getEffectiveFeatureFlags,
  USER_TOGGLEABLE_FEATURE_FLAGS,
  MAX_ESSAY_LENGTH,
  MAX_SCORE,
  MIN_ESSAY_LENGTH,
  SCORE_STEP,
  TASK_TYPE_OPTIONS,
  TASK_TYPES,
  isTask1
};

const WORD_BOUNDARY_PATTERN = /\s+/;

export const WRITING_CRITERIA = [
  { key: "taskResponse", label: "TR", title: "Task response" },
  { key: "coherenceCohesion", label: "CC", title: "Coherence" },
  { key: "lexicalResource", label: "LR", title: "Lexical resource" },
  { key: "grammarAccuracy", label: "GRA", title: "Grammar" }
];

export const EMPTY_RESULT = {
  overall: 0,
  taskResponse: 0,
  coherenceCohesion: 0,
  lexicalResource: 0,
  grammarAccuracy: 0,
  summary: "",
  criteria: [],
  corrections: [],
  improvedVocabulary: [],
  task1Checklist: [],
  structureCoach: null
};

export const DEFAULT_FEATURE_FLAGS = [
  "aiReasoning",
  "detailedFeedback",
  "improveWordChoice"
];

export const DEFAULT_OPTIONS = {
  taskType: TASK_TYPES[0],
  examMode: false,
  featureFlags: [...DEFAULT_FEATURE_FLAGS]
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

function normalizeChecklistItem(item) {
  if (!item || typeof item.met !== "boolean") {
    return null;
  }

  const id = item.id || item.name;
  const label = item.label || item.name;

  if (!id || !label) {
    return null;
  }

  return {
    id,
    label,
    met: item.met,
    note: item.note || ""
  };
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
        : [],
    task1Checklist:
      isFeatureEnabled(flags, "task1Checklist") && Array.isArray(payload.task1Checklist)
        ? payload.task1Checklist.map(normalizeChecklistItem).filter(Boolean)
        : [],
    structureCoach:
      isFeatureEnabled(flags, "structureCoach") && payload.structureCoach?.sections
        ? {
            sections: payload.structureCoach.sections.map(normalizeChecklistItem).filter(Boolean)
          }
        : null
  };
}

export function getSubmitState({ essay, taskType, questionImage, isChecking }) {
  if (isChecking) {
    return {
      canSubmit: false,
      blockReason: null,
      showMinLengthHint: false,
      showTask1ImageHint: false
    };
  }

  const trimmed = String(essay || "").trim();
  const taskUsesQuestionImage = isTask1(taskType);
  const hasQuestionImage = Boolean(questionImage?.base64);
  const meetsMinLength = trimmed.length >= MIN_ESSAY_LENGTH;

  let blockReason = null;

  if (!meetsMinLength) {
    blockReason = `Write at least ${MIN_ESSAY_LENGTH} characters before checking.`;
  } else if (taskUsesQuestionImage && !hasQuestionImage) {
    blockReason = "Upload the Task 1 question image before checking.";
  }

  const canSubmit = meetsMinLength && (!taskUsesQuestionImage || hasQuestionImage);

  return {
    canSubmit,
    blockReason,
    showMinLengthHint: trimmed.length > 0 && trimmed.length < MIN_ESSAY_LENGTH,
    showTask1ImageHint: taskUsesQuestionImage && !hasQuestionImage && meetsMinLength
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

export function getSubmitBlockReason(submitArgs) {
  return getSubmitState(submitArgs).blockReason;
}
