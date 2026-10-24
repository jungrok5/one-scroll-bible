# YouTube API 심사·할당량 신청서 초안 (YouTube API Services — Audit and Quota Extension Form)

왜: 심사를 통과하지 않은 API 프로젝트로 올린 영상은 **비공개로 잠겨** 공개할 수 없습니다. 통과하면
`node motion/youtube/yt-api.mjs upload …`로 영상·쇼츠 업로드와 공개 예약까지 브라우저 없이 할 수 있습니다.
기본 할당량(하루 10,000 단위)으로는 업로드가 하루 6개 남짓이라, 할당량 증설도 같은 양식으로 함께 신청합니다.

- 양식: https://support.google.com/youtube/contact/yt_api_form (채널 주인 계정 또는 프로젝트 소유 계정으로 로그인)
- Google Cloud 프로젝트: **one-scroll-bible** · 프로젝트 번호 **221502360108**
- 사용 API: YouTube Data API v3, YouTube Analytics API · OAuth 범위: `youtube.force-ssl`, `yt-analytics.readonly`
- 개인정보처리방침: https://one-scroll-bible.com/privacy.html (7항 "YouTube API 서비스 사용")
- 도구 소스(공개): https://github.com/jungrok5/one-scroll-bible/blob/main/motion/youtube/yt-api.mjs

## 운영자가 할 일
1. 위 양식을 열고 아래 "칸별 답변"을 해당 칸에 붙입니다. 질문 문구가 조금 달라도 가장 가까운 답을 쓰면 됩니다.
2. 이름·이메일·주소 칸은 직접 채웁니다(이 파일에는 적지 않음 — 공개 저장소).
3. **화면 녹화(데모 영상) 1개**를 만들어 첨부합니다(아래 "데모 녹화 순서", 2~3분, Windows는 Win+Alt+R 또는 Win+G).
4. 제출 후 Google에서 메일로 추가 질문이 오면 그 메일을 Claude에게 보여 주세요. 답장 초안을 씁니다.
5. 통과 메일이 오면 알려 주세요. 업로드를 API로 바꾸고, 이 파일과 `motion/README.md`를 고칩니다.

## 칸별 답변 (영어로 붙여 넣기)

**Organization / client name**
Bible in One Scroll (one-scroll-bible.com) — internal tool "one-scroll-bible tools"

**Website**
https://one-scroll-bible.com/

**Google Cloud project number(s)**
221502360108

**Which YouTube API services does the client use?**
YouTube Data API v3 (videos.insert, videos.list, thumbnails.set, captions.list, captions.insert, playlistItems.list,
playlistItems.insert, channels.list) and YouTube Analytics API (reports.query).

**Describe your API client / use case**
"one-scroll-bible tools" is a small command-line tool used only by the operator of the non-commercial Bible education
site one-scroll-bible.com to manage the site's own YouTube channels: today @one-scroll-bible (channel ID UCtCcbrM2mCgfhSryo4SWxzg);
we may add language-specific channels owned by the same account (Brand Account channels), managed the same way.
The channel publishes one original 14-minute animated film about the whole Bible, drawn in code, in many languages (the
on-screen text is translated for each language), plus 21 short clips (Shorts) per language cut from that film.
The tool:
1. uploads each language's film and Shorts with the title, description, tags and language prepared in our repository,
   and schedules their publish time (videos.insert, thumbnails.set);
2. uploads a caption track in the film's own language, because the film has no speech and its text is only in the picture
   (captions.insert);
3. adds the videos to that language's playlist (playlistItems.insert);
4. reads view counts and YouTube Analytics for our own videos to decide when to publish the next language
   (videos.list, reports.query).
It is not offered to anyone else, has no user interface besides the terminal, and acts only on our own channels.

**Who are the users? How do they sign in?**
One user: the owner of our channels. They sign in once per channel with Google OAuth (installed-application flow with PKCE, loopback
redirect). The refresh token is kept only on the operator's computer, in the operator's user environment variables;
it is never sent anywhere else or committed to the repository.

**What YouTube data do you store, and for how long? Do you share it?**
None is stored. Read results (view counts, analytics totals) are printed in the operator's terminal and summarised by hand
in our own notes. No YouTube data is shared with third parties, sold, or combined with data from other channels.
The only stored credential is the operator's own refresh token on the operator's computer; access can be revoked at any
time at https://myaccount.google.com/permissions.

**Does your client display YouTube data to other users / embed the player?**
No. (Our website links to the videos on YouTube; it does not use the API.)

**Privacy policy URL**
https://one-scroll-bible.com/privacy.html — section 7 "Use of YouTube API Services" states the use of YouTube API
Services, links the YouTube Terms of Service and the Google Privacy Policy, and explains how to revoke access.

**Terms of Service**
The tool is used only by the operator, who agrees to the YouTube Terms of Service. Our site's privacy policy links to them.

**Is the client monetized? Ads?**
No. The site and channel are non-commercial; there are no ads or paid features.

**Requested quota and how you calculated it**
Requested: **100,000 units/day.**
We release the film in batches of four languages ("waves"). One wave = 4 films + 4 × 21 Shorts = 88 uploads.
88 × 1,600 (videos.insert) ≈ 140,800 units, plus captions (4 × 400 = 1,600), playlist inserts (88 × 50 = 4,400) and
thumbnails (4 × 50). Spread over two days that is ≈ 73,500 units/day; the rest of the headroom covers re-uploads after a
correction and daily videos.list / analytics reads (< 1,000 units). Uploads are scheduled for publication over 21 days
(at most two waves overlap, ≤ 8 Shorts published per day), so the channel is never flooded. The site already supports
214 languages and new film languages are added after native-speaker review, so this volume will recur every few weeks.

## 데모 녹화 순서 (2~3분, 화면 녹화만 — 목소리 없어도 됨)
1. 터미널에서 `node motion/youtube/yt-auth.mjs <client_secret.json>` → 브라우저의 Google 동의 화면(앱 이름 "one-scroll-bible
   tools", 요청 권한 두 개)이 보이게 → 허용 → "Done". (이미 인증돼 있으면 이 단계만 다시 해도 됩니다. 새 클라이언트 JSON이
   필요하면 Google Cloud → 클라이언트에서 받고, 녹화 뒤 지웁니다.)
2. `node motion/youtube/yt-api.mjs whoami` → 우리 채널 이름이 나오는 것.
3. `node motion/youtube/yt-api.mjs status` → 언어별 공개·예약 상태.
4. `node motion/youtube/yt-api.mjs stats` → 언어별 조회수·시청 시간.
5. `node motion/youtube/yt-api.mjs captions --dry` → 자막 올릴 대상 목록.
6. `node motion/youtube/yt-api.mjs upload fr 1 --publish-at 2026-12-01T10:00:00Z --dry` → 업로드할 파일·제목·예약 시각.
7. 브라우저에서 https://one-scroll-bible.com/privacy.html 7항을 잠깐 보여 주기.
(환경 변수 값이나 client_secret 파일 내용이 화면에 나오지 않게 주의 — 위 명령들은 비밀 값을 출력하지 않습니다.)

## 통과 후
- `upload`로 영상·쇼츠를 올리고(`--publish-at`으로 예약), `captions`, `playlist-add`로 마무리. 썸네일 A/B 테스트와
  댓글 고정은 API가 없어 스튜디오에서 계속.
- 결과를 `motion/youtube/uploaded.json`에 기록.
