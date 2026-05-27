const HIGHLIGHT_KINDS = {
  correction: "correction",
  vocabulary: "vocabulary"
};

function findMatchIndex(text, phrase) {
  if (!phrase) {
    return -1;
  }

  const exact = text.indexOf(phrase);
  if (exact !== -1) {
    return exact;
  }

  const lowerText = text.toLowerCase();
  const lowerPhrase = phrase.toLowerCase();
  return lowerText.indexOf(lowerPhrase);
}

function buildHighlightEntries(corrections, improvedVocabulary) {
  const entries = [];

  for (const correction of corrections) {
    if (correction?.original) {
      entries.push({
        phrase: correction.original,
        kind: HIGHLIGHT_KINDS.correction,
        revised: correction.revised,
        reason: correction.reason
      });
    }
  }

  for (const item of improvedVocabulary) {
    if (item?.original) {
      entries.push({
        phrase: item.original,
        kind: HIGHLIGHT_KINDS.vocabulary,
        revised: item.suggestion,
        reason: item.reason
      });
    }
  }

  return entries;
}

export function buildHighlightedSegments(essay, corrections, improvedVocabulary) {
  const text = String(essay || "");
  const entries = buildHighlightEntries(corrections || [], improvedVocabulary || []);
  const matches = [];

  for (const entry of entries) {
    const start = findMatchIndex(text, entry.phrase);

    if (start === -1) {
      continue;
    }

    const matchedText = text.slice(start, start + entry.phrase.length);
    matches.push({
      start,
      end: start + entry.phrase.length,
      text: matchedText,
      kind: entry.kind,
      revised: entry.revised,
      reason: entry.reason
    });
  }

  matches.sort((a, b) => a.start - b.start);

  const nonOverlapping = [];
  let cursor = 0;

  for (const match of matches) {
    if (match.start < cursor) {
      continue;
    }

    nonOverlapping.push(match);
    cursor = match.end;
  }

  const segments = [];
  let index = 0;

  for (const match of nonOverlapping) {
    if (match.start > index) {
      segments.push({ type: "text", value: text.slice(index, match.start) });
    }

    segments.push({
      type: "highlight",
      value: match.text,
      kind: match.kind,
      revised: match.revised,
      reason: match.reason
    });
    index = match.end;
  }

  if (index < text.length) {
    segments.push({ type: "text", value: text.slice(index) });
  }

  if (segments.length === 0 && text) {
    segments.push({ type: "text", value: text });
  }

  return { segments, unmatchedCount: entries.length - nonOverlapping.length };
}
