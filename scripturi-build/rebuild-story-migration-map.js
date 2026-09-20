// Replaces the abstract "Marea Migrație" arrow diagram with the same real
// map image used elsewhere, cropped via viewBox, with routes fanning out
// from the Hun power center (Tisza camp) using the pixel positions already
// calibrated for the Atlas module.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const IMG_PATH = path.join(ROOT, 'imagini', 'Clean_antique_map_of_Europe_the_Black_Sea_the_Caucasus_and_t.jpg');
const imgDataUri = 'data:image/jpeg;base64,' + fs.readFileSync(IMG_PATH).toString('base64');

const VB = { x: 100, y: 260, w: 480, h: 280 };
const HUB = { x: 390, y: 360 };

const ARROWS = [
  { d: 'M390,360 Q350,460 150,420', label: 'Vizigoți → Balcani → Galia/Hispania', lx: 175, ly: 400 },
  { d: 'M390,360 Q378,385 364,403', label: 'Ostrogoți → (vasali) → Italia', lx: 400, ly: 395 },
  { d: 'M390,360 Q280,390 150,500', label: 'Vandali → Galia → Hispania → Africa', lx: 155, ly: 520 },
  { d: 'M390,360 Q450,430 490,500', label: 'Către Constantinopol', lx: 500, ly: 480 }
];

const svgBlock =
  '<svg viewBox="' + VB.x + ' ' + VB.y + ' ' + VB.w + ' ' + VB.h + '" xmlns="http://www.w3.org/2000/svg">' +
  '<defs><marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="var(--accent-2)"/></marker></defs>' +
  '<image href="' + imgDataUri + '" x="0" y="0" width="1248" height="832" preserveAspectRatio="xMidYMid slice"/>' +
  '<g class="migr-hub"><circle cx="' + HUB.x + '" cy="' + HUB.y + '" r="16"/><text x="' + HUB.x + '" y="' + (HUB.y + 4) + '">HUNI</text></g>' +
  ARROWS.map(function(a, i){
    return '<g class="migr-arrow" data-i="' + i + '">' +
      '<path class="hit" d="' + a.d + '"/>' +
      '<path class="line" d="' + a.d + '" marker-end="url(#arrowhead)"/>' +
      '<text class="migr-label" x="' + a.lx + '" y="' + a.ly + '">' + a.label + '</text>' +
      '</g>';
  }).join('') +
  '</svg>';

const bodyPath = path.join(ROOT, 'build', 'story.body.html');
let body = fs.readFileSync(bodyPath, 'utf8');

const oldSvg = `<svg viewBox="0 0 640 320" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="var(--accent-2)"/>
              </marker>
            </defs>
            <path d="M0,260 Q120,235 240,250 Q360,225 480,245 Q560,230 640,250 L640,320 L0,320 Z" fill="var(--paper-3)" opacity="0.5"/>

            <g class="migr-hub">
              <circle cx="330" cy="140" r="16"/>
              <text x="330" y="144">HUNI</text>
            </g>

            <g class="migr-arrow" data-i="0">
              <path class="hit" d="M318,128 Q220,90 130,150"/>
              <path class="line" d="M318,128 Q220,90 130,150" marker-end="url(#arrowhead)"/>
              <text class="migr-label" x="150" y="180">Vizigoți → Balcani → Galia/Hispania</text>
            </g>

            <g class="migr-arrow" data-i="1">
              <path class="hit" d="M340,124 Q400,70 470,95"/>
              <path class="line" d="M340,124 Q400,70 470,95" marker-end="url(#arrowhead)"/>
              <text class="migr-label" x="480" y="80">Ostrogoți → (vasali) → Italia</text>
            </g>

            <g class="migr-arrow" data-i="2">
              <path class="hit" d="M316,152 Q220,220 110,255"/>
              <path class="line" d="M316,152 Q220,220 110,255" marker-end="url(#arrowhead)"/>
              <text class="migr-label" x="120" y="278">Vandali → Galia → Hispania → Africa</text>
            </g>

            <g class="migr-arrow" data-i="3">
              <path class="hit" d="M346,150 Q450,210 540,240"/>
              <path class="line" d="M346,150 Q450,210 540,240" marker-end="url(#arrowhead)"/>
              <text class="migr-label" x="550" y="262">Către Constantinopol</text>
            </g>
          </svg>`;

if (!body.includes(oldSvg)) {
  console.error('OLD MIGR SVG NOT FOUND — aborting, file left unchanged.');
  process.exit(1);
}
body = body.replace(oldSvg, svgBlock);
fs.writeFileSync(bodyPath, body);
console.log('wrote', bodyPath, '(', (body.length / 1024).toFixed(0), 'KB )');

// ---------- css ----------
const cssPath = path.join(ROOT, 'build', 'story.css');
let css = fs.readFileSync(cssPath, 'utf8');

const oldCss = `  .migr-map{ position: relative; border: 1px solid var(--line-strong); padding: 16px 12px 8px; }
  .migr-map svg{ width: 100%; height: auto; display: block; }
  .migr-arrow{ cursor: pointer; }
  .migr-arrow path.hit{ fill: none; stroke: transparent; stroke-width: 16; }
  .migr-arrow path.line{ fill: none; stroke: var(--accent-2); stroke-width: 2; transition: stroke 0.12s ease, stroke-width 0.12s ease; }
  .migr-arrow:hover path.line, .migr-arrow.active path.line{ stroke: var(--accent); stroke-width: 3; }
  .migr-label{ font-family: 'JetBrains Mono', monospace; font-size: 10px; fill: var(--ink-dim); pointer-events: none; }
  .migr-arrow.active .migr-label{ fill: var(--ink); font-weight: 700; }
  .migr-hub circle{ fill: var(--accent); }
  .migr-hub text{ font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; fill: var(--paper); text-anchor: middle; }`;

const newCss = `  .migr-map{ position: relative; border: 1px solid var(--line-strong); padding: 0; overflow: hidden; }
  .migr-map svg{ width: 100%; height: auto; display: block; }
  .migr-arrow{ cursor: pointer; }
  .migr-arrow path.hit{ fill: none; stroke: transparent; stroke-width: 16; }
  .migr-arrow path.line{ fill: none; stroke: var(--accent-2); stroke-width: 2.4; transition: stroke 0.12s ease, stroke-width 0.12s ease; }
  .migr-arrow:hover path.line, .migr-arrow.active path.line{ stroke: var(--accent); stroke-width: 3.4; }
  .migr-label{
    font-family: 'JetBrains Mono', monospace; font-size: 13px; fill: #2b1d0c; pointer-events: none;
    paint-order: stroke; stroke: #f4ead4; stroke-width: 3.5; stroke-linejoin: round;
  }
  .migr-arrow.active .migr-label{ fill: var(--accent); font-weight: 700; }
  .migr-hub circle{ fill: var(--accent); stroke: #f4ead4; stroke-width: 2; }
  .migr-hub text{ font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; fill: var(--paper); text-anchor: middle; }`;

if (!css.includes(oldCss)) {
  console.error('OLD MIGR CSS NOT FOUND — aborting, file left unchanged.');
  process.exit(1);
}
css = css.replace(oldCss, newCss);
fs.writeFileSync(cssPath, css);
console.log('wrote', cssPath);
