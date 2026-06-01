import { useCallback, useState } from "react";
import { validateLookupWord } from "@shared/dictionary.js";
import { fetchWordEntry } from "../lib/dictionary/fetchWordEntry.js";

const INITIAL_STATE = { status: "idle" };

export function useWordLookup() {
  const [input, setInput] = useState("");
  const [state, setState] = useState(INITIAL_STATE);

  const lookup = useCallback(async () => {
    const validation = validateLookupWord(input);

    if (!validation.ok) {
      setState({ status: "error", message: validation.error });
      return;
    }

    setState({ status: "loading" });

    try {
      const entry = await fetchWordEntry(validation.word);
      setState({ status: "success", entry });
    } catch (error) {
      setState({
        status: "error",
        message: error.message || "Dictionary lookup failed. Try again."
      });
    }
  }, [input]);

  const clear = useCallback(() => {
    setInput("");
    setState(INITIAL_STATE);
  }, []);

  return {
    input,
    setInput,
    lookup,
    clear,
    state,
    isLoading: state.status === "loading"
  };
}
