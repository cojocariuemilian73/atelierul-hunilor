// „Mit vs. adevăr” nu mai e un capitol separat cu carduri întoarse: fiecare mit apare
// în capitolul de care ține, ca un rând lat. Mitul se taie cu o linie, iar dedesubt se
// deschide ce arată sursele. Bibliografia devine capitolul 07.
// Folosire: node scripturi-build/patch-mituri-in-pagina.js (se poate rula de mai multe ori)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

// indici în MYTHS (de la 0)
const GROUPS = [
  { sec: 'sec-origini', ids: [0, 1, 3, 13], title: 'Mituri despre originea hunilor' },
  { sec: 'sec-migratie', ids: [4, 10, 11, 14], title: 'Mituri despre migrație și aur' },
  { sec: 'sec-personalitati', ids: [7, 8], title: 'Mituri despre Attila' },
  { sec: 'sec-muzeu', ids: [2, 5, 6, 9, 12], title: 'Mituri despre arme și morminte' }
];

const JS = `  // mx: miturile, puse în capitolele de care țin; faptele puțin cunoscute apar ca „Știai că…?”
  function renderMythGroup(host){
    var all = host.getAttribute('data-myths').split(',').map(Number), done = 0;
    var ids = all.filter(function(i){ return !MYTHS[i].fact; }), facts = all.filter(function(i){ return MYTHS[i].fact; });
    var head = document.createElement('div');
    head.className = 'mx-head';
    head.innerHTML = '<h3 class="mx-title">' + host.getAttribute('data-title') + '</h3>' +
      '<p class="mx-count"><b>0</b> din ' + ids.length + ' verificate</p>' +
      '<button type="button" class="mx-all">Verifică toate</button>';
    host.appendChild(head);
    var countEl = head.querySelector('b'), allBtn = head.querySelector('.mx-all');
    function src(m){ return m.src ? '<p class="mx-src">Sursa: ' + m.src + '</p>' : ''; }
    var items = ids.map(function(i){
      var m = MYTHS[i], key = MYTH_THEMES[i] || 'izv', th = THEME[key] || THEME.izv, id = 'mx-a-' + i;
      var it = document.createElement('article');
      it.className = 'mx-item theme-' + key;
      it.innerHTML =
        '<div class="mx-q"><p class="mx-meta"><span class="mx-mit">Mit</span><span class="mx-cat">' + svgIcon(th.icon) + th.label + '</span></p>' +
        '<p class="mx-myth"><span>' + m.myth + '</span></p></div>' +
        '<button type="button" class="mx-btn" aria-expanded="false" aria-controls="' + id + '">Verifică</button>' +
        '<div class="mx-a" id="' + id + '" role="region" aria-label="Ce arată sursele"><div><p class="mx-lab">Ce arată sursele</p><p class="mx-truth">' + m.truth + '</p>' + src(m) + '</div></div>';
      var btn = it.querySelector('.mx-btn'), seen = false;
      it._set = function(on){
        it.classList.toggle('open', on);
        btn.setAttribute('aria-expanded', on ? 'true' : 'false');
        btn.textContent = on ? 'Ascunde' : 'Verifică';
        if (on && !seen) { seen = true; done++; countEl.textContent = done; head.classList.toggle('all', done === ids.length); }
      };
      btn.addEventListener('click', function(){ it._set(!it.classList.contains('open')); });
      host.appendChild(it);
      return it;
    });
    if (facts.length) {
      var box = document.createElement('div');
      box.className = 'mx-facts';
      box.innerHTML = facts.map(function(i){
        var m = MYTHS[i], key = MYTH_THEMES[i] || 'izv', th = THEME[key] || THEME.izv;
        return '<article class="mx-fact theme-' + key + '"><p class="mx-meta"><span class="mx-stiai">Știai că…?</span><span class="mx-cat">' + svgIcon(th.icon) + th.label + '</span></p>' +
          '<h4>' + m.fact.replace(/^Știai că /, '').replace(/^./, function(c){ return c.toUpperCase(); }) + '</h4><p class="mx-truth">' + m.truth + '</p>' + src(m) + '</article>';
      }).join('');
      host.appendChild(box);
    }
    allBtn.addEventListener('click', function(){
      var any = items.some(function(x){ return !x.classList.contains('open'); });
      items.forEach(function(x, k){ setTimeout(function(){ x._set(any); }, any ? k * 90 : 0); });
      allBtn.textContent = any ? 'Ascunde toate' : 'Verifică toate';
    });
  }

  function initMythModule(){
    Array.prototype.forEach.call(document.querySelectorAll('.mx[data-myths]'), renderMythGroup);
  }

`;

