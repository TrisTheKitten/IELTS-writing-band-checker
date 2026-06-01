import { ANY_THEME_ID, resolveThemeId } from "@shared/task-themes.js";

const STORAGE_KEY = "ielts.generateThemeId";

export function getGenerateThemeId() {
  if (typeof localStorage === "undefined") {
    return ANY_THEME_ID;
  }

  return resolveThemeId(localStorage.getItem(STORAGE_KEY));
}

export function setGenerateThemeId(themeId) {
  const resolvedId = resolveThemeId(themeId);

  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, resolvedId);
  }

  return resolvedId;
}
