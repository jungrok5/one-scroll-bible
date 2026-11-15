# 「그리스도」 (christ) — native review: es · pt-BR (voice + captions) · fr · it · de (captions)

Reviewer: one native-speaking evangelical/Reformed Bible teacher per language. Report only: no language file was edited.
Sources: `motion/films/christ/script.json` (Korean) · `motion/films/christ/i18n/en.json` (reviewed English) ·
`motion/films/christ/i18n/<code>.json` · the translator's `backtr-<code>.md` · `CAPTIONS-BRIEF.md` · site packs `i18n/<code>.json`.
Audience: Christians 55+ who don't know the Bible well.

How captions are built (`motion/films/captions-on-ko.mjs`): a quote's caption is its **`voice` when present, else `text`**, and `/` becomes a line break.
For es and pt-BR the same `voice` is also what the quote voice **says**. So a `voice` has to read well on its own and also sound right when spoken.

`node motion/films/check-quotes.mjs christ <code>`: **all 15 quotes `ok` in all five languages** (re-run 2026-11-15).
I fetched every verse again with `fetch-verse.mjs` (es 149, pt-BR 212, fr 93, it 122, de 51). Each fragment, `voice` and `hl` reads sensibly in its verse.
The one exception is es Q9 below. The es Q9 replacement passes the same check: I tested it against the fetched verse with check-quotes' own normalisation.
Cite book names and the "1:41" / "1,41" style match each site pack. Digits are ASCII in every pack. The only digits in these lines are P4 "700" and the cites.

**Totals: HIGH 0 · MED 4 · LOW 14.**

| lang | HIGH | MED | LOW | HIGH/MED ids |
|---|---|---|---|---|
| es | 0 | 2 | 3 | N20, Q9 |
| pt-BR | 0 | 1 | 3 | N20 |
| fr | 0 | 0 | 2 | — |
| it | 0 | 0 | 4 | — |
| de | 0 | 1 | 2 | Q6+Q7 (cites, counted as one item) |

---

## es — Reina-Valera 1960 (yv 149) · voice + captions

**Verdict: ready after 2 MED (N20, Q9).** Faithful to the Korean, reverent, and easy to say at a calm pace. The point lands very well.
RVR Jn 1:41 gives the pair itself, "Mesías (que traducido es, el Cristo)". N03 «el Ungido» shares a root with *ungió/ungirás* in K1/K3/Q9 and
with *aceite de la unción* in K2/L2N. Writing "Jesucristo" as one word in N01 even strengthens the "is it a surname?" question.
N08 "padecer … ser muerto, y resucitar al tercer día" echoes RVR Mt 16:21. N14 "vestidos / túnica / echaron suertes" echoes RVR Jn 19:23-24 and Ps 22:18.
The labels (P1 Andrés/Simón, P3 Cesarea de Filipo = RVR Mt 16:13, P4, P5, P7, L1–L4, L2N, E1) are correct. B1 "La Biblia de un vistazo" matches the site pack.

