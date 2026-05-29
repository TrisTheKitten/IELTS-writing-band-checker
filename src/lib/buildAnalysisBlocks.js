import { buildTask1ChecklistDisplayItems } from "./checklistDisplay.js";

export function buildAnalysisBlocks(result, wordBand) {
  const blocks = [];

  if (result.summary) {
    blocks.push({ type: "summary", text: result.summary });
  }

  if (result.structureCoach?.sections?.length > 0) {
    blocks.push({
      type: "diagnostic",
      title: "Essay structure",
      items: result.structureCoach.sections
    });
  }

  if (result.task1Checklist?.length > 0) {
    const items = buildTask1ChecklistDisplayItems(result.task1Checklist, wordBand);
    if (items.length > 0) {
      blocks.push({
        type: "diagnostic",
        title: "Task 1 checklist",
        items
      });
    }
  }

  if (result.criteria?.length > 0) {
    blocks.push({ type: "criteria", items: result.criteria });
  }

  if (result.corrections?.length > 0) {
    blocks.push({
      type: "changes",
      title: "Grammar fixes",
      items: result.corrections.map((item) => ({
        from: item.original,
        to: item.revised,
        reason: item.reason || ""
      }))
    });
  }

  if (result.improvedVocabulary?.length > 0) {
    blocks.push({
      type: "changes",
      title: "Word choice",
      items: result.improvedVocabulary.map((item) => ({
        from: item.original,
        to: item.suggestion,
        reason: item.reason || ""
      }))
    });
  }

  return blocks;
}
