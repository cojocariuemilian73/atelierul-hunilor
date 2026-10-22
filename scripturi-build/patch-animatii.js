// Animațiile site-ului: titlurile curg cuvânt cu cuvânt când ajungi la ele, epitetele se scriu ca
// din peniță (și citatele mari), prima literă a capitolului se pictează, harta marilor migrații se desenează singură, iar la
// schimbarea paginii trece o cortină cu numele paginii noi. Imaginea din deschidere se mișcă mai încet decât
// pagina, dosarele de mituri se revarsă din teanc, punctele cronologiei răsar pe rând, obiectele din muzeu se
// înclină după mouse, iar pe Masa istoricului sursele sunt împărțite pe masă. Totul rulează o singură dată; cine a cerut mai puțină mișcare vede doar estompări.
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
  /* prima literă a capitolului: întâi conturul auriu, apoi culoarea */
  .fx .lede.dcx::first-letter{ float: none; font: inherit; color: inherit; padding: 0; line-height: inherit; }
  .fx .lede .dc{ float: left; padding: 0.05em 0.08em 0 0; font: 600 3.6em/0.8 'Cormorant Garamond', serif; color: var(--accent); }
  .fx .lede.dcx:not(.dc-in) .dc{ color: transparent; }
  .fx .lede.dc-in .dc{ animation: dc-paint 1.8s ease both; }
  @keyframes dc-paint{ 0%{ color: transparent; -webkit-text-stroke: 1px rgba(229, 193, 88, 0); } 40%{ color: transparent; -webkit-text-stroke: 1px #e5c158; } 100%{ color: var(--accent); -webkit-text-stroke: 1px rgba(229, 193, 88, 0); } }
  /* imaginea din deschidere, mai lentă decât pagina */
  .fx-move .hero-bg{ will-change: transform; }
  /* dosarele de mituri se revarsă din teanc, unul după altul */
  .fx-move .mx-fan > .mx-item, .fx-move .mx-fan > .mx-facts{ animation: mx-deal 0.6s cubic-bezier(.16, 1, .3, 1) both; animation-delay: calc(var(--k) * 90ms); }
  @keyframes mx-deal{ from{ opacity: 0; translate: 0 -18px; rotate: -1.2deg; } }
  /* punctele cronologiei răsar pe rând, prima dată când o vezi */
  .fx-move #hx-marks:not(.hx-seen) .hx-mk{ opacity: 0; }
  .fx-move #hx-marks.hx-up .hx-mk{ animation: hx-rise 0.55s cubic-bezier(.2, 1.5, .4, 1) both; animation-delay: calc(var(--k) * 45ms); }
  @keyframes hx-rise{ from{ opacity: 0; translate: 0 16px; scale: 0.4; } }
  /* muzeul: obiectul se înclină după mouse, ca sub o vitrină, cu un reflex de sticlă */
  .fx-move .m-lab .viewer-object{ transition: transform 0.5s cubic-bezier(.2, .7, .2, 1); }
  .fx-move .m-lab .viewer-object.tilt{ transition-duration: 0.12s; }
  .fx-move .m-lab .viewer-object::after{ content: ''; position: absolute; inset: 0; background: radial-gradient(circle at var(--gx, 50%) var(--gy, 30%), rgba(255, 240, 205, 0.2), transparent 55%); opacity: 0; transition: opacity 0.4s; pointer-events: none; }
  .fx-move .m-lab .viewer-object.tilt::after{ opacity: 1; }
  /* Masa istoricului: sursele sunt împărțite pe masă, iar cea aleasă se ridică */
  .fx-move .md-deal .md-card{ animation: md-deal 0.6s cubic-bezier(.16, 1, .3, 1) both; animation-delay: calc(var(--k) * 55ms); }
  @keyframes md-deal{ from{ opacity: 0; translate: 40px -70px; rotate: 9deg; } }
  .fx-move .md-card.sel{ transform: translateY(-9px) rotate(-1.5deg) scale(1.03); box-shadow: 0 0 0 3px #f2d474, 0 26px 40px rgba(0, 0, 0, 0.6); }
  /* cu „reducerea mișcării”: nimic nu se deplasează, doar apare */
  @media (prefers-reduced-motion: reduce){
    .fx .fw-host.fw-in .fw, .fx .fw-host.ink.fw-in .fw{ animation-name: fw-fade; animation-duration: 0.5s; }
    .pg-curtain.go{ animation-name: pg-fade; }
    .pg-curtain.go b{ animation-name: fw-fade; }
  }
  @keyframes fw-fade{ from{ opacity: 0; } }
  @keyframes pg-fade{ 0%, 35%{ opacity: 1; } 100%{ opacity: 0; } }
  @media print{ .fx .fw-host .fw{ opacity: 1 !important; animation: none !important; } .fx .lede .dc{ color: var(--accent) !important; animation: none !important; } .pg-curtain{ display: none; } }
  /* /fx */
`;

const JS = `<script>
/* fx: animațiile site-ului */
(function(){
  if (!('IntersectionObserver' in window)) return;
  var de = document.documentElement;
  de.classList.add('fx');
  // mișcările mari (paralaxă, înclinare, împărțirea cărților) doar fără „reducerea mișcării”
  var move = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (move) de.classList.add('fx-move');
  function each(sel, fn){ Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }
  function once(el, fn, opt){
    if (!el) return;
    var o = new IntersectionObserver(function(e){ if (e[0].isIntersecting) { o.disconnect(); fn(); } }, opt || { threshold: 0.3 });
    o.observe(el);
  }

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
  Array.prototype.slice.call(document.querySelectorAll('h1.title, .sec-title, .sub-title, .md-title, .dc-epithet, .pq blockquote p')).forEach(function(el){
    n = 0; split(el);
    el.classList.add('fw-host');
    if (el.classList.contains('dc-epithet') || el.closest('.pq')) el.classList.add('ink');
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

  // prima literă a capitolului se pictează: o scoatem din ::first-letter într-un <span>
  each('.lede', function(p){
    var w = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, null), nd;
    while ((nd = w.nextNode()) && !nd.nodeValue.trim());
    if (!nd) return;
    var i = nd.nodeValue.search(/\\S/), sp = document.createElement('span');
    sp.className = 'dc'; sp.setAttribute('aria-hidden', 'true'); sp.textContent = nd.nodeValue.charAt(i);
    // cititoarele de ecran citesc cuvântul întreg, din textul rămas
    var sr = document.createElement('span'); sr.className = 'sr-only'; sr.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)'; sr.textContent = nd.nodeValue.charAt(i);
    nd.nodeValue = nd.nodeValue.slice(i + 1);
    nd.parentNode.insertBefore(sp, nd); nd.parentNode.insertBefore(sr, nd);
    p.classList.add('dcx');
    once(p, function(){ p.classList.add('dc-in'); });
  });

  if (move) {
    // imaginea din deschidere coboară mai încet decât pagina
    var hb = document.querySelector('.hero-bg'), hero = hb && hb.parentNode, hraf = 0;
    if (hb) window.addEventListener('scroll', function(){
      if (hraf) return;
      hraf = requestAnimationFrame(function(){
        hraf = 0;
        var y = window.pageYOffset;
        if (y <= hero.offsetTop + hero.offsetHeight) hb.style.transform = 'translate3d(0,' + (y * 0.32).toFixed(1) + 'px,0)';
      });
    }, { passive: true });

    // dosarele de mituri: când se deschide teancul, se revarsă unul după altul
    each('.mx-closed', function(host){
      var mo = new MutationObserver(function(){
        if (host.classList.contains('mx-closed')) return;
        mo.disconnect();
        var k = 0;
        Array.prototype.forEach.call(host.children, function(c){ if (c.matches('.mx-item, .mx-facts')) c.style.setProperty('--k', k++); });
        host.classList.add('mx-fan');
        setTimeout(function(){ host.classList.remove('mx-fan'); }, 600 + k * 90);
      });
      mo.observe(host, { attributes: true, attributeFilter: ['class'] });
    });

    // cronologia: punctele răsar pe rând, de la stânga la dreapta
    var hm = document.getElementById('hx-marks');
    once(hm, function(){
      var k = 0;
      Array.prototype.slice.call(hm.querySelectorAll('.hx-mk')).sort(function(a, b){ return parseFloat(a.style.left) - parseFloat(b.style.left); }).forEach(function(m){ m.style.setProperty('--k', k++); });
      hm.classList.add('hx-seen', 'hx-up');
      setTimeout(function(){ hm.classList.remove('hx-up'); }, 600 + k * 45);
    }, { threshold: 0.6 });

    // muzeul: înclinarea după mouse (doar cu mouse-ul, nu la atingere)
    if (window.matchMedia('(hover: hover)').matches) {
      document.addEventListener('pointermove', function(e){
        if (e.pointerType !== 'mouse') return;
        var st = e.target.closest && e.target.closest('.m-lab .viewer-stage');
        each('.m-lab .viewer-object.tilt', function(o){ if (!st || o.parentNode !== st) { o.classList.remove('tilt'); o.style.transform = ''; } });
        if (!st) return;
        var o = st.querySelector('.viewer-object'), r = st.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        o.classList.add('tilt');
        o.style.transform = 'perspective(900px) rotateX(' + ((0.5 - y) * 7).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 9).toFixed(2) + 'deg)';
        o.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); o.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      }, { passive: true });
    }

    // Masa istoricului: prima dată când vezi masa, sursele sunt împărțite una câte una
    var tray = document.getElementById('md-tray');
    once(tray, function(){
      var k = 0;
      each('#md-tray .md-card', function(c){ c.style.setProperty('--k', k++); });
      tray.classList.add('md-deal');
      setTimeout(function(){ tray.classList.remove('md-deal'); }, 700 + k * 55);
    }, { threshold: 0.2 });
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
