import { AnalysisEmptyPreview } from "./AnalysisEmptyPreview";
import { AnalysisLoading } from "./AnalysisLoading";
import { OverallScoreCard } from "./OverallScoreCard";
import { ScoreGrid } from "./ScoreGrid";
import { Button } from "@/components/ui/button";
import { buildAnalysisBlocks } from "../lib/buildAnalysisBlocks";
import { formatScore } from "../lib/scoring";

export function ResultsPanel({
  result,
  wordBand,
  hasResult,
  isChecking,
  animate,
  onDownloadReportPdf,
  reportPdfError,
  isPdfDownloading
}) {
  if (isChecking) {
    return <AnalysisLoading />;
  }

  if (!hasResult) {
    return (
      <aside className="analysis-sidebar" aria-label="Analysis">
        <header className="analysis-sidebar__head">
          <h2 className="analysis-sidebar__title">Analysis</h2>
        </header>
        <div className="analysis-sidebar__empty">
          <AnalysisEmptyPreview />
          <p className="analysis-sidebar__empty-text">
            Check your essay to see your band and feedback here.
          </p>
        </div>
      </aside>
    );
  }

  const analysisBlocks = buildAnalysisBlocks(result, wordBand);

  return (
    <aside
      className={`analysis-sidebar ${animate ? "analysis-sidebar--animate" : ""}`}
      aria-label="Analysis"
      aria-live="polite"
    >
      <header className="analysis-sidebar__head">
        <h2 className="analysis-sidebar__title">Analysis</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="analysis-sidebar__download"
          disabled={isPdfDownloading}
          onClick={onDownloadReportPdf}
        >
          Download report
        </Button>
      </header>

      {reportPdfError ? (
        <p className="analysis-sidebar__pdf-error" role="alert">
          {reportPdfError}
        </p>
      ) : null}

      <div className="analysis-sidebar__body">
        {result.modelLabel ? (
          <p className="analysis-sidebar__model">Scored with {result.modelLabel}</p>
        ) : null}
        <OverallScoreCard score={result.overall} animate={animate} />
        <ScoreGrid result={result} animate={animate} />

        {analysisBlocks.map((block) => (
          <AnalysisBlock key={analysisBlockKey(block)} block={block} />
        ))}
      </div>
    </aside>
  );
}

function analysisBlockKey(block) {
  if (block.type === "summary") {
    return "summary";
  }

  if (block.type === "diagnostic") {
    return `diagnostic-${block.title}`;
  }

  if (block.type === "criteria") {
    return "criteria";
  }

  return `changes-${block.title}`;
}

function AnalysisBlock({ block }) {
  switch (block.type) {
    case "summary":
      return <p className="analysis-summary">{block.text}</p>;
    case "diagnostic":
      return <DiagnosticChecklistCard title={block.title} items={block.items} />;
    case "criteria":
      return (
        <div className="analysis-cards">
          {block.items.map((criterion, index) => (
            <article key={criterion.name} className="analysis-card" style={{ "--stagger": index }}>
              <header className="analysis-card__head">
                <h3>{criterion.name}</h3>
                <span>{formatScore(criterion.score)}</span>
              </header>
              {criterion.description ? <p>{criterion.description}</p> : null}
              {criterion.points?.length > 0 ? (
                <ul className="analysis-card__points">
                  {criterion.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      );
    case "changes":
      return (
        <div className="analysis-cards">
          <article className="analysis-card">
            <header className="analysis-card__head">
              <h3>{block.title}</h3>
            </header>
            <ul className="analysis-card__changes">
              {block.items.map((item, index) => (
                <li key={`${block.title}-${index}`}>
                  <p>
                    <del>{item.from}</del> → {item.to}
                  </p>
                  {item.reason ? <small>{item.reason}</small> : null}
                </li>
              ))}
            </ul>
          </article>
        </div>
      );
    default:
      return null;
  }
}

function DiagnosticChecklistCard({ title, items }) {
  return (
    <article className="analysis-card diagnostic-checklist">
      <header className="analysis-card__head">
        <h3>{title}</h3>
      </header>
      <ul className="diagnostic-checklist__list">
        {items.map((item) => (
          <li
            key={item.id}
            className={`diagnostic-checklist__item${item.met ? " is-met" : " is-unmet"}`}
          >
            <span className="diagnostic-checklist__status" aria-hidden="true">
              {item.met ? "✓" : "✗"}
            </span>
            <div className="diagnostic-checklist__body">
              <p className="diagnostic-checklist__label">{item.label}</p>
              {item.note ? <p className="diagnostic-checklist__note">{item.note}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
