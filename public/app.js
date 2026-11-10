// ecT — versión 100% estática (localStorage) para GitHub Pages
const el = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&','<':'<','>':'>','"':'"',"'":'''}[c]));
const ALLOWED = ['image/png','image/jpeg','image/webp','image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // localStorage tiene límite ~5-10 MB total

const PALETTE = ['#ff6b4a','#3aa57a','#7a5af8','#e8384f','#2f8fe0','#d68a1f','#0fb5a8','#c2410c'];
function colorFor(name){ let h=0; for(const c of name) h=(h*31+c.charCodeAt(0))>>>0; return PALETTE[h%PALETTE.length]; }
function now(){ return Date.now(); }
function ago(t){ const m=Math.floor((Date.now()-t)/6e4); if(m<1)return'ahora';if(m<60)return m+' min';const h=Math.floor(m/60);if(h<24)return h+' h';return Math.floor(h/24)+' d'; }
function load(k,d){ try{const v=JSON.parse(localStorage.getItem(k));return v||d}catch{return d} }
function save(k,v){ try{localStorage.setItem(k,JSON.stringify(v))}catch(e){console.warn('localStorage lleno',e)} }

let me = load('ect_me', null);
let posts = load('ect_posts', []);
let liked = load('ect_liked', []);
let following = load('ect_following', []);
let tagFilter = null, query = '', profile = null, pendingFile = null, authMode = 'login';

// Seed posts si está vacío
if(!posts.length){
  const art = (a,b,emoji)=>`data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs><rect width='800' height='500' fill='url(#g)'/><text x='400' y='300' font-size='180' text-anchor='middle'>${emoji}</text></svg>`)}`;
  posts = [
    {id:1,username:'lunaverde',color:'#3aa57a',image:art('#1d976c','#93f9b9','🌿'),is_gif:false,caption:'Mi rincón de plantas por fin está completo.',tags:['plantas','hogar'],likes:128,reblogs:34,ts:now()-36e5},
    {id:2,username:'nubesdepapel',color:'#2f8fe0',image:art('#2193b0','#6dd5ed','☁️'),is_gif:false,caption:'Domingo de nubes y música tranquila.',tags:['cielo','domingo'],likes:77,reblogs:9,ts:now()-5e7},
    {id:3,username:'pixelpajaro',color:'#e8384f',image:art('#e8384f','#ffd24a','🐦'),is_gif:false,caption:'Internet viejo, blogs raros y GIFs de gatos bailando.',tags:['internet','nostalgia'],likes:945,reblogs:402,ts:now()-2e7},
    {id:4,username:'cafecito_nocturno',color:'#7a5af8',image:art('#7a5af8','#2f8fe0','☕'),is_gif:false,caption:'Noches de café y garabatos.',tags:['café','noche'],likes:512,reblogs:201,ts:now()-72e5},
    {id:5,username:'demo',color:'#ff6b4a',image:art('#ff6b4a','#ffd24a','🖼️'),is_gif:false,caption:'Bienvenido a ecT (versión estática). Elige un nombre arriba y sube tu primera foto o GIF.',tags:['bienvenida'],likes:1,reblogs:0,ts:now()-1e6}
  ];
  save('ect_posts', posts);
}

function persist(){ save('ect_posts',posts); save('ect_liked',liked); save('ect_following',following); }

function allUsers(){
  const map = {};
  posts.forEach(p=>{ if(!map[p.username]) map[p.username]={username:p.username,color:p.color,count:0}; map[p.username].count++; });
  if(me && !map[me.username]) map[me.username]={username:me.username,color:me.color,count:0};
  return Object.values(map).sort((a,b)=>b.count-a.count);
}
function trends(){
  const c={}; posts.forEach(p=>p.tags.forEach(t=>c[t]=(c[t]||0)+1));
  return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([t])=>t);
}
function filteredPosts(){
  let list = [...posts].sort((a,b)=>b.ts-a.ts);
  if(tagFilter) list = list.filter(p=>p.tags.includes(tagFilter));
  if(query){ const q=query.toLowerCase(); list=list.filter(p=>[p.username,p.caption,p.tags.join(' ')].join(' ').toLowerCase().includes(q)); }
  return list;
}
function userPosts(uname){ return posts.filter(p=>p.username===uname).sort((a,b)=>b.ts-a.ts); }

// ---------- nav ----------
function renderNav(){
  const navr=el('navr');
  if(!me){ navr.innerHTML=`<button class="btn ghost" id="nav-login">Entrar</button><button class="btn" id="nav-reg">Crear cuenta</button>`; el('nav-login').onclick=()=>openAuth('login'); el('nav-reg').onclick=()=>openAuth('register'); }
  else{ navr.innerHTML=`<div class="avatar" style="background:${esc(me.color)}" title="Mi perfil" id="nav-me">${esc(me.username[0].toUpperCase())}</div><span id="nav-name">@${esc(me.username)}</span><button class="btn ghost" id="nav-out">Salir</button>`; el('nav-me').onclick=()=>showProfile(me.username); el('nav-name').onclick=()=>showProfile(me.username); el('nav-name').style.cursor='pointer'; el('nav-out').onclick=()=>{me=null;save('ect_me',null);render();} }
}

// ---------- auth modal ----------
function openAuth(mode){ authMode=mode; el('auth-modal').classList.remove('hide'); setAuthMode(mode); }
function setAuthMode(mode){ authMode=mode; el('tab-login').classList.toggle('on',mode==='login'); el('tab-register').classList.toggle('on',mode==='register'); el('auth-title').textContent=mode==='login'?'Entra a ecT':'Crea tu cuenta'; el('auth-btn').textContent=mode==='login'?'Entrar':'Crear cuenta'; el('auth-err').textContent=''; }
function closeAuth(){ el('auth-modal').classList.add('hide'); }
el('auth-close').onclick=closeAuth;
el('auth-modal').addEventListener('click',e=>{if(e.target===el('auth-modal'))closeAuth();});
el('tab-login').onclick=()=>setAuthMode('login');
el('tab-register').onclick=()=>setAuthMode('register');
el('auth-form').onsubmit=e=>{e.preventDefault(); el('auth-err').textContent=''; const username=el('a-user').value.trim().toLowerCase(); if(!/^[a-z0-9_]{3,20}$/i.test(username)){el('auth-err').textContent='Usuario: 3-20 chars, solo letras, números y _';return} me={username,color:colorFor(username)}; save('ect_me',me); closeAuth(); el('a-user').value=''; render(); };

// ---------- composer ----------
const dz=el('dropzone'), fileInput=el('f-file');
dz.onclick=()=>fileInput.click();
['dragover','dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.toggle('over',ev==='dragover');if(ev==='drop'&&e.dataTransfer.files[0])setFile(e.dataTransfer.files[0]);}));
fileInput.onchange=()=>{if(fileInput.files[0])setFile(fileInput.files[0]);};
function setFile(file){
  el('post-err').textContent='';
  const typeOk=ALLOWED.includes(file.type)||/\.(png|jpe?g|webp|gif)$/i.test(file.name);
  if(!typeOk){el('post-err').textContent='Solo se permiten fotos y GIFs (PNG, JPG, WebP, GIF).';return}
  if(file.size>MAX_SIZE){el('post-err').textContent=`Muy grande (máx. ${MAX_SIZE/1024/1024} MB en localStorage).`;return}
  pendingFile=file;
  el('preview').src=URL.createObjectURL(file);
  el('preview-wrap').classList.remove('hide');
  el('gif-badge').classList.toggle('hide',file.type!=='image/gif'&&!/\.gif$/i.test(file.name));
}
el('clear-img').onclick=()=>{pendingFile=null;fileInput.value='';el('preview-wrap').classList.add('hide');el('preview').src='';};
el('post-btn').onclick=async()=>{
  el('post-err').textContent='';
  if(!me){openAuth('login');el('post-err').textContent='Elige un nombre para publicar.';return}
  if(!pendingFile){el('post-err').textContent='Elige una foto o un GIF primero.';return}
  el('post-btn').disabled=true;
  try{
    const image=await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=rej;fr.readAsDataURL(pendingFile);});
    const tags=el('f-tags').value.split(/[\s,]+/).map(t=>t.replace(/^#/,'').toLowerCase()).filter(Boolean).slice(0,10);
    const p={id:now(),username:me.username,color:me.color,image,is_gif:pendingFile.type==='image/gif'||/\.gif$/i.test(pendingFile.name),caption:el('f-caption').value.trim().slice(0,2000),tags,likes:0,reblogs:0,ts:now()};
    posts.unshift(p); persist();
    el('f-caption').value='';el('f-tags').value='';el('clear-img').click();
    render();
  }catch(err){el('post-err').textContent=err.message}
  el('post-btn').disabled=false;
};

// ---------- render ----------
function postCard(p){
  const isLiked=liked.includes(p.id);
  const isMine=me&&me.username===p.username;
  const isFollowing=following.includes(p.username);
  return `<article class="card">
    <div class="hdr"><div class="avatar" style="background:${esc(p.color)}" onclick="showProfile('${esc(p.username)}')">${esc(p.username[0].toUpperCase())}</div>
      <div><b onclick="showProfile('${esc(p.username)}')">${esc(p.username)}</b><small>hace ${ago(p.ts)}</small></div></div>
    <div class="body">
      <div class="img-wrap"><img src="${esc(p.image)}" alt="" loading="lazy">${p.is_gif?'<span class="gif-badge">GIF</span>':''}</div>
      ${p.caption?`<p style="margin-top:10px">${esc(p.caption)}</p>`:''}
    </div>
    <div class="tags">${p.tags.map(t=>`<a onclick="setTag('${esc(t)}')">#${esc(t)}</a>`).join('')}</div>
    <div class="foot"><span class="notes">${(p.likes+p.reblogs).toLocaleString('es')} notas</span>
      <button class="ic" title="Reblogear" onclick="reblog(${p.id})">↻</button>
      <button class="ic ${isLiked?'liked':''}" title="Me gusta" onclick="like(${p.id})">${isLiked?'♥':'♡'}</button>
      ${isMine?`<button class="ic" title="Borrar" onclick="delPost(${p.id})">🗑</button>`:''}
      ${me&&!isMine?`<button class="ic follow ${isFollowing?'on':''}" onclick="follow('${esc(p.username)}')">${isFollowing?'Siguiendo':'Seguir'}</button>`:''}
    </div></article>`;
}
function render(){
  renderNav();
  const fb=el('filter');
  if(tagFilter){fb.classList.remove('hide');fb.innerHTML=`<span>#${esc(tagFilter)}</span><button onclick="setTag(null)">✕ quitar</button>`;}else fb.classList.add('hide');
  if(profile){
    el('home-view').classList.add('hide');
    const pv=el('profile-view');pv.classList.remove('hide');
    const u=profile.user;
    pv.innerHTML=`<button class="back" onclick="goHome()">← Inicio</button>
      <div class="card profile-head">
        <div class="avatar" style="background:${esc(u.color)}">${esc(u.username[0].toUpperCase())}</div>
        <div style="flex:1"><h2>@${esc(u.username)}</h2><p>${u.post_count} posts</p></div>
        ${me&&me.username!==u.username?`<button class="follow ${u.is_following?'on':''}" onclick="follow('${esc(u.username)}')">${u.is_following?'Siguiendo':'Seguir'}</button>`:''}
      </div>
      <div>${profile.posts.length?profile.posts.map(postCard).join(''):'<div class="empty">Este blog no tiene fotos ni GIFs.</div>'}</div>`;
    return;
  }
  el('home-view').classList.remove('hide');el('profile-view').classList.add('hide');
  const feed=el('feed');
  const list=filteredPosts();
  feed.innerHTML=list.length?list.map(postCard).join(''):'<div class="empty">No hay fotos ni GIFs por aquí. ¡Sé el primero!</div>';
  renderSide();
}
function renderSide(){
  const users=allUsers();
  el('recs').innerHTML=users.map(u=>`<div class="rec"><div class="avatar" style="background:${esc(u.color)}" onclick="showProfile('${esc(u.username)}')">${esc(u.username[0].toUpperCase())}</div><div><b onclick="showProfile('${esc(u.username)}')" style="cursor:pointer">${esc(u.username)}</b><small>${u.count} posts</small></div>${me&&me.username!==u.username?`<button class="follow ${following.includes(u.username)?'on':''}" onclick="follow('${esc(u.username)}')">${following.includes(u.username)?'Siguiendo':'Seguir'}</button>`:''}</div>`).join('')||'<small style="color:var(--muted)">Sin usuarios aún</small>';
  el('trends').innerHTML=trends().map(t=>`<span class="trend" onclick="setTag('${esc(t)}')">#${esc(t)}</span>`).join('')||'<small style="color:var(--muted)">—</small>';
}

