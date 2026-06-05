# Checklist 03 — Content Declarations

> Policy references:
> - [App Content](https://support.google.com/googleplay/android-developer/answer/9859455) (Play Console)
> - [Families Policy](https://play.google.com/about/families/)
> - [Content Rating](https://support.google.com/googleplay/android-developer/answer/188189)
> - [Ads](https://play.google.com/about/monetization-ads/ads/)
>
> **Note:** Google Play policies change frequently. Always verify against the latest official policy.

---

## CHECK-03-01: Content Rating Questionnaire Completed

**Severity:** BLOCKER

**What to look for:**
All apps must complete the content rating questionnaire in Play Console (App Content > Content Rating). An unrated app cannot be published.

**Evidence sources:**
- No direct code evidence; check if any rating configuration file exists (some CI/CD pipelines store this in Fastlane metadata).

**Pass condition:** Content rating has been completed and an IARC/ESRB/PEGI rating is assigned.

**Blocker condition:** App has never been rated, or rating was recently changed after a major feature addition involving mature content, violence, or gambling without re-rating.

**Warning condition:** App contains violence, sexual content, or gambling mechanics — verify the completed rating reflects these features accurately.

**Suggested fix:** Complete or re-complete the content rating questionnaire in Play Console. If adding a new feature category (e.g., user-generated content, simulated gambling), re-run the questionnaire.

**Official ref:** https://support.google.com/googleplay/android-developer/answer/188189

---

## CHECK-03-02: Target Audience Age Group Declaration

**Severity:** BLOCKER

**What to look for:**
Apps must declare their target age group in Play Console (App Content > Target Audience). If the app targets or could attract children under 13, Families Policy applies.

**Evidence sources:**
- `app.json` or README — any description of intended age group
- Keywords in app description: "kids", "children", "family", "toddler", "preschool"
- Presence of cartoon characters, bright colors, simple UI — visual indicators (cannot be detected from code alone)
- Advertising SDKs — if Families Policy applies, only certified Family Ads SDKs are allowed

**Pass condition:** Target audience declared; Families Policy compliance verified if applicable.

**Blocker condition:** App description uses child-focused language or imagery but target audience is declared as "18+" — inconsistency is a known rejection cause.

**Warning condition:** App could be appealing to children (games, educational tools) but audience declaration has not been reviewed.

**Suggested fix:**
- If targeting mixed audience (under 13 + adults), use the "mixed audience" option in Play Console.
- Remove advertising SDKs not certified under the Families Ads Program if targeting children.
- Do not use interest-based advertising if the app targets children.

**Official ref:** https://play.google.com/about/families/

---

## CHECK-03-03: Ads Declaration — Ad Networks and Content

**Severity:** BLOCKER

**What to look for:**
If the app shows ads, declare this in Play Console (App Content > Ads). Check for advertising SDKs:

Known ad SDKs to detect:
- `com.google.android.gms:play-services-ads` (AdMob)
- `com.facebook.android:audience-network-sdk` (Meta)
- `com.applovin:applovin-sdk`
- `com.unity3d.ads:unity-ads`
- `io.flutter_community:flutter_unity_ads` (Flutter)
- `react-native-google-mobile-ads` (RN)
- `expo-ads-admob` (Expo)

**Evidence sources:**
- `build.gradle` (app level) → dependencies block
- `pubspec.yaml` → dependencies
- `package.json` → dependencies

**Pass condition:** No ad SDK detected, or ad SDK detected and "Contains ads" is declared in Play Console.

**Blocker condition:** Ad SDK present but not declared in Play Console — known rejection cause.

**Warning condition:** Multiple ad SDK versions present; may indicate version conflicts that cause runtime crashes.

**Suggested fix:** Declare "Contains ads" in Play Console > App Content > Ads. For apps targeting children, use only Families-certified ad SDKs.

**Official ref:** https://play.google.com/about/monetization-ads/ads/

---

## CHECK-03-04: User-Generated Content (UGC) Moderation

**Severity:** WARNING

**What to look for:**
Apps that allow user-generated content (comments, posts, images, chat) must have a moderation policy and reporting mechanism.

**Evidence sources:**
- Feature detection: look for "chat", "post", "comment", "upload", "share" in component/screen names
- Any social or community-related dependencies

**Pass condition:** No UGC features detected, or UGC features exist with evidence of moderation (report button, content guidelines).

**Warning condition:** Chat or community features present with no visible moderation/reporting UI.

**Suggested fix:** Add in-app content reporting and implement moderation. Declare UGC in Play Console App Content section.

**Official ref:** https://play.google.com/about/privacy-security-deception/user-data/

---

## CHECK-03-05: Sensitive App Categories — Special Declarations

**Severity:** BLOCKER (if applicable)

**What to look for:**
The following app categories require additional declarations or approvals:

| Category | Requirement |
|----------|-------------|
| Financial services / lending | Must declare interest rates; lending apps require country-specific compliance |
| Gambling / simulated gambling | Must be approved by Google; geofencing required |
| Healthcare / medical | Must not make false health claims |
| VPN | Must complete the VPN declaration form |
| Call recording | Country restrictions apply; must disclose to all parties |
| Government / law enforcement | Impersonation prohibited |

**Evidence sources:**
- App description text — financial, gambling, health, VPN keywords
- Permissions: `BIND_VPN_SERVICE`, `READ_CALL_LOG`, `PROCESS_OUTGOING_CALLS`
- SDK: any VPN or financial services library

**Pass condition:** App does not fall into a restricted category, or has completed the required declaration/approval.

**Blocker condition:** App operates in a restricted category without completing required Play Console declarations.

**Suggested fix:** Navigate to Play Console > App Content and complete the declaration relevant to your app category.

**Official ref:** https://play.google.com/about/developer-content-policy/
