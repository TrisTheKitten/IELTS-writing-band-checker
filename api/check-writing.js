import {
  buildTask1ChecklistPromptLines,
  DEFAULT_FEEDBACK_LANGUAGE,
  enabledFeatureLabels,
  isTask1,
  isTask2,
  MAX_ESSAY_LENGTH,
  MAX_PROMPT_LENGTH,
  MIN_ESSAY_LENGTH,
  normalizeQuestionImage,
  parseFeatureFlags,
  isFeatureEnabled,
  STRUCTURE_COACH_SECTIONS,
  TASK_TYPES
} from "../shared/ielts-contract.js";

const GEMINI_API_VERSION = "v1beta";
const DEFAULT_GEMINI_MODEL = "gemini-3.1-flash-lite";
const GEMINI_API_KEY_HEADER = "x-gemini-api-key";
const GEMINI_ENDPOINT_BASE = "https://generativelanguage.googleapis.com";
const HTTP_METHOD = "POST";
const RESPONSE_TOKEN_LIMIT = 4096;
const TEMPERATURE = 0.2;

const CRITERION_ITEM_SCHEMA = {
  type: "OBJECT",
  properties: {
    name: { type: "STRING" },
    score: { type: "NUMBER" },
    description: { type: "STRING" },
    points: {
      type: "ARRAY",
      items: { type: "STRING" }
    }
  },
  required: ["name", "score", "description", "points"]
};

const CORRECTION_ITEM_SCHEMA = {
  type: "OBJECT",
  properties: {
    original: { type: "STRING" },
    revised: { type: "STRING" },
    reason: { type: "STRING" }
  },
  required: ["original", "revised", "reason"]
};

const VOCABULARY_ITEM_SCHEMA = {
  type: "OBJECT",
  properties: {
    original: { type: "STRING" },
    suggestion: { type: "STRING" },
    reason: { type: "STRING" }
  },
  required: ["original", "suggestion", "reason"]
};

const CORE_SCORE_PROPERTIES = {
  overall: { type: "NUMBER" },
  taskResponse: { type: "NUMBER" },
  coherenceCohesion: { type: "NUMBER" },
  lexicalResource: { type: "NUMBER" },
  grammarAccuracy: { type: "NUMBER" }
};

const CORE_SCORE_REQUIRED = [
  "overall",
  "taskResponse",
  "coherenceCohesion",
  "lexicalResource",
  "grammarAccuracy"
];

const TASK1_CHECKLIST_ITEM_SCHEMA = {
  type: "OBJECT",
  properties: {
    id: { type: "STRING" },
    label: { type: "STRING" },
    met: { type: "BOOLEAN" },
    note: { type: "STRING" }
  },
  required: ["id", "label", "met", "note"]
};

const STRUCTURE_COACH_SECTION_SCHEMA = {
  type: "OBJECT",
  properties: {
    name: { type: "STRING" },
    met: { type: "BOOLEAN" },
    note: { type: "STRING" }
  },
  required: ["name", "met", "note"]
};

export function buildResponseSchema(featureFlags, taskType = TASK_TYPES[0]) {
  const flags = parseFeatureFlags(featureFlags);
  const properties = { ...CORE_SCORE_PROPERTIES };
  const required = [...CORE_SCORE_REQUIRED];

  if (isFeatureEnabled(flags, "aiReasoning")) {
    properties.summary = { type: "STRING" };
    required.push("summary");
  }

  if (isFeatureEnabled(flags, "detailedFeedback")) {
    properties.criteria = {
      type: "ARRAY",
      items: CRITERION_ITEM_SCHEMA
    };
    required.push("criteria");
  }

  if (isFeatureEnabled(flags, "improveWordChoice")) {
    properties.corrections = {
      type: "ARRAY",
      items: CORRECTION_ITEM_SCHEMA
    };
    properties.improvedVocabulary = {
      type: "ARRAY",
      items: VOCABULARY_ITEM_SCHEMA
    };
    required.push("corrections", "improvedVocabulary");
  }

  if (isFeatureEnabled(flags, "task1Checklist") && isTask1(taskType)) {
    properties.task1Checklist = {
      type: "ARRAY",
      items: TASK1_CHECKLIST_ITEM_SCHEMA
    };
    required.push("task1Checklist");
  }

  if (isFeatureEnabled(flags, "structureCoach") && isTask2(taskType)) {
    properties.structureCoach = {
      type: "OBJECT",
      properties: {
        sections: {
          type: "ARRAY",
          items: STRUCTURE_COACH_SECTION_SCHEMA
        }
      },
      required: ["sections"]
    };
    required.push("structureCoach");
  }

  return {
    type: "OBJECT",
    properties,
    required
  };
}

