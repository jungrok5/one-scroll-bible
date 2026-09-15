(function(){
  'use strict';

  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const coarse=matchMedia('(pointer: coarse)');
  const DPR=()=>Math.min(devicePixelRatio||1,coarse.matches?1.35:1.65);
  const TAU=Math.PI*2;
  const palettes=[
    ['#05091c','#173c61','#f0a76e','#dff7ff'],
    ['#130b1b','#4b202b','#b34c42','#f0aa78'],
    ['#050a20','#222b55','#8e5b38','#ffd88a'],
    ['#11172c','#155c78','#ef8b45','#9eeaff'],
    ['#101622','#4b5938','#c6a45a','#d7e3b1'],
    ['#171026','#6b3f27','#f3b957','#fff0b0'],
    ['#160a16','#52222b','#bb4f47','#ffb278'],
    ['#050712','#272c42','#727b91','#cdd3dc'],
    ['#07151b','#315e55','#dda85f','#dff0ca'],
    ['#02030a','#0b1220','#58617a','#dfe4ef'],
    ['#070819','#493324','#f4c468','#fff4cf'],
    ['#061624','#155b62','#6bd7bf','#d8fff2'],
    ['#0a1730','#397da2','#f2d37e','#f5fff0']
  ];

  function rng(seed){return function(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
  function lerp(a,b,t){return a+(b-a)*t;}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function rr(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):(ctx.rect(x,y,w,h));}
  function fillGradient(ctx,w,h,stops){const g=ctx.createLinearGradient(0,0,0,h);stops.forEach((s,i)=>g.addColorStop(i/(stops.length-1),s));ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}
  function glow(ctx,x,y,r,color,a){ctx.save();ctx.globalCompositeOperation='screen';const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(.12,color);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=a;ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();}
  function poly(ctx,pts,fill){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
  function mountain(ctx,w,h,y,amp,color,seed,shift){const r=rng(seed),pts=[[-30,h+20]],count=9;for(let i=0;i<=count;i++){const x=-30+(w+60)*i/count;const ridge=y-r()*amp-Math.sin(i*1.7+shift)*amp*.18;pts.push([x,ridge]);}pts.push([w+30,h+20]);poly(ctx,pts,color);}
  function mist(ctx,w,h,t,seed,baseY,alpha){const r=rng(seed);ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=alpha;ctx.filter='blur(20px)';for(let i=0;i<8;i++){const x=((r()*w+t*(8+i*2))%(w+240))-120,y=baseY+(r()-.5)*h*.12;const g=ctx.createRadialGradient(x,y,2,x,y,80+r()*110);g.addColorStop(0,'rgba(205,231,241,.42)');g.addColorStop(1,'rgba(205,231,241,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,150+r()*110,34+r()*30,0,0,TAU);ctx.fill();}ctx.restore();}
  function stars(ctx,w,h,t,seed,count,alpha){const r=rng(seed);ctx.save();for(let i=0;i<count;i++){const x=r()*w,y=r()*h*.58,rad=.45+r()*1.5,a=alpha*(.35+.65*Math.abs(Math.sin(t*.0007+i)));ctx.globalAlpha=a;ctx.fillStyle=i%11===0?'#ffd98f':'#edf5ff';ctx.beginPath();ctx.arc(x,y,rad,0,TAU);ctx.fill();}ctx.restore();}
  function ribbon(ctx,w,h,t,p,color,alpha){const sway=Math.sin(t*.00055)*w*.018;ctx.save();ctx.globalCompositeOperation='screen';ctx.lineCap='round';for(let k=5;k>=0;k--){ctx.beginPath();ctx.moveTo(w*(.1+.03*k),h*1.03);ctx.bezierCurveTo(w*(.34+sway/w),h*.78,w*(.72-.04*k),h*.74,w*(.54+sway/w),h*.54);ctx.bezierCurveTo(w*(.39+.02*k),h*.38,w*(.66-.03*k),h*.25,w*(.57+.02*Math.sin(t*.0008+k)),h*(-.05));ctx.strokeStyle=color;ctx.globalAlpha=alpha*(k===0?.9:.07+(5-k)*.035);ctx.lineWidth=(k===0?1.3:6+k*5)*(p*.7+.3);ctx.shadowColor=color;ctx.shadowBlur=k===0?12:26;ctx.stroke();}ctx.restore();}
  function river(ctx,w,h,color,t,wide){const wobble=Math.sin(t*.0007)*w*.018;ctx.save();ctx.globalCompositeOperation='screen';const g=ctx.createLinearGradient(0,h*.42,0,h);g.addColorStop(0,'rgba(255,255,255,.08)');g.addColorStop(.6,color);g.addColorStop(1,'rgba(255,255,255,.5)');ctx.beginPath();ctx.moveTo(w*.51,h*.38);ctx.bezierCurveTo(w*(.42+wobble/w),h*.56,w*(.65-wobble/w),h*.7,w*(.31-wide),h*1.05);ctx.lineTo(w*(.74+wide),h*1.05);ctx.bezierCurveTo(w*(.58+wobble/w),h*.7,w*(.48-wobble/w),h*.56,w*.53,h*.38);ctx.closePath();ctx.globalAlpha=.72;ctx.fillStyle=g;ctx.shadowColor=color;ctx.shadowBlur=22;ctx.fill();ctx.restore();}
  function city(ctx,w,h,x,y,s,color,lit){ctx.save();ctx.translate(x,y);ctx.fillStyle=color;for(let i=0;i<11;i++){const bw=s*(.12+(i%3)*.025),bh=s*(.16+(i*7%5)*.05),bx=(i-5)*s*.095;ctx.fillRect(bx,-bh,bw,bh);if(i%3===0)poly(ctx,[[bx,-bh],[bx+bw/2,-bh-s*.07],[bx+bw,-bh]],color);if(lit){ctx.fillStyle='rgba(255,220,142,.72)';ctx.fillRect(bx+bw*.34,-bh*.55,Math.max(1,bw*.12),Math.max(2,bh*.13));ctx.fillStyle=color;}}ctx.restore();}
  function tree(ctx,w,h,x,y,s,color,light){ctx.save();ctx.translate(x,y);ctx.fillStyle=color;ctx.fillRect(-s*.035,0,s*.07,s*.42);for(let i=0;i<17;i++){const a=i/17*TAU,r=s*(.12+(i%4)*.075),cx=Math.cos(a)*r*.8,cy=-s*.05+Math.sin(a)*r*.45;ctx.beginPath();ctx.arc(cx,cy,s*(.11+(i%3)*.025),0,TAU);ctx.fill();}if(light)glow(ctx,0,-s*.08,s*.55,light,.22);ctx.restore();}
  function people(ctx,w,h,count,fromY,color){ctx.save();ctx.fillStyle=color;for(let i=0;i<count;i++){const q=i/(count-1||1),y=lerp(fromY,h*.92,q),spread=lerp(w*.03,w*.27,q),x=w*.5+(i%2?1:-1)*spread*((i*7%11)/11),s=lerp(2,7,q);ctx.beginPath();ctx.arc(x,y-s*1.5,s*.42,0,TAU);ctx.fill();ctx.fillRect(x-s*.33,y-s*1.1,s*.66,s*1.55);}ctx.restore();}
  function gate(ctx,w,h,x,y,s,color,accent){ctx.save();ctx.translate(x,y);ctx.fillStyle=color;ctx.fillRect(-s*.42,-s*.5,s*.84,s*.5);ctx.clearRect(-s*.09,-s*.23,s*.18,s*.23);ctx.fillStyle=accent;for(let i=-3;i<=3;i+=2)ctx.fillRect(i*s*.09,-s*.36,s*.025,s*.07);ctx.restore();}

  class LivingWorld{
    constructor(el){this.el=el;this.canvas=el.querySelector('canvas');this.ctx=this.canvas.getContext('2d',{alpha:false});this.scene=+(el.dataset.world||0);this.seed=7301+this.scene*997;this.active=true;this.w=0;this.h=0;this.progress=.5;}
    resize(){const r=this.canvas.getBoundingClientRect(),d=DPR(),w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));if(w!==this.canvas.width||h!==this.canvas.height){this.canvas.width=w;this.canvas.height=h;this.w=r.width;this.h=r.height;this.ctx.setTransform(d,0,0,d,0,0);}}
    measure(){const sec=this.el.closest('.epoch,.hero'),r=sec.getBoundingClientRect(),vh=innerHeight||1;this.active=r.bottom>0&&r.top<vh;this.progress=clamp((vh-r.top)/(vh+r.height),0,1);}
    draw(t){this.resize();if(!this.w||!this.h)return;const c=this.ctx,w=this.w,h=this.h,s=this.scene,p=palettes[s]||palettes[0],q=this.progress,slow=reduced.matches?0:t;c.clearRect(0,0,w,h);fillGradient(c,w,h,[p[0],p[1],p[2]]);
      if(s===0)this.creation(c,w,h,slow,q,p);
      else if(s===1)this.fall(c,w,h,slow,q,p);
      else if(s===2)this.patriarch(c,w,h,slow,q,p);
      else if(s===3)this.exodus(c,w,h,slow,q,p);
      else if(s===4)this.judges(c,w,h,slow,q,p);
      else if(s===5)this.united(c,w,h,slow,q,p);
      else if(s===6)this.divided(c,w,h,slow,q,p);
      else if(s===7)this.exile(c,w,h,slow,q,p);
      else if(s===8)this.returned(c,w,h,slow,q,p);
      else if(s===9)this.silence(c,w,h,slow,q,p);
      else if(s===10)this.jesus(c,w,h,slow,q,p);
      else if(s===11)this.church(c,w,h,slow,q,p);
      else this.restoration(c,w,h,slow,q,p);
      const vg=c.createRadialGradient(w*.5,h*.48,Math.min(w,h)*.18,w*.5,h*.48,Math.max(w,h)*.78);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(.68,'rgba(0,0,0,.08)');vg.addColorStop(1,'rgba(0,0,0,.58)');c.fillStyle=vg;c.fillRect(0,0,w,h);
    }
    creation(c,w,h,t,q,p){stars(c,w,h,t,this.seed,70,1-q*.7);glow(c,w*.74,h*.27,Math.max(w,h)*.42,'#fff1bd',.65);mountain(c,w,h,h*.56,h*.18,'rgba(30,74,101,.84)',11,t*.00004);mountain(c,w,h,h*.64,h*.13,'rgba(24,85,83,.92)',12,t*.00005);river(c,w,h,'rgba(168,230,244,.72)',t,.05);mist(c,w,h,t,13,h*.61,.3);tree(c,w,h,w*.12,h*.69,Math.min(w,h)*.45,'#061d1e','#8ef5c2');ribbon(c,w,h,t,q,'#fff0ad',.42+.25*q);}
    fall(c,w,h,t,q,p){glow(c,w*.18,h*.24,w*.28,'#d66b51',.2);mountain(c,w,h,h*.58,h*.17,'#301c29',21,t*.00003);mountain(c,w,h,h*.7,h*.13,'#180f18',22,0);tree(c,w,h,w*.53,h*.55,Math.min(w,h)*.58,'#09080d','#8c2435');c.save();c.globalCompositeOperation='screen';c.strokeStyle='#d85445';c.shadowColor='#ff4f3a';c.shadowBlur=18;c.lineWidth=2;c.beginPath();c.moveTo(w*.5,0);c.lineTo(w*.56,h*.31);c.lineTo(w*.48,h*.51);c.lineTo(w*.59,h*.7);c.lineTo(w*.52,h);c.stroke();c.restore();ribbon(c,w,h,t,q,'#f18b63',.12);}
    patriarch(c,w,h,t,q,p){stars(c,w,h,t,this.seed,155,.9);mountain(c,w,h,h*.58,h*.14,'#34304a',31,0);mountain(c,w,h,h*.72,h*.12,'#6c4930',32,t*.00003);c.fillStyle='#1a1111';c.beginPath();c.moveTo(w*.66,h*.75);c.lineTo(w*.78,h*.63);c.lineTo(w*.89,h*.75);c.closePath();c.fill();glow(c,w*.78,h*.69,w*.18,'#ffb35d',.4);ribbon(c,w,h,t,q,'#ffd779',.44);mist(c,w,h,t,33,h*.68,.16);}
    exodus(c,w,h,t,q,p){stars(c,w,h,t,this.seed,45,.35);const open=lerp(w*.08,w*.2,q);let g=c.createLinearGradient(0,0,w*.5,0);g.addColorStop(0,'#0b6680');g.addColorStop(.8,'rgba(75,191,209,.88)');g.addColorStop(1,'rgba(160,240,244,.58)');c.fillStyle=g;c.beginPath();c.moveTo(0,h*.3);c.bezierCurveTo(w*.28,h*.35,w*.27,h*.72,w*.5-open,h);c.lineTo(0,h);c.closePath();c.fill();g=c.createLinearGradient(w,0,w*.5,0);g.addColorStop(0,'#0b6680');g.addColorStop(.8,'rgba(75,191,209,.88)');g.addColorStop(1,'rgba(160,240,244,.58)');c.fillStyle=g;c.beginPath();c.moveTo(w,h*.27);c.bezierCurveTo(w*.73,h*.36,w*.72,h*.72,w*.5+open,h);c.lineTo(w,h);c.closePath();c.fill();for(let i=0;i<7;i++){c.strokeStyle=`rgba(197,250,255,${.11+i*.018})`;c.lineWidth=1.2;c.beginPath();c.moveTo(0,h*(.38+i*.07));c.quadraticCurveTo(w*.23+Math.sin(t*.001+i)*12,h*(.32+i*.08),w*.5-open,h*(.8+i*.03));c.stroke();}glow(c,w*.5,h*.27,w*.24,'#ff963b',.58);c.save();c.globalCompositeOperation='screen';c.fillStyle='#ff9c35';c.shadowColor='#ff5b21';c.shadowBlur=28;c.beginPath();c.moveTo(w*.48,h*.58);c.bezierCurveTo(w*.39,h*.41,w*.57,h*.38,w*.48,h*.17);c.bezierCurveTo(w*.63,h*.31,w*.48,h*.45,w*.55,h*.58);c.fill();c.restore();people(c,w,h,24,h*.56,'#171018');}
    judges(c,w,h,t,q,p){mountain(c,w,h,h*.58,h*.18,'#4d5236',41,t*.00003);mountain(c,w,h,h*.72,h*.1,'#252b22',42,0);c.save();c.strokeStyle='rgba(225,203,129,.18)';for(let i=0;i<11;i++){c.beginPath();c.moveTo(w*(i/10),h);c.lineTo(w*.52,h*.57);c.stroke();}c.restore();for(let i=0;i<5;i++)glow(c,w*(.18+i*.17),h*(.68+(i%2)*.07),w*.07,'#d7b15d',.16);ribbon(c,w,h,t,q,'#d5bb72',.22);mist(c,w,h,t,43,h*.62,.18);}
    united(c,w,h,t,q,p){glow(c,w*.72,h*.25,w*.4,'#ffd87e',.42);mountain(c,w,h,h*.55,h*.16,'#5f483b',51,0);city(c,w,h,w*.53,h*.72,Math.min(w,h)*.78,'#35251f',true);c.fillStyle='#d99b3e';c.fillRect(w*.45,h*.49,w*.18,h*.08);poly(c,[[w*.45,h*.49],[w*.54,h*.42],[w*.63,h*.49]],'#f1c56a');ribbon(c,w,h,t,q,'#ffe19a',.36);mist(c,w,h,t,53,h*.65,.18);}
    divided(c,w,h,t,q,p){mountain(c,w,h,h*.58,h*.15,'#4c2834',61,0);city(c,w,h,w*.27,h*.76,Math.min(w,h)*.52,'#27131d',true);city(c,w,h,w*.74,h*.77,Math.min(w,h)*.5,'#311716',true);c.save();c.globalCompositeOperation='screen';c.strokeStyle='#d04f43';c.shadowColor='#ff5f49';c.shadowBlur=22;c.lineWidth=3;c.beginPath();c.moveTo(w*.51,0);c.lineTo(w*.46,h*.26);c.lineTo(w*.55,h*.43);c.lineTo(w*.47,h*.68);c.lineTo(w*.53,h);c.stroke();c.restore();ribbon(c,w,h,t,q,'#d96b57',.12);}
    exile(c,w,h,t,q,p){stars(c,w,h,t,this.seed,50,.22);mountain(c,w,h,h*.53,h*.14,'#24283b',71,0);gate(c,w,h,w*.7,h*.68,Math.min(w,h)*.62,'#171827','rgba(196,204,225,.38)');c.strokeStyle='rgba(180,190,210,.22)';c.lineWidth=w*.12;c.beginPath();c.moveTo(w*.05,h);c.quadraticCurveTo(w*.36,h*.68,w*.7,h*.7);c.stroke();people(c,w,h,9,h*.72,'#090a10');mist(c,w,h,t,73,h*.67,.25);ribbon(c,w,h,t,q,'#adb8d4',.08);}
    returned(c,w,h,t,q,p){glow(c,w*.76,h*.26,w*.32,'#f2c678',.3);mountain(c,w,h,h*.55,h*.14,'#3d5d55',81,0);city(c,w,h,w*.66,h*.75,Math.min(w,h)*.58,'#26342f',false);c.save();c.strokeStyle='rgba(229,195,123,.52)';c.lineWidth=2;for(let i=0;i<5;i++){c.strokeRect(w*(.43+i*.07),h*(.55-(i%2)*.04),w*.055,h*.2);}c.restore();ribbon(c,w,h,t,q,'#e5bf78',.3);mist(c,w,h,t,83,h*.66,.24);}
    silence(c,w,h,t,q,p){stars(c,w,h,t,this.seed,16,.08*q);mountain(c,w,h,h*.54,h*.13,'#111726',91,0);mountain(c,w,h,h*.68,h*.09,'#090c14',92,0);city(c,w,h,w*.73,h*.62,Math.min(w,h)*.34,'#070911',q>.66);const birth=clamp((q-.58)/.34,0,1);ribbon(c,w,h,t,q,'#fff0c0',.018+birth*.44);glow(c,w*.73,h*.57,w*.4,'#f7c66d',birth*.42);mist(c,w,h,t,93,h*.72,.08);}
    jesus(c,w,h,t,q,p){stars(c,w,h,t,this.seed,78,.42);mountain(c,w,h,h*.55,h*.14,'#40352f',101,0);city(c,w,h,w*.73,h*.68,Math.min(w,h)*.5,'#221a18',true);glow(c,w*.72,h*.23,w*.37,'#ffe6a4',.55);c.save();c.globalCompositeOperation='screen';c.fillStyle='#fff0b2';c.shadowColor='#ffe08a';c.shadowBlur=20;c.beginPath();c.arc(w*.72,h*.18,2.8,0,TAU);c.fill();c.fillRect(w*.72-.7,h*.1,1.4,h*.16);c.fillRect(w*.66,h*.18,w*.12,1.2);c.restore();ribbon(c,w,h,t,q,'#ffe5a0',.62);mist(c,w,h,t,103,h*.66,.25);}
    church(c,w,h,t,q,p){stars(c,w,h,t,this.seed,35,.17);mountain(c,w,h,h*.58,h*.14,'#15515a',111,t*.00003);river(c,w,h,'rgba(94,224,205,.65)',t,.08);const pts=[[.18,.68],[.37,.57],[.55,.7],[.7,.5],[.84,.66]];c.save();c.globalCompositeOperation='screen';c.strokeStyle='#7ef4d8';c.lineWidth=1.2;c.shadowColor='#62e5c8';c.shadowBlur=12;c.beginPath();pts.forEach((v,i)=>i?c.lineTo(v[0]*w,v[1]*h):c.moveTo(v[0]*w,v[1]*h));c.stroke();pts.forEach((v,i)=>glow(c,v[0]*w,v[1]*h,w*.08,'#77f2d6',.34+.16*Math.sin(t*.001+i)));c.restore();mist(c,w,h,t,113,h*.64,.22);ribbon(c,w,h,t,q,'#8ef8df',.26);}
    restoration(c,w,h,t,q,p){stars(c,w,h,t,this.seed,48,.24);glow(c,w*.72,h*.18,w*.52,'#fff2bd',.65);mountain(c,w,h,h*.53,h*.16,'#5b8792',121,t*.00003);mountain(c,w,h,h*.66,h*.11,'#39706d',122,0);city(c,w,h,w*.67,h*.68,Math.min(w,h)*.72,'#315b55',true);river(c,w,h,'rgba(190,247,234,.82)',t,.09);tree(c,w,h,w*.14,h*.69,Math.min(w,h)*.42,'#0d3c31','#b8ffd2');ribbon(c,w,h,t,q,'#fff0ad',.52);mist(c,w,h,t,123,h*.62,.32);}
  }

  let worlds=[],raf=0,last=0;
  function frame(t){raf=requestAnimationFrame(frame);if(!worlds.length||(!reduced.matches&&t-last<32))return;last=t;worlds.forEach(w=>{w.measure();if(w.active)w.draw(t);});}
  function mount(){worlds=[];document.querySelectorAll('.living-world').forEach(el=>worlds.push(new LivingWorld(el)));if(worlds.length){document.documentElement.classList.add('worlds-ready');if(!raf)raf=requestAnimationFrame(frame);worlds.forEach(w=>{w.measure();if(w.active)w.draw(0);});}}
  addEventListener('resize',()=>worlds.forEach(w=>w.w=0),{passive:true});
  window.V2Worlds={mount};
})();
