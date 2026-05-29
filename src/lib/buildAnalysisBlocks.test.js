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
    const blocks = buildAnalysisBlocks(task2Result, {
      level: "green",
      label: "Good length",
      wordCountOk: true
    });

    expect(blocks.map((block) => block.type)).toEqual([
      "summary",
      "diagnostic",
      "criteria",
      "changes",
      "changes"
    ]);
    expect(blocks[1].title).toBe("Essay structure");
    expect(blocks[3].title).toBe("Grammar fixes");
    expect(blocks[4].title).toBe("Word choice");
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
      { level: "green", label: "Good length", wordCountOk: true }
    );

    expect(blocks).toEqual([]);
  });
});
