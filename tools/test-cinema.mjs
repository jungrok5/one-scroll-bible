import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const ctx={};vm.createContext(ctx);vm.runInContext(read('v2/cinema.js'),ctx);
assert.equal(ctx.OSBCinema.rows.length,13);
for(const row of ctx.OSBCinema.rows){assert.equal(row.length,7);for(const str of row)assert.ok(str.length);for(const size of [640,960])assert.ok(fs.statSync(new URL(`v2/art/${row[0]}-${size}.webp`,root)).size>1000);}
for(const lang of ['ko','en']){assert.equal(ctx.OSBCinema.extra[lang].length,2);assert.equal(ctx.OSBCinema.extra[lang][0][0],'cross');assert.equal(ctx.OSBCinema.extra[lang][1][0],'resurrection');}
assert.match(ctx.OSBCinema.rows[9][1],/400/);assert.match(ctx.OSBCinema.rows[9][4],/400/);
const css=read('v2/cinema.css');assert.match(css,/prefers-reduced-motion/);assert.match(css,/min-height:44px/);assert.doesNotMatch(css,/scroll-snap|height:100vh;|opacity:0[;}]/);
const html=read('index.html');assert.match(html,/OSBCinema.mount\(pack,curCode\)/);assert.match(html,/cc.hidden=\(code==='en'\)/);
assert.match(html,/heroLangBtn.addEventListener\('click',function\(e\)\{e.stopPropagation\(\)/);
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].filter(m=>!m[0].includes('application/ld+json'));
for(const [,script] of scripts)new vm.Script(script);
console.log('PASS: 13 bilingual scenes, cross → resurrection, 400 years, assets, motion/reading safeguards, script syntax, ESV exclusion.');
console.log('Browser layout and device testing are separate; this is not a mobile rendering test.');
