# ElevenLabs prompts — 한눈에 보는 성경 이야기 (첫 영상) — 장면 음악·효과음

2026-10-17~18 클라우드 세션에서 만든 장면 소리. 로컬 대화 기록에는 없어 ElevenLabs 플로에서 creative_get_flow_node로 프롬프트를 꺼냄(2026-11-03). name = motion/pilot/audio/<name>.mp3 (_b = 같은 프롬프트의 두 번째 테이크). 장면 배치는 motion/pilot/<scene>.sound.json, 섞기는 mix.py. 음악 eleven_music_v2_5(instrumental), 효과음 eleven_text_to_sound_v2(prompt_influence 0.5 기본).

| name | kind | model | len | prompt |
|---|---|---|---|---|
| opening__m1 | music | eleven_music_v2_5 | 13.1 | Solo cello alone, one unbroken melodic line in D major, intimate close-miked, no other instruments: begins with a single soft sustained note, then a slow lyrical phrase that rises and turns gently like a line being drawn, three arching phrases, warm and hopeful, tempo around 66 BPM, ends hanging on an unresolved note |
| opening__m2 | music | eleven_music_v2_5 | 15 | Solo cello continuing a single lyrical melodic line in D major, picking up after a pause, slowly climbing in register with growing warmth and quiet resolve, the highest and longest note about 8 seconds in, then descending calmly; a few soft harp harmonics as the only second colour; no drums, no pads |
| opening__m3 | music | eleven_music_v2_5 | 5.6 | Solo cello holding one long warm low D note with a soft harp harmonic chord above it, gentle, resolving, fading to silence |
| gospel__m1 | music | eleven_music_v2_5 | 33.7 | Precise minimal motorik pulse at 101 BPM in A minor: dry marimba ostinato in steady eighth notes, muted kick on every beat, tight closed hi-hat; every five seconds one new layer joins in turn (a pulsing electric bass, then a vibraphone counter-line, then a bright glockenspiel figure, then a mechanical piano ostinato), clean and exact, no reverb wash, no pads, steadily building, stops dead on a downbeat |
| gospel__m2 | music | eleven_music_v2_5 | 5.1 | One sustained warm A major chord on low cello and soft pipe organ, completely still, no rhythm, peaceful resolution, fading |
| invite__m1 | music | eleven_music_v2_5 | 10 | Solo cello alone, very soft and intimate, a slow tender melody in D major returning like a remembered theme, unhurried, rising gently toward one warm long note at the end, close-miked, no other instruments |
| invite__m2 | music | eleven_music_v2_5 | 40 | Very quiet prayerful solo piano in D major with a few soft sustained cello notes underneath, slow rubato around 56 BPM, six short gentle phrases each followed by a long calm pause, tender, hopeful, humble, lots of space and silence, a gentle warm swell in the last six seconds, no drums, no pads, no choir |
| invite__m3 | music | eleven_music_v2_5 | 10 | Solo cello and soft piano together resolving a simple tender melody in D major, warm and peaceful, slow, the cello rising to one long high note then settling on a held major chord that fades to silence |
| opening__s1 | sfx | eleven_text_to_sound_v2 | 1 | Single soft tap of a pen nib touching thick paper, close and quiet |
| opening__s2 | sfx | eleven_text_to_sound_v2 | 8.6 | Fine pen gliding smoothly on thick textured paper, continuous soft scratch that speeds up and slows down, very close and quiet |
| opening__s3 | sfx | eleven_text_to_sound_v2 | 2.5 | Soft warm glassy shimmer swelling gently, like light filling a shape |
| opening__s4 | sfx | eleven_text_to_sound_v2 | 1.6 | Tiny drop of ink swelling at a pen tip, faint soft wet sound, almost silent |
| opening__s5 | sfx | eleven_text_to_sound_v2 | 6 | Fine sand trickling softly through an hourglass, close and delicate |
| opening__s6 | sfx | eleven_text_to_sound_v2 | 4.6 | Pen drawing slow deliberate straight lines on thick paper, soft scratches with small pauses at the corners |
| opening__s7 | sfx | eleven_text_to_sound_v2 | 4 | One clear high bell-like chime with a long gentle luminous reverb tail |
| opening__s8 | sfx | eleven_text_to_sound_v2 | 4.2 | Pen gliding fast in one long straight stroke across paper, light airy scratch fading away |
| gospel__s1 | sfx | eleven_text_to_sound_v2 | 1.5 | Ruling pen drawing several quick straight lines on paper, dry short tss sounds |
| gospel__s2 | sfx | eleven_text_to_sound_v2 | 0.8 | Heavy letterpress clack, a block of type pressed onto paper, dry and close, no reverb |
| gospel__s3 | sfx | eleven_text_to_sound_v2 | 0.8 | Guillotine paper cutter snick, one fast sharp cut through paper, dry |
| gospel__s4 | sfx | eleven_text_to_sound_v2 | 0.8 | Guillotine paper cutter snick, one fast sharp cut through a stack of card, dry |
| gospel__s5 | sfx | eleven_text_to_sound_v2 | 0.8 | Soft felt thump of a heavy box set down on a table, dry and close |
| gospel__s6 | sfx | eleven_text_to_sound_v2 | 0.8 | Rubber stamp pressed firmly onto paper, one dry thump |
| gospel__s7 | sfx | eleven_text_to_sound_v2 | 0.8 | Single clean knife slice through paper, short and dry |
| gospel__s8 | sfx | eleven_text_to_sound_v2 | 3 | One deep soft felt mallet stroke on a large bass drum, low and resonant, then silence |
| invite__s1 | sfx | eleven_text_to_sound_v2 | 6 | Fine pen gliding slowly on thick paper, soft continuous scratch, close and quiet, slowing at the end |
| invite__s2 | sfx | eleven_text_to_sound_v2 | 3 | Soft warm low swell of air and light, like a door opening onto a bright warm room |
| invite__s3 | sfx | eleven_text_to_sound_v2 | 2 | Gentle airy whoosh into brightness, soft and warm, fading out |
| invite__pen | sfx | eleven_text_to_sound_v2 | 2.5 | Fine pen writing one slow line on paper, soft continuous scratch, very quiet and close |
| mirror__m1 | music | eleven_music_v2_5 | 25 | Dark, elegant minimal score: a slow pulse of low cello and soft synth bass at 60 bpm, a glassy celesta motif that circles the same four notes again and again like a loop you cannot leave, faint shimmering metallic textures; restrained, hypnotic, a little seductive, gradually tighter and more insistent, no drums, no vocals |
| mirror__m2 | music | eleven_music_v2_5 | 18 | The loop stops; a single sustained low string note and a quiet bowed-vibraphone tone ring out, then a slow, tender solo piano plays a few searching chords in a minor key, intimate and honest, lots of space, ending on one unresolved but hopeful warm chord that hangs in the air |
| mirror__s1 | sfx | eleven_text_to_sound_v2 | 2.5 | Large studio spotlight switching on, heavy electrical clunk followed by a low hum |
| mirror__s2 | sfx | eleven_text_to_sound_v2 | 1.6 | Molten metal shifting and bubbling, short liquid gold slosh with a soft hiss |
| mirror__s3 | sfx | eleven_text_to_sound_v2 | 1.5 | A handful of gold coins clinking and settling on a stack |
| mirror__s4 | sfx | eleven_text_to_sound_v2 | 1.6 | Molten metal reforming, deep liquid swirl ending in a bright metallic ring |
| mirror__s5 | sfx | eleven_text_to_sound_v2 | 3 | Distant crowd applause in a large hall, swelling then fading out |
| mirror__s6 | sfx | eleven_text_to_sound_v2 | 2.2 | Liquid metal settling into a solid shape, then a soft crystalline shimmer like glass being polished |
| mirror__s7 | sfx | eleven_text_to_sound_v2 | 3 | A single soft high glass harmonic tone, pure and warm, slowly fading |
| kingdom__m1 | music | eleven_music_v2_5 | 19 | Intimate medieval chamber music: a solo lyre-harp plucking a simple modal melody in D dorian, slow and tender, with a soft bowed vielle drone underneath and a quiet recorder answering the harp after a while; pastoral, peaceful, like a shepherd singing at night; around 66 BPM, gentle and sparse |
| kingdom__m2 | music | eleven_music_v2_5 | 22 | Majestic but reverent medieval-style anthem: the same harp melody now carried by a small choir of low male voices singing an open-fifth chant, with harp arpeggios, a soft frame drum and warm brass swelling gradually; noble and hopeful, building to a radiant sustained chord and resolving gently; about 66 BPM |
| kingdom__s1 | sfx | eleven_text_to_sound_v2 | 4 | Quiet candle flame flicker and a soft page of thick parchment settling on a wooden desk, intimate room tone |
| kingdom__s2 | sfx | eleven_text_to_sound_v2 | 3 | A delicate high shimmer, like light gliding across gold leaf, soft and airy |
| kingdom__s3 | sfx | eleven_text_to_sound_v2 | 4 | Quill pen writing on parchment, soft scratching strokes, close and gentle |
| kingdom__s4 | sfx | eleven_text_to_sound_v2 | 3 | Distant soft sheep bleat in an open night field, crickets faintly |
| kingdom__s5 | sfx | eleven_text_to_sound_v2 | 3 | Slow drops of thick oil falling and dripping softly, followed by a warm gentle chime |
| kingdom__s6 | sfx | eleven_text_to_sound_v2 | 2 | Old parchment scroll unrolling, dry paper rustle |
| kingdom__s7 | sfx | eleven_text_to_sound_v2 | 3 | A single bright harp glissando upward ending in a soft bell tone |
| kingdom__s8 | sfx | eleven_text_to_sound_v2 | 3 | A thin sustained golden shimmer that slowly rises and fades, like a line of light drawn across a page |
| exile__m1 | music | eleven_music_v2_5 | 16 | Dark folk woodcut score: a low bowed drone on a hurdy-gurdy and contrabass, slow pizzicato cellos like footsteps, a single deep frame drum heartbeat; ominous and heavy but restrained, minor mode, about 60 BPM, tension slowly rising |
| exile__m2 | music | eleven_music_v2_5 | 23 | A lament: solo cello melody over a soft low string drone, sparse and grieving, Middle Eastern Phrygian colour, very slow, no percussion; near the end a quiet warm major chord in high strings and a faint celesta note appear like a small hope |
| exile__s1 | sfx | eleven_text_to_sound_v2 | 2.5 | Wood carving knife and gouge cutting into a wooden block, quick fibrous scrapes and chips |
| exile__s2 | sfx | eleven_text_to_sound_v2 | 2 | A heavy wooden block cracking and splitting in two, sharp crack then a deep groan |
| exile__s3 | sfx | eleven_text_to_sound_v2 | 1.2 | A woodcut print being pressed: a heavy press thud and paper pulled off a block |
| exile__s4 | sfx | eleven_text_to_sound_v2 | 5 | Distant low wind over ruins with a faint far-off rumble, mournful, no screams |
| exile__s5 | sfx | eleven_text_to_sound_v2 | 6 | Many slow tired footsteps on a dusty road, sandals shuffling, a distant procession |
| exile__s6 | sfx | eleven_text_to_sound_v2 | 15 | Gentle slow river flowing, soft water lapping on a reed bank, evening |
| exile__s7 | sfx | eleven_text_to_sound_v2 | 3 | Wind brushing the strings of a harp hanging in a tree, faint untouched shimmer of strings |
| exile__s8 | sfx | eleven_text_to_sound_v2 | 4 | A single small warm bell-like chime, very soft, like a star appearing |
| return__m1 | music | eleven_music_v2_5 | 11 | Quiet chamber-fantasy night music: a solo harp playing a slow, hopeful pentatonic melody with soft celesta sparkles and a warm low string pad, like a small light walking through the dark; gentle, 70 BPM, intimate |
| return__m2 | music | eleven_music_v2_5 | 15 | Warm building music for a night of labour: lute and harp ostinato, soft hand drum on a steady pulse, low strings gradually layering in, each phrase a little fuller as more lamps are lit; determined, hopeful, about 84 BPM, steadily rising in energy |
| return__m3 | music | eleven_music_v2_5 | 13 | Sunrise joy: full warm strings, soft horns and a wordless choir swelling into a bright major chord, harp glissandi, a gentle triumphant cadence, then settling into a tender sustained chord that fades |
| return__s1 | sfx | eleven_text_to_sound_v2 | 8.5 | Soft footsteps of a small group walking on a dusty desert road at night, light wind, distant crickets |
| return__s2 | sfx | eleven_text_to_sound_v2 | 8.5 | Small oil lamp flame flickering softly, gentle crackle |
| return__s3 | sfx | eleven_text_to_sound_v2 | 1.5 | A clay oil lamp set down gently on a stone, soft clink, then a small warm bell chime |
| return__s4 | sfx | eleven_text_to_sound_v2 | 3.5 | Several small chimes ringing one after another, light and warm, like lamps lighting one by one |
| return__s5 | sfx | eleven_text_to_sound_v2 | 8.5 | Stone blocks being set in place on a wall, soft knocks and scrapes of stone on stone, workers' footsteps, no voices |
| return__s6 | sfx | eleven_text_to_sound_v2 | 1.5 | Heavy wooden gate doors swinging closed, a deep satisfying wooden thud |
| return__s7 | sfx | eleven_text_to_sound_v2 | 4 | Morning birdsong beginning at dawn, a few birds, soft and distant |
| return__s8 | sfx | eleven_text_to_sound_v2 | 1 | A soft fantasy game dialogue chime, a single gentle bell tone |
| advent__m1 | music | eleven_music_v2_5 | 16 | Hushed sacred prelude in D Dorian: a very soft low organ pedal drone and an open-fifth hum, a lone wordless chant-like female voice singing a slow, unmetred line with long cathedral reverb, sparse harp notes; patient and expectant, almost still, slowly brightening, no drums, no piano |
| advent__m2 | music | eleven_music_v2_5 | 23 | Reverent, luminous nativity hymn: begins with one bright tubular bell and a shimmer of hand chimes, then a warm full organ swells gently under a soft wordless choir and rolling harp arpeggios in D major (Lydian colour), slow and tender, the swell peaks about 6 seconds in and settles into a calm glowing chord that holds and fades; awe and joy, no drums, no piano |
| advent__s1 | sfx | eleven_text_to_sound_v2 | 14 | Large empty stone church at dawn, deep quiet room tone with long reverb, very faint distant birdsong outside the windows |
| advent__s2 | sfx | eleven_text_to_sound_v2 | 3 | Single soft struck glass chime, low pitch, pure bell-like ring with long cathedral reverb |
| advent__s3 | sfx | eleven_text_to_sound_v2 | 3 | Single soft struck glass chime, a step higher, pure bell-like ring with long cathedral reverb |
| advent__s4 | sfx | eleven_text_to_sound_v2 | 3 | Single soft struck glass chime, mid pitch, pure bell-like ring with long cathedral reverb |
| advent__s5 | sfx | eleven_text_to_sound_v2 | 3 | Single soft struck glass chime, higher pitch, pure bell-like ring with long cathedral reverb |
| advent__s6 | sfx | eleven_text_to_sound_v2 | 3 | Single soft struck glass chime, high clear pitch, pure bell-like ring with long cathedral reverb |
| advent__s7 | sfx | eleven_text_to_sound_v2 | 5 | One deep resonant church bell stroke with a bright crystalline shimmer of tiny glass chimes rising after it, long reverb tail |
| advent__s8 | sfx | eleven_text_to_sound_v2 | 4 | Soft warm low air swell in a stone hall, like light filling a room, gentle and airy |
| church__m1 | music | eleven_music_v2_5 | 21 | Gentle event-driven pentatonic piece for marimba, kalimba and soft celesta over a warm airy pad, calm and expectant at first; after about 5 seconds a warm swell, then from 9 seconds a bright plucked ostinato that grows denser note by note (halves to quarters to eighths) like something being built, light shaker joins, hopeful and joyful, steady 96 bpm, no piano, no strings |
| church__m2 | music | eleven_music_v2_5 | 16 | Wide, luminous orchestral-free finale: a deep warm synth pad and soft choir 'aah', bells and vibraphone sparkling in widening rings, a slow majestic rise that blooms gently and resolves on a sustained major chord; awe, worldwide, hopeful; no drums, no piano |
| church__s1 | sfx | eleven_text_to_sound_v2 | 9 | Calm sea at dusk, soft low waves lapping on a small island shore, faint distant gulls |
| church__s2 | sfx | eleven_text_to_sound_v2 | 3.2 | Sudden rushing mighty wind sweeping around a small stone house, a strong airy whoosh that swirls and fades |
| church__s3 | sfx | eleven_text_to_sound_v2 | 2.6 | Several soft flames igniting one after another, gentle warm whooshes of fire, crackle |
| church__s4 | sfx | eleven_text_to_sound_v2 | 2.5 | Low warm whump as lights switch on, with a soft rising shimmer of a bell |
| church__s5 | sfx | eleven_text_to_sound_v2 | 3 | Many small wooden tiles rising out of water one after another, playful bubbly splashes and soft wooden knocks |
| church__s6 | sfx | eleven_text_to_sound_v2 | 3 | Small wooden sailing boat creaking softly, water lapping against the hull |
| church__s7 | sfx | eleven_text_to_sound_v2 | 4 | Distant islands rising from the sea, soft splashes in sequence, each followed by a tiny bright glass chime |
| church__s8 | sfx | eleven_text_to_sound_v2 | 4 | Airy whoosh rising into a deep soft cinematic boom with a long shimmering tail, like zooming out into space |
| renewal__m1 | music | eleven_music_v2_5 | 12 | Lonely, tender and sparse: a soft felt piano plays a slow minor melody with long pauses over a faint warm low drone, dry and dusty, aching but gentle, about 60 bpm, no drums |
| renewal__m2 | music | eleven_music_v2_5 | 10 | Intimate and hushed: a solo felt piano and one warm clarinet play a hesitant minor phrase that turns to major as a soft string pad swells underneath; comfort, a tear wiped away; fragile, tender, slow |
| renewal__m3 | music | eleven_music_v2_5 | 19 | Hopeful pastoral blossoming: fingerpicked acoustic guitar, glockenspiel and flute over light warm strings, gently building, sunlit and joyful; at about 11 seconds a radiant full warm major chord swells with soft wordless choir and shimmering bells, then glows and sustains to the end; no drums |
| renewal__s1 | sfx | eleven_text_to_sound_v2 | 10 | Dry desert wind blowing softly over cracked earth, thin and lonely, faint sand hiss |
| renewal__s2 | sfx | eleven_text_to_sound_v2 | 3.5 | Soft watercolour brush strokes on rough paper, gentle rustles one after another |
| renewal__s3 | sfx | eleven_text_to_sound_v2 | 2.5 | Gentle clear stream of water flowing over stones, close and calm |
| renewal__s4 | sfx | eleven_text_to_sound_v2 | 1.5 | A single small water drop falling, soft delicate plink with a short airy tail |
| renewal__s5 | sfx | eleven_text_to_sound_v2 | 3 | Warm soft shimmer of light, gentle rising airy chime glow |
| renewal__s6 | sfx | eleven_text_to_sound_v2 | 4 | Quick lively watercolour brush strokes sweeping across paper, many soft rustles in a row |
| renewal__s7 | sfx | eleven_text_to_sound_v2 | 9 | Peaceful garden in the morning: songbirds chirping, leaves in a light breeze, a small brook trickling |
| renewal__s8 | sfx | eleven_text_to_sound_v2 | 5 | Soft rising airy shimmer with distant gentle bells, radiant and calm |
| return__m1d | music | eleven_music_v2_5 | 22 | Cinematic orchestral score, starts intimate: solo felt piano playing a slow searching motif over a soft high string pad, around 70 BPM, hopeful but restrained; after about eight seconds warm cellos and a gentle pulse of low strings enter and the motif grows steady and determined, like people beginning patient work together, with a quiet frame drum keeping a working rhythm; the harmony turns golden and warm, then softens toward evening at the end |
| return__m2d | music | eleven_music_v2_5 | 10 | Night, awe and completion: sustained warm strings in a slow rising chord progression, a solo French horn stating a noble calm melody, soft harp arpeggios like many small lights, no drums, spacious and reverent, ending suspended on an open chord |
| return__m3d | music | eleven_music_v2_5 | 10 | Sunrise and joy: full warm string orchestra swelling from soft to radiant, a wordless mixed choir singing a bright major melody, timpani rolls building gently, celebratory but noble, ending on a long shining major chord |
| return__s1d | sfx | eleven_text_to_sound_v2 | 3 | Technical pen drawing long lines on drafting paper, soft scratching, close and quiet |
| return__s2d | sfx | eleven_text_to_sound_v2 | 2.5 | Large sheet of paper slowly unfolding and lifting, a soft airy rustle |
| return__s3d | sfx | eleven_text_to_sound_v2 | 3 | Warm soft swell of light, a gentle rising shimmer with a low airy whoosh, cinematic reveal |
| return__s4d | sfx | eleven_text_to_sound_v2 | 10 | Ancient stonemasons at work outdoors: chisels tapping stone, mallets, stones scraping, distant calls of workers, evening breeze |
| return__s5d | sfx | eleven_text_to_sound_v2 | 1.5 | Heavy limestone block set down onto a wall, a solid deep thud with a little grit |
| return__s6d | sfx | eleven_text_to_sound_v2 | 7 | Small oil lamps and a brazier burning at night, soft crackling fire, quiet night air |
| return__s7d | sfx | eleven_text_to_sound_v2 | 6 | Dawn in a quiet stone city: birds beginning to sing, soft morning air |
| return__s8d | sfx | eleven_text_to_sound_v2 | 4 | A large crowd outdoors breaking into a warm joyful shout of praise, then glad murmuring, reverberant |
| silence__m1h | music | eleven_music_v2_5 | 25 | Very sparse, patient chamber music: a lone solo cello playing a slow, long-breathed melody with many rests, a soft sustained viola drone underneath, very slow tempo around 54 BPM, quiet and lonely like an empty room in afternoon light; after about eight seconds a soft piano begins a gentle repeating figure that slowly quickens, like days passing, then thins out again; wistful, waiting, no drums |
| silence__m2h | music | eleven_music_v2_5 | 12 | A sudden soft arrival: a high shimmering string chord blooming out of silence, celesta and harp glittering on top, then a warm string ensemble and a soft wordless choir swelling slowly, major key, tender and full of quiet awe, ending on a long open sustained chord |
| silence__s1h | sfx | eleven_text_to_sound_v2 | 22 | Quiet room tone in an old stone house in the day: faint distant birds outside a window, a soft breeze, almost silent |
| silence__s2h | sfx | eleven_text_to_sound_v2 | 14 | Slow steady ticking of an old wooden clock in a quiet room, gradually speeding up, soft and distant |
| silence__s3h | sfx | eleven_text_to_sound_v2 | 1.5 | A small oil lamp being lit: a soft match strike and a tiny flame catching |
| silence__s4h | sfx | eleven_text_to_sound_v2 | 3 | Night falling in a quiet village: a few faint crickets, very still |
| silence__s5h | sfx | eleven_text_to_sound_v2 | 3 | A clear bright bell chime with a long shimmering tail, like a new star appearing in the night sky |
| creation__m1 | music | eleven_music_v2_5 | 10 | Near-silent dark ambient: a very deep sub-bass drone and slow breathing low strings at the edge of hearing, vast and still, no rhythm; in the last two seconds a single high glassy sustained tone fades in and rises slightly in pitch |
| creation__m2 | music | eleven_music_v2_5 | 21 | Cinematic orchestral score that begins instantly at full force on a radiant major chord: full strings, warm horns and wordless choir 'ah' with a timpani swell, overwhelming but glorious and joyful, not violent; after five seconds it opens into wonder: shimmering high strings, harp and celesta arpeggios, slow tempo around 60 BPM, a sense of endless space, a second gentle crest around 8 seconds in, then thinning into airy floating pads with soft choir as it ends |
| creation__m3 | music | eleven_music_v2_5 | 10 | Tender pastoral resolution in a major key: solo piano and warm string ensemble, a simple soft flute melody, peaceful morning, slow, ending on a long soft sustained chord |
| creation__s1 | sfx | eleven_text_to_sound_v2 | 6.5 | Very low, dark, calm open sea at night: slow deep water swells, almost no waves, vast and quiet |
| creation__s2 | sfx | eleven_text_to_sound_v2 | 2 | A single delicate crystalline shimmer, like one glass bell tone swelling softly into light |
| creation__s3 | sfx | eleven_text_to_sound_v2 | 4 | Enormous soft whoosh of warm light with a deep sub-bass bloom, smooth and glowing, no crack, no explosion, no debris |
| creation__s4 | sfx | eleven_text_to_sound_v2 | 2.6 | Rushing high-altitude wind as a camera falls through clouds, airy whoosh that rises and opens up |
| creation__s5 | sfx | eleven_text_to_sound_v2 | 8 | Gentle morning birdsong in a peaceful meadow, soft breeze through leaves, distant stream |
| fall__m1 | music | eleven_music_v2_5 | 10 | Serene traditional Chinese solo guqin, unmetred gentle plucks with glassy harmonics and slow slides, a soft breathy xiao flute far away, pentatonic, peaceful and spacious, like a quiet garden at dawn |
| fall__m2 | music | eleven_music_v2_5 | 10 | The same guqin turns dark: low muted string bends and a slow descending figure, a deep low drum roll swelling underneath, a cold low xiao drone, minor pentatonic, sorrowful and heavy, no melody resolution |
| fall__m3 | music | eleven_music_v2_5 | 14 | Tender hopeful theme: guqin harmonics like small points of light, a warm low string pad entering slowly, a gentle xiao melody in a major pentatonic mode, slow and quiet, growing a little warmer toward the end, ending on a soft open chord |
| fall__s1 | sfx | eleven_text_to_sound_v2 | 1.2 | A single drop of ink falling into water: short bright tink followed by a soft wet thud |
| fall__s2 | sfx | eleven_text_to_sound_v2 | 5.5 | Slow low rumble of wet ink spreading through paper, soft and dark, like a distant swelling wave |
| fall__s3 | sfx | eleven_text_to_sound_v2 | 2 | Two people running barefoot through tall grass and pushing into leaves to hide, quick soft rustling |
| fall__s4 | sfx | eleven_text_to_sound_v2 | 5.6 | A gentle evening wind moving through the trees of a garden, rising softly and passing by, leaves whispering |
| fall__s5 | sfx | eleven_text_to_sound_v2 | 3 | A tiny warm glassy shimmer, like one small bell tone glowing, very soft |
| fall__s6 | sfx | eleven_text_to_sound_v2 | 1 | A wooden seal pressed onto rice paper: soft wooden thump with a faint paper crackle |
| exodus__m1 | music | eleven_music_v2_5 | 16 | Small shadow-puppet theatre ensemble, percussion first: low barrel drum, hard woodblock clapper, small hand gongs, and a nasal bowed two-string fiddle playing a stern, modal, slightly sorrowful melody. Slow processional pulse around 70 bpm, tension growing steadily; in the last four seconds the drum accelerates into a roll and then thins to almost nothing. |
| exodus__m2 | music | eleven_music_v2_5 | 10 | Night, hushed and reverent: a solo bamboo flute playing a few long, sparse pentatonic phrases over a very soft low drone, lots of space and silence between notes, intimate small-room reverb, no percussion. |
| exodus__m3 | music | eleven_music_v2_5 | 16 | The shadow-theatre ensemble returns in full and swells into an awe-filled, hopeful march: a big gong on the downbeat, frame drums and barrel drum at a steady walking tempo, bowed fiddle and bamboo flute in warm unison over them, rising in brightness, then settling gently onto a long resolved chord at the end. |
| exodus__s1 | sfx | eleven_text_to_sound_v2 | 1.5 | Oil lamp being lit behind a cloth screen: a soft whoomp of flame and a small sizzle |
| exodus__s2 | sfx | eleven_text_to_sound_v2 | 4 | Single deep bronze gong strike with a long shimmering decay |
| exodus__s3 | sfx | eleven_text_to_sound_v2 | 2.2 | A sudden chorus of many frogs croaking, short and dry |
| exodus__s4 | sfx | eleven_text_to_sound_v2 | 2.5 | Hailstones pattering and bouncing hard on dry ground, short burst |
| exodus__s5 | sfx | eleven_text_to_sound_v2 | 1.6 | Oil lamps guttering and going out, quick fluttering flames then a soft pfft and sizzle |
| exodus__s6 | sfx | eleven_text_to_sound_v2 | 3.8 | A deep, slow, low wind passing high overhead from right to left, a dark whoosh that rises and fades away |
| exodus__s7 | sfx | eleven_text_to_sound_v2 | 3 | Big gong crash together with oil lamps flaring up all at once |
| exodus__s8 | sfx | eleven_text_to_sound_v2 | 3.5 | Great waters rushing apart and rising into walls, a deep roaring surge of the sea that settles into a low rumble |
| wilderness__m1 | music | eleven_music_v2_5 | 24 | Epic yet intimate fantasy-journey score: solo French horn and low strings state a noble, searching theme over a gentle walking pulse of soft timpani and harp; a wordless choir enters with awe at the mountain, then the music becomes warm and devotional, strings and a solo cello singing a tender hymn-like line; slow tempo around 66 bpm, rich and spacious. |
| wilderness__m2 | music | eleven_music_v2_5 | 18 | The journey theme returns brighter and fuller: horns and strings rise in a long hopeful crescendo with harp arpeggios and soft choir, arriving at a radiant, peaceful major-key resolution, then a quiet tender coda on solo strings and piano that holds a final warm chord. |
| wilderness__s1 | sfx | eleven_text_to_sound_v2 | 4.5 | Quill pen scratching on old parchment, slow continuous drawing strokes |
| wilderness__s2 | sfx | eleven_text_to_sound_v2 | 5.2 | Distant deep rolling thunder and a low rumble of a mountain, with a soft roar of fire far away |
| wilderness__s3 | sfx | eleven_text_to_sound_v2 | 7 | A vast desert camp at dusk: soft distant voices, a crackling campfire, sheep bleating far off, gentle evening wind |
| wilderness__s4 | sfx | eleven_text_to_sound_v2 | 5.2 | Morning by a river valley: birdsong, reeds rustling in a light breeze, many footsteps on dry pebbles |
| wilderness__s5 | sfx | eleven_text_to_sound_v2 | 2 | Old map paper unrolling and settling flat, a soft rustle |
| judges__m1 | music | eleven_music_v2_5 | 24 | Solo upright cinema piano accompanying a 1920s silent film, original photoplay style: a short misterioso opening, then a four-part cycle that repeats — a sly sinking chromatic figure, a heavy minor agitato with low tremolo, a pleading rising phrase, a bright rolled major chord of rescue — the same cycle played again faster and faster each time, the tempo and intensity accelerating wildly until it becomes a frantic tumble that stops abruptly. |
| judges__m2 | music | eleven_music_v2_5 | 10 | Solo cinema piano, slow and grave: sparse low chords in a minor key, a lonely questioning melody, long silences between phrases, reflective and sorrowful. |
| judges__m3 | music | eleven_music_v2_5 | 10 | Solo cinema piano turns tender: a warm, simple hymn-like melody in a major key, played gently with soft rolled chords, hopeful and consoling, ending on a long held chord. |
| judges__s1 | sfx | eleven_text_to_sound_v2 | 22.4 | Old 1920s film projector running: steady claw-and-motor purr and soft film flutter |
| judges__s2 | sfx | eleven_text_to_sound_v2 | 1.2 | Film jamming in an old projector: a stuttering clatter, then the film flapping loose on the reel |
| judges__s3 | sfx | eleven_text_to_sound_v2 | 0.6 | A projector lamp clicking off, short mechanical click |
| judges__s4 | sfx | eleven_text_to_sound_v2 | 16.5 | Old film projector running quietly: soft steady motor purr |
| silence__m1 | music | eleven_music_v2_5 | 25 | Quiet patient lullaby for felt piano and music box with soft harp, slow tempo around 66 BPM, a gentle steady pulse like a ticking clock, a simple repeating melody that returns again and again as seasons pass, warm but wistful, waiting and longing, very sparse, no drums |
| silence__m2 | music | eleven_music_v2_5 | 11 | Hopeful arrival: warm string ensemble swelling slowly from silence, celesta and harp glittering on top, a soft wordless choir, major key, tender and full of quiet joy, ending on a long open sustained chord |
| silence__s1 | sfx | eleven_text_to_sound_v2 | 2 | Small lamp switch click followed by a soft rising warm shimmer of light |
| silence__s2 | sfx | eleven_text_to_sound_v2 | 22.5 | Calm night ambience in a quiet village: distant crickets, a faint breeze, very soft and still |
| silence__s3 | sfx | eleven_text_to_sound_v2 | 1 | Single soft wooden block tap, like a paper card sliding into place |
| silence__s4 | sfx | eleven_text_to_sound_v2 | 3 | A clear bright bell chime with a long shimmering tail, like a new star appearing |
| evidence__m1 | music | eleven_music_v2_5 | 29 | Restrained documentary score: soft felt piano playing patient repeated eighth notes, a quiet bed of muted strings, occasional glassy bowed-vibraphone tones; curious, careful, investigative, steady tempo around 84 bpm, builds only by adding a second piano voice and a higher string line, no drums |
| evidence__m2 | music | eleven_music_v2_5 | 12 | After silence, a warm sustained string chord and a few slow, tender felt-piano notes, intimate and reverent, like a single lamp in a dark room, resolving gently on a major chord |
| evidence__s1 | sfx | eleven_text_to_sound_v2 | 1.4 | Fluorescent light table switching on: two quick starter clicks and a soft electrical ballast hum starting |
| evidence__s2 | sfx | eleven_text_to_sound_v2 | 1.8 | Rapid soft ticks of a mechanical counter, quiet and precise |
| evidence__s3 | sfx | eleven_text_to_sound_v2 | 1 | Glass loupe set down on a glass plate, a small clack with a high glassy ring |
| evidence__s4 | sfx | eleven_text_to_sound_v2 | 1 | Glass loupe set down on a glass slide, a small clack with a soft ring |
| evidence__s5 | sfx | eleven_text_to_sound_v2 | 2.8 | Fine pencil drawing quick straight lines on paper, light and rhythmic |
| evidence__s6 | sfx | eleven_text_to_sound_v2 | 1.2 | Light table switching off: a single switch click, the electrical hum dying away |
| ship__m1 | music | eleven_music_v2_5 | 17 | Whimsical children's storybook music: pizzicato strings, music box and clarinet, a jaunty sea-shanty lilt in 6/8 at a gentle tempo, playful and warm, light hand percussion, no vocals |
| ship__m2 | music | eleven_music_v2_5 | 11 | The same storybook sea-shanty turns uneasy: low clarinet and cello in a minor key, slow, a soft rumbling drum far away, a little ominous but still gentle enough for a child |
| ship__m3 | music | eleven_music_v2_5 | 23 | Warm, hopeful children's storybook theme: glockenspiel and soft strings rise into a tender major-key melody with ukulele and gentle woodwinds, swelling with joy and wonder, then settling into a peaceful, glowing final chord |
| ship__s1 | sfx | eleven_text_to_sound_v2 | 1.6 | Hardcover book page swinging open, cardboard creak and a soft paper thump |
| ship__s2 | sfx | eleven_text_to_sound_v2 | 1.2 | Pop-up book paper piece springing up with a crisp paper snap |
| ship__s3 | sfx | eleven_text_to_sound_v2 | 5.5 | Small mop scrubbing a wooden deck, light rhythmic swishes |
| ship__s4 | sfx | eleven_text_to_sound_v2 | 2 | Distant soft thunder rumble, low and gentle |
| ship__s5 | sfx | eleven_text_to_sound_v2 | 1.2 | Pop-up book paper ship springing up with a bright paper snap and a soft chime |
| ship__s6 | sfx | eleven_text_to_sound_v2 | 1.4 | Cartoon paper jump: quick upward whoosh and a soft cardboard tap on landing |
| ship__s7 | sfx | eleven_text_to_sound_v2 | 2 | Gentle magical sparkle chime, warm and bright, like a music box flourish |
| ship__s8 | sfx | eleven_text_to_sound_v2 | 3 | Paper pull-tab sliding slowly, soft cardboard friction |
| evidence__m3 | music | eleven_music_v2_5 | 41 | Intimate cinematic score for a journey through an explorer's journal: a solo cello playing a long, searching, slightly Middle-Eastern melody over a soft bed of warm strings and a low hand-frame-drum heartbeat, a plucked oud answering in short phrases, around 72 bpm; curious and warm at first, a gentle lift with a second string line as discoveries pile up, never busy; desert dusk mood, analog warmth, no synths, no piano loops |
| evidence__m4 | music | eleven_music_v2_5 | 20 | Slow tender orchestral close: sustained strings swell gently, a solo cello sings a calm phrase over a soft warm major chord, a single high oud note now and then, opening up like evening air over the desert, reverent and peaceful, resolving quietly on a long major chord; no drums, no synths |
| evidence__e1 | sfx | eleven_text_to_sound_v2 | 2 | An old leather-bound journal lying open on a wooden desk, a soft creak of the spine and a light rustle of thick paper |
| evidence__e2 | sfx | eleven_text_to_sound_v2 | 2.2 | A dip pen writing a short handwritten line on thick paper, fine scratchy nib strokes, close and quiet |
| evidence__e3 | sfx | eleven_text_to_sound_v2 | 1.8 | A pencil quickly ticking off tally marks on paper, rapid short dry strokes |
| evidence__e4 | sfx | eleven_text_to_sound_v2 | 1.6 | A single heavy page of an old scrapbook turning over, papery whoosh and a soft flap as it settles |
| evidence__e5 | sfx | eleven_text_to_sound_v2 | 1.6 | A thick scrapbook page turning, crisp paper rustle with a pasted photograph flexing, soft landing |
| evidence__e6 | sfx | eleven_text_to_sound_v2 | 2.4 | A fine pen drawing a row of short straight lines on paper, light rhythmic scratches |
| evidence__e7 | sfx | eleven_text_to_sound_v2 | 1.6 | The last page of an old journal turning slowly, a long soft paper sweep and a gentle settle |
| evidence__e8 | sfx | eleven_text_to_sound_v2 | 14 | Quiet desert at dusk: a soft warm wind over sand, the faint flutter of a small lantern flame, very still and spacious |
| ship__c1 | music | eleven_music_v2_5 | 25 | 18th-century chamber music for a sea voyage: harpsichord continuo, a solo viola and a low cello drone in D minor, a slow lilting 6/8 hornpipe figure, stately and a little melancholy, like an old map being unrolled by candlelight; in the last third a low string ostinato makes it heavier and darker; no drums, no vocals, no synths |
| ship__c2 | music | eleven_music_v2_5 | 14 | Brooding baroque strings: cellos and double basses walking down a slow ground bass in D minor, a distant soft timpani roll like far thunder at sea, ominous but restrained; after about 7 seconds a solo oboe enters with a searching, tentatively hopeful phrase above the dark strings; no vocals, no synths |
| ship__c3 | music | eleven_music_v2_5 | 23 | Warm baroque resolution in D major: a solo violin and an oboe sing a rising, tender melody over gentle strings and harpsichord continuo, as if someone is rescued and carried home; it swells with quiet joy around 8 seconds, then settles into a calm, luminous, reverent close on a long sustained major chord; no drums, no vocals, no synths |
| ship__u1 | sfx | eleven_text_to_sound_v2 | 3 | A large old paper sea chart unrolled on a wooden table, soft crinkle and rustle of thick laid paper |
| ship__u2 | sfx | eleven_text_to_sound_v2 | 3.6 | A quill pen scratching a dotted line across thick paper, quick light taps and scratches |
| ship__u3 | sfx | eleven_text_to_sound_v2 | 3 | A scrubbing brush on a wet wooden ship deck, rhythmic swishes, timbers creaking softly |
| ship__u4 | sfx | eleven_text_to_sound_v2 | 4 | A black cloth flag flapping hard in a strong sea wind, heavy fabric snapping |
| ship__u5 | sfx | eleven_text_to_sound_v2 | 4.5 | Distant low thunder rolling over a dark sea, the first soft patter of rain |
| ship__u6 | sfx | eleven_text_to_sound_v2 | 2.6 | A rope ladder creaking against a wooden hull, footsteps climbing down into a small rowing boat, a gentle splash |
| ship__u7 | sfx | eleven_text_to_sound_v2 | 2.6 | A soft warm glassy shimmer swelling gently, luminous and calm |
| ship__u8 | sfx | eleven_text_to_sound_v2 | 3 | An engraver's burin cutting a long firm line into a copper plate, a fine metallic scrape |
| mirror__w1 | music | eleven_music_v2_5 | 25 | Late-1960s New York art-studio groove: a hypnotic, repetitive loop of muted electric guitar ostinato over soft brushed drums and a walking bass at about 96 bpm, with a lonely harmonica phrase drifting over the top; mechanical and cyclical like a printing press, each time the loop comes round it adds a layer and grows a little more insistent; no vocals |
| mirror__w2 | music | eleven_music_v2_5 | 10 | The same hypnotic guitar-and-harmonica loop speeding up and thickening like a machine running too fast, tape-pulse rhythm, layered and slightly overdriven, rising tension, cut off abruptly at the end; no vocals |
| mirror__w3 | music | eleven_music_v2_5 | 20 | A hushed, reflective cinematic piece: a shimmering sustained organ chord and soft strings fill a wide reverberant space; after a few seconds a lonely harmonica plays a slow, tender, searching phrase, very sparse, honest and intimate; it ends on one warm unresolved chord that hangs in the air; no drums, no vocals |
| mirror__p1 | sfx | eleven_text_to_sound_v2 | 1.8 | A wooden silkscreen frame set down on canvas with a soft knock, then a rubber squeegee pulled slowly across the mesh with a wet ink squelch |
| mirror__p2 | sfx | eleven_text_to_sound_v2 | 1.6 | Thick black ink spilling and spreading across paper, a slow wet glug |
| mirror__p3 | sfx | eleven_text_to_sound_v2 | 1.4 | A low muffled drum hit and a sharp, tense intake of breath |
| mirror__p4 | sfx | eleven_text_to_sound_v2 | 1 | A paint roller pushed across canvas in one long sticky stroke |
| mirror__p5 | sfx | eleven_text_to_sound_v2 | 2.6 | Three silkscreen pulls in a row: wooden frame knocks and rubber squeegee scrapes, rhythmic and mechanical |
| mirror__p6 | sfx | eleven_text_to_sound_v2 | 3.2 | Silkscreen squeegee pulls repeating faster and faster like a machine, frame knocks and scrapes accelerating |
| mirror__p7 | sfx | eleven_text_to_sound_v2 | 2.6 | A sweeping shimmer of glass, like many mirrors catching the light one after another |
| mirror__p8 | sfx | eleven_text_to_sound_v2 | 3 | A single soft high glass harmonic tone, pure and warm, slowly fading |
| exodus__m4 | music | eleven_music_v2_5 | 14 | 1960s epic desert film score, full symphony orchestra: opens on a vast low string drone and a soft timpani roll under a lonely modal woodwind melody (oboe and wooden flute) like a desert dawn; at about 4 seconds the whole orchestra swells into a broad, noble horn and string theme in a minor-to-major Middle Eastern mode, then from 6 seconds stern brass chords and a slow pounding timpani pulse, proud and confrontational, about 70 BPM; big and cinematic, no synths, no drum kit |
| exodus__m5 | music | eleven_music_v2_5 | 17 | Dark cinematic orchestral storm that collapses into a hushed night: starts with ominous low brass clusters, tremolo strings and rolling timpani building in waves of dread for about 5 seconds, then everything drops away into near silence; from 7 seconds a very quiet, tender night lament: a solo clarinet or wooden flute over soft sustained low strings, slow and reverent, with long pauses; minor mode, no percussion in the second half, no synths |
| exodus__m6 | music | eleven_music_v2_5 | 17 | Awe-filled triumphant epic orchestral finale with wordless choir: begins with deep surging low strings and a steady processional timpani pulse like a great crowd walking, a heroic horn theme rising over it; at about 10 seconds the choir and full orchestra open up into a radiant, glowing major chord as if looking up at a towering pillar of fire, high strings shimmering, then a long resolving sustain; majestic, hopeful, 1960s widescreen epic, no synths, no drum kit |
| exile__m3 | music | eleven_music_v2_5 | 18 | Stark expressionist chamber score in the spirit of a 1930 anti-war film: a low bowed contrabass drone and a single muffled frame drum like a slow heartbeat, sparse and heavy, minor mode, about 56 BPM; at about 3.5 seconds a sudden harsh dissonant string cluster swells and tears apart, then sinks into grieving low cellos; from 10 seconds a distant mournful brass call over the drone, dread and loss, restrained, no melody resolving; no synths, no drum kit |
| exile__m4 | music | eleven_music_v2_5 | 21 | A lament: first a slow trudging procession, low pizzicato strings like heavy footsteps under a soft wordless women's voice; at about 6 seconds it settles into a solo cello melody over a quiet low string drone, Middle Eastern Phrygian colour, very slow and weeping, long silences between phrases, no percussion; intimate and sorrowful |
| exile__m5 | music | eleven_music_v2_5 | 10 | A small, tender hope after grief: soft high strings open onto a warm quiet major chord, a single gentle celesta note and a faint solo violin rising a few notes, very slow and hushed, glowing, then held to silence |
| exodus__s9 | sfx | eleven_text_to_sound_v2 | 5 | Dry desert wind blowing across sand dunes, soft hiss of drifting sand, open and vast |
| exodus__s10 | sfx | eleven_text_to_sound_v2 | 3 | Hailstones pelting hard dry ground and stone, a heavy rattling downpour of ice |
| exodus__s11 | sfx | eleven_text_to_sound_v2 | 3 | A close lightning strike: a sharp crack followed by a deep rolling thunder rumble |
| exodus__s12 | sfx | eleven_text_to_sound_v2 | 3.4 | A vast swarm of locusts approaching, a rising dense whirring buzz of countless wings |
| exodus__s13 | sfx | eleven_text_to_sound_v2 | 1.8 | A heavy old wooden door swinging shut with a creak and a deep wooden thud, then a latch |
| exodus__s14 | sfx | eleven_text_to_sound_v2 | 3.6 | A cold night wind passing slowly down an empty stone street, low and eerie, then gone |
| exodus__s15 | sfx | eleven_text_to_sound_v2 | 6 | Towering walls of sea water standing on both sides: a deep continuous roar of churning water, low rumble, spray |
| exodus__s16 | sfx | eleven_text_to_sound_v2 | 5.4 | A huge column of fire burning steadily: deep soft roar of flames, crackle, warm and powerful |
| exile__s9 | sfx | eleven_text_to_sound_v2 | 6 | A city burning far away at night: low distant roar and crackle of a great fire carried on the wind, mournful, no screams |
| m_patriarch | music | eleven_music_v2_5 | 26 | Quiet cinematic ambient score in D dorian. A solo oud plays a slow, sparse modal melody over a soft warm low string drone, intimate and reverent. Around the middle the oud fades and a delicate celesta and harp shimmer begins, slowly rising in pitch and density, and in the final seconds it blooms into a warm, hopeful full string chord with a soft choir pad. Slow tempo, no drums, wide natural reverb. |
| m_tension | music | eleven_music_v2_5 | 10 | Dark, still orchestral tension: a very low contrabass and cello drone with a distant wordless male choir hum, slowly swelling and growing heavier and more ominous over the whole duration. No melody, no rhythm, no percussion, cold and solemn. |
| m_lament | music | eleven_music_v2_5 | 14.5 | Slow, mournful string lament in D minor: low cellos and violas sustain a dark chord while a solo cello sings a deep, grieving melody. Restrained and reverent, it swells gently in the middle and then thins out to almost nothing at the very end. Very slow tempo, no percussion, large hall reverb. |
| m_piano | music | eleven_music_v2_5 | 7 | Sparse solo felt piano in D minor, a few slow single notes with long silences between them, intimate, tender and heartbroken, ending on an unresolved note that rings out. Very slow, close-miked, soft room reverb. |
| m_rise | music | eleven_music_v2_5 | 19.5 | Begins immediately with a radiant orchestral bloom in C major: bright sustained strings, soft wordless choir and a sparkling harp glissando with glockenspiel, joyful and triumphant yet tender. It settles into a warm, hopeful lyrical theme on strings and piano, gently rising again toward a peaceful resolved ending. Slow tempo, cinematic, no drums. |
| hammer | sfx | eleven_text_to_sound_v2 | 1.6 | Single heavy hammer blow driving an iron nail into thick wood, sharp metallic clang and deep wooden thud, outdoors |
| stone | sfx | eleven_text_to_sound_v2 | 3 | Huge round stone slab rolling slowly across rock, deep heavy grinding rumble ending in a dull thud |
| wind | sfx | eleven_text_to_sound_v2 | 14 | Soft desert wind at dusk, gentle airy gusts over dry grass |
| crowd | sfx | eleven_text_to_sound_v2 | 10 | Distant crowd murmuring while walking on a dirt road, low indistinct voices and shuffling footsteps, outdoors |
| crickets | sfx | eleven_text_to_sound_v2 | 14 | Night crickets chirping softly in a quiet desert, distant |
| heartbeat | sfx | eleven_text_to_sound_v2 | 1.5 | One slow deep heartbeat, close and muffled, lub-dub |
| drip | sfx | eleven_text_to_sound_v2 | 1 | Single drop of liquid falling onto dry earth, soft close-mic impact |
| thunder | sfx | eleven_text_to_sound_v2 | 6 | Deep distant thunder rolling slowly across the sky, low rumble |
| knife | sfx | eleven_text_to_sound_v2 | 4 | Palette knife spreading and scraping thick oil paint on canvas, close-mic, several short strokes |
| birds | sfx | eleven_text_to_sound_v2 | 14 | Gentle morning birdsong in a quiet garden at dawn, a few small birds |
| bell | sfx | eleven_text_to_sound_v2 | 6 | Single deep bronze bell toll, distant, long slow decay |
| shimmer | sfx | eleven_text_to_sound_v2 | 3 | Bright airy shimmer swelling up quickly into a soft radiant whoosh |
| hillwind | sfx | eleven_text_to_sound_v2 | 15 | Cold wind and light rain on an open hilltop, steady and bleak |
| church__m1 | music | eleven_music_v2_5 | 21 | Cinematic orchestral score: hushed and intimate at first, a low sustained cello note and soft breathing strings in a dark quiet room; at about 2.5 seconds a sudden rushing swell of string tremolo and breathy choir, then at 4 seconds warm radiant strings and soft choir bloom in D major, glowing and joyful; from 9 seconds a gentle steady pulse of low strings and soft timpani as the music travels outward, growing, hopeful and spacious; no piano, no synths, no drum kit |
| church__m2 | music | eleven_music_v2_5 | 16 | Wide, awe-filled cinematic orchestral finale in D major: soft full choir and warm strings, a slow majestic rise with gentle bells sparkling high above, blooming and resolving on a long sustained major chord; reverent, worldwide, hopeful; no drums, no synths, no piano |
| church__s1 | sfx | eleven_text_to_sound_v2 | 9 | Quiet night inside a small stone room: faint soft crackle of a tiny oil lamp flame, very distant crickets outside, still and hushed |
| church__s4 | sfx | eleven_text_to_sound_v2 | 2.5 | Warm soft swell of firelight filling a room, a gentle airy bloom with a faint choir-like shimmer |
| church__s5 | sfx | eleven_text_to_sound_v2 | 2.6 | Airy whoosh gliding out through a window into open night air, soft wind rising and opening up wide |
| church__s7 | sfx | eleven_text_to_sound_v2 | 4 | Distant village bells softly ringing across dark night hills, far away and gentle, with a light breeze |
| gospel__m1 | music | eleven_music_v2_5 | 35 | Cinematic and reverent film score at 101 BPM in A minor: soft felt piano playing gentle, steady eighth-note arpeggios over warm sustained low strings; about every five seconds one new layer joins in turn (a slow expressive cello melody, a soft wordless choir pad, a gentle low timpani pulse on the downbeats, high shimmering violins), growing steadily in warmth and intensity toward a hopeful swell, then stopping dead on a downbeat; orchestral and organic, no drum kit, no electronic sounds |
| gospel__s1 | sfx | eleven_text_to_sound_v2 | 2 | A thin line of light being drawn through the air: soft airy glassy shimmer that glides and rises gently |
| gospel__s3 | sfx | eleven_text_to_sound_v2 | 1.6 | Something made of light softly crumbling into fine glittering dust, airy granular dissolve, gentle and quiet |
| gospel__s5 | sfx | eleven_text_to_sound_v2 | 2.5 | A single warm soft bell tone blooming with a gentle shimmer of light, peaceful |
| gospel__s6 | sfx | eleven_text_to_sound_v2 | 2.5 | Deep warm swell of light: a soft low sub boom blooming into a bright airy shimmer |
| gospel__s7 | sfx | eleven_text_to_sound_v2 | 1.2 | One bright clean sweep of light, a soft airy swish with a faint glassy ring |
| gospel__m1 | music | eleven_music_v2_5 | 60 | Cinematic and reverent film score at 101 BPM in A minor: soft felt piano playing gentle, steady eighth-note arpeggios over warm sustained low strings; about every ten seconds one new layer joins in turn (a slow expressive cello melody, a soft wordless choir pad, a gentle low timpani pulse on the downbeats, high shimmering violins, a warm horn line), growing slowly and steadily in warmth and intensity toward a hopeful swell near the end, then stopping dead on a downbeat; orchestral and organic, no drum kit, no electronic sounds |
