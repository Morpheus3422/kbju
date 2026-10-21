// Разбор быстрой фразы задачи на русском: «завтра в 18:00 позвонить маме !1 #дом каждую пятницу»
(function(root){
  const WD={пн:1,понедельник:1,понедельника:1,понедельникам:1,вт:2,вторник:2,вторникам:2,ср:3,среда:3,среду:3,средам:3,чт:4,четверг:4,четвергам:4,пт:5,пятница:5,пятницу:5,пятницам:5,сб:6,суббота:6,субботу:6,субботам:6,вс:7,воскресенье:7,воскресеньям:7};
  const MON={январ:1,феврал:2,март:3,апрел:4,ма:5,мая:5,июн:6,июл:7,август:8,сентябр:9,октябр:10,ноябр:11,декабр:12};
  const pad=n=>String(n).padStart(2,"0");
  const key=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const isoDow=d=>(d.getDay()+6)%7+1;
  const addDays=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);
  const nextDow=(base,dow,allowToday)=>{let diff=(dow-isoDow(base)+7)%7;if(diff===0&&!allowToday)diff=7;return addDays(base,diff)};
  const WDRE="понедельник(?:ам|а)?|вторник(?:ам)?|сред(?:у|а|ам)|четверг(?:ам)?|пятниц(?:у|а|ам)|суббот(?:у|а|ам)|воскресень(?:е|ям)|пн|вт|ср|чт|пт|сб|вс";
  const wdNum=w=>{w=w.toLowerCase();if(WD[w])return WD[w];for(const k in WD)if(k.length>2&&w.startsWith(k.slice(0,4)))return WD[k];return null};
  const monNum=w=>{w=w.toLowerCase();for(const k of Object.keys(MON).sort((a,b)=>b.length-a.length))if(w.startsWith(k))return MON[k];return null};

  function parseQuick(input,base=new Date()){
    let s=" "+String(input||"")+" ";
    const out={title:"",date:null,time:null,end:null,prio:0,list:null,rep:null};
    const cut=(re,fn)=>{const m=s.match(re);if(!m)return false;const r=fn(m);if(r===false)return false;s=s.slice(0,m.index)+" "+s.slice(m.index+m[0].length);return true};
    const B="(?<=\\s)",E="(?=[\\s,.!?]|$)";
    // список
    cut(new RegExp(B+"#([\\p{L}\\d_\\-]+)","u"),m=>{out.list=m[1]});
    // приоритет
    cut(new RegExp(B+"!([123])"+E),m=>{out.prio=+m[1]})||cut(new RegExp(B+"(!{1,3})"+E),m=>{out.prio=4-m[1].length});
    // повтор
    cut(new RegExp(B+"(?:каждый день|ежедневно)"+E,"i"),()=>{out.rep={f:"d"}})||
    cut(new RegExp(B+"(?:по будням|каждый будний день)"+E,"i"),()=>{out.rep={f:"wd"}})||
    cut(new RegExp(B+"(?:кажд(?:ый|ую|ое)|по)\\s+((?:(?:"+WDRE+")(?:\\s*(?:,|и)\\s*)?)+)"+E,"i"),m=>{const days=[...m[1].matchAll(new RegExp(WDRE,"gi"))].map(x=>wdNum(x[0])).filter(Boolean);if(!days.length)return false;out.rep={f:"w",days:[...new Set(days)].sort()}})||
    cut(new RegExp(B+"(?:каждую неделю|еженедельно)"+E,"i"),()=>{out.rep={f:"w",days:null}})||
    cut(new RegExp(B+"(?:каждый месяц|ежемесячно)"+E,"i"),()=>{out.rep={f:"m"}})||
    cut(new RegExp(B+"(?:каждый год|ежегодно)"+E,"i"),()=>{out.rep={f:"y"}});
    // время: диапазон, затем одиночное
    const hm=(h,m)=>{h=+h;m=+(m||0);if(h>23||m>59)return null;return pad(h)+":"+pad(m)};
    cut(new RegExp(B+"(?:(?:с|в)\\s*)?(\\d{1,2})(?:[:.](\\d{2}))?\\s*(?:-|–|—|до)\\s*(\\d{1,2})(?:[:.](\\d{2}))?"+E,"i"),m=>{if(!m[2]&&!m[4])return false;const a=hm(m[1],m[2]),b=hm(m[3],m[4]);if(!a||!b)return false;out.time=a;out.end=b})||
    cut(new RegExp(B+"(?:в\\s*)?(\\d{1,2}):(\\d{2})"+E,"i"),m=>{const a=hm(m[1],m[2]);if(!a)return false;out.time=a})||
    cut(new RegExp(B+"в\\s*(\\d{1,2})\\.(\\d{2})"+E,"i"),m=>{const a=hm(m[1],m[2]);if(!a)return false;out.time=a})||
    cut(new RegExp(B+"в\\s+(\\d{1,2})(?:\\s*(?:ч|час(?:а|ов)?))?(?:\\s+(утра|дня|вечера|ночи))?"+E,"i"),m=>{let h=+m[1];if(h>23)return false;const p=(m[2]||"").toLowerCase();if((p==="вечера"||p==="дня")&&h<12)h+=12;if(!p&&h>=1&&h<=7)h+=12;out.time=hm(h,0)});
    if(!out.time)cut(new RegExp(B+"(утром|днём|днем|вечером)"+E,"i"),m=>{out.time={утром:"09:00",днём:"13:00",днем:"13:00",вечером:"19:00"}[m[1].toLowerCase()]});
    // дата
    const today=new Date(base.getFullYear(),base.getMonth(),base.getDate());
    cut(new RegExp(B+"(сегодня|завтра|послезавтра)"+E,"i"),m=>{out.date=key(addDays(today,{сегодня:0,завтра:1,послезавтра:2}[m[1].toLowerCase()]))})||
    cut(new RegExp(B+"через\\s+(\\d+|одну|один|две|два|три|пару)?\\s*(дн(?:ей|я)|день|недел(?:ю|и|ь)|месяц(?:а|ев)?)"+E,"i"),m=>{const nm={одну:1,один:1,две:2,два:2,три:3,пару:2};const n=m[1]?(nm[m[1].toLowerCase()]||+m[1]):1;const u=m[2].toLowerCase();
      out.date=key(u.startsWith("недел")?addDays(today,7*n):u.startsWith("месяц")?new Date(today.getFullYear(),today.getMonth()+n,today.getDate()):addDays(today,n))})||
    cut(new RegExp(B+"(?:на\\s+)?выходных"+E,"i"),()=>{out.date=key(nextDow(today,6,true))})||
    cut(new RegExp(B+"(?:на\\s+)?следующей\\s+неделе"+E,"i"),()=>{out.date=key(nextDow(today,1,false))})||
    cut(new RegExp(B+"(\\d{1,2})[./](\\d{1,2})(?:[./](\\d{2,4}))?"+E),m=>{const d=+m[1],mo=+m[2];if(d<1||d>31||mo<1||mo>12)return false;let y=m[3]?+m[3]:today.getFullYear();if(y<100)y+=2000;let dt=new Date(y,mo-1,d);if(!m[3]&&dt<today)dt=new Date(y+1,mo-1,d);out.date=key(dt)})||
    cut(new RegExp(B+"(\\d{1,2})\\s+(январ[ья]|феврал[ья]|марта?|апрел[ья]|ма[йя]|июн[ья]|июл[ья]|августа?|сентябр[ья]|октябр[ья]|ноябр[ья]|декабр[ья])"+E,"i"),m=>{const mo=monNum(m[2]);let dt=new Date(today.getFullYear(),mo-1,+m[1]);if(dt<today)dt=new Date(today.getFullYear()+1,mo-1,+m[1]);out.date=key(dt)})||
    cut(new RegExp(B+"(?:во?\\s+|на\\s+)?(?:следующ(?:ий|ую|ее)\\s+)?("+WDRE+")"+E,"i"),m=>{const n=wdNum(m[1]);if(!n)return false;out.date=key(nextDow(today,n,!/следующ/i.test(m[0])))});
    // повтор без даты — начинаем с ближайшего подходящего дня
    if(out.rep&&!out.date){
      if(out.rep.f==="w"&&out.rep.days&&out.rep.days.length){let d=today;for(let i=0;i<7;i++){if(out.rep.days.includes(isoDow(d)))break;d=addDays(d,1)}out.date=key(d)}
      else if(out.rep.f==="wd"){let d=today;while(isoDow(d)>5)d=addDays(d,1);out.date=key(d)}
      else out.date=key(today);
    }
    if(out.rep&&out.rep.f==="w"&&!out.rep.days)out.rep.days=[isoDow(new Date(out.date))];
    if(out.time&&!out.date)out.date=key(today);
    let t=s.replace(/\s+/g," ").trim().replace(/^[,.\-–—]+|[,.\-–—]+$/g,"").trim();
    out.title=t?t[0].toUpperCase()+t.slice(1):"";
    return out;
  }
  root.parseQuick=parseQuick;
  if(typeof module!=="undefined")module.exports=parseQuick;
})(typeof window!=="undefined"?window:globalThis);
