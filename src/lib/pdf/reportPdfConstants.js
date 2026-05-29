import { taskTypeToSlug } from "@shared/ielts-contract.js";

export function buildPdfFilename({ mode, taskType }) {
  const kind = mode === "full" ? "report" : "essay";
  const slug = taskTypeToSlug(taskType);
  const date = new Date().toISOString().slice(0, 10);
  return `ielts-writing-${kind}-${slug}-${date}.pdf`;
}
