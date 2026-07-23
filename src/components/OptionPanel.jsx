import { TASK_TYPE_OPTIONS, USER_TOGGLEABLE_FEATURE_FLAGS } from "../lib/scoring";
import { OptionCheckbox } from "./OptionCheckbox";

export function OptionPanel({ options, onOptionChange, onToggleFeature, onExamModeChange }) {
  return (
    <div className="option-panel">
      <div className="option-panel__block">
        <p className="option-panel__title" id="task-type-label">
          Task
        </p>
        <div className="task-segments" role="radiogroup" aria-labelledby="task-type-label" data-tour="task-type">
          {TASK_TYPE_OPTIONS.map((taskOption) => {
            const isSelected = options.taskType === taskOption.value;

            return (
              <label
                key={taskOption.value}
                className={`task-segment${isSelected ? " is-selected" : ""}`}
              >
                <input
                  type="radio"
                  name="task-type"
                  className="task-segment__input"
                  value={taskOption.value}
                  checked={isSelected}
                  onChange={() => onOptionChange("taskType", taskOption.value)}
                />
                <span className="task-segment__label">{taskOption.label}</span>
                <span className="task-segment__hint">{taskOption.hint}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="option-panel__block">
        <p className="option-panel__title" id="practice-label">
          Practice
        </p>
        <OptionCheckbox
          id="exam-mode"
          label="Exam mode"
          tooltip="Task 2: 40 min · Task 1: 20 min. Timer is advisory; scoring stays available."
          checked={options.examMode}
          variant="pill"
          onChange={() => onExamModeChange(!options.examMode)}
        />
      </div>

      <div className="option-panel__block">
        <p className="option-panel__title" id="feedback-options-label">
          Feedback
        </p>
        <fieldset className="feature-toggles" aria-labelledby="feedback-options-label">
          <legend className="visually-hidden">Feedback options</legend>
          <div className="feature-toggles__list">
            {USER_TOGGLEABLE_FEATURE_FLAGS.map((featureFlag) => {
              const id = `feature-${featureFlag.id}`;
              const checked = options.featureFlags.includes(featureFlag.id);

              return (
                <OptionCheckbox
                  key={featureFlag.id}
                  id={id}
                  label={featureFlag.label}
                  tooltip={featureFlag.description}
                  checked={checked}
                  variant="pill"
                  onChange={() => onToggleFeature(featureFlag.id)}
                />
              );
            })}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