export default async function handler(request, response) {
  if (request.method !== HTTP_METHOD) {
    return sendJson(response, 405, { error: "Use POST to check a writing score." });
  }

  const apiKey = resolveGeminiApiKey(request);

  if (!apiKey) {
    return sendJson(response, 500, {
      error: "Add a Gemini API key in Settings or set GEMINI_API_KEY on the server."
    });
  }

  const body = request.body || {};
  const essay = String(body.essay || "").trim();
  const topic = String(body.topic || "").trim();
  const taskType = String(body.taskType || "IELTS Writing Task 2");
  const aiLanguage = String(body.aiLanguage || DEFAULT_FEEDBACK_LANGUAGE);
  const featureFlags = parseFeatureFlags(body.featureFlags);
  const taskUsesQuestionImage = isTask1(taskType);
  const questionImage = normalizeQuestionImage(body.questionImage);

  if (essay.length < MIN_ESSAY_LENGTH) {
    return sendJson(response, 400, { error: `Enter at least ${MIN_ESSAY_LENGTH} characters before checking.` });
  }

  if (taskUsesQuestionImage && !questionImage) {
    return sendJson(response, 400, { error: "Upload the Task 1 question image before checking." });
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const endpoint = `${GEMINI_ENDPOINT_BASE}/${GEMINI_API_VERSION}/models/${model}:generateContent`;
  const geminiResponse = await fetch(endpoint, {
    method: HTTP_METHOD,
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: buildGeminiParts({
            essay: essay.slice(0, MAX_ESSAY_LENGTH),
            topic: topic.slice(0, MAX_PROMPT_LENGTH),
            taskType,
            aiLanguage,
            featureFlags,
            questionImage
          })
        }
      ],
      generationConfig: {
        temperature: TEMPERATURE,
        maxOutputTokens: RESPONSE_TOKEN_LIMIT,
        responseMimeType: "application/json",
        responseSchema: buildResponseSchema(featureFlags, taskType)
      }
    })
  });

  const geminiPayload = await readJsonResponse(geminiResponse);

  if (!geminiResponse.ok) {
    return sendJson(response, geminiResponse.status, {
      error: extractGeminiError(geminiPayload)
    });
  }

  try {
    const text = geminiPayload.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    return sendJson(response, 200, JSON.parse(text));
  } catch {
    return sendJson(response, 502, { error: "Gemini returned an unreadable score response." });
  }
}

function buildGeminiParts({ essay, topic, taskType, aiLanguage, featureFlags, questionImage }) {
  const parts = [];

  if (questionImage) {
    parts.push({
      inline_data: {
        mime_type: questionImage.mimeType,
        data: questionImage.base64
      }
    });
  }

  parts.push({
    text: buildPrompt({ essay, topic, taskType, aiLanguage, featureFlags, hasQuestionImage: Boolean(questionImage) })
  });

  return parts;
}

export function buildPrompt({ essay, topic, taskType, aiLanguage, featureFlags, hasQuestionImage }) {
  const flags = parseFeatureFlags(featureFlags);
  const lines = [
    "Act as a strict IELTS writing examiner.",
    "Return only valid JSON that matches the provided schema.",
    "Use IELTS public band descriptors for Task Response or Task Achievement, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy.",
    "Scores must be IELTS half-band values from 0 to 9.",
    "Keep feedback concise and practical for a student.",
    "Do not write sample essays, model answers, or rewritten full essays.",
    `Task type: ${taskType}`,
    `Feedback language: ${aiLanguage}`
  ];

  const enabledSections = enabledFeatureLabels(flags);

  if (enabledSections.length) {
    lines.push(`Include only these feedback sections: ${enabledSections.join(", ")}.`);
  } else {
    lines.push("Return band scores only. Omit narrative feedback, criteria breakdown, and word-choice suggestions.");
  }

  if (isFeatureEnabled(flags, "aiReasoning")) {
    lines.push(
      "Provide a short summary explaining the overall band and the main strengths and weaknesses behind the scores."
    );
  }

  if (isFeatureEnabled(flags, "detailedFeedback")) {
    lines.push(
      "For each criterion, return a criteria entry with name, half-band score, a one-sentence description, and bullet points of evidence from the student's answer."
    );
  }

  if (isFeatureEnabled(flags, "improveWordChoice")) {
    lines.push(
      "List specific grammar fixes in corrections (original phrase, revised phrase, reason).",
      "List lexical upgrades in improvedVocabulary (original word or phrase, stronger suggestion, reason).",
      "Do not rewrite the full essay."
    );
  }

  if (isFeatureEnabled(flags, "task1Checklist") && isTask1(taskType)) {
    lines.push(...buildTask1ChecklistPromptLines(taskType));
  }

  if (isFeatureEnabled(flags, "structureCoach") && isTask2(taskType)) {
    lines.push(
      `Return structureCoach.sections with exactly these names in order: ${STRUCTURE_COACH_SECTIONS.join(", ")}.`,
      "For each section, set met true or false and a short diagnostic note only.",
      "Do not change numeric band scores based on structureCoach.",
      "Do not write sample paragraphs or rewrites."
    );
  }

  if (hasQuestionImage) {
    lines.push(
      "The attached image is the official IELTS Task 1 question (chart, graph, map, process diagram, or General Training letter situation).",
      "Read every label, trend, stage, and instruction in the image.",
      "Judge Task Achievement against what the image requires, not a generic Task 1 description."
    );
  } else {
    lines.push(`Question or topic: ${topic || "Not provided"}`);
  }

  lines.push(`Student answer: ${essay}`);

  return lines.join("\n\n");
}

async function readJsonResponse(fetchResponse) {
  const responseText = await fetchResponse.text();

  if (!responseText.trim()) {
    return {};
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return {};
  }
}

function resolveGeminiApiKey(request) {
  const headers = request.headers || {};
  const headerKey = String(headers[GEMINI_API_KEY_HEADER] || "").trim();

  if (headerKey) {
    return headerKey;
  }

  return String(process.env.GEMINI_API_KEY || "").trim();
}

function extractGeminiError(payload) {
  return payload?.error?.message || "Gemini score check failed.";
}

function sendJson(response, statusCode, payload) {
  response.status(statusCode).json(payload);
}
