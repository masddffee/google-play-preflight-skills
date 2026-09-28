# Rule catalog — v1

20 scoped check categories. This is not a claim that 20 policy categories can be fully verified automatically. Each report states the exact evidence and remaining uncertainty.

| ID | Category | Evidence boundary |
|---|---|---|
| GP-POLICY-001 | Policy snapshot freshness | Selected static/artifact/policy observations; see finding limitations |
| GP-SCAN-001 | Scan coverage | Selected static/artifact/policy observations; see finding limitations |
| GP-TARGET-001 | Target API | Selected static/artifact/policy observations; see finding limitations |
| GP-MANIFEST-001 | Merged release manifest | Selected static/artifact/policy observations; see finding limitations |
| GP-DEBUG-001 | Debuggable release | Selected static/artifact/policy observations; see finding limitations |
| GP-PERMISSIONS-001 | Restricted permission eligibility | Selected static/artifact/policy observations; see finding limitations |
| GP-BILLING-001 | Payment policy context | Selected static/artifact/policy observations; see finding limitations |
| GP-BILLING-002 | Billing Library version | Selected static/artifact/policy observations; see finding limitations |
| GP-PRIVACY-001 | Privacy policy URL | Manual context / user attestation; no independent behavior verification |
| GP-DATA-001 | Data safety declaration | Manual context / user attestation; no independent behavior verification |
| GP-ACCOUNT-001 | Account deletion | Manual context / user attestation; no independent behavior verification |
| GP-ACCESS-001 | Reviewer access | Manual context / user attestation; no independent behavior verification |
| GP-ADS-001 | Ads declaration | Manual context / user attestation; no independent behavior verification |
| GP-CONTENT-001 | Audience and content rating | Manual context / user attestation; no independent behavior verification |
| GP-RELEASE-001 | Release artifact format | Selected static/artifact/policy observations; see finding limitations |
| GP-SIGNING-001 | Release signing | Selected static/artifact/policy observations; see finding limitations |
| GP-NATIVE-001 | 64-bit native compatibility | Manual context / user attestation; no independent behavior verification |
| GP-NATIVE-002 | 16 KB page-size compatibility | Manual context / user attestation; no independent behavior verification |
| GP-LISTING-001 | Store listing text lengths | Selected static/artifact/policy observations; see finding limitations |
| GP-RUNTIME-001 | Runtime and release behavior | Manual context / user attestation; no independent behavior verification |

## Detection boundaries

Gradle: selected literal target SDK in defaultConfig, direct Billing dependency versions and obvious release debug signing. Variable/property expressions, extra target assignments and flavors are not interpreted; supply a merged manifest. Expo: static app.json build-properties settings; dynamic app.config.* is not executed. Flutter: project detection and Android Gradle/manifest inspection, not resolution of flutter.targetSdkVersion. Package detection is a signal, never proof that an SDK feature runs.

A caller-supplied merged manifest is structurally parsed without DTD/entity execution and supplies artifact evidence. The scanner cannot verify that it came from the actual submission build. Its scoped permission list is not the complete permission-policy catalog.

API availability checks on unchanged existing apps warn, rather than mislabeling discoverability constraints as new-submission rejection. Declared extensions lead to manual review, not a blanket exemption. Regional billing always requires verified context. URL checks are syntax checks, not network/content checks.

Review the [dated machine-readable policy](../rules/policy.json) and [configuration evidence classes](configuration.md). Reports expose the official reference per finding.
