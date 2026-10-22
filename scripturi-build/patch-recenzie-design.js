// Corecturi de design după recenzie: roșul din titluri devine lizibil pe fundalul închis, textul articolului
// nu mai apare stins la derulare (efectul rămâne doar pe imagini), bara de jos de pe Acasă apare abia la
// sfârșitul articolului (acum: bara stă la finalul fiecărei pagini, nefixată), „Despre proiect” devine un buton discret, etichetele mici nu mai folosesc fontul
// monospace (rămâne doar pentru ani și cifre), iar figurile au același chenar.
// Folosire: node scripturi-build/patch-recenzie-design.js (se poate rula de mai multe ori)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

// etichetele mici, scrise până acum cu JetBrains Mono, majuscule și spațiere: trec pe fonturile cu serife
const NAV = ['.site-nav a', '.chap-bar a', '.hero-btn', '.about-trigger', '.mod-chapter .t'];
const LABELS = ['.about-modal h3', '.kicker', '.toc-label', '.chapter-tag', '.mx-meta', '.mx-item::before', '.mx-seal small', '.callout .cal-label',
  '.hx-life em', '.migr-info .mi-tag', '.duel-card .dc-role', '.sc-row em', '.md-band span', '.md-era em', '.jg-kicker', '.jg-eyebrow', '.jg-meter label',
  '.imp-cmp > b', '.mig-table th', '.imp-tag', '.mig-pop-h', '.mig-side-h', '.mig-log em', '.mig-attcmp b', '.mig-title small',
  '.m-atlas .eyebrow', '.m-atlas .panel-label', '.m-atlas .modal-tag', '.m-lab .eyebrow', '.m-lab .module-num', '.m-lab .artifact-kind', '.m-lab .mp-text',
  '.m-lab .fc-cat', '.m-lab .flip-tag', '.m-lab .flip-hint', '.site-pager-btn', '.cta-btn', '.mx-all', '.mx-btn', '.mx-more', '.mx-src', '.hx-map figcaption'];

const CSS = `  /* rd: corecturi de design după recenzie */
  /* textul articolului nu mai apare stins la derulare; doar imaginile și hărțile mai apar treptat */
  .js-sr .sr-reveal{ opacity: 1 !important; transform: none !important; transition: none !important; }
  .js-sr .fig-map.sr-reveal:not(.sr-in), .js-sr .diagram.sr-reveal:not(.sr-in){ opacity: 0 !important; }
  .js-sr .fig-map.sr-reveal, .js-sr .diagram.sr-reveal{ transition: opacity 0.6s ease !important; }
  /* bara „Pagina anterioară / următoare” nu mai e fixă: stă la sfârșitul fiecărei pagini; „sus” stă în colț */
  .site-pager{ position: static; margin-top: 48px; }
  .to-top{ left: auto !important; right: 18px; bottom: 18px; }
  @media (max-width: 640px){ .to-top{ right: 12px; bottom: 14px; } }
  /* „Despre proiect”: buton discret, cu contur, ca să nu concureze cu „Joacă” */
  .about-trigger{ background: transparent !important; color: #e5c158 !important; border: 1px solid rgba(229, 193, 88, 0.55) !important; }
  .about-trigger:hover{ background: rgba(229, 193, 88, 0.12) !important; border-color: #e5c158 !important; }
  /* etichetele și meniurile: fără monospace (rămâne doar pentru ani și cifre) */
  ${NAV.join(', ')}{ font-family: 'Cinzel', Georgia, serif !important; letter-spacing: 0.06em; }
  ${LABELS.join(', ')}{ font-family: 'Source Serif 4', Georgia, serif !important; }
  /* același chenar pentru toate figurile din articol: hârtie, contur subțire, colțul auriu */
  .fig-map, .dc-img, .gal-item{ position: relative; padding: 8px; background: var(--paper); border: 1px solid var(--line-strong); border-radius: 0; box-shadow: 0 18px 40px rgba(0, 0, 0, 0.3); overflow: visible; }
  .fig-map::before, .dc-img::before, .gal-item::before{ content: ''; position: absolute; inset: -6px auto auto -6px; width: 34px; height: 34px; border-top: 2px solid var(--accent-2); border-left: 2px solid var(--accent-2); pointer-events: none; z-index: 1; }
  .dc-img::before{ width: 22px; height: 22px; inset: -5px auto auto -5px; }
  .fig-map img, .dc-img img, .gal-item img{ border: 0 !important; border-radius: 0 !important; }
  .fig-map figcaption, .gal-item figcaption{ padding: 9px 0 0; margin-top: 0; }
  @media print{ .mx-closed > .mx-item, .mx-closed > .mx-facts{ display: grid !important; } .mx-teaser{ display: none !important; } }
  /* /rd */
`;

for (const rel of ['index.html', 'atelierul-hunilor.html']) {
  const f = path.join(root, rel);
  const raw = fs.readFileSync(f, 'utf8'), crlf = raw.includes('\r\n');
  let s = raw.split('\r\n').join('\n');
  const fail = m => { console.error(rel + ': ' + m); process.exit(1); };

  // 1. roșul din titluri, pe fundalul închis: #e0626c (contrast ~5:1) în loc de #a71d2a (~2,5:1)
  s = s.split('      --accent: #a71d2a;').join('      --accent: #e0626c;').split('    --accent: #a71d2a;').join('    --accent: #e0626c;');

  // 2. stilurile, la sfârșitul ultimului bloc <style>, ca să aibă ultimul cuvânt
  const c0 = s.indexOf('  /* rd: corecturi de design după recenzie */');
  if (c0 >= 0) { const e = '  /* /rd */\n'; s = s.slice(0, c0) + s.slice(s.indexOf(e, c0) + e.length); }
  const st = s.lastIndexOf('</style>');
  if (st < 0) fail('</style>');
  s = s.slice(0, st) + CSS + s.slice(st);

  // 3. scriptul vechi care ascundea bara de jos: scos (bara nu mai e fixă)
  const j0 = s.indexOf('<script>\n/* rd: pe Acasă');
  if (j0 >= 0) s = s.slice(0, j0) + s.slice(s.indexOf('</script>\n', j0) + '</script>\n'.length);

  fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
  console.log(rel + ': corecturile de design');
}
