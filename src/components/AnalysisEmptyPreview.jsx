import { MAX_SCORE } from "../lib/scoring";

const CRITERIA = ["TR", "CC", "LR", "GRA"];

export function AnalysisEmptyPreview() {
  return (
    <div className="analysis-empty-preview" aria-hidden="true">
      <div className="score-card score-card--placeholder">
        <div className="score-card__header">
          <span className="score-card__label">Estimated overall</span>
          <span className="score-card__scale-cap">/ {MAX_SCORE}</span>
        </div>
        <div className="score-card__hero">
          <strong className="analysis-empty-preview__score">—</strong>
        </div>
      </div>

      <div className="score-grid score-grid--placeholder">
        {CRITERIA.map((label) => (
          <div key={label} className="score-grid__cell score-grid__cell--placeholder">
            <div className="score-grid__cell-head">
              <span className="score-grid__badge">{label}</span>
            </div>
            <div className="score-grid__cell-body">
              <strong className="analysis-empty-preview__score">—</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
