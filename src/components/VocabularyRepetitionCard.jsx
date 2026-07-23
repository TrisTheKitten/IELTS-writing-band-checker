import { useRef, useState } from "react";
import { WordChipList } from "./WordChipList";
import { fetchSynonyms } from "../lib/synonyms/fetchSynonyms";

function SynonymChips({ state }) {
  if (state.status === "loading") {
    return <p className="vocab-repetition__synonyms-status">Loading synonyms…</p>;
  }

  if (state.status === "error") {
    return (
      <p className="vocab-repetition__synonyms-status vocab-repetition__synonyms-status--error" role="alert">
        {state.message}
      </p>
    );
  }

  if (state.status === "success") {
    if (!state.synonyms.length) {
      return <p className="vocab-repetition__synonyms-status">No synonyms found.</p>;
    }

    return <WordChipList items={state.synonyms} />;
  }

  return null;
}

export function VocabularyRepetitionCard({ title, items }) {
  const [expandedWord, setExpandedWord] = useState(null);
  const [synonymState, setSynonymState] = useState({ status: "idle" });
  const activeRequestRef = useRef(0);

  async function toggleWord(word) {
    if (expandedWord === word) {
      setExpandedWord(null);
      return;
    }

    const requestId = activeRequestRef.current + 1;
    activeRequestRef.current = requestId;

    setExpandedWord(word);
    setSynonymState({ status: "loading" });

    try {
      const synonyms = await fetchSynonyms(word);

      if (activeRequestRef.current !== requestId) {
        return;
      }

      setSynonymState({ status: "success", synonyms });
    } catch (error) {
      if (activeRequestRef.current !== requestId) {
        return;
      }

      setSynonymState({
        status: "error",
        message: error.message || "Synonym lookup failed. Try again."
      });
    }
  }

  return (
    <article className="analysis-card vocab-repetition">
      <header className="analysis-card__head">
        <h3>{title}</h3>
      </header>
      <p className="vocab-repetition__lead">Tap a word to see synonyms</p>
      <ul className="vocab-repetition__list">
        {items.map((item) => {
          const isExpanded = expandedWord === item.word;

          return (
            <li key={item.word} className="vocab-repetition__item">
              <button
                type="button"
                className={`vocab-repetition__word${isExpanded ? " is-expanded" : ""}`}
                aria-expanded={isExpanded}
                onClick={() => toggleWord(item.word)}
              >
                <span className="vocab-repetition__chevron" aria-hidden="true">›</span>
                <span className="vocab-repetition__term">{item.word}</span>
                <span className="vocab-repetition__count">{item.count}×</span>
              </button>
              {isExpanded ? (
                <div className="vocab-repetition__synonyms">
                  <SynonymChips state={synonymState} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
