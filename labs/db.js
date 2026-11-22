/* =====================================================================
   «Мэдлэгийн Мөр» — Өгөгдлийн сангийн лаборатори (Access маягийн)
   DbLab.mount(el,{onSolve(id,pts), solved:{id:true}, task:'id'})
   Хүснэгт · Загвар · Форм · Асуулга (QBE + SQL) · Тайлан · Бодлого
   ===================================================================== */
(function(){
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TYPES=['Автодугаар','Текст','Тоо','Мөнгө','Огноо','Тийм/Үгүй'];
/* ---------- Жишээ өгөгдлийн сангууд ---------- */
const SAMPLES={
 lib:{name:'Сургуулийн номын сан',tables:{
  'Ном':{f:[['НомID','Автодугаар',1],['Нэр','Текст'],['Зохиогч','Текст'],['Төрөл','Текст'],['Он','Тоо'],['Үнэ','Мөнгө'],['Тоо_ширхэг','Тоо']],r:[
   [1,'Тунгалаг Тамир','Ч.Лодойдамба','Роман',1962,25000,4],[2,'Хөх судар','В.Инжинаш','Роман',1871,32000,2],[3,'Миний нутаг','Д.Нацагдорж','Шүлэг',1933,12000,6],
   [4,'Үүлэн чөлөө','Б.Ринчен','Роман',1955,22000,3],[5,'Харри Поттер','Ж.К.Роулинг','Уран зөгнөл',1997,38000,5],[6,'Бяцхан ханхүү','А.де Сент-Экзюпери','Үлгэр',1943,15000,7],
   [7,'Мэдээллийн технологи X','Д.Цэдэвсүрэн','Сурах бичиг',2023,0,30],[8,'Аян замын тэмдэглэл','Д.Нацагдорж','Өгүүллэг',1932,9000,2],[9,'Шар туузат','Ч.Лодойдамба','Өгүүллэг',1958,11000,4],
   [10,'Монголын нууц товчоо','Тодорхойгүй','Түүх',1240,45000,3],[11,'Алгоритмын үндэс','Т.Кормен','Сурах бичиг',2009,85000,1],[12,'Хүүхдийн шүлэг','Д.Пүрэвдорж','Шүлэг',1985,8000,9]]},
  'Уншигч':{f:[['УншигчID','Автодугаар',1],['Овог','Текст'],['Нэр','Текст'],['Анги','Текст'],['Утас','Текст']],r:[
   [1,'Бат','Тэмүүлэн','10А','99112233'],[2,'Дорж','Анужин','10А','88119922'],[3,'Ганбат','Номин','10Б','95550011'],[4,'Сүх','Билгүүн','10В','99004455'],
   [5,'Цэрэн','Марал','10Б','88006677'],[6,'Энх','Хулан','10А','91112222'],[7,'Пүрэв','Төгөлдөр','10В','99887766']]},
  'Зээл':{f:[['ЗээлID','Автодугаар',1],['НомID','Тоо'],['УншигчID','Тоо'],['Авсан','Огноо'],['Буцаасан','Тийм/Үгүй']],r:[
   [1,1,1,'2026-09-05',true],[2,5,2,'2026-09-12',true],[3,6,3,'2026-09-20',false],[4,3,1,'2026-10-02',true],[5,5,4,'2026-10-03',false],[6,2,5,'2026-10-10',false],
   [7,9,6,'2026-10-15',true],[8,1,7,'2026-10-21',false],[9,4,2,'2026-11-01',false],[10,5,6,'2026-11-04',false],[11,12,3,'2026-11-08',true],[12,6,1,'2026-11-12',false]]}}},
 school:{name:'Сурагчийн бүртгэл ба дүн',tables:{
  'Сурагч':{f:[['СурагчID','Автодугаар',1],['Овог','Текст'],['Нэр','Текст'],['Анги','Текст'],['Хүйс','Текст'],['Төрсөн','Огноо'],['Дотуур_байр','Тийм/Үгүй']],r:[
   [1,'Бат','Тэмүүлэн','10А','Эр','2010-03-14',false],[2,'Дорж','Анужин','10А','Эм','2010-07-02',false],[3,'Ганбат','Номин','10Б','Эм','2010-01-22',true],[4,'Сүх','Билгүүн','10В','Эр','2009-12-30',false],
   [5,'Цэрэн','Марал','10Б','Эм','2010-05-18',true],[6,'Энх','Хулан','10А','Эм','2010-09-09',false],[7,'Пүрэв','Төгөлдөр','10В','Эр','2010-02-11',false],[8,'Батсүх','Ариунболд','10Б','Эр','2010-11-27',true]]},
  'Хичээл':{f:[['ХичээлID','Автодугаар',1],['Нэр','Текст'],['Цаг','Тоо'],['Багш','Текст']],r:[
   [1,'Мэдээллийн технологи',2,'Б.Батцэцэг'],[2,'Математик',5,'Д.Оюун'],[3,'Монгол хэл',3,'С.Туяа'],[4,'Физик',3,'Г.Болд'],[5,'Англи хэл',4,'Н.Сараа']]},
  'Дүн':{f:[['ДүнID','Автодугаар',1],['СурагчID','Тоо'],['ХичээлID','Тоо'],['Оноо','Тоо'],['Улирал','Тоо']],r:(()=>{const r=[];let id=1;const sc=[[95,88,76,81,90],[78,92,85,70,88],[66,58,90,62,75],[88,95,72,91,64],[91,80,93,77,96],[55,61,80,58,70],[84,77,68,89,82],[73,69,88,79,85]];
   for(let s=1;s<=8;s++)for(let h=1;h<=5;h++)r.push([id++,s,h,sc[s-1][h-1],1]);return r})()}}},
 shop:{name:'Дэлгүүрийн борлуулалт',tables:{
  'Бараа':{f:[['БарааID','Автодугаар',1],['Нэр','Текст'],['Ангилал','Текст'],['Үнэ','Мөнгө'],['Үлдэгдэл','Тоо']],r:[
   [1,'Сүү 1л','Сүүн бүтээгдэхүүн',3500,40],[2,'Тараг','Сүүн бүтээгдэхүүн',2800,25],[3,'Талх','Гурил',2200,60],[4,'Боов','Гурил',6500,18],[5,'Алим 1кг','Жимс',7800,30],
   [6,'Банана 1кг','Жимс',6900,22],[7,'Ус 0.5л','Ундаа',1200,120],[8,'Шүүс 1л','Ундаа',4500,35],[9,'Шоколад','Чихэр',3900,50],[10,'Ааруул 250г','Сүүн бүтээгдэхүүн',9500,12]]},
  'Борлуулалт':{f:[['ДугаарID','Автодугаар',1],['БарааID','Тоо'],['Тоо','Тоо'],['Огноо','Огноо'],['Ажилтан','Текст']],r:[
   [1,1,3,'2026-11-01','Сарнай'],[2,3,5,'2026-11-01','Болд'],[3,7,12,'2026-11-02','Сарнай'],[4,5,2,'2026-11-02','Болд'],[5,9,6,'2026-11-03','Сарнай'],[6,10,1,'2026-11-03','Төгс'],
   [7,2,4,'2026-11-04','Төгс'],[8,1,6,'2026-11-05','Болд'],[9,8,3,'2026-11-05','Сарнай'],[10,4,2,'2026-11-06','Төгс'],[11,7,20,'2026-11-07','Болд'],[12,6,3,'2026-11-07','Сарнай'],[13,3,8,'2026-11-08','Төгс'],[14,9,4,'2026-11-09','Болд']]}}}
};
/* ---------- Бодлогууд (хариултыг автоматаар шалгана) ---------- */
const TASKS=[
 {id:'l1',db:'lib',lv:1,t:'«Ном» хүснэгтийн бүх бичлэгийг харуул.',sql:'SELECT * FROM Ном',hint:'Бүх талбар — «*» тэмдэг.'},
 {id:'l2',db:'lib',lv:1,t:'Номын Нэр, Зохиогч, Үнэ гэсэн 3 талбарыг харуул.',sql:'SELECT Нэр, Зохиогч, Үнэ FROM Ном',hint:'SELECT дараа талбаруудыг таслалаар.'},
 {id:'l3',db:'lib',lv:1,t:'«Роман» төрлийн номын Нэр, Зохиогчийг харуул.',sql:"SELECT Нэр, Зохиогч FROM Ном WHERE Төрөл='Роман'",hint:"Шүүлт: WHERE Төрөл='Роман'"},
 {id:'l4',db:'lib',lv:2,t:'Үнэ нь 20 000-аас их номын Нэр, Үнийг үнээр нь буурахаар эрэмбэл.',sql:'SELECT Нэр, Үнэ FROM Ном WHERE Үнэ>20000 ORDER BY Үнэ DESC',ord:1,hint:'ORDER BY Үнэ DESC'},
 {id:'l5',db:'lib',lv:2,t:'1950–1970 оны хооронд хэвлэгдсэн номын Нэр, Онг харуул.',sql:'SELECT Нэр, Он FROM Ном WHERE Он BETWEEN 1950 AND 1970',hint:'BETWEEN 1950 AND 1970'},
 {id:'l6',db:'lib',lv:2,t:'Нэр нь «Х» үсгээр эхэлсэн номуудын Нэрийг харуул.',sql:"SELECT Нэр FROM Ном WHERE Нэр LIKE 'Х%'",hint:"LIKE 'Х%' (Access-д Like \"Х*\")"},
 {id:'l7',db:'lib',lv:3,t:'Төрөл бүрт хэдэн ном байгааг тоол (Төрөл, Тоо).',sql:'SELECT Төрөл, COUNT(*) AS Тоо FROM Ном GROUP BY Төрөл',hint:'GROUP BY Төрөл, COUNT(*)'},
 {id:'l8',db:'lib',lv:3,t:'Буцаагаагүй зээлийн уншигчийн Нэр, номын Нэрийг харуул (2 хүснэгт холбох).',sql:'SELECT Уншигч.Нэр, Ном.Нэр FROM Зээл INNER JOIN Ном ON Зээл.НомID=Ном.НомID INNER JOIN Уншигч ON Зээл.УншигчID=Уншигч.УншигчID WHERE Буцаасан=FALSE',hint:'INNER JOIN … ON …, WHERE Буцаасан=FALSE'},
 {id:'s1',db:'school',lv:1,t:'10А ангийн сурагчдын Овог, Нэрийг харуул.',sql:"SELECT Овог, Нэр FROM Сурагч WHERE Анги='10А'",hint:"WHERE Анги='10А'"},
 {id:'s2',db:'school',lv:2,t:'Дотуур байранд амьдардаг эмэгтэй сурагчдын Нэрийг харуул.',sql:"SELECT Нэр FROM Сурагч WHERE Хүйс='Эм' AND Дотуур_байр=TRUE",hint:'AND-аар 2 нөхцөл'},
 {id:'s3',db:'school',lv:2,t:'Сурагчдыг Нэрээр нь цагаан толгойн дарааллаар эрэмбэлж Нэр, Ангийг харуул.',sql:'SELECT Нэр, Анги FROM Сурагч ORDER BY Нэр',ord:1,hint:'ORDER BY Нэр'},
 {id:'s4',db:'school',lv:3,t:'Хичээл бүрийн дундаж оноог ол (ХичээлID, Дундаж).',sql:'SELECT ХичээлID, AVG(Оноо) AS Дундаж FROM Дүн GROUP BY ХичээлID',hint:'AVG(Оноо) … GROUP BY ХичээлID'},
 {id:'s5',db:'school',lv:3,t:'«Мэдээллийн технологи» хичээлд 90-ээс дээш оноо авсан сурагчдын Нэр, Оноог харуул.',sql:"SELECT Сурагч.Нэр, Дүн.Оноо FROM Дүн INNER JOIN Сурагч ON Дүн.СурагчID=Сурагч.СурагчID INNER JOIN Хичээл ON Дүн.ХичээлID=Хичээл.ХичээлID WHERE Хичээл.Нэр='Мэдээллийн технологи' AND Оноо>90",hint:'3 хүснэгтийг JOIN хийнэ.'},
 {id:'s6',db:'school',lv:3,t:'Анги бүрийн сурагчдын тоог ол (Анги, Тоо).',sql:'SELECT Анги, COUNT(*) AS Тоо FROM Сурагч GROUP BY Анги',hint:'GROUP BY Анги'},
 {id:'p1',db:'shop',lv:1,t:'«Жимс» ангиллын барааны Нэр, Үнийг харуул.',sql:"SELECT Нэр, Үнэ FROM Бараа WHERE Ангилал='Жимс'",hint:"WHERE Ангилал='Жимс'"},
 {id:'p2',db:'shop',lv:2,t:'Үлдэгдэл нь 20-оос бага барааны Нэр, Үлдэгдлийг харуул.',sql:'SELECT Нэр, Үлдэгдэл FROM Бараа WHERE Үлдэгдэл<20',hint:'WHERE Үлдэгдэл<20'},
 {id:'p3',db:'shop',lv:2,t:'Хамгийн үнэтэй 3 барааны Нэр, Үнийг харуул.',sql:'SELECT TOP 3 Нэр, Үнэ FROM Бараа ORDER BY Үнэ DESC',ord:1,hint:'TOP 3 … ORDER BY Үнэ DESC'},
 {id:'p4',db:'shop',lv:3,t:'Ажилтан бүрийн борлуулсан барааны нийт тоог ол (Ажилтан, Нийт).',sql:'SELECT Ажилтан, SUM(Тоо) AS Нийт FROM Борлуулалт GROUP BY Ажилтан',hint:'SUM(Тоо) … GROUP BY Ажилтан'},
 {id:'p5',db:'shop',lv:3,t:'Борлуулалт бүрийн барааны Нэр, Тоо, Дүн (Тоо*Үнэ)-г тооцоол.',sql:'SELECT Бараа.Нэр, Борлуулалт.Тоо, Борлуулалт.Тоо*Бараа.Үнэ AS Дүн FROM Борлуулалт INNER JOIN Бараа ON Борлуулалт.БарааID=Бараа.БарааID',hint:'Тооцоолсон талбар: Тоо*Үнэ AS Дүн'},
 {id:'p6',db:'shop',lv:3,t:'Нийт борлуулалтын дүн 30 000-аас их ангиллуудыг ол (Ангилал, Нийт).',sql:'SELECT Бараа.Ангилал, SUM(Борлуулалт.Тоо*Бараа.Үнэ) AS Нийт FROM Борлуулалт INNER JOIN Бараа ON Борлуулалт.БарааID=Бараа.БарааID GROUP BY Бараа.Ангилал HAVING SUM(Борлуулалт.Тоо*Бараа.Үнэ)>30000',hint:'GROUP BY … HAVING SUM(…)>30000'}
];
const PTS=[0,5,10,15];
/* ---------- Өгөгдлийн сан хадгалах ---------- */
const KEY='m10_dblab';let STORE;
function loadStore(){try{STORE=JSON.parse(localStorage.getItem(KEY))}catch(e){}if(!STORE||!STORE.dbs){STORE={cur:'lib',dbs:{}};for(const k in SAMPLES)STORE.dbs[k]=fresh(k)}}
function fresh(k){const S=SAMPLES[k];const t={};for(const n in S.tables){const T=S.tables[n];t[n]={fields:T.f.map(f=>({name:f[0],type:f[1],pk:!!f[2]})),rows:T.r.map(r=>Object.fromEntries(T.f.map((f,i)=>[f[0],r[i]])))}}return {name:S.name,tables:t,queries:{}}}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(STORE))}catch(e){}}
const DB=()=>STORE.dbs[STORE.cur];
/* ---------- SQL хөдөлгүүр ---------- */
function lex(src){const T=[];let i=0;const s=src;
 while(i<s.length){const c=s[i];
  if(/\s/.test(c)){i++;continue}
  if(c==='-'&&s[i+1]==='-'){while(i<s.length&&s[i]!=='\n')i++;continue}
  if(c==="'"||c==='"'){let j=i+1,v='';while(j<s.length){if(s[j]===c){if(s[j+1]===c){v+=c;j+=2;continue}break}v+=s[j++]}if(j>=s.length)throw err('Хашилт хаагдаагүй байна');T.push({t:'str',v});i=j+1;continue}
  if(c==='#'){const j=s.indexOf('#',i+1);if(j<0)throw err('# хаагдаагүй');T.push({t:'str',v:normDate(s.slice(i+1,j))});i=j+1;continue}
  if(c==='['){const j=s.indexOf(']',i+1);if(j<0)throw err('[ хаагдаагүй');T.push({t:'id',v:s.slice(i+1,j)});i=j+1;continue}
  if(/[0-9]/.test(c)||(c==='.'&&/[0-9]/.test(s[i+1]))){let j=i;while(j<s.length&&/[0-9.]/.test(s[j]))j++;T.push({t:'num',v:parseFloat(s.slice(i,j))});i=j;continue}
  if(/[A-Za-zА-Яа-яЁёӨөҮү_]/.test(c)){let j=i;while(j<s.length&&/[A-Za-zА-Яа-яЁёӨөҮү_0-9]/.test(s[j]))j++;const w=s.slice(i,j);const K=w.toUpperCase();
   if(KW.has(K))T.push({t:'kw',v:K});else T.push({t:'id',v:w});i=j;continue}
  const two=s.slice(i,i+2);if(['<=','>=','<>','!=','||'].includes(two)){T.push({t:'op',v:two==='!='?'<>':two});i+=2;continue}
  if('=<>+-*/(),.;&%'.includes(c)){T.push({t:'op',v:c});i++;continue}
  throw err(`Танигдахгүй тэмдэгт: «${c}»`)}
 T.push({t:'eof'});return T}
