# Checklist 06 — Technical Quality

> Policy references:
> - [Technical Requirements](https://play.google.com/about/spam-minimum-functionality/minimum-functionality/)
> - [Target API Level](https://support.google.com/googleplay/android-developer/answer/11926878)
> - [64-bit requirement](https://support.google.com/googleplay/android-developer/answer/7353455)
> - [Android App Quality](https://developer.android.com/docs/quality-guidelines/core-app-quality)
>
> **Note:** Google Play policies change frequently. Always verify against the latest official policy.

---

## CHECK-06-01: Target SDK Version

**Severity:** BLOCKER

**What to look for:**
Google Play requires new apps and updates to target a recent Android API level. As of 2024–2025:
- New apps: must target Android 14 (API 34) or higher
- Updates to existing apps: must target Android 14 (API 34) or higher

Check the current requirement at: https://support.google.com/googleplay/android-developer/answer/11926878

**Evidence sources:**
- `build.gradle` (app level) → `targetSdkVersion` or `targetSdk`
- `app.json` → `expo.android.targetSdkVersion`
- `pubspec.yaml` → does not specify; check `android/app/build.gradle`

**Pass condition:** `targetSdkVersion` ≥ 34 (verify current minimum at official docs — this value updates annually).

**Warning condition:** `targetSdkVersion` = 33 — may still be accepted for updates but check current deadline.

**Blocker condition:** `targetSdkVersion` < 33.

**Suggested fix:**
```gradle
// build.gradle (app)
android {
    compileSdk 35
    defaultConfig {
        targetSdk 35
        minSdk 24  // or your actual minimum
    }
}
```

**Official ref:** https://support.google.com/googleplay/android-developer/answer/11926878

---

## CHECK-06-02: 64-bit Architecture Support

**Severity:** BLOCKER

**What to look for:**
All apps with native code (`.so` files) must include 64-bit native libraries (`arm64-v8a` and/or `x86_64`). Apps without native code are exempt.

**Evidence sources:**
- `build.gradle` → `abiFilters` in ndk block
- `app.json` → `expo.android.enableProguardInReleaseBuilds` or native code indicators
- Native modules in `package.json` that include native C++ code
- Presence of `*.so` files in `android/app/src/main/jniLibs/`

**Pass condition:** No native libraries used, or `arm64-v8a` is included in abiFilters.

**Blocker condition:** Native library detected with only 32-bit `armeabi-v7a` support.

**Warning condition:** `x86` or `x86_64` slices absent — acceptable for production but affects Chrome OS support.

**Suggested fix:**
```gradle
android {
    defaultConfig {
        ndk {
            abiFilters 'armeabi-v7a', 'arm64-v8a'
        }
    }
}
```

**Official ref:** https://support.google.com/googleplay/android-developer/answer/7353455

---

## CHECK-06-03: App Must Not Crash at Launch

**Severity:** BLOCKER

**What to look for:**
Apps that crash on launch or in core functionality will be rejected. This cannot be fully detected statically but look for common causes:

- Missing required configuration keys (Firebase, Google Maps API key)
- API keys set to placeholder values like `"YOUR_API_KEY"` or `"REPLACE_ME"`
- Missing `google-services.json` or `GoogleService-Info.plist` equivalent

**Evidence sources:**
- `google-services.json` → check presence (do NOT read contents; just check existence)
- Source files → search for `"YOUR_API_KEY"`, `"REPLACE_ME"`, `"TODO"`, `"FIXME"` in API key contexts
- `app.json` → check for required config values

**Pass condition:** No placeholder API keys or missing required config files detected.

**Blocker condition:** Placeholder API keys found in code that would cause runtime crash.

**Warning condition:** No `google-services.json` found for an app using Firebase.

**Suggested fix:** Replace all placeholder values with real configuration before building the release APK/AAB.

---

## CHECK-06-04: App Bundle (AAB) Instead of APK

**Severity:** WARNING

**What to look for:**
New apps submitted to Google Play must use Android App Bundle (`.aab`) format. APK is deprecated for new submissions.

**Evidence sources:**
- CI/CD config files: look for `./gradlew bundleRelease` vs `./gradlew assembleRelease`
- `eas.json` → `android.buildType` should be `"app-bundle"` not `"apk"`
- Build scripts in `package.json` scripts

**Pass condition:** Build pipeline uses `bundleRelease` or AAB format.

**Warning condition:** Build pipeline only configured for APK output.

**Suggested fix:**
- Gradle: use `./gradlew bundleRelease`
- EAS: set `"buildType": "app-bundle"` in `eas.json`
- Flutter: use `flutter build appbundle`

**Official ref:** https://developer.android.com/guide/app-bundle

---

## CHECK-06-05: ProGuard / R8 Enabled for Release Build

**Severity:** WARNING

**What to look for:**
Release builds should have code minification enabled to reduce APK size and protect code.

**Evidence sources:**
- `build.gradle` → `buildTypes > release > minifyEnabled true`
- `app.json` → `expo.android.enableProguardInReleaseBuilds: true`

**Pass condition:** `minifyEnabled true` in release build type.

**Warning condition:** `minifyEnabled false` in release build — not a rejection cause but increases APK size and security risk.

**Suggested fix:**
```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

---

## CHECK-06-06: Signing Configuration

**Severity:** BLOCKER

**What to look for:**
Release build must be signed with a valid production keystore. Debug keystore (`debug.keystore`) is not acceptable for production.

**Evidence sources:**
- `build.gradle` → `signingConfigs` block — check for debug keystore referenced in release config
- `app.json` → `expo.android.buildType` or EAS signing configuration

**Pass condition:** Release build uses a dedicated production keystore (not debug.keystore).

**Blocker condition:** `debug.keystore` referenced in release `signingConfig`, or no signing config present.

**Warning condition:** Keystore credentials hardcoded in build.gradle (security risk).

**Suggested fix:**
```gradle
signingConfigs {
    release {
        storeFile file(System.getenv("KEYSTORE_FILE"))
        storePassword System.getenv("KEYSTORE_PASSWORD")
        keyAlias System.getenv("KEY_ALIAS")
        keyPassword System.getenv("KEY_PASSWORD")
    }
}
```

---

## CHECK-06-07: Minimum SDK Version

**Severity:** WARNING

**What to look for:**
`minSdkVersion` should balance device coverage with security. Play recommends a minimum that covers your target market. Very low values (< 21) may reduce feature availability and require extra compatibility testing.

**Evidence sources:**
- `build.gradle` → `minSdkVersion`
- `app.json` → `expo.android.minSdkVersion`

**Pass condition:** `minSdkVersion` ≥ 21 (Android 5.0, covers ~99% of devices as of 2025).

**Warning condition:** `minSdkVersion` < 21 — very old Android versions, limited security APIs.

**Suggested fix:** Set `minSdkVersion 24` (Android 7.0) for new apps to cover 98%+ of active devices while ensuring modern security API access.
