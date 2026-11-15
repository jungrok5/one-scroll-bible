# 「그리스도」 (christ) — caption native review: ar · fa · hi · bn · ta · ne

Reviewer: one native-speaking evangelical/Reformed Bible teacher per language. This is a report only. No language file was edited.
Sources: `motion/films/christ/script.json` (Korean) · `motion/films/christ/i18n/en.json` (reviewed English) ·
`motion/films/christ/i18n/<code>.json` · the translator's `backtr-<code>.md` · `CAPTIONS-BRIEF.md` · site packs `i18n/<code>.json`.
Audience: Christians 55+ who don't know the Bible well.

How captions are built (`motion/films/captions-on-ko.mjs`): the caption for a quote is its **`voice` when present, else `text`**. `/` becomes a line break.
So for every quote with a `voice`, the viewer reads only the `voice`. All six languages are caption-only, so `hl` and `cite` never reach the viewer.
They only matter for voice tracks and word-sync.

`node motion/films/check-quotes.mjs christ <code>`: **all 15 quotes `ok` in all six languages** (run 2026-11-15).
- I re-fetched the full verses with `fetch-verse.mjs`: JHN 1:41 (fa 1:42), 1SA 16:13, LEV 8:12, 1KI 19:16, MAT 16:21–22, ACT 10:38–43 and JHN 19:23–24.
- Every replacement below that touches a quote was checked against those verses with check-quotes' own `norm`, and all pass.
  The check script and verse dumps are in the scratch folder only.

Cite book names match each site pack's `books` table in all six languages. Numbering:
- fa (ترجمه قدیم) numbers John 1:41 as **1:42**, so `usfm: JHN.1.42` is right. The fetched 1:42 is Andrew's line «مسیح را (که ترجمه آن کرستس است) یافتیم».
- All six editions keep Ps 22:1 / 22:18. In these editions the superscription is not counted as a verse.

Digits: all six packs use ASCII digits in references. The narration has no digits. N12's "thousand" is written as a word everywhere.
RTL (ar, fa): Arabic/Persian comma and question mark (، ؟ ؛) and «» quotes are used correctly. The parentheses in fa Q1 mirror under bidi.

Terminology follows each quoted Bible. None of the six uses another religious register:
- ar: يسوع / الله, never عيسى.
- fa: عیسی and خدا, which are the Old Persian Version's own words.
- hi: यीशु / परमेश्वर / प्रार्थना, never ईसा/ख़ुदा.
- bn: যীশু / ঈশ্বর / প্রার্থনা, never ঈসা/আল্লা.
- ta: இயேசு / தேவன் / ஜெபம் / நாமம, which is the O.V. register.
- ne: येशू / परमेश्वर / नाउँ.

**Totals: HIGH 0 · MED 3 · LOW 21.**

| lang | HIGH | MED | LOW | HIGH/MED ids |
|---|---|---|---|---|
| ar | 0 | 0 | 3 | — |
| fa | 0 | 0 | 4 | — |
| hi | 0 | 1 | 3 | N09 |
| bn | 0 | 1 | 3 | N09 |
| ta | 0 | 1 | 3 | Q14 |
| ne | 0 | 0 | 5 | — |

**Shared LOW (all six): N12 "천 년 전".** The other reviews flagged the same thing (zh/ja/vi/th, pl). Every translation copies it as "a thousand years *ago*":
قبل ألف سنة · هزار سال پیش · एक हज़ार वर्ष पहले · এক হাজার বছর আগে · ஆயிரம் ஆண்டுகளுக்கு முன் · एक हजार वर्षअघि.
A Bible-new viewer may read "David lived about 1000 years ago". The brief (rule 3) means *before Jesus*. The fix is one word, "before that". It is LOW because the wording mirrors the approved Korean.

**Shared LOW (fa · hi · bn · ta · ne): K2 ends on a non-finite participle.** The forms are ریخته، · डालकर · ঢালিয়া · வார்த்து, · खन्याई, all "having poured". This mirrors the Korean "붓고".
In each of these Bibles the same verse goes straight on with "and anointed him". So the caption can be completed verbatim. That also puts the word *anoint* on screen in the priest scene. (Arabic K2 is already a full sentence.)

**Does the point land (Christ = Messiah = Anointed One; surname)?** Yes, in all six. Details:
- **ar** lands best of all. المسيح is literally "the anointed one", from مسح "anoint". The root is visible in N03 «الممسوح», K1 وَمَسَحَهُ, K3 وَٱمْسَحْ, Q9 مَسَحَهُ and N12 الملك الممسوح.
  Q1 mirrors Van Dyck's pair مَسِيَّا … ٱلْمَسِيحُ, and N06/N17 use المسيّا for "Messiah", following that verse. اسم عائلة is the ordinary word for "surname".
- **fa**: this Bible has one word, مسیح, for Christ (Mt 16:16) and for Messiah (Jn 1:42 «مسیح را (که ترجمه آن کرستس است)»).
  Dropping "— the Messiah" from N03 is right, because a repeated مسیح would read as a tautology. The gloss «مسح‌شده» shares its root with مسح کن / مسح نمود in K1/K3/Q9. So the tie is *more* visible than in Korean.
  N06 «بسیاری مسیح را … انتظار می‌کشیدند» carries the "awaited Messiah" sense, and N17 «همان مسیحِ موعود» closes it. That is a good solution.
  Q1's کرستس is an unfamiliar Greek transliteration, but it is exactly what the verse prints, and caption viewers see only the text.
  The verse itself tells them that مسیح is a title with a translation. That is the film's point. Works.
- **hi**: the Hindi Bible's Jn 1:41 actually shows two words, «हम को ख्रिस्त, अर्थात् मसीह, मिल गया». Here ख्रिस्त stands where the Greek has *Messias*, and मसीह is the gloss.
  The narration should still *not* mirror ख्रिस्त in N03. To Hindi Protestants, ख्रिस्त/ख्रीस्त reads as the Catholic word for "Christ". "मसीह means ख्रिस्त" would look like "Christ means Christ".
  मसीह is itself the Messiah word for every Hindi reader, so N03 «मसीह … इसका अर्थ है ‘अभिषिक्त जन’» says everything needed. अभिषिक्त matches the Bible's अभिषेक किया (K1/Q9). Works.
