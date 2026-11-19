// Слой данных: Supabase (если заполнен config.js) или локальный прототип в localStorage.
(()=>{
const C=window.VORTEX_CONFIG||{},LOCAL=!(C.SUPABASE_URL&&C.SUPABASE_ANON_KEY);
const today=()=>new Date().toISOString().slice(0,10),em=n=>n+'@vortex-game.app';
const tr=m=>/rate limit|too many/i.test(m)?'Слишком много попыток, подожди минуту':/Invalid login/i.test(m)?'Неверный ник или пароль':/already registered/i.test(m)?'Этот ник уже занят':/not confirmed/i.test(m)?'Отключи подтверждение email в Supabase (см. README)':m;
const fail=e=>{throw new Error(tr(e.message||String(e)))};
const IT=[['av_smile','avatar','Классик','🙂',0],['av_wolf','avatar','Волк','🐺',100],['av_fox','avatar','Лис','🦊',150],['av_alien','avatar','Пришелец','👾',200],['av_robot','avatar','Робот','🤖',250],['av_dragon','avatar','Дракон','🐉',300],['av_unicorn','avatar','Единорог','🦄',400],
['fr_none','frame','Без рамки','',0],['fr_neon','frame','Неон','f-neon',120],['fr_gold','frame','Золото','f-gold',250],['fr_fire','frame','Огонь','f-fire',400],
['bd_none','badge','Без значка','',0],['bd_star','badge','Звезда','⭐',80],['bd_fire','badge','Пламя','🔥',150],['bd_gem','badge','Кристалл','💎',200],['bd_crown','badge','Корона','👑',500],
['th_violet','theme','Фиолетовая','violet',0],['th_cyan','theme','Циан','cyan',150],['th_pink','theme','Розовая','pink',150],['th_green','theme','Зелёная','green',150]].map(([id,kind,name,value,price])=>({id,kind,name,value,price}));
const GAMES=[['clicker','Кликер',.5,40],['reaction','Реакция',.15,45],['guess','Угадай число',.4,40],['memory','Память',.3,40],['math','Математика',.4,40],['seq','Последовательность',.4,40]].map(([id,title,rate,max_reward])=>({id,title,enabled:true,rate,max_reward}));
const QS=[[1,'Сыграй 3 игры','any',3,30],[2,'Сыграй в Кликер','clicker',1,15],[3,'Пройди игру на память','memory',1,20],[4,'Сыграй 2 раза в Математику','math',2,25]].map(([id,title,game,target,reward])=>({id,title,game,target,reward,active:true}));
let A;
if(LOCAL){
const L={g:(k,d)=>{try{const v=JSON.parse(localStorage.getItem('vx_'+k));return v==null?d:v}catch{return d}},s:(k,v)=>localStorage.setItem('vx_'+k,JSON.stringify(v))};
const pub=p=>{if(!p)return null;const{pw,...r}=p;return r},U=()=>L.g('users',{}),hp=p=>btoa(encodeURIComponent(p));
const cur=()=>{const u=U(),p=u[L.g('sess',null)];if(!p||p.banned)throw new Error('Доступ запрещён');return[u,p]};
const adm=()=>{const r=cur();if(!r[1].is_admin)throw new Error('Нет прав администратора');return r[0]};
const R={
submit_score({g,score}){const[u,p]=cur();const gm=L.g('games',GAMES).find(x=>x.id==g&&x.enabled);if(!gm)throw new Error('Игра отключена');
score=Math.max(0,Math.min(1000,score|0));const r=Math.min(Math.floor(score*gm.rate),gm.max_reward);
p.coins+=r;p.stats.played++;p.stats.earned+=r;p.stats.best[g]=Math.max(p.stats.best[g]||0,score);
const pr=L.g('prog',{});L.g('quests',QS).filter(q=>q.active&&(q.game=='any'||q.game==g)).forEach(q=>{const k=p.id+'|'+q.id+'|'+today();(pr[k]=pr[k]||{progress:0,claimed:false}).progress++});
L.s('prog',pr);L.s('users',u);return r},
buy_item({i}){const[u,p]=cur(),it=IT.find(x=>x.id==i);if(!it)throw new Error('Нет товара');if(p.owned.includes(i))throw new Error('Уже куплено');if(p.coins<it.price)throw new Error('Недостаточно V');p.coins-=it.price;p.owned.push(i);L.s('users',u)},
equip_item({i}){const[u,p]=cur(),it=IT.find(x=>x.id==i);if(!it||!p.owned.includes(i))throw new Error('Не куплено');p[it.kind]=it.value;L.s('users',u)},
claim_quest({q}){const[u,p]=cur(),qt=L.g('quests',QS).find(x=>x.id==q&&x.active),pr=L.g('prog',{}),o=pr[p.id+'|'+q+'|'+today()];
if(!qt||!o||o.claimed||o.progress<qt.target)throw new Error('Задание не выполнено');o.claimed=true;p.coins+=qt.reward;L.s('prog',pr);L.s('users',u);return qt.reward},
admin_users(){return Object.values(adm()).map(pub)},
admin_ban({uid,b}){const u=adm();u[uid].banned=b;L.s('users',u)},
admin_give({uid,amt}){const u=adm();u[uid].coins=Math.max(0,u[uid].coins+(amt|0));L.s('users',u)},
admin_save_quest({qid,t,g,tg,rw,act}){adm();const qs=L.g('quests',QS),d={title:t,game:g,target:tg,reward:rw,active:act};
if(qid==null)qs.push({id:Math.max(0,...qs.map(x=>x.id))+1,...d});else Object.assign(qs.find(x=>x.id==qid),d);L.s('quests',qs)},
admin_del_quest({qid}){adm();L.s('quests',L.g('quests',QS).filter(x=>x.id!=qid))},
admin_save_game({gid,en,rt,mx}){adm();const gs=L.g('games',GAMES);Object.assign(gs.find(x=>x.id==gid),{enabled:en,rate:rt,max_reward:mx});L.s('games',gs)}};
A={
async signUp(n,p){const u=U();if(u[n])fail({message:'Этот ник уже занят'});
u[n]={id:n,nick:n,pw:hp(p),coins:100,avatar:'🙂',frame:'',badge:'',theme:'violet',owned:['av_smile','fr_none','bd_none','th_violet'],stats:{played:0,earned:0,best:{}},is_admin:!Object.keys(u).length,banned:false,created_at:new Date().toISOString()};
L.s('users',u);L.s('sess',n)},
async signIn(n,p){const u=U()[n];if(!u||u.pw!==hp(p))fail({message:'Invalid login credentials'});L.s('sess',n)},
async signOut(){localStorage.removeItem('vx_sess')},
async hasSession(){return !!L.g('sess',null)},
async me(){return pub(U()[L.g('sess',null)])},
async tbl(t){return t=='items'?IT:L.g(t,t=='games'?GAMES:QS)},
async leaders(){return Object.values(U()).map(pub)},
async progress(){const p=L.g('sess',null);return Object.entries(L.g('prog',{})).filter(([k])=>k.startsWith(p+'|')&&k.endsWith('|'+today())).map(([k,v])=>({quest_id:+k.split('|')[1],...v}))},
async rpc(n,a){try{return R[n](a)}catch(e){fail(e)}}};
}else{
const sb=window.supabase.createClient(C.SUPABASE_URL,C.SUPABASE_ANON_KEY);
A={
async signUp(n,p){const{data,error}=await sb.auth.signUp({email:em(n),password:p,options:{data:{nick:n}}});if(error)fail(error);if(!data.session){try{await A.signIn(n,p)}catch(e){fail({message:'Аккаунт создан, но вход не выполнен. В Supabase выключи Confirm email (Authentication → Sign In / Providers → Email)'})}}},
async hasSession(){const{data:{session}}=await sb.auth.getSession();return !!session},
async signIn(n,p){const{error}=await sb.auth.signInWithPassword({email:em(n),password:p});if(error)fail(error)},
signOut:()=>sb.auth.signOut(),
async me(){const{data:{session}}=await sb.auth.getSession();if(!session)return null;const{data}=await sb.from('profiles').select('*').eq('id',session.user.id).single();return data},
async tbl(t){const{data,error}=await sb.from(t).select('*').order('id');if(error)fail(error);return data},
async leaders(){const{data,error}=await sb.from('profiles').select('nick,avatar,frame,badge,coins,stats').order('coins',{ascending:false}).limit(100);if(error)fail(error);return data},
async progress(){const{data,error}=await sb.from('quest_progress').select('quest_id,progress,claimed').eq('day',today());if(error)fail(error);return data},
async rpc(n,a){const{data,error}=await sb.rpc(n,a);if(error)fail(error);return data}};
}
window.API=Object.assign({LOCAL},A);
})();
