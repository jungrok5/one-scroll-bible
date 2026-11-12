# xlinks.json 교차 링크 문구 — 원어민 검토 (2026-11-13)

검토 대상: `motion/youtube/xlinks.json` — `film14`(19개 언어 × langs/korean/silence400), `silence400`(en/es/pt-BR × film14/langs/korean), `silence400_comment`, `ko.intl`.
대조 기준: `motion/films/silence400/i18n/<lang>.json`의 `T1`(검토를 마친 「침묵의 400년」 제목·자막 제목 카드), `uploaded.json`(자막·오디오 트랙 실제 상태), `xlinks.mjs`(각 줄이 가리키는 URL).

## 요약 (한국어)

- **BLOCKER 없음.** 뜻이 틀린 줄은 없다.
- **MAJOR 5건**
  1. **ta — "வசனங்கள்" 단어 문제(korean·silence400 두 줄).** 타밀어 "வசனம்"은 영화의 *대사*, 그리고 교회에서는 *성경 구절*이라는 뜻이다. 그래서 "தமிழ் வசனங்களுடன்"은 "타밀어 대사(더빙)와 함께" 또는 "타밀어 성경 구절과 함께"로 읽힌다. 자막은 YouTube 타밀어 화면의 말인 "வசன வரிகள்"로 바꾼다.
  2. **en / es / pt-BR — film14.silence400가 사실보다 덜 말한다.** 400년 영상은 en이 원래 해설 언어이고, es·pt-BR은 오디오(해설) 트랙이 있다. 그런데 "English captions / subtítulos en español / legendas em português"라고 쓰면 "외국어 영상에 자막만 붙어 있다"로 읽힌다. "해설"로 바꾼다(en은 언어 표기를 빼도 된다).
  3. **hi · fa — 400년 제목이 영상 자체 제목(T1)과 다르다.** hi는 "चुप्पी के 400 वर्ष"인데 T1은 "मौन के 400 वर्ष"다. 구어 चुप्पी와 문어 वर्ष를 섞어 쓴 것도 어색하다. fa는 "۴۰۰ سال سکوت"인데 T1은 "۴۰۰ سال خاموشی"다. 둘 다 자연스러운 말이지만, 영상 제목 카드와 같은 말로 써야 시청자가 같은 영상인 줄 안다.
     (en·es·pt-BR을 한 건으로, hi·fa를 한 건으로 세면 3묶음 5건이다. 아래 표 참조.)
- **MINOR (고치면 좋음)**
  - 숫자 표기가 T1과 다르다: ar "أربعمئة"↔T1 "400" · zh-Hans/zh-Hant "四百"↔T1 "400" · ja "400"↔T1 "四百" · bn "৪০০"(본국 숫자, 의도함)↔T1 "400".
  - 400년 영상의 `silence400.langs` "Other languages / Otros idiomas / Outros idiomas"는 실제로 **14분 영화·쇼츠의 언어별 재생목록**으로 간다. "이 영상의 다른 언어판"으로 오해할 수 있으니 대상을 밝혀 쓰는 편이 낫다.
  - 고정 댓글 ②의 "brings that promise back"은 영어로 조금 어색하다. "takes up that very promise"를 제안한다. 사실관계는 모두 맞다(말 4 = 개신교 순서로 구약 마지막 장, 눅 1:17이 말 4:6을 인용, 눅 4 나사렛 회당 이사야 61).
  - zh 두 언어 모두 "中文字幕"이다. 한국어 영상에 간체·번체 트랙이 따로 있으니 "简体中文字幕 / 繁體中文字幕"으로 쓰면 더 정확하다.
  - tl "may Filipino na subtitle"은 통하지만, "may subtitle sa Filipino"가 더 자연스러운 어순이다. 언어 이름 "Filipino"는 YouTube 트랙 이름과 같아서 맞다.