| id | current | back-translation (literal) | issue | severity | replacement |
|---|---|---|---|---|---|
| N01 | El «Cristo» de «Jesucristo», / ¿es el apellido de Jesús? | '예수그리스도'의 '그리스도', / 예수님의 성인가요? | Faithful. | — | — |
| N02 | El nombre al final / de cada oración. | 모든 기도 끝의 / 그 이름. | *Oración* also means "sentence". Spoken as the film's second line, it can briefly sound like "the name at the end of every sentence". The church context mostly saves it. | LOW | El nombre que siempre decimos / al terminar de orar. (우리가 기도를 마칠 때 늘 말하는 그 이름) |
| N03 | Cristo no es un apellido. / Significa «el Ungido»: el Mesías. | 그리스도는 성이 아닙니다. / '기름 부음 받은 자', 곧 메시야라는 뜻입니다. | Faithful, and it ties to Q1. | — | — |
| N04 | Dios establecía reyes, sacerdotes y profetas / ungiéndolos con aceite. | 하나님은 왕과 제사장과 선지자를 / 기름을 부어 세우곤 하셨습니다. | Faithful. The imperfect tense ("used to set apart") suits a practice that was repeated. | — | — |
| N06 | Muchos esperaban al Mesías / solo como un rey que expulsaría a Roma. | 많은 이들이 메시야를 / 로마를 몰아낼 왕으로만 기다렸습니다. | Faithful. | — | — |
| N07 | Un día, después de que Jesús vino, / Pedro hizo una confesión. | 예수님이 오신 뒤 어느 날, / 베드로가 고백을 하나 했습니다. | "…que Jesús vino" sounds a little clumsy aloud. *Vino* can also be heard as "wine". "Hizo una confesión" on its own can sound like "admitted something". | LOW | Un día, cuando Jesús ya había venido, / Pedro hizo una confesión de fe. |
| N08 | Desde entonces Jesús dijo / que debía padecer y ser muerto, / y resucitar al tercer día. | 그때부터 예수님은 / 고난받고 죽임을 당하고 / 제삼일에 살아나야 한다고 말씀하셨습니다. | Faithful, and it echoes RVR Mt 16:21. | — | — |
| N09 | Para Pedro, un Cristo que muere / no tenía sentido. | 베드로에게 죽는 그리스도는 / 말이 안 됐습니다. | Faithful. | — | — |
| N10 | Pero ese camino / ya estaba escrito. | 그런데 그 길은 / 이미 기록되어 있었습니다. | Faithful. | — | — |
| N11 | En la cruz, / el clamor de Jesús. | 십자가에서, / 예수님의 외침. | Faithful. | — | — |
| N12 | Este clamor es la primera línea de un salmo / escrito mil años antes / por David, el rey ungido. | 이 외침은 천 년 전 / 기름 부음 받은 왕 다윗이 쓴 / 한 시편의 첫 줄입니다. | Faithful. | — | — |
| N14 | Al pie de la cruz, los soldados / repartieron sus vestidos y echaron suertes sobre su túnica. | 십자가 아래서 군인들이 / 그의 옷들을 나누고 그의 속옷을 두고 제비를 뽑았습니다. | Faithful, and it echoes Jn 19 and Ps 22:18. | — | — |
| N20 | Pedro, que había dicho «ten compasión de ti», / tras encontrarse con Jesús resucitado, predicó esto: | '자신을 불쌍히 여기라'고 말했던 베드로가 / 부활하신 예수님을 만난 뒤 이것을 전했습니다: | Heard aloud, «ten compasión de ti» without "Señor" doesn't say who *ti* is. It can sound like Peter told someone, or himself, to take pity on himself. Q3 is about 40 seconds earlier. With "Señor," it is clearly Peter's words to Jesus, word for word from Q3. | MED | Pedro, que había dicho «Señor, ten compasión de ti», / tras encontrarse con Jesús resucitado, predicó esto: |
| N15 | El Cristo que padeció no fue un fracaso: / era el camino que señalaban las Escrituras. | 고난받은 그리스도는 실패가 아니었습니다: / 성경이 가리키던 길이었습니다. | Faithful. | — | — |
| N16K–N16 | Rey, / Sacerdote, / Profeta, / tres oficios, / en una sola Persona. | 왕, 제사장, 선지자, 세 직분이, 단 한 분 안에. | Faithful. "Triple oficio" is the standard Reformed term in Spanish. | — | — |
| N17 | «Cristo» no es un apellido. / Es la confesión / de que Jesús es precisamente ese Mesías. | '그리스도'는 성이 아닙니다. / 예수님이 바로 그 메시야라는 / 고백입니다. | Faithful. | — | — |
| T1 | Cristo | 그리스도 | — | — | — |
| K3 | voice "ungirás para que sea profeta en tu lugar." | 너를 대신하여 선지자가 되게 하도록 기름을 부으라 | The spoken voice doesn't name Elisha, though the Korean voice "엘리사에게 기름을 부어" does. en.json made the same choice. The contiguous alternative "a Eliseo hijo de Safat, de Abel-mehola, ungirás…" adds hard names to the voice. Keep as is. | LOW | (no change) |
| Q9 | text "… Dios ungió con el Espíritu Santo y con poder / a Jesús de Nazaret, / y cómo este anduvo haciendo bienes …" · voice "Dios ungió … a Jesús de Nazaret, y cómo este anduvo haciendo bienes" | 하나님이 성령과 능력으로 나사렛 예수에게 기름 부으셨다, 그리고 그가 어떻게 선한 일을 행하며 다녔는지 … | The verse's first "cómo" was cut and the second kept. Spoken and shown, it reads as "God anointed Jesus …, **and how** he went about doing good", which is ungrammatical. Starting at the verse's own "cómo" gives the parallel "how God anointed … and how he went about doing good". That works as a quoted fragment and matches de "wie Gott…" and it "come Dio…". Verified verbatim. `hl` "ungió" is unchanged. | MED | text: … cómo Dios ungió con el Espíritu Santo y con poder / a Jesús de Nazaret, / y cómo este anduvo haciendo bienes … · voice: cómo Dios ungió con el Espíritu Santo y con poder a Jesús de Nazaret, y cómo este anduvo haciendo bienes |

