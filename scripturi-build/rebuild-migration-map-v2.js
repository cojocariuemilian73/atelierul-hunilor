// Redraws the "Marea Migrație" arrow map so the routes actually follow the
// geography of the antique map underneath.
//
// Before: every arrow started from one "HUNI" hub that sat over Bohemia/Poland
// on this image (not the Pannonian plain), so the Visigoth arrow ran from
// central Europe to the Atlantic and the Vandal arrow from Pannonia to Spain —
// neither matches history or the picture. The long route labels also ran off
// the right edge ("Ostrogoți → (vasali) → I…", "Către Const…") and overlapped
// the map's own place names.
//
// Now: coordinates are read off a calibration grid laid over the image itself;
// each people starts where it actually came from (tervingi north of the lower
// Danube, greutungi on the Pontic steppe, vandals in Silesia) and follows its
// real route; the Huns are shown as the pressure arriving from the east into
// the Pannonian plain. Each people keeps the colour it has in the Atlas
// legend, every line sits on a dark casing so it reads on the beige paper,
// and labels are short and placed over open sea. The full itinerary stays in
// the panel under the map.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const BODY = path.join(ROOT, 'build', 'story.body.html');
const CSS = path.join(ROOT, 'build', 'story.css');

let body = fs.readFileSync(BODY, 'utf8');
const s = body.indexOf('<div class="migr-map">');
const svgStart = body.indexOf('<svg', s);
const svgEnd = body.indexOf('</svg>', svgStart) + 6;
if (s === -1 || svgStart === -1) { console.error('migr-map not found'); process.exit(1); }

// Keep the exact <image> tag: the build dedupes it against the Atlas copy.
const imgTag = body.slice(svgStart, svgEnd).match(/<image [^>]*\/>/)[0];

const COLORS = { visi: '#b389d9', ostro: '#f0a25c', vand: '#7ab0e8', huni: '#a71d2a' };

function marker(id, color){
  return '<marker id="' + id + '" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto" markerUnits="strokeWidth">' +
    '<path d="M0,0 L7,3.5 L0,7 Z" fill="' + color + '"/></marker>';
}

function arrow(i, cls, d, label, lx, ly, aria){
  return '<g class="migr-arrow ' + cls + '" data-i="' + i + '" aria-label="' + aria + '">' +
    '<path class="hit" d="' + d + '"/>' +
    '<path class="case" d="' + d + '"/>' +
    '<path class="line" d="' + d + '" marker-end="url(#mh-' + cls + ')"/>' +
    '<text class="migr-label" x="' + lx + '" y="' + ly + '">' + label + '</text>' +
    '</g>';
}

const svg =
  '<svg viewBox="115 320 500 245" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Harta Marii Migrații: sosirea hunilor dinspre răsărit și traseele vizigoților, ostrogoților și vandalilor spre Imperiul Roman">' +
  '<defs>' + marker('mh-visi', COLORS.visi) + marker('mh-ostro', COLORS.ostro) + marker('mh-vand', COLORS.vand) + marker('mh-huni', COLORS.huni) + '</defs>' +
  imgTag +
  '<rect class="migr-veil" x="115" y="320" width="500" height="245"/>' +

  // Huns arriving from the Pontic–Caspian steppe into the Pannonian plain.
  '<g class="migr-inflow" aria-hidden="true">' +
    '<path class="case" d="M612,386 Q520,366 432,408"/>' +
    '<path class="line" d="M612,386 Q520,366 432,408" marker-end="url(#mh-huni)"/>' +
    '<text class="migr-label migr-label-huni" x="548" y="360">Hunii · din 370</text>' +
  '</g>' +

  arrow(0, 'visi',
    'M497,414 C488,452 482,472 476,488 C440,478 385,462 336,484 C300,470 250,444 212,448 C192,462 178,476 168,490',
    'Vizigoți', 236, 478, 'Vizigoții: peste Dunăre, Adrianopol, Italia, Galia, Hispania') +

  arrow(1, 'ostro',
    'M538,400 Q482,402 426,420 Q372,428 320,446',
    'Ostrogoți', 470, 422, 'Ostrogoții: din stepa pontică, vasali în Panonia, apoi în Italia') +

  arrow(2, 'vand',
    'M388,350 Q330,340 280,356 Q232,386 206,428 Q176,462 166,500 Q150,534 196,544 Q250,552 294,545',
    'Vandali', 214, 533, 'Vandalii: peste Rin, prin Galia și Hispania, până în Africa') +

  arrow(3, 'huni',
    'M424,426 Q434,450 432,463 Q462,482 488,494',
    'Spre Constantinopol', 430, 522, 'Hunii spre Constantinopol, prin Balcani') +

  '<g class="migr-hub" aria-hidden="true"><circle cx="420" cy="416" r="11"/><text x="420" y="419.5">HUNI</text></g>' +
  '<text class="migr-place" x="420" y="440">Câmpia Panonică</text>' +
  '</svg>';

body = body.slice(0, svgStart) + svg + body.slice(svgEnd);

