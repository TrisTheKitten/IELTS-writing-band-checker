import { describe, expect, it } from "vitest";
import {
  DEFAULT_UI_FONT_ID,
  getUiFontOption,
  getUiFontPdfFonts,
  isValidUiFontId
} from "./uiFonts.js";

describe("uiFonts", () => {
  it("falls back to the default font for unknown ids", () => {
    expect(getUiFontOption("unknown").id).toBe(DEFAULT_UI_FONT_ID);
  });

  it("maps inter to weight-based bold styles in pdf", () => {
    const pdfFonts = getUiFontPdfFonts("inter");
    expect(pdfFonts.body).toBe("Inter");
    expect(pdfFonts.boldUsesWeight).toBe(true);
    expect(pdfFonts.register).toHaveLength(2);
  });

  it("maps georgia to times families in pdf", () => {
    const pdfFonts = getUiFontPdfFonts("georgia");
    expect(pdfFonts.body).toBe("Times-Roman");
    expect(pdfFonts.bold).toBe("Times-Bold");
  });

  it("validates known font ids", () => {
    expect(isValidUiFontId("arial")).toBe(true);
    expect(isValidUiFontId("nope")).toBe(false);
  });
});
