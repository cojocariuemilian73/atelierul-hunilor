// A cincea recenzie: fără „Pe scurt” la capitolele 03 și 05; Attila și Aetius ca două fișe de personaj
// (portret, poreclă, trei bare calitative, faptele-cheie); fără harta campaniei din Galia (451);
// „Consecințe de lungă durată” ca un lanț de cauze și efecte, în cascadă; „stilul policrom” rămâne doar
// în capitolul „Glosar”; codul QR „Joacă pe telefon” trece în deschiderea paginii, mai mare, plus un
// buton discret, mereu la îndemână, care îl arată într-o fereastră.
// Folosire: node scripturi-build/patch-recenzie-5.js (se poate rula de mai multe ori; după
// patch-recenzie-4.js și patch-animatii.js; apoi build-web.js)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const rel = 'atelierul-hunilor.html';
const f = path.join(root, rel);
const raw = fs.readFileSync(f, 'utf8'), crlf = raw.includes('\r\n');
let s = raw.split('\r\n').join('\n');
const fail = m => { console.error(rel + ': ' + m); process.exit(1); };
const cut = (a, b) => { const i = s.indexOf(a); if (i < 0) return false; const j = s.indexOf(b, i); if (j < 0) fail('sfârșitul pentru ' + a); s = s.slice(0, i) + s.slice(j + b.length); return true; };
const rep = (a, b) => { if (s.includes(a)) s = s.split(a).join(b); };

// 1–2. „Pe scurt” rămâne doar la capitolul 01
s = s.replace(/ {6}<div class="pe-scurt"><b>Pe scurt <small>[^<]*<\/small><\/b><p>(?:Din 375, hunii|Attila și Aetius, generalul)[^\n]*\n/g, '');

