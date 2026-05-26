import { isTask1, MIN_ESSAY_LENGTH } from "../lib/scoring";
import { Button } from "@/components/ui/button";
import { OptionPanel } from "./OptionPanel";
import { PromptImageUpload } from "./PromptImageUpload";

export function CheckerForm({
  topic,
  questionImage,
  essay,
  wordCount,
  options,
  error,
  isChecking,
  canCheck,
  onTopicChange,
  onQuestionImageChange,
  onEssayChange,
  onOptionChange,
  onToggleFeature,
  onClearPrompt,
  onClearEssay,
  onSubmit
}) {
  const usesQuestionImage = isTask1(options.taskType);
  const hasEssay = essay.trim().length >= MIN_ESSAY_LENGTH;

  return (
    <form className="checker-form" onSubmit={(event) => event.preventDefault()}>
      <OptionPanel options={options} onOptionChange={onOptionChange} onToggleFeature={onToggleFeature} />

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
          <textarea
            id="topic-input"
            className="input-box__field input-box__field--prompt"
            value={topic}
            onChange={(event) => onTopicChange(event.target.value)}
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
          <button className="text-btn" type="button" onClick={onClearEssay}>
            Clear
          </button>
        </div>
        <textarea
          id="essay-input"
          className="input-box__field input-box__field--essay"
          value={essay}
          onChange={(event) => onEssayChange(event.target.value)}
          placeholder="Write your essay here..."
        />
        <div className="input-box__footer input-box__footer--stats">
          <span>{wordCount} words</span>
          {!canCheck && essay.trim().length > 0 && essay.trim().length < MIN_ESSAY_LENGTH ? (
            <span className="form-hint">Min {MIN_ESSAY_LENGTH} characters</span>
          ) : null}
        </div>
      </div>

      {usesQuestionImage && !questionImage && hasEssay ? (
        <p className="form-hint">Upload the Task 1 question image to check your score.</p>
      ) : null}

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="checker-form__actions">
        <Button
          type="button"
          className="checker-form__submit"
          disabled={isChecking || !canCheck}
          onClick={onSubmit}
        >
          {isChecking ? "Scoring…" : "Get band score"}
        </Button>
        {wordCount > 0 && (
          <span className="checker-form__word-count">
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
        )}
      </div>
    </form>
  );
}