const KW=new Set(['SELECT','DISTINCT','FROM','WHERE','AND','OR','NOT','ORDER','BY','ASC','DESC','GROUP','HAVING','AS','LIKE','BETWEEN','IN','IS','NULL','INNER','LEFT','JOIN','ON','TOP','LIMIT','TRUE','FALSE','COUNT','SUM','AVG','MIN','MAX']);
function err(m){const e=new Error(m);e.sql=1;return e}
function normDate(s){s=s.trim();let m=s.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/);if(m)return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;m=s.match(/^(\d{1,2})[-./](\d{1,2})[-./](\d{4})$/);if(m)return `${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`;return s}
function parse(src){const T=lex(src);let p=0;const pk=()=>T[p],nx=()=>T[p++],is=(t,v)=>T[p].t===t&&(v===undefined||T[p].v===v),eat=(t,v)=>{if(!is(t,v))throw err(`«${v||t}» хүлээгдэж байсан, «${T[p].v??'төгсгөл'}» байна`);return nx()},opt=(t,v)=>is(t,v)?nx():null;
 const Q={};eat('kw','SELECT');if(opt('kw','DISTINCT'))Q.distinct=1;if(opt('kw','TOP'))Q.limit=eat('num').v;
 Q.cols=[];do{if(is('op','*')){nx();Q.cols.push({star:1});continue}if(is('id')&&T[p+1].t==='op'&&T[p+1].v==='.'&&T[p+2].t==='op'&&T[p+2].v==='*'){Q.cols.push({star:1,tab:nx().v});nx();nx();continue}
  const e=expr();let al=null;if(opt('kw','AS'))al=(is('str')?nx():eat('id')).v;else if(is('id'))al=nx().v;Q.cols.push({e,al})}while(opt('op',','));
 eat('kw','FROM');Q.from=tabRef();Q.joins=[];while(opt('op',','))Q.joins.push({t:tabRef(),on:{k:'lit',v:true}});
 while(is('kw','INNER')||is('kw','LEFT')||is('kw','JOIN')){let left=false;if(opt('kw','LEFT'))left=true;else opt('kw','INNER');eat('kw','JOIN');const t=tabRef();eat('kw','ON');Q.joins.push({t,on:expr(),left})}
 if(opt('kw','WHERE'))Q.where=expr();
 if(opt('kw','GROUP')){eat('kw','BY');Q.group=[];do Q.group.push(expr());while(opt('op',','))}
 if(opt('kw','HAVING'))Q.having=expr();
 if(opt('kw','ORDER')){eat('kw','BY');Q.order=[];do{const e=expr();let d=false;if(opt('kw','DESC'))d=true;else opt('kw','ASC');Q.order.push({e,d})}while(opt('op',','))}
 if(opt('kw','LIMIT'))Q.limit=eat('num').v;opt('op',';');if(!is('eof'))throw err(`Илүү үг: «${pk().v}»`);return Q;
 function tabRef(){const n=eat('id').v;let a=null;if(opt('kw','AS'))a=eat('id').v;else if(is('id'))a=nx().v;return {n,a:a||n}}
 function expr(){return orE()}
 function orE(){let l=andE();while(opt('kw','OR'))l={k:'or',l,r:andE()};return l}
 function andE(){let l=notE();while(opt('kw','AND'))l={k:'and',l,r:notE()};return l}
 function notE(){if(opt('kw','NOT'))return {k:'not',e:notE()};return cmp()}
 function cmp(){let l=add();
  for(;;){if(is('op')&&['=','<','>','<=','>=','<>'].includes(pk().v)){const o=nx().v;l={k:'cmp',o,l,r:add()};continue}
   let neg=false;if(is('kw','NOT')&&['LIKE','BETWEEN','IN'].includes(T[p+1].v)){nx();neg=true}
   if(opt('kw','LIKE')){l={k:'like',l,r:add(),neg};continue}
   if(opt('kw','BETWEEN')){const a=add();eat('kw','AND');l={k:'betw',l,a,b:add(),neg};continue}
   if(opt('kw','IN')){eat('op','(');const L=[];do L.push(expr());while(opt('op',','));eat('op',')');l={k:'in',l,L,neg};continue}
   if(opt('kw','IS')){const n=!!opt('kw','NOT');eat('kw','NULL');l={k:'isnull',l,neg:n};continue}
   return l}}
 function add(){let l=mul();while(is('op')&&['+','-','&','||'].includes(pk().v)){const o=nx().v;l={k:'bin',o:o==='||'?'&':o,l,r:mul()}}return l}
 function mul(){let l=un();while(is('op')&&['*','/','%'].includes(pk().v)){const o=nx().v;l={k:'bin',o,l,r:un()}}return l}
 function un(){if(opt('op','-'))return {k:'neg',e:un()};return prim()}
 function prim(){const t=pk();
  if(t.t==='num'){nx();return {k:'lit',v:t.v}}if(t.t==='str'){nx();return {k:'lit',v:t.v}}
  if(t.t==='kw'&&(t.v==='TRUE'||t.v==='FALSE')){nx();return {k:'lit',v:t.v==='TRUE'}}if(t.t==='kw'&&t.v==='NULL'){nx();return {k:'lit',v:null}}
  if(t.t==='kw'&&['COUNT','SUM','AVG','MIN','MAX'].includes(t.v)){nx();eat('op','(');let a;let dis=false;if(opt('kw','DISTINCT'))dis=true;if(is('op','*')){nx();a={k:'star'}}else a=expr();eat('op',')');return {k:'agg',f:t.v,a,dis}}
  if(opt('op','(')){const e=expr();eat('op',')');return e}
  if(t.t==='id'){nx();if(opt('op','.')){const f=eat('id').v;return {k:'col',tab:t.v,n:f}}return {k:'col',n:t.v}}
  throw err(`Илэрхийлэл дутуу: «${t.v??'төгсгөл'}»`)}}
