// Sound for a short film: narration + music + effects → two mixes, and each muxed onto the rendered video.
//   node motion/films/sound.mjs <film> [v|h]        e.g.  node motion/films/sound.mjs silence400 v
//   node motion/films/sound.mjs <film> [v|h] --lang <lang>   another language's narration (2026-11-01, films README §4):
//     takes from sound/takes-<lang>/ placed by sound/place-<lang>.json (fit-voice.mjs: take, start, squeeze, tempo),
//     captions sound/<lang>.srt + .vtt from that language's i18n text, the narrated mix as motion/out/<film>-<lang>-narr.wav
//     + .mp3 (a YouTube audio track) and, when motion/out/film-<lang>-<v|h>.mp4 exists (the picture rendered with that
//     language's words), <film>-<lang>-<v|h>-narr.mp4. The sound-only mix has no words, so it is not made again.
// Reads motion/films/<film>/sound/:
//   voice/<lineId>.mp3   narration takes (ElevenLabs; ids in takes.json)      place.json  { dur, at: { lineId: film seconds } }
//   audio/<cueId>.mp3    music cues and effects                                cues.json   { dur, music: [...], sfx: [...] }
// Writes motion/out/<film>-narr.wav, <film>-sound.wav and, when motion/out/film-<v|h>.mp4 exists, <film>-<v|h>-narr.mp4
// and <film>-<v|h>-sound.mp4.
// The narrated mix does NOT pull the music down as a whole (the first film's narrated cut lost its music that way): only the
// band the voice lives in (1.2–4.5 kHz) is ducked by the voice, by up to ~6 dB; lows and highs dip ~2 dB at most. Levels are
// set per cue in cues.json so that under speech the voice sits ~6–7 LU above the music. Both mixes: −14 LUFS, −1.5 dBTP.
// Find where a generated cue actually swells (to place it on a picture beat): node motion/films/sound.mjs --envelope <file…>
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url)), OUT = join(HERE, '..', 'out'), args = process.argv.slice(2);
const json = f => JSON.parse(readFileSync(f, 'utf8').replace(/^\uFEFF/, ''));
const ff = a => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...a], { maxBuffer: 1 << 28 });

