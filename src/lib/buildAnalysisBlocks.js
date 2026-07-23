import { buildTask1ChecklistDisplayItems } from "./checklistDisplay.js";
import { analyzeVocabularyRepetition } from "./vocabularyRepetition.js";

function buildSummaryBlock(result) {
  if (!result.summary) {
    return null;
  }

  return { type: "summary", text: result.summary };
}

function buildStructureCoachBlock(result) {
  if (!result.structureCoach?.sections?.length) {
    return null;
  }

  return {
    type: "diagnostic",
    title: "Essay structure",
    items: result.structureCoach.sections
  };
}

function buildGrammarFixesBlock(result) {
  if (!result.corrections?.length) {
    return null;
  }

  return {
    type: "changes",
    title: "Grammar fixes",
    items: result.corrections.map((item) => ({
      from: item.original,
      to: item.revised,
      reason: item.reason || ""
    }))
  };
}

function buildWordChoiceBlock(result) {
  if (!result.improvedVocabulary?.length) {
    return null;
  }

  return {
    type: "changes",
    title: "Word choice",
    items: result.improvedVocabulary.map((item) => ({
      from: item.original,
      to: item.suggestion,
      reason: item.reason || ""
    }))
  };
}

function buildVocabularyRepetitionBlock(essay) {
  const vocabularyRepetition = analyzeVocabularyRepetition(essay);

  if (!vocabularyRepetition.items.length) {
    return null;
  }

  return {
    type: "vocabularyRepetition",
    title: "Vocabulary repetition",
    items: vocabularyRepetition.items
  };
}

function buildTask1ChecklistBlock(result, wordBand) {
  if (!result.task1Checklist?.length) {
    return null;
  }

  const items = buildTask1ChecklistDisplayItems(result.task1Checklist, wordBand);

  if (!items.length) {
    return null;
  }

  return {
    type: "diagnostic",
    title: "Task 1 checklist",
    items
  };
}

function buildCriteriaBlock(result) {
  if (!result.criteria?.length) {
    return null;
  }

  return { type: "criteria", items: result.criteria };
}

export function buildAnalysisBlocks(result, wordBand, essay = "") {
  return [
    buildSummaryBlock(result),
    buildStructureCoachBlock(result),
    buildGrammarFixesBlock(result),
    buildWordChoiceBlock(result),
    buildVocabularyRepetitionBlock(essay),
    buildTask1ChecklistBlock(result, wordBand),
    buildCriteriaBlock(result)
  ].filter(Boolean);
}
