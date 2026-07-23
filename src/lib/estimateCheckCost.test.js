import { describe, expect, it } from "vitest";
import { estimateCheckCost, formatCostEstimateLine } from "./estimateCheckCost.js";

describe("estimateCheckCost", () => {
  it("scales output range with more flags", () => {
    const minimal = estimateCheckCost({
      essay: "x".repeat(500),
      topic: "topic",
      hasQuestionImage: false,
      featureFlags: []
    });
    const full = estimateCheckCost({
      essay: "x".repeat(500),
      topic: "topic",
      hasQuestionImage: true,
      featureFlags: ["aiReasoning", "detailedFeedback", "improveWordChoice", "task1Checklist"]
    });

    expect(full.inputChars).toBeGreaterThan(minimal.inputChars);
    expect(full.outputTokensMax).toBeGreaterThan(minimal.outputTokensMax);
  });

  it("formats a BYOK line", () => {
    const line = formatCostEstimateLine(
      estimateCheckCost({
        essay: "hello",
        topic: "",
        hasQuestionImage: false,
        featureFlags: ["aiReasoning"]
      })
    );

    expect(line).toMatch(/uses your Gemini key/);
  });
});
