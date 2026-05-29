import { useAnimatedNumber } from "../hooks/useAnimatedNumber";
import { formatScore, formatScoreRange, MAX_SCORE, normalizeScore } from "../lib/scoring";

const SCALE_VALUES = Array.from({ length: MAX_SCORE + 1 }, (_, index) => index);

function scalePosition(value) {
  return `${(value / MAX_SCORE) * 100}%`;
}

export function OverallScoreCard({ score, animate }) {
  const animated = useAnimatedNumber(score, 700, animate);
  const displayScore = animate ? animated : score;
  const display = formatScore(displayScore);
  const range = formatScoreRange(score);
  const scalePercent = `${(normalizeScore(displayScore) / MAX_SCORE) * 100}%`;

  return (
    <div className="score-card">
      <span className="score-card__label">Estimated overall</span>

      <div className="score-card__hero">
        <div className="score-card__score-line">
          <strong className="score-card__value" aria-label={`Overall band ${display} out of ${MAX_SCORE}`}>
            {display}
          </strong>
          <span className="score-card__denom" aria-hidden="true">
            / {MAX_SCORE}
          </span>
        </div>
        <div className="score-card__range-block">
          <span className="score-card__range-label">Typical range</span>
          <span className="score-card__range">{range}</span>
        </div>
      </div>

      <div
        className="score-card__scale"
        role="img"
        aria-label={`Band ${display} on a scale of 0 to ${MAX_SCORE}`}
      >
        <div className="score-card__scale-rail">
          <div className="score-card__scale-track">
            {SCALE_VALUES.map((tick) => (
              <span
                key={tick}
                className="score-card__scale-tick"
                style={{ left: scalePosition(tick) }}
                aria-hidden="true"
              />
            ))}
            <div className="score-card__scale-fill" style={{ width: scalePercent }} />
            <div className="score-card__scale-marker" style={{ left: scalePercent }} aria-hidden="true" />
          </div>
          <div className="score-card__scale-labels" aria-hidden="true">
            {SCALE_VALUES.map((tick) => (
              <span
                key={tick}
                className={`score-card__scale-label${
                  tick === 0 ? " score-card__scale-label--min" : ""
                }${tick === MAX_SCORE ? " score-card__scale-label--max" : ""}`}
                style={{ left: scalePosition(tick) }}
              >
                {tick}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
