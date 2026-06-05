# Checklist 01 — Privacy & Data Safety

> Policy reference: [User Data](https://play.google.com/about/privacy-security-deception/user-data/)
> and [Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469)
>
> **Note:** Google Play policies change frequently. Always verify against the latest official policy.

---

## CHECK-01-01: Privacy Policy URL Present and Accessible

**Severity:** BLOCKER

**What to look for:**
- A publicly accessible privacy policy URL must be declared in Play Console (Store listing > Privacy Policy).
- For code evidence: check README, app.json, or any configuration file that references a privacy policy URL.

**Evidence sources:**
- `app.json` → `expo.android.privacyPolicyUrl` or similar
- `README.md` → privacy policy link
- Any store listing config file

**Pass condition:** A valid HTTPS URL pointing to an app-specific privacy policy is available and returns HTTP 200.

**Blocker condition:** No privacy policy URL exists, URL is dead, or URL points to a generic placeholder.

**Suggested fix:** Host a privacy policy that describes all data your app collects, stores, and shares. Declare the URL in Play Console under Store listing > Privacy Policy.

**Official ref:** https://play.google.com/about/privacy-security-deception/user-data/

---

## CHECK-01-02: Data Safety Section Completeness

**Severity:** BLOCKER

**What to look for:**
Verify that the Data Safety form in Play Console is complete. From code, check if the following data types are potentially collected by inspecting:
- Analytics / crash reporting SDKs (Firebase, Crashlytics, Sentry)
- Advertising SDKs (AdMob, Meta Audience Network, AppLovin)
- Location permissions → implies location data collection
- Camera / Microphone permissions → implies media data collection
- Contacts permission → implies contacts data collection
- `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE` → implies file/storage data

**Evidence sources:**
- `AndroidManifest.xml` — `<uses-permission>` entries
- `package.json` / `pubspec.yaml` — known data-collecting libraries
- `app.json` → `android.permissions`

**Pass condition:** All data types detected in code are reflected in the Data Safety form. Play Console shows the Data Safety section as complete.

**Warning condition:** Analytics or advertising SDK detected in dependencies but developer has not confirmed Data Safety form completeness.

**Suggested fix:** Complete the Data Safety section in Play Console. Ensure every permission and SDK that collects or transmits user data is declared accurately.

**Official ref:** https://support.google.com/googleplay/android-developer/answer/10787469

---

## CHECK-01-03: Account Deletion Mechanism

**Severity:** BLOCKER (if app supports account creation)

**What to look for:**
If the app allows users to create an account, it must provide:
1. An in-app option to request account and data deletion.
2. A web-based deletion URL (declared in Play Console).

**Evidence sources:**
- App navigation / screen files — look for "delete account", "DeleteAccount", "account deletion" strings
- `app.json` or Play Console config — `android.deleteDataUrl` or similar

**Pass condition:** In-app account deletion UI exists AND a web deletion URL is declared.

**Blocker condition:** App creates accounts but provides no deletion mechanism.

**Warning condition:** Account deletion flow exists in UI but no web deletion URL is declared in Play Console.

**Suggested fix:**
1. Add an in-app "Delete Account" option in account/profile settings.
2. Create a web page for account deletion requests.
3. Declare the URL in Play Console > App Content > Data deletion.

**Official ref:** https://support.google.com/googleplay/android-developer/answer/13327111

---

## CHECK-01-04: Privacy Policy Consistency with Data Safety

**Severity:** WARNING

**What to look for:**
The privacy policy text must be consistent with the Data Safety declarations. Common mismatches:
- Privacy policy says "we do not share data" but app uses advertising SDKs that share data.
- Privacy policy omits analytics data collection mentioned in Data Safety form.

**Evidence sources:**
- `package.json` / `pubspec.yaml` — advertising/analytics SDK presence
- Privacy policy URL content (if accessible)

**Pass condition:** No obvious inconsistency detected based on dependencies.

**Warning condition:** Advertising or analytics SDKs detected; manual verification of privacy policy consistency required.

**Suggested fix:** Review privacy policy against all SDKs and APIs that collect or share user data. Ensure the policy explicitly covers each data type and sharing partner.

**Official ref:** https://play.google.com/about/privacy-security-deception/user-data/

---

## CHECK-01-05: No Unnecessary Data Collection

**Severity:** WARNING

**What to look for:**
Permissions and data collection must be limited to what is necessary for declared app functionality. Flag permissions that appear unnecessary for the stated app purpose.

**Evidence sources:**
- `AndroidManifest.xml` or `app.json` — full permissions list
- Compare permission list against app description

**Pass condition:** All declared permissions have a clear relationship to app functionality.

**Warning condition:** Permissions present that appear unrelated to core app functionality (e.g., `READ_CONTACTS` in a calculator app).

**Suggested fix:** Remove unused permissions. For each permission, document the specific feature it enables.

**Official ref:** https://play.google.com/about/privacy-security-deception/permissions/
