// Harta lui Ptolemeu: mai mică, decupată pe zona cu marcaje, etichete lizibile (cerneală închisă pe halou de hârtie).
// Solidul lui Teodosie: mutat din coloana de imagini în textul „Mecanismul efectului de domino”, ca să nu rămână gol.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const files = ['index.html', 'atelierul-hunilor.html', 'module-individuale/huni-prezentare.html'];

const CSS = `
  .diagram.ptol-map{ max-width: 860px; margin-left: auto; margin-right: auto; }
  .ptol-map .map-pt{ fill: #8f1d14; stroke: #f6efdc; stroke-width: 4; }
  .ptol-map .map-pt.main{ fill: #b7791f; }
  .ptol-map .map-pt-label{ font-family: var(--sans, system-ui, sans-serif); font-size: 34px; font-weight: 700; fill: #1d140a; stroke: #f6efdc; stroke-width: 9; paint-order: stroke; letter-spacing: 0.02em; }
  .ptol-map .map-pt-label.main{ font-size: 40px; fill: #6b1a0f; }
  .sr-fig.sr-fig-inline{ display: grid; grid-template-columns: 150px minmax(0, 1fr); gap: 16px; align-items: center; margin-top: 26px; }
  .sr-fig.sr-fig-inline img{ max-height: none; aspect-ratio: 1; object-fit: cover; }
  .sr-fig.sr-fig-inline figcaption{ margin-top: 0; font-size: 0.85rem; }
  @media (max-width: 520px){ .sr-fig.sr-fig-inline{ grid-template-columns: 96px minmax(0, 1fr); gap: 12px; } }
`;

let total = 0;
for (const rel of files) {
  const f = path.join(root, rel);
  if (!fs.existsSync(f)) continue;
  const raw = fs.readFileSync(f, 'utf8');
  const crlf = raw.includes('\r\n');
  let s = raw.split('\r\n').join('\n');
  let n = 0;

  // 1. Harta lui Ptolemeu
  const dOpen = '<div class="diagram" role="img" aria-label="Hartă ptolemeică';
  const di = s.indexOf(dOpen);
  if (di >= 0) {
    s = s.slice(0, di) + '<div class="diagram ptol-map" role="img" aria-label="Hartă ptolemeică' + s.slice(di + dOpen.length);
    const svgStart = s.indexOf('<svg viewBox="0 0 1600 1200"', di);
    const svgEnd = s.indexOf('</svg>', svgStart);
    if (svgStart < 0 || svgEnd < 0) { console.error(rel + ': svg ptolemeu negăsit'); process.exit(1); }
    let svg = s.slice(svgStart, svgEnd);
    svg = svg.replace('<svg viewBox="0 0 1600 1200"', '<svg viewBox="270 400 1020 680"');
    // marcaj + etichetă: rază mai mare, culori din CSS, eticheta depărtată de marcajul mărit
    let pairs = 0;
    svg = svg.replace(/<circle class="map-pt" cx="(\d+)" cy="(\d+)" r="(\d+)"[^>]*\/>\s*<text x="(\d+)" y="(\d+)" text-anchor="middle" class="mono map-pt-label"[^>]*>/g,
      function (m, cx, cy, r, x, y) {
        pairs++;
        const main = r === '9';
        const below = +y > +cy;
        const yy = below ? +cy + (main ? 56 : 46) : +cy - (main ? 26 : 22);
        const cls = main ? ' main' : '';
        return '<circle class="map-pt' + cls + '" cx="' + cx + '" cy="' + cy + '" r="' + (main ? 15 : 11) + '"/>' +
          '<text x="' + x + '" y="' + yy + '" text-anchor="middle" class="map-pt-label' + cls + '">';
      });
    if (pairs !== 5) { console.error(rel + ': marcaje găsite ' + pairs + ' (aștept 5)'); process.exit(1); }
    s = s.slice(0, svgStart) + svg + s.slice(svgEnd);
    n++;
  }

  // 2. Solidul lui Teodosie
  const fStart = s.indexOf('<figure class="sr-fig"><img id="img-solidus"');
  if (fStart >= 0) {
    const fEnd = s.indexOf('</figure>', fStart) + '</figure>'.length;
    const fig = s.slice(fStart, fEnd).replace('<figure class="sr-fig">', '<figure class="sr-fig sr-fig-inline">');
    s = s.slice(0, fStart) + s.slice(fEnd);
    const anchor = s.indexOf('</ol>', s.indexOf('<b>Spre Apus, în 451–452</b>'));
    if (anchor < 0) { console.error(rel + ': lista domino negăsită'); process.exit(1); }
    const at = anchor + '</ol>'.length;
    s = s.slice(0, at) + '\n      ' + fig + s.slice(at);
    n++;
  }

  if (n && !s.includes('.ptol-map .map-pt{')) {
    const mk = '  .sr-text > :first-child{ margin-top: 0; }';
    if (!s.includes(mk)) { console.error(rel + ': marcaj CSS negăsit'); process.exit(1); }
    s = s.replace(mk, CSS.trim().split('\n').map(l => '  ' + l.trim()).join('\n') + '\n' + mk);
  }
  if (n) {
    fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
    console.log(rel + ': ' + n + ' modificări');
    total += n;
  }
}
if (!total) { console.error('nimic de aplicat'); process.exit(1); }
