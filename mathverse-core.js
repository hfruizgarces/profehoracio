/* ============================================================
   MATHVERSE-CORE.JS
   Núcleo compartido para los 18 recursos de profehoracio.
   Se carga con:  <script type="module" src="../mathverse-core.js"></script>
   (mismo dominio, así que funciona igual que un script normal --
   solo que puede usar `import` porque Firebase v10 lo exige)

   Expone todo en window.* con los MISMOS nombres que ya usaba cada
   recurso, para que no haya que tocar el resto del código de cada
   archivo -- solo borrar su bloque de Firebase duplicado y reemplazarlo
   por la etiqueta de arriba.
   ============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, serverTimestamp, increment, runTransaction
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDrwcG84h88gOf9FkUlZbECZ2qrO14KhO4",
  authDomain: "profehoracio-online.firebaseapp.com",
  projectId: "profehoracio-online",
  storageBucket: "profehoracio-online.firebasestorage.app",
  messagingSenderId: "TU_SENDER_ID",
  appId: "1:337766647406:web:6f13e95cb71b5f89cfc87f"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const CLAVE_SESION_COMPARTIDA = 'profehoracio_alumno_actual';

function normalizarUsuarioCompartido(u){
  return u.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}
window.normalizarUsuarioCompartido = normalizarUsuarioCompartido;

/* ------------------------------------------------------------
   LOGIN / SESIÓN
   ------------------------------------------------------------ */
window.verificarLoginAlumnoCompartido = async function(usuario, password){
  try{
    await signInAnonymously(auth);
    const id = normalizarUsuarioCompartido(usuario);
    const snap = await getDoc(doc(db, 'alumnosRobot', id));
    if(!snap.exists()) return { ok:false, error:'Ese usuario no existe. Revísalo con tu profesor.' };
    const datos = snap.data();
    if(datos.password !== password) return { ok:false, error:'Contraseña incorrecta.' };
    return { ok:true, id, nombre: datos.nombre };
  } catch(err){
    console.error(err);
    return { ok:false, error:'Error de conexión. Intenta de nuevo.' };
  }
};

window.obtenerDatosAlumno = async function(id){
  try{
    await signInAnonymously(auth);
    const snap = await getDoc(doc(db, 'alumnosRobot', id));
    if(!snap.exists()) return null;
    return snap.data();
  } catch(err){
    console.error(err);
    return null;
  }
};

/* ------------------------------------------------------------
   PROGRESO DE PRÁCTICA (tiempo por recurso, por mes) Y RETO DEL DÍA
   ------------------------------------------------------------ */
window.reportarProgresoPractica = async function(id, recurso, deltaCompletados, deltaSegundos){
  if(!id) return;
  const ahora = new Date();
  const mesKey = `${ahora.getFullYear()}-${String(ahora.getMonth()+1).padStart(2,'0')}`;
  try{
    await setDoc(doc(db, 'alumnosRobot', id), {
      practica: {
        [recurso]: {
          [mesKey]: {
            completados: increment(deltaCompletados || 0),
            segundos: increment(deltaSegundos || 0)
          }
        }
      },
      actualizadoPractica: serverTimestamp()
    }, { merge: true });
  } catch(err){
    console.error('No se pudo guardar el progreso de práctica:', err);
  }
};

window.reportarRetoDiario = async function(id, fecha){
  if(!id) return;
  try{
    await setDoc(doc(db, 'alumnosRobot', id), {
      retoDiario: { [fecha]: true }
    }, { merge: true });
  } catch(err){
    console.error('No se pudo guardar el reto diario:', err);
  }
};

/* ------------------------------------------------------------
   MONEDAS -- con candado antiduplicado por transacción.
   Antes, cada pestaña llevaba su propio contador local; si el
   alumno tenía DOS recursos abiertos a la vez, ambas pestañas
   podían pagar monedas en el mismo minuto real. La transacción
   revisa, en el propio Firestore (el único lugar que ve ambas
   pestañas a la vez), cuándo fue el último pago registrado --
   venga de la pestaña que venga -- y si fue hace menos de 55
   segundos, no paga de nuevo.
   ------------------------------------------------------------ */
