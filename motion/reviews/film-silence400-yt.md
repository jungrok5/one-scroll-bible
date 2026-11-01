# 「침묵의 400년」 international video — native review (2026-11-01)

What was reviewed: the English-text video's YouTube text (`motion/films/silence400/youtube-intl.json` → `text.en/es/pt-BR`:
title, description pieces, chapters, Scripture notice, AI line) and the caption files (`sound/en.vtt`, `es.vtt`, `pt-BR.vtt`).
Reviewers: one native-level agent per language (report only, no edits), Scripture checked with `fetch-verse.mjs`
(ESV 59 · RVR1960 149 · ARC 212). The narration audio was checked separately by speech-to-text (`motion/films/check-voice.mjs`):
every line heard as written in all three languages (only number words and one spelling of "Elisabet" differ in the transcript).

| Language | Scripture | Verdict | Findings |
|---|---|---|---|
| en | 11/11 caption quotes verbatim ESV | deployable | MED: keep the standard YouTube licence — Crossway's notice forbids Creative Commons publications. LOW: chapter "When the fullness of time had come" reads cut off; tags; AI-line wording; caption-end commas (inherited from the film text) |
| es | 11/11 verbatim RVR1960 | deployable | LOW only: chapter wording (verb in 1:18, capitals after "·", "Dios" as subject in 2:46); long Dan 2:32–33 caption cue |
| pt-BR | 11/11 verbatim ARC | deployable | MED: 24b/25c "há mais de 700 anos" read as "700 years ago from now" → "mais de 700 anos antes". LOW: chapter 1:18 wording, legal "sua editora" ambiguity, long Dan 2:32–33 cue, caption-end commas |

Applied: pt-BR 24b/25c fixed in `motion/films/silence400/i18n/pt-BR.json` and both narration takes re-recorded; chapter titles,
tags, AI line, pt-BR legal wording; `license: youtube` in the upload. Kept: the description intros (identical to the reviewed
narration lines 03 + 07b), caption-end commas and the long Daniel cue (verbatim Scripture, same as the on-screen text).
