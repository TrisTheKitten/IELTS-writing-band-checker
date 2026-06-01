import { useId, useMemo } from "react";
import { Check } from "lucide-react";
import {
  ANY_THEME_ID,
  ANY_THEME_LABEL,
  TASK_THEMES
} from "@shared/task-themes.js";

export function ThemePicker({ themeId, filter, onFilterChange, onThemeChange, disabled }) {
  const filterId = useId();

  const visibleThemes = useMemo(() => {
    const query = filter.trim().toLowerCase();

    if (!query) {
      return TASK_THEMES;
    }

    return TASK_THEMES.filter((theme) => theme.label.toLowerCase().includes(query));
  }, [filter]);

  function handleThemeSelect(nextThemeId) {
    if (disabled || nextThemeId === themeId) {
      return;
    }

    onThemeChange(nextThemeId);
  }

  return (
    <div className="theme-picker">
      <label className="visually-hidden" htmlFor={filterId}>
        Filter themes
      </label>
      <input
        id={filterId}
        className="theme-picker__filter"
        type="search"
        value={filter}
        onChange={(event) => onFilterChange(event.target.value)}
        placeholder="Filter themes"
        autoComplete="off"
        disabled={disabled}
      />

      <div className="theme-picker__chips" role="radiogroup" aria-label="Generation theme">
        <ThemeChip
          themeId={ANY_THEME_ID}
          label={ANY_THEME_LABEL}
          isDefaultOption
          selected={themeId === ANY_THEME_ID}
          disabled={disabled}
          onSelect={handleThemeSelect}
        />
        {visibleThemes.map((theme) => (
          <ThemeChip
            key={theme.id}
            themeId={theme.id}
            label={theme.label}
            selected={themeId === theme.id}
            disabled={disabled}
            onSelect={handleThemeSelect}
          />
        ))}
      </div>

      {filter.trim() && visibleThemes.length === 0 ? (
        <p className="theme-picker__empty">No themes match.</p>
      ) : null}
    </div>
  );
}

function ThemeChip({
  themeId,
  label,
  isDefaultOption = false,
  selected,
  disabled,
  onSelect
}) {
  return (
    <label
      className={[
        "theme-chip",
        selected ? "is-selected" : "",
        isDefaultOption ? "theme-chip--default-option" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        type="radio"
        className="theme-chip__input"
        name="generation-theme"
        value={themeId}
        checked={selected}
        disabled={disabled}
        onChange={() => onSelect(themeId)}
      />
      <span className="theme-chip__label">{label}</span>
      {selected ? (
        <Check className="theme-chip__check" size={14} strokeWidth={2.5} aria-hidden="true" />
      ) : null}
    </label>
  );
}