Other quotes: they are fine to say aloud. The voices of Q2, Q3, Q5 and Q14 are natural. Q5's voice rightly leaves out the Aramaic.
Q11 "a quien mataron…" starts with a relative pronoun, but it follows Q9 directly, so it reads as a continuation. Q4 hl "herido" is RVR's word for "pierced". Q3 "ten compasión de ti" is RVR's form of "far be it". Q9 hl is the verb *ungió*.

---

## pt-BR — Almeida Revista e Corrigida (yv 212) · voice + captions

**Verdict: ready after 1 MED (N20).** Faithful, warm, and easy to say. The point lands well. Almeida Jn 1:41 "Messias (que, traduzido, é o Cristo)" gives the pair.
N03 «o Ungido» ties to *ungiu/ungirás* in K1/K3/Q9. Using "azeite" throughout (N04, K1, L2N, K2) follows Almeida, and it stays consistent.
N08 echoes ARC Mt 16:21, and N14 echoes ARC Jn 19 and Ps 22:18. The labels are correct: André/Simão, Cesareia de Filipe = ARC Mt 16:13, Davi, Arão, Eliseu.
B1 "A Bíblia num relance" matches the site pack. The «» marks match the site pack's own usage.

| id | current | back-translation (literal) | issue | severity | replacement |
|---|---|---|---|---|---|
| N01 | O «Cristo» de «Jesus Cristo» — / é o sobrenome de Jesus? | '예수 그리스도'의 '그리스도' — / 예수님의 성인가요? | Faithful. *Sobrenome* is the right BR word. | — | — |
| N02 | O nome no fim / de cada oração. | 모든 기도 끝의 / 그 이름. | Same small ambiguity as es: *oração* also means "sentence". | LOW | O nome que sempre dizemos / ao terminar de orar. |
| N03 | Cristo não é sobrenome. / Significa «o Ungido» — o Messias. | 그리스도는 성이 아닙니다. / '기름 부음 받은 자', 메시야라는 뜻입니다. | Faithful. | — | — |
| N04 | Deus estabelecia reis, sacerdotes e profetas / ungindo-os com azeite. | 하나님은 왕과 제사장과 선지자를 / 기름을 부어 세우곤 하셨습니다. | Faithful. | — | — |
| N06 | Muitos esperavam o Messias / apenas como um rei que expulsaria Roma. | 많은 이들이 메시야를 / 로마를 몰아낼 왕으로만 기다렸습니다. | Faithful. | — | — |
| N07 | Certo dia, depois que Jesus veio, / Pedro fez uma confissão. | 예수님이 오신 뒤 어느 날, / 베드로가 고백을 하나 했습니다. | Works, but "fez uma confissão" alone can sound like "admitted something". | LOW | Certo dia, quando Jesus já tinha vindo, / Pedro fez uma confissão de fé. |
| N08 | Desde então, Jesus disse / que devia padecer e ser morto / e ressuscitar ao terceiro dia. | 그때부터 예수님은 / 고난받고 죽임을 당하고 / 제삼일에 살아나야 한다고 말씀하셨습니다. | Faithful (ARC wording). | — | — |
| N09 | Para Pedro, um Cristo que morre / não fazia sentido. | 베드로에게 죽는 그리스도는 / 말이 안 됐습니다. | Faithful. | — | — |
| N10 | Mas esse caminho / já estava escrito. | 그런데 그 길은 / 이미 기록되어 있었습니다. | Faithful. | — | — |
| N11 | Na cruz, / o clamor de Jesus. | 십자가에서, / 예수님의 외침. | Faithful. | — | — |
| N12 | Esse clamor é a primeira linha de um salmo / escrito mil anos antes / por Davi, o rei ungido. | 이 외침은 천 년 전 / 기름 부음 받은 왕 다윗이 쓴 / 한 시편의 첫 줄입니다. | Faithful. | — | — |
| N14 | Ao pé da cruz, os soldados / repartiram as suas vestes e lançaram sortes sobre a sua túnica. | 십자가 아래서 군인들이 / 그의 옷들을 나누고 그의 속옷을 두고 제비를 뽑았습니다. | Faithful. | — | — |
| N20 | Pedro, que um dia disse «tem compaixão de ti», / depois de encontrar Jesus ressuscitado, pregou isto: | 한때 '자신을 불쌍히 여기라'고 말했던 베드로가 / 부활하신 예수님을 만난 뒤 이것을 전했습니다: | Same as es: spoken without "Senhor", it's unclear who *ti* is. Adding it makes the line Q3's words exactly. | MED | Pedro, que um dia disse «Senhor, tem compaixão de ti», / depois de encontrar Jesus ressuscitado, pregou isto: |
| N15 | O Cristo que padeceu não foi um fracasso: / era o caminho apontado pelas Escrituras. | 고난받은 그리스도는 실패가 아니었습니다: / 성경이 가리킨 길이었습니다. | Faithful. | — | — |
| N16K–N16 | Rei, / Sacerdote, / Profeta, / três ofícios, / em uma só Pessoa. | 왕, 제사장, 선지자, 세 직분이, 단 한 분 안에. | Faithful (standard "tríplice ofício"). | — | — |
| N17 | «Cristo» não é sobrenome. / É a confissão / de que Jesus é justamente esse Messias. | '그리스도'는 성이 아닙니다. / 예수님이 바로 그 메시야라는 / 고백입니다. | Faithful. | — | — |
| T1 | Cristo | 그리스도 | — | — | — |
| Q9 | "… com o Espírito Santo e com virtude" | 성령과 덕(능력)으로 | In ARC, *virtude* is the old word for "power" (dynamis). A modern listener may hear "virtue". It's verbatim and the narration doesn't depend on it, so keep it. | LOW | (no change) |

