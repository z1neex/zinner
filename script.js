const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rnd=n=>Math.floor(Math.random()*n);
let P,page='home',D={},shopKind='avatar';
function toast(m,bad){const t=$('#toast');t.textContent=m;t.className='show'+(bad?' bad':'');clearTimeout(toast.t);toast.t=setTimeout(()=>t.className='',2600)}
const av=(p,s='')=>`<div class="av ${esc(p.frame||'')} ${s}">${esc(p.avatar)}</div>`;
function modal(h){$('#mb').innerHTML=h;$('#modal').hidden=false;return $('#mb')}
function closeModal(){$('#modal').hidden=true;$('#mb').innerHTML='';render()}
$('#mx').onclick=closeModal;

/* ---------- Игры: run(контейнер, done(очки, текст)) ---------- */
const quiz=(b,n,gen,m,done)=>{let i=0,ok=0,ans;
b.insertAdjacentHTML('beforeend','<p id=q class=q></p><input id=a type=number inputmode=numeric placeholder="Ответ"><div class=row style="justify-content:center"><button class=btn id=s>Ответить</button></div>');
const q=$('#q',b),a=$('#a',b),nx=()=>{const g=gen();ans=g[1];q.textContent=`${g[0]}  (${i+1}/${n})`;a.value='';a.focus()};
const sub=()=>{if(a.value==='')return;if(+a.value===ans)ok++;i++;if(i==n)return done(ok*m,`Верно: ${ok} из ${n}`);nx()};
$('#s',b).onclick=sub;a.onkeydown=e=>e.key=='Enter'&&sub();nx()};
const GM={
clicker:{i:'👆',t:'Кликер',d:'Жми как можно быстрее 10 секунд',run(b,done){let n=0,t=10,iv;
b.innerHTML='<p>Осталось: <b id=t>10</b> с</p><button class="btn big" id=c>КЛИК!</button><p>Клики: <b id=n>0</b></p>';
$('#c',b).onclick=e=>{n++;$('#n',b).textContent=n;if(!iv)iv=setInterval(()=>{t--;$('#t',b).textContent=t;if(t<=0){clearInterval(iv);e.target.disabled=true;done(n,`Кликов: ${n}`)}},1000)}}},
reaction:{i:'⚡',t:'Реакция',d:'3 раунда: жми, когда экран станет зелёным',run(b,done){let r=0,sum=0,st,to,ms=[];
b.innerHTML='<div class=pad id=p></div><p id=i class=mut style="margin-top:10px"></p>';const p=$('#p',b),i=$('#i',b);
const nx=()=>{p.className='pad wait';p.textContent='Жди зелёного...';to=setTimeout(()=>{p.className='pad go';p.textContent='ЖМИ!';st=performance.now()},1000+Math.random()*2500)};
p.onclick=()=>{if(p.classList.contains('go')){const t=Math.round(performance.now()-st);ms.push(t);sum+=Math.max(0,Math.round((600-t)/6*1));r++;i.textContent=`Раунд ${r}: ${t} мс`;p.className='pad';p.textContent=t+' мс';
if(r==3){p.onclick=null;return done(sum,`Среднее: ${Math.round(ms.reduce((a,c)=>a+c)/3)} мс`)}setTimeout(nx,800)}
else if(p.classList.contains('wait')){clearTimeout(to);i.textContent='Слишком рано! Ещё раз';nx()}};nx()}},
guess:{i:'🎯',t:'Угадай число',d:'Число от 1 до 100, 7 попыток',run(b,done){const x=1+rnd(100);let a=0;
b.innerHTML='<p>Загадано число от 1 до 100</p><input id=g type=number inputmode=numeric placeholder="Твой вариант"><div class=row style="justify-content:center"><button class=btn id=ok>Проверить</button></div><p id=m class=mut style="margin-top:10px"></p>';
const g=$('#g',b),m=$('#m',b),go=()=>{const v=+g.value;if(!g.value)return;a++;if(v==x)return done((8-a)*15,`Угадано за ${a} поп.`);if(a>=7)return done(0,`Не вышло. Было ${x}`);m.textContent=(v<x?'Больше ⬆️':'Меньше ⬇️')+` · осталось попыток: ${7-a}`;g.value='';g.focus()};
$('#ok',b).onclick=go;g.onkeydown=e=>e.key=='Enter'&&go()}},
memory:{i:'🧠',t:'Память',d:'Найди все пары за минимум ходов',run(b,done){const e=['🔥','⚡','💎','🎯','🚀','👾','🌙','🧪'];const cs=[...e,...e].sort(()=>Math.random()-.5);let open=[],found=0,moves=0;
b.innerHTML='<p>Ходы: <b id=mv>0</b></p><div class=mem></div>';const gr=$('.mem',b);
cs.forEach(c=>{const d=document.createElement('button');d.textContent='?';d.onclick=()=>{if(open.length>1||d.classList.contains('on'))return;d.classList.add('on');d.textContent=c;open.push(d);
if(open.length==2){moves++;$('#mv',b).textContent=moves;const[x,y]=open;if(x.textContent==y.textContent){open=[];if(++found==8)setTimeout(()=>done(Math.max(10,150-moves*5),`Ходов: ${moves}`),500)}
else setTimeout(()=>{open.forEach(z=>{z.classList.remove('on');z.textContent='?'});open=[]},700)}};gr.append(d)})}},
math:{i:'➗',t:'Математика',d:'10 примеров — реши как можно больше верно',run(b,done){
quiz(b,10,()=>{const a=1+rnd(12),c=1+rnd(12),o=rnd(3);return o==0?[`${a} + ${c}`,a+c]:o==1?[`${a+c} − ${c}`,a]:[`${a} × ${c}`,a*c]},10,done)}},
seq:{i:'🔢',t:'Последовательность',d:'Продолжи ряд чисел (5 рядов)',run(b,done){
quiz(b,5,()=>{const t=rnd(4),s=1+rnd(9),d=2+rnd(6),r=2+rnd(2);let a;
if(t==0)a=[0,1,2,3,4,5].map(k=>s+d*k);else if(t==1)a=[0,1,2,3,4,5].map(k=>s*r**k);else if(t==2)a=[0,1,2,3,4,5].map(k=>(s+k)**2);else{a=[s,d];while(a.length<6)a.push(a[a.length-1]+a[a.length-2])}
return[a.slice(0,5).join(', ')+', ?',a[5]]},20,done)}}};
function playGame(id){const g=GM[id];modal(`<h2>${g.i} ${g.t}</h2><p class=mut>${g.d}</p><div id=gb></div>`);const box=$('#gb');
g.run(box,async(score,info)=>{box.innerHTML='<p class=mut>Сохраняю результат...</p>';
try{const r=await API.rpc('submit_score',{g:id,score});await refresh(true);
box.innerHTML=`<div class=big2>${esc(info)}</div><div>Очки: <b>${score}</b></div><div class=gain>+${r} V</div><div class=row style="justify-content:center"><button class=btn id=again>Играть ещё</button><button class="btn ghost" id=cl>Закрыть</button></div>`;
$('#again').onclick=()=>playGame(id);$('#cl').onclick=closeModal}catch(e){box.innerHTML=`<p class=err>${esc(e.message)}</p><button class="btn ghost" id=cl>Закрыть</button>`;$('#cl').onclick=closeModal}})}

