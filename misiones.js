/* ============================================================
   MISIONES (definiciones + panel). Módulo sin dependencias de Firebase:
   lo usan mathverse-core.js (para contar el avance) y el inicio (para mostrar el panel).
   ============================================================ */
export const MIS_R = { dia:25, diaBono:50, sem:100, semBono:150 };
export const NOM_EJE = { numeros:'Números y operaciones', algebra:'Patrones y álgebra', geometria:'Geometría', logica:'Lógica y pensamiento' };
export const EJE_REC = {};
[['numeros', ['adicion','sustraccion','multiplicacion-arabe','tablas-multiplicar','division-algoritmo','representacion-division','numeros','numeros-40','numeros-rangos','taller-fracciones','batalla-enteros','promedios']],
 ['algebra', ['patrones-en-accion','terminos-semejantes','multiplicacion-polinomios','ecuaciones','inecuaciones','funciones','proporciones','balanza-ecuaciones','balanza-algebraica','del-texto-a-la-ecuacion']],
 ['geometria', ['coordenadas','transformaciones-geometricas','detectives-del-movimiento','geometria-en-accion','taller-medidas-3d','creacion-de-teselados','volumen-de-prismas','cazador-de-angulos']],
 ['logica', ['sudoku','robot-mision-codigo','torres-de-hanoi','nim','mastermind','nonogramas','los-24','caza-numeros','2048','memoria-de-luces','buscaminas']]
].forEach(([e, l]) => l.forEach(r => { EJE_REC[r] = e; }));
export const POOL_DIA = [
  [ {id:'ej8', m:'ej', meta:8, t:'Resuelve 8 ejercicios'}, {id:'ej12', m:'ej', meta:12, t:'Resuelve 12 ejercicios'}, {id:'ej16', m:'ej', meta:16, t:'Resuelve 16 ejercicios'} ],
  [ {id:'rec2', m:'rec', meta:2, t:'Practica en 2 recursos distintos'}, {id:'rec3', m:'rec', meta:3, t:'Practica en 3 recursos distintos'},
    {id:'eje_numeros', m:'eje_numeros', meta:5, t:'Resuelve 5 ejercicios de Números y operaciones'}, {id:'eje_algebra', m:'eje_algebra', meta:4, t:'Resuelve 4 ejercicios de Patrones y álgebra'}, {id:'eje_geometria', m:'eje_geometria', meta:4, t:'Resuelve 4 ejercicios de Geometría'} ],
  [ {id:'log1', m:'eje_logica', meta:1, t:'Completa 1 desafío de Lógica y pensamiento'}, {id:'log2', m:'eje_logica', meta:2, t:'Completa 2 desafíos de Lógica y pensamiento'}, {id:'min10', m:'seg', meta:600, t:'Practica 10 minutos'} ]
];
export const POOL_SEM = [
  [ {id:'sej60', m:'ej', meta:60, t:'Resuelve 60 ejercicios esta semana'}, {id:'sej80', m:'ej', meta:80, t:'Resuelve 80 ejercicios esta semana'}, {id:'sej100', m:'ej', meta:100, t:'Resuelve 100 ejercicios esta semana'} ],
  [ {id:'sdias2', m:'dias', meta:2, t:'Practica 2 días distintos esta semana'}, {id:'sdias3', m:'dias', meta:3, t:'Practica 3 días distintos esta semana'} ],
  [ {id:'smd4', m:'md', meta:4, t:'Completa 4 misiones diarias esta semana'}, {id:'slog4', m:'eje_logica', meta:4, t:'Completa 4 desafíos de Lógica y pensamiento esta semana'}, {id:'srec5', m:'rec', meta:5, t:'Practica en 5 recursos distintos esta semana'}, {id:'sgeo15', m:'eje_geometria', meta:15, t:'Resuelve 15 ejercicios de Geometría esta semana'} ]
];
export function semanaKey(f){
  const [y, m, d] = f.split('-').map(Number), dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - ((dt.getUTCDay() + 6) % 7));        // lunes de esa semana
  return 'S' + dt.toISOString().slice(0, 10);
}
function hashM(s){ let h = 2166136261; for(let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
export function misDe(pool, key){ return pool.map((arr, i) => arr[hashM(key + '|' + i) % arr.length]); }

export function valor(m, per){
  if(m.m === 'rec') return Object.keys(per.rs || {}).length;
  if(m.m === 'dias') return Object.keys(per.dias || {}).length;
  return (per.p && per.p[m.m]) || 0;
}
function fmt(m, v){ if(m.m === 'seg') return Math.min(Math.floor(v / 60), m.meta / 60) + '/' + (m.meta / 60) + ' min'; return Math.min(v, m.meta) + '/' + m.meta; }
export function fechaSantiago(ms){
  try{
    const p = new Intl.DateTimeFormat('en-CA', { timeZone:'America/Santiago', year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date(ms));
    const g = t => p.find(x => x.type === t).value; return `${g('year')}-${g('month')}-${g('day')}`;
  } catch(e){ const f = new Date(ms); return `${f.getFullYear()}-${String(f.getMonth()+1).padStart(2,'0')}-${String(f.getDate()).padStart(2,'0')}`; }
}
function hoyActual(){ return (typeof window.mvFechaHoy === 'function') ? window.mvFechaHoy() : fechaSantiago(Date.now()); }
export function estado(datosMis, hoy){
  const d = datosMis || {}, sem = semanaKey(hoy), out = {};
  [['dia', hoy, POOL_DIA, MIS_R.dia, MIS_R.diaBono], ['sem', sem, POOL_SEM, MIS_R.sem, MIS_R.semBono]].forEach(([t, k, pool, r, rb]) => {
    const per = d[k] || {}, c = per.c || {}, lista = misDe(pool, k);
    out[t] = { clave:k, premio:r, premioBono:rb, bonoHecho:!!c.bono,
      items: lista.map(m => { const v = valor(m, per); return { id:m.id, m:m.m, t:m.t, meta:m.meta, valor:Math.min(v, m.meta), texto:fmt(m, v), hecha:!!c[m.id] || v >= m.meta, cobrada:!!c[m.id] }; }) };
    out[t].hechas = out[t].items.filter(i => i.hecha).length;
    out[t].bonoListo = out[t].items.every(i => i.hecha);
    out[t].porCobrar = out[t].items.filter(i => i.hecha && !i.cobrada).length + ((out[t].bonoListo && !out[t].bonoHecho) ? 1 : 0);
  });
  return out;
}
/* Cobrar monedas: se hace al tocar el botón "+25" del panel. La transacción verifica en el servidor que la misión esté lograda y que no se haya cobrado antes. */
export async function cobrar(id, periodo, mid){
  const fs = window.__mvFS; if(!fs) throw new Error('Firestore no disponible');
  const hoy = hoyActual(), sem = semanaKey(hoy), esDia = periodo === hoy;
  if(!esDia && periodo !== sem) return { ok:false, motivo:'Esa misión ya venció.' };
  const lista = misDe(esDia ? POOL_DIA : POOL_SEM, periodo), r = esDia ? [MIS_R.dia, MIS_R.diaBono] : [MIS_R.sem, MIS_R.semBono];
  const ref = fs.doc(fs.db, 'alumnosRobot', id); let premio = 0;
  await fs.runTransaction(fs.db, async (tx) => {
    premio = 0;
    const s = await tx.get(ref), d = s.exists() ? s.data() : {}, per = (d.misiones && d.misiones[periodo]) || {}, c = per.c || {};
    if(c[mid]) return;
    let p;
    if(mid === 'bono'){ if(!lista.every(m => valor(m, per) >= m.meta)) return; p = r[1]; }
    else { const m = lista.find(x => x.id === mid); if(!m || valor(m, per) < m.meta) return; p = r[0]; }
    const upd = { misiones: { [periodo]: { c: { [mid]: true } } }, monedas: fs.increment(p) };
    if(esDia && mid !== 'bono') upd.misiones[semanaKey(periodo)] = { p: { md: fs.increment(1) } };
    tx.set(ref, upd, { merge:true }); premio = p;
  });
  if(premio) window.dispatchEvent(new CustomEvent('mv-monedas', { detail:{ delta:premio } }));
  return { ok: premio > 0, premio };
}
async function leer(id){
  const d = window.obtenerDatosAlumno ? await window.obtenerDatosAlumno(id) : null;
  return estado((d && d.misiones) || {}, hoyActual());
}
const MIS_ICO = { ej:'✏️', rec:'🧭', eje_numeros:'🔢', eje_algebra:'🧩', eje_geometria:'📐', eje_logica:'🧠', seg:'⏱️', dias:'📅', md:'🎯' };
const MIS_COL = { ej:'#f59e0b', rec:'#06b6d4', eje_numeros:'#3b82f6', eje_algebra:'#a855f7', eje_geometria:'#10b981', eje_logica:'#ec4899', seg:'#f97316', dias:'#14b8a6', md:'#8b5cf6' };
(function(){
  const css = document.createElement('style'); css.id = 'mm-css';
  css.textContent = `
  .mm-ban{ position:relative; overflow:hidden; width:100%; max-width:372px; margin:0 auto 10px; display:flex; align-items:center; gap:11px; padding:9px 12px 9px 9px; border:none; border-radius:24px; cursor:pointer; text-align:left; color:#fff; font-family:var(--font-display, system-ui, sans-serif);
    background:linear-gradient(115deg,#6d28d9 0%,#be185d 58%,#ea580c 100%); box-shadow:inset 0 0 0 2px rgba(255,255,255,.55), 0 8px 26px rgba(190,24,93,.45), 0 0 26px rgba(124,58,237,.5); -webkit-tap-highlight-color:transparent; transition:transform .15s; }
  .mm-ban:active{ transform:scale(.98); }
  .mm-ban::after{ content:''; position:absolute; top:0; bottom:0; width:40%; left:-60%; background:linear-gradient(100deg,transparent,rgba(255,255,255,.38),transparent); transform:skewX(-18deg); animation:mmBarrido 3.8s ease-in-out infinite; pointer-events:none; }
  @keyframes mmBarrido{ 0%,55%{ left:-60%; } 100%{ left:130%; } }
  .mm-ban.pend{ animation:mmLate 2.2s ease-in-out infinite; }
  @keyframes mmLate{ 50%{ box-shadow:inset 0 0 0 2px #fff, 0 8px 30px rgba(251,146,60,.7), 0 0 38px rgba(236,72,153,.75); } }
  .mm-ban.listo{ background:linear-gradient(115deg,#047857 0%,#0d9488 55%,#2563eb 100%); box-shadow:inset 0 0 0 2px rgba(255,255,255,.65), 0 8px 26px rgba(16,185,129,.5), 0 0 26px rgba(45,212,191,.5); }
  .mm-orb{ flex:none; width:50px; height:50px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.7rem; background:radial-gradient(circle at 33% 27%,#fff 0%,#fde68a 22%,#f59e0b 62%,#b45309 100%); box-shadow:inset -4px -6px 10px rgba(120,53,15,.45), 0 4px 12px rgba(0,0,0,.35); animation:mmFlota 3s ease-in-out infinite; }
  .mm-ban.listo .mm-orb{ background:radial-gradient(circle at 33% 27%,#fff 0%,#a7f3d0 25%,#10b981 65%,#065f46 100%); box-shadow:inset -4px -6px 10px rgba(6,78,59,.5), 0 4px 12px rgba(0,0,0,.35); }
  @keyframes mmFlota{ 50%{ transform:translateY(-3px) rotate(-6deg); } }
  .mm-mid{ flex:1; min-width:0; }
  .mm-kick{ font-size:.7rem; font-weight:900; letter-spacing:.09em; text-transform:uppercase; color:#ffe9b8; text-shadow:0 1px 3px rgba(0,0,0,.35); }
  .mm-ban.listo .mm-kick{ color:#d1fae5; }
  .mm-orbs{ display:flex; gap:6px; margin-top:4px; }
  .mm-o{ width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1rem; background:rgba(15,5,45,.45); box-shadow:inset 0 0 0 2px rgba(255,255,255,.35); position:relative; }
  .mm-o.ok{ background:radial-gradient(circle at 33% 27%,#d1fae5,#34d399 55%,#047857); box-shadow:inset 0 0 0 2px #fff, 0 0 12px rgba(110,231,183,.9); font-weight:900; color:#064e3b; }
  .mm-o:not(.ok) .mm-pp{ position:absolute; left:3px; right:3px; bottom:-3px; height:5px; border-radius:99px; background:rgba(255,255,255,.25); overflow:hidden; } .mm-o:not(.ok) .mm-pp i{ display:block; height:100%; background:#fde68a; }
  .mm-der{ flex:none; text-align:center; display:flex; flex-direction:column; align-items:center; gap:3px; }
  .mm-prem{ background:rgba(15,5,45,.5); border-radius:999px; padding:.28em .7em; font-weight:900; font-size:.95rem; color:#fde68a; box-shadow:inset 0 0 0 1px rgba(253,230,138,.6); white-space:nowrap; }
  .mm-ban.listo .mm-prem{ color:#a7f3d0; box-shadow:inset 0 0 0 1px rgba(167,243,208,.7); }
  .mm-sem{ font-size:.68rem; font-weight:800; color:#ffe9d6; white-space:nowrap; text-shadow:0 1px 3px rgba(0,0,0,.4); }
  .mm-ov{ position:fixed; inset:0; z-index:100000; background:rgba(10,4,30,.82); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; padding:12px; }
  .mm-card{ position:relative; width:100%; max-width:430px; max-height:94vh; overflow:auto; color:#f6f3ff; border-radius:28px; padding:16px 14px 14px; border:2px solid rgba(255,255,255,.5); background:radial-gradient(120% 70% at 50% 0%,rgba(219,39,119,.4),transparent 60%),linear-gradient(170deg,#2a1163,#3b1a86 55%,#1e1b6b); box-shadow:0 30px 70px rgba(0,0,0,.55), 0 0 40px rgba(124,58,237,.5); font-family:var(--font-display, system-ui, sans-serif); animation:mmEntra .28s cubic-bezier(.2,1.3,.4,1); }
  @keyframes mmEntra{ from{ transform:scale(.85); opacity:0; } }
  .mm-head{ display:flex; align-items:center; gap:12px; padding-right:38px; }
  .mm-head .mm-orb{ width:56px; height:56px; font-size:1.9rem; }
  .mm-head h2{ margin:0; font-size:1.35rem; line-height:1.1; } .mm-head p{ margin:2px 0 0; font-size:.74rem; font-weight:700; color:#e2d6ff; }
  .mm-x{ position:absolute; right:10px; top:10px; border:none; background:rgba(255,255,255,.18); color:#fff; width:34px; height:34px; border-radius:50%; font-size:1rem; cursor:pointer; }
  .mm-sec{ margin-top:12px; border-radius:20px; padding:10px 10px 10px; background:rgba(15,5,45,.38); box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.18); }
  .mm-sec.sem{ background:linear-gradient(160deg,rgba(14,116,144,.5),rgba(30,64,175,.45)); box-shadow:inset 0 0 0 1.5px rgba(125,211,252,.55); }
  .mm-sh{ display:flex; align-items:center; justify-content:space-between; gap:8px; margin:0 2px 6px; font-weight:900; font-size:1rem; } .mm-sh small{ font-weight:700; color:#d7c9ff; font-size:.68rem; } .mm-sec.sem .mm-sh small{ color:#bae6fd; }
  .mm-it{ display:flex; align-items:center; gap:10px; padding:7px 8px; margin-top:6px; border-radius:16px; background:rgba(255,255,255,.08); }
  .mm-it.ok{ background:linear-gradient(100deg,rgba(16,185,129,.35),rgba(52,211,153,.14)); box-shadow:inset 0 0 0 1.5px rgba(110,231,183,.7); }
  .mm-ring{ --p:0; --c:#a78bfa; flex:none; width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:conic-gradient(var(--c) calc(var(--p) * 1%), rgba(255,255,255,.16) 0); position:relative; }
  .mm-ring::before{ content:''; position:absolute; inset:5px; border-radius:50%; background:#2a1470; } .mm-ring span{ position:relative; font-size:1.25rem; }
  .mm-it.ok .mm-ring{ --c:#34d399; } .mm-it.ok .mm-ring::before{ background:#065f46; }
  .mm-tx{ flex:1; min-width:0; } .mm-tt{ font-weight:800; font-size:.86rem; line-height:1.2; } .mm-it.ok .mm-tt{ color:#d1fae5; }
  .mm-nn{ font-size:.72rem; font-weight:800; color:#d8ccf7; margin-top:2px; } .mm-it.ok .mm-nn{ color:#6ee7b7; }
  .mm-rw{ flex:none; padding:.3em .65em; border-radius:999px; font-weight:900; font-size:.82rem; color:#422006; background:linear-gradient(180deg,#fde68a,#f59e0b); box-shadow:0 2px 6px rgba(0,0,0,.3); white-space:nowrap; }
  .mm-it.ok .mm-rw{ background:linear-gradient(180deg,#a7f3d0,#34d399); color:#064e3b; }
  .mm-cofre{ display:flex; align-items:center; gap:10px; margin-top:8px; padding:8px 10px; border-radius:16px; font-weight:800; font-size:.82rem; background:rgba(255,255,255,.07); box-shadow:inset 0 0 0 1.5px dashed rgba(255,255,255,.3); border:1.5px dashed rgba(253,230,138,.55); }
  .mm-cofre .mm-cf{ font-size:1.7rem; filter:grayscale(1) brightness(.8); } .mm-cofre .mm-tx2{ flex:1; line-height:1.2; }
  .mm-cofre b{ color:#fde68a; } .mm-cofre.ok{ background:linear-gradient(100deg,rgba(251,191,36,.45),rgba(236,72,153,.35)); border:1.5px solid #fde68a; } .mm-cofre.ok .mm-cf{ filter:none; animation:mmFlota 2s ease-in-out infinite; }
  .mm-rw.bloq{ background:rgba(255,255,255,.14); color:#cdbff5; box-shadow:none; }
  .mm-rw.ya{ background:rgba(255,255,255,.14); color:#6ee7b7; box-shadow:none; }
  .mm-it.ok button.mm-rw.cobrar, button.mm-rw.cobrar{ border:none; cursor:pointer; font-family:inherit; font-size:.86rem; color:#422006 !important; background:linear-gradient(180deg,#fef08a,#f59e0b) !important; box-shadow:inset 0 0 0 2px #fff, 0 0 18px rgba(251,191,36,.9), 0 4px 10px rgba(0,0,0,.35); animation:mmCobra 1.1s ease-in-out infinite; }
  button.mm-rw.cobrar:disabled{ animation:none; opacity:.7; }
  @keyframes mmCobra{ 50%{ transform:scale(1.09); box-shadow:inset 0 0 0 2px #fff, 0 0 28px rgba(251,191,36,1), 0 4px 10px rgba(0,0,0,.35); } }
  .mm-it.cob{ background:linear-gradient(100deg,rgba(251,191,36,.35),rgba(236,72,153,.18)); box-shadow:inset 0 0 0 1.5px rgba(253,230,138,.9); }
  .mm-cofre.cob{ background:linear-gradient(100deg,rgba(251,191,36,.45),rgba(236,72,153,.35)); border:1.5px solid #fde68a; } .mm-cofre.cob .mm-cf{ filter:none; animation:mmFlota 1.4s ease-in-out infinite; }
  .mm-cofre button.mm-rw{ margin-left:auto; }
  .mm-vuelo{ position:absolute; right:14px; font-weight:900; font-size:1.2rem; color:#fde68a; text-shadow:0 2px 6px rgba(0,0,0,.6); pointer-events:none; animation:mmVuela .9s ease-out forwards; z-index:5; } @keyframes mmVuela{ from{ transform:translateY(0) scale(.8); opacity:1; } to{ transform:translateY(-48px) scale(1.4); opacity:0; } }
  .mm-o.cob{ box-shadow:inset 0 0 0 2px #fde68a, 0 0 12px rgba(253,230,138,.95); animation:mmCobra 1.1s ease-in-out infinite; }
  .mm-pie{ margin-top:10px; text-align:center; color:#cdbff5; font-size:.72rem; font-weight:700; }
  .mm-cols{ display:grid; grid-template-columns:1fr; gap:0; }
  .mm-card{ max-height:98vh; padding:12px 12px 10px; }
  .mm-head .mm-orb{ width:44px; height:44px; font-size:1.5rem; } .mm-head h2{ font-size:1.15rem; } .mm-head p{ display:none; }
  .mm-sec{ margin-top:8px; padding:8px 8px 8px; } .mm-sh{ font-size:.9rem; margin-bottom:2px; }
  .mm-it{ padding:5px 7px; margin-top:5px; gap:9px; } .mm-ring{ width:40px; height:40px; } .mm-ring::before{ inset:4px; } .mm-ring span{ font-size:1.05rem; }
  .mm-tt{ font-size:.8rem; } .mm-nn{ font-size:.68rem; } .mm-rw{ font-size:.76rem; padding:.25em .55em; }
  .mm-cofre{ margin-top:6px; padding:5px 9px; font-size:.76rem; } .mm-cofre .mm-cf{ font-size:1.35rem; }
  @media (min-width:760px){ .mm-card{ max-width:780px; } .mm-cols{ grid-template-columns:1fr 1fr; gap:12px; } .mm-head p{ display:block; } }
  @media (max-height:640px) and (max-width:759px){ .mm-card{ padding:8px 10px; } .mm-sec{ margin-top:5px; } .mm-it{ margin-top:3px; padding:3px 6px; } .mm-ring{ width:34px; height:34px; } .mm-tt{ font-size:.74rem; } .mm-nn{ display:none; } .mm-cofre{ margin-top:4px; padding:3px 8px; } }`;
  document.head.appendChild(css);
})();
function htmlPeriodo(blq, titulo, nota, cls){
  const per = blq.clave;
  const chip = (cobrada, lista, mid, premio) => cobrada ? '<div class="mm-rw ya">✓ Cobrado</div>'
    : lista ? `<button type="button" class="mm-rw cobrar" data-cobrar="${mid}" data-per="${per}">¡Cobrar +${premio} 🪙!</button>` : `<div class="mm-rw bloq">+${premio} 🪙</div>`;
  const items = blq.items.map(i => {
    const col = MIS_COL[i.m] || '#a78bfa', pct = Math.round(i.valor / i.meta * 100), cob = i.hecha && !i.cobrada;
    return `<div class="mm-it ${i.hecha ? 'ok' : ''} ${cob ? 'cob' : ''}"><div class="mm-ring" style="--p:${i.hecha ? 100 : pct};--c:${i.hecha ? '#34d399' : col}"><span>${i.hecha ? '✓' : (MIS_ICO[i.m] || '⭐')}</span></div><div class="mm-tx"><div class="mm-tt">${i.t}</div><div class="mm-nn">${cob ? '¡Lograda! Toca para cobrar' : (i.cobrada ? 'Lograda y cobrada' : i.texto)}</div></div>${chip(i.cobrada, i.hecha, i.id, blq.premio)}</div>`;
  }).join('');
  const cofreCob = blq.bonoListo && !blq.bonoHecho;
  return `<div class="mm-sec ${cls}"><div class="mm-sh"><span>${titulo} · ${blq.hechas}/3</span><small>${nota}</small></div>${items}`
    + `<div class="mm-cofre ${blq.bonoHecho ? 'ok' : (cofreCob ? 'cob' : '')}"><span class="mm-cf">🎁</span><div class="mm-tx2">${blq.bonoHecho ? '¡Cofre abierto!' : (cofreCob ? '¡Cofre listo!' : 'Logra las 3 y abre el cofre')}</div>${chip(blq.bonoHecho, blq.bonoListo, 'bono', blq.premioBono)}</div></div>`;
}
async function pintarCuerpo(ov, id, onCambio){
  const c = ov.querySelector('#mm-cuerpo'); if(!c) return;
  const e = await leer(id); if(!ov.isConnected) return;
  c.className = 'mm-cols'; c.innerHTML = htmlPeriodo(e.dia, '☀️ Hoy', 'cambian a medianoche', 'dia') + htmlPeriodo(e.sem, '🌟 Esta semana', 'cambian el lunes', 'sem');
  c.querySelectorAll('[data-cobrar]').forEach(b => b.onclick = async () => {
    b.disabled = true;
    try{
      const r = await cobrar(id, b.dataset.per, b.dataset.cobrar);
      if(r.ok){ const v = document.createElement('span'); v.className = 'mm-vuelo'; v.textContent = '+' + r.premio + ' 🪙'; b.parentElement.style.position = 'relative'; b.parentElement.appendChild(v); await new Promise(res => setTimeout(res, 650)); }
    } catch(err){ console.error(err); const p = ov.querySelector('.mm-err'); if(p) p.textContent = 'No se pudo cobrar. Revisa tu conexión e inténtalo de nuevo.'; }
    await window.obtenerDatosAlumno(id);   // refresca lo que se ve
    await pintarCuerpo(ov, id, onCambio); if(onCambio) onCambio();
  });
}
export async function abrirMisiones(id, onCambio){
  let ov = document.getElementById('mm-ov'); if(ov) ov.remove();
  ov = document.createElement('div'); ov.id = 'mm-ov'; ov.className = 'mm-ov';
  ov.innerHTML = '<div class="mm-card"><button type="button" class="mm-x" aria-label="Cerrar">✕</button><div class="mm-head"><div class="mm-orb">🎯</div><div><h2>Misiones</h2><p>Se cuentan solas mientras practicas. ¡Toca el premio para cobrarlo!</p></div></div><div id="mm-cuerpo" class="mm-pie">Cargando…</div><div class="mm-err mm-pie"></div></div>';
  document.body.appendChild(ov);
  const cerrar = () => ov.remove(); ov.querySelector('.mm-x').onclick = cerrar; ov.addEventListener('click', ev => { if(ev.target === ov) cerrar(); });
  try{ await pintarCuerpo(ov, id, onCambio); } catch(err){ const c = ov.querySelector('#mm-cuerpo'); if(c) c.textContent = 'No se pudieron cargar las misiones. Revisa tu conexión.'; }
}
export async function montarResumenMisiones(el, id){
  if(!el || !id) return;
  el.innerHTML = '<button type="button" class="mm-ban"><span class="mm-orb">🎯</span><span class="mm-mid"><span class="mm-kick">Misiones de hoy</span><span class="mm-orbs"><span class="mm-o">·</span><span class="mm-o">·</span><span class="mm-o">·</span></span></span></button>';
  el.querySelector('button').onclick = () => abrirMisiones(id, () => montarResumenMisiones(el, id));
  try{
    const e = await leer(id), b = el.querySelector('button'); if(!b.isConnected) return;
    const d = e.dia, listo = d.bonoHecho;
    b.classList.toggle('pend', !listo); b.classList.toggle('listo', listo);
    const kick = d.porCobrar > 0 ? '¡Cobra tus monedas! 🪙' : (listo ? '¡Misiones cumplidas!' : 'Misiones de hoy · ' + d.hechas + '/3');
    const prem = d.porCobrar > 0 ? '🪙 ¡Cobrar!' : (listo ? '🎁 ¡Cobrado!' : '+' + (d.items.length * d.premio + d.premioBono) + ' 🪙');
    b.innerHTML = `<span class="mm-orb">${listo ? '🏆' : '🎯'}</span><span class="mm-mid"><span class="mm-kick">${kick}</span><span class="mm-orbs">${d.items.map(i => `<span class="mm-o ${i.hecha ? 'ok' : ''} ${i.hecha && !i.cobrada ? 'cob' : ''}">${i.hecha ? '✓' : (MIS_ICO[i.m] || '⭐')}${i.hecha ? '' : `<span class="mm-pp"><i style="width:${Math.round(i.valor / i.meta * 100)}%"></i></span>`}</span>`).join('')}</span></span><span class="mm-der"><span class="mm-prem">${prem}</span><span class="mm-sem">Semana ${e.sem.hechas}/3${e.sem.porCobrar ? ' · 🪙 por cobrar' : ''}</span></span>`;
  } catch(err){ const t = el.querySelector('.mm-kick'); if(t) t.textContent = 'Misiones'; }
}
