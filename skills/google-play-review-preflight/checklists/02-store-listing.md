# Checklist 02 — Store Listing & Metadata

> Policy reference: [Spam and Minimum Functionality](https://play.google.com/about/spam-minimum-functionality/)
> and [Impersonation and Intellectual Property](https://play.google.com/about/intellectual-property-deception-spam/impersonation-intellectual-property/)
>
> **Note:** Google Play policies change frequently. Always verify against the latest official policy.

---

## CHECK-02-01: App Title — No Keyword Stuffing

**Severity:** BLOCKER

**What to look for:**
App title must not contain excessive keywords, competitor names, category names used as keywords, or misleading claims. Title must be ≤ 30 characters.

**Evidence sources:**
- `app.json` → `expo.name` or `name`
- `app/build.gradle` → does not usually contain title; check Play Console config files

**Pass condition:** Title is descriptive, ≤ 30 characters, no keyword spam detected.

**Warning condition:** Title contains category terms (e.g., "Best Free VPN 2024 Fast Unlimited") or competitor names.

**Blocker condition:** Title contains misleading claims or impersonates another app/brand.

**Suggested fix:** Use a clear, brand-focused title. Category descriptors belong in the short description, not the title.

**Official ref:** https://play.google.com/about/spam-minimum-functionality/spam/keyword-spam/

---

## CHECK-02-02: Short Description — Accuracy and No Misleading Claims

**Severity:** WARNING

**What to look for:**
Short description (≤ 80 characters) must accurately describe app functionality. No false capability claims.

**Pass condition:** Short description matches actual app features.

**Warning condition:** Description references features not present in the app or makes superlative claims ("the best," "#1") without substantiation.

**Suggested fix:** Write a factual short description that matches the app's actual capabilities.

**Official ref:** https://play.google.com/about/spam-minimum-functionality/spam/misleading-apps/

---

## CHECK-02-03: Store Icon and Screenshots

**Severity:** WARNING

**What to look for:**
- Icon: 512×512 px PNG, no transparency issues that distort display
- Screenshots: must reflect actual app UI, not use device frames that mislead, must not contain inappropriate content
- Feature graphic: 1024×500 px (if provided)

**Evidence sources:**
- Check if store asset files exist in the project (some projects store these in `/store/` or `/fastlane/metadata/`)

**Pass condition:** Required assets present and appear to reflect actual app content.

**Warning condition:** Screenshots show a different UI than the current version, use heavy promotional overlays, or appear auto-generated/stock.

**Blocker condition:** Screenshots or icon contain adult content, hate symbols, or violate content policy.

**Suggested fix:** Use real screenshots from the current app version. Update assets before each major version submission.

**Official ref:** https://support.google.com/googleplay/android-developer/answer/1078870

---

## CHECK-02-04: No Impersonation of Other Apps or Google

**Severity:** BLOCKER

**What to look for:**
- App name, icon, or description must not imply affiliation with Google products or other well-known apps.
- Package name (applicationId) should be unique and not similar to another published app.

**Evidence sources:**
- `build.gradle` → `applicationId`
- `app.json` → `expo.android.package`
- App title and icon

**Pass condition:** ApplicationId is unique reverse-domain format; no Google trademark terms in title or description.

**Blocker condition:** ApplicationId contains `google`, `android`, `play`, or competitor brand names; app name implies Google affiliation.

**Suggested fix:** Use your own reverse-domain applicationId. Remove any Google trademark terms from metadata.

**Official ref:** https://play.google.com/about/intellectual-property-deception-spam/impersonation-intellectual-property/

---

## CHECK-02-05: App Must Provide Genuine Functionality

**Severity:** BLOCKER

**What to look for:**
Apps must not be thin wrappers, empty shells, or apps with no discernible functionality. They must not duplicate another app you own without differentiation.

**Evidence sources:**
- Source file count and structure (look for minimal source files relative to described functionality)
- Dependency list — excessive ad SDK count with minimal utility code is a red flag

**Pass condition:** App has meaningful, original functionality beyond what a mobile website provides.

**Warning condition:** Very few source files relative to feature claims; app is primarily a WebView wrapper with no added value.

**Suggested fix:** Ensure the app provides clear value beyond its web counterpart. Add native functionality where appropriate.

**Official ref:** https://play.google.com/about/spam-minimum-functionality/minimum-functionality/
