import { describe, expect, it, vi, afterEach } from "vitest";
import handler, { readLookupWord } from "./lookup-word.js";

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

describe("readLookupWord", () => {
  it("reads from query objects", () => {
    expect(readLookupWord({ query: { word: "test" } })).toBe("test");
  });

  it("reads from request URLs", () => {
    expect(readLookupWord({ url: "/api/lookup-word?word=essay" })).toBe("essay");
  });
});

describe("lookup-word handler", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects non-GET methods", async () => {
    const response = createResponse();

    await handler({ method: "POST", query: { word: "hello" } }, response);

    expect(response.statusCode).toBe(405);
  });

  it("returns 400 for invalid words", async () => {
    const response = createResponse();

    await handler({ method: "GET", query: { word: " " } }, response);

    expect(response.statusCode).toBe(400);
    expect(response.payload.error).toBe("Enter a word.");
  });

  it("returns normalized entries", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => [
          {
            word: "essay",
            phonetics: [{ text: "/ˈɛseɪ/" }],
            meanings: [
              {
                partOfSpeech: "noun",
                definitions: [{ definition: "a short piece of writing" }]
              }
            ]
          }
        ]
      }))
    );

    const response = createResponse();

    await handler({ method: "GET", query: { word: "essay" } }, response);

    expect(response.statusCode).toBe(200);
    expect(response.payload.entry.word).toBe("essay");
  });

  it("maps dictionary 404 to a friendly error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 404,
        json: async () => ({ title: "No Definitions Found" })
      }))
    );

    const response = createResponse();

    await handler({ method: "GET", query: { word: "zzzznotaword" } }, response);

    expect(response.statusCode).toBe(404);
    expect(response.payload.error).toBe("No entry for that word.");
  });
});
