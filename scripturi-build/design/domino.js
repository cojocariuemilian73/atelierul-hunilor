/* Efectul de domino: piesele cad în lanț o singură dată, când pista ajunge în ecran, și rămân culcate.
   Unghiul final al fiecărei piese se calculează din geometrie: ultima stă pe pământ (90°), iar fiecare piesă de dinainte
   se sprijină de cea care urmează. Căderea se calculează cadru cu cadru: fiecare piesă cade liber, dar nu trece de vecina ei.
   „Reia” le ridică și le lasă din nou. */
(function () {
  var STEP = 260; // ms între piese

  // dreptunghiul piesei rotit în jurul colțului din dreapta-jos (coordonate cu y în sus)
  function rect(px, w, h, deg) {
    var a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return [[-w, 0], [0, 0], [0, h], [-w, h]].map(function (p) { return [px + p[0] * c + p[1] * s, -p[0] * s + p[1] * c]; });
  }
  function overlap(A, B) {
    var polys = [A, B];
    for (var k = 0; k < 2; k++) {
      var P = polys[k];
      for (var i = 0; i < 4; i++) {
        var a = P[i], b = P[(i + 1) % 4], nx = a[1] - b[1], ny = b[0] - a[0];
        var mA = Infinity, MA = -Infinity, mB = Infinity, MB = -Infinity;
        A.forEach(function (p) { var d = p[0] * nx + p[1] * ny; if (d < mA) mA = d; if (d > MA) MA = d; });
        B.forEach(function (p) { var d = p[0] * nx + p[1] * ny; if (d < mB) mB = d; if (d > MB) MB = d; });
        if (MA <= mB + 1e-6 || MB <= mA + 1e-6) return false;
      }
    }
    return true;
  }
  // primul unghi la care piesa i atinge piesa i+1 (aflată la unghiul next)
  function contact(i, w, h, pitch, next) {
    var B = rect((i + 1) * pitch + w, w, h, next);
    for (var d = 0; d <= 90; d += 0.25) if (overlap(rect(i * pitch + w, w, h, d), B)) return Math.max(0, d - 0.25);
    return 90;
  }
  // tabelul contactelor: pentru fiecare unghi al piesei următoare (din 0,5 în 0,5 grade), cât poate cădea piesa dinainte
  function geometry(track) {
    var cs = getComputedStyle(track);
    var w = parseFloat(cs.getPropertyValue('--w')), h = parseFloat(cs.getPropertyValue('--h')), pitch = parseFloat(cs.getPropertyValue('--pitch'));
    var table = [];
    for (var k = 0; k <= 180; k++) table.push(contact(0, w, h, pitch, k / 2));
    return { table: table, hit: table[0] };
  }
  function limit(g, next) {
    var x = Math.max(0, Math.min(90, next)) * 2, k = Math.floor(x), f = x - k;
    return k >= 180 ? g.table[180] : g.table[k] * (1 - f) + g.table[k + 1] * f;
  }
  // unghiurile tuturor pieselor la momentul t: fiecare cade liber, dar nu poate trece de piesa următoare
  function angles(g, n, t, fallMs) {
    var out = new Array(n);
    for (var i = n - 1; i >= 0; i--) {
      var u = Math.max(0, Math.min(1, (t - i * STEP) / fallMs));
      var free = 90 * u * u;
      out[i] = i === n - 1 ? free : Math.min(free, limit(g, out[i + 1]));
    }
    return out;
  }

  function init() {
    var fig = document.getElementById('domino');
    if (!fig) return;
    var track = fig.querySelector('.dmn-track');
    var pieces = Array.prototype.slice.call(fig.querySelectorAll('.dmn-piece'));
    if (!track || !pieces.length) return;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var n = pieces.length, g = geometry(track), fallen = false, raf = 0;
    // căderea liberă ajunge la unghiul de contact exact când trebuie să pornească piesa următoare
    var fallMs = STEP / Math.sqrt(g.hit / 90);

    function place(deg) { pieces.forEach(function (p, i) { p.style.transform = 'rotate(' + (deg ? deg[i].toFixed(2) : 0) + 'deg)'; }); }
    function stop() { cancelAnimationFrame(raf); raf = 0; }
    function rest() { return angles(g, n, Infinity, fallMs); }

    function fall(instant) {
      fallen = true;
      fig.classList.add('is-fallen');
      stop();
      if (instant || reduce || !window.requestAnimationFrame) { place(rest()); return; }
      var t0 = null, end = (n - 1) * STEP + fallMs + 400;
      (function frame(now) {
        if (t0 === null) t0 = now;
        var t = now - t0;
        place(angles(g, n, t, fallMs));
        if (t < end) raf = requestAnimationFrame(frame); else { raf = 0; place(rest()); }
      })(performance.now());
    }

    if (reduce || !('IntersectionObserver' in window)) fall(true);
    else {
      // urmărește chiar pista, nu toată figura, ca piesele să cadă când se văd
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { fall(); io.disconnect(); } });
      }, { threshold: 0.6 });
      io.observe(track);
    }

    // pe telefon piesele au alte dimensiuni: recalculează unghiurile
    var mq = window.matchMedia && matchMedia('(max-width: 720px)');
    function refit() { g = geometry(track); fallMs = STEP / Math.sqrt(g.hit / 90); if (fallen) { stop(); place(rest()); } }
    if (mq) { if (mq.addEventListener) mq.addEventListener('change', refit); else if (mq.addListener) mq.addListener(refit); }

    var btn = fig.querySelector('.dmn-replay');
    if (btn) btn.addEventListener('click', function () {
      stop();
      fig.classList.remove('is-fallen');
      // ridică piesele și stinge cartonașele fără tranziție, apoi le lasă să cadă din nou
      var steps = fig.querySelectorAll('.dmn-step');
      Array.prototype.forEach.call(steps, function (s) { s.style.transition = 'none'; });
      place(null);
      void fig.offsetWidth;
      Array.prototype.forEach.call(steps, function (s) { s.style.transition = ''; });
      setTimeout(function () { fall(); }, 120);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
