# Checklist 07 — Restricted Access & Testing Credentials

> Policy references:
> - [App Access](https://support.google.com/googleplay/android-developer/answer/9859455) (Play Console > App Content)
> - [Developer Program Policies — Deceptive Behavior](https://play.google.com/about/privacy-security-deception/)
>
> **Note:** Google Play policies change frequently. Always verify against the latest official policy.

---

## CHECK-07-01: Testing Credentials Provided for Login-Required Apps

**Severity:** BLOCKER

**What to look for:**
If the app requires login to access its core functionality, Google Play reviewers need test credentials to evaluate the app. Without these credentials, the app will be rejected as "unable to review."

**Evidence sources:**
- Login/authentication UI detected (LoginScreen, SignInScreen, AuthScreen components)
- Auth-related dependencies: Firebase Auth, Auth0, Supabase Auth
- No guest/demo mode or public content accessible without login

**Pass condition:** App has public content OR test credentials have been provided in Play Console > App Content > App Access.

**Blocker condition:** App requires login with no guest mode AND no test credentials provided in Play Console.

**Warning condition:** Login required for some features but not core features — verify that core features are accessible to reviewer.

**Suggested fix:**
1. In Play Console, go to App Content > App Access.
2. Select "All or some functionality is restricted."
3. Add testing credentials (username + password) and any additional instructions for the reviewer.
4. If using 2FA, provide an alternative test account without 2FA, or detailed instructions.

**Official ref:** https://support.google.com/googleplay/android-developer/answer/9859455

---

## CHECK-07-02: Demo Mode or Bypass for Restricted Features

**Severity:** WARNING

**What to look for:**
Features that require external hardware, specific geographic location, or real-world conditions should have a demo mode or mock data available for reviewers.

Examples:
- Augmented reality features requiring specific environment
- NFC-based features
- Location-based features (geofenced content)

**Evidence sources:**
- NFC permissions: `NFC` in AndroidManifest.xml
- AR dependencies: `ARCore` in build.gradle, `@react-native-camera/camera`
- Geofencing: `GEOFENCE_TRANSITION_*` API usage

**Pass condition:** Hardware-dependent features have demo mode, OR instructions for reviewers are provided in Play Console.

**Warning condition:** NFC, AR, or strict location features present without documented reviewer guidance.

**Suggested fix:** Add a demo/review mode in app settings, or provide detailed reviewer instructions in Play Console > App Content > App Access > Instructions.

**Official ref:** https://support.google.com/googleplay/android-developer/answer/9859455

---

## CHECK-07-03: App Is Not in Test/Debug Mode for Production Submission

**Severity:** BLOCKER

**What to look for:**
Production builds must not have debug mode, developer flags, or test infrastructure enabled.

**Evidence sources:**
- Source code: `__DEV__`, `BuildConfig.DEBUG`, `kReleaseMode`, `if (process.env.NODE_ENV === 'development')`
- `app.json` → check if any test server URLs are hardcoded
- `build.gradle` → `debuggable true` in release buildType
- Any localhost or `10.0.2.2` API base URLs in config files

**Pass condition:** No debug flags, test URLs, or localhost endpoints active in release configuration.

**Blocker condition:** `android:debuggable="true"` in release manifest or localhost API URLs in production config.

**Warning condition:** Development environment URLs found in code that may be accidentally active in production.

**Suggested fix:**
```gradle
buildTypes {
    release {
        debuggable false  // explicit
        // ...
    }
}
```
Use environment-specific config files (`.env.production`) and ensure the correct environment is selected for release builds.

---

## CHECK-07-04: No Unauthorized Download or Side-Loading Mechanism

**Severity:** BLOCKER

**What to look for:**
Apps must not download and install APKs from outside of Play Store (side-loading) or prompt users to enable "Unknown sources."

**Evidence sources:**
- Search for: `REQUEST_INSTALL_PACKAGES` permission in AndroidManifest.xml
- Search for: `PackageInstaller`, `installPackage`, downloading `.apk` files
- `INSTALL_PACKAGES` permission (system-level, should not appear)

**Pass condition:** `REQUEST_INSTALL_PACKAGES` not declared, or declared for a legitimate app installer use case.

**Warning condition:** `REQUEST_INSTALL_PACKAGES` declared but app is not an app installer or MDM solution.

**Blocker condition:** App downloads and installs APKs from non-Play sources.

**Suggested fix:** Remove APK installation functionality. Use Play In-App Updates API for app updates.

**Official ref:** https://play.google.com/about/privacy-security-deception/malicious-behavior/

---

## CHECK-07-05: No Simulated System or Google Play UI

**Severity:** BLOCKER

**What to look for:**
Apps must not mimic system dialogs, Play Store UI, or Android OS interfaces to trick users into taking actions.

**Evidence sources:**
- UI component names: look for "SystemDialog", "PlayStorePrompt", "FakeNotification" patterns
- Any screen mimicking system permission dialogs
- Overlay permission: `SYSTEM_ALERT_WINDOW` in AndroidManifest.xml

**Pass condition:** `SYSTEM_ALERT_WINDOW` not used, or used for a legitimate use case (chat heads, accessibility).

**Warning condition:** `SYSTEM_ALERT_WINDOW` permission declared — will require policy justification.

**Blocker condition:** UI code mimics Android system dialogs to obtain user action.

**Suggested fix:** Use native Android dialog components. Remove any overlay permission that is not essential to declared functionality.

**Official ref:** https://play.google.com/about/privacy-security-deception/deceptive-behavior/
