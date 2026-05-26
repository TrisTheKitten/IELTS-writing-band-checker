import { useAnimatedNumber } from "../hooks/useAnimatedNumber";
import { formatScore, MAX_SCORE, normalizeScore } from "../lib/scoring";

const CRITERIA = [
  { key: "taskResponse", label: "TR", title: "Task response" },
  { key: "coherenceCohesion", label: "CC", title: "Coherence" },
  { key: "lexicalResource", label: "LR", title: "Lexical resource" },
  { key: "grammarAccuracy", label: "GRA", title: "Grammar" }
];

export function ScoreGrid({ result, animate }) {
  return (
    <div className="score-grid" role="list" aria-label="Criteria scores">
      {CRITERIA.map((criterion, index) => (
        <ScoreCell
          key={criterion.key}
          label={criterion.label}
          title={criterion.title}
          score={result[criterion.key]}
          animate={animate}
          delay={index}
        />
      ))}
    </div>
  );
}

function ScoreCell({ label, title, score, animate, delay }) {
  const animated = useAnimatedNumber(score, 600, animate);
  const displayScore = animate ? animated : score;
  const display = formatScore(displayScore);
  const barWidth = `${(normalizeScore(displayScore) / MAX_SCORE) * 100}%`;

  return (
    <div
      className="score-grid__cell"
      style={{ "--stagger": delay }}
      role="listitem"
      aria-label={`${title}: ${display} out of ${MAX_SCORE}`}
    >
      <div className="score-grid__cell-head">
        <span className="score-grid__badge">{label}</span>
        <span className="score-grid__name">{title}</span>
      </div>
      <div className="score-grid__cell-body">
        <strong className="score-grid__value">{display}</strong>
        <div className="score-grid__meter" aria-hidden="true">
          <div className="score-grid__meter-track">
            <div className="score-grid__meter-fill" style={{ width: barWidth }} />
          </div>
        </div>
      </div>
    </div>
  );
}
