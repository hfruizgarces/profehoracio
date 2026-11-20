/* ============================================================
   DESAFÍO ONLINE · Taller de Fracciones
   Un solo archivo compartido por las 5 actividades (y por el inicio
   del Taller, que solo redirige a la actividad que eligió el profesor).

   Cada página define antes:  window.TALLER_ACTIVIDAD = 'balanza' (etc.)
   y, si quiere reaccionar a la sesión:  window.TallerOnlineListo = fn(T)
   Y reporta con:  TallerOnline.resultado(true|false)  /  TallerOnline.iniciar()

   Sesión en Firestore (la crea el Panel del Profesor):
     recurso: 'taller-fracciones'
     nivelObjetivo:     actividad  (cortando | llenando | corte | balanza | simplificacion)
     modoObjetivo:      libre | contrarreloj
     subnivelObjetivo:  nivel dentro de la actividad (facil/intermedio/dificil o 1/2/3)
   ============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, increment } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDrwcG84h88gOf9FkUlZbECZ2qrO14KhO4",
  authDomain: "profehoracio-online.firebaseapp.com",
  projectId: "profehoracio-online",
  storageBucket: "profehoracio-online.firebasestorage.app",
  messagingSenderId: "TU_SENDER_ID",
  appId: "1:337766647406:web:6f13e95cb71b5f89cfc87f"
};
const app = initializeApp(firebaseConfig, "onlineTaller");
const auth = getAuth(app);
const db = getFirestore(app);

const RECURSO = 'taller-fracciones';
const DURACION_CONTRARRELOJ = 5*60;   // 5 minutos, en segundos
const PAGINAS = {
  cortando: 'cortando-el-entero.html',
  llenando: 'llenando-el-recipiente.html',
  corte: 'taller-de-corte.html',
  balanza: 'balanza.html',
  simplificacion: 'simplificacion.html',
  recta: 'recta-numerica.html',
  grupos: 'fracciones-en-grupos.html'
};

const T = {
  activo:false, codigo:null, uid:null, nombre:null, actividad:null, sub:null, modo:'libre',
  docId:null, ok:0, mal:0, nivelFijo:false,
  cont:{ activo:false, fin:false, restante:0, iv:null }
};
window.TallerOnline = T;

/* ---------- Firestore ---------- */
async function unirse(codigo, nombre){
  try{
    const cred = await signInAnonymously(auth);
    const uid = cred.user.uid;
    const snap = await getDoc(doc(db, 'sessions', codigo));
    if(!snap.exists()) return { ok:false, error:'Ese código no existe. Revísalo con tu profesor.' };
    const d = snap.data();
    if(d.active === false) return { ok:false, error:'Tu profesor ya cerró esta sesión.' };
    if(d.recurso && d.recurso !== RECURSO) return { ok:false, error:`Ese código es para ${d.recurso}, no para el Taller de Fracciones.` };
    const dur = d.duracionMinutos || 180;
    if(d.createdAt){
      const min = (Date.now() - d.createdAt.toDate().getTime()) / 60000;
      if(min > dur) return { ok:false, error:'Este código ya venció. Pídele uno nuevo a tu profesor.' };
    }
    return { ok:true, uid, actividad:d.nivelObjetivo, modo:d.modoObjetivo, sub:d.subnivelObjetivo };
  } catch(err){
    console.error(err);
    return { ok:false, error:'Error de conexión. Intenta de nuevo.' };
  }
}
async function nuevaFila(){
  try{
    await setDoc(doc(db,'sessions',T.codigo,'students',T.docId), {
      name:T.nombre, uid:T.uid||null, startedAt:serverTimestamp(), completados:0, errores:0, mascota:(window.mascotaParaClase ? await window.mascotaParaClase() : null)
    });
  } catch(err){ console.error('No se pudo iniciar el intento online:', err); }
}
async function reportar(dOk, dMal){
  try{
    await setDoc(doc(db,'sessions',T.codigo,'students',T.docId), {
      completados:increment(dOk), errores:increment(dMal), updatedAt:serverTimestamp()
    }, { merge:true });
  } catch(err){ console.error('No se pudo reportar el progreso online:', err); }
}

/* ---------- Indicador (en la barra superior de la actividad) ---------- */
function pastilla(){
  let p = document.getElementById('tOnlinePill');
  if(p) return p;
  const der = document.querySelector('.topbar-der');
  if(!der) return null;
  p = document.createElement('span');
  p.id = 'tOnlinePill'; p.className = 'nivel-pill';
  p.style.cssText = 'margin-right:6px; white-space:nowrap;';
  der.insertBefore(p, der.firstChild);
  return p;
}
function pintar(){
  const p = pastilla(); if(!p) return;
  if(!T.activo){ p.style.display='none'; return; }
  const m = Math.floor(T.cont.restante/60), s = T.cont.restante%60;
  p.style.display = '';
  p.textContent = `🟢 ✔ ${T.ok}` + (T.cont.activo ? ` · ⏱️ ${m}:${String(s).padStart(2,'0')}` : '');
}

