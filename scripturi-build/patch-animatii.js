// Animațiile site-ului: titlurile curg cuvânt cu cuvânt când ajungi la ele, epitetele se scriu ca
// din peniță, harta marilor migrații se desenează singură, iar la schimbarea paginii trece o cortină
// cu numele paginii noi. Totul rulează o singură dată; cine a cerut mai puțină mișcare vede doar estompări.
// Folosire: node scripturi-build/patch-animatii.js (se poate rula de mai multe ori; după patch-recenzie-design.js)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const CSS = `  /* fx: animațiile site-ului */
  .fx .fw-host .fw{ display: inline-block; }
  .fx .fw-host:not(.fw-in) .fw{ opacity: 0; }
  .fx .fw-host.fw-in .fw{ animation: fw-in 0.75s cubic-bezier(.16, 1, .3, 1) both; animation-delay: calc(var(--i) * 65ms); }
  @keyframes fw-in{ from{ opacity: 0; transform: translateY(0.5em); } }
  /* epitetele: ca scrise cu cerneală, auriul se usucă în culoarea textului */
  .fx .fw-host.ink.fw-in .fw{ animation: fw-ink 0.6s ease both; animation-delay: calc(0.2s + var(--i) * 60ms); }
  @keyframes fw-ink{ from{ opacity: 0; color: #e5c158; transform: translateY(2px); } }
  /* cortina dintre pagini */
  .pg-curtain{ position: fixed; left: 0; right: 0; top: var(--nav-h, 44px); bottom: 0; z-index: 190; display: grid; place-items: center; background: #15120e; border-bottom: 2px solid #c9a13a; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); pointer-events: none; visibility: hidden; }
  .pg-curtain b{ font: 600 clamp(1.5rem, 4vw, 2.5rem) 'Cinzel', Georgia, serif; color: #f2d474; letter-spacing: 0.06em; text-align: center; padding: 0 16px; }
  .pg-curtain.go{ visibility: visible; animation: pg-cur 0.85s cubic-bezier(.7, 0, .2, 1) both; }
  .pg-curtain.go b{ animation: pg-cur-t 0.85s ease both; }
  @keyframes pg-cur{ 0%, 32%{ transform: none; } 100%{ transform: translateY(-102%); } }
  @keyframes pg-cur-t{ 0%{ opacity: 0; transform: translateY(8px); } 18%, 40%{ opacity: 1; transform: none; } 75%, 100%{ opacity: 0; } }
  /* cu „reducerea mișcării”: nimic nu se deplasează, doar apare */
  @media (prefers-reduced-motion: reduce){
    .fx .fw-host.fw-in .fw, .fx .fw-host.ink.fw-in .fw{ animation-name: fw-fade; animation-duration: 0.5s; }
    .pg-curtain.go{ animation-name: pg-fade; }
    .pg-curtain.go b{ animation-name: fw-fade; }
  }
  @keyframes fw-fade{ from{ opacity: 0; } }
  @keyframes pg-fade{ 0%, 35%{ opacity: 1; } 100%{ opacity: 0; } }
  @media print{ .fx .fw-host .fw{ opacity: 1 !important; animation: none !important; } .pg-curtain{ display: none; } }
  /* /fx */
`;

const JS = `<script>
/* fx: animațiile site-ului */
(function(){
  if (!('IntersectionObserver' in window)) return;
  var de = document.documentElement;
  de.classList.add('fx');

  // titlurile: fiecare cuvânt devine un <span class="fw">; elementele din titlu (em) se împart și ele
  var n = 0;
  function split(el){
    Array.prototype.slice.call(el.childNodes).forEach(function(nd){
      if (nd.nodeType === 1) { if (!/^(SUP|BR|SVG|IMG)$/i.test(nd.nodeName)) split(nd); return; }
      if (nd.nodeType !== 3 || !nd.nodeValue.trim()) return;
      var frag = document.createDocumentFragment();
      nd.nodeValue.split(/(\\s+)/).forEach(function(w){
        if (!w) return;
        if (/^\\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
        var s = document.createElement('span');
        s.className = 'fw'; s.style.setProperty('--i', n++); s.textContent = w;
        frag.appendChild(s);
      });
      el.replaceChild(frag, nd);
    });
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('fw-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -12% 0px' });
  Array.prototype.slice.call(document.querySelectorAll('h1.title, .sec-title, .sub-title, .md-title, .dc-epithet')).forEach(function(el){
    n = 0; split(el);
    el.classList.add('fw-host');
    if (el.classList.contains('dc-epithet')) el.classList.add('ink');
    io.observe(el);
  });

  // harta marilor migrații se desenează când e pe jumătate pe ecran; săgețile apar la capătul drumurilor
  var hv = document.querySelector('.fig-invazii');
  if (hv) {
    var hio = new IntersectionObserver(function(e){
      if (!e[0].isIntersecting) return;
      hio.disconnect();
      hv.classList.add('hv-on');
      setTimeout(function(){ hv.classList.add('hv-end'); }, 4700);
    }, { threshold: 0.45 });
    hio.observe(hv);
  }

  // cortina dintre pagini, cu numele paginii noi
  var pages = Array.prototype.slice.call(document.querySelectorAll('.site-page'));
  var names = Array.prototype.slice.call(document.querySelectorAll('.site-nav a')).map(function(a){ return (a.querySelector('.nav-long') || a).textContent.trim(); });
  if (!pages.length || !('MutationObserver' in window)) return;
  function active(){ for (var k = 0; k < pages.length; k++) if (pages[k].classList.contains('active')) return k; return -1; }
  var was = active(), cur = document.createElement('div');
  cur.className = 'pg-curtain'; cur.setAttribute('aria-hidden', 'true'); cur.innerHTML = '<b></b>';
  document.body.appendChild(cur);
  cur.addEventListener('animationend', function(e){ if (e.target === cur) cur.classList.remove('go'); });
  var mo = new MutationObserver(function(){
    var k = active();
    if (k < 0 || k === was) return;
    was = k;
    cur.querySelector('b').textContent = names[k] || '';
    cur.classList.remove('go'); void cur.offsetWidth; cur.classList.add('go');
  });
  pages.forEach(function(p){ mo.observe(p, { attributes: true, attributeFilter: ['class'] }); });
})();
</script>
`;

for (const rel of ['index.html', 'atelierul-hunilor.html']) {
  const f = path.join(root, rel);
  const raw = fs.readFileSync(f, 'utf8'), crlf = raw.includes('\r\n');
  let s = raw.split('\r\n').join('\n');
  const fail = m => { console.error(rel + ': ' + m); process.exit(1); };

  const c0 = s.indexOf('  /* fx: animațiile site-ului');
  if (c0 >= 0) { const e = '  /* /fx */\n'; s = s.slice(0, c0) + s.slice(s.indexOf(e, c0) + e.length); }
  const st = s.lastIndexOf('</style>');
  if (st < 0) fail('</style>');
  s = s.slice(0, st) + CSS + s.slice(st);

  const j0 = s.indexOf('<script>\n/* fx: animațiile site-ului */');
  if (j0 >= 0) s = s.slice(0, j0) + s.slice(s.indexOf('</script>\n', j0) + '</script>\n'.length);
  const b = s.lastIndexOf('</body>');
  if (b < 0) fail('</body>');
  s = s.slice(0, b) + JS + s.slice(b);

  fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
  console.log(rel + ': animațiile');
}
