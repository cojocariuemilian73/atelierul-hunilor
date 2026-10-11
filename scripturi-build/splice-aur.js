// Pune la zi „Aurul hunilor” (graficul care se construiește la derulare, capitolul 03)
// în paginile publicate, din scripturi-build/aur/ (aur.html / .css / .js).
// Folosire: node scripturi-build/splice-aur.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const D = path.join(__dirname, 'aur');
const rd = f => fs.readFileSync(path.join(D, f), 'utf8').split('\r\n').join('\n');
const HTML = '      <!-- aur:start -->\n' + rd('aur.html').replace(/\n+$/, '\n') + '      <!-- aur:end -->\n';
const CSS = rd('aur.css').replace(/\n+$/, '\n') + '  /* ---------- /AURUL HUNILOR ---------- */\n';
const JS = '<script>\n' + rd('aur.js').trim() + '\n</script>';

for (const rel of ['index.html', 'atelierul-hunilor.html', 'module-individuale/huni-prezentare.html']) {
  const f = path.join(root, rel);
  if (!fs.existsSync(f)) continue;
  const raw = fs.readFileSync(f, 'utf8');
  const crlf = raw.includes('\r\n');
  let s = raw.split('\r\n').join('\n');
  const fail = m => { console.error(rel + ': ' + m); process.exit(1); };

  // HTML: după rândul cu efectul de domino, înaintea hărții invaziilor
  const a0 = s.indexOf('      <!-- aur:start -->');
  if (a0 >= 0) {
    const a1 = s.indexOf('      <!-- aur:end -->\n', a0) + '      <!-- aur:end -->\n'.length;
    s = s.slice(0, a0) + HTML + s.slice(a1);
  } else {
    const sec = s.indexOf('<section id="sec-migratie">');
    if (sec < 0) { console.log(rel + ': fără capitolul 03, sărit'); continue; }
    const at = s.indexOf('      <figure class="fig-map">', sec);
    if (at < 0) fail('harta invaziilor');
    s = s.slice(0, at) + HTML + '\n' + s.slice(at);
  }

  // CSS
  const c0 = s.indexOf('  /* ---------- AURUL HUNILOR');
  if (c0 >= 0) {
    const endMark = '  /* ---------- /AURUL HUNILOR ---------- */\n';
    const c1 = s.indexOf(endMark, c0) + endMark.length;
    s = s.slice(0, c0) + CSS + s.slice(c1);
  } else {
    const at = s.indexOf('  /* ---------- MAREA MIGRAȚIE: HARTĂ CU SĂGEȚI ---------- */');
    if (at < 0) fail('marcaj CSS');
    s = s.slice(0, at) + CSS + s.slice(at);
  }

  // JS
  let n = 0;
  s = s.replace(/<script>\n[\s\S]*?\n<\/script>/g, blk => {
    if (!blk.includes("getElementById('gold-story')")) return blk;
    n++; return JS;
  });
  if (!n) { const at = s.lastIndexOf('\n</body>'); s = s.slice(0, at) + '\n' + JS + s.slice(at); }

  fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
  console.log(rel + ': aurul hunilor la zi');
}
