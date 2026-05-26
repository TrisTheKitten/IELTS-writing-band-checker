const LOADING_STEPS = [
  "Reading your essay",
  "Scoring band criteria",
  "Preparing feedback"
];

export function AnalysisLoading() {
  return (
    <aside
      className="analysis-sidebar analysis-sidebar--loading"
      aria-label="Analysis"
      aria-busy="true"
      aria-live="polite"
    >
      <header className="analysis-sidebar__head">
        <h2 className="analysis-sidebar__title">Analysis</h2>
      </header>

      <div className="analysis-sidebar__body analysis-loading">
        <div className="analysis-skeleton analysis-skeleton--score" aria-hidden="true">
          <span className="analysis-skeleton__line analysis-skeleton__line--short" />
          <span className="analysis-skeleton__line analysis-skeleton__line--score" />
          <span className="analysis-skeleton__line analysis-skeleton__line--tiny" />
        </div>

        <div className="analysis-skeleton-grid" aria-hidden="true">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="analysis-skeleton analysis-skeleton--cell">
              <span className="analysis-skeleton__line analysis-skeleton__line--tiny" />
              <span className="analysis-skeleton__line analysis-skeleton__line--value" />
              <span className="analysis-skeleton__bar" />
            </div>
          ))}
        </div>

        <div className="analysis-skeleton-stack" aria-hidden="true">
          <div className="analysis-skeleton analysis-skeleton--card">
            <span className="analysis-skeleton__line analysis-skeleton__line--short" />
            <span className="analysis-skeleton__line" />
            <span className="analysis-skeleton__line" />
            <span className="analysis-skeleton__line analysis-skeleton__line--medium" />
          </div>
          <div className="analysis-skeleton analysis-skeleton--card">
            <span className="analysis-skeleton__line analysis-skeleton__line--short" />
            <span className="analysis-skeleton__line" />
            <span className="analysis-skeleton__line analysis-skeleton__line--medium" />
          </div>
        </div>

        <p className="analysis-loading__status">
          {LOADING_STEPS.map((step, index) => (
            <span key={step} style={{ "--step": index }}>
              {step}
            </span>
          ))}
        </p>
      </div>
    </aside>
  );
}
