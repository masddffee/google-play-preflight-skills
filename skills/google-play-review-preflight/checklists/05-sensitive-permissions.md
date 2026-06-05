# Checklist 05 — Sensitive Permissions

> Policy references:
> - [Permissions](https://play.google.com/about/privacy-security-deception/permissions/)
> - [Prominent Disclosure](https://play.google.com/about/privacy-security-deception/permissions/)
> - [Device and Network Abuse](https://play.google.com/about/privacy-security-deception/device-network-abuse/)
>
> **Note:** Google Play policies change frequently. Always verify against the latest official policy.

---

## Permission Risk Classification

| Risk Level | Examples |
|------------|---------|
| **BLOCKER** (restricted/dangerous, needs extra approval or very clear justification) | `READ_SMS`, `RECEIVE_SMS`, `SEND_SMS`, `READ_CALL_LOG`, `PROCESS_OUTGOING_CALLS`, `BIND_ACCESSIBILITY_SERVICE`, `BIND_DEVICE_ADMIN`, `BIND_VPN_SERVICE` |
| **WARNING** (dangerous, must be justified and properly disclosed) | `ACCESS_FINE_LOCATION`, `CAMERA`, `RECORD_AUDIO`, `READ_CONTACTS`, `READ_CALENDAR`, `BODY_SENSORS`, `ACTIVITY_RECOGNITION` |
| **INFO** (normal, minimal risk but still check for necessity) | `INTERNET`, `VIBRATE`, `RECEIVE_BOOT_COMPLETED`, `ACCESS_NETWORK_STATE` |

---

## CHECK-05-01: SMS and Call Log Permissions

**Severity:** BLOCKER

**What to look for:**
`READ_SMS`, `RECEIVE_SMS`, `SEND_SMS`, `READ_CALL_LOG`, `WRITE_CALL_LOG`, `PROCESS_OUTGOING_CALLS` are restricted. Apps that are not the default SMS handler or dialer app must not declare these permissions.

**Evidence sources:**
- `AndroidManifest.xml` → `<uses-permission android:name="android.permission.READ_SMS" />`
- `app.json` → `android.permissions` array

**Pass condition:** None of the above permissions are declared.

**Blocker condition:** Any SMS or Call Log permission declared and app is not a default handler app.

**Suggested fix:** Remove the permission. If your use case requires SMS verification, use the [SMS Retriever API](https://developers.google.com/identity/sms-retriever/overview) instead, which does not require the `READ_SMS` permission.

**Official ref:** https://play.google.com/about/privacy-security-deception/permissions/

---

## CHECK-05-02: Accessibility Service

**Severity:** BLOCKER

**What to look for:**
`BIND_ACCESSIBILITY_SERVICE` permission and `AccessibilityService` implementation. Accessibility services may only be used to assist users with disabilities. Any other use (automation, bot behavior, UI scraping) is prohibited.

**Evidence sources:**
- `AndroidManifest.xml` → `<service android:name="...AccessibilityService">`
- `app.json` → accessibility service references

**Pass condition:** Accessibility service not used.

**Blocker condition:** Accessibility service declared for non-disability-assist purposes (e.g., auto-clicker, game assistant, screen reader for automation).

**Suggested fix:** Remove accessibility service. Use supported APIs for automation testing (Espresso). If genuinely needed for accessibility, prepare documentation of the disability use case for Play Console review.

**Official ref:** https://play.google.com/about/privacy-security-deception/permissions/

---

## CHECK-05-03: Location Permission — Justification and Precision

**Severity:** WARNING

**What to look for:**
- `ACCESS_FINE_LOCATION` vs `ACCESS_COARSE_LOCATION` — use the minimum precision needed.
- `ACCESS_BACKGROUND_LOCATION` requires a separate prominent disclosure and policy justification.

**Evidence sources:**
- `AndroidManifest.xml` → location permissions
- `app.json` → `android.permissions` including location variants

**Pass condition:** Location permission matches actual feature need; background location only if feature requires it with proper disclosure.

**Warning condition:** `ACCESS_FINE_LOCATION` used where coarse is sufficient; background location requested without clear use case.

**Blocker condition:** Background location used in app not qualifying for an approved use case (navigation, family safety, contact tracing, IoT).

**Suggested fix:**
- Downgrade to `ACCESS_COARSE_LOCATION` if precise location is not required.
- For background location: prepare prominent disclosure UI and submit the Permissions Declaration form in Play Console.

**Official ref:** https://support.google.com/googleplay/android-developer/answer/9799150

---

## CHECK-05-04: Camera and Microphone Permissions

**Severity:** WARNING

**What to look for:**
`CAMERA` and `RECORD_AUDIO` must be used only when the user is actively in a feature that requires them. Apps must not record audio or capture images in the background without clear disclosure.

**Evidence sources:**
- `AndroidManifest.xml` → `CAMERA`, `RECORD_AUDIO`
- Code: check for background audio recording services or continuous camera use

**Pass condition:** Permissions are present and audio/camera use appears to be foreground and feature-gated.

**Warning condition:** `RECORD_AUDIO` combined with a background service — risk of background recording policy violation.

**Suggested fix:** Ensure microphone and camera access is initiated only by explicit user action. Stop all capture when the relevant feature is not in use.

**Official ref:** https://play.google.com/about/privacy-security-deception/permissions/

---

## CHECK-05-05: Prominent Disclosure for All Dangerous Permissions

**Severity:** BLOCKER

**What to look for:**
For each dangerous permission, the app must show a prominent disclosure dialog before the system permission dialog appears. The disclosure must:
- State which data will be collected
- Explain how it will be used
- Be shown in context (at the time the permission is needed, not on first launch)

**Evidence sources:**
- Look for permission request patterns in code: before calling `requestPermissions` / `PermissionsAndroid.request`, is there a custom disclosure dialog?
- Search for: "requestPermissions", "usePermissions", "PermissionsAndroid", `permission_handler` (Flutter)

**Pass condition:** Disclosure UI found before each dangerous permission request.

**Warning condition:** Permission requested directly without any preceding disclosure UI.

**Suggested fix:** Show a dialog or bottom sheet explaining why the permission is needed before triggering the system permission prompt.

**Official ref:** https://play.google.com/about/privacy-security-deception/permissions/

---

## CHECK-05-06: VPN Permission

**Severity:** BLOCKER (requires declaration)

**What to look for:**
`BIND_VPN_SERVICE` permission or `VpnService` subclass. VPN apps must complete the VPN declaration in Play Console and cannot be used for traffic monitoring, ad injection, or unauthorized data collection.

**Evidence sources:**
- `AndroidManifest.xml` → `<service android:name="...VpnService">`
- `BIND_VPN_SERVICE` permission entry

**Pass condition:** VPN service not present.

**Blocker condition:** VPN service present but Play Console VPN declaration not completed.

**Suggested fix:** Complete the VPN declaration in Play Console > App Content. Ensure VPN is used solely for its intended purpose (privacy protection, network security).

**Official ref:** https://play.google.com/about/privacy-security-deception/device-network-abuse/
