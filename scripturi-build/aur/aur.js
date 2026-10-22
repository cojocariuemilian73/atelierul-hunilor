(function(){
  // Aurul hunilor: graficul stă fix pe ecran, iar monedele cad una câte una pe măsură ce derulezi.
  var gs = document.getElementById('gold-story');
  if (!gs) return;
  var pin = gs.querySelector('.gs-pin');
  var COIN = 'fill="url(#gs-coin)" stroke="#6b5210" stroke-width="1"';
  // un teanc: câte o monedă la 50 de livre (350 → 7, 700 → 14, 2.100 → 42)
  function stack(cls, x, n){
    var h = '<g class="gs-stk ' + cls + '">';
    for (var i = 0; i < n; i++) h += '<ellipse cx="' + x + '" cy="' + (336 - i * 6.6).toFixed(1) + '" rx="26" ry="6.5" ' + COIN + '/>';
    return h + '</g>';
  }
  // restanța de 6.000 de livre: o grămadă de 120 de monede mai mici, pe 15 rânduri
  function mound(x){
    var h = '<g class="gs-stk sm">';
    for (var r = 0; r < 15; r++) {
      var n = 15 - r, w = 9.4;
      for (var j = 0; j < n; j++) h += '<ellipse cx="' + (x - (n - 1) * w / 2 + j * w).toFixed(1) + '" cy="' + (336 - r * 5.5).toFixed(1) + '" rx="5.4" ry="2.6" ' + COIN + '/>';
    }
    return h + '</g>';
  }
  document.getElementById('gs-stacks').innerHTML = stack('s1', 120, 7) + stack('s2', 250, 14) + stack('s3', 380, 42) + mound(510);
  // înainte de primul pas: conturul teancurilor, cu semne de întrebare
  function ghost(x, n){ var top = 336 - (n - 1) * 6.6 - 6.5; return '<rect x="' + (x - 26) + '" y="' + top.toFixed(1) + '" width="52" height="' + (343 - top).toFixed(1) + '" rx="10"/><text x="' + x + '" y="' + ((top + 343) / 2 + 8).toFixed(1) + '">?</text>'; }
  document.getElementById('gs-ghost').innerHTML = ghost(120, 7) + ghost(250, 14) + ghost(380, 42) +
    '<path d="M440 343 L510 259 L580 343 Z"/><text x="510" y="326">?</text>' +
    '<text class="gs-hint" x="200" y="120">Derulează: la fiecare an</text><text class="gs-hint" x="200" y="142">cade un nou teanc de aur</text>';
  var coins = document.getElementById('gs-coins'), h = '', cols = 19, n = 151;
  for (var i = 0; i < n; i++) {
    var c = i % cols, r = Math.floor(i / cols);
    h += '<circle cx="' + (84 + c * 24) + '" cy="' + (78 + r * 24) + '" r="9.5" fill="url(#gs-coin)" stroke="#6b5210" stroke-width="1"/>';
  }
  coins.innerHTML = h;
  function list(sel){ return Array.prototype.slice.call(gs.querySelectorAll(sel)); }
  // monedele, în ordinea în care cad, pe pași: 1 → 350, 2 → 700, 3 → 2.100 și restanța, 4 → solizii
  var GROUPS = [[], list('.s1 ellipse'), list('.s2 ellipse'), list('.s3 ellipse').concat(list('.sm ellipse')), list('.gs-coins circle'), []];
  var shown = GROUPS.map(function(){ return 0; });
  // cât din derulare ține fiecare pas (începutul, 422, 435, 447, monedele, 450)
  var SPAN = [0.07, 0.15, 0.17, 0.27, 0.18, 0.16], EDGE = [0];
  SPAN.forEach(function(v, k){ EDGE.push(EDGE[k] + v); });

  // pașii: butoane cu anii, deasupra textului
  var steps = list('.gs-step');
  var LAB = ['Începutul', 'c. 422', '435', '447', 'În monede', '450'];
  var nav = document.createElement('div');
  nav.className = 'gs-nav'; nav.setAttribute('role', 'group'); nav.setAttribute('aria-label', 'Pașii graficului');
  nav.innerHTML = steps.map(function(st, k){ return '<button type="button" data-s="' + st.getAttribute('data-s') + '" aria-pressed="false">' + (LAB[k] || st.getAttribute('data-s')) + '</button>'; }).join('');
  steps[0].parentNode.insertBefore(nav, steps[0]);
  var btns = list('.gs-nav button'), cur = '', timer = 0;
  // cifrele de deasupra teancurilor numără de la 0 când apar
  var LABS = list('.gs-lab').map(function(t){ return { el: t, txt: t.textContent, v: +t.textContent.replace(/[^0-9]/g, ''), on: false }; });
  var NEED = [1, 2, 3, 3];
  function count(L){
    var t0 = 0, pre = L.txt.charAt(0) === '+' ? '+' : '';
    function step(ts){
      if (!L.on) return;
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / 700), v = Math.round(L.v * (1 - Math.pow(1 - k, 3)));
      L.el.textContent = pre + v.toLocaleString('ro-RO');
      if (k < 1) requestAnimationFrame(step); else L.el.textContent = L.txt;
    }
    requestAnimationFrame(step);
  }
  function labels(s){
    LABS.forEach(function(L, k){
      var on = +s >= NEED[k] && s !== '4';
      if (on && !L.on) { L.on = true; L.el.textContent = L.txt.charAt(0) === '+' ? '+0' : '0'; count(L); }
      else if (!on && L.on) { L.on = false; L.el.textContent = L.txt; }
    });
  }
  function set(s){
    if (s === cur) return;
    cur = s;
    labels(s);
    gs.setAttribute('data-s', s);
    steps.forEach(function(st){ st.classList.toggle('on', st.getAttribute('data-s') === s); });
    btns.forEach(function(b){ var on = b.getAttribute('data-s') === s; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  }
  // câte monede din fiecare grup sunt căzute; schimbăm doar diferența
  function fill(k, m){
    var g = GROUPS[k];
    m = Math.max(0, Math.min(g.length, Math.round(m)));
    if (m === shown[k]) return;
    for (var j = Math.min(m, shown[k]); j < Math.max(m, shown[k]); j++) g[j].classList.toggle('in', j < m);
    shown[k] = m;
  }
  // t = progresul pe pași, de la 0 la 6
  function show(t){
    var s = Math.min(5, Math.floor(t));
    set(String(s));
    for (var k = 1; k < GROUPS.length; k++) fill(k, k < s ? GROUPS[k].length : k > s ? 0 : (t - s) / 0.85 * GROUPS[k].length);
    // solizii rămân doar la pasul lor; teancurile rămân până la capăt
    if (s > 4) fill(4, 0);
  }
  function all(){ set('5'); for (var k = 1; k < 4; k++) fill(k, GROUPS[k].length); }

  var scrolly = false, top = 0, raf = 0;
  function navH(){ return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 44; }
  // derularea conduce povestea doar dacă graficul și textul încap pe ecran
  function layout(){
    gs.classList.remove('scrolly'); gs.style.height = '';
    var room = window.innerHeight - navH(), ph = pin.offsetHeight;
    scrolly = ph <= room - 16;
    if (!scrolly) return;
    top = navH() + Math.max(8, (room - ph) / 2);
    gs.classList.add('scrolly');
    gs.style.height = Math.round(ph + window.innerHeight * 2.6) + 'px';
    pin.style.top = top + 'px';
  }
  function prog(){ var len = gs.offsetHeight - pin.offsetHeight; return len > 0 ? Math.max(0, Math.min(1, (top - gs.getBoundingClientRect().top) / len)) : 1; }
  function upd(){
    raf = 0;
    if (!scrolly) return;
    var p = prog(), k = 0;
    while (k < SPAN.length - 1 && p >= EDGE[k + 1]) k++;
    show(k + (p - EDGE[k]) / SPAN[k]);
  }
  function req(){ if (!raf) raf = requestAnimationFrame(upd); }

  nav.addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b) return;
    var k = +b.getAttribute('data-s');
    clearInterval(timer);
    if (!scrolly) { set(String(k)); for (var j = 1; j < GROUPS.length; j++) fill(j, j <= k && !(j === 4 && k > 4) ? GROUPS[j].length : 0); return; }
    // sărim în derulare la sfârșitul pasului ales; monedele cad pe drum
    var len = gs.offsetHeight - pin.offsetHeight, at = k === 0 ? EDGE[0] + 0.02 : EDGE[k] + SPAN[k] * 0.9;
    window.scrollTo({ top: gs.getBoundingClientRect().top + window.pageYOffset - top + at * len, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });

  set('0');
  layout();
  if (!('IntersectionObserver' in window)) { all(); return; }
  window.addEventListener('scroll', req, { passive: true });
  var rz = 0;
  window.addEventListener('resize', function(){ clearTimeout(rz); rz = setTimeout(function(){ layout(); upd(); }, 150); });
  // pagina e ascunsă la început (display: none): o măsurăm din nou când devine vizibilă
  if ('ResizeObserver' in window) new ResizeObserver(function(){ var was = scrolly; layout(); if (scrolly || was) upd(); }).observe(pin);
  upd();
  // pe ecranele unde nu încape, pașii trec singuri la prima vedere, câte unul la 3,2 secunde
  var io = new IntersectionObserver(function(entries){
    if (!entries[0].isIntersecting || scrolly) return;
    io.disconnect();
    var k = 0;
    show(1.9);
    timer = setInterval(function(){ k++; if (k >= steps.length - 1 || scrolly) { clearInterval(timer); if (!scrolly) all(); return; } show(k + 1.9); }, 3200);
  }, { threshold: 0.5 });
  io.observe(gs.querySelector('.gs-chart'));
})();
