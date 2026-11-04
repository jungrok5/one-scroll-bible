// The international video of a film (films README §4: one English-text video per orientation on @bibleinonescroll; other
// languages ride on it as audio tracks + captions + localized title/description). Text: motion/films/<film>/youtube-intl.json.
//   node motion/films/intl.mjs entry <film> <v|h>          → motion/out/<film>-intl-<v|h>.json: the studio-upload.js entry
//        (served by serve.mjs: __osbUpload('en', { entry: await (await fetch('http://127.0.0.1:8765/out/<film>-intl-h.json')).json() }))
//   node motion/films/intl.mjs api <film> <v|h> <videoId> [--dry]   (YT_AS=GLOBAL, the international channel's token)
//        → default language/audio language, category Education, standard licence (never Creative Commons — the ESV notice
//          forbids it), localized title + description for every other language, and a caption track per language (top-placed
//          WebVTT from sound.mjs). ~50 units + 400 per caption track. Audio tracks have no API: Studio → Languages → Audio.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { dropCredit } from '../youtube/credit.mjs';   // no tools credit in descriptions (owner 2026-11-05)
const HERE = dirname(fileURLToPath(import.meta.url)), M = join(HERE, '..'), args = process.argv.slice(2), dry = args.includes('--dry');
const [cmd, film, ori, vid] = args.filter(a => !a.startsWith('--'));
const Y = JSON.parse(readFileSync(join(HERE, film, 'youtube-intl.json'), 'utf8')), D = Y.default_language;
const SITE = 'https://one-scroll-bible.com/';
const desc = (L, o) => { const t = Y.text[L], link = `${SITE}?lang=${L}&utm_source=youtube&utm_medium=${o === 'v' ? 'shorts' : 'video'}&utm_campaign=film_${film}`;
  return [t.intro, t.read, `${t.site}\n${link}`, dropCredit(t.legal), ...(o === 'h' ? [t.chapters.join('\n')] : [])].join('\n\n'); };

if (cmd === 'entry') {
  const e = { path: Y[ori].path, file: Y[ori].file, title: Y.text[D].title, description: desc(D, ori), tags: Y.tags[D] };
  if (ori === 'h') e.thumbnail = `films/${film}/thumbs/A-glass-${D}.jpg`;
  const out = join(M, 'out', `${film}-intl-${ori}.json`); writeFileSync(out, JSON.stringify(e, null, 1)); console.log('→', out);
} else if (cmd === 'api') {
  if (!/^[\w-]{11}$/.test(vid || '')) { console.log('usage: intl.mjs api <film> <v|h> <videoId> [--dry]'); process.exit(1); }
  const env = { ...process.env }, f = join(homedir(), '.config', 'one-scroll-bible', 'youtube.env');
  if (existsSync(f)) for (const l of readFileSync(f, 'utf8').split('\n')) { const m = l.match(/^(YT_\w+)=(.*)$/); if (m && !env[m[1]]) env[m[1]] = m[2]; }
  if ((env.YT_AS || '').toUpperCase() !== 'GLOBAL') { console.log('set YT_AS=GLOBAL (the international channel)'); process.exit(1); }
  const tok = (await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: env.YT_CLIENT_ID, client_secret: env.YT_CLIENT_SECRET, refresh_token: env.YT_REFRESH_TOKEN_GLOBAL, grant_type: 'refresh_token' }) })).json()).access_token;
  const api = async (p, o = {}) => { const r = await fetch(p.startsWith('http') ? p : 'https://www.googleapis.com/youtube/v3/' + p, { ...o, headers: { Authorization: 'Bearer ' + tok, ...(o.headers || {}) } });
    const t = await r.text(); let j; try { j = JSON.parse(t); } catch { j = { raw: t }; } if (!r.ok) throw new Error(`${r.status} ${j.error?.message || t.slice(0, 200)}`); return j; };
  const v = (await api(`videos?part=snippet,status,localizations&id=${vid}`)).items?.[0]; if (!v) { console.log('no such video on this channel'); process.exit(1); }
  const s = v.snippet, loc = {};
  for (const L of Object.keys(Y.text)) if (L !== D) loc[L] = { title: Y.text[L].title, description: desc(L, ori) };
  const body = { id: vid,
    snippet: { title: s.title, description: s.description, tags: s.tags, categoryId: '27', defaultLanguage: D, defaultAudioLanguage: D },
    localizations: loc,
    status: { privacyStatus: v.status.privacyStatus, ...(v.status.publishAt ? { publishAt: v.status.publishAt } : {}), license: 'youtube',
      embeddable: v.status.embeddable, publicStatsViewable: v.status.publicStatsViewable, selfDeclaredMadeForKids: false } };
  console.log(`${vid}: ${s.title} (${v.status.privacyStatus}) → languages ${D} + ${Object.keys(loc).join(', ')}, licence youtube`);
  if (!dry) { await api('videos?part=snippet,localizations,status', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); console.log('  title/description/localizations set'); }
  const have = (await api(`captions?part=snippet&videoId=${vid}`)).items || [];
  for (const [L, file] of Object.entries(Y.captions)) {
    if (have.some(c => c.snippet.language === L && c.snippet.trackKind !== 'asr')) { console.log(`  caption ${L}: already there`); continue; }
    if (dry) { console.log(`  caption ${L}: would upload ${file}`); continue; }
    const meta = JSON.stringify({ snippet: { videoId: vid, language: L, name: '', isDraft: false } }), b = 'osb' + Date.now();
    const mp = `--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${b}\r\nContent-Type: application/octet-stream\r\n\r\n${readFileSync(join(M, file), 'utf8')}\r\n--${b}--`;
    const j = await api('https://www.googleapis.com/upload/youtube/v3/captions?uploadType=multipart&part=snippet', { method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${b}` }, body: mp });
    console.log(`  caption ${L}: ${j.id}`);
  }
  console.log('  audio tracks: Studio → Languages → add ' + Object.keys(Y.audio_tracks).join(', ') + ' → Audio → ' + Object.values(Y.audio_tracks).join(', '));
} else console.log('usage: intl.mjs entry|api …');
