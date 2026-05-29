import { describe, expect, it } from "vitest";
import {
  buildTask1ChecklistPromptLines,
  getEffectiveFeatureFlags,
  isTask1Academic,
  isTask2,
  MAX_QUESTION_IMAGE_BYTES,
  normalizeQuestionImage,
  parseFeatureFlags,
  snapToHalfBand,
  TASK_TYPES,
  taskTypeToSlug
} from "./ielts-contract.js";

describe("snapToHalfBand", () => {
  it("clamps and rounds to half bands", () => {
    expect(snapToHalfBand(6.24)).toBe(6);
    expect(snapToHalfBand(6.25)).toBe(6.5);
    expect(snapToHalfBand(9.4)).toBe(9);
    expect(snapToHalfBand(-1)).toBe(0);
    expect(snapToHalfBand("bad")).toBe(0);
  });
});

describe("parseFeatureFlags", () => {
  it("keeps only known flag ids", () => {
    expect(parseFeatureFlags(["aiReasoning", "unknown", "detailedFeedback"])).toEqual([
      "aiReasoning",
      "detailedFeedback"
    ]);
    expect(parseFeatureFlags(null)).toEqual([]);
  });
});

describe("task type helpers", () => {
  it("detects task 2 and academic task 1", () => {
    expect(isTask2("IELTS Writing Task 2")).toBe(true);
    expect(isTask2("IELTS Writing Task 1 (Academic)")).toBe(false);
    expect(isTask1Academic("IELTS Writing Task 1 (Academic)")).toBe(true);
    expect(isTask1Academic("IELTS Writing Task 1 (General)")).toBe(false);
  });
});

describe("taskTypeToSlug", () => {
  it("maps known task types to stable slugs", () => {
    expect(taskTypeToSlug(TASK_TYPES[0])).toBe("task2");
    expect(taskTypeToSlug(TASK_TYPES[1])).toBe("task1-academic");
    expect(taskTypeToSlug(TASK_TYPES[2])).toBe("task1-general");
    expect(taskTypeToSlug("unknown")).toBe("writing");
  });
});

describe("buildTask1ChecklistPromptLines", () => {
  it("returns academic checklist lines for task 1 academic", () => {
    const lines = buildTask1ChecklistPromptLines("IELTS Writing Task 1 (Academic)");
    expect(lines[0]).toMatch(/task1Checklist/);
    expect(lines.some((line) => line.includes("overview"))).toBe(true);
    expect(lines.some((line) => line.includes("noOpinion"))).toBe(true);
  });

  it("returns nothing for task 2", () => {
    expect(buildTask1ChecklistPromptLines("IELTS Writing Task 2")).toEqual([]);
  });
});

describe("getEffectiveFeatureFlags", () => {
  const userFlags = ["aiReasoning", "detailedFeedback", "improveWordChoice"];

  it("adds structure coach for Task 2", () => {
    expect(getEffectiveFeatureFlags("IELTS Writing Task 2", userFlags)).toEqual([
      ...userFlags,
      "structureCoach"
    ]);
  });

  it("adds task 1 checklist for Task 1 and drops structure coach", () => {
    expect(
      getEffectiveFeatureFlags("IELTS Writing Task 1 (Academic)", [
        ...userFlags,
        "structureCoach"
      ])
    ).toEqual([...userFlags, "task1Checklist"]);
  });
});

describe("normalizeQuestionImage", () => {
  const tinyPngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  it("accepts valid mime and base64", () => {
    expect(
      normalizeQuestionImage({
        mimeType: "image/png",
        base64: tinyPngBase64
      })
    ).toEqual({
      mimeType: "image/png",
      base64: tinyPngBase64
    });
  });

  it("rejects unsupported mime types", () => {
    expect(
      normalizeQuestionImage({
        mimeType: "image/bmp",
        base64: tinyPngBase64
      })
    ).toBeNull();
  });

  it("rejects payloads over the size limit", () => {
    const oversized = "A".repeat(Math.ceil((MAX_QUESTION_IMAGE_BYTES * 4) / 3) + 4);
    expect(
      normalizeQuestionImage({
        mimeType: "image/png",
        base64: oversized
      })
    ).toBeNull();
  });
});
