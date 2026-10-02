// Atlas readability. The labels were hard to read: the whole map was darkened
// twice (a paper-grain noise layer in multiply mode at 35% plus brightness 0.92), the
// labels were 8px in map units, and markers outside the selected period sat
// at 30% opacity, so their names nearly vanished. These overrides lighten the
// map, enlarge the labels and give them a stronger halo. They are appended to
// both atlas.css (standalone page) and atlas.scoped.css (combined page).
const fs = require('fs');
const path = require('path');
const B = path.join(__dirname, '..', 'build');

const RULES = [
  '.paper-grain{ opacity: 0.1; }',
  '.base-map{ filter: sepia(0.3) saturate(0.9) brightness(1.05) contrast(1.04); }',
  '.route-label{ font-size: 10px; stroke: rgba(18, 18, 20, 0.92); stroke-width: 3.2px; }',
  '.m-label{ font-size: 10px; stroke-width: 3.2px; }',
  '.region-label{ font-size: 8.5px; opacity: 0.92; stroke: rgba(240, 230, 214, 0.85); stroke-width: 2.4px; stroke-linejoin: round; }',
  '.sea-label{ font-size: 10px; font-weight: 600; opacity: 1; paint-order: stroke; stroke: rgba(240, 230, 214, 0.7); stroke-width: 2.2px; stroke-linejoin: round; }',
  '.river-label{ font-size: 9px; }',
  '.marker{ opacity: 0.6; }',
];

fs.appendFileSync(path.join(B, 'atlas.css'), '\n  /* lizibilitatea etichetelor pe hartă */\n' + RULES.map(r => '  ' + r).join('\n') + '\n');
fs.appendFileSync(path.join(B, 'atlas.scoped.css'), '\n' + RULES.map(r => '  .m-atlas ' + r).join('\n') + '\n');
console.log('atlas label overrides appended');

// ---------- layout: no "Mod de vizualizare" panel, legend to the left of the map ----------
// The three layer toggles are removed (all layers stay on, see the end of this
// file). The legend now sits in
// a column beside the map, so it can be read while looking at the map; on
// narrow screens it drops below the map.
function edit(file, pairs){
  let s = fs.readFileSync(file, 'utf8');
  for (const [from, to] of pairs) {
    if (!s.includes(from)) { console.error('not found in ' + path.basename(file) + ': ' + from.slice(0, 70)); process.exit(1); }
    s = s.split(from).join(to);
  }
  fs.writeFileSync(file, s);
}
const bodyFile = path.join(B, 'atlas.body.html');
const body = fs.readFileSync(bodyFile, 'utf8');
const togStart = body.indexOf('      <div class="frame">\n        <p class="panel-label">Mod de vizualizare</p>');
const togEnd = body.indexOf('      <div class="frame legend-box">');
if (togStart === -1 || togEnd === -1) { console.error('view toggles not found'); process.exit(1); }
fs.writeFileSync(bodyFile, body.slice(0, togStart) + body.slice(togEnd));

const LAYOUT = [
  '.stage{ grid-template-columns: 230px minmax(0, 1fr); }',
  '.sidebar{ order: -1; align-self: start; }',
  '@media (max-width: 900px){ .stage{ grid-template-columns: 1fr; } .sidebar{ order: 0; } }',
];
fs.appendFileSync(path.join(B, 'atlas.css'), LAYOUT.map(r => '  ' + r).join('\n') + '\n');
fs.appendFileSync(path.join(B, 'atlas.scoped.css'), [
  '  .m-atlas .stage{ grid-template-columns: 230px minmax(0, 1fr); }',
  '  .m-atlas .sidebar{ order: -1; align-self: start; }',
  '  @media (max-width: 900px){ .m-atlas .stage{ grid-template-columns: 1fr; } .m-atlas .sidebar{ order: 0; } }',
].join('\n') + '\n');

edit(path.join(__dirname, 'assemble.js'), [
  ['  .m-atlas.atlas-in-article .stage{ grid-template-columns: 1fr; margin-top: 14px; }\n' +
   '  .m-atlas.atlas-in-article .sidebar{ display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }\n' +
   '  @media (max-width: 640px){ .m-atlas.atlas-in-article .sidebar{ grid-template-columns: 1fr; } }\n',
   '  .m-atlas.atlas-in-article .stage{ grid-template-columns: 220px minmax(0, 1fr); margin-top: 14px; }\n' +
   '  @media (max-width: 900px){ .m-atlas.atlas-in-article .stage{ grid-template-columns: 1fr; } }\n'],
]);
console.log('atlas: view toggles removed, legend beside the map');

// With the toggles gone, every layer stays on: migration routes, major
// conflicts and the outline of the maximum extent.
edit(path.join(B, 'atlas.js'), [
  ['var layers = { routes: true, battles: true, maxextent: false };', 'var layers = { routes: true, battles: true, maxextent: true };'],
]);
console.log('atlas: all layers always on');
