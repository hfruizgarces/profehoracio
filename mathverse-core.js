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
  getFirestore, doc, getDoc, getDocFromServer, waitForPendingWrites, setDoc, serverTimestamp, increment, runTransaction
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
    /* Siempre se lee del SERVIDOR: si se leyera con getDoc normal justo después de guardar algo en el mismo documento
       (por ejemplo el tiempo de práctica), Firestore puede devolver una copia local PARCIAL con solo lo recién escrito
       (sin la criatura equipada ni la XP). Solo si no hay conexión se usa la copia guardada. */
    const ref = doc(db, 'alumnosRobot', id);
    /* Antes de leer, se espera (máx. 6 s) a que el servidor confirme lo que esta página acaba de escribir: mientras haya
       una escritura pendiente en ese documento, Firestore entrega solo esa escritura y no el resto de los campos. */
    try{ await Promise.race([waitForPendingWrites(db), new Promise(res => setTimeout(res, 6000))]); }catch(e){}
    let snap;
    try{ snap = await getDocFromServer(ref); }
    catch(e){ snap = await getDoc(ref); }
    if(!snap.exists()) return null;
    return snap.data();
  } catch(err){
    console.error(err);
    return null;
  }
};

/* ------------------------------------------------------------
   HORA DEL SERVIDOR -- el "día" de los topes (XP diaria, reto del día) lo decide
   el servidor del sitio, no el reloj del computador, para que cambiar la fecha en
   Windows no permita saltarse los límites. Se lee la cabecera "Date" de la propia
   página (GitHub Pages la entrega). Si falla (sin conexión), se usa el reloj local.
   ------------------------------------------------------------ */
