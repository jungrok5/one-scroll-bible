# 「그리스도」 international video — native review (2026-11-16)

What was reviewed: the English-text video's YouTube text (`motion/films/christ/youtube-intl.json` → `text.en/es/pt-BR`:
title, `lead_v`, `more_h`, chapters, tags, `thumb_words`; the intros and legal lines were checked only as copies). The
assembled descriptions are `node motion/films/intl.mjs entry christ v|h` → `motion/out/christ-intl-v.json` / `-h.json`.
Thumbnails: `thumbs/A-oil-<lang>.jpg` and `V-A-oil-<lang>.jpg`. Caption files: `sound/en.vtt`, `es.vtt`, `pt-BR.vtt`.
Reviewer: one native-level agent for all three languages (report only, no edits). Scripture checked with `fetch-verse.mjs`
(ESV 59 · RVR1960 149 · ARC 212): all 14 verses behind the 15 quoted caption cues.

| Language | Scripture / text | Verdict | Findings |
|---|---|---|---|
| en | 15/15 caption quotes verbatim ESV; intro = N01+N02 / N03+N15 copied exactly; ESV notice + `license: youtube` correct | deployable after #1 and #2 | HIGH: 0:44 chapter is only 7 s long, so YouTube shows no chapters at all (same in es/pt-BR and the Korean upload). MED: `lead_v` says "above", but the related-video link isn't reliably above (rules.json says "below"). LOW: chapter 0:44 reads "the Messiah people", "Today’s confession", "one person" vs the film's "one Person", tags |
| es | 15/15 verbatim RVR1960; intro copied exactly; RVR1960 notice correct | deployable after #1–#3 | HIGH #1. MED: `lead_v` sends Spanish viewers to an English-only film without saying so, and uses the same position word. LOW: title wording, "La confesión de hoy", "Salmos 22" vs "Salmo 22", missing munus-triplex tag. «» is fine for Spanish (NVI uses it), so keep it |
| pt-BR | 15/15 verbatim ARC; intro copied exactly; legal line as reviewed before | deployable after #1–#4 | HIGH #1. MED: «» are European Portuguese; Brazilians expect “” (title, thumbnail, intro, chapter, captions). MED: `lead_v` English-only target + position word. LOW: "A confissão de hoje", tags |

Theology: the terms follow each Bible and the Reformed baseline: "the Anointed One / el Ungido / o Ungido", "Messiah /
Mesías / Messias", "three offices / tres oficios / três ofícios" (the standard Reformed terms in Spanish and Portuguese, as in the
Westminster/Heidelberg translations). The titles promise only what the film delivers, which is the meaning of "Christ". They are not clickbait.
Thumbnails: all six read at a glance, with no spelling errors and good contrast. "CRISTO NÃO É SOBRENOME" and "CRISTO NO ES UN
APELLIDO" are the idioms people actually use.

## Findings

1. **HIGH — all languages (chapter timing, outside the wording scope but blocking).** `0:44 …` → `0:51 …` is a 7-second
   chapter. YouTube needs every chapter to be at least 10 s long. If any chapter is shorter, the whole chapter list is dropped
   (our own rule: `motion/films/README.md` "챕터" row). The other gaps are fine (1:16→1:27 and 2:28→2:39 are 11 s). Fix: merge
   the two lines at 0:44 and drop the 0:51 line:
   - en `0:44 The Messiah people waited for` + `0:51 Peter’s confession` → `0:44 The Messiah they expected · Peter’s confession`
   - es `0:44 El Mesías que esperaban` + `0:51 La confesión de Pedro` → `0:44 El Mesías que esperaban · La confesión de Pedro`
   - pt-BR `0:44 O Messias que esperavam` + `0:51 A confissão de Pedro` → `0:44 O Messias que esperavam · A confissão de Pedro`
   - The Korean `upload.md` / `youtube.json` has the same 0:44/0:51 pair: `0:44 사람들이 기다린 메시야 · 베드로의 고백`.
2. **MED — en/es/pt-BR `lead_v`: the position word.** "the related video above" / "de arriba" / "acima". In the Shorts player
   the related-video chip usually sits under the title, not above it. `rules.json` shorts-to-long-text says "아래" (below) while
   `upload.md` says "위" (above), so the repo contradicts itself. A position-neutral wording is safe on every device:
   - en `▶ The whole story of the Bible in one film (14 min): the related video above.` →
     `▶ The whole story of the Bible in one film (14 min): tap the related video link.`
   - es / pt-BR: see #3.
