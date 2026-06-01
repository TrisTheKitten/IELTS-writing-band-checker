import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ANY_THEME_ID } from "@shared/task-themes.js";
import { Button } from "@/components/ui/button";
import { ThemePicker } from "./ThemePicker";
import { Tooltip } from "./Tooltip";

const GENERATE_TOPIC_TOOLTIP =
  "Generate an IELTS Task 2 practice question with AI using your Gemini API key.";

export function GenerateTopicDialog({
  disabled,
  isGenerating,
  generateThemeId,
  onGenerate
}) {
  const dialogRef = useRef(null);
  const [draftThemeId, setDraftThemeId] = useState(ANY_THEME_ID);
  const [filter, setFilter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBusy = disabled || isGenerating || isSubmitting;

  function openDialog() {
    if (isBusy) {
      return;
    }

    setDraftThemeId(generateThemeId || ANY_THEME_ID);
    setFilter("");
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  async function handleGenerate() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    closeDialog();

    try {
      await onGenerate(draftThemeId);
    } finally {
      setIsSubmitting(false);
    }
  }

  const dialog = (
    <dialog
      ref={dialogRef}
      className="generate-dialog"
      aria-labelledby="generate-dialog-title"
      aria-describedby="generate-dialog-desc"
      onClose={() => setFilter("")}
    >
      <div className="generate-dialog__panel">
        <header className="generate-dialog__head">
          <h2 id="generate-dialog-title" className="generate-dialog__title">
            Generate question
          </h2>
          <button
            type="button"
            className="generate-dialog__close"
            onClick={closeDialog}
            disabled={isSubmitting}
            aria-label="Close"
          >
            Close
          </button>
        </header>

        <div className="generate-dialog__body">
          <p id="generate-dialog-desc" className="generate-dialog__lead">
            Choose a theme, then generate. The default picks a random Task 2 topic.
          </p>

          <ThemePicker
            themeId={draftThemeId}
            filter={filter}
            onFilterChange={setFilter}
            onThemeChange={setDraftThemeId}
            disabled={isSubmitting}
          />
        </div>

        <footer className="generate-dialog__actions">
          <button
            type="button"
            className="settings-dialog__primary generate-dialog__submit"
            disabled={isSubmitting}
            onClick={handleGenerate}
          >
            Generate
          </button>
        </footer>
      </div>
    </dialog>
  );

  return (
    <>
      <Tooltip content={GENERATE_TOPIC_TOOLTIP} portaled placement="top" align="end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isBusy}
          onClick={openDialog}
          aria-haspopup="dialog"
        >
          {isGenerating || isSubmitting ? "Generating…" : "Generate question"}
        </Button>
      </Tooltip>

      {typeof document !== "undefined" ? createPortal(dialog, document.body) : null}
    </>
  );
}
