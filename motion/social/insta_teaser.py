import os, subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter
M=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); T=''+M+'/out/social-tmp/'
os.makedirs(T,exist_ok=True); os.makedirs(M+'/out/insta',exist_ok=True)
SERIF='/root/.local/share/fonts/Noto-900.ttf'; SANSB='/root/.local/share/fonts/Noto-700.ttf'; SANSL='/root/.local/share/fonts/Noto-300.ttf'
GOLD=(244,199,110); WHITE=(250,246,236); F=lambda p,s: ImageFont.truetype(p,s)
BEAT8=8*60/101   # 8 beats of the 101 BPM cue = 4.752 s
CLIPS=[('creation',5.6),('creation',20.5),('fall',17),('exodus',30),('wilderness',16),('kingdom',14),('exile',27),('silence',18),('advent',15),('cross',13),('rise',12),('church',26)]
# badge + end card
im=Image.new('RGBA',(1080,1920),(0,0,0,0)); d=ImageDraw.Draw(im); f=F(SANSB,36); s='한눈에 보는 성경 이야기'
b=d.textbbox((0,0),s,font=f); w=b[2]-b[0]; x=(1080-w)//2-32
d.rounded_rectangle((x,70,x+w+64,70+b[3]-b[1]+38),radius=40,fill=(12,10,8,170),outline=GOLD,width=3); d.text((x+32,70+19-b[1]),s,font=f,fill=GOLD); im.save(T+'tbadge.png')
im=Image.new('RGB',(1080,1920),(10,9,12)); g=Image.new('L',(1080,1920),0); ImageDraw.Draw(g).ellipse((60,520,1020,1400),fill=110); g=g.filter(ImageFilter.GaussianBlur(170))
im.paste(Image.new('RGB',(1080,1920),(70,50,24)),(0,0),g); d=ImageDraw.Draw(im); c=540
d.text((c,640),'성경 전체를',font=F(SERIF,84),fill=WHITE,anchor='ma'); d.text((c,750),'14분',font=F(SERIF,200),fill=GOLD,anchor='ma'); d.text((c,980),'만에 보다',font=F(SERIF,84),fill=WHITE,anchor='ma')
d.text((c,1130),'창조부터 새 하늘과 새 땅까지',font=F(SANSL,40),fill=(230,225,215),anchor='ma')
d.text((c,1230),'전체 영상은 프로필 링크에서',font=F(SANSB,46),fill=WHITE,anchor='ma'); im.save(T+'tend.png')
args=['ffmpeg','-y','-loglevel','error']
for s,t in CLIPS: args+=['-ss',str(t),'-t',f'{BEAT8:.3f}','-i',f'{M}/out/{s}-v.mp4']
n=len(CLIPS); args+=['-loop','1','-t','3.0','-i',T+'tend.png','-loop','1','-t','5','-i',T+'tbadge.png','-i',f'{M}/pilot/audio/gospel__m1.mp3']
fc=''.join(f'[{i}:v]setsar=1,fps=30,format=yuv420p,trim=duration={BEAT8:.3f},setpts=PTS-STARTPTS[v{i}];' for i in range(n))
fc+=f'[{n}:v]setsar=1,fps=30,format=yuv420p,fade=t=in:st=0:d=0.4[ve];'+''.join(f'[v{i}]' for i in range(n))+f'[ve]concat=n={n+1}:v=1:a=0[vc];'
fc+=f'[{n+1}:v]format=rgba,fade=t=in:st=0.3:d=0.5:alpha=1,fade=t=out:st=3.8:d=0.7:alpha=1[bd];[vc][bd]overlay=0:0:eof_action=pass[v];'
tot=n*BEAT8+3.0
fc+=f'[{n+2}:a]atrim=0:{tot:.3f},aresample=48000,loudnorm=I=-15:TP=-1.5:LRA=11,aresample=48000,afade=t=out:st={tot-1.8:.3f}:d=1.8[a]'
out=M+'/out/insta/teaser-60s.mp4'
args+=['-filter_complex',fc,'-map','[v]','-map','[a]','-c:v','libx264','-preset','slow','-crf','17','-profile:v','high','-maxrate','14M','-bufsize','28M','-g','60','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',out]
subprocess.run(args,check=True); print(out)
