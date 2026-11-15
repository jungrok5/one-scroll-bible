// What a language's narrator says (and its caption shows) for one line — shared by sound.mjs, captions-on-ko.mjs,
// check-voice.mjs and voice-lines.mjs so the four never disagree.
//   k = the Korean script line, p = that language's line ({ text, voice? })
// A language's own `voice` wins. Otherwise its `text`, with the '…' rule: when the Korean line shows context and speaks
// only the part after the last '…' (k.voice = that tail), the language speaks only its tail too. When the Korean voice is
// the whole text ('…' only marks words left out of the verse at the start or end), the whole text is kept, minus those
// edge marks — 2026-11-16 「그리스도」 Q9 (Acts 10:38, text ends in '…') lost the whole Khmer caption to the tail rule.
const bare = s => s.replace(/[…\/\s.,;:!?'"“”‘’«»—–-]/g, '');
export function said(k, p) {
  let t = p.voice || p.text;
  if (!k?.voice || !k.text.includes('…') || p.voice) return t;
  if (bare(k.voice) === bare(k.text)) return t.replace(/^\s*…\s*|\s*…\s*$/g, '').trim();
  return t.slice(t.lastIndexOf('…') + 1).trim();
}
// What the caption shows: the same words as said(), but keeping the on-screen text's '/' line breaks when the spoken
// version only drops them (a `voice` has no '/', so a whole verse became one 100+ character caption line —
// 2026-11-16 「그리스도」 Q9 in ko.vtt and 20 languages). p omitted = the Korean line itself.
export function shown(k, p) {
  const t = p ? said(k, p) : (k.voice || k.text), tx = (p || k).text.replace(/^\s*…\s*|\s*…\s*$/g, '').trim();
  return bare(t) === bare(tx) ? tx : t;
}