const norm=s=>String(s).toLowerCase();
function likeRe(p){p=String(p);const acc=/[*?]/.test(p)&&!/[%_]/.test(p);let r='';for(const c of p){if(c===(acc?'*':'%'))r+='.*';else if(c===(acc?'?':'_'))r+='.';else r+=c.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}return new RegExp('^'+r+'$','i')}
function cmpv(a,b){if(a==null||b==null)return null;if(typeof a==='boolean'||typeof b==='boolean'){a=a===true||a==='true'||a==='Тийм'?1:0;b=b===true||b==='true'||b==='Тийм'?1:0}
 const na=typeof a==='number'||(a!==''&&!isNaN(a)),nb=typeof b==='number'||(b!==''&&!isNaN(b));if(na&&nb)return Number(a)-Number(b);return String(a).localeCompare(String(b),'mn')}
function run(sql,db){db=db||DB();const Q=parse(sql);
 const tab=n=>{const k=Object.keys(db.tables).find(x=>norm(x)===norm(n));if(!k)throw err(`«${n}» нэртэй хүснэгт алга. Байгаа нь: ${Object.keys(db.tables).join(', ')}`);return {k,T:db.tables[k]}};
 const truth=v=>v===true||(v!==false&&v!=null&&v!==0&&v!=='');
 const src=[{...tab(Q.from.n),a:Q.from.a}];Q.joins.forEach(j=>src.push({...tab(j.t.n),a:j.t.a,j}));
 let rows=src[0].T.rows.map(r=>({[norm(src[0].a)]:r}));
 for(let i=1;i<src.length;i++){const S=src[i],out=[];for(const r of rows){let hit=false;for(const r2 of S.T.rows){const c={...r,[norm(S.a)]:r2};if(truth(ev(S.j.on,c))){out.push(c);hit=true}}if(!hit&&S.j.left)out.push({...r,[norm(S.a)]:{}})}rows=out}
 function col(e,ctx){if(e.tab){const t=ctx[norm(e.tab)];if(!t)throw err(`«${e.tab}» хүснэгт асуулгад алга`);const k=Object.keys(t).find(x=>norm(x)===norm(e.n));if(k===undefined&&!src.find(s=>norm(s.a)===norm(e.tab)).T.fields.some(f=>norm(f.name)===norm(e.n)))throw err(`«${e.tab}.${e.n}» талбар алга`);return k===undefined?null:t[k]}
  const hits=[];for(const s of src){const f=s.T.fields.find(f=>norm(f.name)===norm(e.n));if(f)hits.push([s,f])}
  if(!hits.length){if(ctx.__al&&Object.keys(ctx.__al).some(k=>norm(k)===norm(e.n)))return ctx.__al[Object.keys(ctx.__al).find(k=>norm(k)===norm(e.n))];throw err(`«${e.n}» нэртэй талбар алга`)}
  if(hits.length>1)throw err(`«${e.n}» талбар хэд хэдэн хүснэгтэд байна. «Хүснэгт.${e.n}» гэж бич`);const [s,f]=hits[0];return (ctx[norm(s.a)]||{})[f.name]??null}
 function ev(e,ctx){switch(e.k){case 'lit':return e.v;case 'col':return col(e,ctx);case 'neg':return -ev(e.e,ctx);
  case 'bin':{const a=ev(e.l,ctx),b=ev(e.r,ctx);if(e.o==='&')return String(a??'')+String(b??'');if(a==null||b==null)return null;const x=Number(a),y=Number(b);if(e.o==='+'){if(isNaN(x)||isNaN(y))return String(a)+String(b);return x+y}if(e.o==='-')return x-y;if(e.o==='*')return x*y;if(e.o==='/')return y===0?null:x/y;return x%y}
  case 'cmp':{const c=cmpv(ev(e.l,ctx),ev(e.r,ctx));if(c==null)return null;return {'=':c===0,'<>':c!==0,'<':c<0,'>':c>0,'<=':c<=0,'>=':c>=0}[e.o]}
  case 'and':return truth(ev(e.l,ctx))&&truth(ev(e.r,ctx));case 'or':return truth(ev(e.l,ctx))||truth(ev(e.r,ctx));case 'not':return !truth(ev(e.e,ctx));
  case 'like':{const v=ev(e.l,ctx);const r=v!=null&&likeRe(ev(e.r,ctx)).test(String(v));return e.neg?!r:r}
  case 'betw':{const v=ev(e.l,ctx),a=cmpv(v,ev(e.a,ctx)),b=cmpv(v,ev(e.b,ctx));const r=a!=null&&b!=null&&a>=0&&b<=0;return e.neg?!r:r}
  case 'in':{const v=ev(e.l,ctx);const r=e.L.some(x=>cmpv(v,ev(x,ctx))===0);return e.neg?!r:r}
  case 'isnull':{const v=ev(e.l,ctx);const r=v==null||v==='';return e.neg?!r:r}
  case 'agg':{const G=ctx.__g;if(!G)throw err(`${e.f}() функцийг зөвхөн SELECT, HAVING-д ашиглана`);let vs=e.a.k==='star'?G.map(()=>1):G.map(r=>ev(e.a,r)).filter(v=>v!=null&&v!=='');if(e.dis)vs=[...new Set(vs.map(String))];
   if(e.f==='COUNT')return vs.length;if(!vs.length)return null;const ns=vs.map(Number);if(e.f==='SUM')return ns.reduce((a,b)=>a+b,0);if(e.f==='AVG')return Math.round(ns.reduce((a,b)=>a+b,0)/ns.length*100)/100;
   const s=[...vs].sort((a,b)=>cmpv(a,b));return e.f==='MIN'?s[0]:s[s.length-1]}
  case 'star':return 1}throw err('Илэрхийлэл буруу')}
 if(Q.where)rows=rows.filter(r=>truth(ev(Q.where,r)));
 const hasAgg=e=>e&&(e.k==='agg'||['l','r','e','a','b'].some(k=>e[k]&&typeof e[k]==='object'&&hasAgg(e[k]))||(e.L||[]).some(hasAgg));
 const aggMode=Q.group||Q.cols.some(c=>c.e&&hasAgg(c.e));
 const name=(c,i)=>c.al||(c.e.k==='col'?c.e.n:c.e.k==='agg'?`${c.e.f}(${c.e.a.k==='star'?'*':c.e.a.n||'…'})`:'Илэрхийлэл'+(i+1));
 let cols=[],out=[];
 if(aggMode){if(Q.cols.some(c=>c.star))throw err('GROUP BY-тай асуулгад «*» хэрэглэхгүй');const groups=new Map();
  for(const r of rows){const key=JSON.stringify((Q.group||[]).map(g=>ev(g,r)));if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r)}
  if(!Q.group&&!groups.size)groups.set('[]',[]);
  cols=Q.cols.map(name);
  for(const G of groups.values()){const ctx={...(G[0]||{}),__g:G};if(Q.having&&!truth(ev(Q.having,ctx)))continue;const o=Q.cols.map(c=>ev(c.e,ctx));o.__ctx=ctx;out.push(o)}}
 else{for(const c of Q.cols){if(c.star){src.filter(s=>!c.tab||norm(s.a)===norm(c.tab)).forEach(s=>s.T.fields.forEach(f=>cols.push(src.length>1?`${s.k}.${f.name}`:f.name)))}else cols.push(name(c,cols.length))}
  for(const r of rows){const o=[];for(const c of Q.cols){if(c.star)src.filter(s=>!c.tab||norm(s.a)===norm(c.tab)).forEach(s=>s.T.fields.forEach(f=>o.push((r[norm(s.a)]||{})[f.name]??null)));else o.push(ev(c.e,r))}o.__ctx=r;out.push(o)}}
 if(Q.order){const al={};Q.cols.forEach((c,i)=>{if(c.al)al[c.al]=i});
  const key=(o,e)=>{if(e.k==='col'&&!e.tab){const i=Object.keys(al).find(k=>norm(k)===norm(e.n));if(i!==undefined)return o[al[i]];const j=cols.findIndex(c=>norm(c)===norm(e.n));if(j>=0&&!src.some(s=>s.T.fields.some(f=>norm(f.name)===norm(e.n))))return o[j]}
   if(e.k==='lit'&&typeof e.v==='number')return o[e.v-1];return ev(e,o.__ctx)};
  out.sort((a,b)=>{for(const s of Q.order){const c=cmpv(key(a,s.e),key(b,s.e));if(c==null)continue;if(c!==0)return s.d?-c:c}return 0})}
 if(Q.distinct){const seen=new Set();out=out.filter(o=>{const k=JSON.stringify(o);if(seen.has(k))return false;seen.add(k);return true})}
 if(Q.limit!=null)out=out.slice(0,Q.limit);
 return {cols,rows:out.map(o=>[...o])}}