let _offsetServidor = null;
const _horaServidorLista = (async () => {
  try{
    const ctl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    const t = ctl ? setTimeout(() => ctl.abort(), 4000) : null;
    const r = await fetch(location.href.split('#')[0].split('?')[0], { method:'HEAD', cache:'no-store', signal: ctl ? ctl.signal : undefined });
    if(t) clearTimeout(t);
    const d = r.headers.get('Date');
    const ms = d ? new Date(d).getTime() : NaN;
    if(!isNaN(ms)) _offsetServidor = ms - Date.now();
  } catch(e){}
})();
function _fechaDeHoy(){
  const ms = Date.now() + (_offsetServidor || 0);
  try{
    const partes = new Intl.DateTimeFormat('en-CA', { timeZone:'America/Santiago', year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date(ms));
    const g = t => partes.find(x => x.type === t).value;
    return `${g('year')}-${g('month')}-${g('day')}`;
  } catch(e){
    const f = new Date(ms);
    return `${f.getFullYear()}-${String(f.getMonth()+1).padStart(2,'0')}-${String(f.getDate()).padStart(2,'0')}`;
  }
}

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

const BONO_RETO_DIARIO = 150;
window.BONO_RETO_DIARIO = BONO_RETO_DIARIO;
window.reportarRetoDiario = async function(id, fecha){
  if(!id) return false;
  await _horaServidorLista;
  if(_offsetServidor !== null && fecha !== _fechaDeHoy()) return false; // fecha distinta a la del servidor (reloj del PC cambiado): no se paga
  try{
    const ref = doc(db, 'alumnosRobot', id);
    let otorgado = false;
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const datos = snap.exists() ? snap.data() : {};
      const yaHecho = !!(datos.retoDiario && datos.retoDiario[fecha]);
      if(yaHecho) return;                                           // el bono se paga una sola vez por día
      tx.set(ref, { retoDiario: { [fecha]: true }, monedas: increment(BONO_RETO_DIARIO) }, { merge:true });
      otorgado = true;
    });
    if(otorgado) _celebrarRetoDiario();
    return otorgado;
  } catch(err){
    console.error('No se pudo guardar el reto diario:', err);
    return false;
  }
};
function _celebrarRetoDiario(){
  if(typeof _monedasActuales === 'number'){ _monedasActuales += BONO_RETO_DIARIO; try{ _actualizarPildoraMonedas(); }catch(e){} }
  const aviso = document.createElement('div');
  aviso.innerHTML = `🎯 ¡Desafío del día completado! <strong>+${BONO_RETO_DIARIO} 🪙</strong>`;
  aviso.style.cssText = 'position:fixed; top:16px; left:50%; transform:translateX(-50%); z-index:99999; background:#fbbf24; color:#1a0f3d; font-family:var(--font-display, inherit); font-weight:800; font-size:.95rem; padding:10px 18px; border-radius:16px; box-shadow:0 8px 24px rgba(0,0,0,.4); text-align:center; max-width:92vw;';
  aviso.onclick = () => aviso.remove();
  document.body.appendChild(aviso);
  setTimeout(() => { if(aviso.parentNode) aviso.remove(); }, 5000);
}

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
      /* El candado se compara con el reloj DEL MISMO COMPUTADOR (ultimoPagoMs), no con la hora del servidor:
         si un PC tiene la fecha/hora mal puesta, comparar con la hora del servidor bloqueaba todos los pagos
         siguientes (el alumno quedaba con solo 25 monedas). Con Math.abs también funciona si el reloj retrocede. */
      const ultimo = typeof datos.ultimoPagoMs === 'number' ? datos.ultimoPagoMs : 0;
      if(Math.abs(ahora - ultimo) < 55000) return; // otra pestaña de este mismo PC ya pagó hace menos de 55s
      tx.set(ref, {
        monedas: increment(cantidad),
        ultimoPagoMonedas: serverTimestamp(),
        ultimoPagoMs: ahora
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
  /* Si la tarjeta de la mascota ya muestra las monedas, no se dibuja la píldora de abajo */
  if(document.querySelector('.mv-chip .mv-mon')){
    const _p = document.getElementById('monedasPill'); if(_p) _p.style.display = 'none';
    try{ _chips.forEach(_pintarChip); }catch(e){}
    return;
  }
  let pill = document.getElementById('monedasPill');
  if(!pill && document.body){
    /* Recursos que no traen su propio contador de monedas: se crea uno igual al de los demás */
    pill = document.createElement('div');
    pill.id = 'monedasPill';
    pill.style.cssText = 'position:fixed; bottom:12px; right:12px; z-index:99998; background:rgba(30,17,71,.75); backdrop-filter:blur(6px); border:1px solid rgba(251,191,36,.4); border-radius:20px; padding:8px 14px; font-family:var(--font-display, inherit); font-weight:800; font-size:.85rem; color:#fbbf24; box-shadow:0 4px 14px rgba(0,0,0,.35);';
    document.body.appendChild(pill);
  }
  if(!pill) return;
  pill.textContent = `🪙 ${_monedasActuales}`;
  /* más compacta y pegada a la esquina, para tapar lo menos posible */
  pill.style.padding = '5px 11px'; pill.style.fontSize = '.82rem'; pill.style.bottom = '8px'; pill.style.right = '8px';
  pill.classList.remove('hidden');
}

function _mostrarToastMonedas(cantidad){
  const toast = document.createElement('div');
  toast.textContent = `+${cantidad} 🪙`;
  toast.style.cssText = 'position:fixed; bottom:58px; right:12px; z-index:99998; background:#fbbf24; color:#1a0f3d; font-family:var(--font-display, inherit); font-weight:800; font-size:.8rem; padding:5px 12px; border-radius:16px; animation: monedaFlota 2s ease-out forwards; pointer-events:none;';
  document.body.appendChild(toast);
  setTimeout(()=> toast.remove(), 2000);
}

let _toastXp = null, _toastXpTimer = null;
function _mostrarToastXp(cantidad){
  if(!_toastXp){
    _toastXp = document.createElement('div');
    _toastXp.style.cssText = 'position:fixed; bottom:96px; right:12px; z-index:99998; background:#a78bfa; color:#1a0f3d; font-family:var(--font-display, inherit); font-weight:800; font-size:.8rem; padding:5px 12px; border-radius:16px; pointer-events:none;';
  }
  _toastXp.textContent = `+${cantidad} XP`;
  _toastXp.style.animation = 'none'; void _toastXp.offsetWidth;   // reinicia la animación si llegan acertijos seguidos
  _toastXp.style.animation = 'monedaFlota 1.6s ease-out forwards';
  if(!_toastXp.parentNode) document.body.appendChild(_toastXp);
  clearTimeout(_toastXpTimer);
  _toastXpTimer = setTimeout(() => { if(_toastXp && _toastXp.parentNode) _toastXp.remove(); }, 1700);
}

function _mostrarAvisoBono(cantidad){
  const aviso = document.createElement('div');
  aviso.innerHTML = `🎁 Tu profesor te ha regalado <strong>${cantidad} 🪙</strong>`;
  aviso.style.cssText = 'position:fixed; top:16px; left:50%; transform:translateX(-50%); z-index:99999; background:#fbbf24; color:#1a0f3d; font-family:var(--font-display, inherit); font-weight:800; font-size:.9rem; padding:12px 20px; border-radius:16px; box-shadow:0 10px 28px rgba(0,0,0,.4); cursor:pointer; text-align:center; max-width:88vw;';
  aviso.title = 'Toca para cerrar';
  aviso.onclick = () => aviso.remove();
  document.body.appendChild(aviso);
  setTimeout(()=> { if(aviso.parentNode) aviso.remove(); }, 7000);
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
  const bonoPendiente = (datos && datos.bonoPendiente) || 0;
  if(bonoPendiente > 0){
    _mostrarAvisoBono(bonoPendiente);
    try{
      await setDoc(doc(db, 'alumnosRobot', alumnoId), { bonoPendiente: 0 }, { merge: true });
    } catch(err){
      console.error('No se pudo limpiar el aviso de bono:', err);
    }
  }
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

/* ------------------------------------------------------------
   TIENDA DE CRIATURAS -- catálogo compartido y funciones de
   compra/equipar. El catálogo vive acá (no en cada página) para
   que el precio y los datos de cada criatura estén en un solo
   lugar si después se agregan más.
   ------------------------------------------------------------ */
/* ------------------------------------------------------------
   COMPAÑERO QUE CRECE -- cada ejercicio acertado en cualquier recurso
   (cada llamada a reportarProgresoPractica con completados > 0) le da
   1 punto de experiencia (XP) a la criatura equipada. La criatura sube
   de etapa al llegar a ciertos puntos y, mientras el alumno practica,
   aparece un momento en una esquina para animarlo.
   Campo en alumnosRobot/{id}:  companeroXpV2: { [criaturaId]: numero }  (V2 = XP ponderada, parte de cero; el campo antiguo companeroXp ya no se usa)
   ------------------------------------------------------------ */
const ETAPAS_COMPANERO = [
  { nivel:1, titulo:'Cría', desde:0 },
  { nivel:2, titulo:'Aprendiz', desde:50 },
  { nivel:3, titulo:'Veterano', desde:150 },
  { nivel:4, titulo:'Legendario', desde:500 },
];
/* Imagen según etapa: desde Veterano (nivel 3) usa la evolución si la criatura la tiene */
window.archivoCompanero = function(critId, nivel){
  const c = window.CATALOGO_CRIATURAS && window.CATALOGO_CRIATURAS[critId];
  if(!c) return null;
  return (nivel >= 3 && c.archivoEvo) ? c.archivoEvo : c.archivo;
};
window.etapaCompanero = function(xp){
  xp = Math.max(0, xp || 0);
  let e = ETAPAS_COMPANERO[0];
  ETAPAS_COMPANERO.forEach(x => { if(xp >= x.desde) e = x; });
  const sig = ETAPAS_COMPANERO.find(x => x.desde > e.desde) || null;
  return { nivel:e.nivel, titulo:e.titulo, xp, desde:e.desde, hasta:sig ? sig.desde : null, tituloSiguiente:sig ? sig.titulo : null, pct:sig ? (xp - e.desde) / (sig.desde - e.desde) : 1 };
};
/* Marco de la criatura según su etapa (bronce, plata, oro, brillo especial) */
window.marcoCompanero = function(nivel){
  return ({
    1:'border:3px solid #cd7f32;',
    2:'border:3px solid #cbd5e1;',
    3:'border:3px solid #fbbf24; box-shadow:0 0 14px rgba(251,191,36,.55);',
    4:'border:3px solid #f0abfc; box-shadow:0 0 18px rgba(240,171,252,.85), 0 0 34px rgba(56,189,248,.5);',
  })[nivel] || '';
};
const FRASES_COMPANERO = {
  chispo:['¡BZZT! ¡Esa respuesta tuvo potencia!', '¡Tu cerebro acaba de soltar un rayo!', '¡Carga completa! ¿Vamos por otro desafío?', '¡Esa chispa la pusiste tú!'],
  gotin:['¡Glup glup! ¡Vas encontrando tu ritmo!', '¡Hasta el río más grande empieza con una gota!', '¡Fluiste directo a la respuesta!', 'Respira, piensa… ¡y deja que la idea fluya!'],
  ascuin:['¡FUAH! ¡Esa respuesta echó chispas!', '¡Tienes el fuego de quien no se rinde!', '¡Respuesta al rojo vivo!', '¡Que nadie apague esas ganas de aprender!'],
  umbry:['Je, je… sabía que descubrirías el secreto.', 'Desde las sombras, vi esa genialidad.', '¡Caso resuelto! Ni el misterio más oscuro pudo contigo.', 'Pocos lo ven venir… pero tú sí.'],
  brote:['¡Mira cómo florecen tus ideas!', '¡Un acierto más y tus raíces son más fuertes!', 'No hace falta correr para llegar lejos.', '¡Hoy aprendiste algo nuevo! Eso también es crecer.'],
  glacia:['¡Precisión cristalina!', 'Cabeza fría, respuesta brillante.', '¡Ni una grieta en tu razonamiento!', 'Paso a paso, hasta el hielo más duro se rompe.'],
  geoto:['¡Esa respuesta quedó grabada en piedra!', '¡Firme hasta el final!', 'Las grandes montañas se conquistan paso a paso.', '¡Pum! Otro desafío que no pudo contigo.'],
  lumis:['¡Esa idea merece brillar!', '¡Cada desafío ilumina un poco más tu camino!', '¡Qué orgullo verte brillar así!', '¡Incluso una pequeña idea puede iluminarlo todo!'],
  ferrox:['¡Precisión de acero!', '¡Misión cumplida! Sistemas funcionando al cien.', '¡Tu esfuerzo es más fuerte que cualquier obstáculo!', '¡Blindaje listo! El siguiente desafío nos espera.'],
  mystra:['¡Por los números encantados! ¡Lo lograste!', '¡No fue magia… fue tu inteligencia!', '¡Hechizo resuelto con éxito!', 'Abracadabra… ¡una idea brillante acaba de aparecer!'],
  alar:['¡Alas listas! ¡Vamos por otro récord!', '¡Esa respuesta nos llevó hasta las nubes!', '¡Despega, que tus ideas tienen alas!', '¡Viento a favor! ¡Nada nos detiene!'],
};
/* Ánimo cuando se equivoca (aparece con calma: como mucho una vez cada ~12 s) */
const FRASES_ANIMO = {
  chispo:['¡Ups, cortocircuito! Vuelve a intentarlo.', 'Un error es solo una chispa que aún no prende.'],
  gotin:['Tranquilo, glup glup… prueba otra vez.', 'Hasta el agua da vueltas antes de encontrar su camino.'],
  ascuin:['¡Casi! Las llamas también se reavivan.', '¡No te apagues! Inténtalo de nuevo.'],
  umbry:['Je, je… hasta las sombras se equivocan. Otra vez.', 'Mira con calma: la pista está ahí, escondida.'],
  brote:['Sin apuro, ¡así también se crece!', 'Cada intento riega tus ideas. Prueba otra vez.'],
  glacia:['Cabeza fría: revisa la columna otra vez.', 'Una grieta pequeña se arregla paso a paso.'],
  geoto:['Firme: respira y vuelve a intentarlo.', 'Las rocas se pulen con cada intento.'],
  lumis:['Aún no, pero tu idea sigue brillando. ¡Otra vez!', 'Casi lo iluminas. ¡Inténtalo de nuevo!'],
  ferrox:['Ajuste necesario. Revisa y vuelve a la carga.', 'Hasta el acero se templa con cada intento.'],
  mystra:['El hechizo no salió… ¡prueba otra vez!', 'Hasta las magas ensayan antes del truco.'],
  alar:['¡Turbulencia! Ajusta las alas y vuelve a despegar.', 'Todo vuelo empieza con un tropiezo.'],
};
/* Al subir de etapa */
const FRASES_EVOLUCION = {
  chispo:'¡Estoy cargado de energía nueva, gracias a ti!',
  gotin:'¡Glup glup! Ahora soy un río de alegría.',
  ascuin:'¡Mi llama ahora arde más fuerte!',
  umbry:'Ahora mi sombra es más grande… ¡y mi orgullo también!',
  brote:'¡Mira cómo crecí contigo!',
  glacia:'Mi cristal ahora brilla más fuerte.',
  geoto:'¡Más firme que nunca!',
  lumis:'¡Mi luz ahora ilumina el doble!',
  ferrox:'¡Armadura mejorada! Gracias por entrenar conmigo.',
  mystra:'¡Mi magia creció gracias a ti!',
  alar:'¡Mis alas crecieron! Ahora sí vamos lejos.',
};
/* Tope diario de XP (todas las criaturas juntas). Para cambiarlo, solo este número. */
const TOPE_XP_DIARIO = 200;
const _fechaLocal = () => _fechaDeHoy();
const _comp = { id:null, crit:null, xp:0, sesion:0, aciertos:0, hoy:0, fecha:null, avisoTope:false, cargado:false, cargando:null };
/* Diagnóstico: con ?debug=1 en la dirección, muestra en pantalla qué hace el compañero en cada acierto */
function _dbg(m){ try{ if(!/[?&]debug=1/.test(location.search)) return; let p = document.getElementById('__dbg'); if(!p){ p = document.createElement('div'); p.id='__dbg'; p.style.cssText='position:fixed;left:6px;top:6px;z-index:2147483647;max-width:92vw;max-height:60vh;overflow:hidden;background:rgba(0,0,0,.85);color:#7CFC8A;font:11px/1.35 monospace;padding:6px 8px;border-radius:8px;pointer-events:none;white-space:pre-wrap'; document.body.appendChild(p); } p.textContent += m + '\n'; }catch(e){} }
async function _cargarCompanero(id){
  if(_comp.id === id && _comp.cargado) return;
  if(_comp.id === id && _comp.cargando) return _comp.cargando;
  _comp.id = id; _comp.cargado = false;
  _comp.cargando = (async () => {
    try{
      await _horaServidorLista;
      const d = await window.obtenerDatosAlumno(id);
      if(!d || !d.nombre){ _dbg('lectura incompleta o sin conexión: se reintentará'); _comp.cargando = null; return; }   // todo documento de alumno tiene "nombre"; si no llega, no se da por cargado
      _comp.crit = d.companeroEquipado || null;
      _comp.xp = (_comp.crit && d.companeroXpV2 && d.companeroXpV2[_comp.crit]) || 0;
      _comp.fecha = _fechaLocal(); _comp.hoy = (d && d.xpDiario && d.xpDiario[_comp.fecha]) || 0;
      _dbg(`carga: datos=${d ? 'ok' : 'NULL'} criatura=${_comp.crit} xp=${_comp.xp} hoy=${_comp.hoy} fecha=${_comp.fecha}\ncampos: ${d ? Object.keys(d).join(', ') : '-'}`);
    } catch(e){ _comp.crit = null; _dbg('ERROR al cargar: ' + e); }
    _comp.cargado = true; _comp.cargando = null;
  })();
  return _comp.cargando;
}
function _mostrarCompanero(texto, grande){
  if(document.hidden || /[?&]codigoClase=/.test(location.search)) return;       // en clase online no se distrae
  const cat = window.CATALOGO_CRIATURAS && window.CATALOGO_CRIATURAS[_comp.crit]; if(!cat) return;
  const marco = window.marcoCompanero(window.etapaCompanero(_comp.xp).nivel);
  const url = new URL('assets/mathverse/creatures/' + window.archivoCompanero(_comp.crit, window.etapaCompanero(_comp.xp).nivel), import.meta.url).href;
  const anc = _chips.map(c => c.host).find(h => { if(!h || !h.offsetParent || !h.querySelector('.mv-av img')) return false; const r = h.getBoundingClientRect(); return r.width > 0 && getComputedStyle(h).visibility !== 'hidden'; });
  if(anc){      // hay una mascota en pantalla: la frase sale como globo junto a ella
    const r = anc.getBoundingClientRect(), g = document.createElement('div');
    g.style.cssText = `position:fixed; z-index:99990; max-width:min(78vw,300px); pointer-events:none; opacity:0; transform:translateY(-6px); transition:opacity .25s, transform .25s; background:#fff; color:#2a1566; font:800 ${grande ? 14.5 : 13}px 'Baloo 2', system-ui, sans-serif; padding:7px 12px; border-radius:14px; box-shadow:0 6px 16px rgba(0,0,0,.4); line-height:1.25; text-align:center;`;
    g.innerHTML = texto; document.body.appendChild(g);
    const w = g.offsetWidth; g.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px'; g.style.top = Math.min(innerHeight - g.offsetHeight - 8, r.bottom + 2) + 'px';
    requestAnimationFrame(() => { g.style.opacity = '1'; g.style.transform = 'none'; });
    setTimeout(() => { g.style.opacity = '0'; setTimeout(() => g.remove(), 300); }, grande ? 3400 : 2600);
    return;
  }
  const el = document.createElement('div');
  el.style.cssText = `position:fixed; top:62px; right:8px; z-index:99990; display:flex; align-items:center; gap:8px; pointer-events:none; opacity:0; transform:translateY(-6px); transition:opacity .25s, transform .25s; max-width:78vw;`;
  el.innerHTML = `<div style="background:#fff; color:#2a1566; font:800 ${grande ? 14 : 12.5}px 'Baloo 2', system-ui, sans-serif; padding:6px 11px; border-radius:14px 14px 4px 14px; box-shadow:0 6px 16px rgba(0,0,0,.35); line-height:1.2;">${texto}</div>
    <img src="${url}" alt="" style="width:${grande ? 58 : 46}px; height:${grande ? 58 : 46}px; object-fit:contain; border-radius:50%; background:rgba(30,17,71,.92); padding:3px; flex:none; ${marco}">`;
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'none'; });
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, grande ? 3200 : 2300);
}
async function _sumarXpCompanero(id, delta){
  _dbg(`acierto +${delta} (id=${id})`);
  await _cargarCompanero(id);
  if(!_comp.cargado){ await new Promise(res => setTimeout(res, 1500)); await _cargarCompanero(id); }   // un reintento si la primera lectura no llegó completa
  if(!_comp.cargado){ _dbg('no se pudo leer el perfil: este acierto no suma XP'); return; }
  if(!_comp.crit){ _dbg('SIN criatura equipada: no se suma'); return; }
  const hoyKey = _fechaLocal();
  if(_comp.fecha !== hoyKey){ _comp.fecha = hoyKey; _comp.hoy = 0; _comp.avisoTope = false; }   // pasó la medianoche con la página abierta
  const margen = Math.max(0, TOPE_XP_DIARIO - _comp.hoy);
  _dbg(`margen del dia=${margen}`);
  if(margen <= 0){
    if(!_comp.avisoTope){ _comp.avisoTope = true; const c = window.CATALOGO_CRIATURAS[_comp.crit]; _mostrarCompanero(`${c.nombre} ya está lleno de energía por hoy. ¡Vuelve mañana!`, true); }
    return;
  }
  delta = Math.min(delta, margen);                       // el último ejercicio del día puede sumar solo una parte
  if(!_chips.length) _mostrarToastXp(delta);
  const antes = window.etapaCompanero(_comp.xp);
  _comp.xp += delta; _comp.hoy += delta; _comp.aciertos++;
  const despues = window.etapaCompanero(_comp.xp), cat = window.CATALOGO_CRIATURAS[_comp.crit];
  _refrescarChips(delta, despues.nivel > antes.nivel);          // la barra y el "+N XP" suben YA; el guardado sigue por detrás
  try{ _dbg('guardando +' + delta + ' ...'); const t0 = Date.now(); await setDoc(doc(db, 'alumnosRobot', id), { companeroXpV2: { [_comp.crit]: increment(delta) }, xpDiario: { [hoyKey]: increment(delta) } }, { merge:true }); _dbg('guardado OK (' + (Date.now() - t0) + ' ms)'); }
  catch(err){ console.error('No se pudo guardar la experiencia del compañero:', err); _dbg('ERROR guardando: ' + (err && err.code) + ' ' + (err && err.message)); }
  if(despues.nivel > antes.nivel) _mostrarCompanero(`🎉 ¡${cat.nombre} ahora es ${despues.titulo}!<br>${FRASES_EVOLUCION[_comp.crit] || ''}`, true);
  else if(_comp.aciertos === 1 || _comp.aciertos % 5 === 0){
    const f = FRASES_COMPANERO[_comp.crit] || ['¡Muy bien!'];
    _mostrarCompanero(f[Math.floor(Math.random() * f.length)], false);
  }
}
/* ------------------------------------------------------------
   PESO DE XP POR RECURSO
   Cada ejercicio acertado suma XP según lo que DEMANDA resolverlo
   (no según el alumno): 1 punto ≈ 15 segundos de trabajo esperado,
   con mínimo 1. Un clic = 1; escribir varios pasos = 5 a 12.
   Un recurso puede pasar su propio peso como 5.º argumento de
   reportarProgresoPractica (así lo hacen Cazador y Geometría);
   si no lo pasa, se usa esta tabla; si no está en la tabla, vale 1.
   ------------------------------------------------------------ */
