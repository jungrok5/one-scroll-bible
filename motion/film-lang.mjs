// One command for putting the film into another language — everything except the YouTube upload itself.
// The heavy steps (contact sheets, site fonts/posters, rendering, thumbnails, release) run on GitHub Actions
// (.github/workflows/render-film.yml), so any machine with Node + git + the GitHub CLI (`gh auth login`) can drive it.
//
//   node motion/film-lang.mjs status [lang…]          where every language stands (no args = every film language)
//   node motion/film-lang.mjs check  <lang…>          merge the translation files + scan every scene (missing lines, Korean left)
//   node motion/film-lang.mjs review <lang…>          write the native-review prompt → motion/out/review-<lang>.md
//   node motion/film-lang.mjs site   <lang…>          add the language's film button (FILM_CTA ← _ui.json "cta") + build the pages
//   node motion/film-lang.mjs ci     <lang…> --steps "sheets site h v kit release" [--scenes "rise church"] [--release youtube-v1] [--wait]
//                                                      run the pipeline on GitHub for the current (pushed) branch; with --wait,
//                                                      bring the results into the working tree (sheets → motion/out/sheets/<lang>/,
//                                                      site → film/, kit → motion/youtube/ + motion/subs/)
//   node motion/film-lang.mjs live   <lang…>          after deploying: is the language really on one-scroll-bible.com?
//
// The full procedure (who does what, in which order, and the quality gate) is in motion/README.md
// ("새 언어로 영상 만들기") and .claude/skills/add-film-language/SKILL.md.
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const M = dirname(fileURLToPath(import.meta.url)), ROOT = join(M, '..'), I18N = join(M, 'pilot', 'i18n');
const REPO = 'jungrok5/one-scroll-bible', SITE = 'https://one-scroll-bible.com';
const SCENES = ['opening', 'creation', 'fall', 'patriarch', 'exodus', 'wilderness', 'judges', 'kingdom', 'exile', 'return', 'silence',
  'advent', 'cross', 'rise', 'church', 'renewal', 'mirror', 'gospel', 'evidence', 'ship', 'invite'];
const [cmd, ...rest] = process.argv.slice(2);
const flag = k => { const i = rest.indexOf('--' + k); return i < 0 ? undefined : (rest[i + 1] && !rest[i + 1].startsWith('--') ? rest[i + 1] : true); };
const langs = rest.filter((a, i) => !a.startsWith('--') && !(i > 0 && rest[i - 1].startsWith('--') && rest[i - 1] !== '--wait'));
const read = p => JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, ''));
const run = (bin, args, opts = {}) => spawnSync(bin, args, { cwd: ROOT, stdio: 'inherit', ...opts });
const out = (bin, args) => execFileSync(bin, args, { cwd: ROOT, encoding: 'utf8' }).trim();
const indexHtml = () => readFileSync(join(ROOT, 'index.html'), 'utf8');
const filmCta = () => { const m = indexHtml().match(/const FILM_CTA=(\{[^;]*\});/); return m ? Function('return ' + m[1])() : {}; };
const siteLangs = () => [...indexHtml().match(/const LANGS\s*=\s*\[([\s\S]*?)\];/)[1].matchAll(/code:'([^']+)'[^}]*?en:'([^']+)'/g)].map(x => ({ code: x[1], en: x[2] }));
const filmLangs = () => readdirSync(I18N).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5));
const need = (cond, msg) => { if (!cond) { console.error(msg); process.exit(1); } };

