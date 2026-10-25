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

const BONO_RETO_DIARIO = 150;
window.BONO_RETO_DIARIO = BONO_RETO_DIARIO;
window.reportarRetoDiario = async function(id, fecha){
  if(!id) return false;
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
  chispo:['¡Zas! ¡Qué chispa!', '¡Voy cargando energía contigo!', '¡Sigue así, crack!'],
  gotin:['¡Splash! Vas fluyendo.', 'Gota a gota se llena el vaso.', '¡Qué bien resuelves!'],
  ascuin:['¡Se me calienta el brillo!', '¡Vas con fuego!', 'Tu esfuerzo me hace brillar.'],
  umbry:['Shhh… vas muy bien.', 'Nadie te ve, pero yo sí: ¡genial!', '¡Qué sombra de buen trabajo!'],
  brote:['Paso a paso se crece.', 'Cada acierto es una hojita nueva.', 'Con paciencia, ¡así se hace!'],
  glacia:['¡Brrr! ¡Qué genial vas!', 'Mantén la calma y piensa en frío.', 'Tus ideas brillan como cristales.'],
  geoto:['Firme como una roca. ¡Sigue así!', 'Lento pero seguro, ¡lo lograste!', 'Nada te mueve del camino.'],
  lumis:['¡Qué luz de respuesta!', '¡Brillas con cada acierto!', '¡Sigue iluminando el camino!'],
  ferrox:['¡Armadura lista, vamos por más!', 'Eso fue acero puro.', 'Nada te detiene.'],
  mystra:['¡Abracadabra! Acertaste.', 'Eso fue magia matemática.', '¡Mi varita brilla por ti!'],
  alar:['¡Casi despego! Sigue así.', '¡Aleteo de alegría!', '¡Vamos, que me tropiezo de emoción!'],
};
const _comp = { id:null, crit:null, xp:0, sesion:0, cargado:false, cargando:null };
async function _cargarCompanero(id){
  if(_comp.id === id && _comp.cargado) return;
  if(_comp.id === id && _comp.cargando) return _comp.cargando;
  _comp.id = id; _comp.cargado = false;
  _comp.cargando = (async () => {
    try{
      const d = await window.obtenerDatosAlumno(id);
      _comp.crit = (d && d.companeroEquipado) || null;
      _comp.xp = (_comp.crit && d.companeroXpV2 && d.companeroXpV2[_comp.crit]) || 0;
    } catch(e){ _comp.crit = null; }
    _comp.cargado = true; _comp.cargando = null;
  })();
  return _comp.cargando;
}
function _mostrarCompanero(texto, grande){
  if(document.hidden || /[?&]codigoClase=/.test(location.search)) return;       // en clase online no se distrae
  const cat = window.CATALOGO_CRIATURAS && window.CATALOGO_CRIATURAS[_comp.crit]; if(!cat) return;
  const marco = window.marcoCompanero(window.etapaCompanero(_comp.xp).nivel);
  const url = new URL('assets/mathverse/creatures/' + window.archivoCompanero(_comp.crit, window.etapaCompanero(_comp.xp).nivel), import.meta.url).href;
  const el = document.createElement('div');
  el.style.cssText = `position:fixed; top:40px; right:8px; z-index:99990; display:flex; align-items:center; gap:8px; pointer-events:none; opacity:0; transform:translateY(-6px); transition:opacity .25s, transform .25s; max-width:78vw;`;
  el.innerHTML = `<div style="background:#fff; color:#2a1566; font:800 ${grande ? 14 : 12.5}px 'Baloo 2', system-ui, sans-serif; padding:6px 11px; border-radius:14px 14px 4px 14px; box-shadow:0 6px 16px rgba(0,0,0,.35); line-height:1.2;">${texto}</div>
    <img src="${url}" alt="" style="width:${grande ? 58 : 46}px; height:${grande ? 58 : 46}px; object-fit:contain; border-radius:50%; background:rgba(30,17,71,.92); padding:3px; flex:none; ${marco}">`;
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'none'; });
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, grande ? 3200 : 2300);
}
async function _sumarXpCompanero(id, delta){
  await _cargarCompanero(id);
  if(!_comp.crit) return;
  const antes = window.etapaCompanero(_comp.xp);
  _comp.xp += delta; _comp.sesion += delta;
  try{ await setDoc(doc(db, 'alumnosRobot', id), { companeroXpV2: { [_comp.crit]: increment(delta) } }, { merge:true }); }
  catch(err){ console.error('No se pudo guardar la experiencia del compañero:', err); }
  const despues = window.etapaCompanero(_comp.xp), cat = window.CATALOGO_CRIATURAS[_comp.crit];
  if(despues.nivel > antes.nivel) _mostrarCompanero(`🎉 ¡${cat.nombre} ahora es ${despues.titulo}!`, true);
  else if(_comp.sesion === 1 || _comp.sesion % 5 === 0){
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
