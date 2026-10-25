# Made for the two channels on 2026-10-25: py motion/youtube/branding/banner.py  (writes banner-ko.jpg / banner-global.jpg next to itself)
# YouTube channel banners (2048x1152; everything important inside the centre 1235x338 that every device shows).
# Same look as the site's og.png: dark night background, soft gold glow above, faint violet below, gold cross.
import math, os, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 2048, 1152
F = 'C:/Windows/Fonts/'
OUT = os.path.dirname(os.path.abspath(__file__))

def background():
    img = Image.new('RGB', (W, H), (13, 16, 22))
    glow = Image.new('RGB', (W, H), (0, 0, 0))
    d = ImageDraw.Draw(glow)
    d.ellipse((W/2-900, -700, W/2+900, 520), fill=(70, 58, 30))
    d.ellipse((W/2-800, 860, W/2+800, 1700), fill=(36, 28, 58))
    glow = glow.filter(ImageFilter.GaussianBlur(220))
    return Image.blend(img, Image.eval(glow, lambda v: v), 0.55)

def cross(d, cx, cy, h):
    gold, w = (233, 188, 74), h * 0.155
    r = int(w * 0.18)
    d.rounded_rectangle((cx - w/2, cy - h/2, cx + w/2, cy + h/2), r, fill=gold)
    arm = h * 0.62
    d.rounded_rectangle((cx - arm/2, cy - h/2 + h*0.28, cx + arm/2, cy - h/2 + h*0.28 + w), r, fill=gold)

def make(name, title, sub, tfont, sfont, tsize, ssize):
    img = background(); d = ImageDraw.Draw(img)
    tf, sf = ImageFont.truetype(F + tfont, tsize), ImageFont.truetype(F + sfont, ssize)
    tw = d.textlength(title, font=tf); sw = d.textlength(sub, font=sf)
    ch = 230; gap = 70; block = max(tw, sw)
    x0 = W/2 - (ch*0.62 + gap + block) / 2
    cross(d, x0 + ch*0.31, H/2, ch)
    tx = x0 + ch*0.62 + gap
    d.text((tx, H/2 - 18), title, font=tf, fill=(244, 239, 228), anchor='ls')
    d.text((tx, H/2 + 62), sub, font=sf, fill=(201, 192, 172), anchor='ls')
    left, right = W/2 - 1235/2, W/2 + 1235/2
    assert x0 >= left and tx + block <= right, (name, x0, tx + block)
    img.save(os.path.join(OUT, name), quality=92)
    print(name, round(tx + block - x0), 'px wide of 1235')

make('banner-ko.jpg', '한눈에 보는 성경 이야기', '창조부터 새 하늘과 새 땅까지, 성경 전체를 하나의 이야기로',
     'NanumMyeongjoExtraBold.ttf', 'NanumGothic.ttf', 92, 34)
make('banner-global.jpg', 'Bible in One Scroll', 'The whole Bible as one story — a 14-minute film in many languages',
     'georgiab.ttf', 'georgia.ttf', 100, 34)
