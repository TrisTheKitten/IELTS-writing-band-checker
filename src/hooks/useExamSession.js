import { useCallback, useRef } from "react";
import { useExamTimer } from "./useExamTimer";

const TASK_CHANGE_CONFIRM_MS = 60 * 1000;

const TASK_CHANGE_CONFIRM_MESSAGE =
  "Change task type? The exam timer will reset to the new task duration.";

export function useExamSession({ taskType, onTimeUp }) {
  const examStartedAtRef = useRef(null);
  const examTimer = useExamTimer({ taskType, onTimeUp });

  const startExam = useCallback(() => {
    examStartedAtRef.current = Date.now();
    examTimer.startTimer();

    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [examTimer]);

  const endExam = useCallback(() => {
    examStartedAtRef.current = null;
    examTimer.endExam();
  }, [examTimer]);

  const setExamMode = useCallback(
    (enabled) => {
      if (enabled) {
        startExam();
      } else {
        endExam();
      }
    },
    [startExam, endExam]
  );

  const confirmTaskTypeChange = useCallback(
    (nextTaskType, currentTaskType, examMode) => {
      if (!examMode || nextTaskType === currentTaskType) {
        return true;
      }

      const elapsed = examStartedAtRef.current ? Date.now() - examStartedAtRef.current : 0;

      if (elapsed > TASK_CHANGE_CONFIRM_MS) {
        const confirmed = window.confirm(TASK_CHANGE_CONFIRM_MESSAGE);

        if (!confirmed) {
          return false;
        }
      }

      examTimer.resetForTaskType();
      examStartedAtRef.current = Date.now();
      return true;
    },
    [examTimer]
  );

  return {
    examTimer,
    setExamMode,
    endExam,
    confirmTaskTypeChange
  };
}
