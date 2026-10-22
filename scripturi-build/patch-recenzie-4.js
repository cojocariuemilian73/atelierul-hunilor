// A patra recenzie: auriul pentru tot ce e structură și interacțiune (roșul rămâne doar pentru huni),
// textele lungi fără monospace, Atlasul cu un singur chenar fin, teancul de mituri mai simplu, pe telefon
// rândul din deschidere fără separatoare și ținte de atins mai mari; „Pe scurt” la capitolele lungi, cu
// timpul de citire; după fiecare capitol, „↑ Cuprins” și capitolul următor; bife la capitolele citite și la
// jocurile terminate; un cursor de hartă pe hărți și în joc; lista de surse nu mai apare de două ori.
// Folosire: node scripturi-build/patch-recenzie-4.js (se poate rula de mai multe ori; după patch-recenzie-3.js)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

// rezumatele: doar ce spune capitolul, pe scurt
const SHORT = {
  'sec-origini': 'Numele „huni” apare la Ptolemeu (sec. II) și la Ammianus (c. 390), dar în locuri diferite. Legătura cu Xiongnu din China e probabilă pentru câțiva indivizi, după genetică, însă nedovedită pentru elita hunică. Despre viața lor știm mai ales din autori romani, care trebuie citiți cu grijă; arheologia confirmă arcul compozit, cazanele și mormintele de călăreți.',
  'sec-migratie': 'Din 375, hunii împing popoarele unele în altele și spre granițele Romei: un „efect de domino” pe care unii istorici îl contestă. Hunii se așază în Câmpia Panonică, lovesc Balcanii (441–447) și primesc un tribut care ajunge la 2.100 de livre de aur pe an, apoi atacă Galia (451) și Italia (452).',
  'sec-personalitati': 'Attila și Aetius, generalul care îl oprește la Câmpiile Catalaunice (451), mor la un an unul după altul (453 și 454). După bătălia de la Nedao, puterea hunică se destramă, iar în 476 cade Imperiul de Apus. Pe teritoriul României, epoca a lăsat tezaurele de la Pietroasa și Șimleul Silvaniei și diadema de la Gherăseni.'
};

// cursorul de hartă: un inel auriu cu un punct, desenat în SVG
const CUR = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Ccircle cx='14' cy='14' r='8.5' fill='none' stroke='%23121214' stroke-width='3.5'/%3E%3Ccircle cx='14' cy='14' r='8.5' fill='none' stroke='%23e5c158' stroke-width='1.6'/%3E%3Cpath d='M14 1v6M14 21v6M1 14h6M21 14h6' stroke='%23e5c158' stroke-width='1.6'/%3E%3Ccircle cx='14' cy='14' r='1.8' fill='%23f2d474'/%3E%3C/svg%3E\") 14 14, crosshair";

