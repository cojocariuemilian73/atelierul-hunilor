// Replaces the habitat-diagram background once more, this time to settle the
// licensing question raised in review: the previous map carried a visible
// "© irs-verlag.de" watermark, and citing a source is not the same as having
// a licence to reproduce it.
//
// The replacement is public domain and, as it happens, far better suited: a
// Ptolemaic map of Sarmatia Europaea engraved by Girolamo Porro (Venice,
// 1596), which renders Ptolemy's own geography — and actually carries the
// label "Chuni." on it, next to Amadoca and the Borysthenes, between the
// Bastarnae and the Roxolani. The diagram is about where Ptolemy put the
// Khounoi, so showing Ptolemy's own map is the honest illustration.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const IMG = path.join(ROOT, 'imagini', 'muzeu', 'sarmatia-porro.jpg');
const imgDataUri = 'data:image/jpeg;base64,' + fs.readFileSync(IMG).toString('base64');

const W = 1600, H = 1200;

// Positions read off the engraving itself, via a labelled grid overlay.
const POINTS = [
  { x: 665, y: 852, r: 9, fill: 'var(--accent-2)', label: 'Chuni', labelDy: 34, bold: true },
  { x: 464, y: 872, r: 6, fill: 'var(--accent)', label: 'Bastarnæ', labelDy: 32, bold: false },
  { x: 982, y: 631, r: 6, fill: 'var(--accent)', label: 'Roxolani', labelDy: -18, bold: false },
  { x: 955, y: 580, r: 6, fill: 'var(--accent)', label: 'Tanais (Don)', labelDy: -18, bold: false },
  { x: 1060, y: 765, r: 6, fill: 'var(--accent)', label: 'Mæotis (Azov)', labelDy: 32, bold: false }
];

function marker(p){
  const weight = p.bold ? 'font-weight="700" fill="var(--ink)"' : 'fill="var(--ink-dim)"';
  // A halo behind the label keeps it readable over the dense engraving.
  return '<circle class="map-pt" cx="' + p.x + '" cy="' + p.y + '" r="' + p.r + '" fill="' + p.fill + '" stroke="var(--paper)" stroke-width="2"/>' +
    '<text x="' + p.x + '" y="' + (p.y + p.labelDy) + '" text-anchor="middle" class="mono map-pt-label" font-size="26" ' +
    'stroke="var(--paper)" stroke-width="5" paint-order="stroke" ' + weight + '>' + p.label + '</text>';
}

const BODY = path.join(ROOT, 'build', 'story.body.html');
let body = fs.readFileSync(BODY, 'utf8');

const oldBlockRe = /<div class="diagram"[\s\S]*?<\/div>\n/;
if (!oldBlockRe.test(body)) { console.error('OLD diagram block not found'); process.exit(1); }

const newBlock =
  '      <div class="diagram" role="img" aria-label="Hartă ptolemeică a Sarmației Europene, gravată de Girolamo Porro în 1596, pe care sunt marcate poporul Chuni, bastarnii, roxolanii, fluviul Tanais și Mæotis.">\n' +
  '        <svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg"><image href="' + imgDataUri + '" x="0" y="0" width="' + W + '" height="' + H + '"/>' +
  POINTS.map(marker).join('') +
  '</svg>\n' +
  '        <figcaption>Harta Sarmației Europene după Ptolemeu, gravată de Girolamo Porro (Veneția, 1596). Pe ea apare chiar numele <b>Chuni</b>, lângă Amadoca și Borysthenes (Nipru), între bastarni și roxolani — adică exact localizarea din Geografia 3.5.10, nu pe malul Mării Azov, cum se repetă adesea. Imagine în domeniul public (Wikimedia Commons).</figcaption>\n' +
  '      </div>\n';

body = body.replace(oldBlockRe, newBlock);
fs.writeFileSync(BODY, body);
console.log('story.body.html: harta habitatului înlocuită cu gravura ptolemeică (domeniu public)');
