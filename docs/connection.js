export const CODE_PREFIX='ENDFIELD1.';
export function validateConnection(value){
 if(!value||typeof value.url!=='string'||typeof value.token!=='string'||!value.token.trim()||value.token.length>512)throw new Error('연결 정보가 올바르지 않습니다.');
 const url=new URL(value.url);
 if(url.origin!=='https://script.google.com'||!/^\/macros\/s\/[^/]+\/exec$/.test(url.pathname)||url.search||url.hash)throw new Error('올바른 Apps Script 배포 주소가 아닙니다.');
 return {url:url.href,token:value.token.trim()};
}
export function encodeConnection(config){
 const bytes=new TextEncoder().encode(JSON.stringify({v:1,...validateConnection(config)}));
 return CODE_PREFIX+btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
export function decodeConnection(input){
 let code=String(input).trim();
 if(code.startsWith('https://')||code.startsWith('http://')){const url=new URL(code);code=new URLSearchParams(url.hash.slice(1)).get('connect')||'';}
 if(!code.startsWith(CODE_PREFIX)||code.length>4096)throw new Error('연결 링크 또는 연결 코드를 붙여넣어주세요.');
 try{
  const base64=code.slice(CODE_PREFIX.length).replace(/-/g,'+').replace(/_/g,'/');
  const data=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(base64),c=>c.charCodeAt(0))));
  if(data.v!==1)throw new Error();return validateConnection(data);
 }catch{throw new Error('연결 정보를 읽을 수 없습니다. 다른 기기에서 다시 만들어주세요.');}
}
export function connectionLink(config,base){
 const url=new URL(base);url.search='';url.hash='';url.hash=new URLSearchParams({connect:encodeConnection(config)}).toString();return url.href;
}