- **bn**: Jn 1:41 «আমরা মশীহের দেখা পাইয়াছি—অনুবাদ করিলে ইহার অর্থ খ্রীষ্ট [অভিষিক্ত]». The bracket is part of the edition's text. **Keep it.**
  It is the only Bible of the six that prints "anointed" inside the very verse. N03 «‘অভিষিক্ত জন’ — মশীহ» picks it up word for word. In a caption it reads as the Bible's own gloss, not as an editorial mark.
- **ta**: «மேசியாவைக் கண்டோம் … மேசியா என்பதற்குக் கிறிஸ்து என்று அர்த்தமாம்» mirrors the Korean pair exactly. N03 «‘அபிஷேகம்பண்ணப்பட்டவர்’, மேசியா» ties to அபிஷேகம்பண்ணு (K1/K3/Q9). Works.
- **ne**: «मसीहलाई (जसको अर्थ हो, ख्रीष्ट)» → N03 «‘अभिषिक्त जन’ — मसीह» → अभिषेक गरे/गर्नुभयो (K1/Q9). थर is exactly "surname". Works.

**ta Q14** is the one the brief flagged. The caption ends on «…பெறுவானென்று», a quotative "that he will receive". The gospel line on screen is left as a dependent clause with no main verb. It cannot be cut to «பெறுவான்» verbatim.
In this Bible the main verb comes right after it in the same verse: «தீர்க்கதரிசிகளெல்லாரும் அவரைக்குறித்தே சாட்சிகொடுக்கிறார்கள்». Taking that in makes a complete sentence. Its content ("all the prophets bear witness") also matches N15. → MED below.

---

## ar — فان دايك (yv 13)

**Verdict: ready. No HIGH/MED.** The narration is faithful, reverent and natural. The vocabulary mirrors Van Dyck:
- حاشاك (Q3/N20)
- ينبغي أن يتألم ويُقتَل وفي اليوم الثالث يقوم (Mt 16:21)
- ثيابه … لباسه … اقترعوا (Ps 22:18)

Small note, no change needed: N03 vowels مَسِيّا while N06/N17 write المسيّا. Both are fine.

| id | current | back-translation (literal) | issue | severity | replacement |
|---|---|---|---|---|---|
| N01 | «المسيح» في «يسوع المسيح» — / هل هو اسم عائلة يسوع؟ | '예수 그리스도'의 '그리스도' — / 그것은 예수의 가문 이름(성)인가? | Faithful. | — | — |
| N02 | الاسم الذي نختم به / كلَّ صلاة. | 우리가 모든 기도를 / 끝맺는 그 이름. | Faithful. | — | — |
| N03 | المسيح ليس اسم عائلة. / معناه «الممسوح» — أي مَسِيّا. | 그리스도는 가문 이름이 아니다. / 그 뜻은 '기름 부음 받은 자' — 곧 메시야. | Faithful. The root مسح is visible. | — | — |
| T1 | المسيح | 그리스도 | ok | — | — |
| N04 | أفرز الله الملوكَ والكهنةَ والأنبياءَ / إذ مسحهم بالدهن. | 하나님은 왕들과 제사장들과 선지자들을 구별하셨다 / 기름으로 그들에게 기름 부으셔서. | Faithful. "세우다" is rendered "set apart", as in en. الدهن matches K1 قَرْنَ ٱلدُّهْنِ. | — | — |
| N06 | كثيرون انتظروا المسيّا / ملكًا يطرد روما، لا غير. | 많은 이들이 메시야를 기다렸다 / 로마를 몰아낼 왕으로, 그뿐. | Faithful. | — | — |
| N07 | وذات يوم، بعد مجيء يسوع، / اعترف بطرس. | 그리고 어느 날, 예수가 오신 뒤, / 베드로가 고백했다. | Faithful. | — | — |
| N08 | ومنذ ذلك الحين قال يسوع / إنه ينبغي أن يتألم ويُقتَل / وفي اليوم الثالث يقوم. | 그때부터 예수는 말했다 / 그가 고난받고 죽임당해야 하며 / 셋째 날에 일어나야 한다고. | Faithful. Mirrors Van Dyck Mt 16:21. | — | — |
| N09 | في نظر بطرس، / مسيحٌ يموت أمرٌ لا يُعقَل. | 베드로가 보기에, / 죽는 그리스도는 생각할 수도 없는 일. | Faithful. لا يُعقَل is "unthinkable", not "meaningless". Good. | — | — |
| N10 | لكنّ ذلك الطريق / كان مكتوبًا من قبل. | 그러나 그 길은 / 이미 전에 기록되어 있었다. | Faithful. | — | — |
| N11 | على الصليب، / صرخة يسوع. | 십자가 위에서, / 예수의 외침. | Faithful. | — | — |
| N12 | هذه الصرخة هي السطر الأول من مزمور / كتبه قبل ألف سنة / داود، الملك الممسوح. | 이 외침은 한 시편의 첫 줄이다 / (지금부터) 천 년 전에 쓴 / 기름 부음 받은 왕 다윗이. | قبل ألف سنة = "a thousand years ago" (shared note). | LOW | هذه الصرخة هي السطر الأول من مزمور / كتبه قبل ذلك بألف سنة / داود، الملك الممسوح. |
| N14 | وتحت الصليب اقتسم الجنود / ثيابه، واقترعوا على لباسه. | 십자가 아래서 군인들이 나누었다 / 그의 옷을, 그리고 그의 의복을 두고 제비 뽑았다. | Faithful. Mirrors Q7's words, so the fulfilment shows. | — | — |
| N20 | بطرس الذي قال يومًا «حاشاك»، / بعد أن التقى يسوعَ القائم من الأموات، بشّر بهذا: | 한때 "당치 않습니다"라고 말한 베드로가, / 죽은 자 가운데서 일어나신 예수를 만난 뒤, 이것을 전했다: | Faithful. Q3's own word. | — | — |
| N15 | المسيح المتألّم لم يكن فشلًا، / بل هو الطريق الذي أشار إليه الكتاب. | 고난받는 그리스도는 실패가 아니었다, / 오히려 성경이 가리킨 길이다. | Faithful. الكتاب is Van Dyck's "the Scripture". | — | — |
| N16K–R | ملكٌ، · كاهنٌ، · نبيٌّ، | 왕, · 제사장, · 선지자, | ok | — | — |
| N16 | ثلاث وظائف، / في شخصٍ واحد. | 세 직분, / 한 인격 안에. | Faithful. This is the standard Arabic Protestant term (وظائف المسيح الثلاث). | — | — |
| N17 | «المسيح» ليس اسم عائلة، / بل هو الاعتراف / بأن يسوع هو ذلك المسيّا نفسه. | '그리스도'는 가문 이름이 아니라, / 고백이다 / 예수가 바로 그 메시야라는. | Faithful. | — | — |
| K3 | voice: وَٱمْسَحْ أَلِيشَعَ بْنَ شَافَاطَ | 그리고 사밧의 아들 엘리사에게 기름 부으라 | The caption stops before نَبِيًّا, so the word "prophet" never appears in the prophet scene. en keeps it ("…to be prophet in your place"). | LOW | voice: وَٱمْسَحْ أَلِيشَعَ بْنَ شَافَاطَ مِنْ آبَلَ مَحُولَةَ نَبِيًّا عِوَضًا عَنْكَ. |
| Q11 | voice: ٱلَّذِي أَيْضًا قَتَلُوهُ مُعَلِّقِينَ إِيَّاهُ عَلَى خَشَبَةٍ. | 그를 또한 그들이 나무에 달아 죽였다 (관계대명사 '그를…'로 시작) | The caption opens on a dangling relative «ٱلَّذِي أَيْضًا» ("whom also"). The contiguous main clause reads cleanly on its own. | LOW | voice: قَتَلُوهُ مُعَلِّقِينَ إِيَّاهُ عَلَى خَشَبَةٍ. |
| other quotes | Q1 K1 K2 Q2 Q3 Q4 Q5 Q6 Q7 Q9 Q12 Q14 Q13 | — | Fragments and voices read as whole clauses. The Q14 voice drops أَنَّ and starts on كُلَّ, which is still natural. | — | — |

