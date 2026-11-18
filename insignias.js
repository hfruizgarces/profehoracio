/* ============================================================
   INSIGNIAS DE LOGRO
   - Este archivo solo tiene el catálogo y cómo se ven (sin Firebase).
   - Dónde se guardan: en el documento de cada alumno (alumnosRobot/{id}), campo
       insignias: { "f512": 1763400000000, "nim-1": 1763400100000, ... }   (id de la insignia -> fecha en que se ganó)
     Así viajan con la cuenta (no con el dispositivo), no necesitan colecciones nuevas ni cambiar reglas de Firestore,
     y una insignia ya ganada nunca se pierde ni se repite.
   - Cómo se ganan: los recursos llaman  window.mvInsignia('id')  (lo define mathverse-core.js).
     Las insignias de constancia, misiones y práctica las calcula el propio core.
   ============================================================ */
export const GRUPOS = [
  { id:'2048',   n:'2048',               i:'🔢' },
  { id:'bm',     n:'Buscaminas',         i:'🚩' },
  { id:'nim',    n:'Nim',                i:'🪨' },
  { id:'cn',     n:'Caza números',       i:'🎯' },
  { id:'mem',    n:'Memoria de luces',   i:'💡' },
  { id:'han',    n:'Torres de Hanoi',    i:'🗼' },
  { id:'sud',    n:'Sudoku',             i:'🧩' },
  { id:'tg',     n:'Tangram',            i:'📐' },
  { id:'ca',     n:'Casino de probabilidades', i:'🎰' },
  { id:'cons',   n:'Constancia',         i:'🔥' },
  { id:'mis',    n:'Misiones',           i:'🏆' },
  { id:'prac',   n:'Práctica',           i:'📚' },
];
/* c1 -> c2: colores del medallón (variados a propósito) */
export const CATALOGO = [
  { id:'f512',  g:'2048', n:'Tu primer 512',   d:'Forma la ficha 512 en 2048.',  i:'5️⃣', c1:'#fdba74', c2:'#ea580c' },
  { id:'f1024', g:'2048', n:'Tu primer 1024',  d:'Forma la ficha 1024 en 2048.', i:'🔥', c1:'#fca5a5', c2:'#dc2626' },
  { id:'f2048', g:'2048', n:'Tu primer 2048',  d:'¡Descubre la ficha 2048!',     i:'👑', c1:'#fde68a', c2:'#d97706' },

  { id:'bm-1', g:'bm', n:'Campo despejado',            d:'Gana tu primer Buscaminas.',                    i:'🚩', c1:'#fda4af', c2:'#be123c' },
  { id:'bm-f', g:'bm', n:'Rey del Buscaminas fácil',   d:'Gana el Buscaminas fácil en menos de 30 segundos.',   i:'⚡', c1:'#86efac', c2:'#15803d' },
  { id:'bm-m', g:'bm', n:'Rey del Buscaminas medio',   d:'Gana el Buscaminas medio en menos de 90 segundos.',   i:'⚡', c1:'#93c5fd', c2:'#1d4ed8' },
  { id:'bm-d', g:'bm', n:'Rey del Buscaminas difícil', d:'Gana el Buscaminas difícil en menos de 3 minutos.',   i:'⚡', c1:'#d8b4fe', c2:'#7e22ce' },

  { id:'nim-1', g:'nim', n:'Dominaste el Nim: fácil',   d:'Gánale 3 veces seguidas al bot en Nim fácil.',   i:'🪨', c1:'#86efac', c2:'#15803d' },
  { id:'nim-2', g:'nim', n:'Dominaste el Nim: medio',   d:'Gánale 3 veces seguidas al bot en Nim medio.',   i:'🪨', c1:'#93c5fd', c2:'#1d4ed8' },
  { id:'nim-3', g:'nim', n:'Dominaste el Nim: difícil', d:'Gánale 3 veces seguidas al bot en Nim difícil.', i:'🪨', c1:'#d8b4fe', c2:'#7e22ce' },

  { id:'cn-3', g:'cn', n:'Ojo de halcón 3×3', d:'Completa Caza números 3×3 en menos de 10 segundos.', i:'🦅', c1:'#86efac', c2:'#15803d' },
  { id:'cn-4', g:'cn', n:'Ojo de halcón 4×4', d:'Completa Caza números 4×4 en menos de 25 segundos.', i:'🦅', c1:'#93c5fd', c2:'#1d4ed8' },
  { id:'cn-5', g:'cn', n:'Ojo de halcón 5×5', d:'Completa Caza números 5×5 en menos de 50 segundos.', i:'🦅', c1:'#d8b4fe', c2:'#7e22ce' },

  { id:'mem-2', g:'mem', n:'Memoria de elefante 2×2', d:'Recuerda una secuencia de 8 luces en el tablero 2×2.',  i:'🐘', c1:'#86efac', c2:'#15803d' },
  { id:'mem-3', g:'mem', n:'Memoria de elefante 3×3', d:'Recuerda una secuencia de 10 luces en el tablero 3×3.', i:'🐘', c1:'#93c5fd', c2:'#1d4ed8' },
  { id:'mem-4', g:'mem', n:'Memoria de elefante 4×4', d:'Recuerda una secuencia de 12 luces en el tablero 4×4.', i:'🐘', c1:'#d8b4fe', c2:'#7e22ce' },

  { id:'han-1', g:'han', n:'Hanoi perfecto',        d:'Resuelve una torre con el mínimo de movimientos.',        i:'🗼', c1:'#67e8f9', c2:'#0e7490' },
  { id:'han-3', g:'han', n:'Mente de ingeniero',    d:'Resuelve 3 torres perfectas (mínimo de movimientos).',   i:'📐', c1:'#a5b4fc', c2:'#4338ca' },

  { id:'sud-1', g:'sud', n:'Primer sudoku',         d:'Resuelve tu primer Sudoku.',                              i:'🧩', c1:'#f9a8d4', c2:'#be185d' },
  { id:'sud-0', g:'sud', n:'Sudoku impecable',      d:'Resuelve un Sudoku medio o difícil sin ningún error.',    i:'✨', c1:'#67e8f9', c2:'#0e7490' },
  { id:'sud-d', g:'sud', n:'Maestro del Sudoku',    d:'Resuelve un Sudoku difícil.',                             i:'🎓', c1:'#d8b4fe', c2:'#7e22ce' },

  { id:'tg-1',  g:'tg', n:'Primera figura',          d:'Arma tu primera figura de Tangram en nivel fácil.',          i:'📐', c1:'#86efac', c2:'#15803d' },
  { id:'tg-f10',g:'tg', n:'Armador fácil',           d:'Arma 10 figuras distintas en nivel fácil.',                  i:'🧩', c1:'#67e8f9', c2:'#0e7490' },
  { id:'tg-f50',g:'tg', n:'Armador experto',         d:'Arma 50 figuras distintas en nivel fácil.',                  i:'⭐', c1:'#fde68a', c2:'#d97706' },
  { id:'tg-fall',g:'tg',n:'Tangram fácil completo',  d:'Arma las 100 figuras del nivel fácil.',                      i:'🏅', c1:'#6ee7b7', c2:'#047857' },
  { id:'tg-rf', g:'tg', n:'Manos rápidas',           d:'Arma una figura fácil en menos de 30 segundos.',             i:'⚡', c1:'#fdba74', c2:'#ea580c' },
  { id:'tg-d1', g:'tg', n:'Primera silueta',         d:'Arma tu primera figura en nivel difícil (solo la silueta).', i:'🌑', c1:'#c4b5fd', c2:'#6d28d9' },
  { id:'tg-d10',g:'tg', n:'Detective de siluetas',   d:'Arma 10 figuras distintas en nivel difícil.',                i:'🔍', c1:'#93c5fd', c2:'#1d4ed8' },
  { id:'tg-d50',g:'tg', n:'Ojo de arquitecto',       d:'Arma 50 figuras distintas en nivel difícil.',                i:'🏛️', c1:'#f9a8d4', c2:'#be185d' },
  { id:'tg-dall',g:'tg',n:'Maestro del Tangram',     d:'Arma las 100 figuras del nivel difícil.',                    i:'👑', c1:'#fde68a', c2:'#b45309' },
  { id:'tg-rd', g:'tg', n:'Mente veloz',             d:'Arma una figura difícil en menos de 90 segundos.',           i:'🚀', c1:'#fca5a5', c2:'#dc2626' },
  { id:'tg-sp', g:'tg', n:'Sin pistas',              d:'Arma 5 figuras difíciles sin usar ninguna pista.',           i:'🧠', c1:'#a5b4fc', c2:'#4338ca' },
  { id:'tg-d25',g:'tg', n:'Un cuarto del camino',   d:'Arma 25 figuras distintas en nivel difícil.',                i:'🧭', c1:'#5eead4', c2:'#0f766e' },
  { id:'ca-1',  g:'ca', n:'Primera jugada',        d:'Toma tu primera buena decisión en el Casino de probabilidades.', i:'🎰', c1:'#f9a8d4', c2:'#be185d' },
  { id:'ca-10', g:'ca', n:'Jugador atento',        d:'Acierta 10 decisiones en el Casino.',                            i:'🎲', c1:'#67e8f9', c2:'#0e7490' },
  { id:'ca-50', g:'ca', n:'Estratega del azar',    d:'Acierta 50 decisiones en el Casino.',                            i:'🧠', c1:'#fde68a', c2:'#d97706' },
  { id:'ca-r5', g:'ca', n:'Racha de 5',            d:'Acierta 5 decisiones seguidas en el Casino.',                    i:'🔥', c1:'#fdba74', c2:'#ea580c' },
  { id:'ca-3',  g:'ca', n:'Tres mesas',            d:'Acierta en 3 mesas distintas del Casino.',                i:'🃏', c1:'#c4b5fd', c2:'#6d28d9' },
  { id:'ca-rul',g:'ca', n:'Ojo de ruleta',         d:'Cumple tu primer reto en la Ruleta.',                            i:'🎡', c1:'#6ee7b7', c2:'#047857' },
  { id:'ca-bj', g:'ca', n:'21 con cabeza',         d:'Decide bien una mano de Blackjack.',                             i:'🂡', c1:'#93c5fd', c2:'#1d4ed8' },
  { id:'ca-cr', g:'ca', n:'Ojo de apostador',      d:'Elige un caballo con buenas opciones en la Carrera.',            i:'🏇', c1:'#a5b4fc', c2:'#4338ca' },
  { id:'ca-pk', g:'ca', n:'Cara de póker',         d:'Decide bien una mano de Póker.',                                 i:'♠️', c1:'#d8b4fe', c2:'#6b21a8' },
  { id:'ca-rico',g:'ca',n:'Montaña de fichas',     d:'Llega a 200 fichas de mesa.',                                    i:'💰', c1:'#fde68a', c2:'#b45309' },

  { id:'racha-3',  g:'cons', n:'Tres días seguidos',    d:'Practica 3 días seguidos.',   i:'🔥', c1:'#fdba74', c2:'#ea580c' },
  { id:'racha-7',  g:'cons', n:'Una semana imparable',  d:'Practica 7 días seguidos.',   i:'🔥', c1:'#fca5a5', c2:'#dc2626' },
  { id:'racha-14', g:'cons', n:'Dos semanas de fuego',  d:'Practica 14 días seguidos.',  i:'☄️', c1:'#f0abfc', c2:'#a21caf' },

  { id:'mis-1',   g:'mis', n:'Primera misión',      d:'Cumple tu primera misión.',                   i:'🎯', c1:'#fdba74', c2:'#c2410c' },
  { id:'mis-dia', g:'mis', n:'Día perfecto',        d:'Cumple las 3 misiones de un mismo día.',      i:'🏅', c1:'#6ee7b7', c2:'#047857' },
  { id:'mis-sem', g:'mis', n:'Semana perfecta',     d:'Cumple las 3 misiones de una semana.',        i:'🏆', c1:'#7dd3fc', c2:'#0369a1' },

  { id:'ej-100',  g:'prac', n:'100 ejercicios',     d:'Resuelve 100 ejercicios en total.',           i:'✏️', c1:'#fcd34d', c2:'#b45309' },
  { id:'ej-500',  g:'prac', n:'500 ejercicios',     d:'Resuelve 500 ejercicios en total.',           i:'📘', c1:'#93c5fd', c2:'#1d4ed8' },
  { id:'ej-1000', g:'prac', n:'1000 ejercicios',    d:'Resuelve 1000 ejercicios en total.',          i:'🚀', c1:'#c4b5fd', c2:'#6d28d9' },
  { id:'rec-5',   g:'prac', n:'Explorador',         d:'Practica en 5 recursos distintos.',           i:'🧭', c1:'#5eead4', c2:'#0f766e' },
  { id:'rec-12',  g:'prac', n:'Gran explorador',    d:'Practica en 12 recursos distintos.',          i:'🌎', c1:'#86efac', c2:'#166534' },
];
export const POR_ID = {}; CATALOGO.forEach(x => { POR_ID[x.id] = x; });

