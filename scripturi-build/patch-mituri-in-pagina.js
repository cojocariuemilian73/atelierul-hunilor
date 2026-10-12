// „Mit vs. adevăr” nu mai e un capitol separat cu carduri întoarse: fiecare mit apare
// în capitolul de care ține, ca un card cu două fețe: mitul în stânga, iar la „Verifică”
// apar ștampila „Fals” și, în dreapta, ce arată sursele.
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
  // Mitul e un card cu două fețe: în stânga afirmația, în dreapta ce arată sursele.
  var MX_X = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  function mxSrc(m){
    if (!m.src) return '';
    return '<p class="mx-src">Sursa: ' + m.src.replace(/nota (\\d+)/g, '<a class="mx-note" href="#note-$1">nota $1</a>') + '</p>';
  }
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
    var items = ids.map(function(i){
      var m = MYTHS[i], th = THEME[MYTH_THEMES[i]] || THEME.izv, id = 'mx-a-' + i;
      var it = document.createElement('article');
      it.className = 'mx-item';
      it.innerHTML =
        '<div class="mx-q"><p class="mx-meta"><span class="mx-tag">Mit</span><span class="mx-theme">' + th.label + '</span></p>' +
        '<p class="mx-myth">' + m.myth + '</p><span class="mx-stamp" aria-hidden="true">Fals</span></div>' +
        '<button type="button" class="mx-btn" aria-expanded="false" aria-controls="' + id + '">Verifică</button>' +
        '<div class="mx-a" id="' + id + '" role="region" aria-label="Ce arată sursele"><p class="mx-meta"><span class="mx-theme">Ce arată sursele</span></p>' +
        '<p class="mx-truth">' + m.truth + '</p>' + mxSrc(m) + '</div>' +
        '<button type="button" class="mx-x" aria-label="Ascunde răspunsul">' + MX_X + '</button>';
      var btn = it.querySelector('.mx-btn'), x = it.querySelector('.mx-x'), seen = false;
      it._set = function(on, focus){
        it.classList.toggle('open', on);
        btn.setAttribute('aria-expanded', on ? 'true' : 'false');
        if (focus) (on ? x : btn).focus();
        if (on && !seen) { seen = true; done++; countEl.textContent = done; head.classList.toggle('all', done === ids.length); }
      };
      btn.addEventListener('click', function(){ it._set(true, true); });
      x.addEventListener('click', function(){ it._set(false, true); });
      host.appendChild(it);
      return it;
    });
    if (facts.length) {
      var box = document.createElement('div');
      box.className = 'mx-facts';
      box.innerHTML = facts.map(function(i){
        var m = MYTHS[i], th = THEME[MYTH_THEMES[i]] || THEME.izv, id = 'mx-f-' + i;
        return '<article class="mx-fact"><p class="mx-meta"><span class="mx-tag stiai">Știai că…?</span><span class="mx-theme">' + th.label + '</span></p>' +
          '<p class="mx-num">' + m.num.replace(/^[\\d.,\\/]+/, '<b>$&</b>') + '</p><p class="mx-lead">' + m.lead + '</p>' +
          '<div class="mx-more-body" id="' + id + '"><div><p class="mx-truth">' + m.truth + '</p></div></div>' +
          '<button type="button" class="mx-more" aria-expanded="false" aria-controls="' + id + '">Citește mai mult</button>' + mxSrc(m) + '</article>';
      }).join('');
      box.addEventListener('click', function(ev){
        var b = ev.target.closest('.mx-more');
        if (!b) return;
        var on = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', on ? 'true' : 'false');
        b.textContent = on ? 'Citește mai puțin' : 'Citește mai mult';
        b.closest('.mx-fact').classList.toggle('open', on);
      });
      host.appendChild(box);
    }
    allBtn.addEventListener('click', function(){
      var any = items.some(function(x){ return !x.classList.contains('open'); });
      items.forEach(function(x, k){ setTimeout(function(){ x._set(any, false); }, any ? k * 90 : 0); });
      allBtn.textContent = any ? 'Ascunde toate' : 'Verifică toate';
    });
  }

  function initMythModule(){
    Array.prototype.forEach.call(document.querySelectorAll('.mx[data-myths]'), renderMythGroup);
    // „nota N” din surse: derulează la notă și o luminează scurt, fără să schimbe pagina
    document.addEventListener('click', function(ev){
      var a = ev.target.closest('.mx-note');
      if (!a) return;
      var li = document.querySelector(a.getAttribute('href'));
      if (!li) return;
      ev.preventDefault();
      li.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
      li.classList.remove('mx-flash'); void li.offsetWidth; li.classList.add('mx-flash');
    });
  }