window.reportarMonedas = async function(id, cantidad){
  if(!id) return false;
  try{
    const ref = doc(db, 'alumnosRobot', id);
    let pagado = false;
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const datos = snap.exists() ? snap.data() : {};
      const ahora = Date.now();
      const ultimoTS = datos.ultimoPagoMonedas;
      const ultimo = ultimoTS && typeof ultimoTS.toMillis === 'function' ? ultimoTS.toMillis() : 0;
      if(ahora - ultimo < 55000) return; // otra pestaña ya pagó hace menos de 55s -- no duplicar
      tx.set(ref, {
        monedas: increment(cantidad),
        ultimoPagoMonedas: serverTimestamp()
      }, { merge: true });
      pagado = true;
    });
    return pagado;
  } catch(err){
    console.error('No se pudo guardar las monedas:', err);
    return false;
  }
};

/* ------------------------------------------------------------
   HEARTBEAT COMPLETO: tiempo de práctica + monedas + actividad
   real, todo en una sola función que cada recurso llama UNA vez
   con su propio nombre de recurso. Asume que el recurso ya tiene
   en su HTML un elemento id="monedasPill" (ya estandarizado en
   los 18 archivos).
   ------------------------------------------------------------ */
let _monedasActuales = 0;
let _segundosParaMoneda = 0;
let _ultimaActividad = Date.now();
document.addEventListener('click', () => { _ultimaActividad = Date.now(); });
document.addEventListener('keydown', () => { _ultimaActividad = Date.now(); });

function _actualizarPildoraMonedas(){
  const pill = document.getElementById('monedasPill');
  if(!pill) return;
  pill.textContent = `🪙 ${_monedasActuales}`;
  pill.classList.remove('hidden');
}

function _mostrarToastMonedas(cantidad){
  const toast = document.createElement('div');
  toast.textContent = `+${cantidad} 🪙`;
  toast.style.cssText = 'position:fixed; bottom:58px; right:12px; z-index:99998; background:#fbbf24; color:#1a0f3d; font-family:var(--font-display, inherit); font-weight:800; font-size:.8rem; padding:5px 12px; border-radius:16px; animation: monedaFlota 2s ease-out forwards; pointer-events:none;';
  document.body.appendChild(toast);
  setTimeout(()=> toast.remove(), 2000);
}

// Se inyecta una única vez, por si el archivo del recurso no trae
// ya esta animación en su propio <style> (los 18 actuales sí la
// traen, pero así este script queda autosuficiente igual).
if(!document.getElementById('mathverse-core-styles')){
  const styleTag = document.createElement('style');
  styleTag.id = 'mathverse-core-styles';
  styleTag.textContent = '@keyframes monedaFlota{ 0%{ transform:translateY(0); opacity:0; } 15%{ opacity:1; } 100%{ transform:translateY(-24px); opacity:0; } }';
  document.head.appendChild(styleTag);
}

async function _otorgarMonedas(alumnoId, cantidad){
  const pagado = await window.reportarMonedas(alumnoId, cantidad);
  if(!pagado) return; // otra pestaña ya cobró este ciclo -- no mostrar aviso ni sumar localmente
  _monedasActuales += cantidad;
  _actualizarPildoraMonedas();
  _mostrarToastMonedas(cantidad);
}

window.cargarMonedasIniciales = async function(alumnoId){
  const datos = await window.obtenerDatosAlumno(alumnoId);
  _monedasActuales = (datos && datos.monedas) || 0;
  _actualizarPildoraMonedas();
};

/**
 * Llamar UNA vez, apenas se resuelve el login (sesión compartida o
 * manual), pasando el id del alumno y el nombre del recurso actual.
 */
let _heartbeatMathverseIniciado = false;
window.iniciarHeartbeatMathverse = function(alumnoIdProvider, recurso){
  if(_heartbeatMathverseIniciado) return; // ya está corriendo -- no duplicar el intervalo
  _heartbeatMathverseIniciado = true;
  window.cargarMonedasIniciales(typeof alumnoIdProvider === 'function' ? alumnoIdProvider() : alumnoIdProvider);
  setInterval(() => {
    const id = typeof alumnoIdProvider === 'function' ? alumnoIdProvider() : alumnoIdProvider;
    if(!id) return;
    if(document.visibilityState !== 'visible') return;
    window.reportarProgresoPractica(id, recurso, 0, 30);
    const activoReciente = (Date.now() - _ultimaActividad) <= 60000;
    if(!activoReciente){ _segundosParaMoneda = 0; return; }
    _segundosParaMoneda += 30;
    if(_segundosParaMoneda >= 60){
      _segundosParaMoneda -= 60;
      _otorgarMonedas(id, 25);
    }
  }, 30000);
};