const PESO_XP = {
  'tablas-multiplicar': 1,        // una respuesta numérica, ~5 s
  'balanza-ecuaciones': 2,        // arrastrar + comprobar, ~30 s
  'balanza-algebraica': 3,        // varios movimientos, ~45 s
  'detectives-del-movimiento': 2, // observar y elegir, ~30 s
  'patrones-en-accion': 2,        // observar y responder, ~30 s
  'funciones': 4,                 // completar tabla / regla, ~60 s
  'terminos-semejantes': 4,       // reducir escribiendo, ~60 s
  'numeros': 5,                   // práctica completa de regiones, ~75 s
  'ecuaciones': 5,                // resolver en varios pasos, ~75 s
  'adicion': 5,                   // algoritmo columna a columna, ~75 s
  'inecuaciones': 6,              // varios pasos + sentido de la desigualdad, ~90 s
  'sustraccion': 6,               // algoritmo con canje, ~90 s
  'proporciones': 8,              // problema de varios pasos, ~2 min
  'division-algoritmo': 10,       // división larga escribiendo cada paso, ~2.5 min
  'multiplicacion-arabe': 10,     // cuadrícula completa, ~2.5 min
  'representacion-division': 12,  // tres estrategias completas, ~3 min
  'transformaciones-geometricas': 5, // por defecto; el recurso envía su peso por etapa
  'taller-fracciones': 3,         // por defecto; cada actividad envía su peso
  'sudoku': 30,                   // tablero completo, ~7 min
  'cazador-de-angulos': 3,        // por defecto; el recurso envía su peso por mundo
  'geometria-en-accion': 3,       // por defecto; el recurso envía su peso por módulo
};
window.PESO_XP = PESO_XP;
{ /* cada ejercicio acertado en cualquier recurso suma experiencia al compañero */
  const _repOriginal = window.reportarProgresoPractica;
  window.reportarProgresoPractica = function(id, recurso, deltaCompletados, deltaSegundos, peso){
    const r = _repOriginal(id, recurso, deltaCompletados, deltaSegundos);
    const p = (typeof peso === 'number' && peso > 0) ? peso : (PESO_XP[recurso] || 1);
    if(id && deltaCompletados > 0) _sumarXpCompanero(id, deltaCompletados * p);
    return r;
  };
}

