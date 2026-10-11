// Harta „Marea Migrație” (Acasă, capitolul 03), refăcută:
// - cadru mai larg, de la Hispania și Africa (Cartagina) până la Volga;
// - trasee recalculate din coordonate reale, cu etapele datate (376 Dunărea,
//   378 Adrianopol, 410 Roma, 406 Rinul, 439 Cartagina…), afișate pe traseul ales;
// - etichete pe mare sau în zone libere, ca să nu se suprapună cu liniile;
// - pe traseul activ, puncte care „curg” în sensul migrației.
// Păstrează structura folosită de script (g.migr-arrow[data-i], path.hit/.case/.line).
const fs = require('fs'), path = require('path');
const g = require('./geo.js');
const S = 690 / 1580;
const map = ([x, y]) => [x * S, y * S];
const P = (la, lo) => map(g.proj(la, lo)).map(v => +v.toFixed(1));
const d = pts => g.path(pts, map);

const VB = [20, 300, 600, 280];

const ROUTES = [
  { cls: 'visi', i: 0, aria: 'Vizigoții: peste Dunăre (376), Adrianopol (378), Roma (410), Galia (418), Hispania',
    pts: [[47.1, 28.6], [44.2, 27.5], [41.7, 26.6], [42.7, 23.3], [43.9, 19.6], [44.9, 16.0], [45.8, 13.6], [43.6, 12.6], [41.9, 12.6], [43.6, 10.3], [44.0, 7.6], [43.3, 3.4], [43.6, 1.4], [42.1, -1.2], [40.0, -3.9]],
    label: { at: [42.2, 5.6], text: 'Vizigoți' },
    stops: [
      { at: [44.2, 27.5], t: '376 · Dunărea', a: 'start', dx: 6, dy: -4 },
      { at: [41.7, 26.6], t: '378 · Adrianopol', a: 'start', dx: 6, dy: 9 },
      { at: [41.9, 12.6], t: '410 · Roma', a: 'start', dx: 6, dy: 4 },
      { at: [43.6, 1.4], t: '418 · Toulouse', a: 'middle', dx: 0, dy: -7 },
      { at: [40.0, -3.9], t: 'Hispania', a: 'middle', dx: 0, dy: 13 }
    ] },
  { cls: 'ostro', i: 1, aria: 'Ostrogoții: supuși hunilor în 375, vasali în Panonia, regat în Italia (493)',
    pts: [[47.6, 33.6], [46.9, 28.2], [46.6, 22.6], [46.8, 18.9], [46.1, 15.6], [44.6, 12.4]],
    label: { at: [49.7, 25.6], text: 'Ostrogoți' },
    stops: [
      { at: [47.6, 33.6], t: '375 · supuși hunilor', a: 'start', dx: 5, dy: 11 },
      { at: [46.8, 18.9], t: 'Panonia · vasali', a: 'end', dx: -13, dy: -7 },
      { at: [44.4, 12.2], t: '493 · Ravenna', a: 'end', dx: -6, dy: 4 }
    ] },
  { cls: 'vand', i: 2, aria: 'Vandalii, alanii și suebii: Rinul (406), Hispania (409), Africa (429), Cartagina (439), Roma (455)',
    pts: [[50.8, 17.2], [50.6, 12.6], [50.0, 8.3], [48.4, 4.6], [46.2, 2.4], [43.7, 0.9], [41.4, -2.0], [39.0, -4.2], [37.2, -5.4], [36.1, -5.4], [35.6, -0.6], [36.6, 5.2], [36.85, 10.1]],
    extra: { pts: [[36.85, 10.2], [38.6, 11.6], [41.6, 12.2]], dash: true },
    label: { at: [45.8, -5.2], text: 'Vandali' },
    stops: [
      { at: [50.0, 8.3], t: '406 · Rinul', a: 'start', dx: 6, dy: -4 },
      { at: [41.4, -2.0], t: '409 · Hispania', a: 'start', dx: 6, dy: 3 },
      { at: [36.1, -5.4], t: '429 · Africa', a: 'start', dx: 4, dy: 11 },
      { at: [36.85, 10.1], t: '439 · Cartagina', a: 'middle', dx: 0, dy: 12 },
      { at: [41.6, 12.2], t: '455 · Roma jefuită', a: 'end', dx: -6, dy: 10 }
    ] },
  { cls: 'huni', i: 3, aria: 'Hunii spre Constantinopol: campaniile din Balcani, 441–447',
    pts: [[46.9, 19.6], [45.1, 20.4], [43.3, 21.9], [42.7, 23.4], [42.1, 24.8], [41.1, 28.6]],
    label: { at: [39.6, 25.2], text: 'Spre Constantinopol' },
    stops: [
      { at: [43.3, 21.9], t: 'Naissus', a: 'end', dx: -6, dy: 3 },
      { at: [41.1, 28.6], t: '447 · Constantinopol', a: 'end', dx: -4, dy: 12 }
    ] }
];
const INFLOW = { pts: [[49.0, 46.5], [48.0, 40.0], [47.4, 34.5], [47.4, 29.0], [47.6, 23.6], [47.1, 20.2]], label: { at: [49.3, 38.2], text: 'Hunii · din 370' } };
const HUB = [47.0, 19.5];
const CITIES = [];