3. **MED — es/pt-BR `lead_v`: the target is the English film.** The Short's related video is MFH3Hj4V6KA, the English music
   version, which only has an English caption track (LANGUAGES.md). A Spanish or Portuguese reader is promised "toda la historia"
   and lands on English on-screen text. Say so, and point them to their own version on the channel (links don't click in Shorts):
   - es `▶ Toda la historia de la Biblia en una sola película (14 min): el video relacionado de arriba.` →
     `▶ Toda la historia de la Biblia en una sola película (14 min, en inglés): toca el video relacionado. La versión en español está en este canal.`
   - pt-BR `▶ A história completa da Bíblia em um só filme (14 min): o vídeo relacionado acima.` →
     `▶ A história completa da Bíblia em um só filme (14 min, em inglês): toque no vídeo relacionado. A versão em português está neste canal.`
   (`more_h` is fine. The landscape description already links the es/pt-BR films.)
4. **MED — pt-BR quotation marks.** In Brazil «» (aspas angulares) read as European Portuguese. Brazilian Bibles and media use
   “ ” (ARA, NAA and NVI all use them). The international video has English burned-in text, so pt-BR viewers see Portuguese only in
   the title, description, captions and thumbnail. Switching all of these causes no visual mismatch:
   - title `O verdadeiro significado de «Cristo» — o Ungido` → `O verdadeiro significado de “Cristo” — o Ungido`
   - thumb_words `«JESUS CRISTO»` → `“JESUS CRISTO”` (re-render `A-oil-pt-BR.jpg`, `V-A-oil-pt-BR.jpg`)
   - chapter `0:00 «Cristo» é o sobrenome de Jesus?` → `0:00 “Cristo” é o sobrenome de Jesus?`
   - intro and `pt-BR.vtt` (N01, N03, N17, N20): `«…»` → `“…”`. This is a punctuation change only, so the reviewed wording stays the same. Changing
     `i18n/pt-BR.json` too keeps one source. Spanish: keep «», which is RAE-preferred and familiar from the NVI.
5. **LOW — en chapter 0:44 (if #1 is not merged).** `The Messiah people waited for` reads at a glance as "the Messiah people" →
   `The Messiah they expected`. (The film's point is the expected *kind* of Messiah, a king against Rome, so "expected" fits better too.)
6. **LOW — closing chapter, all languages.** "Today’s confession" sounds like a daily-devotional series label:
   - en `2:39 Today’s confession` → `2:39 The confession: Jesus is the Christ`
   - es `2:39 La confesión de hoy` → `2:39 La confesión: Jesús es el Cristo`
   - pt-BR `2:39 A confissão de hoje` → `2:39 A confissão: Jesus é o Cristo`
7. **LOW — "one Person".** The film capitalizes it (N16 "in one Person" / "una sola Persona" / "uma só Pessoa"), marking the
   divine Person. The chapters use lowercase. For consistency: en `2:28 Three offices in one person` → `2:28 Three offices in one Person`
   (es `en una sola Persona`, pt-BR `em uma só Pessoa`).
8. **LOW — es title (optional).** `Lo que realmente significa «Cristo»: el Ungido` is correct and natural. `El verdadero
   significado de «Cristo»: el Ungido` is a little more title-like and parallels pt-BR. Either is fine.
9. **LOW — es/pt-BR reading list.** `Salmos 22` (read list) vs `Salmo 22` (film E1, P5 and tags). Both are correct, but
   for a single psalm "Salmo 22" is what people say and type. Consider `Salmo 22` in `read` (es and pt-BR).
10. **LOW — tags.** These are useful search terms. Add what people actually type for this topic, and give es/pt-BR the munus-triplex tag en has:
    - en add `what does Christ mean`, `three offices of Christ`. `Christ` alone is very broad and could go if the 500-character limit binds.
    - es add `qué significa Cristo`, `profeta sacerdote y rey`
    - pt-BR add `o que significa Cristo`, `profeta sacerdote e rei`
11. **LOW — intro read as a description (optional; reviewed lines).** In the film, "The name at the end of every prayer" sits
    over a picture. In the description, coming right after the question, it reads a little like an answer. In es,
    "al final de cada oración" also briefly allows "sentence". Optional rejoin, en: `The “Christ” in “Jesus Christ” — the
    name at the end of every prayer. Is it Jesus’ last name?` (es: `El «Cristo» de «Jesucristo», el nombre al final de cada
    oración: ¿es el apellido de Jesús?`, pt-BR likewise). Fine to keep as is.
12. **LOW — Shorts cover layout.** On `V-A-oil-<lang>.jpg`, the bottom line ("IS NOT A LAST NAME") sits at about 84–88 % of the
    height. That band can be covered by the Shorts overlay or the view-count label, and a 3:4 grid crop (Instagram) cuts it.
    Raising the text block by about 120 px would make it safe. The words themselves are fine.

Captions (spot check, en/es/pt-BR): no garbled text, no empty cues, no names split across lines. These are not errors: the cues
start with a lowercase verse fragment (the voiced clause only, the "…" rule in `said.mjs`), and a few lines run long (~55–63
characters: Lev 8:12, the N14 second line). YouTube wraps them on phones.

Kept / not flagged: the intros (exact copies of N01+N02 / N03+N15), the legal lines (ESV notice + `license: youtube`; UBS RVR1960
notice; ARC line as reviewed earlier), "película / filme" for the 14-min film (house usage, matching `youtube/lang/*.json`), tú register in es.
