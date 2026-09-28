import { readFile } from 'node:fs/promises';

export const VERSION = '1.0.0';
export const today = () => new Date().toISOString().slice(0, 10);
export function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export async function loadPolicy() {
  return JSON.parse(await readFile(new URL('../rules/policy.json', import.meta.url), 'utf8'));
}
export function targetRequirement(policy, { asOf, device = 'mobile', submission = 'new' }) {
  const row = policy.targetApi.filter(x => x.from <= asOf && x.submission.includes(submission))
    .sort((a,b) => b.from.localeCompare(a.from))[0];
  return row?.minimum[device] ?? null;
}
export function billingRequirement(policy, asOf) {
  return policy.billing.filter(x => x.from <= asOf).sort((a,b) => b.from.localeCompare(a.from))[0]?.minimumMajor ?? null;
}
export function policyFresh(policy, asOf) {
  return asOf >= policy.reviewedOn && asOf <= policy.reviewAfter;
}
// Explicit opt-in only. Never fetch a URL read from the scanned project.
export async function checkSources(policy, fetchImpl = globalThis.fetch) {
  const results = [];
  for (const [id, source] of Object.entries(policy.sources)) {
    const url = new URL(source.url);
    if (!['support.google.com','developer.android.com'].includes(url.hostname) || url.protocol !== 'https:') {
      throw new Error('Policy source is not on the official allowlist');
    }
    try {
      const res = await fetchImpl(url, { redirect:'error', signal:AbortSignal.timeout(12000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const reader = res.body?.getReader();
      let body = '';
      if (reader) {
        const decoder = new TextDecoder(); let bytes=0;
        try {
          while (true) {
            const {done,value}=await reader.read(); if(done) break;
            bytes += value.length;
            if(bytes>4_000_000) throw new Error('Source exceeds 4 MB limit');
            body+=decoder.decode(value,{stream:true});
          }
          body+=decoder.decode();
        } finally { await reader.cancel().catch(()=>{}); }
      } else { body=await res.text(); if(body.length>4_000_000) throw new Error('Source exceeds limit'); }
      const text = body.replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;|\u00a0/g,' ').replace(/\s+/g,' ').toLowerCase();
      const missing = source.checks.filter(x=>!text.includes(x.toLowerCase()));
      results.push({id,url:source.url,status:missing.length?'REVIEW_REQUIRED':'REACHABLE',missing});
    } catch(error) { results.push({id,url:source.url,status:'UNAVAILABLE',error:String(error.message).slice(0,160)}); }
  }
  return results;
}
