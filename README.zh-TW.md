# play-preflight

**在送出 Google Play 審核前，找出可確認的上架風險。**

[English](README.md) · [繁體中文](README.zh-TW.md)

可直接執行的本機 CLI 與 GitHub Action，支援 Android、Expo、React Native、Flutter 的靜態設定檢查。每項結果附檔案位置、證據類型、政策來源與下一步；資料不足會標示 UNKNOWN，不假裝已通過。

![合成範例的實際掃描摘要](docs/demo.svg)

## 安裝與第一次執行

需要 Node.js 22+ 與 Git。直接從 GitHub 的 v1 分支安裝：

```sh
npx --yes --package="github:masddffee/google-play-preflight-skills#v1" play-preflight scan .
```

或不安裝依賴，直接執行原始碼：

```sh
git clone https://github.com/masddffee/google-play-preflight-skills.git
cd google-play-preflight-skills
node bin/play-preflight.js scan fixtures/expo-risk --as-of 2026-09-28
```

範例刻意包含兩項 blocker，因此退出碼 1 是成功抓到問題，不是安裝失敗。此版本透過 GitHub 配送，沒有宣稱已發布 npm。請勿以未驗證的 `npx play-preflight` 同名套件替代。正式環境建議固定完整 commit SHA。

## 功能與限制

共 20 類檢查，包含可由靜態證據判定的設定、需要人工確認的政策條件，以及由開發者自行聲明的資訊；**不代表 20 類政策都能自動驗證**。

支援日期／裝置／新送審或既有 App 情境、政策檢查期限、合併後 release manifest、已辨識的 Billing wrapper、權限風險、帳號刪除與審查存取條件。輸出 Terminal、JSON、Markdown、HTML、SARIF。

| 結果 | 意義 |
|---|---|
| BLOCKER | 有具體違反檢查的證據，或開發者明確聲明缺少必要機制；不是預測 Google 的決定 |
| WARNING | 有待處理的設定風險或維護問題 |
| UNKNOWN | 缺少建置產物、外部情境或人工驗證 |
| PASS | 只適用於該項檢查；使用者聲明並未獨立驗證 |
| SKIP | 在已提供的情境下不適用 |

不需要 API key。一般掃描不連網、不執行專案程式、不讀取憑證檔，也不修改 App。動態 Expo 設定、Gradle flavor 或不確定的版本覆寫不會被猜測成 PASS。

## 日常使用

```sh
play-preflight scan ./mobile --output-dir .play-preflight
play-preflight scan ./mobile --format json
play-preflight scan ./mobile --fail-on unknown
play-preflight init ./mobile
```

`.play-preflight.json` 僅放不敏感的情境。未知欄位留空，不要為了綠燈填入不實的 reviewed=true。一般模式退出碼 0 只表示未達到所選阻擋門檻，不代表可上架；1 代表達到門檻，2 代表輸入或執行錯誤。

CI 可使用 `masddffee/google-play-preflight-skills@v1`。所有報告會先寫出再判定是否失敗，可保留失敗時的分析。完整設定範例見 [英文 README](README.md)、[Action 文件](docs/github-action.md)、[設定參考](docs/configuration.md)。

## Agent Skill

```sh
npx skills add masddffee/google-play-preflight-skills --skill google-play-review-preflight
```

Skill 現在負責呼叫 CLI、解讀證據與協助修復，不再把 LLM 的猜測當作掃描器。CLI 與 Skill 分開安裝；只複製 SKILL.md 不能取代執行工具。

## 政策維護與驗證

政策快照核對日為 2026-09-28。每週 workflow 檢查官方來源是否可讀、關鍵內容是否變動，**不會自動把新政策當成已核准規則**。來源變動須人工核對。

```sh
play-preflight policy check --online --format json
npm run check
npm test
npm run smoke
npm run demo
```

目前不包含 Play Console API、App 實機測試、AAB／ELF 二進位檢查，也不保證審核通過。所有展示均來自合成 fixture，沒有宣稱真實 App 準確率或使用者成效。詳見 [檢查範圍](docs/rules.md)、[驗證說明](docs/validation.md)。

MIT 授權；非 Google 官方產品，未獲 Google 背書。
