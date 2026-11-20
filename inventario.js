/* INVENTARIO — ventana "Mi inventario" del inicio: lo que el alumno ya tiene (monedas, diamantes, compañeros, ropa del robot, insignias).
   Es solo de lectura (no compra ni cambia nada); para equipar se va a Mi Mathverse. Si algo falla, el resto del sitio sigue igual. */
const CSS = `
.inv-ov{position:fixed;inset:0;z-index:100000;background:rgba(10,4,30,.82);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:12px}
.inv-card{position:relative;width:100%;max-width:560px;max-height:92vh;overflow:auto;color:#f6f3ff;border-radius:28px;padding:16px 16px 16px;border:2px solid rgba(255,255,255,.5);background:radial-gradient(120% 70% at 50% 0%,rgba(14,165,233,.35),transparent 60%),linear-gradient(170deg,#1e1b6b,#2a1163 55%,#1e1b6b);box-shadow:0 30px 70px rgba(0,0,0,.55),0 0 40px rgba(124,58,237,.5);font-family:var(--font-display,system-ui,sans-serif)}
.inv-x{position:absolute;right:10px;top:10px;border:none;background:rgba(255,255,255,.18);color:#fff;width:34px;height:34px;border-radius:50%;font-size:1rem;cursor:pointer}
.inv-card h2{margin:0 40px 10px 0;font-size:1.35rem}
.inv-saldos{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px}
.inv-s{display:flex;align-items:center;gap:7px;padding:6px 14px;border-radius:999px;background:rgba(255,255,255,.1);box-shadow:inset 0 0 0 1px rgba(255,255,255,.25);font-weight:800;font-size:1rem}
.inv-s.d{box-shadow:inset 0 0 0 1px rgba(103,232,249,.7),0 0 14px rgba(34,211,238,.35);color:#a5f3fc}
.inv-s.m{box-shadow:inset 0 0 0 1px rgba(251,191,36,.6);color:#fde68a}
.inv-sec{margin-top:12px}
.inv-sec h3{margin:0 0 6px;font-size:.9rem;display:flex;justify-content:space-between;align-items:baseline;color:#e2d6ff}
.inv-sec h3 small{font-weight:700;opacity:.8}
.inv-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px}
.inv-it{position:relative;border-radius:16px;padding:6px 4px 5px;text-align:center;background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1px rgba(255,255,255,.2)}
.inv-it.eq{box-shadow:inset 0 0 0 2px #34d399,0 0 12px rgba(52,211,153,.45)}
.inv-it img{width:62px;height:62px;object-fit:contain;display:block;margin:0 auto}
.inv-it .rb{width:62px;height:62px;margin:0 auto}.inv-it .rb svg{width:100%;height:100%}
.inv-it b{display:block;font-size:.68rem;line-height:1.15;margin-top:2px}
.inv-it i{display:block;font-style:normal;font-size:.6rem;font-weight:800;color:#6ee7b7}
.inv-vacio{padding:10px;border-radius:14px;background:rgba(255,255,255,.07);font-size:.8rem;font-weight:700;color:#d8cbff}
.inv-pie{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
.inv-pie a,.inv-pie button{flex:1;min-width:140px;text-align:center;text-decoration:none;border:none;cursor:pointer;font-family:inherit;font-weight:800;font-size:.85rem;color:#fff;padding:.6em .9em;border-radius:999px;background:linear-gradient(135deg,#7c3aed,#5b21b6);box-shadow:inset 0 0 0 1px rgba(196,181,253,.6)}
`;
function esc(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c])); }
function cargarRobotSkins(){
  if(window.CATALOGO_SKINS_ROBOT) return Promise.resolve();
  return new Promise(res => { const s = document.createElement('script'); s.src = 'robot-skins.js'; s.onload = s.onerror = () => res(); document.head.appendChild(s); });
}
export async function abrirInventario(id){
  if(!document.getElementById('inv-css')){ const st = document.createElement('style'); st.id = 'inv-css'; st.textContent = CSS; document.head.appendChild(st); }
  let ov = document.getElementById('inv-ov'); if(ov) ov.remove();
  ov = document.createElement('div'); ov.id = 'inv-ov'; ov.className = 'inv-ov';
  ov.innerHTML = '<div class="inv-card"><button type="button" class="inv-x" aria-label="Cerrar">✕</button><h2>🎒 Mi inventario</h2><div class="inv-vacio">Cargando…</div></div>';
  document.body.appendChild(ov);
  const cerrar = () => ov.remove(); ov.querySelector('.inv-x').onclick = cerrar; ov.addEventListener('click', e => { if(e.target === ov) cerrar(); });
  let d = null; try{ d = window.obtenerDatosAlumno ? await window.obtenerDatosAlumno(id) : null; }catch(e){}
  if(!ov.isConnected) return;
  d = d || {};
  await cargarRobotSkins();
  const cat = window.CATALOGO_CRIATURAS || {}, skins = window.CATALOGO_SKINS_ROBOT || {};
  const crits = Object.keys(d.criaturas || {}).filter(k => cat[k]);
  const ropa = Object.keys(d.skinsRobot || {}).filter(k => d.skinsRobot[k] && skins[k]);
  const puesto = d.skinRobotEquipado || {}, eqC = d.companeroEquipado;
  const nIns = Object.keys(d.insignias || {}).length;
  const itC = crits.map(k => {
    const et = window.etapaCompanero ? window.etapaCompanero(d.companeroXpV2 && d.companeroXpV2[k]) : null;
    let arch = cat[k].archivo; try{ if(window.archivoCompanero && et) arch = window.archivoCompanero(k, et.nivel, window.evoCompanero(d, k)) || arch; }catch(e){}
    return `<div class="inv-it ${k === eqC ? 'eq' : ''}"><img src="assets/mathverse/creatures/${esc(arch)}" alt="" loading="lazy"><b>${esc(cat[k].nombre)}</b>${k === eqC ? '<i>✓ Contigo</i>' : (et ? `<i style="color:#c4b5fd">Nv ${et.nivel}</i>` : '')}</div>`;
  }).join('');
  const itR = ropa.map(k => {
    let dib = ''; try{ dib = window.dibujarRobot ? window.dibujarRobot({ [skins[k].slot]: k }) : ''; }catch(e){}
    const on = puesto[skins[k].slot] === k;
    return `<div class="inv-it ${on ? 'eq' : ''}"><div class="rb">${dib}</div><b>${esc(skins[k].nombre)}</b>${on ? '<i>✓ Puesto</i>' : ''}</div>`;
  }).join('');
  ov.querySelector('.inv-card').innerHTML = `<button type="button" class="inv-x" aria-label="Cerrar">✕</button><h2>🎒 Mi inventario</h2>
    <div class="inv-saldos"><div class="inv-s m">🪙 ${d.monedas || 0}</div><div class="inv-s d">💎 ${d.diamantes || 0}</div></div>
    <div class="inv-sec"><h3>🐾 Compañeros <small>${crits.length} de ${Object.keys(cat).length}</small></h3>${itC ? `<div class="inv-g">${itC}</div>` : '<div class="inv-vacio">Aún no tienes compañeros. ¡Consigue el primero en la tienda!</div>'}</div>
    <div class="inv-sec"><h3>👕 Ropa del robot <small>${ropa.length}</small></h3>${itR ? `<div class="inv-g">${itR}</div>` : '<div class="inv-vacio">Aún no tienes ropa para el robot.</div>'}</div>
    <div class="inv-pie"><a href="mi-mathverse.html">🛍️ Ir a Mi Mathverse</a><button type="button" id="inv-ins">🏅 Mis insignias · ${nIns}</button></div>`;
  ov.querySelector('.inv-x').onclick = cerrar;
  const bi = ov.querySelector('#inv-ins');
  if(bi) bi.onclick = async () => { try{ const m = await import('./insignias.js'); cerrar(); m.abrirVitrina(d.insignias || {}); }catch(e){ console.warn(e); } };
}
