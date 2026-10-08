// Adaugă pagina „Atelierul istoricului” (3 jocuri de gândire istorică):
// sursele sunt în scripturi-build/atelier/ (atelier.html / .css / .js).
// Patch direct pe paginile construite (index.html, atelierul-hunilor.html).
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const SRC = path.join(__dirname, 'atelier');
const html = fs.readFileSync(path.join(SRC, 'atelier.html'), 'utf8').trim();
const css = fs.readFileSync(path.join(SRC, 'atelier.css'), 'utf8');
const js = fs.readFileSync(path.join(SRC, 'atelier.js'), 'utf8').trim();
function patch(file){
  const p = path.join(ROOT, file);
  let s = fs.readFileSync(p, 'utf8').split('\r\n').join('\n');
  if (s.includes('id="mod-atelier"')) { console.error(file + ': already applied'); process.exit(1); }
  const rep = (from, to, what) => { if (!s.includes(from)) { console.error(file + ' / not found: ' + what); process.exit(1); } s = s.replace(from, to); };
  // page
  rep('</section>\n\n\n\n</main>', '</section>\n\n<section id="mod-atelier" class="m-atelier site-page">\n' + html + '\n</section>\n\n</main>', 'page');
  // nav
  rep('  <a href="#mod-embassy">Solia la Attila</a>\n', '  <a href="#mod-embassy">Solia la Attila</a>\n  <a href="#mod-atelier">Atelierul istoricului</a>\n', 'nav');
  // router + pager
  rep("var PAGE_IDS = ['page-acasa', 'mod-game', 'mod-embassy'];", "var PAGE_IDS = ['page-acasa', 'mod-game', 'mod-embassy', 'mod-atelier'];", 'PAGE_IDS');
  rep('id="site-page-count">1 / 3</span>', 'id="site-page-count">1 / 4</span>', 'pager');
  // css, before the game module
  const marker = '  /* ============ MODULE: CAMPANIA HUNILOR (.m-game) ============ */';
  rep(marker, css + '\n' + marker, 'css marker');
  // js, last script before </body>
  const tail = '\n</body>';
  const at = s.lastIndexOf(tail);
  if (at === -1) { console.error(file + ' / no </body>'); process.exit(1); }
  s = s.slice(0, at) + '\n<script>\n' + js + '\n</script>' + s.slice(at);
  // about modal: new list item after the Solia item
  const li = '<li><strong>Solia la Attila</strong>';
  if (s.includes(li)) {
    const a = s.indexOf(li), b = s.indexOf('</li>', a) + 5;
    s = s.slice(0, b) + '\n      <li><strong>Atelierul istoricului</strong> — trei jocuri de gândire istorică: cât de sigură e o afirmație (critica de sursă), efectul de domino văzut din două teze și diferența dintre document și ilustrație.</li>' + s.slice(b);
  }
  fs.writeFileSync(p, s);
  console.log(file + ': Atelierul istoricului adăugat');
}
patch('index.html');
patch('atelierul-hunilor.html');