---

## fa — ترجمه قدیم (yv 136)

**Verdict: ready. No HIGH/MED.** The narration is faithful and reverent. ZWNJ and ezafe are used in the prose.
N14 deliberately uses Q7's words (رخت … لباس … قرعه انداختند) instead of Jn 19's جامه/پیراهن/لشکریان. That is the right choice, because it shows the psalm being fulfilled.
N09 «معنایی نداشت» is idiomatic Persian for "made no sense". Unlike the pl/hi/bn cases, it does not tip toward "meant nothing to him".

| id | current | back-translation (literal) | issue | severity | replacement |
|---|---|---|---|---|---|
| N01 | «مسیح» در «عیسی مسیح» — / آیا نام خانوادگی عیسی است؟ | '예수 그리스도'의 '그리스도' — / 그것이 예수의 성인가? | Faithful. | — | — |
| N02 | نامی که در پایان / هر دعا می‌آید. | 모든 기도의 / 끝에 오는 이름. | Faithful. | — | — |
| N03 | مسیح نام خانوادگی نیست. / به معنای «مسح‌شده» است. | 그리스도는 성이 아니다. / '기름 부음 받은 자'라는 뜻이다. | The Messiah apposition is omitted on purpose, because this Bible has one word (see the top section). Judged correct: the meaning is kept and nothing is lost. | — | — |
| T1 | مسیح | 그리스도 | ok | — | — |
| N04 | خدا با مسح کردن به روغن، / پادشاهان و کاهنان و انبیا را برمی‌گماشت. | 하나님은 기름으로 기름 부음으로써, / 왕들과 제사장들과 선지자들을 세우셨다. | Faithful. | — | — |
| N06 | بسیاری مسیح را / فقط چون پادشاهی انتظار می‌کشیدند که روم را بیرون براند. | 많은 이들이 메시야를 / 오직 로마를 몰아낼 왕으로서 기다렸다. | Faithful. | — | — |
| N07 | روزی، پس از آمدن عیسی، / پطرس اعتراف کرد. | 어느 날, 예수가 오신 뒤, / 베드로가 고백했다. | Faithful. | — | — |
| N08 | از آن پس عیسی گفت / که باید رنج بکشد و کشته شود / و در روز سوم برخیزد. | 그 뒤로 예수는 말했다 / 고난받고 죽임당해야 하며 / 셋째 날에 일어나야 한다고. | Faithful. برخیزد matches Mt 16:21 برخاستن. | — | — |
| N09 | برای پطرس، مسیحی که بمیرد / معنایی نداشت. | 베드로에게, 죽는 그리스도는 / 말이 되지 않았다. | Faithful. | — | — |
| N10 | اما آن راه / از پیش نوشته شده بود. | 그러나 그 길은 / 미리 기록되어 있었다. | Faithful. | — | — |
| N11 | بر صلیب، / فریاد عیسی. | 십자가 위, / 예수의 외침. | Faithful. | — | — |
| N12 | این فریاد، سطر نخست مزموری است / که هزار سال پیش / داود، پادشاه مسح‌شده، نوشت. | 이 외침은 한 시편의 첫 줄이다 / (지금부터) 천 년 전에 / 기름 부음 받은 왕 다윗이 쓴. | هزار سال پیش = "a thousand years ago" (shared note). | LOW | این فریاد، سطر نخست مزموری است / که هزار سال پیش از آن / داود، پادشاه مسح‌شده، نوشت. |
| N14 | زیر صلیب، سربازان / رخت او را تقسیم کردند و بر لباسش قرعه انداختند. | 십자가 아래서 군인들이 / 그의 옷을 나누고 그의 의복에 제비를 던졌다. | Faithful. | — | — |
| N20 | پطرس که روزی گفته بود «حاشا از تو»، / پس از دیدار با عیسای برخاسته از مردگان، این را بشارت داد: | 한때 "당치 않습니다"라고 말했던 베드로는, / 죽은 자 가운데서 일어나신 예수를 만난 뒤, 이것을 전했다: | Faithful. Q3's own words. | — | — |
| N15 | مسیحِ رنج‌کشیده شکست نبود؛ / راهی بود که کتاب‌مقدس به آن اشاره می‌کرد. | 고난받은 그리스도는 실패가 아니었다; / 성경이 가리키던 길이었다. | Faithful. | — | — |
| N16K–R | پادشاه، · کاهن، · نبی، | 왕, · 제사장, · 선지자, | ok | — | — |
| N16 | سه منصب، / در یک شخص. | 세 직분, / 한 인격 안에. | Faithful. | — | — |
| N17 | «مسیح» نام خانوادگی نیست؛ / اعترافی است / به اینکه عیسی همان مسیحِ موعود است. | '그리스도'는 성이 아니다; / 고백이다 / 예수가 바로 그 약속된 메시야라는. | Faithful. موعود ("promised") recovers the Messiah sense in a single-word Bible. That is a good solution. | — | — |
| K2 | و قدری از روغن مسح را بر سر هارون ریخته، | 그리고 관유 얼마를 아론의 머리에 붓고, | Ends on the participle ریخته، (shared note). The verse goes on «او را مسح کرد تا او را تقدیس نماید». | LOW | و قدری از روغن مسح را بر سر هارون ریخته، / او را مسح کرد تا او را تقدیس نماید. |
| K3 | voice: مسح کن تا به جای تو نبی بشود. | 기름 부으라, 너를 대신하여 선지자가 되도록. | Elisha's name is not in the caption. The scene label is not translated for caption languages. | LOW | voice: الیشع بن شافاط را که از آبل محوله است، مسح کن تا به جای تو نبی بشود. |
| Q12 | همان کس را خدا در روز سوم برخیزانیده، | 바로 그를 하나님이 셋째 날에 일으키시고, | Ends on a participle. The full verse is one short sentence. | LOW | همان کس را خدا در روز سوم برخیزانیده، ظاهر ساخت. |
| Q1 | مسیح را / (که ترجمه آن کرستس است) یافتیم. | 메시야를 / (그 번역은 크리스토스) 우리가 찾았다. | Verbatim (Jn 1:42 in this edition). The line ends on the verb, which is natural. Works. | — | — |
| other quotes | K1 Q2 Q3 Q4 Q5 Q6 Q7 Q9 Q11 Q14 Q13 | — | Read as whole clauses. Q9 is archaic («عیسی ناصری را که خدا او را چگونه … مسح نمود»), but it cannot be trimmed without losing "Jesus". Q11's «بر صلیب کشیده» is this Bible's word for "on a tree". | — | — |

