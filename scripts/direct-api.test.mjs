import test from 'node:test';
import assert from 'node:assert/strict';
import {appsScriptCall,formFor,DEFAULT_URL} from '../public/api.js';
import {readFileSync} from 'node:fs';
const TEST_URL = 'https://script.google.com/macros/s/test-deployment/exec';
test('no live deployment URL is shipped in source or published assets',()=>{
 assert.equal(DEFAULT_URL,'');
 for(const path of ['public/api.js','public/index.html','docs/api.js','docs/index.html']) {
  assert.doesNotMatch(readFileSync(path,'utf8'),/https:\/\/script\.google\.com\/macros\/s\/AKfy[\w-]+\/exec/);
 }
});
test('direct API uses simple POST and keeps token out of URL',async()=>{
 let received;
 const result=await appsScriptCall({url:TEST_URL,token:'test-only'},'setChecked',['a',false,'2026-10-07'],async(url,options)=>{received={url,options};return Response.json({ok:true,result:{revision:2}});});
 assert.equal(received.url.includes('test-only'),false);assert.equal(received.options.body.get('token'),'test-only');assert.equal(received.options.body.get('checked'),'false');assert.equal(received.options.credentials,'omit');assert.equal(received.options.headers,undefined);assert.equal(result.revision,2);
});
test('token is sent only to an Apps Script deployment',async()=>{
 let called=false;await assert.rejects(appsScriptCall({url:'https://evil.invalid/exec',token:'test-only'},'getChecklist',[],async()=>{called=true;}));assert.equal(called,false);
});
test('invalid booleans and unknown actions are rejected',()=>{
 assert.throws(()=>formFor('setChecked',['a','false','2026-10-07'],'x'));assert.throws(()=>formFor('unknown',[],'x'));
});
test('server acknowledgement is required and errors remain actionable',async()=>{
 await assert.rejects(appsScriptCall({url:TEST_URL,token:'test-only'},'getChecklist',[],async()=>Response.json({ok:false,error:'unauthorized'})),/연결 키/);
 await assert.rejects(appsScriptCall({url:TEST_URL,token:'test-only'},'saveTaskList',[],async()=>Response.json({ok:false,error:'unknown action: saveTaskList'})),/API 확장/);
});
