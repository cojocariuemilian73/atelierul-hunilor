
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

  /* ---------- „Ce se spune, ce se știe”: miturile și curiozitățile pe o orbită cu imagini ----------
     Miturile (cărțile .fc) se mută aici; notele „Știai că…?” rămân și în text. Fiecare element are imaginea lui;
     clicul pe imagine o deschide mare, în centru, cu explicația și sursa (ca în caruselul Kairos: alegi, vine în față). */
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  function credit(img) {
    var f = img && img.closest('figure'); if (!f) return '';
    var cr = f.querySelector('.cap-cr'), cap = f.querySelector('figcaption');
    var t = (cr && cr.textContent.trim()) || (cap && cap.textContent.replace(/\s+/g, ' ').trim()) || '';
    return t.replace(/\s*\bi\s*$/, '');
  }
  function imageFor(n) {
    var ctx = n.closest('.sr-row, .duel-context, .gold-context, .margus-context, .sr-media');
    var img = ctx && ctx.querySelector('img');
    if (img) return img;
    var t = n.textContent, all = Array.prototype.slice.call(document.querySelectorAll('#page-acasa img[alt]'));
    var want = /solid|monede de aur/i.test(t) ? /solid/i : /călare/i.test(t) ? /călăreți|călare/i : null;
    return want ? all.filter(function (i) { return want.test(i.alt); })[0] || null : null;
  }
  function orbit() {
    if (document.getElementById('sec-curiozitati')) return;
    var items = [];
    // miturile: imaginea, întrebarea, ce se spune, ce arată izvoarele
    var groups = Array.prototype.slice.call(document.querySelectorAll('#page-acasa .vd-group')).filter(function (g) { return g.querySelector('.fc-grid'); });
    groups.forEach(function (g) {
      Array.prototype.forEach.call(g.querySelectorAll('.fc'), function (c) {
        var img = c.querySelector('.fc-fig img'), cap = c.querySelector('.fc-fig figcaption');
        var q = c.querySelector('.fc-question'), my = c.querySelector('.fc-myth'), ans = c.querySelector('.fc-answer'), ev = c.querySelector('.fc-evidence'), src = c.querySelector('.fc-src');
        if (!img || !(q || my)) return;
        // fără întrebare: titlul e chiar mitul, fără ghilimele
        var title = q ? q.textContent.trim() : my.textContent.trim().replace(/^[„"«]+|[”"»]+$/g, '');
        var evHtml = '';
        if (ev) { var e2 = ev.cloneNode(true); var lab = e2.querySelector('.fc-label'); if (lab) lab.remove(); evHtml = e2.innerHTML; }
        items.push({ kind: 'mit', src: img.currentSrc || img.src, alt: img.alt, cr: cap ? cap.textContent.trim() : '', t: title,
          body: (my && q ? '<p class="r10-myth"><span>Se spune că</span>' + my.innerHTML + '</p>' : '') +
                (ans ? '<p class="r10-txt">' + ans.innerHTML + '</p>' : '') +
                (evHtml ? '<div class="r10-ev">' + evHtml + '</div>' : '') +
                (src ? '<p class="r10-src">' + src.innerHTML + '</p>' : '') });
      });
    });
    var myths = items.length;
    Array.prototype.forEach.call(document.querySelectorAll('#page-acasa .r9-note'), function (n) {
      var t = n.querySelector('.r9n-title, .r9n-num'), x = n.querySelector('.r9n-text'), s2 = n.querySelector('.r9n-src'), u = n.querySelector('.r9n-unit');
      if (!t || !x) return;
      var img = imageFor(n);
      items.push({ kind: 'stiai', src: img ? (img.currentSrc || img.src) : '', alt: img ? img.alt : '', cr: credit(img),
        t: t.textContent.trim() + (u && t.classList.contains('r9n-num') ? ' ' + u.textContent.trim() : ''),
        body: '<p class="r10-txt">' + x.innerHTML + '</p>' + (s2 ? '<p class="r10-src">' + s2.innerHTML + '</p>' : '') });
    });
    if (items.length < 3) return;
    var anchor = document.getElementById('sec-migratie');
    if (!anchor) return;
    var N = items.length;
    var sec = document.createElement('section');
    sec.id = 'sec-curiozitati'; sec.className = 'r10-orb-sec'; sec.setAttribute('aria-labelledby', 'r10-orb-h');
    sec.innerHTML =
      '<div class="r10-orb-head"><p class="r10-kick">Mituri și curiozități</p><h2 id="r10-orb-h" class="r10-orb-title">Ce se spune, ce se știe</h2>' +
      '<p class="r10-lead">' + myths + ' mituri verificate cu izvoarele și ' + (N - myths) + ' lucruri pe care poate nu le știai. Apasă pe o imagine de pe cerc.</p></div>' +
      '<div class="r10-stage"><div class="r10-orb" style="--n:' + N + '">' +
        '<span class="r10-ring" aria-hidden="true"></span>' +
        '<div class="r10-hub" aria-hidden="true"><p class="r10-q">Mit sau adevăr?</p><p class="r10-hint">Apasă pe o imagine.</p></div>' +
        '<ul class="r10-items">' + items.map(function (it, k) {
          return '<li style="--i:' + k + '"><button type="button" class="r10-it r10-' + it.kind + '" aria-expanded="false" aria-controls="r10-card" aria-label="' +
            (it.kind === 'mit' ? 'Mit: ' : 'Știai că: ') + esc(it.t) + '" title="' + esc(it.t) + '">' +
            (it.src ? '<img src="' + esc(it.src) + '" alt="" loading="lazy" decoding="async">' : '') +
            '<span class="r10-badge" aria-hidden="true">' + (it.kind === 'mit' ? 'Mit' : 'Știai?') + '</span></button></li>';
        }).join('') + '</ul></div>' +
        '<article class="r10-card" id="r10-card" aria-live="polite" hidden></article>' +
      '</div>';
    anchor.parentNode.insertBefore(sec, anchor);
    // miturile s-au mutat pe orbită: grupurile vechi nu se mai afișează
    groups.forEach(function (g) {
      g.hidden = true; g.classList.add('r10-moved');
      var p = g.previousElementSibling;
      if (p && /^H[2-4]$/.test(p.tagName) && /ce se (spune|știe)/i.test(p.textContent)) { p.hidden = true; p.classList.add('r10-moved'); }
    });

    var orb = sec.querySelector('.r10-orb'), card = sec.querySelector('.r10-card');
    var btns = Array.prototype.slice.call(sec.querySelectorAll('.r10-it'));
    var cur = -1;
    function html(k) {
      var it = items[k];
      return (it.src ? '<figure class="r10-fig"><img loading="lazy" src="' + esc(it.src) + '" alt="' + esc(it.alt) + '">' +
          (it.cr ? '<figcaption>' + esc(it.cr) + '</figcaption>' : '') + '</figure>' : '') +
        '<div class="r10-body"><p class="r10-kick">' + (it.kind === 'mit' ? 'Mitul, verificat' : 'Știai că…?') + ' · ' + (k + 1) + ' din ' + N + '</p>' +
        '<h3>' + esc(it.t) + '</h3>' + it.body + '</div>' +
        '<div class="r10-nav"><button type="button" class="r10-prev" aria-label="Elementul anterior">←</button>' +
        '<button type="button" class="r10-close">Închide</button>' +
        '<button type="button" class="r10-next" aria-label="Elementul următor">→</button></div>';
    }
    function show(k, focus) {
      cur = k;
      orb.classList.toggle('is-open', k >= 0);
      sec.classList.toggle('r10-open', k >= 0);
      btns.forEach(function (b, i) { b.setAttribute('aria-expanded', i === k ? 'true' : 'false'); });
      if (k < 0) { card.hidden = true; card.innerHTML = ''; return; }
      card.innerHTML = html(k); card.hidden = false;
      card.classList.remove('r10-pop'); void card.offsetWidth; if (!reduce()) card.classList.add('r10-pop');
      card.scrollTop = 0;
      if (focus) { var c = card.querySelector('.r10-close'); if (c) c.focus({ preventScroll: true }); }
      if (matchMedia('(max-width: 699px)').matches) card.scrollIntoView({ block: 'nearest', behavior: reduce() ? 'auto' : 'smooth' });
    }
    function close() { var k = cur; show(-1); if (btns[k]) btns[k].focus({ preventScroll: true }); }
    btns.forEach(function (b, k) { b.addEventListener('click', function () { if (cur === k) close(); else show(k, true); }); });
    card.addEventListener('click', function (e) {
      if (e.target.closest('.r10-close')) close();
      else if (e.target.closest('.r10-prev')) show((cur - 1 + N) % N, true);
      else if (e.target.closest('.r10-next')) show((cur + 1) % N, true);
    });
    sec.addEventListener('keydown', function (e) {
      if (cur < 0) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight' && card.contains(document.activeElement)) show((cur + 1) % N, true);
      else if (e.key === 'ArrowLeft' && card.contains(document.activeElement)) show((cur - 1 + N) % N, true);
    });

    // intrare: imaginile vin pe orbită rotindu-se; ieșire: se retrag spre centru. Rotația lentă doar cât secțiunea e în ecran.
    if (reduce()) { orb.classList.add('is-in'); return; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { orb.classList.toggle('is-in', e.isIntersecting); orb.classList.toggle('is-spinning', e.isIntersecting); });
      }, { threshold: 0.18 }).observe(orb);
    } else orb.classList.add('is-in');
  }

  function run() {
    [nav, orbit, chapters].forEach(function (f) { try { f(); } catch (e) { if (window.console) console.warn('runda10', e); } });
  }
  if (document.readyState === 'complete') setTimeout(run, 200); else addEventListener('load', function () { setTimeout(run, 200); });
})();
