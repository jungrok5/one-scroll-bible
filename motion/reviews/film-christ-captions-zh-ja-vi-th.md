# 「그리스도」 (christ) — caption native review: zh-Hans · zh-Hant · ja · vi · th

Reviewer: one native-speaking evangelical/Reformed Bible teacher per language. This is a report only. No language file was edited.
Sources: `motion/films/christ/script.json` (Korean) · `motion/films/christ/i18n/en.json` (reviewed English) ·
`motion/films/christ/i18n/<code>.json` · the translator's `backtr-<code>.md` · `CAPTIONS-BRIEF.md` · site packs `i18n/<code>.json`.
Audience: Christians 55+ who don't know the Bible well.

How captions are built (`motion/films/captions-on-ko.mjs`): the caption for a quote is its **`voice` when present, else `text`**. `/` becomes a line break.
So for every quote with a `voice`, the viewer reads only the `voice`. All five languages are caption-only, so `hl` and `cite` never reach the viewer here.
They only matter for voice tracks and word-sync.

`node motion/films/check-quotes.mjs christ <code>`: **all 15 quotes `ok` in all five languages** (run 2026-11-15).
Cite book names match each site pack's `books` table. Psalm numbering fits each edition:
- 新共同訳 counts the superscription, so ja uses `PSA.22.2` / `PSA.22.19`. I fetched it: 22:1 is 【指揮者によって…ダビデの詩。】.
- 和合本 (yv 48/46), Truyền Thống 1926 and THSV keep 22:1 / 22:18.

Digits: all five packs use ASCII digits. The narration has no digits except N12 "千/ngàn/พัน", which are written as words.
Terminology was checked against the site packs and the fetched verses:
- zh: 神 (not 上帝), 祷告, 弥赛亚, 受膏, 兵丁 (Jn 19:23).
- ja: イエス without 様, ペトロ, 預言者, 下着 (Jn 19:23).
- vi: prose *Chúa Giê-xu* (site convention, 44×). Quotes keep 1926's *Đức Chúa Jêsus*. Also *áo xống / áo dài* (Jn 19:23–24).
- th: เยซู, พระเมสสิยาห์, เสื้อ / เสื้อใน (Jn 19:23), and ราชาศัพท์ for Jesus.

**Does the point land?** Yes, in all five languages.
- N01/N03/N17 use the ordinary surname word: 姓 · 名字 · họ · นามสกุล.
- Q1 shows both words exactly as each Bible prints them: 弥赛亚…基督 · Đấng Mê-si…Đấng Christ · พระเมสสิยาห์…พระคริสต์.
- In ja, 新共同訳 has メシア at both Jn 1:41 and Mt 16:16. Jn 1:41 glosses it as 『油を注がれた者』. The chain still closes, and it may close even more clearly than in Korean:
  - The title says キリスト.
  - Q1 says メシア = 油を注がれた者.
  - N03 says キリスト = 「油を注がれた者」 = メシア.
  - Q9 says Jesus was made 油注がれた者.
  - N09/N15/N17 then speak of the メシア in Peter's word.
  - Using メシア for the title in N09/N15 (Korean 그리스도) is right. It is the word of this Bible's Mt 16:16, so I endorse it.

**Totals: HIGH 0 · MED 1 · LOW 22.**

| lang | HIGH | MED | LOW | HIGH/MED ids |
|---|---|---|---|---|
| zh-Hans | 0 | 0 | 4 | — |
| zh-Hant | 0 | 0 | 4 | — |
| ja | 0 | 0 | 4 | — |
| vi | 0 | 0 | 6 | — |
| th | 0 | 1 | 4 | N17 |

**Shared LOW (all five): N12 "천 년 전".** The Korean is ambiguous, and every translation copies it as "a thousand years *ago*": 一千年前 · 千年前 · một ngàn năm trước · เมื่อพันปีก่อน.
A Bible-new 55+ viewer may read that as "David lived ~1000 years ago." The brief (rule 3) means *before Jesus*.
The en review made the same fix ("earlier"), so each language below gets a one-word "before that" fix. It is LOW because it mirrors the approved Korean.

---

## zh-Hans — 和合本 (新标点, 神版, yv 48)

**Verdict: ready. Optional LOW polish only.** The narration is faithful, plain and reverent, and it borrows 和合本 wording wherever it can:
- N08 他必须…受许多的苦，并且被杀，第三日复活 (Mt 16:21)
- N14 兵丁 / 外衣 / 里衣 / 拈阄 (Jn 19:23–24, Ps 22:18)
- N20 万不可如此 (Q3)

