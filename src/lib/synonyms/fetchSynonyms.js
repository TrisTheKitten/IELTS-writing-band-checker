const DATAMUSE_ENDPOINT = "https://api.datamuse.com/words";
const MAX_SYNONYMS = 12;

export async function fetchSynonyms(word) {
  const response = await fetch(
    `${DATAMUSE_ENDPOINT}?rel_syn=${encodeURIComponent(word)}&max=${MAX_SYNONYMS}`
  );

  if (!response.ok) {
    throw new Error("Synonym lookup failed. Try again.");
  }

  const payload = await response.json().catch(() => []);

  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map((item) => item.word).filter(Boolean);
}
