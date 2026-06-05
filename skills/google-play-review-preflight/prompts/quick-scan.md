# Quick Scan Prompt

Copy and paste this prompt into Claude Code, GitHub Copilot, Cursor, or any AI coding agent.

---

## Copy-Paste Prompt: Quick Scan (5 minutes)

```
Use the google-play-review-preflight skill to run a quick scan of this project.

Focus on BLOCKERs only — issues that will likely cause immediate rejection:
1. targetSdkVersion (must meet current Google Play minimum)
2. Declared permissions vs. likely violations (SMS, Call Log, Accessibility Service)
3. Privacy policy URL presence
4. Data Safety — detect analytics/advertising SDKs
5. Google Play Billing — detect IAP without Play Billing Library
6. Signing config — no debug keystore in release
7. Account deletion — if login detected, flag if deletion mechanism is absent

Read these files:
- AndroidManifest.xml (or android/app/src/main/AndroidManifest.xml)
- build.gradle or app/build.gradle
- app.json or app.config.js (if Expo)
- pubspec.yaml (if Flutter)
- package.json (if React Native / Expo)

Output format:
## Google Play Quick Scan — [App Name]
### BLOCKERS (must fix before submission)
| # | Check | Status | Evidence | File | Fix |
|---|-------|--------|----------|------|-----|

### WARNINGS (strongly recommended)
| # | Check | Status | Evidence | File | Fix |

### Summary
X BLOCKERs · Y WARNINGs · Estimated fix time: Z hours
```

---

## Tech Stack Variants

### For Expo Projects

```
Use the google-play-review-preflight skill. This is an Expo managed workflow project.

Read:
- app.json or app.config.js/ts (primary config)
- eas.json (build configuration)
- package.json (dependencies for SDK detection)
- android/app/src/main/AndroidManifest.xml (if ejected or using custom native modules)

Note: In Expo managed workflow, permissions are declared in app.json under android.permissions.
The AndroidManifest.xml is generated at build time — check app.json instead.

Run only BLOCKER checks and report findings.
```

### For Flutter Projects

```
Use the google-play-review-preflight skill. This is a Flutter project.

Read:
- android/app/src/main/AndroidManifest.xml
- android/app/build.gradle
- pubspec.yaml (dependencies)

Note: Flutter plugins may add permissions automatically to the merged manifest.
If android/app/build/outputs/ is available, check the merged manifest there.

Run only BLOCKER checks and report findings.
```

### For React Native Projects

```
Use the google-play-review-preflight skill. This is a React Native project.

Read:
- android/app/src/main/AndroidManifest.xml
- android/app/build.gradle
- package.json
- android/app/src/main/res/values/strings.xml (for API keys)

Run only BLOCKER checks and report findings.
```
