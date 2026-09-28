import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { scan } from '../src/scan.js';
import { targetRequirement, loadPolicy } from '../src/policy.js';

const policy = await loadPolicy();
const opts = { asOf: '2026-09-28' };
async function project(t, files) {
  const root = await mkdtemp(path.join(tmpdir(), 'preflight-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [name, value] of Object.entries(files)) {
    const dest = path.join(root, name); await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, typeof value === 'string' ? value : JSON.stringify(value, null, 2));
  }
  return root;
}
const native = (sdk = 36) => ({
  'app/build.gradle': `android {\n defaultConfig {\n targetSdk = ${sdk}\n }\n}`,
  'app/src/main/AndroidManifest.xml': '<manifest xmlns:android="http://schemas.android.com/apk/res/android"><application /></manifest>'
});
const find = (r, id) => r.findings.find(f => f.ruleId === id);

for (const [device, expected] of Object.entries({ mobile:36, wear:35, automotive:35, tv:34, xr:34 })) {
  test(`2026 submission requirement for ${device}`, () => assert.equal(targetRequirement(policy, { asOf:'2026-09-28', device, submission:'new' }), expected));
}
test('2025 and 2026 deadline boundary', () => {
  assert.equal(targetRequirement(policy,{ asOf:'2026-08-30',device:'mobile',submission:'update' }),35);
  assert.equal(targetRequirement(policy,{ asOf:'2026-08-31',device:'mobile',submission:'update' }),36);
  assert.equal(targetRequirement(policy,{ asOf:'2026-09-28',device:'mobile',submission:'existing' }),35);
});
test('unsupported historical policy has no invented requirement', () => assert.equal(targetRequirement(policy,{ asOf:'2023-01-01',device:'mobile',submission:'new' }),null));
test('native low target produces blocker with a real line number', async t => {
  const r = await scan(await project(t,native(34)), opts); const f = find(r,'GP-TARGET-001');
  assert.equal(f.status,'BLOCKER'); assert.equal(f.evidence[0].file,'app/build.gradle'); assert.equal(f.evidence[0].line,3);
});
test('native current target passes only the target check, not whole app approval', async t => {
  const r = await scan(await project(t,native()),opts);
  assert.equal(find(r,'GP-TARGET-001').status,'PASS'); assert.ok(r.summary.UNKNOWN > 0);
  assert.equal(find(r,'GP-MANIFEST-001').status,'UNKNOWN');
});
test('dynamic Gradle target is unknown', async t => {
  const r=await scan(await project(t,native('flutter.targetSdkVersion')),opts);
  assert.equal(find(r,'GP-TARGET-001').status,'UNKNOWN');
});
test('commented target is not used', async t => {
  const files=native(); files['app/build.gradle']='android { defaultConfig {\n// targetSdk = 36\ntargetSdk = 34\n} }';
  assert.equal(find(await scan(await project(t,files),opts),'GP-TARGET-001').status,'BLOCKER');
});
test('arithmetic target is not partially matched', async t => {
  assert.equal(find(await scan(await project(t,native('30 + 6')),opts),'GP-TARGET-001').status,'UNKNOWN');
});
test('Expo build-properties target is read', async t => {
  const root=await project(t,{'package.json':{dependencies:{expo:'^54.0.0','react-native':'0.81.0'}},'app.json':{expo:{plugins:[['expo-build-properties',{android:{targetSdkVersion:36}}]]}}});
  const r=await scan(root,opts); assert.equal(r.project.stack,'expo'); assert.equal(find(r,'GP-TARGET-001').status,'PASS');
});
test('dynamic Expo config never executes and invalid direct SDK does not pass', async t => {
  const root=await project(t,{'package.json':{dependencies:{expo:'*'}},'app.json':{expo:{android:{targetSdkVersion:36}}},'app.config.js':'throw new Error("MUST NOT EXECUTE");'});
  assert.equal(find(await scan(root,opts),'GP-TARGET-001').status,'UNKNOWN');
});
test('Flutter project detected without guessing framework target', async t => {
  const r=await scan(await project(t,{...native('flutter.targetSdkVersion'),'pubspec.yaml':'name: sample\ndependencies:\n  flutter:\n    sdk: flutter\n'}),opts);
  assert.equal(r.project.stack,'flutter'); assert.equal(find(r,'GP-TARGET-001').status,'UNKNOWN');
});
test('invalid config is an error rather than silently ignored', async t => {
  const root=await project(t,{...native(),'.play-preflight.json':{device:'toaster'}});
  await assert.rejects(scan(root,opts),/device/);
});
test('unknown config keys are rejected', async t => {
  const root=await project(t,{...native(),'.play-preflight.json':{targetSdk:36}});
  await assert.rejects(scan(root,opts),/Unknown config/);
});
test('stale policy cannot grant target PASS', async t => {
  const r=await scan(await project(t,native()),{asOf:'2027-04-01'});
  assert.equal(find(r,'GP-TARGET-001').status,'UNKNOWN'); assert.equal(find(r,'GP-POLICY-001').status,'WARNING');
});
test('extension is a manual verification, not a bypass', async t => {
  const root=await project(t,{...native(35),'.play-preflight.json':{targetApiExtensionUntil:'2026-11-01'}});
  assert.equal(find(await scan(root,opts),'GP-TARGET-001').status,'UNKNOWN');
});
test('Stripe with digital goods requires context, not automatic blocker', async t => {
  const r=await scan(await project(t,{...native(),'package.json':{dependencies:{'@stripe/stripe-react-native':'*'}},'.play-preflight.json':{digitalGoods:true,markets:['US'],alternativeBillingEnrolled:true}}),opts);
  assert.equal(find(r,'GP-BILLING-001').status,'UNKNOWN');
});
test('RevenueCat recognized as billing wrapper', async t => {
  const r=await scan(await project(t,{...native(),'package.json':{dependencies:{'react-native-purchases':'*'}}}),opts);
  assert.ok(r.project.billingSdks.includes('react-native-purchases'));
});
test('restricted permission needs eligibility review', async t => {
  const files=native();files['app/src/main/AndroidManifest.xml']='<manifest><uses-permission android:name="android.permission.READ_SMS"/><application /></manifest>';
  assert.equal(find(await scan(await project(t,files),opts),'GP-PERMISSIONS-001').status,'UNKNOWN');
});
test('source debug manifest is not treated as release manifest', async t => {
  const r=await scan(await project(t,{...native(),'app/src/debug/AndroidManifest.xml':'<manifest><application android:debuggable="true"/></manifest>'}),opts);
  assert.notEqual(find(r,'GP-DEBUG-001').status,'BLOCKER');
});
test('explicit merged manifest supplies final target and debuggable evidence', async t => {
  const root=await project(t,{...native('project.sdk'), 'release.xml':'<manifest><uses-sdk android:targetSdkVersion="36"/><application android:debuggable="true"/></manifest>', '.play-preflight.json':{manifest:'release.xml'}});
  const r=await scan(root,opts);assert.equal(find(r,'GP-TARGET-001').status,'PASS');assert.equal(find(r,'GP-DEBUG-001').status,'BLOCKER');
});
test('sensitive files and node_modules are not scanned', async t => {
  const root=await project(t,{...native(),'.env':'SUPER_SECRET_TOKEN=DO_NOT_LEAK','google-services.json':'DO_NOT_LEAK','node_modules/evil/app.json':'DO_NOT_LEAK'});
  assert.ok(!JSON.stringify(await scan(root,opts)).includes('DO_NOT_LEAK'));
});
test('symlinks to external files are not followed', async t => {
  if(process.platform==='win32') return t.skip('symlink privilege depends on Windows runner');
  const root=await project(t,native());const outside=await project(t,{'outside.json':'{"secret":"DO_NOT_LEAK"}'});
  await symlink(path.join(outside,'outside.json'),path.join(root,'app.json'));
  assert.ok(!JSON.stringify(await scan(root,opts)).includes('DO_NOT_LEAK'));
});
test('missing project is an operational error', async () => await assert.rejects(scan('/definitely/not/a/project',opts)));
test('ordinary non-mobile directory is an error, not clean success',async t => {
  await assert.rejects(scan(await project(t,{'package.json':{name:'website'}}),opts),/mobile project/);
});
