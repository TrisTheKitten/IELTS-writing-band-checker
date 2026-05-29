import { CaseSensitive } from "lucide-react";
import { getUiFontOption, UI_FONT_OPTIONS } from "../lib/uiFonts.js";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel
} from "./ui/DropdownMenu.jsx";

export function FontFamilyMenu({ uiFontId, onSelectUiFont }) {
  const activeFont = getUiFontOption(uiFontId);

  return (
    <DropdownMenu
      align="end"
      menuLabel="UI font"
      trigger={
        <button type="button" className="site-bar__control font-menu-trigger">
          <CaseSensitive size={16} strokeWidth={1.75} aria-hidden="true" />
          <span className="font-menu-trigger__label">{activeFont.label}</span>
        </button>
      }
    >
      <DropdownMenuLabel>UI font</DropdownMenuLabel>
      {UI_FONT_OPTIONS.map((font) => (
        <DropdownMenuItem
          key={font.id}
          selected={font.id === uiFontId}
          onSelect={() => onSelectUiFont(font.id)}
        >
          {font.label}
        </DropdownMenuItem>
      ))}
    </DropdownMenu>
  );
}
