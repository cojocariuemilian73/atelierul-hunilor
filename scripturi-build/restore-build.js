// Recreates build/ (which is in .gitignore, so a fresh clone does not have it)
// from the five standalone pages in module-individuale/ plus the combined page.
// It undoes exactly what build-standalone.js does (un-rewrites the links, puts
// back each module's "mod-chapter" heading and the blank lines it trims) and
// copies the scoped CSS out of the combined page.
// Then it runs assemble.js and checks that FINAL.html equals index.html byte
// for byte, so the restored sources are known to be the real ones.
//   node scripturi-build/restore-build.js
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const B = path.join(ROOT, 'build');
fs.mkdirSync(B, { recursive: true });

const combined = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const MODULES = [
  { mod: 'story',   file: 'huni-prezentare.html' },
  { mod: 'game',    file: 'huni-migratia.html',   scope: 'm-game' },
  { mod: 'embassy', file: 'solia-la-attila.html', scope: 'm-embassy' },
  { mod: 'atlas',   file: 'atlas-hunic.html',     scope: 'm-atlas' },
  { mod: 'lab',     file: 'laborator-muzeu.html', scope: 'm-lab' },
];
const LINKS = { '#mod-game': 'huni-migratia.html', '#mod-embassy': 'solia-la-attila.html', '#mod-atlas': 'atlas-hunic.html', '#mod-lab': 'laborator-muzeu.html', '#page-acasa': 'huni-prezentare.html' };
const STANDALONE_BODY_CSS = 'body{ margin: 0; background: #121214; color: #e6d7c3; }\n';

// The chapter headings, as they sit in the combined page: leading whitespace,
// the div, the newline, and the first line after it (used to find the spot).
const chapters = [...combined.matchAll(/(\s*<div class="mod-chapter">.*?<\/div>\n)(.*)\n/g)]
  .map(m => ({ block: m[1], next: m[2] }));

// The scoped CSS is taken as-is from the combined page (between the module
// comments assemble.js writes), not regenerated: some earlier rebuild scripts
// edited the .scoped.css files directly.
// build-standalone.js trims the blank lines at the top of each body; the
// combined page still has them right after the module's opening tag.
const BODY_OPEN = { story: '<div id="page-acasa" class="site-page">\n', game: '<section id="mod-game" class="m-game site-page">\n', embassy: '<section id="mod-embassy" class="m-embassy site-page">\n', lab: '<section id="mod-lab" class="m-lab site-page">\n', atlas: '<section id="sec-atlas"' };
function leadingBlank(mod){
  let at = combined.indexOf(BODY_OPEN[mod]);
  if (at === -1) throw new Error(mod + ': body marker not found');
  at += BODY_OPEN[mod].length;
  if (mod === 'atlas') at = combined.indexOf('</p>\n', combined.indexOf('<p class="sec-sub">', at)) + 5;
  return combined.slice(at).match(/^\s*\n|^/)[0];
}
const CSS_MARKERS = { game: 'CAMPANIA HUNILOR (.m-game)', embassy: 'SOLIA LA ATTILA (.m-embassy)', atlas: 'ATLASUL MIGRAȚIEI (.m-atlas)', lab: 'MUZEU (.m-lab)' };
function scopedFromCombined(mod){
  const head = '  /* ============ MODULE: ' + CSS_MARKERS[mod] + ' ============ */\n';
  const start = combined.indexOf(head);
  if (start === -1) throw new Error(mod + ': css marker not found');
  const end = combined.indexOf('\n  /* ============ MODULE: ', start + head.length);
  return combined.slice(start + head.length, end === -1 || end > combined.indexOf('</style>') ? combined.indexOf('\n</style>') : end);
}

for (const m of MODULES) {
  const src = fs.readFileSync(path.join(ROOT, 'module-individuale', m.file), 'utf8');
  const style = src.slice(src.indexOf('<style>\n') + 8, src.indexOf('\n</style>'));
  const imports = (style.match(/^(@import url\([^)]*\);\n)+/) || [''])[0];
  let css = style.slice(imports.length);
  if (!css.startsWith(STANDALONE_BODY_CSS)) throw new Error(m.mod + ': unexpected standalone css prefix');
  css = imports.replace(/\n/g, '') + css.slice(STANDALONE_BODY_CSS.length);

  let body = src.slice(src.indexOf('<main>\n') + 7, src.lastIndexOf('\n</main>'));
  body = leadingBlank(m.mod) + body;
  for (const [from, to] of Object.entries(LINKS)) body = body.split('href="' + to + '"').join('href="' + from + '"');
  for (const ch of chapters) {
    const at = body.indexOf('\n' + ch.next + '\n');
    if (at !== -1 && body.indexOf(ch.block) === -1) { body = body.slice(0, at) + ch.block + body.slice(at + 1); break; }
  }

  const js = src.slice(src.lastIndexOf('<script>\n') + 9, src.lastIndexOf('\n</script>'));
  fs.writeFileSync(path.join(B, m.mod + '.css'), css);
  fs.writeFileSync(path.join(B, m.mod + '.body.html'), body);
  fs.writeFileSync(path.join(B, m.mod + '.js'), js);
  if (m.scope) fs.writeFileSync(path.join(B, m.mod + '.scoped.css'), scopedFromCombined(m.mod));
}

execFileSync('node', [path.join(__dirname, 'assemble.js'), B], { stdio: 'inherit' });
const final = fs.readFileSync(path.join(B, 'FINAL.html'), 'utf8');
if (final === combined) { console.log('build/ restored: FINAL.html is identical to index.html'); process.exit(0); }
let i = 0; while (final[i] === combined[i]) i++;
console.error('FINAL.html differs from index.html at char', i);
console.error('  FINAL: ', JSON.stringify(final.slice(i - 80, i + 120)));
console.error('  index: ', JSON.stringify(combined.slice(i - 80, i + 120)));
process.exit(1);
