/* ============================================================
   DESAFÍO ONLINE · módulo compartido para recursos sueltos
   (Promedios, Volumen de prismas, Taller de medidas 3D, Creación de teselados,
    Tablas de multiplicar y Batalla de Enteros)

   Cada recurso define ANTES de cargar este archivo:
     window.ONLINE_RECURSO = 'promedios'            (el id del recurso, igual al del panel)
   y, si quiere entrar directo a lo que eligió el profesor:
     window.OnlineListo = function(O){ ... O.nivel, O.sub, O.modo ... }
   Y reporta con:  OnlineRecurso.resultado(true|false)  /  OnlineRecurso.iniciar()
   Para el teselado:  OnlineRecurso.guardarImagen(dataUrlJpeg)

   Sesión en Firestore (la crea el Panel del Profesor):
     recurso:           id del recurso
     nivelObjetivo:     actividad / nivel principal
     subnivelObjetivo:  nivel dentro de la actividad (si lo hay)
     modoObjetivo:      libre | contrarreloj
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
const app = initializeApp(firebaseConfig, "onlineRecurso");
const auth = getAuth(app);
const db = getFirestore(app);

const RECURSO = window.ONLINE_RECURSO || null;
const DURACION_CONTRARRELOJ = 5*60;   // 5 minutos, en segundos

const T = {
  activo:false, codigo:null, uid:null, nombre:null, nivel:null, sub:null, modo:'libre',
  docId:null, ok:0, mal:0, nivelFijo:true,
  cont:{ activo:false, fin:false, restante:0, iv:null }
};
window.OnlineRecurso = T;

/* ---------- Firestore ---------- */
async function unirse(codigo){
  try{
    const cred = await signInAnonymously(auth);
    const uid = cred.user.uid;
    const snap = await getDoc(doc(db, 'sessions', codigo));
    if(!snap.exists()) return { ok:false, error:'Ese código no existe. Revísalo con tu profesor.' };
    const d = snap.data();
    if(d.active === false) return { ok:false, error:'Tu profesor ya cerró esta sesión.' };
    if(d.recurso && d.recurso !== RECURSO) return { ok:false, error:`Ese código es para ${d.recurso}, no para este recurso.` };
    const dur = d.duracionMinutos || 180;
    if(d.createdAt){
      const min = (Date.now() - d.createdAt.toDate().getTime()) / 60000;
      if(min > dur) return { ok:false, error:'Este código ya venció. Pídele uno nuevo a tu profesor.' };
    }
    return { ok:true, uid, nivel:d.nivelObjetivo, modo:d.modoObjetivo, sub:d.subnivelObjetivo };
  } catch(err){
    console.error(err);
    return { ok:false, error:'Error de conexión. Intenta de nuevo.' };
  }
}
async function nuevaFila(){
  try{
    await setDoc(doc(db,'sessions',T.codigo,'students',T.docId), {
      name:T.nombre, uid:T.uid||null, startedAt:serverTimestamp(), completados:0, errores:0,
      mascota:(window.mascotaParaClase ? await window.mascotaParaClase() : null)
    });
  } catch(err){ console.error('No se pudo iniciar el intento online:', err); }
}
async function reportar(dOk, dMal, extra){
  try{
    await setDoc(doc(db,'sessions',T.codigo,'students',T.docId), Object.assign({
      completados:increment(dOk), errores:increment(dMal), updatedAt:serverTimestamp()
    }, extra||{}), { merge:true });
  } catch(err){ console.error('No se pudo reportar el progreso online:', err); }
}

