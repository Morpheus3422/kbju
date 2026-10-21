/* ================= ПЛАН ================= */
// Задача: {id,title,notes,date,time,end,prio(0..3),list(id),rep:{f:d|wd|w|m|y,days?},dn:[даты выполнения повторов],done,doneAt,sub:[{id,t,done}],at,t}
const PRIO={1:{n:"Высокий",c:"#d6453d"},2:{n:"Средний",c:"#e58a1f"},3:{n:"Низкий",c:"#3b7fc4"},0:{n:"Без приоритета",c:"transparent"}};
const LIST_COLORS=["#e0a800","#d6453d","#3b7fc4","#3f9a5a","#8a5ac2","#e5732b","#5f6b7a"];
const isoDow=d=>(d.getDay()+6)%7+1;
const addD=(k,n)=>{const d=parseKey(k);d.setDate(d.getDate()+n);return key(d)};
const dayDiff=(a,b)=>Math.round((parseKey(b)-parseKey(a))/864e5);
const WD_SHORT=["пн","вт","ср","чт","пт","сб","вс"];
const listOf=t=>planner.lists.find(l=>l.id===t.list);

function occursOn(t,k){
  if(!t.date)return false;if(!t.rep)return t.date===k;if(k<t.date)return false;
  const d=parseKey(k),s=parseKey(t.date);
  switch(t.rep.f){
    case "d":return true;
    case "wd":return isoDow(d)<=5;
    case "w":return (t.rep.days&&t.rep.days.length?t.rep.days:[isoDow(s)]).includes(isoDow(d));
    case "m":{const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();return d.getDate()===Math.min(s.getDate(),last)}
    case "y":return d.getMonth()===s.getMonth()&&d.getDate()===s.getDate();
  }
  return false;
}
const isDone=(t,k)=>t.rep?(t.dn||[]).includes(k):!!t.done;
function tasksOn(k){return planner.tasks.filter(t=>occursOn(t,k))}
function sortTasks(a,b){
  const at=a.time||"99",bt=b.time||"99";if(at!==bt)return at<bt?-1:1;
  const ap=a.prio||9,bp=b.prio||9;if(ap!==bp)return ap-bp;return (a.at||0)-(b.at||0);
}
function repText(r){if(!r)return "";return r.f==="d"?"каждый день":r.f==="wd"?"по будням":r.f==="m"?"каждый месяц":r.f==="y"?"каждый год":"по "+(r.days||[]).map(x=>WD_SHORT[x-1]).join(", ")}
function dayLabel(k){const t=todayKey(),n=dayDiff(t,k);
  if(n===0)return "Сегодня";if(n===1)return "Завтра";if(n===-1)return "Вчера";if(n===2)return "Послезавтра";
  const d=parseKey(k),s=d.toLocaleDateString("ru-RU",{weekday:"short",day:"numeric",month:"short"});return s[0].toUpperCase()+s.slice(1)}
function savePlan(){touchSave()}
function touchSave(){save()}

