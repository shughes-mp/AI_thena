# Phase 0–4 Hardening Audit

Completed on 2026-06-20 before Phase 5 work began.

## Implemented

- Removed the tracked root `.env`, generated development logs, and duplicate npm lockfile from the current tree.
- Added repository-wide secret and artifact ignore rules.
- Upgraded Next.js, React, Prisma, Clerk, Anthropic/AI SDK, libSQL, Puppeteer, and related packages.
- Added constrained transitive overrides; `pnpm audit` reports zero known vulnerabilities.
- Added a pinned pnpm version and one-command `pnpm check` quality gate.
- Added GitHub Actions checks for frozen installation, dependency audit, tests, lint, type checking, and production build.
- Changed Anthropic and Prisma clients to lazy initialization for build-safe Next.js imports.
- Added root loading, not-found, route error, and global error experiences.
- Added bounded learner-entry and chat request limits with `429` and retry metadata.
- Added an owner-only session deletion API and visible workspace control. Cascading relations remove uploaded materials, learner conversations, evidence, reflections, reports, and audit records.
- Added regression tests for rate limiting, deletion authorization, schema parity, lazy clients, and route fallbacks.
- Added a Turso/Prisma model-parity test to detect new tables missing from bootstrap SQL.

## Security Incident Follow-up

A credential-shaped Anthropic key had been committed in the public repository's root `.env`. The file is removed from the current tree and is scheduled for Git-history purging. The old key must be revoked and replaced in Anthropic, Vercel, and the private app-level `.env.local`; removing it from Git does not make the old credential safe again.

## Deliberately Remaining

- The in-app fixed-window limiter protects each running application instance. Production should also enable Vercel Firewall rate limits for distributed enforcement and alerting.
- Full retention schedules, automated expiry, data export, and institutional privacy policy remain Phase 9 governance work. Owner deletion is now available, but it is not the whole privacy programme.
- The diagnostic pass remains asynchronous. Failures are logged, but durable retry state and privacy-aware quality telemetry remain future observability work.
- Prisma migrations and Turso bootstrap SQL still have two execution paths. The new parity test prevents missing models; full column-level parity and a single migration runner remain open architecture work.
- Browser-level end-to-end, accessibility, calibration, and adversarial evaluation must continue in later phases.
