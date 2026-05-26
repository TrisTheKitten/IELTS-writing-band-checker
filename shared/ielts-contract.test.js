import { describe, expect, it } from "vitest";
import {
  MAX_QUESTION_IMAGE_BYTES,
  normalizeQuestionImage,
  parseFeatureFlags,
  snapToHalfBand
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
