/* Справочник упражнений: как выглядит, как делать, чем заменить */
const EX_INFO=(()=>{
  const A=(name,q,how,w)=>({name,q,how,w});
  const D={
  "leg press":{q:"45 degree leg press machine",how:"Тренажёр с наклонной платформой под 45°. Садишься спиной на сиденье, стопы на платформе на ширине плеч, выжимаешь её вверх. Колени не сводить внутрь, поясницу не отрывать.",alts:[
    A("Hack squat","hack squat machine","Стоишь спиной к наклонной подушке, упоры на плечах, приседаешь. Ближе всего к жиму ногами.","60"),
    A("Smith squat","smith machine squat","Присед со штангой на направляющих, стопы чуть впереди.","40"),
    A("Seated leg press","seated horizontal leg press machine","Жим ногами сидя, платформа перед тобой.","70"),
    A("Goblet squat","dumbbell goblet squat","Присед с одной гантелью у груди — если всё занято.","20")]},
  "hip thrust":{q:"hip thrust machine",how:"Сидишь спиной на подушке, ремень или валик на тазу, выталкиваешь таз вверх до прямой линии корпуса. Вверху пауза 1 с, сжать ягодицы.",alts:[
    A("Barbell hip thrust","barbell hip thrust bench","Лопатки на скамье, штанга с мягкой накладкой на тазу.","40"),
    A("Smith hip thrust","smith machine hip thrust","То же в Смите — штанга не скатывается, удобнее ставить.","40"),
    A("Glute bridge","glute bridge dumbbell floor","Мост лёжа на полу с гантелью или блином на тазу.","20"),
    A("Cable kickback","cable glute kickback","Отведение ноги назад в кроссовере — если нет ничего другого.","10")]},
  "romanian deadlift":{q:"dumbbell romanian deadlift",how:"Стоя, гантели в руках. Колени чуть согнуты, таз уводишь назад, гантели скользят вдоль ног до середины голени. Спина прямая, чувствуешь растяжение задней поверхности бедра.",alts:[
    A("Barbell RDL","barbell romanian deadlift","То же со штангой.","40"),
    A("Back extension","45 degree back extension hyperextension","Гиперэкстензия: упор бёдрами, наклон вниз и подъём. Бережнее для спины.",""),
    A("Smith RDL","smith machine romanian deadlift","Румынская тяга в Смите — не нужно держать равновесие.","40")]},
  "bulgarian split squat":{q:"dumbbell bulgarian split squat",how:"Задняя нога носком на скамье, передней приседаешь до бедра параллельно полу. Гантели в руках, корпус чуть вперёд. Повторы на каждую ногу.",alts:[
    A("Lunges","dumbbell walking lunges","Выпады с гантелями вперёд или назад — проще по равновесию.","10"),
    A("Smith lunges","smith machine reverse lunge","Выпады в Смите — можно держаться за гриф.","20"),
    A("Step-up","dumbbell step up box","Шаг вверх на скамью или тумбу с гантелями.","10"),
    A("Single-leg press","single leg press machine","Жим ногами одной ногой — если колени не любят выпады.","40")]},
  "brusya press":{q:"captain's chair knee raise",how:"Пресс на брусьях («капитанский стул»): упор на предплечья, спина к спинке, ноги висят. Поднимаешь колени к груди и чуть подкручиваешь таз вверх — работает пресс, а не только бёдра. Без раскачки, вниз медленно. Когда 3×15 легко — прямые ноги или гантель между стоп.",alts:[
    A("Hanging knee raise","hanging knee raise pull up bar","То же в висе на турнике — сложнее, держишься руками.",""),
    A("Reverse crunch","reverse crunch bench","Лёжа на скамье, поднимаешь таз и колени к груди.",""),
    A("Cable crunch","cable crunch kneeling","Скручивания на коленях у верхнего блока с канатом.","30"),
    A("Plank","plank exercise","Планка 45–60 с вместо повторов.","")]},
  "incline chest hammer":{q:"hammer strength incline chest press",how:"Жимовой тренажёр на наклонной скамье, рычаги с дисками. Лопатки сведены, локти под ~45°, жмёшь вверх-вперёд.",alts:[
    A("Incline DB press","incline dumbbell press","Жим гантелей на наклонной скамье 30°. Вес одной гантели.","14"),
    A("Incline Smith press","incline smith machine bench press","Жим в Смите на наклонной скамье.","30"),
    A("Incline machine press","incline chest press machine","Любой другой наклонный жимовой тренажёр.","30")]},
  "chest press":{q:"seated chest press machine",how:"Жимовой тренажёр сидя, ручки на уровне середины груди. Жмёшь вперёд, локти не выше плеч.",alts:[
    A("DB bench press","dumbbell bench press","Жим гантелей лёжа. Вес одной гантели.","14"),
    A("Bench press","barbell bench press","Жим штанги лёжа.","40"),
    A("Push-ups","push ups","Отжимания от пола, можно с весом на спине.","")]},
  "pec deck":{q:"pec deck fly machine",how:"«Бабочка»: сидя, руки на рукоятках или подушках, сводишь их перед грудью. Пауза 1 с в сведении.",alts:[
    A("Cable fly","cable crossover chest fly","Сведения в кроссовере стоя.","10"),
    A("DB fly","dumbbell chest fly","Разводки гантелей лёжа.","8")]},
  "pulldown":{q:"lat pulldown machine",how:"Тяга верхнего блока к груди сидя, бёдра под валиком. Тянешь локтями вниз, грудь вперёд.",alts:[
    A("Assisted pull-up","assisted pull up machine gravitron","Подтягивания в гравитроне.",""),
    A("Pull-up","pull up","Подтягивания на турнике.",""),
    A("Machine pulldown","plate loaded lat pulldown machine","Рычажная тяга сверху.","50")]},
  "row":{q:"seated cable row machine",how:"Горизонтальная тяга сидя к поясу. Спина прямая, тянешь локтями назад, сводишь лопатки.",alts:[
    A("One-arm DB row","one arm dumbbell row bench","Тяга гантели одной рукой с упором в скамью.","20"),
    A("Chest-supported row","chest supported row machine","Тяга с упором грудью — спина не устаёт.","40"),
    A("T-bar row","t bar row","Тяга Т-грифа.","30")]},
  "overhead press":{q:"seated dumbbell shoulder press",how:"Жим над головой сидя. Спина прижата, жмёшь вверх, внизу локти чуть впереди корпуса.",alts:[
    A("Shoulder press machine","shoulder press machine","Тренажёр для жима плеч.","30"),
    A("Smith shoulder press","smith machine shoulder press","Жим сидя в Смите.","20")]},
  "lateral raise":{q:"dumbbell lateral raise",how:"Махи гантелями в стороны до уровня плеч, локти чуть согнуты, без раскачки.",alts:[
    A("Cable lateral raise","cable lateral raise","Махи одной рукой в кроссовере — нагрузка ровнее.","5"),
    A("Lateral raise machine","lateral raise machine","Тренажёр для махов в стороны.","20")]},
  "rear delt":{q:"reverse pec deck rear delt machine",how:"«Обратная бабочка»: сидя лицом к спинке, разводишь руки назад. Задняя дельта.",alts:[
    A("Rear delt DB raise","bent over dumbbell rear delt raise","Разведения гантелей в наклоне.","5"),
    A("Face pull","cable face pull","Тяга каната к лицу в кроссовере.","15")]},
  "biceps":{q:"dumbbell bicep curl",how:"Сгибания рук с гантелями стоя или сидя, локти неподвижно у корпуса.",alts:[
    A("Hammer curl","dumbbell hammer curl","«Молотки»: гантели нейтральным хватом.","10"),
    A("Cable curl","cable bicep curl","Сгибания на нижнем блоке.","15"),
    A("Preacher curl","preacher curl machine","Сгибания на скамье Скотта.","20")]},
  "triceps press":{q:"seated triceps press dip machine",how:"Тренажёр сидя: ручки по бокам, выжимаешь их вниз до почти прямых рук. Корпус прямо, локти к телу.",alts:[
    A("Triceps pushdown","cable triceps pushdown rope","Разгибания на верхнем блоке с канатом.","20"),
    A("Triceps extension machine","seated triceps extension machine","Разгибания сидя, локти на подушке.","25")]},
  "overhead triceps extension":{q:"overhead dumbbell triceps extension",how:"Разгибание рук из-за головы с гантелью или канатом, локти смотрят вверх.",alts:[
    A("Cable overhead extension","cable overhead triceps extension rope","То же на блоке с канатом.","15"),
    A("Skull crusher","ez bar skull crusher","Французский жим лёжа.","20")]},
  "db bench press":{q:"dumbbell bench press",how:"Жим гантелей лёжа на горизонтальной скамье. Лопатки сведены, стопы в пол, локти под ~45°, гантели опускаешь до уровня груди. Вес одной гантели.",alts:[
    A("Chest press","seated chest press machine","Жим в тренажёре сидя.","30"),
    A("Smith bench press","smith machine bench press","Жим лёжа в Смите.","30"),
    A("Dips","parallel bar dips chest","Отжимания на брусьях с наклоном корпуса вперёд.","")]},
  "leg extension":{q:"leg extension machine",how:"Разгибание ног сидя, валик на голени. Вверху пауза 1 с, вниз медленно.",alts:[
    A("Sissy squat","sissy squat","Сисси-присед — сложный, но без тренажёра.",""),
    A("Single-leg extension","single leg extension machine","Тот же тренажёр по одной ноге.","25")]},
  "podjem v kolenyah zsadi":{q:"lying leg curl machine",how:"Сгибание ног в тренажёре — лёжа или сидя, валик над пяткой. Задняя поверхность бедра. Вниз медленно.",alts:[
    A("Seated leg curl","seated leg curl machine","Сгибание ног сидя.","40"),
    A("Lying leg curl","lying leg curl machine","Сгибание ног лёжа.","35"),
    A("Nordic curl","nordic hamstring curl","Нордические сгибания — без тренажёра, очень тяжело.","")]},
  "hip abduction":{q:"hip abduction machine",how:"Разведение ног сидя — внешняя сторона бёдер и средняя ягодичная.",alts:[
    A("Cable abduction","cable hip abduction","Отведение ноги в сторону в кроссовере.","10"),
    A("Band side walk","resistance band lateral walk","Шаги в сторону с резинкой.","")]},
  "hip adduction":{q:"hip adduction machine",how:"Сведение ног сидя — внутренняя сторона бёдер.",alts:[
    A("Cable adduction","cable hip adduction","Приведение ноги в кроссовере.","10"),
    A("Copenhagen plank","copenhagen plank","Боковая планка с ногой на скамье.","")]},
  "calf raises":{q:"standing calf raise machine",how:"Подъёмы на носки. Внизу полное растяжение, вверху пауза 1 с.",alts:[
    A("Seated calf raise","seated calf raise machine","Сидя — больше камбаловидная мышца.","40"),
    A("Leg press calf raise","calf raise on leg press","Носками на краю платформы жима ногами.","80"),
    A("Smith calf raise","smith machine calf raise","Стоя в Смите на степе.","60")]},
  "mts crunch":{q:"ab crunch machine",how:"Скручивания в тренажёре: сгибаешь корпус, не тянешь руками, выдох в сокращении.",alts:[
    A("Cable crunch","cable crunch kneeling","Скручивания на коленях у верхнего блока с канатом.","30"),
    A("brusya press","captain's chair knee raise","Пресс на брусьях — подъём коленей в упоре.","")]},
  };
  // замены знают про своё основное упражнение и «соседей»
  Object.entries(D).forEach(([k,v])=>v.alts.forEach(a=>{const ak=a.name.toLowerCase();if(!D[ak])D[ak]={q:a.q,how:a.how,alts:[],of:k}}));
  return D;
})();
function exInfo(name){const k=exKey(name);let i=EX_INFO[k];if(!i)return null;
  if(i.of){const base=EX_INFO[i.of],baseName=(gym.plans.flatMap(p=>p.ex).find(e=>exKey(e.name)===i.of)||{}).name||i.of.replace(/\b\w/g,c=>c.toUpperCase());
    return {...i,alts:[{name:baseName,q:base.q,how:base.how,w:""},...base.alts.filter(a=>a.name.toLowerCase()!==k)]}}
  return i}
