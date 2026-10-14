// Harta campaniei lui Attila în Galia (451), desenată peste harta fizică din Atlas
// (același fond, aceeași proiecție), cu traseele în culorile site-ului și etichete în română.
// Înlocuiește vechea imagine (desen MapMaster, cu legende în engleză) din capitolul 05.
// Folosire: node scripturi-build/galia/splice-galia.js (se poate rula de mai multe ori)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', '..');

function proj(lat, lon){
  var r = Math.PI / 180, p = lat * r, l = (lon - 10) * r, p0 = 52 * r;
  var k = Math.pow((1 + Math.sin(p) * Math.sin(p0) + Math.cos(p) * Math.cos(p0) * Math.cos(l)) * 0.5, -0.5);
  var x = 131.579 * (Math.cos(p) * Math.sin(l)) * k + 36.388;
  var y = 55.11 - 153.610 * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l)) * k;
  var S = 690 / 1580;
  return [x / 100 * 1580 * S, y / 100 * 1351 * S];
}
const f1 = v => v.toFixed(1);

// orașe: [lat, lon, stare, dx, dy, ancoră]; stare: j = jefuit, a = amenințat, o = asediat, b = bază romano-vizigotă
const C = {
  Strasbourg: [48.58, 7.75, 'j', 2.2, 1, 'start'],
  Worms:      [49.63, 8.36, 'j', 2.2, 1.2, 'start'],
  Mainz:      [50.0, 8.27, 'j', 2.2, -0.6, 'start'],
  'Köln':     [50.94, 6.96, 'j', 2.2, 0.9, 'start'],
  Trier:      [49.75, 6.64, 'j', -2.2, -1.2, 'end'],
  Metz:       [49.12, 6.18, 'j', 2.2, 1.6, 'start'],
  Reims:      [49.26, 4.03, 'j', 0, -2.6, 'middle'],
  Tournai:    [50.61, 3.39, 'j', -2.2, 0.9, 'end'],
  Cambrai:    [50.18, 3.24, 'j', 2.2, 1.2, 'start'],
  Amiens:     [49.89, 2.30, 'j', -2.2, 0.9, 'end'],
  Paris:      [48.86, 2.35, 'a', -2.4, -1.4, 'end'],
  Troyes:     [48.30, 4.08, 'a', 2.4, 2.2, 'start'],
  'Orléans':  [47.90, 1.91, 'o', -2.4, 3.6, 'end']
};
const P = n => { const c = C[n]; return [c[0], c[1]]; };
const BATTLE = [48.62, 4.25];

// trasee [lat, lon]
const HUNI = [
  [[49.45, 11.6], P('Worms'), P('Metz'), P('Reims'), [48.95, 3.05], [48.3, 2.2], P('Orléans')],
  [P('Worms'), P('Mainz'), P('Köln'), P('Tournai'), P('Cambrai'), P('Amiens'), [49.25, 2.2]],
  [P('Mainz'), P('Trier'), P('Metz')],
  [[48.25, 10.9], P('Strasbourg'), P('Metz')]
];
const RETRAGERE = [P('Orléans'), [48.45, 2.75], [48.5, 3.6], BATTLE];
const ROMANI = [
  [[45.45, 4.75], [46.2, 4.3], [47.0, 3.2], P('Orléans')],
  [[45.45, 1.35], [46.7, 1.5], P('Orléans')],
  [P('Orléans'), [47.95, 2.95], [48.35, 3.7], BATTLE]
];

