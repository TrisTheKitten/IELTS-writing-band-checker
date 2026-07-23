import { describe, expect, it } from "vitest";
import {
  DEFAULT_GEMINI_MODEL_ID,
  GEMINI_MODEL_OPTIONS,
  GEMINI_THINKING_LEVEL_LOW,
  GEMINI_THINKING_LEVEL_MEDIUM,
  getGeminiModelOption,
  getGeminiThinkingConfig,
  isValidGeminiModelId,
  resolveGeminiModel
} from "./gemini-models.js";

describe("isValidGeminiModelId", () => {
  it("accepts allowlisted model ids", () => {
    for (const option of GEMINI_MODEL_OPTIONS) {
      expect(isValidGeminiModelId(option.id)).toBe(true);
    }
  });

  it("rejects unknown ids", () => {
    expect(isValidGeminiModelId("gemini-2.0-flash")).toBe(false);
    expect(isValidGeminiModelId("")).toBe(false);
    expect(isValidGeminiModelId(null)).toBe(false);
  });
});

describe("getGeminiModelOption", () => {
  it("returns the matching option", () => {
    expect(getGeminiModelOption("gemini-3.6-flash").label).toBe("Flash");
  });

  it("falls back to default for invalid ids", () => {
    expect(getGeminiModelOption("unknown").id).toBe(DEFAULT_GEMINI_MODEL_ID);
  });
});

describe("resolveGeminiModel", () => {
  it("prefers a valid client model", () => {
    expect(
      resolveGeminiModel({
        clientModel: "gemini-3.1-pro",
        envModel: "gemini-3.6-flash"
      })
    ).toBe("gemini-3.1-pro");
  });

  it("falls back to env when client is empty", () => {
    expect(
      resolveGeminiModel({
        clientModel: "",
        envModel: "gemini-3.6-flash"
      })
    ).toBe("gemini-3.6-flash");
  });

  it("falls back to default when client and env are invalid", () => {
    expect(
      resolveGeminiModel({
        clientModel: "bad",
        envModel: "also-bad"
      })
    ).toBe(DEFAULT_GEMINI_MODEL_ID);
  });
});

describe("GEMINI_MODEL_OPTIONS copy", () => {
  it("includes menuHint and tooltip for every option", () => {
    for (const option of GEMINI_MODEL_OPTIONS) {
      expect(option.menuHint?.trim()).toBeTruthy();
      expect(option.tooltip?.trim()).toBeTruthy();
    }
  });
});

describe("getGeminiThinkingConfig", () => {
  it("uses low thinking for Flash", () => {
    expect(getGeminiThinkingConfig("gemini-3.6-flash")).toEqual({
      thinkingLevel: GEMINI_THINKING_LEVEL_LOW
    });
  });

  it("uses medium thinking for Pro", () => {
    expect(getGeminiThinkingConfig("gemini-3.1-pro")).toEqual({
      thinkingLevel: GEMINI_THINKING_LEVEL_MEDIUM
    });
  });

  it("omits thinking config for Flash Lite", () => {
    expect(getGeminiThinkingConfig("gemini-3.5-flash-lite")).toBeNull();
  });
});
