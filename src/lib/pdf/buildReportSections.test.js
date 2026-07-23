import { describe, expect, it } from "vitest";
import { buildReportSections, splitSectionsByPage } from "./buildReportSections.js";

const sampleResult = {
  overall: 7,
  taskResponse: 7,
  coherenceCohesion: 6.5,
  lexicalResource: 7,
  grammarAccuracy: 6.5,
  summary: "Solid essay with clear structure.",
  criteria: [
    {
      name: "Task response",
      score: 7,
      description: "Addresses all parts",
      points: ["Clear position"]
    }
  ],
  corrections: [{ original: "go", revised: "went", reason: "Past tense" }],
  improvedVocabulary: [{ original: "good", suggestion: "strong", reason: "More precise" }],
  task1Checklist: [{ id: "overview", label: "Overview present", met: true, note: "" }],
  structureCoach: {
    sections: [{ id: "intro", label: "Introduction", met: true, note: "Clear thesis" }]
  }
};

const emptyAnalysisResult = {
  overall: 7,
  taskResponse: 7,
  coherenceCohesion: 6.5,
  lexicalResource: 7,
  grammarAccuracy: 6.5,
  summary: "",
  criteria: [],
  corrections: [],
  improvedVocabulary: [],
  task1Checklist: [],
  structureCoach: null
};

describe("buildReportSections", () => {
  it("essay mode includes question, essay, and no analysis", () => {
    const sections = buildReportSections({
      mode: "essay",
      topic: "Some people think cities are better.",
      essay: "I partly agree with this view.",
      taskType: "IELTS Writing Task 2",
      wordCount: 8,
      result: sampleResult
    });

    const types = sections.map((section) => section.type);
    expect(types).toContain("questionText");
    expect(types).toContain("essay");
    expect(types).not.toContain("scores");
    expect(types).not.toContain("summary");
  });

  it("full mode includes scores and analysis sections from result data", () => {
    const sections = buildReportSections({
      mode: "full",
      topic: "Some people think cities are better.",
      essay: "I partly agree with this view.",
      taskType: "IELTS Writing Task 2",
      wordCount: 8,
      result: sampleResult
    });

    const types = sections.map((section) => section.type);
    expect(types).toContain("scores");
    expect(types).toContain("summary");
    expect(types).toContain("diagnostic");
    expect(types).toContain("criteriaCards");
    expect(types).toContain("changes");
  });

  it("omits empty analysis sections in full mode", () => {
    const sections = buildReportSections({
      mode: "full",
      topic: "Topic",
      essay: "Essay body here.",
      taskType: "IELTS Writing Task 2",
      wordCount: 3,
      result: emptyAnalysisResult
    });

    const types = sections.map((section) => section.type);
    expect(types).toContain("scores");
    expect(types).not.toContain("summary");
    expect(types).not.toContain("criteriaCards");
    expect(types).not.toContain("changes");
  });

  it("uses question image section for Task 1 when image is present", () => {
    const sections = buildReportSections({
      mode: "essay",
      topic: "",
      questionImage: {
        base64: "abc123",
        mimeType: "image/png",
        name: "chart.png"
      },
      essay: "The chart shows growth.",
      taskType: "IELTS Writing Task 1 (Academic)",
      wordCount: 5,
      result: sampleResult
    });

    const imageSection = sections.find((section) => section.type === "questionImage");
    expect(imageSection).toBeDefined();
    expect(imageSection.src).toBe("data:image/png;base64,abc123");
    expect(sections.some((section) => section.type === "questionText")).toBe(false);
  });

  it("splits full report so analysis always starts on a separate page from the essay", () => {
    const sections = buildReportSections({
      mode: "full",
      topic: "Topic",
      essay: "Essay body here.",
      taskType: "IELTS Writing Task 2",
      wordCount: 3,
      result: sampleResult
    });

    const { essaySections, analysisSections } = splitSectionsByPage(sections);

    expect(essaySections.map((section) => section.type)).toEqual([
      "documentTitle",
      "questionText",
      "essay"
    ]);
    expect(analysisSections[0].type).toBe("scores");
    expect(analysisSections.length).toBeGreaterThan(1);
  });

  it("includes Task 1 checklist instead of structure coach for Task 1", () => {
    const sections = buildReportSections({
      mode: "full",
      topic: "",
      questionImage: {
        base64: "abc",
        mimeType: "image/jpeg"
      },
      essay: "Dear Sir, I am writing regarding the rental.",
      taskType: "IELTS Writing Task 1 (General)",
      wordBand: { level: "green", label: "Good length", wordCountOk: true },
      wordCount: 10,
      result: {
        ...sampleResult,
        structureCoach: null
      }
    });

    const diagnostics = sections.filter((section) => section.type === "diagnostic");
    expect(diagnostics.some((section) => section.title === "Task 1 checklist")).toBe(true);
    expect(diagnostics.some((section) => section.title === "Essay structure")).toBe(false);
  });
});
