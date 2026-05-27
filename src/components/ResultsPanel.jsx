import { isFeatureEnabled, isTask1 } from "@shared/ielts-contract.js";
import { AnalysisEmptyPreview } from "./AnalysisEmptyPreview";
import { AnalysisLoading } from "./AnalysisLoading";
import { OverallScoreCard } from "./OverallScoreCard";
import { ScoreGrid } from "./ScoreGrid";
import { buildTask1ChecklistDisplayItems } from "../lib/checklistDisplay";
import { formatScore } from "../lib/scoring";

export function ResultsPanel({
  result,
  enabledFeatureFlags,
  taskType,
  wordBand,
  hasResult,
  isChecking,
  animate
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

  const showSummary = isFeatureEnabled(enabledFeatureFlags, "aiReasoning");
  const showCriteria = isFeatureEnabled(enabledFeatureFlags, "detailedFeedback");
  const showWordChoice = isFeatureEnabled(enabledFeatureFlags, "improveWordChoice");
  const showTask1Checklist =
    isFeatureEnabled(enabledFeatureFlags, "task1Checklist") && isTask1(taskType);
  const showStructureCoach =
    isFeatureEnabled(enabledFeatureFlags, "structureCoach") && !isTask1(taskType);

  const task1Items = showTask1Checklist
    ? buildTask1ChecklistDisplayItems(result.task1Checklist, wordBand)
    : [];

  return (
    <aside
      className={`analysis-sidebar ${animate ? "analysis-sidebar--animate" : ""}`}
      aria-label="Analysis"
      aria-live="polite"
    >
      <header className="analysis-sidebar__head">
        <h2 className="analysis-sidebar__title">Analysis</h2>
      </header>

      <div className="analysis-sidebar__body">
        <OverallScoreCard score={result.overall} animate={animate} />
        <ScoreGrid result={result} animate={animate} />

        {showSummary && result.summary ? <p className="analysis-summary">{result.summary}</p> : null}

        {showStructureCoach && result.structureCoach?.sections?.length > 0 ? (
          <DiagnosticChecklistCard title="Essay structure" items={result.structureCoach.sections} />
        ) : null}

        {showTask1Checklist && task1Items.length > 0 ? (
          <DiagnosticChecklistCard title="Task 1 checklist" items={task1Items} />
        ) : null}

        {showCriteria && result.criteria.length > 0 ? (
          <div className="analysis-cards">
            {result.criteria.map((criterion, index) => (
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
        ) : null}

        <FeedbackSections result={result} showWordChoice={showWordChoice} />
      </div>
    </aside>
  );
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

function FeedbackSections({ result, showWordChoice }) {
  if (!showWordChoice || (result.corrections.length === 0 && result.improvedVocabulary.length === 0)) {
    return null;
  }

  return (
    <div className="analysis-cards">
      {result.corrections.length > 0 ? (
        <article className="analysis-card">
          <header className="analysis-card__head">
            <h3>Grammar fixes</h3>
          </header>
          <ul className="analysis-card__changes">
            {result.corrections.map((correction) => (
              <li key={`${correction.original}-${correction.revised}`}>
                <p>
                  <del>{correction.original}</del> → {correction.revised}
                </p>
                <small>{correction.reason}</small>
              </li>
            ))}
          </ul>
        </article>
      ) : null}
      {result.improvedVocabulary.length > 0 ? (
        <article className="analysis-card">
          <header className="analysis-card__head">
            <h3>Word choice</h3>
          </header>
          <ul className="analysis-card__changes">
            {result.improvedVocabulary.map((item) => (
              <li key={`${item.original}-${item.suggestion}`}>
                <p>
                  <del>{item.original}</del> → {item.suggestion}
                </p>
                <small>{item.reason}</small>
              </li>
            ))}
          </ul>
        </article>
      ) : null}
    </div>
  );
}
