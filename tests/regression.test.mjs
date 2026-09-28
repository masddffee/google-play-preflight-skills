import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,mkdir,writeFile,rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { scan } from '../src/scan.js';
import { validDate } from '../src/policy.js';
import { validateConfig } from '../src/config.js';
const opts={asOf:'2026-09-28'};
const base={'app/build.gradle':'android { defaultConfig {\ntargetSdk = 36\n} }'};
async function project(t,files){const d=await mkdtemp(path.join(tmpdir(),'preflight-reg-'));t.after(()=>rm(d,{force:true,recursive:true}));for(const [p,x]of Object.entries(files)){const f=path.join(d,p);await mkdir(path.dirname(f),{recursive:true});await writeFile(f,typeof x==='string'?x:JSON.stringify(x));}return d;}
const f=(r,id)=>r.findings.find(x=>x.ruleId===id);
test('flavor target override must not produce a default-config PASS',async t=>{
 const root=await project(t,{'app/build.gradle':'android { defaultConfig {\ntargetSdk = 36\n}\nproductFlavors {legacy {\ntargetSdk = 34\n}}}'});
 assert.equal(f(await scan(root,opts),'GP-TARGET-001').status,'UNKNOWN');
});
test('runtime target override must not produce a literal PASS',async t=>{
 const root=await project(t,{'app/build.gradle':'android { defaultConfig {\ntargetSdk = 36\n}}\nandroid.defaultConfig.targetSdk = project.findProperty("sdk")'});
 assert.equal(f(await scan(root,opts),'GP-TARGET-001').status,'UNKNOWN');
});
for(const contents of ['', 'not XML','<manifest><application></manifest>','<manifest/>','<!DOCTYPE manifest [<!ENTITY e SYSTEM "file:///etc/passwd">]><manifest><application/></manifest>']) {
 test(`invalid supplied manifest is rejected: ${contents.slice(0,24)}`,async t=>{
  const root=await project(t,{...base,'release.xml':contents,'.play-preflight.json':{manifest:'release.xml'}});
  await assert.rejects(scan(root,opts),/manifest|XML/i);
 });
}
test('alternative Android namespace alias does not hide debuggable',async t=>{
 const root=await project(t,{...base,'release.xml':'<manifest xmlns:a="http://schemas.android.com/apk/res/android"><uses-sdk a:targetSdkVersion="36"/><application a:debuggable="true"/></manifest>','.play-preflight.json':{manifest:'release.xml'}});
 const r=await scan(root,opts);assert.equal(f(r,'GP-DEBUG-001').status,'BLOCKER');assert.equal(f(r,'GP-TARGET-001').status,'PASS');
});
test('malformed resolved JSON marks incomplete coverage',async t=>{
 const r=await scan(await project(t,{...base,'app.json':'{invalid'}),opts);assert.equal(f(r,'GP-SCAN-001').status,'UNKNOWN');
});
test('old direct Billing version warns but never mistakes wrapper semver for native version',async t=>{
 const root=await project(t,{'app/build.gradle':base['app/build.gradle']+'\ndependencies { implementation("com.android.billingclient:billing:7.1.1") }'});
 const r=await scan(root,opts);assert.equal(f(r,'GP-BILLING-002').status,'WARNING');
});
test('current Billing major passes only direct dependency observation',async t=>{
 const root=await project(t,{'app/build.gradle':base['app/build.gradle']+'\ndependencies { implementation("com.android.billingclient:billing:8.0.0") }'});
 assert.equal(f(await scan(root,opts),'GP-BILLING-002').status,'PASS');
});
test('debug signing in release does not expose keystore secrets',async t=>{
 const root=await project(t,{'app/build.gradle':base['app/build.gradle']+'\nandroid {buildTypes {release {signingConfig = signingConfigs.getByName("debug")\nstorePassword = "NEVER_PRINT_ME"}}}'});
 const r=await scan(root,opts);assert.equal(f(r,'GP-SIGNING-001').status,'WARNING');assert.ok(!JSON.stringify(r).includes('NEVER_PRINT_ME'));
});
test('explicit missing account deletion is a blocker',async t=>{
 const r=await scan(await project(t,{...base,'.play-preflight.json':{accountCreation:true,accountDeletionInApp:false}}),opts);assert.equal(f(r,'GP-ACCOUNT-001').status,'BLOCKER');
});
test('deletion attestations remain labeled',async t=>{
 const r=await scan(await project(t,{...base,'.play-preflight.json':{accountCreation:true,accountDeletionInApp:true,accountDeletionUrl:'https://example.org/delete'}}),opts);assert.equal(f(r,'GP-ACCOUNT-001').status,'PASS');assert.equal(f(r,'GP-ACCOUNT-001').evidence[0].kind,'attestation');
});
test('listing over limit warns rather than claiming Console rejection',async t=>{
 const r=await scan(await project(t,{...base,'.play-preflight.json':{listing:{title:'a'.repeat(31)}}}),opts);assert.equal(f(r,'GP-LISTING-001').status,'WARNING');
});
test('expired extension cannot downgrade a below-minimum API',async t=>{
 const r=await scan(await project(t,{'app/build.gradle':'android {defaultConfig {targetSdk = 34\n}}','.play-preflight.json':{targetApiExtensionUntil:'2026-09-01'}}),opts);assert.equal(f(r,'GP-TARGET-001').status,'BLOCKER');
});
test('availability uses warning rather than submission blocker',async t=>{
 const r=await scan(await project(t,{'app/build.gradle':'android {defaultConfig {targetSdk = 34\n}}','.play-preflight.json':{submission:'existing'}}),opts);assert.equal(f(r,'GP-TARGET-001').status,'WARNING');
});
for(const date of ['2026-02-30','2026-13-01','26-01-01','2026-01-01T00:00:00Z','yesterday'])test(`invalid date ${date}`,()=>assert.equal(validDate(date),false));
for(const config of [{digitalGoods:'false'},{markets:['usa']},{markets:'US'},{listing:{secret:'x'}},{targetApiExtensionUntil:'2099-99-99'},[]])test(`invalid typed config ${JSON.stringify(config)}`,()=>assert.throws(()=>validateConfig(config)));
test('resource-valued debuggable in supplied manifest stays unknown',async t=>{
 const root=await project(t,{...base,'release.xml':'<manifest xmlns:android="http://schemas.android.com/apk/res/android"><uses-sdk android:targetSdkVersion="36"/><application android:debuggable="@bool/debug"/></manifest>','.play-preflight.json':{manifest:'release.xml'}});
 assert.equal(f(await scan(root,opts),'GP-DEBUG-001').status,'UNKNOWN');
});
test('Flutter billing evidence points to pubspec, not a nonexistent package file',async t=>{
 const root=await project(t,{'pubspec.yaml':'name: demo\ndependencies:\n  purchases_flutter: ^9.0.0\n',...base});
 const finding=f(await scan(root,opts),'GP-BILLING-001');assert.equal(finding.evidence[0].file,'pubspec.yaml');
});
test('content-review attestations carry typed evidence',async t=>{
 const root=await project(t,{...base,'.play-preflight.json':{targetAudienceReviewed:true,contentRatingReviewed:true}});
 assert.equal(f(await scan(root,opts),'GP-CONTENT-001').evidence[0]?.kind,'attestation');
});