const CSS = `  /* mx: mituri în capitole */
  .mx{ margin: 34px 0 8px; border-top: 1px solid var(--line-strong); }
  .mx-head{ display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 18px; padding: 18px 0 6px; }
  .mx-title{ margin: 0; font: 600 1.45rem/1.2 'Cormorant Garamond', serif; color: var(--ink); }
  .mx-count{ margin: 0; font: 0.74rem 'JetBrains Mono', monospace; color: var(--ink-dim); font-variant-numeric: tabular-nums; }
  .mx-count b{ color: var(--accent-2); }
  .mx-head.all .mx-count{ color: var(--accent-2); }
  .mx-all{ margin-left: auto; min-height: 36px; padding: 7px 14px; border: 1px solid var(--line-strong); background: transparent; color: var(--ink); font: 700 0.74rem 'JetBrains Mono', monospace; cursor: pointer; transition: border-color 0.2s, color 0.2s; }
  .mx-all:hover{ border-color: var(--accent-2); color: var(--accent-2); }
  .mx-item{ --c: #c08a4a; display: grid; grid-template-columns: minmax(0, 1fr) auto; column-gap: 24px; align-items: center; padding: 18px 0; border-bottom: 1px solid var(--line); }
  .mx-item.theme-gen{ --c: #6fb0ba; } .mx-item.theme-izv{ --c: #d39a58; } .mx-item.theme-arh{ --c: #ad8fcb; } .mx-item.theme-ori{ --c: #d4b03c; }
  .mx-item.theme-arm{ --c: #e0707a; } .mx-item.theme-att{ --c: #e5c158; } .mx-item.theme-aur{ --c: #e5c158; }
  .mx-meta{ display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; margin: 0 0 8px; font: 700 0.68rem 'JetBrains Mono', monospace; letter-spacing: 0.08em; text-transform: uppercase; }
  .mx-mit{ padding: 2px 8px; border: 1px solid #e0626c; color: #f0a0a6; transition: border-color 0.3s, color 0.3s; }
  .mx-item.open .mx-mit{ border-color: var(--line-strong); color: var(--ink-dim); }
  .mx-cat{ display: inline-flex; align-items: center; gap: 6px; color: var(--c); }
  .mx-cat svg{ width: 15px; height: 15px; }
  .mx-myth{ margin: 0; font: italic 1.22rem/1.45 'Source Serif 4', Georgia, serif; color: var(--ink); max-width: 68ch; }
  .mx-myth span{ background: linear-gradient(#e0626c, #e0626c) no-repeat 0 58% / 0 2px; transition: background-size 0.6s cubic-bezier(.16,1,.3,1), color 0.4s; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
  .mx-item.open .mx-myth span{ background-size: 100% 2px; color: var(--ink-dim); }
  .mx-btn{ min-width: 112px; min-height: 42px; padding: 10px 18px; border: 1px solid var(--accent-2); background: var(--accent-2); color: var(--paper); font: 700 0.86rem 'Cinzel', serif; cursor: pointer; transition: background 0.2s, color 0.2s; }
  .mx-btn:hover{ background: #f2d474; }
  .mx-item.open .mx-btn{ background: transparent; color: var(--accent-2); }
  .mx-btn:focus-visible, .mx-all:focus-visible{ outline: 2px solid var(--accent-2); outline-offset: 3px; }
  .mx-a{ grid-column: 1 / -1; display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.5s cubic-bezier(.16,1,.3,1); }
  .mx-a > div{ overflow: hidden; }
  .mx-item.open .mx-a{ grid-template-rows: 1fr; }
  .mx-lab{ margin: 14px 0 6px; font: 700 0.68rem 'JetBrains Mono', monospace; letter-spacing: 0.08em; text-transform: uppercase; color: #8fbd82; }
  .mx-truth{ margin: 0; padding: 0 0 4px; line-height: 1.7; color: var(--ink); max-width: 72ch; }
  .mx-src{ margin: 8px 0 0; font: 0.72rem/1.5 'JetBrains Mono', monospace; color: var(--ink-dim); }
  .mx-facts{ display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 14px; margin: 18px 0 0; }
  .mx-fact{ --c: #c08a4a; padding: 14px 16px; border: 1px solid var(--line-strong); background: color-mix(in srgb, var(--ink) 3%, transparent); }
  .mx-fact.theme-gen{ --c: #6fb0ba; } .mx-fact.theme-izv{ --c: #d39a58; } .mx-fact.theme-arh{ --c: #ad8fcb; } .mx-fact.theme-ori{ --c: #d4b03c; } .mx-fact.theme-arm{ --c: #e0707a; } .mx-fact.theme-att, .mx-fact.theme-aur{ --c: #e5c158; }
  .mx-fact h4{ margin: 0 0 6px; font: 600 1.2rem/1.3 'Cormorant Garamond', serif; color: var(--ink); text-wrap: balance; }
  .mx-fact .mx-truth{ color: var(--ink-dim); font-size: 0.95rem; line-height: 1.6; }
  .mx-stiai{ padding: 2px 8px; border: 1px solid #8fbd82; color: #a9d39c; }
  @media (max-width: 640px){
    .mx-item{ grid-template-columns: 1fr; row-gap: 12px; }
    .mx-btn{ justify-self: start; }
    .mx-myth{ font-size: 1.08rem; }
    .mx-all{ margin-left: 0; }
  }
  @media (prefers-reduced-motion: reduce){ .mx-myth span, .mx-a, .mx-mit{ transition: none; } }
  /* /mx */
`;

