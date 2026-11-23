/* ------------------------------------------------------------------
   Ilustrações originais de motos (SVG gerado em JS).
   bike(tipo, corHex) -> string <svg>. Rodas têm a classe .wheel
   para girar com CSS/JS. Chão em y = 232.
------------------------------------------------------------------- */

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  r = Math.round((t - r) * p + r);
  g = Math.round((t - g) * p + g);
  b = Math.round((t - b) * p + b);
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

const INK = "#1b1c21", STEEL = "#b4b9c2", STEEL_D = "#6b7079", DARK = "#2b2d34", DARK2 = "#3b3e47";

function wheel(cx, cy, r, kind) {
  let spokes = "";
  const n = kind === "spoke" ? 16 : 5;
  for (let i = 0; i < n; i++) {
    const a = (i * 360) / n;
    spokes += kind === "spoke"
      ? `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - r * 0.8}" transform="rotate(${a} ${cx} ${cy})" stroke="#c9cdd4" stroke-width="1.2"/>`
      : `<path d="M${cx - 5} ${cy} L${cx - 3.5} ${cy - r * 0.78} L${cx + 3.5} ${cy - r * 0.78} L${cx + 5} ${cy} Z" transform="rotate(${a} ${cx} ${cy})" fill="#d8dbe1"/>`;
  }
  return `<g class="wheel">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${INK}"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.78}" fill="#f2f3f5" stroke="${kind === "spoke" ? "#d9dce2" : "#ced1d8"}" stroke-width="${kind === "spoke" ? 3 : 2}"/>
    ${kind === "spoke" ? `<circle cx="${cx}" cy="${cy}" r="${r * 0.76}" fill="#fff"/>` : `<circle cx="${cx}" cy="${cy}" r="${r * 0.62}" fill="#e3e5ea"/>`}
    ${spokes}
    <circle cx="${cx}" cy="${cy}" r="${r * 0.17}" fill="${STEEL_D}"/>
    <circle cx="${cx}" cy="${cy - r * 0.64}" r="2.6" fill="#d6001c"/>
  </g>`;
}

/* guarda-lama em arco centrado no cubo */
function fender(cx, cy, r, c, w = 7, a0 = -150, a1 = -28) {
  const p = a => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
}

const GEOM = {
  //            rear hub        front hub       raio  tipo de roda
  cub:      { rh: [96, 186],  fh: [322, 186], r: 46, k: "alloy" },
  scooter:  { rh: [106, 196], fh: [322, 196], r: 36, k: "alloy" },
  scooter2: { rh: [108, 194], fh: [322, 194], r: 38, k: "alloy" },
  street:   { rh: [92, 182],  fh: [322, 182], r: 50, k: "alloy" },
  trail:    { rh: [92, 178],  fh: [328, 178], r: 54, k: "spoke" },
  naked:    { rh: [94, 182],  fh: [322, 182], r: 50, k: "alloy" },
  adv:      { rh: [92, 178],  fh: [328, 178], r: 54, k: "spoke" }
};

