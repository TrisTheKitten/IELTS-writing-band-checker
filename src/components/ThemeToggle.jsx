import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={`theme-toggle${isDark ? " is-dark" : ""}`}
      role="switch"
      aria-checked={isDark}
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <Sun className="theme-toggle__icon theme-toggle__icon--sun" size={14} strokeWidth={2} />
        <Moon className="theme-toggle__icon theme-toggle__icon--moon" size={14} strokeWidth={2} />
        <span className="theme-toggle__thumb">
          <Sun className="theme-toggle__thumb-icon theme-toggle__thumb-icon--sun" size={14} strokeWidth={2.25} />
          <Moon className="theme-toggle__thumb-icon theme-toggle__thumb-icon--moon" size={14} strokeWidth={2.25} />
        </span>
      </span>
    </button>
  );
}