"信仰告白" (N07/N17) is natural church usage. The point lands: 基督不是姓 → 受膏者 → 弥赛亚 (Q1 "弥赛亚翻出来就是基督").

| id | current | back-translation (literal, Korean) | issue | severity | replacement |
|---|---|---|---|---|---|
| T1 | 基督 | 그리스도 | Faithful. | — | — |
| N01 | “耶稣基督”的“基督”，/ 是耶稣的姓吗？ | '예수 그리스도'의 '그리스도'는, / 예수의 성인가요? | Faithful; 姓 is exactly the question. | — | — |
| N02 | 每次祷告结尾 / 都有的那个名字。 | 매번 기도 끝에 / 늘 있는 그 이름. | Faithful (Chinese prayers end 奉主耶稣基督的名). | — | — |
| N03 | 基督不是姓。/ 它的意思是“受膏者”，就是弥赛亚。 | 그리스도는 성이 아닙니다. / 그것의 뜻은 '기름 부음 받은 자', 곧 메시아입니다. | Faithful. 它 for a title of the Lord is slightly flat; 这个称号 reads more reverent. | LOW | 基督不是姓。/ 这个称号的意思是“受膏者”，就是弥赛亚。 |
| N04 | 神用膏油膏人，/ 立他们作王、作祭司、作先知。 | 하나님이 관유로 사람에게 기름 부어, / 그들을 세워 왕·제사장·선지자가 되게 하셨습니다. | Faithful; 膏油/膏 tie to K1, Q9. | — | — |
| N06 | 许多人等候弥赛亚，/ 只盼他作赶走罗马的王。 | 많은 사람이 메시아를 기다렸으나, / 오직 그가 로마를 몰아낼 왕이 되기만 바랐습니다. | Faithful. | — | — |
| N07 | 耶稣来了以后，有一天，/ 彼得说出了他的信仰告白。 | 예수께서 오신 뒤 어느 날, / 베드로가 그의 신앙고백을 말했습니다. | Faithful. | — | — |
| N08 | 从那时起，耶稣说，/ 他必须受许多的苦，并且被杀，/ 第三日复活。 | 그때부터 예수께서 말씀하셨습니다, / 그가 반드시 많은 고난을 받고 죽임을 당하고, / 제삼일에 부활해야 한다고. | Faithful; 许多的 is Mt 16:21's own word, so it's no addition. | — | — |
| N09 | 对彼得来说，一位会死的基督 / 是说不通的。 | 베드로에게, 죽을 수 있는 그리스도는 / 말이 안 되는 것이었습니다. | Faithful. | — | — |
| N10 | 然而那条路，/ 早已写在经上了。 | 그러나 그 길은, / 이미 성경(經)에 적혀 있었습니다. | Faithful; 写在经上 is good church idiom. | — | — |
| N11 | 十字架上，/ 耶稣的呼喊。 | 십자가 위, / 예수의 외침. | Faithful. | — | — |
| N12 | 这呼喊是一千年前，/ 受膏的王大卫所写的 / 诗篇的第一句。 | 이 외침은 천 년 전(지금부터), / 기름 부음 받은 왕 다윗이 쓴 / 시편의 첫 구절입니다. | 一千年前 reads "1000 years ago" (see shared note). | LOW | 这呼喊，是比这早一千年，/ 受膏的王大卫所写的 / 诗篇的第一句。 |
| N14 | 十字架下，兵丁 / 分了他的外衣，又为他的里衣拈阄。 | 십자가 아래서 병정들이 / 그의 겉옷을 나누고, 또 그의 속옷을 두고 제비를 뽑았습니다. | Faithful; mirrors Q7. | — | — |
| N20 | 曾说“万不可如此”的彼得，/ 见了复活的耶稣之后，所传的话： | '결코 그럴 수 없습니다' 하던 베드로가, / 부활하신 예수를 만난 뒤 전한 말: | Faithful. | — | — |
| N15 | 受苦的基督不是失败，/ 而是圣经所指的那条路。 | 고난받는 그리스도는 실패가 아니라, / 성경이 가리킨(言及한) 그 길입니다. | 所指的 can read "the road the Bible *refers to*"; 指明 makes "pointed ahead to" explicit. | LOW | 受苦的基督不是失败，/ 而是圣经早已指明的那条路。 |
| N16K–R | 王， / 祭司， / 先知， | 왕, / 제사장, / 선지자, | Faithful. | — | — |
| N16 | 三种职分，/ 都在这一位身上。 | 세 가지 직분이, / 모두 이 한 분에게. | Faithful. | — | — |
| N17 | “基督”不是姓，/ 而是承认耶稣就是那位弥赛亚的 / 信仰告白。 | '그리스도'는 성이 아니라, / 예수가 바로 그 메시아임을 인정하는 / 신앙고백입니다. | Faithful; the point lands. | — | — |
| Q1–Q14 | fragments | — | All verbatim and sensible. Q4 hl 受害 is 和合本's word for "pierced". | — | — |
| Q9 | voice 神怎样以圣灵和能力膏拿撒勒人耶稣， | 하나님이 어떻게 성령과 능력으로 나사렛 예수에게 기름 부으셨는지, | The Korean voice also has "두루 다니시며 선한 일을". 和合本 puts 这都是你们知道的 in between, so one contiguous voice can't hold both. The caption shows the anointing clause, which is the film's point. Keep. | LOW | (no change) |

