const DEFAULT_MIN_COUNT = 3;
const DEFAULT_MAX_ITEMS = 12;
const MIN_WORD_LENGTH = 3;
const WORD_PATTERN = /^[a-z]+$/;

const ENGLISH_STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "being", "but", "by",
  "can", "could", "did", "do", "does", "for", "from", "had", "has", "have",
  "he", "her", "hers", "him", "his", "how", "i", "if", "in", "into", "is",
  "it", "its", "me", "my", "no", "nor", "not", "of", "on", "or", "our",
  "ours", "out", "over", "she", "should", "so", "than", "that", "the",
  "their", "theirs", "them", "then", "there", "these", "they", "this",
  "those", "to", "too", "under", "until", "up", "was", "we", "were", "what",
  "when", "where", "which", "while", "who", "whom", "why", "will", "with",
  "would", "you", "your", "yours", "about", "after", "again", "all", "also",
  "any", "because", "before", "between", "both", "during", "each", "few",
  "further", "here", "however", "more", "most", "much", "only", "other",
  "own", "same", "some", "such", "therefore", "thus", "very", "moreover",
  "furthermore", "additionally", "people", "social", "media", "thing",
  "things", "way", "ways"
]);

export function tokenizeEssay(text) {
  if (!text) {
    return [];
  }

  return text
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.replace(/^[^a-z]+/, "").replace(/[^a-z]+$/, ""))
    .filter(Boolean);
}

export function foldWordStem(word) {
  if (word.length <= MIN_WORD_LENGTH) {
    return word;
  }

  if (word.endsWith("ies") && word.length > 4) {
    return `${word.slice(0, -3)}y`;
  }

  if (word.endsWith("s") && !word.endsWith("ss")) {
    return word.slice(0, -1);
  }

  return word;
}

export function analyzeVocabularyRepetition(essay, options = {}) {
  const minCount = options.minCount ?? DEFAULT_MIN_COUNT;
  const maxItems = options.maxItems ?? DEFAULT_MAX_ITEMS;

  const counts = new Map();

  for (const token of tokenizeEssay(essay)) {
    if (token.length < MIN_WORD_LENGTH || !WORD_PATTERN.test(token)) {
      continue;
    }

    if (ENGLISH_STOP_WORDS.has(token)) {
      continue;
    }

    const stem = foldWordStem(token);

    if (ENGLISH_STOP_WORDS.has(stem)) {
      continue;
    }

    counts.set(stem, (counts.get(stem) || 0) + 1);
  }

  const items = [...counts.entries()]
    .filter(([, count]) => count >= minCount)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, maxItems);

  return { items };
}
