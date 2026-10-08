// Notele de subsol: li era grid, așa că textul, <em> și ↩ cădeau în coloane separate.
// Îl facem bloc, cu numărul în margine.
const fs = require('fs'), path = require('path');
const ADD = `
  .biblio{ column-count: 1; counter-reset: bib; }
  .biblio li{ display: block; position: relative; padding: 9px 0 9px 2.7em; font-size: 0.88rem; line-height: 1.58; color: var(--ink-dim); border-bottom: 1px solid var(--line); }
  .biblio li::before{ position: absolute; left: 0; top: 11px; width: 2em; text-align: right; }
  .biblio li em{ color: var(--ink); }
  .biblio li:target{ background: rgba(212, 175, 55, 0.08); }
`;
const A = '  #biblio h3.sub-title{ margin-top: 34px; }\n';
for (const f of ['index.html', 'atelierul-hunilor.html', 'module-individuale/huni-prezentare.html']) {
  const p = path.join(__dirname, '..', f);
  let s = fs.readFileSync(p, 'utf8').split('\r\n').join('\n');
  if (!s.includes(A)) { console.error(f + ': anchor not found'); process.exit(1); }
  if (s.includes('.biblio li::before{ position: absolute')) { console.error(f + ': already applied'); process.exit(1); }
  s = s.replace(A, A + ADD);
  fs.writeFileSync(p, s);
}
console.log('bibliografie: note ca bloc');
