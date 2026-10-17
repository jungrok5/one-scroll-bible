"""Fetch 개역개정 verses verbatim from 대한성서공회 (bskorea.or.kr). Usage: python3 motion/pilot/gae.py gen:1:3 jhn:3:16,17
   Footnote markers like 1) or ㄱ) are part of the page, not the verse — drop them. Trailing text after the verse may be the next section heading; check it."""
import re,sys,html,subprocess
def get(book,chap,vs):
    s=subprocess.run(['curl','-s','-A','Mozilla/5.0','--max-time','30',f'https://www.bskorea.or.kr/bible/korbibReadpage.php?version=GAE&book={book}&chap={chap}'],capture_output=True,text=True).stdout
    s=re.sub(r"<div id='D_[^>]*>[\s\S]*?</div>",'',s)
    out={}
    for m in re.finditer(r'<span class="number">(\d+)&nbsp;[^<]*</span>([\s\S]*?)(?=<span class="number">|<div id="?bible_footer|</td>|</div>)',s):
        t=re.sub(r'<[^>]+>','',m.group(2)); out[m.group(1)]=re.sub(r'\s+',' ',html.unescape(t)).strip()
    for v in vs: print(f'{book} {chap}:{v}\t{out.get(v,"MISSING")}')
for a in sys.argv[1:]:
    b,c,v=a.split(':'); get(b,c,v.split(','))
