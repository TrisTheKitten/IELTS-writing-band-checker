import { GENERATE_TOPIC_ENDPOINT } from "@shared/ielts-contract.js";
import { readJsonPayload } from "./scoring";
import { buildGeminiApiKeyHeaders } from "./geminiApiKey";

export async function generateTopicQuestion({ model, previousTopic = "", themeId } = {}) {
  const response = await fetch(GENERATE_TOPIC_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildGeminiApiKeyHeaders()
    },
    body: JSON.stringify({
      model,
      previousTopic,
      themeId
    })
  });

  const payload = await readJsonPayload(response);

  if (!response.ok) {
    throw new Error(payload.error || "Question generation failed. Try again.");
  }

  const question = String(payload.question || "").trim();

  if (!question) {
    throw new Error("AI returned an empty question. Try again.");
  }

  return question;
}