/* ---------- строка задачи ---------- */
function taskRow(t,k,opt={}){
  const done=k?isDone(t,k):!!t.done,l=listOf(t),sub=t.sub||[],sd=sub.filter(x=>x.done).length;
  const overdue=!t.rep&&t.date&&t.date<todayKey()&&!t.done;
  const meta=[];
  if(opt.showDate&&t.date)meta.push(`<span class="${overdue?"od":""}">${esc(dayLabel(t.date))}</span>`);
  if(t.time&&!opt.hideTime)meta.push(`<span class="tm">${t.time}${t.end?"–"+t.end:""}</span>`);
  if(t.rep)meta.push(`<span title="Повтор">↻ ${esc(repText(t.rep))}</span>`);
  if(sub.length)meta.push(`<span>☑ ${sd}/${sub.length}</span>`);
  if(t.notes)meta.push(`<span>✎</span>`);
  if(l&&!opt.hideList)meta.push(`<span class="ls"><i style="background:${l.color}"></i>${esc(l.name)}</span>`);
  return `<div class="trow${done?" done":""}" data-id="${esc(t.id)}" data-k="${k||""}" style="--pc:${PRIO[t.prio||0].c}">
    <button class="tcheck" type="button" role="checkbox" aria-checked="${done}" aria-label="${done?"Вернуть":"Выполнить"}: ${esc(t.title)}"></button>
    <div class="tmain" role="button" tabindex="0"><div class="tt">${esc(t.title)}</div>${meta.length?`<div class="tmeta">${meta.join("")}</div>`:""}</div></div>`;
}
function bindRows(root){
  root.querySelectorAll(".trow").forEach(r=>{
    const t=planner.tasks.find(x=>x.id===r.dataset.id);if(!t)return;const k=r.dataset.k||null;
    r.querySelector(".tcheck").onclick=()=>toggleTask(t,k||t.date,r);
    const m=r.querySelector(".tmain");m.onclick=()=>openTask(t);m.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();openTask(t)}};
  });
}
function toggleTask(t,k,row){
  const wasDone=t.rep?(t.dn||[]).includes(k):!!t.done;
  if(t.rep){t.dn=t.dn||[];t.dn=wasDone?t.dn.filter(x=>x!==k):[...t.dn,k]}else{t.done=!wasDone;t.doneAt=t.done?now():undefined}
  touch(t);save();
  if(row&&!wasDone){row.classList.add("doing");try{navigator.vibrate&&navigator.vibrate(15)}catch(e){}
    setTimeout(renderPlanAll,520);
    if(!t.rep)toastUndo("Выполнено: "+t.title,()=>{t.done=false;t.doneAt=undefined;touch(t);save();renderPlanAll()});
  }else renderPlanAll();
}
function toastUndo(text,undo){
  document.querySelectorAll(".toast").forEach(x=>x.remove());
  const d=document.createElement("div");d.className="toast";d.innerHTML=`<span>${esc(text)}</span> <button type="button" class="undo">Отменить</button>`;
  document.body.append(d);d.querySelector(".undo").onclick=()=>{undo();d.remove()};setTimeout(()=>d.remove(),4000);
}

