# 「침묵의 400년」 captions in 16 more languages — translation + native review (2026-11-01)

Owner decision: the film gets captions in every language the first film has (captions only — no voice). Translation: one agent
per two languages following `motion/films/silence400/i18n/CAPTIONS-BRIEF.md`; review: a separate agent per language following
`CAPTIONS-REVIEW.md` (report only). Scripture: every quote checked with `check-quotes.mjs` (fetch-verse, YouVersion = the site
pack's edition) — all 12 quote lines pass in all 16 languages after the fixes below.

| Code | Edition (YV) | Verdict | Fixed after review |
|---|---|---|---|
| zh-Hans | 和合本 (48) | deployable, 0 HIGH/MED | 09·26a 希腊文→希腊语 (spoken), 03 wording, 24b line break |
| zh-Hant | 和合本 (46) | deployable | 09·26a 希臘文→希臘語, 03 wording, 24b line break |
| ja | 新共同訳 (1819) — Malachi 3:23–24 (`usfm`) | deployable | 10 その言葉→その言語, 25c anchor, 26a その道→その道々 (not "the Way") |
| fr | LSG (93) | deployable | 03 "jusqu'au livre suivant", 07 s'élever (Dan 2:39), 09 communiquer, 25c "environ" |
| de | Luther 1912 (51) — Malachi 4:5–6 in this edition | deployable | 03 clarity, 06 "war nicht untätig", 21 "Der Mann, der…", 26a Straßen |
| ru | Синодальный (400) | deployable | 03 "до Нового Завета … между Заветами", 25c "до Его прихода" |
| ar | Van Dyck (13) | **MED fixed**: 27 «في انتظارك» reads "waiting for you" → «وأنت تنتظر» | — |
| fa | ترجمه قدیم (136) — Mal 4:6 missing on YouVersion → `src: ebible:pesOPV` (same 1895 text, verified) | deployable | 22a fragment no longer starts with «تا», 21 «همان که باید چون الیاس بیاید», 27 wording |
| hi | हिन्दी बाइबल (1683) | deployable | 01 keeps the verb (… फेरेगा;) + explicit `voice`, 03, 25c "उनसे … पहले" |
| bn | O.V. (1681) | **MED fixed**: 01 lost the verb ফিরাইবে → kept + explicit `voice` | 14b subject, 25c আগেই |
| id | TB (306) — 25a keeps small-cap "Tuhan ALLAH … TUHAN" (check-quotes now ignores case) | deployable | 26a line break |
| vi | Truyền Thống 1925 (193) | deployable | 23 "Đấng đã đến", 25/26a line breaks |
| th | ฉบับมาตรฐาน (174) | deployable | 23 "ผู้ได้เสด็จมาแล้ว", 24b "คัมภีร์อิสยาห์" (Luke 4:17) |
| tl | MBB (399) | deployable | 01 no false `…` (MBB skips nothing) + explicit `voice`, 03, 26a |
| sw | SRUV (1818) | deployable | 25c "kabla yake", 26a line break |
| ta | O.V. BSI (339) — Gal 4:4 = GAL.4.4-5 in this edition | deployable | 15 தேவவசனம், 25c anchor to Jesus' time |

**Added the same evening** (owner's fixed caption list, films README §4 step 9):

| Code | Edition (YV) | Verdict | Fixed after review |
|---|---|---|---|
| it | Nuova Riveduta (122) | deployable, 0 HIGH/MED | 10 pagani → stranieri (NR's word for Gentiles), 25c·26a line breaks |
| pl | Biblia Gdańska (132) | **MED fixed**: 25c «obietnica sprzed około 700 lat» reads "700 years ago from today" → «dana około 700 lat wcześniej» | Gdańska spelling kept (Dziści, Elijasz, Ewangeliję) |
| tr | Kutsal Kitap (170) | deployable | 08 «sözünü yanlarında götürdü», 24b «700 yılı aşkın bir süre önce»; Grekçe kept (the Bible's word, Acts 21:37) |

**Migrant languages in Korea** (owner decision the same night — the list is now 27):

| Code | Edition (YV) | Verdict | Fixed after review |
|---|---|---|---|
| uz | OʻzbMK (1939) | deployable | 14b «Rim oʻz imperiyasining»; 25a "U meni tanlagan" (chose me) is the edition's own word — Luke 4:18 matches |
| ne | NNRV (1483) | deployable | 07 «राज्यहरूलाई जनाउँथे», 07b «क्रमैसँग» |
| km | គខប (85) | deployable | 06a restores «ហើយ» (dropped at a break without …), 23 wording, 25 line break; 01 is the edition's positive wording, kept |
| mn | АБ2004 (369) | deployable | 25c «Есүсийн үеэс»; баптисм хүртээгч Иохан (Mat 3:1) kept — the site pack's «Баптист Иохан» differs |
| my | Judson (386) | **MED fixed**: 25c read as "the one who promised" → God named as the promiser | 25b line break; Gal 4:4-5 (Judson puts "sent his Son" in v. 5); 01 `voice` = the curse clause |

Line 01 in tr, uz, ne now carries a `voice` (the clause the narrator reads), like hi/bn/tl — without it the caption began with a lone verb
("döndürecek."). The tr track was uploaded before this fix and is replaced after the API quota reset.

Kept on purpose (reviewer notes): bn 19a "এলির ভাববাদীকে" is the edition's own (probable) typo — Scripture stays as printed;
site-pack terms where the quoted verses don't contain the word (sw Kiyunani/Roma, id sinagoge, vi Chúa Giê-xu, hi आराधनालय
follows the Bible — the site pack's सभा-घर is the outlier). Tooling added: `check-quotes.mjs` ignores case and supports a per-line
`src`; a line's `voice` may carry `/` breaks.