if (args[0] === '--envelope') {   // RMS dB per 0.5 s and the biggest jump
  for (const f of args.slice(1)) {
    const raw = execFileSync('ffmpeg', ['-loglevel', 'error', '-i', f, '-ac', '1', '-ar', '8000', '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
    const x = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4), W = 4000, db = [];
    for (let i = 0; i + W <= x.length; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += x[k] * x[k]; db.push(10 * Math.log10(s / W + 1e-12)); }
    let jump = 0, at = 0; for (let i = 1; i < db.length; i++) if (db[i] - db[i - 1] > jump) { jump = db[i] - db[i - 1]; at = i * .5; }
    console.log(f.split(/[\\/]/).pop(), 'peak@' + db.indexOf(Math.max(...db)) * .5 + 's', 'jump +' + jump.toFixed(1) + 'dB@' + at + 's |', db.map(Math.round).join(' '));
  }
  process.exit(0);
}

const li = args.indexOf('--lang'), lang = li > -1 ? args.splice(li, 2)[1] : null;
const [film, ori] = args, S = join(HERE, film, 'sound'), T = join(OUT, film + '-sound-work' + (lang ? '-' + lang : '')); mkdirSync(T, { recursive: true });
const place = json(join(S, lang ? `place-${lang}.json` : 'place.json')), C = json(join(S, 'cues.json')), D = C.dur;
const tag = lang ? `${film}-${lang}` : film;   // output names

// 1. the narration track: each take trimmed of silence, evened toward −18.5 LUFS (70 % of the way, ±4 dB), laid at its time
const TRIM = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.10,areverse';
const SQUEEZE = 'silenceremove=stop_periods=-1:stop_duration=0.28:stop_threshold=-42dB:stop_silence=0.22';   // = fit-voice.mjs
const ids = Object.keys(place.at).sort((a, b) => place.at[a] - place.at[b]), info = [];
for (const id of ids) {
  const out = join(T, id + '.wav');
  const src = lang ? join(S, 'takes-' + lang, `${id}-${place.take[id]}.mp3`) : join(S, 'voice', id + '.mp3');
  const af = [TRIM, lang && place.squeeze?.[id] && SQUEEZE, lang && place.tempo?.[id] && `atempo=${place.tempo[id]}`, 'aresample=48000'].filter(Boolean).join(',');
  // rebuild when the take is newer than its trimmed copy (「메시아」 8c: a re-cut W3 kept playing the old take from this cache)
  if (!existsSync(out) || statSync(src).mtimeMs > statSync(out).mtimeMs) ff(['-i', src, '-af', af, '-ac', '2', '-ar', '48000', out]);
  const dur = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out], { encoding: 'utf8' }).trim();
  const e = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', out, '-af', 'ebur128=framelog=quiet', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const I = +e.slice(e.lastIndexOf('Summary')).match(/I:\s+(-?[\d.]+) LUFS/)[1];
  info.push({ id, at: place.at[id], dur, gain: Math.max(-4, Math.min(4, (-18.5 - I) * .7)) });
}
info.forEach((x, i) => { const n = info[i + 1], end = x.at + x.dur; if (n && end > n.at - .15) console.log(`OVERLAP ${x.id} ends ${end.toFixed(2)} > ${n.id} at ${n.at}`); });
// subtitles (YouTube search can't read words drawn into the picture): every spoken line at its spoken time, plus place.subs_extra
// (silent on-screen verses, { id: [from, to] }) → sound/ko.srt
{ const K = Object.fromEntries(json(join(HERE, film, 'script.json')).lines.map(l => [l.id, l])), ts = s => { const ms = Math.round(s * 1000);
    return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  const subs = [...info.map((x, i) => ({ id: x.id, a: x.at, b: Math.min(x.at + x.dur + .4, info[i + 1] ? info[i + 1].at - .05 : D) })),
    ...Object.entries(place.subs_extra || {}).map(([id, [a, b]]) => ({ id, a, b }))].sort((p, q) => p.a - q.a);
  // another language: what its narrator says — that language's text; where the Korean voice reads only the part after '…'
  // (line 01), so does it (the same rule as the narration prompts)
  const P = lang ? json(join(HERE, film, 'i18n', lang + '.json')) : null;
  const txt = id => { const k = K[id];
    if (!lang) return (k.frags ? k.frags.join(' ') : (k.voice || k.text)).replace(/\s*\/\s*/g, '\n');
    let t = P[id].voice || P[id].text; if (k.voice && k.text.includes('…') && !P[id].voice && id in place.at) t = t.slice(t.lastIndexOf('…') + 1).trim();
    return t.replace(/\s*\/\s*/g, '\n'); };
  const cap = lang || 'ko';
  writeFileSync(join(S, cap + '.srt'), subs.map((s, i) => `${i + 1}\n${ts(s.a)} --> ${ts(s.b)}\n${txt(s.id)}\n`).join('\n'));
  // the same lines as WebVTT placed at the TOP: a quarter of the first film's narrated-cut views had captions switched on (older
  // viewers on TV, 2026-10-31) and the words are already drawn at the bottom of the picture — bottom captions would sit on them
  writeFileSync(join(S, cap + '.vtt'), 'WEBVTT\n\n' + subs.map(s => `${ts(s.a).replace(',', '.')} --> ${ts(s.b).replace(',', '.')} line:6% position:50% align:center\n${txt(s.id)}\n`).join('\n')); }
const voice = join(OUT, tag + '-voice.wav');
writeFileSync(join(T, 'voice-fc.txt'), info.map((x, i) => `[${i}:a]volume=${x.gain.toFixed(2)}dB,adelay=${Math.round(x.at * 1000)}:all=1[a${i}]`).join(';') +
  `;${info.map((_, i) => `[a${i}]`).join('')}amix=inputs=${info.length}:normalize=0:dropout_transition=0,apad,atrim=end=${D}[v]`);
ff([...info.flatMap(x => ['-i', join(T, x.id + '.wav')]), '-filter_complex_script', join(T, 'voice-fc.txt'), '-map', '[v]', '-ac', '2', '-ar', '48000', voice]);

// 2. the bed (music + effects), then the two mixes
const cues = [...C.music, ...C.sfx], inputs = [], parts = [];
cues.forEach((c, i) => {
  const f = c.file ? join(HERE, '..', '..', c.file) : join(S, 'audio', c.id + '.mp3'); if (!existsSync(f)) throw new Error('missing ' + f);
  inputs.push('-i', f);
  const len = c.len ? `atrim=start=${c.off || 0}:duration=${c.len},asetpts=PTS-STARTPTS,` : (c.off ? `atrim=start=${c.off},asetpts=PTS-STARTPTS,` : '');
  const fin = c.fin ? `afade=t=in:d=${c.fin},` : '', fout = c.fout ? `areverse,afade=t=in:d=${c.fout},areverse,` : '';
  // cues.json "ducks": [{ from, to, db, ramp }] — a breath of silence before a beat, as in the first film (pilot/mix.py): every cue
  // that started before `from` is pulled down to `db` over `ramp` s and stays down until `to`; cues that start later are untouched
  const dk = (C.ducks || []).filter(d => c.at < d.from).map(d => `(1-${(1 - 10 ** (d.db / 20)).toFixed(4)}*clip((t-${d.from})/${d.ramp || .3},0,1)*lt(t,${d.to}))`);
  parts.push(`[${i}:a]aresample=48000,aformat=channel_layouts=stereo,${len}${fin}${fout}volume=${c.db}dB,adelay=${Math.round(c.at * 1000)}:all=1${dk.length ? `,volume='${dk.join('*')}':eval=frame` : ''}[c${i}]`);
});
const fc = [...parts, `${cues.map((_, i) => `[c${i}]`).join('')}amix=inputs=${cues.length}:normalize=0:dropout_transition=0,apad,atrim=end=${D}[bed]`,
  `[${cues.length}:a]aresample=48000,aformat=channel_layouts=stereo,asplit=3[v][k1][k2]`, `[bed]asplit=2[bd][bs]`,
  `[bd]acrossover=split=1200 4500[lo][mid][hi]`, `[lo][hi]amix=inputs=2:normalize=0[lh]`,
  `[mid][k1]sidechaincompress=threshold=0.02:ratio=4:attack=25:release=450:makeup=1[midd]`,
  `[lh][k2]sidechaincompress=threshold=0.03:ratio=1.6:attack=40:release=600:makeup=1[lhd]`,
  `[midd][lhd][v]amix=inputs=3:normalize=0:dropout_transition=0,atrim=end=${D}[narr]`, `[bs]volume=1.5dB[sound]`].join(';\n');
writeFileSync(join(T, 'mix-fc.txt'), fc);
const pre = k => join(T, `pre-${k}.wav`);
ff([...inputs, '-i', voice, '-filter_complex_script', join(T, 'mix-fc.txt'), '-map', '[narr]', '-ar', '48000', '-ac', '2', pre('narr'), '-map', '[sound]', '-ar', '48000', '-ac', '2', pre('sound')]);
for (const k of lang ? ['narr'] : ['narr', 'sound']) {   // two-pass loudness
  const e = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', pre(k), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const m = JSON.parse(e.slice(e.lastIndexOf('{'), e.lastIndexOf('}') + 1)), wav = join(OUT, `${tag}-${k}.wav`);
  ff(['-i', pre(k), '-af', `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`, '-ar', '48000', wav]);
  if (lang) { const mp3 = wav.replace(/\.wav$/, '.mp3'); ff(['-i', wav, '-c:a', 'libmp3lame', '-b:a', '320k', mp3]); console.log('→', mp3, '(audio track)'); }
  const vid = join(OUT, `film-${lang ? lang + '-' : ''}${ori || 'v'}.mp4`);
  if (existsSync(vid)) { const mp4 = join(OUT, `${tag}-${ori || 'v'}-${k}.mp4`); ff(['-i', vid, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', mp4]); console.log('→', mp4); }
  else console.log('→', wav);
}