---

## hi — हिन्दी बाइबल (yv 1683)

**Verdict: ready after 1 MED (N09).** The narration is faithful, with honorific plurals for Jesus (बताने लगे, उन्हें, हैं). It mirrors the Bible:
- N08 matches Mt 16:21 (दुःख उठाना … मार डाला जाना … तीसरे दिन जी उठना अवश्य).
- N20 matches Q3 (परमेश्वर न करे).
- N14 matches Q7 (वस्त्र … पहिरावे … चिट्ठी डाली).

| id | current | back-translation (literal) | issue | severity | replacement |
|---|---|---|---|---|---|
| N01 | ‘यीशु मसीह’ में ‘मसीह’ — / क्या यह यीशु का कुलनाम है? | '예수 그리스도'에서 '그리스도' — / 이것이 예수의 가문 이름(성)인가? | Faithful. कुलनाम is clear to older readers. | — | — |
| N02 | हर प्रार्थना के अंत में / आनेवाला वह नाम। | 모든 기도의 끝에 / 오는 그 이름. | Faithful. | — | — |
| N03 | मसीह कुलनाम नहीं है। / इसका अर्थ है ‘अभिषिक्त जन’। | 그리스도는 가문 이름이 아니다. / 그 뜻은 '기름 부음 받은 이'이다. | The Messiah apposition is omitted. Judged correct (see the top section). | — | — |
| T1 | मसीह | 그리스도 | ok | — | — |
| N04 | परमेश्वर ने तेल से अभिषेक करके / राजाओं, याजकों और भविष्यद्वक्ताओं को अलग ठहराया। | 하나님은 기름으로 기름 부어 / 왕들, 제사장들, 선지자들을 구별해 세우셨다. | Faithful. भविष्यद्वक्ता is the Bible's word (Acts 10:43) and the site pack's (12×). | — | — |
| N06 | बहुत से लोग मसीह की प्रतीक्षा / केवल रोम को निकाल देनेवाले राजा के रूप में करते थे। | 많은 사람들이 메시야를 / 오직 로마를 몰아낼 왕으로서 기다렸다. | Faithful. | — | — |
| N07 | यीशु के आने के बाद एक दिन, / पतरस ने अंगीकार किया। | 예수께서 오신 뒤 어느 날, / 베드로가 고백했다. | Faithful. अंगीकार is the Bible's word for confession. | — | — |
| N08 | तब से यीशु बताने लगे कि / उन्हें दुःख उठाना, मार डाला जाना, / और तीसरे दिन जी उठना अवश्य है। | 그때부터 예수께서 알려 주기 시작하셨다 / 고난받고, 죽임당하고, / 셋째 날에 살아나는 것이 반드시 필요하다고. | Faithful. | — | — |
| N09 | पतरस के लिए मरनेवाले मसीह का / कोई अर्थ नहीं था। | 베드로에게 죽는 그리스도는 / 아무 의미도 없었다. | "X का कोई अर्थ नहीं था", with a person as subject, reads as "a dying Messiah meant nothing to Peter / was pointless". That is irreverent, and it is not the Korean "말이 안 됐다" ("it didn't fit; it was unthinkable"). Same as pl N09. | MED | पतरस के लिए मसीह का मरना / समझ से बाहर की बात थी। |
| N10 | परन्तु वह रास्ता / पहले से लिखा हुआ था। | 그러나 그 길은 / 미리 기록되어 있었다. | Faithful. | — | — |
| N11 | क्रूस पर, / यीशु की पुकार। | 십자가 위, / 예수의 외침. | Faithful. | — | — |
| N12 | यह पुकार उस भजन की पहली पंक्ति है / जिसे एक हज़ार वर्ष पहले / अभिषिक्त राजा दाऊद ने लिखा था। | 이 외침은 그 시편의 첫 줄이다 / (지금부터) 천 년 전에 / 기름 부음 받은 왕 다윗이 쓴. | पहले = "ago" here (shared note). | LOW | यह पुकार उस भजन की पहली पंक्ति है / जिसे उससे एक हज़ार वर्ष पहले / अभिषिक्त राजा दाऊद ने लिखा था। |
| N14 | क्रूस के नीचे सैनिकों ने / उनके वस्त्र आपस में बाँट लिए और उनके पहिरावे पर चिट्ठी डाली। | 십자가 아래서 군인들이 / 그의 옷을 서로 나누고 그의 의복에 제비를 던졌다. | Faithful. | — | — |
| N20 | जिस पतरस ने कहा था, ‘परमेश्वर न करे’, / उसने जी उठे यीशु से मिलने के बाद यह प्रचार किया: | '하나님이 그리하지 않으시기를' 하고 말했던 그 베드로가, / 살아나신 예수를 만난 뒤 이것을 전파했다: | Faithful. | — | — |
| N15 | दुःख उठानेवाला मसीह असफलता नहीं था, / बल्कि वह रास्ता था जिसकी ओर पवित्रशास्त्र ने संकेत किया। | 고난받는 그리스도는 실패가 아니었다, / 오히려 성경이 가리킨 그 길이었다. | Faithful. पवित्रशास्त्र matches Jn 19:24. | — | — |
| N16K–R | राजा, · याजक, · भविष्यद्वक्ता, | 왕, · 제사장, · 선지자, | ok | — | — |
| N16 | तीन पद, / एक ही व्यक्ति में। | 세 직분, / 한 인격 안에. | Faithful. | — | — |
| N17 | ‘मसीह’ कुलनाम नहीं, / बल्कि यह अंगीकार है / कि यीशु ही वह मसीह हैं। | '그리스도'는 가문 이름이 아니라, / 고백이다 / 예수께서 바로 그 메시야이시라는. | Faithful. | — | — |
| K2 | और उसने अभिषेक के तेल में से कुछ / हारून के सिर पर डालकर | 그리고 그는 관유 얼마를 / 아론의 머리에 붓고서 | Ends on डालकर (shared note). | LOW | और उसने अभिषेक के तेल में से कुछ / हारून के सिर पर डालकर उसका अभिषेक करके उसे पवित्र किया। |
| K3 | voice: शापात के पुत्र एलीशा का अभिषेक करना। | 사밧의 아들 엘리사에게 기름 부으라. | "Prophet" (नबी) is not in the caption. Since Hindi is verb-final, the whole contiguous clause is still one sentence. | LOW | voice: अपने स्थान पर नबी होने के लिये आबेलमहोला के शापात के पुत्र एलीशा का अभिषेक करना। |
| Q1 | हम को ख्रिस्त, / अर्थात् मसीह, मिल गया। | 우리가 크리스트, / 곧 마시흐를 만났다. | Verbatim. It ends on the verb. Works (see the top section). | — | — |
| Q9 | voice: परमेश्‍वर ने किस रीति से यीशु नासरी को पवित्र आत्मा और सामर्थ्य से अभिषेक किया; | 하나님이 어떻게 나사렛 예수에게 성령과 능력으로 기름 부으셨는지; | It reads as "how God anointed…" (dependent on v.37). That is acceptable. "He went about doing good" is left out because its verb फिरा comes much later. This keeps the caption short, and the point (anointed) stays. Keep. | — | — |
| other quotes | K1 Q2 Q3 Q4 Q5 Q6 Q7 Q11 Q12 Q14 Q13 | — | All end on finite verbs. Q2/Q13 «तू जीवते परमेश्‍वर का पुत्र मसीह है» is the full clause, which suits a verb-final language. | — | — |

