# Configuration and evidence

Run `play-preflight init .` to create `.play-preflight.json`. Existing files are never overwritten. The config must be JSON, not executable JS. Unknown keys and wrong types are rejected. Paths are relative to the selected app root, stay within it, and may not traverse symlinks.

| Field | Type / values | Meaning |
|---|---|---|
| device | mobile, wear, automotive, tv, xr | Defaults to mobile; select the real device category |
| submission | new, update, existing | Existing means availability of an unchanged published app, not an update |
| manifest | relative file path | Actual merged release XML from your trusted build; never a debug manifest |
| profile | string | EAS profile to inspect; default production; inherited profiles are not resolved |
| privacyPolicyUrl | HTTP(S) URL | Syntax check only; contents, reachability and publication are manual |
| accountCreation | boolean | App allows account creation; omit when unknown |
| accountDeletionInApp | boolean | A functioning in-app deletion-request path exists |
| accountDeletionUrl | HTTP(S) URL | Public web deletion-request resource |
| loginRequired | boolean | Reviewer needs restricted access |
| reviewerAccessProvided | boolean | Access instructions were provided in Console; never put credentials here |
| digitalGoods | boolean | Digital purchases within the app; does not decide billing legality |
| markets | array of uppercase two-letter codes | User distribution markets; not sufficient to certify regional programs |
| alternativeBillingEnrolled | boolean | Context only; program eligibility and implementation remain manual |
| containsAds | boolean | Actual app behavior, not dependency presence |
| dataSafetyReviewed | boolean | Developer attestation, not a Console API verification |
| adsDeclarationReviewed | boolean | Developer attestation |
| targetAudienceReviewed | boolean | Developer attestation |
| contentRatingReviewed | boolean | Developer attestation |
| nativeChecksReviewed | boolean | Attests BOTH 64-bit and 16 KB artifact/runtime checks; scanner does neither |
| runtimeChecksReviewed | boolean | Developer attestation for runtime release testing |
| targetApiExtensionUntil | YYYY-MM-DD | Declared extension triggers manual review, not automatic compliance |
| billingExtensionUntil | YYYY-MM-DD | Same; verify grant and official scope separately |
| listing | object | Optional title, shortDescription, fullDescription strings |

CLI `--device`, `--submission`, `--manifest`, `--profile` override corresponding config values. `--as-of` is an evaluation option, not a way to change policy. Historical runs use the currently bundled snapshot retrospectively and are not archived policy certifications.

## Evidence classes

`static` means a value read from source/configuration. `artifact` means a value read from a caller-supplied merged manifest; the tool cannot prove its provenance. `attestation` means a user statement. A PASS based on an attestation is not independently verified. Missing source metadata is UNKNOWN, not proof that the Console form is incomplete.

For release gating, use `--fail-on unknown` and inspect all evidence rather than accepting a green default exit code as approval. V1 has no suppression/baseline system and no automatic modifications.
