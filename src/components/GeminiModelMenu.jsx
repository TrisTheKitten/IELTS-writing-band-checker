import {
  GEMINI_MODEL_MENU_INTRO,
  GEMINI_MODEL_OPTIONS,
  GEMINI_MODEL_TRIGGER_TOOLTIP
} from "@shared/gemini-models.js";
import {
  DropdownMenu,
  DropdownMenuDescription,
  DropdownMenuItem,
  DropdownMenuLabel
} from "./ui/DropdownMenu.jsx";

export function GeminiModelMenu({ geminiModelId, onSelectGeminiModel, disabled = false }) {
  return (
    <DropdownMenu
      align="end"
      menuLabel="Gemini model"
      className="dropdown-menu--gemini-model"
      triggerTooltip={GEMINI_MODEL_TRIGGER_TOOLTIP}
      trigger={
        <button
          type="button"
          className="site-bar__control gemini-model-trigger"
          disabled={disabled}
          aria-label="Gemini model"
        >
          <img
            src="/gemini-icon.png"
            alt=""
            className="gemini-model-trigger__icon"
            width={16}
            height={16}
            decoding="async"
          />
          <span className="gemini-model-trigger__label">Model</span>
        </button>
      }
    >
      <DropdownMenuLabel>Gemini model</DropdownMenuLabel>
      <DropdownMenuDescription>{GEMINI_MODEL_MENU_INTRO}</DropdownMenuDescription>
      {GEMINI_MODEL_OPTIONS.map((model) => (
        <DropdownMenuItem
          key={model.id}
          hint={model.menuHint}
          tooltip={model.tooltip}
          selected={model.id === geminiModelId}
          onSelect={() => onSelectGeminiModel(model.id)}
        >
          {model.label}
        </DropdownMenuItem>
      ))}
    </DropdownMenu>
  );
}