function txt(at, text, cls, a, dx, dy){
  const [x, y] = P(...at);
  return '<text class="' + cls + '" x="' + (x + (dx || 0)).toFixed(1) + '" y="' + (y + (dy || 0)).toFixed(1) + '"' + (a ? ' text-anchor="' + a + '"' : '') + '>' + text + '</text>';
}
function route(r){
  const dd = d(r.pts);
  let h = '<g class="migr-arrow ' + r.cls + '" data-i="' + r.i + '" aria-label="' + r.aria + '">' +
    '<path class="hit" d="' + dd + '"/>' + (r.extra ? '<path class="hit" d="' + d(r.extra.pts) + '"/>' : '') +
    '<path class="case" d="' + dd + '"/>' +
    '<path class="line" d="' + dd + '" marker-end="url(#mh-' + r.cls + ')"/>' +
    '<path class="flow" d="' + dd + '"/>';
  if (r.extra) h += '<path class="line sea" d="' + d(r.extra.pts) + '" marker-end="url(#mh-' + r.cls + ')"/>';
  h += '<g class="stops">' + r.stops.map(s => {
    const [x, y] = P(...s.at);
    return '<circle cx="' + x + '" cy="' + y + '" r="2.6"/>' + txt(s.at, s.t, 'stop-label', s.a, s.dx, s.dy);
  }).join('') + '</g>';
  h += txt(r.label.at, r.label.text, 'migr-label', 'middle') + '</g>';
  return h;
}
const marker = c => '<marker id="mh-' + c[0] + '" viewBox="0 0 7 7" markerWidth="4" markerHeight="4" refX="5" refY="3.5" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L7,3.5 L0,7 Z" fill="' + c[1] + '"/></marker>';
const [hx, hy] = P(...HUB);
const SVG =
  '<svg viewBox="' + VB.join(' ') + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Harta Marii Migrații: sosirea hunilor dinspre răsărit și traseele vizigoților, ostrogoților și vandalilor spre Imperiul Roman, cu etapele datate">' +
  '<defs>' + [['visi', '#b389d9'], ['ostro', '#f0a25c'], ['vand', '#7ab0e8'], ['huni', '#d23a48']].map(marker).join('') + '</defs>' +
  '<use href="#shared-img-0"/><rect class="migr-veil" x="' + VB[0] + '" y="' + VB[1] + '" width="' + VB[2] + '" height="' + VB[3] + '"/>' +
  '<g class="migr-inflow" aria-hidden="true"><path class="case" d="' + d(INFLOW.pts) + '"/><path class="line" d="' + d(INFLOW.pts) + '" marker-end="url(#mh-huni)"/>' + txt(INFLOW.label.at, INFLOW.label.text, 'migr-label migr-label-huni', 'middle') + '</g>' +
  ROUTES.map(route).join('') +
  '<g class="migr-hub" aria-hidden="true"><circle cx="' + hx + '" cy="' + hy + '" r="10"/><text x="' + hx + '" y="' + (hy + 3.2).toFixed(1) + '">HUNI</text></g>' +
  '<text class="migr-place" x="' + hx + '" y="' + (hy + 20).toFixed(1) + '">Câmpia Panonică</text>' +
  '</svg>';

