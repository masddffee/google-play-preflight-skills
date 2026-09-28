# Security

The scanner is local-first and read-only. It never imports app.config.js, evaluates Gradle, runs package scripts, launches builds, queries Play Console, or uploads project source. Only `policy check --online` makes requests, to the bundled allowlisted official Google/Android sources. Redirects are not followed; source changes require human review.

Input collection uses an allowlist of source/config extensions, skips dependency/build/test directories and hidden files, and does not follow symlinks. Credential files such as `.env`, `google-services.json`, `local.properties`, keystores and Firebase generated options are excluded. Limits: 6,000 directory entries, 1,000 eligible files, 2 MB per input, 20 MB cumulative content and 16 directory levels. Skipped/unreadable eligible inputs produce an incomplete-coverage result.

Reports contain selected normalized evidence and filenames, not raw source snippets or credential values. HTML/Markdown/terminal output and GitHub command properties are escaped. Report paths cannot traverse symlink directories. Supplied manifest XML rejects DTDs, external entities and malformed structure.

This is not a sandbox for running malicious code and not a full source-code security audit. Do not concurrently mutate files while scanning. Keep CI secrets away from untrusted builds, pin dependencies/actions, and review report artifacts before public sharing.

Report security vulnerabilities through GitHub's private vulnerability reporting when available. Otherwise open an issue requesting a private contact without publishing exploit details, private app code, tokens, passwords or signing material.
