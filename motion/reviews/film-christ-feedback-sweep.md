# 「그리스도」 — feedback sweep (stage 13, rule `chat-feedback-sweep`)

Report only. Nothing in rules.json, stages.mjs, tasks, README or review.json was edited.
Swept on 2026-11-16:
- `review.json` `feedback_log` (59 entries)
- `process_changes` (9), `decisions`, `decisions_log`, `intl_progress`, `budget_exception`, `music_cues_exception`
- `upload.md`
- the session transcript, streamed for user messages only: 377 Korean messages, of which those from 2026-11-09 onward belong to this film

Checked against:
- `pipeline/rules.json` (45 rules)
- `targets.json`
- `tasks/*.md`
- `insights.json`
- `README.md`
- `FORMAT-NEXT.md`
- `stages.mjs` gates

Transcript times are UTC in the file; KST is used below.

**Counts (85 rows: 59 feedback_log + 16 transcript + 8 process_changes + 2 other):**

| status | rows |
|---|---|
| moved | 47 |
| film-only | 21 |
| to-move | 17 |

The counts match the JSON array at the end. Rows that are part moved, part to-move are counted as follows:
- #13 and P2 count as to-move.
- P3 and P5 count as moved; their outstanding parts are T11 and T4.

The 17 to-move rows group into 13 proposals (T1 to T13). Several rows share a proposal (#32/#37/#38 → T1; #13/#36/#39 → T2; #20/#21/P6 → T10).

## Table

`said` is shortened. Rule ids refer to `pipeline/rules.json`.

### A. feedback_log

| # | who | said (short) | status | where / proposed |
|---|---|---|---|---|
| 1 | 관리자 | 원고 좋아 진행해줘 (1차 리뷰 수정안) | film-only | script content of round 1 |
| 2 | 관리자 | 3차 수정안 + 한 번 더 리뷰, 미달이면 굳히기 | moved | freeze: tasks/review.md:7–8 · retime: targets `script.draft_line_pace_max`/`end_card_min_s`, stages.mjs:72–74 (`script-retime.mjs`) |
| 3 | 관리자 | 제목이 썸네일에? 후킹 / 데이터 없어? 공정에도 반영 | moved | rules.json:title-thumb-evidence · tasks/sheet.md:4 · sheet gate |
| 4 | 관리자 | 제목·썸네일 추천안 그대로 | film-only | this film's title/thumbs choice |
| 5 | 관리자 | 프레임으로 보면 이상한데 — 이상 확인 단계 있어? → ㅇㅇ | moved | rules.json:frame-anomaly · tasks/anomaly.md · gate `anomaly` |
| 6 | 관리자 | Mp4줘야지 / 기름을 부어 → 이미 적혀 있었습니다, 중간에 뭔가 없어졌나 | moved | mp4: tasks/picture.md:12 (720p SendUserFile) · gap: rules.json:frame-anomaly, rules.json:shots |
| 7 | 관리자 | 에이전트 리뷰 수정은 확인받고 / 두루마리 양쪽이 쇠판 / 제비뽑기도 코드? | moved | rules.json:confirm-agent-fixes (scroll part = film-only, see 8) |
| 8 | 관리자 | 감긴 부분 철판·평면 — 두루마리는 원통형 | film-only | one object in `lamp-scrolls.js` (film file, not the lamplit kit) |
| 9 | 관리자 | 군인 장면은 이전이 더 나음 | film-only | version choice for one scene (general "keep what works" already in rules.json:redo-is-fine) |
| 10 | 관리자 | (군인 세 판 중) B | film-only | pick |
| 11 | 관리자 | 이어서 2 3 5 6 가자 | film-only | go-ahead |
| 12 | 관리자 | 일단 다 반영하고 다시 볼게 | film-only | go-ahead |
| 13 | 관리자 | 뿔에 시간 너무 씀 / 화풍 반복 지루 / 소실점으로 쪼르르 이상 | moved + to-move | horn: rules.json:symbol-must-read, README §9:343 · repetition: rules.json:look-per-scene · vanishing-point camera: **to-move T2** |
| 14 | 관리자 | 단순히 화풍 동일이 문제 아님, 구성 먼저 · motion-skills 다 확인 / 마지막에 대화 피드백 정리 스텝 | moved | rules.json:look-per-scene · rules.json:chat-feedback-sweep · tasks/site.md:5 · gate `sweep` |
| 15 | 관리자 | 새 화풍 적합한 거 없었어? → 시아노타입 | film-only | look pick for part 3 (later replaced) |
| 16 | 관리자 | 호퍼가 약간 공포영화 느낌 | **to-move** | **T3** rejected-looks (also said 2026-11-06 for 「메시아」: "호퍼풍 약간 호러틱해") — nowhere in pipeline/README |
| 17 | 관리자 | 페르메이르풍 이 영상에 제일 많던 풍 아니야? | **to-move** | **T4** amend look-per-scene: check the whole film's material share before picking (process_changes 11-12 says it, rules don't) |
| 18 | 관리자 | 화면 구성을 이해 못 함 — 동굴 입구에 왜 모여 있나 | moved | rules.json:look-per-scene (구성 먼저) · rules.json:scene-reads-without-bible |
| 19 | 관리자 | 세 기름 → 그리스도 실루엣 덩어리 (MAJOR 승인) | moved | tasks/anomaly.md:16 (덩어리 같은 몸) |
| 20 | 관리자 | 베드로 손이 장갑처럼 / 십자가 그림자가 글자 뒤로 | moved | tasks/anomaly.md:16 (마네킹 같은 손), :18 (글자) · hand montage → **T10** |
| 21 | 관리자 | 사람 몸이 머리에 비해 너무 큼, 의도인가 | **to-move** | **T10** add head:body proportion to the anomaly checklist (same-person-same-shape is already rules.json:figures-gender-legible) |
| 22 | 관리자 | 요단 — 그림자만 먼저 사라짐 | moved | tasks/anomaly.md:22 |
| 23 | 관리자 | 뿔 장면 없어도 되지 않나? 의도? | moved | rules.json:symbol-must-read · README §9:343 (덜고 공들인다) |
| 24 | 관리자 | 엘리사는 왜 망또? 망또 퀄리티 낮음 | film-only | content/label of one scene |
| 25 | 관리자 | 성문 그림자 덜그덕 · 병사·깃발 아웃라인 어색 | moved | tasks/anomaly.md:22 (그림자 튐), :19 (일러스트 같은 컷) · rules.json:cinematic |
| 26 | 관리자 | 그림자가 쭉 길어지던데 뭘 표현? | moved | rules.json:symbol-must-read |
| 27 | 관리자 | 무덤 앞 돌 씬, 내용 전달 안 됨 | moved | rules.json:symbol-must-read (본문이 가리키는 구체적인 것) |
| 28 | 관리자 | 기름붓듯 → 나무에 달았다로 이어 읽힘 | moved | rules.json:symbol-must-read (연결어미 인용) |
| 29 | 관리자 | 머리가 길어 여자처럼 보임 | moved | rules.json:figures-gender-legible · tasks/anomaly.md:21 |
| 30 | 관리자 | 병사·깃발이 성벽 밖 공중에 | moved | tasks/anomaly.md:17 (공중에 떠 있음) |
| 31 | 관리자 | 들판에서 다들 가만히 — 걷는 장면? 의도? | moved | rules.json:shots · rules.json:one-event-per-verse · tasks/anomaly.md:19 (screen과 다른 그림) |
| 32 | 관리자 | 십자가 장면 빛이 엉뚱한 들판을 비춤 — 의도? | **to-move** | **T1** light-on-subject |
| 33 | 관리자 | 세 직분 장면 심심함 | film-only | scene redesign; the general "boring" bar is already rules.json:one-event-per-verse + targets `look` |
| 34 | 관리자 | 고넬료 집 — 성경 모르면 이해 어려움, 구절로 메우지 말 것 | moved | rules.json:scene-reads-without-bible |
| 35 | 관리자 | 엠마오 억지 — 400년 끝처럼 | moved | rules.json:ending-hook · gate `ending` (message kind) |
| 36 | 관리자 | 첫 시작 카메라 워킹이 과격 | **to-move** | **T2** gentle camera + fx |
| 37 | 관리자 | 비둘기가 예수님 오른쪽으로 — 의도? | **to-move** | **T1** (the dove-as-light part is already rules.json:depict-christ-restraint (6)) |
| 38 | 관리자 | 세 직분 빛이 십자가 우측 — 의도? | **to-move** | **T1** |
| 39 | 관리자 | 베드로 장면 빛 파티클 고급지게 | **to-move** | **T2** (particles) |
| 40 | 아내 | N06 '그 왕을' → '메시야를' | film-only | wording |
| 41 | 아내 | N07 '예수님이 오신 후 어느 날,' | film-only | wording (general idea of placing the viewer in the Bible is README §1:49) |
| 42 | 관리자 | 원고 훑기 1·2·3 (N17·엘리사 표기·N11) | film-only | wording (dash in label → see E5/T5) |
| 43 | 관리자 | 끝에 '주는 그리스도시요…' 넣기 | film-only | ending content |
| 44 | 관리자 | 19~21초 음이 줄어듦, 밑줄 소리 어색 | moved | rules.json:title-no-duck · targets `sound.ducks_note` |
| 45 | 관리자 | 숨 참고 배경 줄지 않게, 400년 같은 구간 확인 | moved | rules.json:title-no-duck |
| 46 | 관리자 | 선 그을 때는 첫 영상 펜 소리로 | moved | rules.json:title-no-duck (opening__s2) · SOUND.md |
| 47 | 아내 | '그리 마옵소서' 베드로가 왜 바뀌었는지 없음 | **to-move** | **T7** change-needs-cause |
| 48 | 관리자 | 3분 3초 — 3분 넘으면 안 되잖아 | moved | stages.mjs:260 (sound gate `portrait_max_s`) · :184 |
| 49 | 관리자 | 마지막 고백 뒤 숨 참듯 음악이 줄고 엔딩 — 끊김 | moved | rules.json:title-no-duck · targets `end_duck_window_s` · music-arc `endDrop` |
| 50 | 관리자 | 배경음악 단조로움 — 기승전결·전율 | moved | rules.json:score-arc · gate music-arc |
| 51 | 관리자 | 부드럽고 따뜻하게, 날카로운 효과음 | moved | rules.json:sound-soft-warm · gate sfx-stick |
| 52 | 관리자 | 고음은 음성 아님 — 고조 구간이 너무 많음 | moved | rules.json:score-arc (swells ≤ 3, contrast 6–9) |
| 53 | 관리자 | 영어 원고 MED 5줄 + 1:07 두건이 베일처럼 | moved | hood: rules.json:figures-gender-legible (EN line fixes = film-only) |
| 54 | 관리자 | 그림체는 둬, 확정 | film-only | sign-off |
| 55 | 관리자 | 매번 찾지 않도록 공정에 기록, 대화에만 남지 않게 | moved | rules.json:progress-in-repo · rules.json:translate-parallel-groups · tasks/intl.md, tasks/captions.md · `pipeline/briefs/` |
| 56 | 관리자 | 자막 MED 13줄 + 영어판 줄 나눔·글꼴 | film-only | fixes; the process is rules.json:caption-gate, tasks/intl.md:10 |
| 57 | 관리자 | 자막 MED 3줄 | film-only | fixes (rules.json:caption-gate) |
| 58 | 관리자 | 1 2 제안대로 · 숏폼은 누적시간 안 들어감 — 어떻게? | moved | rules.json:clips-plan-cadence · rules.json:shorts-to-long-text · rules.json:long-form-watch-hours · tasks/script.md:16, clips.md:13, sheet.md:14, after.md:4 |
| 59 | 관리자 | 가로판 두루마리가 위로 쏠림 | film-only | one landscape framing (equal landscape finish is already rules.json:portrait-first) |

