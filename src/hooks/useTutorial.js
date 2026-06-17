import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ielts-tutorial-seen";
const HINT_DURATION_MS = 6000;

const STEPS = [
  {
    id: "welcome",
    title: "Welcome to IELTS Band Checker",
    body: "Get AI band scores and detailed feedback on your IELTS writing in under a minute. This 30-second tour shows you everything you need.",
    target: null,
    placement: "center",
    primaryLabel: "Start tour"
  },
  {
    id: "task-type",
    title: "Pick your task",
    body: "Choose Task 2 (essay), Task 1 Academic (chart report), or Task 1 General (letter). The checker adapts its scoring to the task you select.",
    target: '[data-tour="task-type"]',
    placement: "below",
    primaryLabel: "Next"
  },
  {
    id: "topic-input",
    title: "Add your question",
    body: "Paste the IELTS question here, or click Generate to have one created for you. For Task 1, upload the chart or letter image instead.",
    target: '[data-tour="topic-input"]',
    placement: "below",
    primaryLabel: "Next"
  },
  {
    id: "essay-input",
    title: "Write your essay",
    body: "Type your answer here. The live word count and color band tell you if you've hit the recommended length \u2014 green means you're in the safe zone.",
    target: '[data-tour="essay-input"]',
    placement: "below",
    primaryLabel: "Next"
  },
  {
    id: "word-lookup",
    title: "Look up words while you write",
    body: "Stuck on a word? Search the dictionary here without leaving your essay. It won't affect your score \u2014 it's just there to help you draft.",
    target: '[data-tour="word-lookup"]',
    placement: "below",
    primaryLabel: "Next"
  },
  {
    id: "check-button",
    title: "Get your band score",
    body: "When you're ready, click here. You'll get an overall band score plus scores for each criterion, with actionable feedback.",
    target: '[data-tour="check-button"]',
    placement: "above",
    primaryLabel: "Next"
  },
  {
    id: "analysis-panel",
    title: "Read your feedback",
    body: "Your scores, criterion breakdown, structure checklist, and vocabulary analysis all appear here. Use the toggle to hide the panel when you want more writing space.",
    target: '[data-tour="analysis-panel"]',
    placement: "left",
    primaryLabel: "Next"
  },
  {
    id: "report-download",
    title: "Save your report",
    body: "Download a full PDF report with your question, essay, and all the feedback \u2014 great for tracking progress over time.",
    target: '[data-tour="report-download"]',
    placement: "left",
    primaryLabel: "Next"
  },
  {
    id: "header-settings",
    title: "Make it yours",
    body: "Adjust the font, pick a Gemini model, add your API key, and switch between light and dark themes. You can restart this tour anytime by clicking the ? button.",
    target: '[data-tour="header-settings"]',
    placement: "below",
    primaryLabel: "Done"
  }
];

function hasSeenTutorial() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markTutorialSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    return;
  }
}

export function useTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [showHint, setShowHint] = useState(() => !hasSeenTutorial());

  useEffect(() => {
    if (!showHint) {
      return;
    }
    const timer = setTimeout(() => setShowHint(false), HINT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [showHint]);

  const start = useCallback(() => {
    setShowHint(false);
    setStepIndex(0);
    setIsOpen(true);
  }, []);

  const next = useCallback(() => {
    setStepIndex((current) => {
      if (current >= STEPS.length - 1) {
        markTutorialSeen();
        setIsOpen(false);
        return 0;
      }
      return current + 1;
    });
  }, []);

  const prev = useCallback(() => {
    setStepIndex((current) => Math.max(0, current - 1));
  }, []);

  const close = useCallback(() => {
    markTutorialSeen();
    setIsOpen(false);
    setStepIndex(0);
  }, []);

  const skip = useCallback(() => {
    markTutorialSeen();
    setIsOpen(false);
    setStepIndex(0);
  }, []);

  return {
    isOpen,
    stepIndex,
    steps: STEPS,
    currentStep: STEPS[stepIndex],
    isFirstStep: stepIndex === 0,
    isLastStep: stepIndex === STEPS.length - 1,
    showHint,
    start,
    next,
    prev,
    close,
    skip
  };
}

export { STEPS };
