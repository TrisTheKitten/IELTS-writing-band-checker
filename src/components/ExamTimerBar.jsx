export function ExamTimerBar({ displayTime, isTimeUp, onEndExam }) {
  return (
    <div
      className={`exam-timer${isTimeUp ? " exam-timer--time-up" : ""}`}
      role="timer"
      aria-live="polite"
      aria-label={`Exam time remaining ${displayTime}`}
    >
      <span className="exam-timer__clock">{displayTime}</span>
      {isTimeUp ? (
        <span className="exam-timer__nudge">Time&apos;s up</span>
      ) : null}
      <button type="button" className="text-btn exam-timer__end" onClick={onEndExam}>
        End exam
      </button>
    </div>
  );
}
