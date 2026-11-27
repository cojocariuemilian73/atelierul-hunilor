/* Runda 10: bara în trei zone, tranziții între capitole, curiozitățile pe orbită. Prefix: r10-. */
(function () {
  function reduce() { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }

  /* ---------- bara: „Imperiul Hunilor” în centru, capitolele împărțite stânga / dreapta ----------
     Pe ecrane late arătăm copii ale legăturilor; originalele rămân pentru sertarul de pe telefon.
     Clicul pe o copie îl declanșează pe original, iar starea activă se copiază de la original. */
  function nav() {
    var n = document.getElementById('site-nav'); if (!n || n.querySelector('.r10-l')) return;
    var brand = n.querySelector('.st-brand');
    if (brand && !brand.querySelector('.r10-brand')) {
      brand.setAttribute('aria-label', 'Imperiul Hunilor: începutul paginii');
      Array.prototype.forEach.call(brand.childNodes, function (c) { if (c.nodeType === 3) c.textContent = ''; });
      Array.prototype.forEach.call(brand.children, function (c) { if (!c.classList.contains('st-mark')) c.hidden = true; });
      var t = document.createElement('span'); t.className = 'r10-brand'; t.textContent = 'Imperiul Hunilor'; brand.appendChild(t);
    }
    var toc = Array.prototype.slice.call(n.querySelectorAll('#toc-row .toc-link'));
    var pages = Array.prototype.slice.call(n.querySelectorAll('.st-pages > a, .st-pages > .about-trigger'));
    if (!toc.length) return;
    var L = document.createElement('div'), R = document.createElement('div');
    L.className = 'r10-l'; R.className = 'r10-r st-pages';
    L.setAttribute('aria-label', 'Capitole'); R.setAttribute('aria-label', 'Capitole și pagini');
    var half = Math.ceil(toc.length * 2 / 3);               // 6 capitole: 4 în stânga, 2 + paginile în dreapta
    function copy(orig) {
      var c = orig.cloneNode(true);
      c.removeAttribute('id'); c.removeAttribute('aria-controls');
      Array.prototype.forEach.call(c.querySelectorAll('[id]'), function (x) { x.removeAttribute('id'); });
      c.addEventListener('click', function (e) { e.preventDefault(); orig.click(); });
      var sync = function () {
        c.classList.toggle('active', orig.classList.contains('active'));
        var cur = orig.getAttribute('aria-current'); if (cur) c.setAttribute('aria-current', cur); else c.removeAttribute('aria-current');
        if (orig.hasAttribute('aria-expanded')) c.setAttribute('aria-expanded', orig.getAttribute('aria-expanded'));
      };
      sync(); new MutationObserver(sync).observe(orig, { attributes: true, attributeFilter: ['class', 'aria-current', 'aria-expanded'] });
      return c;
    }
    toc.forEach(function (a, k) { (k < half ? L : R).appendChild(copy(a)); });
    var sep = document.createElement('span'); sep.className = 'r10-sep'; sep.setAttribute('aria-hidden', 'true'); R.appendChild(sep);
    pages.forEach(function (a) { R.appendChild(copy(a)); });
    n.insertBefore(L, n.firstChild);
    n.appendChild(R);
  }

  /* ---------- tranziții între capitole ----------
     Capitolul primește r10-in când intră în ecran; la derulare rapidă, tot ce e deja deasupra marginii de jos e marcat
     imediat, deci niciun bloc nu rămâne invizibil. */
  function chapters() {
    if (reduce()) return;
    var secs = Array.prototype.slice.call(document.querySelectorAll('#page-acasa :is(#sec-origini, #sec-cronologie, #sec-migratie, #sec-atlas, #sec-personalitati, #biblio)'));
    if (!secs.length) return;
    secs.forEach(function (s) { s.classList.add('r10-sec'); });
    var mark = function () {
      var vh = innerHeight;
      secs.forEach(function (s) { if (!s.classList.contains('r10-in') && s.getBoundingClientRect().top < vh * 0.92) s.classList.add('r10-in'); });
    };
    mark();
    document.documentElement.classList.add('r10-arm');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('r10-in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
      secs.forEach(function (s) { io.observe(s); });
    }
    // direct în evenimentul de derulare (nu prin requestAnimationFrame, care stă pe loc în filele ascunse): 6 măsurători, ieftin
    var last = 0;
    addEventListener('scroll', function () { var t = Date.now(); if (t - last > 80) { last = t; mark(); } else setTimeout(mark, 100); }, { passive: true });
    addEventListener('scrollend', mark);
    addEventListener('hashchange', mark);
    addEventListener('resize', mark);
  }

  /* ---------- curiozitățile „Știai că…?” pe orbită ---------- */
  function orbit() {
    if (document.getElementById('sec-curiozitati')) return;
    var notes = Array.prototype.slice.call(document.querySelectorAll('#page-acasa .r9-note'));
    var items = notes.map(function (n) {
      var t = n.querySelector('.r9n-title, .r9n-num'), x = n.querySelector('.r9n-text'), s = n.querySelector('.r9n-src');
      var u = n.querySelector('.r9n-unit');                 // „1/72” + „de livră”: titlul se citește întreg
      var title = t ? t.textContent.trim() + (u && t.classList.contains('r9n-num') ? ' ' + u.textContent.trim() : '') : '';
      return t && x ? { t: title, x: x.innerHTML, s: s ? s.innerHTML : '' } : null;
    }).filter(Boolean);
    if (items.length < 3) return;
    var anchor = document.querySelector('#page-acasa .main-col > .cta-card') || document.getElementById('biblio');
    if (!anchor) return;
    var N = items.length;
    var sec = document.createElement('section');
    sec.id = 'sec-curiozitati'; sec.className = 'r10-orb-sec'; sec.setAttribute('aria-labelledby', 'r10-orb-h');
    sec.innerHTML =
      '<div class="r10-orb-head"><p class="r10-kick">Știai că…?</p><h2 id="r10-orb-h" class="r10-orb-title">Curiozități despre huni</h2></div>' +
      '<div class="r10-stage"><div class="r10-orb" style="--n:' + N + '">' +
        '<span class="r10-ring" aria-hidden="true"></span>' +
        '<p class="r10-emblem" aria-hidden="true">Alege o curiozitate</p>' +
        '<ul class="r10-items">' + items.map(function (it, k) {
          return '<li style="--i:' + k + '"><button type="button" class="r10-it" aria-expanded="false" aria-controls="r10-center">' +
            '<span class="r10-no">' + (k < 9 ? '0' : '') + (k + 1) + '</span><span class="r10-t">' + it.t + '</span></button></li>';
        }).join('') + '</ul></div>' +
        '<div class="r10-center" id="r10-center" role="region" aria-live="polite" aria-label="Curiozitatea aleasă"></div>' +
      '</div>';
    anchor.parentNode.insertBefore(sec, anchor);

    var orb = sec.querySelector('.r10-orb'), center = sec.querySelector('.r10-center');
    var btns = Array.prototype.slice.call(sec.querySelectorAll('.r10-it'));
    var cur = -1;
    function idle() {
      return '<p class="r10-q">Ce i-a uimit pe romani la huni?</p><p class="r10-hint">Alege o curiozitate de pe cerc.</p>';
    }
    function card(k) {
      var it = items[k];
      return '<p class="r10-kick">Știai că…? · ' + (k + 1) + ' din ' + N + '</p><h3>' + it.t + '</h3><p class="r10-txt">' + it.x + '</p>' +
        (it.s ? '<p class="r10-src">' + it.s + '</p>' : '') +
        '<div class="r10-nav"><button type="button" class="r10-prev" aria-label="Curiozitatea anterioară">←</button>' +
        '<button type="button" class="r10-close">Închide</button>' +
        '<button type="button" class="r10-next" aria-label="Curiozitatea următoare">→</button></div>';
    }
    function show(k, focusCenter) {
      var html = k < 0 ? idle() : card(k);
      var swap = function () {
        center.innerHTML = html; center.classList.remove('is-swap');
        if (focusCenter && k >= 0) { var b = center.querySelector('.r10-close'); if (b) b.focus({ preventScroll: true }); }
      };
      cur = k;
      orb.classList.toggle('is-open', k >= 0);
      btns.forEach(function (b, i) { b.setAttribute('aria-expanded', i === k ? 'true' : 'false'); });
      if (reduce()) swap(); else { center.classList.add('is-swap'); setTimeout(swap, 180); }
    }
    btns.forEach(function (b, k) { b.addEventListener('click', function () { show(cur === k ? -1 : k, false); }); });
    center.addEventListener('click', function (e) {
      if (e.target.closest('.r10-close')) { var k = cur; show(-1); if (btns[k]) btns[k].focus({ preventScroll: true }); }
      else if (e.target.closest('.r10-prev')) show((cur - 1 + N) % N, true);
      else if (e.target.closest('.r10-next')) show((cur + 1) % N, true);
    });
    sec.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && cur >= 0) { var k = cur; show(-1); if (btns[k]) btns[k].focus({ preventScroll: true }); }
    });
    center.innerHTML = idle();

    // intrare: elementele vin pe orbită rotindu-se; ieșire: se retrag spre centru. Rotația lentă doar cât secțiunea e în ecran.
    if (reduce()) { orb.classList.add('is-in'); return; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          orb.classList.toggle('is-in', e.isIntersecting);
          orb.classList.toggle('is-spinning', e.isIntersecting);
        });
      }, { threshold: 0.18 }).observe(orb);
    } else orb.classList.add('is-in');
  }

  function run() {
    [nav, orbit, chapters].forEach(function (f) { try { f(); } catch (e) { if (window.console) console.warn('runda10', e); } });
  }
  if (document.readyState === 'complete') setTimeout(run, 200); else addEventListener('load', function () { setTimeout(run, 200); });
})();
