# Validation and limitations

## Reproducible checks

`npm test` runs Node's built-in test runner. It covers policy boundaries, the five device categories, new/update/existing contexts, stale snapshots, extension ambiguity, static stack detection, SDK expressions and overrides, malformed inputs, manifest structure and namespaces, restricted permission handling, billing wrappers, context validation, report escaping, SARIF path prefixes/fingerprints, CLI exit codes, non-destructive config initialization, source-watcher failures, Action outputs and workspace traversal.

`npm run smoke` packs the actual distributable, installs the tarball into an isolated temporary consumer **offline**, and runs the installed CLI against the synthetic risk fixture. `npm run check` validates JavaScript syntax and critical metadata. CI specifies Node 22 and 24 on Linux, macOS and Windows plus a real local-Action invocation. A matrix definition alone is not evidence that all remote jobs passed; inspect the linked workflow run.

`npm run demo` regenerates example reports and the terminal image from the same scanner and fixed synthetic inputs. Sample outputs are not handwritten claims about a production app.

## What this does not establish

No real-app labeled benchmark, precision/recall figure, Play approval rate, runtime behavior, native-binary compatibility or production-user adoption is claimed. This release is not a complete policy engine or full Gradle/Expo interpreter. It reads selected literal configurations, accepts a trusted merged manifest and explicitly surfaces missing knowledge.

Malformed or dynamic inputs may be UNKNOWN or operational errors instead of producing a verdict. Source-literal PASS does not resolve build variants, dependencies or final packaging. Attestations can be false; they must be reviewed by the project owner. A policy source returning reachable or matching selected phrases does not establish that the entire policy has not changed.

## Release verification

Before advancing the v1 branch, run all local checks and inspect the feature-branch CI. Preserve an exact commit for reproducibility. GitHub source installation does not require npm publication. npm registry publication, an official Marketplace listing, a public hosted website and independent real-app validation are separate distribution/validation steps, not implied by this repository's contents.