/* ---------- Хариулт шалгах ---------- */
function sameRes(a,b,ord){if(a.rows.length!==b.rows.length||a.cols.length!==b.cols.length)return false;
 const nv=v=>v==null?'':typeof v==='boolean'?(v?'1':'0'):!isNaN(v)&&v!==''?String(Math.round(Number(v)*100)/100):String(v).trim().toLowerCase();
 const rowk=r=>[...r].map(nv).sort().join('|');const A=a.rows.map(rowk),B=b.rows.map(rowk);if(ord)return A.every((x,i)=>x===B[i]);return [...A].sort().join('\n')===[...B].sort().join('\n')}
/* ---------- UI ---------- */
let root,O={},S={tab:'table',tbl:null,view:'data',rec:0,qmode:'design',grid:null,sql:'',res:null,msg:'',task:null,rep:{src:'',grp:'',sum:'',title:''},tMsg:''};
const fmt=(v,t)=>v==null||v===''?'':t==='Тийм/Үгүй'?(v?'☑':'☐'):t==='Мөнгө'?Number(v).toLocaleString('en-US')+'₮':String(v);
const valOf=(raw,t)=>{if(t==='Тоо'||t==='Мөнгө'||t==='Автодугаар'){if(raw===''||raw==null)return null;const n=Number(String(raw).replace(/[,₮\s]/g,''));if(isNaN(n))throw err(`«${raw}» тоо биш байна`);return n}
 if(t==='Тийм/Үгүй')return raw===true||raw==='true'||raw==='1'||raw==='☑';if(t==='Огноо'){if(!raw)return null;const d=normDate(String(raw));if(!/^\d{4}-\d{2}-\d{2}$/.test(d))throw err(`«${raw}» огноо биш (ОООО-СС-ӨӨ)`);return d}return String(raw??'')};
function render(){const D=DB();const tabs=Object.keys(D.tables);if(!S.tbl||!D.tables[S.tbl])S.tbl=tabs[0];
 root.innerHTML=`<div class="dbl"><div class="dbl-top"><div class="dbl-brand"><span>🗄️</span><div><b>Өгөгдлийн сангийн лаборатори</b><small>Access маягийн · Хүснэгт, форм, асуулга, тайлан</small></div></div>
  <div class="dbl-dbs"><label>Өгөгдлийн сан</label><select class="dbl-db">${Object.entries(STORE.dbs).map(([k,d])=>`<option value="${k}" ${k===STORE.cur?'selected':''}>${esc(d.name)}</option>`).join('')}</select><button class="dbl-b ghost" data-a="newdb" title="Шинэ хоосон өгөгдлийн сан">＋ Шинэ</button><button class="dbl-b ghost" data-a="reset" title="Жишээ өгөгдлийг анхны байдалд">↺</button></div></div>
 <nav class="dbl-tabs">${[['table','📋 Хүснэгт'],['form','🧾 Форм'],['query','🔍 Асуулга'],['report','📄 Тайлан'],['tasks','🎯 Бодлого']].map(([k,t])=>`<button class="${S.tab===k?'on':''}" data-tab="${k}">${t}</button>`).join('')}</nav>
 <div class="dbl-body">${S.tab==='table'?tableUI(D):S.tab==='form'?formUI(D):S.tab==='query'?queryUI(D):S.tab==='report'?reportUI(D):tasksUI()}</div></div>`;bind()}
function tblPick(D,cls='dbl-tp'){return `<div class="dbl-tlist">${Object.keys(D.tables).map(n=>`<button class="${cls} ${n===S.tbl?'on':''}" data-t="${esc(n)}">▦ ${esc(n)} <small>${D.tables[n].rows.length}</small></button>`).join('')}${S.tab==='table'?'<button class="dbl-tp add" data-a="newtbl">＋ Хүснэгт</button>':''}</div>`}
function tableUI(D){const T=D.tables[S.tbl];
 return `${tblPick(D)}<div class="dbl-sub"><button class="${S.view==='data'?'on':''}" data-v="data">Өгөгдлийн харагдац (Datasheet)</button><button class="${S.view==='design'?'on':''}" data-v="design">Загварын харагдац (Design)</button></div>
 ${S.view==='design'?`<div class="dbl-scroll"><table class="dbl-grid"><thead><tr><th>🔑</th><th>Талбарын нэр (Field)</th><th>Өгөгдлийн төрөл (Data Type)</th><th></th></tr></thead><tbody>${T.fields.map((f,i)=>`<tr><td><input type="radio" name="pk" data-pk="${i}" ${f.pk?'checked':''} title="Үндсэн түлхүүр"></td><td><input class="dbl-in" data-fn="${i}" value="${esc(f.name)}"></td><td><select data-ft="${i}">${TYPES.map(t=>`<option ${t===f.type?'selected':''}>${t}</option>`).join('')}</select></td><td><button class="dbl-x" data-fdel="${i}" title="Талбар устгах">✕</button></td></tr>`).join('')}</tbody></table></div>
  <div class="dbl-row"><button class="dbl-b" data-a="addf">＋ Талбар нэмэх</button><button class="dbl-b ghost" data-a="deltbl">🗑 Хүснэгт устгах</button></div>
  <div class="dbl-note">🔑 <b>Үндсэн түлхүүр</b> (Primary Key) — бичлэг бүрийг давхардалгүй ялгах талбар. Өгөгдлийн төрөл нь талбарт ямар утга орохыг тодорхойлно: <b>Текст</b> — бичвэр, <b>Тоо</b>, <b>Мөнгө</b>, <b>Огноо</b>, <b>Тийм/Үгүй</b>, <b>Автодугаар</b> — автоматаар өсөх дугаар.</div>`
 :`<div class="dbl-scroll"><table class="dbl-grid data"><thead><tr><th></th>${T.fields.map(f=>`<th>${f.pk?'🔑 ':''}${esc(f.name)}<small>${f.type}</small></th>`).join('')}</tr></thead><tbody>${T.rows.map((r,i)=>`<tr><td><button class="dbl-x" data-rdel="${i}" title="Бичлэг устгах">✕</button></td>${T.fields.map(f=>`<td>${f.type==='Тийм/Үгүй'?`<input type="checkbox" data-cell="${i}|${esc(f.name)}" ${r[f.name]?'checked':''}>`:f.type==='Автодугаар'?`<span class="mut">${esc(r[f.name])}</span>`:`<input class="dbl-cell ${['Тоо','Мөнгө'].includes(f.type)?'num':''}" data-cell="${i}|${esc(f.name)}" value="${esc(r[f.name]??'')}" ${f.type==='Огноо'?'placeholder="ОООО-СС-ӨӨ"':''}>`}</td>`).join('')}</tr>`).join('')}
  <tr class="newrow"><td>✳</td>${T.fields.map(f=>`<td>${f.type==='Автодугаар'?'<span class="mut">(Авто)</span>':f.type==='Тийм/Үгүй'?`<input type="checkbox" data-new="${esc(f.name)}">`:`<input class="dbl-cell" data-new="${esc(f.name)}" placeholder="${esc(f.name)}">`}</td>`).join('')}</tr></tbody></table></div>
  <div class="dbl-row"><button class="dbl-b" data-a="addrow">＋ Бичлэг нэмэх</button><span class="dbl-msg">${esc(S.msg)}</span></div><p class="dbl-hint">Нүдэнд дарж засна. Мөр = <b>бичлэг</b> (Record), багана = <b>талбар</b> (Field). Нийт ${T.rows.length} бичлэг.</p>`}`}
