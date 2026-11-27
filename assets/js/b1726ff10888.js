
/* Runda 4: urmărește stările deja existente (etapă, pas, an, izvor) și adaugă tranziția sau trasarea.
   Nu schimbă logica modulelor: doar observă clase și atribute. Cu „mișcare redusă”, totul se aplică direct. */
(function () {
  function reduce() { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function swap(el) {
    if (!el || reduce()) return;
    el.classList.remove('r4-swap'); void el.offsetWidth; el.classList.add('r4-swap');
  }
  function watch(target, opts, fn) { if (!target) return; var mo = new MutationObserver(fn); mo.observe(target, opts); }

  // Atlas: eticheta epocii se schimbă cu glisorul
  function atlas() {
    var label = document.getElementById('era-label'); if (!label) return;
    var last = label.textContent;
    watch(label, { childList: true, characterData: true, subtree: true }, function () {
      if (label.textContent === last) return; last = label.textContent; swap(label);
    });
  }

  // Cronologia: firul parcurs pe axă, traseul de aur sub cel punctat, fișa fără salturi de înălțime
  function chrono() {
    var line = document.querySelector('#page-acasa .hx-line'), marks = document.getElementById('hx-marks');
    if (line && marks) {
      var prog = document.createElement('span'); prog.className = 'r4-hx-prog'; prog.setAttribute('aria-hidden', 'true');
      line.insertBefore(prog, line.firstChild);
      var sync = function () {
        var cur = marks.querySelector('.hx-mk.cur'); if (!cur) return;
        var p = parseFloat(cur.style.left) || 0; prog.style.setProperty('--r4-p', (p / 100).toFixed(4));
      };
      sync();
      watch(marks, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] }, sync);
    }

    var route = document.getElementById('hx-route');
    if (route && route.getTotalLength) {
      var trace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      trace.setAttribute('class', 'r4-trace'); trace.setAttribute('aria-hidden', 'true');
      route.parentNode.insertBefore(trace, route);
      var prev = 0;
      var draw = function () {
        var d = route.getAttribute('d'); if (!d) return;
        trace.setAttribute('d', d);
        var len = 0; try { len = route.getTotalLength(); } catch (e) {}
        trace.classList.remove('r4-go');
        if (reduce() || !len || len <= prev + 0.5) {
          trace.style.strokeDasharray = 'none'; trace.style.strokeDashoffset = '0';
        } else {
          trace.style.strokeDasharray = len + ' ' + len;
          trace.style.strokeDashoffset = String(len - prev);
          void trace.getBoundingClientRect();
          trace.classList.add('r4-go');
          trace.style.strokeDashoffset = '0';
        }
        prev = len;
      };
      draw();
      watch(route, { attributes: true, attributeFilter: ['d'] }, draw);
    }

    var folio = document.getElementById('hx-folio');
    if (folio) {
      var max = 0, w = innerWidth;
      var hold = function () {
        if (innerWidth !== w) { w = innerWidth; max = 0; folio.style.removeProperty('--r4-folio-h'); }
        var h = folio.getBoundingClientRect().height;
        if (h > max) { max = Math.ceil(h); folio.style.setProperty('--r4-folio-h', max + 'px'); }
      };
      hold();
      watch(folio, { childList: true, subtree: true, characterData: true }, function () { requestAnimationFrame(hold); });
      addEventListener('resize', function () { requestAnimationFrame(hold); });
    }
  }

  // Aurul: indicatorul pasului activ alunecă pe șină
  function gold() {
    var nav = document.querySelector('#page-acasa .gs-nav'); if (!nav) return;
    var bar = document.createElement('span'); bar.className = 'r4-gs-bar'; bar.setAttribute('aria-hidden', 'true');
    nav.appendChild(bar);
    var place = function () {
      var b = nav.querySelector('button.on'); if (!b) return;
      bar.style.top = (b.offsetTop + b.offsetHeight - 2) + 'px'; bar.style.bottom = 'auto';
      bar.style.setProperty('--r4-x', b.offsetLeft + 'px');
      bar.style.setProperty('--r4-w', b.offsetWidth);
    };
    place();
    watch(nav, { subtree: true, attributes: true, attributeFilter: ['aria-pressed'] }, place);
    if ('ResizeObserver' in window) new ResizeObserver(place).observe(nav);
  }

  // Izvoarele: firul fișei alese se trasează când devine activ
  function sources() {
    var hang = document.querySelector('#page-acasa .si-hang'); if (!hang) return;
    var mark = function () {
      Array.prototype.forEach.call(hang.querySelectorAll('path'), function (p) {
        var on = p.classList.contains('si-on'), was = p.getAttribute('data-r4') === '1';
        p.setAttribute('data-r4', on ? '1' : '0');
        if (!on || was || reduce() || !p.getTotalLength) return;
        var len = p.getTotalLength();
        p.style.setProperty('--r4-len', len);
        p.style.strokeDasharray = len + ' ' + len;
        p.classList.remove('r4-draw'); void p.getBoundingClientRect(); p.classList.add('r4-draw');
        p.addEventListener('animationend', function end() {
          p.removeEventListener('animationend', end);
          p.classList.remove('r4-draw'); p.style.strokeDasharray = '';
        });
      });
    };
    mark();
    watch(hang, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] }, mark);
  }

  function run() {
    [atlas, chrono, gold, sources].forEach(function (f) { try { f(); } catch (e) { if (window.console) console.warn('runda4', e); } });
  }
  // modulele se construiesc la încărcare (unele cu întârziere); pornim după ele
  if (document.readyState === 'complete') setTimeout(run, 120);
  else addEventListener('load', function () { setTimeout(run, 120); });
})();
