// Regenerates all five standalone pages in module-individuale/ from the same
// build/ sources as the combined page, so they can never drift from it again
// (three of them were still the very first version of the project).
// Run after assemble.js:  node scripturi-build/build-standalone.js
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const B = path.join(ROOT, 'build');

const MODULES = [
  { mod: 'story',   file: 'huni-prezentare.html', title: 'Invazia din Stepe — Hunii și prăbușirea ordinii antice' },
  { mod: 'game',    file: 'huni-migratia.html',   title: 'Campania Hunilor' },
  { mod: 'embassy', file: 'solia-la-attila.html', title: 'Solia la Attila' },
  { mod: 'atlas',   file: 'atlas-hunic.html',     title: 'Atlasul Migrației Hunice' },
  { mod: 'lab',     file: 'laborator-muzeu.html', title: 'Muzeul Hunilor' },
];
// In a standalone page, links to other modules point to their standalone files.
const LINKS = { '#mod-game': 'huni-migratia.html', '#mod-embassy': 'solia-la-attila.html', '#mod-atlas': 'atlas-hunic.html', '#mod-lab': 'laborator-muzeu.html', '#page-acasa': 'huni-prezentare.html' };

for (const m of MODULES) {
  let css = fs.readFileSync(path.join(B, m.mod + '.css'), 'utf8');
  let body = fs.readFileSync(path.join(B, m.mod + '.body.html'), 'utf8');
  const js = fs.readFileSync(path.join(B, m.mod + '.js'), 'utf8');
  body = body.replace(/\s*<div class="mod-chapter">.*?<\/div>\n/, '\n').replace(/^\s*\n+/, '');
  for (const [from, to] of Object.entries(LINKS)) body = body.split('href="' + from + '"').join('href="' + to + '"');
  const imports = (css.match(/@import url\([^)]*\);/g) || []).join('\n');
  css = css.replace(/@import url\([^)]*\);/g, '');
  const out = `<!DOCTYPE html>
<html lang="ro" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${m.title}</title>
<style>
${imports}
body{ margin: 0; background: #121214; color: #e6d7c3; }
${css}
</style>
</head>
<body>
<main>
${body}
</main>
<script>
${js}
</script>
</body>
</html>
`;
  const p = path.join(ROOT, 'module-individuale', m.file);
  fs.writeFileSync(p, out);
  console.log('wrote', path.relative(ROOT, p), '(', (out.length / 1024).toFixed(0), 'KB )');
}
