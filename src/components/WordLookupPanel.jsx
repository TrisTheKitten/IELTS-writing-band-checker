import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "./Tooltip";
import { WordChipList } from "./WordChipList";
import { useWordLookup } from "../hooks/useWordLookup";

const WORD_LOOKUP_TOOLTIP =
  "Type a word and press Look up for synonyms, antonyms, and definitions.";

function LookupResults({ entry }) {
  const hasDefinitions = entry.meanings.some((meaning) => meaning.definitions.length > 0);

  return (
    <div className="word-lookup__results">
      <div className="word-lookup__headline">
        <p className="word-lookup__lemma">{entry.word}</p>
        {entry.phonetic ? (
          <p className="word-lookup__phonetic">{entry.phonetic}</p>
        ) : null}
        {entry.audioUrl ? (
          <audio className="word-lookup__audio" controls preload="none" src={entry.audioUrl} />
        ) : null}
      </div>

      <div className="word-lookup__sections">
        {entry.synonyms.length ? (
          <section className="word-lookup__section">
            <h3 className="word-lookup__section-title">Synonyms</h3>
            <WordChipList items={entry.synonyms} />
          </section>
        ) : null}

        {entry.antonyms.length ? (
          <section className="word-lookup__section">
            <h3 className="word-lookup__section-title">Antonyms</h3>
            <WordChipList items={entry.antonyms} />
          </section>
        ) : null}

        {hasDefinitions ? (
          <details className="word-lookup__definitions-panel">
            <summary className="word-lookup__definitions-summary">Definitions</summary>
            <div className="word-lookup__definitions-body">
              {entry.meanings.map((meaning) =>
                meaning.definitions.length ? (
                  <section
                    key={`${meaning.partOfSpeech}-${meaning.definitions[0]?.definition}`}
                    className="word-lookup__section"
                  >
                    {meaning.partOfSpeech ? (
                      <h4 className="word-lookup__section-title">{meaning.partOfSpeech}</h4>
                    ) : null}
                    <ol className="word-lookup__definitions">
                      {meaning.definitions.map((definition) => (
                        <li key={definition.definition} className="word-lookup__definition">
                          <p>{definition.definition}</p>
                          {definition.example ? (
                            <p className="word-lookup__example">“{definition.example}”</p>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  </section>
                ) : null
              )}
              {entry.origin ? <p className="word-lookup__origin">{entry.origin}</p> : null}
            </div>
          </details>
        ) : null}
      </div>
    </div>
  );
}

export function WordLookupPanel() {
  const fieldId = useId();
  const { input, setInput, lookup, clear, state, isLoading } = useWordLookup();

  function handleLookupKeyDown(event) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    lookup();
  }

  return (
    <details className="word-lookup">
      <summary className="word-lookup__summary">
        <Tooltip content={WORD_LOOKUP_TOOLTIP} hintTrigger="auto" placement="top" align="end">
          <span className="word-lookup__summary-label">Word lookup</span>
        </Tooltip>
      </summary>

      <div className="word-lookup__body">
        <div className="word-lookup__form">
          <label className="word-lookup__label visually-hidden" htmlFor={fieldId}>
            Word
          </label>
          <input
            id={fieldId}
            className="word-lookup__input"
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleLookupKeyDown}
            placeholder="Type a word"
            autoComplete="off"
            spellCheck={false}
          />
          <div className="word-lookup__actions">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={lookup}
            >
              {isLoading ? "Looking up…" : "Look up"}
            </Button>
            {input || state.status !== "idle" ? (
              <button className="text-btn" type="button" onClick={clear}>
                Clear
              </button>
            ) : null}
          </div>
        </div>

        {state.status === "error" ? (
          <p className="word-lookup__message word-lookup__message--error" role="alert">
            {state.message}
          </p>
        ) : null}

        {state.status === "success" ? <LookupResults entry={state.entry} /> : null}
      </div>
    </details>
  );
}
