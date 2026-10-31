const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let filter='',open=new Set(['dom']),last=null,prefill={};
const tool=id=>TOOLS.find(t=>t.id===id),isUrl=s=>/^https?:\/\//.test(s);
const val=v=>isUrl(String(v))?`<a href="${esc(v)}" target="_blank" rel="noopener">${esc(v)}</a>`:esc(v).replace(/\n/g,'<br>');
function nav(){const f=filter.toLowerCase(),cur=location.hash.split('/')[2];$('#nav').innerHTML=CATS.map(([c,n])=>{const ts=TOOLS.filter(t=>t.cat===c&&(!f||(t.name+t.desc).toLowerCase().includes(f)));if(!ts.length)return'';const o=f||open.has(c);return`<div class=cat><button data-c=${c}>${o?'▾':'▸'} ${n}</button>${o?ts.map(t=>`<a href="#/t/${t.id}" class="${t.id===cur?'on':''}">${esc(t.name)}</a>`).join(''):''}</div>`}).join('')}
const toText=it=>[`Query: ${it.result.query}`,`Tool: ${it.tool}`,`Accessed: ${it.accessed}`,`Source: ${it.result.source} ${it.result.url||''}`,`Status: ${it.result.status}`,...it.result.sections.flatMap(s=>s.rows.map(r=>`  ${r[0]}: ${String(r[1]).replace(/\n/g,'; ')}`)),...it.result.links.map(l=>`  Link ${l[0]}: ${l[1]}`),''].join('\n');
function dl(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click()}
function report(inv){return`AEGIS ARCHIVE REPORT\nInvestigation: ${inv.name}\nGenerated: ${new Date().toISOString()}\nSaved items: ${inv.items.length}\n\nSUMMARY\n${inv.items.map(i=>`- [${i.result.status}] ${i.tool}: ${i.result.query}`).join('\n')||'(none)'}\n\nNOTES\n${inv.notes||'(none)'}\n\nEVIDENCE\n${inv.items.map(toText).join('\n')}\nStatus key: verified = live from source; derived = computed locally; unverified = link-out, confirm manually.\n`}
const copy=t=>navigator.clipboard?.writeText(t);
function resultHtml(t,r,at){last={tool:t.name,accessed:at,result:r};
const nodes=s=>s.rows.map(x=>`<div class=node><div class=k>${esc(x[0])}</div><div class=v>${val(x[1])}</div><button class=cp data-cp="${esc(String(x[1]))}">Copy</button></div>`).join('');
return`<div class=card><div class=bar><b>${esc(r.query)}</b><span class="badge ${r.status}">${r.status}</span></div>
<div class=mu>Source: ${r.url?`<a href="${esc(r.url)}" target=_blank rel=noopener>${esc(r.source)}</a>`:esc(r.source)} · Accessed ${esc(at)}</div>
<div class=graph><span class=src>${esc(r.query)}</span>
${r.sections.map(s=>`<h2>${esc(s.title)}</h2><div class=rows>${nodes(s)}</div>`).join('')}
</div>
${r.links.length?`<h2>Open in source</h2><ul class=l>${r.links.map(l=>`<li><a href="${esc(l[1])}" target=_blank rel=noopener>${esc(l[0])}</a></li>`).join('')}</ul>`:''}
${r.note?`<p class=mu>${esc(r.note)}</p>`:''}
<div class=bar><button class=p id=save>Save to ${esc(Store.active().name)}</button><button id=cpall>Copy all</button><button id=xtxt>TXT</button><button id=xjson>JSON</button></div></div>`}
function toolPage(t){Store.recent(t.id);const p=prefill[t.id]||{},fav=Store.favs().includes(t.id);
$('#main').innerHTML=`<h1>${esc(t.name)}</h1><p class=mu>${esc(t.desc)}</p><div class=bar><button id=fav>${fav?'★ Favorited':'☆ Favorite'}</button></div>
<form class=card id=f>${t.fields.map(f=>`<label>${esc(f.l)}${f.o?`<select name=${f.k}>${f.o.map(o=>`<option>${esc(o)}</option>`).join('')}</select>`:f.area?`<textarea name=${f.k}>${esc(p[f.k]||'')}</textarea>`:f.file?`<input type=file name=${f.k} accept=image/*>`:`<input name=${f.k} placeholder="${esc(f.p)}" value="${esc(p[f.k]||'')}" autocapitalize=off autocorrect=off>`}</label>`).join('')}<button class=p>Run</button></form><div id=out></div>`;
$('#fav').onclick=e=>{e.target.textContent=Store.toggleFav(t.id)?'★ Favorited':'☆ Favorite'};
$('#f').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target),v=Object.fromEntries(fd);const fi=e.target.querySelector('input[type=file]');if(fi&&fi.files[0])v.__file=fi.files[0];const o=$('#out');o.innerHTML='<div class=card>Working…</div>';
try{const r=await t.run(v),at=new Date().toISOString();o.innerHTML=resultHtml(t,r,at);Store.hist({tool:t.id,name:t.name,q:r.query,ts:at,v});
$('#save').onclick=()=>{Store.addItem({...last,id:Date.now()});$('#save').textContent='Saved ✓'};$('#cpall').onclick=()=>copy(toText(last));
$('#xtxt').onclick=()=>dl('aegis-result.txt',toText(last),'text/plain');$('#xjson').onclick=()=>dl('aegis-result.json',JSON.stringify(last,null,2),'application/json')}
catch(x){o.innerHTML=`<div class="card err"><b>Lookup failed</b><br>${esc(x.message)}<br><span class=mu>Check the input and your connection. Some sources limit requests; try again shortly.</span></div>`}}}
function home(){const iv=Store.invs(),n=iv.reduce((a,i)=>a+i.items.length,0),L=(ids)=>ids.length?`<ul class=l>${ids.map(i=>tool(i)).filter(Boolean).map(t=>`<li><a href="#/t/${t.id}">${esc(t.name)}</a></li>`).join('')}</ul>`:'<p class=mu>Nothing yet.</p>';
$('#main').innerHTML=`<h1>Investigation dashboard</h1><p class=mu>Public-source research tools. Results are labeled verified, derived, or unverified.</p>
<div class=grid><div class=card><b class=n>${TOOLS.length}</b>tools</div><div class=card><b class=n>${iv.length}</b>investigations</div><div class=card><b class=n>${n}</b>saved results</div><div class=card><b class=n>${Store.history().length}</b>searches</div></div>
<div class=card><h2>Active: ${esc(Store.active().name)}</h2><a href="#/work">Open workspace</a></div>
<div class=card><h2>Favorites</h2>${L(Store.favs())}</div><div class=card><h2>Recently used</h2>${L(Store.recents())}</div>
<div class=card><h2>Use responsibly</h2><p class=mu>For authorized, lawful research on public information. Do not use it to locate, harass, or target private individuals.</p></div>`}
function work(){const iv=Store.invs(),a=Store.active();
$('#main').innerHTML=`<h1>Investigations</h1><div class=bar><select id=sel>${iv.map(i=>`<option value=${i.id} ${i.id===a.id?'selected':''}>${esc(i.name)}</option>`).join('')}</select><button id=nw>New</button><button id=dl2>Delete</button></div>
<div class=card><h2>Notes</h2><textarea id=nt placeholder="Evidence notes, sources, summary…">${esc(a.notes)}</textarea></div>
<div class=bar><button class=p id=rp>Report (TXT)</button><button id=ej>Export JSON</button></div>
<h2>Saved results (${a.items.length})</h2>${a.items.map((it,k)=>`<div class=card><b>${esc(it.tool)}: ${esc(it.result.query)}</b> <span class="badge ${it.result.status}">${it.result.status}</span><div class=mu>${esc(it.accessed)} · ${esc(it.result.source)}</div><div class=bar><button data-cp="${esc(toText(it))}">Copy</button><button data-rm=${k}>Remove</button></div></div>`).join('')||'<p class=mu>Run a tool and tap Save to add results here.</p>'}
<h2>Search history</h2><ul class=l>${Store.history().slice(0,30).map((h,k)=>`<li><a href="#/t/${h.tool}" data-h=${k}>${esc(h.name)}: ${esc(h.q)}</a> <span class=mu>${esc(h.ts.slice(0,16))}</span></li>`).join('')||'<li class=mu>No searches yet.</li>'}</ul>`;
$('#sel').onchange=e=>{Store.setActive(e.target.value);work()};$('#nw').onclick=()=>{const n=prompt('Investigation name');if(n){Store.newInv(n.slice(0,60));work()}};
$('#dl2').onclick=()=>{if(confirm('Delete "'+a.name+'" and its saved items?')){Store.delInv(a.id);work()}};
$('#nt').oninput=e=>Store.setNotes(e.target.value);$('#rp').onclick=()=>dl('aegis-report.txt',report(Store.active()),'text/plain');
$('#ej').onclick=()=>dl('aegis-investigation.json',JSON.stringify(Store.active(),null,2),'application/json');
document.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{Store.rmItem(+b.dataset.rm);work()});
document.querySelectorAll('[data-h]').forEach(x=>x.onclick=()=>{const h=Store.history()[+x.dataset.h];prefill[h.tool]=h.v})}
function feedsPage(){$('#main').innerHTML=`<h1>Live feeds</h1><p class=mu>Public monitoring dashboards. Each opens on its own site; nothing is embedded or altered here.</p><div class=grid>${FEEDS.map(f=>`<div class=card><h2 style="margin-top:0">${esc(f[0])}</h2><p class=mu>${esc(f[1])}</p><div class=bar><a href="${esc(f[2])}" target=_blank rel=noopener><button>Open</button></a><a href="${esc(f[3])}" target=_blank rel=noopener><button>Alt. source</button></a></div></div>`).join('')}</div>`}
function route(){const[,r,id]=location.hash.split('/');$('#side').classList.remove('open');nav();
if(r==='t'&&tool(id)){toolPage(tool(id));if(prefill.__auto){delete prefill.__auto;$('#f').requestSubmit()}}else if(r==='work')work();else if(r==='dir')dirPage();else if(r==='feeds')feedsPage();else home();scrollTo(0,0)}
document.addEventListener('click',e=>{const c=e.target.closest('[data-c]'),p=e.target.closest('[data-cp]');
if(c){open.has(c.dataset.c)?open.delete(c.dataset.c):open.add(c.dataset.c);nav()}if(p){copy(p.dataset.cp);p.textContent='✓';setTimeout(()=>p.textContent=p.title==='Copy'?'⧉':'Copy',900)}});
const detect=s=>/^[^\s@]+@[^\s@]+\.\w+$/.test(s)?['email','e']:/^(\d{1,3}\.){3}\d{1,3}$/.test(s)?['ip','ip']:/^\d{15,21}$/.test(s)?['discord','i']:/^\+?[\d\s().-]{8,}$/.test(s)?['phone','p']:/^[a-f0-9]{32,128}$/i.test(s)?['hash','h']:/^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(s)?['dns','d']:/^@?[\w.-]{3,30}$/.test(s)?['username','u']:['org','n'];
function dirPage(){const f=filter.toLowerCase(),mk={D:'Google dork',R:'Registration required',M:'Edit URL manually',T:'Local install'};
$('#main').innerHTML=`<h1>Tool directory</h1><p class=mu>Public research tools grouped like the OSINT Framework. Tags: ${Object.entries(mk).map(([k,v])=>`<b class=tag>${k}</b> ${v}`).join(', ')}.</p><div class=tree>${DIR.map(([c,items])=>{const it=items.filter(x=>!f||(c+x[0]).toLowerCase().includes(f));return it.length?`<details ${f?'open':''}><summary>${esc(c)} <span class=mu>${it.length}</span></summary>${it.map(x=>`<a href="${esc(x[1])}" target=_blank rel=noopener>${esc(x[0])}${x[2]?` <b class=tag>${x[2]}</b>`:''}</a>`).join('')}</details>`:''}).join('')}</div>`}
$('#q').oninput=e=>{filter=e.target.value;nav();if(location.hash==='#/dir')dirPage()};
$('#q').onkeydown=e=>{if(e.key!=='Enter')return;const s=e.target.value.trim();if(!s)return;const m=TOOLS.filter(t=>(t.name+t.desc).toLowerCase().includes(s.toLowerCase()));
if(/^[a-z &]+$/i.test(s)&&m.length){location.hash='#/t/'+m[0].id;return}const[id,k]=detect(s);prefill[id]={[k]:s.replace(/^@/,''),t:'A'};prefill.__auto=true;e.target.value='';filter='';location.hash='#/t/'+id}
$('#menu').onclick=()=>$('#side').classList.toggle('open');
addEventListener('hashchange',route);route();