## zh-Hant — 和合本 (新標點, 神版, yv 46)

**Verdict: ready. Optional LOW polish only.** The text matches zh-Hans line for line, so the same findings apply.
Taiwan glyphs in the prose are right: 裡 (N14), 為, 說, 「」 quotes. The quotes keep 和合本's own glyphs (裏衣 in Q7, 甚麼 in Q5/Q6).
That is why N14 has 裡衣 and Q7 has 裏衣, which is correct under the rule. No simplified→traditional mis-conversions found.

| id | current | back-translation (literal, Korean) | issue | severity | replacement |
|---|---|---|---|---|---|
| T1 | 基督 | 그리스도 | Faithful. | — | — |
| N01 | 「耶穌基督」的「基督」，/ 是耶穌的姓嗎？ | '예수 그리스도'의 '그리스도'는, / 예수의 성인가요? | Faithful. | — | — |
| N02 | 每次禱告結尾 / 都有的那個名字。 | 매번 기도 끝에 / 늘 있는 그 이름. | Faithful. | — | — |
| N03 | 基督不是姓。/ 它的意思是「受膏者」，就是彌賽亞。 | 그리스도는 성이 아닙니다. / 그것의 뜻은 '기름 부음 받은 자', 곧 메시아입니다. | As zh-Hans. | LOW | 基督不是姓。/ 這個稱號的意思是「受膏者」，就是彌賽亞。 |
| N04 | 神用膏油膏人，/ 立他們作王、作祭司、作先知。 | 하나님이 관유로 사람에게 기름 부어, / 그들을 왕·제사장·선지자로 세우셨습니다. | Faithful. | — | — |
| N06 | 許多人等候彌賽亞，/ 只盼他作趕走羅馬的王。 | 많은 사람이 메시아를 기다렸으나, / 오직 로마를 몰아낼 왕이 되기만 바랐습니다. | Faithful. | — | — |
| N07 | 耶穌來了以後，有一天，/ 彼得說出了他的信仰告白。 | 예수께서 오신 뒤 어느 날, / 베드로가 그의 신앙고백을 말했습니다. | Faithful. | — | — |
| N08 | 從那時起，耶穌說，/ 他必須受許多的苦，並且被殺，/ 第三日復活。 | 그때부터 예수께서 말씀하셨습니다, / 반드시 많은 고난을 받고 죽임을 당하고, / 제삼일에 부활해야 한다고. | Faithful. | — | — |
| N09 | 對彼得來說，一位會死的基督 / 是說不通的。 | 베드로에게, 죽을 수 있는 그리스도는 / 말이 안 되는 것이었습니다. | Faithful. | — | — |
| N10 | 然而那條路，/ 早已寫在經上了。 | 그러나 그 길은, / 이미 성경에 적혀 있었습니다. | Faithful. | — | — |
| N11 | 十字架上，/ 耶穌的呼喊。 | 십자가 위, / 예수의 외침. | Faithful. | — | — |
| N12 | 這呼喊是一千年前，/ 受膏的王大衛所寫的 / 詩篇的第一句。 | 이 외침은 천 년 전(지금부터), / 기름 부음 받은 왕 다윗이 쓴 / 시편의 첫 구절입니다. | Shared note. | LOW | 這呼喊，是比這早一千年，/ 受膏的王大衛所寫的 / 詩篇的第一句。 |
| N14 | 十字架下，兵丁 / 分了他的外衣，又為他的裡衣拈鬮。 | 십자가 아래서 병정들이 / 그의 겉옷을 나누고, 또 그의 속옷을 두고 제비를 뽑았습니다. | Faithful. 裡 (Taiwan) in prose vs 裏 in Q7 (Bible) is correct. | — | — |
| N20 | 曾說「萬不可如此」的彼得，/ 見了復活的耶穌之後，所傳的話： | '결코 그럴 수 없습니다' 하던 베드로가, / 부활하신 예수를 만난 뒤 전한 말: | Faithful. | — | — |
| N15 | 受苦的基督不是失敗，/ 而是聖經所指的那條路。 | 고난받는 그리스도는 실패가 아니라, / 성경이 가리킨 그 길입니다. | As zh-Hans. | LOW | 受苦的基督不是失敗，/ 而是聖經早已指明的那條路。 |
| N16K–R | 王， / 祭司， / 先知， | 왕, / 제사장, / 선지자, | Faithful. | — | — |
| N16 | 三種職分，/ 都在這一位身上。 | 세 가지 직분이, / 모두 이 한 분에게. | Faithful. | — | — |
| N17 | 「基督」不是姓，/ 而是承認耶穌就是那位彌賽亞的 / 信仰告白。 | '그리스도'는 성이 아니라, / 예수가 바로 그 메시아임을 인정하는 / 신앙고백입니다. | Faithful. | — | — |
| Q1–Q14 | fragments | — | All verbatim and sensible. | — | — |
| Q9 | voice 神怎樣以聖靈和能力膏拿撒勒人耶穌， | 하나님이 어떻게 성령과 능력으로 나사렛 예수에게 기름 부으셨는지, | As zh-Hans: the second clause can't be in the same contiguous voice. Keep. | LOW | (no change) |

