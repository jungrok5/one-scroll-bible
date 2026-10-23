// Re-open already-rendered Shorts the way motion/assemble.py --shorts now makes them (motion/youtube/shorts-open.json):
// start `skip` s into the scene (past the fade-in from black / the rise scene's silent tomb) and limit the peaks.
// Works on the release files, so no scene has to be rendered again.
//   node motion/youtube/shorts-retrim.mjs <lang…> [--jobs 3] [--upload]
//     reads  motion/out/release/shorts-<lang>-NN-<scene>.mp4   (gh release download youtube-v1 -p 'shorts-<lang>-*' -D motion/out/release)
//     writes motion/out/release-open/shorts-<lang>-NN-<scene>.mp4, tagged "osb-open" (a tagged file is never trimmed twice)
//     --upload  replaces those assets in the youtube-v1 release (gh release upload --clobber) and copies them over the originals
// Only for Shorts not yet uploaded to YouTube — an uploaded video cannot have its file swapped.
import { execFile, execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url)), M = join(HERE, '..');
const SRC = join(M, 'out', 'release'), DST = join(M, 'out', 'release-open');
const OPEN = JSON.parse(readFileSync(join(HERE, 'shorts-open.json'), 'utf8'));
const args = process.argv.slice(2), flag = n => args.includes('--' + n), val = (n, d) => (args.indexOf('--' + n) >= 0 ? args[args.indexOf('--' + n) + 1] : d);
const langs = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--jobs');
if (!langs.length) { console.log('usage: node motion/youtube/shorts-retrim.mjs <lang…> [--jobs 3] [--upload]'); process.exit(1); }
mkdirSync(DST, { recursive: true });

const run = (cmd, a) => new Promise((res, rej) => execFile(cmd, a, { maxBuffer: 64 << 20 }, (e, so, se) => e ? rej(new Error(se || e.message)) : res(so)));
const tagged = f => /osb-open/.test(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format_tags=comment', '-of', 'default=nw=1:nk=1', f]).toString());
const dur = f => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', f]).toString();
// same video settings as assemble.py ENC['h264'] (closed GOP, 2 s keyframes, no B-frames)
const ENC = ['-c:v', 'libx264', '-preset', 'faster', '-crf', '18', '-maxrate', '12M', '-bufsize', '24M', '-g', '60', '-keyint_min', '60', '-sc_threshold', '0', '-bf', '0', '-pix_fmt', 'yuv420p'];

const jobs = [];
for (const L of langs) {
  const files = readdirSync(SRC).filter(f => f.startsWith(`shorts-${L}-`) && /^shorts-.+-\d\d-[a-z]+\.mp4$/.test(f) && f.slice(7 + L.length + 1).match(/^\d\d-/));
  if (files.length !== 21) { console.error(`${L}: ${files.length} Shorts in ${SRC} (want 21) — gh release download youtube-v1 -p 'shorts-${L}-*' -D motion/out/release`); process.exit(1); }
  for (const f of files) jobs.push({ L, f, scene: f.replace(/\.mp4$/, '').split('-').pop() });
}
let done = 0, i = 0; const fails = [];
await Promise.all(Array.from({ length: +val('jobs', 3) }, async () => {
  while (i < jobs.length) {
    const j = jobs[i++], src = join(SRC, j.f), out = join(DST, j.f);
    try {
      if (tagged(src)) { copyFileSync(src, out); done++; continue; }   // already opened (a re-run)
      const skip = OPEN.scenes[j.scene] ?? OPEN.default, d = dur(src) - skip;
      const vid = skip === 0 ? ['-c:v', 'copy'] : ENC;
      await run('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(skip), '-i', src, '-map', '0:v', '-map', '0:a', ...vid,
        '-af', `alimiter=limit=${OPEN.limit}:level=false,afade=t=in:d=0.05,afade=t=out:st=${(d - 0.03).toFixed(3)}:d=0.03`,
        '-c:a', 'aac', '-b:a', '192k', '-metadata', 'comment=osb-upload osb-open', '-movflags', '+faststart', out]);
      done++; if (done % 10 === 0) console.log(`${done}/${jobs.length}`);
    } catch (e) { fails.push(j.f + ': ' + e.message.slice(0, 200)); }
  }
}));
console.log(`→ ${DST}: ${done}/${jobs.length}` + (fails.length ? `\nFAILED:\n${fails.join('\n')}` : ''));
if (fails.length) process.exit(1);

if (flag('upload')) {
  for (const L of langs) {
    const fs = jobs.filter(j => j.L === L).map(j => join(DST, j.f));
    execFileSync('gh', ['release', 'upload', 'youtube-v1', ...fs, '--clobber', '-R', 'jungrok5/one-scroll-bible'], { stdio: 'inherit' });
    for (const f of fs) copyFileSync(f, join(SRC, f.split(/[\\/]/).pop()));
    console.log(`${L}: release youtube-v1 updated (21 Shorts) and motion/out/release replaced`);
  }
}
