import { useMemo } from "react";
import { isTask1, MIN_ESSAY_LENGTH } from "../lib/scoring";
import { estimateCheckCost, formatCostEstimateLine } from "../lib/estimateCheckCost";
import { hasGeminiApiKey } from "../lib/geminiApiKey";
import { Button } from "@/components/ui/button";
import { OptionPanel } from "./OptionPanel";
import { PromptImageUpload } from "./PromptImageUpload";
import { ExamTimerBar } from "./ExamTimerBar";
import { EssayEditorTabs } from "./EssayEditorTabs";
import { WritingTextarea } from "./WritingTextarea";
import { WordLookupPanel } from "./WordLookupPanel";

export function CheckerForm({
  topic,
  questionImage,
  essay,
  wordCount,
  wordBand,
  options,
  effectiveFeatureFlags,
  error,
  isChecking,
  submitState,
  examTimer,
  highlightSuggestions,
  onHighlightSuggestionsChange,
  showHighlightOption,
  result,
  onTopicChange,
  onQuestionImageChange,
  onEssayChange,
  onOptionChange,
  onToggleFeature,
  onExamModeChange,
  onEndExam,
  onClearPrompt,
  onClearEssay,
  onSubmit,
  onDownloadEssayPdf,
  essayPdfError,
  isPdfDownloading
}) {
  const usesQuestionImage = isTask1(options.taskType);
  const { canSubmit, showMinLengthHint, showTask1ImageHint } = submitState;
  const canDownloadEssayPdf = essay.trim().length > 0;

  const costLine = useMemo(() => {
    const estimate = estimateCheckCost({
      essay,
      topic,
      hasQuestionImage: usesQuestionImage && Boolean(questionImage?.base64),
      featureFlags: effectiveFeatureFlags
    });

    if (hasGeminiApiKey()) {
      return formatCostEstimateLine(estimate);
    }

    return "Uses server API key";
  }, [essay, topic, usesQuestionImage, questionImage, effectiveFeatureFlags]);

  return (
    <form className="checker-form" onSubmit={(event) => event.preventDefault()}>
      <OptionPanel
        options={options}
        onOptionChange={onOptionChange}
        onToggleFeature={onToggleFeature}
        onExamModeChange={onExamModeChange}
      />

      {usesQuestionImage ? (
        <PromptImageUpload
          image={questionImage}
          onImageChange={onQuestionImageChange}
          onClear={onClearPrompt}
        />
      ) : (
        <div className="input-box">
          <label className="input-box__label" htmlFor="topic-input">
            Topic
          </label>
          <WritingTextarea
            id="topic-input"
            className="input-box__field input-box__field--prompt"
            value={topic}
            onChange={onTopicChange}
            placeholder="Paste the IELTS question here..."
            rows={3}
          />
          <div className="input-box__footer">
            <button className="text-btn" type="button" onClick={onClearPrompt}>
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="input-box input-box--essay">
        <div className="input-box__head">
          <label className="input-box__label" htmlFor="essay-input">
            Your answer
          </label>
          <div className="input-box__head-actions">
            {options.examMode && examTimer?.isRunning ? (
              <ExamTimerBar
                displayTime={examTimer.displayTime}
                isTimeUp={examTimer.isTimeUp}
                onEndExam={onEndExam}
              />
            ) : null}
            <button className="text-btn" type="button" onClick={onClearEssay}>
              Clear
            </button>
          </div>
        </div>

        <EssayEditorTabs
          highlightSuggestions={highlightSuggestions}
          onHighlightSuggestionsChange={onHighlightSuggestionsChange}
          showHighlightOption={showHighlightOption}
          essay={essay}
          corrections={result.corrections}
          improvedVocabulary={result.improvedVocabulary}
        >
          <WritingTextarea
            id="essay-input"
            className="input-box__field input-box__field--essay"
            value={essay}
            onChange={onEssayChange}
            placeholder="Write your essay here..."
          />
        </EssayEditorTabs>

        <div className="input-box__footer input-box__footer--stats">
          <span className={`word-band word-band--${wordBand.level}`} title={wordBand.label}>
            {wordCount} {wordCount === 1 ? "word" : "words"}
            <span className="word-band__hint">{wordBand.label}</span>
          </span>
          <div className="input-box__footer-actions">
            {showMinLengthHint ? (
              <span className="form-hint">Min {MIN_ESSAY_LENGTH} characters</span>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canDownloadEssayPdf || isPdfDownloading}
              onClick={onDownloadEssayPdf}
            >
              Download essay
            </Button>
          </div>
        </div>
      </div>

      <WordLookupPanel />

      {essayPdfError ? (
        <p className="form-error" role="alert">
          {essayPdfError}
        </p>
      ) : null}

      {showTask1ImageHint ? (
        <p className="form-hint">Upload the Task 1 question image to check your score.</p>
      ) : null}

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="checker-form__actions">
        <div className="checker-form__submit-group">
          <Button
            type="button"
            className="checker-form__submit"
            disabled={isChecking || !canSubmit}
            onClick={onSubmit}
          >
            {isChecking ? "Scoring…" : "Get band score"}
          </Button>
          <p className="checker-form__cost-estimate">{costLine}</p>
        </div>
      </div>
    </form>
  );
}
