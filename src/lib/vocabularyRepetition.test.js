import { describe, expect, it } from "vitest";
import {
  analyzeVocabularyRepetition,
  foldWordStem,
  tokenizeEssay
} from "./vocabularyRepetition.js";

describe("tokenizeEssay", () => {
  it("lowercases and strips edge punctuation", () => {
    expect(tokenizeEssay("Trends, trends! (trend)")).toEqual([
      "trends",
      "trends",
      "trend"
    ]);
  });

  it("returns an empty array for empty input", () => {
    expect(tokenizeEssay("")).toEqual([]);
    expect(tokenizeEssay(null)).toEqual([]);
  });
});

describe("foldWordStem", () => {
  it("folds plural -s and -ies to a shared stem", () => {
    expect(foldWordStem("trends")).toBe("trend");
    expect(foldWordStem("studies")).toBe("study");
  });

  it("leaves short words and double-s words intact", () => {
    expect(foldWordStem("bus")).toBe("bus");
    expect(foldWordStem("process")).toBe("process");
  });
});

describe("analyzeVocabularyRepetition", () => {
  it("counts repeated content words, folding plurals together", () => {
    const essay = "Trends shape trends and a trend follows trends across markets.";
    const { items } = analyzeVocabularyRepetition(essay);

    expect(items).toEqual([{ word: "trend", count: 4 }]);
  });

  it("excludes stop words", () => {
    const essay = "The the the because because because people people people.";
    const { items } = analyzeVocabularyRepetition(essay);

    expect(items).toEqual([]);
  });

  it("respects the minimum count threshold", () => {
    const essay = "apple apple banana banana banana";
    const { items } = analyzeVocabularyRepetition(essay, { minCount: 3 });

    expect(items).toEqual([{ word: "banana", count: 3 }]);
  });

  it("caps the number of returned items", () => {
    const words = ["alpha", "bravo", "charlie", "delta", "echo"];
    const essay = words.map((word) => `${word} ${word} ${word}`).join(" ");
    const { items } = analyzeVocabularyRepetition(essay, { maxItems: 2 });

    expect(items).toHaveLength(2);
  });

  it("returns no items for an empty essay", () => {
    expect(analyzeVocabularyRepetition("")).toEqual({ items: [] });
  });
});
