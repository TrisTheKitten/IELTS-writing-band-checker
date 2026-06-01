import { describe, expect, it } from "vitest";
import {
  buildGenerateTopicPrompt,
  parseGeneratedTopic
} from "../shared/generate-topic.js";
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
