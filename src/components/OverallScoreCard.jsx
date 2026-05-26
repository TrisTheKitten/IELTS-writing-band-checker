import { useAnimatedNumber } from "../hooks/useAnimatedNumber";
import { formatScore, formatScoreRange, MAX_SCORE, normalizeScore } from "../lib/scoring";

export function OverallScoreCard({ score, animate }) {
  const animated = useAnimatedNumber(score, 700, animate);
  const displayScore = animate ? animated : score;
  const display = formatScore(displayScore);
  const range = formatScoreRange(score);
  const scalePercent = `${(normalizeScore(displayScore) / MAX_SCORE) * 100}%`;

  return (
    <div className="score-card">
      <div className="score-card__header">
        <span className="score-card__label">Estimated overall</span>
        <span className="score-card__scale-cap">/ {MAX_SCORE}</span>
      </div>

      <div className="score-card__hero">
        <strong className="score-card__value" aria-label={`Overall band ${display}`}>
          {display}
        </strong>
        <div className="score-card__range-block">
          <span className="score-card__range-label">Typical range</span>
          <span className="score-card__range">{range}</span>
        </div>
      </div>

      <div className="score-card__scale" aria-hidden="true">
        <div className="score-card__scale-track">
          <div className="score-card__scale-fill" style={{ width: scalePercent }} />
          <div className="score-card__scale-marker" style={{ left: scalePercent }} />
        </div>
        <div className="score-card__scale-ends">
          <span>0</span>
          <span>{MAX_SCORE}</span>
        </div>
      </div>
    </div>
  );
}
