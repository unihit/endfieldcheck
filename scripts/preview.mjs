import http from 'node:http';
import {readFileSync} from 'node:fs';
const PORT = 4173;
http.createServer(async(req,res) => {
 try {
  const pathname=new URL(req.url,`http://localhost:${PORT}`).pathname;
  const allowed={'/':['index.html','text/html; charset=utf-8'],'/api.js':['api.js','text/javascript'],'/connection.js':['connection.js','text/javascript'],'/qrcode.js':['qrcode.js','text/javascript'],'/sw.js':['sw.js','text/javascript'],'/manifest.webmanifest':['manifest.webmanifest','application/manifest+json'],'/icon-192.png':['icon-192.png','image/png'],'/icon-512.png':['icon-512.png','image/png']};
  const entry=allowed[pathname];if(!entry){res.writeHead(404);res.end('Not found');return;}
  res.writeHead(200,{'Content-Type':entry[1],'X-Endfield-Shell':pathname==='/'?'1':'0','Cache-Control':'no-cache'});res.end(readFileSync('public/'+entry[0]));
 } catch {res.writeHead(500);res.end('Preview failed');}
}).listen(PORT,()=>console.log(`Local preview: http://localhost:${PORT}`));
