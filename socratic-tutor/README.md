# Socratic Tutor

Socratic Tutor is an AI-powered learning app that helps learners work through course material with guided questions instead of jumping straight to answers.

The app is built for instructors, adult learners, and professional learners who want a structured way to prepare for class, reflect during class, or apply ideas after class.

## What the App Does

An instructor creates a learning session, uploads one or more readings, defines learning outcomes, optionally adds protected assessment materials, and shares a learner link. Learners join without an account, enter their name, and chat with a Socratic tutor grounded in the uploaded materials.

The tutor asks learners to explain their thinking, checks for misconceptions, tracks repeated attempts, and adapts its support as learners move through the session. Afterward, instructors can review learner progress, misconception patterns, AI-generated teaching recommendations, and purpose-aware reports.

This is not a generic chatbot. It is a reading-grounded tutoring and instructional insight tool.

## Tutoring Approach

The tutor is designed to support learning rather than shortcut it.

- It starts with prior knowledge before moving into reading content.
- It asks one guiding question at a time.
- It distinguishes direct comprehension help from deeper Socratic probing.
- It tracks attempts and escalates support when a learner is stuck.
- It probes confidence and can revisit fragile topics later.
- It logs misconceptions through a separate diagnostic pass after each tutor response.
- It protects uploaded assessment materials by coaching learners without supplying protected answers.
- It strips internal tags and diagnostic notes before content is shown to learners or instructors.

The session purpose changes the tutor's cognitive target:

- `Pre-class`: comprehension and corrected understanding.
- `In-class Prep`: retrieval, activation, and readiness for an upcoming activity.
- `In-class Reflection`: consolidation and self-explanation.
- `After Class`: transfer and application to novel contexts.

New sessions currently default to `Pre-class`. Instructors can change the session purpose in the session workspace under `Session Purpose & Outcomes`.

## Core Features

- Instructor session creation with shareable learner links and access codes.
- Four-step setup framing: session target, source materials, key questions, and sharing.
- Upload support for `.pdf`, `.docx`, `.txt`, and `.md` source and assessment files.
- Reading-grounded learner chat with streaming responses.
- Learner onboarding that starts with prior knowledge rather than immediate recall.
- Purpose-aware tutor behavior across pre-class, in-class, reflection, and after-class uses.
- Configurable learning outcomes, course context, session goal, tutor stance, exchange limit, and open/close times.
- Instructor-authored key questions with process levels, expectations, reading anchors, and misconception seeds.
- AI-generated key-question suggestions derived from uploaded readings.
- AI-assisted question improvement and prerequisite-map suggestions.
- Assessment upload for answer-protection behavior.
- Message limits and phase-based learner progress framing.
- Learner end-session flow with markdown summary and copy support.
- Attempt tracking, confidence checks, topic mastery, soft revisit prompts, and checkpoint coverage.
- Separate post-response diagnostic pipeline for misconception detection, resolution tracking, and engagement flags.
- Instructor learner-progress view with summary rows, lazy-loaded conversation traces, confidence checks, and topic mastery.
- Instructor misconception dashboard with clustering, prevalence, resolution rate, median turns to resolution, severity, and override actions.
- Session analysis view with quick brief, full analysis, learner outcomes, misconception patterns, question difficulty, and recommendations.
- AI-generated teaching recommendations with 5-minute, 15-minute, and 30-minute active learning moves.
- Instructor actions for marking recommendations as used or dismissed.
- AI-generated instructor reports with purpose-aware heatmaps and per-student notes.
- Formative learning outcome assessments with rubric scores, evidence, process metrics, and AI confidence.
- PDF export for instructor reports and session analysis.

## Typical Workflow

### Instructor Flow

1. Create a session by entering a session name.
2. In the session workspace, choose or confirm the session purpose and define at least one learning outcome.
3. Upload one or more source readings.
4. Add key questions manually or generate suggested questions from the source material.
5. Optionally upload assessments the tutor should treat as protected.
6. Optionally add teaching context, a session goal, tutor stance, exchange limit, availability dates, and a prerequisite map.
7. Save settings and copy the learner link.
8. Monitor learner progress as students participate.
9. Review session analysis, common misunderstandings, teaching recommendations, and reports.
10. Export reports to PDF when needed.

### Learner Flow

1. Open the shared session link.
2. If the session is not ready, see a `Session Not Ready Yet` message.
3. Enter a name and begin with no account required.
4. Share prior knowledge before moving into the reading.
5. Work through guided questions, confidence checks, and targeted feedback.
6. End the session and receive a formatted summary.

A session is considered ready for learners only after it has at least one uploaded source reading and at least one learning outcome.

## Instructor Surfaces

- `Session workspace`: setup, access-code sharing, readings, key questions, teaching context, and assessments.
- `Learner progress`: live or snapshot view of who joined, who may need support, and each learner's conversation trace.
- `Session analysis`: quick brief, full analysis, learner outcomes, misconception patterns, question difficulty, and teaching recommendations.
- `Common misunderstandings`: class-level misconception clusters and recommendation generation.
- `Instructor recommendations`: generated teaching brief/report with heatmaps, next steps, per-student notes, learning outcome review, and PDF export.

## Local Development Setup

### Requirements

- Node.js
- npm
- An Anthropic API key

### Environment Variables

