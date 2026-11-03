// Shared helpers for the page extractors (prepended to each extractor by collect.mjs `script`): the page's visible text as
// trimmed lines, Korean number parsing (3.1만, 1.2천, 32,942, 98.4%), the value after a label, and "label → % pairs" sections
// as YouTube Studio / Instagram / GA4 lay them out. Every extractor returns one plain JSON object — no interpretation.
const L = document.body.innerText.split('\n').map(s => s.replace(/\t/g, ' ').trim()).filter(Boolean);
const num = s => { if (s == null) return null; s = String(s).replace(/,/g, '').replace(/^\+/, '').trim(); const m = s.match(/^(-?[\d.]+)\s*(만|천|K|M)?/); if (!m) return null;
  return +m[1] * ({ '만': 1e4, '천': 1e3, K: 1e3, M: 1e6 }[m[2]] || 1); };
const pctv = s => { const m = String(s || '').match(/(-?[\d.]+)\s*%/); return m ? +(+m[1] / 100).toFixed(4) : null; };
const isNum = s => /^[+-]?[\d.,]+\s*(만|천)?$/.test(s || '');
const after = (label, from = 0) => { for (let i = from; i < L.length; i++) if (L[i] === label) { for (let k = 1; k <= 3; k++) if (isNum(L[i + k]) || /%$/.test(L[i + k] || '') || /^\d+:\d\d$/.test(L[i + k] || '')) return L[i + k]; } return null; };
const idx = (label, from = 0) => L.indexOf(label, from);
// pairs after a section title: [name, value] until '더보기' (skips header lines that are not followed by a value)
const pairs = (label, from = 0) => { const i = idx(label, from); if (i < 0) return {}; const o = {};
  for (let k = i + 1; k < L.length && L[k] !== '더보기'; k++) { const v = L[k + 1]; if (/%$/.test(v || '') && !/%$/.test(L[k])) { o[L[k]] = pctv(v); k++; } } return o; };
