(function(){
  // Aurul hunilor: tributul crește în teancuri de monede, pe măsură ce derulezi pașii din stânga.
  var gs = document.getElementById('gold-story');
  if (!gs) return;
  var COIN = 'fill="url(#gs-coin)" stroke="#6b5210" stroke-width="1"';
  // un teanc: câte o monedă la 50 de livre (350 → 7, 700 → 14, 2.100 → 42)
  function stack(cls, x, n){
    var h = '<g class="gs-stk ' + cls + '">';
    for (var i = 0; i < n; i++) h += '<ellipse cx="' + x + '" cy="' + (336 - i * 6.6).toFixed(1) + '" rx="26" ry="6.5" ' + COIN + ' style="transition-delay:' + (i * 22) + 'ms"/>';
    return h + '</g>';
  }
  // restanța de 6.000 de livre: o grămadă de 120 de monede mai mici, pe 15 rânduri
  function mound(x){
    var h = '<g class="gs-stk sm">', k = 0;
    for (var r = 0; r < 15; r++) {
      var n = 15 - r, w = 9.4;
      for (var j = 0; j < n; j++, k++) h += '<ellipse cx="' + (x - (n - 1) * w / 2 + j * w).toFixed(1) + '" cy="' + (336 - r * 5.5).toFixed(1) + '" rx="5.4" ry="2.6" ' + COIN + ' style="transition-delay:' + (300 + k * 5) + 'ms"/>';
    }
    return h + '</g>';
  }
  document.getElementById('gs-stacks').innerHTML = stack('s1', 120, 7) + stack('s2', 250, 14) + stack('s3', 380, 42) + mound(510);
  // înainte de primul pas: conturul teancurilor, cu semne de întrebare
  function ghost(x, n){ var top = 336 - (n - 1) * 6.6 - 6.5; return '<rect x="' + (x - 26) + '" y="' + top.toFixed(1) + '" width="52" height="' + (343 - top).toFixed(1) + '" rx="10"/><text x="' + x + '" y="' + ((top + 343) / 2 + 8).toFixed(1) + '">?</text>'; }
  document.getElementById('gs-ghost').innerHTML = ghost(120, 7) + ghost(250, 14) + ghost(380, 42) +
    '<path d="M440 343 L510 259 L580 343 Z"/><text x="510" y="326">?</text>' +
    '<text class="gs-hint" x="200" y="120">Derulează: la fiecare pas</text><text class="gs-hint" x="200" y="142">crește un nou teanc de aur</text>';
  var coins = document.getElementById('gs-coins'), h = '', cols = 19, n = 151;
  for (var i = 0; i < n; i++) {
    var c = i % cols, r = Math.floor(i / cols);
    h += '<circle cx="' + (84 + c * 24) + '" cy="' + (78 + r * 24) + '" r="9.5" fill="url(#gs-coin)" stroke="#6b5210" stroke-width="1" style="transition-delay:' + (i * 6) + 'ms"/>';
  }
  coins.innerHTML = h;
  var steps = Array.prototype.slice.call(gs.querySelectorAll('.gs-step'));
  function set(s){
    gs.setAttribute('data-s', s);
    steps.forEach(function(st){ st.classList.toggle('on', st.getAttribute('data-s') === s); });
  }
  set('0');
  if (!('IntersectionObserver' in window)) { set('5'); return; }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if (e.isIntersecting) set(e.target.getAttribute('data-s')); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(function(st){ io.observe(st); });
})();
