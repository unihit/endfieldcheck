import {mkdirSync,cpSync,readFileSync,writeFileSync} from 'node:fs';
import {buildSync} from 'esbuild';
buildSync({entryPoints:['scripts/qr-entry.js'],bundle:true,format:'esm',platform:'browser',minify:true,outfile:'public/qrcode.js',legalComments:'eof'});
writeFileSync('public/THIRD-PARTY-LICENSES.txt','qrcode\n'+readFileSync('node_modules/qrcode/license','utf8')+'\n\ndijkstrajs\n'+readFileSync('node_modules/dijkstrajs/LICENSE.md','utf8'));
// GitHub Pages serves docs/ on main; no secrets or server functions are published.
mkdirSync('docs',{recursive:true});cpSync('public','docs',{recursive:true});
console.log('Built GitHub Pages assets in docs/.');