Other quotes: K1 "vaso do azeite" is ARC's word for the horn. K3's voice "ungirás profeta em teu lugar." is fine to say. The Q2, Q3, Q5, Q13 and Q14 voices are natural, and Q5 leaves out the Aramaic.

---

## fr — Louis Segond 1910 (yv 93) · captions

**Verdict: ready (LOW only).** Faithful, natural, and reverent. The point lands: LSG Jn 1:41 "le Messie (ce qui signifie Christ)" gives the pair.
N03 « l'Oint » ties to *oignit / tu oindras / a oint* in K1/K3/Q9. **Psalm numbering is right**: LSG counts the superscription, so the cites are Ps 22:2 / 22:19 with `usfm` PSA.22.2 / PSA.22.19.
I confirmed this by fetching: in this edition PSA.22.1 is "Au chef des chantres…". N14 echoes LSG Jn 19:24 "Ils se sont partagé mes vêtements… tiré au sort ma tunique".
N20 echoes Q3's « A Dieu ne plaise » exactly.

| id | current | back-translation (literal) | issue | severity | replacement |
|---|---|---|---|---|---|
| N01 | Le « Christ » de « Jésus-Christ » — / est-ce le nom de famille de Jésus ? | '예수-그리스도'의 '그리스도' — / 그것이 예수님의 성인가요? | Faithful. | — | — |
| N02 | Le nom à la fin / de chaque prière. | 모든 기도 끝의 / 그 이름. | Faithful. | — | — |
| N03 | Christ n'est pas un nom de famille. / Cela signifie « l'Oint » — le Messie. | 그리스도는 성이 아닙니다. / '기름 부음 받은 자' — 메시야라는 뜻입니다. | Faithful. | — | — |
| N04 | Dieu établissait les rois, les prêtres et les prophètes / en les oignant d'huile. | 하나님은 왕과 제사장과 선지자를 / 기름을 부어 세우곤 하셨습니다. | Faithful. *Prêtre* is not LSG's OT word (*sacrificateur*), but none of the film's verses has the word, and the site pack uses *prêtre*. Fine for this audience. | LOW | (no change) |
| N06 | Beaucoup attendaient le Messie / seulement comme un roi qui chasserait Rome. | 많은 이들이 메시야를 / 로마를 몰아낼 왕으로만 기다렸습니다. | Faithful. | — | — |
| N07 | Un jour, après la venue de Jésus, / Pierre a fait une confession. | 예수님이 오신 뒤 어느 날, / 베드로가 고백을 하나 했습니다. | "Faire une confession" alone first suggests admitting a fault, or the sacrament. "Confession de foi" is the clear, familiar Protestant phrase. | LOW | Un jour, après la venue de Jésus, / Pierre a fait une confession de foi. |
| N08 | Dès lors, Jésus a dit / qu'il devait souffrir, être mis à mort, / et ressusciter le troisième jour. | 그때부터 예수님은 / 고난받고 죽임을 당하고 / 제삼일에 살아나야 한다고 말씀하셨습니다. | Faithful (echoes LSG Mt 16:21). | — | — |
| N09 | Pour Pierre, un Christ qui meurt, / cela n'avait pas de sens. | 베드로에게 죽는 그리스도란, / 말이 안 됐습니다. | Faithful. | — | — |
| N10 | Mais ce chemin / était déjà écrit. | 그런데 그 길은 / 이미 기록되어 있었습니다. | Faithful and idiomatic. | — | — |
| N11 | Sur la croix, / le cri de Jésus. | 십자가 위에서, / 예수님의 외침. | Faithful. | — | — |
| N12 | Ce cri est le premier vers d'un psaume / écrit mille ans plus tôt / par David, le roi oint. | 이 외침은 천 년 앞서 / 기름 부음 받은 왕 다윗이 쓴 / 한 시편의 첫 구절입니다. | Faithful. | — | — |
| N14 | Au pied de la croix, les soldats / se sont partagé ses vêtements et ont tiré au sort sa tunique. | 십자가 아래서 군인들이 / 그의 옷들을 나눠 갖고 그의 속옷을 제비 뽑았습니다. | Faithful. The past-participle agreement is correct. | — | — |
| N20 | Pierre, qui avait dit « A Dieu ne plaise », / après avoir rencontré Jésus ressuscité, a prêché ceci : | '하나님이 그것을 원치 않으시기를'이라 했던 베드로가 / 부활하신 예수님을 만난 뒤 이것을 전했습니다: | Faithful, and it echoes Q3. Narration would normally write "À", but keeping LSG's "A" matches the Q3 caption. | — | — |
| N15 | Le Christ souffrant n'était pas un échec : / c'était le chemin annoncé par les Écritures. | 고난받는 그리스도는 실패가 아니었습니다: / 성경이 미리 알린 길이었습니다. | Faithful. | — | — |
| N16K–N16 | Roi, / Prêtre, / Prophète, / trois offices, / en une seule Personne. | 왕, 제사장, 선지자, 세 직분이, 단 한 분 안에. | Faithful ("le triple office du Christ"). | — | — |
| N17 | « Christ » n'est pas un nom de famille. / C'est la confession / que Jésus est bien ce Messie. | '그리스도'는 성이 아닙니다. / 예수님이 바로 그 메시야라는 / 고백입니다. | Faithful. | — | — |
| T1 | Christ | 그리스도 | — | — | — |