---

## bn — O.V. বাইবেল (yv 1681)

**Verdict: ready after 1 MED (N09).** The quotes are in sadhu bhasha and the narration is in chalit. That is the normal Bengali Christian pairing.
- Honorifics are right: যীশু … বললেন, পিতর … করলেন, and আপনি in Q2.
- The «[অভিষিক্ত]» gloss in Q1 is a gift for this film. Keep it.

| id | current | back-translation (literal) | issue | severity | replacement |
|---|---|---|---|---|---|
| N01 | ‘যীশু খ্রীষ্ট’-এর ‘খ্রীষ্ট’ — / এটি কি যীশুর পদবি? | '예수 그리스도'의 '그리스도' — / 이것이 예수의 성인가? | Faithful. পদবি = surname. | — | — |
| N02 | প্রতিটি প্রার্থনার শেষে / যে নাম থাকে। | 모든 기도의 끝에 / 있는 그 이름. | Faithful. | — | — |
| N03 | খ্রীষ্ট পদবি নয়। / এর অর্থ ‘অভিষিক্ত জন’ — মশীহ। | 그리스도는 성이 아니다. / 그 뜻은 '기름 부음 받은 이' — 메시야. | Faithful. It mirrors Q1's [অভিষিক্ত]. | — | — |
| T1 | খ্রীষ্ট | 그리스도 | ok | — | — |
| N04 | ঈশ্বর তৈল দিয়ে অভিষেক করে / রাজা, যাজক ও ভাববাদীদের পৃথক করে নিযুক্ত করতেন। | 하나님은 기름으로 기름 부어 / 왕, 제사장, 선지자들을 구별하여 세우곤 하셨다. | Faithful. তৈল / ভাববাদী are the Bible's words. | — | — |
| N06 | অনেকে মশীহের অপেক্ষা করত / কেবল রোমকে তাড়িয়ে দেওয়া এক রাজা হিসেবে। | 많은 이들이 메시야를 기다렸다 / 오직 로마를 (이미) 쫓아낸 한 왕으로서. | The perfective participle «তাড়িয়ে দেওয়া রাজা» leans toward "a king who drove out Rome". The Korean "몰아낼" is future ("who would"). | LOW | অনেকে মশীহের অপেক্ষা করত / কেবল এমন এক রাজা হিসেবে, যিনি রোমকে তাড়িয়ে দেবেন। |
| N07 | যীশু আসার পর একদিন, / পিতর এক স্বীকারোক্তি করলেন। | 예수가 오신 뒤 어느 날, / 베드로가 한 고백을 했다. | Faithful. | — | — |
| N08 | সেই সময় থেকে যীশু বলতে লাগলেন, / তাঁকে দুঃখভোগ করতে হবে, নিহত হতে হবে, / আর তৃতীয় দিনে জীবিত হয়ে উঠতে হবে। | 그때부터 예수께서 말씀하기 시작하셨다, / 그가 고난받아야 하고, 죽임당해야 하고, / 셋째 날에 살아 일어나야 한다고. | Faithful. Mirrors Mt 16:21. | — | — |
| N09 | পিতরের কাছে, মৃত্যুবরণকারী খ্রীষ্টের / কোনো অর্থ ছিল না। | 베드로에게, 죽음을 맞는 그리스도는 / 아무 의미도 없었다. | Same problem as hi N09: "had no meaning" reads as "meant nothing to him". The Korean "말이 안 됐다" means "unthinkable". | MED | পিতরের কাছে, খ্রীষ্ট মারা যাবেন— / এ কথা ছিল অকল্পনীয়। |
| N10 | কিন্তু সেই পথ / আগেই লেখা ছিল। | 그러나 그 길은 / 이미 기록되어 있었다. | Faithful. | — | — |
| N11 | ক্রুশের উপরে, / যীশুর আর্তনাদ। | 십자가 위에서, / 예수의 부르짖음. | Faithful. | — | — |
| N12 | এই আর্তনাদ একটি গীতের প্রথম পংক্তি, / যা এক হাজার বছর আগে / অভিষিক্ত রাজা দায়ূদ লিখেছিলেন। | 이 부르짖음은 한 시의 첫 행이다, / (지금부터) 천 년 전에 / 기름 부음 받은 왕 다윗이 쓴. | Shared note. | LOW | এই আর্তনাদ একটি গীতের প্রথম পংক্তি, / যা তার এক হাজার বছর আগে / অভিষিক্ত রাজা দায়ূদ লিখেছিলেন। |
| N14 | ক্রুশের নিচে সৈন্যরা / তাঁর বস্ত্র ভাগ করে নিল, আর তাঁর পরিচ্ছদের জন্য গুলিবাঁট করল। | 십자가 아래서 군인들이 / 그의 옷을 나누어 가졌고, 그의 겉옷을 두고 제비를 뽑았다. | Faithful. Mirrors Q7. | — | — |
| N20 | যে পিতর বলেছিলেন, ‘ইহা আপনা হইতে দূরে থাকুক’, / পুনরুত্থিত যীশুর দেখা পাওয়ার পর তিনি এই কথা প্রচার করলেন: | '이것이 주에게서 멀리 있기를' 하고 말했던 베드로가, / 부활하신 예수를 만난 뒤 이 말을 전파했다: | Faithful. Q3's sadhu words are quoted. | — | — |
| N15 | দুঃখভোগী খ্রীষ্ট কোনো ব্যর্থতা ছিলেন না, / বরং সেই পথ, যার দিকে শাস্ত্র ইঙ্গিত করেছিল। | 고난받은 그리스도는 실패가 아니었다, / 오히려 그 길, 성경이 가리켰던. | Faithful. The elliptical second half is acceptable. | — | — |
| N16K–R | রাজা, · যাজক, · ভাববাদী, | 왕, · 제사장, · 선지자, | ok | — | — |
| N16 | তিন পদ, / এক ব্যক্তিতে। | 세 직분, / 한 인격 안에. | Faithful. | — | — |
| N17 | ‘খ্রীষ্ট’ পদবি নয়, / বরং এই স্বীকারোক্তি যে / যীশুই সেই মশীহ। | '그리스도'는 성이 아니라, / 오히려 이 고백이다 / 예수가 바로 그 메시야라는. | Faithful. | — | — |
| K2 | পরে অভিষেকার্থ তৈলের কিঞ্চিৎ হারোণের মস্তকে ঢালিয়া | 그 후 관유 얼마를 아론의 머리에 붓고서 | Ends on ঢালিয়া (shared note). | LOW | পরে অভিষেকার্থ তৈলের কিঞ্চিৎ হারোণের মস্তকে ঢালিয়া / তাঁহাকে পবিত্র করণার্থে অভিষেক করিলেন। |
| other quotes | Q1 K1 K3 Q2 Q3 Q4 Q5 Q6 Q7 Q9 Q11 Q12 Q14 Q13 | — | All read as whole clauses and end on finite verbs. Q12 «…উঠাইলেন,» is finite. The K3 voice «শাফটের পুত্র ইলীশায়কে অভিষেক কর।» is complete. | — | — |

