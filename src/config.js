import path from 'node:path';
import { lstat, readFile, realpath } from 'node:fs/promises';
import { validDate } from './policy.js';
const BOOL = ['dataSafetyReviewed','accountCreation','accountDeletionInApp','loginRequired','reviewerAccessProvided','digitalGoods','alternativeBillingEnrolled','containsAds','adsDeclarationReviewed','targetAudienceReviewed','contentRatingReviewed','nativeChecksReviewed','runtimeChecksReviewed'];
const TEXT = ['$schema','manifest','profile','privacyPolicyUrl','accountDeletionUrl','targetApiExtensionUntil','billingExtensionUntil'];
const ENUM = { device:['mobile','wear','automotive','tv','xr'], submission:['new','update','existing'] };
export async function safeRead(root, relative) {
  if(typeof relative!=='string' || !relative || path.isAbsolute(relative) || relative.includes('\0')) throw new Error('Expected a relative project file path');
  const full=path.resolve(root,relative), rel=path.relative(root,full);
  if(rel==='..'||rel.startsWith(`..${path.sep}`)) throw new Error('File path must stay inside project');
  let current=root;
  for(const part of rel.split(path.sep)) {
    current=path.join(current,part);
    const s=await lstat(current);
    if(s.isSymbolicLink()) throw new Error('Symlink input is not allowed');
  }
  const s=await lstat(full);
  if(!s.isFile()||s.size>2_000_000) throw new Error('Input must be a regular file under 2 MB');
  const resolved=await realpath(full);
  if(resolved!==full) throw new Error('Resolved file differs from requested path');
  return readFile(full,'utf8');
}
export function validateConfig(value) {
  if(!value || typeof value!=='object' || Array.isArray(value)) throw new Error('Config must be a JSON object');
  const allowed=new Set([...BOOL,...TEXT,...Object.keys(ENUM),'markets','listing']);
  for(const [key,item] of Object.entries(value)) {
    if(!allowed.has(key)) throw new Error(`Unknown config key: ${key}`);
    if(BOOL.includes(key)&&typeof item!=='boolean') throw new Error(`${key} must be boolean`);
    if(TEXT.includes(key)&&(typeof item!=='string'||item.length>2000)) throw new Error(`${key} must be a string under 2001 characters`);
    if(ENUM[key]&&!ENUM[key].includes(item)) throw new Error(`Invalid ${key}: use ${ENUM[key].join(', ')}`);
  }
  for(const key of ['targetApiExtensionUntil','billingExtensionUntil']) {
    if(value[key]!==undefined&&!validDate(value[key])) throw new Error(`${key} must be YYYY-MM-DD`);
  }
  if(value.markets!==undefined && (!Array.isArray(value.markets)||value.markets.length>250||value.markets.some(x=>typeof x!=='string'||!/^[A-Z]{2}$/.test(x)))) throw new Error('markets must contain two-letter uppercase country codes');
  if(value.listing!==undefined) {
    const x=value.listing;
    if(!x||typeof x!=='object'||Array.isArray(x)) throw new Error('listing must be an object');
    for(const [k,v] of Object.entries(x)) if(!['title','shortDescription','fullDescription'].includes(k)||typeof v!=='string'||v.length>20000) throw new Error('Invalid listing field');
  }
  return value;
}
export async function loadConfig(root, options) {
  const filename=options.config||'.play-preflight.json'; let config={};
  try { config=JSON.parse(await safeRead(root,filename)); }
  catch(error) { if(options.config||error.code!=='ENOENT') throw new Error(`Cannot read config: ${error.message}`); }
  validateConfig(config);
  for(const key of ['device','submission','manifest','profile']) if(options[key]!==undefined) config[key]=options[key];
  validateConfig(config);
  return { value:{device:'mobile',submission:'new',profile:'production',...config}, file:filename };
}
export function isPublicUrl(value) {
  if(typeof value!=='string'||!value) return false;
  try {
    const u=new URL(value);
    return ['https:','http:'].includes(u.protocol) && !u.username && !u.password &&
      !['localhost','127.0.0.1','[::1]'].includes(u.hostname) && u.hostname.includes('.') &&
      !/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(u.hostname) && !u.hostname.endsWith('.local');
  } catch { return false; }
}
