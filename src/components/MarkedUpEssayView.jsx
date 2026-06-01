import { Tooltip } from "./Tooltip";
import { buildHighlightedSegments } from "../lib/highlightEssay";

export function MarkedUpEssayView({ essay, corrections, improvedVocabulary }) {
  const { segments } = buildHighlightedSegments(essay, corrections, improvedVocabulary);

  if (!essay.trim()) {
    return <p className="marked-up-essay marked-up-essay--empty">Write your essay to see highlights.</p>;
  }

  return (
    <div className="marked-up-essay" aria-label="Marked up essay">
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return <span key={`text-${index}`}>{segment.value}</span>;
        }

        const tooltip = (
          <span>
            <strong>{segment.revised}</strong>
            {segment.reason ? ` — ${segment.reason}` : null}
          </span>
        );

        return (
          <Tooltip key={`mark-${index}-${segment.value}`} content={tooltip} placement="top" hintTrigger="target">
            <mark
              className={`marked-up-essay__mark marked-up-essay__mark--${segment.kind}`}
              tabIndex={0}
            >
              {segment.value}
            </mark>
          </Tooltip>
        );
      })}
    </div>
  );
}