/* Mascota del alumno para el panel del profesor: se guarda en su fila al unirse a una clase online.
   Devuelve { id, nombre, archivo, nivel, titulo } o null (invitado / sin criatura equipada). */
window.mascotaParaClase = async function(){
  try{
    let alumno = null;
    try{ alumno = JSON.parse(sessionStorage.getItem('profehoracio_alumno_actual') || 'null'); }catch(e){}
    if(!alumno || !alumno.id) return null;
    const d = await window.obtenerDatosAlumno(alumno.id);
    const crit = d && d.companeroEquipado;
    const cat = crit && window.CATALOGO_CRIATURAS[crit];
    if(!cat) return null;
    const et = window.etapaCompanero((d.companeroXpV2 && d.companeroXpV2[crit]) || 0);
    return { id:crit, nombre:cat.nombre, archivo:window.archivoCompanero(crit, et.nivel), nivel:et.nivel, titulo:et.titulo };
  } catch(e){ return null; }
};

window.CATALOGO_CRIATURAS = {
  chispo: { nombre:'Chispo', tipo:'⚡ Eléctrico', rareza:'Común', precio:650,
    archivo:'creature_chispo_common.png',
    archivoEvo:'creature_chispo_evo.png',
    descripcion:'Una bolita de estática que no puede quedarse quieta; sus chispas se le escapan cuando se emociona.' },
  gotin: { nombre:'Gotín', tipo:'💧 Agua', rareza:'Común', precio:650,
    archivo:'creature_gotin_common.png',
    archivoEvo:'creature_gotin_evo.png',
    descripcion:'Una gota con cresta que se aplana para deslizarse y se estira para asomarse a mirar.' },
  glacia: { nombre:'Glacia', tipo:'❄️ Hielo', rareza:'Común', precio:650,
    archivo:'creature_glacia_common.png',
    descripcion:'Una criatura de pelaje escarchado con cristales de hielo que tintinean cuando se emociona.' },
  geoto: { nombre:'Geoto', tipo:'🪨 Tierra', rareza:'Común', precio:650,
    archivo:'creature_geoto_common.png',
    descripcion:'Un pequeño reptil de roca con cristales de ámbar en el lomo; lento, pero nada lo mueve cuando se decide.' },
  lumis: { nombre:'Lumis', tipo:'✨ Luz', rareza:'Común', precio:650,
    archivo:'creature_lumis_common.png',
    descripcion:'Un cachorro dorado con halo que ilumina cualquier rincón oscuro y no sabe estar triste.' },
  ascuin: { nombre:'Ascuín', tipo:'🔥 Fuego', rareza:'Poco común', precio:1300,
    archivo:'creature_ascuin_common.png',
    archivoEvo:'creature_ascuin_evo.png',
    descripcion:'Vive dentro de una piedra pulida y tibia; su brillo sube y baja como una respiración lenta.' },
  umbry: { nombre:'Umbry', tipo:'👻 Sombra', rareza:'Poco común', precio:1300,
    archivo:'creature_umbry_common.png',
    archivoEvo:'creature_umbry_evo.png',
    descripcion:'Solo se anima del todo con poca luz; le encantan los juegos de esconderse.' },
  ferrox: { nombre:'Ferrox', tipo:'⚙️ Metal', rareza:'Poco común', precio:1300,
    archivo:'creature_ferrox_common.png',
    descripcion:'Un lobato blindado con corazón de brasa; protege a los suyos con sus placas de acero.' },
  brote: { nombre:'Brote', tipo:'🌿 Planta', rareza:'Rara', precio:2300,
    archivo:'creature_brote_common.png',
    archivoEvo:'creature_brote_evo.png',
    descripcion:'Mitad semilla, mitad brote; paciente y sabio a pesar de su tamaño.' },
  alar: { nombre:'Alar', tipo:'🐉 Dragón', rareza:'Épica', precio:4600,
    archivo:'creature_alar_common.png',
    descripcion:'Un dragoncito de runas y viento que todavía no controla bien sus alas -- se tropieza en los despegues.' },
  mystra: { nombre:'Mystra', tipo:'🔮 Magia', rareza:'Épica', precio:4600,
    archivo:'creature_mystra_common.png',
    descripcion:'Una gatita hechicera que practica sus hechizos con una varita de estrella... y a veces le salen al revés.' },
};