// ---------- actions ----------
window.setTag=t=>{tagFilter=t;profile=null;render();window.scrollTo({top:0,behavior:'smooth'});};
window.goHome=()=>{profile=null;render();};
window.showProfile=async name=>{profile={user:{username:name,color:colorFor(name),post_count:userPosts(name).length,is_following:following.includes(name)},posts:userPosts(name)};render();window.scrollTo({top:0});};
window.like=id=>{const p=posts.find(x=>x.id===id)||(profile&&profile.posts.find(x=>x.id===id));const i=liked.indexOf(id);if(i>-1){liked.splice(i,1);p.likes--}else{liked.push(id);p.likes++}persist();render();};
window.reblog=id=>{if(!me)return openAuth('login');const p=posts.find(x=>x.id===id);if(!p)return;const np={...p,id:now(),username:me.username,color:me.color,likes:0,reblogs:0,ts:now()};posts.unshift(np);p.reblogs++;persist();render();};
window.delPost=id=>{if(!confirm('¿Borrar esta foto/GIF?'))return;posts=posts.filter(p=>p.id!==id);if(profile)profile.posts=profile.posts.filter(p=>p.id!==id);persist();render();};
window.follow=name=>{if(!me)return openAuth('login');if(name===me.username)return;const i=following.indexOf(name);if(i>-1)following.splice(i,1);else following.push(name);persist();render();renderSide();};

// ---------- search ----------
let searchTimer;
el('q').oninput=e=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{query=e.target.value.trim();profile=null;render();},250);};
el('logo').onclick=()=>{profile=null;query='';el('q').value='';render();window.scrollTo({top:0});};

// init
render();