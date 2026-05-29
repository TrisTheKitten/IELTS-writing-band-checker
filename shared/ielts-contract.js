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

export const TASK_TYPE_SLUGS = {
  [TASK_TYPES[0]]: "task2",
  [TASK_TYPES[1]]: "task1-academic",
  [TASK_TYPES[2]]: "task1-general"
};

export function taskTypeToSlug(taskType) {
  return TASK_TYPE_SLUGS[taskType] || "writing";
}

export const TASK_TYPE_OPTIONS = [
  { value: TASK_TYPES[0], label: "Task 2", hint: "Essay" },
  { value: TASK_TYPES[1], label: "Task 1", hint: "Academic" },
  { value: TASK_TYPES[2], label: "Task 1", hint: "General" }
];

export const TASK_1_PATTERN = /task 1/i;

export function isTask1(taskType) {
  return TASK_1_PATTERN.test(String(taskType || ""));
}

export function isTask1Academic(taskType) {
  return String(taskType || "").includes("(Academic)");
}

export function isTask2(taskType) {
  return !isTask1(taskType);
}

export const QUESTION_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
export const MAX_QUESTION_IMAGE_BYTES = 4 * 1024 * 1024;
export const ACCEPTED_QUESTION_IMAGE_MIME_TYPES = new Set(
  QUESTION_IMAGE_ACCEPT.split(",")
);

export const EXAM_DURATION_MS = {
  task2: 40 * 60 * 1000,
  task1: 20 * 60 * 1000
};

export const WORD_BAND_LEVELS = ["red", "amber", "green"];

export const WORD_BAND_THRESHOLDS = {
  task2: [
    { max: 239, level: "red", label: "Well under length" },
    { max: 249, level: "amber", label: "Almost at minimum" },
    { max: 320, level: "green", label: "Good length" },
    { max: 380, level: "amber", label: "Getting long" },
    { max: Infinity, level: "red", label: "Too long" }
  ],
  task1: [
    { max: 139, level: "red", label: "Well under length" },
    { max: 149, level: "amber", label: "Almost at minimum" },
    { max: 200, level: "green", label: "Good length" },
    { max: 250, level: "amber", label: "Getting long" },
    { max: Infinity, level: "red", label: "Too long" }
  ]
};

export const TASK1_CHECKLIST_ACADEMIC_ITEMS = [
  { id: "overview", prompt: "overview paragraph present and accurate" },
  { id: "trendsCompared", prompt: "key trends or stages are compared with data" },
  { id: "noOpinion", prompt: "no personal opinion or speculation beyond the data" }
];

export const TASK1_CHECKLIST_GENERAL_ITEMS = [
  { id: "purposeClear", prompt: "purpose of the letter is clear in the opening" },
  {
    id: "toneAppropriate",
    prompt: "tone matches the situation (formal/semi-formal as required)"
  },
  { id: "bulletsAddressed", prompt: "every bullet point in the prompt is covered" },
  { id: "closingFit", prompt: "closing and sign-off fit the situation" }
];

export const TASK1_CHECKLIST_ACADEMIC_IDS = TASK1_CHECKLIST_ACADEMIC_ITEMS.map((item) => item.id);

export const TASK1_CHECKLIST_GENERAL_IDS = TASK1_CHECKLIST_GENERAL_ITEMS.map((item) => item.id);

export const STRUCTURE_COACH_SECTIONS = [
  "Introduction",
  "Body1",
  "Body2",
  "Conclusion"
];

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
  },
  {
    id: "task1Checklist",
    label: "Task 1 checklist",
    description: "Diagnostic checklist for Task 1 (overview, trends, or letter requirements)."
  },
  {
    id: "structureCoach",
    label: "Essay structure",
    description: "Diagnostic checklist for Task 2 intro, body paragraphs, and conclusion."
  }
];

export const FEATURE_FLAG_IDS = FEATURE_FLAGS.map((flag) => flag.id);

export const TASK_BOUND_FEATURE_FLAG_IDS = ["task1Checklist", "structureCoach"];

export const USER_TOGGLEABLE_FEATURE_FLAGS = FEATURE_FLAGS.filter(
  (flag) => !TASK_BOUND_FEATURE_FLAG_IDS.includes(flag.id)
);

export const DEFAULT_FEEDBACK_LANGUAGE = "English (UK)";

const FEATURE_FLAG_ID_SET = new Set(FEATURE_FLAG_IDS);

export function parseFeatureFlags(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.filter((flag) => FEATURE_FLAG_ID_SET.has(flag));
}

export function getTaskBoundFeatureFlag(taskType) {
  return isTask1(taskType) ? "task1Checklist" : "structureCoach";
}

export function getEffectiveFeatureFlags(taskType, selectedFlags) {
  const userFlags = parseFeatureFlags(selectedFlags).filter(
    (flag) => !TASK_BOUND_FEATURE_FLAG_IDS.includes(flag)
  );

  return [...userFlags, getTaskBoundFeatureFlag(taskType)];
}

export function isFeatureEnabled(flags, flagId) {
  return parseFeatureFlags(flags).includes(flagId);
}

export function getWordBandThresholds(taskType) {
  return isTask1(taskType) ? WORD_BAND_THRESHOLDS.task1 : WORD_BAND_THRESHOLDS.task2;
}

export function getWordBandStatus(taskType, wordCount) {
  const count = Number(wordCount);

  if (!Number.isFinite(count) || count < 0) {
    return { level: "red", label: "Well under length", wordCountOk: false };
  }

  const thresholds = getWordBandThresholds(taskType);
  const match =
    thresholds.find((band) => count <= band.max) || thresholds[thresholds.length - 1];

  return {
    level: match.level,
    label: match.label,
    wordCountOk: match.level === "green"
  };
}

export function buildTask1ChecklistPromptLines(taskType) {
  if (!isTask1(taskType)) {
    return [];
  }

  const items = isTask1Academic(taskType)
    ? TASK1_CHECKLIST_ACADEMIC_ITEMS
    : TASK1_CHECKLIST_GENERAL_ITEMS;

  return [
    "Return task1Checklist as an array with exactly these items (id, label, met boolean, short note):",
    ...items.map((item) => `${item.id} — ${item.prompt};`),
    "Do not include word count; the app handles that separately."
  ];
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
