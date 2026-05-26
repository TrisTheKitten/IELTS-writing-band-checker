# IELTS Writing Band Checker

Non-commercial, open-source IELTS Writing score checker inspired by Lexibot. Paste or upload a prompt, submit your answer, and get estimated band scores with criteria feedback, corrections, and vocabulary suggestions.

Try here (BYOK) : https://ielts-writing-band-checker.vercel.app/

## Features

- **Task types:** Writing Task 2, Task 1 (Academic), and Task 1 (General)
- **Task 1 charts:** Upload a question image (JPEG, PNG, WebP, or GIF, up to 4 MB)
- **Scoring output:** Overall band plus Task Response, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy
- **Optional feedback:** Band summary, criteria breakdown, and wording fixes
- **Browser or server API key:** Use Settings for a session-only key, or configure the server fallback below
- **Light / dark theme**

## Tech stack

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Gemini API](https://ai.google.dev/) (`generateContent` with JSON response mode)
- Serverless API route at `api/check-writing.js` (Vercel-compatible)

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- A [Gemini API key](https://aistudio.google.com/apikey)

## Setup

```bash
git clone https://github.com/TrisTheKitten/IELTS-writing-band-checker.git
cd IELTS-writing-band-checker
npm install
cp .env.example .env
```

Add your server-side key to `.env`:

```bash
GEMINI_API_KEY=your_key_here
```

See [Environment variables](#environment-variables) for optional settings.

## Environment variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | Yes* | — | Server fallback Gemini API key |
| `GEMINI_MODEL` | No | `gemini-3.1-flash-preview` | Gemini model ID for scoring requests |

\*Not required on the server if every user supplies their own key via **Settings** in the app.

Copy `.env.example` to `.env` for local development. On Vercel or another host, set the same variables in the project environment settings.

### API keys in the browser vs on the server

- **Settings (browser):** Paste a Gemini API key in **Settings** in the header. It is stored in `sessionStorage` for the current tab only and sent on each request via the `x-gemini-api-key` header. It is never stored on the server.
- **Server (production / dev):** Set `GEMINI_API_KEY` in `.env` or your host’s environment. The API uses the request header key when present; otherwise it falls back to `GEMINI_API_KEY`.

Do not commit real API keys. Never put a user’s session key in server `.env` files.

## Scripts

```bash
npm run dev      # Start Vite dev server (includes local /api/check-writing proxy)
npm run build    # Production build to dist/
npm run preview  # Preview the production build
npm run lint     # ESLint
npm run test     # Vitest unit tests
```

## Deployment

Build the frontend with `npm run build`. Deploy to [Vercel](https://vercel.com/) (or a similar platform that supports serverless functions):

1. Import the repository.
2. Set `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`) in project environment variables.
3. Deploy. Vercel serves `dist/` and routes `/api/check-writing` to `api/check-writing.js`.

For local development, the Vite dev server proxies `/api/check-writing` to the same handler—no separate API process is needed.

## How scoring works

The UI posts writing submissions to `/api/check-writing`. The endpoint calls Gemini with structured JSON output and returns IELTS band scores, criteria notes, corrections, and vocabulary suggestions based on the selected task type and feedback options.

## License

[MIT](LICENSE)
