// Pagina jocului: cartonaș „Joacă pe telefon” cu cod QR (doar pe ecrane late).
// Folosește SVG-ul generat de make-qr.py (python make-qr.py inline).
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');
const PY = 'C:/Users/cojoc/AppData/Local/Programs/Python/Python312/python';
const svg = execFileSync(PY, [path.join(__dirname, 'make-qr.py'), 'inline']).toString().trim();
const CARD = `
    <aside class="qr-card" aria-label="Joacă pe telefon">
      <div class="qr-code" role="img" aria-label="Cod QR care deschide jocul pe telefon">${svg}</div>
      <div class="qr-text">
        <p class="qr-title">Joacă pe telefon</p>
        <p>Scanează codul cu camera telefonului și jocul se deschide direct în browser. Nu instalezi nimic.</p>
        <a href="qr-joc.html" target="_blank" rel="noopener">Pagină de tipărit cu codul →</a>
      </div>
    </aside>`;
const CSS = `
  /* cod QR pentru joc: doar pe ecrane late, unde nu ești deja pe telefon */
  .m-game .qr-card{ display: none; }
  @media (min-width: 900px) and (hover: hover){
    .m-game .qr-card{ display: flex; align-items: center; gap: 18px; margin-top: 22px; padding: 14px 16px; border: 1px dashed rgba(212,175,55,0.5); background: rgba(212,175,55,0.05); }
    .m-game .qr-code{ flex: none; width: 112px; padding: 7px; background: #fff; border-radius: 3px; }
    .m-game .qr-code svg{ display: block; width: 100%; height: auto; }
    .m-game .qr-title{ font-family: 'Cinzel', Georgia, serif; font-weight: 700; font-size: 1rem; color: #e5c158; margin: 0 0 4px; }
    .m-game .qr-text p{ margin: 0 0 6px; font-size: 0.86rem; line-height: 1.5; color: #cbbca4; }
    .m-game .qr-text a{ font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: #e5c158; text-decoration: none; letter-spacing: 0.04em; }
    .m-game .qr-text a:hover{ text-decoration: underline; }
  }
`;
for (const f of ['index.html', 'atelierul-hunilor.html']) {
  const p = path.join(__dirname, '..', f);
  let s = fs.readFileSync(p, 'utf8').split('\r\n').join('\n');
  if (s.includes('class="qr-card"')) { console.error(f + ': already applied'); process.exit(1); }
  const a = s.indexOf('<p class="sources"><b>Surse:</b>', s.indexOf('id="start-panel"'));
  const b = a === -1 ? -1 : s.indexOf('</p>', a) + 4;
  if (a === -1) { console.error(f + ': sources paragraph not found'); process.exit(1); }
  s = s.slice(0, b) + CARD + s.slice(b);
  const marker = '  /* ============ MODULE: CAMPANIA HUNILOR (.m-game) ============ */';
  if (!s.includes(marker)) { console.error(f + ': css marker'); process.exit(1); }
  s = s.replace(marker, CSS + '\n' + marker);
  fs.writeFileSync(p, s);
}
console.log('joc: cartonaș QR');