- 나머지(fr·de·ru·id·vi·th·sw·bn·ar·ja·zh 본문, ko.intl)는 자연스럽고 정확하다. zh-Hant 글자는 대만 표준 자형이다(語·韓·鐘·版). fa는 ZWNJ(زبان‌ها, کره‌ای)와 본국 숫자가 맞다. ar·fa의 RTL 쉼표(،)도 맞다.
- 사실 확인: 19개 언어 모두 한국어 14분 영상(`66VfBSXxAs8`, captions_foreign 19)과 국제 400년 영상(`oYKz_HHI8yw`, captions 27)에 실제로 자막 트랙이 있다. 그래서 "<언어> 자막" 표기는 모두 사실이다.

---

## 공통 키 뜻
- film14.langs = "Same film in other languages" → `@bibleinonescroll/playlists`
- film14.korean = "Korean original (<lang> captions)" → `youtu.be/66VfBSXxAs8`
- film14.silence400 = "The Silent 400 Years — 3 min, <lang> captions" → `youtu.be/oYKz_HHI8yw`

## en
| key | line | back-translation | verdict | suggestion |
|---|---|---|---|---|
| langs | Same film in other languages | — | OK | — |
| korean | Korean original (English captions) | — | OK | — |
| silence400 | The Silent 400 Years — 3 min, English captions | — | **MAJOR**: the video *is* English-narrated, so "English captions" implies a foreign-language video with subs | `The Silent 400 Years — 3 min` |

## es
| key | line | back-translation | verdict | suggestion |
|---|---|---|---|---|
| langs | La misma película en otros idiomas | The same film in other languages | OK ("película" works in Spain and Latin America, and avoids the video/vídeo split) | — |
| korean | Original en coreano (subtítulos en español) | Original in Korean (Spanish subtitles) | OK | — |
| silence400 | Los 400 años de silencio — 3 min, subtítulos en español | The 400 years of silence — 3 min, Spanish subtitles | **MAJOR**: the video has a Spanish audio track, so "subtítulos" undersells it and implies English audio. Title = T1 ✓ | `Los 400 años de silencio — 3 min, narrado en español` |

## pt-BR
| key | line | back-translation | verdict | suggestion |
|---|---|---|---|---|
| langs | O mesmo filme em outros idiomas | The same film in other languages | OK | — |
| korean | Original em coreano (legendas em português) | Original in Korean (Portuguese subtitles) | OK | — |
| silence400 | Os 400 anos de silêncio — 3 min, legendas em português | The 400 years of silence — 3 min, Portuguese subtitles | **MAJOR**: same as es (there is a pt-BR audio track). Title = T1 ✓ | `Os 400 anos de silêncio — 3 min, narrado em português` |

## fr
| key | line | back-translation | verdict | suggestion |
|---|---|---|---|---|
| langs | Le même film dans d'autres langues | The same film in other languages | OK | — |
| korean | Version originale coréenne (sous-titres en français) | Korean original version (French subtitles) | OK (natural "VO" phrasing) | — |
| silence400 | Les 400 ans de silence — 3 min, sous-titres en français | The 400 years of silence — 3 min, French subtitles | OK, = T1 | — |

## de
| key | line | back-translation | verdict | suggestion |
|---|---|---|---|---|
| langs | Derselbe Film in anderen Sprachen | The same film in other languages | OK | — |
| korean | Koreanisches Original (deutsche Untertitel) | Korean original (German subtitles) | OK | — |
| silence400 | Die 400 Jahre des Schweigens — 3 Min., deutsche Untertitel | The 400 years of silence — 3 min., German subtitles | OK, = T1 | — |

## ru
| key | line | back-translation | verdict | suggestion |
|---|---|---|---|---|
| langs | Этот же фильм на других языках | This same film in other languages | OK | — |
| korean | Корейский оригинал (русские субтитры) | Korean original (Russian subtitles) | OK | — |
| silence400 | 400 лет молчания — 3 мин, русские субтитры | 400 years of silence — 3 min, Russian subtitles | OK, = T1; "мин" without a period is standard | — |