/* ---------- Страницы ---------- */
const gcards=l=>`<div class=grid>${l.filter(g=>GM[g.id]).map(g=>`<button class=gcard data-act=play data-v=${g.id}><span class=gi>${GM[g.id].i}</span><b>${GM[g.id].t}</b><small>${GM[g.id].d}</small><em>до ${g.max_reward} V</em></button>`).join('')}</div>`;
const ACH=[['🎮','Первая игра',p=>p.stats.played>=1],['🔟','10 игр',p=>p.stats.played>=10],['💯','50 игр',p=>p.stats.played>=50],['💰','500 V на балансе',p=>p.coins>=500],['🛍️','Коллекционер (8 вещей)',p=>p.owned.length>=8],['🏅','Рекорды во всех играх',p=>Object.keys(p.stats.best).length>=6]];
const PAGES={
home(){const en=D.games.filter(g=>g.enabled);return `<div class=hero><div class=mut>Привет, ${esc(P.nick)} ${esc(P.badge||'')}</div><div class=v>${P.coins} V</div><div class=mut>Играй, выполняй задания, прокачивай профиль</div></div>
<div class=stats><div class=stat><b>${P.stats.played}</b>игр</div><div class=stat><b>${P.stats.earned}</b>заработано V</div><div class=stat><b>${Object.keys(P.stats.best).length}</b>рекордов</div></div>
<h3>🔥 Популярные игры</h3>${gcards(en.slice(0,3))}<div class=row><button class="btn ghost" data-act=go data-v=games>Все игры</button><button class="btn ghost" data-act=go data-v=quests>Задания дня</button></div>`},
games(){return `<h2>🎮 Игры</h2>${gcards(D.games.filter(g=>g.enabled))}`},
async rank(){const L=(await API.leaders()).sort((a,b)=>b.stats.earned-a.stats.earned).slice(0,20);
return `<h2>🏆 Рейтинг</h2><p class=mut small>По заработанным V за всё время</p><div class=list>${L.map((u,i)=>`<div class="row2 ${u.nick==P.nick?'me':''}"><span class=pos>${['🥇','🥈','🥉'][i]||i+1}</span>${av(u,'sm')}<b>${esc(u.nick)} ${esc(u.badge||'')}</b><span class=v>${u.stats.earned} V</span></div>`).join('')}</div>`},
shop(){const K={avatar:'Аватары',frame:'Рамки',badge:'Значки',theme:'Оформление'};
const pv=it=>it.kind=='avatar'?`<div class=av>${it.value}</div>`:it.kind=='frame'?`<div class="av ${it.value}">🙂</div>`:it.kind=='badge'?`<span>${it.value||'—'}</span>`:`<div class=sw data-theme=${it.value}></div>`;
return `<h2>🛒 Магазин</h2><div class=tabs>${Object.keys(K).map(k=>`<button class="btn ${k==shopKind?'':'ghost'} sm" data-act=kind data-v=${k}>${K[k]}</button>`).join('')}</div>
<div class=grid>${D.items.filter(i=>i.kind==shopKind).map(it=>{const own=P.owned.includes(it.id),eq=P[it.kind]==it.value;
return `<div class="card item"><div class=pv>${pv(it)}</div><b>${esc(it.name)}</b>${own?`<button class="btn sm ${eq?'ghost':''}" data-act=equip data-v=${it.id} ${eq?'disabled':''}>${eq?'Надето':'Надеть'}</button>`:`<button class="btn sm" data-act=buy data-v=${it.id}>Купить · ${it.price} V</button>`}</div>`}).join('')}</div>`},
async quests(){const pr=await API.progress();return `<h2>📅 Задания дня</h2><p class=mut>Обновляются каждый день</p><div class=list>${D.quests.filter(q=>q.active).map(q=>{
const x=pr.find(z=>z.quest_id==q.id)||{progress:0,claimed:false},p=Math.min(x.progress,q.target),ready=x.progress>=q.target&&!x.claimed;
return `<div class=card><div class=row2 style="border:0;padding:0;background:none"><b>${esc(q.title)}</b><span class=v>+${q.reward} V</span></div><div class=bar><i style="width:${p/q.target*100}%"></i></div><div class=row2 style="border:0;padding:0;background:none"><span class=mut>${p} / ${q.target}</span>${x.claimed?'<span>✅ Получено</span>':`<button class="btn sm" data-act=claim data-v=${q.id} ${ready?'':'disabled'}>Забрать награду</button>`}</div></div>`}).join('')||'<p class=mut>Сегодня заданий нет.</p>'}</div>`},
profile(){return `<div class=row2 style="padding:18px">${av(P,'lg')}<div><h2 style="margin:0">${esc(P.nick)} ${esc(P.badge||'')}</h2><div class=mut>${P.coins} V · ${P.owned.length} предметов</div></div></div>
<h3>Статистика</h3><div class=stats><div class=stat><b>${P.stats.played}</b>игр</div><div class=stat><b>${P.stats.earned}</b>заработано</div><div class=stat><b>${P.coins}</b>баланс</div></div>
<h3>Рекорды</h3><div class=grid>${Object.keys(GM).map(k=>`<div class=card>${GM[k].i} ${GM[k].t}<br><b class=v>${P.stats.best[k]||'—'}</b></div>`).join('')}</div>
<h3>Достижения</h3><div class=grid>${ACH.map(a=>`<div class="ach ${a[2](P)?'ok':''}"><span>${a[0]}</span>${a[1]}</div>`).join('')}</div>
<div class=row><button class="btn ghost" data-act=logout>Выйти</button></div>`}};
const ACT={
play:id=>playGame(id),go:p=>go(p),kind:k=>{shopKind=k;render()},
async buy(i){await run(()=>API.rpc('buy_item',{i}),'Куплено!')},async equip(i){await run(()=>API.rpc('equip_item',{i}),'Надето')},
async claim(q){await run(async()=>{const r=await API.rpc('claim_quest',{q});toast(`+${r} V`)})},
async logout(){await API.signOut();location.reload()}};
async function run(f,msg){try{await f();if(msg)toast(msg);await refresh()}catch(e){toast(e.message,true)}}

