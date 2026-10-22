// A treia recenzie, partea de site: legendele imaginilor rămân scurte (autorul și licența apar la „ⓘ”
// și sunt adunate toate în „Despre proiect”, la fila „Imaginile”), fereastra „Despre proiect” are trei file
// (Despre, Culisele proiectului, Imaginile), textul articolului respiră mai mult, iar pe telefon bara de
// capitole arată mereu capitolul curent.
// Folosire: node scripturi-build/patch-recenzie-3.js (se poate rula de mai multe ori; după patch-recenzie-design.js)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const CSS = `  /* r3: a treia recenzie */
  /* textul articolului: mai mult aer între paragrafe și înaintea subtitlurilor */
  article p{ margin-bottom: 1.25em; }
  h3.sub-title{ margin-top: 52px; }
  h3.sub-title::before{ content: ''; display: block; width: 34px; height: 2px; margin-bottom: 12px; background: linear-gradient(90deg, #e5c158, rgba(229, 193, 88, 0)); }
  .sr-text > p{ max-width: 68ch; }
  /* legendele: autorul și licența, la „ⓘ” */
  .cap-i{ display: inline-grid; place-items: center; width: 22px; height: 22px; margin-left: 4px; padding: 0; border: 1px solid rgba(229, 193, 88, 0.55); border-radius: 50%; background: none; color: #e5c158; font: italic 700 0.74rem Georgia, serif; vertical-align: 1px; cursor: pointer; }
  .cap-i:hover, .cap-i[aria-expanded="true"]{ background: rgba(229, 193, 88, 0.15); }
  .cap-i:focus-visible{ outline: 2px solid #f2d474; outline-offset: 2px; }
  .cap-cr{ display: block; margin-top: 4px; font-size: 0.92em; opacity: 0.85; }
  .cap-cr[hidden]{ display: none; }
  @media print{ .cap-i{ display: none; } .cap-cr[hidden]{ display: block !important; } }
  /* „Despre proiect”, pe file */
  .ab-tabs{ display: flex; flex-wrap: wrap; gap: 4px; margin: 4px 0 18px; border-bottom: 1px solid rgba(229, 193, 88, 0.3); }
  .ab-tabs button{ min-height: 40px; padding: 6px 14px; border: 0; border-bottom: 2px solid transparent; background: none; color: #b9a98e; font: 600 0.92rem 'Cinzel', Georgia, serif; letter-spacing: 0.04em; cursor: pointer; margin-bottom: -1px; }
  .ab-tabs button:hover{ color: #f6eddc; }
  .ab-tabs button[aria-selected="true"]{ color: #f2d474; border-bottom-color: #e5c158; }
  .ab-tabs button:focus-visible{ outline: 2px solid #f2d474; outline-offset: -2px; }
  .ab-panel[hidden]{ display: none; }
  .ab-panel > h3:first-child{ margin-top: 0; }
  .ab-credits{ margin: 6px 0 0; padding-left: 18px; font-size: 0.86rem; }
  .ab-credits li{ margin-bottom: 6px; color: #d9cbb2; }
  .ab-credits b{ color: #f6eddc; font-weight: 600; }
  /* /r3 */
`;

const JS = `<script>
/* r3: legendele scurte, „Despre proiect” pe file, capitolul curent în bara de pe telefon */
(function(){
  function each(sel, fn, el){ Array.prototype.forEach.call((el || document).querySelectorAll(sel), fn); }
  var credits = [];
  // 1. legendele: ultima propoziție cu autorul și licența trece în spatele unui buton „ⓘ”
  var KW = /(Domeniu public|domeniu public|domeniul public|CC0|CC BY|Wikimedia|Foto:)/g;
  var n = 0;
  each('#page-acasa figcaption', function(fc){
    if (fc.closest('.pq')) return;
    var html = fc.innerHTML, m, last = -1;
    KW.lastIndex = 0;
    while ((m = KW.exec(html))) last = m.index;
    if (last < 0) return;
    var re = /(\\.\\s|\\s·\\s)/g, cut = -1;
    while ((m = re.exec(html)) && m.index < last) cut = m.index + m[0].length;
    if (cut <= 0) return;
    var head = html.slice(0, cut).replace(/\\s*·\\s*$/, ''), tail = html.slice(cut), id = 'cap-cr-' + (n++);
    fc.innerHTML = head + '<button type="button" class="cap-i" aria-expanded="false" aria-controls="' + id + '" aria-label="Sursa imaginii" title="Sursa imaginii">i</button><span class="cap-cr" id="' + id + '" hidden>' + tail + '</span>';
    var tmp = document.createElement('div'); tmp.innerHTML = head;
    var t = tmp.textContent.trim(), b = tmp.querySelector('b'), name = b ? b.textContent.trim().replace(/[.:]$/, '') : t.split(/[.(:]/)[0].trim();
    credits.push('<li><b>' + name.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</b>: ' + tail + '</li>');
  });
  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('.cap-i'); if (!b) return;
    var cr = document.getElementById(b.getAttribute('aria-controls')), open = cr.hidden;
    cr.hidden = !open; b.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  var hc = document.querySelector('.hero-credit');
  if (hc) credits.unshift('<li><b>Imaginea din deschidere</b>: ' + hc.innerHTML + '</li>');

  // 2. „Despre proiect”: trei file
  var md = document.querySelector('.about-modal');
  if (md && !md.querySelector('.ab-tabs')) {
    var TABS = [
      { id: 'despre', name: 'Despre', h: ['Ghid rapid de navigare', 'Autor & coordonare'] },
      { id: 'culise', name: 'Culisele proiectului', h: ['Tehnologii utilizate', 'Cum funcționează simularea Marii Migrații', 'Standarde respectate'] },
      { id: 'imagini', name: 'Imaginile', h: ['Despre imagini'] }
    ];
    var h2 = md.querySelector('h2'); if (h2) h2.textContent = 'Despre proiect';
    var bar = document.createElement('div'); bar.className = 'ab-tabs'; bar.setAttribute('role', 'tablist'); bar.setAttribute('aria-label', 'Despre proiect');
    var panels = TABS.map(function(t){
      var p = document.createElement('div'); p.className = 'ab-panel'; p.id = 'ab-' + t.id; p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', 'ab-t-' + t.id);
      var btn = document.createElement('button'); btn.type = 'button'; btn.id = 'ab-t-' + t.id; btn.setAttribute('role', 'tab'); btn.setAttribute('aria-controls', p.id); btn.textContent = t.name;
      bar.appendChild(btn); return p;
    });
    var cur = panels[0], nodes = Array.prototype.slice.call(md.childNodes), after = false;
    nodes.forEach(function(nd){
      if (nd === h2) { after = true; return; }
      if (!after || (nd.classList && nd.classList.contains('about-close'))) return;
      if (nd.nodeName === 'H3') { var tx = nd.textContent.trim(); TABS.forEach(function(t, k){ if (t.h.indexOf(tx) >= 0) cur = panels[k]; }); }
      cur.appendChild(nd);
    });
    if (credits.length) panels[2].insertAdjacentHTML('beforeend', '<h3>Imaginile din articol, una câte una</h3><ul class="ab-credits">' + credits.join('') + '</ul>');
    h2.insertAdjacentElement('afterend', bar);
    var prev = bar;
    panels.forEach(function(p){ prev.insertAdjacentElement('afterend', p); prev = p; });
    function show(k){
      panels.forEach(function(p, j){ p.hidden = j !== k; });
      each('[role="tab"]', function(b, j){ b.setAttribute('aria-selected', j === k ? 'true' : 'false'); b.tabIndex = j === k ? 0 : -1; }, bar);
    }
    bar.addEventListener('click', function(e){ var b = e.target.closest('[role="tab"]'); if (b) show(Array.prototype.indexOf.call(bar.children, b)); });
    bar.addEventListener('keydown', function(e){
      var k = Array.prototype.indexOf.call(bar.children, document.activeElement); if (k < 0) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); k = (k + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length; show(k); bar.children[k].focus(); }
    });
    show(0);
    // butoanele „Culisele proiectului” din joc deschid direct fila lor
    document.addEventListener('click', function(e){
      var a = e.target.closest && e.target.closest('[data-about]'); if (!a) return;
      var k = TABS.map(function(t){ return t.id; }).indexOf(a.getAttribute('data-about'));
      var tr = document.getElementById('about-trigger'); if (tr) tr.click();
      show(k < 0 ? 0 : k);
    });
  }

  // 3. pe telefon, bara de capitole aduce în vedere capitolul curent
  var row = document.querySelector('.chap-bar-row');
  if (row && 'MutationObserver' in window) {
    var mo = new MutationObserver(function(){
      var a = row.querySelector('a.active'); if (!a || row.scrollWidth <= row.clientWidth) return;
      var x = a.offsetLeft - (row.clientWidth - a.offsetWidth) / 2;
      if (Math.abs(row.scrollLeft - x) > 8) row.scrollTo({ left: x, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    each('a', function(a){ mo.observe(a, { attributes: true, attributeFilter: ['class'] }); }, row);
  }
})();
</script>
`;

for (const rel of ['index.html', 'atelierul-hunilor.html']) {
  const f = path.join(root, rel);
  const raw = fs.readFileSync(f, 'utf8'), crlf = raw.includes('\r\n');
  let s = raw.split('\r\n').join('\n');
  const fail = m => { console.error(rel + ': ' + m); process.exit(1); };

  const c0 = s.indexOf('  /* r3: a treia recenzie */');
  if (c0 >= 0) { const e = '  /* /r3 */\n'; s = s.slice(0, c0) + s.slice(s.indexOf(e, c0) + e.length); }
  const st = s.lastIndexOf('</style>');
  if (st < 0) fail('</style>');
  s = s.slice(0, st) + CSS + s.slice(st);

  const j0 = s.indexOf('<script>\n/* r3: legendele scurte');
  if (j0 >= 0) s = s.slice(0, j0) + s.slice(s.indexOf('</script>\n', j0) + '</script>\n'.length);
  const b = s.lastIndexOf('</body>');
  if (b < 0) fail('</body>');
  s = s.slice(0, b) + JS + s.slice(b);

  fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
  console.log(rel + ': a treia recenzie');
}
