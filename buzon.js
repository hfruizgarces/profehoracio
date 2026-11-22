/* BUZÓN — el alumno le escribe una sugerencia al profe (máx. 200 caracteres, sin límite diario).
   Se guarda en la colección "buzon" con id único alumno_hora (sin límite diario).
   Muestra una vez la respuesta nueva del profe (buzonRespuesta) y guarda el historial en la ficha del alumno (buzonHistorial), visible solo para él. */
const CSS = `
.bz-ov{position:fixed;inset:0;z-index:100000;background:rgba(10,4,30,.82);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:12px}
.bz-card{position:relative;width:100%;max-width:480px;max-height:92vh;overflow:auto;color:#f6f3ff;border-radius:28px;padding:18px;border:2px solid rgba(255,255,255,.5);background:radial-gradient(120% 70% at 50% 0%,rgba(236,72,153,.35),transparent 60%),linear-gradient(170deg,#2a1163,#3b0f5c 55%,#2a1163);box-shadow:0 30px 70px rgba(0,0,0,.55),0 0 40px rgba(236,72,153,.4);font-family:var(--font-display,system-ui,sans-serif)}
.bz-x{position:absolute;right:10px;top:10px;border:none;background:rgba(255,255,255,.18);color:#fff;width:34px;height:34px;border-radius:50%;font-size:1rem;cursor:pointer}
.bz-card h2{margin:0 40px 6px 0;font-size:1.3rem}
.bz-card p{margin:0 0 10px;font-weight:700;font-size:.88rem;color:#e9d5ff}
.bz-card textarea{width:100%;box-sizing:border-box;min-height:110px;border-radius:16px;border:2px solid rgba(255,255,255,.4);background:rgba(8,3,26,.5);color:#fff;font:inherit;font-weight:700;padding:10px 12px;resize:none}
.bz-card textarea:focus{outline:none;border-color:#f9a8d4;box-shadow:0 0 0 3px rgba(244,114,182,.3)}
.bz-pie{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px}
.bz-cont{font-weight:800;font-size:.8rem;color:#e9d5ff}
.bz-btn{border:none;cursor:pointer;font-family:inherit;font-weight:800;font-size:.95rem;color:#fff;padding:.6em 1.4em;border-radius:999px;background:linear-gradient(135deg,#ec4899,#be185d);box-shadow:inset 0 0 0 1px rgba(255,255,255,.5)}
.bz-btn:disabled{opacity:.5;cursor:default}
.bz-msg{margin-top:8px;font-weight:800;font-size:.85rem;min-height:1.2em}
.bz-hist{margin-top:14px;border-top:1px solid rgba(255,255,255,.25);padding-top:10px}
.bz-hist h3{margin:0 0 8px;font-size:1rem}
.bz-conv{margin-bottom:10px;padding:8px;border-radius:14px;background:rgba(255,255,255,.07)}
.bz-yo,.bz-pf{padding:7px 10px;border-radius:12px;font-weight:700;font-size:.85rem;line-height:1.35;white-space:pre-wrap;word-break:break-word;margin-top:4px}
.bz-yo{background:rgba(236,72,153,.28)}
.bz-pf{background:rgba(52,211,153,.2);box-shadow:inset 0 0 0 1px rgba(52,211,153,.45)}
.bz-esp{margin-top:4px;font-size:.78rem;font-weight:800;color:#e9d5ff}
.bz-resp{padding:12px 14px;border-radius:16px;background:rgba(52,211,153,.18);box-shadow:inset 0 0 0 1px rgba(52,211,153,.5);font-weight:700;line-height:1.4;white-space:pre-wrap;word-break:break-word;margin-bottom:12px}
`;
function css(){ if(!document.getElementById('bz-css')){ const s = document.createElement('style'); s.id = 'bz-css'; s.textContent = CSS; document.head.appendChild(s); } }
function hoyChile(){ try{ return new Date().toLocaleDateString('sv-SE', { timeZone:'America/Santiago' }); }catch(e){ return new Date().toISOString().slice(0, 10); } }
function modal(html){
  css(); const old = document.getElementById('bz-ov'); if(old) old.remove();
  const ov = document.createElement('div'); ov.id = 'bz-ov'; ov.className = 'bz-ov';
  ov.innerHTML = '<div class="bz-card"><button type="button" class="bz-x" aria-label="Cerrar">✕</button>' + html + '</div>';
  document.body.appendChild(ov);
  const cerrar = () => ov.remove(); ov.querySelector('.bz-x').onclick = cerrar; ov.addEventListener('click', e => { if(e.target === ov) cerrar(); });
  return { ov, cerrar };
}
function cargarHistorial(alumno, card){
  const fs = window.__mvFS; if(!fs) return;
  fs.runTransaction(fs.db, async tx => { const sn = await tx.get(fs.doc(fs.db, 'alumnosRobot', alumno.id)); return sn.exists() ? (sn.data().buzonHistorial || []) : []; }).then(hist => {
    if(!hist.length || !card.isConnected) return;
    const box = document.createElement('div'); box.className = 'bz-hist'; box.innerHTML = '<h3>📜 Mis mensajes</h3>';
    hist.slice().reverse().forEach(h => {
      const c = document.createElement('div'); c.className = 'bz-conv';
      const a = document.createElement('div'); a.className = 'bz-yo'; a.textContent = 'Yo: ' + (h.p || '');
      c.appendChild(a);
      if(h.r){ const r = document.createElement('div'); r.className = 'bz-pf'; r.textContent = 'Profe: ' + h.r; c.appendChild(r); }
      else { const e = document.createElement('div'); e.className = 'bz-esp'; e.textContent = '⏳ Esperando respuesta'; c.appendChild(e); }
      box.appendChild(c);
    });
    card.appendChild(box);
  }).catch(e => console.warn('buzón historial', e));
}
export function abrirBuzon(alumno){
  const { ov, cerrar } = modal(`<h2>📮 Buzón del profe</h2><p>Cuéntame una idea, un problema o lo que te gustaría que tuviera el sitio. ¡Te puedo responder!</p>
    <textarea id="bzTxt" maxlength="200" placeholder="Escribe aquí…"></textarea>
    <div class="bz-pie"><span class="bz-cont" id="bzCont">0 / 200</span><button type="button" class="bz-btn" id="bzEnv">Enviar</button></div><div class="bz-msg" id="bzMsg"></div>`);
  const t = ov.querySelector('#bzTxt'), c = ov.querySelector('#bzCont'), b = ov.querySelector('#bzEnv'), m = ov.querySelector('#bzMsg');
  t.addEventListener('input', () => { c.textContent = t.value.length + ' / 200'; });
  cargarHistorial(alumno, ov.querySelector('.bz-card'));
  b.onclick = async () => {
    const txt = t.value.trim(); if(txt.length < 3){ m.textContent = 'Escribe un mensaje un poco más largo.'; return; }
    const fs = window.__mvFS; if(!fs){ m.textContent = 'No se pudo conectar. Intenta de nuevo en un momento.'; return; }
    b.disabled = true; m.textContent = 'Enviando…';
    try{
      const ref = fs.doc(fs.db, 'buzon', alumno.id + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6));
      const fRef = fs.doc(fs.db, 'alumnosRobot', alumno.id);
      const ts = Date.now();
      await fs.runTransaction(fs.db, async tx => {
        const snap = await tx.get(fRef); const hist = ((snap.exists() && snap.data().buzonHistorial) || []).slice();
        hist.push({ p:txt, ts });
        tx.set(ref, { alumnoId:alumno.id, nombre:String(alumno.nombre || ''), texto:txt, ts, leido:false });
        tx.set(fRef, { buzonHistorial: hist.slice(-30) }, { merge:true });
      });
      ov.querySelector('.bz-card').innerHTML = '<button type="button" class="bz-x" aria-label="Cerrar">✕</button><h2>✅ ¡Mensaje enviado!</h2><p>Gracias por escribirme. Si te respondo, lo verás aquí en el inicio.</p><div class="bz-pie"><span></span><button type="button" class="bz-btn" id="bzOk">Listo</button></div>';
      ov.querySelector('.bz-x').onclick = cerrar; ov.querySelector('#bzOk').onclick = cerrar;
    }catch(err){
      console.warn('buzón', err);
      const denegado = err && (err.code === 'permission-denied' || /permission/i.test(err.message || ''));
      m.textContent = denegado ? 'No se pudo enviar (permiso). Avísale al profe.' : 'No se pudo enviar. Revisa tu conexión e inténtalo otra vez.';
      b.disabled = false;
    }
  };
}
export function mostrarRespuesta(alumno, resp){
  const { ov, cerrar } = modal(`<h2>📮 ¡El profe te respondió!</h2><div class="bz-yo" id="bzPreg" style="display:none"></div><div class="bz-pf" id="bzRsp" style="margin-bottom:12px"></div><div class="bz-pie"><span></span><button type="button" class="bz-btn" id="bzOk">¡Gracias!</button></div>`);
  ov.querySelector('#bzRsp').textContent = 'Profe: ' + (resp && resp.texto ? resp.texto : '');
  if(resp && resp.pregunta){ const q = ov.querySelector('#bzPreg'); q.textContent = 'Tú me escribiste: ' + resp.pregunta; q.style.display = ''; q.style.marginBottom = '6px'; }
  ov.querySelector('#bzOk').onclick = cerrar;
  const fs = window.__mvFS;
  if(fs) fs.runTransaction(fs.db, async tx => { tx.set(fs.doc(fs.db, 'alumnosRobot', alumno.id), { buzonRespuesta: null }, { merge:true }); }).catch(e => console.warn('buzón', e));
}