/* ---------- Indicador (abajo a la izquierda, lejos del reloj de clase) ---------- */
function pastilla(){
  let p = document.getElementById('rOnlinePill');
  if(p) return p;
  p = document.createElement('div');
  p.id = 'rOnlinePill';
  p.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:99997;padding:6px 12px;border-radius:999px;background:rgba(30,10,70,.82);border:1.5px solid #34d399;color:#f6f3ff;font:800 .85rem/1 Nunito,system-ui,sans-serif;white-space:nowrap;pointer-events:none;display:none';
  document.body.appendChild(p);
  return p;
}
function pintar(){
  const p = pastilla();
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
  if(!document.getElementById('rOnlineEstilo')){
    const st=document.createElement('style'); st.id='rOnlineEstilo';
    st.textContent = `.ronl-ov{position:fixed;inset:0;z-index:100000;background:rgba(10,4,30,.72);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:16px}
    .ronl-card{background:linear-gradient(160deg,#2c1468,#4c1d95);border:2px solid #34d399;border-radius:20px;padding:24px 22px;max-width:360px;width:100%;text-align:center;color:#f6f3ff;font-family:'Nunito',system-ui,sans-serif;box-shadow:0 30px 60px rgba(0,0,0,.4)}
    .ronl-card h2{font-family:'Baloo 2',system-ui,sans-serif;margin:0 0 6px;font-size:1.4rem}
    .ronl-card .gr{font-family:'Baloo 2',system-ui,sans-serif;font-weight:800;font-size:2.6rem;color:#fbbf24;line-height:1.1}
    .ronl-card p{margin:2px 0 14px;color:#c9bdf0;font-weight:700}`;
    document.head.appendChild(st);
  }
  if(!document.querySelector('link[href*="mathverse-ui.css"]')){ const lk=document.createElement('link'); lk.rel='stylesheet'; lk.href=new URL('mathverse-ui.css', import.meta.url).href; document.head.appendChild(lk); }
  const ov=document.createElement('div'); ov.className='ronl-ov';
  ov.innerHTML=`<div class="ronl-card"><h2>⏱️ ¡Se acabó el tiempo!</h2><div class="gr">${T.ok}</div>
    <p>acierto${T.ok===1?'':'s'}${T.mal?` · ${T.mal} error${T.mal===1?'':'es'}`:''}</p>
    <button id="rOtra" type="button" class="btn-orbita v-verde"><span class="bola">➜</span>Otra ronda</button> <button id="rCerrar" type="button" class="btn-orbita sutil"><span class="bola">✕</span>Cerrar</button></div>`;
  document.body.appendChild(ov);
  ov.querySelector('#rOtra').onclick=()=>location.reload();     // vuelve a unirse y empieza una ronda nueva
  ov.querySelector('#rCerrar').onclick=()=>ov.remove();
}

/* ---------- API para los recursos ---------- */
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
/* Teselado: envía una miniatura (JPEG pequeño en base64) a la fila del alumno. Cuenta como 1 "guardado". */
T.guardarImagen = function(dataUrl){
  if(!T.activo || T.cont.fin) return false;
  if(!dataUrl || dataUrl.length > 300000) return false;      // tope de seguridad (Firestore admite 1 MB por documento)
  if(!T.docId) T.iniciar();
  T.ok++;
  reportar(1, 0, { dibujo:dataUrl, dibujoAt:serverTimestamp() });
  pintar();
  return true;
};

/* Envuelve mvExito / mvFallo (los define cada recurso) para contar aciertos y errores sin tocar su lógica */
function envolverHooks(){
  const ex = window.mvExito, fa = window.mvFallo;
  if(window.__onlineHooks) return; window.__onlineHooks = true;
  window.mvExito = function(){ try{ T.resultado(true); }catch(e){} if(typeof ex==='function') return ex.apply(this, arguments); };
  window.mvFallo = function(){ try{ T.resultado(false); }catch(e){} if(typeof fa==='function') return fa.apply(this, arguments); };
}

/* ---------- Llegada con ?codigoClase=XXXX (&invitado=Nombre) ---------- */
(async () => {
  try{
    if(!RECURSO) return;
    const pu = new URLSearchParams(location.search);
    const codigo = (pu.get('codigoClase')||'').toUpperCase();
    if(!codigo) return;
    let nombre = null;
    try{ const g = JSON.parse(sessionStorage.getItem('profehoracio_alumno_actual') || 'null'); if(g && g.id && g.nombre) nombre = g.nombre; }catch(e){}
    const inv = pu.get('invitado');
    if(!nombre && inv && inv.trim()) nombre = `👤 Invitado: ${inv.trim()}`;
    if(!nombre) return;

    const r = await unirse(codigo);
    if(!r.ok){ alert(r.error); return; }

    T.activo=true; T.codigo=codigo; T.uid=r.uid; T.nombre=nombre;
    T.nivel=r.nivel||null; T.modo=r.modo||'libre'; T.sub=r.sub||null;
    if(!window.__soloGuardarImagen) envolverHooks();
    T.iniciar();
    if(typeof window.OnlineListo === 'function') window.OnlineListo(T);
  } catch(e){ console.error(e); }
})();