## ja — 新共同訳 (yv 1819)

**Verdict: ready. Optional LOW polish only.** The Japanese is natural and reverent. It uses honorific verbs for Jesus (来られた, 語られました, 復活された) while keeping 新共同訳's bare イエス, which is consistent with the site pack.
The narration borrows the Bible's own words:
- N08 多くの苦しみを受けて殺され、三日目に復活することになっている (Mt 16:21)
- N14 服 / 下着 / くじを引く (Jn 19:23–24)
- N20 「とんでもないことです」 (Q3)

The メシア point is handled well (see top). Ps 22:2 / 22:19 numbering is correct.

| id | current | back-translation (literal, Korean) | issue | severity | replacement |
|---|---|---|---|---|---|
| T1 | キリスト | 그리스도 | Faithful. | — | — |
| N01 | 「イエス・キリスト」の「キリスト」は、/ イエスの名字なのでしょうか？ | '예수 그리스도'의 '그리스도'는, / 예수의 성(名字)인 것일까요? | Faithful; 名字 is the everyday word. | — | — |
| N02 | 祈りの終わりに / いつも唱える、その御名。 | 기도 끝에 / 늘 외는(唱える), 그 이름(御名). | 唱える leans toward reciting a formula (念仏を唱える). The Korean is "늘 붙는". Japanese prayers end イエス・キリストの御名によって…, and 添える keeps that gentle and exact. | LOW | 祈りの終わりに / いつも添える、その御名。 |
| N03 | キリストは名字ではありません。/ 「油を注がれた者」、メシアという意味です。 | 그리스도는 성이 아닙니다. / '기름 부음 받은 자', 메시아라는 뜻입니다. | Faithful, and the chain closes (see top). Optional: つまり makes the キリスト = メシア equation explicit for a reader whose Bible never shows キリスト in these verses. | LOW | キリストは名字ではありません。/ 「油を注がれた者」、つまりメシアのことです。 |
| N04 | 神は油を注いで、/ 王と祭司と預言者を立てられました。 | 하나님은 기름을 부어, / 왕과 제사장과 예언자를 세우셨습니다. | Faithful. | — | — |
| N06 | 多くの人々は、メシアを / ローマを追い払う王としてだけ待っていました。 | 많은 사람들은 메시아를 / 로마를 쫓아낼 왕으로서만 기다리고 있었습니다. | Faithful. | — | — |
| N07 | イエスが来られた後のある日、/ ペトロが信仰を告白しました。 | 예수께서 오신 뒤 어느 날, / 베드로가 신앙을 고백했습니다. | Faithful. | — | — |
| N08 | このときからイエスは、/ 多くの苦しみを受けて殺され、/ 三日目に復活することになっている、と語られました。 | 이때부터 예수께서는, / 많은 고난을 받고 죽임을 당하고, / 사흘째에 부활하게 되어 있다고 말씀하셨습니다. | Faithful; ことになっている carries "must" (as Mt 16:21). | — | — |
| N09 | ペトロにとって、死ぬメシアなど / ありえないことでした。 | 베드로에게, 죽는 메시아 따위는 / 있을 수 없는 일이었습니다. | メシア for 그리스도 is right here: it is Peter's own word in Q2 (新共同訳). | — | — |
| N10 | しかし、その道は / すでに書き記されていました。 | 그러나 그 길은 / 이미 기록되어 있었습니다. | Faithful. | — | — |
| N11 | 十字架の上、/ イエスの叫び。 | 십자가 위, / 예수의 외침. | Faithful. | — | — |
| N12 | この叫びは、千年前、/ 油を注がれた王ダビデが書いた / 詩編の最初の一行です。 | 이 외침은, 천 년 전(지금부터), / 기름 부음 받은 왕 다윗이 쓴 / 시편의 첫 한 줄입니다. | Shared note: その千年前 = "1000 years before that". The cite 22:2 vs "最初の一行" is fine, since 22:1 is the heading. | LOW | この叫びは、その千年前に / 油を注がれた王ダビデが書いた / 詩編の最初の一行です。 |
| N14 | 十字架の下で兵士たちは / イエスの服を分け、下着のことでくじを引きました。 | 십자가 아래서 병사들은 / 예수의 옷을 나누고, 속옷을 두고 제비를 뽑았습니다. | Faithful; Jn 19 words. | — | — |
| N20 | 「とんでもないことです」と言ったペトロが、/ 復活されたイエスに出会った後に語った言葉。 | '당치도 않습니다'라고 말한 베드로가, / 부활하신 예수를 만난 뒤에 말한 말. | Faithful. | — | — |
| N15 | 苦しみを受けるメシアは失敗ではなく、/ 聖書が指し示していた、あの道です。 | 고난받는 메시아는 실패가 아니라, / 성경이 가리키고 있던, 그 길입니다. | Faithful. | — | — |
| N16K–R | 王、 / 祭司、 / 預言者、 | 왕, / 제사장, / 예언자, | Faithful (預言者 = 新共同訳 and site pack). | — | — |
| N16 | 三つの務めが、/ ただ一人の方に。 | 세 가지 직무가, / 오직 한 분에게. | Faithful; 務め is gentler than 職務 and right for this audience. | — | — |
| N17 | 「キリスト」は名字ではなく、/ イエスこそ、そのメシアであるという / 信仰の告白です。 | '그리스도'는 성이 아니라, / 예수야말로 그 메시아라는 / 신앙의 고백입니다. | Faithful; the point lands. | — | — |
| Q1–Q14 | fragments | — | All verbatim. Q1 hl 油を注がれた者 and Q2/Q13 hl メシア are the right picks, since this Bible has no キリスト there. | — | — |
| Q9 / Q14 / Q5 (voice) | e.g. Q9 voice ナザレのイエスのことです。神は、聖霊と力によってこの方を油注がれた者となさいました。イエスは、方々を巡り歩いて人々を助け | 나사렛 예수에 관한 것입니다. 하나님은 성령과 능력으로 이분을 기름 부음 받은 자로 삼으셨습니다. 예수는 곳곳을 두루 다니며 사람들을 도우시고 | Verbatim and sensible. The caption uses `voice`, which has no `/`, so Q9 is a single ~60-character cue. check-quotes ignores `/` in voice, so breaks can be added freely. | LOW | Q9 voice: ナザレのイエスのことです。/ 神は、聖霊と力によってこの方を油注がれた者となさいました。/ イエスは、方々を巡り歩いて人々を助け |

