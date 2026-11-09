// The other half of wf-prompts.mjs: after each subagent saved its answer as <answers-dir>/out-<key>.json, run the same saved
// workflow again with a stub agent() that returns those answers — the workflow's own return value is the assembled result, in
// exactly the shape the Workflow tool would have produced ({ film, at, reviewers: [{ key, who, …answer }] }).
//   node motion/films/pipeline/wf-assemble.mjs <workflow.js> <args.json> <answers-dir> <out.json> [--syllables N]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const argv = process.argv.slice(2), si = argv.indexOf('--syllables'), syl = si > -1 ? +argv.splice(si, 2)[1] : null;
const [wf, argsFile, dir, out] = argv;
if (!wf || !argsFile || !dir || !out) { console.error('usage: wf-assemble.mjs <workflow.js> <args.json> <answers-dir> <out.json> [--syllables N]'); process.exit(1); }
const src = readFileSync(wf, 'utf8').replace(/^export const meta/m, 'const meta'), missing = [];
const agent = async (prompt, o) => { const key = o.label.split(':').pop(), f = join(dir, `out-${key}.json`);
  if (!existsSync(f)) { missing.push(key); return {}; }
  const t = readFileSync(f, 'utf8').trim().replace(/^```(json)?\s*|\s*```$/g, ''); return JSON.parse(t); };
const parallel = fs => Promise.all(fs.map(f => f())), phase = () => {};
const run = new (Object.getPrototypeOf(async function () {}).constructor)('args', 'agent', 'parallel', 'phase', src);
const A = JSON.parse(readFileSync(argsFile, 'utf8'));
if (A && typeof A === 'object' && !A.at) A.at = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);   // workflows cannot read the date
const res = await run(A, agent, parallel, phase);
if (missing.length) { console.error('답 없음: ' + missing.map(k => `out-${k}.json`).join(' ')); process.exit(1); }
if (syl != null) res.syllables = syl;
writeFileSync(out, JSON.stringify(res, null, 1) + '\n');
console.log(`${out} — 리뷰어 ${res.reviewers?.length ?? 0}명${syl != null ? ` · ${syl}음절` : ''}`);