const BIKES = {
  /* Pop / Biz: underbone */
  cub: c => `
    <path d="M322 186 L292 92" stroke="${STEEL_D}" stroke-width="8" stroke-linecap="round"/>
    <path d="M232 204 L96 188" stroke="${DARK}" stroke-width="10" stroke-linecap="round"/>
    <path d="M196 224 L90 222 Q78 220 80 211 L92 207 L196 212 Z" fill="${STEEL}"/>
    <circle cx="232" cy="204" r="24" fill="${STEEL_D}"/>
    <rect x="214" y="168" width="34" height="44" rx="6" fill="${DARK}" transform="rotate(-20 232 204)"/>
    <path d="M210 198 L214 152 Q150 138 84 150 Q62 156 62 174 L78 188 L132 186 L152 202 Z" fill="${c}"/>
    <path d="M150 168 L120 200" stroke="${STEEL}" stroke-width="6" stroke-linecap="round"/>
    <path d="M86 136 Q150 122 218 138 L214 154 L80 152 Z" fill="${DARK}"/>
    <path d="M206 192 L262 192 L262 202 L206 202 Z" fill="${DARK2}"/>
    <path d="M300 96 Q312 134 288 192 L258 192 Q266 142 276 100 Z" fill="${c}"/>
    <path d="M268 88 Q292 62 318 82 L312 100 L272 100 Z" fill="${shade(c, -0.12)}"/>
    <path d="M288 84 L268 66 L250 68" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse cx="316" cy="96" rx="13" ry="11" fill="#fff" stroke="#c7ccd4" stroke-width="2"/>
    ${fender(322, 186, 52, c, 8, -150, -30)}
    <rect x="56" y="156" width="10" height="16" rx="3" fill="#d6001c"/>
  `,
  /* Elite: scooter compacta */
  scooter: c => `
    <path d="M322 196 L294 100" stroke="${STEEL_D}" stroke-width="8" stroke-linecap="round"/>
    <path d="M186 216 L108 198" stroke="${DARK}" stroke-width="14" stroke-linecap="round"/>
    <rect x="150" y="196" width="52" height="24" rx="8" fill="${STEEL_D}"/>
    <path d="M268 202 L176 202 L176 214 L268 214 Z" fill="${shade(c, -0.28)}"/>
    <path d="M178 214 L184 152 Q138 128 90 146 Q62 160 66 184 L84 186 L134 184 L152 216 Z" fill="${c}"/>
    <path d="M88 136 Q140 118 192 142 L188 158 L82 160 Z" fill="${DARK}"/>
    <path d="M302 106 Q318 154 292 206 L262 208 Q270 152 280 102 Z" fill="${c}"/>
    <path d="M274 92 Q296 68 324 86 L332 106 L296 112 Z" fill="${shade(c, -0.12)}"/>
    <path d="M304 88 Q332 92 336 106 Q320 114 302 108 Z" fill="#fff" stroke="#c7ccd4" stroke-width="2"/>
    <path d="M284 90 L268 70 L254 72" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    ${fender(322, 196, 41, c, 7, -150, -30)}
    <rect x="60" y="164" width="10" height="16" rx="3" fill="#d6001c"/>
  `,
  /* PCX: scooter esportiva */
  scooter2: c => `
    <path d="M322 194 L292 96" stroke="${STEEL_D}" stroke-width="9" stroke-linecap="round"/>
    <path d="M190 214 L110 196" stroke="${DARK}" stroke-width="15" stroke-linecap="round"/>
    <rect x="150" y="194" width="56" height="26" rx="9" fill="${STEEL_D}"/>
    <path d="M272 200 L178 200 L178 214 L272 214 Z" fill="${shade(c, -0.3)}"/>
    <path d="M180 214 L190 148 Q136 120 84 142 Q58 160 62 184 L84 188 L136 186 L154 218 Z" fill="${c}"/>
    <path d="M62 166 L94 162" stroke="${shade(c, -0.3)}" stroke-width="3" stroke-linecap="round"/>
    <path d="M86 130 Q142 108 198 138 L194 156 L78 158 Z" fill="${DARK}"/>
    <path d="M304 100 Q320 152 292 204 L260 206 Q268 148 276 98 Z" fill="${c}"/>
    <path d="M268 90 Q294 58 330 76 L342 100 L296 112 Z" fill="${shade(c, -0.14)}"/>
    <path d="M300 74 L322 34 Q328 30 330 38 L322 78 Z" fill="#cfe3f2" opacity=".8"/>
    <path d="M306 86 L340 92 L338 100 L306 100 Z" fill="#fff" stroke="#c7ccd4" stroke-width="1.5"/>
    <path d="M282 84 L264 66 L248 68" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    ${fender(322, 194, 43, c, 8, -150, -30)}
    <rect x="56" y="162" width="10" height="16" rx="3" fill="#d6001c"/>
  `,
  /* CG 160: street clássica */
  street: c => `
    <path d="M322 182 L290 76" stroke="${STEEL_D}" stroke-width="9" stroke-linecap="round"/>
    <path d="M322 182 L296 96" stroke="${STEEL}" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M200 186 L92 182" stroke="${DARK}" stroke-width="11" stroke-linecap="round"/>
    <path d="M176 102 L268 98 L278 152 L256 198 L196 198 L182 152 Z" fill="${DARK}"/>
    <path d="M196 124 L266 122 M198 140 L270 138 M202 156 L272 154 M208 172 L270 170" stroke="${DARK2}" stroke-width="4"/>
    <path d="M258 196 Q242 216 206 216 L88 210 Q76 206 80 198 L94 196 L200 202 Q226 202 242 186 Z" fill="${STEEL}"/>
    <path d="M254 78 Q224 62 188 80 Q180 94 184 112 Q228 122 270 106 Z" fill="${c}"/>
    <path d="M196 80 Q224 70 252 82" fill="none" stroke="${shade(c, .4)}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M186 92 Q138 82 74 90 Q66 96 72 106 L186 110 Z" fill="${DARK}"/>
    <path d="M76 106 L188 110 L194 140 L124 140 Q92 132 76 106 Z" fill="${c}"/>
    <path d="M172 104 L118 174" stroke="${STEEL}" stroke-width="6" stroke-linecap="round"/>
    <path d="M172 104 L118 174" stroke="${c}" stroke-width="3" stroke-dasharray="3 3"/>
    <path d="M290 76 L274 58 L254 62" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="298" cy="82" r="15" fill="${DARK}"/>
    <circle cx="304" cy="80" r="14" fill="#fff" stroke="#c7ccd4" stroke-width="2.5"/>
    ${fender(322, 182, 55, c, 7, -150, -32)}
    <rect x="62" y="86" width="10" height="16" rx="3" fill="#d6001c"/>
  `,
  /* Bros: trail */
  trail: c => `
    <path d="M328 178 L294 62" stroke="${STEEL}" stroke-width="11" stroke-linecap="round"/>
    <path d="M328 178 L294 62" stroke="${STEEL_D}" stroke-width="3" stroke-linecap="round"/>
    <path d="M206 178 L92 178" stroke="${DARK}" stroke-width="11" stroke-linecap="round"/>
    <path d="M178 90 L270 84 L280 148 L258 190 L198 190 L184 148 Z" fill="${DARK}"/>
    <path d="M198 112 L268 108 M200 128 L272 124 M204 144 L274 140 M210 160 L272 156" stroke="${DARK2}" stroke-width="4"/>
    <path d="M262 190 Q244 210 206 210 L86 206 Q74 202 78 194 L92 192 L200 198 Q228 198 246 182 Z" fill="${STEEL}"/>
    <path d="M262 66 Q226 50 182 70 Q176 86 180 104 Q226 116 272 98 Z" fill="${c}"/>
    <path d="M186 80 Q140 66 84 74 Q74 82 76 92 L186 98 Z" fill="${DARK}"/>
    <path d="M76 92 L188 98 L196 128 L128 128 Q96 120 76 92 Z" fill="${c}"/>
    <path d="M176 96 L122 160" stroke="${STEEL}" stroke-width="6" stroke-linecap="round"/>
    <path d="M176 96 L122 160" stroke="${c}" stroke-width="3" stroke-dasharray="3 3"/>
    <path d="M294 62 L280 42 L258 44" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M296 54 Q324 52 330 70 L306 82 Z" fill="#fff" stroke="#c7ccd4" stroke-width="2"/>
    <path d="M290 36 Q320 24 344 52 L334 58 Q316 40 298 54 Z" fill="${c}" opacity="0"/>
    ${fender(328, 178, 62, c, 8, -140, -44)}
    <path d="M78 76 L64 98 L84 100 Z" fill="${shade(c, -0.18)}"/>
  `,
  /* Twister: naked esportiva */
  naked: c => `
    <path d="M322 182 L290 76" stroke="#d6ae52" stroke-width="10" stroke-linecap="round"/>
    <path d="M330 182 L298 78" stroke="${STEEL_D}" stroke-width="5" stroke-linecap="round"/>
    <path d="M206 184 L94 182" stroke="${STEEL}" stroke-width="12" stroke-linecap="round"/>
    <path d="M176 104 L270 100 L282 150 L260 198 L198 198 L184 152 Z" fill="${DARK}"/>
    <path d="M198 128 L268 124 M202 146 L274 142 M208 164 L274 160" stroke="${DARK2}" stroke-width="4"/>
    <path d="M260 196 Q244 216 206 216 L90 212 Q78 208 82 200 L96 198 L200 204 Q226 204 244 188 Z" fill="${STEEL}"/>
    <path d="M168 108 Q216 78 274 100 L286 132 Q230 148 172 138 Z" fill="${c}"/>
    <path d="M178 104 Q220 86 268 100" fill="none" stroke="${shade(c, .45)}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M60 78 Q120 92 172 112 L176 138 L106 136 Q70 120 60 78 Z" fill="${c}"/>
    <path d="M72 96 Q120 100 172 118" fill="none" stroke="${DARK}" stroke-width="9" stroke-linecap="round"/>
    <path d="M176 136 L120 176" stroke="#d6ae52" stroke-width="6" stroke-linecap="round"/>
    <path d="M200 196 L262 198 L252 212 L206 210 Z" fill="${c}"/>
    <path d="M290 78 L272 62 L252 66" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M290 68 Q316 60 336 80 L326 100 L296 96 Z" fill="${DARK}"/>
    <path d="M300 66 Q322 62 338 78 L330 84 Q316 72 298 76 Z" fill="${c}"/>
    <path d="M308 82 L332 86 L328 94 L308 92 Z" fill="#fff"/>
    ${fender(322, 182, 55, c, 7, -146, -34)}
  `,
  /* Sahara: trail grande com para-brisa */
  adv: c => `
    <path d="M328 178 L294 62" stroke="${STEEL}" stroke-width="12" stroke-linecap="round"/>
    <path d="M328 178 L294 62" stroke="${STEEL_D}" stroke-width="3" stroke-linecap="round"/>
    <path d="M208 178 L92 178" stroke="${DARK}" stroke-width="12" stroke-linecap="round"/>
    <path d="M176 88 L272 82 L282 148 L260 192 L198 192 L182 148 Z" fill="${DARK}"/>
    <path d="M198 112 L270 108 M200 128 L274 124 M204 144 L276 140 M210 160 L274 156" stroke="${DARK2}" stroke-width="4"/>
    <path d="M264 192 Q244 212 204 212 L84 208 Q72 204 76 196 L90 194 L200 200 Q228 200 246 184 Z" fill="${STEEL}"/>
    <path d="M262 62 Q222 40 176 66 Q170 84 176 108 Q226 122 276 100 Z" fill="${c}"/>
    <path d="M184 74 Q138 60 80 70 Q70 80 74 92 L186 98 Z" fill="${DARK}"/>
    <path d="M74 92 L188 98 L198 130 L124 130 Q92 122 74 92 Z" fill="${c}"/>
    <path d="M176 96 L120 162" stroke="${STEEL}" stroke-width="6" stroke-linecap="round"/>
    <path d="M176 96 L120 162" stroke="${c}" stroke-width="3" stroke-dasharray="3 3"/>
    <path d="M294 62 L278 40 L256 42" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M298 56 Q328 54 334 72 L308 84 Z" fill="#fff" stroke="#c7ccd4" stroke-width="2"/>
    <path d="M284 58 L312 16 Q322 12 324 24 L312 62 Z" fill="#cfe3f2" opacity=".85"/>
    ${fender(328, 178, 62, c, 8, -140, -44)}
    <rect x="62" y="64" width="26" height="12" rx="3" fill="${shade(c, -0.25)}"/>
  `
};

function bike(type, color, opts = {}) {
  const c = color || "#d6001c";
  const g = GEOM[type];
  const id = opts.id ? ` id="${opts.id}"` : "";
  return `<svg${id} class="bike" viewBox="30 4 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${opts.label || "Ilustração de moto"}" style="--c:${c}">
    <ellipse cx="210" cy="233" rx="170" ry="6.5" fill="rgba(20,20,28,.15)"/>
    ${wheel(g.rh[0], g.rh[1], g.r, g.k)}
    ${wheel(g.fh[0], g.fh[1], g.r, g.k)}
    ${BIKES[type](c)}
  </svg>`;
}
