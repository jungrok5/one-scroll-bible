# th — native review (2026-10-23)

Edition: ฉบับมาตรฐาน (THSV11, YouVersion 174; the site pack tags it "(ฉบับไทย)"). Reviewer: a native-level review agent (report
only), all 42 contact sheets (CI, Noto Thai) looked at; every Scripture line checked against fetch-verse 174 — all verbatim.

| Level | Finding | Resolution |
|---|---|---|
| MED | YouTube "watch" line said "film page" but links the home page | **Fixed** (watch lines of every language) |
| MED | YouTube blurb kept "drawn in your browser" (Thai has no sentence marks) | **Fixed**: `blurb` in `motion/youtube/lang/th.json` |
| MED | church Acts 1:8 — “… alone on a line (portrait) | **Fixed**: explicit `\n` |
| MED | 성취 = "ความสำเร็จ" reads as "success" (the mirror's 성공) | **Fixed** in film **and** site pack (`thread.flow`, `epochs[10].tag`) → การสำเร็จเป็นจริง |
| MED (pack-level, deferred) | version tag "(ฉบับไทย)" is generic; edition is ฉบับมาตรฐาน | kept, per ruling — a site-wide change (verify the publisher notice first) |
| LOW | Gen 3:8 shorter fragment; invite prayer split; ทรงส่ง / ทรงให้; ผู้เสด็จมาในเชื้อสายของดาวิด; ความ\nชอบธรรม; "—" for ":" | **Fixed** |
| LOW | church ประทาน, พระบัญญัติ, เชื้อสายของหญิง | left — would change site prose; judges ทรงส่ง now differs from site `love[4]` by ทรง |

Verdict: publishable (no open HIGH/MED in the film).