/* ---------- Сегодня ---------- */
function renderPToday(){
  const k=todayKey(),d=new Date();
  $("ptDate").textContent=d.toLocaleDateString("ru-RU",{weekday:"long",day:"numeric",month:"long"});
  const list=tasksOn(k).sort(sortTasks),open=list.filter(t=>!isDone(t,k)),done=list.filter(t=>isDone(t,k));
  const overdue=planner.tasks.filter(t=>!t.rep&&t.date&&t.date<k&&!t.done).sort((a,b)=>a.date<b.date?-1:1);
  const total=list.length,pct=total?Math.round(done.length/total*100):0;
  $("ptRing").innerHTML=`<svg viewBox="0 0 44 44" width="52" height="52" aria-hidden="true"><circle cx="22" cy="22" r="18" fill="none" stroke="var(--track)" stroke-width="5"/><circle cx="22" cy="22" r="18" fill="none" stroke="var(--acc)" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(113.1*pct/100).toFixed(1)} 113.1" transform="rotate(-90 22 22)"/></svg><span>${done.length}/${total}</span>`;
  $("ptRing").setAttribute("aria-label",`Выполнено ${done.length} из ${total}`);
  let h="";
  if(overdue.length)h+=`<div class="pgroup od"><div class="pgh"><b>Просрочено</b><button class="ghost sm" id="ptMoveAll" type="button">Перенести на сегодня</button></div><div class="tlist">${overdue.map(t=>taskRow(t,null,{showDate:true})).join("")}</div></div>`;
  const timed=open.filter(t=>t.time),untimed=open.filter(t=>!t.time);
  if(timed.length){
    const nowHM=`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;let nowShown=false;
    h+=`<div class="pgroup"><div class="pgh"><b>Расписание</b></div><div class="timeline">`;
    timed.forEach(t=>{if(!nowShown&&t.time>nowHM){h+=`<div class="nowline"><span>${nowHM}</span></div>`;nowShown=true}
      h+=`<div class="tlrow${(t.end||t.time)<nowHM?" past":""}"><div class="tlt">${t.time}${t.end?`<small>${t.end}</small>`:""}</div>${taskRow(t,k,{hideTime:true})}</div>`});
    if(!nowShown)h+=`<div class="nowline"><span>${nowHM}</span></div>`;
    h+=`</div></div>`;
  }
  if(untimed.length)h+=`<div class="pgroup"><div class="pgh"><b>${timed.length?"В течение дня":"Задачи"}</b></div><div class="tlist">${untimed.map(t=>taskRow(t,k)).join("")}</div></div>`;
  if(!open.length&&!overdue.length)h+=`<div class="pempty"><div class="sun"></div><b>${done.length?"Всё сделано!":"На сегодня ничего"}</b><span>${done.length?"Отличный день. Можно отдохнуть или запланировать завтра.":"Нажми «+», чтобы добавить задачу. Можно писать фразой: «в 18:00 зал»."}</span></div>`;
  if(done.length)h+=`<details class="pgroup"${planShowDone?" open":""} id="ptDoneBox"><summary class="pgh"><b>Выполнено · ${done.length}</b></summary><div class="tlist">${done.map(t=>taskRow(t,k)).join("")}</div></details>`;
  $("ptBody").innerHTML=h;bindRows($("ptBody"));
  const mv=$("ptMoveAll");if(mv)mv.onclick=()=>{overdue.forEach(t=>{t.date=k;touch(t)});save();renderPlanAll();toast(`Перенесено на сегодня: ${overdue.length}`)};
  const db=$("ptDoneBox");if(db)db.ontoggle=()=>{planShowDone=db.open};
}
let planShowDone=false;

/* ---------- Предстоящие ---------- */
function renderPUp(){
  const t0=todayKey(),days=[];for(let i=0;i<21;i++)days.push(addD(t0,i));
  $("pupStrip").innerHTML=days.slice(0,7).map(k=>{const d=parseKey(k),n=tasksOn(k).filter(t=>!isDone(t,k)).length;
    return `<button class="wday${k===t0?" today":""}" type="button" data-k="${k}"><span>${WD_SHORT[isoDow(d)-1]}</span><b>${d.getDate()}</b><i>${n?"•".repeat(Math.min(n,3)):""}</i></button>`}).join("");
  let h="";
  days.forEach(k=>{const list=tasksOn(k).sort(sortTasks);const open=list.filter(t=>!isDone(t,k));
    if(!open.length&&dayDiff(t0,k)>6)return;
    h+=`<div class="pgroup" id="pup-${k}"><div class="pgh"><b>${dayLabel(k)}</b><button class="plus sm" type="button" data-add="${k}" aria-label="Добавить на ${dayLabel(k)}">+</button></div>
      ${open.length?`<div class="tlist">${open.map(t=>taskRow(t,k)).join("")}</div>`:`<div class="pnone">Свободно</div>`}</div>`});
  const nodate=planner.tasks.filter(t=>!t.date&&!t.done);
  if(nodate.length)h+=`<div class="pgroup"><div class="pgh"><b>Без даты</b></div><div class="tlist">${nodate.sort(sortTasks).map(t=>taskRow(t,null)).join("")}</div></div>`;
  $("pupBody").innerHTML=h;bindRows($("pupBody"));
  $("pupBody").querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>openQuick({date:b.dataset.add}));
  $("pupStrip").querySelectorAll(".wday").forEach(b=>b.onclick=()=>{const g=$("pup-"+b.dataset.k);if(g)g.scrollIntoView({behavior:"smooth",block:"start"});else openQuick({date:b.dataset.k})});
}

/* ---------- Календарь ---------- */
let pMonth=(()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),1)})(),pSel=null;
function renderPCal(){
  const y=pMonth.getFullYear(),m=pMonth.getMonth(),tk=todayKey();if(!pSel)pSel=tk;
  $("pmTitle").textContent=pMonth.toLocaleDateString("ru-RU",{month:"long",year:"numeric"});
  const first=(new Date(y,m,1).getDay()+6)%7,len=new Date(y,m+1,0).getDate();
  let h=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(w=>`<div class="wd">${w}</div>`).join("");
  for(let i=0;i<first;i++)h+=`<div class="day blank"></div>`;
  for(let d=1;d<=len;d++){const k=key(new Date(y,m,d)),list=tasksOn(k),open=list.filter(t=>!isDone(t,k));
    const dots=open.slice(0,3).map(t=>`<i style="background:${(listOf(t)||{}).color||(t.prio?PRIO[t.prio].c:"var(--muted)")}"></i>`).join("");
    const cls="day pday"+(k===tk?" today":"")+(k===pSel?" sel":"")+(k<tk?" past":"")+(list.length&&!open.length?" alldone":"");
    h+=`<button type="button" class="${cls}" data-k="${k}" aria-label="${d}, задач: ${open.length}"><span class="d">${d}</span><span class="dots">${dots}${open.length>3?"<em>+</em>":""}</span></button>`}
  const rest=(7-((first+len)%7))%7;for(let i=0;i<rest;i++)h+=`<div class="day blank"></div>`;
  $("pCal").innerHTML=h;
  $("pCal").querySelectorAll("button.pday").forEach(b=>b.onclick=()=>{pSel=b.dataset.k;renderPCal()});
  const list=tasksOn(pSel).sort(sortTasks);
  $("pcDay").innerHTML=`<div class="pgh"><b>${dayLabel(pSel)}</b><button class="plus sm" type="button" id="pcAdd" aria-label="Добавить задачу">+</button></div>`+
    (list.length?`<div class="tlist">${list.map(t=>taskRow(t,pSel)).join("")}</div>`:`<div class="pnone">Задач нет</div>`);
  bindRows($("pcDay"));$("pcAdd").onclick=()=>openQuick({date:pSel});
}

/* ---------- Списки ---------- */
let openListId="inbox";
function renderPLists(){
  const groups=[{id:"inbox",name:"Входящие",color:"var(--muted)",hint:"без даты и списка"},...planner.lists];
  const tasksIn=g=>g.id==="inbox"?planner.tasks.filter(t=>!t.list&&!t.date):planner.tasks.filter(t=>t.list===g.id);
  const openCount=g=>tasksIn(g).filter(t=>t.rep?true:!t.done).length;
  let h=groups.map(g=>{const open=g.id===openListId,all=tasksIn(g),undone=all.filter(t=>t.rep||!t.done).sort((a,b)=>(a.date||"9")<(b.date||"9")?-1:(a.date||"9")>(b.date||"9")?1:sortTasks(a,b)),dn=all.filter(t=>!t.rep&&t.done);
    return `<div class="lcard${open?" open":""}" data-id="${esc(g.id)}"><button class="lhead" type="button"><i style="background:${g.color}"></i><b>${esc(g.name)}</b><span>${openCount(g)||""}</span>${g.id!=="inbox"?`<em class="ledit" role="button" tabindex="0" aria-label="Изменить список">⋯</em>`:""}</button>
      ${open?`<div class="lbody">${undone.length?`<div class="tlist">${undone.map(t=>taskRow(t,t.rep?todayKey():null,{showDate:true,hideList:true})).join("")}</div>`:`<div class="pnone">Пусто</div>`}
        <button class="ghost sm" type="button" data-addl="${esc(g.id)}">+ Задача в «${esc(g.name)}»</button>
        ${dn.length?`<details><summary class="hint" style="cursor:pointer;padding:6px 0">Выполненные · ${dn.length}</summary><div class="tlist">${dn.slice(-30).reverse().map(t=>taskRow(t,null,{showDate:true,hideList:true})).join("")}</div></details>`:""}</div>`:""}</div>`}).join("");
  $("plBody").innerHTML=h;bindRows($("plBody"));
  $("plBody").querySelectorAll(".lcard").forEach(c=>{c.querySelector(".lhead").onclick=e=>{if(e.target.closest(".ledit")){openListEd(planner.lists.find(l=>l.id===c.dataset.id));return}openListId=openListId===c.dataset.id?null:c.dataset.id;renderPLists()}});
  $("plBody").querySelectorAll("[data-addl]").forEach(b=>b.onclick=()=>openQuick(b.dataset.addl==="inbox"?{}:{list:b.dataset.addl}));
}
$("pNewList").onclick=()=>openListEd(null);

/* ---------- редактор списка ---------- */
let editList=null,lColor=LIST_COLORS[0];
function openListEd(l){editList=l||null;lColor=l?l.color:LIST_COLORS[planner.lists.length%LIST_COLORS.length];
  $("plsTitle").textContent=l?"Список":"Новый список";$("plsName").value=l?l.name:"";$("plsDel").hidden=!l;$("plsDel").classList.remove("armed");$("plsDel").textContent="Удалить список";
  renderLColors();openSheet("sh-plist")}
function renderLColors(){$("plsColors").innerHTML=LIST_COLORS.map(c=>`<button type="button" class="cdot" data-c="${c}" style="background:${c}" aria-label="Цвет" aria-pressed="${c===lColor}"></button>`).join("");
  $("plsColors").querySelectorAll(".cdot").forEach(b=>b.onclick=()=>{lColor=b.dataset.c;renderLColors()})}
$("plsSave").onclick=()=>{const n=$("plsName").value.trim();if(!n){toast("Впиши название");return}
  if(editList){editList.name=n;editList.color=lColor;touch(editList)}else{const l=touch({id:uid(),name:n,color:lColor,at:now()});planner.lists.push(l);openListId=l.id}
  save();closeSheet();renderPlanAll()};
$("plsDel").onclick=()=>{const b=$("plsDel");if(!b.classList.contains("armed")){b.classList.add("armed");b.textContent="Точно? Задачи останутся во «Входящих»";return}
  planner.tasks.forEach(t=>{if(t.list===editList.id){t.list=null;touch(t)}});bury(editList.id);planner.lists=planner.lists.filter(l=>l!==editList);save();closeSheet();renderPlanAll()};
function listByName(name,create){const n=name.trim().toLowerCase();let l=planner.lists.find(x=>x.name.toLowerCase()===n);
  if(!l&&create){const nm=name.trim();l=touch({id:uid(),name:nm[0].toUpperCase()+nm.slice(1),color:LIST_COLORS[planner.lists.length%LIST_COLORS.length],at:now()});planner.lists.push(l)}return l}

/* ---------- быстрое добавление ---------- */
let quickPre={};
function openQuick(pre={}){quickPre=pre;$("pqText").value="";renderQuickPrev();openSheet("sh-pquick");setTimeout(()=>$("pqText").focus(),60)}
function quickParsed(){const r=parseQuick($("pqText").value);
  if(!r.date&&quickPre.date)r.date=quickPre.date;
  if(!r.list&&quickPre.list){const l=planner.lists.find(x=>x.id===quickPre.list);if(l)r.list=l.name}
  if(!r.date&&!r.list&&!quickPre.nodate&&tab!=="plists")r.date=todayKey();
  return r}
function renderQuickPrev(){const r=quickParsed();const chips=[];
  if(r.date)chips.push(`<span class="qc">${esc(dayLabel(r.date))}</span>`);else chips.push(`<span class="qc muted">Без даты</span>`);
  if(r.time)chips.push(`<span class="qc">${r.time}${r.end?"–"+r.end:""}</span>`);
  if(r.prio)chips.push(`<span class="qc" style="--pc:${PRIO[r.prio].c}"><i class="pd"></i>${PRIO[r.prio].n}</span>`);
  if(r.list)chips.push(`<span class="qc"># ${esc(r.list)}</span>`);
  if(r.rep)chips.push(`<span class="qc">↻ ${esc(repText(r.rep))}</span>`);
  $("pqPrev").innerHTML=chips.join("");$("pqAdd").disabled=!r.title}
$("pqText").oninput=renderQuickPrev;
function addFromQuick(keepOpen){const r=quickParsed();if(!r.title)return null;
  const l=r.list?listByName(r.list,true):null;
  const t=touch({id:uid(),title:r.title,notes:"",date:r.date||null,time:r.time,end:r.end,prio:r.prio||0,list:l?l.id:null,rep:r.rep,dn:[],done:false,sub:[],at:now()});
  planner.tasks.push(t);save();renderPlanAll();
  if(keepOpen){$("pqText").value="";renderQuickPrev();toast("Добавлено: "+t.title)}else{closeSheet();toast("Добавлено: "+t.title)}
  return t}
$("pqText").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();addFromQuick(true)}});
$("pqAdd").onclick=()=>addFromQuick(false);
$("pqMore").onclick=()=>{const r=quickParsed();const l=r.list?listByName(r.list,true):null;
  openTask(null,{title:r.title,date:r.date||null,time:r.time,end:r.end,prio:r.prio||0,list:l?l.id:null,rep:r.rep})};