for (const rel of ['index.html', 'atelierul-hunilor.html']) {
  const f = path.join(root, rel);
  const raw = fs.readFileSync(f, 'utf8');
  const crlf = raw.includes('\r\n');
  let s = raw.split('\r\n').join('\n');
  const fail = m => { console.error(rel + ': ' + m); process.exit(1); };

  // 1. grupurile de mituri, la sfârșitul capitolelor
  s = s.replace(/\n      <div class="mx" data-myths="[^"]*" data-title="[^"]*"><\/div>/g, '');
  for (const g of GROUPS) {
    const a = s.indexOf('<section id="' + g.sec + '"');
    if (a < 0) fail(g.sec);
    const end = s.indexOf('\n    </section>', a);
    s = s.slice(0, end) + '\n      <div class="mx" data-myths="' + g.ids.join(',') + '" data-title="' + g.title + '"></div>' + s.slice(end);
  }

  // 2. capitolul separat dispare (numerotarea Bibliografiei o face splice-glosar.js)
  const m0 = s.indexOf('    <section id="sec-mituri"');
  if (m0 >= 0) { const m1 = s.indexOf('\n    </section>\n', m0) + '\n    </section>\n'.length; s = s.slice(0, m0) + s.slice(m1); }
  s = s.replace(/\n    <a href="#sec-mituri" data-sec="sec-mituri" class="toc-link"><i>07<\/i>Mit vs\. adevăr<\/a>/, '');

  // 3. scriptul: în locul cardurilor întoarse
  let j0 = s.indexOf('  function renderFlipCard(');
  if (j0 < 0) j0 = s.indexOf('  // mx: miturile, puse în capitolele de care țin');
  const j1 = s.indexOf('  // ============================================================\n  // Pornire', j0);
  if (j0 < 0 || j1 < 0) fail('script mituri');
  s = s.slice(0, j0) + JS + s.slice(j1);

  // 4. stiluri
  const c0 = s.indexOf('  /* mx: mituri în capitole */');
  if (c0 >= 0) { const e = '  /* /mx */\n'; s = s.slice(0, c0) + CSS + s.slice(s.indexOf(e, c0) + e.length); }
  else { const at = s.indexOf('  .sec-sub{'); if (at < 0) fail('CSS'); s = s.slice(0, at) + CSS + s.slice(at); }

  fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
  console.log(rel + ': miturile sunt în capitole');
}

// pagina separată a muzeului păstrează cardurile: fața nu mai trece prin spate
const lab = path.join(root, 'module-individuale/laborator-muzeu.html');
let L = fs.readFileSync(lab, 'utf8');
if (!L.includes('/* fix: fața cardului întors */')) {
  L = L.replace('</style>', '  /* fix: fața cardului întors */\n  .flip-card.flipped .flip-front{ visibility: hidden; transition: visibility 0s 0.35s; }\n  .flip-card .flip-front{ transition: visibility 0s 0.35s; }\n</style>');
  fs.writeFileSync(lab, L);
  console.log('laborator-muzeu: cardurile întoarse reparate');
}
