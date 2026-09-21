// Swaps the habitat-diagram background from the AI-generated antique map to
// the new real historical map the user added (imagini/harta.jpg, converted
// from harta.avif, 925x533px) — scoped ONLY to this one diagram (not Atlas
// or Marea Migrație, which still need regions — Hispania, Britain — this
// map doesn't show). New pixel coordinates were hand-calibrated against the
// new image via a zoomed grid overlay: Don (318,183), Khounoi/"375-376"
// crossing circle already drawn on the source map (365,200), Marea Azov
// (312,222), Marea Caspică (530,250), all read off the map's own labels
// (Don, the circled 375/376 annotation, Tanais, Kaspisches Meer). Per the
// user's explicit choice, the source is credited visibly in the caption
// since this map (unlike the AI-generated ones) is a real published map
// with its own copyright watermark ("© 2007 irs-verlag.de").
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const IMG_PATH = path.join(ROOT, 'imagini', 'harta.jpg');
const imgDataUri = 'data:image/jpeg;base64,' + fs.readFileSync(IMG_PATH).toString('base64');

const BODY_PATH = path.join(ROOT, 'build', 'story.body.html');
let body = fs.readFileSync(BODY_PATH, 'utf8');

const oldBlockRe = /<div class="diagram"[\s\S]*?<\/div>\n/;
if (!oldBlockRe.test(body)) { console.error('OLD diagram block not found'); process.exit(1); }

const VB = { x: 0, y: 0, w: 925, h: 533 }; // full source image, not a cropped strip
const POINTS = [
  { x: 318, y: 183, r: 4, fill: 'var(--accent)', label: 'Don', labelDy: -12, bold: false },
  { x: 365, y: 200, r: 6, fill: 'var(--accent-2)', label: 'Khounoi', labelDy: 24, bold: true },
  { x: 312, y: 222, r: 4, fill: 'var(--accent)', label: 'Marea Azov', labelDy: 20, bold: false },
  { x: 530, y: 250, r: 4, fill: 'var(--accent)', label: 'Marea Caspică', labelDy: -12, bold: false }
];

function circleAndLabel(p){
  var weight = p.bold ? 'font-weight="700" fill="var(--ink)"' : 'fill="var(--ink-dim)"';
  return '<circle class="map-pt" cx="' + p.x + '" cy="' + p.y + '" r="' + p.r + '" fill="' + p.fill + '"/>' +
    '<text x="' + p.x + '" y="' + (p.y + p.labelDy) + '" text-anchor="middle" class="mono map-pt-label" font-size="15" ' + weight + '>' + p.label + '</text>';
}

const newBlock =
  '      <div class="diagram" role="img" aria-label="Diagramă a habitatului timpuriu al hunilor, lângă Don, Marea Azov și Marea Caspică">\n' +
  '        <svg viewBox="' + VB.x + ' ' + VB.y + ' ' + VB.w + ' ' + VB.h + '" xmlns="http://www.w3.org/2000/svg"><image href="' + imgDataUri + '" x="0" y="0" width="925" height="533" preserveAspectRatio="xMidYMid slice"/>' +
  POINTS.map(circleAndLabel).join('') +
  '<text x="780" y="195" text-anchor="middle" class="mono map-pt-label" font-size="14" fill="var(--ink-dim)">China / Xiongnu →</text>' +
  '</svg>\n' +
  '        <figcaption>Habitatul timpuriu al hunilor (Ptolemeu, Geografia 3.5.10) și legătura, încă disputată, cu lumea Xiongnu din răsărit. Fundal cartografic: hartă istorică adaptată, © irs-verlag.de (2007), folosită cu citare a sursei.</figcaption>\n' +
  '      </div>\n';

body = body.replace(oldBlockRe, newBlock);
fs.writeFileSync(BODY_PATH, body);
console.log('story.body.html: habitat diagram now uses the new map (imagini/harta.jpg)');
