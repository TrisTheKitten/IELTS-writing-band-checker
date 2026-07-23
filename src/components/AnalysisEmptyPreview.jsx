import { MAX_SCORE } from "../lib/scoring";

const CRITERIA = ["TR", "CC", "LR", "GRA"];

export function AnalysisEmptyPreview() {
  return (
    <div className="analysis-empty-preview" aria-hidden="true">
      <div className="score-card score-card--placeholder">
        <span className="score-card__label">Estimated overall</span>
        <div className="score-card__hero">
          <div className="score-card__score-line">
            <strong className="analysis-empty-preview__score">—</strong>
            <span className="score-card__denom" aria-hidden="true">
              / {MAX_SCORE}
            </span>
          </div>
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
