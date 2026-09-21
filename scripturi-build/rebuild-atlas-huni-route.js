// Replaces the short, single-leg "route-huni" path (camp → Constantinopol
// only) with a full multi-segment route tracing the Huns' own migration from
// the Pontic steppe (near the Khounoi/Don marker used in the habitat
// diagram, same 1248x832 image coordinate space) through Pannonia, the
// Balkans, Gaul and Italy — each segment revealed on its own year window as
// the timeline slider is dragged, instead of one generic 25-year fade.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const BODY_PATH = path.join(ROOT, 'build', 'atlas.body.html');
const JS_PATH = path.join(ROOT, 'build', 'atlas.js');

// ---------- 1. body: swap the old short route for the new segmented one ----------
let body = fs.readFileSync(BODY_PATH, 'utf8');

const oldRoute =
  '            <path id="route-huni" class="route route-huni" data-year="441" d="M420,400 Q460,440 490,470 Q505,485 518,500" marker-end="url(#arrHuni)"/>\n' +
  '            <text class="route-label" x="460" y="460" fill="var(--route-huni)">Către Constant.</text>\n';

if (!body.includes(oldRoute)) {
  console.error('OLD route-huni block not found — aborting, no changes written.');
  process.exit(1);
}

// Waypoints, chronological: steppe origin → crossing → Pannonia → Balkans
// campaign → Constantinopol tribute → Gaul (Catalaunian Fields) → Italy
// (Aquileia). Coordinates reuse the same calibrated points as the nearby
// markers (Tisza camp 390,360 · Naissus 478,444 · Constantinopol 490,500 ·
// Câmp. Catalaunice 267,309 · Aquileia 420,387).
const segments = [
  { d: 'M650,385 Q580,350 500,355', y0: 370, y1: 378, arrow: false },
  { d: 'M500,355 Q450,345 400,362', y0: 378, y1: 410, arrow: false },
  { d: 'M400,362 Q430,410 478,444', y0: 410, y1: 441, arrow: true },
  { d: 'M478,444 Q484,475 490,500', y0: 441, y1: 447, arrow: true },
  { d: 'M490,500 Q380,420 267,309', y0: 447, y1: 451, arrow: true },
  { d: 'M267,309 Q340,350 420,387', y0: 451, y1: 452, arrow: true }
];

const newRoute =
  '            <g id="layer-huni-route">\n' +
  segments.map(function(s, i){
    return '            <path id="route-huni-' + i + '" class="route route-huni-main" data-year="' + s.y0 + '" data-year-end="' + s.y1 + '" d="' + s.d + '"' + (s.arrow ? ' marker-end="url(#arrHuni)"' : '') + '/>\n';
  }).join('') +
  '            <text class="route-label" x="660" y="405" fill="var(--route-huni)">Ruta hunilor</text>\n' +
  '            </g>\n';

body = body.replace(oldRoute, newRoute);
fs.writeFileSync(BODY_PATH, body);
console.log('atlas.body.html: replaced route-huni with', segments.length, 'segments');

// ---------- 2. js: support a per-route data-year-end instead of the fixed 25y span ----------
let js = fs.readFileSync(JS_PATH, 'utf8');

const oldLoop =
"      routes.forEach(function(r){\n" +
"        var ry = parseInt(r.getAttribute('data-year'), 10);\n" +
"        var len = parseFloat(r.dataset.len);\n" +
"        if (!layers.routes) { r.style.opacity = 0; return; }\n" +
"        if (year < ry) { r.style.opacity = 0; r.style.strokeDashoffset = len; return; }\n" +
"        r.style.opacity = 1;\n" +
"        var span = 25;\n" +
"        var t = Math.min(1, (year - ry) / span);\n" +
"        r.style.strokeDashoffset = len * (1 - t);\n" +
"      });\n";

if (!js.includes(oldLoop)) {
  console.error('OLD routes.forEach loop not found — aborting, no changes written.');
  process.exit(1);
}

const newLoop =
"      routes.forEach(function(r){\n" +
"        var ry = parseInt(r.getAttribute('data-year'), 10);\n" +
"        var ryEnd = r.hasAttribute('data-year-end') ? parseInt(r.getAttribute('data-year-end'), 10) : ry + 25;\n" +
"        var len = parseFloat(r.dataset.len);\n" +
"        if (!layers.routes) { r.style.opacity = 0; return; }\n" +
"        if (year < ry) { r.style.opacity = 0; r.style.strokeDashoffset = len; return; }\n" +
"        r.style.opacity = 1;\n" +
"        var span = Math.max(1, ryEnd - ry);\n" +
"        var t = Math.min(1, (year - ry) / span);\n" +
"        r.style.strokeDashoffset = len * (1 - t);\n" +
"      });\n";

js = js.replace(oldLoop, newLoop);
fs.writeFileSync(JS_PATH, js);
console.log('atlas.js: routes loop now supports data-year-end per segment');
