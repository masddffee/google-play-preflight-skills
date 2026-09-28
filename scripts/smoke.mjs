import { mkdtemp,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';
const temp=await mkdtemp(path.join(tmpdir(),'preflight-package-'));
const npm=process.env.npm_execpath;
if(!npm)throw new Error('Run with npm run smoke');
function npmRun(args){const r=spawnSync(process.execPath,[npm,...args],{encoding:'utf8'});assert.equal(r.status,0,r.stderr||r.stdout);return r.stdout;}
try {
  const packed=JSON.parse(npmRun(['pack','--ignore-scripts','--json','--pack-destination',temp]));
  const consumer=path.join(temp,'consumer');
  npmRun(['install','--offline','--ignore-scripts','--no-audit','--no-fund','--prefix',consumer,path.join(temp,packed[0].filename)]);
  const bin=path.join(consumer,'node_modules/@masddffee/play-preflight/bin/play-preflight.js');
  const v=spawnSync(process.execPath,[bin,'--version'],{encoding:'utf8'});assert.equal(v.status,0);assert.equal(v.stdout.trim(),'1.0.0');
  const r=spawnSync(process.execPath,[bin,'scan','fixtures/expo-risk','--as-of','2026-09-28','--format','json'],{encoding:'utf8'});
  assert.equal(r.status,1,r.stderr);assert.equal(JSON.parse(r.stdout).summary.BLOCKER,2);
  console.log('Packed tarball installed offline and its CLI detected the fixture blockers.');
} finally {await rm(temp,{recursive:true,force:true});}
