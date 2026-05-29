import { useRef, useState } from "react";
import { KeyRound, Play } from "lucide-react";
import { clearGeminiApiKey, getGeminiApiKey, setGeminiApiKey } from "../lib/geminiApiKey";
import { Tooltip } from "./Tooltip";

const GEMINI_API_KEY_TUTORIAL_URL =
  "https://youtu.be/RVGbLSVFtIk?si=D61z1tZ7Ffn9FNwq";

export function ApiKeySettings() {
  const dialogRef = useRef(null);
  const [draftKey, setDraftKey] = useState(() => getGeminiApiKey());
  const [hasKey, setHasKey] = useState(() => Boolean(getGeminiApiKey()));

  function openDialog() {
    setDraftKey(getGeminiApiKey());
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function handleSave() {
    const trimmed = draftKey.trim();

    if (trimmed) {
      setGeminiApiKey(trimmed);
      setHasKey(true);
    } else {
      clearGeminiApiKey();
      setHasKey(false);
    }

    closeDialog();
  }

  function handleClear() {
    clearGeminiApiKey();
    setDraftKey("");
    setHasKey(false);
    closeDialog();
  }

  return (
    <>
      <Tooltip
        align="end"
        placement="bottom"
        content="Add your Gemini API key. Stored in this browser tab on your device only."
      >
        <button
          type="button"
          className="site-bar__control settings-trigger"
          onClick={openDialog}
          aria-haspopup="dialog"
          aria-expanded={false}
        >
          <KeyRound size={16} strokeWidth={1.75} aria-hidden="true" />
          <span>API key</span>
          {hasKey ? <span className="settings-trigger__dot" aria-hidden="true" /> : null}
        </button>
      </Tooltip>

      <dialog ref={dialogRef} className="settings-dialog" aria-labelledby="settings-title">
        <form
          method="dialog"
          className="settings-dialog__panel"
          onSubmit={(event) => {
            event.preventDefault();
            handleSave();
          }}
        >
          <header className="settings-dialog__head">
            <h2 id="settings-title" className="settings-dialog__title">
              API key
            </h2>
            <button
              type="button"
              className="settings-dialog__close"
              onClick={closeDialog}
              aria-label="Close API key"
            >
              Close
            </button>
          </header>

          <section className="settings-dialog__guide" aria-labelledby="settings-guide-title">
            <h3 id="settings-guide-title" className="settings-dialog__guide-title">
              First time here?
            </h3>
            <p className="settings-dialog__guide-lead">
              You need a free key from Google AI Studio. Watch the short video, copy your key,
              then paste it in the box below.
            </p>
            <a
              href={GEMINI_API_KEY_TUTORIAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="settings-dialog__tutorial"
            >
              <Play size={16} strokeWidth={2} aria-hidden="true" />
              Watch tutorial
            </a>
          </section>

          <label className="settings-dialog__field">
            <span className="settings-dialog__label">Paste your key</span>
            <input
              type="password"
              name="geminiApiKey"
              className="settings-dialog__input"
              value={draftKey}
              onChange={(event) => setDraftKey(event.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </label>

          <p className="settings-dialog__hint">
            Stored in this browser tab on your device only. No server or database on this site
            stores your data.
          </p>

          <div className="settings-dialog__actions">
            <button type="submit" className="settings-dialog__primary">
              Save key
            </button>
            <button
              type="button"
              className="settings-dialog__secondary"
              onClick={handleClear}
              disabled={!hasKey && !draftKey.trim()}
            >
              Clear key
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
