import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync('public/index.html','utf8');
const queueCode=html.slice(html.indexOf('  const CACHE_KEY'),html.indexOf('  function openEditor'));
function client({online=false,server,now=Date.parse('2026-10-07T12:00:00Z')}={}){
 const storage=new Map(), elements=new Map();
 const initial={tasks:[{id:'a',period:'daily',name:'A',done:false},{id:'b',period:'daily',name:'B',done:false}],cycles:{daily:'2026-10-07',weekly:'2026-10-05',nextDaily:Date.parse('2026-10-07T20:00:00Z'),nextWeekly:Date.parse('2026-10-11T20:00:00Z')},serverTime:now};
 let shown, message='';
 class Clock extends Date {static now(){return now;}}
 const sandbox={Date:Clock,structuredClone,navigator:{onLine:online},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},snapshot:initial,busy:false,loaded:true,editing:null,clockOffset:0,
  $:id=>{if(!elements.has(id))elements.set(id,{open:false,disabled:false,hidden:false});return elements.get(id);},
  disable:()=>{},status:text=>{message=text;},draw:data=>{shown=data;sandbox.snapshot=data;},call:server||(()=>{throw new Error('offline');})};
 vm.createContext(sandbox);vm.runInContext(queueCode,sandbox);
 return {sandbox,storage,evaluate:code=>vm.runInContext(code,sandbox),shown:()=>shown,message:()=>message};
}
test('offline checks survive local reload and bulk completion preserves hidden items',async()=>{
 const c=client();c.sandbox.snapshot.tasks[1].hidden=true;
 await c.evaluate("mutate('completePeriod','daily','2026-10-07')");
 const q=JSON.parse(c.storage.get('endfield-pwa-pending-v1'));assert.equal(q.length,1);assert.equal(q[0].id,'a');assert.equal(c.shown().tasks[0].done,true);assert.equal(c.shown().tasks[1].done,false);
});
test('failed transmission retains queue and later retry clears it',async()=>{
 const c=client();await c.evaluate("mutate('setChecked','a',true,'2026-10-07')");
 c.sandbox.navigator.onLine=true;
 c.sandbox.call=async()=>{throw new Error('network unavailable');};await c.evaluate('flushPending()');
 assert.equal(JSON.parse(c.storage.get('endfield-pwa-pending-v1')).length,1);
 let writes=0;const data=structuredClone(c.sandbox.snapshot);data.serverTime=Date.now();
 // Keep test server and client in the same daily period.
 data.serverTime=Date.parse('2026-10-07T12:00:00Z');
 c.sandbox.call=async(name,...args)=>{if(name==='setChecked'){writes++;data.tasks.find(t=>t.id===args[0]).done=args[1];}return structuredClone(data);};
 await c.evaluate('flushPending()');assert.equal(writes,1);assert.equal(JSON.parse(c.storage.get('endfield-pwa-pending-v1')).length,0);assert.equal(c.shown().tasks[0].done,true);
});
test('yesterday offline checks never become today checks',async()=>{
 const c=client();await c.evaluate("mutate('setChecked','a',true,'2026-10-07')");c.sandbox.navigator.onLine=true;
 let writes=0;const data=structuredClone(c.sandbox.snapshot);data.cycles.daily='2026-10-08';data.serverTime=Date.parse('2026-10-07T20:00:00Z');data.tasks[0].done=false;
 c.sandbox.call=async(name)=>{if(name==='setChecked')writes++;return structuredClone(data);};
 await c.evaluate('flushPending()');assert.equal(writes,0);assert.equal(c.shown().tasks[0].done,false);assert.equal(JSON.parse(c.storage.get('endfield-pwa-pending-v1')).length,0);
});
test('storage failure does not claim a check was saved',async()=>{
 const c=client();c.sandbox.localStorage.setItem=()=>{throw new Error('quota');};await c.evaluate("mutate('setChecked','a',true,'2026-10-07')");
 assert.equal(c.sandbox.snapshot.tasks[0].done,false);assert.match(c.message(),/저장하지 못했습니다/);
});
