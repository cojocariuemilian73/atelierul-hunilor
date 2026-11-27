/* Runda 9: izvoarele într-un carusel orizontal (ca la Kairos) + înălțimea hărții din cronologie.
   Nu schimbă fișele (fise-izvoare.js le construiește); doar le pune într-o fereastră care se mută pas cu pas. Prefix: r9-. */
(function () {
  function reduce() { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  var ARROW = { left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' };

  /* Izvoarele: carusel orizontal ca la Kairos — fișa din centru e mare, vecinele stau mai mici și estompate pe margini.
     Se schimbă din săgeți, din puncte, cu clic pe o vecină, cu tastele ← → sau trăgând cu degetul. */
  function carousel() {
    var box = document.querySelector('#page-acasa .si-wrap'), grid = box && box.querySelector('.si-grid');
    if (!grid) return false;
    if (box.classList.contains('r9-car')) return true;
    var cards = Array.prototype.slice.call(grid.querySelectorAll(':scope > .si'));
    var N = cards.length;
    if (N < 2) return true;
    box.classList.add('r9-car');
    if (!grid.id) grid.id = 'r9-si-list';
    grid.setAttribute('aria-roledescription', 'carusel');
    grid.setAttribute('aria-label', 'Izvoarele, unul câte unul');

    var ctl = document.createElement('div'); ctl.className = 'r9-ctl';
    ctl.innerHTML =
      '<button type="button" class="r9-arrow r9-prev" aria-controls="' + grid.id + '" aria-label="Izvorul anterior">' + ARROW.left + '</button>' +
      '<div class="r9-dots" role="group" aria-label="Alege izvorul">' + cards.map(function (c, k) {
        var nm = c.querySelector('.si-name'); return '<button type="button" class="r9-dot" aria-label="' + (nm ? nm.textContent.trim().replace(/"/g, '&quot;') : 'Izvorul ' + (k + 1)) + '"></button>';
      }).join('') + '</div>' +
      '<button type="button" class="r9-arrow r9-next" aria-controls="' + grid.id + '" aria-label="Izvorul următor">' + ARROW.right + '</button>' +
      '<p class="r9-pos" aria-live="polite"></p>';
    grid.after(ctl);
    var prev = ctl.querySelector('.r9-prev'), next = ctl.querySelector('.r9-next'), pos = ctl.querySelector('.r9-pos');
    var dots = Array.prototype.slice.call(ctl.querySelectorAll('.r9-dot'));

    var first = function (s) { return (s || '').trim().split(/[\s,]+/)[0]; };
    var nodes = Array.prototype.slice.call(box.querySelectorAll('.si-node'));
    var nodeOf = cards.map(function (c) {
      var n = first(c.querySelector('.si-name') && c.querySelector('.si-name').textContent);
      return nodes.filter(function (x) { return first(x.querySelector('.si-node-lab').textContent) === n; })[0] || null;
    });
    // în fișele laterale, elementele interactive ies din ordinea tabului (fișa e doar o previzualizare)
    var focusables = cards.map(function (c) { return Array.prototype.slice.call(c.querySelectorAll('a, button, [tabindex]')); });

    var at = 0;
    function offset(j) { var d = j - at; return d; }               // fără buclă: capetele rămân capete
    // scena are înălțimea fișei din centru (vecinele, micșorate, încap în ea), deci nu rămâne gol sub o fișă scurtă
    function height() {
      var h = cards[at].offsetHeight;
      [at - 1, at + 1].forEach(function (j) { if (cards[j]) h = Math.max(h, cards[j].offsetHeight * 0.82); });
      grid.style.height = Math.ceil(h) + 'px';
    }
    function layout() {
      cards.forEach(function (c, j) {
        var d = offset(j), center = d === 0;
        c.dataset.pos = Math.abs(d) > 1 ? (d < 0 ? 'far-l' : 'far-r') : String(d);
        c.toggleAttribute('data-center', center);
        if (center) c.removeAttribute('aria-hidden'); else c.setAttribute('aria-hidden', 'true');
        focusables[j].forEach(function (f) { if (center) f.removeAttribute('tabindex'); else f.setAttribute('tabindex', '-1'); });
        if (nodeOf[j]) nodeOf[j].classList.toggle('r9-dim', !center);
        if (dots[j]) { dots[j].toggleAttribute('data-on', center); if (center) dots[j].setAttribute('aria-current', 'true'); else dots[j].removeAttribute('aria-current'); }
      });
      var nm = cards[at].querySelector('.si-name');
      pos.textContent = 'Izvorul ' + (at + 1) + ' din ' + N + (nm ? ': ' + nm.textContent.trim() : '');
      prev.disabled = at === 0; next.disabled = at === N - 1;
    }
    function go(k) { at = Math.max(0, Math.min(N - 1, k)); layout(); height(); }
    prev.addEventListener('click', function () { go(at - 1); });
    next.addEventListener('click', function () { go(at + 1); });
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); }); });
    // clic pe o fișă laterală: vine în centru (în faza de captură, ca butoanele din ea să nu se declanșeze)
    grid.addEventListener('click', function (e) {
      var c = e.target.closest('.si'); if (!c) return;
      var j = cards.indexOf(c); if (j === at || j < 0) return;
      e.preventDefault(); e.stopPropagation(); go(j);
    }, true);
    box.addEventListener('keydown', function (e) {
      if (e.target.closest('input, textarea')) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(at - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(at + 1); }
    });
    var sx = null;
    grid.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') sx = e.clientX; });
    grid.addEventListener('pointerup', function (e) {
      if (sx === null) return; var dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 40) go(at + (dx < 0 ? 1 : -1));
    });
    // un nod de pe axă aduce izvorul lui în centru
    nodeOf.forEach(function (n, k) { if (n) n.addEventListener('click', function () { go(k); }); });
    layout(); height();
    if ('ResizeObserver' in window) { var ro = new ResizeObserver(function () { height(); }); cards.forEach(function (c) { ro.observe(c); }); }
    addEventListener('resize', height);
    return true;
  }

  // cronologia: fișa din dreapta e cel puțin cât harta (în loc să țină minte cea mai înaltă fișă)
  function chrono() {
    var map = document.querySelector('#sec-cronologie .hx-map'), folio = document.getElementById('hx-folio');
    if (!map || !folio) return;
    var set = function () { folio.style.setProperty('--r9-map-h', Math.ceil(map.getBoundingClientRect().height) + 'px'); };
    set();
    if ('ResizeObserver' in window) new ResizeObserver(set).observe(map); else addEventListener('resize', set);
  }

  function run() {
    var tries = 0;
    (function again() { if (!carousel() && ++tries < 20) setTimeout(again, 250); })();
    try { chrono(); } catch (e) { if (window.console) console.warn('runda9', e); }
  }
  if (document.readyState === 'complete') setTimeout(run, 150); else addEventListener('load', function () { setTimeout(run, 150); });
})();
