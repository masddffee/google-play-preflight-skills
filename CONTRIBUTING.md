# Contributing to google-play-preflight-skills

Thank you for contributing. Policy-first, agent-skill-first contributions are especially welcome.

---

## What to Contribute

### High Value
- **New checks** — when Google Play announces a new policy requirement
- **Policy updates** — when an existing check references an outdated policy (include the current policy URL)
- **Tech stack coverage** — Kotlin Multiplatform, Capacitor, .NET MAUI, or other Android targets
- **False positive fixes** — when a check incorrectly flags valid code patterns
- **New examples** — worked examples for specific app types (fintech, children's apps, games)

### Lower Priority for This Repo
- CLI tools, dashboard integrations, or Play Console API features (out of MVP scope)
- General Android code quality checks not related to Play policy
- Checks that duplicate existing Android lint rules

---

## How to Add a New Check

1. **Identify the policy** — find the official Google Play policy URL.
2. **Determine the category** — choose the appropriate checklist file in `skills/google-play-review-preflight/checklists/`.
3. **Write the check** using this template:

```markdown
## CHECK-XX-YY: [Short Check Name]

**Severity:** BLOCKER | WARNING

**What to look for:**
[What the agent should scan for — be specific about file paths and patterns]

**Evidence sources:**
- `file/path` → what to look for in that file

**Pass condition:** [When this check is PASS]

**Blocker/Warning condition:** [When this triggers]

**Suggested fix:**
[Concrete, actionable fix — code snippet if helpful]

**Official ref:** [https://play.google.com/... — must be an official Google URL]
```

4. **Update `references.md`** if the check references a new policy URL.
5. **Add to SKILL.md checklist index** if creating a new category.

---

## Policy Update Protocol

When Google Play updates a policy:

1. Open an issue with:
   - Link to the official policy change or announcement
   - Which checks are affected
   - The updated requirement
2. Update the relevant checklist file
3. Update `references.md` with the new URL
4. Update the version in `SKILL.md` frontmatter (bump patch version)
5. Add an entry to `CHANGELOG.md`

---

## Pull Request Guidelines

- **One check or policy area per PR** — easier to review and cherry-pick
- **Official references required** — every check must link to an official Google Play or Android developer documentation URL
- **No guarantee language** — do not write that a check "ensures" or "guarantees" Play Store approval
- **No policy circumvention** — do not add checks that help bypass or work around Google Play policies
- **Test your changes** — run the skill against a real project (or the sample from `examples/`) and include the output in your PR description

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

---

## Reporting Security Issues

See [SECURITY.md](SECURITY.md).