/* ---------- Contrarreloj ---------- */
function detenerReloj(){ if(T.cont.iv){ clearInterval(T.cont.iv); T.cont.iv=null; } T.cont.activo=false; }
function iniciarReloj(){
  detenerReloj(); T.cont.fin=false; T.cont.activo=true; T.cont.restante=DURACION_CONTRARRELOJ;
  T.cont.iv = setInterval(()=>{ T.cont.restante--; pintar(); if(T.cont.restante<=0) terminarReloj(); }, 1000);
}
function terminarReloj(){
  detenerReloj(); T.cont.fin=true; pintar();
  if(!document.getElementById('tOnlineEstilo')){
    const st=document.createElement('style'); st.id='tOnlineEstilo';
    st.textContent = `.tonl-ov{position:fixed;inset:0;z-index:100000;background:rgba(10,4,30,.72);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:16px}
    .tonl-card{background:linear-gradient(160deg,#2c1468,#4c1d95);border:2px solid #34d399;border-radius:20px;padding:24px 22px;max-width:360px;width:100%;text-align:center;color:#f6f3ff;font-family:'Nunito',system-ui,sans-serif;box-shadow:0 30px 60px rgba(0,0,0,.4)}
    .tonl-card h2{font-family:'Baloo 2',system-ui,sans-serif;margin:0 0 6px;font-size:1.4rem}
    .tonl-card .gr{font-family:'Baloo 2',system-ui,sans-serif;font-weight:800;font-size:2.6rem;color:#fbbf24;line-height:1.1}
    .tonl-card p{margin:2px 0 14px;color:#c9bdf0;font-weight:700}
    .tonl-card button{font-family:'Baloo 2',system-ui,sans-serif;font-weight:800;font-size:1rem;padding:10px 20px;border:none;border-radius:999px;cursor:pointer;margin:0 4px;color:#04281c;background:linear-gradient(140deg,#0f9d70,#34d399)}
    .tonl-card button.s{background:rgba(255,255,255,.14);color:#f6f3ff}`;
    document.head.appendChild(st);
  }
  const ov=document.createElement('div'); ov.className='tonl-ov';
  ov.innerHTML=`<div class="tonl-card"><h2>⏱️ ¡Se acabó el tiempo!</h2><div class="gr">${T.ok}</div>
    <p>acierto${T.ok===1?'':'s'}${T.mal?` · ${T.mal} error${T.mal===1?'':'es'}`:''}</p>
    <button id="tOtra" type="button">➜ Otra ronda</button><button class="s" id="tCerrar" type="button">Cerrar</button></div>`;
  document.body.appendChild(ov);
  ov.querySelector('#tOtra').onclick=()=>location.reload();     // vuelve a unirse y empieza una ronda nueva
  ov.querySelector('#tCerrar').onclick=()=>ov.remove();
}

/* ---------- API para las actividades ---------- */
T.iniciar = function(){
  if(!T.activo) return;
  T.docId = T.uid + '_' + Date.now();          // cada ronda es una fila propia en el panel
  T.ok = 0; T.mal = 0;
  nuevaFila();
  if(T.modo === 'contrarreloj') iniciarReloj(); else detenerReloj();
  pintar();
};
T.resultado = function(ok){
  if(!T.activo || T.cont.fin) return;
  if(!T.docId) T.iniciar();
  if(ok) T.ok++; else T.mal++;
  reportar(ok?1:0, ok?0:1);
  pintar();
};

/* ---------- Llegada con ?codigoClase=XXXX (&invitado=Nombre) ---------- */
(async () => {
  try{
    const pu = new URLSearchParams(location.search);
    const codigo = (pu.get('codigoClase')||'').toUpperCase();
    if(!codigo) return;
    let nombre = null;
    try{ const g = JSON.parse(sessionStorage.getItem('profehoracio_alumno_actual') || 'null'); if(g && g.id && g.nombre) nombre = g.nombre; }catch(e){}
    const inv = pu.get('invitado');
    if(!nombre && inv && inv.trim()) nombre = `👤 Invitado: ${inv.trim()}`;
    if(!nombre) return;

    const r = await unirse(codigo, nombre);
    if(!r.ok){ alert(r.error); return; }
    const destino = PAGINAS[r.actividad];
    if(!destino){ alert('Esta sesión no tiene una actividad válida. Avísale a tu profesor.'); return; }
    const aqui = window.TALLER_ACTIVIDAD || null;
    if(aqui !== r.actividad){ location.replace(destino + location.search); return; }   // el inicio (u otra actividad) lleva a la elegida

    T.activo=true; T.codigo=codigo; T.uid=r.uid; T.nombre=nombre;
    T.actividad=r.actividad; T.modo=r.modo||'libre'; T.sub=r.sub||null;
    pintar();
    if(typeof window.TallerOnlineListo === 'function') window.TallerOnlineListo(T);
  } catch(e){ console.error(e); }
})();