// curbă netedă prin puncte (Catmull–Rom transformat în Bézier)
function curve(pts){
  const q = pts.map(p => proj(p[0], p[1]));
  let d = 'M' + f1(q[0][0]) + ' ' + f1(q[0][1]);
  for (let i = 0; i < q.length - 1; i++) {
    const p0 = q[i - 1] || q[i], p1 = q[i], p2 = q[i + 1], p3 = q[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += 'C' + f1(c1[0]) + ' ' + f1(c1[1]) + ' ' + f1(c2[0]) + ' ' + f1(c2[1]) + ' ' + f1(p2[0]) + ' ' + f1(p2[1]);
  }
  return d;
}

const tl = proj(51.35, -0.4), br = proj(45.75, 11.0), tr = proj(51.35, 11.0), bl = proj(45.75, -0.4);
const x0 = Math.min(tl[0], bl[0]), x1 = Math.max(tr[0], br[0]), y0 = Math.min(tl[1], tr[1]), y1 = Math.max(bl[1], br[1]);
const VB = [x0, y0, x1 - x0, y1 - y0].map(f1).join(' ');

let svg = '';
svg += '<svg class="gal-map" viewBox="' + VB + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Harta campaniei lui Attila în Galia, 451: hunii trec Rinul, jefuiesc orașele din nord-est și asediază Orléans; coaliția lui Aetius și a vizigoților vine din sud, ridică asediul, iar bătălia are loc la Câmpiile Catalaunice.">\n';
svg += '  <defs><marker id="gal-ah-h" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#e0626c"/></marker>' +
       '<marker id="gal-ah-r" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#9cc6f0"/></marker></defs>\n';
svg += '  <use href="#shared-img-0"/>\n';
svg += '  <rect x="' + f1(x0) + '" y="' + f1(y0) + '" width="' + f1(x1 - x0) + '" height="' + f1(y1 - y0) + '" fill="rgba(14, 13, 11, 0.38)"/>\n';
// nume de regiuni și ape
const lab = (lat, lon, t, cls, rot) => { const p = proj(lat, lon); return '<text class="' + cls + '" x="' + f1(p[0]) + '" y="' + f1(p[1]) + '"' + (rot ? ' transform="rotate(' + rot + ' ' + f1(p[0]) + ' ' + f1(p[1]) + ')"' : '') + '>' + t + '</text>'; };
svg += '  <g class="gal-geo">' + lab(46.6, 2.9, 'GALIA', 'gal-region') + lab(50.55, 9.0, 'GERMANIA', 'gal-region') + lab(46.3, 8.4, 'ALPII', 'gal-region') +
       lab(50.55, 7.55, 'Rinul', 'gal-river', -55) + lab(47.25, 0.6, 'Loara', 'gal-river', 12) + lab(47.05, -0.28, 'Oceanul Atlantic', 'gal-sea', -78) + lab(46.15, 4.45, 'de la Arles: Aetius', 'gal-from', -62) + lab(46.0, 1.1, 'de la Toulouse: Teodoric I', 'gal-from', -86) + '</g>\n';
svg += '  <g class="gal-routes" fill="none" stroke-linecap="round" stroke-linejoin="round">\n';
ROMANI.forEach(r => { svg += '    <path class="gal-rom" d="' + curve(r) + '" marker-end="url(#gal-ah-r)"/>\n'; });
HUNI.forEach(r => { svg += '    <path class="gal-hun" d="' + curve(r) + '" marker-end="url(#gal-ah-h)"/>\n'; });
svg += '    <path class="gal-hun back" d="' + curve(RETRAGERE) + '" marker-end="url(#gal-ah-h)"/>\n';
svg += '  </g>\n  <g class="gal-pts">\n';
Object.keys(C).forEach(n => {
  const c = C[n], p = proj(c[0], c[1]);
  const mk = c[2] === 'j' ? '<circle class="gal-j" cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="1.05"/>' :
             c[2] === 'a' ? '<circle class="gal-a" cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="1.05"/>' :
             c[2] === 'o' ? '<circle class="gal-o" cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="1.6"/><circle class="gal-j" cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="0.75"/>' :
             '<rect class="gal-b" x="' + f1(p[0] - 1) + '" y="' + f1(p[1] - 1) + '" width="2" height="2"/>';
  const t = n + (c[2] === 'o' ? ' (asediat)' : '');
  svg += '    ' + mk + '<text x="' + f1(p[0] + c[3]) + '" y="' + f1(p[1] + c[4]) + '" text-anchor="' + c[5] + '">' + t + '</text>\n';
});
const bp = proj(BATTLE[0], BATTLE[1]);
const star = [];
for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 1.1 : 2.6; star.push(f1(bp[0] + rr * Math.cos(a)) + ' ' + f1(bp[1] + rr * Math.sin(a))); }
svg += '    <polygon class="gal-battle" points="' + star.join(' ') + '"/><text class="gal-bt" x="' + f1(bp[0] + 3.2) + '" y="' + f1(bp[1] + 0.6) + '">Câmpiile Catalaunice</text><text class="gal-bt2" x="' + f1(bp[0] + 3.2) + '" y="' + f1(bp[1] + 3.3) + '">iunie 451</text>\n';
svg += '  </g>\n';
// legenda, în colțul din dreapta jos
const lx = x1 - 41, ly = y1 - 19;
svg += '  <g class="gal-legend" transform="translate(' + f1(lx) + ' ' + f1(ly) + ') scale(0.82)">\n' +
  '    <rect width="48" height="21" rx="0.6"/>\n' +
  '    <path class="gal-hun" d="M2.5 4.2h7" marker-end="url(#gal-ah-h)"/><text x="12" y="5.1">Hunii și aliații lor</text>\n' +
  '    <path class="gal-rom" d="M2.5 8.6h7" marker-end="url(#gal-ah-r)"/><text x="12" y="9.5">Romanii, vizigoții și aliații</text>\n' +
  '    <circle class="gal-j" cx="4" cy="13" r="1.05"/><text x="7" y="13.9">jefuit</text><circle class="gal-a" cx="21" cy="13" r="1.05"/><text x="24" y="13.9">amenințat</text>\n' +
  '    <path class="gal-hun back" d="M2.5 17.4h7"/><text x="12" y="18.3">retragerea hunilor</text>\n' +
  '  </g>\n';