function status(list) {
  const cta = filmCta(); let assets = null;
  try { assets = JSON.parse(out('gh', ['api', `repos/${REPO}/releases/tags/youtube-v1`, '--jq', '[.assets[].name]'])); } catch { }
  const manifest = existsSync(join(M, 'youtube', 'manifest.json')) ? read(join(M, 'youtube', 'manifest.json')).languages : {};
  const rows = list.map(L => {
    const dir = join(I18N, L), files = existsSync(dir) ? readdirSync(dir) : [];
    const scenes = SCENES.filter(s => files.includes(s + '.json')).length, merged = join(I18N, L + '.json');
    const fresh = existsSync(merged) && files.every(f => statSync(join(dir, f)).mtimeMs <= statSync(merged).mtimeMs + 1000);
    const ui = files.includes('_ui.json') ? read(join(dir, '_ui.json')) : {};
    const has = p => existsSync(join(ROOT, p));
    return {
      lang: L, translated: `${scenes}/21${files.includes('_ui.json') ? '+ui' : ''}`, merged: !existsSync(merged) ? '-' : fresh ? 'yes' : 'stale',
      ytText: has(`motion/youtube/lang/${L}.json`) ? 'yes' : '-', cta: ui.cta || cta[L] ? 'yes' : '-', review: has(`motion/reviews/${L}.md`) ? 'yes' : '-',
      button: cta[L] ? 'yes' : '-', siteFiles: has(`film/s/i18n/${L}.json`) && has(`film/poster-h-${L}.jpg`) ? 'yes' : '-',
      thumbs: has(`motion/youtube/thumbs/${L}/A-exodus.jpg`) ? 'yes' : '-', sheet: manifest[L] ? 'yes' : '-',
      subs: has(`motion/subs/${L}/film-h.srt`) ? 'yes' : '-',
      release: assets ? `${assets.includes(`film-${L}.mp4`) ? 'film' : '-'}/${assets.filter(a => a.startsWith(`shorts-${L}-`)).length}` : '?',
    };
  });
  console.table(rows);
  console.log('translated = scene files/21 (+ui = _ui.json) · merged = pilot/i18n/<lang>.json up to date · ytText = motion/youtube/lang/<lang>.json');
  console.log('review = motion/reviews/<lang>.md (native review, no open HIGH/MED) · button = FILM_CTA in index.html · siteFiles = film/s + poster');
  console.log('thumbs/sheet/subs = YouTube kit · release = film / Shorts count in the youtube-v1 release');
}

function check(list) {
  let bad = 0;
  for (const L of list) {
    need(existsSync(join(I18N, L)), `no translation folder motion/pilot/i18n/${L}/ — translate first (see SKILL.md step 1)`);
    console.log(`\n== ${L}: merge`); if (run('node', ['motion/i18n-merge.mjs', L]).status) bad++;
    console.log(`== ${L}: scan (every scene, both orientations — takes a few minutes)`); if (run('node', ['motion/i18n-scan.mjs', L]).status) bad++;
  }
  process.exitCode = bad ? 1 : 0;
}

function review(list) {
  const tpl = readFileSync(join(ROOT, '.claude', 'skills', 'add-film-language', 'review-prompt.md'), 'utf8'), names = siteLangs();
  mkdirSync(join(M, 'out'), { recursive: true });
  for (const L of list) {
    const pack = read(join(ROOT, 'i18n', L + '.json')), name = names.find(n => n.code === L)?.en || L;
    const edition = String(pack.ui?.version || '').replace(/^[(（]|[)）]$/g, '') || `YouVersion ${pack.yv}`;
    const p = join(M, 'out', `review-${L}.md`);
    writeFileSync(p, tpl.replaceAll('«LANG»', name).replaceAll('«CODE»', L).replaceAll('«EDITION»', edition).replaceAll('«YV»', String(pack.yv)));
    console.log(`→ ${p}\n  Give it to a fresh agent (it reports only). Apply every HIGH/MED finding, run check again, and keep the`);
    console.log(`  final report as motion/reviews/${L}.md — "status" counts a language as reviewed only when that file exists.`);
  }
}

function site(list) {
  let html = indexHtml(); const cta = filmCta();
  for (const L of list) {
    need(existsSync(join(M, 'reviews', L + '.md')), `${L}: no motion/reviews/${L}.md — publish only after the native review (AGENTS.md quality gate)`);
    const ui = read(join(I18N, L, '_ui.json')); need(ui.cta, `${L}: _ui.json has no "cta" (the button text)`);
    cta[L] = ui.cta;
  }
  const q = s => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;   // same literal style as the hand-written FILM_CTA
  const lit = '{' + Object.entries(cta).map(([k, v]) => `${/^[a-z]+$/.test(k) ? k : q(k)}:${q(v)}`).join(',') + '}';
  html = html.replace(/const FILM_CTA=\{[^;]*\};/, `const FILM_CTA=${lit};`);
  writeFileSync(join(ROOT, 'index.html'), html);
  console.log('FILM_CTA:', Object.keys(cta).join(' '));
  run('node', ['tools/build-pages.mjs']);
  console.log(`\nNext: commit + push, then  node motion/film-lang.mjs ci ${list.join(' ')} --steps site --wait  (posters + film/s on GitHub),`);
  console.log('commit that too, and deploy (main — only with the maintainer\'s OK). Then: node motion/film-lang.mjs live ' + list.join(' '));
}