const CSS = `  /* r4: a patra recenzie */
  /* culorile: auriul pentru structură și interacțiune; roșul rămâne doar pentru huni și Attila */
  :root[data-theme="dark"]{ --accent: #e5c158; }
  .duel-card.attila h4, .dl-row.attila b{ color: #e0626c; }
  h3.sub-title{ color: #f3e3c3; }
  .sec-sub{ color: #cbbda4; }
  /* monospace doar pentru cifre, ani și etichete scurte; textele lungi în fontul de citit */
  .fig-map figcaption, .diagram figcaption, figure.mx-ev figcaption, .refs-note, .map-hint, .mig-note, .m-atlas .map-credit, .m-atlas .map-swipe-hint, .m-lab .artifact-credit, .m-lab .viewer-hint, .m-lab .mp-text, .byline{ font-family: 'Source Serif 4', Georgia, serif !important; letter-spacing: 0 !important; }
  .fig-map figcaption, .diagram figcaption{ font-size: 0.88rem; line-height: 1.55; }
  .m-lab .artifact-credit{ font-size: 0.78rem; }
  .m-lab .artifact-kind{ font: 700 0.76rem 'Source Serif 4', Georgia, serif !important; letter-spacing: 0.06em; color: var(--accent-2); }
  /* Atlasul în stilul articolului: un singur chenar fin, fără insigna roșie */
  #sec-atlas{ margin-top: 56px; }
  .m-atlas .frame{ border: 1px solid var(--line-strong); background: transparent; }
  .m-atlas .frame::before{ display: none; }
  .m-atlas .legend-box, .m-atlas .modal-card{ border: 1px solid var(--line-strong); }
  .m-atlas .year-badge{ background: #e5c158; color: #17140e; }
  .m-atlas .eyebrow, .m-atlas .panel-label, .m-atlas .modal-tag{ color: #e5c158; }
  .m-atlas .vt-btn.on{ border-color: #e5c158; }
  .m-atlas .time-slider::-webkit-slider-thumb{ background: #e5c158; }
  .m-atlas .time-slider::-moz-range-thumb{ background: #e5c158; }
  /* teancul de mituri: o singură foaie în spate */
  .mx-closed .mx-teaser{ box-shadow: 6px 6px 0 -1px var(--paper), 6px 6px 0 0 var(--line-strong); }
  /* „Pe scurt”, la începutul capitolelor lungi */
  .pe-scurt{ max-width: 760px; margin: -8px 0 30px; padding: 14px 18px; border-left: 2px solid #e5c158; background: rgba(229, 193, 88, 0.06); }
  .pe-scurt b{ display: flex; justify-content: space-between; gap: 12px; margin-bottom: 6px; font: 700 0.86rem 'Cinzel', Georgia, serif; letter-spacing: 0.06em; color: #f2d474; }
  .pe-scurt b small{ font: italic 400 0.84rem 'Source Serif 4', Georgia, serif; letter-spacing: 0; color: var(--ink-dim); }
  .pe-scurt p{ margin: 0 !important; font-size: 1rem; line-height: 1.6; color: #e6d7c3; }
  /* după fiecare capitol: înapoi la cuprins și capitolul următor */
  .ch-next{ display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 22px; margin: 2px 0 6px; }
  .ch-next a, .ch-next button{ display: inline-flex; align-items: center; min-height: 44px; padding: 0 6px; border: 0; background: none; color: var(--ink-dim); font: 600 0.9rem 'Source Serif 4', Georgia, serif; text-decoration: none; cursor: pointer; }
  .ch-next a:hover, .ch-next button:hover{ color: #f2d474; }
  .ch-next a:focus-visible, .ch-next button:focus-visible{ outline: 2px solid #f2d474; outline-offset: 2px; }
  .chap-bar.flash{ box-shadow: 0 0 0 2px rgba(229, 193, 88, 0.6); transition: box-shadow 0.4s; }
  /* bifele: capitolele citite și jocurile terminate */
  .chap-bar a.seen::after, .site-nav a.done .nav-long::after, .site-nav a.done .nav-short::after{ content: ' ✓'; color: #8fbd82; font-size: 0.85em; }
  /* cursorul de hartă */
  .mig-view canvas, .hx-map svg, .migr-map svg, .fig-invazii .hv-map{ cursor: ${CUR}; }
  /* pe telefon: rândul din deschidere fără separatoare, ținte de atins mai mari */
  @media (max-width: 620px){
    .byline span{ flex: 1 1 100%; padding-right: 0; margin-right: 0; border-right: 0; }
    .pe-scurt{ margin-top: 0; padding: 12px 14px; }
    .pe-scurt b{ flex-direction: column; gap: 2px; }
  }
  @media (pointer: coarse){
    .chap-bar a{ display: inline-flex; align-items: center; min-height: 44px; }
    .cap-i{ position: relative; } .cap-i::after{ content: ''; position: absolute; inset: -11px; }
    .mig-solo, .gs-nav button, .mx-btn, .mx-more, .mx-open, .site-pager-btn, .ab-tabs button, .mig-link, .md-btn{ min-height: 44px; }
    sup.fn{ padding: 0 3px; }
    .m-lab .hotspot::after{ content: ''; position: absolute; inset: -13px; border-radius: 50%; }
  }
  /* /r4 */
`;

const JS = `<script>
/* r4: bife la capitolele citite și la jocuri, „↑ Cuprins” și capitolul următor după fiecare capitol */
(function(){
  function get(k){ try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v){ try { localStorage.setItem(k, v); } catch (e) {} }
  var bar = document.querySelector('.chap-bar'), links = bar ? Array.prototype.slice.call(bar.querySelectorAll('a[data-sec]')) : [];
  // 1. capitolele citite: bifă în cuprins, iar la mouse, timpul de citire
  var seen = []; try { seen = JSON.parse(get('ah-citit') || '[]'); } catch (e) {}
  var secs = links.map(function(a){ return document.getElementById(a.getAttribute('data-sec')); });
  links.forEach(function(a, k){
    var s = secs[k]; if (!s || a.getAttribute('data-sec') === 'acasa') return;
    // același timp ca în caseta „Pe scurt”, unde există
    var ps = s.querySelector('.pe-scurt small'), m = ps ? parseInt(ps.textContent.replace(/[^0-9]+/, ''), 10) : Math.max(1, Math.round((s.textContent || '').split(/\\s+/).length / 200));
    a.title = 'Cam ' + m + (m === 1 ? ' minut' : ' minute') + ' de citit';
    if (seen.indexOf(s.id) >= 0) a.classList.add('seen');
  });
  var raf = 0;
  window.addEventListener('scroll', function(){
    if (raf) return;
    raf = requestAnimationFrame(function(){
      raf = 0;
      secs.forEach(function(s, k){
        if (!s || !s.offsetHeight || seen.indexOf(s.id) >= 0 || links[k].getAttribute('data-sec') === 'acasa') return;
        var r = s.getBoundingClientRect();
        if (r.top < 0 && r.bottom < window.innerHeight * 0.9) { seen.push(s.id); set('ah-citit', JSON.stringify(seen)); links[k].classList.add('seen'); }
      });
    });
  }, { passive: true });

  // 2. după fiecare capitol: „↑ Cuprins” (aduce bara de capitole) și capitolul următor
  Array.prototype.forEach.call(document.querySelectorAll('.ch-orn'), function(o){
    var nx = o.nextElementSibling, id = nx && nx.id, a = links.filter(function(l){ return l.getAttribute('data-sec') === id; })[0];
    if (!a || o.nextElementSibling.classList.contains('ch-next')) return;
    var p = document.createElement('p'); p.className = 'ch-next';
    p.innerHTML = '<button type="button" class="ch-up">↑ Cuprins</button><a href="#' + id + '">Următorul: ' + a.textContent.replace(/^(\\d+)/, '$1 ') + ' →</a>';
    o.insertAdjacentElement('afterend', p);
  });
  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('.ch-up'); if (!b || !bar) return;
    bar.classList.remove('chap-hide'); bar.classList.add('flash');
    setTimeout(function(){ bar.classList.remove('flash'); }, 900);
    var act = bar.querySelector('a.active') || links[0]; if (act) act.focus({ preventScroll: true });
  });

  // 3. jocurile terminate: bifă în meniul de sus
  function marks(){
    var joc = document.querySelector('.site-nav a[href="#mod-migratie"]'), masa = document.querySelector('.site-nav a[href="#mod-atelier"]');
    if (joc) { joc.classList.toggle('done', !!get('ah-joc')); if (get('ah-joc')) joc.title = 'Ai terminat jocul'; }
    if (masa) { masa.classList.toggle('done', !!get('ah-masa')); if (get('ah-masa')) masa.title = 'Ai terminat Masa istoricului: ' + get('ah-masa'); }
  }
  marks();
  document.addEventListener('ah-progres', marks);
  window.addEventListener('storage', marks);
})();
</script>
`;

