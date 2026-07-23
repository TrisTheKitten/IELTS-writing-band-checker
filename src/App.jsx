import { useCallback, useMemo, useState } from "react";
import { HelpCircle } from "lucide-react";
import { isFeatureEnabled, isTask1 } from "@shared/ielts-contract.js";
import { CheckerForm } from "./components/CheckerForm";
import { ResultsPanel } from "./components/ResultsPanel";
import { ApiKeySettings } from "./components/ApiKeySettings";
import { FontFamilyMenu } from "./components/FontFamilyMenu";
import { GeminiModelMenu } from "./components/GeminiModelMenu";
import { SiteFooter } from "./components/SiteFooter";
import { ThemeToggle } from "./components/ThemeToggle";
import { Tooltip } from "./components/Tooltip";
import { TutorialTour } from "./components/TutorialTour";
import { WorkspaceAnalysisToggle } from "./components/WorkspaceAnalysisToggle";
import { DESKTOP_WORKSPACE_MEDIA, useMediaQuery } from "./hooks/useMediaQuery";
import { useTutorial } from "./hooks/useTutorial";
import { buildGeminiApiKeyHeaders } from "./lib/geminiApiKey";
import { generateTopicQuestion } from "./lib/generateTopic";
import {
  getGenerateThemeId,
  setGenerateThemeId
} from "./lib/generateThemePreference";
import { useTheme } from "./hooks/useTheme";
import { useUiFont } from "./hooks/useUiFont";
import { useGeminiModel } from "./hooks/useGeminiModel";
import { useExamSession } from "./hooks/useExamSession";
import { getWordBandStatus } from "./lib/wordBands";
import {
  API_ENDPOINT,
  DEFAULT_FEEDBACK_LANGUAGE,
  DEFAULT_OPTIONS,
  EMPTY_RESULT,
  getEffectiveFeatureFlags,
  normalizeResult,
  readJsonPayload,
  countWords,
  getSubmitState
} from "./lib/scoring";
export function App() {
  const { theme, toggleTheme } = useTheme();
  const { uiFontId, selectUiFont } = useUiFont();
  const { geminiModelId, selectGeminiModel } = useGeminiModel();
  const [topic, setTopic] = useState("");
  const [questionImage, setQuestionImage] = useState(null);
  const [essay, setEssay] = useState("");
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [result, setResult] = useState(EMPTY_RESULT);
  const [error, setError] = useState("");
  const [essayPdfError, setEssayPdfError] = useState("");
  const [reportPdfError, setReportPdfError] = useState("");
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);
  const [topicError, setTopicError] = useState("");
  const [generateThemeId, setGenerateThemeIdState] = useState(getGenerateThemeId);
  const [hasResult, setHasResult] = useState(false);
  const [animateResults, setAnimateResults] = useState(false);
  const [highlightSuggestions, setHighlightSuggestions] = useState(false);
  const [analysisMinimized, setAnalysisMinimized] = useState(false);
  const isDesktopWorkspace = useMediaQuery(DESKTOP_WORKSPACE_MEDIA);
  const isAnalysisMinimized = isDesktopWorkspace && analysisMinimized;
  const showAnalysisToggle = isDesktopWorkspace;
  const showAnalysisPanel = !isAnalysisMinimized;
  const {
    isOpen: isTutorialOpen,
    stepIndex: tutorialStepIndex,
    steps: tutorialSteps,
    currentStep: tutorialCurrentStep,
    showHint: showTutorialHint,
    start: startTutorial,
    next: nextTutorialStep,
    prev: prevTutorialStep,
    close: closeTutorial,
    skip: skipTutorial
  } = useTutorial();

  const handleTimeUp = useCallback(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification("IELTS exam time", {
        body: "Time's up — you can still check your score."
      });
    }
  }, []);

  const examSession = useExamSession({
    taskType: options.taskType,
    onTimeUp: handleTimeUp
  });

  const wordCount = useMemo(() => countWords(essay), [essay]);
  const wordBand = useMemo(
    () => getWordBandStatus(options.taskType, wordCount),
    [options.taskType, wordCount]
  );
  const taskUsesQuestionImage = isTask1(options.taskType);

  const submitState = useMemo(
    () =>
      getSubmitState({
        essay,
        taskType: options.taskType,
        questionImage,
        isChecking
      }),
    [essay, options.taskType, questionImage, isChecking]
  );

  const effectiveFeatureFlags = useMemo(
    () => getEffectiveFeatureFlags(options.taskType, options.featureFlags),
    [options.taskType, options.featureFlags]
  );

  const showHighlightOption = useMemo(
    () =>
      hasResult &&
      isFeatureEnabled(effectiveFeatureFlags, "improveWordChoice") &&
      (result.corrections.length > 0 || result.improvedVocabulary.length > 0),
    [hasResult, effectiveFeatureFlags, result.corrections, result.improvedVocabulary]
  );

  async function handleGenerateTopic(themeId) {
    if (taskUsesQuestionImage || isGeneratingTopic || isChecking) {
      return;
    }

    const resolvedThemeId = setGenerateThemeId(themeId);
    setGenerateThemeIdState(resolvedThemeId);

    setTopicError("");
    setIsGeneratingTopic(true);

    try {
      const question = await generateTopicQuestion({
        model: geminiModelId,
        previousTopic: topic,
        themeId: resolvedThemeId
      });
      setTopic(question);
    } catch (requestError) {
      setTopicError(requestError.message);
    } finally {
      setIsGeneratingTopic(false);
    }
  }

  async function handleCheckScore() {
    const { canSubmit, blockReason } = getSubmitState({
      essay,
      taskType: options.taskType,
      questionImage,
      isChecking
    });

    if (blockReason) {
      setError(blockReason);
      return;
    }

    if (!canSubmit) {
      return;
    }

    setError("");
    setEssayPdfError("");
    setReportPdfError("");
    setIsChecking(true);
    setAnimateResults(false);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...buildGeminiApiKeyHeaders()
        },
        body: JSON.stringify({
          topic: taskUsesQuestionImage ? "" : topic,
          questionImage: taskUsesQuestionImage ? questionImage : null,
          essay,
          taskType: options.taskType,
          aiLanguage: DEFAULT_FEEDBACK_LANGUAGE,
          featureFlags: effectiveFeatureFlags,
          model: geminiModelId
        })
      });

      const payload = await readJsonPayload(response);

      if (!response.ok) {
        throw new Error(payload.error || "Score check failed. Try again.");
      }

      setResult(normalizeResult(payload, effectiveFeatureFlags));
      setHasResult(true);
      setHighlightSuggestions(false);
      requestAnimationFrame(() => setAnimateResults(true));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsChecking(false);
    }
  }

  function handleOptionChange(key, value) {
    if (key === "taskType") {
      const nextUsesImage = isTask1(value);
      const currentUsesImage = isTask1(options.taskType);

      if (
        !examSession.confirmTaskTypeChange(value, options.taskType, options.examMode)
      ) {
        return;
      }

      if (nextUsesImage !== currentUsesImage) {
        if (nextUsesImage) {
          setTopic("");
          setTopicError("");
        } else {
          setQuestionImage(null);
        }
      }
    }

    setOptions((current) => ({ ...current, [key]: value }));
  }

  function handleExamModeChange(enabled) {
    setOptions((current) => ({ ...current, examMode: enabled }));
    examSession.setExamMode(enabled);
  }

  function handleEndExam() {
    setOptions((current) => ({ ...current, examMode: false }));
    examSession.endExam();
  }

  function toggleFeatureFlag(featureFlagId) {
    setOptions((current) => {
      const selected = current.featureFlags.includes(featureFlagId);
      return {
        ...current,
        featureFlags: selected
          ? current.featureFlags.filter((item) => item !== featureFlagId)
          : [...current.featureFlags, featureFlagId]
      };
    });
  }

  const reportPdfBase = {
    theme,
    topic,
    questionImage,
    essay,
    taskType: options.taskType,
    wordBand,
    result,
    wordCount
  };

  async function handleDownloadPdf(mode) {
    if (isPdfDownloading) {
      return;
    }

    if (mode === "essay" && !essay.trim()) {
      return;
    }

    if (mode === "full" && !hasResult) {
      return;
    }

    if (mode === "essay") {
      setEssayPdfError("");
    } else {
      setReportPdfError("");
    }

    setIsPdfDownloading(true);

    try {
      const { downloadReportPdf } = await import("./lib/pdf/downloadReportPdf.jsx");
      await downloadReportPdf({ ...reportPdfBase, mode });
    } catch (downloadError) {
      const message = downloadError.message || "Could not create PDF. Try again.";
      if (mode === "essay") {
        setEssayPdfError(message);
      } else {
        setReportPdfError(message);
      }
    } finally {
      setIsPdfDownloading(false);
    }
  }

  return (
    <div className="app">
      <header className="site-bar">
        <div className="site-bar__inner">
          <div className="site-bar__brand">
            <span className="site-bar__logo" aria-hidden="true">
              <img src="/favicon.png" alt="" />
            </span>
            <div className="site-bar__text">
              <span className="site-bar__eyebrow">IELTS Writing</span>
              <h1 className="site-bar__title">Band checker</h1>
            </div>
          </div>
          <div className="site-bar__right" data-tour="header-settings">
            <FontFamilyMenu uiFontId={uiFontId} onSelectUiFont={selectUiFont} />
            <GeminiModelMenu
              geminiModelId={geminiModelId}
              onSelectGeminiModel={selectGeminiModel}
              disabled={isChecking}
            />
            <ApiKeySettings />
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <Tooltip
              align="end"
              placement="bottom"
              hintTrigger="auto"
              content="How to use this tool"
            >
              <button
                type="button"
                className="site-bar__control site-bar__control--icon"
                onClick={startTutorial}
                aria-label="Open tutorial"
              >
                <HelpCircle size={18} strokeWidth={1.75} aria-hidden="true" />
                {showTutorialHint ? <span className="tutorial-hint-ring" aria-hidden="true" /> : null}
              </button>
            </Tooltip>
          </div>
        </div>
      </header>

      <div className="tool-shell">
        <div
          className={`workspace${isAnalysisMinimized ? " workspace--analysis-minimized" : ""}`}
        >
          <section className="workspace__editor panel" aria-label="Writing checker">
            {showAnalysisToggle ? (
              <WorkspaceAnalysisToggle
                minimized={isAnalysisMinimized}
                onToggle={() => setAnalysisMinimized((current) => !current)}
              />
            ) : null}
            <CheckerForm
              topic={topic}
              questionImage={questionImage}
              essay={essay}
              wordCount={wordCount}
              wordBand={wordBand}
              options={options}
              error={error}
              isChecking={isChecking}
              submitState={submitState}
              examTimer={examSession.examTimer}
              highlightSuggestions={highlightSuggestions}
              onHighlightSuggestionsChange={setHighlightSuggestions}
              showHighlightOption={showHighlightOption}
              result={result}
              onTopicChange={setTopic}
              onQuestionImageChange={setQuestionImage}
              onEssayChange={setEssay}
              onOptionChange={handleOptionChange}
              onToggleFeature={toggleFeatureFlag}
              onExamModeChange={handleExamModeChange}
              onEndExam={handleEndExam}
              onClearPrompt={() => {
                setTopic("");
                setQuestionImage(null);
                setTopicError("");
              }}
              onGenerateTopic={handleGenerateTopic}
              isGeneratingTopic={isGeneratingTopic}
              generateThemeId={generateThemeId}
              topicError={topicError}
              onClearEssay={() => setEssay("")}
              onSubmit={handleCheckScore}
              effectiveFeatureFlags={effectiveFeatureFlags}
              onDownloadEssayPdf={() => handleDownloadPdf("essay")}
              essayPdfError={essayPdfError}
              isPdfDownloading={isPdfDownloading}
            />
          </section>
          {showAnalysisPanel ? (
            <ResultsPanel
              result={result}
              wordBand={wordBand}
              essay={essay}
              hasResult={hasResult}
              isChecking={isChecking}
              animate={animateResults}
              onDownloadReportPdf={() => handleDownloadPdf("full")}
              reportPdfError={reportPdfError}
              isPdfDownloading={isPdfDownloading}
            />
          ) : null}
        </div>
      </div>
      <SiteFooter />
      <TutorialTour
        isOpen={isTutorialOpen}
        step={tutorialCurrentStep}
        stepIndex={tutorialStepIndex}
        totalSteps={tutorialSteps.length}
        onNext={nextTutorialStep}
        onPrev={prevTutorialStep}
        onSkip={skipTutorial}
        onClose={closeTutorial}
      />
    </div>
  );
}
