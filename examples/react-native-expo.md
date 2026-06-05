# Example: React Native / Expo App Walkthrough

This example shows how to apply the google-play-review-preflight skill to a typical Expo-managed React Native app.

---

## Scenario

App: **DailyJournal** — a journaling app with premium subscription and optional cloud sync.  
Stack: Expo SDK 51, React Native 0.74, TypeScript  
Features: Text journals, photo attachments, iCloud/Google Drive sync, premium subscription (ad-free + unlimited journals)

---

## Step 1: Run the Skill

Paste this into your AI agent (Claude Code / Cursor / Copilot):

```
Use the google-play-review-preflight skill to audit this Expo React Native project before Google Play submission.

Read these files first:
- app.json
- eas.json
- package.json
- android/app/src/main/AndroidManifest.xml (if present)

Then run all 7 checklist categories and produce a complete audit report.
```

---

## Step 2: What the Agent Will Find

### app.json (simplified)

```json
{
  "expo": {
    "name": "DailyJournal",
    "slug": "daily-journal",
    "version": "2.1.0",
    "android": {
      "package": "com.yourcompany.dailyjournal",
      "targetSdkVersion": 34,
      "minSdkVersion": 24,
      "enableProguardInReleaseBuilds": true,
      "permissions": [
        "CAMERA",
        "READ_MEDIA_IMAGES",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

### package.json dependencies (relevant)

```json
{
  "dependencies": {
    "expo-camera": "^15.0.0",
    "expo-image-picker": "^15.0.0",
    "expo-in-app-purchases": "^14.0.0",
    "react-native-iap": "^12.0.0",
    "@react-native-firebase/app": "^20.0.0",
    "@react-native-firebase/auth": "^20.0.0",
    "@react-native-firebase/analytics": "^20.0.0",
    "@react-native-firebase/crashlytics": "^20.0.0"
  }
}
```

---

## Step 3: Expected Findings

### BLOCKERS

| # | Check | Finding | Fix |
|---|-------|---------|-----|
| 1 | CHECK-01-03: Account Deletion | Firebase Auth detected + no delete account UI found | Add "Delete Account" in Settings; add web deletion URL to Play Console |
| 2 | CHECK-04-01: Play Billing | BOTH `expo-in-app-purchases` AND `react-native-iap` detected — potential conflict; verify only one is used | Remove duplicate IAP library; keep one Play Billing implementation |

### WARNINGS

| # | Check | Finding | Fix |
|---|-------|---------|-----|
| 1 | CHECK-01-02: Data Safety | Firebase Analytics + Crashlytics detected — confirm Data Safety form declares analytics and crash data | Complete Data Safety in Play Console |
| 2 | CHECK-04-02: Subscription terms | Verify paywall shows price, billing period, and cancellation info | Review PaywallScreen UI |
| 3 | CHECK-04-04: Restore purchases | Check that `getAvailablePurchases` or similar restore call exists | Add restore purchases button |
| 4 | CHECK-05-05: Prominent disclosure | `expo-camera` used — ensure disclosure shown before `Camera.requestCameraPermissionsAsync()` | Add explanation modal before camera permission request |

### PASSED

- targetSdkVersion: 34 ✓
- Package ID: `com.yourcompany.dailyjournal` ✓ (no Google/competitor terms)
- ProGuard enabled ✓
- No SMS/Call Log/Accessibility permissions ✓
- No external purchase links detected ✓

---

## Step 4: Fix the BLOCKERs

### Fix 1: Account Deletion (React Native + Firebase)

```typescript
// src/screens/settings/AccountScreen.tsx
import { getAuth, deleteUser } from 'firebase/auth'
import { Alert } from 'react-native'

function DeleteAccountSection() {
  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = getAuth().currentUser
              if (user) {
                await user.delete()
                // Navigate to login screen
              }
            } catch (error) {
              // Handle re-authentication required error
              // Firebase may require recent login before deletion
            }
          }
        }
      ]
    )
  }

  return (
    <TouchableOpacity onPress={handleDeleteAccount}>
      <Text>Delete Account</Text>
    </TouchableOpacity>
  )
}
```

Then in Play Console: App Content > Data deletion > Add your web deletion URL.

### Fix 2: Remove Duplicate IAP Library

Keep only `react-native-iap` (or `expo-in-app-purchases` if staying in Expo ecosystem):

```bash
# Remove duplicate
npx expo install --fix
# or
npm uninstall expo-in-app-purchases
```

### Fix 3: Camera Prominent Disclosure (Expo)

```typescript
// src/hooks/useCamera.ts
import { Alert } from 'react-native'
import { Camera } from 'expo-camera'

export async function requestCameraWithDisclosure(): Promise<boolean> {
  // Show disclosure BEFORE system prompt
  return new Promise((resolve) => {
    Alert.alert(
      'Camera Access',
      'DailyJournal uses your camera to attach photos to journal entries. Photos are stored locally and synced only if you enable cloud backup.',
      [
        { text: 'Not Now', onPress: () => resolve(false) },
        {
          text: 'Continue',
          onPress: async () => {
            const { status } = await Camera.requestCameraPermissionsAsync()
            resolve(status === 'granted')
          }
        }
      ]
    )
  })
}
```

---

## Step 5: Play Console Checklist (Manual)

After fixing code issues, verify these in Play Console:

- [ ] **Data Safety** — Declare: Analytics (Firebase), Crash reports (Crashlytics), App activity (journals), Photos (user-attached)
- [ ] **Account deletion URL** — `https://yourapp.com/delete-account`
- [ ] **Content rating** — Complete questionnaire (DailyJournal = Everyone, no violence/adult content)
- [ ] **Target audience** — 18+ (or 16+ if allowing teen journaling)
- [ ] **Ads** — Not applicable (premium subscription, no ads)
- [ ] **Privacy policy** — `https://yourapp.com/privacy` — verify it mentions analytics and cloud sync

---

## Expo-Specific Notes

1. **Permissions in app.json, not AndroidManifest.xml**: In Expo managed workflow, always check `app.json` → `android.permissions`. The AndroidManifest.xml is auto-generated.

2. **targetSdkVersion in app.json**: Set `expo.android.targetSdkVersion` — do not edit android/app/build.gradle directly in managed workflow.

3. **EAS Build for release**:
   ```json
   // eas.json
   {
     "build": {
       "production": {
         "android": {
           "buildType": "app-bundle"
         }
       }
     }
   }
   ```

4. **Expo SDK version** maps to targetSdkVersion — keep Expo SDK up to date to meet Play requirements.
