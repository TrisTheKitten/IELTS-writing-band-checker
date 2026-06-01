export const WRITING_INDENT = "    ";

export function applyTabKey(value, selectionStart, selectionEnd, shiftKey) {
  if (shiftKey) {
    return outdentSelection(value, selectionStart, selectionEnd);
  }

  return indentSelection(value, selectionStart, selectionEnd);
}

function lineIndexAt(value, position) {
  return value.slice(0, position).split("\n").length - 1;
}

function indentSelection(value, selectionStart, selectionEnd) {
  if (selectionStart === selectionEnd) {
    const nextValue =
      value.slice(0, selectionStart) +
      WRITING_INDENT +
      value.slice(selectionEnd);

    return {
      value: nextValue,
      selectionStart: selectionStart + WRITING_INDENT.length,
      selectionEnd: selectionStart + WRITING_INDENT.length
    };
  }

  const lines = value.split("\n");
  const startLine = lineIndexAt(value, selectionStart);
  const endLine = lineIndexAt(value, selectionEnd);
  const linesAffected = endLine - startLine + 1;

  for (let index = startLine; index <= endLine; index += 1) {
    lines[index] = WRITING_INDENT + lines[index];
  }

  return {
    value: lines.join("\n"),
    selectionStart: selectionStart + WRITING_INDENT.length,
    selectionEnd: selectionEnd + WRITING_INDENT.length * linesAffected
  };
}

function outdentSelection(value, selectionStart, selectionEnd) {
  const lines = value.split("\n");
  const startLine = lineIndexAt(value, selectionStart);
  const endLine = lineIndexAt(value, selectionEnd);
  let removedBeforeStart = 0;
  let removedThroughEnd = 0;

  for (let index = startLine; index <= endLine; index += 1) {
    const { text, removed } = outdentLine(lines[index]);
    lines[index] = text;
    removedThroughEnd += removed;

    if (index === startLine) {
      removedBeforeStart = removed;
    }
  }

  return {
    value: lines.join("\n"),
    selectionStart: Math.max(0, selectionStart - removedBeforeStart),
    selectionEnd: Math.max(0, selectionEnd - removedThroughEnd)
  };
}

function outdentLine(line) {
  if (line.startsWith("\t")) {
    return { text: line.slice(1), removed: 1 };
  }

  if (line.startsWith(WRITING_INDENT)) {
    return { text: line.slice(WRITING_INDENT.length), removed: WRITING_INDENT.length };
  }

  let spaceCount = 0;

  while (spaceCount < WRITING_INDENT.length && line[spaceCount] === " ") {
    spaceCount += 1;
  }

  if (spaceCount > 0) {
    return { text: line.slice(spaceCount), removed: spaceCount };
  }

  return { text: line, removed: 0 };
}
