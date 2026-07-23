import { useCallback, useState } from "react";
import { getGeminiModelId, setGeminiModelId } from "../lib/geminiModelPreference.js";

export function useGeminiModel() {
  const [geminiModelId, setGeminiModelIdState] = useState(() => getGeminiModelId());

  const selectGeminiModel = useCallback((modelId) => {
    setGeminiModelIdState(setGeminiModelId(modelId));
  }, []);

  return { geminiModelId, selectGeminiModel };
}
