import path from 'node:path';
import { appendFile, realpath } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { scan, exitCode } from '../src/scan.js';
import { render, writeReports, clean } from '../src/report.js';
const input=name=>process.env[`INPUT_${name.toUpperCase()}`]||undefined;
const escapeMessage=x=>String(x).replaceAll('%','%25').replaceAll('\r','%0D').replaceAll('\n','%0A');
const escapeProperty=x=>escapeMessage(x).replaceAll(':','%3A').replaceAll(',','%2C');
function inside(workspace,value){const full=path.resolve(workspace,value),rel=path.relative(workspace,full);if(rel==='..'||rel.startsWith(`..${path.sep}`))throw new Error('Action paths must remain inside the workspace');return full;}
async function output(name,value){if(!process.env.GITHUB_OUTPUT)return;const delimiter=randomUUID();await appendFile(process.env.GITHUB_OUTPUT,`${name}<<${delimiter}\n${value}\n${delimiter}\n`);}
try {
  const workspace=await realpath(process.env.GITHUB_WORKSPACE||process.cwd());
  const root=await realpath(inside(workspace,input('path')||'.'));inside(workspace,root);
  const outdir=inside(workspace,input('output-dir')||'.play-preflight'),failOn=input('fail-on')||'blocker';
  exitCode({summary:{}},failOn);
  const report=await scan(root,{asOf:input('as-of'),device:input('device'),submission:input('submission'),manifest:input('manifest'),config:input('config'),profile:input('profile')});
  const prefix=path.relative(workspace,root).split(path.sep).join('/');
  const files=await writeReports(report,outdir,{prefix});
  if(process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,render(report,'markdown'));
  for(const [status,count] of Object.entries(report.summary))await output(({BLOCKER:'blockers',WARNING:'warnings',PASS:'passed',UNKNOWN:'unknown',SKIP:'skipped'})[status],count);
  for(const [format,file] of Object.entries(files))await output(`report-${format}`,path.relative(workspace,file).split(path.sep).join('/'));
  await output('policy-version',report.policy.version);
  let emitted=0;
  if(input('annotations')!=='false')for(const f of report.findings.filter(f=>['BLOCKER','WARNING'].includes(f.status))) {
    if(emitted++>=40)break;const e=f.evidence.find(e=>e.kind!=='attestation');
    const properties=`title=${escapeProperty(`${f.ruleId} ${f.title}`)}`+(e?`,file=${escapeProperty(path.posix.join(prefix,e.file))},line=${e.line}`:'');
    process.stdout.write(`::${f.status==='BLOCKER'?'error':'warning'} ${properties}::${escapeMessage(f.message+' '+f.fix)}\n`);
  }
  process.stdout.write(render(report,'terminal'));process.exitCode=exitCode(report,failOn);
} catch(error){process.stderr.write(`play-preflight action: ${clean(error.message)}\n`);process.exitCode=2;}
