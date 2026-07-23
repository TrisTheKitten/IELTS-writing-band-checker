import { describe, expect, it } from "vitest";
import { getWordBandStatus } from "./wordBands.js";

describe("getWordBandStatus", () => {
  it("returns green in the target range for Task 2", () => {
    expect(getWordBandStatus("IELTS Writing Task 2", 280)).toEqual({
      level: "green",
      label: "Good length",
      wordCountOk: true
    });
  });

  it("returns amber below minimum for Task 2", () => {
    expect(getWordBandStatus("IELTS Writing Task 2", 245).level).toBe("amber");
    expect(getWordBandStatus("IELTS Writing Task 2", 245).wordCountOk).toBe(false);
  });

  it("uses Task 1 thresholds", () => {
    expect(getWordBandStatus("IELTS Writing Task 1 (Academic)", 175).level).toBe("green");
    expect(getWordBandStatus("IELTS Writing Task 1 (General)", 130).level).toBe("red");
  });
});
