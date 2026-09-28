import { scan } from '../src/scan.js';
import { writeReports, render } from '../src/report.js';
import { writeFile } from 'node:fs/promises';
const before=await scan('fixtures/expo-risk',{asOf:'2026-09-28'});
const after=await scan('fixtures/expo-fixed',{asOf:'2026-09-28'});
await writeReports(before,'examples/generated');
await writeFile('examples/sample-report.md','# Synthetic example — not a real app audit\n\nRegenerate with `npm run demo`.\n\n'+render(before,'markdown'));
await writeFile('docs/demo.txt',render(before,'terminal'));
const esc=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const rows=[
 '$ play-preflight scan ./app',
 'Synthetic Expo fixture · 2026-09-28',
 '',
 `${before.summary.BLOCKER} BLOCKERS  /  ${before.summary.WARNING} WARNINGS  /  ${before.summary.UNKNOWN} UNKNOWN`,
 '',
 'GP-TARGET-001    target API 34 → required 36',
 `${before.findings.find(f=>f.ruleId==='GP-TARGET-001').evidence[0].file}:${before.findings.find(f=>f.ruleId==='GP-TARGET-001').evidence[0].line}     static configuration evidence`,
 '',
 'GP-ACCOUNT-001   account creation without deletion',
 '                developer-declared missing flow',
 '',
 `After selected fixes: ${after.summary.BLOCKER} BLOCKERS · ${after.summary.UNKNOWN} UNKNOWN remain`,
 'No code execution. No API keys. No approval guarantee.'
];
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="450" viewBox="0 0 1000 450" role="img" aria-label="Synthetic play-preflight terminal demo"><rect width="1000" height="450" rx="20" fill="#0a1220"/><circle cx="30" cy="28" r="6" fill="#fca5a5"/><circle cx="52" cy="28" r="6" fill="#fcd34d"/><circle cx="74" cy="28" r="6" fill="#6ee7b7"/><g font-family="ui-monospace,monospace" font-size="17">${rows.map((s,i)=>`<text x="30" y="${75+i*27}" fill="${i===0?'#6ee7b7':i===3?'#fca5a5':'#d2deed'}">${esc(s)}</text>`).join('')}</g></svg>`;
await writeFile('docs/demo.svg',svg+'\n');
console.log('Regenerated synthetic reports and demo.');
