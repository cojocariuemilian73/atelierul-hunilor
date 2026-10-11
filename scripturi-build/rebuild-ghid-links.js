// Linkuri spre ghid-profesor.html: în „Despre proiect” (Valoare educațională) și sub
// jocurile din Atelierul istoricului.
const fs = require('fs'), path = require('path');
for (const f of ['index.html', 'atelierul-hunilor.html']) {
  const p = path.join(__dirname, '..', f);
  let s = fs.readFileSync(p, 'utf8').split('\r\n').join('\n');
  if (s.includes('href="ghid-profesor.html"')) { console.error(f + ': already applied'); process.exit(1); }
  const rep = (a, b, w) => { if (!s.includes(a)) { console.error(f + ': not found ' + w); process.exit(1); } s = s.replace(a, b); };
  rep('    <h3>Valoare educațională</h3>\n', '    <h3>Valoare educațională</h3>\n    <p><a href="ghid-profesor.html" target="_blank" rel="noopener"><strong>Ghidul profesorului</strong></a>: corespondența cu programa de clasa a IX-a, trei scenarii de lecție și o fișă de lucru cu barem, gata de tipărit.</p>\n', 'about');
  rep('  <section class="at-panel" id="at-g3" role="tabpanel" aria-labelledby="at-tab-3" hidden></section>\n',
      '  <section class="at-panel" id="at-g3" role="tabpanel" aria-labelledby="at-tab-3" hidden></section>\n  <p class="at-guide">Pentru profesori: <a href="ghid-profesor.html" target="_blank" rel="noopener">Ghidul profesorului</a>, cu scenarii de lecție și fișă de lucru tipăribilă.</p>\n', 'atelier');
  rep('  @media (prefers-reduced-motion: reduce){ .m-atelier *{', "  .at-guide{ margin: 22px 0 0; text-align: center; font: 0.78rem 'JetBrains Mono', monospace; color: var(--at-dim); }\n  .at-guide a{ color: var(--at-gold2); }\n  @media (prefers-reduced-motion: reduce){ .m-atelier *{", 'css');
  fs.writeFileSync(p, s);
}
// sursa jocurilor
const h = path.join(__dirname, 'atelier', 'atelier.html');
let t = fs.readFileSync(h, 'utf8');
if (!t.includes('at-guide')) { t = t.replace('  <section class="at-panel" id="at-g3" role="tabpanel" aria-labelledby="at-tab-3" hidden></section>\n', '  <section class="at-panel" id="at-g3" role="tabpanel" aria-labelledby="at-tab-3" hidden></section>\n  <p class="at-guide">Pentru profesori: <a href="ghid-profesor.html" target="_blank" rel="noopener">Ghidul profesorului</a>, cu scenarii de lecție și fișă de lucru tipăribilă.</p>\n'); fs.writeFileSync(h, t); }
const c = path.join(__dirname, 'atelier', 'atelier.css');
let u = fs.readFileSync(c, 'utf8');
if (!u.includes('.at-guide')) { u = u.replace('  @media (prefers-reduced-motion: reduce){ .m-atelier *{', "  .at-guide{ margin: 22px 0 0; text-align: center; font: 0.78rem 'JetBrains Mono', monospace; color: var(--at-dim); }\n  .at-guide a{ color: var(--at-gold2); }\n  @media (prefers-reduced-motion: reduce){ .m-atelier *{"); fs.writeFileSync(c, u); }
console.log('linkuri spre ghid');
