# 국제 채널 시리즈 재생목록 문구 검수 (es · pt-BR · en)

대상: `motion/youtube/intl-layout.json` → `series_playlist`(영어 제목·설명, es·pt-BR 현지화)와 `home` 섹션 제목 "Watch in your language". 검수일 2026-11-13. 보고만 함(파일 수정 없음).

## 요약 (한국어)

- **BLOCKER 0 · MAJOR 0 · MINOR 5.** 세 언어 모두 그대로 올려도 됩니다. 역번역이 영어 원문과 맞고, 사실이 아닌 약속도 없습니다. "자막은 여러 언어"는 사실이고, 해설 음성(en·es·pt)은 아예 말하지 않습니다. 언어 수도 넣지 않았습니다.
- es "Historias de la Biblia, una a una"와 pt-BR "Histórias da Bíblia, uma a uma"는 재생목록 이름으로 자연스럽습니다. 성(una/uma ↔ historias/histórias), 일치(cada una ↔ películas, cada um ↔ filmes), 지역 어휘(pt-BR "legendas", "filmes curtos")도 모두 맞습니다.
- 다듬을 만한 점(MINOR, 고르셔도 되고 그냥 두셔도 됩니다):
  1. 영어 **"Bible stories"**는 영어권에서 주일학교·어린이 성경 이야기처럼 들립니다. 이 채널의 시청자는 나이 든 어른입니다. 또 이 사이트의 핵심은 "성경 전체가 **하나의** 이야기"라는 것입니다. 그래서 "The Bible's story, one film at a time"이 더 맞을 수 있습니다(선택). 두 번째 영상(「그리스도」의 뜻)은 '에피소드'보다 '주제' 영상에 가깝습니다. 그래서 "stories"보다 "story, one film at a time"이 더 정확합니다.
  2. 영어 설명의 **"one piece at a time"**은 조금 어색합니다. "one part at a time"을 권합니다.
  3. es **"Películas cortas"**는 맞는 말이지만 직역 느낌이 납니다. "Cortometrajes"(→ "cada uno")가 더 자연스럽습니다(선택).
  4. "Watch in your language"는 자연스럽습니다. 다만 섹션 제목은 모든 방문자에게 영어로 보입니다. 안에 든 재생목록 제목이 각 언어로 되어 있으니 문제는 아닙니다.
  5. (문구가 아닌 기술 메모) 현지화 키 `pt-BR`: YouTube의 표시 언어 코드에서 브라질 포르투갈어는 `pt`입니다(`global-move.mjs`의 `YT_LANG`도 pt-BR→pt). 적용한 뒤 브라질 시청자에게 포르투갈어 제목이 실제로 보이는지 확인하거나 `pt`로 저장하는 것을 권합니다.

## 표

| # | 항목 | 원문 | 직역 역번역 | 충실도 | 자연스러움 / 정확성 | 심각도 | 제안 |
|---|---|---|---|---|---|---|---|
| 1 | en title | Bible stories, one by one | — | — | 바르고 짧음. 다만 "Bible stories"는 어린이 성경 이야기처럼 들리고, 두 번째 영상(「그리스도」의 뜻)은 '이야기 한 편'이 아니라 주제 영상임. 다른 재생목록 제목("Bible in One Scroll")은 타이틀 케이스이고 이 제목은 문장형이지만 YouTube에서는 둘 다 문제없음 | MINOR | (선택) `The Bible's story, one film at a time` |
| 2 | en description | Short films that follow the Bible story one piece at a time — each with captions in many languages. | — | — | 정확함(자막만 약속, 음성 약속 없음, 언어 수 없음). "one piece at a time"이 조금 어색함 | MINOR | (선택) `Short films that follow the Bible story one part at a time — each with captions in many languages.` |
| 3 | es title | Historias de la Biblia, una a una | Stories of the Bible, one by one | 충실 | 자연스러운 재생목록 이름. "una a una"(=una por una) 맞음. 중남미 말투로 문제없음 | 없음 | 그대로. (1번 영어를 바꾸면 `La historia de la Biblia, paso a paso`) |
| 4 | es description | Películas cortas que siguen la historia de la Biblia paso a paso, cada una con subtítulos en muchos idiomas. | Short films that follow the story of the Bible step by step, each one with subtitles in many languages. | 충실("one piece at a time"→"paso a paso"는 알맞은 의역) | 문법·일치 맞음. "Películas cortas"는 조금 직역 같음. "Cortometrajes"가 더 흔함 | MINOR | (선택) `Cortometrajes que recorren la historia de la Biblia paso a paso, cada uno con subtítulos en muchos idiomas.` |
| 5 | pt-BR title | Histórias da Bíblia, uma a uma | Stories of the Bible, one by one | 충실 | 자연스러운 pt-BR 재생목록 이름(pt-PT 표현 아님) | 없음 | 그대로. (1번 영어를 바꾸면 `A história da Bíblia, passo a passo`) |
| 6 | pt-BR description | Filmes curtos que acompanham a história da Bíblia passo a passo, cada um com legendas em muitos idiomas. | Short films that follow the story of the Bible step by step, each one with subtitles in many languages. | 충실 | 자연스러운 브라질 포르투갈어. "legendas", "acompanham", 성 일치 모두 맞음 | 없음 | 그대로 |
| 7 | home section | Watch in your language | — | — | 자연스럽고 간결함. 사실과 맞음(언어마다 재생목록 하나씩). 모든 방문자에게 영어로 보이지만 안의 재생목록은 각 언어로 되어 있음 | 없음 | 그대로 |
| 8 | (기술) localization key | `"pt-BR"` | — | — | YouTube 표시 언어 코드에서 브라질 포르투갈어는 `pt`. 키가 맞지 않으면 브라질 시청자에게 영어 제목이 보일 수 있음 | MINOR | 적용한 뒤 확인하거나 키를 `pt`로 |

### 점검한 것
- 사실과 다른 약속: 없음. 자막만 언급하고, 해설 음성(en·es·pt만 있음)은 약속하지 않음.
- 언어 수: 없음(정책 준수).
- 신학·용어: 문제 될 용어 없음("historia/história de la Biblia"는 구속사 관점과 맞음).
- 1번(영어 제목)을 바꾸면 3·5번도 함께 바꿔야 세 언어가 같은 이름이 됩니다.
