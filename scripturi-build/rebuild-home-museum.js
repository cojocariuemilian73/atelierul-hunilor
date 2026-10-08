// Acasă: Muzeul și „Mit vs. adevăr” devin capitolele 06 și 07 ale articolului
// (Bibliografia devine 08), iar cuprinsul lateral e înlocuit cu o bară
// orizontală lipită sub meniul de sus. Patch direct pe paginile construite
// (index.html și atelierul-hunilor.html); build/ nu mai e sursa de adevăr.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

function fail(w){ console.error('not found: ' + w); process.exit(1); }
function patch(file){
  const p = path.join(ROOT, file);
  // the built pages use CRLF; work on LF and write LF back
  let s = fs.readFileSync(p, 'utf8').split('\r\n').join('\n');
  if (s.includes('id="sec-muzeu"')) { console.error(file + ': already applied'); process.exit(1); }
  const rep = (from, to, what) => { if (!s.includes(from)) fail(file + ' / ' + what); s = s.replace(from, to); };

  // ---- 1. take the lab page apart ----
  const L0 = s.indexOf('<section id="mod-lab" class="m-lab site-page">');
  const L1 = s.indexOf('</section>\n</main>', L0);
  if (L0 === -1 || L1 === -1) fail(file + ' / mod-lab section');
  const lab = s.slice(L0, L1 + '</section>'.length);
  s = s.slice(0, L0) + s.slice(L1 + '</section>'.length);

  const mod1a = lab.indexOf('<!-- ============ MODULE 1 ============ -->');
  const mod2a = lab.indexOf('<!-- ============ MODULE 2 ============ -->');
  const footA = lab.indexOf('<footer>', mod2a);
  const popA = lab.indexOf('<div class="hs-popover"');
  if ([mod1a, mod2a, footA, popA].some(x => x === -1)) fail(file + ' / lab parts');
  const subM = lab.match(/<p class="sub">([\s\S]*?)<\/p>/);
  const popover = lab.slice(popA, lab.indexOf('</div>', lab.indexOf('id="hp-desc"')) + '</div>'.length);
  const footer = (lab.slice(footA).match(/<footer>([\s\S]*?)<\/footer>/) || [, ''])[1];

  const frame = lab.slice(lab.indexOf('<div class="frame">', mod1a), mod2a).replace(/\s*<\/div>\s*$/, '');   // frame + closing of module
  // `frame` currently ends with the frame's closing </div> (module closing removed above)
  const museumSub = (subM ? subM[1] : '').split('. La final')[0] + '.';
  const flip = '<div class="flip-grid" id="flip-grid"></div>';

  const museum =
    '\n    <section id="sec-muzeu" class="m-lab lab-in-article">\n' +
    '      <div class="chapter-mark"><span class="chapter-num">06</span><span class="chapter-slash">/</span><span class="chapter-tag">Muzeul virtual</span></div>\n' +
    '      <h2 class="sec-title">Muzeul Hunilor</h2>\n' +
    '      <p class="sec-sub">' + museumSub + '</p>\n' +
    '      <div class="wrap">\n        ' + frame + '\n      </div>\n' +
    '      ' + popover + '\n' +
    '    </section>\n';
  const myths =
    '\n    <section id="sec-mituri" class="m-lab lab-in-article">\n' +
    '      <div class="chapter-mark"><span class="chapter-num">07</span><span class="chapter-slash">/</span><span class="chapter-tag">Mit vs. adevăr</span></div>\n' +
    '      <h2 class="sec-title">Mit vs. adevăr</h2>\n' +
    '      <p class="sec-sub">Apasă pe fiecare card pentru a compara o idee răspândită despre huni cu ce arată izvoarele antice, arheologia și ADN-ul antic.</p>\n' +
    '      <div class="wrap">\n        ' + flip + '\n      </div>\n' +
    '      <p class="section-sources">' + footer.replace(/ · realizat pentru concursul[^<]*$/, '') + '</p>\n' +
    '    </section>\n';

  // ---- 2. insert after Personalități, renumber the bibliography ----
  const P0 = s.indexOf('<section id="sec-personalitati">');
  if (P0 === -1) fail(file + ' / sec-personalitati');
  const P1 = s.indexOf('</section>', P0) + '</section>'.length;
  s = s.slice(0, P1) + '\n' + museum + myths + s.slice(P1);
  rep('<span class="chapter-num">06</span><span class="chapter-slash">/</span><span class="chapter-tag">Bibliografie',
      '<span class="chapter-num">08</span><span class="chapter-slash">/</span><span class="chapter-tag">Bibliografie', 'biblio number');

  // ---- 3. the Muzeu page is gone: nav, router, pager, links ----
  rep('  <a href="#mod-lab">Muzeu</a>\n', '', 'nav link');
  rep("var PAGE_IDS = ['page-acasa', 'mod-game', 'mod-embassy', 'mod-lab'];", "var PAGE_IDS = ['page-acasa', 'mod-game', 'mod-embassy'];", 'PAGE_IDS');
  rep('id="site-page-count">1 / 4</span>', 'id="site-page-count">1 / 3</span>', 'pager');
  rep('<a class="hero-btn" href="#mod-lab">Muzeul virtual</a>', '<a class="hero-btn" href="#sec-muzeu">Muzeul virtual</a>', 'hero button');
  rep('<a href="#mod-lab">Muzeu</a>', '<a href="#sec-muzeu">Muzeul virtual</a>', 'text link');
  rep('  #mod-game, #mod-embassy, #mod-lab{ padding-block: 28px; }', '  #mod-game, #mod-embassy{ padding-block: 28px; }', 'page padding css');
  rep('<li><strong>Muzeu</strong> — artefacte hunice reale, explorabile pe fotografie, și mituri despre huni verificate cu izvoarele și genetica.</li>',
      '<li><strong>Muzeul virtual și Mit vs. adevăr</strong> — artefacte hunice reale, explorabile pe fotografie, și mituri despre huni verificate cu izvoarele și genetica; capitolele 06 și 07 din pagina Acasă.</li>', 'about guide');
  if (s.includes('#mod-lab"')) fail(file + ' / leftover #mod-lab link');

  // ---- 4. contents: horizontal bar instead of the side column ----
  const T0 = s.indexOf('  <nav class="side-toc" aria-label="Cuprins">');
  const T1 = s.indexOf('</nav>', T0) + '</nav>\n'.length;
  if (T0 === -1) fail(file + ' / side toc');
  s = s.slice(0, T0).replace(/\s*$/, '\n') + s.slice(T1);
  const W0 = s.indexOf('  <div class="toc-wrap" aria-hidden="true">');
  const W1 = s.indexOf('  </div>\n  </div>', W0);
  if (W0 === -1 || W1 === -1) fail(file + ' / toc-wrap');
  const WEND = W1 + '  </div>\n  </div>'.length;
  s = s.slice(0, W0) + s.slice(WEND);
  const bar =
    '<nav class="chap-bar" aria-label="Cuprins">\n' +
    '  <div class="chap-bar-row" id="toc-row">\n' +
    '    <a href="#acasa" data-sec="acasa" class="toc-link">Acasă</a>\n' +
    '    <a href="#sec-origini" data-sec="sec-origini" class="toc-link"><i>01</i>Origini</a>\n' +
    '    <a href="#sec-cronologie" data-sec="sec-cronologie" class="toc-link"><i>02</i>Cronologie</a>\n' +
    '    <a href="#sec-migratie" data-sec="sec-migratie" class="toc-link"><i>03</i>Marea Migrație</a>\n' +
    '    <a href="#sec-atlas" data-sec="sec-atlas" class="toc-link"><i>04</i>Atlas</a>\n' +
    '    <a href="#sec-personalitati" data-sec="sec-personalitati" class="toc-link"><i>05</i>Personalități</a>\n' +
    '    <a href="#sec-muzeu" data-sec="sec-muzeu" class="toc-link"><i>06</i>Muzeu</a>\n' +
    '    <a href="#sec-mituri" data-sec="sec-mituri" class="toc-link"><i>07</i>Mit vs. adevăr</a>\n' +
    '    <a href="#biblio" data-sec="biblio" class="toc-link"><i>08</i>Bibliografie</a>\n' +
    '  </div>\n</nav>\n\n';
  rep('<div class="page-shell">', bar + '<div class="page-shell">', 'toc bar');

  // ---- 5. CSS ----
  const css = `
  /* Acasă: cuprins orizontal, lipit sub meniul de sus */
  .chap-bar{ position: sticky; top: var(--nav-h, 41px); z-index: 150; background: rgba(18,18,20,0.94); backdrop-filter: blur(6px); border-bottom: 1px solid var(--line-strong); }
  .chap-bar-row{ display: flex; gap: 4px; overflow-x: auto; max-width: 1240px; margin: 0 auto; padding: 0 14px; scrollbar-width: none; }
  .chap-bar-row::-webkit-scrollbar{ display: none; }
  .chap-bar a{ flex: none; display: inline-flex; align-items: baseline; gap: 7px; padding: 12px 12px 11px; text-decoration: none; white-space: nowrap;
    font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-dim);
    border-bottom: 2px solid transparent; transition: color 0.2s, border-color 0.2s; }
  .chap-bar a i{ font-style: normal; color: var(--accent-2); opacity: 0.8; }
  .chap-bar a:hover{ color: var(--ink); }
  .chap-bar a.active{ color: #f2d474; border-bottom-color: #e5c158; }
  .page-shell, .page-shell:not(#x){ display: block; max-width: 1240px; grid-template-columns: none; gap: 0; padding-inline: clamp(18px, 4vw, 56px); }
  .page-shell .main-col{ max-width: none; }
  article section{ scroll-margin-top: 100px; }
  @media (min-width: 1700px){ .page-shell{ max-width: 1520px; } .chap-bar-row{ max-width: 1520px; } }
  /* Muzeul și mitul ca capitole în articol */
  .m-lab.lab-in-article{ background: transparent; padding: 0; color: inherit; }
  .lab-in-article .wrap{ max-width: none; padding: 0; margin: 0; }
  .lab-in-article .module{ margin-top: 18px; }
`;
  const marker = '  /* ============ MODULE: CAMPANIA HUNILOR (.m-game) ============ */';
  rep(marker, css + '\n' + marker, 'css marker');

  // keep --nav-h in sync with the real height of the top bar
  rep("  var PAGE_IDS = ['page-acasa', 'mod-game', 'mod-embassy'];",
      "  function syncNavH(){ var n = document.querySelector('.site-nav'); if (n) document.documentElement.style.setProperty('--nav-h', n.offsetHeight + 'px'); }\n  syncNavH(); window.addEventListener('resize', syncNavH);\n  var PAGE_IDS = ['page-acasa', 'mod-game', 'mod-embassy'];", 'nav height sync');

  fs.writeFileSync(p, s);
  console.log(file + ': muzeu + mituri în Acasă, cuprins orizontal');
}
patch('index.html');
patch('atelierul-hunilor.html');
