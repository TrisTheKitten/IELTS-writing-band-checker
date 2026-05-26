import { FEATURE_FLAGS, TASK_TYPE_OPTIONS } from "../lib/scoring";
import { OptionCheckbox } from "./OptionCheckbox";

export function OptionPanel({ options, onOptionChange, onToggleFeature }) {
  return (
    <div className="option-panel">
      <div className="option-panel__block">
        <p className="option-panel__title" id="task-type-label">
          Task
        </p>
        <div className="task-segments" role="radiogroup" aria-labelledby="task-type-label">
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
        <p className="option-panel__title" id="feedback-options-label">
          Feedback
        </p>
        <fieldset className="feature-toggles" aria-labelledby="feedback-options-label">
          <legend className="visually-hidden">Feedback options</legend>
          <div className="feature-toggles__list">
            {FEATURE_FLAGS.map((featureFlag) => {
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