function formUI(D){const T=D.tables[S.tbl],n=T.rows.length;S.rec=Math.max(0,Math.min(S.rec,n));const r=T.rows[S.rec]||{},isNew=S.rec>=n;
 return `${tblPick(D)}<div class="dbl-form"><div class="dbl-fhead">🧾 ${esc(S.tbl)} — оролтын форм</div>
 ${T.fields.map(f=>`<label class="dbl-ff"><span>${esc(f.name)}${f.pk?' 🔑':''}</span>${f.type==='Автодугаар'?`<input disabled value="${isNew?'(Авто)':esc(r[f.name])}">`:f.type==='Тийм/Үгүй'?`<input type="checkbox" data-ff="${esc(f.name)}" ${!isNew&&r[f.name]?'checked':''}>`:`<input data-ff="${esc(f.name)}" value="${isNew?'':esc(r[f.name]??'')}" ${f.type==='Огноо'?'type="date"':['Тоо','Мөнгө'].includes(f.type)?'inputmode="decimal"':''}>`}</label>`).join('')}
 <div class="dbl-nav"><button data-rec="0" title="Эхний">⏮</button><button data-rec="${S.rec-1}" ${S.rec<=0?'disabled':''}>◀</button><span>Бичлэг <b>${isNew?'шинэ':S.rec+1}</b> / ${n}</span><button data-rec="${S.rec+1}" ${S.rec>=n?'disabled':''}>▶</button><button data-rec="${n}" title="Шинэ бичлэг">✳</button></div>
 <div class="dbl-row" style="justify-content:center"><button class="dbl-b" data-a="fsave">💾 ${isNew?'Шинэ бичлэг хадгалах':'Өөрчлөлт хадгалах'}</button>${isNew?'':'<button class="dbl-b ghost" data-a="fdel">🗑 Устгах</button>'}</div><div class="dbl-msg" style="text-align:center">${esc(S.msg)}</div></div>
 <p class="dbl-hint"><b>Форм</b> — өгөгдлийг нэг нэг бичлэгээр харах, оруулах, засах хялбар интерфейс. Талбарын төрлөөс хамаарч буруу утгыг (жишээ нь тоон талбарт үсэг) хүлээж авахгүй.</p>`}
