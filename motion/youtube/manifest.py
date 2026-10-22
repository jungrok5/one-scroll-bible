# The upload sheet for YouTube — every language, the film and its 21 Shorts: file names (release assets), title,
# description with chapter timestamps, tags, thumbnails, caption tracks. Built from what the film already has
# (each language's _ui strings in motion/pilot/i18n/<lang>.json and the scene timings in motion/subs/timeline-h.json),
# so nothing here is translated twice.
#   python3 motion/youtube/manifest.py   → motion/youtube/manifest.json  (+ motion/youtube/manifest.md to read)
# Paths in the manifest are relative to the repository root; the videos are release assets (see motion/README.md).
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE)); M = os.path.join(ROOT, 'motion')
ORDER = ['opening', 'creation', 'fall', 'patriarch', 'exodus', 'wilderness', 'judges', 'kingdom', 'exile', 'return', 'silence',
         'advent', 'cross', 'rise', 'church', 'renewal', 'mirror', 'gospel', 'evidence', 'ship', 'invite']
LANGS = ['ko', 'en', 'es', 'pt-BR', 'fr', 'de', 'ru', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ar']
SITE = 'https://one-scroll-bible.com'
RELEASE = 'youtube-v1'
# a few lines the film page does not have — the call to the site and the Shorts tag, per language
EXTRA = {
  'ko':      dict(watch='전체 이야기를 글로 천천히 읽기 · 영상 페이지', part='장면 {n}/21', short_tail='전체 영상(14분)과 글로 읽는 성경 이야기', tags=['성경', '성경 이야기', '성경 개관', '구속사', '복음', '예수님', '기독교', '성경 애니메이션']),
  'en':      dict(watch='Read the whole story slowly · the film page', part='Scene {n} of 21', short_tail='The whole film (14 min) and the story in text', tags=['Bible', 'Bible story', 'Bible overview', 'gospel', 'Jesus', 'Christianity', 'Bible animation', 'redemptive history']),
  'es':      dict(watch='Lee toda la historia con calma · la página de la película', part='Escena {n} de 21', short_tail='La película completa (14 min) y la historia en texto', tags=['Biblia', 'historia de la Biblia', 'resumen de la Biblia', 'evangelio', 'Jesús', 'cristianismo', 'animación bíblica']),
  'pt-BR':   dict(watch='Leia toda a história com calma · a página do filme', part='Cena {n} de 21', short_tail='O filme completo (14 min) e a história em texto', tags=['Bíblia', 'história da Bíblia', 'resumo da Bíblia', 'evangelho', 'Jesus', 'cristianismo', 'animação bíblica']),
  'fr':      dict(watch='Lisez toute l’histoire à votre rythme · la page du film', part='Scène {n} sur 21', short_tail='Le film complet (14 min) et l’histoire en texte', tags=['Bible', 'histoire de la Bible', 'résumé de la Bible', 'Évangile', 'Jésus', 'christianisme', 'animation biblique']),
  'de':      dict(watch='Die ganze Geschichte in Ruhe lesen · die Filmseite', part='Szene {n} von 21', short_tail='Der ganze Film (14 Min.) und die Geschichte zum Lesen', tags=['Bibel', 'Geschichte der Bibel', 'Bibel Überblick', 'Evangelium', 'Jesus', 'Christentum', 'Bibel Animation']),
  'ru':      dict(watch='Прочитать всю историю не спеша · страница фильма', part='Сцена {n} из 21', short_tail='Весь фильм (14 мин) и история в тексте', tags=['Библия', 'история Библии', 'обзор Библии', 'Евангелие', 'Иисус', 'христианство', 'библейская анимация']),
  'id':      dict(watch='Baca seluruh kisah perlahan · halaman film', part='Adegan {n} dari 21', short_tail='Film lengkap (14 menit) dan kisahnya dalam teks', tags=['Alkitab', 'kisah Alkitab', 'ringkasan Alkitab', 'Injil', 'Yesus', 'Kristen', 'animasi Alkitab']),
  'zh-Hans': dict(watch='用文字慢慢读完整个故事 · 影片页面', part='第 {n}/21 场景', short_tail='完整影片（14 分钟）与文字版圣经故事', tags=['圣经', '圣经故事', '圣经概览', '福音', '耶稣', '基督教', '圣经动画']),
  'zh-Hant': dict(watch='用文字慢慢讀完整個故事 · 影片頁面', part='第 {n}/21 場景', short_tail='完整影片（14 分鐘）與文字版聖經故事', tags=['聖經', '聖經故事', '聖經概覽', '福音', '耶穌', '基督教', '聖經動畫']),
  'ja':      dict(watch='物語全体を文章でゆっくり読む · 映像ページ', part='場面 {n}/21', short_tail='全編（14分）と文章で読む聖書の物語', tags=['聖書', '聖書の物語', '聖書 概観', '福音', 'イエス', 'キリスト教', '聖書 アニメーション']),
  'ar':      dict(watch='اقرأ القصة كاملة على مهل · صفحة الفيلم', part='المشهد {n} من 21', short_tail='الفيلم الكامل (14 دقيقة) والقصة مكتوبة', tags=['الكتاب المقدس', 'قصة الكتاب المقدس', 'نظرة عامة على الكتاب المقدس', 'الإنجيل', 'يسوع', 'المسيحية', 'رسوم متحركة الكتاب المقدس']),
}
KO_UI = dict(title='영상으로 보는 성경 이야기', brand='한눈에 보는 성경 이야기', len='약 14분 · 소리와 함께',
             sub='창조에서 새 하늘과 새 땅까지 — 장면마다 다른 화풍으로 그린 21개 장면이 하나의 줄거리로 이어집니다.',
             shareText='창조에서 새 하늘과 새 땅까지, 성경 이야기를 14분 영상으로',
             legal='성경 인용: 「성경전서 개역개정판」 © 대한성서공회. 저작권은 대한성서공회에 있으며, 출처를 밝혀 인용했습니다. 장면의 그림은 모두 코드로 그렸고, 음악·효과음은 ElevenLabs로 만들었습니다.')
strip = lambda s: re.sub(r'<[^>]+>', '', s).replace('\xa0', ' ')
# the film page's blurb ends with "the pictures are drawn live in your browser" — true on the site, not on YouTube
blurb = lambda s: re.sub(r'([.。])[^.。]+[.。]\s*$', r'\1', strip(s))
def mmss(t): m, s = divmod(int(t), 60); return f'{m}:{s:02d}'

tl = json.load(open(os.path.join(M, 'subs', 'timeline-h.json')))
starts, off = {}, 0.0
for sc in ORDER: starts[sc] = off; off += tl[sc]['frames'] / 30
total = off
ko_ch = [re.sub(r'^\d\d\s*·\s*', '', next(k for k in json.load(open(os.path.join(M, 'pilot', 'i18n', '_ko', sc + '.json')))['ids'] if re.match(r'^\d\d\s*·', k))) for sc in ORDER]

out = {'release': RELEASE, 'release_url': f'https://github.com/jungrok5/one-scroll-bible/releases/tag/{RELEASE}', 'film_seconds': round(total, 1), 'languages': {}}
md = [f'# YouTube upload sheet\n\nVideos: release **{RELEASE}** (`gh release download {RELEASE} -R jungrok5/one-scroll-bible`). Paths below are relative to the repository root.\n']
for L in LANGS:
    ui = KO_UI if L == 'ko' else json.load(open(os.path.join(M, 'pilot', 'i18n', L + '.json')))['_ui']
    ch = ko_ch if L == 'ko' else ui['ch']
    X = EXTRA[L]; page = f'{SITE}/film/' + ('' if L == 'ko' else f'?lang={L}')
    chapters = [{'time': mmss(starts[sc]), 'seconds': round(starts[sc], 1), 'title': ch[i]} for i, sc in enumerate(ORDER)]
    desc = '\n'.join([blurb(ui['sub']), '', X['watch'] + ': ' + page, '', *[f"{c['time']} {c['title']}" for c in chapters], '', strip(ui['legal']), '',
                      ' '.join('#' + t.replace(' ', '') for t in X['tags'][:3])])
    tags = [ui['brand'], *X['tags'], *ch]
    while len(','.join(tags)) > 480: tags.pop()   # YouTube: 500 characters for all tags together
    captions = {l: f'motion/subs/{l}/film-h.srt' for l in LANGS if l != 'ko' and os.path.exists(os.path.join(M, 'subs', l, 'film-h.srt'))}
    film = {'file': f'film-{L}.mp4', 'local': f'motion/out/release/film-{L}.mp4', 'title': ui['shareText'][:100], 'description': desc, 'tags': tags,
            'language': L, 'thumbnail': f'motion/youtube/thumbs/{L}/A-exodus.jpg',
            'thumbnail_alternatives': [f'motion/youtube/thumbs/{L}/{v}.jpg' for v in ('B-cross', 'C-split', 'D-earth')],
            'captions': captions, 'chapters': chapters, 'playlist': ui['brand'], 'page': page}
    shorts = []
    for i, sc in enumerate(ORDER):
        n = i + 1; name = f'{n:02d}-{sc}'
        shorts.append({'n': n, 'scene': sc, 'file': f'shorts-{L}-{name}.mp4', 'local': f'motion/out/release/shorts-{L}-{name}.mp4',
                       'title': f"{ch[i]} · {X['part'].format(n=n)} · {ui['brand']}"[:100],
                       'description': '\n'.join([ui['shareText'], X['short_tail'] + ': ' + page, '', '#Shorts ' + ' '.join('#' + t.replace(' ', '') for t in X['tags'][:2])]),
                       'tags': tags[:12], 'language': L, 'seconds': round(tl[sc]['frames'] / 30, 1),
                       'captions': {l: f'motion/subs/{l}/v/{name}.srt' for l in LANGS if l != 'ko' and os.path.exists(os.path.join(M, 'subs', l, 'v', name + '.srt'))}})
    out['languages'][L] = {'brand': ui['brand'], 'film': film, 'shorts': shorts}
    md += [f'## {L} — {ui["brand"]}', f'**Film** `{film["file"]}` · thumbnail `{film["thumbnail"]}` (alternatives B/C/D) · captions {len(captions)} languages',
           f'- title: {film["title"]}', '- description:', '```', desc, '```', f'- tags: {", ".join(tags)}', '', '**Shorts** (`' + f'shorts-{L}-NN-<scene>.mp4' + '`)',
           *[f'{s["n"]:02d}. {s["title"]}  ({s["seconds"]} s)' for s in shorts], '']
json.dump(out, open(os.path.join(HERE, 'manifest.json'), 'w'), ensure_ascii=False, indent=1)
open(os.path.join(HERE, 'manifest.md'), 'w').write('\n'.join(md))
print('→ motion/youtube/manifest.json / manifest.md ·', len(LANGS), 'languages ·', f'{total:.1f}s')
