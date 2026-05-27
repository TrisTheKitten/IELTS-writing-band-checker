import { describe, expect, it } from "vitest";
import { buildHighlightedSegments } from "./highlightEssay.js";

describe("buildHighlightedSegments", () => {
  it("wraps matched phrases", () => {
    const essay = "This is good work.";
    const { segments } = buildHighlightedSegments(
      essay,
      [],
      [{ original: "good", suggestion: "strong", reason: "More precise" }]
    );

    expect(segments).toEqual([
      { type: "text", value: "This is " },
      {
        type: "highlight",
        value: "good",
        kind: "vocabulary",
        revised: "strong",
        reason: "More precise"
      },
      { type: "text", value: " work." }
    ]);
  });

  it("skips unmatched phrases", () => {
    const { segments, unmatchedCount } = buildHighlightedSegments(
      "Hello world",
      [{ original: "missing", revised: "x", reason: "y" }],
      []
    );

    expect(segments).toEqual([{ type: "text", value: "Hello world" }]);
    expect(unmatchedCount).toBe(1);
  });
});
