# Checklist 04 — Monetization & Subscriptions

> Policy references:
> - [Payments Policy](https://play.google.com/about/monetization-ads/payments/)
> - [Subscriptions](https://play.google.com/about/monetization-ads/subscriptions/)
> - [In-App Purchases](https://support.google.com/googleplay/android-developer/answer/1153481)
>
> **Note:** Google Play policies change frequently. Always verify against the latest official policy.

---

## CHECK-04-01: Google Play Billing Library Used for All In-App Purchases

**Severity:** BLOCKER

**What to look for:**
All digital goods and subscriptions sold inside an Android app must use Google Play Billing Library. Any alternative payment method offered for digital purchases (including directing users to a website to purchase) is a policy violation.

**Evidence sources:**
- `build.gradle` (app level) → `com.android.billingclient:billing`
- `pubspec.yaml` → `in_app_purchase` (Flutter official plugin wrapping Play Billing)
- `package.json` → `react-native-iap`, `@react-native-google-play-billing/google-play-billing`, `expo-in-app-purchases`

**Pass condition:** Play Billing Library dependency detected for apps with in-app purchases.

**Blocker condition:**
- App sells digital goods but no Play Billing Library dependency detected
- Code contains references to alternative payment processors (Stripe, PayPal, Paddle) for digital content purchases
- Deep links to external purchase pages for digital goods

**Warning condition:** Multiple IAP libraries present — potential conflict.

**Suggested fix:** Use only Google Play Billing Library for in-app purchases of digital goods. Physical goods, services delivered offline, or peer-to-peer payments are exempt.

**Official ref:** https://play.google.com/about/monetization-ads/payments/

---

## CHECK-04-02: Subscription Terms Disclosed Before Purchase

**Severity:** BLOCKER

**What to look for:**
Before a user subscribes, the app must clearly disclose:
- Price and billing period
- How to cancel
- Any free trial terms (length, what happens at end of trial)

**Evidence sources:**
- Search for subscription-related UI strings: "trial", "subscribe", "per month", "per year", "cancel anytime"
- Paywall screen components

**Pass condition:** Subscription disclosure strings or UI elements found that include price, billing frequency, and cancellation info.

**Warning condition:** Subscription UI detected but disclosure text is minimal or hard to find.

**Blocker condition:** Free trial offered but no clear disclosure of what happens after the trial ends.

**Suggested fix:**
- Show price, billing cycle, and trial terms on the paywall/subscription screen before the user taps purchase.
- Link to subscription management settings.

**Official ref:** https://play.google.com/about/monetization-ads/subscriptions/

---

## CHECK-04-03: No Dark Patterns in Subscription Flows

**Severity:** BLOCKER

**What to look for:**
Subscription flows must not use dark patterns:
- No misleading "free" claims that hide required subscription
- No hiding the cancel option or making it significantly harder than subscribing
- No confusing UI that tricks users into subscribing (e.g., disguising a subscription purchase as a one-time payment)
- No using "X" / close buttons that initiate purchases instead of dismissing

**Evidence sources:**
- Search for: "Close" / "×" button handlers near IAP calls
- Look for subscription purchase triggered on dismiss/navigation gestures

**Pass condition:** No dark pattern indicators detected in subscription flow code.

**Warning condition:** Purchase trigger found close to dismiss/cancel UI elements — manual review required.

**Suggested fix:** Ensure purchase is only triggered by an affirmative, clearly labeled "Subscribe" or "Buy" action.

**Official ref:** https://play.google.com/about/monetization-ads/subscriptions/

---

## CHECK-04-04: Restore Purchases Mechanism

**Severity:** WARNING

**What to look for:**
Apps must allow users to restore previous purchases, especially subscriptions and non-consumable in-app products.

**Evidence sources:**
- Search for: "restorePurchases", "queryPurchasesAsync", "BillingClient.queryPurchasesAsync"
- React Native IAP: `getAvailablePurchases`, `restorePurchases`
- Flutter: `InAppPurchase.instance.restorePurchases()`

**Pass condition:** Restore purchases flow detected in codebase.

**Warning condition:** IAP library used but no restore purchases call found.

**Suggested fix:** Implement a "Restore Purchases" button in account/settings screen that calls the appropriate Play Billing restore function.

**Official ref:** https://developer.android.com/google/play/billing/integrate#restore

---

## CHECK-04-05: No External Links to Purchase Pages for Digital Goods

**Severity:** BLOCKER

**What to look for:**
Apps must not link users to external websites to purchase digital content that is available inside the app. This includes:
- "Buy on our website" buttons for subscriptions
- Deep links to web checkout for premium features
- Buttons that open browser to purchase

**Evidence sources:**
- Search for: `Linking.openURL`, `openURL`, `Intent.ACTION_VIEW` near subscription/payment context
- Search for checkout, purchase, buy, subscribe in URL strings

**Pass condition:** No external purchase links detected for digital goods.

**Blocker condition:** External URL opened in context of digital goods purchase.

**Suggested fix:** Remove external purchase links for digital content. Use Play Billing exclusively.

**Official ref:** https://play.google.com/about/monetization-ads/payments/
