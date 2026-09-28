import { readdir, stat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { safeRead } from './config.js';
import { parseManifest, androidAttr } from './manifest.js';
const OMIT=new Set(['node_modules','vendor','build','dist','coverage','ios','Pods','docs','examples','fixtures','tests','test','__tests__']);
const CONFIG=new Set(['package.json','app.json','eas.json','gradle.properties','pubspec.yaml','pubspec.yml','AndroidManifest.xml','libs.versions.toml']);
const SOURCE=/\.(?:[cm]?[jt]sx?|dart|kt|java|gradle|kts)$/;
export async function collect(rootInput) {
  const root=await realpath(path.resolve(rootInput));
  if(!(await stat(root)).isDirectory()) throw new Error('Project must be a directory');
  const files=new Map(), issues=[];let seen=0,bytes=0;
  async function walk(dir,depth) {
    if(depth>16) {issues.push({file:dir,reason:'Directory depth limit reached'});return;}
    const entries=(await readdir(path.join(root,dir),{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name));
    for(const ent of entries) {
      if(++seen>6000) {issues.push({file:dir,reason:'Entry limit reached'});return;}
      if(ent.name.startsWith('.') || OMIT.has(ent.name) || ['google-services.json','firebase_options.dart','local.properties'].includes(ent.name)) continue;
      const relative=path.posix.join(dir,ent.name);
      if(ent.isSymbolicLink()) {issues.push({file:relative,reason:'Symlink skipped'});continue;}
      if(ent.isDirectory()) { if(!/\/(?:src\/)?(?:debug|androidTest)(?:\/|$)/.test('/'+relative)) await walk(relative,depth+1);continue; }
      if(!ent.isFile()||(!CONFIG.has(ent.name)&&!SOURCE.test(ent.name))) continue;
      if(files.size>=1000||bytes>=20_000_000) {issues.push({file:relative,reason:'Scan size limit reached'});continue;}
      try { const text=await safeRead(root,relative); bytes+=Buffer.byteLength(text);files.set(relative,text); }
      catch { issues.push({file:relative,reason:'File unreadable or larger than 2 MB'}); }
    }
  }
  await walk('',0);
  return {root,files,issues};
}
// Remove comments while retaining strings and offsets; never evaluates source code.
export function stripComments(text, xml=false) {
  if(xml) return text.replace(/<!--[\s\S]*?-->/g,m=>m.replace(/[^\n]/g,' '));
  let out='',state='code',quote='';
  for(let i=0;i<text.length;i++) {
    const c=text[i],n=text[i+1];
    if(state==='line') { if(c==='\n'){state='code';out+=c;}else out+=' '; }
    else if(state==='block') { if(c==='*'&&n==='/'){out+='  ';i++;state='code';}else out+=c==='\n'?'\n':' '; }
    else if(state==='string') {out+=c;if(c==='\\'&&n!==undefined){out+=n;i++;}else if(c===quote)state='code';}
    else if(c==='/'&&n==='/'){out+='  ';i++;state='line';}
    else if(c==='/'&&n==='*'){out+='  ';i++;state='block';}
    else {out+=c;if(['"',"'",'`'].includes(c)){state='string';quote=c;}}
  }
  return out;
}
export function evidence(file,text,index,value,kind='static') {
  return {file,line:1+text.slice(0,Math.max(0,index)).split('\n').length-1,value,kind};
}
export function parseJson(files,name,issues) {
  if(!files.has(name)) return null;
  try {return JSON.parse(files.get(name));}
  catch {issues.push({file:name,reason:'Malformed JSON'});return null;}
}
export function block(text,name) {
  const re=new RegExp('\\b'+name+'\\s*\\{','g');const match=re.exec(text);if(!match)return null;
  let depth=1,quote='',i=re.lastIndex;
  const start=i;
  for(;i<text.length;i++) {
    const c=text[i];if(quote){if(c==='\\')i++;else if(c===quote)quote='';continue;}
    if(c==='"'||c==="'"){quote=c;continue;}
    if(c==='{')depth++;if(c==='}'&&--depth===0)return {text:text.slice(start,i),start};
  }
  return null;
}
export function extract(files,issues,config) {
  const pkg=parseJson(files,'package.json',issues)||{};
  const dependencies=Object.keys({...pkg.dependencies});
  const expo=parseJson(files,'app.json',issues)?.expo;
  const eas=parseJson(files,'eas.json',issues);
  const flutter=files.has('pubspec.yaml')||files.has('pubspec.yml');
  if(flutter) for(const [f,text] of files) if(/pubspec\.ya?ml$/.test(f)) {
    for(const m of text.matchAll(/^\s{2}([a-zA-Z_][\w-]*):/gm))dependencies.push(m[1]);
  }
  const gradlePaths=['android/app/build.gradle','android/app/build.gradle.kts','app/build.gradle','app/build.gradle.kts','build.gradle','build.gradle.kts'].filter(p=>files.has(p));
  const manifestPaths=['android/app/src/main/AndroidManifest.xml','app/src/main/AndroidManifest.xml','AndroidManifest.xml'].filter(p=>files.has(p));
  const stack=dependencies.includes('expo')||expo?'expo':flutter?'flutter':dependencies.includes('react-native')?'react-native':gradlePaths.length||manifestPaths.length?'android':null;
  if(!stack)throw new Error('No supported mobile project found; point to the Android/Expo/React Native/Flutter app root');
  const dynamicExpo=['app.config.js','app.config.ts','app.config.mjs','app.config.cjs'].some(p=>files.has(p));
  const target=[],billing=[],permissions=[],debug=[],signing=[];
  const manifests=config.manifest?[config.manifest]:manifestPaths;
  for(const file of manifests) {
    const original=files.get(file)||'';let nodes;
    try {nodes=parseManifest(original,Boolean(config.manifest));}
    catch(error){if(config.manifest)throw error;issues.push({file,reason:'Malformed source manifest XML'});continue;}
    const kind=config.manifest?'artifact':'static';
    for(const node of nodes) {
      const ev=value=>evidence(file,original,node.offset,value,kind);
      const sdk=androidAttr(node,'targetSdkVersion');
      if(node.name==='uses-sdk'&&/^\d+$/.test(sdk||''))target.push(ev(Number(sdk)));
      const name=androidAttr(node,'name');
      if(/^uses-permission(?:-sdk-\d+)?$/.test(node.name)&&name)permissions.push(ev(name));
      const debuggable=androidAttr(node,'debuggable');
      if(node.name==='application'&&debuggable!==undefined)debug.push(ev(['true','false'].includes(debuggable)?debuggable==='true':'unresolved'));
      if(androidAttr(node,'permission')==='android.permission.BIND_ACCESSIBILITY_SERVICE'||name==='android.accessibilityservice.AccessibilityService')permissions.push(ev('ACCESSIBILITY_SERVICE'));
    }
  }
  if(!config.manifest) {
    for(const file of gradlePaths) {
      const original=files.get(file),text=stripComments(original),scope=block(text,'defaultConfig');
      if(scope)for(const m of scope.text.matchAll(/\btargetSdk(?:Version)?\s*(?:=\s*)?(\d+)\s*(?=;|\n|$)/g))target.push(evidence(file,original,scope.start+m.index,Number(m[1])));
    }
    if(expo&&!dynamicExpo&&!gradlePaths.some(p=>p.startsWith('android/app/'))) {
      for(const plugin of expo.plugins||[])if(Array.isArray(plugin)&&plugin[0]==='expo-build-properties'&&Number.isInteger(plugin[1]?.android?.targetSdkVersion)) {
        const text=files.get('app.json');target.push(evidence('app.json',text,text.indexOf('"targetSdkVersion"'),plugin[1].android.targetSdkVersion));
      }
    }
  }
  for(const file of gradlePaths) {
    const original=files.get(file),text=stripComments(original);
    for(const m of text.matchAll(/com\.android\.billingclient:billing(?:-ktx)?:(\d+)\.([\d.]+)["']/g))billing.push(evidence(file,original,m.index,Number(m[1])));
    const buildTypes=block(text,'buildTypes'),release=buildTypes&&block(buildTypes.text,'release');
    if(release) {
      const match=/signingConfig\s*(?:=\s*)?(?:signingConfigs\.debug|signingConfigs(?:\.getByName)?\s*[\[(]\s*["']debug["'])/.exec(release.text);
      if(match)signing.push(evidence(file,original,buildTypes.start+release.start+match.index,'release uses debug signing'));
    }
  }
  if(expo&&!config.manifest&&!dynamicExpo)for(const p of expo.android?.permissions||[])if(typeof p==='string')permissions.push(evidence('app.json',files.get('app.json'),files.get('app.json').indexOf(JSON.stringify(p)),p.includes('.')?p:`android.permission.${p}`));
  const gradleMentions=gradlePaths.reduce((n,file)=>n+(stripComments(files.get(file)).match(/\btargetSdk(?:Version)?\b/g)||[]).length,0);
  const ambiguousTarget=!config.manifest && (gradleMentions>target.filter(e=>gradlePaths.includes(e.file)).length || (stack==='expo'&&dynamicExpo));
  const billingSdks=dependencies.filter(x=>['react-native-purchases','purchases_flutter','react-native-iap','in_app_purchase','expo-in-app-purchases'].includes(x));
  const paymentSdks=dependencies.filter(x=>/stripe|paypal|paddle/i.test(x));
  const adsSdks=dependencies.filter(x=>/admob|google.mobile.ads|google-mobile-ads|google_mobile_ads|applovin/i.test(x));
  return {stack,dependencies,expo,eas,ambiguousTarget,gradlePaths,manifestPaths:manifests,dynamicExpo,target,billing,permissions,debug,signing,billingSdks,paymentSdks,adsSdks};
}