/**
 * Compra una criatura para el alumno. Usa una transacción para que
 * dos compras casi simultáneas (dos pestañas) nunca dejen el saldo
 * en negativo ni compren la misma criatura dos veces.
 * Devuelve { ok, error } o { ok:true, saldoRestante }.
 */
window.comprarCriatura = async function(id, criaturaId){
  if(!id) return { ok:false, error:'Sin sesión activa.' };
  const criatura = window.CATALOGO_CRIATURAS[criaturaId];
  if(!criatura) return { ok:false, error:'Esa criatura no existe.' };
  try{
    const ref = doc(db, 'alumnosRobot', id);
    let resultado = { ok:false, error:'No se pudo completar la compra.' };
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const datos = snap.exists() ? snap.data() : {};
      if(datos.criaturas && datos.criaturas[criaturaId]){
        resultado = { ok:false, error:'Ya tienes esta criatura.' };
        return;
      }
      const saldo = datos.monedas || 0;
      if(saldo < criatura.precio){
        resultado = { ok:false, error:'No te alcanzan las monedas todavía.' };
        return;
      }
      tx.set(ref, {
        monedas: increment(-criatura.precio),
        criaturas: { [criaturaId]: serverTimestamp() }
      }, { merge:true });
      resultado = { ok:true, saldoRestante: saldo - criatura.precio };
    });
    return resultado;
  } catch(err){
    console.error('No se pudo comprar la criatura:', err);
    return { ok:false, error:'Error de conexión. Intenta de nuevo.' };
  }
};

