/* مخزن الكورسات والدروس. بيشتغل في 3 أوضاع:
   server: Supabase (حقيقي لكل الأجهزة) | db: قاعدة بيانات صفحة Claude | local: المتصفح فقط */
(function(){
var A=window.Auth||{},sb=A.sb||null,BUCKET='course-files';
var KEY='mm-courses',LKEY='mm-lessons';
var PALETTE=['#c4324a','#2f3a78','#7a2f6e','#2a5a8c','#a02e5a','#3d4590'];
var DEFAULTS=[
 {id:'c1',t:'الميكانيكا: الحركة والقوى',g:'تالتة ثانوي',l:24,d:18,c:PALETTE[0],on:true,order:1},
 {id:'c2',t:'الكهرباء والمغناطيسية',g:'تالتة ثانوي',l:16,d:4,c:PALETTE[1],on:true,order:2},
 {id:'c3',t:'حل نماذج الأعوام السابقة',g:'تالتة ثانوي',l:30,d:0,c:PALETTE[2],on:true,order:3},
 {id:'c4',t:'الموجات والصوت',g:'تانية ثانوي',l:20,d:20,c:PALETTE[3],on:true,order:4},
 {id:'c5',t:'تدريبات الفصل الأول',g:'تانية ثانوي',l:18,d:6,c:PALETTE[4],on:true,order:5},
 {id:'c6',t:'مدخل إلى الفيزياء',g:'أولى ثانوي',l:14,d:2,c:PALETTE[5],on:true,order:6}
];
var list=[],mode=sb?'server':'local',ref=null,dbh=null,subs=[],lw=[];
function clone(o){return JSON.parse(JSON.stringify(o))}
function emit(){subs.forEach(function(f){try{f(list)}catch(e){}})}
function sortL(a){return a.sort(function(x,y){return (x.order||0)-(y.order||0)})}
function loadLocal(){try{var v=JSON.parse(localStorage.getItem(KEY));if(v&&v.length!==undefined)return sortL(v)}catch(e){}return clone(DEFAULTS)}
function saveLocal(){try{localStorage.setItem(KEY,JSON.stringify(list))}catch(e){}}
function chk(r){if(r&&r.error)throw r.error;return r}
list=sb?[]:loadLocal();

/* ---------- Supabase ---------- */
function mapC(r){return{id:r.id,t:r.title,g:r.grade,l:r.lessons_count||0,d:0,c:r.color,on:r.published!==false,order:r.sort||0}}
function loadCourses(){
  return sb.from('courses').select('*').order('sort',{ascending:true}).then(function(r){
    if(r.error)return;list=(r.data||[]).map(mapC);emit();
  });
}
function fetchLessons(h){
  return sb.from('lessons').select('*').eq('course_id',h.cid).order('sort',{ascending:true}).then(function(r){
    var rows=(r.data||[]).map(function(x){return{id:x.id,t:x.title,k:x.kind,u:x.url,sp:x.file_path,order:x.sort}});
    var paths=rows.filter(function(x){return x.sp}).map(function(x){return x.sp});
    if(!paths.length){h.fn(rows);return}
    return sb.storage.from(BUCKET).createSignedUrls(paths,3600).then(function(s){
      var m={};(s.data||[]).forEach(function(o){if(o.signedUrl)m[o.path]=o.signedUrl});
      rows.forEach(function(x){if(x.sp)x.src=m[x.sp]});h.fn(rows);
    });
  }).catch(function(){h.fn([])});
}
function refetch(cid){lw.forEach(function(h){if(h.cid===cid&&mode==='server')fetchLessons(h)})}

/* ---------- محلي / قاعدة Claude ---------- */
function localL(){try{var v=JSON.parse(localStorage.getItem(LKEY));if(v&&typeof v==='object')return v}catch(e){}return {}}
function saveL(m){try{localStorage.setItem(LKEY,JSON.stringify(m))}catch(e){}}
function lessonsOfLocal(cid){return sortL((localL()[cid]||[]).slice())}
function notifyLocal(cid){lw.forEach(function(h){if(h.cid===cid&&!h.db)h.fn(lessonsOfLocal(cid))})}
function attach(h){
  if(h.unsub){try{h.unsub()}catch(e){}h.unsub=null}
  if(mode==='server'){fetchLessons(h);return}
  if(mode==='db'){
    h.db=true;
    h.unsub=dbh.collection('courses/'+h.cid+'/lessons').onSnapshot(function(s){
      h.fn(sortL(s.docs.map(function(d){var o=Object.assign({},d.data());o.id=d.id;if(o.a)o.src='/_blob/'+o.a;return o})));
    },function(){h.db=false;h.fn(lessonsOfLocal(h.cid))});
  }else{h.db=false;h.fn(lessonsOfLocal(h.cid))}
}

window.CourseStore={
  PALETTE:PALETTE,
  get list(){return list},
  get mode(){return mode},
  get maxMB(){return mode==='server'?50:20},
  onChange:function(f){subs.push(f)},

  add:function(c){
    var color=PALETTE[list.length%PALETTE.length];
    if(mode==='server')return sb.from('courses').insert({title:c.t,grade:c.g,lessons_count:c.l,color:color,published:true,sort:Date.now()}).then(chk).then(loadCourses);
    var doc={t:c.t,g:c.g,l:c.l,d:0,c:color,on:true,order:Date.now()};
    if(mode==='db')return ref.add(doc);
    doc.id='l'+Date.now();list.push(doc);saveLocal();emit();return Promise.resolve();
  },
  toggle:function(id){
    var c=list.filter(function(x){return x.id===id})[0];if(!c)return Promise.resolve();
    if(mode==='server')return sb.from('courses').update({published:!c.on}).eq('id',id).then(chk).then(loadCourses);
    if(mode==='db')return ref.doc(id).update({on:!c.on});
    c.on=!c.on;saveLocal();emit();return Promise.resolve();
  },
  remove:function(id){
    if(mode==='server')return sb.from('lessons').select('file_path').eq('course_id',id).then(function(r){
      var ps=(r.data||[]).map(function(x){return x.file_path}).filter(Boolean);
      return ps.length?sb.storage.from(BUCKET).remove(ps):null;
    }).then(function(){return sb.from('courses').delete().eq('id',id)}).then(chk).then(loadCourses);
    if(mode==='db')return dbh.collection('courses/'+id+'/lessons').get().then(function(s){
      return Promise.all(s.docs.map(function(d){return dbh.doc('courses/'+id+'/lessons/'+d.id).delete()}));
    }).then(function(){return ref.doc(id).delete()});
    list=list.filter(function(x){return x.id!==id});saveLocal();emit();return Promise.resolve();
  },

  watchLessons:function(cid,fn){
    var h={cid:cid,fn:fn,unsub:null,db:false};lw.push(h);attach(h);
    return function(){if(h.unsub){try{h.unsub()}catch(e){}}lw=lw.filter(function(x){return x!==h})};
  },
  addLesson:function(cid,l){
    if(mode==='server')return sb.from('lessons').insert({course_id:cid,title:l.t,kind:l.k,url:l.u||null,file_path:l.sp||null,sort:Date.now()}).then(chk).then(function(){refetch(cid)});
    if(mode==='db')return dbh.collection('courses/'+cid+'/lessons').add(l);
    var m=localL();l.id='l'+Date.now();(m[cid]=m[cid]||[]).push(l);saveL(m);notifyLocal(cid);return Promise.resolve();
  },
  removeLesson:function(cid,lid){
    if(mode==='server')return sb.from('lessons').select('file_path').eq('id',lid).maybeSingle().then(function(r){
      var p=r.data&&r.data.file_path;return p?sb.storage.from(BUCKET).remove([p]):null;
    }).then(function(){return sb.from('lessons').delete().eq('id',lid)}).then(chk).then(function(){refetch(cid)});
    if(mode==='db')return dbh.doc('courses/'+cid+'/lessons/'+lid).delete();
    var m=localL();m[cid]=(m[cid]||[]).filter(function(x){return x.id!==lid});saveL(m);notifyLocal(cid);return Promise.resolve();
  },
  /* رفع ملف: بيرجع حقول تتضاف للدرس ({sp} على السيرفر أو {a} على Claude) */
  upload:function(file,cid){
    if(mode==='server'){
      var path=cid+'/'+Date.now()+'-'+file.name.replace(/[^\w.\-]/g,'_');
      return sb.storage.from(BUCKET).upload(path,file,{contentType:file.type||'application/octet-stream'}).then(function(r){chk(r);return{sp:path}});
    }
    if(window.claude&&window.claude.use)return window.claude.use('assets').then(function(as){
      if(!as)throw new Error('no-assets');
      return as.upload(file).then(function(r){return{a:r.id}});
    });
    return Promise.reject(new Error('no-upload'));
  },
  canUpload:function(){return mode==='server'||!!(window.claude&&window.claude.use)}
};

if(sb){
  (A.ready||Promise.resolve()).then(function(){if(A.current&&A.current())return loadCourses()}).catch(function(){});
}else if(window.claude&&window.claude.use){
  window.claude.use('db').then(function(db){
    if(!db)return;
    mode='db';dbh=db;ref=db.collection('courses');lw.forEach(attach);
    ref.onSnapshot(function(s){
      list=sortL(s.docs.map(function(d){var o=Object.assign({},d.data());o.id=d.id;return o}));emit();
    },function(){mode='local';ref=null;dbh=null;list=loadLocal();emit();lw.forEach(attach)});
  }).catch(function(){});
}
})();