function gridInit(D){if(S.grid&&S.grid.db===STORE.cur)return;const t=Object.keys(D.tables)[0];S.grid={db:STORE.cur,tabs:[t],cols:[{f:'',sort:'',show:true,crit:'',tot:'Group By'},{f:'',sort:'',show:true,crit:'',tot:'Group By'},{f:'',sort:'',show:true,crit:'',tot:'Group By'}],totals:false}}
function gridSQL(D){const G=S.grid,used=G.cols.filter(c=>c.f);if(!used.length)return '';const multi=G.tabs.length>1;const fr=f=>{const [t,n]=f.split('|');return multi?`${br(t)}.${br(n)}`:br(n)};
 const br=s=>/^[A-Za-zА-Яа-яЁёӨөҮү_][A-Za-zА-Яа-яЁёӨөҮү_0-9]*$/.test(s)?s:`[${s}]`;
 const sel=used.filter(c=>c.show&&c.tot!=='Where').map(c=>{const x=fr(c.f);if(G.totals&&c.tot!=='Group By'){const fn={Sum:'SUM',Avg:'AVG',Count:'COUNT',Min:'MIN',Max:'MAX'}[c.tot];return `${fn}(${x}) AS ${br(c.tot+'_'+c.f.split('|')[1])}`}return x});
 let from=br(G.tabs[0]);for(let i=1;i<G.tabs.length;i++){const a=G.tabs[i],L=relFor(D,G.tabs.slice(0,i),a);from+=` INNER JOIN ${br(a)} ON ${L?`${br(L[0])}.${br(L[1])}=${br(a)}.${br(L[2])}`:'1=1'}`}
 const crit=c=>{let s=c.crit.trim();if(!s)return '';if(/^(=|<>|<|>|<=|>=|like |between |in |not |is )/i.test(s))return `${fr(c.f)} ${s}`;if(/^[-\d.]+$/.test(s)||/^(true|false)$/i.test(s))return `${fr(c.f)} = ${s}`;if(/^['"#]/.test(s))return `${fr(c.f)} = ${s}`;return `${fr(c.f)} = '${s.replace(/'/g,"''")}'`};
 const wh=used.filter(c=>c.crit.trim()&&(!G.totals||c.tot==='Group By'||c.tot==='Where')).map(crit),hv=G.totals?used.filter(c=>c.crit.trim()&&!['Group By','Where'].includes(c.tot)).map(c=>{const fn={Sum:'SUM',Avg:'AVG',Count:'COUNT',Min:'MIN',Max:'MAX'}[c.tot];return crit(c).replace(fr(c.f),`${fn}(${fr(c.f)})`)}):[];
 let q=`SELECT ${sel.join(', ')||'*'}\nFROM ${from}`;if(wh.length)q+=`\nWHERE ${wh.join(' AND ')}`;if(G.totals){const gb=used.filter(c=>c.tot==='Group By').map(c=>fr(c.f));if(gb.length)q+=`\nGROUP BY ${gb.join(', ')}`;if(hv.length)q+=`\nHAVING ${hv.join(' AND ')}`}
 const ob=used.filter(c=>c.sort).map(c=>{if(G.totals&&!['Group By','Where'].includes(c.tot)){const fn={Sum:'SUM',Avg:'AVG',Count:'COUNT',Min:'MIN',Max:'MAX'}[c.tot];return `${fn}(${fr(c.f)})${c.sort==='desc'?' DESC':''}`}return fr(c.f)+(c.sort==='desc'?' DESC':'')});if(ob.length)q+=`\nORDER BY ${ob.join(', ')}`;return q}
function relFor(D,have,t){const T=D.tables[t];for(const h of have){const H=D.tables[h];for(const f of T.fields)for(const g of H.fields){if(norm(f.name)===norm(g.name)&&(f.pk||g.pk))return [h,g.name,f.name]}}return null}
function queryUI(D){gridInit(D);const G=S.grid,allF=G.tabs.flatMap(t=>D.tables[t].fields.map(f=>t+'|'+f.name));
 const design=`<div class="dbl-qt"><b>Хүснэгтүүд:</b> ${Object.keys(D.tables).map(t=>`<label class="dbl-chk"><input type="checkbox" data-qt="${esc(t)}" ${G.tabs.includes(t)?'checked':''}> ${esc(t)}</label>`).join('')}<label class="dbl-chk tot"><input type="checkbox" data-a="totals" ${G.totals?'checked':''}> Σ Нийлбэр (Totals)</label></div>
 <div class="dbl-qtabs">${G.tabs.map(t=>`<div class="dbl-qbox"><b>${esc(t)}</b>${D.tables[t].fields.map(f=>`<button data-addf="${esc(t+'|'+f.name)}">${f.pk?'🔑':'•'} ${esc(f.name)}</button>`).join('')}</div>`).join('')}</div>
 <div class="dbl-scroll"><table class="dbl-qbe"><tbody>
  <tr><th>Талбар</th>${G.cols.map((c,i)=>`<td><select data-qf="${i}"><option value="">—</option>${allF.map(f=>`<option value="${esc(f)}" ${c.f===f?'selected':''}>${esc(G.tabs.length>1?f.replace('|','.'):f.split('|')[1])}</option>`).join('')}</select></td>`).join('')}<td rowspan="${G.totals?6:5}"><button class="dbl-b ghost" data-a="addcol" title="Багана нэмэх">＋</button></td></tr>
  ${G.totals?`<tr><th>Нийлбэр</th>${G.cols.map((c,i)=>`<td><select data-qtot="${i}">${['Group By','Sum','Avg','Count','Min','Max','Where'].map(t=>`<option ${c.tot===t?'selected':''}>${t}</option>`).join('')}</select></td>`).join('')}</tr>`:''}
  <tr><th>Эрэмбэ</th>${G.cols.map((c,i)=>`<td><select data-qs="${i}"><option value="">—</option><option value="asc" ${c.sort==='asc'?'selected':''}>Өсөхөөр</option><option value="desc" ${c.sort==='desc'?'selected':''}>Буурахаар</option></select></td>`).join('')}</tr>
  <tr><th>Харуулах</th>${G.cols.map((c,i)=>`<td style="text-align:center"><input type="checkbox" data-qsh="${i}" ${c.show?'checked':''}></td>`).join('')}</tr>
  <tr><th>Нөхцөл</th>${G.cols.map((c,i)=>`<td><input data-qc="${i}" value="${esc(c.crit)}" placeholder="жишээ: >100"></td>`).join('')}</tr></tbody></table></div>
 <pre class="dbl-sqlpre">${esc(gridSQL(D)||'-- Талбар сонгоно уу')}</pre>`;
 const sqlv=`<textarea class="dbl-sql" spellcheck="false" placeholder="SELECT Нэр, Үнэ FROM Ном WHERE Үнэ > 20000 ORDER BY Үнэ DESC">${esc(S.sql)}</textarea>
 <details class="dbl-help"><summary>📘 SQL товч заавар</summary><div><code>SELECT</code> талбарууд <code>FROM</code> хүснэгт <code>WHERE</code> нөхцөл <code>GROUP BY</code> бүлэглэх <code>HAVING</code> бүлгийн нөхцөл <code>ORDER BY</code> эрэмбэ <code>DESC</code>/<code>ASC</code><br>
  Нөхцөл: <code>=, &lt;&gt;, &lt;, &gt;, &lt;=, &gt;=</code>, <code>AND</code>, <code>OR</code>, <code>NOT</code>, <code>LIKE 'А%'</code> (эсвэл Access маягаар <code>Like "А*"</code>), <code>BETWEEN 10 AND 20</code>, <code>IN ('10А','10Б')</code>, <code>IS NULL</code><br>
  Функц: <code>COUNT(*)</code>, <code>SUM()</code>, <code>AVG()</code>, <code>MIN()</code>, <code>MAX()</code>; тооцоолсон талбар: <code>Тоо*Үнэ AS Дүн</code>; <code>TOP 3</code>; холболт: <code>INNER JOIN Хүснэгт2 ON А.ID=Б.ID</code>. Огноо: <code>'2026-10-01'</code> эсвэл <code>#2026-10-01#</code>.</div></details>`;
 return `${S.task?taskBanner():''}<div class="dbl-sub"><button class="${S.qmode==='design'?'on':''}" data-qm="design">🧩 Загвараар (Query Design)</button><button class="${S.qmode==='sql'?'on':''}" data-qm="sql">⌨️ SQL харагдац</button></div>
 ${S.qmode==='design'?design:sqlv}
 <div class="dbl-row"><button class="dbl-b run" data-a="run">▶ Ажиллуулах (Run)</button>${S.qmode==='design'?'<button class="dbl-b ghost" data-a="tosql">SQL болгож засах →</button>':''}${S.task?'<button class="dbl-b gold" data-a="check">✔ Хариулт шалгах</button>':''}<button class="dbl-b ghost" data-a="saveq">💾 Асуулга хадгалах</button></div>
 ${S.tMsg?`<div class="dbl-tmsg ${S.tMsg[0]}">${S.tMsg[1]}</div>`:''}
 ${S.msg?`<div class="dbl-err">⚠️ ${esc(S.msg)}</div>`:''}${S.res?resTable(S.res):''}
 ${Object.keys(D.queries).length?`<div class="dbl-saved"><b>Хадгалсан асуулгууд:</b> ${Object.keys(D.queries).map(n=>`<button class="dbl-tp" data-lq="${esc(n)}">🔍 ${esc(n)}</button>`).join('')}</div>`:''}`}
function resTable(R){return `<div class="dbl-res"><div class="dbl-rh">Үр дүн: <b>${R.rows.length}</b> бичлэг</div><div class="dbl-scroll"><table class="dbl-grid data"><thead><tr>${R.cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${R.rows.map(r=>`<tr>${r.map(v=>`<td>${typeof v==='boolean'?(v?'☑':'☐'):esc(typeof v==='number'?Math.round(v*100)/100:v)}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="${R.cols.length}" class="mut">Илэрц алга</td></tr>`}</tbody></table></div></div>`}
function reportUI(D){const R=S.rep;const srcs=[...Object.keys(D.tables).map(t=>'t:'+t),...Object.keys(D.queries).map(q=>'q:'+q)];if(!srcs.includes(R.src))R.src=srcs[0];
 let data=null,e='';try{data=R.src.startsWith('t:')?run(`SELECT * FROM [${R.src.slice(2)}]`):run(D.queries[R.src.slice(2)])}catch(x){e=x.message}
 const cols=data?data.cols:[];if(R.grp&&!cols.includes(R.grp))R.grp='';if(R.sum&&!cols.includes(R.sum))R.sum='';
 let body='';if(data){const gi=cols.indexOf(R.grp),si=cols.indexOf(R.sum);const groups=new Map();data.rows.forEach(r=>{const k=gi>=0?r[gi]:'';if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r)});
  const sumOf=rs=>si<0?null:rs.reduce((a,r)=>a+(Number(r[si])||0),0);const show=cols.filter((c,i)=>i!==gi);
  body=[...groups.entries()].sort((a,b)=>cmpv(a[0],b[0])).map(([k,rs])=>`${gi>=0?`<h4 class="dbl-rg">${esc(R.grp)}: ${esc(k)}</h4>`:''}<table class="dbl-rt"><thead><tr>${show.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rs.map(r=>`<tr>${r.map((v,i)=>i===gi?'':`<td>${esc(typeof v==='boolean'?(v?'Тийм':'Үгүй'):v)}</td>`).join('')}</tr>`).join('')}</tbody></table><div class="dbl-rs">Бичлэг: <b>${rs.length}</b>${si>=0?` · ${esc(R.sum)}-ийн нийлбэр: <b>${sumOf(rs).toLocaleString('en-US')}</b> · дундаж: <b>${Math.round(sumOf(rs)/rs.length*100)/100}</b>`:''}</div>`).join('')+`<div class="dbl-rtot">Нийт бичлэг: <b>${data.rows.length}</b>${si>=0?` · Нийт ${esc(R.sum)}: <b>${sumOf(data.rows).toLocaleString('en-US')}</b>`:''}</div>`}
 return `<div class="dbl-rcfg"><label>Эх сурвалж<select data-rp="src">${srcs.map(s=>`<option value="${esc(s)}" ${s===R.src?'selected':''}>${s.startsWith('t:')?'▦ '+esc(s.slice(2)):'🔍 '+esc(s.slice(2))}</option>`).join('')}</select></label><label>Бүлэглэх талбар<select data-rp="grp"><option value="">— бүлэглэхгүй —</option>${cols.map(c=>`<option ${c===R.grp?'selected':''}>${esc(c)}</option>`).join('')}</select></label><label>Нийлбэр бодох талбар<select data-rp="sum"><option value="">—</option>${cols.map(c=>`<option ${c===R.sum?'selected':''}>${esc(c)}</option>`).join('')}</select></label><label>Тайлангийн гарчиг<input data-rp="title" value="${esc(R.title)}" placeholder="${esc(D.name)}"></label></div>
 ${e?`<div class="dbl-err">⚠️ ${esc(e)}</div>`:`<div class="dbl-report" id="dblrep"><div class="dbl-rtitle">${esc(R.title||D.name)}</div><div class="dbl-rdate">${new Date().toISOString().slice(0,10)} · ${esc(R.src.slice(2))}</div>${body}</div>`}
 <div class="dbl-row"><button class="dbl-b" data-a="print">🖨 Тайлан хэвлэх</button></div><p class="dbl-hint"><b>Тайлан</b> (Report) — өгөгдлийг бүлэглэж, нийлбэр, дундаж тооцоолон хэвлэхэд бэлэн хэлбэрээр гаргана. Асуулгыг хадгалаад тайлангийн эх сурвалж болгож болно.</p>`}
function tasksUI(){const sol=O.solved||{};const by={lib:'📚 Номын сан',school:'🎓 Сурагчийн бүртгэл',shop:'🛒 Дэлгүүр'};const tot=TASKS.reduce((a,t)=>a+(sol[t.id]?PTS[t.lv]:0),0),mx=TASKS.reduce((a,t)=>a+PTS[t.lv],0);
 return `<div class="dbl-tsum"><div><b>Асуулгын бодлого</b><small>Бодлогоо сонгоод «Асуулга» хэсэгт загвараар эсвэл SQL-ээр бодож, «✔ Хариулт шалгах» дар. Хариултыг үр дүнгээр нь автоматаар шалгана.</small></div><div class="dbl-score">${tot}<small>/ ${mx} оноо</small></div></div>
 ${Object.entries(by).map(([db,n])=>`<h4 class="dbl-th">${n}</h4><div class="dbl-tasks">${TASKS.filter(t=>t.db===db).map(t=>`<button class="dbl-task ${sol[t.id]?'ok':''}" data-task="${t.id}"><span class="lv">${'★'.repeat(t.lv)}${'☆'.repeat(3-t.lv)}</span><span>${esc(t.t)}</span><b>${sol[t.id]?'✓ ':''}${PTS[t.lv]} оноо</b></button>`).join('')}</div>`).join('')}`}
function taskBanner(){const t=TASKS.find(x=>x.id===S.task);if(!t)return '';return `<div class="dbl-banner"><div><small>🎯 Бодлого · ${'★'.repeat(t.lv)} · ${PTS[t.lv]} оноо</small><b>${esc(t.t)}</b><details><summary>💡 Сануулга</summary>${esc(t.hint)}</details></div><button class="dbl-b ghost" data-a="untask">✕</button></div>`}
function bind(){const q=s=>root.querySelectorAll(s),D=DB();
 root.querySelector('.dbl-db').onchange=e=>{STORE.cur=e.target.value;S.tbl=null;S.res=null;S.msg='';S.grid=null;persist();render()};
 q('[data-tab]').forEach(b=>b.onclick=()=>{S.tab=b.dataset.tab;S.msg='';render()});q('[data-t]').forEach(b=>b.onclick=()=>{S.tbl=b.dataset.t;S.rec=0;S.msg='';render()});
 q('[data-v]').forEach(b=>b.onclick=()=>{S.view=b.dataset.v;render()});
 q('[data-a]').forEach(b=>{const a=b.dataset.a;if(b.type==='checkbox'){b.onchange=()=>act(a,b);return}b.onclick=()=>act(a,b)});
 /* загвар */
 q('[data-fn]').forEach(i=>i.onchange=()=>{const T=D.tables[S.tbl],f=T.fields[+i.dataset.fn],nn=i.value.trim();if(!nn||T.fields.some((g,j)=>j!=+i.dataset.fn&&norm(g.name)===norm(nn)))return render();T.rows.forEach(r=>{r[nn]=r[f.name];if(nn!==f.name)delete r[f.name]});f.name=nn;persist();render()});
 q('[data-ft]').forEach(s=>s.onchange=()=>{const T=D.tables[S.tbl],f=T.fields[+s.dataset.ft];f.type=s.value;T.rows.forEach(r=>{try{r[f.name]=valOf(r[f.name],f.type)}catch(e){r[f.name]=null}});persist();render()});
 q('[data-pk]').forEach(r=>r.onchange=()=>{D.tables[S.tbl].fields.forEach((f,i)=>f.pk=i===+r.dataset.pk);persist();render()});
 q('[data-fdel]').forEach(b=>b.onclick=()=>{const T=D.tables[S.tbl];if(T.fields.length<2)return;const f=T.fields.splice(+b.dataset.fdel,1)[0];T.rows.forEach(r=>delete r[f.name]);persist();render()});
 /* өгөгдөл */
 q('[data-cell]').forEach(i=>i.onchange=()=>{const [ri,fn]=i.dataset.cell.split('|'),T=D.tables[S.tbl],f=T.fields.find(x=>x.name===fn);try{T.rows[+ri][fn]=valOf(i.type==='checkbox'?i.checked:i.value,f.type);S.msg='';i.classList.remove('bad')}catch(e){S.msg=e.message;i.classList.add('bad');root.querySelector('.dbl-msg').textContent='⚠️ '+e.message;return}persist()});
 q('[data-rdel]').forEach(b=>b.onclick=()=>{D.tables[S.tbl].rows.splice(+b.dataset.rdel,1);persist();render()});
 q('[data-rec]').forEach(b=>b.onclick=()=>{S.rec=+b.dataset.rec;S.msg='';render()});
 /* асуулга */
 q('[data-qm]').forEach(b=>b.onclick=()=>{S.qmode=b.dataset.qm;render()});
 q('[data-qt]').forEach(c=>c.onchange=()=>{const G=S.grid,t=c.dataset.qt;if(c.checked)G.tabs.push(t);else{if(G.tabs.length<2){c.checked=true;return}G.tabs=G.tabs.filter(x=>x!==t);G.cols.forEach(x=>{if(x.f.startsWith(t+'|'))x.f=''})}render()});
 q('[data-addf]').forEach(b=>b.onclick=()=>{const G=S.grid;let c=G.cols.find(x=>!x.f);if(!c){c={f:'',sort:'',show:true,crit:'',tot:'Group By'};G.cols.push(c)}c.f=b.dataset.addf;render()});
 const upd=()=>{const p=root.querySelector('.dbl-sqlpre');if(p)p.textContent=gridSQL(D)||'-- Талбар сонгоно уу'};
 q('[data-qf]').forEach(s=>s.onchange=()=>{S.grid.cols[+s.dataset.qf].f=s.value;upd()});q('[data-qs]').forEach(s=>s.onchange=()=>{S.grid.cols[+s.dataset.qs].sort=s.value;upd()});
 q('[data-qsh]').forEach(s=>s.onchange=()=>{S.grid.cols[+s.dataset.qsh].show=s.checked;upd()});q('[data-qc]').forEach(s=>s.oninput=()=>{S.grid.cols[+s.dataset.qc].crit=s.value;upd()});
 q('[data-qtot]').forEach(s=>s.onchange=()=>{S.grid.cols[+s.dataset.qtot].tot=s.value;upd()});
 const ta=root.querySelector('.dbl-sql');if(ta){ta.oninput=()=>S.sql=ta.value;ta.onkeydown=e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();act('run')}}}
 q('[data-lq]').forEach(b=>b.onclick=()=>{S.qmode='sql';S.sql=D.queries[b.dataset.lq];act('run')});
 q('[data-task]').forEach(b=>b.onclick=()=>{const t=TASKS.find(x=>x.id===b.dataset.task);STORE.cur=t.db;S.task=t.id;S.tab='query';S.res=null;S.msg='';S.tMsg='';S.grid=null;persist();render()});
 q('[data-rp]').forEach(i=>i[i.tagName==='INPUT'?'oninput':'onchange']=()=>{S.rep[i.dataset.rp]=i.value;if(i.tagName!=='INPUT')render();else{const t=root.querySelector('.dbl-rtitle');if(t)t.textContent=i.value||D.name}})}
function curSQL(){return S.qmode==='design'?gridSQL(DB()):S.sql}
function act(a,b){const D=DB(),T=D.tables[S.tbl];
 if(a==='reset'){if(!confirm('Энэ өгөгдлийн санг анхны жишээ байдалд буцаах уу?'))return;if(SAMPLES[STORE.cur])STORE.dbs[STORE.cur]=fresh(STORE.cur);persist();S.res=null;render()}
 if(a==='newdb'){const n=prompt('Шинэ өгөгдлийн сангийн нэр:','Миний өгөгдлийн сан');if(!n)return;const k='u'+Date.now().toString(36);STORE.dbs[k]={name:n.slice(0,40),tables:{'Хүснэгт1':{fields:[{name:'ID',type:'Автодугаар',pk:true},{name:'Нэр',type:'Текст'}],rows:[]}},queries:{}};STORE.cur=k;S.tbl=null;S.tab='table';S.view='design';persist();render()}
 if(a==='newtbl'){const n=prompt('Хүснэгтийн нэр:','Хүснэгт'+(Object.keys(D.tables).length+1));if(!n)return;if(D.tables[n])return alert('Ийм нэртэй хүснэгт байна');D.tables[n]={fields:[{name:'ID',type:'Автодугаар',pk:true},{name:'Нэр',type:'Текст'}],rows:[]};S.tbl=n;S.view='design';persist();render()}
 if(a==='deltbl'){if(Object.keys(D.tables).length<2)return alert('Сүүлийн хүснэгтийг устгах боломжгүй');if(!confirm(`«${S.tbl}» хүснэгтийг устгах уу?`))return;delete D.tables[S.tbl];S.tbl=null;persist();render()}
 if(a==='addf'){let i=T.fields.length+1;while(T.fields.some(f=>f.name==='Талбар'+i))i++;T.fields.push({name:'Талбар'+i,type:'Текст'});persist();render()}
 if(a==='addrow'||a==='fsave'){const isForm=a==='fsave',isNew=!isForm||S.rec>=T.rows.length;const r=isNew?{}:{...T.rows[S.rec]};
  try{for(const f of T.fields){if(f.type==='Автодугаар'){if(isNew)r[f.name]=Math.max(0,...T.rows.map(x=>Number(x[f.name])||0))+1;continue}const el=root.querySelector(`[data-${isForm?'ff':'new'}="${CSS.escape(f.name)}"]`);if(!el)continue;r[f.name]=valOf(el.type==='checkbox'?el.checked:el.value,f.type)}
   const pk=T.fields.find(f=>f.pk);if(pk&&T.rows.some((x,i)=>(isNew||i!==S.rec)&&String(x[pk.name])===String(r[pk.name])))throw err(`Үндсэн түлхүүр «${pk.name}» давхардаж байна`);
   if(isNew){T.rows.push(r);if(isForm)S.rec=T.rows.length}else T.rows[S.rec]=r;S.msg=isNew?'✓ Бичлэг нэмэгдлээ':'✓ Хадгаллаа';persist();render()}catch(e){S.msg='⚠️ '+e.message;render()}}
 if(a==='fdel'){T.rows.splice(S.rec,1);S.msg='Бичлэг устлаа';persist();render()}
 if(a==='totals'){S.grid.totals=b.checked;render()}
 if(a==='addcol'){S.grid.cols.push({f:'',sort:'',show:true,crit:'',tot:'Group By'});render()}
 if(a==='tosql'){S.sql=gridSQL(D);S.qmode='sql';render()}
 if(a==='run'){const sql=curSQL();S.tMsg='';if(!sql.trim()){S.msg='Асуулга хоосон байна';S.res=null;return render()}try{S.res=run(sql);S.msg=''}catch(e){S.msg=e.sql?e.message:'Асуулга буруу: '+e.message;S.res=null}render()}
 if(a==='check'){const t=TASKS.find(x=>x.id===S.task);const sql=curSQL();try{const base=fresh(t.db),mine=run(sql,base),exp=run(t.sql,base);S.res=mine;S.msg='';
   if(sameRes(mine,exp,t.ord)){S.tMsg=['ok',`🎉 Зөв! +${PTS[t.lv]} оноо. Таны асуулга ${mine.rows.length} бичлэг зөв гаргалаа.`];if(O.onSolve)O.onSolve(t.id,PTS[t.lv]);O.solved=O.solved||{};O.solved[t.id]=true}
   else S.tMsg=['no',`✗ Үр дүн таарахгүй байна. Хүлээгдэж буй: <b>${exp.rows.length}</b> бичлэг, <b>${exp.cols.length}</b> багана (${exp.cols.map(esc).join(', ')}). Таных: ${mine.rows.length} бичлэг, ${mine.cols.length} багана.${t.ord?' Эрэмбэ ч чухал.':''}`]}catch(e){S.msg=e.message;S.res=null;S.tMsg=''}render()}
 if(a==='untask'){S.task=null;S.tMsg='';render()}
 if(a==='saveq'){const sql=curSQL();if(!sql.trim())return;try{run(sql)}catch(e){S.msg=e.message;return render()}const n=prompt('Асуулгын нэр:','Асуулга'+(Object.keys(D.queries).length+1));if(!n)return;D.queries[n]=sql;persist();S.msg='';render()}
 if(a==='print'){const h=root.querySelector('#dblrep');if(!h)return;const w=window.open('','_blank');if(!w)return alert('Цонх нээх зөвшөөрөл өгнө үү');w.document.write(`<html><head><meta charset="utf-8"><title>Тайлан</title><style>body{font-family:Georgia,serif;padding:24px;color:#14213d}table{border-collapse:collapse;width:100%;margin:6px 0}th,td{border:1px solid #c9c2b0;padding:5px 8px;text-align:left}th{background:#f1ebdd}.dbl-rtitle{font-size:26px;font-weight:700;border-bottom:3px double #14213d;padding-bottom:6px}.dbl-rdate{color:#666;margin:4px 0 12px}.dbl-rg{margin:14px 0 2px}.dbl-rs,.dbl-rtot{font-size:14px;margin:4px 0}.dbl-rtot{font-weight:700;border-top:2px solid #14213d;padding-top:6px}</style></head><body>${h.innerHTML}</body></html>`);w.document.close();w.focus();w.print()}}
/* ---------- CSS ---------- */
const css=document.createElement('style');css.textContent=`
.dbl{--dn:#14213d;--dg:#b08d3a;--dl:#e6dfcf;font-family:inherit;color:#1d2433;background:#fffdf8;border:1px solid var(--dl);border-radius:14px;overflow:hidden}
.dbl-top{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 14px;background:linear-gradient(135deg,#14213d,#243b6b);color:#fff}
.dbl-brand{display:flex;gap:10px;align-items:center}.dbl-brand span{font-size:28px}.dbl-brand small{display:block;opacity:.8;font-size:12px}
.dbl-dbs{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.dbl-dbs label{font-size:12px;opacity:.85}.dbl-dbs select{min-height:34px;padding:4px 8px;border-radius:8px;border:0;max-width:220px}
.dbl-b{min-height:36px;padding:6px 12px;border-radius:9px;border:1.5px solid var(--dn);background:var(--dn);color:#fff;font-weight:700;cursor:pointer;font-size:14px}
.dbl-b.ghost{background:#fff;color:var(--dn)}.dbl-top .dbl-b.ghost{background:transparent;color:#fff;border-color:#ffffff88}.dbl-b.run{background:#2b6e4f;border-color:#2b6e4f}.dbl-b.gold{background:var(--dg);border-color:var(--dg)}
.dbl-tabs{display:flex;overflow-x:auto;background:#f4efe3;border-bottom:1px solid var(--dl)}.dbl-tabs button{flex:none;border:0;background:transparent;padding:10px 14px;font-weight:700;color:#4a5470;cursor:pointer;border-bottom:3px solid transparent;min-height:44px}.dbl-tabs button.on{color:var(--dn);border-bottom-color:var(--dg);background:#fffdf8}
.dbl-body{padding:12px 14px}.dbl-tlist{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
.dbl-tp{border:1.5px solid var(--dl);background:#fff;border-radius:9px;padding:6px 10px;font-weight:700;color:var(--dn);cursor:pointer;min-height:36px}.dbl-tp.on{background:var(--dn);color:#fff;border-color:var(--dn)}.dbl-tp small{opacity:.6;font-weight:600}.dbl-tp.add{border-style:dashed}
.dbl-sub{display:flex;gap:6px;margin:0 0 10px;flex-wrap:wrap}.dbl-sub button{border:1.5px solid var(--dl);background:#fff;border-radius:999px;padding:6px 12px;font-weight:700;font-size:13px;cursor:pointer;color:#4a5470;min-height:34px}.dbl-sub button.on{border-color:var(--dg);color:var(--dn);background:#fbf4e2}
.dbl-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid var(--dl);border-radius:10px;background:#fff}
.dbl-grid{border-collapse:collapse;min-width:100%;font-size:14px}.dbl-grid th{background:#f4efe3;color:var(--dn);text-align:left;padding:6px 8px;border-bottom:1px solid var(--dl);white-space:nowrap;font-size:13px}.dbl-grid th small{display:block;font-weight:600;color:#8a8270;font-size:11px}
.dbl-grid td{border-bottom:1px solid #f0ebe0;padding:2px 4px;white-space:nowrap}.dbl-grid.data tr:nth-child(even) td{background:#fcfaf4}
.dbl-cell,.dbl-in{border:1px solid transparent;background:transparent;padding:5px 6px;min-height:32px;width:100%;min-width:90px;font:inherit;border-radius:6px;color:inherit}.dbl-cell:focus,.dbl-in:focus{border-color:var(--dg);background:#fff;outline:none}.dbl-cell.num{text-align:right}.dbl-cell.bad{border-color:#c92a2a;background:#fff0f0}
.dbl-in{border-color:var(--dl);background:#fff}.dbl-grid select{min-height:32px;padding:3px 6px;border-radius:6px;border:1px solid var(--dl);font:inherit}
.dbl-x{border:0;background:transparent;color:#b0413e;cursor:pointer;font-weight:900;min-height:30px;min-width:30px}
.newrow td{background:#fbf4e2!important}.dbl-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:10px 0}.dbl-msg{font-weight:700;color:#2b6e4f}
.dbl-hint,.dbl-note{font-size:13px;color:#5b6276;margin:6px 0}.dbl-note{background:#f4efe3;border-left:4px solid var(--dg);border-radius:8px;padding:8px 12px}
.dbl-form{max-width:520px;margin:0 auto;border:1px solid var(--dl);border-radius:14px;padding:14px;background:#fff;box-shadow:0 8px 24px rgba(20,33,61,.08)}.dbl-fhead{font-weight:800;color:var(--dn);border-bottom:2px solid var(--dg);padding-bottom:6px;margin-bottom:10px}
.dbl-ff{display:grid;grid-template-columns:130px 1fr;gap:8px;align-items:center;margin:6px 0}.dbl-ff span{font-weight:700;font-size:14px;color:#3b4560}.dbl-ff input{min-height:38px;border:1px solid var(--dl);border-radius:8px;padding:6px 8px;font:inherit}.dbl-ff input[type=checkbox]{width:22px;min-height:22px}
@media(max-width:520px){.dbl-ff{grid-template-columns:1fr}}
.dbl-nav{display:flex;gap:6px;justify-content:center;align-items:center;margin:12px 0}.dbl-nav button{min-width:40px;min-height:38px;border:1px solid var(--dl);background:#fff;border-radius:8px;cursor:pointer;font-size:15px}
.dbl-qt{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:8px;font-size:14px}.dbl-chk{display:inline-flex!important;gap:5px;align-items:center;margin:0!important;font-weight:600}.dbl-chk input{width:18px;min-height:18px}.dbl-chk.tot{margin-left:auto!important;color:var(--dg);font-weight:800}
.dbl-qtabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px}.dbl-qbox{border:1.5px solid var(--dn);border-radius:10px;background:#fff;min-width:150px;overflow:hidden}.dbl-qbox b{display:block;background:var(--dn);color:#fff;padding:5px 10px;font-size:13px}.dbl-qbox button{display:block;width:100%;text-align:left;border:0;background:#fff;padding:5px 10px;font-size:13px;cursor:pointer;border-bottom:1px solid #f0ebe0}.dbl-qbox button:hover{background:#fbf4e2}
.dbl-qbe{border-collapse:collapse;font-size:13px}.dbl-qbe th{background:#f4efe3;text-align:right;padding:4px 8px;white-space:nowrap;color:var(--dn)}.dbl-qbe td{border:1px solid #efe8d8;padding:3px;min-width:140px}.dbl-qbe select,.dbl-qbe input:not([type=checkbox]){width:100%;min-height:32px;border:1px solid var(--dl);border-radius:6px;padding:3px 6px;font:inherit}
.dbl-sqlpre{background:#14213d;color:#f3e3b8;border-radius:10px;padding:10px 12px;font:13px/1.5 "PT Mono",monospace;white-space:pre-wrap;margin:8px 0;overflow-x:auto}
.dbl-sql{width:100%;min-height:140px;font:14px/1.5 "PT Mono",monospace;border:1.5px solid var(--dn);border-radius:10px;padding:10px;background:#14213d;color:#f8f3e6;resize:vertical}
.dbl-help{margin:6px 0;font-size:13px}.dbl-help summary{cursor:pointer;font-weight:700;color:var(--dn)}.dbl-help code{background:#f4efe3;border-radius:4px;padding:0 4px}
.dbl-err{background:#fff0f0;border:1px solid #f1b2b2;color:#9b1c1c;border-radius:10px;padding:8px 12px;margin:8px 0;font-weight:600}
.dbl-res{margin-top:10px}.dbl-rh{font-size:13px;margin-bottom:4px;color:#3b4560}
.dbl-saved{margin-top:12px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;font-size:14px}
.dbl-tmsg{border-radius:10px;padding:10px 12px;margin:8px 0;font-weight:700}.dbl-tmsg.ok{background:#e6f4ea;color:#1d5e3a;border:1px solid #9fd3b2}.dbl-tmsg.no{background:#fff6e5;color:#7a4a00;border:1px solid #f0cf8a}
.dbl-banner{display:flex;gap:10px;justify-content:space-between;align-items:flex-start;background:#fbf4e2;border:1.5px solid var(--dg);border-radius:12px;padding:10px 12px;margin-bottom:10px}.dbl-banner small{color:#8a6a1a;font-weight:700}.dbl-banner b{display:block;color:var(--dn)}.dbl-banner details{font-size:13px;margin-top:4px}
.dbl-tsum{display:flex;justify-content:space-between;gap:12px;align-items:center;background:#14213d;color:#fff;border-radius:12px;padding:12px 14px}.dbl-tsum small{display:block;opacity:.85;font-size:13px}.dbl-score{font-size:34px;font-weight:900;color:#f3d27a;white-space:nowrap}.dbl-score small{font-size:13px;color:#fff;display:inline}
.dbl-th{margin:14px 0 6px;color:var(--dn)}.dbl-tasks{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px}
.dbl-task{display:flex;flex-direction:column;gap:4px;text-align:left;border:1.5px solid var(--dl);background:#fff;border-radius:12px;padding:10px 12px;cursor:pointer;font:inherit;color:#1d2433}.dbl-task .lv{color:var(--dg);letter-spacing:2px}.dbl-task b{font-size:13px;color:var(--dn)}.dbl-task.ok{border-color:#2b6e4f;background:#eef8f1}.dbl-task:hover{border-color:var(--dg)}
.dbl-rcfg{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;margin-bottom:10px}.dbl-rcfg label{font-size:13px;font-weight:700;color:#3b4560;display:flex;flex-direction:column;gap:3px}.dbl-rcfg select,.dbl-rcfg input{min-height:36px;border:1px solid var(--dl);border-radius:8px;padding:4px 8px;font:inherit}
.dbl-report{background:#fff;border:1px solid var(--dl);border-radius:10px;padding:16px;font-family:Georgia,'PT Serif',serif;overflow-x:auto}.dbl-rtitle{font-size:24px;font-weight:700;color:var(--dn);border-bottom:3px double var(--dn);padding-bottom:6px}.dbl-rdate{color:#777;font-size:13px;margin:4px 0 10px}
.dbl-rg{margin:12px 0 4px;color:var(--dg)}.dbl-rt{border-collapse:collapse;width:100%;font-size:14px}.dbl-rt th,.dbl-rt td{border-bottom:1px solid #eee5d2;padding:4px 8px;text-align:left}.dbl-rt th{color:var(--dn)}.dbl-rs{font-size:13px;color:#555;margin:4px 0}.dbl-rtot{margin-top:10px;border-top:2px solid var(--dn);padding-top:6px;font-weight:700}
`;document.head.appendChild(css);
window.DbLab={mount(el,o={}){root=el;O=o;loadStore();if(o.task){const t=TASKS.find(x=>x.id===o.task);if(t){STORE.cur=t.db;S.task=t.id;S.tab='query'}}if(o.tab)S.tab=o.tab;render()},run:(sql,k)=>run(sql,k?fresh(k):DB()),TASKS,PTS,_parse:parse};
})();
