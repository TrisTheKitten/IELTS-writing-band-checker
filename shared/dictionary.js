export const WORD_LOOKUP_ENDPOINT = "/api/lookup-word";
export const DICTIONARY_API_BASE = "https://api.dictionaryapi.dev/api/v2/entries/en";
export const MAX_LOOKUP_WORD_LENGTH = 45;
export const MAX_DEFINITIONS_PER_MEANING = 2;

const LOOKUP_WORD_PATTERN = /^[a-z'-]+$/i;

export function normalizeLookupWord(raw) {
  return String(raw || "").trim().toLowerCase();
}

export function validateLookupWord(raw) {
  const word = normalizeLookupWord(raw);

  if (!word) {
    return { ok: false, error: "Enter a word." };
  }

  if (word.length > MAX_LOOKUP_WORD_LENGTH) {
    return { ok: false, error: "Word is too long." };
  }

  if (!LOOKUP_WORD_PATTERN.test(word)) {
    return { ok: false, error: "Use a single English word." };
  }

  return { ok: true, word };
}

export function buildDictionaryApiUrl(word) {
  return `${DICTIONARY_API_BASE}/${encodeURIComponent(word)}`;
}

export function normalizeAudioUrl(url) {
  const value = String(url || "").trim();

  if (!value) {
    return null;
  }

  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

export function pickPhonetic(phonetics) {
  if (!Array.isArray(phonetics)) {
    return null;
  }

  const withText = phonetics.find((item) => item?.text);
  return withText?.text || null;
}

export function pickAudioUrl(phonetics) {
  if (!Array.isArray(phonetics)) {
    return null;
  }

  const withAudio = phonetics.find((item) => item?.audio);
  return normalizeAudioUrl(withAudio?.audio);
}

export function dedupeStrings(values) {
  const seen = new Set();
  const result = [];

  for (const value of values) {
    const text = String(value || "").trim();

    if (!text) {
      continue;
    }

    const key = text.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(text);
  }

  return result;
}

function isStubDefinition(text) {
  return /^\([^)]+\)\.?$/.test(text.trim());
}

function collectDefinitions(rawDefinitions, meaningSynonyms, meaningAntonyms) {
  const definitions = [];

  for (const definition of rawDefinitions || []) {
    const text = String(definition.definition || "").trim();

    if (!text || isStubDefinition(text)) {
      continue;
    }

    const example = String(definition.example || "").trim();

    definitions.push({
      definition: text,
      example: example || null
    });

    meaningSynonyms.push(...(definition.synonyms || []));
    meaningAntonyms.push(...(definition.antonyms || []));

    if (definitions.length >= MAX_DEFINITIONS_PER_MEANING) {
      break;
    }
  }

  return definitions;
}

function mergeMeaning(existing, incoming) {
  existing.definitions.push(...incoming.definitions);
  existing.definitions = existing.definitions.slice(0, MAX_DEFINITIONS_PER_MEANING);
  existing.synonyms = dedupeStrings([...existing.synonyms, ...incoming.synonyms]);
  existing.antonyms = dedupeStrings([...existing.antonyms, ...incoming.antonyms]);
}

export function normalizeDictionaryResponse(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return null;
  }

  const meaningByPart = new Map();
  const synonymPool = [];
  const antonymPool = [];
  let word = "";
  let phonetic = null;
  let audioUrl = null;
  let origin = null;

  for (const entry of entries) {
    word = word || String(entry.word || "").trim();
    phonetic = phonetic || String(entry.phonetic || "").trim() || pickPhonetic(entry.phonetics);
    audioUrl = audioUrl || pickAudioUrl(entry.phonetics);
    origin = origin || String(entry.origin || "").trim() || null;

    for (const meaning of entry.meanings || []) {
      const partOfSpeech = String(meaning.partOfSpeech || "").trim() || "other";
      const meaningSynonyms = [...(meaning.synonyms || [])];
      const meaningAntonyms = [...(meaning.antonyms || [])];
      const definitions = collectDefinitions(
        meaning.definitions,
        meaningSynonyms,
        meaningAntonyms
      );
      const synonyms = dedupeStrings(meaningSynonyms);
      const antonyms = dedupeStrings(meaningAntonyms);

      if (!definitions.length && !synonyms.length && !antonyms.length) {
        continue;
      }

      const incoming = {
        partOfSpeech,
        definitions,
        synonyms,
        antonyms
      };
      const existing = meaningByPart.get(partOfSpeech);

      if (existing) {
        mergeMeaning(existing, incoming);
      } else {
        meaningByPart.set(partOfSpeech, incoming);
      }

      synonymPool.push(...synonyms);
      antonymPool.push(...antonyms);
    }
  }

  const meanings = [...meaningByPart.values()];

  if (!meanings.length) {
    return null;
  }

  return {
    word,
    phonetic: phonetic || null,
    audioUrl,
    origin,
    meanings,
    synonyms: dedupeStrings(synonymPool),
    antonyms: dedupeStrings(antonymPool)
  };
}
