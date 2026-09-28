# Sensitive permissions

These are human review prompts, not additional executable rules or guaranteed rejection criteria. Run the CLI first. Keep unsupported conclusions UNKNOWN and label manual findings separately from CLI output. Policy applicability depends on current official requirements and the actual app, market, audience and release.

Inspect the merged release manifest and actual capability usage. SMS/call logs, background location, all-files access, package visibility and Accessibility have specific eligibility/disclosure conditions. Presence triggers review, not an automatic assertion that the app is illegal. Source manifests and Expo permission arrays may miss permissions injected by dependencies. Do not remove required permissions without understanding the feature and allowed alternatives.

CLI categories: GP-MANIFEST-001, GP-PERMISSIONS-001.

Source: https://support.google.com/googleplay/android-developer/answer/16558241?hl=en
