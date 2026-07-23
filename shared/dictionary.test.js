import { describe, expect, it } from "vitest";
import {
  normalizeAudioUrl,
  normalizeDictionaryResponse,
  normalizeLookupWord,
  validateLookupWord
} from "./dictionary.js";

const helloFixture = [
  {
    word: "hello",
    phonetic: "həˈləʊ",
    phonetics: [
      {
        text: "həˈləʊ",
        audio: "//ssl.gstatic.com/dictionary/static/sounds/20200429/hello--_gb_1.mp3"
      },
      { text: "hɛˈləʊ" }
    ],
    origin: "early 19th century: variant of earlier hollo",
    meanings: [
      {
        partOfSpeech: "exclamation",
        definitions: [
          {
            definition: "used as a greeting or to begin a phone conversation.",
            example: "hello there, Katie!",
            synonyms: ["hi", "hey"],
            antonyms: []
          }
        ]
      },
      {
        partOfSpeech: "noun",
        definitions: [
          {
            definition: "an utterance of ‘hello’; a greeting.",
            example: "she was getting polite nods and hellos from people",
            synonyms: ["greeting"],
            antonyms: ["goodbye"]
          }
        ]
      }
    ]
  }
];

describe("validateLookupWord", () => {
  it("rejects empty input", () => {
    expect(validateLookupWord("")).toEqual({ ok: false, error: "Enter a word." });
  });

  it("rejects phrases", () => {
    expect(validateLookupWord("hello world")).toEqual({
      ok: false,
      error: "Use a single English word."
    });
  });

  it("accepts a normalized word", () => {
    expect(validateLookupWord("  Hello ")).toEqual({ ok: true, word: "hello" });
  });
});

describe("normalizeLookupWord", () => {
  it("lowercases and trims", () => {
    expect(normalizeLookupWord("  Test ")).toBe("test");
  });
});

describe("normalizeAudioUrl", () => {
  it("prefixes protocol-relative URLs", () => {
    expect(normalizeAudioUrl("//example.com/audio.mp3")).toBe("https://example.com/audio.mp3");
  });
});

describe("normalizeDictionaryResponse", () => {
  it("maps API payload into a compact entry", () => {
    const entry = normalizeDictionaryResponse(helloFixture);

    expect(entry.word).toBe("hello");
    expect(entry.phonetic).toBe("həˈləʊ");
    expect(entry.audioUrl).toContain("https://ssl.gstatic.com/");
    expect(entry.origin).toContain("19th century");
    expect(entry.meanings).toHaveLength(2);
    expect(entry.synonyms).toEqual(expect.arrayContaining(["hi", "hey", "greeting"]));
    expect(entry.antonyms).toEqual(["goodbye"]);
  });

  it("returns null for empty payloads", () => {
    expect(normalizeDictionaryResponse([])).toBeNull();
  });

  it("reads synonyms and antonyms from meaning-level fields", () => {
    const entry = normalizeDictionaryResponse([
      {
        word: "good",
        meanings: [
          {
            partOfSpeech: "adjective",
            definitions: [
              { definition: "(of people)", synonyms: [], antonyms: [] },
              {
                definition: "morally right.",
                synonyms: [],
                antonyms: []
              }
            ],
            synonyms: ["decent", "satisfactory"],
            antonyms: ["bad", "evil"]
          }
        ]
      }
    ]);

    expect(entry.synonyms).toEqual(["decent", "satisfactory"]);
    expect(entry.antonyms).toEqual(["bad", "evil"]);
    expect(entry.meanings[0].definitions).toHaveLength(1);
    expect(entry.meanings[0].definitions[0].definition).toBe("morally right.");
  });
});
