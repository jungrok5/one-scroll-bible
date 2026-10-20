import os
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'insta_covers.py')).read().split('W,H=1080,1920')[0])
W,H=1080,1920
PICK.update({'exodus':(30,.5),'advent':(15,.5),'rise':(10.8,.2)})
fr=[frame(s) for s in ('exodus','advent','rise')]
bg=fr[1].resize((W,H)).filter(ImageFilter.GaussianBlur(40)); bg=Image.blend(bg,Image.new('RGB',(W,H),(8,8,14)),.62)
im=bg.convert('RGBA'); mw,mh=340,604; gap=(W-3*mw)//4; y0=262
for i,f in enumerate(fr):
    m=f.resize((mw,mh),Image.LANCZOS); x=gap+i*(mw+gap)
    sh=Image.new('RGBA',(mw+60,mh+60),(0,0,0,0)); ImageDraw.Draw(sh).rounded_rectangle((30,36,mw+30,mh+36),18,fill=(0,0,0,170))
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(14)),(x-30,y0-30))
    mk=Image.new('L',(mw,mh),0); ImageDraw.Draw(mk).rounded_rectangle((0,0,mw-1,mh-1),18,fill=255)
    im.paste(m,(x,y0),mk); ImageDraw.Draw(im).rounded_rectangle((x,y0,x+mw-1,y0+mh-1),18,outline=GOLD+(150,),width=2)
c=W//2
glow(im,(c,925),'성경 전체를',F(SERIF,84),WHITE)
glow(im,(c,1025),'14분',F(SERIF,210),GOLD,g=(60,30,0),gr=24,ga=200)
glow(im,(c,1270),'만에 보다',F(SERIF,84),WHITE)
d=ImageDraw.Draw(im); d.text((c,1405),'창조부터 새 하늘과 새 땅까지',font=F(SANSL,40),fill=(230,225,215),anchor='ma')
f=F(SANSB,34); t='1분 예고편'; b=d.textbbox((0,0),t,font=f); w=b[2]-b[0]
d.rounded_rectangle((c-w//2-26,1478,c+w//2+26,1540),radius=31,outline=GOLD,width=3,fill=(20,16,12,200)); d.text((c,1490),t,font=f,fill=GOLD,anchor='ma')
im.convert('RGB').save(OUT+'cover-teaser.jpg',quality=92)
im.convert('RGB').crop((0,240,1080,1680)).resize((405,540)).save(C+'grid-teaser.png'); print('ok')
