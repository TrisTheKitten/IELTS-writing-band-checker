import { describe, expect, it } from "vitest";
import {
  buildGenerateTopicPrompt,
  parseGeneratedTopic
} from "../shared/generate-topic.js";
import { ANY_THEME_ID, resolveThemeId } from "../shared/task-themes.js";
import handler from "./generate-topic.js";

function createResponse() {
  return {
    statusCode: 200,
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(payload) {
      this.payload = payload;
    }
  };
}

describe("buildGenerateTopicPrompt", () => {
  it("asks for a varied question when there is no previous topic", () => {
    const prompt = buildGenerateTopicPrompt();

    expect(prompt).toContain("Task 2");
    expect(prompt).toContain("varied");
    expect(prompt).not.toContain("already has");
  });

  it("asks for a different question when a previous topic exists", () => {
    const prompt = buildGenerateTopicPrompt({ previousTopic: "Some old question" });

    expect(prompt).toContain("different");
    expect(prompt).toContain("Some old question");
  });

  it("steers the theme when a generation theme is selected", () => {
    const prompt = buildGenerateTopicPrompt({ themeId: "technology" });

    expect(prompt).toContain('theme "Technology"');
    expect(prompt).toContain("internet");
    expect(prompt).toContain("AI");
  });

  it("keeps varied-theme guidance when theme is any and there is no previous topic", () => {
    const prompt = buildGenerateTopicPrompt({ themeId: ANY_THEME_ID });

    expect(prompt).toContain("varied");
    expect(prompt).not.toContain('theme "');
  });
});

describe("resolveThemeId", () => {
  it("falls back unknown ids to any", () => {
    expect(resolveThemeId("not-a-theme")).toBe(ANY_THEME_ID);
    expect(resolveThemeId("health")).toBe("health");
  });
});

describe("parseGeneratedTopic", () => {
  it("returns the trimmed question when present", () => {
    expect(parseGeneratedTopic({ question: "  Discuss both views.  " })).toEqual({
      ok: true,
      question: "Discuss both views."
    });
  });

  it("rejects empty questions", () => {
    expect(parseGeneratedTopic({ question: "   " })).toEqual({
      ok: false,
      error: "AI returned an empty question. Try again."
    });
  });
});

describe("generate-topic handler", () => {
  it("rejects non-POST methods", async () => {
    const response = createResponse();

    await handler({ method: "GET", headers: {}, body: {} }, response);

    expect(response.statusCode).toBe(405);
    expect(response.payload.error).toMatch(/POST/i);
  });

  it("returns 500 when no API key is configured", async () => {
    const previousKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const response = createResponse();

    await handler({ method: "POST", headers: {}, body: {} }, response);

    expect(response.statusCode).toBe(500);
    expect(response.payload.error).toMatch(/API key/i);

    if (previousKey) {
      process.env.GEMINI_API_KEY = previousKey;
    }
  });
});
