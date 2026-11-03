# 4b. 새 화풍을 canvas-film 키트로 — {film}
관리자 2026-11-04: "화풍 추가되면 재사용할 수 있게 캔버스필름에 추가하도록". 이 영상에서 처음 쓴 화풍(review.json `looks[].style_new`)마다:
1. 화풍의 그리는 코드(엔진)를 영상 장면과 떼어 `C:/Project/motion-skills/canvas-film/kits/<kit>/kit.js`로 옮긴다. 같은 호출, 같은 순서, 같은 seed로 **그대로** 옮긴다.
   영상 고유의 인물과 장면은 영상에 남긴다.
2. 영상은 그 키트를 복사해 쓴다(`motion/films/{film}/kit-<kit>.js` = 원본과 같은 내용). 바꾸기 전후 스틸이 픽셀 단위로 같아야 한다.
3. `STYLE.md`(보이는 모습 · 잘 실어 나르는 뜻 / 못 싣는 뜻 · 팔레트 · API), 다른 소재의 `template.html`, `script.example.js`를 쓰고 `kits/README.md` 표에 한 줄을 넣는다.
   그다음 `python scripts/style-index.py`로 STYLE-INDEX를 다시 만든다. template는 from-kit으로 임시 폴더에 펼쳐 세로·가로 스틸로 확인한다.
4. review.json `looks[].kit`에 키트 이름을 적는다.
motion-skills는 브랜치에 커밋한다. main 병합은 관리자 OK 뒤에.
확인: `node motion/films/film.mjs check {film} kits`
