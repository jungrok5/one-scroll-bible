// When the Workflow tool is off in a session: run a saved workflow script with a stub agent() and write out the exact briefs it
// would send (one .md per reviewer, schema appended), so subagents get the same reviewers, the same brief and the same output shape.
// The main session then gives each subagent its brief file and assembles { …, reviewers: [{ key, who, …answer }] } as the workflow would.
//   node motion/films/pipeline/wf-prompts.mjs <workflow.js> <args.json> <out-dir>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const [wf, argsFile, outDir] = process.argv.slice(2);
if (!wf || !argsFile || !outDir) { console.error('usage: wf-prompts.mjs <workflow.js> <args.json> <out-dir>'); process.exit(1); }
const src = readFileSync(wf, 'utf8').replace(/^export const meta/m, 'const meta'), got = [];
const agent = async (prompt, o) => { got.push({ label: o.label, prompt, schema: o.schema }); return { scenes: [], parts: [], fixes: [], issues: [], summary: '' }; };
const parallel = fs => Promise.all(fs.map(f => f())), phase = () => {};
const run = new (Object.getPrototypeOf(async function () {}).constructor)('args', 'agent', 'parallel', 'phase', src);
await run(JSON.parse(readFileSync(argsFile, 'utf8')), agent, parallel, phase);
mkdirSync(outDir, { recursive: true });
for (const g of got) { const f = join(outDir, `brief-${g.label.split(':').pop()}.md`);
  writeFileSync(f, `${g.prompt}\n\n## 답 형식\n마지막 답은 아래 JSON 스키마를 따르는 JSON 객체 하나만(코드 블록 없이). 다른 글은 쓰지 않는다.\n${JSON.stringify(g.schema)}\n`); console.log(f); }
