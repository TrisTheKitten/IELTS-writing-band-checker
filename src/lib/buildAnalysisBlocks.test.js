import { describe, expect, it } from "vitest";
import { buildAnalysisBlocks } from "./buildAnalysisBlocks.js";

const task2Result = {
  summary: "Solid essay with clear structure.",
  criteria: [
    {
      name: "Task response",
      score: 7,
      description: "Addresses all parts",
      points: ["Clear position"]
    }
  ],
  corrections: [{ original: "go", revised: "went", reason: "Past tense" }],
  improvedVocabulary: [{ original: "good", suggestion: "strong", reason: "More precise" }],
  task1Checklist: [],
  structureCoach: {
    sections: [{ id: "intro", label: "Introduction", met: true, note: "Clear thesis" }]
  }
};

describe("buildAnalysisBlocks", () => {
  it("returns blocks in display order when result has all sections", () => {
    const blocks = buildAnalysisBlocks(
      task2Result,
      {
        level: "green",
        label: "Good length",
        wordCountOk: true
      },
      "Tourism tourism tourism boosts tourism and tourism shapes tourism worldwide."
    );

    expect(blocks.map((block) => block.type)).toEqual([
      "summary",
      "diagnostic",
      "changes",
      "changes",
      "vocabularyRepetition",
      "criteria"
    ]);
    expect(blocks[1].title).toBe("Essay structure");
    expect(blocks[2].title).toBe("Grammar fixes");
    expect(blocks[3].title).toBe("Word choice");
    expect(blocks[4].title).toBe("Vocabulary repetition");
    expect(blocks[4].items[0]).toEqual({ word: "tourism", count: 6 });
    expect(blocks[5].type).toBe("criteria");
    expect(blocks[5].items[0].name).toBe("Task response");
  });

  it("omits the vocabulary repetition block when no words qualify", () => {
    const blocks = buildAnalysisBlocks(
      task2Result,
      { level: "green", label: "Good length", wordCountOk: true },
      "A short essay with no repeated content words."
    );

    expect(blocks.some((block) => block.type === "vocabularyRepetition")).toBe(false);
  });

  it("returns no blocks when analysis fields are empty", () => {
    const blocks = buildAnalysisBlocks(
      {
        summary: "",
        criteria: [],
        corrections: [],
        improvedVocabulary: [],
        task1Checklist: [],
        structureCoach: null
      },
      { level: "green", label: "Good length", wordCountOk: true },
      ""
    );

    expect(blocks).toEqual([]);
  });
});
