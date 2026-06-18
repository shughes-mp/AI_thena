# Phase 1 Contracts

Status: Complete as of 2026-06-18.

These contracts define the product and epistemic boundaries that Phase 2 and later implementation must obey.

## Contract Set

- [product-contract.md](product-contract.md): intended users, supported uses, prohibited uses, authority, and success criteria.
- [terminology-contract.md](terminology-contract.md): canonical product language, deprecated language, uncertainty language, and migration rules.
- [evidence-contract.md](evidence-contract.md): observations, citations, inferences, evidence levels, confidence, review, aggregation, and display requirements.
- [facilitation-contract.md](facilitation-contract.md): Observer, Guide, Conductor, Recommended Pivot, escalation, release, and instructor control.
- [governance-contract.md](governance-contract.md): identity, authorization, data classes, retention, learner rights, protected materials, and prohibited use.
- [versioning-policy.md](versioning-policy.md): schema, prompt, model, parser, rubric, policy, and facilitation-rule versioning.

## Contract Precedence

When implementation or existing behavior conflicts with these documents:

1. Governance and safety requirements take precedence.
2. The evidence contract determines what claims can be made.
3. The product contract determines intended use.
4. The facilitation contract governs teaching-move recommendations.
5. The terminology contract governs presentation.
6. The versioning policy governs traceability and migration.

Existing code and database names do not override these contracts.

## Change Control

Contract changes require:

- A documented rationale
- Identification of affected records, prompts, APIs, and interfaces
- A version increment where required
- Migration or backward-compatibility treatment
- Updated tests and evaluation fixtures
- Review by the relevant owner roles

## Phase 1 Acceptance Gate

The gate is satisfied because the contract set defines:

- One product purpose and authority model
- One canonical terminology system
- One evidence model separating observation, inference, recommendation, and decision
- One facilitation framework with explicit escalation and release conditions
- One minimum governance baseline
- One versioning and reproducibility policy

Phase 2 must translate these contracts into a provenance and instructor-review data model.

