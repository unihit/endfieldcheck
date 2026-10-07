import test from 'node:test';
import assert from 'node:assert/strict';
import {encodeConnection,decodeConnection,connectionLink} from '../public/connection.js';
const config={url:'https://script.google.com/macros/s/test-deployment/exec',token:'fake-pairing-key-한글'};
test('connection code round-trips URL and unicode key',()=>{
 assert.deepEqual(decodeConnection(encodeConnection(config)),config);
});
test('private link carries configuration only in fragment',()=>{
 const link=connectionLink(config,'https://example.com/endfieldcheck/?old=1#old');
 const url=new URL(link);assert.equal(url.search,'');assert.equal(url.pathname,'/endfieldcheck/');assert.deepEqual(decodeConnection(link),config);assert.equal((url.origin+url.pathname).includes(config.token),false);
});
test('malformed codes and off-service credential destinations are rejected',()=>{
 for(const value of ['','ENDFIELD1.not-json','https://example.com/#wrong=x'])assert.throws(()=>decodeConnection(value));
 assert.throws(()=>encodeConnection({url:'https://attacker.invalid/exec',token:'fake-key'}));
 assert.throws(()=>encodeConnection({url:config.url,token:''}));
 assert.throws(()=>decodeConnection('ENDFIELD1.'+btoa(JSON.stringify({v:2,url:config.url,token:'fake-key'}))));
});
