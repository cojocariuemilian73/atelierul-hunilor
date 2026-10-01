// Replaces the AI-drawn "antique" map under the Atlas, the Marea Migrație map
// and the Campania Hunilor campaign strip with a real physical map of Europe
// ("Europe relief laea location map.jpg", Alexrk2, Wikimedia Commons,
// CC BY-SA 3.0). Every city, river label, zone and route is now computed from
// its latitude/longitude with the map's own projection (scripturi-build/geo.js)
// instead of being read off a calibration grid.
//
// Drawing space: the map is scaled by S = 690/1580 so the Atlas keeps the
// text sizes it already had; the Atlas and the article map share one <image>
// tag, which assemble.js stores once and reuses.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const g = require('./geo.js');

const ROOT = path.join(__dirname, '..');
const B = path.join(ROOT, 'build');
const IMG = path.join(ROOT, 'imagini', 'reale');
const PY = 'C:/Users/cojoc/AppData/Local/Programs/Python/Python312/python';

const S = 690 / g.W;
const sc = p => [p[0] * S, p[1] * S];
const P = (lat, lon) => sc(g.proj(lat, lon));
const r1 = g.r1;
const pathLL = pts => g.path(pts, sc);
const polyLL = pts => g.polygon(pts, sc);

function mustReplace(src, from, to, what){
  if (!src.includes(from)) { console.error('not found: ' + what); process.exit(1); }
  return src.replace(from, to);
}

// ---------- images ----------
// Base map: the part south of the Baltic (y >= 560 px) is all any view uses.
const MAP_Y0 = 560;
const STRIP_RATIO = 800 / 260;
const STOPS = { I: [48.5, 32.0], II: [46.9, 47.2], III: [45.4, 39.6], IV: [47.4, 19.6] };
const sp = Object.values(STOPS).map(v => g.proj(...v));
const sx0 = 700, sx1 = g.W, sw = sx1 - sx0, sh = sw / STRIP_RATIO;
const scy = (Math.min(...sp.map(p => p[1])) + Math.max(...sp.map(p => p[1]))) / 2;
const sy0 = scy - sh / 2;
execFileSync(PY, ['-c', `
from PIL import Image
im = Image.open(r'${IMG}/europa-relief-laea.jpg').convert('RGB')
im.crop((0, ${MAP_Y0}, ${g.W}, ${g.H})).save(r'${IMG}/harta-baza.jpg', quality=76, optimize=True, progressive=True)
im.crop((${sx0}, ${Math.round(sy0)}, ${sx1}, ${Math.round(sy0 + sh)})).resize((1000, ${Math.round(1000 / STRIP_RATIO)})).save(r'${IMG}/harta-campanii.jpg', quality=74, optimize=True, progressive=True)
`]);
const uri = f => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(IMG, f)).toString('base64');
const MAP_URI = uri('harta-baza.jpg');
const IMAGE_TAG = '<image class="base-map" href="' + MAP_URI + '" x="0" y="' + r1(MAP_Y0 * S) + '" width="' + r1(g.W * S) + '" height="' + r1((g.H - MAP_Y0) * S) + '" preserveAspectRatio="none"/>';
console.log('hartă de bază:', (fs.statSync(path.join(IMG, 'harta-baza.jpg')).size / 1024 | 0) + ' KB');

