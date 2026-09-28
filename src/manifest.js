// Small non-evaluating XML reader for Android manifests. DTDs and external entities
// are rejected. Text offsets are retained for source-line evidence.
function decode(value) {
  if(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);)/i.test(value))throw new Error('Unsupported XML entity');
  return value.replace(/&(amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);/gi,(_,name)=>{
    const named={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"};
    if(named[name])return named[name];
    const n=name.toLowerCase().startsWith('#x')?parseInt(name.slice(2),16):Number(name.slice(1));
    if(n<1||n>0x10ffff||(n>=0xd800&&n<=0xdfff))throw new Error('Invalid XML entity code point');
    return String.fromCodePoint(n);
  });
}
export function parseManifest(raw,release=false) {
  const text=raw.replace(/<!--[\s\S]*?-->|<\?[\s\S]*?\?>/g,x=>x.replace(/[^\n]/g,' '));
  if(/<!/.test(text))throw new Error('Manifest XML DTDs and declarations are not supported');
  const tag=/<(?:[^<>"']|"[^"]*"|'[^']*')*>/g,stack=[],elements=[];
  let cursor=0,roots=0,m;
  while((m=tag.exec(text))) {
    if(text.slice(cursor,m.index).trim())throw new Error('Malformed manifest XML text');cursor=tag.lastIndex;
    const token=m[0];
    if(token.startsWith('</')) {
      const close=/^<\/([\w:.-]+)\s*>$/.exec(token);
      if(!close||stack.pop()?.name!==close[1])throw new Error('Mismatched manifest XML tags');continue;
    }
    const opening=/^<([A-Za-z_][\w:.-]*)/.exec(token);if(!opening)throw new Error('Malformed manifest XML tag');
    const selfClosing=/\/\s*>$/.test(token),attrs={},ns={...(stack.at(-1)?.ns||{})};
    let rest=token.slice(opening[0].length).replace(/\/?\s*>$/,'');
    while(rest.trim()) {
      const a=/^\s+([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/.exec(rest);
      if(!a||Object.hasOwn(attrs,a[1]))throw new Error('Malformed or duplicate manifest XML attribute');
      attrs[a[1]]=decode(a[2]??a[3]);rest=rest.slice(a[0].length);
      if(a[1].startsWith('xmlns:'))ns[a[1].slice(6)]=attrs[a[1]];
    }
    const e={name:opening[1],attrs,ns,offset:m.index};
    if(!stack.length){roots++;if(e.name!=='manifest'||roots>1)throw new Error('Expected one manifest XML root');}
    elements.push(e);if(!selfClosing)stack.push(e);
  }
  if(!roots||stack.length||text.slice(cursor).trim())throw new Error('Incomplete manifest XML');
  if(release&&elements.filter(e=>e.name==='application').length!==1)throw new Error('Release manifest must contain one application element');
  return elements;
}
export function androidAttr(element,name) {
  for(const [key,value] of Object.entries(element.attrs)) {
    const [prefix,local]=key.split(':');
    if(local===name&&(element.ns[prefix]==='http://schemas.android.com/apk/res/android'||(prefix==='android'&&!element.ns.android)))return value;
  }
  return undefined;
}