Quotes: K3's caption (= voice) "tu oindras Élisée, fils de Schaphath, d'Abel-Mehola, pour prophète à ta place." names Elisha and the verb, which is better than en.
The Q2, Q3, Q5, Q9, Q11 and Q14 fragments read well as stand-alone captions.

---

## it — Nuova Riveduta (yv 122) · captions

**Verdict: ready (LOW only).** Faithful and reverent. The point lands: NR Jn 1:41 «Abbiamo trovato il Messia» (che tradotto vuol dire «Cristo») gives the pair.
N03 «l'Unto» ties to *unse / ungerai / lo ha unto* in K1/K3/Q9. Psalm numbering is right: NR keeps the superscription inside v1, so the cites are 22:1 / 22:18.
N14 echoes NR Jn 19:24. A few word choices could be more idiomatic. They are below and all optional.

| id | current | back-translation (literal) | issue | severity | replacement |
|---|---|---|---|---|---|
| N01 | Il «Cristo» di «Gesù Cristo»: / è il cognome di Gesù? | '예수 그리스도'의 '그리스도': / 예수님의 성인가요? | Faithful. | — | — |
| N02 | Il nome alla fine / di ogni preghiera. | 모든 기도 끝의 / 그 이름. | Faithful. | — | — |
| N03 | Cristo non è un cognome. / Significa «l'Unto», il Messia. | 그리스도는 성이 아닙니다. / '기름 부음 받은 자', 메시야라는 뜻입니다. | Faithful. | — | — |
| N04 | Dio stabiliva re, sacerdoti e profeti / ungendoli con l'olio. | 하나님은 왕과 제사장과 선지자를 / 기름을 부어 정하곤 하셨습니다. | *Stabilire* is used for rules and dates, not for appointing people. *Costituire* is the natural (and biblical) verb. | LOW | Dio costituiva re, sacerdoti e profeti / ungendoli con l'olio. |
| N06 | Molti aspettavano il Messia / solo come un re che avrebbe cacciato Roma. | 많은 이들이 메시야를 / 로마를 몰아낼 왕으로만 기다렸습니다. | Faithful. | — | — |
| N07 | Un giorno, dopo la venuta di Gesù, / Pietro fece una confessione. | 예수님이 오신 뒤 어느 날, / 베드로가 고백을 하나 했습니다. | In Italian, "fare una confessione" first means admitting something, or the sacrament of penance. Most 55+ Italians grew up hearing it that way. "Confessione di fede" removes the doubt. | LOW | Un giorno, dopo la venuta di Gesù, / Pietro fece una confessione di fede. |
| N08 | Da allora Gesù disse / che doveva soffrire, essere ucciso / e risuscitare il terzo giorno. | 그때부터 예수님은 / 고난받고 죽임을 당하고 / 제삼일에 살아나야 한다고 말씀하셨습니다. | Faithful (echoes NR Mt 16:21). | — | — |
| N09 | Per Pietro, un Cristo che muore / non aveva senso. | 베드로에게 죽는 그리스도는 / 말이 안 됐습니다. | Faithful. | — | — |
| N10 · N15 | Eppure quella strada / era già stata scritta. · … era la strada indicata dalle Scritture. | 그런데 그 도로는 / 이미 쓰여 있었습니다. · … 성경이 가리킨 도로였습니다. | *Strada* is a physical road or street, and "una strada scritta" sounds odd. *Cammino* is the natural word for a life path or destiny. It also still avoids Jn 14:6's *via*, which was the translator's aim. | LOW | N10: Eppure quel cammino / era già stato scritto. · N15: Il Cristo sofferente non fu un fallimento: / era il cammino indicato dalle Scritture. |
| N11 | Sulla croce, / il grido di Gesù. | 십자가 위에서, / 예수님의 외침. | Faithful. | — | — |
| N12 | Questo grido è il primo verso di un salmo / scritto mille anni prima / da Davide, il re unto. | 이 외침은 천 년 전 / 기름 부음 받은 왕 다윗이 쓴 / 한 시편의 첫 구절입니다. | Faithful. | — | — |
| N14 | Ai piedi della croce, i soldati / si spartirono le sue vesti e tirarono a sorte la sua tunica. | 십자가 아래서 군인들이 / 그의 옷들을 나눠 갖고 그의 속옷을 제비 뽑았습니다. | Faithful. | — | — |
| N20 | Pietro, che aveva detto «Dio non voglia», / dopo aver incontrato Gesù risorto, predicò questo: | '하나님이 원치 않으시기를' 했던 베드로가 / 부활하신 예수님을 만난 뒤 이것을 전했습니다: | Faithful, and it echoes Q3. | — | — |
| N16K–N16 | Re, / Sacerdote, / Profeta, / tre uffici, / in un'unica Persona. | 왕, 제사장, 선지자, 세 직분이, 단 한 분 안에. | Theologically right ("triplice ufficio"). To a lay reader, though, *uffici* first suggests offices as workplaces. | LOW | (optional) Re, / Sacerdote, / Profeta, / tre ministeri, / in un'unica Persona. |
| N17 | «Cristo» non è un cognome. / È la confessione / che Gesù è proprio quel Messia. | '그리스도'는 성이 아닙니다. / 예수님이 바로 그 메시야라는 / 고백입니다. | Faithful. The "che" clause makes this a confession of faith. | — | — |
| T1 | Cristo | 그리스도 | — | — | — |

