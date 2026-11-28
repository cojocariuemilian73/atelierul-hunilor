
/* Runda 14: capitolele împărțite în pagini cât ecranul (derularea se oprește pe fiecare pagină), titlurile se scriu
   literă cu literă, textul intră ușor, imaginile se deschid din centru. Prefix: r14-.
   Paginile doar grupează copiii direcți ai capitolului; textul și ordinea rămân aceleași. */
(function () {
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  // #sec-drum rămâne întreg: harta e lipită (sticky) pe toată înălțimea capitolului
  var SECS = '#sec-origini, #sec-cronologie, #sec-curiozitati, #sec-migratie, #sec-atlas, #sec-personalitati, #sec-glosar, #biblio';
  // blocurile care merită o pagină a lor (dacă pagina curentă e deja destul de plină)
  var MAJOR = '.r2-head, .sr-row, .duel, .duel-context, .dmn, .gs, .hx, .si-wrap, .ptol-map, .r10-band, .gold-context, .r10-stage, .wrap, figure.pq, .r2-band';
  // aici textul are deja mișcarea lui (hărți, jocuri, carusele): nu se mai animă nimic peste
  var OWN = '.si-wrap, .hx, .r10-stage, .dmn, .gs, #sec-atlas, .ptol-map svg, .r2-band, .mv-margin';

  function el(tag, cls) { var e = document.createElement(tag); e.className = cls; return e; }
  function shown(e) {
    if (!e.getClientRects().length) return false;
    var p = getComputedStyle(e).position;
    return p !== 'absolute' && p !== 'fixed';
  }

  function paginate() {
    var vh = window.innerHeight || 800, pages = [];
    Array.prototype.forEach.call(document.querySelectorAll('#page-acasa :is(' + SECS + ')'), function (sec) {
      if (sec.querySelector(':scope > .r14-page')) return;
      var kids = Array.prototype.filter.call(sec.children, shown), groups = [], cur = null, h = 0;
      kids.forEach(function (k) {
        var kh = k.getBoundingClientRect().height;
        var start = !cur || k.classList.contains('r2-head') || (h >= vh * 0.5 && (kh >= vh * 0.3 || k.matches(MAJOR)));
        if (start) { cur = []; groups.push(cur); h = 0; }
        cur.push(k); h += kh;
      });
      groups.forEach(function (g) {
        var p = el('div', 'r14-page');
        g[0].parentNode.insertBefore(p, g[0]);
        g.forEach(function (k) { p.appendChild(k); });
        pages.push(p);
      });
    });
    return pages;
  }

  // titlurile: fiecare literă își are rândul; cuvintele nu se rup la capăt de rând; cititoarele de ecran citesc titlul întreg
  function typeset(h) {
    if (h.dataset.r14) return;
    h.dataset.r14 = '1';
    if (h.querySelector('a, button, input, [tabindex]')) return;
    var label = h.textContent.replace(/\s+/g, ' ').trim();
    if (!label) return;
    var walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT), nodes = [], n, i = 0;
    while ((n = walker.nextNode())) nodes.push(n);
    var total = label.replace(/\s/g, '').length, step = Math.max(14, Math.min(34, Math.round(1100 / Math.max(1, total))));
    nodes.forEach(function (t) {
      var frag = document.createDocumentFragment();
      t.nodeValue.split(/(\s+)/).forEach(function (w) {
        if (!w) return;
        if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
        var word = el('span', 'r14-w'); word.setAttribute('aria-hidden', 'true');
        Array.prototype.forEach.call(w, function (ch) { var c = el('span', 'r14-c'); c.textContent = ch; c.style.setProperty('--r14-i', i++); word.appendChild(c); });
        frag.appendChild(word);
      });
      t.parentNode.replaceChild(frag, t);
    });
    h.setAttribute('aria-label', label);
    h.style.setProperty('--r14-step', step + 'ms');
    h.classList.add('r14-type');
  }

  function prepare(p) {
    Array.prototype.forEach.call(p.querySelectorAll('h2.sec-title, h3, .ptol-kicker'), function (h) { if (!h.closest(OWN)) typeset(h); });
    var k = 0;
    Array.prototype.forEach.call(p.querySelectorAll('p, li, figcaption, blockquote'), function (t) {
      if (t.closest(OWN) || t.closest('.r14-type') || t.closest('.r14-txt')) return;
      if (t.parentElement && t.parentElement.closest('p, li, figcaption, blockquote')) return;
      t.classList.add('r14-txt'); t.style.setProperty('--r14-k', Math.min(k++, 9));
    });
    Array.prototype.forEach.call(p.querySelectorAll('img'), function (im) { if (!im.closest(OWN)) im.classList.add('r14-img'); });
    p.classList.add('r14-wait');
  }

  function run() {
    var pages = paginate();
    document.documentElement.classList.add('r14-on');
    if (reduce) return;                              // fără mișcare: paginile rămân, nimic nu se ascunde
    pages.forEach(prepare);
    var left = pages.slice();
    function check() {
      var vh = window.innerHeight;
      left = left.filter(function (p) {
        var r = p.getBoundingClientRect();
        if (r.top < vh * 0.72 && r.bottom > vh * 0.2) { p.classList.remove('r14-wait'); p.classList.add('r14-go'); return false; }
        return true;
      });
    }
    // direct pe derulare (nu prin rAF: într-un tab ascuns rAF stă și paginile ar rămâne ascunse)
    addEventListener('scroll', check, { passive: true });
    addEventListener('scrollend', check);
    addEventListener('resize', check);
    addEventListener('hashchange', function () { setTimeout(check, 60); });
    check();
    // plasă de siguranță: nimic nu rămâne ascuns mai mult de câteva secunde după ce a ajuns pe ecran
    setInterval(check, 1200);
  }
  if (document.readyState === 'complete') setTimeout(run, 500); else addEventListener('load', function () { setTimeout(run, 500); });
})();
