// The tools credit line ("scenes drawn in code; voice, music and sound effects made with ElevenLabs") stays off every
// video description and post (owner 2026-11-05: too long). Every language's version names ElevenLabs, so the rule is one:
// drop each sentence that mentions it, then any line left empty. The site's own footer (pilot i18n ui.legal) keeps it.
//   import { dropCredit, hasCredit } from './credit.mjs'
//   node motion/youtube/credit.mjs "<text>"   → the text without the credit
export const hasCredit = t => /ElevenLabs/.test(t || '');
// a sentence = the run after the last sentence end (or a closing bracket, which stays) up to its own end, within one line
// ("4.0" is not a sentence end)
const SENT = /(?:[^.。।۔!?！？\n)）」]|\.(?=\d))*ElevenLabs[^.。।۔!?！？\n]*(?:[.。।۔!?！？]|$)/g;
// scripts with no full stop: where the credit sentence starts (th: "ภาพในทุกฉากวาดขึ้นด้วยโค้ด ส่วนดนตรี… ElevenLabs")
const START = [/\s*ภาพในทุกฉาก[^\n]*?ElevenLabs[^\n]*?(?=\s*$)/g];
export function dropCredit(t) {
  if (!hasCredit(t)) return t;
  return t.split('\n').map(l => { if (!hasCredit(l)) return l; const s = START.reduce((a, r) => a.replace(r, ''), l).replace(SENT, '').replace(/[ \t]+$/, '').replace(/^[ \t]+/, ''); return s || null; })
    .filter(l => l !== null).join('\n').replace(/\n{3,}/g, '\n\n').replace(/\s+$/, '').replace(/^\s+/, '');
}
if (process.argv[1]?.endsWith('credit.mjs') && process.argv[2]) console.log(dropCredit(process.argv[2]));