---

## ta — O.V. BSI (yv 339)

**Verdict: ready after 1 MED (Q14).** The narration is in the O.V. register: தேவன், ஜெபம், நாமம், அபிஷேகம்பண்ணு, போர்ச்சேவகர் (Jn 19:23).
- N11/N12 கதறல் echoes this psalm's own கதறி.
- Peter takes -ஆன் (அறிக்கையிட்டான், பிரசங்கித்தான்), as in the O.V. text. That is acceptable for O.V. readers, so no change.

| id | current | back-translation (literal) | issue | severity | replacement |
|---|---|---|---|---|---|
| N01 | ‘இயேசுகிறிஸ்து’ என்பதில் ‘கிறிஸ்து’ — / அது இயேசுவின் குடும்பப் பெயரா? | '예수그리스도'라는 것에서 '그리스도' — / 그것이 예수의 가족 이름(성)인가? | Faithful. | — | — |
| N02 | ஒவ்வொரு ஜெபத்தின் முடிவிலும் / சொல்லப்படும் அந்த நாமம். | 모든 기도의 끝에도 / 불리는 그 이름. | Faithful. | — | — |
| N03 | கிறிஸ்து என்பது குடும்பப் பெயர் அல்ல. / ‘அபிஷேகம்பண்ணப்பட்டவர்’, மேசியா என்பதே அதன் அர்த்தம். | 그리스도라는 것은 가족 이름이 아니다. / '기름 부음 받은 이', 메시야라는 것이 그 뜻이다. | Faithful. | — | — |
| T1 | கிறிஸ்து | 그리스도 | ok | — | — |
| N04 | தேவன் தைலத்தால் அபிஷேகம்பண்ணி, / ராஜாக்களையும் ஆசாரியர்களையும் தீர்க்கதரிசிகளையும் பிரித்தெடுத்து ஏற்படுத்தினார். | 하나님은 기름으로 기름 부어, / 왕들과 제사장들과 선지자들을 구별해 세우셨다. | Faithful. The second line is long but within limits. | — | — |
| N06 | அநேகர் மேசியாவை / ரோமை விரட்டும் ராஜாவாக மட்டுமே எதிர்பார்த்தார்கள். | 많은 이들이 메시야를 / 로마를 쫓아낼 왕으로만 기대했다. | Faithful. | — | — |
| N07 | இயேசு வந்த பின் ஒரு நாள், / பேதுரு அறிக்கையிட்டான். | 예수가 오신 뒤 어느 날, / 베드로가 고백했다. | Faithful. | — | — |
| N08 | அதுமுதல் இயேசு, / தாம் பாடுபட்டுக் கொல்லப்பட்டு, / மூன்றாம் நாளில் உயிர்த்தெழ வேண்டும் என்று சொன்னார். | 그때부터 예수는, / 자신이 고난받아 죽임당하고, / 셋째 날에 부활해야 한다고 말씀하셨다. | Faithful. Opens like Mt 16:21 அதுமுதல் இயேசு. | — | — |
| N09 | சாகும் கிறிஸ்து என்பது / பேதுருவுக்குப் புரியாத காரியமாயிருந்தது. | 죽는 그리스도라는 것은 / 베드로에게 이해되지 않는 일이었다. | Faithful. Exactly "말이 안 됐다". | — | — |
| N10 | ஆனால் அந்தப் பாதை / ஏற்கனவே எழுதப்பட்டிருந்தது. | 그러나 그 길은 / 이미 기록되어 있었다. | Faithful. | — | — |
| N11 | சிலுவையின்மேல், / இயேசுவின் கதறல். | 십자가 위에서, / 예수의 부르짖음. | Faithful. | — | — |
| N12 | இந்தக் கதறல், ஆயிரம் ஆண்டுகளுக்கு முன் / அபிஷேகம்பண்ணப்பட்ட ராஜாவாகிய தாவீது எழுதிய / சங்கீதத்தின் முதல் வரி. | 이 부르짖음은, (지금부터) 천 년 전 / 기름 부음 받은 왕인 다윗이 쓴 / 시편의 첫 줄. | Shared note. | LOW | இந்தக் கதறல், அதற்கு ஆயிரம் ஆண்டுகளுக்கு முன் / அபிஷேகம்பண்ணப்பட்ட ராஜாவாகிய தாவீது எழுதிய / சங்கீதத்தின் முதல் வரி. |
| N14 | சிலுவையின் கீழே போர்ச்சேவகர் / அவருடைய வஸ்திரங்களைப் பங்கிட்டு, அவருடைய உடையின்பேரில் சீட்டுப்போட்டார்கள். | 십자가 아래서 군병들이 / 그의 옷들을 나누고, 그의 의복을 두고 제비를 뽑았다. | Faithful. Mirrors Q7 and Jn 19:24. | — | — |
| N20 | ‘இது உமக்கு நேரிடக்கூடாதே’ என்ற பேதுரு, / உயிர்த்தெழுந்த இயேசுவைச் சந்தித்த பின் இதைப் பிரசங்கித்தான்: | '이 일이 주께 일어나서는 안 됩니다' 하던 베드로가, / 부활하신 예수를 만난 뒤 이것을 전파했다: | Faithful. | — | — |
| N15 | பாடுபட்ட கிறிஸ்து தோல்வி அல்ல; / வேதவாக்கியங்கள் சுட்டிக்காட்டிய பாதை. | 고난받은 그리스도는 실패가 아니다; / 성경 말씀이 가리킨 길. | Faithful. வேதவாக்கியம் is Jn 19:24's word. | — | — |
| N16K–R | ராஜா, · ஆசாரியர், · தீர்க்கதரிசி, | 왕, · 제사장, · 선지자, | ok | — | — |
| N16 | மூன்று பதவிகள், / ஒரே நபரில். | 세 직분, / 한 인격 안에. | Faithful. | — | — |
| N17 | ‘கிறிஸ்து’ என்பது குடும்பப் பெயர் அல்ல; / இயேசுவே அந்த மேசியா என்ற / அறிக்கையாகும். | '그리스도'라는 것은 가족 이름이 아니다; / 예수가 바로 그 메시야라는 / 고백이다. | Faithful. | — | — |
| K2 | அபிஷேகதைலத்திலே கொஞ்சம் / ஆரோனுடைய சிரசின்மேல் வார்த்து, | 관유 얼마를 / 아론의 머리 위에 붓고, | Ends on வார்த்து, (shared note). | LOW | அபிஷேகதைலத்திலே கொஞ்சம் ஆரோனுடைய சிரசின்மேல் வார்த்து, / அவனைப் பரிசுத்தப்படுத்தும்படி அபிஷேகம்பண்ணினான். |
| Q12 | மூன்றாம் நாளிலே தேவன் அவரை எழுப்பி | 셋째 날에 하나님이 그를 일으키시고 | The resurrection line ends on the conjunctive participle எழுப்பி. The verse is one short sentence that ends on a finite verb. hl «அவரை எழுப்பி» stays inside the new text. | LOW | மூன்றாம் நாளிலே தேவன் அவரை எழுப்பிப் / பிரத்தியட்சமாய்க் காணும்படி செய்தார். |
| Q14 | voice: அவரை விசுவாசிக்கிறவன் எவனோ அவன் அவருடைய நாமத்தினாலே பாவமன்னிப்பைப் பெறுவானென்று | 그를 믿는 자는 누구든지 그의 이름으로 죄 사함을 받으리라고 | The caption ends on the fused quotative «பெறுவானென்று» ("…that he will receive"). The gospel promise, the last word before the final confession, is left as a dependent clause. «பெறுவான்» cannot be cut out verbatim. The same verse completes it at once: "all the prophets bear witness of him". That echoes N15 ("the road the Scriptures pointed to"). Option, if strict Korean mirroring is preferred: keep the current text and accept the hanging -என்று. | MED | text: … அவரை விசுவாசிக்கிறவன் எவனோ அவன் / அவருடைய நாமத்தினாலே பாவமன்னிப்பைப் பெறுவானென்று / தீர்க்கதரிசிகளெல்லாரும் அவரைக்குறித்தே சாட்சிகொடுக்கிறார்கள் · voice: அவரை விசுவாசிக்கிறவன் எவனோ அவன் அவருடைய நாமத்தினாலே பாவமன்னிப்பைப் பெறுவானென்று தீர்க்கதரிசிகளெல்லாரும் அவரைக்குறித்தே சாட்சிகொடுக்கிறார்கள் (hl unchanged) |
| other quotes | Q1 K1 K3 Q2 Q3 Q4 Q5 Q6 Q7 Q9 Q11 Q13 | — | Read well. Q2/Q13 end on «கிறிஸ்து», without the verse's «என்றான்». That is a clean nominal sentence that lands on "Christ". The K3 voice includes தீர்க்கதரிசியாக. | — | — |

