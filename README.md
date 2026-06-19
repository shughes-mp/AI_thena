# AI_thena

AI_thena is a source-first AI tutoring and formative-evidence platform for reading-based learning.

It combines guided Socratic dialogue for learners with traceable, instructor-reviewed evidence about how learners interpret, explain, apply, and question course material. It is designed as learning support—not an answer engine, hidden grading system, or replacement for instructor judgment.

The active Next.js application is in [`socratic-tutor/`](socratic-tutor/).

## What It Does

### For learners

- Opens with prior knowledge rather than a cold quiz.
- Treats instructor-provided readings as the primary authority.
- Adds broader model knowledge for examples, explanations, connections, and critique only when it is clearly distinguished from the reading.
- Uses one Socratic question at a time.
- Escalates help through an eight-step productive-struggle ladder.
- Supports retrieval, self-explanation, interpretation, evidence use, confidence calibration, misconception repair, transfer, and synthesis.
- Protects assessment materials by coaching reasoning without exposing protected answers.
- Produces an explicitly limited formative summary that the learner can reflect on, correct, or contest.

### For instructors

- Secure Clerk sign-in with session owner, editor, and viewer roles.
- Session setup for purpose, learning outcomes, readings, evidence questions, teaching context, and protected assessments.
- Learner progress and conversation replay.
- Passage-level grounding records for tutor claims.
- Auditable evidence signals with learner-message and source-passage citations.
- Approve, revise, reject, annotate, and supersede review actions with retained history.
- Possible misunderstanding patterns, confidence checks, checkpoint coverage, and qualified learning-outcome evidence.
- Purpose-aware teaching recommendations, reports, heatmaps, and PDF export.

## Source-First, Not Source-Only

Claims about what an assigned reading or author says require support from retrieved source passages. The tutor can still use broader model knowledge when it adds learning value, but it must identify that context rather than presenting it as part of the reading.

Protected assessment content is excluded from normal tutoring context. Answer-extraction attempts receive reasoning support and create an instructor-visible audit record without exposing protected material.

## Evidence And Human Review

AI-generated interpretations are provisional. Consequential evidence retains:

- the learner exchange;
- the relevant source passage;
- confidence and qualification information;
- generation and parser versions;
- instructor review state and history;
- learner-authored reflection or disagreement where available.

The system supports instructor decisions; it does not silently convert model output into a definitive grade or judgment.

## Learning-Cycle Purposes

- **Pre-class:** comprehension and readiness.
- **In-class preparation:** retrieval and activation.
- **In-class reflection:** consolidation and self-explanation.
- **After class:** application and transfer.

## Implementation Status

The implementation roadmap is complete through Phase 4 plus a Phase 4.5 hardening audit:

- **Phase 0:** architecture, terminology, risk, and test baseline.
- **Phase 1:** product, evidence, facilitation, governance, and versioning contracts.
- **Phase 2:** evidence provenance, instructor review, authorization, and learner capabilities.
- **Phase 3:** source grounding, broader-context transparency, passage citations, and assessment protection.
- **Phase 4:** learner orientation, proportional support, purpose-aware tutoring, formative summaries, and learner reflection or correction.
- **Phase 4.5:** dependency and repository security, CI gates, resilient route states, request throttling, owner deletion, and hardening tests.

See the [implementation roadmap](socratic-tutor/AI_thena_implementation_roadmap.md), [phase documentation](socratic-tutor/docs/README.md), and [detailed application README](socratic-tutor/README.md).

## Current Verification

- Production build passes.
- TypeScript and ESLint checks pass.
- 42 automated tests pass.
- The dependency audit reports zero known vulnerabilities.
- GitHub Actions verifies frozen installation, audit, tests, lint, type checking, and production build.
- Tests cover migrations, evidence provenance and review, authentication and authorization, learner capabilities, source grounding, protected assessment behavior, productive struggle, purpose-aware tutoring, formative summaries, learner reflection, rate limiting, deletion, route fallbacks, lazy clients, and schema parity.
- Desktop and mobile learner orientation checks pass without overflow or framework errors.

## Quick Start

Requirements: Node.js, `pnpm`, an Anthropic API key, and a Clerk application for deployed instructor authentication.

```bash
cd socratic-tutor
pnpm install
pnpm exec prisma migrate dev
pnpm dev
```

Copy the placeholder configuration from [`socratic-tutor/.env.example`](socratic-tutor/.env.example) or follow the environment-variable guide in the [application README](socratic-tutor/README.md#environment-variables). Never commit real credentials.

## Technology

- Next.js 16 and React 19
- Prisma 7
- SQLite locally and Turso/libSQL in production
- Anthropic SDK and Vercel AI SDK
- Clerk authentication
- Tailwind CSS 4
- Puppeteer PDF export

## Current Limitations

- This remains an early production prototype.
- Source retrieval currently uses deterministic lexical matching rather than semantic retrieval.
- Broader model knowledge may be incomplete or outdated and is identified separately from assigned readings.
- Assessment protection reduces answer leakage but is not a formal exam-security guarantee.
- AI-generated evidence, summaries, and recommendations require instructor judgment.
- Text extraction works best with text-based PDFs rather than scanned documents.
- In-app request throttling is per running instance; broad public use should also enable Vercel Firewall rate limits.
- Owners can delete sessions and associated learner data. Automated retention and institutional data-export policy remain future governance work.
