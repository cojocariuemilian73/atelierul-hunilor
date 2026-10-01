// Campania II (the Xiongnu–Hun debate) gets its image too: the Xiongnu gold
// crown from Aluchaideng (Inner Mongolia, 4th–3rd c. BC), photo Gary Todd, CC0.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const file = path.join(ROOT, 'build', 'game.js');
const src = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(ROOT, 'imagini', 'reale', 'web-coroana-xiongnu.jpg')).toString('base64');
let js = fs.readFileSync(file, 'utf8');
const anchor = '    if (i === 2) {\n      var g = bgUrl(';
if (!js.includes(anchor)) { console.error('levelArt not found'); process.exit(1); }
if (!js.includes('XIONGNU_SRC')) {
  js = js.replace("  var NEUVILLE_SRC = '", "  var XIONGNU_SRC = '" + src + "';\n  var NEUVILLE_SRC = '");
  js = js.replace(anchor,
    "    if (i === 1) return { src: XIONGNU_SRC, alt: 'Coroană de aur cu un vultur cu cap de turcoaz, așezat pe o calotă, și o bandă decorată cu animale.', cap: 'Coroana de aur Xiongnu de la Aluchaideng (Mongolia Interioară, sec. IV–III î.Hr.), cu un vultur din aur și turcoaz. Obiectul e Xiongnu, cu secole mai vechi decât hunii din Europa: tocmai legătura dintre cele două lumi e întrebarea acestei campanii. Foto: Gary Todd, CC0.' };\n" + anchor);
  js = js.replace('  // One real image per campaign (none for II).', '  // One real image per campaign.');
  fs.writeFileSync(file, js);
}
console.log('game.js: imagine pentru Campania II');