---

## ne — NNRV (yv 1483)

**Verdict: ready. No HIGH/MED.** The narration is faithful and natural, with honorific उहाँ/हुनुहुन्छ for Jesus. थर is exactly "surname".
N14 uses NNRV's सिपाहीहरू plus Q7's वस्त्र/पोशाक/चिट्ठा. पुजारी follows the site pack.

| id | current | back-translation (literal) | issue | severity | replacement |
|---|---|---|---|---|---|
| N01 | ‘येशू ख्रीष्‍ट’ को ‘ख्रीष्‍ट’ — / के यो येशूको थर हो? | '예수 그리스도'의 '그리스도' — / 이것이 예수의 성인가? | Faithful. The postposition को is written apart from the quote. In Nepali it attaches. | LOW | ‘येशू ख्रीष्‍ट’को ‘ख्रीष्‍ट’ — / के यो येशूको थर हो? |
| N02 | हरेक प्रार्थनाको अन्‍त्‍यमा / आउने त्‍यो नाउँ। | 모든 기도의 끝에 / 오는 그 이름. | Faithful. नाउँ matches Q14. | — | — |
| N03 | ख्रीष्‍ट थर होइन। / यसको अर्थ हो ‘अभिषिक्त जन’ — मसीह। | 그리스도는 성이 아니다. / 그 뜻은 '기름 부음 받은 이' — 메시야. | Faithful. | — | — |
| T1 | ख्रीष्‍ट | 그리스도 | ok | — | — |
| N04 | परमेश्‍वरले तेलले अभिषेक गरेर / राजा, पुजारी र अगमवक्ताहरूलाई अलग गरी नियुक्त गर्नुभयो। | 하나님은 기름으로 기름 부어 / 왕, 제사장, 선지자들을 구별하여 세우셨다. | Faithful. | — | — |
| N06 | धेरै मानिसहरूले मसीहलाई / रोमलाई धपाउने राजाको रूपमा मात्र पर्खिरहेका थिए। | 많은 사람들이 메시야를 / 로마를 쫓아낼 왕으로만 기다리고 있었다. | Faithful. | — | — |
| N07 | येशू आउनुभएपछि एक दिन, / पत्रुसले विश्‍वासको स्‍वीकार गरे। | 예수께서 오신 뒤 어느 날, / 베드로가 믿음의 고백을 했다. | Faithful. | — | — |
| N08 | त्‍यसपछि येशूले भन्‍न थाल्‍नुभयो, / उहाँले दुःख भोग्‍नुपर्छ, मारिनुपर्छ, / र तेस्रो दिनमा फेरि जीवित हुनुपर्छ। | 그 뒤에 예수께서 말씀하기 시작하셨다, / 고난받아야 하고, 죽임당해야 하고, / 셋째 날에 다시 살아나야 한다고. | त्यसपछि means "after that". The Korean "그때부터" means "from then on", and NNRV Mt 16:21 has त्यस बेलादेखि. | LOW | त्‍यस बेलादेखि येशूले भन्‍न थाल्‍नुभयो, / उहाँले दुःख भोग्‍नुपर्छ, मारिनुपर्छ, / र तेस्रो दिनमा फेरि जीवित हुनुपर्छ। |
| N09 | पत्रुसको निम्‍ति मर्ने ख्रीष्‍ट / बुझ्नै नसकिने कुरा थियो। | 베드로에게 죽는 그리스도는 / 도무지 이해할 수 없는 일이었다. | Faithful. | — | — |
| N10 | तर त्‍यो बाटो / पहिले नै लेखिएको थियो। | 그러나 그 길은 / 이미 기록되어 있었다. | Faithful. | — | — |
| N11 | क्रूसमाथि, / येशूको पुकार। | 십자가 위, / 예수의 외침. | Faithful. | — | — |
| N12 | यो पुकार एक हजार वर्षअघि / अभिषिक्त राजा दाऊदले लेखेको / भजनको पहिलो हरफ हो। | 이 외침은 (지금부터) 천 년 전 / 기름 부음 받은 왕 다윗이 쓴 / 시편의 첫 줄이다. | वर्षअघि = "years ago" (shared note). | LOW | यो पुकार त्‍यसभन्दा एक हजार वर्षअघि / अभिषिक्त राजा दाऊदले लेखेको / भजनको पहिलो हरफ हो। |
| N14 | क्रूसमुनि सिपाहीहरूले / उहाँका वस्‍त्रहरू बाँडे र उहाँको पोशाकको निम्‍ति चिट्ठा हाले। | 십자가 아래서 군인들이 / 그의 옷들을 나누고 그의 의복을 두고 제비를 뽑았다. | Faithful. | — | — |
| N20 | ‘परमेश्‍वरले यसो नगरून्’ भन्‍ने पत्रुसले / मृत्‍युबाट बौरिउठ्नुभएका येशूलाई भेटेपछि यो प्रचार गरे: | '하나님이 이렇게 하지 마시기를' 하는 베드로가 / 죽음에서 살아나신 예수를 만난 뒤 이것을 전파했다: | भन्ने is aspect-neutral ("Peter who says"). The Korean "하던" means "who had once said". | LOW | एक पटक ‘परमेश्‍वरले यसो नगरून्’ भनेका पत्रुसले / मृत्‍युबाट बौरिउठ्नुभएका येशूलाई भेटेपछि यो प्रचार गरे: |
| N15 | दुःख भोग्‍नुहुने ख्रीष्‍ट असफलता होइन, / धर्मशास्‍त्रले देखाएको बाटो हो। | 고난받으시는 그리스도는 실패가 아니다, / 성경이 보여 준 길이다. | Faithful. धर्मशास्त्र matches Jn 19:24. | — | — |
| N16K–R | राजा, · पुजारी, · अगमवक्ता, | 왕, · 제사장, · 선지자, | ok | — | — |
| N16 | तीन पद, / एकै व्‍यक्तिमा। | 세 직분, / 한 인격 안에. | Faithful. | — | — |
| N17 | ‘ख्रीष्‍ट’ थर होइन, / येशू नै ती मसीह हुनुहुन्‍छ भन्‍ने / स्‍वीकारोक्ति हो। | '그리스도'는 성이 아니다, / 예수께서 바로 그 메시야이시라는 / 고백이다. | Faithful. | — | — |
| K2 | फेरि तिनले अभिषेक गर्ने तेल लिएर / हारूनको शिरमा खन्‍याई | 또 그가 붓는 기름을 가지고 / 아론의 머리에 부어 | Ends on खन्याई (shared note). | LOW | फेरि तिनले अभिषेक गर्ने तेल लिएर / हारूनको शिरमा खन्‍याई उनलाई चोख्‍याउनलाई अभिषेक गरे। |
| other quotes | Q1 K1 K3 Q2 Q3 Q4 Q5 Q6 Q7 Q9 Q11 Q12 Q14 Q13 | — | All read as whole clauses and end on finite verbs. The K3 voice includes अगमवक्ता. Q1 «हामीले मसीहलाई / (जसको अर्थ हो, ख्रीष्ट) भेट्टाएका छौं।» ends on its verb, which works. | — | — |
