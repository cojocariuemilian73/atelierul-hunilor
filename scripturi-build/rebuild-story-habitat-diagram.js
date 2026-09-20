// Replaces the abstract "habitat timpuriu" SVG diagram (Khounoi/Don/Azov/
// Caspian) with a crop of the real antique-map image, using markers already
// calibrated for the Atlas module — same coordinate space (1248x832 image),
// just cropped via viewBox instead of a full separate map.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const IMG_PATH = path.join(ROOT, 'imagini', 'Clean_antique_map_of_Europe_the_Black_Sea_the_Caucasus_and_t.jpg');
const imgDataUri = 'data:image/jpeg;base64,' + fs.readFileSync(IMG_PATH).toString('base64');

// Crop expressed directly as an SVG viewBox in the image's own pixel space —
// no actual image cropping needed, the <image> stays full-size underneath.
const VB = { x: 480, y: 280, w: 560, h: 175 };

const POINTS = [
  { x: 580, y: 360, r: 4, fill: 'var(--accent)', label: 'Don', labelDy: 22, bold: false },
  { x: 650, y: 385, r: 5, fill: 'var(--accent-2)', label: 'Khounoi', labelDy: 22, bold: true },
  { x: 615, y: 340, r: 4, fill: 'var(--accent)', label: 'Marea Azov', labelDy: -12, bold: false },
  { x: 814, y: 417, r: 4, fill: 'var(--accent)', label: 'Marea Caspică', labelDy: -12, bold: false }
];

function circleAndLabel(p){
  var weight = p.bold ? 'font-weight="700" fill="var(--ink)"' : 'fill="var(--ink-dim)"';
  return '<circle class="map-pt" cx="' + p.x + '" cy="' + p.y + '" r="' + p.r + '" fill="' + p.fill + '"/>' +
    '<text x="' + p.x + '" y="' + (p.y + p.labelDy) + '" text-anchor="middle" class="mono map-pt-label" font-size="15" ' + weight + '>' + p.label + '</text>';
}

const svgBlock =
  '<svg viewBox="' + VB.x + ' ' + VB.y + ' ' + VB.w + ' ' + VB.h + '" xmlns="http://www.w3.org/2000/svg">' +
  '<image href="' + imgDataUri + '" x="0" y="0" width="1248" height="832" preserveAspectRatio="xMidYMid slice"/>' +
  POINTS.map(circleAndLabel).join('') +
  '<text x="1010" y="305" text-anchor="middle" class="mono map-pt-label" font-size="14" fill="var(--ink-dim)">China / Xiongnu →</text>' +
  '</svg>';

const bodyPath = path.join(ROOT, 'build', 'story.body.html');
let body = fs.readFileSync(bodyPath, 'utf8');

const oldSvg = `<svg viewBox="0 0 640 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 150 Q 160 130 300 145 T 620 120" stroke="var(--line)" stroke-width="1" fill="none" stroke-dasharray="3 5"/>
          <circle cx="120" cy="140" r="4" fill="var(--accent)"/>
          <text x="120" y="162" text-anchor="middle" class="mono" font-size="11" fill="var(--ink-dim)">Don</text>
          <circle cx="330" cy="148" r="5" fill="var(--accent-2)"/>
          <text x="330" y="170" text-anchor="middle" class="mono" font-size="12" fill="var(--ink)" font-weight="700">Khounoi</text>
          <circle cx="300" cy="95" r="4" fill="var(--accent)"/>
          <text x="300" y="80" text-anchor="middle" class="mono" font-size="11" fill="var(--ink-dim)">Marea Azov</text>
          <circle cx="470" cy="110" r="4" fill="var(--accent)"/>
          <text x="470" y="92" text-anchor="middle" class="mono" font-size="11" fill="var(--ink-dim)">Marea Caspică</text>
          <circle cx="80" cy="60" r="4" fill="var(--ink-dim)"/>
          <text x="80" y="45" text-anchor="middle" class="mono" font-size="10" fill="var(--ink-dim)">China / Xiongnu ↴</text>
        </svg>`;

if (!body.includes(oldSvg)) {
  console.error('OLD DIAGRAM SVG NOT FOUND — aborting, file left unchanged.');
  process.exit(1);
}
body = body.replace(oldSvg, svgBlock);
fs.writeFileSync(bodyPath, body);
console.log('wrote', bodyPath, '(', (body.length / 1024).toFixed(0), 'KB )');

// ---------- css ----------
const cssPath = path.join(ROOT, 'build', 'story.css');
let css = fs.readFileSync(cssPath, 'utf8');

const oldCss = `  .diagram{ margin: 32px 0; border: 1px solid var(--line-strong); padding: 16px 12px 0; }
  .diagram svg{ width: 100%; height: auto; display: block; }
  .diagram figcaption{ font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: var(--ink-dim); text-align: left; padding: 10px 4px 12px; border-top: 1px solid var(--line); margin-top: 12px; }`;

const newCss = `  .diagram{ margin: 32px 0; border: 1px solid var(--line-strong); padding: 0; overflow: hidden; }
  .diagram svg{ width: 100%; height: auto; display: block; }
  .diagram figcaption{ font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: var(--ink-dim); text-align: left; padding: 10px 12px 12px; border-top: 1px solid var(--line-strong); margin-top: 0; background: var(--paper); }
  .map-pt-label{
    paint-order: stroke; stroke: #f4ead4; stroke-width: 3.5; stroke-linejoin: round;
  }`;

if (!css.includes(oldCss)) {
  console.error('OLD DIAGRAM CSS NOT FOUND — aborting, file left unchanged.');
  process.exit(1);
}
css = css.replace(oldCss, newCss);
fs.writeFileSync(cssPath, css);
console.log('wrote', cssPath);
