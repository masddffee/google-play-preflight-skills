# Sample Audit Report

This is a sample output demonstrating what a full google-play-review-preflight audit produces.
The app below is fictional; findings are representative of real-world issues.

---

# Google Play Preflight Audit Report

**App:** FitTrack Pro  
**Package ID:** `com.example.fittrackpro`  
**Date:** 2025-05-27  
**Tech Stack:** React Native (Expo managed workflow)  
**Target SDK:** 33 ← detected in `app.json`  
**Min SDK:** 21  

---

## Summary

| | Count |
|--|-------|
| **BLOCKERS** | **4** |
| **WARNINGS** | **6** |
| **PASSED** | **18** |
| **SKIPPED** | **2** |

**Verdict: DO NOT SUBMIT** — resolve all 4 BLOCKERs first.

---

## Category Results

### 1. Privacy & Data Safety

| Status | Check | Evidence | File | Suggested Fix | Policy Ref |
|--------|-------|----------|------|--------------|-----------|
| PASS | CHECK-01-01: Privacy policy URL | `privacyPolicyUrl: "https://fittrackpro.com/privacy"` found | `app.json:18` | — | [User Data](https://play.google.com/about/privacy-security-deception/user-data/) |
| BLOCKER | CHECK-01-02: Data Safety | `@react-native-firebase/analytics` and `react-native-google-mobile-ads` detected; Data Safety form completeness cannot be confirmed from code — manual verification required | `package.json:34,41` | Complete Data Safety section in Play Console; declare Analytics data type and AdMob data sharing | [Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469) |
| BLOCKER | CHECK-01-03: Account deletion | Login flow detected (`LoginScreen.tsx`, Firebase Auth); no `deleteUser` call or deletion UI found in codebase; no web deletion URL in config | `src/screens/LoginScreen.tsx`, `app.json` | Add "Delete Account" option in ProfileScreen; create web deletion page; add URL to Play Console App Content | [Account Deletion](https://support.google.com/googleplay/android-developer/answer/13327111) |
| WARNING | CHECK-01-04: Privacy policy consistency | AdMob detected but privacy policy URL was not scraped — manual check required to confirm ad data sharing is disclosed | `package.json:41` | Review privacy policy for ad data sharing language | [User Data](https://play.google.com/about/privacy-security-deception/user-data/) |
| PASS | CHECK-01-05: No unnecessary data collection | Permissions match declared health/fitness features | `app.json:22-31` | — | — |

---

### 2. Store Listing & Metadata

| Status | Check | Evidence | File | Suggested Fix | Policy Ref |
|--------|-------|----------|------|--------------|-----------|
| PASS | CHECK-02-01: App title | `"FitTrack Pro"` — 12 chars, no keyword spam | `app.json:3` | — | — |
| PASS | CHECK-02-02: Short description | Not found in code; verify in Play Console | — | — | — |
| WARNING | CHECK-02-03: Store assets | `/store/` directory not found; screenshots not tracked in repo | — | Add current screenshots before submission | [Store listing](https://support.google.com/googleplay/android-developer/answer/1078870) |
| PASS | CHECK-02-04: No impersonation | `com.example.fittrackpro` — no Google/competitor terms | `app.json:7` | Rename to production domain before release | — |
| PASS | CHECK-02-05: Genuine functionality | 47 source files; health tracking, workout logging, progress charts detected | `src/` | — | — |

---

### 3. Content Declarations

| Status | Check | Evidence | File | Suggested Fix | Policy Ref |
|--------|-------|----------|------|--------------|-----------|
| WARNING | CHECK-03-01: Content rating | Cannot verify from code; must be completed in Play Console | — | Complete content rating questionnaire | [Content Ratings](https://support.google.com/googleplay/android-developer/answer/188189) |
| PASS | CHECK-03-02: Target audience | No child-directed language detected in app description or UI strings | — | — | — |
| BLOCKER | CHECK-03-03: Ads declaration | `react-native-google-mobile-ads` detected but "Contains ads" declaration cannot be confirmed from code — this must be declared in Play Console | `package.json:41` | Go to Play Console > App Content > Ads and declare "Contains ads" | [Ads](https://play.google.com/about/monetization-ads/ads/) |
| PASS | CHECK-03-04: UGC moderation | No UGC/community features detected | — | — | — |
| SKIPPED | CHECK-03-05: Sensitive categories | App is health/fitness; no financial, gambling, or VPN features detected | — | — | — |

---

### 4. Monetization & Subscriptions

| Status | Check | Evidence | File | Suggested Fix | Policy Ref |
|--------|-------|----------|------|--------------|-----------|
| PASS | CHECK-04-01: Play Billing | `react-native-iap` with Google Play Billing detected | `package.json:38` | — | [Payments](https://play.google.com/about/monetization-ads/payments/) |
| WARNING | CHECK-04-02: Subscription terms | Paywall screen found but disclosure text only mentions price — no cancellation info | `src/screens/PaywallScreen.tsx:67` | Add cancellation instructions to paywall UI | [Subscriptions](https://play.google.com/about/monetization-ads/subscriptions/) |
| PASS | CHECK-04-03: No dark patterns | No dismiss-to-purchase patterns detected | — | — | — |
| WARNING | CHECK-04-04: Restore purchases | No `getAvailablePurchases` or restore call found | `src/` | Add "Restore Purchases" button in Settings | [Billing](https://developer.android.com/google/play/billing/integrate#restore) |
| PASS | CHECK-04-05: No external purchase links | No external purchase URLs in subscription context | — | — | — |

---

### 5. Sensitive Permissions

| Status | Check | Evidence | File | Suggested Fix | Policy Ref |
|--------|-------|----------|------|--------------|-----------|
| PASS | CHECK-05-01: SMS/Call Log | Not declared | `app.json` | — | — |
| PASS | CHECK-05-02: Accessibility Service | Not declared | `app.json` | — | — |
| WARNING | CHECK-05-03: Location precision | `ACCESS_FINE_LOCATION` declared; app is fitness tracker — verify if fine location is needed vs coarse | `app.json:25` | Consider downgrading to `ACCESS_COARSE_LOCATION` if only city-level is needed | [Background Location](https://support.google.com/googleplay/android-developer/answer/9799150) |
| PASS | CHECK-05-04: Camera/Microphone | `CAMERA` declared for workout photo logging — use case clear | `app.json:27` | — | — |
| WARNING | CHECK-05-05: Prominent disclosure | `PermissionsAndroid.request(CAMERA)` called without preceding disclosure dialog | `src/hooks/useCamera.ts:23` | Add disclosure modal before permission request | [Permissions](https://play.google.com/about/privacy-security-deception/permissions/) |
| PASS | CHECK-05-06: VPN | Not declared | — | — | — |

---

### 6. Technical Quality

| Status | Check | Evidence | File | Suggested Fix | Policy Ref |
|--------|-------|----------|------|--------------|-----------|
| BLOCKER | CHECK-06-01: Target SDK | `targetSdkVersion: 33` — below current Play requirement of 34+ | `app.json:12` | Update to `targetSdkVersion: 35` in app.json | [Target API Level](https://support.google.com/googleplay/android-developer/answer/11926878) |
| PASS | CHECK-06-02: 64-bit | No native libraries detected (Expo managed) | — | — | — |
| PASS | CHECK-06-03: No placeholder API keys | No `YOUR_API_KEY` patterns found | — | — | — |
| WARNING | CHECK-06-04: App Bundle | `eas.json` shows `"buildType": "apk"` | `eas.json:8` | Change to `"buildType": "app-bundle"` | [App Bundle](https://developer.android.com/guide/app-bundle) |
| PASS | CHECK-06-05: ProGuard | `enableProguardInReleaseBuilds: true` | `app.json:15` | — | — |
| PASS | CHECK-06-06: Signing | EAS credentials configured | `eas.json` | — | — |
| PASS | CHECK-06-07: Min SDK | `minSdkVersion: 23` | `app.json:13` | — | — |

---

### 7. Restricted Access

| Status | Check | Evidence | File | Suggested Fix | Policy Ref |
|--------|-------|----------|------|--------------|-----------|
| PASS | CHECK-07-01: Test credentials | App has guest mode (GuestLoginButton detected) | `src/screens/LoginScreen.tsx:89` | — | — |
| SKIPPED | CHECK-07-02: Hardware demo mode | No NFC/AR features detected | — | — | — |
| PASS | CHECK-07-03: Not debug mode | No `android:debuggable="true"` in release config | — | — | — |
| PASS | CHECK-07-04: No side-loading | `REQUEST_INSTALL_PACKAGES` not declared | — | — | — |
| PASS | CHECK-07-05: No fake system UI | No `SYSTEM_ALERT_WINDOW`; no system dialog mimicry detected | — | — | — |

---

## Critical Action Items (BLOCKERs — fix before submitting)

1. **[CHECK-01-03] Add account deletion mechanism** — Firebase Auth detected but no deletion UI or web URL. Add "Delete Account" to ProfileScreen and declare the URL in Play Console. *High effort: ~4 hours.*

2. **[CHECK-06-01] Update targetSdkVersion to 35** — Current value 33 is below Play minimum. Update `app.json` and rebuild. *Low effort: 30 minutes.*

3. **[CHECK-01-02] Complete Data Safety form in Play Console** — Analytics and advertising SDKs detected. Fill in Data Safety section accurately. *Medium effort: 2 hours (analysis + form completion).*

4. **[CHECK-03-03] Declare "Contains ads" in Play Console** — AdMob SDK detected. Go to App Content > Ads and select "Contains ads." *Low effort: 10 minutes.*

---

## Recommended Action Items (WARNINGs)

1. Add subscription cancellation info to PaywallScreen (CHECK-04-02)
2. Add "Restore Purchases" button to Settings (CHECK-04-04)
3. Add prominent disclosure before CAMERA permission request (CHECK-05-05)
4. Change EAS buildType from `apk` to `app-bundle` (CHECK-06-04)
5. Update store screenshots in Play Console (CHECK-02-03)
6. Consider downgrading to `ACCESS_COARSE_LOCATION` if precision not needed (CHECK-05-03)

---

## Play Console Manual Verification Checklist

- [ ] Data Safety section completed
- [x] Content rating questionnaire completed (assumed — verify)
- [ ] Target audience confirmed (18+)
- [x] Privacy policy URL set
- [x] App access: guest mode available (no test credentials needed)
- [ ] Account deletion URL set
- [ ] Ads declaration: "Contains ads" selected
- [ ] Store listing screenshots updated
- [ ] Pre-launch report reviewed in Android vitals

---

*Disclaimer: This report identifies likely risks based on static code analysis against publicly available Google Play Developer Program Policies. It does not guarantee Play Store approval. Policies change frequently — verify all items against official Google documentation before submitting. Last policy check: 2025-05.*