function ci(list) {
  const steps = flag('steps'); need(typeof steps === 'string', '--steps "sheets site h v kit release" is required');
  const branch = out('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  run('git', ['fetch', '-q', 'origin', branch]);
  const ahead = out('git', ['rev-list', '--count', `origin/${branch}..HEAD`]);
  need(ahead === '0', `commit and push first: ${ahead} local commit(s) are not on origin/${branch} (GitHub renders what is pushed)`);
  if (out('git', ['status', '--porcelain', '--', 'motion/pilot', 'motion/youtube/lang', 'index.html'])) console.warn('note: uncommitted changes in motion/pilot, motion/youtube/lang or index.html are NOT in this run');
  const args = ['workflow', 'run', 'render-film.yml', '-R', REPO, '--ref', branch, '-f', `languages=${list.join(' ')}`, '-f', `steps=${steps}`];
  if (typeof flag('scenes') === 'string') args.push('-f', `scenes=${flag('scenes')}`);
  if (typeof flag('release') === 'string') args.push('-f', `release=${flag('release')}`);
  const before = new Date(Date.now() - 5000).toISOString();
  need(run('gh', args).status === 0, 'gh workflow run failed (gh auth login? workflow on main?)');
  let id = null;
  for (let t = 0; t < 30 && !id; t++) {
    spawnSync(process.execPath, ['-e', 'setTimeout(()=>{},2000)']);
    const runs = JSON.parse(out('gh', ['run', 'list', '-R', REPO, '--workflow', 'render-film.yml', '--branch', branch, '-L', '5', '--json', 'databaseId,createdAt']));
    id = runs.find(r => r.createdAt >= before)?.databaseId;
  }
  need(id, 'started, but could not find the run — see the Actions tab');
  console.log(`run: https://github.com/${REPO}/actions/runs/${id}`);
  if (!flag('wait')) { console.log(`later: gh run watch ${id} -R ${REPO}; then node motion/film-lang.mjs ci-fetch ${id}`); return; }
  run('gh', ['run', 'watch', String(id), '-R', REPO, '--exit-status']);
  fetchRun(id);
}

function fetchRun(id) {
  const names = JSON.parse(out('gh', ['api', `repos/${REPO}/actions/runs/${id}/artifacts?per_page=100`, '--jq', '[.artifacts[].name]']));
  const tmp = join(tmpdir(), `film-run-${id}`); rmSync(tmp, { recursive: true, force: true });
  for (const n of names) {
    let dest = null;
    if (n.startsWith('sheets-')) dest = join(M, 'out', 'sheets', n.slice(7));
    else if (n === 'site') dest = join(ROOT, 'film');            // artifact root = film/ (poster-*.jpg, s/)
    else if (n === 'kit') dest = M;                              // artifact root = motion/ (youtube/…, subs/…)
    if (!dest) continue;                                         // films/Shorts stay on GitHub (release step) — too big to pull by default
    run('gh', ['run', 'download', String(id), '-R', REPO, '-n', n, '-D', join(tmp, n)]);
    cpSync(join(tmp, n), dest, { recursive: true });
    console.log(`${n} → ${dest}`);
  }
  rmSync(tmp, { recursive: true, force: true });
  console.log('Look at the sheets; commit site/kit files that changed (git status).');
}

async function live(list) {
  for (const L of list) {
    const j = await fetch(`${SITE}/film/s/i18n/${L}.json`), page = await fetch(`${SITE}/${L}/`).then(r => r.text()).catch(() => '');
    const btn = /id="filmCta"(?![^>]*hidden)/.test(page) && page.includes(`/film/?lang=${L}`);
    console.log(`${L}: film/s/i18n/${L}.json ${j.status} · language page film button ${btn ? 'shown' : 'NOT shown'} · ${SITE}/film/?lang=${L}`);
  }
}

const list = langs.length ? langs : filmLangs();
if (cmd === 'status') status(list);
else if (cmd === 'check') check(langs);
else if (cmd === 'review') review(langs);
else if (cmd === 'site') site(langs);
else if (cmd === 'ci') ci(langs);
else if (cmd === 'ci-fetch') fetchRun(langs[0]);
else if (cmd === 'live') await live(langs);
else console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').filter(l => l.startsWith('//')).map(l => l.slice(3)).join('\n'));
