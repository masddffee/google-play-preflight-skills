# Expo / React Native walkthrough

1. Run the CLI from the app root, not the monorepo root.
2. For managed Expo with static `app.json`, the scanner reads `expo-build-properties` plugin options. It does not treat a made-up `expo.android.targetSdkVersion` field as a resolved setting.
3. Dynamic `app.config.js` / `.ts` is never executed. Use a release manifest generated through your own trusted build when exact values matter.
4. React Native Gradle properties such as `rootProject.ext.targetSdkVersion` remain unresolved in v1. Provide the selected merged release manifest instead of assuming the framework default.
5. RevenueCat (`react-native-purchases`) is recognized as a Billing wrapper; its package version does not prove the native Play Billing Library version.
6. Enter only verified non-secret context in `.play-preflight.json`, inspect HTML or JSON, make minimal changes in your app, rebuild and rescan.

```sh
play-preflight scan ./apps/mobile --output-dir .play-preflight
play-preflight scan ./apps/mobile --manifest path/from/your/build/AndroidManifest.xml --fail-on unknown
```

The manifest path above is explanatory, not a guaranteed Gradle path. See the official [Expo build-properties documentation](https://docs.expo.dev/versions/latest/sdk/build-properties/) and [Android manifest merging guide](https://developer.android.com/build/manage-manifests).
