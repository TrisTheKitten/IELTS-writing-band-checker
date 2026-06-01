import { describe, expect, it } from "vitest";
import { applyTabKey, WRITING_INDENT } from "./writingShortcuts.js";

describe("applyTabKey", () => {
  it("inserts indent at the cursor when nothing is selected", () => {
    const result = applyTabKey("hello", 2, 2, false);

    expect(result.value).toBe(`he${WRITING_INDENT}llo`);
    expect(result.selectionStart).toBe(2 + WRITING_INDENT.length);
    expect(result.selectionEnd).toBe(2 + WRITING_INDENT.length);
  });

  it("indents each line in a multi-line selection", () => {
    const value = "one\ntwo\nthree";
    const result = applyTabKey(value, 2, 7, false);

    expect(result.value).toBe(`${WRITING_INDENT}one\n${WRITING_INDENT}two\nthree`);
    expect(result.selectionEnd).toBe(7 + WRITING_INDENT.length * 2);
  });

  it("outdents leading spaces on the active line", () => {
    const value = `${WRITING_INDENT}hello`;
    const result = applyTabKey(value, 6, 6, true);

    expect(result.value).toBe("hello");
    expect(result.selectionStart).toBe(2);
  });

  it("outdents each selected line", () => {
    const value = `${WRITING_INDENT}a\n${WRITING_INDENT}b`;
    const result = applyTabKey(value, 0, value.length, true);

    expect(result.value).toBe("a\nb");
  });
});
