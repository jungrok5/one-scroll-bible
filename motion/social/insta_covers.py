import os, subprocess, sys
from PIL import Image,ImageDraw,ImageFont,ImageFilter
O=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))+'/out/'; OUT=O+'insta/'; C=O+'social-tmp/'; os.makedirs(C,exist_ok=True)
SERIF='/root/.local/share/fonts/Noto-900.ttf'; SANSB='/root/.local/share/fonts/Noto-700.ttf'; SANSL='/root/.local/share/fonts/Noto-300.ttf'
GOLD=(244,199,110); WHITE=(250,246,236)
def F(p,s): return ImageFont.truetype(p,s)
NAMES={'opening':'하나의 줄거리','creation':'창조','fall':'타락','patriarch':'족장','exodus':'출애굽','wilderness':'광야 여정','judges':'사사 시대',
 'kingdom':'통일 왕국','exile':'분열 · 포로','return':'포로 귀환','silence':'400년 침묵','advent':'예수님의 오심','cross':'십자가','rise':'부활',
 'church':'교회','renewal':'회복','mirror':'거울','gospel':'복음의 핵심','evidence':'성경은 실화인가','ship':'착하게 살면?','invite':'초대'}
ORDER=list(NAMES); PARTS=[ORDER[i:i+3] for i in range(0,21,3)]
def dur(s): return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',O+s+'-v.mp4']))
# (scene, time or fraction, horizontal focus)
PICK={'opening':(25.2,.5),'creation':(28.0,.45),'fall':(3.4,.55),'patriarch':(.3,.3),'exodus':(30,.5),'wilderness':(.55,.5),
 'judges':(.3,.5),'kingdom':(14,.4),'exile':(22,.4),'return':(.55,.5),'silence':(.3,.6),'advent':(15,.5),
 'cross':(3.9,.75),'rise':(10.8,.2),'church':(7.0,.5),'renewal':(.55,.5),'mirror':(.55,.4),'gospel':(.8,.5),
 'evidence':(24.0,.45),'ship':(17.2,.4),'invite':(5.7,.35)}
def frame(s):
    t,_=PICK[s]; t=t*dur(s) if t<1 else t; p=f'{C}full-{s}.png'
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',O+s+'-v.mp4','-frames:v','1',p],check=True)
    im=Image.open(p).convert('RGB')
    if s=='invite':
        from PIL import ImageEnhance; im=ImageEnhance.Brightness(im).enhance(1.6)
    return im
def glow(base,xy,s,font,fill,g=(0,0,0),gr=14,ga=230):
    L=Image.new('RGBA',base.size,(0,0,0,0)); ImageDraw.Draw(L).text(xy,s,font=font,fill=g+(ga,),anchor='ma')
    L=L.filter(ImageFilter.GaussianBlur(gr)); base.alpha_composite(L); base.alpha_composite(L)
    ImageDraw.Draw(base).text(xy,s,font=font,fill=fill,anchor='ma')
W,H=1080,1920
from PIL import ImageEnhance
BOOST={'invite':1.5,'gospel':1.4,'silence':1.15,'church':1.25}
for k,part in enumerate(PARTS):
    fr=[frame(s) for s in part]
    fr=[ImageEnhance.Brightness(f).enhance(BOOST.get(s,1)) if s!='invite' else f for s,f in zip(part,fr)]
    bg=fr[1].resize((W,H)).filter(ImageFilter.GaussianBlur(40)); bg=Image.blend(bg,Image.new('RGB',(W,H),(8,8,14)),.62)
    im=bg.convert('RGBA'); mw,mh=340,604; gap=(W-3*mw)//4; y0=262
    for i,f in enumerate(fr):
        m=f.resize((mw,mh),Image.LANCZOS); x=gap+i*(mw+gap)
        sh=Image.new('RGBA',(mw+60,mh+60),(0,0,0,0)); ImageDraw.Draw(sh).rounded_rectangle((30,36,mw+30,mh+36),18,fill=(0,0,0,170))
        im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(14)),(x-30,y0-30))
        mk=Image.new('L',(mw,mh),0); ImageDraw.Draw(mk).rounded_rectangle((0,0,mw-1,mh-1),18,fill=255)
        im.paste(m,(x,y0),mk); ImageDraw.Draw(im).rounded_rectangle((x,y0,x+mw-1,y0+mh-1),18,outline=GOLD+(150,),width=2)
    c=W//2; d=ImageDraw.Draw(im)
    d.text((c,935),'한눈에 보는 성경 이야기',font=F(SANSB,42),fill=(230,225,215),anchor='ma')
    glow(im,(c,995),f'{k+1}/7',F(SERIF,190),GOLD,g=(60,30,0),gr=24,ga=200)
    for j,s in enumerate(part): glow(im,(c,1250+j*90),NAMES[s],F(SERIF,68),WHITE)
    im.convert('RGB').save(f'{OUT}cover-part{k+1}.jpg',quality=92)
    im.convert('RGB').crop((0,240,1080,1680)).resize((270,360)).save(f'{C}grid{k+1}.png')
print('ok')