`;

const CSS = `  /* mx: mituri în capitole */
  h1, h2, h3, h4{ font-variant-numeric: lining-nums; }
  .mx{ margin: 34px 0 8px; border-top: 1px solid var(--line-strong); }
  .mx-head{ display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 18px; padding: 18px 0 6px; }
  .mx-title{ margin: 0; font: 600 1.45rem/1.2 'Cormorant Garamond', serif; color: var(--ink); }
  .mx-count{ margin: 0; font: 0.74rem 'JetBrains Mono', monospace; color: var(--ink-dim); font-variant-numeric: tabular-nums; }
  .mx-count b{ color: var(--accent-2); }
  .mx-head.all .mx-count{ color: var(--accent-2); }
  .mx-all{ margin-left: auto; min-height: 36px; padding: 7px 14px; border: 1px solid var(--line-strong); background: transparent; color: var(--ink); font: 700 0.74rem 'JetBrains Mono', monospace; cursor: pointer; transition: border-color 0.2s, color 0.2s; }
  .mx-all:hover{ border-color: var(--accent-2); color: var(--accent-2); }

  /* un singur sistem de etichete: tipul cardului are chenar, tema e doar text mic */
  .mx-meta{ display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; margin: 0 0 10px; font: 700 0.68rem 'JetBrains Mono', monospace; letter-spacing: 0.08em; text-transform: uppercase; }
  .mx-tag{ padding: 2px 8px; border: 1px solid #e0626c; color: #f0a0a6; }
  .mx-tag.stiai{ border-color: var(--accent-2); color: var(--accent-2); }
  .mx-theme{ color: var(--ink-dim); }

  .mx-item{ position: relative; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 18px 32px; align-items: center; margin: 12px 0 0; padding: 22px 24px; border: 1px solid var(--line-strong); background: color-mix(in srgb, var(--ink) 3%, transparent); }
  .mx-item.open{ grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); align-items: start; padding-right: 52px; }
  .mx-q{ position: relative; min-width: 0; }
  .mx-myth{ margin: 0; font: 600 1.42rem/1.32 'Cormorant Garamond', serif; color: var(--ink); font-variant-numeric: lining-nums; max-width: 46ch; text-wrap: pretty; }
  .mx-stamp{ position: absolute; right: 4px; bottom: -14px; padding: 1px 12px; border: 3px double #e0626c; color: #e0626c; font: 800 1.15rem/1.3 'Cinzel', serif; letter-spacing: 0.12em; text-transform: uppercase; background: color-mix(in srgb, var(--paper) 75%, transparent); opacity: 0; transform: rotate(-9deg) scale(1.7); pointer-events: none; transition: opacity 0.2s, transform 0.35s cubic-bezier(.3,1.6,.5,1); }
  .mx-item.open .mx-stamp{ opacity: 0.92; transform: rotate(-9deg) scale(1); }
  .mx-item.open .mx-q{ padding-bottom: 22px; }
  .mx-btn{ min-width: 112px; min-height: 42px; padding: 10px 18px; border: 1px solid var(--accent-2); background: var(--accent-2); color: var(--paper); font: 700 0.86rem 'Cinzel', serif; cursor: pointer; transition: background 0.2s; }
  .mx-btn:hover{ background: #f2d474; }
  .mx-item.open .mx-btn{ display: none; }
  .mx-a{ display: none; min-width: 0; padding-left: 28px; border-left: 1px solid var(--line); }
  .mx-item.open .mx-a{ display: block; animation: mx-in 0.45s cubic-bezier(.16,1,.3,1) both; }
  @keyframes mx-in{ from{ opacity: 0; transform: translateX(12px); } }
  .mx-x{ position: absolute; top: 10px; right: 10px; display: none; place-items: center; width: 36px; height: 36px; padding: 0; border: 1px solid var(--line); background: transparent; color: var(--ink-dim); cursor: pointer; transition: color 0.2s, border-color 0.2s; }
  .mx-x svg{ width: 14px; height: 14px; }
  .mx-x:hover{ color: var(--ink); border-color: var(--line-strong); }
  .mx-item.open .mx-x{ display: grid; }
  .mx-truth{ margin: 0; line-height: 1.68; color: var(--ink); max-width: 64ch; }
  .mx-src{ margin: 12px 0 0; font: 0.72rem/1.5 'JetBrains Mono', monospace; color: var(--ink-dim); }
  .mx-note{ color: var(--accent-2); text-decoration: underline; text-underline-offset: 2px; }
  .mx-btn:focus-visible, .mx-all:focus-visible, .mx-x:focus-visible, .mx-more:focus-visible, .mx-note:focus-visible{ outline: 2px solid var(--accent-2); outline-offset: 3px; }
  .mx-flash{ animation: mx-flash 1.6s ease-out; }
  @keyframes mx-flash{ from{ background: color-mix(in srgb, var(--accent-2) 30%, transparent); } }

  /* „Știai că…?”: construite în jurul cifrei */
  .mx-facts{ display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 14px; margin: 18px 0 0; align-items: start; }
  .mx-fact{ display: flex; flex-direction: column; padding: 18px 18px 16px; border: 1px solid var(--line-strong); background: color-mix(in srgb, var(--ink) 3%, transparent); }
  .mx-num{ margin: 4px 0 6px; font: 700 1.5rem/1.1 'Cormorant Garamond', serif; color: var(--accent-2); font-variant-numeric: lining-nums; text-wrap: balance; }
  .mx-num b{ font: 700 2.5rem/1 'Cinzel', serif; letter-spacing: -0.01em; }
  .mx-lead{ margin: 0; font: 600 1.12rem/1.35 'Cormorant Garamond', serif; color: var(--ink); text-wrap: pretty; }
  .mx-more-body{ display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.4s cubic-bezier(.16,1,.3,1); }
  .mx-more-body > div{ overflow: hidden; }
  .mx-fact.open .mx-more-body{ grid-template-rows: 1fr; }
  .mx-fact .mx-truth{ padding-top: 12px; font-size: 0.95rem; line-height: 1.62; color: color-mix(in srgb, var(--ink) 88%, transparent); }
  .mx-more{ align-self: flex-start; margin: 12px 0 0; padding: 6px 0; min-height: 36px; border: 0; background: none; color: var(--accent-2); font: 700 0.74rem 'JetBrains Mono', monospace; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
  .mx-fact .mx-src{ margin-top: 6px; padding-top: 10px; border-top: 1px solid var(--line); }

  @media (max-width: 760px){
    .mx-item, .mx-item.open{ grid-template-columns: 1fr; padding: 18px 16px; }
    .mx-item.open{ padding-top: 18px; }
    .mx-item.open .mx-q{ padding-right: 40px; }
    .mx-btn{ justify-self: start; }
    .mx-myth{ font-size: 1.26rem; }
    .mx-a{ padding: 16px 0 0; border-left: 0; border-top: 1px solid var(--line); }
    .mx-all{ margin-left: 0; }
  }
  @media (prefers-reduced-motion: reduce){ .mx-stamp, .mx-more-body{ transition: none; } .mx-item.open .mx-a, .mx-flash{ animation: none; } }
  /* /mx */
`;

// datele miturilor: corecturi de conținut și cifra din fiecare „Știai că…?”
const DATA = [
  ["truth: 'Prețul se negocia și la nivel individual: Onegesius, unul dintre cei mai de încredere oameni ai lui Attila, a cerut 500 de solidi de aur doar",
   "truth: 'Pe lângă tributul de stat, prețul se negocia și pentru fiecare prizonier: Onegesius, unul dintre cei mai de încredere oameni ai lui Attila, a cerut 500 de solizi de aur doar"],
  ["truth: 'Dimpotrivă: aurul era prin excelență bunul împăratului.", "truth: 'Aurul era prin excelență bunul împăratului."],
  ["src: 'Ammianus Marcellinus, Res Gestae 31.2.9',", "src: 'Ammianus Marcellinus, Res Gestae 31.2.9 (nota 8)',"],
  ["src: 'Ammianus 31.2.6; Zosimus 4.20;", "src: 'Ammianus 31.2.6 (nota 8); Zosimus 4.20;"],
  [/src: 'Priscus, relatarea soliei din 449'/g, "src: 'Priscus, relatarea soliei din 449 (nota 11)'"],
  ["fact: 'Știai că sabia era și un semn al puterii?'", "fact: 'Știai că sabia era și un semn al puterii?', num: '„Sabia lui Marte”', lead: 'găsită de un păstor, îi arăta lui Attila dreptul de a domni'"],
  ["fact: 'Știai că hunii foloseau și vârfuri de săgeți din os?'", "fact: 'Știai că hunii foloseau și vârfuri de săgeți din os?', num: 'Săgeți cu vârf de os', lead: 'pe lângă cele de fier: un detaliu care l-a mirat pe Ammianus'"],
  ["fact: 'Știai că răscumpărarea unei singure familii costa 500 de solizi?'", "fact: 'Știai că răscumpărarea unei singure familii costa 500 de solizi?', num: '500 de solizi', lead: 'prețul cerut pentru o singură familie de prizonieri'"],
  ["fact: 'Știai că aurul tributului ajungea și la alți huni, nu doar la Attila?'", "fact: 'Știai că aurul tributului ajungea și la alți huni, nu doar la Attila?', num: '1.439 de solizi', lead: 'într-un singur tezaur, la Szikáncs, lângă Tisa: aur ajuns și la alți huni, nu doar la Attila'"],
  ["fact: 'Știai că armura hunilor e încă o întrebare deschisă?'", "fact: 'Știai că armura hunilor e încă o întrebare deschisă?', num: 'Puține armuri', lead: 's-au găsit în mormintele hunice; cât de des le purtau e încă discutat'"],
  ["fact: 'Știai că romanii credeau că hunii trăiesc călare?'", "fact: 'Știai că romanii credeau că hunii trăiesc călare?', num: 'Zi și noapte călare', lead: 'luptau, se sfătuiau, mâncau și dormeau pe cal, scriu Ammianus și Zosimus'"],
  ["fact: 'Știai că aurul Imperiului era controlat de împărat?'", "fact: 'Știai că aurul Imperiului era controlat de împărat?', num: '1/72 de livră', lead: 'greutatea fixă a solidului, moneda de aur controlată de împărat'"]
];

for (const rel of ['index.html', 'atelierul-hunilor.html']) {
  const f = path.join(root, rel);
  const raw = fs.readFileSync(f, 'utf8');
  const crlf = raw.includes('\r\n');
  let s = raw.split('\r\n').join('\n');
  const fail = m => { console.error(rel + ': ' + m); process.exit(1); };

  // 0. datele miturilor
  for (const [a, b] of DATA) {
    if (a instanceof RegExp) s = s.replace(a, b);
    else if (!s.includes(b)) { if (!s.includes(a)) fail('date: ' + a.slice(0, 60)); s = s.replace(a, b); }
  }

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
