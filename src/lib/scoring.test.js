import { describe, expect, it } from "vitest";
import { buildResponseSchema } from "../../api/check-writing.js";
import { getSubmitBlockReason, normalizeResult, normalizeScore } from "./scoring.js";

const samplePayload = {
  overall: 6.7,
  taskResponse: 6.2,
  coherenceCohesion: 6.8,
  lexicalResource: 7.1,
  grammarAccuracy: 6.4,
  summary: "Strong cohesion with limited range.",
  criteria: [{ name: "Task response", score: 6, description: "Addresses the task", points: ["Clear position"] }],
  corrections: [{ original: "go", revised: "went", reason: "Past tense" }],
  improvedVocabulary: [{ original: "good", suggestion: "strong", reason: "More precise" }]
};

describe("normalizeScore", () => {
  it("snaps to half bands", () => {
    expect(normalizeScore(6.24)).toBe(6);
    expect(normalizeScore(6.25)).toBe(6.5);
  });
});

describe("normalizeResult", () => {
  it("keeps all sections when every flag is enabled", () => {
    const result = normalizeResult(samplePayload, [
      "aiReasoning",
      "detailedFeedback",
      "improveWordChoice"
    ]);

    expect(result.summary).toBe(samplePayload.summary);
    expect(result.criteria).toHaveLength(1);
    expect(result.corrections).toHaveLength(1);
    expect(result.improvedVocabulary).toHaveLength(1);
    expect(result.overall).toBe(6.5);
  });

  it("strips disabled sections", () => {
    const result = normalizeResult(samplePayload, []);

    expect(result.summary).toBe("");
    expect(result.criteria).toEqual([]);
    expect(result.corrections).toEqual([]);
    expect(result.improvedVocabulary).toEqual([]);
    expect(result.overall).toBe(6.5);
  });

  it("keeps only word-choice sections when that flag is on", () => {
    const result = normalizeResult(samplePayload, ["improveWordChoice"]);

    expect(result.summary).toBe("");
    expect(result.criteria).toEqual([]);
    expect(result.corrections).toHaveLength(1);
    expect(result.improvedVocabulary).toHaveLength(1);
  });
});

describe("getSubmitBlockReason", () => {
  it("blocks short essays and missing task 1 images", () => {
    expect(
      getSubmitBlockReason({
        essay: "short",
        taskType: "IELTS Writing Task 2",
        questionImage: null,
        isChecking: false
      })
    ).toMatch(/at least/);

    expect(
      getSubmitBlockReason({
        essay: "x".repeat(150),
        taskType: "IELTS Writing Task 1 (Academic)",
        questionImage: null,
        isChecking: false
      })
    ).toMatch(/question image/);

    expect(
      getSubmitBlockReason({
        essay: "x".repeat(150),
        taskType: "IELTS Writing Task 2",
        questionImage: null,
        isChecking: false
      })
    ).toBeNull();
  });
});

describe("buildResponseSchema", () => {
  it("requires only core scores when no flags are enabled", () => {
    const schema = buildResponseSchema([]);
    expect(schema.required).toEqual([
      "overall",
      "taskResponse",
      "coherenceCohesion",
      "lexicalResource",
      "grammarAccuracy"
    ]);
    expect(schema.properties.summary).toBeUndefined();
    expect(schema.properties.criteria).toBeUndefined();
    expect(schema.properties.corrections).toBeUndefined();
  });

  it("adds optional sections per flag", () => {
    const schema = buildResponseSchema(["aiReasoning", "detailedFeedback", "improveWordChoice"]);
    expect(schema.required).toContain("summary");
    expect(schema.required).toContain("criteria");
    expect(schema.required).toContain("corrections");
    expect(schema.required).toContain("improvedVocabulary");
  });
});