## vi — Kinh Thánh Truyền Thống 1926 (yv 193)

**Verdict: ready. Optional LOW polish only.** The meaning is faithful and the register is reverent.
- *Chúa Giê-xu* in the prose follows the site pack convention, while the quotes keep 1926's *Đức Chúa Jêsus*. This is the established site practice, so it is not flagged.
- N14 *áo xống / áo dài / bắt thăm* = Jn 19:23–24 and Q7.
- N20 quotes Q3 exactly ("Đức Chúa Trời nào nỡ vậy!").
- The point lands: *họ* → *Đấng được xức dầu* → *Đấng Mê-si* (Q1 "Đấng Mê-si (nghĩa là Đấng Christ)").

| id | current | back-translation (literal, Korean) | issue | severity | replacement |
|---|---|---|---|---|---|
| T1 | Đấng Christ | 그리스도(이신 분) | Faithful. | — | — |
| N01 | Chữ “Christ” trong “Chúa Giê-xu Christ” — / có phải là họ của Chúa Giê-xu không? | '주 예수 그리스도' 속의 'Christ'라는 말 — / 예수님의 성입니까? | Faithful; *họ* is exactly the question. | — | — |
| N02 | Danh luôn ở cuối / mỗi lời cầu nguyện. | 모든 기도의 / 끝에 늘 있는 이름. | Faithful. | — | — |
| N03 | Christ không phải là họ. / Chữ ấy nghĩa là “Đấng được xức dầu” — Đấng Mê-si. | Christ는 성이 아닙니다. / 그 말은 '기름 부음 받은 분' — 메시아라는 뜻입니다. | Faithful; the point lands. | — | — |
| N04 | Đức Chúa Trời xức dầu / để biệt riêng vua, thầy tế lễ và tiên tri. | 하나님은 기름을 부으십니다 / 왕, 제사장, 선지자를 구별하시려고. | Faithful, but *xức dầu* has no object and sounds unfinished. Naming who is anointed reads more naturally. Korean 세우다 = *lập*. | LOW | Đức Chúa Trời xức dầu cho vua, thầy tế lễ và tiên tri / để lập họ lên. |
| N06 | Nhiều người chờ đợi Đấng Mê-si / chỉ như một vị vua sẽ đánh đuổi Rô-ma. | 많은 사람이 메시아를 기다렸습니다 / 다만 로마를 쳐 몰아낼 한 왕으로만. | Faithful. | — | — |
| N07 | Một ngày kia, sau khi Chúa Giê-xu đến, / Phi-e-rơ đã tuyên xưng. | 어느 날, 예수님이 오신 뒤, / 베드로가 고백했습니다. | *tuyên xưng* without an object sounds cut off. Korean 고백 = confession of faith. | LOW | Một ngày kia, sau khi Chúa Giê-xu đến, / Phi-e-rơ đã tuyên xưng đức tin mình. |
| N08 | Từ đó, Chúa Giê-xu phán rằng / Ngài phải chịu nhiều khổ, bị giết, / và đến ngày thứ ba phải sống lại. | 그때부터 예수님이 말씀하셨습니다 / 그분이 많은 고(苦)를 받고, 죽임을 당하고, / 셋째 날에 살아나야 한다고. | Faithful. *chịu nhiều khổ* is slightly clipped; 1926 Mt 16:21 says *chịu … nhiều sự khốn-khổ*. | LOW | Từ đó, Chúa Giê-xu phán rằng / Ngài phải chịu nhiều sự khốn khổ, bị giết, / và đến ngày thứ ba phải sống lại. |
| N09 | Với Phi-e-rơ, một Đấng Christ phải chết / là điều không thể hiểu nổi. | 베드로에게, 죽어야만 하는 그리스도는 / 도무지 이해할 수 없는 일이었습니다. | Small drift: *phải* adds "must". The Korean is simply "죽는 그리스도" (a Christ who dies). | LOW | Với Phi-e-rơ, một Đấng Christ chịu chết / là điều không thể hiểu nổi. |
| N10 | Nhưng con đường ấy / đã được chép sẵn từ trước. | 그런데 그 길은 / 이미 앞서 기록되어 있었습니다. | Faithful. | — | — |
| N11 | Trên thập tự giá, / tiếng kêu của Chúa Giê-xu. | 십자가 위, / 예수님의 외침. | Faithful. | — | — |
| N12 | Tiếng kêu này là câu đầu của một thi thiên / do vua Đa-vít, người được xức dầu, / viết một ngàn năm trước. | 이 외침은 한 시편의 첫 구절입니다 / 기름 부음 받은 자 다윗 왕이 / 천 년 전(지금부터)에 쓴. | Shared note. | LOW | Tiếng kêu này là câu đầu của một thi thiên / do vua Đa-vít, người được xức dầu, / viết trước đó một ngàn năm. |
| N14 | Dưới chân thập tự giá, quân lính / chia nhau áo xống Ngài và bắt thăm áo dài Ngài. | 십자가 발치에서 군인들이 / 그분의 옷을 나누고 그분의 긴 옷을 두고 제비 뽑았습니다. | Faithful; Jn 19 words. | — | — |
| N20 | Phi-e-rơ, người từng nói “Đức Chúa Trời nào nỡ vậy!”, / sau khi gặp Chúa Giê-xu sống lại, đã rao giảng lời này: | '하나님이 차마 그리하시겠습니까!' 하던 베드로가, / 살아나신 예수님을 만난 뒤, 이 말씀을 전파했습니다: | Faithful. | — | — |
| N15 | Đấng Christ chịu khổ không phải là thất bại, / mà chính là con đường Kinh Thánh đã chỉ đến. | 고난받는 그리스도는 실패가 아니라, / 바로 성경이 가리켜 닿은 그 길입니다. | *chỉ đến* is a little odd; *chỉ về* is the normal "point to". | LOW | Đấng Christ chịu khổ không phải là thất bại, / mà chính là con đường Kinh Thánh đã chỉ về. |
| N16K–R | Vua, / Thầy tế lễ, / Tiên tri, | 왕, / 제사장, / 선지자, | Faithful. | — | — |
| N16 | Ba chức vụ, / nơi một Đấng duy nhất. | 세 직분이, / 유일한 한 분 안에. | Faithful. | — | — |
| N17 | “Christ” không phải là họ. / Đó là lời tuyên xưng / rằng Chúa Giê-xu chính là Đấng Mê-si ấy. | 'Christ'는 성이 아닙니다. / 그것은 고백입니다 / 예수님이 바로 그 메시아라는. | Faithful; the point lands. | — | — |
| Q1–Q14 | fragments | — | All verbatim and sensible. K3 skips "con trai Sa-phát, ở A-bên-Mê-hô-la, đặng" with `…`, which reads fine. Q9 hl *xức cho* is 1926's "anointed" (no *dầu* in Acts 10:38); the tie to N04 still reads. | — | — |