const oldLegend =
`          <div class="migr-legend">
            <span>● Nucleul de putere hunic</span>
            <span>→ Direcție de presiune / migrație</span>
          </div>`;
const newLegend =
`          <div class="migr-legend">
            <span><i class="sw sw-huni"></i>Hunii</span>
            <span><i class="sw sw-visi"></i>Vizigoți</span>
            <span><i class="sw sw-ostro"></i>Ostrogoți</span>
            <span><i class="sw sw-vand"></i>Vandali</span>
            <span class="migr-legend-hint">Apasă pe un traseu pentru detalii</span>
          </div>`;
if (!body.includes(oldLegend)) { console.error('legend not found'); process.exit(1); }
body = body.replace(oldLegend, newLegend);
body = body.replace('<p class="map-hint">4 săgeți pe hartă · click sau tab pentru detalii</p>', '<p class="map-hint">4 trasee pe hartă · click, atingere sau Tab + Enter pentru detalii</p>');
fs.writeFileSync(BODY, body);
console.log('story.body.html: hartă redesenată');

// ---------- CSS ----------
let css = fs.readFileSync(CSS, 'utf8');
const cStart = css.indexOf('  .migr-arrow{ cursor: pointer; }');
const cEnd = css.indexOf('  .migr-legend{');
const cEndLine = css.indexOf('\n', cEnd) + 1;
if (cStart === -1 || cEnd === -1) { console.error('migr CSS not found'); process.exit(1); }

const newCss =
`  .migr-veil{ fill: rgba(18, 18, 20, 0.10); pointer-events: none; }
  .migr-arrow{ cursor: pointer; outline: none; }
  .migr-arrow path{ fill: none; stroke-linecap: round; stroke-linejoin: round; }
  .migr-arrow path.hit{ stroke: transparent; stroke-width: 14; }
  .migr-arrow path.case, .migr-inflow path.case{ fill: none; stroke: rgba(18, 18, 20, 0.55); stroke-width: 5.2; stroke-linecap: round; }
  .migr-arrow path.line, .migr-inflow path.line{ fill: none; stroke-width: 2.6; stroke-linecap: round; transition: stroke-width 0.2s ease, opacity 0.25s ease; }
  .migr-arrow.visi path.line{ stroke: #b389d9; }
  .migr-arrow.ostro path.line{ stroke: #f0a25c; }
  .migr-arrow.vand path.line{ stroke: #7ab0e8; }
  .migr-arrow.huni path.line, .migr-inflow path.line{ stroke: #a71d2a; }
  .migr-inflow path.line{ stroke-width: 3.4; stroke-dasharray: 7 5; }
  .migr-arrow:hover path.line, .migr-arrow:focus-visible path.line, .migr-arrow.active path.line{ stroke-width: 4; }
  .migr-arrow.active path.case{ stroke-width: 7.5; stroke: rgba(18, 18, 20, 0.7); }
  .migr-map.has-active .migr-arrow:not(.active){ opacity: 0.45; }
  .migr-map.has-active .migr-arrow:not(.active):hover{ opacity: 0.85; }
  .migr-arrow{ transition: opacity 0.25s ease; }
  .migr-label{
    font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; fill: #f0e6d6;
    paint-order: stroke; stroke: rgba(18, 18, 20, 0.85); stroke-width: 3.2px; stroke-linejoin: round;
    pointer-events: none;
  }
  .migr-arrow.visi .migr-label{ fill: #d6bdf0; }
  .migr-arrow.ostro .migr-label{ fill: #f7c48f; }
  .migr-arrow.vand .migr-label{ fill: #b3d3f4; }
  .migr-arrow.huni .migr-label, .migr-label-huni{ fill: #f0b3b8; }
  .migr-arrow.active .migr-label{ font-size: 11px; }
  .migr-arrow:focus-visible .migr-label{ text-decoration: underline; }
  .migr-hub circle{ fill: #a71d2a; stroke: #e5c158; stroke-width: 2; }
  .migr-hub text{ font-family: 'JetBrains Mono', monospace; font-size: 7px; font-weight: 700; fill: #f0e6d6; text-anchor: middle; letter-spacing: 0.04em; }
  .migr-place{
    font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 9px; fill: #2b1d0c; text-anchor: middle;
    paint-order: stroke; stroke: rgba(240, 230, 214, 0.8); stroke-width: 2.5px; pointer-events: none;
  }
  .migr-legend .sw{ display: inline-block; width: 16px; height: 3px; border-radius: 2px; margin-right: 6px; vertical-align: middle; }
  .migr-legend .sw-huni{ background: #a71d2a; }
  .migr-legend .sw-visi{ background: #b389d9; }
  .migr-legend .sw-ostro{ background: #f0a25c; }
  .migr-legend .sw-vand{ background: #7ab0e8; }
  .migr-legend-hint{ margin-left: auto; font-style: italic; }
`;
css = css.slice(0, cStart) + newCss + css.slice(cStart).replace(/^[\s\S]*?(?=  \.migr-legend\{)/, '');
fs.writeFileSync(CSS, css);
console.log('story.css: stiluri noi pentru hartă');