(function(){
  if(document.getElementById('ins-css')) return;
  const css = document.createElement('style'); css.id = 'ins-css';
  css.textContent = `
  .ins-med{ --c1:#fde68a; --c2:#d97706; position:relative; flex:none; width:58px; height:58px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.55rem;
    background:radial-gradient(circle at 32% 26%, #fff 0%, var(--c1) 28%, var(--c2) 100%); box-shadow:inset -4px -6px 10px rgba(0,0,0,.28), inset 0 0 0 3px rgba(255,255,255,.55), 0 4px 12px rgba(0,0,0,.35); }
  .ins-med::after{ content:''; position:absolute; inset:7px; border-radius:50%; box-shadow:inset 0 0 0 2px rgba(255,255,255,.4); pointer-events:none; }
  .ins-med.off{ background:radial-gradient(circle at 32% 26%, #6b6490, #3b3560); box-shadow:inset 0 0 0 3px rgba(255,255,255,.14); filter:grayscale(1); }
  .ins-med.off span{ opacity:.35; filter:grayscale(1); }
  .ins-med.off::before{ content:'🔒'; position:absolute; right:-3px; bottom:-3px; font-size:.8rem; filter:none; z-index:2; }
  .ins-ov{ position:fixed; inset:0; z-index:100001; background:rgba(10,4,30,.82); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; padding:12px; }
  .ins-card{ position:relative; width:100%; max-width:640px; max-height:92vh; overflow:auto; color:#f6f3ff; border-radius:28px; padding:16px 14px 14px; border:2px solid rgba(255,255,255,.5);
    background:radial-gradient(120% 60% at 50% 0%,rgba(236,72,153,.35),transparent 60%),linear-gradient(170deg,#2a1163,#3b1a86 55%,#1e1b6b); box-shadow:0 30px 70px rgba(0,0,0,.55); font-family:var(--font-display, system-ui, sans-serif); animation:insEntra .28s cubic-bezier(.2,1.3,.4,1); }
  @keyframes insEntra{ from{ transform:scale(.88); opacity:0; } }
  .ins-x{ position:absolute; right:10px; top:10px; border:none; background:rgba(255,255,255,.18); color:#fff; width:34px; height:34px; border-radius:50%; font-size:1rem; cursor:pointer; }
  .ins-tit{ margin:0; font-size:1.3rem; padding-right:40px; } .ins-sub{ margin:2px 0 8px; font-size:.78rem; font-weight:700; color:#e2d6ff; }
  .ins-barra{ height:10px; border-radius:99px; background:rgba(255,255,255,.16); overflow:hidden; margin-bottom:6px; } .ins-barra i{ display:block; height:100%; border-radius:99px; background:linear-gradient(90deg,#34d399,#fbbf24,#f472b6); }
  .ins-gr{ margin-top:10px; padding:8px; border-radius:18px; background:rgba(15,5,45,.38); box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.16); }
  .ins-gh{ font-weight:900; font-size:.92rem; margin:0 2px 6px; display:flex; justify-content:space-between; } .ins-gh small{ font-weight:800; color:#d7c9ff; font-size:.7rem; }
  .ins-lista{ display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:6px; }
  .ins-it{ display:flex; align-items:center; gap:10px; padding:6px 8px; border-radius:16px; background:rgba(255,255,255,.07); }
  .ins-it.on{ background:linear-gradient(100deg,rgba(255,255,255,.16),rgba(255,255,255,.06)); box-shadow:inset 0 0 0 1.5px rgba(253,230,138,.6); }
  .ins-it .ins-med{ width:46px; height:46px; font-size:1.2rem; }
  .ins-nom{ font-weight:900; font-size:.84rem; line-height:1.15; } .ins-des{ font-size:.7rem; font-weight:700; color:#d8ccf7; margin-top:2px; line-height:1.2; } .ins-it:not(.on) .ins-nom{ color:#cbbfee; }
  .ins-fe{ font-size:.66rem; font-weight:800; color:#fde68a; margin-top:2px; }
  .ins-btn{ display:inline-flex; align-items:center; gap:8px; border:none; cursor:pointer; padding:.45em 1em .45em .5em; border-radius:999px; font-weight:900; font-size:.9rem; color:#fff; font-family:var(--font-display, system-ui, sans-serif);
    background:linear-gradient(115deg,#7c3aed,#db2777 60%,#f97316); box-shadow:inset 0 0 0 2px rgba(255,255,255,.6), 0 6px 18px rgba(190,24,93,.4); }
  .ins-btn .ins-med{ width:30px; height:30px; font-size:.95rem; box-shadow:inset 0 0 0 2px rgba(255,255,255,.6); } .ins-btn .ins-med::after{ display:none; }
  .ins-toast{ position:fixed; top:64px; left:50%; transform:translate(-50%,-20px) scale(.85); opacity:0; z-index:100002; display:flex; align-items:center; gap:12px; padding:9px 18px 9px 10px; border-radius:999px; color:#fff; pointer-events:none; max-width:92vw;
    font-family:var(--font-display, system-ui, sans-serif); background:linear-gradient(115deg,#1e1b6b,#6d28d9 60%,#be185d); box-shadow:inset 0 0 0 2px rgba(253,230,138,.9), 0 10px 30px rgba(0,0,0,.5), 0 0 30px rgba(251,191,36,.6); transition:opacity .3s, transform .5s cubic-bezier(.2,1.5,.4,1); }
  .ins-toast.on{ opacity:1; transform:translate(-50%,0) scale(1); }
  .ins-toast .ins-med{ animation:insGira 1.1s ease-out; } @keyframes insGira{ from{ transform:rotateY(360deg) scale(.4); } }
  .ins-toast b{ display:block; white-space:nowrap; font-size:.66rem; letter-spacing:.1em; text-transform:uppercase; color:#fde68a; } .ins-toast span.t{ display:block; white-space:nowrap; font-weight:900; font-size:.95rem; line-height:1.15; }`;
  document.head.appendChild(css);
})();

