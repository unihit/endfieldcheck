import http from 'node:http';
import {readFileSync} from 'node:fs';
const PORT = 4173;
http.createServer(async(req,res) => {
 try {
  const pathname=new URL(req.url,`http://localhost:${PORT}`).pathname;
  if(['/api','/login','/logout'].includes(pathname)){res.writeHead(503,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:false,error:'로컬 미리보기에는 서버 비밀 값이 없습니다. Cloudflare Pages에서 연결해주세요.'}));return;}
  const allowed={'/':['index.html','text/html; charset=utf-8'],'/sw.js':['sw.js','text/javascript'],'/manifest.webmanifest':['manifest.webmanifest','application/manifest+json'],'/icon-192.png':['icon-192.png','image/png'],'/icon-512.png':['icon-512.png','image/png']};
  const entry=allowed[pathname];if(!entry){res.writeHead(404);res.end('Not found');return;}
  res.writeHead(200,{'Content-Type':entry[1],'X-Endfield-Shell':pathname==='/'?'1':'0','Cache-Control':'no-cache'});res.end(readFileSync('public/'+entry[0]));
 } catch {res.writeHead(500);res.end('Preview failed');}
}).listen(PORT,()=>console.log(`Local preview: http://localhost:${PORT}`));
