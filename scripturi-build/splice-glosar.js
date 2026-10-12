// Pune la zi glosarul (definiții la termenii din articol + capitolul 07 „Glosar”; Bibliografia devine 08),
// din scripturi-build/glosar/ (glosar.js / glosar.css).
// Folosire: node scripturi-build/splice-glosar.js (se poate rula de mai multe ori)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const G = path.join(__dirname, 'glosar');
const rd = f => fs.readFileSync(path.join(G, f), 'utf8').split('\r\n').join('\n');
const CSS = rd('glosar.css').replace(/\n+$/, '\n');
const JS = '<script>\n' + rd('glosar.js').trim() + '\n</script>';
const SEC = `  <section id="sec-glosar">
    <div class="chapter-mark"><span class="chapter-num">07</span><span class="chapter-slash">/</span><span class="chapter-tag">Glosar</span></div>
    <h2 class="sec-title">Glosar</h2>
    <p class="sec-sub">Termenii de specialitate din articol. În text sunt subliniați cu puncte: treci cu mouse-ul peste ei sau atinge-i ca să vezi definiția.</p>
    <dl class="gl-list" id="gl-list"></dl>
  </section>

`;

for (const rel of ['index.html', 'atelierul-hunilor.html', 'module-individuale/huni-prezentare.html']) {
  const f = path.join(root, rel);
  if (!fs.existsSync(f)) continue;
  const raw = fs.readFileSync(f, 'utf8');
  const crlf = raw.includes('\r\n');
  let s = raw.split('\r\n').join('\n');
  const fail = m => { console.error(rel + ': ' + m); process.exit(1); };
  if (!s.includes('<section id="biblio">')) { console.log(rel + ': fără bibliografie, sărit'); continue; }

  // capitolul
  const g0 = s.indexOf('  <section id="sec-glosar">');
  if (g0 >= 0) { const g1 = s.indexOf('  </section>\n\n', g0) + '  </section>\n\n'.length; s = s.slice(0, g0) + s.slice(g1); }
  const b = s.indexOf('  <section id="biblio">');
  s = s.slice(0, b) + SEC + s.slice(b);
  s = s.replace(/<span class="chapter-num">0[78]<\/span><span class="chapter-slash">\/<\/span><span class="chapter-tag">Bibliografie<\/span>/,
    '<span class="chapter-num">08</span><span class="chapter-slash">/</span><span class="chapter-tag">Bibliografie</span>');

  // cuprinsul
  s = s.replace(/\n    <a href="#sec-glosar" data-sec="sec-glosar" class="toc-link"><i>07<\/i>Glosar<\/a>/, '');
  s = s.replace(/<a href="#biblio" data-sec="biblio" class="toc-link"><i>0[78]<\/i>Bibliografie<\/a>/,
    '<a href="#sec-glosar" data-sec="sec-glosar" class="toc-link"><i>07</i>Glosar</a>\n    <a href="#biblio" data-sec="biblio" class="toc-link"><i>08</i>Bibliografie</a>');

  // stiluri
  const c0 = s.indexOf('  /* gl: glosar */');
  if (c0 >= 0) { const e = '  /* /gl */\n'; s = s.slice(0, c0) + CSS + s.slice(s.indexOf(e, c0) + e.length); }
  else { const at = s.indexOf('  .sec-sub{'); if (at < 0) fail('CSS'); s = s.slice(0, at) + CSS + s.slice(at); }

  // script
  let n = 0;
  s = s.replace(/<script>\n\(function\(\)\{\n  \/\/ gl: glosar[\s\S]*?\n<\/script>/g, () => { n++; return JS; });
  if (!n) { const at = s.lastIndexOf('\n</body>'); s = s.slice(0, at) + '\n' + JS + s.slice(at); }

  fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
  console.log(rel + ': glosarul la zi');
}
