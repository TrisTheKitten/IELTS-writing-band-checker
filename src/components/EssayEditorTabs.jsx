import { useId } from "react";
import { MarkedUpEssayView } from "./MarkedUpEssayView";
import { OptionCheckbox } from "./OptionCheckbox";

const HIGHLIGHT_TOOLTIP =
  "Overlays corrections and vocabulary upgrades on your essay. Turn off to edit your answer.";

export function EssayEditorTabs({
  highlightSuggestions,
  onHighlightSuggestionsChange,
  showHighlightOption,
  essay,
  corrections,
  improvedVocabulary,
  children
}) {
  const checkboxId = useId();
  const showMarkedView = showHighlightOption && highlightSuggestions;

  return (
    <div className="essay-editor-tabs">
      {showHighlightOption ? (
        <div className="essay-editor-tabs__toolbar">
          <OptionCheckbox
            id={checkboxId}
            label="Highlight suggestions"
            tooltip={HIGHLIGHT_TOOLTIP}
            checked={highlightSuggestions}
            variant="pill"
            onChange={() => onHighlightSuggestionsChange(!highlightSuggestions)}
          />
        </div>
      ) : null}

      {showMarkedView ? (
        <MarkedUpEssayView
          essay={essay}
          corrections={corrections}
          improvedVocabulary={improvedVocabulary}
        />
      ) : (
        children
      )}
    </div>
  );
}