### B. Transcript-only remarks (not in feedback_log)

| # | who | said (short) | status | where / proposed |
|---|---|---|---|---|
| E1 | 관리자 | 11-09 16:51 "지금 만들던 메시아 대체하자" · "성탄 얘기하지 말고" | film-only | topic choice (process_changes 11-09) |
| E2 | 관리자 | 11-09 22:51 "어디서 원고 전체를 확인할 수 있지" | moved | tasks/review.md:9 (draft page artifact, `artifact_url`) |
| E3 | 관리자 | 11-14 10:00 "지금은 시청자 리뷰는 돌리지마. 관점만" | **to-move** | **T9** theology-only re-review after freeze (only in process_changes) |
| E4 | 관리자 | 11-14 22:13 "아까 작은 문제 나온것들은 냅둬" | moved | tasks/anomaly.md:10 (`status: "ok"` + why) |
| E5 | 관리자 | 11-14 22:43 "선지자 뒤에 왜 항상 ㅡ 이거 붙인거야? 위 답변에도 썼고 영상에도 썼네" | **to-move** | **T5** no dash in screen text |
| E6 | 관리자 | 11-14 22:47 "유튜브업로드하고 나면 원본 mp4는 삭제해" | moved | rules.json:delete-local-after-upload |
| E7 | 관리자 | 11-14 22:56 "사운드도 첫영상이랑 400년 과정들의 방법이 공정에 적혀있지? … 내가 뭘 신경쓰고 피드백했는지" | moved | rules.json:sound-bar · rules.json:voice · SOUND.md · tasks/sound.md:2 |
| E8 | 관리자 | 11-14 06:30 "십자고상처럼 보인다는게 뭐지?" | moved | rules.json:depict-christ-restraint (4) |
| E9 | 관리자 | 11-15 06:52 "너무 큰 오류 아니야 숏츠에 안올라가자나" (3:03) | moved | stages.mjs:260 (= #48) |
| E10 | 관리자 | 11-16 00:24–00:31 "3분이 뭔가 담기에 애매 … 8분?" → "다음 영상시 다시 꺼내보고" | moved | FORMAT-NEXT.md · tasks/topic.md:2 |
| E11 | 관리자 | 11-16 08:12 "일부공개지? 아내한테도 링크줘서 검토해보게 유튜브 인코딩때문에 다른폰에서 보면 달라지는 문제 같은거 다 반영한거지?" | **to-move** | **T8** family preview on YouTube itself before public |
| E12 | 관리자 | 11-16 08:19 "트랙찾거든 도구에 잘 반영해놔" | moved | tasks/intl.md:22 (audio column = advanced features) · `studio-audio.js` |
| E13 | 관리자 | 11-16 15:50 "응 인스타랑 스레드도해줘" · 16:04 "400 짧은 쇼츠는 인스타랑 스레드에 올렸었나" | **to-move** | **T12** clips also to Instagram/Threads (tasks/social.md and gate `social` check only the main film) |
| E14 | 관리자 | 11-16 17:24 "자동자막 매번 이렇게해야해? 절차에 잘 남겨줘" | moved | rules.json:asr-off-all · tasks/after.md:3 |
| E15 | 관리자 | 11-13 12:29 "응 규칙에 넣어줘 신규영상을 가리키게" | moved | rules.json:endscreen-newest |
| E16 | 관리자 | 11-13 12:29 "그리스도 끝나면 바로공개할꺼야 날짜미정" · 11-16 12:50 "한국어 공개하자 국제채널은 … 저녁에" | film-only | publish timing (rules.json:approval-stops) |

### C. process_changes and other review.json fields

| # | who | said (short) | status | where / proposed |
|---|---|---|---|---|
| P1 | (process) | 11-09 메시아 대체, kits reuse, goldoil 새 화풍 | film-only | topic/looks of this film |
| P2 | (process) | 11-10 retime / 사 61:1을 선지자 예로 바꾼 리뷰 제안이 틀림 — "리뷰어 제안 구절도 관점 검수 기준으로" | moved + to-move | retime: stages.mjs:72–74 · verse part: **to-move T6** |
| P3 | (process) | 11-10 화풍별 하위 에이전트 다섯 동시 + 얼굴·손 유화 크게 세 번 실패 | moved + to-move | silhouettes: rules.json:cinematic, rules.json:depict-christ-restraint · parallel look tests: **to-move T11** (tasks/picture.md) |
| P4 | (process) | 11-11 look-per-scene rewrite + sweep step | moved | rules.json:look-per-scene, rules.json:chat-feedback-sweep |
| P5 | (process) | 11-12 구성부터 · "새 화풍을 고를 때 앞뒤 장면의 재질을 먼저 확인" | moved + to-move | composition: rules.json:look-per-scene · material: **to-move T4** (= #17) |
| P6 | (process) | 11-12 손 0.1–0.25초 몽타주 · 렌더 준비 3분 | **to-move** | hand montage: **T10** (not in tasks/anomaly.md or BODY-CHECK) · render prep limit already in `render.mjs` (code) |
| P8 | (process) | 11-15 번역·국제판 공정 파일, fetch-takes streaming | moved | tasks/intl.md, tasks/captions.md, rules.json:translate-parallel-groups, rules.json:progress-in-repo |
| P9 | (process) | 11-16 '…' 규칙을 said.mjs 하나로 | moved | `motion/films/said.mjs` (code, used by four tools) |
| X1 | 관리자 | music_cues_exception "굿 좋아!! 이대로 가자" (2.7 cues/min > target 2) | **to-move** | **T13** targets.json `sound.music_cues_per_min_max` 2 → 3. score-arc now asks for 15–25 s gesture cues, so the old cap fails every film that follows the rule |
| X2 | 관리자 | intl_progress: yt 검수 12건 "다 네 제안대로. 선택 항목도 해줘" (챕터 0:44, 관련 동영상 문구 방향 없이, 세로 표지 글 120px 위) | moved | stages.mjs:287–304 (chapter ≥ 10 s, KR + intl) · rules.json:shorts-to-long-text · `thumbs/make.py` template |

P7 (11-14, viewer review off) is E3, and the 642-syllable `budget_exception` is film-only. Neither has its own row. `followups_outside_film` (site i18n km/de) is site work, not the film pipeline.

## To-move — proposed rules (ready to paste into `rules.json` `rules[]`)

Where a gate is feasible, the `gate` text names it. Rules without `gate` are judgment calls (printed by `film.mjs task`).

**T1 — light-on-subject** (#32, #37, #38)
- Gate check is possible. Add one line to the `tasks/anomaly.md` checker brief ("빛이 무엇을 비추는가"); it stays judgment.
- A numeric check could read the brightest-region centroid in each scene vs the `screen` subject, but that is not worth it now.

```json
{
 "id": "light-on-subject",
 "stages": ["picture", "anomaly"],
 "rule": "빛(빛줄기·해·모이는 빛·비둘기 같은 빛)은 그 줄의 주인공(사람·십자가·두루마리)을 향하고 그 축 위에 둔다. 빛이 빈 들판이나 주인공 옆을 비추면 시청자는 연출이 아니라 실수로 읽는다 — 관리자가 한 영상에서 세 번 \"의도인가?\"를 물었다. 본문이 어둠을 말하면(마 27:45) 빛줄기를 두지 않는다. 이상 확인 지시문에 '빛이 무엇을 비추는가 — 주인공이 아니면 이상'을 넣는다.",
 "source": "관리자 2026-11-14 「그리스도」 \"1:35 십자가 장면 빛이 엉뚱한 곳(오른쪽 들판)을 비춤 — 의도인가?\" · \"기름 붓듯 하셨으매 할 때 예수님 오른쪽으로 비둘기가 내려오는 건 의도인가?\" · \"세 직분이 십자가로 모이는 빛이 십자가 우측인데 의도인가?\""
}
```

**T2 — camera-fx-gentle** (#36, #13 vanishing point, #39)
- Gate check is possible: a frame-qa per-scene `motion` p90 above the first film's p90 (`targets.frames.first_film.motion[2]` = 3.59) can be flagged in the picture gate. Camera zoom speed could also be asserted from the scene code's `cam` keys (≤ 0.25/s).

```json
{
 "id": "camera-fx-gentle",
 "stages": ["picture"],
 "rule": "카메라는 한 장면에 한 번의 느린 움직임(줌·당김 속도 대략 0.25/s 이하, 55세+·TV 시청자) — 첫 장면부터 과격하게 당기거나 소실점으로 빨려 들어가는 움직임은 쓰지 않는다. 빛 입자는 빛줄기 안에만, 적게(수십~100개), 피사계 심도로 앞뒤가 흐리게 — 화면 가득 고르게 뿌린 흰 점은 싸 보인다.",
 "gate": "picture (frame-qa 장면별 motion p90 ≤ 첫 영상 p90 — 넘으면 그 장면 이름)",
 "source": "관리자 2026-11-14 「그리스도」 \"첫 시작 카메라 워킹이 좀 과격함\" · \"2분대 베드로 장면 빛 파티클을 더 고급지고 덜 어색하게\" · 2026-11-11 \"마지막 소실점으로 쪼르르 가는 거 이상해\" — 고친 값: 첫 장면 최대 줌 0.55 → 0.24/s, 흰 점 300개 → 빛줄기 안 96개"
}
```

**T3 — rejected-looks** (#16 + 「메시아」 2026-11-06)
- Gate check is possible: the `looks` gate fails when `looks[].look`/`source` matches a listed name (hopper, mosaic, silkscreen, cavesil), unless the entry carries `override: "관리자: …"`.

```json
{
 "id": "rejected-looks",
 "stages": ["script", "picture"],
 "rule": "관리자가 뺀 화풍은 다시 고르지 않는다(관리자가 직접 다시 부를 때만): 호퍼풍(hopper — 빛의 사각형 하나의 실내가 공포영화처럼 읽힘, 두 영상에서 두 번), 로마 모자이크·점묘(폰에서 글자·인물이 묻힘), 실크스크린 포스터·word-log 만화 키트(cavesil 등 — 일러스트처럼 가벼움). 새로 빠지는 화풍은 이 목록에 더한다.",
 "gate": "looks (review.json looks[].look·source가 목록 이름이면 실패, override: \"관리자: …\"가 있으면 통과)",
 "source": "관리자 2026-11-06 「메시아」 \"호퍼풍 약간 호러틱해\" · 2026-11-11 「그리스도」 \"호퍼가 약간 공포영화 느낌이라 다른 걸로\" · README 7절(2026-11-02 모자이크 \"글씨도 안 보이고 내용 전달도 잘 안 되는 풍\", 실크스크린·cavesil \"일러스트 느낌이라 가벼워 보인다\")"
}
```
README §7 lines 250–251 should get the Hopper line too.

**T4 — amend `look-per-scene`** (#17, process_changes 11-12)
- Gate check is possible: add `looks[].material` (유화·흑백 필름·파스텔…) and have the `looks` gate warn when one material covers more than ~40 % of the film's seconds or a new look shares the material of both neighbours.

Append to the existing rule text:
```json
{
 "id": "look-per-scene",
 "append": " 새 화풍을 고르기 전에 영상 전체에서 같은 재질(유화·흑백 필름 등)이 차지하는 시간과 앞뒤 장면의 재질을 먼저 본다 — 다른 이름의 화풍도 재질이 같으면 반복으로 읽힌다(「그리스도」 고넬료 장면: 호퍼 → 페르메이르를 골랐다가 유화가 2:00–2:33에 이어짐).",
 "source_append": " · 관리자 2026-11-11 \"페르메이르풍 이거 이 영상에 제일 많이 차지하던 풍 아니야?\""
}
```

**T5 — screen-no-dash** (E5)
- Gate check is possible: the `script` gate can fail when a `label`/`title`/`narr` line's `text` contains `—` or `–` (Scripture `quote` lines stay as fetched).

```json
{
 "id": "screen-no-dash",
 "stages": ["script", "captions", "intl"],
 "rule": "화면 글자(해설·라벨·제목)에 줄표(—·–)를 쓰지 않는다. 이름 표기는 '선지자 · 엘리사'처럼 가운뎃점, 문장은 쉼표나 줄바꿈('/')으로 나눈다. 성경 원문 인용은 그대로 둔다. 관리자에게 하는 답에도 같은 습관을 쓰지 않는다.",
 "gate": "script (kind narr·label·title 줄의 text에 —·– 가 있으면 실패)",
 "source": "관리자 2026-11-14 「그리스도」 \"선지자 뒤에 왜 항상 ㅡ 이거 붙인거야? 위 답변에도 썼고 영상에도 썼네\" → L3 '선지자 · 엘리사'"
}
```

**T6 — reviewer-verse-perspective** (P2)
- Gate check is possible: when a quote line's `usfm` changes after a review round, `record` could require a new theology review file newer than that change. Mostly judgment.

```json
{
 "id": "reviewer-verse-perspective",
 "stages": ["review"],
 "rule": "리뷰어(시청자·관점 검수)가 제안한 대체 구절·새 구절은 반영하기 전에 그 구절의 문맥을 관점 검수 기준으로 다시 확인한다 — 누가 누구에게 하는 말인지, 그 줄이 말하려는 예가 맞는지. 바꾼 구절은 다음 차수 관점 검수에 꼭 넣는다.",
 "source": "「그리스도」 process_changes 2026-11-10 — 1차에서 리뷰 제안으로 이사야 61:1을 '선지자 기름 부음'의 예로 바꿨으나 그 구절은 메시야 자신의 말이라 틀림 → 2차에 왕상 19:16으로 되돌림(관리자 2026-11-09 \"그래 네 제안대로 진행하지\" 차수)"
}
```

**T7 — change-needs-cause** (#47)
- Gate check is possible only as judgment. Add one question to the novice-63 reviewer brief in `.claude/workflows/film-script-review.js` ("인물이 바뀌는 곳에 이유가 있나").

```json
{
 "id": "change-needs-cause",
 "stages": ["script", "review"],
 "rule": "한 인물이 영상 안에서 뒤집히면(막던 베드로 → 전하는 베드로) 그 사이의 이유를 짧게라도 말한다(예: '부활하신 예수님을 만난 뒤'). 성경을 잘 모르는 시청자는 그 빈칸을 스스로 채우지 못한다. 몇 음절이 늘면 다른 줄을 줄인다.",
 "source": "아내 2026-11-15 「그리스도」 \"'그리 마옵소서' 하던 베드로가 훗날 … 사이에 왜 그렇게 됐는지가 없다(예수님이 살아나신 걸 보고 바뀌었나?) — 짧게 언급 가능한가\" → N20, 관리자 OK"
}
```

**T8 — family-preview-on-youtube** (E11)
- Gate check is possible: the `publish` gate can require `uploaded.json <film>.preview = { at, privacy: "unlisted", by }` before `privacy public`/schedule.

```json
{
 "id": "family-preview-on-youtube",
 "stages": ["publish"],
 "rule": "한국어판(가로·세로)을 올린 뒤 공개 전에 일부 공개로 두고 링크를 관리자에게 준다 — 관리자·아내가 자기 폰·TV에서 유튜브가 다시 인코딩한 그대로(글자 겹침·깜빡임·소리 크기) 본다. 렌더 파일로 본 것과 유튜브에서 본 것이 다를 수 있다. 본 뒤 예약·공개로 바꾸고 uploaded.json에 적는다.",
 "gate": "publish (uploaded.json <film>.preview 없으면 실패)",
 "source": "관리자 2026-11-16 「그리스도」 \"일부공개지? 아내한테도 링크줘서 검토해보게 유튜브 인코딩때문에 다른폰에서 보면 달라지는 문제같은거 다 반영한거지?\""
}
```

**T9 — theology-only-after-freeze** (E3)
- Gate check is possible: the `reviews` gate, when the review JSON is `frozen` and script lines changed after it, can require `motion/reviews/film-<film>-theology-r<n>.json` newer than the change, and not a full four-reviewer run.

```json
{
 "id": "theology-only-after-freeze",
 "stages": ["review", "picture"],
 "rule": "원고를 굳힌 뒤(frozen) 그림·소리 단계에서 원고를 다시 고치면 관점 검수만 다시 돌린다(film-<film>-theology-r<n>.json). 시청자 리뷰 넷을 다시 돌리는 것은 관리자가 요청할 때만.",
 "gate": "reviews (frozen 뒤 바뀐 줄이 있으면 그보다 새 theology 검수 파일)",
 "source": "관리자 2026-11-14 「그리스도」 7차 원고(5·6부 재구성) \"지금은 시청자 리뷰는 돌리지마. 관점만\""
}
```

**T10 — anomaly checklist additions** (#20, #21, P6). This goes into `tasks/anomaly.md`, not a new rule.
- Gate check is possible: `anomaly` could require a second manifest with `every ≤ 0.25` covering the scenes whose code draws hands. Simpler to keep it as judgment.

In step 1, after the sheet command, add:
> 사람 손이 나오는 장면(쥐기·붙들기·뻗기)은 그 구간만 `--every 0.2 --from S --to S`로 다시 시트를 만들어 손이 몸·팔에서 떨어진 프레임이 없는지 본다(「그리스도」 3–8차: 고칠 때마다 떠 있는 손이 새로 생김, process_changes 2026-11-12).

In the 확인 지시문 '몸' line, add:
> 머리에 비해 몸이 너무 큼/작음(어른은 머리:키 대략 1:7)(관리자 2026-11-13 "사람몸이 너무 덩치가 커 머리에비해. 의도인가")

And add the T1 line:
> 빛: 빛줄기·해·모이는 빛이 주인공이 아닌 곳을 비춤

**T11 — parallel look tests** (P3). This goes into `tasks/picture.md`, not a new rule.
- Gate check: none (procedure).

> 그림 시험은 화풍(장면)마다 하위 에이전트 하나로 동시에 — 공통 지시(common.md: 캔버스 크기·시간표·Film API·금지 목록) + 장면별 지시. 본 세션은 시간표·글자 층(film.html이 script.json at에서 글자 시각을 읽음)과 검수를 맡는다(「그리스도」 2026-11-10, 다섯 화풍 동시).

**T12 — clips-social** (E13)
- Gate check is possible: the `social` gate also checks `uploaded.json <film>.clips.<id>.instagram|threads` (or `clips_social: { at, schedule }`), once clips exist.

```json
{
 "id": "clips-social",
 "stages": ["clips", "social"],
 "rule": "짧은 쇼츠도 인스타 릴스·스레드에 같은 시각으로 올린다(유튜브와 같은 날·같은 저녁 시각, 주일 건너뜀). 표지는 clip_covers.py, 글은 본편 글을 줄여 그 쇼츠의 질문으로 시작. uploaded.json <film>.clips.<id>.instagram·threads에 적는다.",
 "gate": "social (짧은 쇼츠가 있으면 clips마다 instagram·threads 기록)",
 "source": "관리자 2026-11-16 「그리스도」 \"응 인스타랑 스레드도해줘\" · \"400 짧은 쇼츠는 인스타랑 스레드에 올렸었나\" → 짧은 쇼츠 3편 인스타·스레드 예약(decisions_log, commit ebfb1c05)"
}
```
Also add one line to `tasks/social.md` and `tasks/clips.md:11`.

**T13 — targets change** (X1). This goes into `targets.json`, not a rule.
- Gate check: already gated (sound `music_cues_per_min_max`).

`sound.music_cues_per_min_max`: 2 → 3. Extend `music_cues_note`:
> 「그리스도」 2026-11-15: score-arc(짧은 몸짓 곡을 절정에 맞춤)로 8곡 = 분당 2.7, 이음매 0:59·1:20·1:36·1:59·2:27·2:45 — 관리자 "굿 좋아!! 이대로 가자"(music_cues_exception). 「메시아」 5.4/분의 '씬별 단절'은 여전히 막는다.

## feedback_sweep.items

```json
[
 { "said": "원고 좋아 진행해줘 (1차 리뷰 수정안 컨펌)", "to": "film-only", "status": "film-only" },
 { "said": "3차 수정안 + 한 번 더 리뷰, 미달이면 굳히기", "to": "tasks/review.md (freeze) · targets.json script.draft_line_pace_max/end_card_min_s", "status": "moved" },
 { "said": "제목이 썸네일에? 후킹 / 제목·썸네일 데이터 없어? 공정에도 반영", "to": "rules.json:title-thumb-evidence", "status": "moved" },
 { "said": "제목·썸네일 추천안 그대로 진행", "to": "film-only", "status": "film-only" },
 { "said": "프레임으로 보면 이상한데 — 이상 확인 단계 있어? → ㅇㅇ", "to": "rules.json:frame-anomaly", "status": "moved" },
 { "said": "Mp4줘야지 / 기름을 부어 → 이미 적혀 있었습니다, 중간에 뭔가 없어졌나", "to": "tasks/picture.md · rules.json:frame-anomaly · rules.json:shots", "status": "moved" },
 { "said": "에이전트 리뷰 수정은 확인받고 수정해 (두루마리 쇠판)", "to": "rules.json:confirm-agent-fixes", "status": "moved" },
 { "said": "두루마리 감긴 부분 철판·평면, 원통형으로", "to": "film-only", "status": "film-only" },
 { "said": "군인 장면은 이전이 더 나음", "to": "film-only", "status": "film-only" },
 { "said": "(군인 세 판 중) B", "to": "film-only", "status": "film-only" },
 { "said": "이어서 2 3 5 6 가자", "to": "film-only", "status": "film-only" },
 { "said": "일단 다 반영하고 다시 볼게", "to": "film-only", "status": "film-only" },
 { "said": "뿔에 시간 너무 씀 / 화풍 반복 지루 / 소실점으로 쪼르르 이상", "to": "rules.json:symbol-must-read · rules.json:look-per-scene · rules.json:camera-fx-gentle (new)", "status": "to-move" },
 { "said": "단순히 화풍 동일이 문제 아님, 구성 먼저 / 마지막에 대화 피드백 정리 스텝", "to": "rules.json:look-per-scene · rules.json:chat-feedback-sweep", "status": "moved" },
 { "said": "새 화풍 적합한 거 없었어? → 시아노타입", "to": "film-only", "status": "film-only" },
 { "said": "호퍼가 약간 공포영화 느낌이라 다른 걸로", "to": "rules.json:rejected-looks (new) · README §7", "status": "to-move" },
 { "said": "페르메이르풍 이 영상에 제일 많이 차지하던 풍 아니야?", "to": "rules.json:look-per-scene (append material check)", "status": "to-move" },
 { "said": "화면 구성을 이해 못 함 — 동굴 입구에 왜 모여 있나", "to": "rules.json:look-per-scene · rules.json:scene-reads-without-bible", "status": "moved" },
 { "said": "세 기름 → 그리스도 실루엣 덩어리 고침", "to": "tasks/anomaly.md", "status": "moved" },
 { "said": "베드로 손이 장갑처럼 / 십자가 그림자가 글자 뒤로", "to": "tasks/anomaly.md", "status": "moved" },
 { "said": "사람 몸이 머리에 비해 너무 큼, 의도인가", "to": "tasks/anomaly.md (add proportion line)", "status": "to-move" },
 { "said": "요단 — 그림자만 먼저 사라짐", "to": "tasks/anomaly.md", "status": "moved" },
 { "said": "뿔 장면 없어도 되지 않나? 의도?", "to": "rules.json:symbol-must-read · README §9", "status": "moved" },
 { "said": "엘리사는 왜 망또? 망또 퀄리티 낮음", "to": "film-only", "status": "film-only" },
 { "said": "성문 그림자 덜그덕 · 병사·깃발 아웃라인 어색", "to": "tasks/anomaly.md · rules.json:cinematic", "status": "moved" },
 { "said": "그림자가 쭉 길어지던데 뭘 표현?", "to": "rules.json:symbol-must-read", "status": "moved" },
 { "said": "무덤 앞 돌 씬, 내용 전달 안 됨", "to": "rules.json:symbol-must-read", "status": "moved" },
 { "said": "기름붓듯 → 나무에 달았다로 이어 읽힘", "to": "rules.json:symbol-must-read", "status": "moved" },
 { "said": "머리가 길어 여자처럼 보임", "to": "rules.json:figures-gender-legible", "status": "moved" },
 { "said": "병사·깃발이 성벽 밖 공중에 떠 있음", "to": "tasks/anomaly.md", "status": "moved" },
 { "said": "들판에서 다들 가만히 — 걷는 장면? 의도?", "to": "rules.json:shots · rules.json:one-event-per-verse", "status": "moved" },
 { "said": "십자가 장면 빛이 엉뚱한 들판을 비춤 — 의도?", "to": "rules.json:light-on-subject (new)", "status": "to-move" },
 { "said": "세 직분 장면 심심함", "to": "film-only", "status": "film-only" },
 { "said": "고넬료 집 — 성경 모르면 이해 어려움, 구절로 메우지 말 것", "to": "rules.json:scene-reads-without-bible", "status": "moved" },
 { "said": "엠마오 억지 — 400년 끝처럼", "to": "rules.json:ending-hook", "status": "moved" },
 { "said": "첫 시작 카메라 워킹이 과격", "to": "rules.json:camera-fx-gentle (new)", "status": "to-move" },
 { "said": "비둘기가 예수님 오른쪽으로 — 의도?", "to": "rules.json:light-on-subject (new)", "status": "to-move" },
 { "said": "세 직분 빛이 십자가 우측 — 의도?", "to": "rules.json:light-on-subject (new)", "status": "to-move" },
 { "said": "베드로 장면 빛 파티클 고급지게", "to": "rules.json:camera-fx-gentle (new)", "status": "to-move" },
 { "said": "(아내) N06 '그 왕을' → '메시야를'", "to": "film-only", "status": "film-only" },
 { "said": "(아내) N07 '예수님이 오신 후 어느 날,'", "to": "film-only", "status": "film-only" },
 { "said": "원고 훑기 1·2·3 (N17·엘리사 표기·N11)", "to": "film-only", "status": "film-only" },
 { "said": "끝에 '주는 그리스도시요…' 넣기", "to": "film-only", "status": "film-only" },
 { "said": "19~21초 음이 줄어듦, 밑줄 소리 어색", "to": "rules.json:title-no-duck", "status": "moved" },
 { "said": "숨 참고 배경 줄지 않게, 400년 같은 구간 확인", "to": "rules.json:title-no-duck", "status": "moved" },
 { "said": "선 그을 때는 첫 영상 펜 소리로", "to": "rules.json:title-no-duck", "status": "moved" },
 { "said": "(아내) '그리 마옵소서' 베드로가 왜 바뀌었는지 없음", "to": "rules.json:change-needs-cause (new)", "status": "to-move" },
 { "said": "3분 3초 — 3분 넘으면 안 되잖아", "to": "stages.mjs sound gate (portrait_max_s)", "status": "moved" },
 { "said": "마지막 고백 뒤 숨 참듯 음악이 줄고 엔딩 — 끊김", "to": "rules.json:title-no-duck · targets.json sound.end_duck_window_s", "status": "moved" },
 { "said": "배경음악 단조로움 — 기승전결·전율", "to": "rules.json:score-arc", "status": "moved" },
 { "said": "부드럽고 따뜻하게, 날카로운 효과음", "to": "rules.json:sound-soft-warm", "status": "moved" },
 { "said": "고음은 음성 아님 — 고조 구간이 너무 많음", "to": "rules.json:score-arc", "status": "moved" },
 { "said": "영어 원고 MED 5줄 + 두건이 베일처럼", "to": "rules.json:figures-gender-legible", "status": "moved" },
 { "said": "그림체는 둬 확정", "to": "film-only", "status": "film-only" },
 { "said": "매번 찾지 않도록 공정에 기록, 대화에만 남지 않게", "to": "rules.json:progress-in-repo · rules.json:translate-parallel-groups · tasks/intl.md · tasks/captions.md", "status": "moved" },
 { "said": "자막 MED 13줄 + 영어판 줄 나눔·글꼴", "to": "film-only", "status": "film-only" },
 { "said": "자막 MED 3줄 (hi·bn N09, ta Q14)", "to": "film-only", "status": "film-only" },
 { "said": "1 2 제안대로 · 숏폼은 누적시간 안 들어감 — 어떻게?", "to": "rules.json:clips-plan-cadence · rules.json:shorts-to-long-text · rules.json:long-form-watch-hours", "status": "moved" },
 { "said": "가로판 두루마리가 위로 쏠림", "to": "film-only", "status": "film-only" },
 { "said": "지금 만들던 메시아 대체하자 · 성탄 얘기하지 말고", "to": "film-only", "status": "film-only" },
 { "said": "어디서 원고 전체를 확인할 수 있지", "to": "tasks/review.md", "status": "moved" },
 { "said": "지금은 시청자 리뷰는 돌리지마. 관점만", "to": "rules.json:theology-only-after-freeze (new)", "status": "to-move" },
 { "said": "아까 작은 문제 나온것들은 냅둬", "to": "tasks/anomaly.md", "status": "moved" },
 { "said": "선지자 뒤에 왜 항상 ㅡ 이거 붙인거야?", "to": "rules.json:screen-no-dash (new)", "status": "to-move" },
 { "said": "유튜브 업로드하고 나면 원본 mp4는 삭제해", "to": "rules.json:delete-local-after-upload", "status": "moved" },
 { "said": "사운드도 첫영상·400년 방법이 공정에 적혀있지? 내가 뭘 피드백했는지", "to": "rules.json:sound-bar · rules.json:voice · tasks/sound.md", "status": "moved" },
 { "said": "십자고상처럼 보인다는게 뭐지?", "to": "rules.json:depict-christ-restraint", "status": "moved" },
 { "said": "너무 큰 오류 아니야 숏츠에 안올라가자나 (3:03)", "to": "stages.mjs sound gate (portrait_max_s)", "status": "moved" },
 { "said": "3분이 담기에 애매 — 8분? 다음 영상시 다시 꺼내보고", "to": "FORMAT-NEXT.md · tasks/topic.md", "status": "moved" },
 { "said": "일부공개지? 아내한테도 링크줘서 검토 — 유튜브 인코딩 다른 폰 문제", "to": "rules.json:family-preview-on-youtube (new)", "status": "to-move" },
 { "said": "트랙 찾거든 도구에 잘 반영해놔", "to": "tasks/intl.md", "status": "moved" },
 { "said": "인스타랑 스레드도 해줘 · 400 짧은 쇼츠는 인스타·스레드에 올렸었나", "to": "rules.json:clips-social (new) · tasks/social.md", "status": "to-move" },
 { "said": "자동자막 매번 이렇게 해야해? 절차에 잘 남겨줘", "to": "rules.json:asr-off-all", "status": "moved" },
 { "said": "응 규칙에 넣어줘 신규영상을 가리키게", "to": "rules.json:endscreen-newest", "status": "moved" },
 { "said": "그리스도 끝나면 바로 공개 · 국제채널은 저녁에", "to": "film-only", "status": "film-only" },
 { "said": "(process 11-09) 메시아 대체, goldoil 새 화풍", "to": "film-only", "status": "film-only" },
 { "said": "(process 11-10) 리뷰어 제안 구절도 관점 검수 기준으로 (사 61:1)", "to": "rules.json:reviewer-verse-perspective (new)", "status": "to-move" },
 { "said": "(process 11-10) 화풍별 하위 에이전트 동시 · 얼굴·손 유화 크게 실패 → 작은 실루엣", "to": "rules.json:cinematic · rules.json:depict-christ-restraint · tasks/picture.md (parallel look tests, new line)", "status": "moved" },
 { "said": "(process 11-11) look-per-scene 개정 + sweep 단계", "to": "rules.json:look-per-scene · rules.json:chat-feedback-sweep", "status": "moved" },
 { "said": "(process 11-12) 구성부터 · 앞뒤 장면 재질 먼저 확인", "to": "rules.json:look-per-scene", "status": "moved" },
 { "said": "(process 11-12) 손 0.1–0.25초 몽타주로 먼저 보기 · 렌더 준비 3분", "to": "tasks/anomaly.md (hand re-sheet, new line)", "status": "to-move" },
 { "said": "(process 11-15) 번역·국제판 공정 파일, fetch-takes 스트리밍", "to": "tasks/intl.md · tasks/captions.md · rules.json:translate-parallel-groups", "status": "moved" },
 { "said": "(process 11-16) '…' 규칙 said.mjs 하나로", "to": "motion/films/said.mjs (code)", "status": "moved" },
 { "said": "음악 큐 분당 2.7 — 굿 좋아!! 이대로 가자 (music_cues_exception)", "to": "targets.json sound.music_cues_per_min_max 2 → 3", "status": "to-move" },
 { "said": "yt 검수 12건 다 네 제안대로 (챕터 0:44, 관련 동영상 문구, 세로 표지 글)", "to": "stages.mjs sheet gate (chapters ≥ 10 s) · rules.json:shorts-to-long-text", "status": "moved" }
]
```

Note for the main session: the `sweep` gate takes only `moved` | `film-only`. Flip each `to-move` to `moved` once its rule, task line or target is in. The P3 and P5 items are `moved` in the array; T11 (tasks/picture.md line) and T4 are their outstanding parts.
