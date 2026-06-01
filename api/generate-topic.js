import {
  buildGenerateTopicPrompt,
  GENERATE_TOPIC_RESPONSE_SCHEMA,
  parseGeneratedTopic
} from "../shared/generate-topic.js";
import {
  isValidGeminiModelId,
  resolveGeminiModel
} from "../shared/gemini-models.js";
import { MAX_PROMPT_LENGTH } from "../shared/ielts-contract.js";

const GEMINI_API_VERSION = "v1beta";
const GEMINI_API_KEY_HEADER = "x-gemini-api-key";
const GEMINI_ENDPOINT_BASE = "https://generativelanguage.googleapis.com";
const HTTP_METHOD = "POST";
const RESPONSE_TOKEN_LIMIT = 512;
const TEMPERATURE = 0.85;

export default async function handler(request, response) {
  if (request.method !== HTTP_METHOD) {
    return sendJson(response, 405, { error: "Use POST to generate a Task 2 question." });
  }

  const apiKey = resolveGeminiApiKey(request);

  if (!apiKey) {
    return sendJson(response, 500, {
      error: "Add a Gemini API key in Settings or set GEMINI_API_KEY on the server."
    });
  }

  const body = request.body || {};
  const previousTopic = String(body.previousTopic || "").trim().slice(0, MAX_PROMPT_LENGTH);
  const clientModel = String(body.model || "").trim();

  if (clientModel && !isValidGeminiModelId(clientModel)) {
    return sendJson(response, 400, { error: "Unsupported Gemini model." });
  }

  const model = resolveGeminiModel({
    clientModel,
    envModel: process.env.GEMINI_MODEL
  });
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
          parts: [{ text: buildGenerateTopicPrompt({ previousTopic }) }]
        }
      ],
      generationConfig: {
        temperature: TEMPERATURE,
        maxOutputTokens: RESPONSE_TOKEN_LIMIT,
        responseMimeType: "application/json",
        responseSchema: GENERATE_TOPIC_RESPONSE_SCHEMA
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
    const parsed = parseGeneratedTopic(JSON.parse(text));

    if (!parsed.ok) {
      return sendJson(response, 502, { error: parsed.error });
    }

    return sendJson(response, 200, { question: parsed.question });
  } catch {
    return sendJson(response, 502, { error: "AI returned an unreadable question. Try again." });
  }
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
  return payload?.error?.message || "Question generation failed.";
}

function sendJson(response, statusCode, payload) {
  response.status(statusCode).json(payload);
}