svg += '</svg>';

const FIG = '<figure class="fig-map gal-fig">\n        <div class="gal-wrap">' + svg.split('\n').join('\n        ') + '</div>\n' +
  '        <figcaption><b>Campania lui Attila în Galia, 451 d.Hr.</b> Hunii și aliații lor trec Rinul și jefuiesc pe rând Strasbourg, Worms, Mainz, Trier și Metz (în ziua de Paști, după Grigore din Tours), apoi Reims; un alt grup urcă spre Köln, Tournai, Cambrai și Amiens. Parisul și Troyes sunt doar amenințate: legenda atribuie salvarea Parisului rugăciunilor Sfintei Genoveva, dar motivul a fost probabil strategic. Orléans e asediat, nu cucerit. Din sud vin Aetius, de la Arles, și regele vizigot Teodoric I, de la Toulouse: ridică asediul și îi împing pe huni înapoi, spre bătălia de la Câmpiile Catalaunice (iunie 451). Traseele sunt simplificate, după Iordanes (<i>Getica</i> 194–218) și Grigore din Tours (<i>Istoria francilor</i> II.5–7). Hartă desenată pentru acest proiect pe harta fizică a Europei (Alexrk2, Wikimedia Commons, CC BY-SA 3.0).</figcaption>\n      </figure>';

