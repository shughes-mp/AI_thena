# AI_thena

AI_thena is a source-first AI tutoring and formative-evidence platform for reading-based courses and programs.

Instructors upload course materials and define learning outcomes. Learners work through the material in a guided Socratic dialogue that treats the assigned readings as its primary reference while allowing clearly identified broader context when useful. As learners respond, AI_thena creates traceable evidence about reasoning, possible misunderstandings, confidence, progress, and next teaching moves.

It is not just a chatbot or an automated grader. It is a learning conversation for students, an auditable evidence-review environment for instructors, and a formative signal for programs that care about how learners think.

## At a Glance

| Function | What AI_thena Does |
| --- | --- |
| Teaching | Helps instructors review learner progress, possible misunderstandings, readiness patterns, source evidence, and recommended teaching moves. |
| Learning | Guides learners through source-first dialogue with Socratic questions, confidence checks, proportional help, and reflection. |
| Assessment | Produces qualified formative evidence against instructor-defined outcomes, with citations, confidence explanations, and instructor review controls. |

## How It Works

1. An instructor creates a session.
2. The instructor chooses the session purpose, defines learning outcomes, and uploads source readings.
3. The instructor can add key questions, teaching context, and protected assessment materials.
4. Learners open a shared link, enter their name, and begin a guided chat.
5. The tutor starts with prior knowledge, then asks one Socratic question at a time.
6. Support escalates through an eight-step productive-struggle ladder rather than immediately supplying an answer.
7. A separate diagnostic pass creates provisional, source-linked evidence signals after each exchange.
8. Learners finish with an explicitly limited AI summary that they can reflect on, annotate, or contest.
9. Instructors inspect citations and provenance, then approve, revise, reject, or supersede consequential evidence before using it.

AI_thena can support different moments in the learning cycle:

- `Pre-class`: check comprehension and readiness before class.
- `In-class Prep`: activate retrieval before an activity.
- `In-class Reflection`: consolidate learning through self-explanation.
- `After Class`: push toward transfer and application.

New sessions currently default to `Pre-class`. Instructors can change the session purpose in the session workspace.

## Who It Is For

- Instructors who want better evidence of learner understanding before, during, or after class.
- Adult, executive, and professional learning programs.
- Courses where reading, interpretation, reasoning, and application matter.
- Teams exploring AI-supported tutoring, teaching analytics, and formative assessment.

## What Learners Experience

Learners do not need an account. They open the session link, enter their name, and chat with a tutor grounded in the instructor's uploaded materials.

The tutor and learner experience:

- begins by asking what the learner already knows or believes;
- treats uploaded readings as the primary authority for claims about the course material;
- can add useful broader explanations, examples, and connections when they are clearly distinguished from the reading;
- asks one guiding question at a time;
- escalates help proportionately from current thinking and evidence prompts through hints, limited modeling, and—when justified—direct clarification;
- uses deeper Socratic probing for interpretation, application, and conceptual confusion;
- checks confidence and revisits fragile topics;
- protects uploaded assessment materials by coaching without supplying protected answers;
- ends with a formative learner-facing summary that explicitly states its limitations;
- lets learners add a reflection, correct the summary, or mark it inaccurate or incomplete before instructor review.

A session is available to learners only after it has at least one uploaded source reading and at least one learning outcome.

## What Instructors Can Do

Instructors can:

- create sessions with shareable learner links and access codes;
- sign in securely and control owner, editor, or viewer access to each session;
- upload `.pdf`, `.docx`, `.txt`, and `.md` readings;
- optionally upload protected assessment materials;
- define learning outcomes and session goals;
- choose a session purpose;
- configure tutor stance, exchange limits, and availability dates;
- add key questions manually or generate suggestions from readings;
- monitor learner progress and conversation traces;
- inspect exact source passages behind tutor claims and review protected-material interventions;
- review provisional evidence with approve, revise, reject, annotate, and supersede actions;
- review common misunderstandings across the class;
- generate teaching recommendations;
- review AI-generated reports and export them as PDFs.

## What AI_thena Produces

AI_thena turns learner conversations into instructor-facing evidence:

- learner progress summaries;
- confidence checks;
- qualified topic-understanding signals;
- checkpoint coverage;
- misconception clusters;
- prevalence and resolution rates;
- possible engagement concerns based on observable interaction patterns;
- question difficulty signals;
- 5-minute, 15-minute, and 30-minute teaching recommendations;
- formative learning outcome assessments;
- purpose-aware reports and heatmaps;
- per-student notes and summaries.

These outputs are formative teaching aids. They are designed to help instructors make better decisions, not to replace instructor judgment.

Consequential signals retain learner-message and source-passage provenance. AI-generated interpretations remain provisional until an instructor reviews them, and learner-authored reflection or disagreement is preserved alongside the AI summary.

## Instructor Surfaces

- `Session workspace`: setup, access-code sharing, readings, key questions, teaching context, and assessments.
- `Grounding & protection`: passage-level tutor citations, unsupported-source events, broader-context use, and protected-material interventions.
- `Evidence review`: qualified signals with citations, confidence rationale, review state, and instructor actions.
- `Learner progress`: live or snapshot view of who joined, who may need support, and each learner's conversation trace.
- `Session analysis`: quick brief, full analysis, learner outcomes, misconception patterns, question difficulty, and teaching recommendations.
- `Common misunderstandings`: class-level misconception clusters and recommendation generation.
- `Instructor recommendations`: generated teaching brief/report with heatmaps, next steps, per-student notes, learning outcome review, and PDF export.

## Local Development

### Requirements

- Node.js
- pnpm
- An Anthropic API key
- A Clerk application for instructor sign-in

### Environment Variables

Create a local `.env.local` file inside the app folder.

