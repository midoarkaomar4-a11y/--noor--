Auth.ready.then(function(){
document.documentElement.setAttribute('dir','rtl');document.documentElement.setAttribute('lang','ar');
var ICONS={
 home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
 user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
 book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 21V5"/></svg>',
 quiz:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 9l2 2 3-4M8 16h8"/></svg>',
 rank:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0zM17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3"/></svg>',
 star:'<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6.9 7.4.7-5.6 4.9 1.7 7.3L12 17.8 5.5 21.8l1.7-7.3L1.6 9.6 9 8.9z"/></svg>',
 flame:'<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4 5 6 5 11a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z"/></svg>',
 bolt:'<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
 target:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
 crown:'<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M3 7l5 4 4-7 4 7 5-4-2 12H5z"/></svg>',
 book2:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/></svg>'
};
var PAGES=[['home','الرئيسية','home'],['profile','حسابي','user'],['courses','الكورسات','book'],['quiz','الاختبارات','quiz'],['rank','الترتيب','rank']];

var S={name:'أحمد محمد',grade:'تالتة ثانوي',xp:1240,streak:5,lessons:18,quizzes:7,
  week:[1,1,1,1,1,0,0], badges:{first:true,streak3:true,lesson10:true,quiz5:true,streak7:false,perfect:false,top3:false,xp2000:false}};
var ss=Auth.current();
if(Auth.mode==='server'&&!ss){location.replace('login.html');return}
if(ss&&!ss.admin){S.name=ss.n;if(ss.g)S.grade=ss.g}
(function(){
  var a=document.getElementById('loginLink');if(!a)return;
  if(ss){a.textContent='خروج ('+ss.n+')';a.href='#';a.addEventListener('click',function(e){e.preventDefault();Auth.logout().then(function(){location.reload()})})}
})();
var BADGES=[
 ['first','أول خطوة','أنهيت أول درس','book2'],
 ['streak3','٣ أيام متتالية','ذاكرت 3 أيام ورا بعض','flame'],
 ['lesson10','١٠ دروس','أنهيت 10 دروس','star'],
 ['quiz5','٥ اختبارات','حليت 5 اختبارات','target'],
 ['streak7','أسبوع كامل','٧ أيام متتالية','flame'],
 ['perfect','درجة كاملة','جبت 100% في اختبار','bolt'],
 ['top3','في الثلاثة الأوائل','دخلت أول 3 في الترتيب','crown'],
 ['xp2000','٢٠٠٠ نقطة','وصلت 2000 XP','star']
];
var PEERS=[['يوسف علي',2410],['مريم خالد',2290],['عمر حسن',2105],['سلمى إبراهيم',1890],['كريم طارق',1760],['نور محمود',1625],['هبة سعيد',1480],['مصطفى عادل',1190],['دينا أشرف',1040],['آدم ياسر',915]];
var QS=[
 {q:'وحدة قياس القوة في النظام الدولي هي:',o:['جول','نيوتن','واط','باسكال'],a:1},
 {q:'إذا تضاعفت الكتلة وثبتت القوة، فإن التسارع:',o:['يتضاعف','يظل ثابتًا','يقل للنصف','ينعدم'],a:2},
 {q:'قوة تنتج عن كتلة 2 كجم وتسارع 3 م/ث² تساوي:',o:['5 نيوتن','6 نيوتن','1.5 نيوتن','9 نيوتن'],a:1},
 {q:'السرعة المنتظمة 20 م/ث لمدة 5 ثوانٍ تقطع مسافة:',o:['4 م','25 م','100 م','15 م'],a:2}
];
var curCourse=null,curLessons=[],unsubL=null;
var qi=0,qScore=0,qDone=false,qAns=null,qTab='all',rTab='week',cTab='الكل';

try{var saved=localStorage.getItem('mm-theme');if(saved)document.documentElement.setAttribute('data-theme',saved)}catch(e){}

function lvl(){return Math.floor(S.xp/300)+1}
function inLvl(){return S.xp%300}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function fmt(n){return n.toLocaleString('ar-EG')}
function toast(m){var t=document.getElementById('toast');t.textContent=m;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(function(){t.hidden=true},2600)}
function addXp(n){S.xp+=n;if(S.xp>=2000)S.badges.xp2000=true}
function board(){
  var mult=rTab==='week'?0.18:rTab==='month'?0.55:1;
  var me=rTab==='all'?S.xp:Math.round(S.xp*mult);
  var a=PEERS.map(function(p){return{n:p[0],x:Math.round(p[1]*mult),me:false}});
  a.push({n:S.name,x:me,me:true});
  a.sort(function(x,y){return y.x-x.x});
  return a;
}
function myRank(){var b=board();for(var i=0;i<b.length;i++)if(b[i].me)return i+1;return b.length}

function chrome(cur){
  var n=document.getElementById('nav'),t=document.getElementById('tabbar');
  n.innerHTML=PAGES.map(function(p){return'<a href="#'+p[0]+'"'+(p[0]===cur?' aria-current="page"':'')+'>'+ICONS[p[2]]+p[1]+'</a>'}).join('');
  t.innerHTML=PAGES.map(function(p){return'<a href="#'+p[0]+'"'+(p[0]===cur?' aria-current="page"':'')+'>'+ICONS[p[2]]+'<span>'+p[1]+'</span></a>'}).join('');
  document.getElementById('sLevel').textContent='المستوى '+fmt(lvl());
  document.getElementById('sXp').textContent=fmt(inLvl())+' / ٣٠٠';
  document.getElementById('sBar').style.width=(inLvl()/3)+'%';
}

function ring(){
  var r=54,c=2*Math.PI*r,p=inLvl()/300;
  return '<div class="ring"><svg viewBox="0 0 132 132"><circle cx="66" cy="66" r="'+r+'" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="10"/><circle cx="66" cy="66" r="'+r+'" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-dasharray="'+(c*p).toFixed(1)+' '+c.toFixed(1)+'"/></svg><div class="c"><b class="num">'+fmt(lvl())+'</b><small>المستوى</small></div></div>';
}
function rankRows(list,limit){
  return list.slice(0,limit).map(function(p,i){
    return '<div class="rank-row'+(p.me?' me':'')+'"><div class="pos num'+(i<3?' t1':'')+'">'+fmt(i+1)+'</div><div class="av">'+p.n.charAt(0)+'</div><div class="nm">'+(p.me?'أنت':p.n)+'</div><div class="num"><b>'+fmt(p.x)+'</b> <span class="muted">XP</span></div></div>';
  }).join('');
}

function home(){
  var first=S.name.split(' ')[0];
  return '<section class="hero"><div><h2>أهلاً يا '+first+'، كمّل من حيث وقفت</h2><p>متبقي لك '+fmt(300-inLvl())+' نقطة للوصول إلى المستوى '+fmt(lvl()+1)+'. حل اختبار اليوم واحصل على نقاط إضافية.</p><div class="actions"><a class="btn light" href="#courses" style="text-decoration:none">كمّل الكورس</a><a class="btn" href="#quiz" style="text-decoration:none;background:rgba(255,255,255,.18)">اختبار اليوم</a></div><div class="formulas"><span>F = ma</span><span>E = mc²</span><span>v = d / t</span></div></div>'+ring()+'</section>'
  +'<div class="grid3">'
  +'<div class="card stat"><span>سلسلة الأيام</span><b class="num">'+fmt(S.streak)+' أيام</b><span>استمر لتحصل على شارة الأسبوع الكامل</span></div>'
  +'<div class="card stat"><span>دروس مكتملة</span><b class="num">'+fmt(S.lessons)+'</b><span>من أصل ٦٠ درسًا في كورساتك</span></div>'
  +'<div class="card stat"><span>ترتيبك هذا الأسبوع</span><b class="num">#'+fmt(myRank())+'</b><span>بين ١١ طالبًا في دفعتك</span></div>'
  +'</div>'
  +'<div class="grid3" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">'
  +'<div class="card"><h3>آخر درس شاهدته</h3><div class="muted">الميكانيكا: الحركة والقوى</div><b>الدرس ١٩: تطبيقات على قانون نيوتن الثاني</b><div class="bar"><i style="width:75%"></i></div><div class="row" style="justify-content:space-between"><span class="muted num">٧٥٪ مكتمل</span><a class="btn" href="#courses" style="text-decoration:none;padding:8px 14px">تابع</a></div></div>'
  +'<div class="card"><div class="row" style="justify-content:space-between"><h3>المتصدرون</h3><a href="#rank" class="muted">عرض الكل</a></div>'+rankRows(board(),3)+'</div>'
  +'</div>'
  +'<p class="note">كل الأسماء والأرقام هنا بيانات تجريبية لعرض التصميم.</p>';
}

function profile(){
  var earned=Object.keys(S.badges).filter(function(k){return S.badges[k]}).length;
  var days=['س','ح','ن','ث','ر','خ','ج'];
  return '<div class="page-head"><div><h1>حسابي</h1><p>تقدمك ونقاطك وإنجازاتك في مكان واحد</p></div></div>'
  +'<div class="card"><div class="prof"><div class="big">'+S.name.charAt(0)+'</div><div style="min-width:0"><h2 style="font-size:22px">'+S.name+'</h2><div class="muted">'+S.grade+'</div><div class="row" style="margin-top:8px;flex-wrap:wrap"><span class="chip-xp num">'+fmt(S.xp)+' XP</span><span class="muted">المستوى '+fmt(lvl())+'</span></div></div></div><div class="bar"><i style="width:'+(inLvl()/3)+'%"></i></div><span class="muted num">'+fmt(inLvl())+' من ٣٠٠ نقطة للمستوى التالي</span></div>'
  +'<div class="grid3" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">'
  +'<div class="card stat"><b class="num">'+fmt(S.lessons)+'</b><span>درس مكتمل</span></div>'
  +'<div class="card stat"><b class="num">'+fmt(S.quizzes)+'</b><span>اختبار تم حله</span></div>'
  +'<div class="card stat"><b class="num">'+fmt(S.streak)+'</b><span>يوم متتالي</span></div>'
  +'<div class="card stat"><b class="num">#'+fmt(myRank())+'</b><span>الترتيب</span></div></div>'
  +'<div class="card"><h3>هذا الأسبوع</h3><div class="week">'+S.week.map(function(v,i){return'<div class="'+(v?'on':'')+'">'+days[i]+'</div>'}).join('')+'</div></div>'
  +'<div class="card"><div class="row" style="justify-content:space-between"><h3>الشارات</h3><span class="muted num">'+fmt(earned)+' من '+fmt(BADGES.length)+'</span></div><div class="badges">'+BADGES.map(function(b){return'<div class="badge'+(S.badges[b[0]]?'':' lock')+'"><div class="ic">'+ICONS[b[3]]+'</div><b>'+b[1]+'</b><span>'+b[2]+'</span></div>'}).join('')+'</div></div>';
}

function courses(){
  var gs=['الكل','أولى ثانوي','تانية ثانوي','تالتة ثانوي'];
  var list=CourseStore.list.filter(function(c){return c.on!==false&&(cTab==='الكل'||c.g===cTab)});
  return '<div class="page-head"><div><h1>الكورسات</h1><p>اختر المرحلة وتابع تقدمك في كل كورس</p></div></div>'
  +'<div class="tabs" role="group" aria-label="المرحلة">'+gs.map(function(g){return'<button class="tab" type="button" data-c="'+g+'" aria-pressed="'+(g===cTab)+'">'+g+'</button>'}).join('')+'</div>'
  +(list.length?'<div class="grid3">'+list.map(function(c,i){var p=c.l?Math.round((c.d||0)/c.l*100):0;return'<article class="card course"><div class="cover" style="background:'+esc(c.c||'#2f3a78')+'">'+fmt(i+1)+'</div><div class="body"><span class="tag">'+esc(c.g)+'</span><h3>'+esc(c.t)+'</h3><div class="bar"><i style="width:'+p+'%"></i></div><div class="row" style="justify-content:space-between"><span class="muted num">'+fmt(c.d||0)+' من '+fmt(c.l)+' درس</span><span class="num"><b>'+fmt(p)+'٪</b></span></div><button class="btn" type="button" data-open="'+esc(c.id)+'">'+((c.d||0)===0?'ابدأ الكورس':c.d===c.l?'راجع الكورس':'كمّل')+'</button></div></article>'}).join('')+'</div>':'<div class="card"><p class="muted">لا توجد كورسات منشورة في هذه المرحلة حاليًا.</p></div>');
}

function openCourse(id){
  if(unsubL)unsubL();
  curCourse=id;curLessons=[];
  unsubL=CourseStore.watchLessons(id,function(a){curLessons=a;if(cur()==='course')render()});
}
function safeUrl(u){return /^https?:\/\//i.test(u||'')?u:'#'}
function lessonCard(l,i){
  var h='<div class="card lcard"><div class="row" style="justify-content:space-between"><h3>'+fmt(i+1)+'. '+esc(l.t)+'</h3><span class="tag">'+(l.k==='video'?'فيديو':l.k==='pdf'?'ملف PDF':'رابط')+'</span></div>';
  if(l.k==='video'&&l.src)h+='<video controls preload="metadata" src="'+esc(l.src)+'"></video>';
  else if(l.k==='pdf'&&l.src)h+='<a class="btn" style="text-decoration:none;justify-self:start" href="'+esc(l.src)+'" target="_blank" rel="noopener">فتح الملف</a>';
  else if(l.k!=='link')h+='<p class="muted">الملف غير متاح حاليًا.</p>';
  else h+='<a class="btn" style="text-decoration:none;justify-self:start" href="'+esc(safeUrl(l.u))+'" target="_blank" rel="noopener">فتح الرابط</a>';
  return h+'</div>';
}
function course(){
  var c=CourseStore.list.filter(function(x){return x.id===curCourse})[0];
  if(!c)return '<div class="page-head"><div><h1>الكورس غير موجود</h1></div></div><a class="btn" href="#courses" style="text-decoration:none;justify-self:start">الرجوع للكورسات</a>';
  return '<div class="page-head"><div><a class="muted" href="#courses">← الكورسات</a><h1>'+esc(c.t)+'</h1><p>'+esc(c.g)+'</p></div></div>'
   +(curLessons.length?curLessons.map(lessonCard).join(''):'<div class="card"><p class="muted">لم تتم إضافة دروس لهذا الكورس بعد.</p></div>');
}

function quiz(){
  var h='<div class="page-head"><div><h1>الاختبارات</h1><p>اختبار اليوم: ٤ أسئلة، كل إجابة صحيحة بعشرين نقطة</p></div><span class="chip-xp num">+'+fmt(80+20)+' XP كحد أقصى</span></div>';
  if(qDone){
    var pct=Math.round(qScore/QS.length*100);
    return h+'<div class="card result"><span class="muted">نتيجتك</span><b class="num">'+fmt(pct)+'٪</b><p>أجبت صح على '+fmt(qScore)+' من '+fmt(QS.length)+' أسئلة، وكسبت '+fmt(qScore*20+(qScore===QS.length?20:0))+' نقطة.</p><div class="row"><button class="btn" type="button" id="qAgain">حاول مرة أخرى</button><a class="btn ghost" href="#rank" style="text-decoration:none">شوف ترتيبك</a></div></div>';
  }
  var q=QS[qi];
  return h+'<div class="card"><div class="q-top"><span class="num">السؤال '+fmt(qi+1)+' من '+fmt(QS.length)+'</span><span class="num">الدرجة '+fmt(qScore)+'</span></div><div class="bar"><i style="width:'+(qi/QS.length*100)+'%"></i></div><div class="q-text" style="margin-top:6px">'+q.q+'</div><div>'+q.o.map(function(o,i){
    var cls='q-opt';if(qAns!==null){if(i===q.a)cls+=' ok';else if(i===qAns)cls+=' bad'}
    return'<button class="'+cls+'" type="button" data-o="'+i+'"'+(qAns!==null?' disabled':'')+'>'+o+'</button>'}).join('')+'</div>'
  +(qAns!==null?'<div class="row" style="justify-content:space-between;margin-top:6px"><span class="'+(qAns===q.a?'':'muted')+'">'+(qAns===q.a?'إجابة صحيحة، أحسنت':'الإجابة الصحيحة: '+q.o[q.a])+'</span><button class="btn" type="button" id="qNext">'+(qi===QS.length-1?'اعرض النتيجة':'السؤال التالي')+'</button></div>':'')+'</div>'
  +'<p class="note">الأسئلة أمثلة تجريبية لشكل الاختبار.</p>';
}

function rank(){
  var tabs=[['week','هذا الأسبوع'],['month','هذا الشهر'],['all','كل الأوقات']];
  return '<div class="page-head"><div><h1>لوحة الترتيب</h1><p>تنافس مع زملائك واصعد في الترتيب</p></div></div>'
  +'<div class="tabs" role="group" aria-label="الفترة">'+tabs.map(function(t){return'<button class="tab" type="button" data-r="'+t[0]+'" aria-pressed="'+(t[0]===rTab)+'">'+t[1]+'</button>'}).join('')+'</div>'
  +'<div class="card">'+rankRows(board(),11)+'</div>';
}

var VIEWS={course:course,home:home,profile:profile,courses:courses,quiz:quiz,rank:rank};
function cur(){var h=(location.hash||'').replace('#','');return VIEWS[h]?h:'home'}
function render(){
  var c=cur();
  if(c==='course'&&!curCourse){location.hash='#courses';return}
  if(myRank()<=3)S.badges.top3=true;
  chrome(c==='course'?'courses':c);
  document.getElementById('view').innerHTML=VIEWS[c]();
}
window.addEventListener('hashchange',function(){render();window.scrollTo(0,0)});

document.addEventListener('click',function(e){
  var t=e.target.closest('button');if(!t)return;
  if(t.dataset.c){cTab=t.dataset.c;render()}
  else if(t.dataset.r){rTab=t.dataset.r;render()}
  else if(t.dataset.open){openCourse(t.dataset.open);location.hash='#course'}
  else if(t.dataset.o!==undefined&&qAns===null){
    qAns=+t.dataset.o;if(qAns===QS[qi].a)qScore++;render();
  }
  else if(t.id==='qNext'){
    qAns=null;
    if(qi===QS.length-1){
      qDone=true;var gain=qScore*20+(qScore===QS.length?20:0);addXp(gain);S.quizzes++;
      if(qScore===QS.length)S.badges.perfect=true;
      toast('كسبت '+fmt(gain)+' نقطة');
    }else qi++;
    render();
  }
  else if(t.id==='qAgain'){qi=0;qScore=0;qDone=false;qAns=null;render()}
  else if(t.id==='themeBtn'){
    var d=document.documentElement,dark=getComputedStyle(d).colorScheme.indexOf('dark')>-1;
    var nx=dark?'light':'dark';d.setAttribute('data-theme',nx);
    try{localStorage.setItem('mm-theme',nx)}catch(x){}
  }
});
CourseStore.onChange(function(){render()});
render();
});
