import { useId } from "react";

export function OptionCheckbox({ id, label, checked, onChange, variant = "card", tooltip }) {
  const tooltipId = useId();

  return (
    <label
      className={`option-checkbox option-checkbox--${variant}${checked ? " is-checked" : ""}${tooltip ? " option-checkbox--has-tooltip" : ""}`}
      htmlFor={id}
    >
      <input
        type="checkbox"
        id={id}
        className="option-checkbox__input"
        checked={checked}
        onChange={onChange}
        aria-describedby={tooltip ? tooltipId : undefined}
      />
      <span className="option-checkbox__box" aria-hidden="true">
        <svg
          className="option-checkbox__check"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 6.2L4.8 8.5L9.5 3.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="option-checkbox__label">{label}</span>
      {tooltip ? (
        <span id={tooltipId} role="tooltip" className="ui-tooltip">
          {tooltip}
        </span>
      ) : null}
    </label>
  );
}
