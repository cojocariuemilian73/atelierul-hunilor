// Assembles the standalone module-individuale/atlas-hunic.html from the
// same (already image-based, no-D3) build/atlas.css + atlas.body.html + atlas.js
// pieces used for the combined page — just unscoped, with the chapter marker stripped.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const css = fs.readFileSync(path.join(ROOT, 'build', 'atlas.css'), 'utf8');
let body = fs.readFileSync(path.join(ROOT, 'build', 'atlas.body.html'), 'utf8');
const js = fs.readFileSync(path.join(ROOT, 'build', 'atlas.js'), 'utf8');

// strip the combined-page-only chapter marker
body = body.replace(/\s*<div class="mod-chapter">.*?<\/div>\n/, '\n');
// trim leading blank lines
body = body.replace(/^\s*\n+/, '');

const out = `<!DOCTYPE html>
<title>Atlasul Migrației Hunice</title>
<style>
${css}
</style>

${body}
<script>
${js}
</script>
`;

const outPath = path.join(ROOT, 'module-individuale', 'atlas-hunic.html');
fs.writeFileSync(outPath, out);
console.log('wrote', outPath, '(', (out.length / 1024).toFixed(0), 'KB )');
