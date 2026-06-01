# IELTS Writing Band Checker — domain context

## Glossary

| Term | Meaning |
| --- | --- |
| **Check** | One POST to `/api/check-writing` returning band scores and optional feedback sections. |
| **Word lookup** | Student-initiated English dictionary search while drafting. Uses [Free Dictionary API](https://dictionaryapi.dev/); does not run a **Check** or change band scores. Not the same as post-check word-choice suggestions. |
| **Exam session** | User-enabled practice mode with a countdown (40 min for Task 2, 20 min for Task 1). The timer is informational; scoring is not restricted. |
| **Word band** | Client-only advisory color (red, amber, green) from task-specific word-count thresholds. Never blocks submit. |
| **Marked-up view** | Read-only rendering of the essay with inline highlights for wording fixes; editing stays in the default textarea tab. |
| **Task 1 checklist** | Diagnostic yes/no items for Task 1 (Academic vs General templates). Word count is judged on the client. Always included on checks when Task 1 is selected. |
| **Structure coach** | Diagnostic yes/no sections for Task 2 (introduction, body paragraphs, conclusion). Does not change numeric band scores. Always included on checks when Task 2 is selected. |
| **PDF report** | Client-generated download after a Check. Includes the question (text or Task 1 image), plain essay, and full analysis from the sidebar. |
| **Essay PDF** | Client-generated download of the question and plain essay only (no band scores or feedback). Available whenever the essay has text. |

## Task types

- **Task 2** — Essay (minimum ~250 words for a strong answer).
- **Task 1 Academic** — Report on a chart or diagram (image upload).
- **Task 1 General** — Letter (image upload for the prompt).