/**
 * Marca una criatura ya comprada como el compañero equipado
 * (el que se muestra en el perfil). No cobra nada -- equipar es
 * libre entre lo que ya se posee.
 */
window.equiparCompanero = async function(id, criaturaId){
  if(!id) return false;
  try{
    await setDoc(doc(db, 'alumnosRobot', id), {
      companeroEquipado: criaturaId
    }, { merge:true });
    _comp.cargado = false; _comp.cargando = null;
    return true;
  } catch(err){
    console.error('No se pudo equipar el compañero:', err);
    return false;
  }
};

/* ------------------------------------------------------------
   ROPA DEL ROBOT (Robot: Misión Código) -- compra y equipar.
   El catálogo y el dibujo viven en robot-skins.js (window.CATALOGO_SKINS_ROBOT);
   la página que llame a estas funciones debe cargar ese archivo.
   Campos en alumnosRobot/{id}:
     skinsRobot:         { idPrenda: fecha }       (lo que ya compró)
     skinRobotEquipado:  { gorro: id|null, camiseta: id|null }
   ------------------------------------------------------------ */
window.comprarSkinRobot = async function(id, skinId){
  if(!id) return { ok:false, error:'Sin sesión activa.' };
  const skin = (window.CATALOGO_SKINS_ROBOT || {})[skinId];
  if(!skin) return { ok:false, error:'Esa prenda no existe.' };
  try{
    const ref = doc(db, 'alumnosRobot', id);
    let resultado = { ok:false, error:'No se pudo completar la compra.' };
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const datos = snap.exists() ? snap.data() : {};
      if(datos.skinsRobot && datos.skinsRobot[skinId]){
        resultado = { ok:false, error:'Ya tienes esta prenda.' };
        return;
      }
      const saldo = datos.monedas || 0;
      if(saldo < skin.precio){
        resultado = { ok:false, error:'No te alcanzan las monedas todavía.' };
        return;
      }
      tx.set(ref, {
        monedas: increment(-skin.precio),
        skinsRobot: { [skinId]: serverTimestamp() }
      }, { merge:true });
      resultado = { ok:true, saldoRestante: saldo - skin.precio };
    });
    return resultado;
  } catch(err){
    console.error('No se pudo comprar la prenda:', err);
    return { ok:false, error:'Error de conexión. Intenta de nuevo.' };
  }
};

/** Pone (skinId) o quita (null) la prenda de un espacio ('gorro' | 'camiseta'). Es gratis. */
window.equiparSkinRobot = async function(id, slot, skinId){
  if(!id || !slot) return false;
  try{
    await setDoc(doc(db, 'alumnosRobot', id), {
      skinRobotEquipado: { [slot]: skinId || null }
    }, { merge:true });
    return true;
  } catch(err){
    console.error('No se pudo equipar la prenda:', err);
    return false;
  }
};

/* ------------------------------------------------------------
   DIÁLOGOS PROPIOS -- reemplazan confirm()/alert() del navegador
   (esos muestran "Una página insertada en... dice", feo y ajeno
   al sitio). Se usan igual, con await:
     const ok = await window.confirmarPersonalizado('¿Seguro?');
     await window.alertarPersonalizado('Listo.');
   ------------------------------------------------------------ */
function _crearOverlayDialogo(){
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed; inset:0; background:rgba(10,6,30,.72); z-index:999999; display:flex; align-items:center; justify-content:center; padding:20px;';
  return overlay;
}
function _tarjetaDialogo(mensaje, botonesHtml){
  return `
    <div style="background:#1a0f3d; border:1px solid rgba(255,255,255,.14); border-radius:18px; padding:22px; max-width:360px; width:100%; box-shadow:0 20px 50px rgba(0,0,0,.5); font-family:var(--font-display, system-ui, sans-serif);">
      <p style="color:#fff; font-size:.92rem; line-height:1.45; margin:0 0 18px;">${mensaje}</p>
      <div style="display:flex; gap:10px; justify-content:flex-end;">${botonesHtml}</div>
    </div>`;
}
window.confirmarPersonalizado = function(mensaje, opciones){
  opciones = opciones || {};
  const textoAceptar = opciones.textoAceptar || 'Sí, continuar';
  const textoCancelar = opciones.textoCancelar || 'Cancelar';
  const peligroso = !!opciones.peligroso;
  return new Promise((resolve) => {
    const overlay = _crearOverlayDialogo();
    overlay.innerHTML = _tarjetaDialogo(mensaje, `
      <button id="mvDlgCancelar" style="padding:9px 16px; border-radius:10px; border:1px solid rgba(255,255,255,.25); background:transparent; color:#fff; font-weight:700; font-size:.85rem; cursor:pointer;">${textoCancelar}</button>
      <button id="mvDlgAceptar" style="padding:9px 16px; border-radius:10px; border:none; background:${peligroso ? '#ef4444' : '#fbbf24'}; color:${peligroso ? '#fff' : '#1a0f3d'}; font-weight:800; font-size:.85rem; cursor:pointer;">${textoAceptar}</button>
    `);
    document.body.appendChild(overlay);
    const cerrar = (valor) => { overlay.remove(); document.removeEventListener('keydown', onEsc); resolve(valor); };
    const onEsc = (e) => { if(e.key === 'Escape') cerrar(false); };
    document.addEventListener('keydown', onEsc);
    overlay.addEventListener('click', (e) => { if(e.target === overlay) cerrar(false); });
    overlay.querySelector('#mvDlgCancelar').onclick = () => cerrar(false);
    overlay.querySelector('#mvDlgAceptar').onclick = () => cerrar(true);
  });
};
window.alertarPersonalizado = function(mensaje){
  return new Promise((resolve) => {
    const overlay = _crearOverlayDialogo();
    overlay.innerHTML = _tarjetaDialogo(mensaje, `
      <button id="mvDlgOk" style="padding:9px 18px; border-radius:10px; border:none; background:#fbbf24; color:#1a0f3d; font-weight:800; font-size:.85rem; cursor:pointer;">Entendido</button>
    `);
    document.body.appendChild(overlay);
    const cerrar = () => { overlay.remove(); document.removeEventListener('keydown', onEsc); resolve(); };
    const onEsc = (e) => { if(e.key === 'Escape') cerrar(); };
    document.addEventListener('keydown', onEsc);
    overlay.addEventListener('click', (e) => { if(e.target === overlay) cerrar(); });
    overlay.querySelector('#mvDlgOk').onclick = cerrar;
  });
};


