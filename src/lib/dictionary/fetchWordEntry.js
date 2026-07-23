import { WORD_LOOKUP_ENDPOINT } from "@shared/dictionary.js";

export async function fetchWordEntry(word) {
  const response = await fetch(
    `${WORD_LOOKUP_ENDPOINT}?word=${encodeURIComponent(word)}`
  );
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "Dictionary lookup failed. Try again.");
  }

  return payload.entry;
}
