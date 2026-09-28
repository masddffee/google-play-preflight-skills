# Technical release checks

These are human review prompts, not additional executable rules or guaranteed rejection criteria. Run the CLI first. Keep unsupported conclusions UNKNOWN and label manual findings separately from CLI output. Policy applicability depends on current official requirements and the actual app, market, audience and release.

Use the dated target-API table for the correct device and submission context. New/updated apps and unchanged-app availability are different policies. Verify any granted extension separately. Resolve final build variants rather than guessing dynamic Gradle or Expo settings. Inspect production signing, release debuggability, the actual AAB and all shipped native libraries. 64-bit and 16 KB compatibility require artifact/runtime checks; library names and configuration alone do not establish them. R8/minification and minimum SDK preferences are not blanket Play rejection rules.

CLI categories: GP-TARGET-001, GP-DEBUG-001, GP-RELEASE-001, GP-SIGNING-001, GP-NATIVE-001, GP-NATIVE-002. No AAB, ELF or runtime analyzer is included in v1.

Sources: https://support.google.com/googleplay/android-developer/answer/11926878?hl=en and https://developer.android.com/guide/practices/page-sizes
