// Sound for a short film: narration + music + effects → two mixes, and each muxed onto the rendered video.
//   node motion/films/sound.mjs <film> [v|h]        e.g.  node motion/films/sound.mjs silence400 v
// Reads motion/films/<film>/sound/:
//   voice/<lineId>.mp3   narration takes (ElevenLabs; ids in takes.json)      place.json  { dur, at: { lineId: film seconds } }
//   audio/<cueId>.mp3    music cues and effects                                cues.json   { dur, music: [...], sfx: [...] }
// Writes motion/out/<film>-narr.wav, <film>-sound.wav and, when motion/out/film-<v|h>.mp4 exists, <film>-<v|h>-narr.mp4
// and <film>-<v|h>-sound.mp4.
// The narrated mix does NOT pull the music down as a whole (the first film's narrated cut lost its music that way): only the
// band the voice lives in (1.2–4.5 kHz) is ducked by the voice, by up to ~6 dB; lows and highs dip ~2 dB at most. Levels are
// set per cue in cues.json so that under speech the voice sits ~6–7 LU above the music. Both mixes: −14 LUFS, −1.5 dBTP.
// Find where a generated cue actually swells (to place it on a picture beat): node motion/films/sound.mjs --envelope <file…>
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
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

const [film, ori] = args, S = join(HERE, film, 'sound'), T = join(OUT, film + '-sound-work'); mkdirSync(T, { recursive: true });
const place = json(join(S, 'place.json')), C = json(join(S, 'cues.json')), D = C.dur;

// 1. the narration track: each take trimmed of silence, evened toward −18.5 LUFS (70 % of the way, ±4 dB), laid at its time
const TRIM = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.10,areverse';
const ids = Object.keys(place.at).sort((a, b) => place.at[a] - place.at[b]), info = [];
for (const id of ids) {
  const out = join(T, id + '.wav');
  if (!existsSync(out)) ff(['-i', join(S, 'voice', id + '.mp3'), '-af', `${TRIM},aresample=48000`, '-ac', '2', '-ar', '48000', out]);
  const dur = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out], { encoding: 'utf8' }).trim();
  const e = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', out, '-af', 'ebur128=framelog=quiet', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const I = +e.slice(e.lastIndexOf('Summary')).match(/I:\s+(-?[\d.]+) LUFS/)[1];
  info.push({ id, at: place.at[id], dur, gain: Math.max(-4, Math.min(4, (-18.5 - I) * .7)) });
}
info.forEach((x, i) => { const n = info[i + 1], end = x.at + x.dur; if (n && end > n.at - .15) console.log(`OVERLAP ${x.id} ends ${end.toFixed(2)} > ${n.id} at ${n.at}`); });
// subtitles (YouTube search can't read words drawn into the picture): every spoken line at its spoken time, plus place.subs_extra
// (silent on-screen verses, { id: [from, to] }) → sound/ko.srt
{ const L = Object.fromEntries(json(join(HERE, film, 'script.json')).lines.map(l => [l.id, l])), ts = s => { const ms = Math.round(s * 1000);
    return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  const subs = [...info.map((x, i) => ({ id: x.id, a: x.at, b: Math.min(x.at + x.dur + .4, info[i + 1] ? info[i + 1].at - .05 : D) })),
    ...Object.entries(place.subs_extra || {}).map(([id, [a, b]]) => ({ id, a, b }))].sort((p, q) => p.a - q.a);
  const txt = id => { const l = L[id]; return (l.frags ? l.frags.join(' ') : (l.voice || l.text)).replace(/\s*\/\s*/g, '\n'); };
  writeFileSync(join(S, 'ko.srt'), subs.map((s, i) => `${i + 1}\n${ts(s.a)} --> ${ts(s.b)}\n${txt(s.id)}\n`).join('\n')); }
const voice = join(OUT, film + '-voice.wav');
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
  parts.push(`[${i}:a]aresample=48000,aformat=channel_layouts=stereo,${len}${fin}${fout}volume=${c.db}dB,adelay=${Math.round(c.at * 1000)}:all=1[c${i}]`);
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
for (const k of ['narr', 'sound']) {   // two-pass loudness
  const e = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', pre(k), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const m = JSON.parse(e.slice(e.lastIndexOf('{'), e.lastIndexOf('}') + 1)), wav = join(OUT, `${film}-${k}.wav`);
  ff(['-i', pre(k), '-af', `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`, '-ar', '48000', wav]);
  const vid = join(OUT, `film-${ori || 'v'}.mp4`);
  if (existsSync(vid)) { const mp4 = join(OUT, `${film}-${ori || 'v'}-${k}.mp4`); ff(['-i', vid, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', mp4]); console.log('→', mp4); }
  else console.log('→', wav);
}
