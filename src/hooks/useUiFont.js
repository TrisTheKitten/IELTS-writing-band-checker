import { useCallback, useEffect, useState } from "react";
import { getUiFontId, setUiFontId } from "../lib/uiFontPreference.js";

export function useUiFont() {
  const [uiFontId, setUiFontIdState] = useState(() => {
    const initial = getUiFontId();
    setUiFontId(initial);
    return initial;
  });

  useEffect(() => {
    setUiFontId(uiFontId);
  }, [uiFontId]);

  const selectUiFont = useCallback((fontId) => {
    setUiFontIdState(setUiFontId(fontId));
  }, []);

  return { uiFontId, selectUiFont };
}