const photoUrl=q=>"https://www.google.com/search?tbm=isch&q="+encodeURIComponent(q);
let infoTarget=null; // {name, ix} — ix: номер упражнения в текущей тренировке, если открыто из неё
function openExInfo(name,ix){
  const i=exInfo(name);infoTarget={name,ix};
  const fromWork=ix!=null&&openSheetEl&&openSheetEl.id==="sh-work";
  if(fromWork)$("sh-exinfo").dataset.parent="sh-work";else if(openSheetEl&&openSheetEl.id==="sh-exh")$("sh-exinfo").dataset.parent="sh-exh";else delete $("sh-exinfo").dataset.parent;
  $("xiTitle").textContent=name;
  const B=$("xiBody");
  if(!i){B.innerHTML=`<div class="empty">Для этого упражнения пока нет описания.</div><a class="btn go wide" href="${photoUrl(name+" exercise")}" target="_blank" rel="noopener" style="text-align:center;text-decoration:none">Фото в интернете</a>`;openSheet("sh-exinfo");return}
  const it=fromWork&&work?work.items[ix]:null,hasDone=it&&(it.dn||[]).some(Boolean);
  B.innerHTML=`<div class="xicard"><div class="xihow">${esc(i.how)}</div><a class="btn go" href="${photoUrl(i.q)}" target="_blank" rel="noopener">Фото тренажёра</a></div>
    ${i.alts.length?`<h2>Чем заменить</h2><div class="xialts">${i.alts.map((a,n)=>{const l=lastOf(a.name);return `<div class="xialt"><div class="t"><b>${esc(a.name)}</b><span>${esc(a.how)}</span>${l?`<em>Прошлый раз: ${l.w?fmtW(l.w)+" "+uName(l.unit)+" · ":""}${l.sets.join(" ")}</em>`:a.w?`<em>Ориентир: ${esc(a.w)} кг</em>`:""}</div>
      <div class="b"><a class="btn sm" href="${photoUrl(a.q)}" target="_blank" rel="noopener">Фото</a>${fromWork?`<button class="btn sm go" type="button" data-swap="${n}">Заменить</button>`:""}</div></div>`}).join("")}</div>`:""}
    ${fromWork&&hasDone?`<div class="hint">В этом упражнении уже есть выполненные подходы — при замене они останутся у «${esc(name)}», а замена начнётся с чистых подходов.</div>`:""}`;
  B.querySelectorAll("[data-swap]").forEach(b=>b.onclick=()=>swapExercise(ix,i.alts[+b.dataset.swap]));
  openSheet("sh-exinfo");
}
function swapExercise(ix,a){
  if(!work||!work.items[ix])return;const old=work.items[ix],l=lastOf(a.name,work.id);
  const fresh={id:uid(),name:a.name,unit:l?.unit||old.unit||gym.unit,w:l?.w||a.w||"",sets:Array(Math.max(old.sets.length,l?.sets.length||0,3)).fill(null),dn:[],goal:old.goal,rest:old.rest,note:`Замена «${old.name}». ${a.how}`};
  if((old.dn||[]).some(Boolean)){old.sets=old.sets.filter((r,i)=>old.dn[i]);old.dn=old.sets.map(()=>true);work.items.splice(ix+1,0,fresh)}
  else work.items[ix]=fresh;
  touch(work);gSaveSoon();openSheet("sh-work");renderWork();toast(`Заменено на «${a.name}»`);
}
