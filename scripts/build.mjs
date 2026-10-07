import {mkdirSync,cpSync} from 'node:fs';
// GitHub Pages serves docs/ on main; no secrets or server functions are published.
mkdirSync('docs',{recursive:true});cpSync('public','docs',{recursive:true});
console.log('Built GitHub Pages assets in docs/.');