// 3. Attila și Aetius: două fișe de personaj
const LV = { 5: 'foarte mare', 4: 'mare', 3: 'medie' };
const CARDS = [
  { cls: 'attila', role: 'Regele hunilor', name: 'Attila', epi: '„Flagellum Dei”, Biciul lui Dumnezeu<sup class="fn" data-n="15">15</sup>',
    stats: [['Putere militară', 5], ['Diplomație', 3], ['Moștenire', 5]],
    facts: ['Conduce imperiul hunic singur din 445 d.Hr., după înlăturarea fratelui său, Bleda.',
            'Devastează Balcanii (441–447) și obține tribut anual uriaș de la Constantinopol.',
            'Invadează Galia (451) și Italia (452); moare în 453, în noaptea nunții cu Ildico.'] },
  { cls: 'aetius', role: 'Generalul roman', name: 'Flavius Aetius', epi: '„Ultimul dintre romani”<sup class="fn" data-n="16">16</sup>',
    stats: [['Putere militară', 4], ['Diplomație', 5], ['Moștenire', 4]],
    facts: ['În tinerețe, ostatic la curtea hunilor: cunoștea lumea hunică din interior, un avantaj rar printre romanii vremii.',
            'Formează, în 451, coaliția care îl oprește pe Attila la Câmpiile Catalaunice: nu doar romani și vizigoți, ci și franci, burgunzi și alani.',
            'Este ucis chiar de împăratul Valentinian III, în 454, la trei ani după victoria sa cea mai mare.'] }
];
{
  const a = s.indexOf('      <div class="duel');
  const b = s.indexOf('      <div class="duel-lives"', a);
  if (a < 0 || b < 0) fail('fișele lui Attila și Aetius');
  const figs = s.slice(a, b).match(/<figure class="dc-img">[\s\S]*?<\/figure>/g);
  if (!figs || figs.length !== 2) fail('portretele din fișe');
  const card = (c, k) => '        <article class="duel-card ' + c.cls + ' dk-card">\n' +
    '          ' + figs[k] + '\n' +
    '          <p class="dc-role">' + c.role + '</p>\n' +
    '          <h4>' + c.name + '</h4>\n' +
    '          <p class="dc-epithet">' + c.epi + '</p>\n' +
    '          <dl class="dk-stats">\n' + c.stats.map(([t, v]) =>
    '            <div class="dk-stat"><dt>' + t + '</dt><dd><span class="dk-bar dk-v' + v + '" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><em>' + LV[v] + '</em></dd></div>\n').join('') +
    '          </dl>\n' +
    '          <p class="dk-label">Fapte-cheie</p>\n' +
    '          <ul class="dk-facts">\n' + c.facts.map(x => '            <li>' + x + '</li>\n').join('') +
    '          </ul>\n' +
    '        </article>\n';
  const html = '      <div class="duel dk">\n' + CARDS.map(card).join('') + '      </div>\n' +
    '      <p class="dk-note">Barele sunt orientative: o comparație calitativă făcută pentru acest proiect, după izvoare și după istoricii citați în note, nu o măsurătoare.</p>\n\n';
  s = s.slice(0, a) + html + s.slice(b);
}
// cercul „VS” nu mai există
s = s.replace('  .duel-vs{ display: none; }\n', '');
s = s.replace(/  \/\* Attila și Aetius: „VS” în mijloc \*\/\n  \.duel\{ position: relative; \}\n  \.duel-vs\{[^\n]*\n  @media \(max-width: 620px\)\{ \.duel-vs\{[^\n]*\n/, '');
rep('  @media print{ .ch-orn, .duel-vs{ display: none !important; } .pq{ break-inside: avoid; } }', '  @media print{ .ch-orn{ display: none !important; } .pq{ break-inside: avoid; } }');

// 4. harta campaniei din Galia (451): figura, stilurile și trimiterile la ea
cut('      <figure class="fig-map gal-fig">', '      </figure>\n');
cut('  /* harta campaniei din Galia (galia/splice-galia.js) */\n', '  /* /galia */\n');
rep("document.querySelectorAll('.ptol-map, .gal-wrap')", "document.querySelectorAll('.ptol-map')");
rep('(Atlas, Marea Migrație, harta campaniilor, campania din Galia) este', '(Atlas, Marea Migrație, harta campaniilor) este');
if (/gal-(fig|wrap|map|hun|rom)\b/.test(s)) fail('au rămas urme ale hărții Galiei');

// 5. „Consecințe de lungă durată”: lanțul cauză–efect, în cascadă (textele rămân aceleași)
{
  let a = s.indexOf('      <div class="impact-grid">'), endMark = '      </div>\n        </div>\n      </div>';
  if (a < 0) { a = s.indexOf('      <ol class="cascade"'); endMark = '      </ol>\n'; }
  if (a < 0) fail('consecințele');
  const b = s.indexOf(endMark, a); if (b < 0) fail('sfârșitul consecințelor');
  const end = b + (endMark === '      </ol>\n' ? endMark.length : '      </div>\n'.length);
  const steps = [...s.slice(a, end).matchAll(/<p class="it-year">([^<]*)<\/p>\s*<p>([\s\S]*?)<\/p>/g)].map(m => [m[1], m[2]]);
  if (steps.length !== 4) fail('cele patru consecințe');
  const html = '      <ol class="cascade" aria-label="Consecințele, ca un lanț de cauze și efecte">\n' +
    steps.map(([y, t], k) => '        <li class="cs-step" style="--k:' + k + '"><p class="it-year">' + y + '</p><p>' + t + '</p></li>\n').join('') +
    '      </ol>\n';
  s = s.slice(0, a) + html + s.slice(end);
}
// stilurile vechiului grid 2×2 nu mai sunt folosite
s = s.split('\n').filter(l => !/^\s*(@media \(max-width: 720px\)\{ )?(\.sr-text )?\.impact-(grid|tile)/.test(l)).join('\n');
if (s.includes('impact-')) fail('au rămas stiluri impact-');

// 6. „stilul policrom”: fără definiție în text, rămâne în capitolul „Glosar”
rep("{ k: 'policrom', t: 'Stil policrom', re:", "{ k: 'policrom', t: 'Stil policrom', tip: false, re:");
rep("  GL.forEach(function(it){ found[it.k] = wrapFirst(it); });", "  // tip: false = termenul rămâne doar în capitolul „Glosar”, fără definiție în text\n  GL.forEach(function(it){ found[it.k] = it.tip === false ? null : wrapFirst(it); });");
if (!s.includes("tip: false, re: /\\bstilul policrom\\b/i") || !s.includes('it.tip === false')) fail('glosarul');

// 7. codul QR: în deschidere, mai mare, și într-o fereastră deschisă de un buton discret
let svg;
{
  const old = s.match(/ {4}<aside class="qr-card"[\s\S]*?<\/aside>\n/);
  const src = old ? old[0] : (s.match(/<aside class="hero-qr"[\s\S]*?<\/aside>/) || [''])[0];
  svg = (src.match(/<svg[\s\S]*?<\/svg>/) || [])[0];
  if (!svg) fail('codul QR');
  svg = svg.replace(' aria-hidden="true" focusable="false"', '').replace(' class="segno"', ' class="segno" aria-hidden="true" focusable="false"');
  if (old) s = s.replace(old[0], '');
}
// stilurile vechiului card de sub joc
s = s.replace(/  \/\* cod QR pentru joc: doar pe ecrane late, unde nu ești deja pe telefon \*\/\n[\s\S]*?\n  \}\n/, '');
s = s.replace(/  \/\* cod QR pentru joc: doar pe ecrane late \*\/\n[\s\S]*?\n  \}\n\n?/, '');
s = s.replace(/  \/\* codul QR se mărește de 3 ori[^\n]*\n(  [^\n]*qr-code[^\n]*\n){3}/, '');
s = s.replace(/  \/\* codul QR: mic, sub joc \*\/\n  #mod-migratie \.qr-card\{[^\n]*\n/, '');
if (/\.qr-(card|code|title|text)\b/.test(s)) fail('au rămas stiluri ale vechiului cod QR');

const HERO_QR = '      <aside class="hero-qr" aria-label="Joacă pe telefon">\n' +
  '        <div class="hq-code" role="img" aria-label="Cod QR care deschide jocul pe telefon">' + svg + '</div>\n' +
  '        <div class="hq-text">\n' +
  '          <p class="hq-title">Joacă pe telefon</p>\n' +
  '          <p>Scanează codul cu camera telefonului: jocul se deschide direct în browser, fără instalare.</p>\n' +
  '          <a href="qr-joc.html" target="_blank" rel="noopener">Pagină de tipărit cu codul →</a>\n' +
  '        </div>\n' +
  '      </aside>\n';
s = s.replace(/ {6}<aside class="hero-qr"[\s\S]*?<\/aside>\n/, '');
{
  const cta = s.indexOf('      <div class="hero-cta">'); if (cta < 0) fail('butoanele din deschidere');
  const at = s.indexOf('      </div>\n', cta) + '      </div>\n'.length;
  s = s.slice(0, at) + HERO_QR + s.slice(at);
}

const QR_UI = '<!-- r5:qr -->\n' +
  '<button type="button" class="qr-fab" id="qr-fab" aria-haspopup="dialog" aria-controls="qr-dialog"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 18.5h3"/></svg>Joacă pe telefon</button>\n' +
  '<dialog class="qr-dialog" id="qr-dialog" aria-labelledby="qr-d-title">\n' +
  '  <button type="button" class="qr-d-close" aria-label="Închide">✕</button>\n' +
  '  <p class="qr-d-kicker">Attila și Marea Migrație</p>\n' +
  '  <h2 id="qr-d-title">Joacă pe telefon</h2>\n' +
  '  <div class="qr-d-code" role="img" aria-label="Cod QR care deschide jocul pe telefon">' + svg + '</div>\n' +
  '  <p class="qr-d-how">Deschide camera telefonului, îndreapt-o spre cod și apasă linkul care apare. Nu instalezi nimic.</p>\n' +
  '  <a href="qr-joc.html" target="_blank" rel="noopener">Pagină de tipărit cu codul →</a>\n' +
  '</dialog>\n' +
  '<!-- /r5:qr -->\n';
cut('<!-- r5:qr -->\n', '<!-- /r5:qr -->\n');

const CSS = `  /* r5: a cincea recenzie */
  /* Attila și Aetius: două fișe de personaj */
  .duel.dk{ display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(18px, 3vw, 34px); margin: 30px 0 12px; border: 0; }
  .duel.dk .duel-card{ position: relative; display: flex; flex-direction: column; padding: 14px 16px 18px; border: 1px solid rgba(229, 193, 88, 0.5); border-radius: 10px; background: linear-gradient(180deg, rgba(229, 193, 88, 0.08), rgba(229, 193, 88, 0) 42%), var(--paper); box-shadow: inset 0 0 0 4px var(--paper), inset 0 0 0 5px rgba(229, 193, 88, 0.2), 0 18px 40px rgba(0, 0, 0, 0.32); }
  .duel.dk .duel-card.attila{ border-right: 1px solid rgba(229, 193, 88, 0.5); border-bottom: 1px solid rgba(229, 193, 88, 0.5); }
  .duel.dk .dc-img{ margin: 0 0 14px; }
  .duel.dk .dc-img img{ height: clamp(190px, 22vw, 240px); }
  .duel.dk .dc-role{ align-self: flex-start; margin: 0 0 8px; padding: 3px 10px; border: 1px solid var(--line-strong); border-radius: 999px; color: #e5c158; }
  .duel.dk h4{ font-size: 1.8rem; line-height: 1.1; margin: 0 0 4px; }
  .duel.dk .dc-epithet{ margin: 0 0 14px; }
  .dk-stats{ margin: 0 0 14px; padding: 12px 0 2px; border-top: 1px solid var(--line-strong); }
  .dk-stat{ display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 2px 10px; margin-bottom: 10px; }
  .dk-stat dt{ font: 700 0.76rem 'Cinzel', Georgia, serif; letter-spacing: 0.06em; color: var(--ink); }
  .dk-stat dd{ display: contents; }
  .dk-stat em{ grid-column: 2; grid-row: 1; font: italic 0.82rem 'Source Serif 4', Georgia, serif; color: var(--ink-dim); }
  .dk-bar{ grid-column: 1 / -1; display: grid; grid-template-columns: repeat(5, 1fr); gap: 3px; height: 8px; }
  .dk-bar i{ border-radius: 1px; background: rgba(229, 193, 88, 0.14); }
  .dk-v3 i:nth-child(-n+3), .dk-v4 i:nth-child(-n+4), .dk-v5 i{ background: linear-gradient(180deg, #f2d474, #c9a13a); }
  .dk-label{ margin: 0 0 6px; font: 700 0.72rem 'Cinzel', Georgia, serif; letter-spacing: 0.08em; text-transform: uppercase; color: #e5c158; }
  .duel.dk .dk-facts{ list-style: none; margin: 0; padding: 0; }
  .duel.dk .dk-facts li{ position: relative; margin: 0 0 7px; padding-left: 16px; font-size: 0.88rem; line-height: 1.5; color: var(--ink-dim); }
  .dk-facts li::before{ content: ''; position: absolute; left: 1px; top: 0.6em; width: 6px; height: 6px; background: #e5c158; transform: rotate(45deg); }
  .dk-note{ max-width: 760px; margin: 0 auto 26px; text-align: center; font: italic 0.84rem 'Source Serif 4', Georgia, serif; color: var(--ink-dim); }
  @media (max-width: 700px){ .duel.dk{ grid-template-columns: 1fr; } }
  /* Consecințe de lungă durată: lanțul cauză–efect, în cascadă */
  .cascade{ list-style: none; margin: 22px 0 8px; padding: 0; }
  .cs-step{ position: relative; width: 78%; margin: 0 0 30px calc(var(--k) * 7.3%); padding: 12px 16px 13px; border: 1px solid var(--line-strong); border-left: 2px solid #e5c158; background: linear-gradient(90deg, rgba(229, 193, 88, 0.08), rgba(229, 193, 88, 0.02)); }
  .cs-step:last-child{ margin-bottom: 0; }
  .cs-step .it-year{ margin: 0 0 4px; font: 700 0.86rem 'JetBrains Mono', monospace; color: #e5c158; }
  .cs-step p:not(.it-year){ margin: 0 !important; font-size: 0.92rem; line-height: 1.55; color: var(--ink-dim); }
  .cs-step:not(:last-child)::after{ content: ''; position: absolute; left: 22px; top: calc(100% + 3px); width: 34px; height: 25px; background: no-repeat center / contain url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 25'%3E%3Cpath d='M2 1c0 11 9 18 24 19' fill='none' stroke='%23e5c158' stroke-width='1.4' stroke-opacity='.7'/%3E%3Cpath d='M22 15.5l6 4.6-6.6 3.4' fill='none' stroke='%23e5c158' stroke-width='1.4' stroke-opacity='.7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); }
  @media (max-width: 620px){
    .cs-step{ width: auto; margin-left: 0; margin-bottom: 26px; }
    .cs-step:not(:last-child)::after{ left: 50%; width: 14px; height: 20px; transform: translateX(-50%); background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 20'%3E%3Cpath d='M7 1v16M2.5 12.5L7 17.5l4.5-5' fill='none' stroke='%23e5c158' stroke-width='1.4' stroke-opacity='.7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); }
  }
  /* codul QR: în deschidere și într-o fereastră; pe telefon nu e nevoie de el */
  .hero-qr, .qr-fab{ display: none; }
  .hq-code, .qr-d-code{ background: #fff; border-radius: 4px; }
  .hq-code svg, .qr-d-code svg{ display: block; width: 100%; height: auto; }
  @media (min-width: 900px) and (hover: hover){
    .hero-qr{ display: flex; align-items: center; gap: 18px; max-width: 470px; margin-top: 22px; padding: 14px; border: 1px solid rgba(229, 193, 88, 0.55); background: rgba(14, 12, 9, 0.8); box-shadow: 0 14px 34px rgba(0, 0, 0, 0.45); backdrop-filter: blur(4px); }
    .hq-code{ flex: none; width: 176px; padding: 14px; }
    .hq-title{ margin: 0 0 6px; font: 700 1.05rem 'Cinzel', Georgia, serif; letter-spacing: 0.04em; color: #f2d474; }
    .hq-text p:not(.hq-title){ margin: 0 0 10px; font-size: 0.9rem; line-height: 1.5; color: #e6d7c3; }
    .hq-text a, .qr-dialog a{ font: 700 0.72rem 'JetBrains Mono', monospace; letter-spacing: 0.04em; color: #e5c158; text-decoration: none; }
    .hq-text a:hover, .qr-dialog a:hover{ text-decoration: underline; }
    .qr-fab{ position: fixed; left: 18px; bottom: 18px; z-index: 150; display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 16px 0 12px; border: 1px solid rgba(229, 193, 88, 0.6); border-radius: 999px; background: rgba(18, 16, 12, 0.92); color: #f2d474; font: 700 0.78rem 'Cinzel', Georgia, serif; letter-spacing: 0.05em; cursor: pointer; box-shadow: 0 8px 22px rgba(0, 0, 0, 0.45); transition: opacity 0.25s, transform 0.25s, background 0.15s; }
    .qr-fab svg{ width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; }
    .qr-fab:hover{ background: #221d14; }
    .qr-fab:focus-visible, .qr-d-close:focus-visible, .qr-dialog a:focus-visible, .hq-text a:focus-visible{ outline: 2px solid #f2d474; outline-offset: 3px; }
    .qr-fab.away{ opacity: 0; transform: translateY(12px); pointer-events: none; }
  }
  @media (min-width: 1200px) and (hover: hover){
    .hero-inner{ position: relative; }
    .hero-qr{ position: absolute; right: 18px; bottom: clamp(26px, 5vw, 40px); flex-direction: column; align-items: stretch; width: 236px; margin: 0; text-align: center; }
    .hq-code{ width: auto; padding: 16px; }
    .hero-inner .byline{ max-width: calc(100% - 270px); }
  }
  .qr-dialog{ width: min(92vw, 380px); padding: 30px 26px 24px; border: 1px solid rgba(229, 193, 88, 0.6); border-radius: 6px; background: #121214; color: #e6d7c3; text-align: center; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6); }
  .qr-dialog::backdrop{ background: rgba(10, 10, 12, 0.72); }
  .qr-d-close{ position: absolute; top: 6px; right: 6px; width: 44px; height: 44px; border: 0; background: none; color: #cbbca4; font-size: 1.1rem; cursor: pointer; }
  .qr-d-close:hover{ color: #f2d474; }
  .qr-d-kicker{ margin: 0 0 6px; font: 700 0.7rem 'JetBrains Mono', monospace; letter-spacing: 0.14em; text-transform: uppercase; color: #e5c158; }
  .qr-dialog h2{ margin: 0 0 18px; font: 700 1.6rem 'Cinzel', Georgia, serif; color: #f6eddc; }
  .qr-d-code{ width: min(100%, 264px); margin: 0 auto 16px; padding: 20px; }
  .qr-d-how{ margin: 0 0 12px; font-size: 0.92rem; line-height: 1.5; color: #cbbca4; }
  @media (prefers-reduced-motion: reduce){ .qr-fab{ transition: none; } }
  @media print{ .hero-qr, .qr-fab, .qr-dialog{ display: none !important; } .cs-step{ width: auto; margin-left: 0; } .cs-step::after{ display: none; } }
  /* /r5 */
`;
const JS = `<script>
/* r5: fereastra cu codul QR; butonul se ascunde cât timp codul din deschidere e pe ecran */
(function(){
  var fab = document.getElementById('qr-fab'), dlg = document.getElementById('qr-dialog');
  if (!fab || !dlg || typeof dlg.showModal !== 'function') { if (fab) fab.hidden = true; return; }
  fab.addEventListener('click', function(){ dlg.showModal(); });
  dlg.querySelector('.qr-d-close').addEventListener('click', function(){ dlg.close(); });
  dlg.addEventListener('click', function(e){ if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', function(){ fab.focus({ preventScroll: true }); });
  var hq = document.querySelector('.hero-qr');
  if (hq && 'IntersectionObserver' in window) {
    new IntersectionObserver(function(es){ fab.classList.toggle('away', es[0].isIntersecting); }).observe(hq);
  }
})();
</script>
`;
cut('  /* r5: a cincea recenzie */\n', '  /* /r5 */\n');
const st = s.lastIndexOf('</style>'); if (st < 0) fail('</style>');
s = s.slice(0, st) + CSS + s.slice(st);
cut('<script>\n/* r5: fereastra', '</script>\n');
const b = s.lastIndexOf('</body>'); if (b < 0) fail('</body>');
s = s.slice(0, b) + QR_UI + JS + s.slice(b);

fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
console.log(rel + ': a cincea recenzie');
