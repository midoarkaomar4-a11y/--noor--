/* الدخول والتسجيل. بيشتغل في وضعين:
   1) سيرفر Supabase (لو config.js فيه المفاتيح): حسابات حقيقية على كل الأجهزة.
   2) تجريبي: بيحفظ في المتصفح فقط. */
(function(){
var cfg=window.MM_CONFIG||{},D=window.DemoAuth||null,sb=null,cur=null;
try{if(cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&window.supabase)sb=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true}})}catch(e){sb=null}

var AKEY='mm-admin-session',SKEY='mm-student-session',STUDENTS_KEY='mm-admin-students';
function sget(k){try{var v=sessionStorage.getItem(k);if(v)return v}catch(e){}try{return localStorage.getItem(k)}catch(e){return null}}
function sset(k,v){try{sessionStorage.setItem(k,v)}catch(e){try{localStorage.setItem(k,v)}catch(x){}}}
function sdel(k){try{sessionStorage.removeItem(k)}catch(e){}try{localStorage.removeItem(k)}catch(e){}}
function normName(s){return String(s||'').replace(/\s+/g,' ').trim()}
function normPhone(s){return String(s||'').replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d)}).replace(/\D/g,'')}
function rand(){var a='';try{var u=new Uint8Array(8);crypto.getRandomValues(u);u.forEach(function(b){a+=('0'+b.toString(16)).slice(-2)})}catch(e){a=String(Date.now())+Math.floor(Math.random()*1e6)}return a}

/* ---------- Supabase ---------- */
function fetchProfile(uid){return sb.from('profiles').select('*').eq('id',uid).maybeSingle().then(function(r){return r.data||null})}
function setCur(p){cur=p?{id:p.id,n:p.name,g:p.grade,admin:!!p.is_admin}:null;return cur}
function mapProfile(p){return{id:p.id,n:p.name,gn:p.guardian_name,p:p.phone,gp:p.guardian_phone,g:p.grade,x:p.xp||0}}

/* ---------- تجريبي ---------- */
function loadLocal(){try{return JSON.parse(localStorage.getItem(STUDENTS_KEY))||[]}catch(e){return []}}
function saveLocal(l){try{localStorage.setItem(STUDENTS_KEY,JSON.stringify(l))}catch(e){}}

var ready;
if(sb){
  ready=sb.auth.getSession().then(function(r){
    var s=r.data&&r.data.session;if(!s)return;
    return fetchProfile(s.user.id).then(setCur);
  }).catch(function(){});
}else{
  if(sget(AKEY)==='1'&&D)cur={n:D.adminUser,admin:true};
  else{try{var s=JSON.parse(sget(SKEY));if(s)cur={n:s.n,g:s.g,admin:false}}catch(e){}}
  ready=Promise.resolve();
}

function login(name,pass){
  name=normName(name);pass=String(pass);
  if(sb){
    return sb.rpc('login_emails',{p_name:name}).then(function(r){
      var emails=r.data||[],i=0;
      function next(){
        if(i>=emails.length)return null;
        return sb.auth.signInWithPassword({email:emails[i++],password:pass}).then(function(x){
          if(x.error||!x.data||!x.data.session)return next();
          return fetchProfile(x.data.user.id).then(function(p){setCur(p);return cur&&cur.admin?'admin':'student'});
        });
      }
      return next();
    }).catch(function(){return null});
  }
  if(!D)return Promise.resolve(null);
  var h=D.sha256(pass);
  if(name.toLowerCase()===D.adminUser&&h===D.passHash){sset(AKEY,'1');cur={n:D.adminUser,admin:true};return Promise.resolve('admin')}
  var list=loadLocal();
  for(var i=0;i<list.length;i++){
    var s=list[i];
    if(s.h&&s.h===h&&normName(s.n)===name){sset(SKEY,JSON.stringify({n:s.n,g:s.g}));cur={n:s.n,g:s.g,admin:false};return Promise.resolve('student')}
  }
  return Promise.resolve(null);
}

/* بيرجع 'ok' أو 'names' أو 'pw' أو 'phone' أو 'exists' أو 'confirm' أو 'error' */
function register(d){
  var n=normName(d.n),gn=normName(d.gn),p=normPhone(d.p),gp=normPhone(d.gp),pw=String(d.pw||'');
  if(!n||!gn)return Promise.resolve('names');
  if(pw.length<6)return Promise.resolve('pw');
  if(p.length<10||gp.length<10)return Promise.resolve('phone');
  if(sb){
    var alias='s'+rand()+'@maged-students.com';
    return sb.auth.signUp({email:alias,password:pw,options:{data:{name:n,guardian_name:gn,phone:p,guardian_phone:gp,grade:d.g}}}).then(function(r){
      if(r.error)return /database error|duplicate|already/i.test(r.error.message||'')?'exists':'error';
      if(!r.data||!r.data.session)return 'confirm';
      return fetchProfile(r.data.user.id).then(function(pr){setCur(pr);return pr?'ok':'error'});
    }).catch(function(){return 'error'});
  }
  if(!D)return Promise.resolve('error');
  var h=D.sha256(pw),list=loadLocal();
  for(var i=0;i<list.length;i++)if(normPhone(list[i].p)===p)return Promise.resolve('exists');
  list.push({n:n,gn:gn,p:p,gp:gp,g:d.g,x:0,h:h});saveLocal(list);
  sset(SKEY,JSON.stringify({n:n,g:d.g}));cur={n:n,g:d.g,admin:false};
  return Promise.resolve('ok');
}

function logout(){
  cur=null;
  if(sb)return sb.auth.signOut().catch(function(){});
  sdel(AKEY);sdel(SKEY);return Promise.resolve();
}

var students={
  canAdd:!sb,
  list:function(){
    if(sb)return sb.from('profiles').select('*').eq('is_admin',false).order('created_at',{ascending:true}).then(function(r){return (r.data||[]).map(mapProfile)});
    return Promise.resolve(loadLocal().map(function(s){var o=Object.assign({},s);o.id=s.p;return o}));
  },
  add:function(d){
    if(sb)return Promise.reject(new Error('unsupported'));
    var list=loadLocal();list.push({n:normName(d.n),gn:normName(d.gn),p:normPhone(d.p),gp:normPhone(d.gp),g:d.g,x:0,h:D?D.sha256(String(d.pw)):''});
    saveLocal(list);return Promise.resolve();
  },
  remove:function(id){
    if(sb)return sb.rpc('admin_delete_student',{p_id:id}).then(function(r){if(r.error)throw r.error});
    saveLocal(loadLocal().filter(function(s){return s.p!==id}));return Promise.resolve();
  }
};

window.Auth={
  mode:sb?'server':'demo',sb:sb,ready:ready,students:students,
  current:function(){return cur},
  isAdmin:function(){return !!(cur&&cur.admin)},
  login:login,register:register,logout:logout,
  normName:normName,normPhone:normPhone
};
})();
