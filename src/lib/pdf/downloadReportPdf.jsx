import { pdf } from "@react-pdf/renderer";
import { buildReportSections } from "./buildReportSections.js";
import { buildPdfFilename } from "./reportPdfConstants.js";
import { getPdfTheme } from "./pdfTheme.js";
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

  const pdfTheme = getPdfTheme(theme);
  const blob = await pdf(
    <ReportPdfDocument sections={sections} theme={pdfTheme} />
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
