# google-play-preflight-skills

**在送審前找出 Google Play 審核退件原因。**

這是一個專為 AI coding agent 設計的 Google Play 上架前審查 skill。引導 Claude Code、GitHub Copilot、Cursor 等 AI agent 掃描你的 Android / Expo / React Native / Flutter 專案，在送出 Play Store 審核前，依 Google Play 政策分類產出結構化風險報告。

> **免責聲明：** 本 skill 依據公開的 Google Play 開發者計畫政策識別*可能的*退件風險，**不保證**審核通過。Google Play 政策頻繁更新，送審前請務必以 [Google 最新官方政策](https://play.google.com/about/developer-content-policy/) 為準。

---

## 為什麼需要這個工具？

Google Play 因可預測、以政策為依據的原因退件或延遲審核。大多數問題都可以從程式碼中偵測出來：

| 常見退件原因 | 可偵測？ |
|------------|---------|
| targetSdkVersion 版本過低 | ✓ 從 build.gradle / app.json |
| 缺少帳號刪除機制 | ✓ 從驗證程式碼 + UI 搜尋 |
| 廣告 SDK 未在 Data Safety 申報 | ✓ 從 package.json / build.gradle |
| Play Console 未申報「含廣告」 | ✓ 從依賴項偵測 |
| IAP 未使用 Google Play Billing | ✓ 從依賴項檢查 |
| 非法使用 SMS/通話紀錄權限 | ✓ 從 AndroidManifest.xml |
| 需要登入的 App 未提供測試帳號 | ✓ 從驗證 + UX 模式偵測 |
| Release Build 使用 Debug 簽章 | ✓ 從建置設定 |

本 skill 在你等退件通知前，自動執行以上所有檢查。

---

## 適合誰使用？

- **Android 原生開發者**，準備上架 Google Play
- **React Native / Expo 開發者**，目標平台包含 Play Store
- **Flutter 開發者**，Android 版本上架前
- **使用 AI 協助開發的團隊**，搭配 Claude Code、Cursor、Copilot 等工具
- **獨立開發者**，可能對 Play 政策細節不熟悉

---

## 快速開始

### 方式一：Claude Code（推薦）

將 skill 加入你的 Claude Code 專案：

```bash
# 從專案根目錄
npx skills add google-play-preflight-skills
```

或手動複製 skill 檔案：

```bash
# Clone 本 repo
git clone https://github.com/YOUR_USERNAME/google-play-preflight-skills.git

# 複製 skill 到你的專案 .claude/skills/ 目錄
mkdir -p .claude/skills/google-play-review-preflight
cp -r google-play-preflight-skills/skills/google-play-review-preflight/ .claude/skills/
```

然後在 Claude Code 中執行：

```
/google-play-review-preflight
```

或直接使用 `skills/google-play-review-preflight/prompts/` 中的 prompt。

### 方式二：複製貼上 Prompt（任何 AI Agent）

快速掃描（約 5 分鐘）：

```
讀取 AndroidManifest.xml、build.gradle（Expo 專案讀 app.json）和 package.json。
檢查以下 Google Play 審核封鎖項目：
1. targetSdkVersion 是否符合當前 Play 最低要求（2025 年起為 34+）
2. 是否有宣告 SMS/通話紀錄/無障礙服務等敏感權限
3. 是否有隱私政策 URL
4. 若偵測到 Firebase/AdMob：標記 Data Safety 表單需要填寫
5. 若偵測到 IAP：確認是否使用 Google Play Billing Library
6. Release 簽章設定是否使用正式 keystore（非 debug.keystore）
7. 若偵測到登入功能：提示需在 Play Console 提供測試帳號

每個問題請輸出：狀態（BLOCKER/WARNING/PASS）、證據、檔案路徑與行號、建議修正方式。
```

完整審查 prompt 請見 [`skills/google-play-review-preflight/prompts/full-audit.md`](skills/google-play-review-preflight/prompts/full-audit.md)。

---

## 涵蓋的檢查項目

### 7 大政策類別，35+ 個個別檢查

| # | 類別 | 主要檢查項目 |
|---|------|------------|
| 1 | [隱私與資料安全](skills/google-play-review-preflight/checklists/01-privacy-data-safety.md) | 隱私政策 URL、Data Safety 表單、帳號刪除、不必要的資料收集 |
| 2 | [商店素材與 Metadata](skills/google-play-review-preflight/checklists/02-store-listing.md) | 關鍵字堆砌、誤導性聲明、仿冒、最低功能要求 |
| 3 | [內容申報](skills/google-play-review-preflight/checklists/03-content-declarations.md) | 內容分級、目標受眾、廣告申報、使用者生成內容管理、敏感類別 |
| 4 | [盈利與訂閱](skills/google-play-review-preflight/checklists/04-monetization-subscriptions.md) | Play Billing Library、訂閱條款揭露、暗黑模式、恢復購買 |
| 5 | [敏感權限](skills/google-play-review-preflight/checklists/05-sensitive-permissions.md) | SMS/通話紀錄、無障礙服務、位置精度、顯著揭露、VPN |
| 6 | [技術品質](skills/google-play-review-preflight/checklists/06-technical-quality.md) | Target SDK、64-bit 支援、API key 佔位符、App Bundle、簽章設定 |
| 7 | [受限存取](skills/google-play-review-preflight/checklists/07-restricted-access.md) | 測試帳號、除錯模式、側載、偽系統介面 |

### 每個檢查的輸出格式

```
| 狀態   | BLOCKER（封鎖）/ WARNING（警告）/ PASS（通過）|
| 證據   | 在程式碼中找到（或未找到）的內容            |
| 檔案   | 檔案路徑與行號                             |
| 修正   | 解決問題的具體行動                          |
| 參考   | 官方 Google Play 政策頁面連結              |
```

---

## 支援的技術堆疊

| 技術堆疊 | Manifest 位置 | 設定檔 |
|---------|--------------|-------|
| Android 原生 | `AndroidManifest.xml` | `build.gradle` / `build.gradle.kts` |
| React Native | `android/app/src/main/AndroidManifest.xml` | `package.json` |
| Expo（受管理工作流程） | `app.json` / `app.config.js` | `eas.json` |
| Flutter | `android/app/src/main/AndroidManifest.xml` | `pubspec.yaml` |

---

## 限制說明

- **僅限程式碼分析**：Play Console 表單的完整性（Data Safety、內容分級等）必須手動確認。
- **不進行執行時測試**：無法偵測崩潰、UI 佈局問題或執行時行為。
- **政策時效性**：Google Play 政策持續更新，本 skill 反映的是最後更新時的政策內容，送審前請確認最新官方文件。
- **誤判可能性**：SDK 偵測基於依賴項，部分結果可能不適用於你的特定 SDK 使用方式。
- **不連接 Play Console**：本 skill 不連接 Play Console、Play Developer API 或任何 Google 服務。

---

## 免責聲明

本專案與 Google LLC 無任何關聯、背書或贊助關係。「Google Play」和「Android」為 Google LLC 的商標。

本 skill 依據靜態程式碼分析，對照公開的 [Google Play 開發者計畫政策](https://play.google.com/about/developer-content-policy/) 識別可能的審查風險。**不保證** Play Store 審核通過，亦**不得**用於規避 Google Play 政策。

---

## 貢獻

請見 [CONTRIBUTING.md](CONTRIBUTING.md)。政策更新和新檢查項目的貢獻特別歡迎。

## 授權條款

MIT — 詳見 [LICENSE](LICENSE)。

---

## 建議的 GitHub Topics

`google-play` · `android` · `play-console` · `app-review` · `ai-agent` · `claude-code` · `react-native` · `expo` · `flutter` · `data-safety` · `preflight`
