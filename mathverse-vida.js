/* ============================================================
   MATHVERSE · VIDA DE LAS MASCOTAS
   Da vida a la imagen de la criatura equipada sin tocar sus PNG:
     · respiración suave (se infla y se encoge, apoyada en las patas)
     · partículas según su elemento (chispas, burbujas, hojas, copos…)
     · se duerme (zzz) si el alumno lleva un rato sin hacer nada
     · opcional: al tocarla salta y suelta corazones
   Uso:  mvVida.activar(imgElemento, 'chispo', { respira:true, particulas:true, toque:false })
   Respeta "reducir movimiento" y se apaga solo en computadores muy lentos.
   ============================================================ */
(function(){
  if(window.mvVida) return;
  const REDUCIDO = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const LENTO = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || (navigator.deviceMemory && navigator.deviceMemory <= 2);
  const SUENO_MS = 45000;

  // Elemento de cada criatura → forma, colores y dirección de las partículas
  const TEMAS = {
    chispo: { f:'chispa',  c:['#fde047','#7dd3fc','#ffffff'], dir:'sube' },
    gotin:  { f:'burbuja', c:['#bae6fd'],                     dir:'sube' },
    glacia: { f:'chispa',  c:['#ffffff','#bae6fd','#7dd3fc'], dir:'baja' },
    geoto:  { f:'polvo',   c:['#fb923c','#fbbf24','#a16207'], dir:'sube' },
    lumis:  { f:'chispa',  c:['#fde68a','#ffffff','#fbbf24'], dir:'sube' },
    ascuin: { f:'brasa',   c:['#f97316','#ef4444','#fbbf24'], dir:'sube' },
    umbry:  { f:'chispa',  c:['#c4b5fd','#a78bfa','#e9d5ff'], dir:'sube' },
    ferrox: { f:'polvo',   c:['#fb923c','#f87171','#cbd5e1'], dir:'sube' },
    brote:  { f:'hoja',    c:['#4ade80','#86efac','#22c55e'], dir:'baja' },
    alar:   { f:'hoja',    c:['#bef264','#86efac','#fde68a'], dir:'baja' },
    mystra: { f:'chispa',  c:['#fde68a','#f0abfc','#c4b5fd'], dir:'sube' }
  };

  function css(){
    if(document.getElementById('mvVidaCss')) return;
    const st = document.createElement('style'); st.id = 'mvVidaCss';
    st.textContent = `
.mv-vida-resp{ animation:mv-resp var(--vr,4.4s) ease-in-out infinite; transform-origin:50% 100%; }
@keyframes mv-resp{ 0%,100%{ transform:scale(1,1); } 50%{ transform:scale(.992,1.03); } }
.mv-vida-dormida{ --vr:7.5s; filter:brightness(.86) saturate(.9); }
.mv-vida-capa{ position:absolute; pointer-events:none; z-index:3; overflow:visible; }
.mv-p{ position:absolute; left:var(--x); top:var(--y0); width:var(--s); height:var(--s); background:var(--c); opacity:0; animation:var(--an) var(--d) linear var(--dl) infinite; will-change:transform,opacity; }
.mv-p.f-chispa{ clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%); }
.mv-p.f-burbuja{ border-radius:50%; background:radial-gradient(circle at 30% 30%,#fff,rgba(125,211,252,.3)); border:1px solid rgba(186,230,253,.95); }
.mv-p.f-hoja{ border-radius:0 100% 0 100%; }
.mv-p.f-brasa{ border-radius:50%; box-shadow:0 0 6px var(--c); }
.mv-p.f-polvo{ border-radius:2px; }
@keyframes mv-sube{ 0%{ transform:translate(0,0) scale(.4); opacity:0; } 15%{ opacity:.95; } 100%{ transform:translate(var(--dx),-130%) scale(1) rotate(var(--r)); opacity:0; } }
@keyframes mv-baja{ 0%{ transform:translate(0,0) scale(.5); opacity:0; } 15%{ opacity:.95; } 100%{ transform:translate(var(--dx),130%) scale(1) rotate(var(--r)); opacity:0; } }
.mv-z{ position:absolute; font:800 1.1em 'Baloo 2',system-ui,sans-serif; color:#e9d5ff; text-shadow:0 1px 4px rgba(0,0,0,.6); opacity:0; animation:mv-zz 3.2s ease-in-out infinite; }
@keyframes mv-zz{ 0%{ transform:translate(0,0) scale(.6); opacity:0; } 25%{ opacity:1; } 100%{ transform:translate(14px,-34px) scale(1.2); opacity:0; } }
.mv-salto{ animation:mv-hop .62s ease-out !important; }
@keyframes mv-hop{ 0%{ transform:scale(1,1) translateY(0); } 25%{ transform:scale(1.06,.9) translateY(0); } 55%{ transform:scale(.96,1.07) translateY(-9%); } 100%{ transform:scale(1,1) translateY(0); } }
.mv-cora{ position:absolute; color:#fb7185; font-size:1.05em; text-shadow:0 1px 3px rgba(0,0,0,.45); opacity:0; animation:mv-cora 1.1s ease-out forwards; }
@keyframes mv-cora{ 0%{ transform:translate(0,0) scale(.5); opacity:0; } 20%{ opacity:1; } 100%{ transform:translate(var(--dx),-70px) scale(1.15); opacity:0; } }
@media (prefers-reduced-motion:reduce){ .mv-vida-resp,.mv-p,.mv-z,.mv-salto,.mv-cora{ animation:none !important; } .mv-p,.mv-z{ display:none; } }`;
    document.head.appendChild(st);
  }

  const activos = new Set();
  let ultimoToque = Date.now(), dormidas = false;
  function despertar(){ ultimoToque = Date.now(); if(dormidas) cambiarSueno(false); }
  function cambiarSueno(d){ dormidas = d; activos.forEach(a => { if(!a.img.isConnected){ activos.delete(a); return; } a.img.classList.toggle('mv-vida-dormida', d); a.zzz(d); }); }
  ['pointerdown','keydown','pointermove','touchstart','wheel'].forEach(ev => window.addEventListener(ev, despertar, { passive:true }));
  setInterval(() => { if(!dormidas && Date.now() - ultimoToque > SUENO_MS && !document.hidden) cambiarSueno(true); }, 5000);

  function posicionar(img, capa){
    capa.style.left = img.offsetLeft + 'px'; capa.style.top = img.offsetTop + 'px';
    capa.style.width = img.offsetWidth + 'px'; capa.style.height = img.offsetHeight + 'px';
    capa.style.fontSize = Math.max(11, img.offsetWidth * 0.09) + 'px';
  }
  const rnd = (a, b) => a + Math.random() * (b - a);

  function activar(img, crit, opts){
    if(!img || img.dataset.mvVida) return; opts = Object.assign({ respira:true, particulas:true, toque:false }, opts || {});
    img.dataset.mvVida = '1'; css();
    if(opts.respira && !REDUCIDO) img.classList.add('mv-vida-resp');
    const capa = document.createElement('div'); capa.className = 'mv-vida-capa'; capa.setAttribute('aria-hidden', 'true');
    img.insertAdjacentElement('afterend', capa);
    const pos = () => posicionar(img, capa); pos();
    if(window.ResizeObserver){ new ResizeObserver(pos).observe(img); } window.addEventListener('resize', pos);
    img.addEventListener('load', pos);

    const T = TEMAS[crit];
    if(opts.particulas && T && !REDUCIDO && !LENTO){
      const n = 7;
      for(let i = 0; i < n; i++){
        const p = document.createElement('span'); p.className = 'mv-p f-' + T.f;
        const s = T.f === 'burbuja' ? rnd(5, 11) : rnd(4, 9), baja = T.dir === 'baja';
        p.style.cssText = `--x:${rnd(4, 92).toFixed(0)}%;--y0:${baja ? rnd(-4, 22).toFixed(0) : rnd(48, 82).toFixed(0)}%;--s:${s.toFixed(1)}px;--c:${T.c[i % T.c.length]};--an:${baja ? 'mv-baja' : 'mv-sube'};--d:${rnd(3.2, 5.6).toFixed(1)}s;--dl:${(-rnd(0, 5)).toFixed(1)}s;--dx:${rnd(-18, 18).toFixed(0)}px;--r:${rnd(-120, 120).toFixed(0)}deg`;
        capa.appendChild(p);
      }
    }
    // zzz cuando se duerme
    let zs = [];
    const zzz = on => { zs.forEach(z => z.remove()); zs = [];
      if(!on || REDUCIDO) return;
      for(let i = 0; i < 3; i++){ const z = document.createElement('span'); z.className = 'mv-z'; z.textContent = 'z'; z.style.cssText = `left:${62 + i * 6}%;top:${14 - i * 3}%;animation-delay:${i * 1.0}s`; capa.appendChild(z); zs.push(z); } };
    const reg = { img, zzz }; activos.add(reg); if(dormidas){ img.classList.add('mv-vida-dormida'); zzz(true); }

    if(opts.toque){
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => {
        if(REDUCIDO) return;
        img.classList.remove('mv-salto'); void img.offsetWidth; img.classList.add('mv-salto');
        setTimeout(() => img.classList.remove('mv-salto'), 680);
        for(let i = 0; i < 5; i++){ const h = document.createElement('span'); h.className = 'mv-cora'; h.textContent = '♥';
          h.style.cssText = `left:${rnd(25, 70).toFixed(0)}%;top:${rnd(0, 18).toFixed(0)}%;--dx:${rnd(-22, 22).toFixed(0)}px;animation-delay:${(i * .08).toFixed(2)}s`;
          capa.appendChild(h); setTimeout(() => h.remove(), 1400); }
      });
    }
  }
  window.mvVida = { activar, TEMAS };
})();