## id
| key | line | back-translation | verdict | suggestion |
|---|---|---|---|---|
| langs | Film yang sama dalam bahasa lain | The same film in other languages | OK | — |
| korean | Versi asli bahasa Korea (subtitel bahasa Indonesia) | Original version, Korean language (Indonesian subtitles) | OK | — |
| silence400 | 400 Tahun Keheningan — 3 menit, subtitel bahasa Indonesia | 400 Years of Silence — 3 minutes, Indonesian subtitles | OK, = T1 | — |

## zh-Hans
| key | line | back-translation | verdict | suggestion |
|---|---|---|---|---|
| langs | 同一部影片的其他语言版本 | Other-language versions of the same film | OK | — |
| korean | 韩语原版（中文字幕） | Korean original (Chinese subtitles) | MINOR: the Korean video has both 简/繁 tracks | `韩语原版（简体中文字幕）` (optional) |
| silence400 | 沉默的四百年 — 3分钟，中文字幕 | The silent four hundred years — 3 min, Chinese subtitles | MINOR: T1 is "沉默的 400 年", and "四百" next to "3分钟" mixes numeral styles | `沉默的400年 — 3分钟，中文字幕` (optional) |

## zh-Hant
| key | line | back-translation | verdict | suggestion |
|---|---|---|---|---|
| langs | 同一部影片的其他語言版本 | Other-language versions of the same film | OK (Taiwan glyphs, "影片" is Taiwan usage) | — |
| korean | 韓語原版（中文字幕） | Korean original (Chinese subtitles) | MINOR (same as zh-Hans) | `韓語原版（繁體中文字幕）` (optional) |
| silence400 | 沉默的四百年 — 3分鐘，中文字幕 | The silent four hundred years — 3 min, Chinese subtitles | MINOR: T1 = "沉默的 400 年" | `沉默的400年 — 3分鐘，中文字幕` (optional) |

## ja
| key | line | back-translation | verdict | suggestion |
|---|---|---|---|---|
| langs | 同じ映像のほかの言語版 | Other-language versions of the same video | OK. MINOR alternative: 「この映像の他言語版」 | — |
| korean | 韓国語オリジナル版（日本語字幕） | Korean original version (Japanese subtitles) | OK | — |
| silence400 | 沈黙の400年 — 3分・日本語字幕 | The 400 years of silence — 3 min · Japanese subtitles | MINOR: T1 is 「沈黙の四百年」 (also the usual church term) | `沈黙の四百年 — 3分・日本語字幕` (optional) |

## ar (RTL)
| key | line | back-translation | verdict | suggestion |
|---|---|---|---|---|
| langs | الفيلم نفسه بلغات أخرى | The same film in other languages | OK | — |
| korean | النسخة الكورية الأصلية (مع ترجمة عربية) | The original Korean version (with Arabic subtitles) | OK ("ترجمة" is the usual word for subtitles) | — |
| silence400 | أربعمئة سنة من الصمت — 3 دقائق، مع ترجمة عربية | Four hundred years of silence — 3 minutes, with Arabic subtitles | OK. MINOR: T1 writes "400" | `400 سنة من الصمت — 3 دقائق، مع ترجمة عربية` (optional) |

## hi
| key | line | back-translation | verdict | suggestion |
|---|---|---|---|---|
| langs | यही फ़िल्म दूसरी भाषाओं में | This same film in other languages | OK | — |
| korean | मूल कोरियाई संस्करण (हिंदी सबटाइटल) | Original Korean edition (Hindi subtitles) | OK ("सबटाइटल" is the common YouTube word) | — |
| silence400 | चुप्पी के 400 वर्ष — 3 मिनट, हिंदी सबटाइटल | 400 years of silence (colloquial word) — 3 min, Hindi subtitles | **MAJOR**: differs from the reviewed title T1 "मौन के 400 वर्ष", and colloquial चुप्पी with literary वर्ष clash in register | `मौन के 400 वर्ष — 3 मिनट, हिंदी सबटाइटल` |

