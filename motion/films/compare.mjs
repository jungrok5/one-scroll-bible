// Versions of a film side by side, played as code (관리자 2026-11-04: "버전들이 나오면 동시에 틀어서 비교할 수 있게, mp4 말고 코드로").
// Each version is the film's code at a git revision (or the working tree), written out with the libraries it loads, so the old
// drawing really runs; one page plays them all on one clock (one play button, one scrubber, the latest mix as sound).
//   node motion/films/compare.mjs <film> <label>=<rev|WORK> [<label>=<rev|WORK> …] [--audio] [--out <dir>]
//   e.g. node motion/films/compare.mjs messiah 1차=2ee74fa 2차=WORK --audio   → motion/out/compare/messiah/index.html
// Publish the folder as one private artifact (index.html + files) — a film that is not public yet stays off the site.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, posix } from 'node:path';
const args = process.argv.slice(2), opt = k => { const i = args.indexOf('--' + k); return i > -1 ? args.splice(i, 2)[1] : null; };
const AUDIO = args.includes('--audio') && (args.splice(args.indexOf('--audio'), 1), true), film = args.shift(), outDir = opt('out') || `motion/out/compare/${film}`;
const versions = args.map((a, i) => { const [label, rev] = a.split('='); return { label, rev, dir: 'r' + (i + 1) }; });   // ASCII folder names; the label is only shown
if (!film || !versions.length) { console.error('usage: compare.mjs <film> <label>=<rev|WORK> … [--audio]'); process.exit(1); }
const git = (...a) => execFileSync('git', a, { encoding: 'buffer', maxBuffer: 1 << 28 });
const read = (rev, p) => rev === 'WORK' ? readFileSync(p) : git('show', `${rev}:${p}`);
const list = (rev, dir) => rev === 'WORK' ? readdirSync(dir).filter(f => statSync(join(dir, f)).isFile()).map(f => posix.join(dir, f)) : git('ls-tree', '--name-only', rev, dir + '/').toString().split('\n').filter(Boolean);
rmSync(outDir, { recursive: true, force: true }); mkdirSync(outDir, { recursive: true });
const files = [];
// the page each version runs in gets a tiny bridge: the parent's clock arrives by postMessage (works whatever the frame's origin)
const BRIDGE = `<script>addEventListener('message',e=>{const d=e.data;if(d&&d.seek!=null&&window.seek&&window.__ready)window.seek(d.seek)});setInterval(()=>{const c=document.querySelector('canvas');if(c)c.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%';if(window.__ready)parent.postMessage({ready:location.pathname,dur:window.DURATION},'*')},500);</script>`;
for (const v of versions) {
  const base = `motion/films/${film}`, root = join(outDir, 'v', v.dir);
  const own = list(v.rev, base).filter(p => /\.(html|js|json)$/.test(p) && !/review\.json$/.test(p));   // notes and feedback stay out
  const html = read(v.rev, `${base}/film.html`).toString(), libs = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => posix.normalize(posix.join(base, m[1]))).filter(p => !p.startsWith(base + '/'));
  // module libraries come through the import map (cinematic-3d: "three" → ../lib3d/three.module.min.js): copy that whole folder
  const im = (html.match(/<script type="importmap">([\s\S]*?)<\/script>/) || [])[1];
  if (im) for (const u of Object.values(JSON.parse(im).imports || {})) { const d = posix.dirname(posix.normalize(posix.join(base, u))); if (!d.startsWith(base)) libs.push(...list(v.rev, d)); }
  for (const p of [...new Set([...own, ...libs])]) { const rel = p.replace(/^motion\//, ''), dst = join(root, rel); mkdirSync(dirname(dst), { recursive: true });
    let b = read(v.rev, p); if (p === `${base}/film.html`) b = Buffer.from(b.toString().replace('</body>', BRIDGE + '\n</body>')); writeFileSync(dst, b); files.push(posix.join('v', v.dir, rel)); }
}
if (AUDIO) { const wav = `motion/out/${film}-narr.wav`; if (existsSync(wav)) { execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', wav, '-c:a', 'libmp3lame', '-b:a', '96k', join(outDir, 'sound.mp3')]); files.push('sound.mp3'); } }
const cols = versions.map(v => ({ label: v.label, rev: v.rev, src: `v/${v.dir}/films/${film}/film.html?render=1` }));
writeFileSync(join(outDir, 'index.html'), `<title>${film} 버전 비교</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
:root{--bg:#f4f1ea;--fg:#1d1a16;--mut:#6b6358;--line:#d8d0c2;--acc:#a86a1c;--card:#fffdf8}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#121110;--fg:#efe9df;--mut:#a59c8f;--line:#2e2a25;--acc:#e0a24a;--card:#1b1917;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#121110;--fg:#efe9df;--mut:#a59c8f;--line:#2e2a25;--acc:#e0a24a;--card:#1b1917;color-scheme:dark}
body{background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,-apple-system,"Noto Sans KR",sans-serif;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:16px 120px}
h1{font-size:20px;margin:0 0 4px;text-wrap:balance}.sub{color:var(--mut);margin:0 0 16px;font-size:13px}
.grid{display:grid;gap:14px;grid-template-columns:repeat(${cols.length},minmax(0,1fr))}@media (max-width:640px){.grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}}
.col{min-width:0;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:8px}.col b{display:block;font-size:14px;margin:0 0 6px}.col small{color:var(--mut)}
.frame{position:relative;width:min(100%,calc((100dvh - 200px) * 9 / 16));max-width:100%;margin-inline:auto;aspect-ratio:9/16;overflow:hidden;border-radius:8px;background:#000}.frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0;pointer-events:none}
.bar{position:fixed;left:0;right:0;bottom:0;display:flex;gap:10px;align-items:center;background:var(--card);border-top:1px solid var(--line);padding:12px max(16px,env(safe-area-inset-right,0px)) calc(12px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px))}
button{font:inherit;padding:8px 14px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--fg)}input[type=range]{flex:1;min-width:0;accent-color:var(--acc)}#tm{font-variant-numeric:tabular-nums;color:var(--mut);min-width:96px;text-align:right}
</style>
<h1>「${film}」 버전 비교</h1>
<p class="sub">같은 시각을 버전마다 코드로 그립니다(영상 파일이 아님). ${AUDIO ? '소리는 최신 섞기입니다.' : ''} 처음엔 그림을 준비하느라 몇 초 걸립니다.</p>
<div class="grid">${cols.map(c => `<div class="col"><b>${c.label} <small>${c.rev === 'WORK' ? '작업본' : c.rev}</small></b><div class="frame"><iframe src="${c.src}" title="${c.label}" loading="eager"></iframe></div></div>`).join('')}</div>
<div class="bar"><button id="pp" type="button">▶ 재생</button><button id="sp" type="button">1×</button><input id="sk" type="range" min="0" max="1000" value="0" aria-label="재생 위치"><span id="tm">0:00</span></div>
${AUDIO ? '<audio id="au" src="sound.mp3" preload="auto"></audio>' : ''}
<script>
const frames=[...document.querySelectorAll('.frame iframe')],au=document.getElementById('au'),pp=document.getElementById('pp'),sp=document.getElementById('sp'),sk=document.getElementById('sk'),tm=document.getElementById('tm');
let dur=0,cur=0,playing=false,last=performance.now(),rate=1;
addEventListener('message',e=>{if(e.data&&e.data.dur)dur=Math.max(dur,e.data.dur)});

const fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
pp.onclick=()=>{playing=!playing;pp.textContent=playing?'❚❚ 멈춤':'▶ 재생';if(au){if(playing){au.currentTime=cur;au.playbackRate=rate;au.play().catch(()=>{})}else au.pause()}};
sp.onclick=()=>{rate=rate===1?.5:rate===.5?.25:1;sp.textContent=rate+'×';if(au)au.playbackRate=rate};
sk.oninput=()=>{cur=sk.value/1000*(dur||180);if(au)au.currentTime=cur};
(function loop(now){if(playing){cur=au&&!au.paused?au.currentTime:cur+Math.min(.1,(now-last)/1000)*rate;if(dur&&cur>=dur){cur=0;if(au)au.currentTime=0}}
 last=now;frames.forEach(f=>f.contentWindow&&f.contentWindow.postMessage({seek:cur},'*'));sk.value=Math.round(cur/(dur||180)*1000);tm.textContent=fmt(cur)+' / '+fmt(dur||0);requestAnimationFrame(loop)})(last);
</script>
`);
writeFileSync(join(outDir, 'files.json'), JSON.stringify(files, null, 1));
console.log(`${outDir}/index.html · ${files.length} files (${versions.map(v => v.label + '=' + v.rev).join(', ')})`);
