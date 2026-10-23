# hi — native review (2026-10-23)

Edition: हिन्दी बाइबल (IRVHIN, YouVersion 1683). Reviewer: a native-level review agent (report only), all 42 contact sheets
(made on CI with Noto Devanagari) looked at; every Scripture line checked against fetch-verse 1683 — all verbatim.

| Level | Finding | Resolution |
|---|---|---|
| HIGH | Map and heading labels (wilderness, kingdom) drawn with letter-spacing: Devanagari conjuncts split (भूमध्य → भू म ध् य), headline bar broken | **Fixed in code**: `lib.js` turns tracking off for joined/abugida scripts |
| MED | invite — John 1:12 dropped "who believe in his name" | **Fixed**: two balanced keys with the full verse (ZWJs kept) |
| MED | YouTube blurb kept "drawn in your browser" (Hindi ends sentences with ।) | **Fixed** in `manifest.mjs` |
| LOW | fall seal stacked वा / चा | **Fixed in code**: only Han/Hangul/Kana stack |
| LOW | exile "बाबुल" vs the quoted Bible's "बेबीलोन" | **Fixed** (film) — site pack still says बाबुल (site follow-up) |
| LOW | advent agreement (promises, feminine) | **Fixed**: "सब प्रतिज्ञाएँ … पूरी होती हैं" |
| LOW | tags | added "ईसाई धर्म" |
| LOW | kept as is (reviewer agreed): अविभाजित राज्य (07), भूमध्य सागर, मसीही विश्वास, drop-cap split, subjectless love[] lines, नहेमायाह | — |

Site-pack notes (not the film): epoch 5 "संयुक्त राज्य"; Col 1:13 / Rom 3:20 wording vs the Bible; "पीलातुस"; `s['ui.legal']` still English.
Verdict: publishable after the fixes above (no open HIGH/MED).