## vi
| key | line | back-translation | verdict | suggestion |
|---|---|---|---|---|
| langs | Cùng bộ phim bằng các ngôn ngữ khác | The same film in other languages | OK | — |
| korean | Bản gốc tiếng Hàn (phụ đề tiếng Việt) | Korean original (Vietnamese subtitles) | OK | — |
| silence400 | 400 năm im lặng — 3 phút, phụ đề tiếng Việt | 400 years of silence — 3 min, Vietnamese subtitles | OK (T1 uses title case "400 Năm Im Lặng"; either is fine) | — |

## th
| key | line | back-translation | verdict | suggestion |
|---|---|---|---|---|
| langs | ภาพยนตร์เรื่องเดียวกันในภาษาอื่น | The same film in other languages | OK (formal; "วิดีโอนี้ในภาษาอื่น" would be more casual, not needed) | — |
| korean | ต้นฉบับภาษาเกาหลี (คำบรรยายภาษาไทย) | Korean original (Thai subtitles) | OK (คำบรรยาย = YouTube's Thai UI term) | — |
| silence400 | 400 ปีแห่งความเงียบ — 3 นาที คำบรรยายภาษาไทย | 400 years of silence — 3 minutes, Thai subtitles | OK, = T1; a space as separator is normal Thai | — |

## tl (Filipino)
| key | line | back-translation | verdict | suggestion |
|---|---|---|---|---|
| langs | Ang parehong pelikula sa ibang wika | The same film in another language | OK (common usage) | — |
| korean | Orihinal na bersyong Korean (may Filipino na subtitle) | Original Korean version (with Filipino subtitle) | MINOR: understandable Taglish word order; "Filipino" correctly matches the YouTube track name | `Orihinal na bersyong Korean (may subtitle sa Filipino)` (optional) |
| silence400 | Ang 400 Taon ng Katahimikan — 3 minuto, may Filipino na subtitle | The 400 Years of Silence — 3 minutes, with Filipino subtitle | MINOR (same word order; T1 has no "Ang", which is fine) | `Ang 400 Taon ng Katahimikan — 3 minuto, may subtitle sa Filipino` (optional) |

## bn
| key | line | back-translation | verdict | suggestion |
|---|---|---|---|---|
| langs | একই চলচ্চিত্র অন্যান্য ভাষায় | The same film in other languages | OK | — |
| korean | মূল কোরীয় সংস্করণ (বাংলা সাবটাইটেল) | Original Korean edition (Bangla subtitles) | OK | — |
| silence400 | নীরবতার ৪০০ বছর — ৩ মিনিট, বাংলা সাবটাইটেল | 400 years of silence — 3 minutes, Bangla subtitles | OK (native digits intended; the T1 card uses ASCII "400" — cosmetic) | — |

## sw
| key | line | back-translation | verdict | suggestion |
|---|---|---|---|---|
| langs | Filamu hii hii kwa lugha nyingine | This very film in other languages | OK | — |
| korean | Toleo asili la Kikorea (manukuu ya Kiswahili) | Original Korean edition (Swahili subtitles) | OK ("manukuu" = YouTube term) | — |
| silence400 | Miaka 400 ya Ukimya — dakika 3, manukuu ya Kiswahili | 400 Years of Silence — 3 minutes, Swahili subtitles | OK, = T1 | — |

## fa (RTL)
| key | line | back-translation | verdict | suggestion |
|---|---|---|---|---|
| langs | همین فیلم به زبان‌های دیگر | This same film in other languages | OK (ZWNJ correct) | — |
| korean | نسخهٔ اصلی کره‌ای (با زیرنویس فارسی) | Original Korean version (with Persian subtitles) | OK | — |
| silence400 | ۴۰۰ سال سکوت — ۳ دقیقه، با زیرنویس فارسی | 400 years of silence — 3 minutes, with Persian subtitles | **MAJOR** (consistency): the reviewed title T1 is "۴۰۰ سال خاموشی". Both words are natural, but the description should name the video the way its title card does | `۴۰۰ سال خاموشی — ۳ دقیقه، با زیرنویس فارسی` |

## ta
| key | line | back-translation | verdict | suggestion |
|---|---|---|---|---|
| langs | இதே திரைப்படம் மற்ற மொழிகளில் | This same film in other languages | OK | — |
| korean | கொரிய மூலப் பதிப்பு (தமிழ் வசனங்களுடன்) | Korean original edition (with Tamil *dialogues / verses*) | **MAJOR**: வசனம் = film dialogue, and in church usage a Bible verse. It reads as "Tamil dub" or "with Tamil verses". YouTube's Tamil UI uses வசன வரிகள் for subtitles | `கொரிய மூலப் பதிப்பு (தமிழ் வசன வரிகளுடன்)` |
| silence400 | மௌனத்தின் 400 ஆண்டுகள் — 3 நிமிடம், தமிழ் வசனங்களுடன் | 400 years of silence — 3 min, with Tamil dialogues/verses | **MAJOR**: same word. Title = T1 ✓ | `மௌனத்தின் 400 ஆண்டுகள் — 3 நிமிடம், தமிழ் வசன வரிகளுடன்` |

---

## silence400 (on the international 400-years video: en default + es/pt-BR localized)
Targets: film14 → the same-language 14-min film · langs → `@bibleinonescroll/playlists` (per-language playlists of the **14-min film + Shorts**) · korean → `youtu.be/BWzpW2MVkCI`.

| lang | key | line | back-translation | verdict | suggestion |
|---|---|---|---|---|---|
| en | film14 | The whole Bible story in 14 minutes | — | OK | — |
| en | langs | Other languages | — | MINOR: can be read as "this video in other languages", but it leads to the 14-min/Shorts playlists | `The Bible story in 19 languages` (optional) |
| en | korean | Korean original | — | OK | — |
| es | film14 | Toda la historia de la Biblia en 14 minutos | The whole story of the Bible in 14 minutes | OK | — |
| es | langs | Otros idiomas | Other languages | MINOR (same as en) | `La historia de la Biblia en 19 idiomas` (optional) |
| es | korean | Original en coreano | Original in Korean | OK | — |
| pt-BR | film14 | Toda a história da Bíblia em 14 minutos | The whole story of the Bible in 14 minutes | OK | — |
| pt-BR | langs | Outros idiomas | Other languages | MINOR (same as en) | `A história da Bíblia em 19 idiomas` (optional) |
| pt-BR | korean | Original em coreano | Original in Korean | OK | — |

## silence400_comment (English pinned comment)
```
📖 Read it today
① Malachi 4 — the last promise of the Old Testament
② Luke 1 — 400 years later, an angel brings that promise back
③ Luke 4 — in the synagogue at Nazareth, Jesus reads from Isaiah
The whole Bible story in 14 minutes (19 languages): https://www.youtube.com/@bibleinonescroll/playlists
```
- Facts: ① Malachi 4 is the last OT chapter in Protestant order (ESV) ✓. Mal 4:5–6 (the Elijah promise) is fairly called "the last promise". ② In Luke 1:17, Gabriel tells Zechariah that John will go "in the spirit and power of Elijah, to turn the hearts of the fathers to the children", quoting Mal 4:6 ✓. "400 years later" is approximate and matches the film's framing ✓. ③ Luke 4:16–21 is Jesus reading Isaiah 61 in the Nazareth synagogue ✓. The playlists page holds 19 language playlists ✓.
- Wording: MINOR — "brings that promise back" is slightly unidiomatic (it sounds like the promise is returned). Suggested: `② Luke 1 — 400 years later, an angel takes up that very promise`. Everything else reads naturally.

## ko.intl
"다른 언어로 보기(영어·스페인어 등 19개 언어)" — 자연스럽고 정확하다(재생목록 19개). OK.
