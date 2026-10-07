/**
 * 기존 .gs의 doPost / handleChatApi_ / routeChatAction_를 아래 코드로 교체하세요.
 * 기존 체크리스트 함수와 ScriptProperties 데이터는 그대로 유지합니다.
 * 기존 CHAT_API_TOKEN 선언은 삭제하고 프로젝트 설정 → 스크립트 속성에
 * CHAT_API_TOKEN을 설정하세요. 같은 값을 PWA의 APPS_SCRIPT_TOKEN에도 설정합니다.
 * 저장 후 배포 관리에서 새 버전으로 업데이트해야 적용됩니다.
 */
function doPost(e) {
  return handleChatApi_((e && e.parameter) || {});
}
function handleChatApi_(p) {
  const out = ContentService.createTextOutput().setMimeType(ContentService.MimeType.JSON);
  const token = PropertiesService.getScriptProperties().getProperty('CHAT_API_TOKEN');
  if (!token || p.token !== token) return out.setContent(JSON.stringify({ok:false,error:'unauthorized'}));
  try { return out.setContent(JSON.stringify({ok:true,result:routeChatAction_(p.action || '',p)})); }
  catch (error) { return out.setContent(JSON.stringify({ok:false,error:String(error.message || error)})); }
}
function routeChatAction_(action,p) {
  if (action === 'getChecklist') return getChecklist();
  if (action === 'setChecked') {
    if (p.checked !== 'true' && p.checked !== 'false') throw new Error('체크 설정 형식이 올바르지 않습니다.');
    return setChecked(p.id,p.checked === 'true',p.cycle);
  }
  if (action === 'completePeriod') return completePeriod(p.period,p.cycle);
  if (action === 'clearPeriod') return clearPeriod(p.period,p.cycle);
  if (action === 'saveTaskList') return saveTaskList(p.period,JSON.parse(p.tasks),Number(p.revision));
  if (action === 'saveLayout') return saveLayout(p.period,JSON.parse(p.order),JSON.parse(p.hidden),Number(p.revision));
  if (action === 'getDiscordSettings') return getDiscordSettings();
  if (action === 'saveDiscordSettings') {
    if (p.enabled !== 'true' && p.enabled !== 'false') throw new Error('알림 설정 형식이 올바르지 않습니다.');
    return saveDiscordSettings(p.webhook || '',p.enabled === 'true',Number(p.revision));
  }
  if (action === 'testDiscordConnection') return testDiscordConnection();
  throw new Error('unknown action: '+action);
}
