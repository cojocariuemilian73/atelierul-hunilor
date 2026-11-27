
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
  // restanța de 6.000 de livre, la aceeași scară: 120 de monede, în trei teancuri de câte 40
  function mound(x){
    var h = '<g class="gs-stk sm">';
    [-46, 0, 46].forEach(function(dx){
      for (var i = 0; i < 40; i++) h += '<ellipse cx="' + (x + dx) + '" cy="' + (336 - i * 6.6).toFixed(1) + '" rx="21" ry="5.4" ' + COIN + '/>';
    });
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
  var LAB = ['Începutul', 'c. 422', 'anii 430', '443 / 447', '450', 'În monede'];
  var nav = document.createElement('div');
  nav.className = 'gs-nav'; nav.setAttribute('role', 'group'); nav.setAttribute('aria-label', 'Pașii graficului');
  nav.innerHTML = steps.map(function(st, k){ return '<button type="button" data-s="' + st.getAttribute('data-s') + '" aria-pressed="false">' + (LAB[k] || st.getAttribute('data-s')) + '</button>'; }).join('');
  steps[0].parentNode.insertBefore(nav, steps[0]);
  var btns = list('.gs-nav button'), cur = '';
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var replay = gs.querySelector('.gs-replay');

  // monedele de solizi apar doar la pasul lor
  var COINS = list('.gs-coins circle');
  // cad de sus, ca într-un teanc: întâi rândul de jos, de la stânga la dreapta
  var ROWS = Math.ceil(COINS.length / cols);
  function solidi(on){ COINS.forEach(function(el, k){ var r = Math.floor(k / cols), c = k % cols, ord = (ROWS - 1 - r) * cols + c; el.style.transitionDelay = on && !motion.matches ? (ord * 7) + 'ms' : '0ms'; el.classList.toggle('in', on); }); }

  function set(s){
    if (s === cur) return;
    cur = s;
    gs.setAttribute('data-s', s);
    steps.forEach(function(st){ st.classList.toggle('on', st.getAttribute('data-s') === s); });
    btns.forEach(function(b){ var on = b.getAttribute('data-s') === s; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    solidi(s === '5');
  }
  nav.addEventListener('click', function(e){
    var b = e.target.closest('button'); if (b) set(b.getAttribute('data-s'));
  });

  // Derularea controlează cât a căzut din fiecare teanc. Reluarea folosește aceeași secvență.
  var chart = gs.querySelector('.gs-chart svg');
  var labels = list('.gs-lab').map(function(el){
    return { el: el, text: el.textContent, value: Number(el.textContent.replace(/[^0-9]/g, '')) };
  });
  var stackStarts = [0, .16, .33, .53];
  var progress = -1;
  var frame = 0;
  var replayStart = null;

  list('.gs-stk').forEach(function(group, index){
    var stack = group.querySelectorAll('ellipse');
    var stagger = index === 3 ? .16 : .18;
    stack.forEach(function(coin, i){
      var delay = stackStarts[index] + stagger * i / Math.max(1, stack.length - 1);
      coin.style.setProperty('--gs-delay', delay.toFixed(3));
    });
  });

  function clamp(value){ return Math.min(1, Math.max(0, value)); }

  function paint(value){
    if (value === progress) return;
    progress = value;
    gs.style.setProperty('--gs-drop', value);
    gs.classList.toggle('gs-in', value > 0);
    var hideReplay = motion.matches || (value < 1 && replay.hidden);
    if (replay.hidden !== hideReplay) replay.hidden = hideReplay;
    labels.forEach(function(label, index){
      var amount = clamp((value - stackStarts[index]) / .32);
      var number = Math.round(label.value * amount);
      var prefix = label.text.charAt(0) === '+' ? '+' : '';
      var text = amount === 1 ? label.text : prefix + number.toLocaleString('ro-RO');
      if (label.el.textContent !== text) label.el.textContent = text;
    });
  }

  function draw(now){
    frame = 0;
    if (motion.matches) {
      replayStart = null;
      paint(1);
      replay.hidden = true;
      return;
    }
    if (replayStart !== null) {
      var elapsed = clamp((now - replayStart) / 1800);
      paint(elapsed);
      if (elapsed < 1) schedule();
      else replayStart = null;
      return;
    }
    var rect = chart.getBoundingClientRect();
    if (!rect.height) return;
    var viewport = document.documentElement.clientHeight;
    var travel = Math.min(365, Math.max(150, rect.height * .72));
    paint(clamp((viewport * .78 - rect.top) / travel));
  }

  function schedule(){
    if (!frame) frame = requestAnimationFrame(draw);
  }

  set('0');
  replay.addEventListener('click', function(){
    if (motion.matches) return;
    set('0');
    replayStart = performance.now();
    paint(0);
    schedule();
  });
  function motionChange(){
    replayStart = null;
    replay.hidden = true;
    schedule();
  }
  if (motion.addEventListener) motion.addEventListener('change', motionChange);
  else if (motion.addListener) motion.addListener(motionChange);
  window.addEventListener('scroll', function(){ if (replayStart === null) schedule(); }, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('load', schedule, { once: true });
  if ('ResizeObserver' in window) {
    var observer = new ResizeObserver(schedule);
    observer.observe(chart);
    var articlePage = gs.closest('.site-page');
    if (articlePage) observer.observe(articlePage);
  }
  schedule();
})();
