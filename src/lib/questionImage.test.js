import { describe, expect, it } from "vitest";
import {
  getPastedQuestionImageFile,
  shouldDeferPastedImageToTextField
} from "./questionImage.js";

function createClipboardData(items) {
  return {
    items: {
      length: items.length,
      *[Symbol.iterator]() {
        yield* items;
      },
      ...Object.fromEntries(items.map((item, index) => [index, item]))
    }
  };
}

describe("getPastedQuestionImageFile", () => {
  it("returns the first accepted image file from the clipboard", () => {
    const file = new File(["image"], "chart.png", { type: "image/png" });
    const clipboardData = createClipboardData([
      { kind: "file", type: "image/png", getAsFile: () => file }
    ]);

    expect(getPastedQuestionImageFile(clipboardData)).toBe(file);
  });

  it("ignores unsupported image types", () => {
    const clipboardData = createClipboardData([
      {
        kind: "file",
        type: "image/svg+xml",
        getAsFile: () => new File(["svg"], "chart.svg", { type: "image/svg+xml" })
      }
    ]);

    expect(getPastedQuestionImageFile(clipboardData)).toBeNull();
  });
});

describe("shouldDeferPastedImageToTextField", () => {
  it("defers when a text field is focused and plain text is on the clipboard", () => {
    const textarea = { tagName: "TEXTAREA" };
    const clipboardData = createClipboardData([
      { kind: "string", type: "text/plain" },
      { kind: "file", type: "image/png" }
    ]);

    expect(shouldDeferPastedImageToTextField(clipboardData, textarea)).toBe(true);
  });

  it("does not defer when only an image is on the clipboard", () => {
    const textarea = { tagName: "TEXTAREA" };
    const clipboardData = createClipboardData([
      { kind: "file", type: "image/png" }
    ]);

    expect(shouldDeferPastedImageToTextField(clipboardData, textarea)).toBe(false);
  });
});
