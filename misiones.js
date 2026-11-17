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
      items: lista.map(m => { const v = valor(m, per); return { id:m.id, t:m.t, meta:m.meta, valor:Math.min(v, m.meta), texto:fmt(m, v), hecha:!!c[m.id] || v >= m.meta }; }) };
    out[t].hechas = out[t].items.filter(i => i.hecha).length;
  });
  return out;
}
async function leer(id){
  const d = window.obtenerDatosAlumno ? await window.obtenerDatosAlumno(id) : null;
  return estado((d && d.misiones) || {}, hoyActual());
}
(function(){
  const css = document.createElement('style'); css.id = 'mm-css';
  css.textContent = `
  .mm-strip{ width:100%; margin-top:8px; display:flex; align-items:center; gap:10px; padding:.5em .9em; border:none; border-radius:999px; cursor:pointer; font-family:var(--font-display, system-ui, sans-serif); font-weight:800; font-size:.82rem; color:#fff; text-align:left; background:linear-gradient(135deg,rgba(124,58,237,.55),rgba(91,33,182,.55)); box-shadow:inset 0 0 0 1px rgba(196,181,253,.5), 0 0 14px rgba(124,58,237,.4); }
  .mm-strip:hover{ box-shadow:inset 0 0 0 1px #fff, 0 0 18px rgba(167,139,250,.8); }
  .mm-strip .mm-ico{ font-size:1.05rem; flex:none; }
  .mm-strip .mm-tx{ flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .mm-strip .mm-pts{ display:inline-flex; gap:4px; flex:none; } .mm-strip .mm-pt{ width:11px; height:11px; border-radius:50%; background:rgba(255,255,255,.22); } .mm-strip .mm-pt.on{ background:#6ee7b7; box-shadow:0 0 8px #6ee7b7; }
  .mm-strip .mm-sem{ flex:none; font-weight:700; color:#ddd3ff; font-size:.74rem; }
  .mm-strip.pend{ animation:mmBrilla 2.4s ease-in-out infinite; } @keyframes mmBrilla{ 50%{ box-shadow:inset 0 0 0 1px rgba(251,191,36,.8), 0 0 16px rgba(251,191,36,.45); } }
  .mm-ov{ position:fixed; inset:0; z-index:100000; background:rgba(10,4,30,.78); backdrop-filter:blur(3px); display:flex; align-items:center; justify-content:center; padding:14px; }
  .mm-card{ position:relative; width:100%; max-width:420px; max-height:90vh; overflow:auto; color:#f6f3ff; border-radius:24px; padding:18px 18px 16px; border:2px solid rgba(196,181,253,.55); background:linear-gradient(160deg,#2c1468,#4c1d95); box-shadow:0 30px 60px rgba(0,0,0,.45); font-family:var(--font-display, system-ui, sans-serif); }
  .mm-card h2{ margin:0 0 4px; font-size:1.3rem; text-align:center; } .mm-card h3{ margin:14px 0 6px; font-size:1rem; display:flex; align-items:baseline; justify-content:space-between; gap:8px; } .mm-card h3 small{ font-weight:700; color:#cdbff5; font-size:.72rem; }
  .mm-x{ position:absolute; right:10px; top:8px; border:none; background:rgba(255,255,255,.14); color:#fff; width:34px; height:34px; border-radius:50%; font-size:1rem; cursor:pointer; }
  .mm-item{ padding:8px 4px; } .mm-item .mm-t{ font-weight:800; font-size:.9rem; display:flex; justify-content:space-between; gap:8px; } .mm-item .mm-t b{ color:#fde68a; flex:none; }
  .mm-item.ok .mm-t span{ color:#6ee7b7; } .mm-item .mm-b{ height:10px; border-radius:999px; background:rgba(255,255,255,.14); margin-top:5px; overflow:hidden; } .mm-item .mm-b i{ display:block; height:100%; border-radius:999px; background:linear-gradient(90deg,#a78bfa,#f0abfc); transition:width .4s; } .mm-item.ok .mm-b i{ background:linear-gradient(90deg,#34d399,#6ee7b7); }
  .mm-item .mm-n{ font-size:.74rem; color:#d8ccf7; margin-top:3px; font-weight:700; }
  .mm-bono{ margin-top:6px; text-align:center; font-weight:800; font-size:.82rem; color:#fde68a; } .mm-bono.ok{ color:#6ee7b7; }
  .mm-pie{ margin-top:12px; text-align:center; color:#cdbff5; font-size:.72rem; font-weight:700; }`;
  document.head.appendChild(css);
})();

function htmlPeriodo(blq, titulo, nota){
  return `<h3>${titulo}<small>${nota}</small></h3>` + blq.items.map(i => `<div class="mm-item ${i.hecha ? 'ok' : ''}"><div class="mm-t"><span>${i.hecha ? '✓ ' : ''}${i.t}</span><b>+${blq.premio} 🪙</b></div><div class="mm-b"><i style="width:${Math.round(i.valor / i.meta * 100)}%"></i></div><div class="mm-n">${i.texto}</div></div>`).join('')
    + `<div class="mm-bono ${blq.bonoHecho ? 'ok' : ''}">${blq.bonoHecho ? '✓ Bono completo cobrado' : 'Completa las 3 y gana +' + blq.premioBono + ' 🪙 extra'}</div>`;
}
export async function abrirMisiones(id){
  let ov = document.getElementById('mm-ov'); if(ov) ov.remove();
  ov = document.createElement('div'); ov.id = 'mm-ov'; ov.className = 'mm-ov';
  ov.innerHTML = '<div class="mm-card"><button type="button" class="mm-x" aria-label="Cerrar">✕</button><h2>🎯 Misiones</h2><div id="mm-cuerpo" class="mm-pie">Cargando…</div></div>';
  document.body.appendChild(ov);
  const cerrar = () => ov.remove(); ov.querySelector('.mm-x').onclick = cerrar; ov.addEventListener('click', e => { if(e.target === ov) cerrar(); });
  try{
    const e = await leer(id), c = ov.querySelector('#mm-cuerpo'); if(!c) return;
    c.className = ''; c.innerHTML = htmlPeriodo(e.dia, 'Hoy', 'cambian a medianoche') + htmlPeriodo(e.sem, 'Esta semana', 'cambian el lunes') + '<div class="mm-pie">Se cuentan solos mientras practicas en cualquier recurso.</div>';
  } catch(err){ const c = ov.querySelector('#mm-cuerpo'); if(c) c.textContent = 'No se pudieron cargar las misiones. Revisa tu conexión.'; }
}
export async function montarResumenMisiones(el, id){
  if(!el || !id) return;
  el.innerHTML = '<button type="button" class="mm-strip"><span class="mm-ico">🎯</span><span class="mm-tx">Cargando misiones…</span></button>';
  el.querySelector('button').onclick = () => abrirMisiones(id);
  try{
    const e = await leer(id), b = el.querySelector('button'); if(!b.isConnected) return;
    b.classList.toggle('pend', e.dia.hechas < 3);
    b.innerHTML = `<span class="mm-ico">🎯</span><span class="mm-tx">Misiones de hoy</span><span class="mm-pts">${e.dia.items.map(i => `<span class="mm-pt ${i.hecha ? 'on' : ''}"></span>`).join('')}</span><span class="mm-sem">Semana ${e.sem.hechas}/3</span>`;
  } catch(err){ const t = el.querySelector('.mm-tx'); if(t) t.textContent = 'Misiones'; }
}
