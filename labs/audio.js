/* «Мэдлэгийн Мөр» — Аудио засварлагч (Audacity маягийн). AudioLab.mount(el,{onSave}) */
(function(){
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let root,O={},ctx=null,S={pend:null,buf:null,name:'audio',sel:[0,0],cur:0,undo:[],clip:null,src:null,t0:0,playFrom:0,raf:0,rec:null,msg:'',zoom:1};
const AC=()=>MM.ac();
const fmtT=s=>{s=Math.max(0,s);const m=Math.floor(s/60);return `${m}:${(s%60).toFixed(2).padStart(5,'0')}`};
function mk(len,ch,sr){return AC().createBuffer(ch||1,Math.max(1,Math.round(len)),sr||AC().sampleRate)}
function copyBuf(b,a=0,e=b.length){const n=mk(e-a,b.numberOfChannels,b.sampleRate);for(let c=0;c<b.numberOfChannels;c++)n.getChannelData(c).set(b.getChannelData(c).subarray(a,e));return n}
function concat(list){const ch=Math.max(...list.map(b=>b.numberOfChannels)),sr=list[0].sampleRate,len=list.reduce((s,b)=>s+b.length,0);const n=mk(len,ch,sr);let o=0;for(const b of list){for(let c=0;c<ch;c++)n.getChannelData(c).set(b.getChannelData(Math.min(c,b.numberOfChannels-1)),o);o+=b.length}return n}
function demo(){const sr=AC().sampleRate,notes=[[392,.4],[440,.4],[494,.4],[523,.8],[494,.4],[440,.4],[392,.8],[0,.3],[330,.4],[392,.4],[440,1]];const len=notes.reduce((s,n)=>s+n[1],0)*sr;const b=mk(len,1,sr),d=b.getChannelData(0);let o=0;
 for(const [f,t] of notes){const n=Math.round(t*sr);for(let i=0;i<n;i++){const env=Math.min(1,i/400)*Math.max(0,1-i/n)**.6;d[o+i]=f?(.5*Math.sin(2*Math.PI*f*i/sr)+.18*Math.sin(4*Math.PI*f*i/sr)+.08*Math.sin(6*Math.PI*f*i/sr))*env*.7:0}o+=n}return b}
function selIdx(){const b=S.buf,[a,e]=S.sel;let s=Math.round(Math.min(a,e)*b.sampleRate),t=Math.round(Math.max(a,e)*b.sampleRate);if(t-s<2){s=0;t=b.length}return [Math.max(0,s),Math.min(b.length,t)]}
const hasSel=()=>Math.abs(S.sel[1]-S.sel[0])>.01;
function snap(){S.undo.push(copyBuf(S.buf));if(S.undo.length>15)S.undo.shift()}
function eachSel(fn){const [a,e]=selIdx();for(let c=0;c<S.buf.numberOfChannels;c++){const d=S.buf.getChannelData(c);fn(d,a,e,c)}}
/* ---------- WAV ---------- */
function wav(b){const ch=b.numberOfChannels,sr=b.sampleRate,n=b.length,bl=n*ch*2,ab=new ArrayBuffer(44+bl),v=new DataView(ab);const w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};
 w(0,'RIFF');v.setUint32(4,36+bl,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,ch,true);v.setUint32(24,sr,true);v.setUint32(28,sr*ch*2,true);v.setUint16(32,ch*2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,bl,true);
 let o=44;const C=[...Array(ch)].map((_,c)=>b.getChannelData(c));for(let i=0;i<n;i++)for(let c=0;c<ch;c++){const s=Math.max(-1,Math.min(1,C[c][i]));v.setInt16(o,s<0?s*0x8000:s*0x7FFF,true);o+=2}return new Blob([ab],{type:'audio/wav'})}
/* ---------- UI ---------- */
function render(){const b=S.buf;root.innerHTML=`<div class="aul"><div class="aul-top"><div class="aul-brand"><span>🎙️</span><div><b>Аудио засварлагч</b><small>Audacity маягийн · бичлэг, тайралт, эффект, WAV</small></div></div>
 <div class="aul-acts"><button class="aul-b ${S.rec?'red':''}" data-a="rec">${S.rec?'⏹ Бичлэг зогсоох':'⏺ Бичлэг хийх'}</button><label class="aul-b ghost">📂 Файл нээх<input type="file" accept="${MM.AUDIO_ACCEPT}" data-a="open" hidden></label><button class="aul-b ghost" data-a="bin">🗂 Медиа сан</button><button class="aul-b ghost" data-a="demo">🎵 Жишээ</button><button class="aul-b gold" data-a="save" ${b?'':'disabled'}>💾 WAV хадгалах</button><button class="aul-b ghost" data-a="tobin" ${b?'':'disabled'} title="Видео засварлагчид ашиглах">🎬 Видеод ашиглах</button></div></div>
 ${S.rec?`<div class="mm-meter"><span class="mm-dot"></span><b id="aurt">0:00</b><i><em id="aulv" style="width:0%"></em></i><button class="aul-b red" data-a="rec">⏹ Зогсоох</button></div>`:''}
 ${S.pend?`<div class="mm-choice"><b>🎙 Бичлэг бэлэн (${S.pend.duration.toFixed(1)} сек). Хаана оруулах вэ?</b><div class="mm-row"><button class="mm-b" data-a="p_new">Шинэ аудио болгох</button><button class="mm-b ghost" data-a="p_app">Ард нь залгах</button><button class="mm-b ghost" data-a="p_ins">Курсорт оруулах</button><button class="mm-b ghost" data-a="p_mix">Курсороос холих</button><button class="mm-b ghost" data-a="p_no">Хаях</button></div></div>`:''}
 ${b?`<div class="aul-trans"><button class="aul-r" data-a="play" title="Тоглуулах (Space)">▶</button><button class="aul-r" data-a="stop" title="Зогсоох">⏹</button><button class="aul-r" data-a="start" title="Эхэнд">⏮</button><div class="aul-time"><b id="aut">${fmtT(S.cur)}</b><small>/ ${fmtT(b.duration)}</small></div>
  <button class="aul-r sm" data-a="all" title="Бүгдийг сонгох">⇔</button><button class="aul-r sm" data-a="unsel" title="Сонголт цуцлах">✕</button><div class="aul-selinfo">Сонголт: <b>${hasSel()?`${fmtT(Math.min(...S.sel))} – ${fmtT(Math.max(...S.sel))} (${Math.abs(S.sel[1]-S.sel[0]).toFixed(2)} сек)`:'байхгүй (бүх аудио)'}</b></div>
  <label class="aul-z">Томруулах<input type="range" min="1" max="8" step="1" value="${S.zoom}" data-a="zoom"></label></div>
 <div class="aul-wavewrap"><div class="aul-wave" style="width:${S.zoom*100}%"><canvas class="aul-cv"></canvas><div class="aul-ph"></div></div></div>
 <div class="aul-meta">🎚 ${b.numberOfChannels===1?'Моно':'Стерео'} · ${b.sampleRate} Hz · ${b.duration.toFixed(2)} сек · <span class="mut">Долгион дээр чирж хэсэг сонгоно. Дарвал курсор тавина.</span></div>
 <div class="aul-groups">
  <div class="aul-g"><b>✂️ Засвар</b><button data-a="cut">Тайрах (Cut)</button><button data-a="copy">Хуулах (Copy)</button><button data-a="paste" ${S.clip?'':'disabled'}>Буулгах (Paste)</button><button data-a="del">Устгах (Delete)</button><button data-a="trim">Сонголтоос бусдыг устгах (Trim)</button><button data-a="silence">Чимээгүй болгох</button><button data-a="undo" ${S.undo.length?'':'disabled'}>↶ Буцаах</button></div>
  <div class="aul-g"><b>✨ Эффект</b><button data-a="fadein">Аажмаар чангарах (Fade In)</button><button data-a="fadeout">Аажмаар намсах (Fade Out)</button><button data-a="amp">Чанга болгох (+6 dB)</button><button data-a="quiet">Намсгах (−6 dB)</button><button data-a="norm">Хэвийн болгох (Normalize)</button><button data-a="rev">Урвуулах (Reverse)</button><button data-a="echo">Цуурай (Echo)</button><button data-a="fast">Хурдан (×1.25)</button><button data-a="slow">Удаан (×0.8)</button></div>
  <div class="aul-g"><b>🎼 Нэгтгэх</b><label class="aul-fb">＋ Ард нь залгах (файл)<input type="file" accept="${MM.AUDIO_ACCEPT}" data-a="append" hidden></label><label class="aul-fb">🎚 Курсороос холих (файл)<input type="file" accept="${MM.AUDIO_ACCEPT}" data-a="mix" hidden></label><button data-a="binmix">🗂 Медиа сангаас холих</button><button data-a="tone">Дохионы аялгуу нэмэх</button><label class="aul-l">Файлын нэр<input data-a="name" value="${S.name}" maxlength="30"></label></div></div>`
 :`<div class="aul-empty"><div style="font-size:54px">🎧</div><p><b>Аудио алга байна.</b> «⏺ Бичлэг хийх»-ээр микрофоноор бичих, «📂 Файл нээх»-ээр утас/компьютер дээрх аудио (mp3, m4a, wav) <i>эсвэл видео файлын дууг</i> оруулах, эсвэл жишээ дуугаар эхлээрэй.</p><div class="aul-acts" style="justify-content:center"><button class="aul-b" data-a="rec">⏺ Бичлэг хийх</button><label class="aul-b ghost">📂 Файл нээх<input type="file" accept="${MM.AUDIO_ACCEPT}" data-a="open" hidden></label><button class="aul-b ghost" data-a="demo">🎵 Жишээ</button></div></div>`}
 ${S.msg?`<div class="aul-msg">${S.msg}</div>`:''}
 <p class="aul-hint">💡 <b>Аудио мэдээлэл</b> нь дууны долгионыг секундэд олон мянган удаа хэмжиж (дээжлэлтийн давтамж, жишээ нь 44100 Hz) тоо болгон хадгалдаг. Долгионы өндөр нь <b>чанга</b>, нягтрал нь <b>өндөр нам</b>-ыг илэрхийлнэ. WAV — шахаагүй, MP3 — шахсан формат.</p></div>`;bind();if(b)draw()}
function draw(){const cv=root.querySelector('.aul-cv');if(!cv)return;const box=cv.parentElement,w=box.clientWidth,h=box.clientHeight,dpr=devicePixelRatio||1;cv.width=w*dpr;cv.height=h*dpr;const x=cv.getContext('2d');x.scale(dpr,dpr);
 const b=S.buf,ch=b.numberOfChannels,lane=h/ch;x.fillStyle='#fffdf8';x.fillRect(0,0,w,h);
 if(hasSel()){const a=Math.min(...S.sel)/b.duration*w,e=Math.max(...S.sel)/b.duration*w;x.fillStyle='#f3d27a66';x.fillRect(a,0,e-a,h)}
 for(let c=0;c<ch;c++){const d=b.getChannelData(c),mid=lane*c+lane/2,step=Math.max(1,Math.floor(d.length/w));x.strokeStyle='#e6dfcf';x.beginPath();x.moveTo(0,mid);x.lineTo(w,mid);x.stroke();x.fillStyle='#1f3b73';
  for(let i=0;i<w;i++){let mn=1,mx=-1;const s=Math.floor(i*d.length/w);for(let j=0;j<step;j+=Math.max(1,step>>6)){const v=d[s+j]||0;if(v<mn)mn=v;if(v>mx)mx=v}x.fillRect(i,mid-mx*lane*.46,1,Math.max(1,(mx-mn)*lane*.46))}}
 x.fillStyle='#8a8270';x.font='11px sans-serif';for(let t=0;t<=b.duration;t+=Math.max(.5,Math.ceil(b.duration/(w/80)*2)/2)){const px=t/b.duration*w;x.fillRect(px,h-6,1,6);x.fillText(t.toFixed(1)+'с',px+2,h-8)}
 ph()}
function ph(){const p=root.querySelector('.aul-ph');if(p&&S.buf)p.style.left=(S.cur/S.buf.duration*100)+'%';const t=root.querySelector('#aut');if(t)t.textContent=fmtT(S.cur)}
function bind(){const q=s=>root.querySelectorAll(s);
 q('[data-a]').forEach(el=>{const a=el.dataset.a;const ev=el.tagName==='INPUT'?(el.type==='file'?'onchange':'oninput'):'onclick';el[ev]=()=>act(a,el)});
 const cv=root.querySelector('.aul-cv');if(!cv)return;let down=null;const tOf=e=>{const r=cv.getBoundingClientRect();return Math.max(0,Math.min(S.buf.duration,(e.clientX-r.left)/r.width*S.buf.duration))};
 cv.onpointerdown=e=>{e.preventDefault();cv.setPointerCapture(e.pointerId);down=tOf(e);S.sel=[down,down];S.cur=down;draw()};
 cv.onpointermove=e=>{if(down==null)return;S.sel=[down,tOf(e)];draw()};cv.onpointerup=()=>{down=null;render()};
 addEventListener('resize',()=>{if(root.isConnected)draw()},{once:true})}
function decode(file){return MM.decode(file)}
function mixAt(nb){const at=Math.round(S.cur*S.buf.sampleRate),need=at+nb.length;let base=S.buf;if(need>base.length)base=concat([base,mk(need-base.length,base.numberOfChannels,base.sampleRate)]);for(let c=0;c<base.numberOfChannels;c++){const d=base.getChannelData(c),s=nb.getChannelData(Math.min(c,nb.numberOfChannels-1));for(let i=0;i<s.length;i++)d[at+i]=Math.max(-1,Math.min(1,d[at+i]+s[i]*.6))}S.buf=base}
function insAt(nb){const at=Math.round(S.cur*S.buf.sampleRate);S.buf=concat([copyBuf(S.buf,0,at),nb,copyBuf(S.buf,at)])}
function stopPlay(){if(S.src){try{S.src.stop()}catch(e){}S.src=null}cancelAnimationFrame(S.raf)}
function act(a,el){const b=S.buf;S.msg='';
 if(a==='demo'){S.buf=demo();S.name='jishee_duu';S.sel=[0,0];S.cur=0;S.undo=[];render();return}
 if(a==='open'||a==='append'||a==='mix'){const f=el.files[0];MM.resetInput(el);if(!f)return;if((a!=='open')&&!S.buf)a='open';S.msg='⏳ «'+f.name+'» уншиж байна…';render();decode(f).then(nb=>{if(a==='open'){S.buf=nb;S.name=f.name.replace(/\.[^.]+$/,'').replace(/[^\wА-Яа-яЁёӨөҮү-]/g,'_')||'audio';S.undo=[];S.sel=[0,0];S.cur=0}
   else if(a==='append'){snap();S.buf=concat([S.buf,nb])}else{snap();mixAt(nb)}S.msg='✅ «'+esc(f.name)+'» орлоо ('+nb.duration.toFixed(1)+' сек).';render()}).catch(()=>{S.msg='⚠️ '+MM.decodeHelp(f);render()});return}
 if(a==='bin'||a==='binmix'){MM.pick('audio',it=>{S.msg='⏳ Ачаалж байна…';render();decode(it.blob).then(nb=>{if(a==='bin'||!S.buf){S.buf=nb;S.name=it.name.replace(/\.[^.]+$/,'');S.undo=[];S.sel=[0,0];S.cur=0}else{snap();mixAt(nb)}S.msg='';render()}).catch(()=>{S.msg='⚠️ Медиа сангийн файлыг уншиж чадсангүй.';render()})});return}
 if(a==='tobin'&&b){MM.bin.add({kind:'audio',name:S.name+'.wav',blob:wav(b),dur:b.duration});S.msg='✅ «'+S.name+'.wav» Медиа санд нэмэгдлээ. Видео засварлагчийн «🎵 Дуу» → «🗂 Медиа сан»-аас сонгоно.';if(O.onSave)O.onSave({sec:b.duration});render();return}
 if(a.startsWith('p_')&&S.pend){const nb=S.pend;S.pend=null;if(a==='p_new'||!S.buf){S.buf=nb;S.undo=[];S.name='bichleg';S.sel=[0,0];S.cur=0}else if(a==='p_app'){snap();S.buf=concat([S.buf,nb])}else if(a==='p_ins'){snap();insAt(nb)}else if(a==='p_mix'){snap();mixAt(nb)}render();return}
 if(a==='all'&&b){S.sel=[0,b.duration];render();return}if(a==='unsel'){S.sel=[0,0];render();return}
 if(a==='rec'){if(S.rec==='stopping')return;if(S.rec){const r=S.rec;S.rec='stopping';r.stop().then(bl=>{S.rec=null;if(bl.size<200){S.msg='⚠️ Бичлэг хоосон байна. Микрофоноо шалгаад дахин оролдоно уу.';return render()}
   decode(bl).then(nb=>{if(S.buf){S.pend=nb;S.msg=''}else{S.buf=nb;S.undo=[];S.name='bichleg';S.sel=[0,0];S.cur=0;S.msg='✅ Бичлэг орлоо. Долгион дээр чирж хэсэг сонгоод засварлаарай.'}render()})
   .catch(()=>{S.msg='⚠️ Бичлэгийг уншиж чадсангүй. Хөтчөө шинэчлээд дахин оролдоно уу.';render()})});return}
  stopPlay();S.msg='🎤 Микрофон нээж байна…';render();
  MM.recorder((lv,t)=>{const e=root.querySelector('#aulv');if(e)e.style.width=Math.min(100,lv*140)+'%';const tt=root.querySelector('#aurt');if(tt)tt.textContent=Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0')}).then(r=>{S.rec=r;S.msg='';render()})
   .catch(e=>{S.rec=null;S.msg='⚠️ '+(e.message||e);render()});return}
 if(a==='name'){S.name=el.value.replace(/[^\wА-Яа-яЁёӨөҮү-]/g,'_')||'audio';return}
 if(a==='zoom'){S.zoom=+el.value;render();return}
 if(!b)return;
 if(a==='play'){stopPlay();AC().resume();const [s,e]=hasSel()?selIdx():[Math.round(S.cur*b.sampleRate),b.length];const src=AC().createBufferSource();src.buffer=b;src.connect(AC().destination);const off=s/b.sampleRate,dur=(e-s)/b.sampleRate;src.start(0,off,dur);S.src=src;S.t0=AC().currentTime;
  const tick=()=>{const t=off+AC().currentTime-S.t0;if(t>=off+dur||!S.src){S.cur=hasSel()?off:Math.min(b.duration,t);ph();return}S.cur=t;ph();S.raf=requestAnimationFrame(tick)};tick();src.onended=()=>{if(S.src===src)S.src=null};return}
 if(a==='stop'){stopPlay();return}if(a==='start'){stopPlay();S.cur=0;ph();return}
 if(a==='save'){const bl=wav(b);MM.save(bl,S.name+'.wav',{toBin:()=>MM.bin.add({kind:'audio',name:S.name+'.wav',blob:bl,dur:b.duration})});if(O.onSave)O.onSave({sec:b.duration});return}
 if(a==='undo'){const u=S.undo.pop();if(u){S.buf=u;S.sel=[0,0]}render();return}
 const [s,e]=selIdx();
 if(a==='copy'){S.clip=copyBuf(b,s,e);S.msg=`📋 ${((e-s)/b.sampleRate).toFixed(2)} сек хуулагдлаа`;render();return}
 snap();
 if(a==='cut'||a==='del'){if(a==='cut')S.clip=copyBuf(b,s,e);if(e-s>=b.length){S.msg='⚠️ Бүх аудиог устгах боломжгүй. Эхлээд хэсэг сонгоно уу.';S.undo.pop();return render()}S.buf=concat([copyBuf(b,0,s),copyBuf(b,e)]);S.sel=[0,0];S.cur=s/b.sampleRate}
 if(a==='paste'){const at=Math.round(S.cur*b.sampleRate);S.buf=concat([copyBuf(b,0,at),S.clip,copyBuf(b,at)])}
 if(a==='trim'){S.buf=copyBuf(b,s,e);S.sel=[0,0];S.cur=0}
 if(a==='silence')eachSel((d,s,e)=>d.fill(0,s,e));
 if(a==='fadein')eachSel((d,s,e)=>{for(let i=s;i<e;i++)d[i]*=(i-s)/(e-s)});
 if(a==='fadeout')eachSel((d,s,e)=>{for(let i=s;i<e;i++)d[i]*=1-(i-s)/(e-s)});
 if(a==='amp'||a==='quiet'){const g=a==='amp'?1.995:.501;eachSel((d,s,e)=>{for(let i=s;i<e;i++)d[i]=Math.max(-1,Math.min(1,d[i]*g))})}
 if(a==='norm'){let m=0;eachSel((d,s,e)=>{for(let i=s;i<e;i++)m=Math.max(m,Math.abs(d[i]))});if(m>0){const g=.98/m;eachSel((d,s,e)=>{for(let i=s;i<e;i++)d[i]*=g})}}
 if(a==='rev')eachSel((d,s,e)=>{d.subarray(s,e).reverse()});
 if(a==='echo'){const del=Math.round(.25*b.sampleRate);eachSel((d,s,e)=>{for(let i=e-1;i>=s+del;i--)d[i]=Math.max(-1,Math.min(1,d[i]+d[i-del]*.45))})}
 if(a==='fast'||a==='slow'){const k=a==='fast'?1.25:.8,part=copyBuf(b,s,e),nl=Math.round(part.length/k),np=mk(nl,b.numberOfChannels,b.sampleRate);for(let c=0;c<b.numberOfChannels;c++){const src=part.getChannelData(c),dst=np.getChannelData(c);for(let i=0;i<nl;i++){const p=i*k,i0=Math.floor(p),f=p-i0;dst[i]=(src[i0]||0)*(1-f)+(src[i0+1]||0)*f}}S.buf=concat([copyBuf(b,0,s),np,copyBuf(b,e)]);S.sel=[0,0]}
 if(a==='tone'){const sr=b.sampleRate,n=Math.round(.35*sr),t=mk(n,b.numberOfChannels,sr);for(let c=0;c<t.numberOfChannels;c++){const d=t.getChannelData(c);for(let i=0;i<n;i++)d[i]=.4*Math.sin(2*Math.PI*880*i/sr)*Math.min(1,(n-i)/800)}const at=Math.round(S.cur*sr);S.buf=concat([copyBuf(b,0,at),t,copyBuf(b,at)])}
 render()}
document.addEventListener('keydown',e=>{if(!root?.isConnected||!S.buf||e.target.closest('input,textarea,select'))return;if(e.code==='Space'){e.preventDefault();S.src?stopPlay():act('play')}else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();act('undo')}else if(e.key==='Delete'&&hasSel()){act('del')}});
const css=document.createElement('style');css.textContent=`
.aul{--un:#14213d;--ug:#b08d3a;--ul:#e6dfcf;background:#fffdf8;border:1px solid var(--ul);border-radius:14px;overflow:hidden;color:#1d2433}
.aul-top{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center;padding:10px 14px;background:linear-gradient(135deg,#14213d,#1d4d4f);color:#fff}
.aul-brand{display:flex;gap:10px;align-items:center}.aul-brand span{font-size:28px}.aul-brand small{display:block;opacity:.8;font-size:12px}.aul-acts{display:flex;gap:6px;flex-wrap:wrap}
.aul-b{min-height:36px;padding:6px 12px;border-radius:9px;border:1.5px solid var(--un);background:var(--un);color:#fff;font-weight:700;cursor:pointer;font-size:14px;display:inline-flex;align-items:center;gap:4px;margin:0}.aul-b.ghost{background:#fff;color:var(--un)}.aul-b.gold{background:var(--ug);border-color:var(--ug)}.aul-b.red{background:#c1121f;border-color:#c1121f;animation:aulp 1s infinite}.aul-b:disabled{opacity:.5}
@keyframes aulp{50%{opacity:.6}}.aul-top .aul-b.ghost{background:transparent;color:#fff;border-color:#ffffff88}
.aul-trans{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:8px 12px;background:#f4efe3;border-bottom:1px solid var(--ul)}
.aul-r{width:42px;height:42px;border-radius:50%;border:0;background:var(--un);color:#fff;font-size:16px;cursor:pointer;min-height:0;padding:0}
.aul-time{font:700 20px "PT Mono",monospace;color:var(--un)}.aul-time small{font-size:13px;color:#777}.aul-selinfo{font-size:13px;flex:1;min-width:180px}.aul-z{font-size:12px;font-weight:700;display:flex;flex-direction:column;margin:0}
.aul-wavewrap{overflow-x:auto;background:#fffdf8}.aul-wave{position:relative;height:200px;min-width:100%}.aul-cv{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:text}
.aul-ph{position:absolute;top:0;bottom:0;width:2px;background:#c1121f;pointer-events:none}
.aul-meta{font-size:12.5px;padding:6px 12px;color:#4a5470;border-top:1px solid var(--ul)}
.aul-groups{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;padding:10px 12px}
.aul-g{border:1px solid var(--ul);border-radius:12px;padding:10px;background:#fff;display:flex;flex-wrap:wrap;gap:6px;align-content:flex-start}.aul-g>b{width:100%;color:var(--un)}
.aul-g button,.aul-fb{border:1.5px solid var(--ul);background:#fff;border-radius:8px;padding:6px 9px;font-weight:700;font-size:13px;cursor:pointer;color:#1d2433;min-height:34px;display:inline-flex;align-items:center;margin:0}.aul-g button:hover,.aul-fb:hover{border-color:var(--ug);background:#fbf4e2}.aul-g button:disabled{opacity:.45}
.aul-l{display:flex;flex-direction:column;font-size:12px;font-weight:700;width:100%;margin:0}.aul-l input{min-height:34px;border:1px solid var(--ul);border-radius:8px;padding:4px 8px;font:inherit}
.aul-empty{text-align:center;padding:30px 16px}.aul-msg{margin:0 12px 8px;padding:8px 12px;border-radius:10px;background:#fbf4e2;font-weight:700}
.aul-hint{font-size:13px;color:#5b6276;margin:0;padding:0 12px 12px}
.aul-r.sm{width:34px;height:34px;min-height:0;font-size:13px}
@media(max-width:640px){.aul-top{padding:10px}.aul-acts{display:grid!important;grid-template-columns:1fr 1fr;width:100%}.aul-acts .aul-b{justify-content:center;min-height:44px}.aul-wave{height:150px}.aul-trans{flex-wrap:wrap;gap:6px}.aul-selinfo{flex-basis:100%;order:9;font-size:13px}.aul-groups{grid-template-columns:1fr!important}.aul-g button,.aul-g .aul-fb{min-height:42px;font-size:14px}.aul-z{flex-basis:100%}}
`;
document.head.appendChild(css);
window.AudioLab={mount(el,o={}){stopPlay();root=el;O=o;render()},_wav:wav};
})();