Quotes: Q9's caption (= voice) starts "la storia di Gesù di Nazaret: come Dio lo ha unto…". Taking in "la storia di" was needed to keep Jesus' name, because NR's verb has only "lo". It reads well.
The K3 caption names Elisha with *ungerai*. Q2, Q3, Q5, Q11, Q12 and Q14 are fine.

---

## de — Lutherbibel 1912 (yv 51) · captions

**Verdict: ready after 1 MED (Psalm 22 cites).** Faithful, natural and reverent. The point lands, and Luther's own wording helps.
Jn 1:41 "Messias … (verdolmetscht: der Gesalbte)" is mirrored exactly in N03 "Christus … bedeutet „der Gesalbte“ – der Messias". *Salbte / gesalbt / Salböl / gesalbten*
run through N04, K1, K2, Q9 and N12. *Drei Ämter* is the standard term ("das dreifache Amt Christi"). Q1's hl "der Gesalbte" is right, because that is how this verse prints "Christ".

| id | current | back-translation (literal) | issue | severity | replacement |
|---|---|---|---|---|---|
| N01 | Das „Christus“ in „Jesus Christus“ – / ist das der Nachname von Jesus? | '예수 그리스도' 속 '그리스도' — / 그것이 예수님의 성인가요? | Faithful. | — | — |
| N02 | Der Name am Ende / jedes Gebets. | 모든 기도 끝의 / 그 이름. | Faithful. | — | — |
| N03 | Christus ist kein Nachname. / Es bedeutet „der Gesalbte“ – der Messias. | 그리스도는 성이 아닙니다. / '기름 부음 받은 자' — 메시야라는 뜻입니다. | Faithful, and the pair is exactly Luther's. | — | — |
| N04 | Gott setzte Könige, Priester und Propheten ein, / indem er sie mit Öl salbte. | 하나님은 왕과 제사장과 선지자를 세우셨습니다, / 그들에게 기름을 부으심으로. | Faithful. | — | — |
| N06 | Viele erwarteten den Messias / nur als König, der Rom vertreiben würde. | 많은 이들이 메시야를 / 로마를 몰아낼 왕으로만 기다렸습니다. | Faithful. | — | — |
| N07 | Eines Tages, nachdem Jesus gekommen war, / legte Petrus ein Bekenntnis ab. | 예수님이 오신 뒤 어느 날, / 베드로가 신앙고백을 했습니다. | Faithful. *Bekenntnis ablegen* is clear. | — | — |
| N08 | Von da an sagte Jesus, / er müsse leiden und getötet werden / und am dritten Tag auferstehen. | 그때부터 예수님은 / 고난받고 죽임을 당하고 / 제삼일에 살아나야 한다고 말씀하셨습니다. | Faithful (echoes Luther Mt 16:21). | — | — |
| N09 | Ein Christus, der stirbt – / das ergab für Petrus keinen Sinn. | 죽는 그리스도 — / 그것은 베드로에게 말이 안 됐습니다. | Faithful. | — | — |
| N10 | Doch dieser Weg / stand schon geschrieben. | 그런데 그 길은 / 이미 기록되어 있었습니다. | Faithful and idiomatic. | — | — |
| N11 | Am Kreuz – / der Schrei Jesu. | 십자가에서 — / 예수님의 외침. | Faithful. | — | — |
| N12 | Dieser Schrei ist die erste Zeile eines Psalms, / tausend Jahre zuvor geschrieben / von David, dem gesalbten König. | 이 외침은 한 시편의 첫 줄입니다, / 천 년 전에 쓰인, / 기름 부음 받은 왕 다윗이 쓴. | Faithful. | — | — |
| N14 | Unter dem Kreuz teilten die Soldaten / seine Kleider und warfen das Los um sein Gewand. | 십자가 아래서 군인들이 / 그의 옷들을 나누고 그의 겉옷을 두고 제비를 뽑았습니다. | Faithful, and it echoes Ps 22. | — | — |
| N20 | Petrus, der einst gesagt hatte: „Schone dein selbst“, / predigte, nachdem er dem auferstandenen Jesus begegnet war: | 한때 '자신을 아끼소서'라 했던 베드로가 / 부활하신 예수님을 만난 뒤 전했습니다: | Faithful, but heavy. "Schone dein selbst" without "HERR" leaves *dein* unclear, and "predigte, nachdem …:" ends on a subordinate clause. | LOW | Petrus, der einst gesagt hatte: „HERR, schone dein selbst“, / begegnete dem auferstandenen Jesus – und predigte dann: |
| N15 | Der leidende Christus war kein Scheitern – / er war der Weg, auf den die Schrift hinwies. | 고난받는 그리스도는 실패가 아니었습니다 — / 성경이 가리킨 길이었습니다. | Faithful. | — | — |
| N16K–N16 | König, / Priester, / Prophet, / drei Ämter, / in einer Person. | 왕, 제사장, 선지자, 세 직분이, 한 분 안에. | Faithful. | — | — |
| N17 | „Christus“ ist kein Nachname. / Es ist das Bekenntnis, / dass Jesus genau dieser Messias ist. | '그리스도'는 성이 아닙니다. / 예수님이 바로 그 메시야라는 / 고백입니다. | Faithful. | — | — |
| T1 | Christus | 그리스도 | — | — | — |
| Q6 · Q7 | cite "Psalm 22,1" · "Psalm 22,18" | — | YouVersion's DELUT (51) is renumbered to the English scheme. Its PSA.22.1 holds the superscription *and* "Mein Gott, mein Gott…", and its ISA.9.6 is "Denn uns ist ein Kind geboren". But every printed Luther Bible (1912 and 2017) counts the superscription as v1. There the cry is **Ps 22,2** and the garments **Ps 22,19**, and printed **Ps 22,18** is "Ich kann alle meine Gebeine zählen". A German reader who looks the cite up in their own Bible lands on the wrong verse. The site pack already cites printed Luther numbering ("Jesaja 9,5"). Fix the displayed cite and leave `usfm` alone: the default PSA.22.1 / PSA.22.18 is what YouVersion 51 needs, so check-quotes and links stay right. | MED | Q6 cite: Psalm 22,2 · Q7 cite: Psalm 22,19 (no `usfm` change) |
| K3 | text/voice "… und Elisa, den Sohn Saphats, von Abel-Mehola, / zum Propheten an deiner Statt." · hl "zum Propheten" | 그리고 아벨므홀라 사밧의 아들 엘리사를 / 너를 대신할 선지자로. | As the translator noted, Luther 19:16 has no verb: *salbe* is in v15 and governs all three names. The caption shows no "anoint", but N04 "salbte" and the oil in the picture carry it. You could bring in v15's verb ("… salbe … Elisa …", usfm 1KI.19.15-16), but that adds a cross-verse ellipsis and Hazael to a short beat. Keep it. | LOW | (no change) |

Other quotes: the Q2 / Q13 "Du bist Christus" without an article and Q3's "HERR" are both how Luther 1912 prints them, verbatim. Q9 starts at the verse's own "wie Gott…".
The Q11, Q12 and Q14 captions read well.

**Outside this film (for the site owner):** the de site pack prose cites "Jesaja 9,5" (printed Luther numbering). If that is linkified to YouVersion 51,
the link opens DELUT's ISA.9.5 ("Denn alle Rüstung…"), not "Denn uns ist ein Kind geboren" (DELUT ISA.9.6). Worth checking in the de pack's link handling. Not reviewed here.
