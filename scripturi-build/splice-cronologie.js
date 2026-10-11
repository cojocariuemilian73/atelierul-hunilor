// Pune la zi cronologia interactivă (capitolul 02) în paginile publicate,
// din scripturi-build/cronologie/ (cron.html / .css / .js).
// Folosire: node scripturi-build/splice-cronologie.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const C = path.join(__dirname, 'cronologie');
const rd = f => fs.readFileSync(path.join(C, f), 'utf8').split('\r\n').join('\n');
const HTML = rd('cron.html').replace(/\n+$/, '\n');
const CSS = rd('cron.css').replace(/\n+$/, '\n') + '\n';
const JS = rd('cron.js').replace(/\n+$/, '\n') + '\n';
const SUB = 'Apasă pe un punct ca să afli ce s-a întâmplat. Alege o perioadă sau trage fereastra de jos ca să mărești un interval; filtrele ascund tipuri de evenimente.';

for (const rel of ['index.html', 'atelierul-hunilor.html', 'module-individuale/huni-prezentare.html']) {
  const f = path.join(root, rel);
  if (!fs.existsSync(f)) continue;
  const raw = fs.readFileSync(f, 'utf8');
  const crlf = raw.includes('\r\n');
  let s = raw.split('\r\n').join('\n');
  if (!s.includes('<div class="cron-wrap">')) { console.log(rel + ': fără cronologie, sărit'); continue; }
  const fail = m => { console.error(rel + ': ' + m); process.exit(1); };

  // HTML: tot ce e în cron-wrap, înainte de rândul cu sursele
  const h0 = s.indexOf('<div class="cron-wrap">') + '<div class="cron-wrap">'.length;
  const h1 = s.indexOf('        <p class="section-sources">', h0);
  if (h1 < 0) fail('rândul cu sursele');
  s = s.slice(0, h0) + '\n' + HTML + s.slice(h1);

  // subtitlul capitolului
  const sec = s.indexOf('<section id="sec-cronologie">');
  const p0 = s.indexOf('<p class="sec-sub">', sec), p1 = s.indexOf('</p>', p0);
  s = s.slice(0, p0) + '<p class="sec-sub">' + SUB + s.slice(p1);

  // CSS
  const c0 = s.indexOf('  /* ---------- CRONOLOGIE:');
  const c1 = s.indexOf('  /* ---------- MAREA MIGRAȚIE: HARTĂ CU SĂGEȚI ---------- */');
  if (c0 < 0 || c1 < c0) fail('marcaje CSS');
  s = s.slice(0, c0) + CSS + s.slice(c1);

  // JS
  const j = s.indexOf('// Cronologie interactivă');
  if (j < 0) fail('marcaj JS');
  const j0 = s.indexOf('\n', s.indexOf('  // =====', j)) + 1;
  const j1 = s.indexOf('  // ============================================================\n  // Marea Migrație — hartă cu săgeți interactive');
  if (j1 < j0) fail('sfârșit JS');
  s = s.slice(0, j0) + '\n' + JS + s.slice(j1);

  fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
  console.log(rel + ': cronologia la zi');
}