## th — ฉบับมาตรฐาน THSV 2011 (yv 174)

**Verdict: ready after 1 MED (N17).** The rest is natural, reverent and correct in royal register: พระนาม, เสด็จ, ตรัส, สิ้นพระชนม์, ทรง.
- N08 follows THSV Mt 16:21 (ทรงทนทุกข์ … ถูกประหารชีวิต … ในวันที่สามจะทรงเป็นขึ้นมาใหม่).
- N14 เสื้อ / เสื้อใน / จับฉลาก = Jn 19:23–24.
- The point lands: นามสกุล → ผู้ที่ได้รับการเจิม → พระเมสสิยาห์ (Q1 "พระเมสสิยาห์ (ซึ่งแปลว่าพระคริสต์)").

| id | current | back-translation (literal, Korean) | issue | severity | replacement |
|---|---|---|---|---|---|
| T1 | พระคริสต์ | 그리스도 | Faithful. | — | — |
| N01 | คำว่า “คริสต์” ในพระนาม “พระเยซูคริสต์” / เป็นนามสกุลของพระเยซูหรือ? | '예수 그리스도'라는 존함 속 '크리스트'라는 말은 / 예수의 성인가요? | Faithful; นามสกุล is exactly the question. | — | — |
| N02 | พระนามที่อยู่ในตอนท้าย / ของทุกคำอธิษฐาน | 모든 기도의 / 끝에 있는 그 존함. | Faithful. | — | — |
| N03 | พระคริสต์ไม่ใช่นามสกุล / แต่หมายถึง “ผู้ที่ได้รับการเจิม” คือพระเมสสิยาห์ | 그리스도는 성이 아니고 / '기름 부음 받은 자', 곧 메시아를 뜻합니다. | Faithful; the point lands. | — | — |
| N04 | พระเจ้าทรงเจิมด้วยน้ำมัน / เพื่อแต่งตั้งกษัตริย์ ปุโรหิต และผู้เผยพระวจนะ | 하나님은 기름으로 기름 부으셨습니다 / 왕, 제사장, 선지자를 세우시려고. | Faithful. เจิม has no object, but it reads. Optional. | LOW | พระเจ้าทรงเจิมกษัตริย์ ปุโรหิต และผู้เผยพระวจนะด้วยน้ำมัน / เพื่อแต่งตั้งพวกเขา |
| N06 | คนจำนวนมากรอคอยพระเมสสิยาห์ / เพียงในฐานะกษัตริย์ที่จะขับไล่โรมออกไป | 많은 사람이 메시아를 기다렸습니다 / 다만 로마를 몰아낼 왕으로서만. | Faithful. | — | — |
| N07 | วันหนึ่ง หลังจากที่พระเยซูเสด็จมาแล้ว / เปโตรได้ประกาศความเชื่อของเขา | 어느 날, 예수께서 오신 뒤에 / 베드로가 자기 믿음을 선포(고백)했습니다. | Faithful. | — | — |
| N08 | ตั้งแต่นั้นมา พระเยซูตรัสว่า / พระองค์จะต้องทรงทนทุกข์และถูกประหารชีวิต / แล้วในวันที่สามจะทรงเป็นขึ้นมาใหม่ | 그때부터 예수께서 말씀하셨습니다 / 반드시 고난을 겪고 처형당하실 것이며 / 셋째 날에 다시 살아나실 것이라고. | Faithful; THSV Mt 16:21 wording. | — | — |
| N09 | สำหรับเปโตร พระคริสต์ที่ต้องสิ้นพระชนม์ / เป็นเรื่องที่ไม่สมเหตุสมผลเลย | 베드로에게, 돌아가셔야 하는 그리스도는 / 전혀 이치에 맞지 않는 일이었습니다. | Faithful (ต้อง is natural Thai here). | — | — |
| N10 | แต่หนทางนั้น / ได้ถูกเขียนไว้แล้ว | 그러나 그 길은 / 이미 쓰여져 있었습니다. | ได้ถูก…ไว้ is translationese passive. มีบันทึกไว้ is natural. | LOW | แต่หนทางนั้น / มีบันทึกไว้แล้ว |
| N11 | บนกางเขน / เสียงร้องของพระเยซู | 십자가 위 / 예수의 외침. | Faithful (กางเขน = Jn 19:23 THSV and site pack). | — | — |
| N12 | เสียงร้องนี้คือบรรทัดแรกของบทสดุดี / ที่ดาวิด กษัตริย์ผู้ได้รับการเจิม / เขียนไว้เมื่อพันปีก่อน | 이 외침은 시편의 첫 줄입니다 / 기름 부음 받은 왕 다윗이 / 천 년 전(지금부터)에 써 둔. | Shared note: เมื่อพันปีก่อน = "1000 years ago". | LOW | เสียงร้องนี้คือบรรทัดแรกของบทสดุดี / ที่ดาวิด กษัตริย์ผู้ได้รับการเจิม / เขียนไว้ก่อนหน้านั้นพันปี |
| N14 | ใต้กางเขน พวกทหาร / แบ่งเสื้อของพระองค์ และจับฉลากเสื้อในของพระองค์ | 십자가 아래, 군인들이 / 그분의 옷을 나누고 그분의 속옷을 두고 제비를 뽑았습니다. | Faithful; Jn 19 words. | — | — |
| N20 | เปโตรผู้เคยกล่าวว่า “อย่าให้เป็นเช่นนั้น” / หลังจากได้พบพระเยซูผู้ทรงเป็นขึ้นจากตาย ได้ประกาศเรื่องนี้ว่า | '그렇게 되지 않게 하소서'라고 했던 베드로가 / 죽음에서 살아나신 예수를 만난 뒤 이 일을 이렇게 선포했습니다. | Faithful; quotes Q3. | — | — |
| N15 | พระคริสต์ผู้ทรงทนทุกข์ไม่ใช่ความล้มเหลว / แต่เป็นหนทางที่พระคัมภีร์ได้ชี้ไว้ | 고난받으신 그리스도는 실패가 아니라 / 성경이 가리켜 둔 길입니다. | Faithful. | — | — |
| N16K–R | กษัตริย์ / ปุโรหิต / ผู้เผยพระวจนะ | 왕 / 제사장 / 선지자 | Faithful (THSV terms). | — | — |
| N16 | สามตำแหน่ง / ในพระองค์เดียว | 세 직분이 / 한 분 안에. | Faithful. | — | — |
| N17 | “พระคริสต์” ไม่ใช่นามสกุล / แต่เป็นการยอมรับความเชื่อว่า / พระเยซูคือพระเมสสิยาห์องค์นั้น | '그리스도'는 성이 아니라 / 믿음(신조)을 받아들이는 것입니다 / 예수가 그 메시아라는. | This is the film's last spoken point, and การยอมรับความเชื่อ reads as "accepting a belief". It is not "a confession of faith", and the active confession is weakened. Use the noun N07 already uses (ประกาศความเชื่อ). Add ทรง in royal register (THSV Q2 uses เป็น, but narration about Jesus takes ทรงเป็น). | MED | “พระคริสต์” ไม่ใช่นามสกุล / แต่เป็นคำประกาศความเชื่อว่า / พระเยซูทรงเป็นพระเมสสิยาห์องค์นั้น |
| Q1–Q14 | fragments | — | All verbatim and sensible. Q13 voice พระคริสต์พระบุตร… has no space, but THSV Mt 16:16 prints it joined, so keep it. | — | — |
| Q9 / Q14 / Q5 (voice) | e.g. Q9 voice พระเจ้าทรงเจิมพระเยซูชาวนาซาเร็ธด้วยพระวิญญาณบริสุทธิ์และด้วยฤทธานุภาพอย่างไร และเรื่องที่ว่าพระเยซูเสด็จไปทำคุณประโยชน์ | 하나님이 어떻게 나사렛 예수에게 성령과 능력으로 기름 부으셨는지, 그리고 예수께서 다니시며 선을 행하신 일 | The caption is a single long cue (`voice` has no `/`). Breaks are allowed and check-quotes ignores them. | LOW | Q9 voice: พระเจ้าทรงเจิมพระเยซูชาวนาซาเร็ธ / ด้วยพระวิญญาณบริสุทธิ์และด้วยฤทธานุภาพอย่างไร / และเรื่องที่ว่าพระเยซูเสด็จไปทำคุณประโยชน์ |
