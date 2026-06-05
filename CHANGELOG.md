# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.1.0] — 2025-05-27

### Added

- Initial release of `google-play-review-preflight` skill
- `SKILL.md` — main AI agent skill with 5-step workflow
- 7 policy checklist files covering:
  - Privacy & Data Safety (CHECK-01-01 to CHECK-01-05)
  - Store Listing & Metadata (CHECK-02-01 to CHECK-02-05)
  - Content Declarations (CHECK-03-01 to CHECK-03-05)
  - Monetization & Subscriptions (CHECK-04-01 to CHECK-04-05)
  - Sensitive Permissions (CHECK-05-01 to CHECK-05-06)
  - Technical Quality (CHECK-06-01 to CHECK-06-07)
  - Restricted Access (CHECK-07-01 to CHECK-07-05)
- `references.md` — curated list of official Google Play and Android developer policy URLs
- Two prompt templates: `quick-scan.md` and `full-audit.md`
- Example sample audit report (`examples/sample-report.md`)
- React Native / Expo walkthrough example (`examples/react-native-expo.md`)
- English and Traditional Chinese README
- Standard open-source files: LICENSE (MIT), CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md
- GitHub issue and PR templates

### Coverage

Policy areas reflected in v0.1.0 (verified against Google Play Developer Program Policies, May 2025):

- User Data & Privacy Policy requirement
- Data Safety section declarations
- Account and data deletion requirement
- Content ratings (IARC)
- Target audience and Families Policy indicators
- Advertising declaration
- Google Play Billing Library requirement
- Subscription disclosure requirements
- Sensitive permissions: SMS, Call Log, Accessibility Service, Location, Camera, VPN
- Target SDK minimum requirements
- 64-bit native library requirement
- App Bundle vs APK
- Testing credentials for restricted-access apps

---

## Upcoming (v0.2.0)

Planned additions:

- Flutter-specific example (`examples/flutter.md`)
- Kotlin Multiplatform / Compose Multiplatform notes
- Families Policy deep-dive checklist
- Financial services / lending app checklist
- Automated link-checking for references.md
