// Harta invaziilor (PNG-ul de pe Wikipedia, cu etichete în engleză) e înlocuită cu o hartă desenată
// în stilul site-ului: fundalul comun (#shared-img-0), drumurile popoarelor în culorile din joc,
// etichetele în română.
// Folosire: node scripturi-build/splice-harta-invazii.js (se poate rula de mai multe ori)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

// aceeași proiecție ca hărțile site-ului (Lambert azimutală echivalentă, centrată pe 52°N 10°E)
function proj(lat, lon){
  const r = Math.PI / 180, p = lat * r, l = (lon - 10) * r, p0 = 52 * r;
  const k = Math.pow((1 + Math.sin(p) * Math.sin(p0) + Math.cos(p) * Math.cos(p0) * Math.cos(l)) * 0.5, -0.5);
  const x = 131.579 * (Math.cos(p) * Math.sin(l)) * k + 36.388;
  const y = 55.11 - 153.610 * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l)) * k;
  return [x / 100 * 690, y / 100 * 1351 * 690 / 1580];
}
const f1 = v => v.toFixed(1);
// curbă lină prin puncte (Catmull-Rom, transformată în Bézier)
function curve(pts){
  const P = pts.map(p => proj(p[0], p[1]));
  let d = 'M' + f1(P[0][0]) + ' ' + f1(P[0][1]);
  for (let i = 0; i < P.length - 1; i++) {
    const a = P[i - 1] || P[i], b = P[i], c = P[i + 1], e = P[i + 2] || c;
    d += ' C' + f1(b[0] + (c[0] - a[0]) / 6) + ' ' + f1(b[1] + (c[1] - a[1]) / 6) + ' ' + f1(c[0] - (e[0] - b[0]) / 6) + ' ' + f1(c[1] - (e[1] - b[1]) / 6) + ' ' + f1(c[0]) + ' ' + f1(c[1]);
  }
  return d;
}

const ROUTES = [
  { id: 'vand', c: '#6fb3f2', w: 2.4, pts: [[50.6, 17.0], [49.4, 13.0], [50.0, 8.6], [47.8, 3.5], [43.5, -1.0], [37.8, -4.2], [36.2, -5.2], [36.6, 2.5], [36.85, 9.6]] },
  { id: 'vizi', c: '#b98ae6', w: 2.4, pts: [[46.8, 28.2], [44.4, 27.4], [41.9, 26.4], [40.2, 22.6], [42.4, 19.6], [45.2, 14.2], [42.1, 12.7], [43.4, 6.5], [43.6, 1.6], [40.6, -3.4]] },
  { id: 'ostro', c: '#f0a25c', w: 2.4, pts: [[47.3, 32.5], [46.4, 25.0], [45.6, 19.4], [45.4, 15.6], [44.6, 12.6]] },
  { id: 'huni', c: '#e0626c', w: 3.2, pts: [[47.4, 46.0], [47.2, 38.0], [46.6, 30.5], [47.0, 20.4]] },
  { id: 'huni', c: '#e0626c', w: 3.2, pts: [[47.0, 20.2], [44.6, 21.3], [43.2, 22.6], [42.4, 25.4]] },
  { id: 'huni', c: '#e0626c', w: 3.2, pts: [[47.0, 20.2], [48.3, 13.5], [49.1, 8.3], [48.95, 4.8]] },
  { id: 'huni', c: '#e0626c', w: 3.2, pts: [[47.0, 20.2], [46.4, 16.2], [45.85, 13.7]] }
];
// locurile: [lat, lon, nume, dx, dy, aliniere]
const PLACES = [
  [41.68, 26.56, 'Adrianopol, 378', -6, 12, 'end'],
  [41.9, 12.5, 'Roma, 410', -7, 12, 'end'],
  [36.85, 10.2, 'Cartagina, 439', 7, 4, 'start'],
  [48.95, 4.4, 'Câmpiile Catalaunice, 451', -7, -7, 'end'],
  [45.77, 13.37, 'Aquileia, 452', -7, -6, 'end'],
  [41.01, 28.98, 'Constantinopol', 7, 4, 'start'],
  [47.0, 20.2, 'curtea lui Attila', 7, -7, 'start']
];
const NAMES = [
  ['HUNII', 46.0, 41.0, '#f4a0a6'], ['VIZIGOȚII', 39.2, -1.6, '#d3b4f2'], ['OSTROGOȚII', 48.3, 28.5, '#f6c08f'], ['VANDALII', 38.6, 4.2, '#a9d2f8']
];

