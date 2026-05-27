import { useCallback, useEffect, useRef, useState } from "react";
import { EXAM_DURATION_MS, isTask1 } from "@shared/ielts-contract.js";

function getExamDurationMs(taskType) {
  return isTask1(taskType) ? EXAM_DURATION_MS.task1 : EXAM_DURATION_MS.task2;
}

function formatRemaining(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function useExamTimer({ taskType, onTimeUp }) {
  const [endsAt, setEndsAt] = useState(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const timeUpNotifiedRef = useRef(false);

  const startTimer = useCallback(() => {
    const duration = getExamDurationMs(taskType);
    const nextEndsAt = Date.now() + duration;
    setEndsAt(nextEndsAt);
    setRemainingMs(duration);
    setIsTimeUp(false);
    timeUpNotifiedRef.current = false;
  }, [taskType]);

  const endExam = useCallback(() => {
    setEndsAt(null);
    setRemainingMs(0);
    setIsTimeUp(false);
    timeUpNotifiedRef.current = false;
  }, []);

  useEffect(() => {
    if (!endsAt) {
      return undefined;
    }

    const tick = () => {
      const nextRemaining = endsAt - Date.now();
      setRemainingMs(Math.max(0, nextRemaining));

      if (nextRemaining <= 0 && !timeUpNotifiedRef.current) {
        timeUpNotifiedRef.current = true;
        setIsTimeUp(true);
        onTimeUp?.();
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 250);
    return () => window.clearInterval(intervalId);
  }, [endsAt, onTimeUp]);

  return {
    remainingMs,
    displayTime: formatRemaining(remainingMs),
    isTimeUp,
    isRunning: Boolean(endsAt),
    startTimer,
    endExam,
    resetForTaskType: startTimer
  };
}
