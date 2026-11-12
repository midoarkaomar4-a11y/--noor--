Auth.ready.then(function(){
if(!Auth.isAdmin()){location.replace('login.html');return}
var students=[],q='';
function fmt(n){return n.toLocaleString('ar-EG')}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function $(id){return document.getElementById(id)}
function toast(m){var t=$('toast');t.textContent=m;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(function(){t.hidden=true},2400)}
function fail(){toast('تعذّر الحفظ. تأكد إنك داخل بحساب الإدارة وإن الاتصال شغال.')}

/* ---------- الطلاب ---------- */
function loadStudents(){return Auth.students.list().then(function(l){students=l;render()}).catch(function(){})}
function render(){
  var courses=CourseStore.list;
  var xp=students.reduce(function(a,s){return a+(s.x||0)},0);
  $('stats').innerHTML=
   '<div class="card stat"><span>عدد الطلاب</span><b class="num">'+fmt(students.length)+'</b></div>'+
   '<div class="card stat"><span>الكورسات المنشورة</span><b class="num">'+fmt(courses.filter(function(c){return c.on!==false}).length)+' من '+fmt(courses.length)+'</b></div>'+
   '<div class="card stat"><span>إجمالي النقاط</span><b class="num">'+fmt(xp)+'</b></div>';
  var list=students.filter(function(s){return !q||(s.n||'').indexOf(q)>-1||(s.p||'').indexOf(q)>-1||(s.gn||'').indexOf(q)>-1});
  var ph=function(v){return '<td class="num" dir="ltr" style="text-align:start">'+esc(v)+'</td>'};
  $('rows').innerHTML=list.length?list.map(function(s){
    return '<tr><td>'+esc(s.n)+'</td><td>'+esc(s.gn)+'</td>'+ph(s.p)+ph(s.gp)+'<td>'+esc(s.g)+'</td><td class="num">'+fmt(s.x||0)+'</td><td><button class="del" type="button" data-d="'+esc(s.id)+'">حذف</button></td></tr>'}).join('')
    :'<tr><td colspan="7" class="muted">لا يوجد طلاب مطابقين.</td></tr>';
  $('courses').innerHTML=courses.length?courses.map(function(c){
    return '<div class="crow"><span>'+esc(c.t)+' <span class="muted">· '+esc(c.g)+' · '+fmt(c.l)+' درس</span></span><span class="row"><button class="pill" type="button" data-m="'+esc(c.id)+'">المحتوى</button><button class="pill'+(c.on!==false?' on':'')+'" type="button" data-c="'+esc(c.id)+'" aria-pressed="'+(c.on!==false)+'">'+(c.on!==false?'منشور':'مخفي')+'</button><button class="del" type="button" data-x="'+esc(c.id)+'">حذف</button></span></div>'}).join('')
    :'<p class="muted">لا توجد كورسات بعد. أضف أول كورس من النموذج أعلاه.</p>';
}
if(!Auth.students.canAdd){$('add').hidden=true;$('addNote').hidden=false}
$('q').addEventListener('input',function(e){q=e.target.value.trim();render()});
$('add').addEventListener('submit',function(e){
  e.preventDefault();var f=e.target;
  Auth.students.add({n:$('n').value,gn:$('gn').value,p:$('ph').value,gp:$('gp').value,g:$('g').value,pw:$('pw').value})
   .then(loadStudents).then(function(){f.reset();$('g').value='تالتة ثانوي';toast('تمت إضافة الطالب')}).catch(fail);
});

/* ---------- الكورسات ---------- */
$('addc').addEventListener('submit',function(e){
  e.preventDefault();var f=e.target;
  CourseStore.add({t:$('ct').value.trim(),g:$('cg').value,l:Math.max(1,+$('cl').value||1)})
   .then(function(){f.reset();$('cg').value='تالتة ثانوي';$('cl').value=10;toast('تمت إضافة الكورس، وظهر في المنصة')}).catch(fail);
});

/* ---------- محتوى الكورس ---------- */
var openId=null,unL=null;
function openPanel(id){
  var c=CourseStore.list.filter(function(x){return x.id===id})[0];if(!c)return;
  if(unL)unL();openId=id;
  $('panel').hidden=false;
  $('ptitle').textContent='محتوى: '+c.t;
  $('lessons').innerHTML='<p class="muted">جاري التحميل...</p>';
  unL=CourseStore.watchLessons(id,renderLessons);
  $('panel').scrollIntoView({behavior:'smooth'});
}
function closePanel(){if(unL)unL();unL=null;openId=null;$('panel').hidden=true}
function renderLessons(a){
  var K={video:'فيديو',pdf:'PDF',link:'رابط'};
  $('lessons').innerHTML=a.length?a.map(function(l,i){
    return '<div class="crow"><span>'+fmt(i+1)+'. '+esc(l.t)+' <span class="muted">· '+(K[l.k]||'')+'</span></span><button class="del" type="button" data-ld="'+esc(l.id)+'" data-a="'+esc(l.a||'')+'">حذف</button></div>'}).join('')
    :'<p class="muted">لا توجد دروس في هذا الكورس بعد.</p>';
}
function delLesson(lid,asset){
  CourseStore.removeLesson(openId,lid).then(function(){
    toast('تم حذف الدرس');
    if(asset&&window.claude&&window.claude.use)window.claude.use('assets').then(function(as){if(as)as.delete(asset)}).catch(function(){});
  }).catch(fail);
}
var lk=$('lk'),lf=$('lf'),lu=$('lu');
function kindUi(){
  var link=lk.value==='link';
  lf.hidden=link;lu.hidden=!link;lf.required=!link;lu.required=link;
  lf.accept=lk.value==='pdf'?'application/pdf':'video/*';
}
lk.addEventListener('change',kindUi);kindUi();
$('limit').textContent=CourseStore.maxMB;
$('addl').addEventListener('submit',function(e){
  e.preventDefault();
  var k=lk.value,title=$('lt').value.trim(),btn=$('lbtn'),form=e.target;
  function done(ok){btn.disabled=false;btn.textContent='إضافة الدرس';if(ok){form.reset();kindUi();toast('تمت إضافة الدرس')}}
  btn.disabled=true;btn.textContent='جاري الحفظ...';
  if(k==='link'){
    var url=lu.value.trim();
    if(!/^https?:\/\//i.test(url)){toast('اكتب رابطًا صحيحًا يبدأ بـ https');return done(false)}
    CourseStore.addLesson(openId,{t:title,k:'link',u:url,order:Date.now()}).then(function(){done(true)}).catch(function(){fail();done(false)});
    return;
  }
  var f=lf.files[0];
  if(!f){toast('اختر ملفًا أولًا');return done(false)}
  if(f.size>CourseStore.maxMB*1024*1024){toast('الملف أكبر من '+CourseStore.maxMB+' ميجا. استخدم رابط بدلًا منه.');return done(false)}
  if(!CourseStore.canUpload()){toast('رفع الملفات غير متاح في الوضع التجريبي. استخدم رابط.');return done(false)}
  btn.textContent='جاري الرفع...';
  CourseStore.upload(f,openId).then(function(extra){
    var l=Object.assign({t:title,k:k,order:Date.now()},extra);
    return CourseStore.addLesson(openId,l);
  }).then(function(){done(true)}).catch(function(){toast('تعذّر رفع الملف. حاول مرة أخرى.');done(false)});
});

document.addEventListener('click',function(e){
  var t=e.target.closest('button');if(!t)return;
  if(t.dataset.d!==undefined){Auth.students.remove(t.dataset.d).then(loadStudents).then(function(){toast('تم حذف الطالب')}).catch(fail)}
  else if(t.dataset.m!==undefined){openPanel(t.dataset.m)}
  else if(t.dataset.ld!==undefined){delLesson(t.dataset.ld,t.dataset.a)}
  else if(t.id==='pclose'){closePanel()}
  else if(t.dataset.c!==undefined){CourseStore.toggle(t.dataset.c).catch(fail)}
  else if(t.dataset.x!==undefined){CourseStore.remove(t.dataset.x).then(function(){toast('تم حذف الكورس')}).catch(fail)}
  else if(t.id==='out'){Auth.logout().then(function(){location.replace('login.html')})}
});
CourseStore.onChange(render);
loadStudents();
});