// ---------- shared historical data (lat, lon) ----------
const ROUTES = {
  // Tervingi: across the Danube (376), Adrianople (378), the Balkans, Italy and Rome (410), Aquitaine (418), Hispania
  visi: [[46.0, 28.6], [44.4, 27.6], [41.9, 26.6], [43.3, 21.3], [45.3, 15.6], [44.3, 12.6], [42.2, 12.7], [44.0, 8.6], [43.6, 1.6], [41.6, -2.6]],
  // Greutungi: subject to the Huns from c. 375, move west with them into Pannonia
  ostro: [[47.6, 35.0], [48.2, 30.5], [48.1, 26.0], [47.7, 22.4], [46.9, 18.9]],
  // Vandals (with Alans and Suebi): Silesia, the Rhine (406), Gaul, Hispania (409), Africa (429), Carthage (439)
  vand: [[51.0, 17.0], [50.6, 12.6], [50.0, 8.6], [48.6, 3.8], [45.6, 1.0], [43.1, -1.4], [40.2, -4.0], [36.5, -5.4], [35.8, -1.5], [36.6, 4.5], [36.9, 9.6]],
  // c. 370–376: from beyond the Volga across the Pontic steppe to the lower Danube
  huni0: [[47.6, 47.8], [47.4, 42.5], [47.0, 37.5], [46.7, 32.5], [45.8, 29.2]],
  // c. 376–420: along the lower Danube into the Pannonian plain
  huni1: [[45.8, 29.2], [44.9, 26.0], [44.7, 22.6], [45.6, 20.6], [46.8, 20.1]],
  // 441–442: Margus, Viminacium, Naissus
  huni2: [[46.8, 20.1], [44.8, 20.9], [43.5, 21.8]],
  // 447: through Thrace almost to the walls of Constantinople
  huni3: [[43.3, 22.3], [42.4, 25.0], [41.3, 28.4]],
  // 451: up the Danube, across the Rhine, into Gaul
  huni4: [[47.1, 19.8], [47.9, 16.4], [48.3, 13.0], [49.3, 9.6], [49.9, 7.6], [49.1, 6.2], [48.7, 4.5]],
  // 452: Aquileia and the Po valley
  huni5: [[46.7, 19.6], [46.3, 16.6], [45.9, 13.7], [45.4, 11.0], [45.5, 9.4]],
};
const ZONES = {
  early: [[47.8, 28.0], [49.0, 33.0], [49.5, 40.0], [48.6, 46.5], [46.5, 47.5], [45.5, 42.0], [46.6, 37.5], [46.4, 33.0], [45.6, 30.0], [45.3, 28.5]],
  max: [[48.8, 16.5], [50.0, 22.0], [50.8, 30.0], [51.2, 40.0], [50.5, 47.5], [47.0, 48.8], [45.5, 46.0], [45.4, 41.0], [46.7, 37.0], [46.3, 31.5], [44.5, 28.5], [44.1, 23.0], [44.8, 19.5], [46.0, 16.5]],
  late: [[47.5, 32.0], [48.8, 36.0], [49.0, 42.0], [47.8, 47.0], [46.0, 46.5], [45.6, 41.5], [46.8, 36.5], [46.5, 32.5]],
};
const PLACES = {
  roma: [41.90, 12.50], ravenna: [44.42, 12.20], aquileia: [45.77, 13.37], naissus: [43.32, 21.90],
  constantinopol: [41.01, 28.98], adrianopol: [41.68, 26.56], resedinta: [47.0, 20.2], catalaunice: [48.6, 4.2],
};

