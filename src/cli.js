import { parseArgs } from 'node:util';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { scan, exitCode } from './scan.js';
import { loadPolicy, checkSources, validDate, today, VERSION } from './policy.js';
import { render, writeReports, clean } from './report.js';
const HELP=`play-preflight ${VERSION} — local-first Google Play preflight\n\nUsage:\n  play-preflight [scan] <project> [options]\n  play-preflight init <project>\n  play-preflight policy check [--online] [--format json]\n\nOptions:\n  --format terminal|json|markdown|html|sarif  (default: terminal)\n  --output-dir <directory>   Write all four report formats\n  --fail-on blocker|warning|unknown|none    (default: blocker)\n  --as-of YYYY-MM-DD         Evaluate a specific date (default: today UTC)\n  --device mobile|wear|automotive|tv|xr\n  --submission new|update|existing\n  --manifest <relative-file> Caller-supplied merged release manifest\n  --config <relative-file>   Default: .play-preflight.json\n  --profile <name>           EAS profile (default: production)\n  --help                    Show help\n  --version                 Show version\n\nNo project code or network requests are executed during scans.\nUNKNOWN means more evidence is needed. PASS is not store approval.\nExit: 0 threshold not reached; 1 threshold reached; 2 operational/config error.\n`;
export async function main(argv=process.argv.slice(2)) {
  try {
    const {values:v,positionals:pos}=parseArgs({args:argv,allowPositionals:true,strict:true,options:{format:{type:'string'},'output-dir':{type:'string'},'fail-on':{type:'string'},'as-of':{type:'string'},device:{type:'string'},submission:{type:'string'},manifest:{type:'string'},config:{type:'string'},profile:{type:'string'},online:{type:'boolean'},help:{type:'boolean',short:'h'},version:{type:'boolean'}}});
    if(v.help){process.stdout.write(HELP);return 0;}if(v.version){process.stdout.write(VERSION+'\n');return 0;}
    const format=v.format||'terminal',asOf=v['as-of']||today();
    if(!validDate(asOf))throw new Error('as-of must be a valid YYYY-MM-DD date');
    if(!['terminal','json','markdown','html','sarif'].includes(format))throw new Error('Invalid format');
    if(pos[0]==='policy') {
      if(pos.length!==2||pos[1]!=='check')throw new Error('Use policy check. Policy updates require a reviewed release; live pages are never automatically trusted.');
      if(!['terminal','json'].includes(format))throw new Error('Policy check supports terminal or json');
      const p=await loadPolicy(),sources=v.online?await checkSources(p):undefined;
      const result={version:p.version,reviewedOn:p.reviewedOn,reviewAfter:p.reviewAfter,asOf,status:asOf>p.reviewAfter?'REVIEW_REQUIRED':'WITHIN_REVIEW_WINDOW',...(sources?{sources}:{}),note:'Source reachability or matching phrases do not certify policy freshness. Human review is required before updating rules.'};
      process.stdout.write(format==='json'?JSON.stringify(result,null,2)+'\n':`${result.status}: policy ${p.version}; review due ${p.reviewAfter}\n${sources?sources.map(s=>`${s.status} ${s.id}`).join('\n')+'\n':''}${result.note}\n`);
      return result.status==='REVIEW_REQUIRED'||sources?.some(s=>s.status!=='REACHABLE')?1:0;
    }
    if(v.online)throw new Error('--online is only supported for policy check');
    if(pos[0]==='init') {
      if(pos.length>2)throw new Error('init expects at most one project path');
      const dest=path.join(path.resolve(pos[1]||'.'),'.play-preflight.json');
      await writeFile(dest,JSON.stringify({device:'mobile',submission:'new'},null,2)+'\n',{flag:'wx'});
      process.stdout.write('Created .play-preflight.json. Add only declarations you have actually verified.\n');return 0;
    }
    if(pos[0]==='scan')pos.shift();if(pos.length>1)throw new Error('scan expects exactly one project path');
    const failOn=v['fail-on']||'blocker';exitCode({summary:{}},failOn);
    const report=await scan(pos[0]||'.',{asOf,device:v.device,submission:v.submission,manifest:v.manifest,config:v.config,profile:v.profile});
    if(v['output-dir'])await writeReports(report,v['output-dir']);
    process.stdout.write(render(report,format));return exitCode(report,failOn);
  } catch(error) {process.stderr.write(`play-preflight: ${clean(error.message)}\n`);return 2;}
}
