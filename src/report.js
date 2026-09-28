import { mkdir, writeFile, lstat } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
export const clean = x => String(x ?? '').replace(/[\x00-\x1f\x7f-\x9f]/g,' ');
const html = x => clean(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const md = x => html(x).replace(/\|/g,'&#124;').replace(/`/g,'&#96;').replace(/\\/g,'&#92;');
const uri = x => x.split('/').map(encodeURIComponent).join('/');
const counts = r => Object.entries(r.summary).map(([k,v])=>`${v} ${k}`).join(' / ');
function locations(f){return f.evidence.map(e=>`${e.file}:${e.line} (${e.kind})`).join('; ')||'Manual / policy context';}
export function sarif(report,{prefix=''}={}) {
  const emitted=report.findings.filter(f=>!['PASS','SKIP'].includes(f.status));
  const rules=emitted.map(f=>({id:f.ruleId,name:f.ruleId.replaceAll('-',''),shortDescription:{text:f.title},fullDescription:{text:f.message},helpUri:f.source,help:{text:f.fix},properties:{status:f.status}}));
  const results=emitted.map((f,i)=>{
    const loc=f.evidence[0],relative=loc?path.posix.join(prefix,loc.file.replaceAll('\\','/')):null;
    return {ruleId:f.ruleId,ruleIndex:i,level:f.status==='BLOCKER'?'error':f.status==='WARNING'?'warning':'note',message:{text:`${f.status}: ${f.message} Fix: ${f.fix}`},
      ...(relative?{locations:[{physicalLocation:{artifactLocation:{uri:uri(relative),uriBaseId:'%SRCROOT%'},region:{startLine:Math.max(1,loc.line)}}}]}:{}),
      partialFingerprints:{'play-preflight/v1':createHash('sha256').update(`${f.ruleId}:${relative||''}:${loc?.value||''}`).digest('hex')},properties:{status:f.status,evidenceKinds:[...new Set(f.evidence.map(e=>e.kind))]}};
  });
  return {$schema:'https://json.schemastore.org/sarif-2.1.0.json',version:'2.1.0',runs:[{tool:{driver:{name:report.tool.name,version:report.tool.version,informationUri:'https://github.com/masddffee/google-play-preflight-skills',rules}},results,properties:{policyVersion:report.policy.version,asOf:report.asOf,summary:report.summary}}]};
}
export function render(report,format='terminal',options={}) {
  if(format==='json')return JSON.stringify(report,null,2)+'\n';
  if(format==='sarif')return JSON.stringify(sarif(report,options),null,2)+'\n';
  if(format==='terminal') {
    const actionable=report.findings.filter(f=>['BLOCKER','WARNING'].includes(f.status));
    return [`play-preflight ${report.tool.version} | ${report.project.stack} | ${report.asOf}`,counts(report),'',...actionable.map(f=>`[${f.status}] ${f.ruleId} ${f.title}\n  ${clean(f.message)}\n  ${clean(locations(f))}\n  Fix: ${clean(f.fix)}\n  ${f.source}`),'',`${report.summary.UNKNOWN} checks require additional evidence. Use --format markdown or --output-dir .play-preflight for the complete report.`,'PASS means the stated check only. It is not a guarantee of Google Play approval.',''].join('\n');
  }
  if(format==='markdown')return `# Google Play preflight\n\n**${md(counts(report))}**\n\nStack: ${md(report.project.stack)} · As of: ${md(report.asOf)} · Policy: ${md(report.policy.version)}\n\nPASS applies only to the stated check. Attestations are not independently verified.\n\n| Status | Check | Evidence | Finding and next step |\n|---|---|---|---|\n`+report.findings.map(f=>`| ${f.status} | **${f.ruleId}** ${md(f.title)} | ${md(locations(f))} | ${md(f.message)} **Next:** ${md(f.fix)} [Official reference](${f.source}) |`).join('\n')+'\n\n## Limitations\n\n'+report.limitations.map(x=>`- ${md(x)}`).join('\n')+'\n';
  if(format==='html')return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>Google Play preflight report</title><style>
:root{color-scheme:dark;font-family:system-ui,-apple-system,sans-serif;background:#0a1220;color:#e5edf7}*{box-sizing:border-box}body{margin:0}main{max-width:1120px;margin:auto;padding:56px 24px}header{border-bottom:1px solid #2a3a4e;padding-bottom:28px}.eyebrow{color:#6ee7b7;font-size:13px;letter-spacing:.16em;text-transform:uppercase}h1{font-size:clamp(28px,5vw,48px);letter-spacing:-.04em;margin:14px 0}p{line-height:1.7;color:#bdcbdb}.stats{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin:28px 0}.stat,details{border:1px solid #2a3a4e;border-radius:12px;background:#101e30}.stat{padding:18px}.stat strong{font-size:32px;display:block}.stat span{font-size:11px;letter-spacing:.06em;color:#aabed5}details{margin:12px 0;overflow:hidden}summary{padding:19px;cursor:pointer;font-weight:650}summary code{font-size:12px;color:#9ab0ca;margin:0 12px}.content{padding:0 22px 22px}.badge{display:inline-block;font-size:10px;border-radius:5px;padding:5px 7px;min-width:69px;text-align:center;border:1px solid currentColor}.BLOCKER{color:#fca5a5}.WARNING{color:#fcd34d}.PASS{color:#6ee7b7}.UNKNOWN{color:#93c5fd}.SKIP{color:#a1aab8}a{color:#93c5fd}code{overflow-wrap:anywhere}.evidence{font-size:12px;border-left:2px solid #405b77;padding-left:12px;color:#aabed5}footer{padding-top:24px;font-size:13px;color:#91a6bd}@media(max-width:650px){main{padding:28px 16px}.stats{grid-template-columns:repeat(2,1fr)}summary code{display:block;margin:10px 0}summary{font-size:14px}}
</style></head><body><main><header><div class="eyebrow">play-preflight / release readiness</div><h1>Evidence before submission.</h1><p>${html(report.project.stack)} · ${html(report.project.device)} / ${html(report.project.submission)} · ${html(report.asOf)}<br>Policy snapshot ${html(report.policy.version)}. Review due ${html(report.policy.reviewAfter)}.</p></header><div class="stats">${Object.entries(report.summary).map(([k,v])=>`<div class="stat"><strong class="${k}">${v}</strong><span>${k}</span></div>`).join('')}</div><p>A PASS applies only to the stated check, not store approval. Developer attestations are labeled separately from static and artifact evidence.</p>${report.findings.map(f=>`<details ${['BLOCKER','WARNING'].includes(f.status)?'open':''}><summary><span class="badge ${f.status}">${f.status}</span><code>${f.ruleId}</code>${html(f.title)}</summary><div class="content"><p>${html(f.message)}</p><div class="evidence">${html(locations(f))}</div><p><strong>Next step</strong><br>${html(f.fix)}</p><a href="${html(f.source)}" rel="noreferrer">Read reference ↗</a></div></details>`).join('')}<footer>${report.limitations.map(x=>`<p>${html(x)}</p>`).join('')}</footer></main></body></html>\n`;
  throw new Error(`Unknown report format: ${format}`);
}
export async function safeOutputDirectory(directory) {
  const full=path.resolve(directory),parsed=path.parse(full);let current=parsed.root;
  for(const segment of full.slice(parsed.root.length).split(path.sep).filter(Boolean)) {
    current=path.join(current,segment);
    try {const s=await lstat(current);if(s.isSymbolicLink())throw new Error('Symlink output directory is not allowed');if(!s.isDirectory())throw new Error('Output path contains a non-directory');}
    catch(error){if(error.code!=='ENOENT')throw error;await mkdir(current);}
  }
  return full;
}
export async function writeReports(report,directory,options={}) {
  const dir=await safeOutputDirectory(directory),files={};
  for(const [format,ext] of Object.entries({json:'json',markdown:'md',html:'html',sarif:'sarif'})) {
    const dest=path.join(dir,`report.${ext}`);
    try {const s=await lstat(dest);if(s.isSymbolicLink()||!s.isFile())throw new Error('Symlink or non-file report destination is not allowed');}
    catch(error){if(error.code!=='ENOENT')throw error;}
    await writeFile(dest,render(report,format,options),'utf8');files[format]=dest;
  }
  return files;
}
