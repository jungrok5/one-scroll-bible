// Keep the prompts we sent to ElevenLabs in git (2026-11-03, 관리자: "영상은 코드가 있고 눈으로 보면 알 텐데 사운드는 없으니까
// 일레븐랩스에 요청한 프롬프트를 깃에도 남겨 둬서 다음 세션이 참고할 수 있게"). The picture is code; the sound is only mp3s — so
// every music / effect / voice request is archived as text next to the film: motion/films/<film>/sound/prompts.json
// (or motion/pilot/audio/prompts/<flow>.json for the first film).
//
//   node motion/films/sound-prompts.mjs logs <out.json> <flow_id,…> <session.jsonl …>
//        pull every ElevenLabs generate / add-node call for those flows out of Claude Code session logs
//        (~/.claude/projects/<project>/*.jsonl and their subagents/) — prompt, model, parameters, node, session ids, time
//   node motion/films/sound-prompts.mjs names <out.json> <names.txt|json …>
//        attach file names to the entries (lines "session_id name" / "node_id name", { id: name }, or { name: [session_id…] })
//   node motion/films/sound-prompts.mjs md <prompts.json>   → the same list as a readable table (<name>.md beside it)
//
// Prompts that were never in a local log (the first film's scene sound was made in cloud sessions, 2026-10-17/18) are read
// from the ElevenLabs flow itself (creative_get_flow_node → prompt) and written with the same fields.
import { createReadStream, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createInterface } from 'node:readline';


const [cmd, out, ...rest] = process.argv.slice(2);
const load = f => existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : { entries: [] };
const save = (f, j) => { j.entries.sort((a, b) => (a.time || '').localeCompare(b.time || '')); writeFileSync(f, JSON.stringify(j, null, 1) + '\n'); };

if (cmd === 'logs') {
  const ran = {}, flows = new Set(rest[0].split(',')), files = rest.slice(1), arch = load(out), seen = new Set(arch.entries.map(e => e.use));
  for (const f of files) {
    const pend = new Map(), runs = new Set(), rl = createInterface({ input: createReadStream(f), crlfDelay: Infinity });
    for await (const line of rl) {
      if (!line.includes('creative_') && !line.includes('tool_result')) continue; let j; try { j = JSON.parse(line); } catch { continue; }
      for (const b of j.message?.content || []) {
        if (b.type === 'tool_use' && /creative_(generate_\w+|add_flow_node|update_node|generate_in_flow)$/.test(b.name) && flows.has(b.input?.flow_id) && !seen.has(b.id)) {
          const { context, flow_id, prompt, model_id, label, node_type, model_parameters, ...params } = b.input; pend.set(b.id, { use: b.id, time: j.timestamp, flow: flow_id, tool: b.name.replace(/^.*__/, '') + (node_type ? ':' + node_type : ''), model: model_id || '', label: label || '', prompt: prompt ?? '', params: { ...params, ...(model_parameters || {}) }, why: context || '' }); }
        if (b.type === 'tool_use' && /creative_run_flow_nodes$/.test(b.name)) runs.add(b.id);
        if (b.type === 'tool_result' && runs.has(b.tool_use_id)) { let r = b.content; if (Array.isArray(r)) r = r.map(x => x.text || '').join(''); try { r = JSON.parse(r); } catch { r = {}; } for (const x of r.results || []) if (x.node_id && x.session_id) (ran[x.node_id] ||= []).push(x.session_id); }
        if (b.type === 'tool_result' && pend.has(b.tool_use_id)) {
          const e = pend.get(b.tool_use_id); pend.delete(b.tool_use_id); let r = b.content; if (Array.isArray(r)) r = r.map(x => x.text || '').join(''); try { r = JSON.parse(r); } catch { r = {}; }
          e.node = r.node_id || (r.node_ids || [])[0] || (r.results || [])[0]?.node_id || ''; e.sessions = r.session_ids || (r.results || []).map(x => x.session_id).filter(Boolean);
          if (!r.flow_id && !e.node) continue;   // the call failed — keep only what ran
          arch.entries.push(e); seen.add(e.use); }
      }
    }
  }
  for (const e of arch.entries) if (ran[e.node]) e.sessions = [...new Set([...(e.sessions || []), ...ran[e.node]])];
  save(out, arch); console.log(out, arch.entries.length, 'entries');
} else if (cmd === 'names') {
  const arch = load(out), map = {};
  for (const f of rest) { const s = readFileSync(f, 'utf8'); if (f.endsWith('.json')) for (const [k, v] of Object.entries(JSON.parse(s))) { if (Array.isArray(v)) v.forEach(x => map[x] = k); else map[k] = v; } else for (const l of s.split(/\r?\n/)) { const [k, v] = l.trim().split(/\s+/); if (k && v) map[k] = v; } }
  let n = 0; for (const e of arch.entries) { const nm = map[e.node] || (e.sessions || []).map(s => map[s]).find(Boolean); if (nm) { e.name = nm.replace(/_b$/, ''); n++; } }
  save(out, arch); console.log('named', n, 'of', arch.entries.length);
} else if (cmd === 'md') {
  const arch = load(out), L = [`# ElevenLabs prompts — ${arch.title || ''}`, '', arch.about || '', '', '| name | kind | model | len | prompt |', '|---|---|---|---|---|'];
  for (const e of arch.entries) L.push(`| ${e.name || e.label || e.node} | ${e.tool.replace(/^creative_(generate_)?/, '')} | ${e.model} | ${e.params?.duration_seconds ?? (e.params?.music_length_ms ? e.params.music_length_ms / 1000 : '')} | ${String(e.prompt).replace(/\|/g, '/').replace(/\n/g, ' ')} |`);
  const md = out.replace(/\.json$/, '.md'); writeFileSync(md, L.join('\n') + '\n'); console.log(md);
} else console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter(l => l.startsWith('//')).join('\n'));
