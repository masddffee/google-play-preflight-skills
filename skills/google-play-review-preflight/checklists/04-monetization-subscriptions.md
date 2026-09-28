# Payments and subscriptions

These are human review prompts, not additional executable rules or guaranteed rejection criteria. Run the CLI first. Keep unsupported conclusions UNKNOWN and label manual findings separately from CLI output. Policy applicability depends on current official requirements and the actual app, market, audience and release.

Determine whether purchases are digital goods, physical goods/services, or another category. Verify user markets, applicable programs, enrollment and implementation before judging alternative billing or external links. Never mark Stripe/PayPal/Paddle automatically BLOCKER. Inspect real subscription pricing, renewal/trial terms, cancellation, purchase recovery and deceptive UI behavior. A Billing dependency does not prove the flow complies; a RevenueCat package version does not prove its resolved native Billing Library version.

CLI categories: GP-BILLING-001, GP-BILLING-002. Consult the dated policy table and official deprecation source rather than hardcoding a perpetual minimum.

Sources: https://support.google.com/googleplay/android-developer/answer/9858738?hl=en and https://developer.android.com/google/play/billing/deprecation-faq
