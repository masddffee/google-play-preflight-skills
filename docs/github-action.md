# GitHub Action

Use `masddffee/google-play-preflight-skills@v1`, or preferably a full reviewed commit SHA. A Node 24-capable runner is required. The Action has no runtime dependencies, installation step, API key, token permission, Docker image or build-script execution.

Checkout the repository first. `path` selects the app directory inside the workspace. `config` and `manifest` are relative to that app; `output-dir` is relative to the entire workspace. SARIF paths include the app prefix, so findings in `apps/mobile/app/build.gradle` annotate that file rather than a nonexistent root `app/build.gradle`.

## Inputs

`path` defaults to `.`; `output-dir` to `.play-preflight`; `fail-on` to `blocker`; `annotations` to `true`. `as-of`, `device`, `submission`, `manifest`, `config`, and `profile` match CLI options. Config values remain authoritative unless a corresponding Action input is explicitly supplied.

## Outputs

Counts: `blockers`, `warnings`, `passed`, `unknown`, `skipped`. Paths: `report-json`, `report-markdown`, `report-html`, `report-sarif`. Metadata: `policy-version`.

The Action writes four reports, outputs and a step summary BEFORE applying the threshold. A failed scan still leaves reports for an `if: always()` artifact-upload step. Operational errors may prevent report creation; do not assume an output exists after a malformed config.

Default permissions should be `contents: read`. The Action does not post PR comments or call GitHub APIs. It emits up to 40 error/warning annotations, with encoded workflow-command fields. UNKNOWN findings are SARIF notes and remain visible in reports.

SARIF is produced locally. Uploading it to GitHub code scanning is optional and requires a separately configured upload action, the appropriate `security-events: write` permission, and code-scanning availability for your repository. Producing SARIF does not enable that service or incur a subscription automatically.

## Trust boundary

On untrusted PRs, use `pull_request`, not privileged `pull_request_target` with untrusted checkout. Fix the Action source to a trusted SHA. Do not execute project build scripts with secrets merely to obtain a merged manifest. The scanner reads only; uploaded reports can still reveal filenames and dependency names, so choose artifact visibility appropriately.