for (const rel of ['index.html', 'atelierul-hunilor.html']) {
  const f = path.join(root, rel);
  const raw = fs.readFileSync(f, 'utf8'), crlf = raw.includes('\r\n');
  let s = raw.split('\r\n').join('\n');
  const fail = m => { console.error(rel + ': ' + m); process.exit(1); };

  // 1. „Pe scurt”, cu timpul de citire al capitolului
  s = s.replace(/ {6}<div class="pe-scurt">[^\n]*\n/g, '');
  Object.keys(SHORT).forEach(id => {
    const a = s.indexOf('<section id="' + id + '"'); if (a < 0) fail(id);
    const end = s.indexOf('</section>', a);
    const words = s.slice(a, end).replace(/<script[\s\S]*?<\/script>/g, '').replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    const min = Math.max(1, Math.round(words / 200));
    const sub = s.indexOf('<p class="sec-sub">', a); if (sub < 0 || sub > end) fail('subtitlul din ' + id);
    const at = s.indexOf('</p>\n', sub) + '</p>\n'.length;
    s = s.slice(0, at) + '      <div class="pe-scurt"><b>Pe scurt <small>cam ' + min + ' minute de citit</small></b><p>' + SHORT[id] + '</p></div>\n' + s.slice(at);
  });

  // 2. lista de surse de la sfârșitul articolului apărea de două ori: rămâne cea din subsolul site-ului
  s = s.replace(/\n {2}<footer>\n {4}Material realizat individual pentru Concursul[\s\S]*?<\/footer>\n/, '\n');
  // subsolul rămas din varianta separată a Atlasului
  s = s.replace(/\n {2}<footer>Componentă de hartă istorică[^\n]*<\/footer>\n/, '\n');

  // 3. cifrele scrise în pagină (înainte să pornească scriptul): 3 pagini
  s = s.replace('<span class="site-pager-count mono" id="site-page-count">1 / 4</span>', '<span class="site-pager-count mono" id="site-page-count">1 / 3</span>');

  // 4. numele proiectului, deasupra titlului articolului
  s = s.replace('<p class="kicker">Concursul Național „Istorie și societate în dimensiune virtuală”</p>', '<p class="kicker">Atelierul Hunilor · Concursul Național „Istorie și societate în dimensiune virtuală”</p>');

  // 5. stilurile și scriptul
  const c0 = s.indexOf('  /* r4: a patra recenzie */');
  if (c0 >= 0) { const e = '  /* /r4 */\n'; s = s.slice(0, c0) + s.slice(s.indexOf(e, c0) + e.length); }
  const st = s.lastIndexOf('</style>'); if (st < 0) fail('</style>');
  s = s.slice(0, st) + CSS + s.slice(st);
  const j0 = s.indexOf('<script>\n/* r4: bife');
  if (j0 >= 0) s = s.slice(0, j0) + s.slice(s.indexOf('</script>\n', j0) + '</script>\n'.length);
  const b = s.lastIndexOf('</body>'); if (b < 0) fail('</body>');
  s = s.slice(0, b) + JS + s.slice(b);

  fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
  console.log(rel + ': a patra recenzie');
}