document.querySelectorAll("#pqHelp [data-ins]").forEach(b=>b.onclick=()=>{const i=$("pqText");i.value=(i.value.trim()+" "+b.dataset.ins).trim()+" ";renderQuickPrev();i.focus()});

/* ---------- редактор задачи ---------- */
let ed=null,edNew=false,edDelArmed=false;
function openTask(t,draft){
  edNew=!t;ed=t?JSON.parse(JSON.stringify(t)):{id:uid(),title:"",notes:"",date:todayKey(),time:null,end:null,prio:0,list:null,rep:null,dn:[],done:false,sub:[],at:now(),...(draft||{})};
  $("ptTitle2").textContent=edNew?"Новая задача":"Задача";
  $("pteName").value=ed.title;$("pteNotes").value=ed.notes||"";
  edDelArmed=false;$("pteDel").hidden=edNew;$("pteDel").classList.remove("armed");$("pteDel").textContent="Удалить";$("pteDup").hidden=edNew;
  renderEd();openSheet("sh-ptask");
}
function renderEd(){
  $("pteDate").value=ed.date||"";$("pteTime").value=ed.time||"";$("pteEnd").value=ed.end||"";$("pteEndWrap").hidden=!ed.time;
  const t0=todayKey();
  $("pteQuickDate").innerHTML=[["Сегодня",t0],["Завтра",addD(t0,1)],["След. неделя",addD(t0,8-isoDow(new Date()))],["Без даты",""]].map(([n,k])=>`<button type="button" class="chip sm" data-k="${k}" aria-pressed="${(ed.date||"")===k}">${n}</button>`).join("");
  $("pteQuickDate").querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{ed.date=b.dataset.k||null;if(!ed.date){ed.rep=null;ed.time=null;ed.end=null}renderEd()});
  $("ptePrio").innerHTML=[1,2,3,0].map(p=>`<button type="button" class="chip sm pchip" data-p="${p}" style="--pc:${PRIO[p].c}" aria-pressed="${(ed.prio||0)===p}">${p?`<i class="pd"></i>`:""}${PRIO[p].n}</button>`).join("");
  $("ptePrio").querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{ed.prio=+b.dataset.p;renderEd()});
  $("pteList").innerHTML=[`<button type="button" class="chip sm" data-l="" aria-pressed="${!ed.list}">Входящие</button>`,...planner.lists.map(l=>`<button type="button" class="chip sm" data-l="${esc(l.id)}" aria-pressed="${ed.list===l.id}"><i class="pd" style="background:${l.color}"></i>${esc(l.name)}</button>`),`<button type="button" class="chip sm" data-new="1">+ список</button>`].join("");
  $("pteList").querySelectorAll("[data-l]").forEach(b=>b.onclick=()=>{ed.list=b.dataset.l||null;renderEd()});
  $("pteList").querySelector("[data-new]").onclick=()=>{const n=$("pteNewList");n.hidden=false;n.focus()};
  // напоминание
  const remOpts=ed.time?[["0","В момент начала"],["5","За 5 минут"],["15","За 15 минут"],["30","За 30 минут"],["60","За 1 час"],["1440","За 1 день"],["none","Без напоминания"]]:[["none","Без напоминания"],["d9","В 9:00 в этот день"],["p20","Накануне в 20:00"]];
  const curRem=remOf(ed)||"none";
  $("pteRem").innerHTML=remOpts.map(([v,n])=>`<option value="${v}"${v===curRem?" selected":""}>${n}</option>`).join("");
  if(!remOpts.some(o=>o[0]===curRem))$("pteRem").value=remOpts[0][0];
  $("pteRemWrap").hidden=!ed.date;
  const r=ed.rep,f=r?r.f:"";
  $("pteRep").value=f;$("pteDays").hidden=f!=="w";$("pteRep").disabled=!ed.date;
  if(f==="w"){const ds=r.days&&r.days.length?r.days:[isoDow(parseKey(ed.date||t0))];
    $("pteDays").innerHTML=WD_SHORT.map((w,i)=>`<button type="button" class="chip sm" data-d="${i+1}" aria-pressed="${ds.includes(i+1)}">${w}</button>`).join("");
    $("pteDays").querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{const d=+b.dataset.d;let a=ed.rep.days&&ed.rep.days.length?[...ed.rep.days]:[...ds];a=a.includes(d)?a.filter(x=>x!==d):[...a,d].sort();if(!a.length)return;ed.rep.days=a;renderEd()})}
  // подзадачи
  $("pteSubs").innerHTML=(ed.sub||[]).map((s,i)=>`<div class="srow2${s.done?" done":""}"><button type="button" class="tcheck sm" role="checkbox" aria-checked="${!!s.done}" data-i="${i}" aria-label="Подзадача"></button><input value="${esc(s.t)}" data-i="${i}" aria-label="Подзадача"><button type="button" class="x" data-rm="${i}" aria-label="Убрать">×</button></div>`).join("");
  $("pteSubs").querySelectorAll(".tcheck").forEach(b=>b.onclick=()=>{const s=ed.sub[+b.dataset.i];s.done=!s.done;renderEd()});
  $("pteSubs").querySelectorAll("input").forEach(inp=>inp.oninput=()=>{ed.sub[+inp.dataset.i].t=inp.value});
  $("pteSubs").querySelectorAll("[data-rm]").forEach(b=>b.onclick=()=>{ed.sub.splice(+b.dataset.rm,1);renderEd()});
}
$("pteDate").onchange=()=>{ed.date=$("pteDate").value||null;if(!ed.date)ed.rep=null;renderEd()};
$("pteTime").onchange=()=>{ed.time=$("pteTime").value||null;if(!ed.time)ed.end=null;else if(!ed.date)ed.date=todayKey();renderEd()};
$("pteEnd").onchange=()=>{ed.end=$("pteEnd").value||null};
$("pteRem").onchange=()=>{ed.rem=$("pteRem").value};
$("pteCal").onclick=()=>{
  const cur={...ed,title:$("pteName").value.trim()||ed.title,notes:$("pteNotes").value};
  if(!cur.date){toast("Сначала выбери дату");return}
  const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Ascend//План//RU","METHOD:PUBLISH",...icsEvent({...cur,id:cur.id+"-1"}),"END:VCALENDAR"].map(icsFold).join("\r\n");
  openICS(ics,cur.title);
};
$("pteRep").onchange=()=>{const f=$("pteRep").value;ed.rep=f?{f,...(f==="w"?{days:[isoDow(parseKey(ed.date||todayKey()))]}:{})}:null;renderEd()};
$("pteNewList").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();const n=e.target.value.trim();if(!n)return;const l=listByName(n,true);ed.list=l.id;e.target.value="";e.target.hidden=true;save();renderEd()}});
function addSub(){const v=$("pteSubNew").value.trim();if(!v)return;ed.sub=ed.sub||[];ed.sub.push({id:uid(),t:v,done:false});$("pteSubNew").value="";renderEd();$("pteSubNew").focus()}
$("pteSubAdd").onclick=addSub;$("pteSubNew").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();addSub()}});
$("pteSave").onclick=()=>{
  ed.title=$("pteName").value.trim();ed.notes=$("pteNotes").value;if(!ed.title){toast("Впиши название задачи");$("pteName").focus();return}
  ed.sub=(ed.sub||[]).filter(s=>s.t.trim());
  if(edNew){planner.tasks.push(touch(ed))}else{const i=planner.tasks.findIndex(x=>x.id===ed.id);if(i>=0)planner.tasks[i]=touch(ed);else planner.tasks.push(touch(ed))}
  save();closeSheet();renderPlanAll();toast(edNew?"Задача добавлена":"Сохранено")};
