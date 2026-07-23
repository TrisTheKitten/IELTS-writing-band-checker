const LIGHT = {
  pageBackground: "#f5f3ef",
  surface: "#ffffff",
  text: "#1a1816",
  textMuted: "#7a746d",
  textFaint: "#a8a29c",
  border: "#e2ddd6",
  scoreCardBackground: "#1a1816",
  scoreCardText: "#f5f3ef",
  scoreCardMuted: "#a8a29c"
};

const DARK = {
  pageBackground: "#161514",
  surface: "#1e1c1a",
  text: "#f0ede8",
  textMuted: "#918b84",
  textFaint: "#5c5750",
  border: "#2e2b28",
  scoreCardBackground: "#f0ede8",
  scoreCardText: "#1a1816",
  scoreCardMuted: "#5c5750"
};

export function getPdfTheme(theme) {
  return theme === "dark" ? DARK : LIGHT;
}
