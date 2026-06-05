# Full Audit Prompt

Copy and paste this prompt for a complete pre-submission audit. Expect 15–30 minutes of agent time depending on project size.

---

## Copy-Paste Prompt: Full Audit

```
Use the google-play-review-preflight skill to perform a complete pre-submission audit of this project.

Run all 7 checklist categories:
1. Privacy & Data Safety (CHECK-01-*)
2. Store Listing & Metadata (CHECK-02-*)
3. Content Declarations (CHECK-03-*)
4. Monetization & Subscriptions (CHECK-04-*)
5. Sensitive Permissions (CHECK-05-*)
6. Technical Quality (CHECK-06-*)
7. Restricted Access (CHECK-07-*)

For each check, output:
| Status | Check ID | Check Name | Evidence | File:Line | Suggested Fix | Policy Ref |

Status values: BLOCKER | WARNING | PASS

After all checks, output a complete audit report:

---
# Google Play Preflight Audit Report
**App:** [detected app name or applicationId]
**Date:** [today's date]
**Tech Stack:** [detected stack: Android Native / React Native / Expo / Flutter]
**Target SDK:** [detected value]
**Package ID:** [detected applicationId]

## Summary
- BLOCKERS: X (must fix before submission)
- WARNINGS: Y (strongly recommended)
- PASSED: Z
- SKIPPED: N (not applicable or insufficient evidence)

## Category Results

### 1. Privacy & Data Safety
[findings table]

### 2. Store Listing & Metadata
[findings table]

### 3. Content Declarations
[findings table]

### 4. Monetization & Subscriptions
[findings table]

### 5. Sensitive Permissions
[findings table]

### 6. Technical Quality
[findings table]

### 7. Restricted Access
[findings table]

## Critical Action Items (BLOCKERs — fix before submitting)
1. [highest risk item]
2. [second item]
...

## Recommended Action Items (WARNINGs)
1. [item]
...

## Play Console Checklist (manual verification required)
Before submitting, confirm in Play Console:
- [ ] Data Safety section completed and matches code findings
- [ ] Content rating questionnaire completed
- [ ] Target audience age group selected
- [ ] Privacy policy URL added and accessible
- [ ] App access / testing credentials provided (if login required)
- [ ] Store listing screenshots updated to current UI
- [ ] Ads declaration matches SDK findings
- [ ] Account deletion URL provided (if account creation supported)

## Next Steps
[Prioritized list of actions before submission]

---
**Disclaimer:** This report identifies likely risks based on code analysis against publicly
available Google Play policies. It does not guarantee approval. Policies change frequently —
always verify with official Google documentation before submitting.
---
```

---

## After the Audit: Play Console Verification Checklist

These items cannot be checked from code and must be verified manually in Play Console:

| # | Item | Where in Play Console |
|---|------|----------------------|
| 1 | Data Safety form complete | Monetize > Policy > App content > Data safety |
| 2 | Content rating assigned | Policy > App content > Content ratings |
| 3 | Target audience set | Policy > App content > Target audience |
| 4 | Privacy policy URL set | Store presence > Store settings |
| 5 | Testing credentials added | Policy > App content > App access |
| 6 | Account deletion URL set | Policy > App content > Data deletion |
| 7 | Ads declaration complete | Policy > App content > Ads |
| 8 | Store listing assets updated | Store presence > Main store listing |
| 9 | Release track selected appropriately | Testing > [track] |
| 10 | Review pre-launch report | Android vitals > Pre-launch report |
