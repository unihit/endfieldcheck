// Each device supplies its own deployment URL. Never commit a live endpoint here.
export const DEFAULT_URL = '';
const names = new Set(['getChecklist','setChecked','clearPeriod','completePeriod','saveTaskList','saveLayout','getDiscordSettings','saveDiscordSettings','testDiscordConnection']);
export function formFor(name,args,token) {
  if(!names.has(name)||!Array.isArray(args))throw new Error('지원하지 않는 요청입니다.');
  const form=new URLSearchParams({token,action:name});
  if(name==='setChecked') {
    if(typeof args[0]!=='string'||typeof args[1]!=='boolean'||typeof args[2]!=='string')throw new Error('체크 요청 형식이 올바르지 않습니다.');
    form.set('id',args[0]);form.set('checked',String(args[1]));form.set('cycle',args[2]);
  }
  if(name==='clearPeriod'||name==='completePeriod'){form.set('period',args[0]);form.set('cycle',args[1]);}
  if(name==='saveTaskList'){form.set('period',args[0]);form.set('tasks',JSON.stringify(args[1]));form.set('revision',String(args[2]));}
  if(name==='saveLayout'){form.set('period',args[0]);form.set('order',JSON.stringify(args[1]));form.set('hidden',JSON.stringify(args[2]));form.set('revision',String(args[3]));}
  if(name==='saveDiscordSettings'){form.set('webhook',args[0]);form.set('enabled',String(args[1]));form.set('revision',String(args[2]));}
  return form;
}
export async function appsScriptCall(config,name,args,fetcher=fetch) {
  const url=new URL(config.url);
  if(url.origin!=='https://script.google.com'||!/^\/macros\/s\/[^/]+\/exec$/.test(url.pathname)||url.search||url.hash)throw new Error('Apps Script의 /exec 배포 주소를 입력해주세요.');
  if(!config.token)throw new Error('API 연결 키를 입력해주세요.');
  // URLSearchParams gives a simple CORS POST without a preflight. Never use no-cors: saving must be acknowledged.
  let response;
  try{response=await fetcher(url.href,{method:'POST',body:formFor(name,args,config.token),credentials:'omit',redirect:'follow',signal:AbortSignal.timeout(20000)});}
  catch{throw new Error('Apps Script 연결에 실패했습니다. 네트워크와 웹 앱 배포 접근 설정을 확인해주세요.');}
  let data;try{data=await response.json();}catch{throw new Error('서버가 JSON 대신 로그인 또는 오류 화면을 반환했습니다. 배포 설정을 확인해주세요.');}
  if(!response.ok||!data.ok){
    if(data.error==='unauthorized')throw new Error('API 연결 키가 일치하지 않습니다. 연결 설정을 확인해주세요.');
    if(String(data.error).startsWith('unknown action:'))throw new Error('이 기능은 제공된 Apps Script API 확장을 적용하고 재배포한 뒤 사용할 수 있습니다.');
    throw new Error(String(data.error||'서버 요청에 실패했습니다.').slice(0,300));
  }
  return data.result;
}
