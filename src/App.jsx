import { useMemo, useState } from "react";
import { BrandMarkIcon } from "./components/icons/BrandMarkIcon";
import { CheckerForm } from "./components/CheckerForm";
import { ResultsPanel } from "./components/ResultsPanel";
import { ApiKeySettings } from "./components/ApiKeySettings";
import { ThemeToggle } from "./components/ThemeToggle";
import { buildGeminiApiKeyHeaders } from "./lib/geminiApiKey";
import { useTheme } from "./hooks/useTheme";
import {
  API_ENDPOINT,
  DEFAULT_FEEDBACK_LANGUAGE,
  DEFAULT_OPTIONS,
  EMPTY_RESULT,
  isTask1,
  MIN_ESSAY_LENGTH,
  normalizeResult,
  readJsonPayload,
  countWords,
  getSubmitBlockReason
} from "./lib/scoring";

export function App() {
  const { theme, toggleTheme } = useTheme();
  const [topic, setTopic] = useState("");
  const [questionImage, setQuestionImage] = useState(null);
  const [essay, setEssay] = useState("");
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [result, setResult] = useState(EMPTY_RESULT);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [animateResults, setAnimateResults] = useState(false);

  const wordCount = useMemo(() => countWords(essay), [essay]);
  const taskUsesQuestionImage = isTask1(options.taskType);
  const hasEssay = essay.trim().length >= MIN_ESSAY_LENGTH;
  const hasQuestionImage = Boolean(questionImage?.base64);
  const canCheck =
    hasEssay && !isChecking && (!taskUsesQuestionImage || hasQuestionImage);

  async function handleCheckScore() {
    const blockReason = getSubmitBlockReason({
      essay,
      taskType: options.taskType,
      questionImage,
      isChecking
    });

    if (blockReason) {
      setError(blockReason);
      return;
    }

    if (!canCheck) {
      return;
    }

    setError("");
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
          featureFlags: options.featureFlags
        })
      });

      const payload = await readJsonPayload(response);

      if (!response.ok) {
        throw new Error(payload.error || "Score check failed. Try again.");
      }

      setResult(normalizeResult(payload, options.featureFlags));
      setHasResult(true);
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

      if (nextUsesImage !== currentUsesImage) {
        if (nextUsesImage) {
          setTopic("");
        } else {
          setQuestionImage(null);
        }
      }
    }

    setOptions((current) => ({ ...current, [key]: value }));
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

  return (
    <div className="app">
      <header className="site-bar">
        <div className="site-bar__inner">
          <div className="site-bar__brand">
            <span className="site-bar__logo" aria-hidden="true">
              <BrandMarkIcon />
            </span>
            <div className="site-bar__text">
              <span className="site-bar__eyebrow">IELTS Writing</span>
              <h1 className="site-bar__title">Band checker</h1>
            </div>
          </div>
          <div className="site-bar__right">
            <ApiKeySettings />
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      <div className="tool-shell">
        <div className="workspace">
          <section className="workspace__editor panel" aria-label="Writing checker">
            <CheckerForm
              topic={topic}
              questionImage={questionImage}
              essay={essay}
              wordCount={wordCount}
              options={options}
              error={error}
              isChecking={isChecking}
              canCheck={canCheck}
              onTopicChange={setTopic}
              onQuestionImageChange={setQuestionImage}
              onEssayChange={setEssay}
              onOptionChange={handleOptionChange}
              onToggleFeature={toggleFeatureFlag}
              onClearPrompt={() => {
                setTopic("");
                setQuestionImage(null);
              }}
              onClearEssay={() => setEssay("")}
              onSubmit={handleCheckScore}
            />
          </section>
          <ResultsPanel
            result={result}
            enabledFeatureFlags={options.featureFlags}
            hasResult={hasResult}
            isChecking={isChecking}
            animate={animateResults}
          />
        </div>
      </div>
    </div>
  );
}
