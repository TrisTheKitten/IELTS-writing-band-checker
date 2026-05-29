export const DEFAULT_UI_FONT_ID = "helvetica";

export const UI_FONT_OPTIONS = [
  {
    id: "helvetica",
    label: "Helvetica Neue",
    cssValue: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    pdf: { body: "Helvetica", bold: "Helvetica-Bold", boldUsesWeight: false }
  },
  {
    id: "system",
    label: "System UI",
    cssValue:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    pdf: { body: "Helvetica", bold: "Helvetica-Bold", boldUsesWeight: false }
  },
  {
    id: "arial",
    label: "Arial",
    cssValue: 'Arial, Helvetica, sans-serif',
    pdf: { body: "Helvetica", bold: "Helvetica-Bold", boldUsesWeight: false }
  },
  {
    id: "segoe",
    label: "Segoe UI",
    cssValue: '"Segoe UI", system-ui, -apple-system, sans-serif',
    pdf: { body: "Helvetica", bold: "Helvetica-Bold", boldUsesWeight: false }
  },
  {
    id: "inter",
    label: "Inter",
    cssValue: '"Inter", system-ui, sans-serif',
    googleFontQuery: "family=Inter:wght@400;500;600;700",
    pdf: {
      body: "Inter",
      bold: "Inter",
      boldUsesWeight: true,
      register: [
        {
          src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff",
          fontWeight: 400
        },
        {
          src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff",
          fontWeight: 700
        }
      ]
    }
  },
  {
    id: "georgia",
    label: "Georgia",
    cssValue: 'Georgia, "Times New Roman", Times, serif',
    pdf: { body: "Times-Roman", bold: "Times-Bold", boldUsesWeight: false }
  }
];

const UI_FONT_BY_ID = new Map(UI_FONT_OPTIONS.map((font) => [font.id, font]));

export function getUiFontOption(fontId) {
  return UI_FONT_BY_ID.get(fontId) ?? UI_FONT_BY_ID.get(DEFAULT_UI_FONT_ID);
}

export function getUiFontPdfFonts(fontId) {
  return getUiFontOption(fontId).pdf;
}

export function isValidUiFontId(fontId) {
  return UI_FONT_BY_ID.has(fontId);
}