const CSS = `
  /* Harta Marii Migrații, v2 */
  .migr-veil{ fill: rgba(18, 18, 20, 0.2); }
  .migr-arrow path.case{ stroke-width: 6; }
  .migr-arrow path.line.sea{ stroke-dasharray: 5 4; }
  .migr-arrow path.flow{ fill: none; stroke: rgba(255, 250, 235, 0.9); stroke-width: 1.4; stroke-linecap: round; stroke-dasharray: 0.1 9; opacity: 0; pointer-events: none; }
  .migr-arrow.active path.flow{ opacity: 1; animation: migr-flow 1.6s linear infinite; }
  @keyframes migr-flow{ to{ stroke-dashoffset: -18.2; } }
  .migr-arrow .stops{ opacity: 0; transition: opacity 0.35s ease; pointer-events: none; }
  .migr-arrow.active .stops{ opacity: 1; }
  .migr-arrow .stops circle{ fill: #fff8e8; stroke: #121214; stroke-width: 1.4; }
  .stop-label{ font-family: 'JetBrains Mono', monospace; font-size: 7.6px; font-weight: 700; fill: #fff8e8; paint-order: stroke; stroke: rgba(14, 14, 16, 0.92); stroke-width: 3px; stroke-linejoin: round; }
  .migr-label{ font-size: 11px; letter-spacing: 0.02em; }
  .migr-arrow.active .migr-label{ font-size: 12.5px; }
  .migr-cities circle{ fill: #f0e6d6; stroke: #121214; stroke-width: 1.2; }
  .city-label{ font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 600; font-size: 9.5px; fill: #f6eddc; paint-order: stroke; stroke: rgba(14, 14, 16, 0.85); stroke-width: 2.6px; pointer-events: none; }
  .migr-place{ fill: #f6eddc; stroke: rgba(14, 14, 16, 0.85); font-size: 9.5px; font-weight: 600; }
  .migr-inflow path.line{ stroke: #d23a48; }
  .migr-arrow.huni path.line{ stroke: #d23a48; }
  .migr-hub circle{ fill: #a71d2a; stroke: #e5c158; stroke-width: 2; filter: drop-shadow(0 0 6px rgba(167, 29, 42, 0.7)); }
  @media (prefers-reduced-motion: reduce){ .migr-arrow.active path.flow{ animation: none; opacity: 0; } }
  /* pe telefon harta se trage lateral, la o mărime la care etichetele se citesc */
  @media (max-width: 640px){
    .migr-map{ overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: thin; }
    .migr-map svg{ width: 720px; max-width: none; }
    .migr-legend{ position: sticky; left: 0; width: min(100%, calc(100vw - 32px)); }
    .migr-arrow path.hit{ stroke-width: 20; }
  }
`;

const files = ['index.html', 'atelierul-hunilor.html', 'module-individuale/huni-prezentare.html', 'module-individuale/huni-migratia.html'];
for (const f of files) {
  const p = path.join(__dirname, '..', f);
  let s = fs.readFileSync(p, 'utf8').split('\r\n').join('\n');
  const a = s.indexOf('<div class="migr-map">');
  if (a === -1) { console.log(f + ': fără hartă, sărit'); continue; }
  if (s.includes('/* Harta Marii Migrații, v2 */')) { console.error(f + ': already applied'); process.exit(1); }
  const s0 = s.indexOf('<svg', a), s1 = s.indexOf('</svg>', s0) + 6;
  // keep the page's own base-map element (shared <use> in the combined page, inline <image> in the standalone one)
  const old = s.slice(s0, s1), base = (old.match(/<use href="#shared-img-0"\/>|<image [^>]*\/>|<image [^>]*>[\s\S]*?<\/image>/) || [])[0];
  if (!base) { console.error(f + ': base map not found'); process.exit(1); }
  s = s.slice(0, s0) + SVG.replace('<use href="#shared-img-0"/>', base) + s.slice(s1);
  const anchor = '  .migr-legend .sw{';
  if (!s.includes(anchor)) { console.error(f + ': css anchor'); process.exit(1); }
  s = s.replace(anchor, CSS + anchor);
  // the legend swatch matches the new, brighter red
  s = s.replace('.migr-legend .sw-huni{ background: #a71d2a; }', '.migr-legend .sw-huni{ background: #d23a48; }');
  // on phones the map opens centred on the Balkans
  const SCROLL = "\n<script>\n/* migr-map-scroll */\n(function(){ var m = document.querySelector('.migr-map'); if (m && m.scrollWidth > m.clientWidth) m.scrollLeft = (m.scrollWidth - m.clientWidth) * 0.55; })();\n</script>\n</body>";
  if (!s.includes('migr-map-scroll')) s = s.replace('\n</body>', SCROLL);
  fs.writeFileSync(p, s);
  console.log(f + ': harta refăcută');
}
