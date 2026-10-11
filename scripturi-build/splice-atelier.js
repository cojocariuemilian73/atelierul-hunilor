// Pune la zi pagina „Masa istoricului” (#mod-atelier) în paginile publicate,
// din scripturi-build/atelier/ (atelier.html / .css / .js).
// Folosire: node scripturi-build/splice-atelier.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const A = path.join(__dirname, 'atelier');
const rd = f => fs.readFileSync(path.join(A, f), 'utf8').split('\r\n').join('\n');
const HTML = rd('atelier.html').trim();
const CSS = rd('atelier.css').replace(/\n+$/, '\n');
const JS = rd('atelier.js').trim();
const MARK = '  /* ============ MODULE: ATELIERUL ISTORICULUI (.m-atelier) ============ */';

for (const rel of ['index.html', 'atelierul-hunilor.html']) {
  const f = path.join(root, rel);
  const raw = fs.readFileSync(f, 'utf8');
  const crlf = raw.includes('\r\n');
  let s = raw.split('\r\n').join('\n');
  const fail = m => { console.error(rel + ': ' + m); process.exit(1); };

  // pagina
  const p0 = s.indexOf('<section id="mod-atelier" class="m-atelier site-page">');
  if (p0 < 0) fail('secțiunea #mod-atelier');
  const open = s.indexOf('>', p0) + 1;
  const p1 = s.indexOf('\n</section>', open);
  s = s.slice(0, open) + '\n' + HTML + s.slice(p1);

  // stiluri: până la următorul modul
  const c0 = s.indexOf(MARK);
  if (c0 < 0) fail('marcaj CSS');
  const c1 = s.indexOf('  /* ============ MODULE:', c0 + MARK.length);
  if (c1 < 0) fail('sfârșit CSS');
  s = s.slice(0, c0) + CSS + '\n' + s.slice(c1);

  // script
  let n = 0;
  s = s.replace(/<script>\n[\s\S]*?\n<\/script>/g, blk => {
    if (!blk.includes("getElementById('mod-atelier')")) return blk;
    n++; return '<script>\n' + JS + '\n</script>';
  });
  if (n !== 1) fail('script atelier (' + n + ')');

  // navigare și descriere
  s = s.split('<a href="#mod-atelier">Atelierul istoricului</a>').join('<a href="#mod-atelier">Masa istoricului</a>');
  s = s.replace(/<li><strong>Atelierul istoricului<\/strong>[^\n]*?<\/li>/,
    '<li><strong>Masa istoricului</strong> — douăsprezece surse despre huni (obiecte, izvoare scrise, picturi) de așezat pe axa timpului: cât de multe sunt cu adevărat din epoca lui Attila.</li>');

  fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
  console.log(rel + ': Masa istoricului la zi');
}
