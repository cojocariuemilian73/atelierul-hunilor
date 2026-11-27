
/* Runda 9: izvoarele într-un carusel vertical cu trei fișe la vedere + înălțimea hărții din cronologie.
   Nu schimbă fișele (fise-izvoare.js le construiește); doar le pune într-o fereastră care se mută pas cu pas. Prefix: r9-. */
(function () {
  function reduce() { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  var ARROW = { up: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 10l5-5 5 5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    down: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>' };

  function carousel() {
    var box = document.querySelector('#page-acasa .si-wrap'), grid = box && box.querySelector('.si-grid');
    if (!grid) return false;
    if (box.classList.contains('r9-car')) return true;
    var cards = Array.prototype.slice.call(grid.querySelectorAll(':scope > .si'));
    var N = cards.length, SHOW = 3;
    if (N <= SHOW) return true;
    box.classList.add('r9-car');
    if (!grid.id) grid.id = 'r9-si-list';

    var win = document.createElement('div'); win.className = 'r9-win';
    grid.parentNode.insertBefore(win, grid); win.appendChild(grid);
    var ctl = document.createElement('div'); ctl.className = 'r9-ctl';
    ctl.innerHTML =
      '<button type="button" class="r9-btn r9-up" aria-controls="' + grid.id + '">' + ARROW.up + '<span>Anterioarele</span></button>' +
      '<div class="r9-mid"><p class="r9-pos" aria-live="polite"></p><ol class="r9-dots" aria-hidden="true">' +
      cards.map(function () { return '<li></li>'; }).join('') + '</ol></div>' +
      '<button type="button" class="r9-btn r9-down" aria-controls="' + grid.id + '"><span>Următoarele</span>' + ARROW.down + '</button>';
    box.insertBefore(ctl, win);
    var up = ctl.querySelector('.r9-up'), down = ctl.querySelector('.r9-down'), pos = ctl.querySelector('.r9-pos');
    var dots = ctl.querySelectorAll('.r9-dots li');
    up.setAttribute('aria-label', 'Izvoarele anterioare');
    down.setAttribute('aria-label', 'Izvoarele următoare');

    // nodul de pe axă pentru fiecare fișă (după primul cuvânt din nume, ca eticheta nodului)
    var first = function (s) { return (s || '').trim().split(/[\s,]+/)[0]; };
    var nodes = Array.prototype.slice.call(box.querySelectorAll('.si-node'));
    var nodeOf = cards.map(function (c) {
      var n = first(c.querySelector('.si-name') && c.querySelector('.si-name').textContent);
      return nodes.filter(function (x) { return first(x.querySelector('.si-node-lab').textContent) === n; })[0] || null;
    });

    var i = 0, max = N - SHOW;
    function layout() {
      var a = cards[i], b = cards[i + SHOW - 1];
      var top = a.offsetTop - cards[0].offsetTop;
      var h = b.offsetTop + b.offsetHeight - a.offsetTop;
      var pad = parseFloat(getComputedStyle(win).paddingTop) || 0;
      win.style.height = Math.ceil(h + pad * 2) + 'px';
      grid.style.transform = top ? 'translateY(' + (-top) + 'px)' : '';
      cards.forEach(function (c, k) {
        var vis = k >= i && k < i + SHOW;
        c.classList.toggle('r9-vis', vis);
        if (vis) { c.removeAttribute('inert'); c.removeAttribute('aria-hidden'); }
        else { c.setAttribute('inert', ''); c.setAttribute('aria-hidden', 'true'); }
        if (nodeOf[k]) nodeOf[k].classList.toggle('r9-dim', !vis);
        if (dots[k]) dots[k].classList.toggle('on', vis);
      });
      pos.textContent = 'Izvoarele ' + (i + 1) + '–' + (i + SHOW) + ' din ' + N;
      up.disabled = i === 0; down.disabled = i === max;
    }
    function go(n) { i = Math.max(0, Math.min(max, n)); layout(); }
    up.addEventListener('click', function () { go(i - 1); });
    down.addEventListener('click', function () { go(i + 1); });
    // un nod de pe axă aduce fișa lui în fereastră
    nodeOf.forEach(function (n, k) {
      if (!n) return;
      n.addEventListener('click', function () { if (k < i) go(k); else if (k >= i + SHOW) go(k - SHOW + 1); });
    });
    // săgețile sus/jos când focusul e pe comenzi
    ctl.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp') { e.preventDefault(); go(i - 1); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); go(i + 1); }
    });
    layout();
    if ('ResizeObserver' in window) new ResizeObserver(function () { requestAnimationFrame(layout); }).observe(grid);
    else addEventListener('resize', layout);
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
