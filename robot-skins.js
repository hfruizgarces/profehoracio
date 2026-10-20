/* ============================================================
   ROBOT SKINS — catálogo y dibujo del robot con ropa
   Se carga como <script> normal (NO módulo) desde:
     - robot-mision-codigo/index.html  (para vestir al robot)
     - mi-mathverse.html               (tienda y vista previa)
   Para agregar una prenda: sumar una entrada en CATALOGO_SKINS_ROBOT
   (nombre, slot, precio) y su dibujo en GORROS o CAMISETAS con el MISMO id.
   Las prendas son solo decoración: no afectan en nada el juego.
   ============================================================ */
(function(){
  'use strict';

  /* ---------- Catálogo (precios en monedas) ---------- */
  window.NOMBRES_SLOT_ROBOT = { gorro:'Gorro', camiseta:'Camiseta' };
  window.CATALOGO_SKINS_ROBOT = {
    // Gorros
    gorra_roja:     { nombre:'Gorra roja',         slot:'gorro',    precio:300  },
    gorro_lana:     { nombre:'Gorro de lana',      slot:'gorro',    precio:300  },
    gorro_fiesta:   { nombre:'Gorro de fiesta',    slot:'gorro',    precio:450  },
    sombrero_paja:  { nombre:'Sombrero de paja',   slot:'gorro',    precio:450  },
    corona:         { nombre:'Corona dorada',      slot:'gorro',    precio:1000 },
    // Camisetas (colores y número genéricos, sin escudos ni marcas)
    camiseta_roja_verde_7: { nombre:'Roja y verde \u00b7 7',   slot:'camiseta', precio:700 },
    camiseta_roja_9:       { nombre:'Delantero rojo \u00b7 9', slot:'camiseta', precio:700 },
    camiseta_roja_19:      { nombre:'Roja y amarilla \u00b7 19', slot:'camiseta', precio:700 },
    camiseta_roja_17:      { nombre:'Roja y blanca \u00b7 17', slot:'camiseta', precio:700 },
    camiseta_celeste_9:    { nombre:'Celeste con franja \u00b7 9', slot:'camiseta', precio:700 },
    camiseta_azulgrana_10: { nombre:'Azul y granate \u00b7 10', slot:'camiseta', precio:700 },
    camiseta_amarilla_10:  { nombre:'Amarilla y azul \u00b7 10', slot:'camiseta', precio:700 },
    camiseta_blanca_7:     { nombre:'Blanca y dorada \u00b7 7', slot:'camiseta', precio:700 },
    camiseta_arquero_1:    { nombre:'Arquero \u00b7 1',       slot:'camiseta', precio:700 },
    camiseta_campeon:      { nombre:'Dorada de campe\u00f3n \u2605', slot:'camiseta', precio:1000 },
    camiseta_celeste_10:   { nombre:'Celeste y blanca \u00b7 10', slot:'camiseta', precio:700 },
    camiseta_amarilla_11:  { nombre:'Amarilla y verde \u00b7 11', slot:'camiseta', precio:700 },
    camiseta_pi:           { nombre:'Camiseta \u03c0',         slot:'camiseta', precio:500 },
  };

  const TINTA = '#1e1147';   // contorno, igual que el robot base

  /* ---------- Gorros (vista frontal; la "nariz" naranja sigue asomando encima) ---------- */
  const GORROS = {
    gorra_roja: () => `
      <path d="M27 27 Q27 9 50 9 Q73 9 73 27 Z" fill="#dc2626" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M50 9 Q40 12 38 27 M50 9 Q60 12 62 27" stroke="#991b1b" stroke-width="1.2" fill="none" opacity=".8"/>
      <ellipse cx="50" cy="28" rx="27" ry="5" fill="#991b1b" stroke="${TINTA}" stroke-width="2"/>`,
    gorro_lana: () => `
      <path d="M27 30 Q27 8 50 8 Q73 8 73 30 Z" fill="#38bdf8" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M33 22 Q50 14 67 22" stroke="#ffffff" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <rect x="25" y="26" width="50" height="8" rx="4" fill="#ffffff" stroke="${TINTA}" stroke-width="2"/>
      <path d="M33 27 V33 M41 27 V33 M49 27 V33 M57 27 V33 M65 27 V33" stroke="#bae6fd" stroke-width="1.6"/>`,
    gorro_fiesta: () => `
      <path d="M26 24 L46 18 L33 -2 Z" fill="#f472b6" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M29.4 15.6 L41 12.4 M31.6 9.6 L37.8 7.8" stroke="#fde047" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="33" cy="-2" r="3.6" fill="#fde047" stroke="${TINTA}" stroke-width="1.4"/>
      <ellipse cx="36" cy="21" rx="11" ry="3" fill="#fde047" stroke="${TINTA}" stroke-width="1.6" transform="rotate(-14 36 21)"/>`,
    sombrero_paja: () => `
      <ellipse cx="50" cy="23" rx="33" ry="8" fill="#e9c46a" stroke="${TINTA}" stroke-width="2"/>
      <path d="M34 23 Q34 5 50 5 Q66 5 66 23 Z" fill="#f4d58d" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/>
      <rect x="34" y="16" width="32" height="5" fill="#dc2626" stroke="${TINTA}" stroke-width="1.4"/>
      <path d="M17 22 Q50 31 83 22" stroke="#c9a14a" stroke-width="1.2" fill="none" opacity=".8"/>`,
    corona: () => `
      <path d="M30 25 L30 7 L39 15 L44 8 L50 15 L56 8 L61 15 L70 7 L70 25 Z" fill="#fbbf24" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/>
      <rect x="30" y="20" width="40" height="6" fill="#f59e0b" stroke="${TINTA}" stroke-width="1.6"/>
      <circle cx="38" cy="23" r="1.8" fill="#fb7185"/><circle cx="50" cy="23" r="1.8" fill="#38bdf8"/><circle cx="62" cy="23" r="1.8" fill="#34d399"/>`,
  };

  /* ---------- Camisetas ---------- */
  // principal: color del cuerpo; detalle: cuello y puños; numero: texto
  const CAMISETAS = {
    camiseta_roja_verde_7: { principal:'#d62839', detalle:'#0f7a3d', texto:'7',  colorTexto:'#fde047' },
    camiseta_roja_9:       { principal:'#dc2626', detalle:'#ffffff', texto:'9',  colorTexto:'#ffffff' },
    camiseta_roja_19:      { principal:'#c8102e', detalle:'#fde047', texto:'19', colorTexto:'#fde047' },
    camiseta_roja_17:      { principal:'#d52b1e', detalle:'#ffffff', texto:'17', colorTexto:'#ffffff' },
    camiseta_celeste_9:    { principal:'#6cabdd', detalle:'#ffffff', texto:'9',  colorTexto:'#1e3a8a', franja:'#ffffff' },
    camiseta_azulgrana_10: { principal:'#a50044', detalle:'#fde047', texto:'10', colorTexto:'#fde047', rayas:'#004d98' },
    camiseta_amarilla_10:  { principal:'#facc15', detalle:'#1d4ed8', texto:'10', colorTexto:'#1d4ed8' },
    camiseta_blanca_7:     { principal:'#ffffff', detalle:'#d4a017', texto:'7',  colorTexto:'#b8860b' },
    camiseta_arquero_1:    { principal:'#f97316', detalle:'#1e1147', texto:'1',  colorTexto:'#ffffff' },
    camiseta_campeon:      { principal:'#fbbf24', detalle:'#92400e', texto:'',   colorTexto:'#92400e', estrella:true },
    camiseta_celeste_10:   { principal:'#ffffff', detalle:'#1e3a8a', texto:'10', colorTexto:'#1e3a8a', rayas:'#7dd3fc' },
    camiseta_amarilla_11:  { principal:'#facc15', detalle:'#15803d', texto:'11', colorTexto:'#15803d' },
    camiseta_pi:           { principal:'#6d28d9', detalle:'#fbbf24', texto:'\u03c0',  colorTexto:'#ffffff' },
  };

  let _n = 0;   // ids únicos por dibujo (evita choques entre varios robots en la misma página)

  function camisetaCuerpo(c, idClip){
    const rayas = c.rayas ? [30,38,46,54,62,70].map(x=>`<rect x="${x-2}" y="64" width="4" height="26" fill="${c.rayas}"/>`).join('') : '';
    const fs = c.texto.length > 1 ? 15 : 20;
    return `
      <g clip-path="url(#${idClip})">
        <path d="M24 59 Q50 67 76 59 L76 90 L24 90 Z" fill="${c.principal}"/>
        ${rayas}
        ${c.franja ? `<rect x="46" y="64" width="8" height="26" fill="${c.franja}"/>` : ''}
        <path d="M24 59 Q50 67 76 59" stroke="${c.detalle}" stroke-width="3.2" fill="none"/>
      </g>
      <path d="M26 59 Q50 67 74 59" stroke="${TINTA}" stroke-width="1.2" fill="none" opacity=".85"/>
      ${c.estrella ? `<path transform="translate(50 73) scale(1.15) translate(-50 -79)" d="M50 70.5 L52.6 76.4 L59 77 L54.2 81.2 L55.7 87.5 L50 84.2 L44.3 87.5 L45.8 81.2 L41 77 L47.4 76.4 Z" fill="#fff7d6" stroke="${c.detalle}" stroke-width="1.2" stroke-linejoin="round"/>` : ''}
      <text x="50" y="${c.texto==='\u03c0' ? 79.5 : 80}" text-anchor="middle" font-size="${fs}" font-weight="800"
            font-family="'Baloo 2', system-ui, sans-serif" fill="${c.colorTexto}"
            stroke="${c.colorTexto==='#ffffff' || c.colorTexto==='#fde047' ? 'rgba(30,17,71,.45)' : 'none'}" stroke-width=".6" paint-order="stroke">${c.texto}</text>`;
  }
  function camisetaMangas(c, bI, bD){
    const mk = (x, tr) => `<g${tr}>
      <rect x="${x}" y="33" width="10" height="19" rx="5" fill="${c.principal}" stroke="${TINTA}" stroke-width="1.5"/>
      ${c.rayas ? `<rect x="${x+3}" y="34" width="4" height="17" fill="${c.rayas}"/>` : ''}
      <rect x="${x}" y="47.5" width="10" height="3.4" rx="1.6" fill="${c.detalle}" stroke="${TINTA}" stroke-width="1"/></g>`;
    return mk(14, bI) + mk(76, bD);
  }

  /**
   * Devuelve el SVG del robot. equipo = { gorro:'id'|null, camiseta:'id'|null }.
   * Sin prendas, es EXACTAMENTE el robot original.
   */
  window.dibujarRobot = function(equipo, opciones){
    equipo = equipo || {};
    opciones = opciones || {};
    const cel = !!opciones.celebra;   // brazos arriba
    const bI = cel ? ' transform="rotate(150 19 37)"' : '', bD = cel ? ' transform="rotate(-150 81 37)"' : '';
    const hat = GORROS[equipo.gorro] || null;
    const tee = CAMISETAS[equipo.camiseta] || null;
    const k = ++_n, idBody = 'gradBody' + k, idClip = 'clipBody' + k;
    const nariz = `<path class="rb-nose" d="M 50 2 L 58 16 L 42 16 Z" fill="#f97316" stroke="${TINTA}" stroke-width="1.5" stroke-linejoin="round"/>`;
    const cuerpo = 'M 26 40 Q 26 14 50 14 Q 74 14 74 40 L 74 62 Q 74 82 50 82 Q 26 82 26 62 Z';
    return `<svg viewBox="0 0 100 100" class="rb-body">
    <ellipse cx="50" cy="92" rx="24" ry="5" fill="rgba(0,0,0,0.28)"/>
    <path d="${cuerpo}" fill="url(#${idBody})" stroke="${TINTA}" stroke-width="2"/>
    ${hat ? '' : nariz}
    ${tee ? '<g transform="translate(50 19) scale(.72) translate(-50 -16)">' : ''}
    <ellipse cx="36" cy="55" rx="6" ry="4.5" fill="#f472b6" opacity="0.65"/>
    <ellipse cx="64" cy="55" rx="6" ry="4.5" fill="#f472b6" opacity="0.65"/>
    <circle cx="39" cy="42" r="9" fill="${TINTA}"/>
    <circle cx="61" cy="42" r="9" fill="${TINTA}"/>
    <circle cx="39" cy="42" r="4.6" fill="#22d3ee" class="rb-eye"/>
    <circle cx="61" cy="42" r="4.6" fill="#22d3ee" class="rb-eye"/>
    <circle cx="41" cy="40" r="1.6" fill="#fff"/>
    <circle cx="63" cy="40" r="1.6" fill="#fff"/>
    <path d="M 42 63 Q 50 70 58 63" stroke="${TINTA}" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>
    ${tee ? '</g>' : ''}
    <rect x="14" y="34" width="10" height="24" rx="5" fill="#7c3aed" stroke="${TINTA}" stroke-width="1.5"${bI}/>
    <rect x="76" y="34" width="10" height="24" rx="5" fill="#7c3aed" stroke="${TINTA}" stroke-width="1.5"${bD}/>
    <rect x="32" y="78" width="13" height="15" rx="5.5" fill="#5b21b6" stroke="${TINTA}" stroke-width="1.5"/>
    <rect x="55" y="78" width="13" height="15" rx="5.5" fill="#5b21b6" stroke="${TINTA}" stroke-width="1.5"/>
    ${tee ? camisetaCuerpo(tee, idClip) + camisetaMangas(tee, bI, bD) : ''}
    ${hat ? hat() + nariz : ''}
    <defs>
      <linearGradient id="${idBody}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset="1" stop-color="#dcd4f7"/>
      </linearGradient>
      <clipPath id="${idClip}"><path d="${cuerpo}"/></clipPath>
    </defs>
  </svg>`;
  };
})();