// ======================= ATLAS =======================
{
  const file = path.join(B, 'atlas.body.html');
  let body = fs.readFileSync(file, 'utf8');

  // viewBox: Hispania to the Caspian, Silesia to Carthage
  const VB = '0 262 690 314';
  body = body.replace(/viewBox="[^"]*" data-vb="[^"]*"/, 'viewBox="' + VB + '" data-vb="' + VB + '"');
  body = body.replace(/<image [^>]*href="data:image\/jpeg;base64,[^"]*"[^>]*\/>/, IMAGE_TAG);
  body = mustReplace(body, '<rect x="0" y="0" width="1248" height="832" filter="url(#paperNoise)" class="paper-grain"/>',
    '<rect x="0" y="244" width="690" height="346" filter="url(#paperNoise)" class="paper-grain"/>', 'grain rect');

  const start = body.indexOf('<g id="layer-regions"');
  const end = body.indexOf('\n          </g>\n          <rect x="0" y="244"');
  if (start === -1 || end === -1) { console.error('atlas overlay not found'); process.exit(1); }

  const I = '            ';
  const lab = (cls, ll, txt, extra) => { const p = P(...ll); return I + '<text class="' + cls + '" x="' + r1(p[0]) + '" y="' + r1(p[1]) + '"' + (extra ? extra(p) : '') + '>' + txt + '</text>\n'; };
  const rot = a => p => ' transform="rotate(' + a + ' ' + r1(p[0]) + ' ' + r1(p[1]) + ')"';
  const anchorEnd = () => ' text-anchor="end"';

  const ICON_CITY = '<path d="M-4,-2.5 h8 v6 h-2 v-2.5 h-1.2 v2.5 h-1.6 v-2.5 h-1.2 v2.5 h-2 z" fill="#4a3520"/>';
  const ICON_BATTLE = '<path d="M-3.4,-3.4 L3.4,3.4 M3.4,-3.4 L-3.4,3.4" stroke="var(--imperial)" stroke-width="1.6" stroke-linecap="round"/>';
  const ICON_CAMP = '<path d="M0,-4.6 L5,2.6 L-5,2.6 Z" fill="var(--imperial)"/>';
  const PULSE = '<circle class="pulse" r="7" fill="none" stroke="var(--imperial)" stroke-width="1.6"/>';
  function mk(i, type, year, key, name, l, icon, big){
    const p = P(...PLACES[key]);
    return I + '<g class="marker ' + type + '" data-i="' + i + '" data-year="' + year + '" transform="translate(' + r1(p[0]) + ',' + r1(p[1]) + ')" aria-label="' + name + '">' +
      '<g class="m-in"><circle class="m-badge" cx="0" cy="0" r="' + (big ? 7.5 : 6.5) + '"/>' + (icon || '') +
      '<text class="m-label" x="' + l[0] + '" y="' + l[1] + '" text-anchor="' + l[2] + '">' + name + '</text></g></g>\n';
  }
  const route = (id, cls, y0, y1, pts, arrow) => I + '<path id="' + id + '" class="route ' + cls + '" data-year="' + y0 + '" data-year-end="' + y1 + '" d="' + pathLL(pts) + '"' + (arrow ? ' marker-end="url(#' + arrow + ')"' : '') + '/>\n';

  const overlay =
'<g id="layer-regions" aria-hidden="true">\n' +
    lab('sea-label', [43.4, 34.6], 'Marea Neagră') +
    lab('sea-label', [45.4, 49.9], 'M. Caspică', anchorEnd) +
    lab('sea-label', [37.6, 18.2], 'Marea Mediterană') +
    lab('sea-label', [46.6, -7.0], 'Oceanul') +
    lab('sea-label', [45.6, -7.0], 'Atlantic') +
    lab('region-label', [47.0, 2.4], 'GALIA') +
    lab('region-label', [40.0, -4.4], 'HISPANIA') +
    lab('region-label', [42.9, 13.1], 'ITALIA', rot(52)) +
    lab('region-label', [35.5, 5.0], 'AFRICA') +
    lab('region-label', [51.6, 10.6], 'GERMANIA') +
    lab('region-label', [48.6, 36.0], 'STEPA PONTICĂ') +
    lab('region-label', [39.3, 32.0], 'IMPERIUL DE RĂSĂRIT') +
    lab('region-label', [45.9, 18.6], 'PANONIA') +
'            </g>\n' +
'            <g id="layer-rivers">\n' +
    // the base map already draws the real rivers; only their names are added
    lab('river-label', [50.7, 7.0], 'Rin', rot(-62)) +
    lab('river-label', [43.95, 24.6], 'Dunărea') +
    lab('river-label', [47.9, 21.2], 'Tisa', rot(-60)) +
    lab('river-label', [49.4, 40.0], 'Don', rot(-35)) +
    lab('river-label', [50.4, 46.4], 'Volga', rot(-70)) +
'            </g>\n' +
'            <g id="layer-zones">\n' +
I + '<path id="zone-early" class="zone-hun" d="' + polyLL(ZONES.early) + '" fill="url(#gradHuni)" opacity="0"/>\n' +
I + '<path id="zone-max" class="zone-hun" d="' + polyLL(ZONES.max) + '" fill="url(#gradHuni)" opacity="0"/>\n' +
I + '<path id="zone-late" class="zone-hun" d="' + polyLL(ZONES.late) + '" fill="url(#gradHuni)" opacity="0"/>\n' +
I + '<path id="zone-max-outline" class="zone-max-outline" d="' + polyLL(ZONES.max) + '" fill="none" stroke="var(--imperial)" stroke-width="1.4" stroke-dasharray="5 4"/>\n' +
'            </g>\n' +
'            <g id="layer-routes">\n' +
    route('route-visi', 'route-visi', 376, 418, ROUTES.visi, 'arrVisi') +
    lab('route-label rl-visi', [42.4, 5.0], 'Vizigoți') +
    route('route-ostro', 'route-ostro', 375, 454, ROUTES.ostro, 'arrOstro') +
    lab('route-label rl-ostro', [49.2, 29.0], 'Ostrogoți') +
    route('route-vand', 'route-vand', 401, 439, ROUTES.vand, 'arrVand') +
    lab('route-label rl-vand', [37.6, -1.0], 'Vandali') +
'            <g id="layer-huni-route">\n' +
    route('route-huni-0', 'route-huni-main', 370, 376, ROUTES.huni0) +
    route('route-huni-1', 'route-huni-main', 376, 420, ROUTES.huni1) +
    route('route-huni-2', 'route-huni-main', 441, 442, ROUTES.huni2, 'arrHuni') +
    route('route-huni-3', 'route-huni-main', 447, 448, ROUTES.huni3, 'arrHuni') +
    route('route-huni-4', 'route-huni-main', 450, 451, ROUTES.huni4, 'arrHuni') +
    route('route-huni-5', 'route-huni-main', 452, 453, ROUTES.huni5, 'arrHuni') +
    lab('route-label rl-huni', [46.6, 42.0], 'Hunii') +
'            </g>\n' +
'            </g>\n' +
'            <g id="layer-markers">\n' +
    mk(0, 'city', 0, 'roma', 'Roma', [0, 16, 'middle'], ICON_CITY, true) +
    mk(1, 'city', 402, 'ravenna', 'Ravenna', [-10, 3, 'end'], '', false) +
    mk(2, 'city', 452, 'aquileia', 'Aquileia', [-10, -4, 'end'], '', false) +
    mk(3, 'city', 441, 'naissus', 'Naissus', [10, 3, 'start'], '', false) +
    mk(4, 'city', 0, 'constantinopol', 'Constantinopol', [6, 17, 'start'], ICON_CITY, true) +
    mk(5, 'camp', 434, 'resedinta', 'Reședința lui Attila', [0, -11, 'middle'], ICON_CAMP, false) +
    mk(6, 'battle', 378, 'adrianopol', 'Adrianopol', [-10, 3, 'end'], ICON_BATTLE, false) +
    mk(7, 'battle', 451, 'catalaunice', 'Câmpiile Catalaunice', [0, -11, 'middle'], ICON_BATTLE + PULSE, false) +
'            </g>';
  body = body.slice(0, start) + overlay + body.slice(end);

  // credit for the base map, under the map
  body = mustReplace(body, '<p class="map-swipe-hint">← glisează harta →</p>',
    '<p class="map-swipe-hint">← glisează harta →</p>\n      <p class="map-credit">Hartă de bază: <i>Europe relief laea location map</i>, Alexrk2, Wikimedia Commons, CC BY-SA 3.0. Traseele, zonele și marcajele sunt adăugate peste ea.</p>', 'map credit');
  fs.writeFileSync(file, body);

  let css = fs.readFileSync(path.join(B, 'atlas.css'), 'utf8');
  if (!css.includes('.map-credit')) {
    css += "\n  .base-map{ filter: sepia(0.35) saturate(0.85) brightness(0.92) contrast(1.02); }\n" +
      "  .map-credit{ margin: 6px 2px 0; font-family: 'JetBrains Mono', monospace; font-size: 0.66rem; color: var(--ink-dim); line-height: 1.5; }\n";
  }
  // the sea is blue now: sea names in a darker blue, regions in dark ink
  css = css.replace("fill: #2f5566; text-anchor: middle; letter-spacing: 0.06em; opacity: 0.85;", "fill: #1d4357; text-anchor: middle; letter-spacing: 0.06em; opacity: 0.9;");
  fs.writeFileSync(path.join(B, 'atlas.css'), css);
  console.log('Atlas: hartă reală, coordonate calculate din latitudine/longitudine');
}

