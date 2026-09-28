---
name: google-play-review-preflight
description: Check Google Play release readiness for Android, Expo, React Native, and Flutter projects by running the play-preflight CLI, inspecting evidence, and separating code/configuration risks from manual Play Console review.
---

# Google Play review preflight

Use this skill when the user asks to review an Android app before Play submission, investigate a likely rejection risk, or add a preflight gate. The skill is an adapter; it is not the scanner and must not invent scan results.

## Run the real tool

Use an already installed `play-preflight`, or run the CLI from its GitHub distribution with Node.js 22+ and Git:

```sh
npx --yes --package="github:masddffee/google-play-preflight-skills#v1" play-preflight scan . --format json
```

Select the actual app root; do not scan the wrong monorepo directory. For reproducible production use, replace `v1` with a reviewed full commit SHA. Installing this skill alone does not install the CLI. If execution is unavailable, say so and label any review **manual, not CLI-verified**.

Exit 0 means the selected failure threshold was not reached. Exit 1 is a completed scan with findings. Exit 2 is an input/execution error and must be resolved before claiming any result. Preserve machine-readable stdout and show the user the evidence.

## Interpret evidence accurately

Report each relevant finding's `ruleId`, `status`, `message`, `evidence`, `fix`, and `source`. Distinguish `static` source observations, caller-supplied `artifact` data, and unverified developer `attestation`.

BLOCKER is a concrete violated check or explicitly declared missing requirement, not a prediction of Google's verdict. UNKNOWN means more context is needed. PASS applies only to the stated evidence and check, never the entire app or store approval. Do not change an UNKNOWN to PASS based on intuition, SDK presence, or lack of a matching string.

## Resolve only the missing context

`.play-preflight.json` accepts non-secret context: device, submission, manifest, profile, privacyPolicyUrl, accountCreation, accountDeletionInApp, accountDeletionUrl, loginRequired, reviewerAccessProvided, digitalGoods, markets, alternativeBillingEnrolled, containsAds, dataSafetyReviewed, adsDeclarationReviewed, targetAudienceReviewed, contentRatingReviewed, nativeChecksReviewed, runtimeChecksReviewed, targetApiExtensionUntil, billingExtensionUntil, and listing.

Omit unknown fields. Never fabricate `reviewed=true` to make a gate green. Do not collect passwords, signing material or test credentials in this file. Store reviewer credentials only through the user's approved Console workflow.

A merged release manifest may resolve final target API or permissions:

```sh
play-preflight scan . --manifest relative/path/from/trusted/build/AndroidManifest.xml --output-dir .play-preflight
```

The scanner never executes dynamic Expo config, Gradle, project scripts or plugins. Ask for trusted build outputs when necessary instead of executing untrusted source with secrets. Never move `--as-of` backward to bypass policy checks.

## Manual review and safe fixes

Use the seven bundled review guides for matters the CLI cannot establish: actual data flows, disclosures, listing truthfulness, content and audience, regional payment eligibility, runtime flows, UGC moderation and review access. Check current official sources. Payment processors and restricted permissions are not automatically prohibited; exceptions and program conditions matter.

Propose minimal fixes supported by evidence. Do not auto-commit, upload builds, change credentials, remove needed permissions, alter product scope, enroll in programs, or bypass policies. If the user authorizes changes, apply them, rerun the same CLI scan and show which findings changed and which remain unresolved. A policy source check is not approval to rewrite policy rules.

## Reference and reporting

The CLI can produce terminal, JSON, Markdown, standalone HTML and SARIF. Use `--fail-on unknown` only when the user wants a strict gate that also fails on missing evidence. For ongoing maintenance, `play-preflight policy check --online` checks official sources without changing rules.

Start the final review with the observed counts and scan scope, then the highest-impact evidence-backed changes and remaining manual work. Never claim a scan ran when it did not, or that the app will pass Google review.
