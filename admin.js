// Вся проверка прав — на сервере (функции admin_* в supabase.sql). Этот код только интерфейс.
const $=(s,r=document)=>r.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let tab='users';
function toast(m,bad){const t=$('#toast');t.textContent=m;t.className='show'+(bad?' bad':'');clearTimeout(toast.t);toast.t=setTimeout(()=>t.className='',2400)}
const T={
async users(){const us=await API.rpc('admin_users');return `<div class=tbl><table><tr><th>Ник</th><th>V</th><th>Игр</th><th>Статус</th><th>Выдать V</th><th></th></tr>${us.map(u=>`<tr><td>${esc(u.nick)}${u.is_admin?' ⚙️':''}</td><td>${u.coins}</td><td>${u.stats.played}</td><td>${u.banned?'🚫 бан':'✅'}</td>
<td><input type=number value=50 data-g="${u.id}"> <button class="btn sm" data-a=give data-id="${u.id}">Выдать</button></td>
<td><button class="btn sm ${u.banned?'':'danger'}" data-a=ban data-id="${u.id}" data-b="${!u.banned}">${u.banned?'Разблокировать':'Блок'}</button></td></tr>`).join('')}</table></div>`},
async quests(){const[qs,gs]=await Promise.all([API.tbl('quests'),API.tbl('games')]);
const row=q=>`<tr data-id="${q.id}"><td><input class=t value="${esc(q.title)}"></td><td><select class=g>${['any',...gs.map(g=>g.id)].map(g=>`<option ${g==q.game?'selected':''}>${g}</option>`).join('')}</select></td>
<td><input class=tg type=number value=${q.target}></td><td><input class=rw type=number value=${q.reward}></td><td><input class=act type=checkbox ${q.active?'checked':''}></td>
<td><button class="btn sm" data-a=sq>Сохранить</button> ${q.id=='new'?'':'<button class="btn sm danger" data-a=dq>Удалить</button>'}</td></tr>`;
return `<div class=tbl><table><tr><th>Название</th><th>Игра</th><th>Цель</th><th>Награда V</th><th>Активно</th><th></th></tr>${qs.map(row).join('')}${row({id:'new',title:'',game:'any',target:1,reward:20,active:true})}</table></div><p class=mut small>Нижняя строка — новое задание.</p>`},
async games(){const gs=await API.tbl('games');return `<div class=tbl><table><tr><th>Игра</th><th>Включена</th><th>Коэфф. V за очко</th><th>Макс. награда V</th><th></th></tr>${gs.map(g=>`<tr data-id="${g.id}"><td>${esc(g.title)}</td><td><input class=en type=checkbox ${g.enabled?'checked':''}></td><td><input class=rt type=number step=.05 value=${g.rate}></td><td><input class=mx type=number value=${g.max_reward}></td><td><button class="btn sm" data-a=sg>Сохранить</button></td></tr>`).join('')}</table></div>`}};
async function render(){document.querySelectorAll('[data-a=tab]').forEach(b=>b.classList.toggle('ghost',b.dataset.t!=tab));
try{$('#v').innerHTML=await T[tab]()}catch(e){$('#v').innerHTML=`<p class=err>${esc(e.message)}</p>`}}
document.onclick=async e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,tr=b.closest('tr'),q=k=>$('.'+k,tr);
try{if(a=='tab'){tab=b.dataset.t;return render()}
if(a=='give')await API.rpc('admin_give',{uid:b.dataset.id,amt:+$(`[data-g="${b.dataset.id}"]`).value});
if(a=='ban')await API.rpc('admin_ban',{uid:b.dataset.id,b:b.dataset.b=='true'});
if(a=='sq')await API.rpc('admin_save_quest',{qid:tr.dataset.id=='new'?null:+tr.dataset.id,t:q('t').value,g:q('g').value,tg:+q('tg').value,rw:+q('rw').value,act:q('act').checked});
if(a=='dq'){if(!confirm('Удалить задание?'))return;await API.rpc('admin_del_quest',{qid:+tr.dataset.id})}
if(a=='sg')await API.rpc('admin_save_game',{gid:tr.dataset.id,en:q('en').checked,rt:+q('rt').value,mx:+q('mx').value});
toast('Готово');render()}catch(x){toast(x.message,true)}};
(async()=>{const p=await API.me().catch(()=>null);
if(!p||!p.is_admin){$('.wrap').innerHTML='<h2>Нет доступа</h2><p class=mut>Войди в аккаунт администратора на главной странице.</p><a class="btn" href="index.html" style="text-decoration:none;display:inline-block;margin-top:12px">На главную</a>';return}
document.body.dataset.theme=p.theme||'violet';render()})();
