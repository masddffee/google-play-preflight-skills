# Contributing

Use Node.js 22+. No runtime or test dependencies need to be installed.

```sh
npm run check
npm test
npm run smoke
npm run demo
```

A rule change needs a stable rule ID, an official source, a date/device/submission applicability explanation, a positive test, a negative test and an ambiguous-input test. Demonstrate the failure before fixing it. Explain whether evidence is static, an artifact, or an attestation. Never convert missing evidence to PASS or assume restricted permissions/payment SDKs are automatically forbidden.

Policy updates belong in `rules/policy.json` with reviewed dates and boundary tests. The scheduled source watcher is a review signal, not an automatic policy editor. Do not update `reviewedOn` simply because a page returned HTTP 200. Recheck policy text and exceptions. Keep scoped limits in `docs/rules.md` and the self-contained skill aligned.

Fixtures must be synthetic or explicitly permitted and sanitized. Do not claim they establish real-world precision/recall. No invented testimonials, benchmarks or approval guarantees. File false-positive/negative issues with a minimal reproducible fixture, rule ID, CLI/policy version, app type, evaluation date and the official policy context.
