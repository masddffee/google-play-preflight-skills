# play-preflight v1 implementation plan

## Goal and scope
Turn the existing Google Play skill into a local-first CLI and reusable GitHub Action. Preserve the existing repository and MIT license. No attribution trailers, generated-by labels, author fields, or signatures are added.

## Architecture
Use one dependency-free Node.js ESM package rather than a premature monorepo. Separate collection, configuration, versioned policy evaluation, reporters, CLI, and Action adapter. Skills invoke the CLI and interpret evidence, not invent pass/fail results.

## Constraints
- Node.js 22+; GitHub Action uses node24.
- Read-only, offline scans; never evaluate app.config.js, Gradle, plugins, or project scripts.
- BLOCKER is a concrete violated check, not a prediction of Google's decision. Unknown facts remain UNKNOWN; non-applicable checks are SKIP.
- Scope policy by device, submission type, date, and declared extension. Alternative billing is contextual, not automatically prohibited.
- Reports distinguish static evidence, user attestations, and manual review. No credentials, source snippets, analytics, or network requests during scans.
- Exact source references, file/line evidence, dated snapshots; stale policy cannot silently produce a green target-API check.
- npm publication and Marketplace listing are separate from executable GitHub installation.

## Tasks
1. Add failing tests for safe collection, target API dates, static extraction, typed configuration, and UNKNOWN semantics; implement core.
2. Add failing tests for report escaping, CLI flags, errors and exit codes; implement terminal/JSON/Markdown/HTML/SARIF output.
3. Add failing tests for Action outputs, relative SARIF URIs, annotations and failure thresholds; implement node24 Action and CI.
4. Replace outdated checklists/prompts, add four stack fixtures, generated examples, demo, bilingual onboarding and launch kit.
5. Run the full suite, npm pack/install smoke test, Action simulation and source/schema checks. Publish reviewed changes through a feature branch, inspect remote CI, then update the default branch without force.

## Review focus
- Dynamic or conflicting build values must not be guessed.
- Missing metadata is not a proven policy violation.
- Source-only manifest evidence does not cover dependency-injected permissions.
- Untrusted paths, symlinks, ANSI text, HTML and workflow commands cannot escape report boundaries.
- Local runtime/network limitations must not be reported as successful remote verification.
