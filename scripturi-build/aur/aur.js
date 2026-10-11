(function(){
  // Aurul hunilor: graficul se construiește pe măsură ce derulezi pașii din stânga.
  var gs = document.getElementById('gold-story');
  if (!gs) return;
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
