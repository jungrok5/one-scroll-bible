# 10-3 대책 — 네 명 합의안 (2026-11-27)
These are the merged results of the two rounds of opinions from the camera director, stage director, lighting director and screenwriter (camera.md · director.md · lighting.md · writer.md). They take effect once the owner confirms them.

## 진단 (네 명 공통)
1. **Fix 2 switched the technique and the light disappeared.**
   - Throwing away 3D for a code-drawn 2D panorama removed the light source, shadows, haze and vanishing point all at once. The camera became a near-fixed frontal shot.
   - As a result the scene read like a map or a sign board.
   - Measured: brightness 101–131, dark share 0 %, ending a purplish 48.
2. **We answered comprehension questions with defect repairs.**
   - The owner asked about meaning: #89 "왜 우시지?" and #91 "장모 ↔ 베드로".
   - We answered by adding props and symbols (ruins, windows, beds, a veil). There were more objects to draw in code, and the result collapsed.
3. **The checks did not ask "is this better than the previous version?"**
   - The anomaly check only ticked off the last round's list of defects.
   - The Pentecost aerial got worse round after round:
     - the black point went 47 → 109;
     - fix-2 brief B1, "short shadows", removed the long shadows that made people readable;
     - sun elevation 19° → 32°;
     - camera angle 62° looking down.
   - So the first-draft crowd disappeared.
4. **The preview had no sound, and it was played joined to a scene from another part.**
   - #91 came from playing N111 (part 2) and N150 (part 6) back to back. In the film they are 9 minutes apart; there is no link between the two.

## 장면별 계획
### 예루살렘 (494.7–551.0) — go back to 3D backlight (9e9fa17f lens, fix 1 3365dae9 framing)
- **N133:**
  - The crowd cheers on the road.
  - The crowd appears only as long ground shadows and far silhouettes.
  - **Crossed gaze:** the crowd looks at him, he looks at the city.
- **N134:**
  - An over-the-shoulder push-in with his small back figure (≤ 8 %) and the golden city beyond.
  - The horizon sits above the shoulder; this removes the waist band.
  - Rim light only on the head cloth and shoulders.
  - The figure is opaque, behind the haze.
- **Q108:** the golden city, backlit, with the Temple as a silhouette in haze. The camera moves slowly with parallax.
- **Q108b:**
  - The same 3D scene and the same camera, with the sun turned off and an ash-grey sky.
  - The Temple is broken, three smoke columns rise.
  - Cut back to the golden city on 「보살핌 받는 날을」, with his small figure in frame.
- **N135b:** the cheering crowd against the indifferent city.
- **N136:** the light withdraws as the sun sets.
- **N137:**
  - He walks into the city.
  - No block figure: either a far silhouette or only his shadow.
  - The ending is dark gold, 55–60.
- **Dropped:** the 2D panorama, the wall shot, the window lights, the teardrop.

### 오순절 (970.8–986.8)
- **N170:**
  - The bowed wall shadow is **dropped**.
  - Instead, a backlit shot of a small Peter standing upright on the steps before the crowd (P3), lengthened.
- **N172:**
  - The **first draft (edc61537) aerial is restored exactly**.
  - Sun at 15–19°, shadows 4–6 times the figures' height, dark brown hard shadows.
  - Add camera movement only (a 45°/50 m crane).
  - These numbers are locked so later briefs cannot change them.
  - The net-shape requirement is dropped from the picture; the subtitle already says 「사람을 취하리라」.

### 장모 방 (162.2–168.7) — keep this round's two shots, polish only
- **Door shot:**
  - Shot from floor height, 35° off axis.
  - The light is a parallelogram wedge across the floor.
  - Remove the 2.0 s blow-out to white (252).
- **Water-jar shadow:**
  - Visible ≥ 2.5 s.
  - Her arm supports the jar; no hand-on-hip.
  - Grazing light on the wall, and a contact shadow.
- **Optional:** add a shadow rising on 「일어나」.

## 원고 제안 (관리자 결정 — 성경 인용은 그대로)
- **W1, N134:**
  - Now: 「예수님은 우셨습니다.」
  - Proposed: 「그런데 예수님은, / 그 성을 보며 우셨습니다.」 (Luke 19:41, about +1 s)
  - What he wept over is said in words; the picture only needs to show the direction of his gaze.
- **W2, N111:**
  - Now: 「…장모가 일어났습니다.」
  - Proposed: 「…장모가 일어나 / 손님들을 섬겼습니다.」 (Mark 1:31 「수종드니라」, about +1 s)
  - The current water-jar shot then matches the words as is.

## 진행 대책 (앞으로 모든 라운드)
1. **Previews carry voice and context.**
   - Attach the narration (or subtitle cards for the 5 s before and after) plus a part/line label.
   - Never join scenes from different parts.
2. **No change of technique or camera system in a fix round.** A technique change goes to the owner first as one test frame.
3. **Side-by-side comparison with the previous version before sending.**
   - Frames at the same times, at phone size.
   - Automatic comparison of brightness, dark share and contrast.
   - If any scene got worse, it is not sent.
   - First check is the whole picture at thumbnail size, "film frame or diagram?". A "diagram" answer is a BLOCKER.
4. **Briefs give each shot one table:**
   - three lines from the director: what to understand in 1 s / what to feel / what to drop;
   - camera numbers;
   - light spec;
   - one thing to show per line.
   - A line with two symbols is sent back.
5. **A comprehension question from the owner goes to the writer's script check before any picture instruction.**
6. **One change per round.** A fresh builder for each scene, working from the shot list (not a long-running agent that has worn down).
