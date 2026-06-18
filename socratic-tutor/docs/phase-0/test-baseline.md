# Test Baseline And Fixture Catalogue

## Automated Check Results

Recorded on 2026-06-18.

| Check | Result | Notes |
|---|---|---|
| `npx tsc --noEmit` | Pass | Type checking succeeds |
| `npm run build` | Pass | Next.js production build succeeds; all routes compile |
| `node --test tests/model-alias.test.ts` | Pass | One test; original run emitted a module-type warning |
| `npm run lint` | Fail | Original Phase 0 run: 10 errors, 12 warnings |

## Phase 0.5 Remediation

Completed on 2026-06-18:

- Added `npm test`.
- Declared the package as an ES module, removing the Node test warning.
- Excluded the untracked `scratch/` workspace from production lint scope.
- Fixed all source lint errors and warnings without changing educational inference behavior.
- Re-ran all checks successfully.

| Check | Phase 0.5 result |
|---|---|
| `npm run lint` | Pass |
| `npm test` | Pass: 1 test |
| `npx tsc --noEmit` | Pass |
| `npm run build` | Pass |

## Lint Baseline

Errors include:

- Two `require`-import errors in untracked `scratch/` scripts
- `prefer-const` in checkpoint suggestion route
- Explicit `any` in recommendation routes and analysis page
- Unescaped JSX text in misunderstanding page

Warnings include:

- Unused imports/variables
- Missing React hook dependency
- Unused legacy report prompt
- Unused status/card values

These issues were recorded in Phase 0 and resolved in the Phase 0.5 hygiene pass.

## Existing Automated Coverage

The only formal test checks that deprecated Anthropic model aliases do not appear in API source files.

No automated coverage was found for:

- Session creation or configuration
- File upload and parsing
- Source grounding
- Protected assessment behavior
- Chat streaming
- Prompt tag parsing beyond incidental type checking
- Diagnostic JSON parsing
- Misunderstanding creation or resolution
- Confidence collection
- Topic status heuristics
- Checkpoint progression
- Learning outcome evidence
- Report generation and parsing
- Teaching recommendations
- Instructor overrides
- PDF export content
- Authentication or authorization
- Privacy, retention, or deletion
- Accessibility
- Observer/Guide/Conductor logic
- End-to-end instructor or learner workflows

## Phase 0 Fixtures

`tests/fixtures/phase-0-session-scenarios.json` contains four purpose-specific baseline scenarios:

1. Pre-class readiness
2. During-class activation
3. During-class reflection
4. After-class transfer

Each fixture includes:

- Instructor context
- Source passage
- Protected assessment content
- Learning outcomes
- Evidence questions
- Learner exchanges
- Expected observations
- Permissible provisional inferences
- Forbidden conclusions
- Expected misunderstanding and confidence handling
- Expected facilitation mode and escalation/release conditions

The fixtures are specifications, not yet executable tests. They are deliberately written to support Phase 1 contracts and Phase 2 vertical-slice tests.

## Required Test Layers For Subsequent Phases

### Unit

- Parsers and normalizers
- Evidence status transitions
- Opportunity counts
- Confidence semantics
- Facilitation rules
- Report section compatibility

### Integration

- Chat to message persistence
- Diagnostic to evidence record
- Evidence to instructor review
- Reviewed evidence to teaching brief
- Pattern to pivot recommendation
- Protected content to safe response

### End-To-End

- Instructor creates/configures/shares session
- Learner joins/completes/reflects
- Instructor reviews and corrects evidence
- Teaching brief updates from reviewed state
- Export includes provenance and limitations

### Adversarial

- Prompt injection in uploaded files
- Protected-answer extraction
- Unsupported outside knowledge
- Cross-session ID access
- Direct API access without authorization
- Sparse, hostile, and contradictory dialogue

### Evaluation

- Instructor agreement
- False positives/negatives
- Confidence calibration
- Learning quality
- Facilitation appropriateness
- Communication-style and equity analysis
