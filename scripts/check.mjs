import { readdir,readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
const pkg=JSON.parse(await readFile('package.json','utf8'));
const policy=JSON.parse(await readFile('rules/policy.json','utf8'));
assert.equal(pkg.version,'1.0.0');assert.equal(policy.version,'2026.09.28');
const action=await readFile('action.yml','utf8');assert.match(action,/using: node24/);assert.ok(!/^author:/m.test(action));
for(const dir of ['src','bin','action','scripts','tests'])for(const f of await readdir(dir)) {
  if(!/\.[cm]?js$/.test(f))continue;
  const result=spawnSync(process.execPath,['--check',`${dir}/${f}`],{encoding:'utf8'});
  if(result.status!==0)throw new Error(`${dir}/${f}: ${result.stderr}`);
}
for(const name of ['README.md','README.zh-TW.md','skills/google-play-review-preflight/SKILL.md']) {
  const text=await readFile(name,'utf8');assert.ok(!text.includes('YOUR_USERNAME'),`${name} contains placeholder owner`);
}
console.log('Syntax, policy metadata, package and onboarding checks passed.');