// ======================= ARTICLE: Marea Migrație map =======================
{
  const file = path.join(B, 'story.body.html');
  let body = fs.readFileSync(file, 'utf8');
  const s = body.indexOf('<div class="migr-map">');
  const svgStart = body.indexOf('<svg', s);
  const svgEnd = body.indexOf('</svg>', svgStart) + 6;
  if (s === -1 || svgStart === -1) { console.error('migr-map not found'); process.exit(1); }

  const COLORS = { visi: '#b389d9', ostro: '#f0a25c', vand: '#7ab0e8', huni: '#a71d2a' };
  const marker = (id, color) => '<marker id="' + id + '" viewBox="0 0 7 7" markerWidth="4" markerHeight="4" refX="5" refY="3.5" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L7,3.5 L0,7 Z" fill="' + color + '"/></marker>';
  const arrow = (i, cls, pts, label, ll, aria) => {
    const d = pathLL(pts), p = P(...ll);
    return '<g class="migr-arrow ' + cls + '" data-i="' + i + '" aria-label="' + aria + '">' +
      '<path class="hit" d="' + d + '"/><path class="case" d="' + d + '"/><path class="line" d="' + d + '" marker-end="url(#mh-' + cls + ')"/>' +
      '<text class="migr-label" x="' + r1(p[0]) + '" y="' + r1(p[1]) + '">' + label + '</text></g>';
  };
  const VB = [40, 312, 540, 264];
  const inflow = pathLL([[47.6, 44.0], [47.3, 38.0], [47.0, 31.0], [47.0, 24.5], [46.9, 21.0]]);
  const inflowLab = P(45.8, 36.6);
  const hub = P(...PLACES.resedinta), hubLab = P(46.25, 20.0);
  const svg =
    '<svg viewBox="' + VB.join(' ') + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Harta Marii Migrații: sosirea hunilor dinspre răsărit și traseele vizigoților, ostrogoților și vandalilor spre Imperiul Roman">' +
    '<defs>' + marker('mh-visi', COLORS.visi) + marker('mh-ostro', COLORS.ostro) + marker('mh-vand', COLORS.vand) + marker('mh-huni', COLORS.huni) + '</defs>' +
    IMAGE_TAG +
    '<rect class="migr-veil" x="' + VB[0] + '" y="' + VB[1] + '" width="' + VB[2] + '" height="' + VB[3] + '"/>' +
    '<g class="migr-inflow" aria-hidden="true"><path class="case" d="' + inflow + '"/><path class="line" d="' + inflow + '" marker-end="url(#mh-huni)"/>' +
    '<text class="migr-label migr-label-huni" x="' + r1(inflowLab[0]) + '" y="' + r1(inflowLab[1]) + '" text-anchor="end">Hunii · din 370</text></g>' +
    arrow(0, 'visi', ROUTES.visi, 'Vizigoți', [42.3, 5.0], 'Vizigoții: peste Dunăre, Adrianopol, Italia, Galia, Hispania') +
    arrow(1, 'ostro', ROUTES.ostro, 'Ostrogoți', [49.2, 29.0], 'Ostrogoții: din stepa pontică, vasali în Panonia') +
    arrow(2, 'vand', ROUTES.vand, 'Vandali', [37.6, -1.0], 'Vandalii: peste Rin, prin Galia și Hispania, până în Africa') +
    arrow(3, 'huni', [[46.8, 20.1], [44.8, 20.9], [43.4, 22.0], [42.4, 25.0], [41.3, 28.4]], 'Spre Constantinopol', [39.9, 24.6], 'Hunii spre Constantinopol, prin Balcani') +
    '<g class="migr-hub" aria-hidden="true"><circle cx="' + r1(hub[0]) + '" cy="' + r1(hub[1]) + '" r="11"/><text x="' + r1(hub[0]) + '" y="' + r1(hub[1] + 3.5) + '">HUNI</text></g>' +
    '<text class="migr-place" x="' + r1(hubLab[0]) + '" y="' + r1(hubLab[1]) + '">Câmpia Panonică</text>' +
    '</svg>';
  body = body.slice(0, svgStart) + svg + body.slice(svgEnd);
  fs.writeFileSync(file, body);

  let css = fs.readFileSync(path.join(B, 'story.css'), 'utf8');
  if (!css.includes('.migr-map .base-map')) css += "\n  .migr-map .base-map{ filter: sepia(0.35) saturate(0.85) brightness(0.92) contrast(1.02); }\n";
  fs.writeFileSync(path.join(B, 'story.css'), css);
  console.log('Articol: harta Marii Migrații pe harta reală');
}

