import { parseFeatureFlags } from "@shared/ielts-contract.js";

const PROMPT_OVERHEAD_CHARS = 2800;
const IMAGE_OVERHEAD_CHARS = 1200;
const BASE_OUTPUT_TOKENS = 400;

const OUTPUT_TOKENS_BY_FLAG = {
  aiReasoning: 200,
  detailedFeedback: 450,
  improveWordChoice: 350,
  task1Checklist: 250,
  structureCoach: 250
};

export function estimateCheckCost({ essay, topic, hasQuestionImage, featureFlags }) {
  const flags = parseFeatureFlags(featureFlags);
  let inputChars =
    String(essay || "").length + String(topic || "").length + PROMPT_OVERHEAD_CHARS;

  if (hasQuestionImage) {
    inputChars += IMAGE_OVERHEAD_CHARS;
  }

  let outputTokensMax = BASE_OUTPUT_TOKENS;
  for (const flag of flags) {
    outputTokensMax += OUTPUT_TOKENS_BY_FLAG[flag] || 0;
  }

  const outputTokensMin = Math.max(200, Math.floor(outputTokensMax * 0.55));
  const inputKMin = Math.max(1, Math.floor(inputChars / 1000));
  const inputKMax = Math.max(inputKMin, Math.ceil((inputChars * 1.05) / 1000));

  return {
    inputChars,
    inputKMin,
    inputKMax,
    outputTokensMin,
    outputTokensMax
  };
}

export function formatCostEstimateLine(estimate) {
  return `~${estimate.inputKMin}–${estimate.inputKMax}K input chars · uses your Gemini key`;
}
