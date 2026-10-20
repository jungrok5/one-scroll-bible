import os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
M=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT=M+'/out/insta/'; T=''+M+'/out/social-tmp/'
os.makedirs(T,exist_ok=True)
SERIF='/root/.local/share/fonts/Noto-900.ttf'; SANSB='/root/.local/share/fonts/Noto-700.ttf'; SANSL='/root/.local/share/fonts/Noto-300.ttf'
GOLD=(244,199,110); WHITE=(250,246,236)
NAMES={'opening':'하나의 줄거리','creation':'창조','fall':'타락','patriarch':'족장','exodus':'출애굽','wilderness':'광야 여정','judges':'사사 시대',
 'kingdom':'통일 왕국','exile':'분열 · 포로','return':'포로 귀환','silence':'400년 침묵','advent':'예수님의 오심','cross':'십자가','rise':'부활',
 'church':'교회','renewal':'회복','mirror':'거울','gospel':'복음의 핵심','evidence':'성경은 실화인가','ship':'착하게 살면?','invite':'초대'}
ORDER=list(NAMES)
PARTS=[ORDER[i:i+3] for i in range(0,21,3)]
def F(p,s): return ImageFont.truetype(p,s)
def ptitle(k): return ' · '.join(NAMES[s] for s in PARTS[k])
def badge(k):
    im=Image.new('RGBA',(1080,1920),(0,0,0,0)); d=ImageDraw.Draw(im); f=F(SANSB,34); s=f'한눈에 보는 성경 이야기  ·  {k+1}/7'
    b=d.textbbox((0,0),s,font=f); w=b[2]-b[0]; x=(1080-w)//2-30
    d.rounded_rectangle((x,70,x+w+60,70+b[3]-b[1]+36),radius=40,fill=(12,10,8,170),outline=GOLD,width=3); d.text((x+30,70+18-b[1]),s,font=f,fill=GOLD)
    im.save(T+f'badge{k}.png')
def endcard(k):
    im=Image.new('RGB',(1080,1920),(10,9,12)); d=ImageDraw.Draw(im)
    g=Image.new('L',(1080,1920),0); ImageDraw.Draw(g).ellipse((90,560,990,1360),fill=90); g=g.filter(ImageFilter.GaussianBlur(160))
    im.paste(Image.new('RGB',(1080,1920),(60,44,22)),(0,0),g)
    c=540
    if k<6:
        d.text((c,560),f'다음 편  {k+2}/7',font=F(SANSB,44),fill=GOLD,anchor='ma')
        for j,s in enumerate(PARTS[k+1]): d.text((c,650+j*84),NAMES[s],font=F(SERIF,62),fill=WHITE,anchor='ma')   # one scene per line: never wider than the frame
    else:
        d.text((c,660),'한눈에 보는 성경 이야기',font=F(SERIF,72),fill=WHITE,anchor='ma')
    d.line((340,950,740,950),fill=GOLD,width=2)
    d.text((c,1010),'전체 14분 영상은',font=F(SANSL,44),fill=(230,225,215),anchor='ma')
    d.text((c,1080),'프로필 링크에서',font=F(SANSB,52),fill=WHITE,anchor='ma')
    d.text((c,1200),'one-scroll-bible.com',font=F(SANSB,38),fill=GOLD,anchor='ma')
    im.save(T+f'end{k}.png')
ONLY=[int(x)-1 for x in sys.argv[1:]] or list(range(7))
for k in ONLY:
    badge(k); endcard(k)
    sc=PARTS[k]; args=['ffmpeg','-y','-loglevel','error']
    for s in sc: args+=['-i',f'{M}/out/{s}-v.mp4','-i',f'{M}/pilot/{s}.wav']
    n=len(sc); args+=['-loop','1','-t','3.5','-i',T+f'end{k}.png','-f','lavfi','-t','3.5','-i','anullsrc=r=48000:cl=stereo','-loop','1','-t','6','-i',T+f'badge{k}.png']
    e=2*n; parts=''.join(f'[{2*i}:v:0]setsar=1,fps=30,format=yuv420p[v{i}];[{2*i+1}:a:0]aresample=48000,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,aformat=channel_layouts=stereo[a{i}];' for i in range(n))
    parts+=f'[{e}:v]setsar=1,fps=30,format=yuv420p,fade=t=in:st=0:d=0.5[ve];[{e+1}:a]anull[ae];'
    streams=''.join(f'[v{i}][a{i}]' for i in range(n))+'[ve][ae]'
    fc=parts+f'{streams}concat=n={n+1}:v=1:a=1[vc][ac];[{e+2}:v]format=rgba,fade=t=in:st=0.8:d=0.6:alpha=1,fade=t=out:st=4.6:d=0.8:alpha=1[bd];[vc][bd]overlay=0:0:eof_action=pass:shortest=0[v]'
    out=OUT+f'part{k+1}-of-7.mp4'
    args+=['-filter_complex',fc,'-map','[v]','-map','[ac]','-c:v','libx264','-preset','slow','-crf','17','-profile:v','high','-maxrate','14M','-bufsize','28M','-g','60','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',out]
    subprocess.run(args,check=True)
    dur=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',out],capture_output=True,text=True).stdout.strip()
    print(k+1, ptitle(k), dur, flush=True)
