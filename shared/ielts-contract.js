export const API_ENDPOINT = "/api/check-writing";

export const MIN_ESSAY_LENGTH = 120;
export const MAX_ESSAY_LENGTH = 12000;
export const MAX_PROMPT_LENGTH = 1000;

export const MAX_SCORE = 9;
export const SCORE_STEP = 0.5;

export const TASK_TYPES = [
  "IELTS Writing Task 2",
  "IELTS Writing Task 1 (Academic)",
  "IELTS Writing Task 1 (General)"
];

export const TASK_TYPE_OPTIONS = [
  { value: TASK_TYPES[0], label: "Task 2", hint: "Essay" },
  { value: TASK_TYPES[1], label: "Task 1", hint: "Academic" },
  { value: TASK_TYPES[2], label: "Task 1", hint: "General" }
];

export const TASK_1_PATTERN = /task 1/i;

export function isTask1(taskType) {
  return TASK_1_PATTERN.test(String(taskType || ""));
}

export const QUESTION_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
export const MAX_QUESTION_IMAGE_BYTES = 4 * 1024 * 1024;
export const ACCEPTED_QUESTION_IMAGE_MIME_TYPES = new Set(
  QUESTION_IMAGE_ACCEPT.split(",")
);

export const FEATURE_FLAGS = [
  {
    id: "aiReasoning",
    label: "Band summary",
    description: "A short note on why your overall band was estimated."
  },
  {
    id: "improveWordChoice",
    label: "Wording fixes",
    description: "Grammar corrections and stronger word choices in your essay."
  },
  {
    id: "detailedFeedback",
    label: "Criteria breakdown",
    description: "Notes and bullet points for Task response, Coherence, Lexical resource, and Grammar."
  }
];

export const FEATURE_FLAG_IDS = FEATURE_FLAGS.map((flag) => flag.id);

export const DEFAULT_FEEDBACK_LANGUAGE = "English (UK)";

const FEATURE_FLAG_ID_SET = new Set(FEATURE_FLAG_IDS);

export function parseFeatureFlags(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.filter((flag) => FEATURE_FLAG_ID_SET.has(flag));
}

export function isFeatureEnabled(flags, flagId) {
  return parseFeatureFlags(flags).includes(flagId);
}

export function featureFlagLabel(flagId) {
  return FEATURE_FLAGS.find((flag) => flag.id === flagId)?.label || flagId;
}

export function enabledFeatureLabels(flagIds) {
  return parseFeatureFlags(flagIds).map(featureFlagLabel);
}

export function snapToHalfBand(score) {
  const numericScore = Number(score);

  if (Number.isNaN(numericScore)) {
    return 0;
  }

  const clamped = Math.max(0, Math.min(MAX_SCORE, numericScore));
  return Math.round(clamped * 2) / 2;
}

export function normalizeQuestionImage(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const mimeType = String(value.mimeType || "").trim();
  const base64 = String(value.base64 || "").trim();

  if (!mimeType || !base64 || !ACCEPTED_QUESTION_IMAGE_MIME_TYPES.has(mimeType)) {
    return null;
  }

  const estimatedBytes = Math.floor((base64.length * 3) / 4);

  if (estimatedBytes > MAX_QUESTION_IMAGE_BYTES) {
    return null;
  }

  return { mimeType, base64 };
}
