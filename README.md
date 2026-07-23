# IELTS Writing Band Checker

Non-commercial, open-source IELTS Writing score checker inspired by Lexibot. Paste a prompt or upload a Task 1 question image, write your answer, look up words while you draft, and get estimated band scores with optional criteria feedback, corrections, and vocabulary suggestions.

**Live app (bring your own key!):** [ielts-writing-band-checker.vercel.app](https://ielts-writing-band-checker.vercel.app/)

> **Disclaimer:** Results are AI estimates only — not official IELTS scores.

## Features

### Writing tasks

- **Task 2** — essay with a text topic (minimum 120 characters to check)
- **Task 1 (Academic)** — report on a chart or diagram via question image upload
- **Task 1 (General)** — letter via question image upload
- **Task 1 images:** JPEG, PNG, WebP, or GIF, up to 4 MB

### Scoring and feedback

- **Band scores:** overall plus Task Response, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy (0–9 in 0.5 steps)
- **Optional feedback toggles:**
  - Band summary — short note on why the overall band was estimated
  - Criteria breakdown — notes and bullet points per criterion
  - Wording fixes — grammar corrections and stronger word choices
- **Task-specific diagnostics** (always included for the selected task):
  - Task 1 checklist — overview, trends, or letter requirements
  - Essay structure — Task 2 intro, body paragraphs, and conclusion
- **Marked-up essay view** — inline highlights for wording fixes after a check
- **Vocabulary repetition** — counts repeated content words in the checked essay; click a word for dictionary synonyms (does not affect band scores)
- **Word-count band** — advisory red / amber / green indicator by task type (does not block submit)

### Practice tools

- **Word lookup** — collapsible panel below your essay (see [Word lookup](#word-lookup))
- **Exam mode** — countdown timer (40 min for Task 2, 20 min for Task 1); advisory only, scoring stays available
- **PDF downloads:**
  - Essay PDF — question and essay only
  - Report PDF — full analysis from the sidebar after a check

### Header settings

- **Model** — header menu to pick Flash Lite, Flash, or Pro (see [Gemini models](#gemini-models)); active model shown in the analysis sidebar after a check
- **API key** — paste your Gemini key for this browser tab (BYOK)
- **UI font** — Helvetica Neue, System UI, Arial, Segoe UI, Inter, Georgia, Lora, or Comic Sans MS (applies to the app and PDFs)
- **Theme** — light or dark

When you use your own API key, the checker shows a rough input-size estimate before each check.

## Tech stack

| Layer | Choice |
| --- | --- |
| UI | React 19, Vite 7 |
| Styling | Tailwind CSS 4, shadcn-style primitives |
| PDF | `@react-pdf/renderer` (client-side) |
| AI | [Google Gemini API](https://ai.google.dev/) — REST `generateContent` with JSON schema (`v1beta`) |
| Dictionary | [Free Dictionary API](https://dictionaryapi.dev/) — English definitions, synonyms, and antonyms (via app proxy) |
| API | Serverless handlers at [`api/check-writing.js`](api/check-writing.js) and [`api/lookup-word.js`](api/lookup-word.js) (Vercel-compatible) |
| Tests | Vitest |

No database. Shared contracts live in [`shared/`](shared/).

## Project layout

```
api/check-writing.js       # Gemini scoring endpoint
api/lookup-word.js         # Dictionary API proxy
shared/
  ielts-contract.js        # Task types, feature flags, validation limits
  gemini-models.js         # Allowlisted model IDs and labels
  dictionary.js              # Word lookup validation and response normalization
src/
  App.jsx                    # Main shell and check flow
  components/                # UI (checker form, results, WordLookupPanel, header menus)
  hooks/                     # Theme, font, model, exam session, word lookup
  lib/                       # Scoring helpers, PDF, dictionary client, preferences
```

Domain terms are documented in [`CONTEXT.md`](CONTEXT.md).

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- A [Gemini API key](https://aistudio.google.com/apikey) (browser and/or server)

## Setup

```bash
git clone https://github.com/TrisTheKitten/IELTS-writing-band-checker.git
cd IELTS-writing-band-checker
npm install
cp .env.example .env
```

Add a server fallback key to `.env` (optional if every user brings their own key):

```bash
GEMINI_API_KEY=your_key_here
```

Start the dev server:

```bash
npm run dev
```

Vite serves the app and proxies `/api/check-writing` and `/api/lookup-word` to the same handlers used in production — no separate API process.

## Environment variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | Yes* | — | Server fallback Gemini API key |
| `GEMINI_MODEL` | No | `gemini-3.5-flash-lite` | Server fallback model when the client sends no model |

\*Not required on the server if every user supplies a key via **API key** in the header.

Copy [`.env.example`](.env.example) to `.env` for local development. On Vercel or another host, set the same variables in project settings.

### API keys

Resolution order on each request:

1. **`x-gemini-api-key` header** — from the user’s browser session key, if set
2. **`GEMINI_API_KEY`** — from the server environment

**Browser (BYOK):** Open **API key** in the header, paste your key, and save. Stored in `sessionStorage` for the current tab only (`ielts-gemini-api-key`). Never sent to or stored on the server beyond the request header.

**Server:** Set `GEMINI_API_KEY` in `.env` or your host’s environment for a shared fallback (e.g. demo deployments).

Do not commit real API keys.

### Gemini models

Open **Model** in the header and pick Flash Lite, Flash, or Pro before checking. Each option shows speed, cost, and quality tradeoffs in the menu.

| Menu label | Model ID | Typical use |
| --- | --- | --- |
| Flash Lite | `gemini-3.5-flash-lite` | Fast checks, lowest API cost |
| Flash | `gemini-3.6-flash` | Balanced speed, cost, and accuracy (`thinkingLevel: low`) |
| Pro | `gemini-3.1-pro` | Most careful band judgement, highest cost (`thinkingLevel: medium`) |

Resolution order on each request:

1. **`model` in the POST body** — from the user’s header selection (`localStorage` key `ielts-gemini-model`)
2. **`GEMINI_MODEL`** — from the server environment
3. **Default** — `gemini-3.5-flash-lite`

The server allowlists exactly these three IDs. Invalid values return `400`. The response includes `model` and `modelLabel`; the analysis sidebar shows which model scored the essay.

Allowlisted values for `GEMINI_MODEL`:

```
gemini-3.5-flash-lite
gemini-3.6-flash
gemini-3.1-pro
```

### Browser preferences

| Preference | Storage | Key |
| --- | --- | --- |
| Gemini API key | `sessionStorage` | `ielts-gemini-api-key` |
| Gemini model | `localStorage` | `ielts-gemini-model` |
| Theme | `localStorage` | `ielts-theme` |
| UI font | `localStorage` | `ielts-ui-font` |

Essay text, task options, and results are kept in memory only for the current session.

## Scripts

```bash
npm run dev      # Vite dev server + local API proxies
npm run build    # Production build to dist/
npm run preview  # Preview the production build
npm run lint     # ESLint
npm run test     # Vitest unit tests
```

## How scoring works

1. The client POSTs JSON to `/api/check-writing` with `essay`, `taskType`, `featureFlags`, optional `topic` or `questionImage`, and `model`.
2. The handler validates input (min essay length, Task 1 image when required, allowlisted model).
3. It calls Gemini `generateContent` with a structured JSON response schema shaped by the selected task and feedback options.
4. Band scores and optional sections (summary, criteria, corrections, diagnostics) are returned to the client.
5. The results panel normalizes scores to half bands and renders analysis blocks; PDF export runs entirely in the browser.

Feedback language is fixed to **English (UK)** (`DEFAULT_FEEDBACK_LANGUAGE` in [`shared/ielts-contract.js`](shared/ielts-contract.js)).

## Word lookup

Built-in English dictionary for drafting. It does **not** call Gemini and does **not** affect band scores.

1. Expand **Word lookup** under your essay.
2. Type a single English word and press **Look up** or Enter.
3. The client GETs `/api/lookup-word?word=…`; the server proxies [Free Dictionary API](https://dictionaryapi.dev/) and returns a normalized JSON entry.
4. Results show **synonyms** and **antonyms** first (when the API lists them), then an expandable **Definitions** section (up to two definitions per part of speech; stub entries like `(of people)` are omitted).

| | |
| --- | --- |
| API key | None required |
| Lookup type | Forward only — word → meanings (no reverse thesaurus) |
| Input | Single word; letters, hyphens, and apostrophes only |
| vs **Check** | Independent; available before and after scoring |
| vs wording fixes | Gemini suggestions after a check; word lookup is student-initiated |

Domain term: **Word lookup** in [`CONTEXT.md`](CONTEXT.md).

## Deployment

Build the frontend with `npm run build`, then deploy to [Vercel](https://vercel.com/) or any platform with serverless functions:

1. Import the repository.
2. Set `GEMINI_API_KEY` and optionally `GEMINI_MODEL` in environment variables.
3. Deploy. Vercel serves `dist/` and routes `/api/*` to the matching files under `api/`.

Word lookup works out of the box on deploy — no extra environment variables.

## License

[MIT](LICENSE)
