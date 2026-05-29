import {
  DEFAULT_UI_FONT_ID,
  getUiFontOption,
  isValidUiFontId
} from "./uiFonts.js";

const STORAGE_KEY = "ielts-ui-font";
const GOOGLE_FONT_LINK_ID = "ielts-ui-font-stylesheet";

export function getUiFontId() {
  if (typeof localStorage === "undefined") {
    return DEFAULT_UI_FONT_ID;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  return isValidUiFontId(stored) ? stored : DEFAULT_UI_FONT_ID;
}

export function setUiFontId(fontId) {
  const resolvedId = isValidUiFontId(fontId) ? fontId : DEFAULT_UI_FONT_ID;
  applyUiFont(resolvedId);

  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, resolvedId);
  }

  return resolvedId;
}

export function applyUiFont(fontId) {
  const font = getUiFontOption(fontId);
  const root = document.documentElement;

  root.style.setProperty("--font-sans", font.cssValue);
  root.dataset.uiFont = font.id;
  syncGoogleFontStylesheet(font);
}

function syncGoogleFontStylesheet(font) {
  const existing = document.getElementById(GOOGLE_FONT_LINK_ID);

  if (!font.googleFontQuery) {
    existing?.remove();
    return;
  }

  const href = `https://fonts.googleapis.com/css2?${font.googleFontQuery}&display=swap`;

  if (existing) {
    if (existing.href === href) {
      return;
    }

    existing.href = href;
    return;
  }

  const link = document.createElement("link");
  link.id = GOOGLE_FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}
