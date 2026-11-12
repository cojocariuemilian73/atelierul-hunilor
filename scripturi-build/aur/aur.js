(function(){
  // Aurul hunilor: toate teancurile stau pe grafic deodată; butoanele cu anii scot în față unul și schimbă textul.
  var gs = document.getElementById('gold-story');
  if (!gs) return;
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
  var coins = document.getElementById('gs-coins'), h = '', cols = 19, n = 151;
  for (var i = 0; i < n; i++) {
    var c = i % cols, r = Math.floor(i / cols);
    h += '<circle cx="' + (84 + c * 24) + '" cy="' + (78 + r * 24) + '" r="9.5" fill="url(#gs-coin)" stroke="#6b5210" stroke-width="1"/>';
  }
  coins.innerHTML = h;
  function list(sel){ return Array.prototype.slice.call(gs.querySelectorAll(sel)); }

  // pașii: butoane cu anii, deasupra textului
  var steps = list('.gs-step');
  var LAB = ['Începutul', 'c. 422', '435', '447', 'În monede', '450'];
  var nav = document.createElement('div');
  nav.className = 'gs-nav'; nav.setAttribute('role', 'group'); nav.setAttribute('aria-label', 'Pașii graficului');
  nav.innerHTML = steps.map(function(st, k){ return '<button type="button" data-s="' + st.getAttribute('data-s') + '" aria-pressed="false">' + (LAB[k] || st.getAttribute('data-s')) + '</button>'; }).join('');
  steps[0].parentNode.insertBefore(nav, steps[0]);
  var btns = list('.gs-nav button'), cur = '';
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // monedele de solizi apar doar la pasul lor, de la stânga la dreapta
  var COINS = list('.gs-coins circle');
  function solidi(on){ COINS.forEach(function(el, k){ el.style.transitionDelay = on && !still ? (k * 4) + 'ms' : '0ms'; el.classList.toggle('in', on); }); }

  function set(s){
    if (s === cur) return;
    cur = s;
    gs.setAttribute('data-s', s);
    steps.forEach(function(st){ st.classList.toggle('on', st.getAttribute('data-s') === s); });
    btns.forEach(function(b){ var on = b.getAttribute('data-s') === s; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    solidi(s === '4');
  }
  nav.addEventListener('click', function(e){
    var b = e.target.closest('button'); if (b) set(b.getAttribute('data-s'));
  });

  // la prima vedere teancurile cad o dată, unul după altul, iar cifrele numără de la 0
  var LABS = list('.gs-lab').map(function(t){ return { el: t, txt: t.textContent, v: +t.textContent.replace(/[^0-9]/g, '') }; });
  function count(L, wait){
    var t0 = 0, pre = L.txt.charAt(0) === '+' ? '+' : '';
    L.el.textContent = pre + '0';
    function step(ts){
      if (!t0) t0 = ts + wait;
      var k = Math.max(0, Math.min(1, (ts - t0) / 700)), v = Math.round(L.v * (1 - Math.pow(1 - k, 3)));
      L.el.textContent = pre + v.toLocaleString('ro-RO');
      if (k < 1) requestAnimationFrame(step); else L.el.textContent = L.txt;
    }
    requestAnimationFrame(step);
  }
  function drop(){
    gs.classList.add('gs-in');
    var d = 0;
    list('.gs-stk').forEach(function(g, k){
      list('.gs-stk.' + g.classList[1] + ' ellipse').forEach(function(el, j){
        el.style.transitionDelay = still ? '0ms' : (d + j * (k === 3 ? 4 : 22)) + 'ms';
        el.classList.add('in');
      });
      if (!still) count(LABS[k], d);
      d += still ? 0 : 380;
    });
  }

  set('0');
  if (still || !('IntersectionObserver' in window)) { drop(); return; }
  var io = new IntersectionObserver(function(entries){
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    drop();
  }, { threshold: 0.35 });
  io.observe(gs.querySelector('.gs-chart'));
})();
