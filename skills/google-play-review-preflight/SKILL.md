---
name: google-play-review-preflight
description: >
  Google Play review preflight skill for AI coding agents.
  Guides the agent to scan Android / Expo / React Native / Flutter projects
  and produce a structured risk report — organized by Google Play policy area —
  before submission to the Play Store.
version: 0.1.0
tags:
  - google-play
  - android
  - play-console
  - react-native
  - expo
  - flutter
  - policy
  - preflight
  - review
---

# Google Play Review Preflight Skill

> **Disclaimer** — This skill helps surface *likely* review blockers based on
> publicly available Google Play policies. It does **not** guarantee approval.
> Google Play policies change frequently; always verify against the
> [official Developer Program Policies](https://play.google.com/about/developer-content-policy/)
> before submitting.

---

## Workflow (5 Steps)

### Step 1 — Identify Project Type

Detect the tech stack and entry points:

```
- Native Android   → AndroidManifest.xml, build.gradle / build.gradle.kts
- React Native     → android/AndroidManifest.xml, package.json, app.json / app.config.js
- Expo             → app.json / app.config.js / app.config.ts, eas.json
- Flutter          → android/app/src/main/AndroidManifest.xml, pubspec.yaml
```

Collect these values:
- `applicationId` / `bundleId`
- `targetSdkVersion` / `compileSdkVersion`
- Declared `<uses-permission>` list
- Any declared `<queries>` or `<intent-filter>` entries
- Build variant (release vs debug)

### Step 2 — Pull Policy Metadata from Source Files

For each category, read the relevant files listed in the checklists. Do **not** guess — read the actual file content. If a file is missing, flag it as a **Blocker** or **Warning** depending on severity.

File reading priority:
1. `AndroidManifest.xml` (permissions, features, activities)
2. `build.gradle` / `pubspec.yaml` (SDK versions, dependencies)
3. `app.json` / `app.config.js` (Expo config, permissions array)
4. `package.json` (dependency list for known sensitive SDKs)
5. Privacy policy URL in README or store listing config
6. Any `google-services.json` / `firebase_options.dart` (presence check only, never log secrets)

### Step 3 — Run Checks (All 7 Categories)

Execute all checklist categories. For each item output a finding row:

| Field | Description |
|-------|-------------|
| **Status** | `PASS` / `WARNING` / `BLOCKER` |
| **Check** | Short check name |
| **Evidence** | What you found (or did not find) in the code |
| **File** | File path and line number (if applicable) |
| **Suggested Fix** | Concrete action to resolve the issue |
| **Official Ref** | Link to the Google Play policy page |

**Status definitions:**
- `BLOCKER` — High probability of rejection; must fix before submission.
- `WARNING` — Risk of rejection or future policy violation; strongly recommended to fix.
- `PASS` — Requirement appears satisfied based on available evidence.

### Step 4 — Generate Report

Output a complete audit report using the template in
`examples/sample-report.md`. Sections:

```
# Google Play Preflight Audit Report
## Summary (BLOCKER count / WARNING count / PASS count)
## Category Results (one section per checklist)
## Critical Action Items (BLOCKERs only, prioritized)
## Recommended Action Items (WARNINGs)
## Next Steps
```

### Step 5 — Suggest Fixes (Non-Destructive)

For each BLOCKER and WARNING, provide the minimum code or config change needed. Do **not**:
- Auto-commit changes
- Modify `google-services.json` or any credential file
- Suggest bypassing Google Play policy

---

## Checklist Index

| # | Category | File |
|---|----------|------|
| 1 | Privacy & Data Safety | `checklists/01-privacy-data-safety.md` |
| 2 | Store Listing & Metadata | `checklists/02-store-listing.md` |
| 3 | Content Declarations | `checklists/03-content-declarations.md` |
| 4 | Monetization & Subscriptions | `checklists/04-monetization-subscriptions.md` |
| 5 | Sensitive Permissions | `checklists/05-sensitive-permissions.md` |
| 6 | Technical Quality | `checklists/06-technical-quality.md` |
| 7 | Restricted Access | `checklists/07-restricted-access.md` |

---

## Adding a New Check

When a new Google Play policy is published or a new check is needed:

```markdown
### CHECK-XXX: [Short Check Name]

**Category:** [category name]
**Severity:** BLOCKER | WARNING
**Policy Ref:** [URL to official Google Play policy page]

**What to look for:**
[Describe what the agent should scan for]

**Evidence sources:**
- `path/to/file` — what to look for

**Pass condition:**
[When this check is PASS]

**Suggested fix:**
[Concrete fix]
```

---

## Gotchas

- **Expo managed workflow**: Permissions are declared in `app.json` under the `android.permissions` array, not directly in AndroidManifest.xml. The manifest is generated at build time.
- **React Native / Expo SDK upgrades**: `targetSdkVersion` may lag behind Android requirements. Check the SDK version against current Play requirements.
- **Flutter**: `AndroidManifest.xml` exists at `android/app/src/main/AndroidManifest.xml`. Flutter plugins may add permissions automatically — check the merged manifest in `build/` if available.
- **Data Safety ≠ Privacy Policy**: Data Safety is a Play Console form; privacy policy is a URL. Both are required and must be consistent.
- **Account deletion**: If the app supports account creation, an in-app account deletion option AND a web-based deletion URL are required.
- **Target audience**: If any part of the app could appeal to children under 13, Families Policy applies and must be declared.
- **Billing**: All in-app purchases for Android must use Google Play Billing Library. Any reference to alternative payment methods is a BLOCKER.
