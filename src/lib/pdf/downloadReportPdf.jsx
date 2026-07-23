import { pdf } from "@react-pdf/renderer";
import { getUiFontId } from "../uiFontPreference.js";
import { getUiFontPdfFonts } from "../uiFonts.js";
import { buildReportSections } from "./buildReportSections.js";
import { buildPdfFilename } from "./reportPdfConstants.js";
import { getPdfTheme } from "./pdfTheme.js";
import { ensurePdfFontRegistered } from "./registerUiFontForPdf.js";
import { ReportPdfDocument } from "./ReportPdfDocument.jsx";

export async function downloadReportPdf({
  mode,
  theme,
  topic,
  questionImage,
  essay,
  taskType,
  wordBand,
  result,
  wordCount
}) {
  const sections = buildReportSections({
    mode,
    topic,
    questionImage,
    essay,
    taskType,
    wordBand,
    result,
    wordCount
  });

  const uiFontId = getUiFontId();
  await ensurePdfFontRegistered(uiFontId);
  const pdfTheme = getPdfTheme(theme);
  const pdfFonts = getUiFontPdfFonts(uiFontId);
  const blob = await pdf(
    <ReportPdfDocument sections={sections} theme={pdfTheme} pdfFonts={pdfFonts} />
  ).toBlob();

  const filename = buildPdfFilename({ mode, taskType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
