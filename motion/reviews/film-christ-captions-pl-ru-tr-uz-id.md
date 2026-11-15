# 「그리스도」 (christ) — caption native review: pl · ru · tr · uz · id

Reviewer: one native-speaking evangelical/Reformed Bible teacher per language. Report only: no language file was edited.
Sources: `motion/films/christ/script.json` (Korean) · `motion/films/christ/i18n/en.json` (reviewed English) ·
`motion/films/christ/i18n/<code>.json` · the translator's `backtr-<code>.md` · `CAPTIONS-BRIEF.md` · site packs `i18n/<code>.json`.
Audience: Christians 55+ who don't know the Bible well.

How captions are built (`motion/films/captions-on-ko.mjs`): the caption for a quote is its **`voice` when present, else `text`**. `/` becomes a line break.
So a line's `voice` is what the viewer actually reads under the picture. This matters for id Q9 below.

`node motion/films/check-quotes.mjs christ <code>`: **all 15 quotes `ok` in all five languages** (re-run 2026-11-15). Matching ignores
case and quote marks. `hl` is matched case-sensitively against `text`. Every replacement below that touches a quote passes this check.
I checked that by hand against the fetched verse text.

Cite book names match each site pack's `books` table in all five languages. Psalm numbering is right for each edition:
pl Gdańska and id TB count the superscription, so Ps 22:2 / 22:19. ru Synodal and uz OʻzbMK use the LXX/Slavonic numbering plus the superscription, so Ps 21:2 / 21:19.
In OʻzbMK, PSA.22.1 is "Egam mening choʻponimdir", which is our Ps 23. tr Kutsal Kitap keeps 22:1 / 22:18.
Digits: every pack uses ASCII digits, and the narration has none.

**Totals: HIGH 0 · MED 4 · LOW 13.**

| lang | HIGH | MED | LOW | HIGH/MED ids |
|---|---|---|---|---|
| pl | 0 | 1 | 3 | N09 |
| ru | 0 | 1 | 4 | N09 |
| tr | 0 | 0 | 1 | — |
| uz | 0 | 1 | 3 | N03 |
| id | 0 | 1 | 2 | Q9 |

---

## pl — Biblia Gdańska (yv 132)

**Verdict: ready after 1 MED (N09).** Faithful, reverent and natural. The point lands well: Chrystus / Mesyjasz (Jn 1:41
"Znaleźliśmy Mesyjasza, co się wykłada Chrystus") / Pomazaniec / pomazać (1 Sm 16:13, Dz 10:38 "pomazał"). The archaic Gdańska
spelling *Mesyjasz* in the narration is right: it mirrors Q1 (brief rule 2), even though the site prose spells it *Mesjasz*. Polish
Protestant readers of Gdańska know this form. N14 "rzucili losy" mirrors Jn 19:24 Gdańska "rzućmy losy", and "suknię" is Gdańska's Jn 19:23 word. N08 "być zabitym … trzeciego dnia
zmartwychwstać" mirrors Gdańska Mt 16:21.