export function medallaHtml(x, on){
  return `<span class="ins-med ${on ? '' : 'off'}" style="--c1:${x.c1};--c2:${x.c2}"><span>${x.i}</span></span>`;
}
function fechaCorta(ms){
  try{ return new Intl.DateTimeFormat('es-CL', { timeZone:'America/Santiago', day:'numeric', month:'short' }).format(new Date(ms)); }catch(e){ return ''; }
}
export function htmlVitrina(tengo){
  tengo = tengo || {};
  return GRUPOS.map(gr => {
    const lista = CATALOGO.filter(x => x.g === gr.id), n = lista.filter(x => tengo[x.id]).length;
    return `<div class="ins-gr"><div class="ins-gh"><span>${gr.i} ${gr.n}</span><small>${n}/${lista.length}</small></div><div class="ins-lista">`
      + lista.map(x => { const on = !!tengo[x.id];
          return `<div class="ins-it ${on ? 'on' : ''}">${medallaHtml(x, on)}<div><div class="ins-nom">${x.n}</div><div class="ins-des">${x.d}</div>${on && typeof tengo[x.id] === 'number' ? `<div class="ins-fe">Ganada el ${fechaCorta(tengo[x.id])}</div>` : ''}</div></div>`; }).join('')
      + `</div></div>`;
  }).join('');
}
export function abrirVitrina(tengo){
  tengo = tengo || {};
  const total = CATALOGO.length, n = CATALOGO.filter(x => tengo[x.id]).length;
  let ov = document.getElementById('ins-ov'); if(ov) ov.remove();
  ov = document.createElement('div'); ov.id = 'ins-ov'; ov.className = 'ins-ov';
  ov.innerHTML = `<div class="ins-card"><button type="button" class="ins-x" aria-label="Cerrar">✕</button><h2 class="ins-tit">🏅 Mis insignias</h2><div class="ins-sub">${n} de ${total} conseguidas · ¡las bloqueadas 🔒 son tus próximos desafíos!</div><div class="ins-barra"><i style="width:${Math.round(n / total * 100)}%"></i></div>${htmlVitrina(tengo)}</div>`;
  document.body.appendChild(ov);
  const cerrar = () => ov.remove(); ov.querySelector('.ins-x').onclick = cerrar; ov.addEventListener('click', e => { if(e.target === ov) cerrar(); });
}
export function botonVitrina(tengo){
  tengo = tengo || {};
  const n = CATALOGO.filter(x => tengo[x.id]).length;
  return `<button type="button" class="ins-btn" data-ins-abrir><span class="ins-med"><span>🏅</span></span>Mis insignias · ${n}/${CATALOGO.length}</button>`;
}
const _cola = [];
let _mostrando = false;
export function avisoInsignia(x){
  _cola.push(x); if(!_mostrando) _sig();
}
function _sig(){
  const x = _cola.shift(); if(!x){ _mostrando = false; return; }
  _mostrando = true;
  const t = document.createElement('div'); t.className = 'ins-toast';
  t.innerHTML = `${medallaHtml(x, true)}<div><b>¡Nueva insignia!</b><span class="t">${x.n}</span></div>`;
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('on')));
  setTimeout(() => { t.classList.remove('on'); setTimeout(() => { t.remove(); _sig(); }, 400); }, 4300);
}
