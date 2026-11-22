/* «Мэдлэгийн Мөр» — Видео засварлагч (MovieMaker маягийн). VideoLab.mount(el,{onSave}) */
(function(){
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const VW=960,VH=540,TR=.8;let root,O={},S,raf=0;
const FX=[['none','Энгийн'],['zoom','Ойртох (Ken Burns)'],['pan','Хажуу тийш гүйх'],['gray','Хар цагаан'],['sepia','Хуучин өнгө'],['bright','Гэрэлтүүлэх']];
const TRN=[['fade','Бүдгэрэх'],['slide','Гулсах'],['wipe','Арчих'],['none','Шилжилтгүй']];
const POS=[['bottom','Доор'],['center','Голд'],['top','Дээр']];
let uid=1;
function card(bg,emoji,title){const c=document.createElement('canvas');c.width=VW;c.height=VH;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,VW,VH);g.addColorStop(0,bg[0]);g.addColorStop(1,bg[1]);x.fillStyle=g;x.fillRect(0,0,VW,VH);x.font='170px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(emoji,VW/2,VH/2-20);if(title){x.font='bold 40px Georgia, serif';x.fillStyle='#fff';x.fillText(title,VW/2,VH-60)}return c}
function fresh(){return {clips:[
 {id:uid++,type:'title',dur:3,text:'Миний анхны видео',sub:'Мэдлэгийн Мөр · 10-р анги',bg:'#14213d',fg:'#f3d27a',trn:'fade',fx:'none',pos:'center'},
 {id:uid++,type:'img',src:card(['#2a9d8f','#14213d'],'🏔️'),name:'Уулс',dur:4,text:'Монгол орны байгаль',trn:'fade',fx:'zoom',pos:'bottom'},
 {id:uid++,type:'img',src:card(['#e85d04','#7b2cbf'],'🐎'),name:'Морь',dur:4,text:'Хурдан морьд',trn:'slide',fx:'pan',pos:'bottom'},
 {id:uid++,type:'title',dur:3,text:'Төгсгөл',sub:'Анхаарал хандуулсанд баярлалаа',bg:'#f8f3e6',fg:'#14213d',trn:'wipe',fx:'none',pos:'center'}],
 sel:0,t:0,playing:false,tr:[],name:'minii_video',rec:null,prog:0,msg:'',vrec:null}}
const total=()=>S.clips.reduce((a,c)=>a+c.dur,0);
function at(t){let s=0;for(let i=0;i<S.clips.length;i++){const c=S.clips[i];if(t<s+c.dur||i===S.clips.length-1)return {i,c,lt:t-s,start:s};s+=c.dur}return {i:0,c:S.clips[0],lt:0,start:0}}
function drawClip(x,c,lt){x.save();const k=lt/c.dur;
 if(c.type==='title'){x.fillStyle=c.bg;x.fillRect(0,0,VW,VH)}
 else{const m=c.type==='anim'?c.frames[Math.floor(lt*c.fps)%c.frames.length]:c.el||c.src;if(m&&(c.type!=='video'||m.readyState>=2)){const mw=m.videoWidth||m.width,mh=m.videoHeight||m.height;let sc=Math.max(VW/mw,VH/mh),dx=0,dy=0;
   if(c.fx==='zoom')sc*=1+.15*k;if(c.fx==='pan'){sc*=1.15;dx=(k-.5)*VW*.12}
   if(c.fx==='gray')x.filter='grayscale(1)';if(c.fx==='sepia')x.filter='sepia(.9)';if(c.fx==='bright')x.filter='brightness(1.25) saturate(1.2)';
   x.drawImage(m,VW/2-mw*sc/2+dx,VH/2-mh*sc/2+dy,mw*sc,mh*sc);x.filter='none'}else{x.fillStyle='#222';x.fillRect(0,0,VW,VH)}}
 if(c.text){const y=c.pos==='top'?80:c.pos==='center'?VH/2-(c.sub?20:0):VH-70;x.textAlign='center';x.textBaseline='middle';
  if(c.type!=='title'){x.font='bold 42px Georgia, serif';const w=x.measureText(c.text).width;x.fillStyle='rgba(20,33,61,.65)';x.fillRect(VW/2-w/2-24,y-34,w+48,68)}
  x.font=c.type==='title'?'bold 64px Georgia, serif':'bold 42px Georgia, serif';x.fillStyle=c.type==='title'?c.fg:'#fff';const a=Math.min(1,lt/.6);x.globalAlpha=a;x.fillText(c.text,VW/2,y);
  if(c.sub){x.font='28px Georgia, serif';x.globalAlpha=a*.85;x.fillText(c.sub,VW/2,y+64)}x.globalAlpha=1}
 x.restore()}
function frame(x,t){const A=at(t);x.fillStyle='#000';x.fillRect(0,0,VW,VH);syncVideos(A,t);
 if(A.i>0&&A.lt<TR&&A.c.trn!=='none'){const p=A.lt/TR,P=S.clips[A.i-1];drawClip(x,P,P.dur-.001);x.save();
  if(A.c.trn==='fade'){x.globalAlpha=p;drawClip(x,A.c,A.lt)}else if(A.c.trn==='slide'){x.translate(VW*(1-p),0);drawClip(x,A.c,A.lt)}else{x.beginPath();x.rect(0,0,VW*p,VH);x.clip();drawClip(x,A.c,A.lt)}x.restore()}
 else drawClip(x,A.c,A.lt)}
function syncVideos(A,t){S.clips.forEach((c,i)=>{if(c.type!=='video'||!c.el)return;const want=c.trim+(i===A.i?A.lt:0);if(i===A.i&&S.playing){c.el.muted=c.mute||S.tr.some(t=>t.k==='music');if(c.el.paused)c.el.play().catch(()=>{});if(Math.abs(c.el.currentTime-want)>.35)c.el.currentTime=want}else{if(!c.el.paused)c.el.pause();if(!S.playing&&i===A.i&&Math.abs(c.el.currentTime-want)>.05)c.el.currentTime=want}})}
function render(){const T=total(),c=S.clips[S.sel];root.innerHTML=`<div class="vdl"><div class="vdl-top"><div class="vdl-brand"><span>🎬</span><div><b>Видео засварлагч</b><small>MovieMaker маягийн · зураг, видео, гарчиг, шилжилт, хөгжим</small></div></div>
 <div class="vdl-acts"><label class="vdl-b ghost">🖼 Зураг/видео<input type="file" accept="image/*,video/*,.mov,.mp4,.heic,.jpg,.png,.gif" multiple data-a="add" hidden></label><button class="vdl-b ghost" data-a="title">🔤 Гарчиг</button><button class="vdl-b ghost" data-a="anim">🎞 Хөдөлгөөнт зураг</button><button class="vdl-b gold" data-a="export" ${S.rec||S.vrec?'disabled':''}>💾 Видео болгох</button></div></div>
 <div class="vdl-aud"><b>🔊 Дуу:</b><label class="vdl-b ghost sm">🎵 Хөгжим (файл)<input type="file" accept="${MM.AUDIO_ACCEPT}" data-a="music" hidden></label><button class="vdl-b ghost sm" data-a="binaud">🗂 Аудио засварлагчаас</button><button class="vdl-b sm ${S.vrec?'red':''}" data-a="voice">${S.vrec?'⏹ Тайлбар зогсоох':'🎤 Тайлбар бичих'}</button></div>
 ${S.vrec&&S.vrec!=='wait'?`<div class="mm-meter"><span class="mm-dot"></span><b id="vdrt">0:00</b><i><em id="vdlv" style="width:0%"></em></i><span style="font-size:13px">Видео тоглож байна — дүрсээ харж ярь</span></div>`:''}
 ${S.msg?`<div class="vdl-msg">${S.msg}</div>`:''}
 <div class="vdl-main"><div class="vdl-pv"><canvas class="vdl-cv" width="${VW}" height="${VH}"></canvas>
  <div class="vdl-ctl"><button class="vdl-r" data-a="play">${S.playing?'⏸':'▶'}</button><input type="range" min="0" max="${T}" step="0.01" value="${S.t}" class="vdl-seek" aria-label="Хугацаа"><span class="vdl-tm"><b id="vdt">${S.t.toFixed(1)}</b> / ${T.toFixed(1)} сек</span></div>
  ${S.rec?`<div class="vdl-recbar"><i style="width:${Math.round(S.prog*100)}%"></i><span>⏺ Видео бичиж байна… ${Math.round(S.prog*100)}% — хуудсаа хаалгүй түр хүлээнэ үү</span></div>`:''}
  ${S.tr.map((t,i)=>`<div class="vdl-mus">${t.k==='voice'?'🎤':'🎵'} <b>${esc(t.name)}</b><small>${t.at?`${t.at.toFixed(1)} сек-ээс`:'эхнээс'}${t.dur?` · ${t.dur.toFixed(1)} сек`:''}</small><label>Чанга<input type="range" min="0" max="1" step=".05" value="${t.vol}" data-tv="${i}"></label><button class="vdl-x" data-tx="${i}" aria-label="Хасах">✕</button></div>`).join('')}</div>
 <div class="vdl-props">${c?`<h4>${c.type==='title'?'🔤 Гарчгийн хуудас':c.type==='video'?'🎞 Видео клип':c.type==='anim'?'🎞 Хөдөлгөөнт зураг':'🖼 Зураг'} #${S.sel+1}</h4>
  <label>Үргэлжлэх хугацаа <b>${c.dur.toFixed(1)}</b> сек<input type="range" min="1" max="${c.type==='video'?Math.max(1,Math.min(60,(c.len||10)-c.trim)).toFixed(1):15}" step=".5" value="${c.dur}" data-p="dur"></label>
  ${c.type==='video'?`<label>Эхлэх цэг (тайрах) <b>${c.trim.toFixed(1)}</b> сек<input type="range" min="0" max="${Math.max(0,(c.len||1)-1).toFixed(1)}" step=".5" value="${c.trim}" data-p="trim"></label><label class="vdl-chk"><input type="checkbox" data-p="mute" ${c.mute?'checked':''}> Видеоны дууг хаах</label>`:''}
  <label>Бичвэр (тайлбар)<input data-p="text" value="${esc(c.text||'')}" maxlength="60"></label>${c.type==='title'?`<label>Дэд гарчиг<input data-p="sub" value="${esc(c.sub||'')}" maxlength="70"></label><div class="vdl-2"><label>Дэвсгэр<input type="color" data-p="bg" value="${c.bg}"></label><label>Үсгийн өнгө<input type="color" data-p="fg" value="${c.fg}"></label></div>`:`<label>Бичвэрийн байрлал<select data-p="pos">${POS.map(([k,t])=>`<option value="${k}" ${c.pos===k?'selected':''}>${t}</option>`).join('')}</select></label><label>Эффект<select data-p="fx">${FX.map(([k,t])=>`<option value="${k}" ${c.fx===k?'selected':''}>${t}</option>`).join('')}</select></label>`}
  <label>Орох шилжилт<select data-p="trn">${TRN.map(([k,t])=>`<option value="${k}" ${c.trn===k?'selected':''}>${t}</option>`).join('')}</select></label>
  <div class="vdl-row"><button class="vdl-b ghost" data-a="left">◀</button><button class="vdl-b ghost" data-a="right">▶</button><button class="vdl-b ghost" data-a="dup">⧉ Хувилах</button><button class="vdl-b ghost red" data-a="del">🗑</button></div>`:'<p>Клип сонгоно уу.</p>'}
  <label>Файлын нэр<input data-a="name" value="${esc(S.name)}" maxlength="30"></label></div></div>
 <div class="vdl-tl">${S.clips.map((c,i)=>`<button class="vdl-clip ${i===S.sel?'on':''}" data-c="${i}" style="flex-grow:${c.dur}"><span class="vdl-th" style="${c.type==='title'?`background:${c.bg};color:${c.fg}`:''}">${c.type==='title'?'🔤':c.type==='anim'?'':''}${c.type!=='title'?`<img src="${c.thumb||''}" alt="">`:''}</span><small>${i+1}. ${esc(c.text||c.name||'клип')}</small><em>${c.dur}с${c.trn!=='none'&&i?' · ⟿':''}</em></button>`).join('')}</div>
 <p class="vdl-hint">💡 Клип дээр дарж сонгоод хугацаа, бичвэр, эффект, шилжилтийг тохируулна. <b>🎤 Тайлбар бичих</b> — видео тоглох зуур дуугаа бичнэ (MovieMaker-ийн «Record narration»). <b>🗂 Аудио засварлагчаас</b> — тэнд засварласан дуугаа авна. <b>🎞 Хөдөлгөөнт зураг</b> — студид зурсан GIF-ээ клип болгоно. «Видео болгох» нь видеог бодит хугацаагаар тоглуулж <b>MP4/WebM</b> файл болгоно — дуусах хүртэл хуудсаа хаалгүй хүлээ. <b>Видео мэдээлэл</b> нь секундэд 24–30 кадр (frame rate) бүхий зургуудын дараалал ба дуунаас бүрдэнэ.</p></div>`;bind();paint()}
function paint(){const cv=root.querySelector('.vdl-cv');if(cv)frame(cv.getContext('2d'),S.t);const tm=root.querySelector('#vdt');if(tm)tm.textContent=S.t.toFixed(1);const sk=root.querySelector('.vdl-seek');if(sk&&document.activeElement!==sk)sk.value=S.t}
let last=0,music=null;
function loop(ts){if(!S.playing)return;const dt=last?(ts-last)/1000:0;last=ts;S.t+=dt;const T=total();trSync();if(S.t>=T){S.t=T;const was=S.vrec;stop();if(S.rec)S.rec.stop();if(was&&was!=='wait')act('voice');return}if(S.rec){S.prog=S.t/T;const b=root.querySelector('.vdl-recbar i');if(b)b.style.width=Math.round(S.prog*100)+'%'}paint();raf=requestAnimationFrame(loop)}
function trEl(t){if(!t.el){t.el=new Audio();t.el.preload='auto';t.el.src=t.url;t.el.playsInline=true}return t.el}
function trSync(){S.tr.forEach(t=>{const e=t.xel||trEl(t),rel=S.t-t.at;if(!S.playing||rel<0||(t.dur&&rel>=t.dur)){if(!e.paused)e.pause();return}if(!t.xel)e.volume=t.vol;if(e.paused){try{e.currentTime=rel}catch(x){}e.play().catch(()=>{})}else if(Math.abs(e.currentTime-rel)>.4){try{e.currentTime=rel}catch(x){}}})}
function play(){if(S.t>=total()-.05)S.t=0;S.playing=true;last=0;MM.unlock();trSync();raf=requestAnimationFrame(loop)}
function stop(){S.playing=false;cancelAnimationFrame(raf);S.tr.forEach(t=>{if(t.el)t.el.pause();if(t.xel)t.xel.pause()});S.clips.forEach(c=>c.el&&c.el.pause());const b=root&&root.querySelector('[data-a="play"]');if(b)b.textContent='▶'}
function thumbOf(c){const t=document.createElement('canvas');t.width=160;t.height=90;const x=t.getContext('2d');x.scale(160/VW,90/VH);drawClip(x,c,0);return t.toDataURL('image/jpeg',.7)}
function bind(){const q=s=>root.querySelectorAll(s);
 q('[data-c]').forEach(b=>b.onclick=()=>{S.sel=+b.dataset.c;const A=S.clips.slice(0,S.sel).reduce((a,c)=>a+c.dur,0);S.t=A+.01;stop();render()});
 q('[data-a]').forEach(el=>{const a=el.dataset.a;el[el.tagName==='INPUT'?(el.type==='file'?'onchange':'oninput'):'onclick']=()=>act(a,el)});
 q('[data-p]').forEach(el=>{const p=el.dataset.p;el[el.type==='range'||el.type==='color'||el.tagName==='INPUT'&&el.type!=='checkbox'?'oninput':'onchange']=()=>{const c=S.clips[S.sel];c[p]=el.type==='range'?+el.value:el.type==='checkbox'?el.checked:el.value;if(el.type==='range'){el.previousElementSibling.textContent=(+el.value).toFixed(1)}if(['bg','fg','text','sub','fx'].includes(p)){c.thumb=thumbOf(c)}paint();if(el.type!=='range'&&el.tagName==='SELECT'||p==='dur')updTL()}});
 q('[data-tv]').forEach(el=>el.oninput=()=>{const t=S.tr[+el.dataset.tv];t.vol=+el.value;if(t.el)t.el.volume=t.vol});q('[data-tx]').forEach(el=>el.onclick=()=>{stop();S.tr.splice(+el.dataset.tx,1);render()});
 const sk=root.querySelector('.vdl-seek');sk.oninput=()=>{S.t=+sk.value;if(S.playing){stop()}paint()}}
function updTL(){const tl=root.querySelector('.vdl-tl');if(!tl)return;const T=total();root.querySelector('.vdl-seek').max=T;root.querySelector('.vdl-tm').innerHTML=`<b id="vdt">${S.t.toFixed(1)}</b> / ${T.toFixed(1)} сек`;S.clips.forEach((c,i)=>{const b=tl.children[i];if(!b)return;b.style.flexGrow=c.dur;b.querySelector('em').textContent=`${c.dur}с${c.trn!=='none'&&i?' · ⟿':''}`;const im=b.querySelector('img');if(im&&c.thumb)im.src=c.thumb})}
function addFile(f){return new Promise(res=>{const url=URL.createObjectURL(f);const isV=/^video\//.test(f.type)||/\.(mp4|mov|webm|m4v|3gp)$/i.test(f.name);
 if(isV){const v=document.createElement('video');v.muted=true;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');v.preload='auto';let done=false;
  const ok=()=>{if(done)return;done=true;const len=isFinite(v.duration)&&v.duration>0?v.duration:10;const c={id:uid++,type:'video',el:v,name:f.name,len,trim:0,dur:Math.min(8,Math.max(1,Math.floor(len))),text:'',trn:'fade',fx:'none',pos:'bottom',mute:false};try{c.thumb=thumbOf(c)}catch(e){}res(c)};
  v.onloadeddata=ok;v.onseeked=ok;v.onloadedmetadata=()=>{try{v.currentTime=Math.min(.1,(v.duration||1)/2)}catch(e){}};v.onerror=()=>{if(!done){done=true;res({err:f.name})}};
  setTimeout(()=>{if(!done){if(v.readyState>=1)ok();else{done=true;res({err:f.name})}}},9000);v.src=url;v.load()}
 else{const im=new Image();im.onload=()=>{const c={id:uid++,type:'img',src:im,name:f.name,dur:4,text:'',trn:'fade',fx:'zoom',pos:'bottom'};c.thumb=thumbOf(c);res(c)};im.onerror=()=>res({err:f.name});im.src=url}})}
function act(a,el){const c=S.clips[S.sel];
 if(a==='play'){S.playing?stop():play();const b=root.querySelector('[data-a="play"]');if(b)b.textContent=S.playing?'⏸':'▶';return}
 if(a==='name'){S.name=el.value.replace(/[^\wА-Яа-яЁёӨөҮү-]/g,'_')||'video';return}
 stop();
 if(a==='add'){const fs=[...el.files];MM.resetInput(el);if(!fs.length)return;S.msg='⏳ '+fs.length+' файл уншиж байна…';render();Promise.all(fs.map(addFile)).then(cs=>{const bad=cs.filter(c=>c&&c.err).map(c=>c.err);cs.filter(c=>c&&!c.err).forEach(c=>S.clips.splice(++S.sel,0,c));if(!S.clips[S.sel])S.sel=S.clips.length-1;
   S.msg=bad.length?`⚠️ ${bad.map(esc).join(', ')} — энэ хөтөч уншиж чадсангүй. iPhone-ий HEVC (.mov) видеог Android/Chrome уншдаггүй: утасныхаа тохиргоонд <b>Camera → Formats → Most Compatible</b> сонгож бичих, эсвэл MP4 болгоно уу.`:`✅ ${cs.length} клип нэмэгдлээ.`;render()});return}
 if(a==='anim'){MM.pick('anim',it=>{const fr=it.frames||[];if(!fr.length)return;const c={id:uid++,type:'anim',frames:fr,fps:it.fps||6,name:it.name,dur:Math.max(1,Math.min(15,+(fr.length/(it.fps||6)*2).toFixed(1))),text:'',trn:'fade',fx:'none',pos:'bottom'};const go=()=>{c.thumb=thumbOf(c);S.clips.splice(++S.sel,0,c);S.msg='✅ «'+esc(it.name)+'» хөдөлгөөнт зураг нэмэгдлээ.';render()};const f0=fr[0];if(f0.complete===false)f0.onload=go;else go()});return}
 if(a==='binaud'){MM.pick('audio',it=>{S.tr=S.tr.filter(t=>t.k!=='music');S.tr.unshift({k:'music',url:it.url,name:it.name,vol:.8,at:0,dur:it.dur||0});S.msg='';render()});return}
 if(a==='voice'){if(S.vrec==='wait')return;if(S.vrec){const r=S.vrec,at=S.vat;S.vrec='wait';stop();r.stop().then(bl=>{S.vrec=null;if(bl.size<200){S.msg='⚠️ Тайлбар хоосон байна.';return render()}const url=URL.createObjectURL(bl);const tmp=new Audio(url);tmp.onloadedmetadata=()=>{};S.tr.push({k:'voice',url,name:'Тайлбар '+(S.tr.filter(t=>t.k==='voice').length+1),vol:1,at,dur:Math.max(.5,S.t-at)});MM.bin.add({kind:'audio',name:'tailbar_'+new Date().toTimeString().slice(0,5).replace(':','')+(bl.type.includes('mp4')?'.m4a':'.webm'),blob:bl,dur:Math.max(.5,S.t-at)});S.msg='✅ Тайлбар нэмэгдлээ ('+at.toFixed(1)+' сек-ээс). Медиа санд ч хадгалагдлаа — Аудио засварлагчид засаж болно.';render()});return}
  if(S.t>=total()-.3)S.t=0;S.vrec='wait';S.msg='🎤 Микрофон нээж байна…';render();
  MM.recorder((lv,t)=>{const e=root.querySelector('#vdlv');if(e)e.style.width=Math.min(100,lv*140)+'%';const tt=root.querySelector('#vdrt');if(tt)tt.textContent=Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0')}).then(r=>{S.vrec=r;S.vat=S.t;S.msg='';render();play();const b=root.querySelector('[data-a="play"]');if(b)b.textContent='⏸'}).catch(e=>{S.vrec=null;S.msg='⚠️ '+(e.message||e);render()});return}

 if(a==='music'){const f=el.files[0];MM.resetInput(el);if(!f)return;const url=URL.createObjectURL(f);const t={k:'music',url,name:f.name,vol:.8,at:0,dur:0};const e=new Audio();e.preload='metadata';e.onloadedmetadata=()=>{if(isFinite(e.duration))t.dur=e.duration;render()};e.onerror=()=>{S.tr=S.tr.filter(x=>x!==t);S.msg='⚠️ '+MM.decodeHelp(f);render()};e.src=url;S.tr=S.tr.filter(x=>x.k!=='music');S.tr.unshift(t);render();return}
 if(a==='title'){S.clips.splice(S.sel+1,0,{id:uid++,type:'title',dur:3,text:'Шинэ гарчиг',sub:'',bg:'#14213d',fg:'#f3d27a',trn:'fade',fx:'none',pos:'center'});S.sel++}
 if(a==='del'&&S.clips.length>1){S.clips.splice(S.sel,1);S.sel=Math.min(S.sel,S.clips.length-1)}
 if(a==='dup'&&c){const n={...c,id:uid++};S.clips.splice(S.sel+1,0,n);S.sel++}
 if(a==='left'&&S.sel>0){[S.clips[S.sel-1],S.clips[S.sel]]=[S.clips[S.sel],S.clips[S.sel-1]];S.sel--}
 if(a==='right'&&S.sel<S.clips.length-1){[S.clips[S.sel+1],S.clips[S.sel]]=[S.clips[S.sel],S.clips[S.sel+1]];S.sel++}
 if(a==='export'){const cv=root.querySelector('.vdl-cv');if(!cv.captureStream||!window.MediaRecorder){S.msg='⚠️ Энэ хөтөч видео файл үүсгэхийг дэмжихгүй байна. Android дээр <b>Chrome</b>, iPhone дээр <b>iOS 15+ Safari</b>, компьютер дээр Chrome/Edge ашиглана уу.';render();return}
  MM.unlock();const st=cv.captureStream(30);let dst=null;const c0=MM.ac();
  try{if(S.tr.length){dst=c0.createMediaStreamDestination();S.tr.forEach(t=>{const e=new Audio();e.src=t.url;e.playsInline=true;e.preload='auto';const n=c0.createMediaElementSource(e),g=c0.createGain();g.gain.value=t.vol;n.connect(g);g.connect(dst);g.connect(c0.destination);t.xel=e;t.xn=[n,g]});dst.stream.getAudioTracks().forEach(tr=>st.addTrack(tr))}}catch(e){S.tr.forEach(t=>{t.xel=null})}
  const types=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];const mt=types.find(t=>{try{return MediaRecorder.isTypeSupported(t)}catch(e){return false}})||'';
  let rec;try{rec=new MediaRecorder(st,mt?{mimeType:mt,videoBitsPerSecond:3e6}:{})}catch(e){rec=new MediaRecorder(st)}const ch=[];
  rec.ondataavailable=e=>e.data.size&&ch.push(e.data);rec.onstop=()=>{const m=rec.mimeType||mt||'video/webm',ext=m.includes('mp4')?'mp4':'webm';const blob=new Blob(ch,{type:m.split(';')[0]});S.tr.forEach(t=>{if(t.xn)t.xn.forEach(n=>{try{n.disconnect()}catch(e){}});t.xel=null;t.xn=null});S.rec=null;S.prog=0;if(O.onSave)O.onSave({sec:total()});render();
   if(blob.size<1000){S.msg='⚠️ Видео хоосон гарлаа. Дахин оролдоно уу.';render();return}MM.save(blob,`${S.name}.${ext}`,{toBin:()=>MM.bin.add({kind:'video',name:`${S.name}.${ext}`,blob,dur:total()})})};
  S.rec=rec;S.t=0;S.msg='';render();rec.start(250);play();return}
 render()}
const css=document.createElement('style');css.textContent=`
.vdl{--vn:#14213d;--vg:#b08d3a;--vl:#e6dfcf;background:#fffdf8;border:1px solid var(--vl);border-radius:14px;overflow:hidden;color:#1d2433}
.vdl-top{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center;padding:10px 14px;background:linear-gradient(135deg,#14213d,#5a1e2e);color:#fff}
.vdl-brand{display:flex;gap:10px;align-items:center}.vdl-brand span{font-size:28px}.vdl-brand small{display:block;opacity:.8;font-size:12px}.vdl-acts{display:flex;gap:6px;flex-wrap:wrap}
.vdl-b{min-height:36px;padding:6px 12px;border-radius:9px;border:1.5px solid var(--vn);background:var(--vn);color:#fff;font-weight:700;cursor:pointer;font-size:14px;display:inline-flex;align-items:center;gap:4px;margin:0}.vdl-b.ghost{background:#fff;color:var(--vn)}.vdl-b.gold{background:var(--vg);border-color:var(--vg)}.vdl-b.red{color:#b0413e}.vdl-b:disabled{opacity:.5}
.vdl-top .vdl-b.ghost{background:transparent;color:#fff;border-color:#ffffff88}
.vdl-main{display:grid;grid-template-columns:1fr 290px;gap:12px;padding:12px}@media(max-width:820px){.vdl-main{grid-template-columns:1fr}}
.vdl-pv{min-width:0}.vdl-cv{width:100%;aspect-ratio:16/9;background:#000;border-radius:10px;display:block;box-shadow:0 8px 24px rgba(0,0,0,.25)}
.vdl-ctl{display:flex;gap:10px;align-items:center;margin-top:8px}.vdl-r{width:44px;height:44px;border-radius:50%;border:0;background:var(--vn);color:#fff;font-size:17px;cursor:pointer;flex:none;min-height:0;padding:0}.vdl-seek{flex:1}.vdl-tm{font:700 14px "PT Mono",monospace;white-space:nowrap}
.vdl-recbar{position:relative;height:28px;background:#f4efe3;border-radius:8px;overflow:hidden;margin-top:8px}.vdl-recbar i{position:absolute;inset:0 auto 0 0;background:#c1121f55}.vdl-recbar span{position:relative;font-size:13px;font-weight:700;padding:5px 10px;display:block}
.vdl-mus{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px;font-size:13px;background:#f4efe3;border-radius:10px;padding:6px 10px}.vdl-mus label{display:flex;gap:6px;align-items:center;margin:0;font-size:12px}.vdl-x{border:0;background:transparent;color:#b0413e;font-weight:900;cursor:pointer;min-height:0}
.vdl-props{border:1px solid var(--vl);border-radius:12px;padding:10px 12px;background:#fff;display:flex;flex-direction:column;gap:6px;align-self:start}.vdl-props h4{margin:0 0 4px;color:var(--vn)}
.vdl-props label{display:flex;flex-direction:column;font-size:12.5px;font-weight:700;color:#3b4560;gap:2px;margin:0}.vdl-props input:not([type=range]):not([type=checkbox]):not([type=color]),.vdl-props select{min-height:36px;border:1px solid var(--vl);border-radius:8px;padding:4px 8px;font:inherit}.vdl-props input[type=color]{width:100%;height:34px;padding:0;border:0}
.vdl-2{display:grid;grid-template-columns:1fr 1fr;gap:8px}.vdl-chk{flex-direction:row!important;align-items:center;gap:6px!important}.vdl-row{display:flex;gap:6px;flex-wrap:wrap}
.vdl-tl{display:flex;gap:6px;overflow-x:auto;padding:10px 12px;background:#1d2433}
.vdl-clip{flex:1 0 110px;min-width:110px;display:flex;flex-direction:column;gap:3px;border:2px solid #39425a;background:#2a3249;border-radius:8px;padding:5px;color:#e9e4d6;text-align:left;cursor:pointer;font:inherit}.vdl-clip.on{border-color:#f3d27a;box-shadow:0 0 0 2px #f3d27a55}
.vdl-th{display:grid;place-items:center;aspect-ratio:16/9;border-radius:5px;overflow:hidden;background:#000;font-size:22px}.vdl-th img{width:100%;height:100%;object-fit:cover}.vdl-clip small{font-size:11.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.vdl-clip em{font-size:11px;opacity:.75;font-style:normal}
.vdl-hint{font-size:13px;color:#5b6276;margin:0;padding:10px 12px}
.vdl-aud{display:flex;gap:6px;flex-wrap:wrap;align-items:center;padding:8px 12px;background:#f4efe3;border-bottom:1px solid var(--vl);font-size:14px}.vdl-b.sm{min-height:34px;font-size:13px;padding:4px 10px}.vdl-b.red{background:#9b2226;border-color:#9b2226;color:#fff}
.vdl-msg{margin:8px 12px 0;padding:8px 12px;border-radius:10px;background:#fbf4e2;font-weight:700;font-size:14px}.vdl-mus small{color:#646a78}
@media(max-width:640px){.vdl-top{padding:10px}.vdl-acts{display:grid;grid-template-columns:1fr 1fr;width:100%}.vdl-acts .vdl-b{justify-content:center;min-height:44px}.vdl-aud{display:grid;grid-template-columns:1fr 1fr}.vdl-aud>b{grid-column:1/-1}.vdl-aud .vdl-b{justify-content:center;min-height:42px}.vdl-main{padding:8px}.vdl-props label input[type=range]{height:30px}.vdl-row .vdl-b{flex:1;justify-content:center;min-height:42px}.vdl-clip{flex:0 0 96px;min-width:96px}}
`;
document.head.appendChild(css);
window.VideoLab={mount(el,o={}){if(S){stop();if(S.vrec&&S.vrec!=='wait'){S.vrec.cancel();S.vrec=null}}root=el;O=o;if(!S){S=fresh();S.clips.forEach(c=>c.thumb=thumbOf(c))}render()}};
})();