| id | current | back-translation (literal) | issue | severity | replacement |
|---|---|---|---|---|---|
| N01 | „Chrystus” w imieniu „Jezus Chrystus” — / czy to nazwisko Jezusa? | '예수 그리스도'라는 이름(imię) 안의 '그리스도' — / 그것이 예수의 성인가? | Faithful. But *imię* is also "first name", set right against *nazwisko*, and "w imieniu" is the fixed phrase "in the name of / on behalf of". Reads a little crooked. | LOW | „Chrystus” w „Jezus Chrystus” — / czy to nazwisko Jezusa? |
| N02 | Imię na końcu / każdej modlitwy. | 모든 기도 끝의 / 이름. | Faithful, like en. | — | — |
| N03 | Chrystus to nie nazwisko. / To znaczy „Pomazaniec” — Mesyjasz. | 그리스도는 성이 아니다. / '기름 부음 받은 자'라는 뜻이다 — 메시야. | Faithful. *Pomazaniec* shares its root with "pomazał/pomażesz" in K1/K3/Q9, so the tie is visible. | — | — |
| T1 | Chrystus | 그리스도 | ok | — | — |
| N04 | Bóg ustanawiał królów, kapłanów i proroków, / pomazując ich oliwą. | 하나님은 왕들과 제사장들과 선지자들을 세우셨다, / 그들에게 (올리브)기름을 부으시며. | Faithful. *oliwą* matches K1 "róg z oliwą". | — | — |
| N06 | Wielu ludzi czekało na Mesyjasza / tylko jako na króla, który wypędzi Rzymian. | 많은 사람들이 메시야를 기다렸다 / 오직 로마인들을 몰아낼 왕으로서만. | Faithful. | — | — |
| N07 | Pewnego dnia, gdy Jezus już przyszedł, / Piotr złożył wyznanie. | 어느 날, 예수께서 이미 오셨을 때, / 베드로가 고백했다. | "gdy Jezus już przyszedł" can be read as "when Jesus had (just) arrived [somewhere]". | LOW | Pewnego dnia, już po przyjściu Jezusa, / Piotr złożył wyznanie. |
| N08 | Od tego czasu Jezus mówił, / że musi cierpieć i być zabitym, / a trzeciego dnia zmartwychwstać. | 그때부터 예수께서 말씀하셨다, / 고난받고 죽임을 당해야 하며 / 셋째 날에 부활해야 한다고. | Faithful. | — | — |
| N09 | Dla Piotra Chrystus, który umiera, / nie miał sensu. | 베드로에게 죽는 그리스도는 / 의미가 없었다(무의미했다). | With a person as subject, "X nie miał sensu" tips toward "Christ was pointless/meaningless". That is irreverent, and it is not the Korean "말이 안 됐다" (it didn't fit his idea of the Christ). The tense also clashes (umiera / nie miał). | MED | Dla Piotra umierający Chrystus / był nie do pomyślenia. |
| N10 | Lecz ta droga / była już zapisana. | 그러나 그 길은 / 이미 기록되어 있었다. | Faithful. | — | — |
| N11 | Na krzyżu — / wołanie Jezusa. | 십자가 위에서 — / 예수의 외침. | Faithful. | — | — |
| N12 | To wołanie to pierwszy wiersz psalmu, / który tysiąc lat wcześniej napisał / Dawid, pomazany król. | 이 외침은 시편의 첫 줄이다, / 천 년 앞서 쓴 / 기름 부음 받은 왕 다윗이. | Faithful. "To … to" is a clumsy double "to". | LOW | To wołanie jest pierwszym wierszem psalmu, / który tysiąc lat wcześniej napisał / Dawid, pomazany król. |
| N14 | Pod krzyżem żołnierze / rozdzielili Jego szaty, a o Jego suknię rzucili losy. | 십자가 아래에서 군인들이 / 그분의 옷을 나누고, 그분의 속옷을 두고 제비를 던졌다. | Faithful. The wording matches Gdańska Jn 19:23–24. | — | — |
| N20 | Piotr, który kiedyś mówił: „Zmiłuj się sam nad sobą”, / po spotkaniu ze zmartwychwstałym Jezusem głosił tak: | 한때 "스스로를 불쌍히 여기소서"라고 말하던 베드로가, / 부활하신 예수를 만난 뒤 이렇게 전했다: | Faithful. The echo of Q3's hl is exact. | — | — |
| N15 | Cierpiący Chrystus nie był porażką — / był drogą, którą wskazywało Pismo. | 고난받는 그리스도는 실패가 아니었다 — / 성경이 가리킨 길이었다. | Faithful. | — | — |
| N16K/P/R | Król, / Kapłan, / Prorok, | 왕, / 제사장, / 선지자, | ok | — | — |
| N16 | trzy urzędy / w jednej Osobie. | 세 직분이 / 한 위격 안에. | *trzy urzędy* is the standard Polish term for the threefold office (potrójny urząd Chrystusa). | — | — |
| N17 | „Chrystus” to nie nazwisko. / To wyznanie, / że Jezus jest właśnie tym Mesyjaszem. | '그리스도'는 성이 아니다. / 그것은 고백이다, / 예수가 바로 그 메시야라는. | Faithful. | — | — |

Quotes: every fragment, `voice` and `hl` reads sensibly. Q9's voice keeps "Jezusa z Nazaretu", and Q14's verb-final voice keeps "przez imię jego". No issues.

---

## ru — Синодальный (yv 400)

**Verdict: ready after 1 MED (N09).** Faithful, with a good church register. The point lands perfectly: Христос / Мессия (Ин 1:41
"мы нашли Мессию, что значит: Христос") / Помазанник / помазал (1 Цар 16:13, Деян 10:38) / елей.
*Три служения* is the standard term for Christ's threefold office. *в одном Лице* is correct (prepositional of *Лицо*, as in Trinitarian usage).
*вопль* (N11/N12) is the Synodal word of this very psalm (Пс 21:2 "слова вопля моего"), so keep it.

| id | current | back-translation (literal) | issue | severity | replacement |
|---|---|---|---|---|---|
| N01 | «Христос» в имени «Иисус Христос» — / это фамилия Иисуса? | '예수 그리스도'라는 이름 속 '그리스도' — / 이것은 예수의 성인가? | Faithful. | — | — |
| N02 | Имя, которым заканчивается / каждая молитва. | 모든 기도가 / 그것으로 끝나는 이름. | Faithful, natural. | — | — |
| N03 | Христос — не фамилия. / Это значит «Помазанник», Мессия. | 그리스도는 성이 아니다. / '기름 부음 받은 자', 메시야라는 뜻이다. | Faithful. | — | — |
| T1 | Христос | 그리스도 | ok | — | — |
| N04 | Бог поставлял царей, священников и пророков, / помазывая их елеем. | 하나님은 왕들과 제사장들과 선지자들을 세우셨다, / 그들에게 기름(елей)을 부으시며. | Faithful. *елей* matches K1/K2. | — | — |
| N06 | Многие ждали Мессию / лишь как царя, который изгонит римлян. | 많은 이들이 메시야를 기다렸다 / 오직 로마인을 쫓아낼 왕으로서만. | Faithful. | — | — |
| N07 | Однажды, когда Иисус уже пришёл, / Пётр исповедал свою веру. | 어느 날, 예수께서 이미 오셨을 때, / 베드로가 자기 믿음을 고백했다. | "когда Иисус уже пришёл" can read as "when Jesus had arrived [at a place]". "свою веру" is a small, natural addition. | LOW | Однажды, уже после прихода Иисуса, / Пётр исповедал свою веру. |
| N08 | С того времени Иисус говорил, / что Ему должно пострадать и быть убитым / и в третий день воскреснуть. | 그때부터 예수께서 말씀하셨다, / 그분이 고난받고 죽임을 당해야 하며 / 셋째 날에 부활해야 한다고. | Faithful. It echoes the Synodal wording of Мф 16:21. | — | — |
| N09 | Для Петра умирающий Христос / не имел никакого смысла. | 베드로에게 죽어 가는 그리스도는 / 아무런 의미도 없었다. | "не имел никакого смысла" says "had no meaning at all". With Christ as subject it sounds as if Christ were meaningless, and "никакого" adds emphasis the Korean doesn't have. | MED | Для Петра умирающий Христос / был немыслим. |
| N10 | Но этот путь / уже был записан. | 그러나 이 길은 / 이미 기록되어 있었다. | Faithful. | — | — |
| N11 | На кресте — / вопль Иисуса. | 십자가 위에서 — / 예수의 부르짖음. | Faithful. | — | — |
| N12 | Этот вопль — первая строка псалма, / написанного за тысячу лет до того / Давидом, помазанным царём. | 이 부르짖음은 시편의 첫 줄이다, / 그보다 천 년 전에 쓰인 / 기름 부음 받은 왕 다윗에 의해. | Faithful. | — | — |
| N14 | У креста воины / разделили Его одежды, а о хитоне бросили жребий. | 십자가 곁에서 군인들이 / 그분의 옷을 나누고, 속옷을 두고 제비를 던졌다. | Faithful. Matches Synodal Ин 19:23 (одежды, хитон) and Q7's "бросают жребий". | — | — |
| N20 | Пётр, который когда-то сказал: «будь милостив к Себе», / встретив воскресшего Иисуса, проповедовал вот что: | 한때 "자신을 아끼소서"라고 말했던 베드로가, / 부활하신 예수를 만나고, 이렇게 전했다: | Faithful. Russian direct speech in «» starts with a capital letter. | LOW | (with the cap fix below) …сказал: «Будь милостив к Себе», / … |
| N15 | Страдающий Христос — не поражение, / а путь, на который указывало Писание. | 고난받는 그리스도는 패배가 아니라, / 성경이 가리킨 길이다. | Faithful. | — | — |
| N16K/P/R | Царь, / Священник, / Пророк, | 왕, / 제사장, / 선지자, | ok | — | — |
| N16 | три служения — / в одном Лице. | 세 직분이 — / 한 위격 안에. | Correct theological terms. | — | — |
| N17 | «Христос» — не фамилия, / а исповедание того, / что Иисус и есть тот самый Мессия. | '그리스도'는 성이 아니라, / 고백이다, / 예수가 바로 그 메시야라는. | Faithful. | — | — |
| Q1 · Q3 · Q7 (+N20) | "мы нашли…" · "будь милостив…" · "делят ризы…" | — | These captions start with a lowercase letter because they are mid-verse fragments. As stand-alone captions, 55+ viewers expect a capital. check-quotes ignores case, but `hl` is case-sensitive, so Q3's hl must change with it. | LOW | Q1 text "Мы нашли Мессию, / что значит: Христос" · Q3 text "Будь милостив к Себе, Господи! / да не будет этого с Тобою!", voice "Будь милостив к Себе, Господи!", hl "Будь милостив к Себе" · Q7 text "Делят ризы мои между собою / и об одежде моей бросают жребий." · N20 «Будь милостив к Себе» |
| Q6 | Боже мой! Боже мой! [внемли мне] / для чего Ты оставил меня? | 내 하나님 내 하나님 [내게 귀 기울이소서] 어찌 나를 버리셨나이까 | Verbatim Synodal, and the brackets are part of the Synodal printing. But this screen exists to show "the same words" as Q5 ("Боже Мой, Боже Мой! для чего Ты Меня оставил?"), and the bracketed insertion breaks that echo. Optional: skip it with "…". | LOW | Боже мой! Боже мой! … / для чего Ты оставил меня? |

Other quotes: the K2 "[Моисей]" bracket is also Synodal printing. It can't be removed without losing "возлил", so keep it. K3 and Q9/Q11/Q12/Q14 fragments and voices are all fine. Q9's voice keeps "Иисуса из Назарета".

---

## tr — Kutsal Kitap (Yeni Çeviri, yv 170)

**Verdict: ready (no HIGH/MED).** In this Bible one word, **Mesih**, serves for both Christ and Messiah, so a two-word
pair cannot be shown. The film's point still lands, maybe even more directly. Jn 1:41 in this edition glosses
"Mesih, meshedilmiş anlamına gelir" ("Mesih means 'anointed'"). N03 "Mesih bir soyadı değildir. / “Meshedilmiş olan” demektir."
mirrors that gloss word for word, and meshetmek is the verb of K1/K2/K3/Q9. The translator was right to drop "— the Messiah" from N03, because it would repeat the same word.
"İsa Mesih" is the normal Turkish Christian name, and *kâhin* (priest) matches the site pack and this Bible.

| id | current | back-translation (literal) | issue | severity | replacement |
|---|---|---|---|---|---|
| N01 | “İsa Mesih” adındaki “Mesih” — / İsa'nın soyadı mı? | '예수 메시아(İsa Mesih)'라는 이름 속 '메시아' — / 예수의 성인가? | Faithful. | — | — |
| N02 | Her duanın sonundaki / o ad. | 모든 기도 끝에 있는 / 그 이름. | Faithful (Turkish prayers end "İsa Mesih'in adıyla"). | — | — |
| N03 | Mesih bir soyadı değildir. / “Meshedilmiş olan” demektir. | 메시아(그리스도)는 성이 아니다. / '기름 부음 받은 자'라는 뜻이다. | Faithful within the one-word constraint. It mirrors the Q1 gloss. | — | — |
| T1 | Mesih | 메시아(그리스도) | ok | — | — |
| N04 | Tanrı kralları, kâhinleri ve peygamberleri / yağla meshederek atadı. | 하나님은 왕들과 제사장들과 선지자들을 / 기름으로 기름 부어 세우셨다. | Faithful. | — | — |
| N06 | Birçok insan Mesih'i / yalnızca Roma'yı kovacak bir kral olarak bekliyordu. | 많은 사람들이 메시아를 / 오직 로마를 쫓아낼 왕으로만 기다리고 있었다. | Faithful. | — | — |
| N07 | İsa geldikten sonra bir gün / Petrus imanını ikrar etti. | 예수께서 오신 뒤 어느 날 / 베드로가 자기 믿음을 고백했다. | Faithful. "imanını" is a natural small addition. | — | — |
| N08 | O zamandan başlayarak İsa, / acı çekmesi, öldürülmesi / ve üçüncü gün dirilmesi gerektiğini söyledi. | 그때부터 예수께서 / 고난받고, 죽임을 당하고 / 셋째 날에 살아나야 한다고 말씀하셨다. | Faithful. | — | — |
| N09 | Petrus'a göre ölen bir Mesih / akla sığmazdı. | 베드로에게 죽는 메시아는 / 생각할 수도 없는 일이었다. | Faithful and natural. | — | — |
| N10 | Oysa o yol / çoktan yazılmıştı. | 그러나 그 길은 / 이미 오래전에 기록되어 있었다. | Faithful. | — | — |
| N11 | Çarmıhta, / İsa'nın haykırışı. | 십자가에서, / 예수의 부르짖음. | Faithful. | — | — |
| N12 | Bu haykırış, bin yıl önce / meshedilmiş kral Davut'un yazdığı / mezmurun ilk satırıdır. | 이 부르짖음은, 천 년 전 / 기름 부음 받은 왕 다윗이 쓴 / 시편의 첫 줄이다. | Faithful. | — | — |
| N14 | Çarmıhın dibinde askerler / O'nun giysilerini paylaştılar, mintanı için kura çektiler. | 십자가 아래에서 군인들이 / 그분의 옷을 나누고, 속옷을 두고 제비를 뽑았다. | Faithful. Matches Yu 19:23 "mintan" and Q7 "kura çekiyorlar". | — | — |
| N20 | Bir zamanlar “Tanrı korusun” diyen Petrus, / dirilen İsa'yla karşılaştıktan sonra şunu duyurdu: | 한때 "하나님이 막아 주시기를" 하던 베드로가, / 부활하신 예수를 만난 뒤 이것을 전했다: | Faithful. The echo of Q3's hl is exact. | — | — |
| N15 | Acı çeken Mesih bir yenilgi değil, / Kutsal Yazılar'ın gösterdiği yoldu. | 고난받는 메시아는 패배가 아니라, / 성경이 가리킨 길이었다. | Faithful. "Kutsal Yazılar" matches Lk 24:27 in this Bible. | — | — |
| N16K/P/R | Kral, / Kâhin, / Peygamber, | 왕, / 제사장, / 선지자, | ok | — | — |
| N16 | üç görev, / tek bir Kişide. | 세 직분이, / 오직 한 인격 안에. | Fine (*Mesih'in üç görevi* is the usual Turkish Protestant phrasing). | — | — |
| N17 | “Mesih” bir soyadı değil; / İsa'nın tam da o Mesih olduğunun / ikrarıdır. | '메시아'는 성이 아니다; / 예수가 바로 그 메시아라는 / 고백이다. | Faithful. Natural with one word. | — | — |
| Q1 | hl "Mesih" | — | In Korean/English the gold word is the gloss ("그리스도"/"Christ"). In this verse the gloss is **meshedilmiş**, which is exactly the word N03 picks up. "Mesih" also occurs twice in the line. Lighting the gloss makes the film's point visible. | LOW | hl "meshedilmiş" |

Other quotes: all sensible. Q2/Q13 voice is the whole clause "Sen, yaşayan Tanrı'nın Oğlu Mesih'sin" because Turkish is verb-final. That is right.
Q11: this Bible says "çarmıha gerip" (crucified), not "on a tree". hl "çarmıha gerip" is fine and suits the cross-shadow picture.
Q9/Q14 keep "Nasıralı İsa" / "O'nun adıyla".

---

## uz — OʻzbMK (yv 1939)

**Verdict: ready after 1 MED (N03).** Faithful and natural. In this Bible one word, **Masih**, serves for both Christ and Messiah.
Jn 1:41 glosses it as **“Xudoning tanlagani”** ("God's chosen one"), not "anointed". The verb for anoint is the descriptive
**boshiga moy surtmoq** ("smear oil on the head", 1 Shoh 16:13, 3 Shoh 19:16). Acts 10:38 says **toʻldirgan** ("filled") instead of "anointed".
The edition does join the two ideas itself. At 1 Shoh 16:12 God says "uning boshiga moy surtib tanla!" ("smear oil on his head and *choose* him"), and
Ps 2:2 / Acts 4:27 render "anointed" as "U tanlagan" / "Masih qilib tanlagan". So "chosen by oil on the head" is this Bible's own way
of saying "anointed". N03 should say that clearly, because it is the only place the bridge can be built.
Prayer = *ibodat* (site pack, Mt 6:9). Scripture = *Muqaddas bitiklar* (Jn 5:39, Jn 19:24). Divine Person = *Zot* (site pack).

| id | current | back-translation (literal) | issue | severity | replacement |
|---|---|---|---|---|---|
| N01 | “Iso Masih” ismidagi “Masih” — / Isoning familiyasimi? | '예수 메시아(Iso Masih)'라는 이름 속 '메시아' — / 예수의 성인가? | Faithful. | — | — |
| N02 | Har bir ibodat oxiridagi / oʻsha ism. | 모든 기도 끝의 / 그 이름. | Faithful. | — | — |
| N03 | Masih familiya emas. / Bu — boshiga moy surtilgan, “Xudoning tanlagani” degani. | 메시아는 성이 아니다. / 이것은 — 머리에 기름이 발린, '하나님이 택하신 자'라는 뜻이다. | Meaning is right, but the grammar leaves the link loose. "boshiga moy surtilgan" hangs as a bare participle, so it reads as two separate labels ("oiled, God's-chosen"), not as one idea. The film rests on this line (rule 2): show that the oil is *how* God chose. This Bible says exactly that at 1 Shoh 16:12 ("boshiga moy surtib tanla"). | MED | Masih familiya emas. / Bu — “Xudoning tanlagani”, boshiga moy surtib tanlangan Zot degani. |
| T1 | Masih | 메시아(그리스도) | ok | — | — |
| N04 | Xudo shohlar, ruhoniylar va paygʻambarlarni / boshiga moy surtish orqali tayinlagan. | 하나님은 왕들과 제사장들과 선지자들을 / 머리에 기름을 바르는 것을 통해 세웠다(고 한다). | Faithful. The bare *-gan* past reads as reported or indefinite. A plain narrative past is steadier, and it echoes K1 "boshiga moy surtdi". | LOW | Xudo shohlar, ruhoniylar va paygʻambarlarni / boshiga moy surtib tayinladi. |
| N06 | Koʻp odamlar Masihni / faqat Rimni quvib chiqaradigan shoh deb kutishgan. | 많은 사람들이 메시아를 / 오직 로마를 몰아낼 왕으로 여기며 기다렸다. | Faithful. | — | — |
| N07 | Iso kelganidan keyin bir kuni / Butrus imonini eʼtirof etdi. | 예수께서 오신 뒤 어느 날 / 베드로가 자기 믿음을 고백했다. | Faithful. | — | — |
| N08 | Shundan boshlab Iso Oʻzi azob chekishi, / oʻldirilishi / va uchinchi kuni tirilishi kerakligini aytdi. | 그때부터 예수께서는 자신이 고난받고, / 죽임을 당하고 / 셋째 날에 살아나야 한다고 말씀하셨다. | Faithful. | — | — |
| N09 | Butrus uchun oʻladigan Masih / aqlga sigʻmas edi. | 베드로에게 죽을 메시아는 / 생각할 수 없는 일이었다. | Faithful and natural. | — | — |
| N10 | Biroq bu yoʻl / allaqachon yozib qoʻyilgan edi. | 그러나 이 길은 / 이미 기록되어 있었다. | Faithful. | — | — |
| N11 | Xochda — / Isoning faryodi. | 십자가에서 — / 예수의 부르짖음. | Faithful. "faryod" matches Mt 27:46 "faryod qildi". | — | — |
| N12 | Bu faryod — ming yil oldin / boshiga moy surtilgan shoh Dovud yozgan / sanoning birinchi satri. | 이 부르짖음은 — 천 년 전 / 머리에 기름 부음 받은 왕 다윗이 쓴 / 시의 첫 줄. | Faithful. | — | — |
| N14 | Xoch ostida askarlar / Uning kiyimlarini boʻlishib, ichki koʻylagi uchun qurʼa tashladilar. | 십자가 아래에서 군인들이 / 그분의 옷을 나누고, 속옷을 두고 제비를 던졌다. | Faithful. Matches Yuh 19:23–24 and Q7. | — | — |
| N20 | Bir vaqtlar “Xudo saqlasin!” degan Butrus / tirilgan Iso bilan uchrashgach, mana shuni eʼlon qildi: | 한때 "하나님이 지키시기를!" 하던 베드로가 / 부활하신 예수를 만난 뒤 바로 이것을 선포했다: | Faithful. The echo of Q3's hl is exact. | — | — |
| N15 | Azob chekkan Masih magʻlubiyat emas, / Muqaddas bitiklar koʻrsatgan yoʻl edi. | 고난받은 메시아는 실패가 아니라, / 성경이 가리킨 길이었다. | Faithful. | — | — |
| N16K/P/R | Shoh, / Ruhoniy, / Paygʻambar, | 왕, / 제사장, / 선지자, | ok | — | — |
| N16 | uch xizmat — / bir Zotda. | 세 직분 — / 한 분 안에. | Faithful. | — | — |
| N17 | “Masih” familiya emas, / balki Iso aynan oʻsha Masih ekanini / eʼtirof etishdir. | '메시아'는 성이 아니라, / 예수가 바로 그 메시아임을 / 고백하는 것이다. | Faithful. | — | — |
| Q1 | hl "Masih" | — | Same reason as tr: the gloss **Xudoning tanlagani** is the word N03 now picks up. | LOW | hl "Xudoning tanlagani" |
| Q9 | hl "toʻldirganini" | Xudo Nosiralik Isoni Muqaddas Ruh va kuch-qudrat bilan qanday 채우셨는지 아십니다 … | This Bible has "filled", not "anointed", so the verbal tie to N04/N12 is lost here. It can't be fixed in the text (verbatim). The gold-oil light of the picture carries it, and N03 (as fixed) has already said Masih = the one chosen with oil. Keep as is. | LOW | (no change) |

Other quotes: K2 ends on the converb "surtib", and Q12 on "tiriltirib". That matches the Korean connective endings ("붓고", "살리사"), so it's acceptable.
K3's voice starts at "Elishayning", contiguous with the verse, and reads well.
Q6 shows "Ey Xudoyim!" only once. That is verbatim OʻzbMK Ps 21:2, and the echo of Q5 is still clear.

---

## id — Terjemahan Baru (yv 306)

**Verdict: ready after 1 MED (Q9).** Faithful and natural. The point lands well, and TB's own wording helps.
Jn 1:41 "Mesias (artinya: Kristus)" sets the pair. N03 adds "Yang Diurapi", the same root as *mengurapi* in K1/K3/Q9.
TB Mt 16:16 says "Engkau adalah **Mesias**", so the closing N17 ("Kristus bukan nama belakang, melainkan pengakuan bahwa Yesuslah
Mesias itu") followed by Q13 "Engkau adalah Mesias" closes the loop exactly. The switch to *Mesias* in N09/N15 follows that verse and is right.
*nama belakang* (last name) suits Indonesian, where many people have no family name. *tiga jabatan* is the standard Reformed term.

| id | current | back-translation (literal) | issue | severity | replacement |
|---|---|---|---|---|---|
| N01 | “Kristus” dalam “Yesus Kristus” — / apakah itu nama belakang Yesus? | '예수 그리스도' 안의 '그리스도' — / 그것은 예수의 뒷이름(성)인가? | Faithful. | — | — |
| N02 | Nama di akhir / setiap doa. | 모든 기도 끝의 / 이름. | Faithful, but terse. The Korean "늘 붙는 그 이름" (the name always said) is a little warmer, and Indonesian Christians say "dalam nama Yesus" aloud. | LOW | Nama yang selalu disebut / di akhir setiap doa. |
| N03 | Kristus bukan nama belakang. / Artinya “Yang Diurapi” — Mesias. | 그리스도는 뒷이름이 아니다. / 뜻은 '기름 부음 받은 이' — 메시아. | Faithful. | — | — |
| T1 | Kristus | 그리스도 | ok | — | — |
| N04 | Allah mengangkat raja, imam, dan nabi / melalui pengurapan dengan minyak. | 하나님은 왕, 제사장, 선지자를 세우셨다 / 기름으로 기름 부음을 통해. | Faithful. | — | — |
| N06 | Banyak orang menantikan Mesias / hanya sebagai raja yang akan mengusir Roma. | 많은 사람들이 메시아를 기다렸다 / 오직 로마를 몰아낼 왕으로서만. | Faithful. In Indonesian "Roma" alone is the city, and "mengusir Roma" is a slightly odd metonymy. TB's own term is "orang-orang Roma" (Yoh 11:48). | LOW | Banyak orang menantikan Mesias / hanya sebagai raja yang akan mengusir orang Roma. |
| N07 | Suatu hari, setelah Yesus datang, / Petrus menyatakan pengakuannya. | 어느 날, 예수께서 오신 뒤, / 베드로가 그의 고백을 말했다. | Faithful. | — | — |
| N08 | Sejak saat itu Yesus berkata / bahwa Ia harus menderita dan dibunuh, / lalu bangkit pada hari ketiga. | 그때부터 예수께서 말씀하셨다 / 그분이 고난받고 죽임을 당하고, / 셋째 날에 살아나야 한다고. | Faithful. | — | — |
| N09 | Bagi Petrus, Mesias yang mati / tidak masuk akal. | 베드로에게 죽는 메시아는 / 말이 되지 않았다. | Faithful. | — | — |
| N10 | Tetapi jalan itu / sudah lebih dahulu tertulis. | 그러나 그 길은 / 이미 먼저 기록되어 있었다. | Faithful. | — | — |
| N11 | Di atas kayu salib, / seruan Yesus. | 십자가 위에서, / 예수의 부르짖음. | Faithful. | — | — |
| N12 | Seruan ini adalah baris pertama mazmur / yang ditulis seribu tahun sebelumnya / oleh Daud, raja yang diurapi. | 이 부르짖음은 시편의 첫 줄이다 / 그보다 천 년 전에 쓰인 / 기름 부음 받은 왕 다윗에 의해. | Faithful. | — | — |
| N14 | Di bawah salib, para prajurit / membagi-bagi pakaian-Nya dan membuang undi atas jubah-Nya. | 십자가 아래에서 군인들이 / 그분의 옷을 나누고 그분의 겉옷을 두고 제비를 뽑았다. | Faithful. Matches TB Yoh 19:23 (pakaian / jubah) and Q7 "membuang undi". | — | — |
| N20 | Petrus, yang dulu berkata “Kiranya Allah menjauhkan hal itu”, / setelah bertemu Yesus yang bangkit, memberitakan ini: | 전에 "하나님께서 그 일을 멀리하시기를" 하던 베드로가, / 부활하신 예수를 만난 뒤 이것을 전했다: | Faithful. The echo of Q3's hl is exact. | — | — |
| N15 | Mesias yang menderita bukanlah kegagalan, / melainkan jalan yang ditunjukkan Kitab Suci. | 고난받는 메시아는 실패가 아니라, / 성경이 가리킨 길이다. | Faithful. | — | — |
| N16K/P/R | Raja, / Imam, / Nabi, | 왕, / 제사장, / 선지자, | ok | — | — |
| N16 | tiga jabatan, / dalam satu Pribadi. | 세 직분이, / 한 인격 안에. | Faithful. | — | — |
| N17 | “Kristus” bukan nama belakang, / melainkan pengakuan / bahwa Yesuslah Mesias itu. | '그리스도'는 뒷이름이 아니라, / 고백이다 / 예수가 바로 그 메시아라는. | Faithful. | — | — |
| Q9 | text "… Yesus dari Nazaret: / … Allah mengurapi Dia dengan Roh Kudus dan kuat kuasa, / Dia, yang berjalan berkeliling sambil berbuat baik …" · voice "Allah mengurapi Dia dengan Roh Kudus dan kuat kuasa, Dia, yang berjalan berkeliling sambil berbuat baik" | 하나님이 그분에게 성령과 능력으로 기름 부으셨다, 그분, 두루 다니며 선을 행하신 분 | The caption shows `voice`, so viewers read "Allah mengurapi **Dia**" and never see whose name it is. The Korean shows "나사렛 예수에게". Viewers who don't know Acts 10 can't tell who "Dia" is, and this is the verse that says God anointed *Jesus*. The double "…" in `text` is also choppy, because the verse reads straight on: "Yesus dari Nazaret: bagaimana Allah mengurapi Dia …". A contiguous fragment keeps the name in both. | MED | text: `… Yesus dari Nazaret: bagaimana Allah mengurapi Dia / dengan Roh Kudus dan kuat kuasa, / Dia, yang berjalan berkeliling sambil berbuat baik …` · voice: `Yesus dari Nazaret: bagaimana Allah mengurapi Dia dengan Roh Kudus dan kuat kuasa, Dia, yang berjalan berkeliling sambil berbuat baik` · hl `mengurapi` (unchanged). Both are contiguous in TB Kis 10:38. |

Other quotes: all sensible. Q2/Q13 hl "Mesias" is right for TB. Q11 "menggantung Dia pada kayu salib" (TB names the cross) suits the picture.
Q14 keeps "oleh karena nama-Nya".

---

## Notes for the main session
- After applying fixes, re-run `node motion/films/check-quotes.mjs christ <code>` for **ru** (Q1/Q3/Q6/Q7 if taken) and **id** (Q9), and for **tr/uz** if the Q1 hl changes (the hl check is case-sensitive).
- The film's point by language. pl/ru/id show a real Christ/Messiah pair plus an "anoint" root that recurs in the verses. tr carries it through the Jn 1:41 gloss
  "meshedilmiş". uz depends on N03 (MED) to tie "Xudoning tanlagani" to the oil, because its Acts 10:38 says "filled".