/* ------------------------------------------------------------
   AVISO DE DERECHOS DE AUTOR (invisible en pantalla; no afecta el diseño)
   ------------------------------------------------------------ */
try{
  [['author','Profe Horacio'],['copyright','© 2026 Profe Horacio. Todos los derechos reservados.']].forEach(([n,v]) => {
    if(!document.querySelector(`meta[name="${n}"]`)){ const m = document.createElement('meta'); m.name = n; m.content = v; document.head.appendChild(m); }
  });
  console.log('%c© 2026 Profe Horacio · Todos los derechos reservados. Prohibida su copia o distribución sin autorización.', 'font-weight:bold');
}catch(e){}

/* ------------------------------------------------------------
   PASTILLA DEL COMPAÑERO (opt-in) -- una mascota siempre visible con su etapa y su barra de XP.
   Cada recurso la pide con UNA línea:  window.montarChipCompanero(elemento, { grande:false })
   Se actualiza sola con cada acierto (animación + "+N XP"). Sin sesión o sin criatura equipada,
   muestra una invitación a entrar / elegir compañero. Si el elemento no existe, no hace nada.
   ------------------------------------------------------------ */
const _chips = [];
(function(){
  if(document.getElementById('mv-chip-css')) return;
  const st = document.createElement('style'); st.id = 'mv-chip-css';
  st.textContent = `
.mv-chip{ position:relative; display:flex; align-items:center; gap:10px; padding:5px 14px 5px 5px; border-radius:999px; color:#fff; font-family:var(--font-display,'Baloo 2',system-ui,sans-serif); text-decoration:none; min-width:0; max-width:100%;
  background:linear-gradient(150deg, rgba(124,58,237,.55), rgba(44,20,104,.78)); box-shadow:inset 0 0 0 1px rgba(196,181,253,.5), 0 0 16px rgba(124,58,237,.45), 0 6px 14px rgba(0,0,0,.35); backdrop-filter:blur(4px); }
.mv-chip.grande{ padding:7px 20px 7px 7px; gap:14px; }
.mv-av{ flex:none; width:44px; height:44px; border-radius:50%; background:rgba(30,17,71,.92); padding:2px; display:grid; place-items:center; transition:transform .3s; }
.mv-chip.grande .mv-av{ width:66px; height:66px; }
.mv-av img{ width:100%; height:100%; object-fit:contain; border-radius:50%; display:block; }
.mv-info{ min-width:0; flex:1; display:flex; flex-direction:column; gap:3px; }
.mv-top{ display:flex; align-items:baseline; gap:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:800; font-size:.86rem; line-height:1.1; }
.mv-chip.grande .mv-top{ font-size:1.05rem; }
.mv-et{ font-weight:700; font-size:.72rem; color:#ddd6fe; } .mv-chip.grande .mv-et{ font-size:.82rem; }
.mv-barra{ height:8px; border-radius:99px; background:rgba(0,0,0,.4); box-shadow:inset 0 0 0 1px rgba(255,255,255,.18); overflow:hidden; min-width:70px; }
.mv-chip.grande .mv-barra{ height:11px; }
.mv-barra i{ display:block; height:100%; width:0; border-radius:inherit; background:linear-gradient(90deg,#fbbf24,#f472b6,#a78bfa,#38bdf8); box-shadow:0 0 10px rgba(167,139,250,.9); transition:width .8s cubic-bezier(.2,.8,.2,1); }
.mv-xp{ font-weight:800; font-size:.68rem; color:#e9e2ff; line-height:1; white-space:nowrap; } .mv-chip.grande .mv-xp{ font-size:.78rem; }
.mv-chip.sube .mv-av{ animation:mv-salto .7s ease; } .mv-chip.sube .mv-barra i{ filter:brightness(1.5); }
@keyframes mv-salto{ 0%{ transform:scale(1); } 30%{ transform:scale(1.22) rotate(-6deg); } 60%{ transform:scale(.96) rotate(4deg); } 100%{ transform:scale(1); } }
.mv-pop{ position:absolute; left:26px; top:-4px; padding:3px 10px; border-radius:99px; font-weight:800; font-size:.82rem; color:#1a0f3d; background:linear-gradient(150deg,#fde68a,#fbbf24); box-shadow:0 0 14px rgba(251,191,36,.8); pointer-events:none; animation:mv-pop 1.5s ease-out forwards; z-index:5; white-space:nowrap; }
@keyframes mv-pop{ 0%{ opacity:0; transform:translateY(6px) scale(.8); } 15%{ opacity:1; transform:translateY(-4px) scale(1.08); } 100%{ opacity:0; transform:translateY(-30px) scale(1); } }
.mv-nom{ flex:none; padding:.08em .62em; border-radius:99px; font-size:.8em; color:#2a1608; background:linear-gradient(150deg,#fde68a,#fbbf24); box-shadow:0 0 10px rgba(251,191,36,.55); }
.mv-top{ align-items:center; }
.mv-et{ color:#fde68a; }
.mv-mon{ display:flex; align-items:center; gap:5px; font-weight:800; font-size:1.02rem; line-height:1; color:#fff; text-shadow:0 2px 6px rgba(0,0,0,.45); }
.mv-chip.grande .mv-mon{ font-size:1.3rem; }
.mv-coin{ width:1.2em; height:1.2em; flex:none; display:block; filter:drop-shadow(0 1px 3px rgba(0,0,0,.5)); }
.mv-xp{ color:#ddd6fe; font-size:.76rem; } .mv-chip.grande .mv-xp{ font-size:.9rem; }
.mv-chip.sin{ padding:7px 16px; font-size:.8rem; font-weight:800; } .mv-chip.sin small{ display:block; font-weight:700; color:#ddd6fe; font-size:.68rem; }
@keyframes mv-bien{ 0%{ transform:translateY(0) scale(1); } 30%{ transform:translateY(-12px) scale(1.12) rotate(-5deg); } 60%{ transform:translateY(0) scale(.96,1.04); } 100%{ transform:translateY(0) scale(1); } }
@keyframes mv-mal{ 0%,100%{ transform:translateX(0) rotate(0); } 20%{ transform:translateX(-5px) rotate(-6deg); } 45%{ transform:translateX(5px) rotate(5deg); } 70%{ transform:translateX(-3px) rotate(-3deg); } }
.mv-chip.r-bien .mv-av{ animation:mv-bien .6s ease !important; } .mv-chip.r-mal .mv-av{ animation:mv-mal .5s ease !important; filter:saturate(.7) brightness(.92); }
@media (prefers-reduced-motion:reduce){ .mv-chip.r-bien .mv-av, .mv-chip.r-mal .mv-av{ animation:none !important; } .mv-chip.sube .mv-av, .mv-pop{ animation:none !important; } .mv-barra i{ transition:none; } }`;
  document.head.appendChild(st);
})();
const MV_COIN_SVG = '<svg class="mv-coin" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.2" fill="#fbbf24" stroke="#92400e" stroke-width="1.6"/><circle cx="12" cy="12" r="6.6" fill="#fde68a" stroke="#b45309" stroke-width="1.2"/><path d="M12 8.2v7.6M9.6 10.2c.5-.9 1.4-1.4 2.4-1.4 1.4 0 2.4.7 2.4 1.7s-1 1.5-2.4 1.8c-1.4.3-2.4.8-2.4 1.8s1 1.7 2.4 1.7c1 0 1.9-.5 2.4-1.4" fill="none" stroke="#92400e" stroke-width="1.3" stroke-linecap="round"/></svg>';
function _pintarChip(c){
  const cat = _comp.crit && window.CATALOGO_CRIATURAS && window.CATALOGO_CRIATURAS[_comp.crit];
  const base = (p) => new URL(p, import.meta.url).href;
  if(!c.alumnoId){
    c.host.innerHTML = `<a class="mv-chip sin ${c.grande ? 'grande' : ''}" href="${base('index.html')}" title="Entra con tu cuenta"><span>🔒 Invitado<small>Entra para ganar XP con tu mascota</small></span></a>`;
    return;
  }
  if(!_comp.cargado){ c.host.innerHTML = `<div class="mv-chip ${c.grande ? 'grande' : ''}"><div class="mv-av"></div><div class="mv-info"><div class="mv-top">Cargando…</div><div class="mv-barra"><i></i></div></div></div>`; return; }
  if(!cat){
    c.host.innerHTML = `<a class="mv-chip sin ${c.grande ? 'grande' : ''}" href="${base('mi-mathverse.html')}"><span>🥚 Sin compañero<small>Elige uno en Mi Mathverse</small></span></a>`;
    return;
  }
  const et = window.etapaCompanero(_comp.xp);
  const archivo = window.archivoCompanero(_comp.crit, et.nivel);
  const lleno = _comp.hoy >= TOPE_XP_DIARIO;
  const xpTxt = lleno ? '😴 Lleno de energía por hoy' : (et.hasta ? `${et.xp - et.desde} / ${et.hasta - et.desde} XP` : `${et.xp} XP · etapa máxima`);
  if(!c.pintado){
    c.host.innerHTML = `<a class="mv-chip ${c.grande ? 'grande' : ''} ${c.celebra ? 'celebra' : ''}" href="${base('mi-mathverse.html')}" title="Ver mi compañero"><div class="mv-av"><img alt=""></div><div class="mv-info"><div class="mv-top"><span class="mv-nom"></span><span class="mv-et"></span></div><div class="mv-mon"></div><div class="mv-xp"></div></div></a>`;
    c.pintado = true;
  }
  const chip = c.host.firstElementChild, av = chip.querySelector('.mv-av');
  av.style.cssText = window.marcoCompanero(et.nivel);
  const img = av.querySelector('img'); const url = base('assets/mathverse/creatures/' + archivo);
  if(img.getAttribute('src') !== url) img.src = url;
  chip.querySelector('.mv-nom').textContent = `Nv ${et.nivel}`;
  chip.querySelector('.mv-et').textContent = et.titulo;
  chip.querySelector('.mv-mon').innerHTML = `${MV_COIN_SVG}<b>${_monedasActuales}</b>`;
  chip.querySelector('.mv-xp').textContent = lleno ? xpTxt : `${et.xp}${et.hasta ? ' / ' + et.hasta : ''} XP`;
  const _pl = document.getElementById('monedasPill'); if(_pl) _pl.style.display = 'none';   // las monedas ya viven en la tarjeta
}
function _refrescarChips(delta, subio){
  _chips.forEach(c => {
    _pintarChip(c);
    const chip = c.host.firstElementChild; if(!chip || !delta) return;
    chip.classList.remove('sube'); void chip.offsetWidth; chip.classList.add('sube');
    const pop = document.createElement('span'); pop.className = 'mv-pop'; pop.textContent = `+${delta} XP${subio ? ' 🎉' : ''}`;
    chip.appendChild(pop); setTimeout(() => pop.remove(), 1600);
  });
}
/* Reacción breve de la mascota: 'bien' (salto) o 'mal' (se sacude). Cualquier recurso puede llamarla. */
window.reaccionCompanero = function(tipo){
  const cls = tipo === 'mal' ? 'r-mal' : 'r-bien';
  _chips.forEach(c => {
    const chip = c.host && c.host.firstElementChild; if(!chip || !chip.querySelector('.mv-av img')) return;
    chip.classList.remove('r-bien', 'r-mal'); void chip.offsetWidth; chip.classList.add(cls);
    clearTimeout(chip._rt); chip._rt = setTimeout(() => chip.classList.remove(cls), 700);
  });
  if(tipo === 'mal' && _comp.cargado && _comp.crit && Date.now() - (window._ultimoAnimo || 0) > 12000){
    window._ultimoAnimo = Date.now();
    const f = FRASES_ANIMO[_comp.crit]; if(f) _mostrarCompanero(f[Math.floor(Math.random() * f.length)], false);
  }
};
window.montarChipCompanero = function(host, opts){
  if(!host) return false;
  let alumno = null;
  try{ alumno = JSON.parse(sessionStorage.getItem('profehoracio_alumno_actual') || 'null'); }catch(e){}
  const c = { host, grande: !!(opts && opts.grande), celebra: !!(opts && opts.celebra), alumnoId: (alumno && alumno.id) || null, pintado:false };
  _chips.push(c);
  _pintarChip(c);
  if(c.alumnoId){
    (async () => {
      await _cargarCompanero(c.alumnoId);
      if(!_comp.cargado){ await new Promise(res => setTimeout(res, 2000)); await _cargarCompanero(c.alumnoId); }
      _chips.forEach(_pintarChip);
    })();
  }
  return true;
};

/* Botón "Atrás" de los recursos: vuelve a la página desde la que se llegó (el eje); si se entró directo, a la lista de ejes */
window.mvIrAtras = function(){
  try{
    const ref = document.referrer ? new URL(document.referrer) : null;
    if(ref && ref.origin === location.origin && ref.pathname !== location.pathname && history.length > 1){ history.back(); return; }
  }catch(e){}
  location.href = '../index.html#recursos';
};

setTimeout(() => _dbg('core versión 29oct-b (tarjeta con monedas)'), 600);
