import {
  buildDictionaryApiUrl,
  normalizeDictionaryResponse,
  validateLookupWord
} from "../shared/dictionary.js";

const HTTP_METHOD = "GET";

export function readLookupWord(request) {
  if (request.query?.word !== undefined) {
    return String(request.query.word);
  }

  if (request.url) {
    const url = new URL(request.url, "http://localhost");
    return url.searchParams.get("word") || "";
  }

  return "";
}

export default async function handler(request, response) {
  if (request.method !== HTTP_METHOD) {
    return sendJson(response, 405, { error: "Use GET to look up a word." });
  }

  const validation = validateLookupWord(readLookupWord(request));

  if (!validation.ok) {
    return sendJson(response, 400, { error: validation.error });
  }

  const dictionaryResponse = await fetch(buildDictionaryApiUrl(validation.word));

  if (dictionaryResponse.status === 404) {
    return sendJson(response, 404, { error: "No entry for that word." });
  }

  if (!dictionaryResponse.ok) {
    return sendJson(response, 502, { error: "Dictionary lookup failed. Try again." });
  }

  let payload;

  try {
    payload = await dictionaryResponse.json();
  } catch {
    return sendJson(response, 502, { error: "Dictionary lookup failed. Try again." });
  }

  const entry = normalizeDictionaryResponse(payload);

  if (!entry) {
    return sendJson(response, 404, { error: "No entry for that word." });
  }

  return sendJson(response, 200, { entry });
}

function sendJson(response, statusCode, payload) {
  response.status(statusCode).json(payload);
}
