import { isTask1 } from "@shared/ielts-contract.js";
import { buildAnalysisBlocks } from "../buildAnalysisBlocks.js";
import { formatScore, WRITING_CRITERIA } from "../scoring.js";

export const ANALYSIS_SECTION_TYPES = new Set([
  "scores",
  "summary",
  "diagnostic",
  "criteriaCards",
  "changes"
]);

export function splitSectionsByPage(sections) {
  const essaySections = [];
  const analysisSections = [];

  for (const section of sections) {
    if (ANALYSIS_SECTION_TYPES.has(section.type)) {
      analysisSections.push(section);
    } else {
      essaySections.push(section);
    }
  }

  return { essaySections, analysisSections };
}

function pdfSectionBreakForBlock(block, index, blocks) {
  if (block.type === "diagnostic" && block.title === "Essay structure") {
    return true;
  }

  if (block.type === "diagnostic" && block.title === "Task 1 checklist") {
    return !blocks
      .slice(0, index)
      .some((item) => item.type === "diagnostic" && item.title === "Essay structure");
  }

  if (block.type === "criteria") {
    return true;
  }

  if (block.type === "changes" && block.title === "Grammar fixes") {
    return true;
  }

  return false;
}

function analysisBlockToPdfSection(block, index, blocks) {
  const sectionBreak = pdfSectionBreakForBlock(block, index, blocks);

  switch (block.type) {
    case "summary":
      return { type: "summary", text: block.text, sectionBreak };
    case "diagnostic":
      return {
        type: "diagnostic",
        title: block.title,
        items: block.items,
        sectionBreak
      };
    case "criteria":
      return {
        type: "criteriaCards",
        items: block.items.map((criterion) => ({
          name: criterion.name,
          score: formatScore(criterion.score),
          description: criterion.description || "",
          points: Array.isArray(criterion.points) ? criterion.points : []
        })),
        sectionBreak
      };
    case "changes":
      return {
        type: "changes",
        title: block.title,
        items: block.items,
        sectionBreak
      };
    default:
      return null;
  }
}

export function buildReportSections({
  mode,
  topic,
  questionImage,
  essay,
  taskType,
  wordBand,
  result,
  wordCount
}) {
  const sections = [];
  const trimmedEssay = String(essay || "").trim();

  sections.push({
    type: "documentTitle",
    title: mode === "full" ? "Writing report" : "Essay",
    taskType
  });

  if (isTask1(taskType) && questionImage?.base64 && questionImage?.mimeType) {
    sections.push({
      type: "questionImage",
      src: `data:${questionImage.mimeType};base64,${questionImage.base64}`,
      name: questionImage.name || "Question image"
    });
  } else if (String(topic || "").trim()) {
    sections.push({
      type: "questionText",
      text: String(topic).trim()
    });
  }

  sections.push({
    type: "essay",
    text: trimmedEssay,
    wordCount: wordCount ?? 0
  });

  if (mode !== "full" || !result) {
    return sections;
  }

  const criteriaScores = WRITING_CRITERIA.map((criterion) => ({
    ...criterion,
    score: formatScore(result[criterion.key])
  }));

  sections.push({
    type: "scores",
    overall: formatScore(result.overall),
    criteria: criteriaScores
  });

  const analysisBlocks = buildAnalysisBlocks(result, wordBand, trimmedEssay);

  for (let index = 0; index < analysisBlocks.length; index += 1) {
    const pdfSection = analysisBlockToPdfSection(analysisBlocks[index], index, analysisBlocks);
    if (pdfSection) {
      sections.push(pdfSection);
    }
  }

  return sections;
}
