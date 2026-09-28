import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, writeFile, readFile, mkdir, rm, symlink, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, sarif, writeReports } from '../src/report.js';
import { exitCode } from '../src/scan.js';
import { checkSources, loadPolicy } from '../src/policy.js';
const repo=fileURLToPath(new URL('..',import.meta.url));
const cli=path.join(repo,'bin/play-preflight.js');
const report={schemaVersion:1,tool:{name:'play-preflight',version:'1.0.0'},asOf:'2026-09-28',policy:{version:'test',reviewedOn:'2026-09-28',reviewAfter:'2026-12-27'},project:{stack:'android',device:'mobile',submission:'new',filesRead:2},summary:{BLOCKER:1,WARNING:0,PASS:0,UNKNOWN:1,SKIP:0},limitations:['Not approval.'],findings:[{ruleId:'GP-TARGET-001',title:'Target API',status:'BLOCKER',message:'<script>alert(1)</script> | `\n::error::',fix:'Fix it',source:'https://developer.android.com/',evidence:[{file:'src/a b.kt',line:2,value:'34',kind:'static'}]},{ruleId:'GP-DATA-001',title:'Data safety',status:'UNKNOWN',message:'Verify',fix:'Review',source:'https://developer.android.com/',evidence:[]}]};
async function temp(t){const d=await realpath(await mkdtemp(path.join(tmpdir(),'preflight-ui-')));t.after(()=>rm(d,{recursive:true,force:true}));return d;}
async function app(t,sdk=34){const d=await temp(t);await mkdir(path.join(d,'app'));await writeFile(path.join(d,'app/build.gradle'),`android {defaultConfig {targetSdk = ${sdk}\n}}`);return d;}
function run(args,cwd=repo,env={}){return spawnSync(process.execPath,[cli,...args],{cwd,encoding:'utf8',env:{...process.env,...env}});}
test('HTML encodes untrusted text and prohibits scripts',()=>{const h=render(report,'html');assert.ok(!h.includes('<script>'));assert.ok(h.includes('&lt;script&gt;'));assert.ok(h.includes('Content-Security-Policy'));});
test('Markdown cannot inject extra table rows or HTML',()=>{const m=render(report,'markdown');assert.ok(!m.includes('<script>'));assert.ok(!m.includes('| `\n'));});
test('terminal strips ANSI and newline workflow injection',()=>{const r=structuredClone(report);r.findings[0].message='\x1b[2J\n::error::bad';const x=render(r,'terminal');assert.ok(!x.includes('\x1b'));assert.ok(!x.includes('\n::error::bad'));});
test('JSON renders machine-readable report',()=>assert.deepEqual(JSON.parse(render(report,'json')),report));
test('SARIF includes failures and unknowns with encoded workspace-relative locations',()=>{const s=sarif(report,{prefix:'apps/mobile'});assert.equal(s.version,'2.1.0');assert.equal(s.runs[0].results[0].locations[0].physicalLocation.artifactLocation.uri,'apps/mobile/src/a%20b.kt');assert.equal(s.runs[0].results[1].level,'note');});
test('SARIF fingerprints are stable across repeated renders',()=>assert.deepEqual(sarif(report),sarif(report)));
test('failure thresholds respect unknown and none',()=>{assert.equal(exitCode(report),1);assert.equal(exitCode(report,'none'),0);const r={summary:{BLOCKER:0,WARNING:0,UNKNOWN:1}};assert.equal(exitCode(r,'blocker'),0);assert.equal(exitCode(r,'unknown'),1);assert.throws(()=>exitCode(report,'all'));});
test('all four report files are written',async t=>{const d=await temp(t);await writeReports(report,d);for(const f of ['report.json','report.md','report.html','report.sarif'])assert.ok((await readFile(path.join(d,f),'utf8')).length>20);});
test('report writer refuses symlink destinations',async t=>{if(process.platform==='win32')return t.skip();const d=await temp(t),outside=await temp(t);await symlink(outside,path.join(d,'redirect'));await assert.rejects(writeReports(report,path.join(d,'redirect')),/Symlink/);});
test('CLI help and version need no project',()=>{assert.equal(run(['--help']).status,0);assert.match(run(['--version']).stdout,/1\.0\.0/);});
test('CLI JSON output and blocker exit',async t=>{const r=run(['scan',await app(t),'--as-of','2026-09-28','--format','json']);assert.equal(r.status,1);assert.ok(JSON.parse(r.stdout).summary.BLOCKER>0);assert.equal(r.stderr,'');});
test('CLI none threshold keeps report but succeeds',async t=>assert.equal(run(['scan',await app(t),'--as-of','2026-09-28','--fail-on','none']).status,0));
test('CLI unknown option and malformed date are errors',async t=>{assert.equal(run(['--not-real']).status,2);assert.equal(run(['scan',await app(t),'--as-of','2026-02-30']).status,2);});
test('CLI missing path does not default to clean',()=>assert.equal(run(['scan','/a/path/that/is/not/real']).status,2));
test('CLI init never replaces an existing configuration',async t=>{const d=await temp(t);assert.equal(run(['init',d]).status,0);const a=await readFile(path.join(d,'.play-preflight.json'),'utf8');assert.equal(run(['init',d]).status,2);assert.equal(await readFile(path.join(d,'.play-preflight.json'),'utf8'),a);});
test('CLI policy offline can report staleness',()=>{const r=run(['policy','check','--as-of','2027-04-01','--format','json']);assert.equal(r.status,1);assert.equal(JSON.parse(r.stdout).status,'REVIEW_REQUIRED');});
test('source watcher catches missing phrases without mutating policy',async()=>{const p=await loadPolicy();const before=JSON.stringify(p);const res=await checkSources(p,async()=>({ok:true,text:async()=>'<h1>unrelated</h1>'}));assert.equal(res[0].status,'REVIEW_REQUIRED');assert.equal(JSON.stringify(p),before);});
test('source watcher never follows project-provided or non-official URLs',async()=>{await assert.rejects(checkSources({sources:{bad:{url:'http://127.0.0.1/secret',checks:[]}}}),/allowlist/);});
test('source watcher network failure is unavailable, not fresh',async()=>{const p=await loadPolicy();const r=await checkSources(p,async()=>{throw new Error('offline');});assert.ok(r.every(x=>x.status==='UNAVAILABLE'));});
test('Action writes outputs, summary and monorepo-relative SARIF before failing',async t=>{
 const workspace=await temp(t);const root=path.join(workspace,'apps/mobile');await mkdir(path.join(root,'app'),{recursive:true});await writeFile(path.join(root,'app/build.gradle'),'android {defaultConfig {targetSdk = 34\n}}');
 const output=path.join(workspace,'output'),summary=path.join(workspace,'summary');await writeFile(output,'');await writeFile(summary,'');
 const r=spawnSync(process.execPath,[path.join(repo,'action/index.js')],{encoding:'utf8',env:{...process.env,GITHUB_WORKSPACE:workspace,GITHUB_OUTPUT:output,GITHUB_STEP_SUMMARY:summary,INPUT_PATH:'apps/mobile','INPUT_AS-OF':'2026-09-28','INPUT_OUTPUT-DIR':'.play-preflight','INPUT_FAIL-ON':'blocker'}});
 assert.equal(r.status,1,r.stderr);assert.match(await readFile(output,'utf8'),/blockers/);assert.match(await readFile(summary,'utf8'),/Target API/);
 const s=JSON.parse(await readFile(path.join(workspace,'.play-preflight/report.sarif'),'utf8'));const target=s.runs[0].results.find(x=>x.ruleId==='GP-TARGET-001');assert.equal(target.locations[0].physicalLocation.artifactLocation.uri,'apps/mobile/app/build.gradle');
});
test('Action rejects workspace traversal',async t=>{
 const r=spawnSync(process.execPath,[path.join(repo,'action/index.js')],{encoding:'utf8',env:{...process.env,GITHUB_WORKSPACE:await temp(t),INPUT_PATH:'../outside'}});assert.equal(r.status,2);assert.match(r.stderr,/workspace/);
});
