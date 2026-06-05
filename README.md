# google-play-preflight-skills

**Catch Google Play review blockers before submission.**

A Google Play review preflight skill for AI coding agents. Guides Claude Code, GitHub Copilot, Cursor, and other AI agents to scan your Android / Expo / React Native / Flutter project and produce a structured risk report — organized by Google Play policy area — before you submit to the Play Store.

> **Disclaimer:** This skill identifies *likely* review blockers based on publicly available Google Play Developer Program Policies. It does **not** guarantee approval. Google Play policies change frequently — always verify against [official Google documentation](https://play.google.com/about/developer-content-policy/) before submitting.

---

## Why This Exists

Google Play rejects or delays apps for predictable, policy-driven reasons. Most of them are detectable from code:

| Common Rejection Cause | Detectable? |
|------------------------|-------------|
| targetSdkVersion too low | ✓ from build.gradle / app.json |
| Missing account deletion mechanism | ✓ from auth code + UI search |
| Advertising SDK not declared in Data Safety | ✓ from package.json / build.gradle |
| "Contains ads" not declared in Play Console | ✓ from dependency detection |
| Google Play Billing not used for IAP | ✓ from dependency check |
| SMS/Call Log permissions used illegally | ✓ from AndroidManifest.xml |
| Login-required app with no test credentials | ✓ from auth + UX pattern detection |
| Debug signing in release build | ✓ from build config |

This skill runs those checks automatically, before you spend time waiting for a rejection email.

---

## Who It's For

- **Android native developers** submitting to Google Play
- **React Native / Expo developers** building Play Store apps
- **Flutter developers** targeting Android
- **AI-assisted development teams** using Claude Code, Cursor, Copilot, or similar tools
- **Indie developers** who may not be familiar with all Play policy areas

---

## Quick Start

### Option 1: Claude Code (Recommended)

Add this skill to your Claude Code project:

```bash
# From your project root
npx skills add google-play-preflight-skills
```

Or manually copy the skill file:

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/google-play-preflight-skills.git

# Copy the skill to your project's .claude/skills/ directory
mkdir -p .claude/skills/google-play-review-preflight
cp -r google-play-preflight-skills/skills/google-play-review-preflight/ .claude/skills/
```

Then in Claude Code:

```
/google-play-review-preflight
```

Or paste the prompts from `skills/google-play-review-preflight/prompts/`.

### Option 2: Copy-Paste Prompt (Any AI Agent)

For a quick scan (5 minutes):

```
Read AndroidManifest.xml, build.gradle (or app.json for Expo), and package.json.
Check for these Google Play review blockers:
1. targetSdkVersion meets current Play minimum (34+ as of 2025)
2. No SMS/Call Log/Accessibility permissions declared
3. Privacy policy URL present
4. If Firebase/AdMob detected: flag Data Safety form as needing completion
5. If IAP detected: verify Google Play Billing Library is used
6. No debug keystore in release signing config
7. If login detected: flag need for test credentials in Play Console

For each issue found: Status (BLOCKER/WARNING/PASS), Evidence, File:Line, Suggested Fix.
```

For a full audit, see [`skills/google-play-review-preflight/prompts/full-audit.md`](skills/google-play-review-preflight/prompts/full-audit.md).

---

## What Gets Checked

### 7 Policy Categories, 35+ Individual Checks

| # | Category | Key Checks |
|---|----------|-----------|
| 1 | [Privacy & Data Safety](skills/google-play-review-preflight/checklists/01-privacy-data-safety.md) | Privacy policy URL, Data Safety form, account deletion, unnecessary data collection |
| 2 | [Store Listing & Metadata](skills/google-play-review-preflight/checklists/02-store-listing.md) | Keyword spam, misleading claims, impersonation, minimum functionality |
| 3 | [Content Declarations](skills/google-play-review-preflight/checklists/03-content-declarations.md) | Content rating, target audience, ads declaration, UGC moderation, restricted categories |
| 4 | [Monetization & Subscriptions](skills/google-play-review-preflight/checklists/04-monetization-subscriptions.md) | Play Billing Library, subscription disclosure, dark patterns, restore purchases |
| 5 | [Sensitive Permissions](skills/google-play-review-preflight/checklists/05-sensitive-permissions.md) | SMS/Call Log, Accessibility Service, location precision, prominent disclosure, VPN |
| 6 | [Technical Quality](skills/google-play-review-preflight/checklists/06-technical-quality.md) | Target SDK, 64-bit support, placeholder API keys, App Bundle, signing config |
| 7 | [Restricted Access](skills/google-play-review-preflight/checklists/07-restricted-access.md) | Test credentials, debug mode, side-loading, fake system UI |

### Output Per Check

Every finding includes:

```
| Status   | BLOCKER / WARNING / PASS                        |
| Evidence | What was found (or not found) in the code       |
| File     | File path and line number                        |
| Fix      | Concrete action to resolve the issue             |
| Ref      | Link to official Google Play policy page         |
```

---

## Supported Tech Stacks

| Stack | Manifest Location | Config File |
|-------|------------------|-------------|
| Android Native | `AndroidManifest.xml` | `build.gradle` / `build.gradle.kts` |
| React Native | `android/app/src/main/AndroidManifest.xml` | `package.json` |
| Expo (managed) | `app.json` / `app.config.js` | `eas.json` |
| Flutter | `android/app/src/main/AndroidManifest.xml` | `pubspec.yaml` |

---

## Limitations

- **Code analysis only**: Play Console form completeness (Data Safety, content rating, etc.) must be verified manually.
- **No runtime testing**: Cannot detect crashes, UI layout issues, or runtime behavior.
- **Policy drift**: Google Play policies change. This skill reflects policies as of the last update — always check current official docs.
- **False positives**: SDK detection is dependency-based; some findings may not apply to your specific SDK usage.
- **No Play Console API**: This skill does not connect to Play Console, Play Developer API, or any Google service.

---

## Disclaimer

This project is not affiliated with, endorsed by, or sponsored by Google LLC. "Google Play" and "Android" are trademarks of Google LLC.

This skill identifies likely review risks based on static code analysis against publicly available [Google Play Developer Program Policies](https://play.google.com/about/developer-content-policy/). It **does not** guarantee Play Store approval, and must not be used to circumvent Google Play policies.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Policy updates and new checks are especially welcome.

## License

MIT — see [LICENSE](LICENSE).

---

## GitHub Topics

`google-play` · `android` · `play-console` · `app-review` · `ai-agent` · `claude-code` · `react-native` · `expo` · `flutter` · `data-safety` · `preflight`
