import { useCallback } from "react";
import { applyTabKey } from "../lib/writingShortcuts.js";

export function WritingTextarea({ value, onChange, onKeyDown, ...props }) {
  const handleKeyDown = useCallback(
    (event) => {
      onKeyDown?.(event);

      if (event.defaultPrevented || event.key !== "Tab") {
        return;
      }

      const result = applyTabKey(
        value,
        event.target.selectionStart,
        event.target.selectionEnd,
        event.shiftKey
      );

      event.preventDefault();
      onChange(result.value);

      requestAnimationFrame(() => {
        event.target.selectionStart = result.selectionStart;
        event.target.selectionEnd = result.selectionEnd;
      });
    },
    [onChange, onKeyDown, value]
  );

  return (
    <textarea
      {...props}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={handleKeyDown}
    />
  );
}