For local development, set `AI_THENA_USE_LOCAL_DATABASE=1` to guarantee that the app runtime uses `file:./prisma/dev.db`, even when Turso variables are also present. Prisma CLI commands use `LOCAL_DATABASE_URL`, then `DATABASE_URL`, then the fallback configured in `prisma.config.ts`.

```bash
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
LOCAL_DATABASE_URL=file:./prisma/dev.db
DATABASE_URL=file:./prisma/dev.db
# Set to 1 to force local SQLite when Turso variables are also present.
AI_THENA_USE_LOCAL_DATABASE=1
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

Clerk keyless mode can bootstrap local development, but deployed environments must use keys from their Clerk application. Instructor routes and session APIs require Clerk authentication. Learners do not need accounts; the app issues a private capability token when they join and stores only its hash.

Optional production variables:

```bash
TURSO_DATABASE_URL=libsql://your-production-database.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token
# During the first authenticated deployment, assign any pre-existing sessions
# to a known Clerk user. Remove this after verifying the assignment.
LEGACY_SESSION_OWNER_CLERK_USER_ID=user_your_clerk_user_id
```

Optional model overrides:

```bash
ANTHROPIC_MODEL_PRIMARY=claude-sonnet-4-6
ANTHROPIC_MODEL_FAST=claude-haiku-4-5-20251001
```

Do not commit `.env.local`.

### Install and Run

This repository uses `pnpm`. From the app folder:

```bash
pnpm install
pnpm exec prisma migrate dev
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Verification

Useful checks:

```bash
pnpm build
pnpm exec tsc --noEmit
pnpm lint
pnpm test
```

Current status:

- `pnpm build` succeeds.
- `pnpm exec tsc --noEmit` succeeds.
- `pnpm lint` succeeds.
- `pnpm test` currently passes 35 tests covering migrations, evidence provenance and review, authentication and authorization, learner capabilities, source grounding, protected assessment behavior, the productive-struggle ladder, purpose-aware tutoring, formative summaries, and learner reflection.

## Database and Deployment

AI_thena uses two database modes:

- Local development: `better-sqlite3` with `prisma/dev.db`.
- Production: Turso Cloud through Prisma's libsql adapter.

Important details:

- Prisma CLI schema commands use `LOCAL_DATABASE_URL`, `DATABASE_URL`, or the fallback in `prisma.config.ts`.
- Local app runtime uses the Better SQLite adapter when `AI_THENA_USE_LOCAL_DATABASE=1` or no Turso/libsql URL is present.
- Production runtime uses `TURSO_DATABASE_URL` or a `DATABASE_URL` that starts with `libsql://`.
- Production without a Turso/libsql URL throws a configuration error.
- The app includes runtime Turso bootstrap SQL for production tables, indexes, and incremental schema upgrades.

The production build command is:

```bash
prisma generate && next build
```

For Vercel, configure:

- `ANTHROPIC_API_KEY`
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`

For a deployment containing sessions created before Clerk authentication was added, also set `LEGACY_SESSION_OWNER_CLERK_USER_ID` to the Clerk user who should initially own those sessions. Verify the assignments before removing it. New sessions automatically belong to their authenticated creator, and owners can delegate editor or viewer access.

Do not rely on `prisma db push` during the Vercel build for Turso schema creation. Use `npx prisma migrate dev` for local schema work and handle Turso schema rollout as a separate operational step.

## Quick Test Flow

1. Create an instructor session.
2. Choose the session purpose and add at least one learning outcome.
3. Upload a reading.
4. Add key questions manually or generate suggestions from the reading.
5. Copy the learner link and open it in another browser window.
6. Enter a learner name and begin the chat.
7. Have a short tutoring conversation.
8. End the learner session and review the learner summary.
9. Add a learner reflection or mark part of the AI summary inaccurate or incomplete.
10. Return to the instructor workspace and inspect learner progress, grounding, evidence, or session analysis.
11. Review evidence before generating reports, recommendations, misconception patterns, or PDF exports.

## Implementation Status

The implementation roadmap is complete through Phase 4:

- **Phase 0:** architecture, terminology, risk, and test baseline.
- **Phase 1:** product, evidence, facilitation, governance, and versioning contracts.
- **Phase 2:** evidence provenance, instructor review actions, authorization, and learner capabilities.
- **Phase 3:** source-first grounding, passage citations, broader-context transparency, and protected-assessment enforcement.
- **Phase 4:** learner orientation, proportional help, purpose-aware dialogue, formative summaries, and learner reflection or correction.

See the [implementation roadmap](AI_thena_implementation_roadmap.md) and [phase documentation](docs/README.md) for acceptance gates, limitations, and verification details.

## Caveats

- This is an MVP and should be treated as an early production prototype.
- PDF extraction works best with text-based PDFs, not scanned-image PDFs.
- Scanned or image-based PDFs should be converted or replaced with DOCX, TXT, or Markdown.
- The file parser enforces a 10MB upload limit.
- Tutoring quality depends heavily on the quality of uploaded source material and learning outcomes. Broader model knowledge may also be incomplete or outdated and is identified separately from the assigned reading.
- Assessment protection reduces answer leakage but should not be treated as a formal exam-security guarantee.
- AI-generated diagnostics, learning outcome assessments, summaries, and teaching recommendations are formative aids that instructors should review.
- Misconception detection runs after the tutor response, so dashboard updates may lag slightly behind the learner-visible chat.
- Recommendation generation falls back to deterministic cards when structured AI output cannot be parsed.
- Changing the session purpose affects future tutor behavior and future report framing, but it does not retroactively change recorded conversations.
- Live engagement flags are lightweight heuristics, not definitive judgments about learner effort.

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
