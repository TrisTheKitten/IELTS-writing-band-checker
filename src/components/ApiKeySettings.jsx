import { useRef, useState } from "react";
import { Settings } from "lucide-react";
import { clearGeminiApiKey, getGeminiApiKey, setGeminiApiKey } from "../lib/geminiApiKey";
import { Tooltip } from "./Tooltip";

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
          className="settings-trigger"
          onClick={openDialog}
          aria-haspopup="dialog"
          aria-expanded={false}
        >
          <Settings size={16} strokeWidth={1.75} aria-hidden="true" />
          <span>Settings</span>
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
              Settings
            </h2>
            <button
              type="button"
              className="settings-dialog__close"
              onClick={closeDialog}
              aria-label="Close settings"
            >
              Close
            </button>
          </header>

          <label className="settings-dialog__field">
            <span className="settings-dialog__label">API key</span>
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
