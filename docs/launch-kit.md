# Launch kit

## Positioning

AI agents can write mobile apps. Shipping still needs evidence.

play-preflight checks selected Google Play release risks locally, preserves UNKNOWN when context is missing, and produces reviewable reports in CI. The CLI is the product; the skill is one interface.

## Demonstration

Regenerate `docs/demo.svg`, `docs/demo.txt` and `examples/generated/` with `npm run demo`. Record a 15–20 second terminal capture: scan `fixtures/expo-risk`, open `report.html`, point at the target API and declared deletion blockers, then scan `fixtures/expo-fixed`. Keep the remaining UNKNOWN count visible. Label it a synthetic fixture. Do not imply that a real app was rejected or subsequently approved.

## English launch draft

I turned a Google Play checklist skill into a runnable CLI and GitHub Action. It scans selected Android/Expo/React Native/Flutter settings, includes source evidence and dated policy context, and returns UNKNOWN rather than guessing what it cannot verify. No API key or project-code execution. Looking for small reproducible false-positive/false-negative cases from mobile developers. Repository and synthetic demo attached.

## 繁體中文發文草稿

把原本只提供檢查清單的 Google Play Skill，改成真正能執行的 CLI 與 GitHub Action。可檢查部分上架設定，附檔案位置、政策來源與報告；缺少建置產物或人工驗證時保留 UNKNOWN，不假裝保證過審。展示來自合成範例，接下來希望收集 Android／Expo／React Native／Flutter 開發者可重現、已去識別的誤判案例。

## Distribution experiment

Start with one real reproducible problem and one relevant developer community; respect self-promotion rules. Publish the demo and actual installation command. Track referral-specific repository visits, successful installs volunteered by testers, completed scans, issues with minimal reproductions and returning users. Do not infer usage from stars or add hidden telemetry. Repair onboarding and false positives before broad promotion.

No posts have been published by adding this file. No star count, adoption target, endorsement or guaranteed growth outcome is claimed.