/* ---------- Ядро ---------- */
function applyTheme(){document.body.dataset.theme=P.theme||'violet'}
function head(pop){const b=$('#bal'),o=b.textContent;b.textContent=P.coins;if(pop&&o!=P.coins){b.parentNode.classList.add('pop');setTimeout(()=>b.parentNode.classList.remove('pop'),600)}}
async function refresh(noRender){const p=await API.me();if(!p||p.banned){await API.signOut();return location.reload()}P=p;applyTheme();head(true);if(!noRender)render()}
async function render(){$$('#nav [data-go]').forEach(b=>b.classList.toggle('on',b.dataset.go==page));
try{[D.games,D.quests,D.items]=await Promise.all([API.tbl('games'),API.tbl('quests'),API.tbl('items')]);$('#view').innerHTML=await PAGES[page]()}catch(e){$('#view').innerHTML=`<p class=err>${esc(e.message)}</p>`}}
function go(p){page=p;render();scrollTo(0,0)}
$('#view').onclick=e=>{const b=e.target.closest('[data-act]');if(b&&!b.disabled)ACT[b.dataset.act](b.dataset.v)};
$('#nav').onclick=e=>{const b=e.target.closest('[data-go]');if(b)go(b.dataset.go)};
async function auth(reg){const n=$('#nick').value.trim().toLowerCase(),p=$('#pass').value,e=$('#aerr');e.textContent='';
if(!/^[a-z0-9_]{3,16}$/.test(n))return e.textContent='Никнейм: 3–16 символов a-z, 0-9, _';
if(p.length<6)return e.textContent='Пароль: минимум 6 символов';
try{reg?await API.signUp(n,p):await API.signIn(n,p);await start()}catch(x){e.textContent=x.message}}
$('#login').onclick=()=>auth(false);$('#reg').onclick=()=>auth(true);$('#pass').onkeydown=e=>e.key=='Enter'&&auth(false);
async function start(){P=await API.me();if(!P)return;
if(P.banned){await API.signOut();P=null;return $('#aerr').textContent='Аккаунт заблокирован администратором'}
$('#auth').hidden=true;$('#app').hidden=false;applyTheme();head();
if(P.is_admin&&!$('#adm'))$('#nav').insertAdjacentHTML('beforeend','<a id=adm href="admin.html">⚙️<span>Админ</span></a>');go('home')}
$('#mode').textContent=API.LOCAL?'Локальный прототип: данные хранятся только в этом браузере. Подключи Supabase (см. README).':'';
start();