Create a local `.env.local` file. For local development, the app runtime uses `file:./prisma/dev.db`; Prisma CLI commands use `LOCAL_DATABASE_URL`, then `DATABASE_URL`, then the fallback configured in `prisma.config.ts`.

```bash
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
LOCAL_DATABASE_URL=file:./prisma/dev.db
DATABASE_URL=file:./prisma/dev.db
```

Optional production variables:

```bash
TURSO_DATABASE_URL=libsql://your-production-database.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token
```

Optional model overrides:

```bash
ANTHROPIC_MODEL_PRIMARY=claude-sonnet-4-6
ANTHROPIC_MODEL_FAST=claude-haiku-4-5-20251001
```

Environment variable notes:

- `ANTHROPIC_API_KEY` is required for tutoring, diagnostics, recommendations, and reports.
- `NEXT_PUBLIC_APP_URL` is useful for generated links.
- `LOCAL_DATABASE_URL` is used by Prisma CLI commands during local schema work.
- `DATABASE_URL` is a local fallback and can also point to `libsql://` in hosted runtime.
- `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are required for Vercel production runtime.
- `ANTHROPIC_MODEL_PRIMARY` overrides the main tutoring/report model.
- `ANTHROPIC_MODEL_FAST` overrides faster diagnostic and suggestion features.

Do not commit `.env.local`.

### Install and Run

```bash
npm install
npx prisma migrate dev
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Verification Commands

```bash
npm run build
npx tsc --noEmit
npm run lint
```

Current status:

- `npm run build` succeeds.
- `npx tsc --noEmit` succeeds.
- `npm run lint` currently reports existing lint issues, including source lint errors and the untracked local `scratch/` helper folder if it is present.

There is currently no `npm test` script. The `tests/model-alias.test.ts` file is a Node test file, but the project does not currently include the `ts-node/register` dependency needed to run it with the obvious command.

## Database Setup

The app uses two database modes:

- Local development: `better-sqlite3` with `prisma/dev.db`.
- Production: Turso Cloud through Prisma's libsql adapter.

Important details:

- Prisma CLI schema commands use `LOCAL_DATABASE_URL`, `DATABASE_URL`, or the fallback in `prisma.config.ts`.
- Local app runtime uses the Better SQLite adapter with `file:./prisma/dev.db`.
- Production runtime uses `TURSO_DATABASE_URL` or a `DATABASE_URL` that starts with `libsql://`.
- Production without a Turso/libsql URL throws a configuration error.
- The app includes runtime Turso bootstrap SQL for production tables, indexes, and incremental schema upgrades.
- Prisma's `driverAdapters` preview flag is still present in the schema, though Prisma reports that the feature is now available without specifying it as preview.

## Production Deployment

This project is set up for deployment on Vercel.

Set these environment variables in Vercel:

- `ANTHROPIC_API_KEY`
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `NEXT_PUBLIC_APP_URL`

The production build command is:

```bash
prisma generate && next build
```

### Schema Changes in Production

Do not rely on `prisma db push` during the Vercel build for Turso schema creation.

Recommended workflow:

- Use `npx prisma migrate dev` for local schema work.
- Let Vercel builds run `prisma generate && next build`.
- Handle Turso schema rollout as a separate operational step.
- Keep the runtime Turso bootstrap path as a safety net for production table and column creation.

## Quick Test Flow

1. Create an instructor session.
2. In the workspace, choose the session purpose and add at least one learning outcome.
3. Upload a reading.
4. Add key questions manually or generate suggestions from the reading.
5. Copy the learner link and open it in another browser window.
6. Enter a learner name and begin the chat.
7. Have a short tutoring conversation.
8. End the learner session and review the generated learner summary.
9. Return to the instructor workspace and open learner progress or session analysis.
10. Generate or review reports, recommendations, misconception patterns, and PDF exports.

## Caveats

- This is an MVP and should be treated as an early production prototype.
- PDF extraction works best with text-based PDFs, not scanned-image PDFs.
- Scanned or image-based PDFs should be converted or replaced with DOCX, TXT, or Markdown.
- The file parser enforces a 10MB upload limit.
- The quality of tutoring depends heavily on the quality of uploaded source material and learning outcomes.
- Assessment protection reduces answer leakage but should not be treated as a formal exam-security guarantee.
- AI-generated diagnostics, learning outcome assessments, summaries, and teaching recommendations are formative aids that instructors should review.
- Misconception detection runs after the tutor response, so dashboard updates may lag slightly behind the learner-visible chat.
- Recommendation generation falls back to deterministic cards when structured AI output cannot be parsed.
- Changing the session purpose affects future tutor behavior and future report framing, but it does not retroactively change recorded conversations.
- Live engagement flags are lightweight heuristics, not definitive judgments about learner effort.
- Fast-path AI features rely on a currently available Anthropic Haiku model. If you override `ANTHROPIC_MODEL_FAST`, make sure the model is available in your Anthropic account.

## Tech Stack

- Next.js 16
- React 19
- Prisma 7
- SQLite for local development
- Turso/libsql for production
- Anthropic SDK and AI SDK
- Tailwind CSS 4
- Puppeteer for PDF export

## Repository Safety

- Keep `.env.local` out of Git.
- Never commit real API keys or Turso tokens.
- Do not commit local database files.
- Use placeholder credentials in examples only.
