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
    gorra_67:       { nombre:'Gorra 67',           slot:'gorro',    precio:450  },
    // Camisetas (colores y número genéricos, sin escudos ni marcas)
    camiseta_roja_verde_7: { nombre:'Roja y verde \u00b7 7',   slot:'camiseta', precio:700, retirada:true },
    camiseta_roja_9:       { nombre:'Delantero rojo \u00b7 9', slot:'camiseta', precio:700, retirada:true },
    camiseta_roja_19:      { nombre:'Roja y amarilla \u00b7 19', slot:'camiseta', precio:700, retirada:true },
    camiseta_roja_17:      { nombre:'Roja y blanca \u00b7 17', slot:'camiseta', precio:700, retirada:true },
    camiseta_celeste_9:    { nombre:'Celeste con franja \u00b7 9', slot:'camiseta', precio:700, retirada:true },
    camiseta_azulgrana_10: { nombre:'Azul y granate \u00b7 10', slot:'camiseta', precio:700, retirada:true },
    camiseta_amarilla_10:  { nombre:'Amarilla y azul \u00b7 10', slot:'camiseta', precio:700, retirada:true },
    camiseta_blanca_7:     { nombre:'Blanca y dorada \u00b7 7', slot:'camiseta', precio:700, retirada:true },
    camiseta_arquero_1:    { nombre:'Arquero \u00b7 1',       slot:'camiseta', precio:700, retirada:true },
    camiseta_campeon:      { nombre:'Dorada de campe\u00f3n \u2605', slot:'camiseta', precio:1000, retirada:true },
    camiseta_celeste_10:   { nombre:'Celeste y blanca \u00b7 10', slot:'camiseta', precio:700, retirada:true },
    camiseta_amarilla_11:  { nombre:'Amarilla y verde \u00b7 11', slot:'camiseta', precio:700, retirada:true },
    camiseta_pi:           { nombre:'Camiseta \u03c0',         slot:'camiseta', precio:500, retirada:true },
    camiseta_67:           { nombre:'Camiseta 67',        slot:'camiseta', precio:700  },
    // Selecciones: camiseta con la BANDERA del país en el pecho (banderas = símbolos libres; sin escudos ni marcas reales)
    camiseta_sel_chile:     { nombre:'Chile \u00b7 7',          slot:'camiseta', grupo:'\u26bd Selecciones', precio:800 },
    camiseta_sel_argentina: { nombre:'Argentina \u00b7 10',     slot:'camiseta', grupo:'\u26bd Selecciones', precio:800 },
    camiseta_sel_brasil:    { nombre:'Brasil \u00b7 10',        slot:'camiseta', grupo:'\u26bd Selecciones', precio:800 },
    camiseta_sel_uruguay:   { nombre:'Uruguay \u00b7 9',        slot:'camiseta', grupo:'\u26bd Selecciones', precio:800 },
    camiseta_sel_colombia:  { nombre:'Colombia \u00b7 10',      slot:'camiseta', grupo:'\u26bd Selecciones', precio:800 },
    camiseta_sel_mexico:    { nombre:'M\u00e9xico \u00b7 11',  slot:'camiseta', grupo:'\u26bd Selecciones', precio:800 },
    camiseta_sel_espana:    { nombre:'Espa\u00f1a \u00b7 19',   slot:'camiseta', grupo:'\u26bd Selecciones', precio:800 },
    camiseta_sel_francia:   { nombre:'Francia \u00b7 10',       slot:'camiseta', grupo:'\u26bd Selecciones', precio:800 },
    camiseta_sel_alemania:  { nombre:'Alemania \u00b7 13',      slot:'camiseta', grupo:'\u26bd Selecciones', precio:800 },
    camiseta_sel_italia:    { nombre:'Italia \u00b7 10',        slot:'camiseta', grupo:'\u26bd Selecciones', precio:800 },
    camiseta_sel_portugal:  { nombre:'Portugal \u00b7 7',       slot:'camiseta', grupo:'\u26bd Selecciones', precio:800 },
    camiseta_sel_inglaterra:{ nombre:'Inglaterra \u00b7 9',     slot:'camiseta', grupo:'\u26bd Selecciones', precio:800 },
    camiseta_sel_holanda:   { nombre:'Pa\u00edses Bajos \u00b7 14', slot:'camiseta', grupo:'\u26bd Selecciones', precio:800 },
    // Con escudo propio (escudos inventados, no de equipos reales)
    camiseta_escudo_estrella: { nombre:'Escudo estrella \u00b7 10', slot:'camiseta', grupo:'\ud83d\udee1\ufe0f Con escudo', precio:900 },
    camiseta_escudo_pi:       { nombre:'Escudo \u03c0 \u00b7 3',     slot:'camiseta', grupo:'\ud83d\udee1\ufe0f Con escudo', precio:900 },
    camiseta_escudo_rayo:     { nombre:'Escudo rayo \u00b7 11',  slot:'camiseta', grupo:'\ud83d\udee1\ufe0f Con escudo', precio:900 },
    camiseta_escudo_corona:   { nombre:'Escudo corona \u00b7 8', slot:'camiseta', grupo:'\ud83d\udee1\ufe0f Con escudo', precio:900 },
    // Clubes chilenos: solo colores y diseño de la camiseta (sin escudos ni marcas)
    camiseta_club_blancanegra: { nombre:'Blanca y negra \u00b7 8', slot:'camiseta', grupo:'\ud83c\udfdf\ufe0f Clubes chilenos', precio:800 },
    camiseta_club_azulrojo:    { nombre:'Azul y roja \u00b7 11',    slot:'camiseta', grupo:'\ud83c\udfdf\ufe0f Clubes chilenos', precio:800 },
    camiseta_club_cruzada:     { nombre:'Blanca con banda \u00b7 9', slot:'camiseta', grupo:'\ud83c\udfdf\ufe0f Clubes chilenos', precio:800 },
  };

  const TINTA = '#1e1147';   // contorno, igual que el robot base

  /* ---------- Gorros (vista frontal; la punta naranja sale por encima, detrás del gorro) ---------- */
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
    gorra_67: () => `
      <path d="M27 27 Q27 9 50 9 Q73 9 73 27 Z" fill="#4338ca" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M50 9 Q41 12 39 27 M50 9 Q59 12 61 27" stroke="#312e81" stroke-width="1.2" fill="none" opacity=".7"/>
      <text x="50" y="25.4" text-anchor="middle" font-size="15.5" font-weight="800" font-family="'Baloo 2', system-ui, sans-serif" fill="#ffffff" stroke="${TINTA}" stroke-width="1.5" paint-order="stroke" stroke-linejoin="round">67</text>
      <ellipse cx="50" cy="28" rx="27" ry="5" fill="#22d3ee" stroke="${TINTA}" stroke-width="2"/>`,
    corona: () => `
      <path d="M30 25 L30 7 L39 15 L44 8 L50 15 L56 8 L61 15 L70 7 L70 25 Z" fill="#fbbf24" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/>
      <rect x="30" y="20" width="40" height="6" fill="#f59e0b" stroke="${TINTA}" stroke-width="1.6"/>
      <circle cx="38" cy="23" r="1.8" fill="#fb7185"/><circle cx="50" cy="23" r="1.8" fill="#38bdf8"/><circle cx="62" cy="23" r="1.8" fill="#34d399"/>`,
  };


  /* ---------- Gorros a juego con las camisetas (300 monedas c/u) ---------- */
  // Gorra de visera con la bandera en el frente (mismos países de las camisetas de selección)
  const _SEL = {   // clave: [nombre, color de la copa, color de la visera]
    chile:['Chile','#d52b1e','#0039a6'],        argentina:['Argentina','#7dc4ee','#1e3a8a'],
    brasil:['Brasil','#15a34a','#facc15'],      uruguay:['Uruguay','#7dc4ee','#1e1147'],
    colombia:['Colombia','#facc15','#1d4ed8'],  mexico:['México','#15803d','#dc2626'],
    espana:['España','#c8102e','#f1bf00'], francia:['Francia','#1e40af','#ef4135'],
    alemania:['Alemania','#111827','#dd0000'],  italia:['Italia','#1d6fd6','#15803d'],
    portugal:['Portugal','#b91c1c','#046a38'],  inglaterra:['Inglaterra','#1e3a8a','#ce1124'],
    holanda:['Países Bajos','#f97316','#1e3a8a'],
  };
  const _gorraVisera = (copa, visera, frente) => `
      <path d="M27 27 Q27 9 50 9 Q73 9 73 27 Z" fill="${copa}" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M50 9 Q41 12 39 27 M50 9 Q59 12 61 27" stroke="rgba(30,17,71,.28)" stroke-width="1.1" fill="none"/>
      ${frente}
      <ellipse cx="50" cy="28" rx="27" ry="5" fill="${visera}" stroke="${TINTA}" stroke-width="2"/>`;
  Object.keys(_SEL).forEach(k => {
    const [nom, copa, visera] = _SEL[k], id = 'gorra_sel_' + k;
    window.CATALOGO_SKINS_ROBOT[id] = { nombre:'Gorra ' + nom, slot:'gorro', grupo:'⚽ Selecciones', precio:300 };
    GORROS[id] = () => _gorraVisera(copa, visera,
      `<g transform="translate(42.2 13.2) scale(.52)"><g>${BANDERAS[k]}</g><rect width="30" height="20" fill="none" stroke="${TINTA}" stroke-width="2.6"/></g>`);
  });
  // Gorra con el escudo de las camisetas "Con escudo"
  const _ESC = {   // clave: [nombre, copa, visera, fondo del escudo, signo]
    estrella:['Escudo estrella','#6d28d9','#fbbf24','#fbbf24','estrella'], pi:['Escudo π','#1d4ed8','#ffffff','#ffffff','pi'],
    rayo:['Escudo rayo','#111827','#fbbf24','#fbbf24','rayo'],               corona:['Escudo corona','#15803d','#fde047','#fde047','corona'],
  };
  Object.keys(_ESC).forEach(k => {
    const [nom, copa, visera, fondo, signo] = _ESC[k], id = 'gorra_escudo_' + k;
    window.CATALOGO_SKINS_ROBOT[id] = { nombre:'Gorra ' + nom, slot:'gorro', grupo:'🛡️ Con escudo', precio:300 };
    GORROS[id] = () => _gorraVisera(copa, visera,
      `<g transform="translate(44.2 12.4) scale(.95)"><path d="M0 0 H12 V8 Q12 12.4 6 14 Q0 12.4 0 8Z" fill="${fondo}" stroke="${TINTA}" stroke-width="1.1" stroke-linejoin="round"/>${SIGNOS[signo](signo === 'pi' ? '#1d4ed8' : '#1e1147')}</g>`);
  });
  // Gorros de lana con los colores de los clubes chilenos
  const _lana = (copa, puño, detalle, pompon) => `
      <clipPath id="rbClipLana"><path d="M27 30 Q27 8 50 8 Q73 8 73 30 Z"/></clipPath>
      <path d="M27 30 Q27 8 50 8 Q73 8 73 30 Z" fill="${copa}" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/>
      <g clip-path="url(#rbClipLana)">${detalle}</g>
      <path d="M27 30 Q27 8 50 8 Q73 8 73 30" fill="none" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/>
      <rect x="25" y="26" width="50" height="8" rx="4" fill="${puño}" stroke="${TINTA}" stroke-width="2"/>
      ${pompon ? `<circle cx="50" cy="8" r="0" fill="none"/>` : ''}`;
  const _CLUBES = {
    blancanegra:['Blanca y negra', _lana('#ffffff', '#111827', [33,43,53,63].map(x => `<rect x="${x-2.5}" y="6" width="5" height="26" fill="#111827"/>`).join(''))],
    azulrojo:   ['Azul y roja',    _lana('#1d4ed8', '#dc2626', `<path d="M27 16 Q50 8 73 16 V19 Q50 11 27 19 Z" fill="#ffffff"/>`)],
    cruzada:    ['Blanca con banda', _lana('#ffffff', '#1d4ed8', `<rect x="20" y="14" width="60" height="4.4" fill="#1d4ed8"/><rect x="20" y="18.4" width="60" height="3" fill="#dc2626"/>`)],
  };
  Object.keys(_CLUBES).forEach(k => {
    const id = 'gorro_club_' + k;
    window.CATALOGO_SKINS_ROBOT[id] = { nombre:'Gorro ' + _CLUBES[k][0], slot:'gorro', grupo:'🏟️ Clubes chilenos', precio:300 };
    GORROS[id] = () => _CLUBES[k][1];
  });
  // A cuánto sube la punta naranja del robot sobre cada gorro (negativo = más arriba); por defecto -3
  const PUNTA = { gorro_fiesta:0, corona:0, sombrero_paja:-7, gorro_lana:-4, gorro_club_blancanegra:-4, gorro_club_azulrojo:-4, gorro_club_cruzada:-4 };

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
    camiseta_67:           { principal:'#ffffff', detalle:'#38bdf8', texto:'67', colorTexto:'#0ea5e9', fs:23, contorno:'#0c4a6e' },
    camiseta_sel_chile:     { principal:'#d52b1e', detalle:'#0039a6', texto:'7',  colorTexto:'#ffffff', bandera:'chile' },
    camiseta_sel_argentina: { principal:'#7dc4ee', detalle:'#1e3a8a', texto:'10', colorTexto:'#1e3a8a', rayas:'#ffffff', bandera:'argentina' },
    camiseta_sel_brasil:    { principal:'#facc15', detalle:'#15803d', texto:'10', colorTexto:'#15803d', bandera:'brasil' },
    camiseta_sel_uruguay:   { principal:'#7dc4ee', detalle:'#1e1147', texto:'9',  colorTexto:'#1e1147', bandera:'uruguay' },
    camiseta_sel_colombia:  { principal:'#facc15', detalle:'#1d4ed8', texto:'10', colorTexto:'#1d4ed8', bandera:'colombia' },
    camiseta_sel_mexico:    { principal:'#15803d', detalle:'#ffffff', texto:'11', colorTexto:'#ffffff', bandera:'mexico' },
    camiseta_sel_espana:    { principal:'#c8102e', detalle:'#fde047', texto:'19',  colorTexto:'#fde047', bandera:'espana' },
    camiseta_sel_francia:   { principal:'#1e40af', detalle:'#ffffff', texto:'10', colorTexto:'#ffffff', bandera:'francia' },
    camiseta_sel_alemania:  { principal:'#ffffff', detalle:'#111827', texto:'13', colorTexto:'#111827', bandera:'alemania' },
    camiseta_sel_italia:    { principal:'#1d6fd6', detalle:'#ffffff', texto:'10', colorTexto:'#ffffff', bandera:'italia' },
    camiseta_sel_portugal:  { principal:'#b91c1c', detalle:'#15803d', texto:'7',  colorTexto:'#fde047', bandera:'portugal' },
    camiseta_sel_inglaterra:{ principal:'#ffffff', detalle:'#1e3a8a', texto:'9',  colorTexto:'#1e3a8a', bandera:'inglaterra' },
    camiseta_sel_holanda:   { principal:'#f97316', detalle:'#1e1147', texto:'14', colorTexto:'#1e1147', bandera:'holanda' },
    camiseta_escudo_estrella: { principal:'#6d28d9', detalle:'#fbbf24', texto:'10', colorTexto:'#fde047', escudo:{ fondo:'#fbbf24', signo:'estrella' } },
    camiseta_escudo_pi:       { principal:'#ffffff', detalle:'#1d4ed8', texto:'3',  colorTexto:'#1d4ed8', rayas:'#93c5fd', escudo:{ fondo:'#1d4ed8', signo:'pi' } },
    camiseta_escudo_rayo:     { principal:'#111827', detalle:'#fbbf24', texto:'11', colorTexto:'#fbbf24', escudo:{ fondo:'#fbbf24', signo:'rayo' } },
    camiseta_escudo_corona:   { principal:'#15803d', detalle:'#fde047', texto:'8',  colorTexto:'#fde047', escudo:{ fondo:'#fde047', signo:'corona' } },
    camiseta_club_blancanegra: { principal:'#ffffff', detalle:'#111827', texto:'8', colorTexto:'#111827' },
    camiseta_club_azulrojo:    { principal:'#1d4ed8', detalle:'#dc2626', texto:'11', colorTexto:'#ffffff' },
    camiseta_club_cruzada:     { principal:'#ffffff', detalle:'#1d4ed8', texto:'9', colorTexto:'#1d4ed8', banda:['#1d4ed8','#dc2626'] },
  };

  /* ---------- Banderas (caja 30 x 20) y escudos (caja 12 x 14) del pecho ---------- */
  const _est = (cx, cy, r, f) => { let p = ''; for(let i=0;i<10;i++){ const a = -Math.PI/2 + i*Math.PI/5, rr = i%2 ? r*.42 : r; p += (i?'L':'M') + (cx + rr*Math.cos(a)).toFixed(2) + ' ' + (cy + rr*Math.sin(a)).toFixed(2); } return `<path d="${p}Z" fill="${f}"/>`; };
  const BANDERAS = {
    chile:      `<rect width="30" height="10" fill="#fff"/><rect y="10" width="30" height="10" fill="#d52b1e"/><rect width="10" height="10" fill="#0039a6"/>${_est(5,5,3.2,'#fff')}`,
    argentina:  `<rect width="30" height="20" fill="#74acdf"/><rect y="6.7" width="30" height="6.6" fill="#fff"/><circle cx="15" cy="10" r="2.1" fill="#f6b40e"/>`,
    brasil:     `<rect width="30" height="20" fill="#009c3b"/><path d="M15 2.2 L27 10 L15 17.8 L3 10Z" fill="#ffdf00"/><circle cx="15" cy="10" r="4.4" fill="#002776"/>`,
    uruguay:    `<rect width="30" height="20" fill="#fff"/><path d="M0 4.4H30M0 8.8H30M0 13.2H30M0 17.6H30" stroke="#5aa5dc" stroke-width="2.2"/><rect width="11" height="9.6" fill="#fff"/><circle cx="5.5" cy="4.8" r="2.6" fill="#f6b40e"/>`,
    colombia:   `<rect width="30" height="20" fill="#fcd116"/><rect y="10" width="30" height="5" fill="#003893"/><rect y="15" width="30" height="5" fill="#ce1126"/>`,
    mexico:     `<rect width="10" height="20" fill="#006847"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ce1126"/><circle cx="15" cy="10" r="2.4" fill="#a16207"/>`,
    espana:     `<rect width="30" height="20" fill="#aa151b"/><rect y="5" width="30" height="10" fill="#f1bf00"/>`,
    francia:    `<rect width="10" height="20" fill="#0055a4"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ef4135"/>`,
    alemania:   `<rect width="30" height="20" fill="#111"/><rect y="6.7" width="30" height="6.7" fill="#dd0000"/><rect y="13.4" width="30" height="6.6" fill="#ffce00"/>`,
    italia:     `<rect width="10" height="20" fill="#009246"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ce2b37"/>`,
    portugal:   `<rect width="12" height="20" fill="#046a38"/><rect x="12" width="18" height="20" fill="#da291c"/><circle cx="12" cy="10" r="3.6" fill="#ffe000" stroke="#fff" stroke-width=".8"/>`,
    inglaterra: `<rect width="30" height="20" fill="#fff"/><rect x="12.6" width="4.8" height="20" fill="#ce1124"/><rect y="7.6" width="30" height="4.8" fill="#ce1124"/>`,
    holanda:    `<rect width="30" height="20" fill="#fff"/><rect width="30" height="6.7" fill="#ae1c28"/><rect y="13.3" width="30" height="6.7" fill="#21468b"/>`,
  };
  const SIGNOS = {
    estrella: (f) => _est(6, 7.4, 3.6, f),
    pi:       (f) => `<text x="6" y="10.6" text-anchor="middle" font-size="9" font-weight="800" font-family="'Baloo 2', system-ui, sans-serif" fill="${f}">\u03c0</text>`,
    rayo:     (f) => `<path d="M7 3 L3.6 8 H6 L5 11.4 L8.6 6.4 H6.2Z" fill="${f}"/>`,
    corona:   (f) => `<path d="M3 10 L3 5 L4.9 7 L6 4.6 L7.1 7 L9 5 L9 10Z" fill="${f}"/>`,
  };
  function emblema(c){
    if(c.bandera) return `<g transform="translate(29.6 65.6) scale(.56)"><g>${BANDERAS[c.bandera]}</g><rect width="30" height="20" fill="none" stroke="${TINTA}" stroke-width="1.6"/></g>`;
    if(c.escudo){
      const col = c.principal === '#ffffff' ? '#ffffff' : '#ffffff';
      return `<g transform="translate(32 65.2) scale(.95)"><path d="M0 0 H12 V8 Q12 12.4 6 14 Q0 12.4 0 8Z" fill="${c.escudo.fondo}" stroke="${TINTA}" stroke-width="1.1" stroke-linejoin="round"/>${SIGNOS[c.escudo.signo](c.escudo.signo === 'pi' ? '#ffffff' : '#1e1147')}</g>`;
    }
    return '';
  }

  let _n = 0;   // ids únicos por dibujo (evita choques entre varios robots en la misma página)

  function camisetaCuerpo(c, idClip){
    const rayas = c.rayas ? [30,38,46,54,62,70].map(x=>`<rect x="${x-2}" y="64" width="4" height="26" fill="${c.rayas}"/>`).join('') : '';
    const emb = !!(c.bandera || c.escudo);
    const bnd = c.banda ? `<rect x="22" y="74.6" width="56" height="3.8" fill="${c.banda[0]}"/><rect x="22" y="78.4" width="56" height="2.6" fill="${c.banda[1]}"/>` : '';
    const fs = c.fs ? c.fs : c.banda ? 13 : emb ? (c.texto.length > 1 ? 12 : 15) : (c.texto.length > 1 ? 15 : 20);
    const tx = emb ? 61.5 : 50;
    return `
      <g clip-path="url(#${idClip})">
        <path d="M24 59 Q50 67 76 59 L76 90 L24 90 Z" fill="${c.principal}"/>
        ${rayas}
        ${bnd}
        ${c.franja ? `<rect x="46" y="64" width="8" height="26" fill="${c.franja}"/>` : ''}
        <path d="M24 59 Q50 67 76 59" stroke="${c.detalle}" stroke-width="3.2" fill="none"/>
      </g>
      <path d="M26 59 Q50 67 74 59" stroke="${TINTA}" stroke-width="1.2" fill="none" opacity=".85"/>
      ${c.estrella ? `<path transform="translate(50 73) scale(1.15) translate(-50 -79)" d="M50 70.5 L52.6 76.4 L59 77 L54.2 81.2 L55.7 87.5 L50 84.2 L44.3 87.5 L45.8 81.2 L41 77 L47.4 76.4 Z" fill="#fff7d6" stroke="${c.detalle}" stroke-width="1.2" stroke-linejoin="round"/>` : ''}
      ${emb ? emblema(c) : ''}
      <text x="${tx}" y="${c.banda ? 73.4 : emb ? 79 : (c.texto==='\u03c0' ? 79.5 : 80)}" text-anchor="middle" font-size="${fs}" font-weight="800"
            font-family="'Baloo 2', system-ui, sans-serif" fill="${c.colorTexto}"
            stroke="${c.contorno ? c.contorno : (c.colorTexto==='#ffffff' || c.colorTexto==='#fde047' ? 'rgba(30,17,71,.45)' : 'none')}" stroke-width="${c.contorno ? '.9' : '.6'}" paint-order="stroke">${c.texto}</text>`;
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
    const dyPunta = hat ? (PUNTA[equipo.gorro] !== undefined ? PUNTA[equipo.gorro] : -3) : 0;
    const narizGorro = `<g transform="translate(0 ${dyPunta})">${nariz}</g>`;
    return `<svg viewBox="0 ${hat ? -10 : 0} 100 ${hat ? 110 : 100}" class="rb-body">
    <ellipse cx="50" cy="92" rx="24" ry="5" fill="rgba(0,0,0,0.28)"/>
    <path d="${cuerpo}" fill="url(#${idBody})" stroke="${TINTA}" stroke-width="2"/>
    ${hat ? narizGorro : nariz}
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
    ${hat ? hat() : ''}
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
