import { Font } from "@react-pdf/renderer";
import { getUiFontOption } from "../uiFonts.js";

const registeredFontIds = new Set();

export async function ensurePdfFontRegistered(fontId) {
  const font = getUiFontOption(fontId);

  if (!font.pdf.register || registeredFontIds.has(font.id)) {
    return;
  }

  Font.register({
    family: font.pdf.body,
    fonts: font.pdf.register
  });

  registeredFontIds.add(font.id);
}
