# tl — native review (2026-10-23)

Edition: Magandang Balita Biblia (MBB, YouVersion 399). Reviewer: a native-level review agent (report only), all 42 contact
sheets looked at; every Scripture line checked against fetch-verse 399 — all verbatim.

| Level | Finding | Resolution |
|---|---|---|
| HIGH | evidence ~34.8 s — "halos 1,000 taon ang lumipas" collided with the red label | **Fixed**: "mga 1,000 taon pagkaraan" / "Halos titik-sa-titik" (stills checked) |
| HIGH | evidence ~25.2 s — inscription label wrapped and was overprinted | **Fixed**: "Nakaukit ang pangalan niya" |
| MED | Rev 21:4 third line lost "Wala nang" | **Fixed**: "“Wala nang … dalamhati, pagtangis, at paghihirap …”" (+ split keys) |
| MED | 2 Sam 7:16 shrunk very small | **Fixed**: rebalanced over four lines (joined text = MBB) |
| MED | renewal line crowded the chapter label | **Fixed**: `\n` |
| MED | gospel sun-ring glyph unreadable | **Fixed**: "Dumating na\nang takdang panahon" (gospel `say()` now honours `\n`) |
| MED | `_ui.sub` grammar ("ang nagsasalaysay") | **Fixed** |
| MED | YouTube "watch" said "film page" | **Fixed** |
| MED (site) | `i18n/tl.json` 1 Kings 12:19 "naghimagsi" | **Fixed** → naghimagsik (validate passes) |
| LOW | Gen 3:8 portrait rebalance; tag "kasaysayan ng pagtubos" | **Fixed** |
| LOW | kept (reviewer agreed): "…Kaharian ng Israel", "PANGINOONG Yahweh", Deut 1:31, MBB wording; optional Paskwa / nagpapatay / Luke 23:45 left for a site-wide decision | — |

Verdict: publishable (no open HIGH/MED).
