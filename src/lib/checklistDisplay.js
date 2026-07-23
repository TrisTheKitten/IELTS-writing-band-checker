export function buildTask1ChecklistDisplayItems(checklist, wordBand) {
  return [
    ...checklist,
    {
      id: "wordCount",
      label: "Word count OK",
      met: wordBand?.wordCountOk ?? false,
      note: wordBand?.label || ""
    }
  ];
}