const CSS = `  /* harta campaniei din Galia (galia/splice-galia.js) */
  .gal-fig{ max-width: 780px; margin-left: auto; margin-right: auto; }
  .gal-map{ display: block; width: 100%; height: auto; border: 1px solid var(--line-strong); background: #0e0e10; }
  .gal-wrap{ cursor: zoom-in; }
  .lb-svg-wrap.gal-wrap{ cursor: inherit; }
  .gal-region{ font: 700 4px 'Cinzel', serif; letter-spacing: 0.35em; fill: rgba(246, 237, 220, 0.42); text-anchor: middle; }
  .gal-river{ font: italic 600 2.5px 'Cormorant Garamond', serif; fill: #9cc6f0; text-anchor: middle; }
  .gal-map use{ filter: saturate(0.65) brightness(0.82) sepia(0.18); }
  .gal-from{ font: italic 600 2.3px 'Cormorant Garamond', serif; fill: #9cc6f0; text-anchor: middle; }
  .gal-sea{ font: italic 600 2.8px 'Cormorant Garamond', serif; fill: rgba(156, 198, 240, 0.75); text-anchor: middle; letter-spacing: 0.08em; }
  .gal-hun{ stroke: #e0626c; stroke-width: 0.85; }
  .gal-hun.back{ stroke-dasharray: 1.6 1.2; }
  .gal-rom{ stroke: #9cc6f0; stroke-width: 0.85; }
  .gal-pts text{ font: 600 2.45px 'Source Serif 4', Georgia, serif; fill: #f6eddc; paint-order: stroke; stroke: rgba(14, 13, 11, 0.85); stroke-width: 0.7px; }
  .gal-j{ fill: #e0626c; stroke: #14120f; stroke-width: 0.35; }
  .gal-a{ fill: #14120f; stroke: #e0626c; stroke-width: 0.45; }
  .gal-o{ fill: none; stroke: #f2d474; stroke-width: 0.45; }
  .gal-b{ fill: #9cc6f0; stroke: #14120f; stroke-width: 0.3; }
  .gal-battle{ fill: #f2d474; stroke: #14120f; stroke-width: 0.35; }
  .gal-pts .gal-bt{ font: 700 2.7px 'Cinzel', serif; fill: #f2d474; }
  .gal-pts .gal-bt2{ font: 600 2.2px 'JetBrains Mono', monospace; fill: #e6d7c3; }
  .gal-legend > rect{ fill: rgba(14, 13, 11, 0.86); stroke: rgba(212, 175, 55, 0.45); stroke-width: 0.25; }
  .gal-legend text{ font: 2.15px 'Source Serif 4', Georgia, serif; fill: #e6d7c3; }
  .gal-legend path{ fill: none; }
  /* /galia */
`;

for (const rel of ['index.html', 'atelierul-hunilor.html']) {
  const f = path.join(root, rel);
  const raw = fs.readFileSync(f, 'utf8');
  const crlf = raw.includes('\r\n');
  let s = raw.split('\r\n').join('\n');
  const fail = m => { console.error(rel + ': ' + m); process.exit(1); };
  // figura: fie vechea imagine, fie harta noastră de data trecută
  let a = s.indexOf('<figure class="fig-map gal-fig">');
  if (a < 0) {
    const cap = s.indexOf('<figcaption><b>Campania lui Attila în Galia, 451 d.Hr.</b>');
    if (cap < 0) fail('figura Galiei');
    a = s.lastIndexOf('<figure class="fig-map">', cap);
  }
  const b = s.indexOf('</figure>', a) + '</figure>'.length;
  if (a < 0 || b < a) fail('marginile figurii');
  s = s.slice(0, a) + FIG + s.slice(b);
  // stilurile
  const c0 = s.indexOf('  /* harta campaniei din Galia (galia/splice-galia.js) */');
  if (c0 >= 0) { const e = '  /* /galia */\n'; s = s.slice(0, c0) + CSS + s.slice(s.indexOf(e, c0) + e.length); }
  else { const at = s.indexOf('  .fig-map figcaption{'); if (at < 0) fail('CSS'); s = s.slice(0, at) + CSS + s.slice(at); }
  // „Despre proiect”: harta nu mai e o imagine reprodusă
  s = s.replace('(Ptolemeu–Porro, 1596; invaziile Imperiului Roman; campania lui Attila în Galia) sunt reproduse', '(Ptolemeu–Porro, 1596; invaziile Imperiului Roman) sunt reproduse');
  s = s.replace('(Atlas, Marea Migrație, harta campaniilor) este', '(Atlas, Marea Migrație, harta campaniilor, campania din Galia) este');
  fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
  console.log(rel + ': harta Galiei la zi');
}
