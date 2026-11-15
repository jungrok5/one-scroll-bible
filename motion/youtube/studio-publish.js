// Paste-in helper for YouTube Studio: start the thumbnail A/B test (A-exodus · B-cross · D-earth from
// motion/youtube/thumbs/<L>/) on an uploaded film and switch it to PUBLIC, then save. Run on any Studio page; it opens
// /video/<id>/edit through the SPA router. Needs the local file server (node motion/youtube/serve.mjs).
//   window.__pubLog = []; (async () => { for (const [L, id] of [['hi', '<id>']]) window.__pubLog.push(await __osbPublish(L, id)); })()
// Publishing is a public act: only for videos the user asked to make public. The A/B button does nothing in the upload
// dialog — wait until the video has been processed, then run this on its edit page. (Recovered from the 2026-10-22
// session transcript on 2026-10-23: it had only ever lived in the chat, so the 4 new languages almost went without a test.)
// Options (2026-11-16, films): thumbs = three local-server paths (default: the 14-min film's youtube/thumbs/<L>/A-exodus·B-cross·D-earth),
//   publish = false → set up the A/B test and save, but leave the visibility as it is (a film uploaded before the owner's go).
//   e.g. __osbPublish('ko', '<id>', { thumbs: ['films/christ/thumbs/A-oil.jpg', 'films/christ/thumbs/B-prayer.jpg', 'films/christ/thumbs/C-cross.jpg'], publish: false })
window.__osbPublish = async (L, id, { thumbs = null, publish = true } = {}) => {
  const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const wait=async(fn,ms=20000)=>{for(let t=0;t<ms;t+=250){const v=fn(); if(v) return v; await sleep(250);} return null;};
  history.pushState({},'',`/video/${id}/edit`); dispatchEvent(new PopStateEvent('popstate',{state:{}}));
  await wait(()=>location.pathname.includes(id) && document.querySelector('ytcp-video-metadata-editor #textbox') && document.querySelector('[aria-label="동영상 공개 상태 수정"]')); await sleep(2500);
  const r={L,id,title:document.querySelector('#textbox')?.innerText.slice(0,30)};
  const abOpen=()=>[...document.querySelectorAll('ytcp-dialog')].find(d=>d.offsetParent && d.innerText.includes('썸네일만'));
  [...document.querySelectorAll('ytcp-button, button')].find(b=>b.offsetParent && b.innerText.trim()==='A/B 테스팅')?.click();
  const dlg=await wait(abOpen);
  [...dlg.querySelectorAll('*')].find(e=>e.children.length===0 && e.textContent.trim()==='썸네일만').click(); await sleep(1000);
  const ins=[...dlg.querySelectorAll('input#file-loader')]; const files=thumbs || ['A-exodus','B-cross','D-earth'].map(n=>`youtube/thumbs/${L}/${n}.jpg`);
  for(let k=0;k<3;k++){ const b=await (await fetch(`http://127.0.0.1:8765/${files[k]}`)).blob(); const dt=new DataTransfer(); dt.items.add(new File([b],`${L}-${files[k].split('/').pop()}`,{type:'image/jpeg'})); ins[k].files=dt.files; ins[k].dispatchEvent(new Event('change',{bubbles:true})); await sleep(1500); }
  await wait(()=>dlg.innerText.includes('준비 완료'),15000); r.abReady=dlg.innerText.includes('준비 완료');
  for(let k=0;k<4 && abOpen();k++){ [...dlg.querySelectorAll('ytcp-button, button')].find(b=>b.innerText.trim()==='테스트 설정')?.click(); await sleep(1500); }
  r.abClosed=!abOpen();
  if (publish) { document.querySelector('[aria-label="동영상 공개 상태 수정"]').click(); await sleep(1500);
  const pub=await wait(()=>[...document.querySelectorAll('tp-yt-paper-radio-button[name=PUBLIC]')].find(x=>x.offsetParent)); pub.click(); await sleep(800);
  [...document.querySelectorAll('ytcp-button, button')].filter(b=>b.offsetParent && b.innerText.trim()==='완료').at(-1)?.click(); await sleep(1200); }
  r.vis=document.querySelector('ytcp-video-metadata-visibility')?.innerText.replace(/\s+/g,' ').trim();
  if (r.abReady && r.abClosed && (!publish || /공개 상태 공개/.test(r.vis))) { document.querySelector('ytcp-button#save').click(); await sleep(1000); r.saved=!!(await wait(()=>/저장됨/.test(document.querySelector('tp-yt-paper-toast, ytcp-toast')?.innerText||'') || document.querySelector('ytcp-button#save')?.hasAttribute('disabled'),25000)); }
  await sleep(2500); return r;
};
