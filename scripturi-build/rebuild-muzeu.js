// Module 05 becomes simply "Muzeu": the old name "Laborator & Muzeu" (and the
// standalone page, which still carried a CSS "3D artefact viewer" that did not
// work) promised a 3D museum the site does not have. The combined page shows
// real museum photographs with numbered details, so the module is named for
// what it is. The standalone copies in module-individuale/ are regenerated
// from the same build/ sources as the combined page, so they stop drifting.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const B = path.join(ROOT, 'build');

function edit(file, pairs){
  let s = fs.readFileSync(file, 'utf8');
  for (const [from, to] of pairs) {
    if (!s.includes(from)) { console.error('not found in ' + path.basename(file) + ': ' + from.slice(0, 70)); process.exit(1); }
    s = s.split(from).join(to);
  }
  fs.writeFileSync(file, s);
}

edit(path.join(B, 'lab.body.html'), [
  ['<p class="eyebrow">Modul avansat · concurs de istorie</p>', '<p class="eyebrow">Colecție virtuală · piese reale din muzee</p>'],
  ['<span class="t">Laborator &amp; Muzeu</span>', '<span class="t">Muzeu</span>'],
  ['<h1 class="title">Laborator și Muzeu Virtual</h1>', '<h1 class="title">Muzeul Hunilor</h1>'],
  ['<p class="sub">Patru artefacte hunice fotografiate în muzee și dezbaterea dintre cronici și genetica modernă.</p>',
   '<p class="sub">Patru artefacte hunice, în fotografii reale din colecții muzeale: apasă pe punctele numerotate pentru detalii. La final, mituri și adevăruri despre huni, verificate cu izvoarele și cu genetica modernă.</p>'],
]);

edit(path.join(ROOT, 'scripturi-build', 'assemble.js'), [
  ['<li><strong>Laborator &amp; Muzeu</strong> — artefacte hunice explorabile', '<li><strong>Muzeu</strong> — artefacte hunice reale, explorabile pe fotografie,'],
  ['din Laborator sunt documente reale', 'din Muzeu sunt documente reale'],
  ['<a href="#mod-lab">Laborator &amp; Muzeu</a>', '<a href="#mod-lab">Muzeu</a>'],
  ['/* ============ MODULE: LABORATOR ȘI MUZEU VIRTUAL (.m-lab) ============ */', '/* ============ MODULE: MUZEU (.m-lab) ============ */'],
  ['o hartă istorică și un laborator/muzeu virtual.', 'o hartă istorică și un muzeu virtual.'],
]);

edit(path.join(B, 'story.body.html'), [
  ['în modulul <a href="#mod-lab">Laborator &amp; Muzeu</a> al acestui site', 'în modulul <a href="#mod-lab">Muzeu</a> al acestui site'],
]);

edit(path.join(ROOT, 'README.md'), [
  ['`laborator-muzeu.html` — Laborator și Muzeu Virtual (artefacte 3D, mit vs. adevăr paleogenetic)', '`laborator-muzeu.html` — Muzeul Hunilor (artefacte reale fotografiate în muzee, mit vs. adevăr paleogenetic)'],
]);
console.log('redenumit: Laborator & Muzeu → Muzeu');

// ---------- standalone pages, from the same sources ----------
function standalone(mod, title, outName){
  let css = fs.readFileSync(path.join(B, mod + '.css'), 'utf8');
  let body = fs.readFileSync(path.join(B, mod + '.body.html'), 'utf8');
  const js = fs.readFileSync(path.join(B, mod + '.js'), 'utf8');
  body = body.replace(/\s*<div class="mod-chapter">.*?<\/div>\n/, '\n').replace(/^\s*\n+/, '');
  // @import must come first in the stylesheet
  const imports = (css.match(/@import url\([^)]*\);/g) || []).join('\n');
  css = css.replace(/@import url\([^)]*\);/g, '');
  const out = `<!DOCTYPE html>
<html lang="ro" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
${imports}
body{ margin: 0; background: #121214; }
${css}
</style>
</head>
<body>
${body}
<script>
${js}
</script>
</body>
</html>
`;
  const p = path.join(ROOT, 'module-individuale', outName);
  fs.writeFileSync(p, out);
  console.log('wrote', path.relative(ROOT, p), '(', (out.length / 1024).toFixed(0), 'KB )');
}
standalone('lab', 'Muzeul Hunilor', 'laborator-muzeu.html');
standalone('atlas', 'Atlasul Migrației Hunice', 'atlas-hunic.html');