// ======================= GAME: campaign strip =======================
{
  const toStrip = ll => { const p = g.proj(...ll); return [(p[0] - sx0) / sw * 800, (p[1] - sy0) / sh * 260]; };
  const order = ['I', 'II', 'III', 'IV'];
  const pts = order.map(k => toStrip(STOPS[k]));
  // smooth route through the four stops
  let d = 'M' + r1(pts[0][0]) + ',' + r1(pts[0][1]);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ' C' + r1(p1[0] + (p2[0] - p0[0]) / 6) + ',' + r1(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + r1(p2[0] - (p3[0] - p1[0]) / 6) + ',' + r1(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + r1(p2[0]) + ',' + r1(p2[1]);
  }
  const lab = (ll, txt) => { const p = toStrip(ll); return '<text x="' + r1(p[0]) + '" y="' + r1(p[1]) + '" text-anchor="middle" class="cmap-sea">' + txt + '</text>'; };

  const file = path.join(B, 'game.body.html');
  let body = fs.readFileSync(file, 'utf8');
  const a = body.indexOf('<svg class="cmap-svg"');
  const b = body.indexOf('</svg>', a) + 6;
  if (a === -1) { console.error('cmap svg not found'); process.exit(1); }
  body = body.slice(0, a) +
    '<svg class="cmap-svg" viewBox="0 0 800 260" preserveAspectRatio="none" aria-hidden="true">' +
      lab([43.9, 34.2], 'Marea Neagră') + lab([46.0, 37.0], 'Azov') + lab([45.2, 49.0], 'Caspica') +
      '<path id="route-base" d="' + d + '" fill="none" stroke="rgba(18,18,20,0.75)" stroke-width="2.5" stroke-dasharray="1 8" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
      '<path id="route-progress" d="' + d + '" fill="none" stroke="var(--gold)" stroke-width="3" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
    '</svg>' + body.slice(b);
  body = mustReplace(body, '<div class="cmap-stops" id="cmap-stops"></div>\n    </div>',
    '<div class="cmap-stops" id="cmap-stops"></div>\n    </div>\n    <p class="cmap-credit">Hartă: Alexrk2, Wikimedia Commons, CC BY-SA 3.0</p>', 'cmap credit');
  fs.writeFileSync(file, body);

  const jsFile = path.join(B, 'game.js');
  let js = fs.readFileSync(jsFile, 'utf8');
  js = js.replace(/  var WAYPOINTS_PCT = \[[\s\S]*?\n  \];/,
    '  // Stops on the real map: I Ptolemy\'s Khounoi (steppe of today\'s Ukraine), II beyond the Volga,\n' +
    '  // III the Alans between the Sea of Azov and the Caucasus, IV the Pannonian plain.\n' +
    '  var WAYPOINTS_PCT = [\n' + pts.map(p => '    [' + r1(p[0] / 8) + ', ' + r1(p[1] / 2.6) + ']').join(',\n') + '\n  ];');
  js = js.replace("cmapRider.style.top = (pt.y / 220 * 100) + '%';", "cmapRider.style.top = (pt.y / 260 * 100) + '%';");
  fs.writeFileSync(jsFile, js);

  const cssFile = path.join(B, 'game.css');
  let css = fs.readFileSync(cssFile, 'utf8');
  const bgRe = /background: linear-gradient\(180deg, rgba\(16,11,7,0\.35\), rgba\(16,11,7,0\.55\)\), url\('data:image\/jpeg;base64,[^']*'\);\n    background-size: cover;\n    background-position: center 55%;/;
  if (!bgRe.test(css)) { console.error('cmap bg not found'); process.exit(1); }
  css = css.replace(bgRe,
    "background: linear-gradient(180deg, rgba(16,11,7,0.15), rgba(16,11,7,0.35)), url('" + uri('harta-campanii.jpg') + "');\n    background-size: 100% 100%;");
  css = css.replace('aspect-ratio: 800 / 220;', 'aspect-ratio: 800 / 260;');
  if (!css.includes('.cmap-sea')) css += "\n  .cmap-sea{ font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 13px; fill: #1d4357; opacity: 0.9; }\n  .cmap-credit{ margin: 4px 0 0; font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; color: var(--ink-dim2); text-align: right; }\n";
  fs.writeFileSync(cssFile, css);
  console.log('Joc: harta campaniilor pe harta reală, opriri la locurile lor');
}