$("pteDel").onclick=()=>{if(!edDelArmed){edDelArmed=true;$("pteDel").classList.add("armed");$("pteDel").textContent=ed.rep?"Удалить все повторы?":"Точно удалить?";return}
  bury(ed.id);planner.tasks=planner.tasks.filter(x=>x.id!==ed.id);save();closeSheet();renderPlanAll();toast("Задача удалена")};
$("pteDup").onclick=()=>{const c=touch({...JSON.parse(JSON.stringify(ed)),id:uid(),title:$("pteName").value.trim()+" (копия)",done:false,dn:[],at:now()});planner.tasks.push(c);save();renderPlanAll();openTask(c);toast("Копия создана")};

/* ---------- общее ---------- */
function renderPlanAll(){
  if(tab==="ptoday")renderPToday();else if(tab==="pup")renderPUp();else if(tab==="pcal")renderPCal();else if(tab==="plists")renderPLists();
}
$("pPrevM").onclick=()=>{pMonth=new Date(pMonth.getFullYear(),pMonth.getMonth()-1,1);renderPCal()};
$("pNextM").onclick=()=>{pMonth=new Date(pMonth.getFullYear(),pMonth.getMonth()+1,1);renderPCal()};
$("pFab").onclick=()=>openQuick(tab==="pcal"&&pSel?{date:pSel}:tab==="plists"?(openListId&&openListId!=="inbox"?{list:openListId}:{nodate:true}):{});
// обновляем «Сегодня» раз в минуту (линия текущего времени)
setInterval(()=>{if(!document.hidden&&tab==="ptoday"&&!openSheetEl)renderPToday()},60000);
if(PLAN_TABS.includes(tab))renderPlanAll();