const markers = [...new Set(ROUTES.map(r => r.id))].map(id => {
  const c = ROUTES.find(r => r.id === id).c;
  return '<marker id="hv-a-' + id + '" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10z" fill="' + c + '"/></marker>';
}).join('');
const svg = '<svg class="hv-map" viewBox="20 300 600 290" role="img" aria-label="Harta marilor migrații, 370–476: drumurile hunilor, vizigoților, ostrogoților și vandalilor, cu locurile marilor bătălii și jafuri.">' +
  '<defs>' + markers + '</defs>' +
  '<use class="hv-base" href="#shared-img-0"/><rect x="20" y="300" width="600" height="290" fill="rgba(14, 13, 11, 0.32)"/>' +
  ROUTES.map(r => { const d = curve(r.pts); return '<path class="hv-halo" d="' + d + '" stroke-width="' + (r.w + 3) + '"/><path class="hv-route" d="' + d + '" stroke="' + r.c + '" stroke-width="' + r.w + '" marker-end="url(#hv-a-' + r.id + ')"/>'; }).join('') +
  PLACES.map(p => { const q = proj(p[0], p[1]); return '<circle class="hv-pt" cx="' + f1(q[0]) + '" cy="' + f1(q[1]) + '" r="2.8"/><text class="hv-place" x="' + f1(q[0] + p[3]) + '" y="' + f1(q[1] + p[4]) + '" text-anchor="' + p[5] + '">' + p[2] + '</text>'; }).join('') +
  NAMES.map(n => { const q = proj(n[1], n[2]); return '<text class="hv-name" x="' + f1(q[0]) + '" y="' + f1(q[1]) + '" fill="' + n[3] + '" text-anchor="middle">' + n[0] + '</text>'; }).join('') +
  '</svg>';
const FIG = '<figure class="fig-map fig-invazii">\n        ' + svg + '\n        <figcaption><b>Marile migrații, 370–476.</b> Hunii (roșu) vin din stepă în Câmpia Panonică, de unde pornesc spre Balcani, spre Galia (451) și spre Italia (452). Vizigoții (mov), împinși dinaintea lor, trec Dunărea în 376, înving la Adrianopol (378), jefuiesc Roma (410) și ajung în Aquitania și Hispania. Ostrogoții (portocaliu) rămân sub huni până după Nedao, apoi trec în Balcani și în Italia. Vandalii, alanii și suebii (albastru) trec Rinul în 406 și ajung până la Cartagina (439). Drumuri simplificate, în aceleași culori ca în joc. Fundalul hărții: Alexrk2, Wikimedia Commons, CC BY-SA 3.0.</figcaption>\n      </figure>';
const CSS = `  /* harta marilor migrații, desenată în stilul site-ului */
  .fig-invazii .hv-map{ display: block; width: 100%; height: auto; background: #0e0e10; }
  .hv-base{ filter: saturate(0.55) brightness(0.74) sepia(0.2); }
  .hv-halo{ fill: none; stroke: rgba(14, 13, 11, 0.75); stroke-linecap: round; stroke-linejoin: round; }
  .hv-route{ fill: none; stroke-linecap: round; stroke-linejoin: round; }
  .hv-pt{ fill: #f2d474; stroke: #14120f; stroke-width: 1.2; }
  .hv-place{ font: 600 9.5px 'Source Serif 4', Georgia, serif; fill: #f6eddc; paint-order: stroke; stroke: rgba(14, 13, 11, 0.9); stroke-width: 2.6px; }
  .hv-name{ font: 700 11px 'Cinzel', Georgia, serif; letter-spacing: 0.08em; paint-order: stroke; stroke: rgba(14, 13, 11, 0.9); stroke-width: 3px; }
  /* /hv */
`;

for (const rel of ['index.html', 'atelierul-hunilor.html']) {
  const f = path.join(root, rel);
  const raw = fs.readFileSync(f, 'utf8'), crlf = raw.includes('\r\n');
  let s = raw.split('\r\n').join('\n');
  const fail = m => { console.error(rel + ': ' + m); process.exit(1); };
  let a = s.indexOf('<figure class="fig-map fig-invazii">');
  if (a < 0) { const cap = s.indexOf('<figcaption><b>Invaziile Imperiului Roman, 100–500 d.Hr.</b>'); if (cap < 0) fail('figura'); a = s.lastIndexOf('<figure class="fig-map">', cap); }
  const b = s.indexOf('</figure>', a) + '</figure>'.length;
  s = s.slice(0, a) + FIG + s.slice(b);
  const c0 = s.indexOf('  /* harta marilor migrații, desenată în stilul site-ului */');
  if (c0 >= 0) { const e = '  /* /hv */\n'; s = s.slice(0, c0) + CSS + s.slice(s.indexOf(e, c0) + e.length); }
  else { const at = s.indexOf('  .fig-map{ margin: 28px 0; }'); if (at < 0) fail('CSS'); s = s.slice(0, at) + CSS + s.slice(at); }
  fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
  console.log(rel + ': harta marilor migrații');
}
