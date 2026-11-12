(function(){
  var doc = document.documentElement;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  doc.classList.add('r7-js');
  var hasIO = 'IntersectionObserver' in window;

  // ---------- textul și imaginile apar la derulare, o singură dată ----------
  var page = document.getElementById('page-acasa');
  var VITR = '.hx, .gs, #sec-atlas, #sec-muzeu';
  function once(els, cls, margin){
    if (!hasIO || still) { els.forEach(function(e){ e.classList.add(cls); }); return; }
    var io = new IntersectionObserver(function(en){
      en.forEach(function(x){ if (x.isIntersecting) { x.target.classList.add(cls); io.unobserve(x.target); } });
    }, { rootMargin: margin || '0px 0px -8% 0px' });
    els.forEach(function(e){ io.observe(e); });
  }
  if (page) {
    var rv = [];
    Array.prototype.forEach.call(page.querySelectorAll('article > section'), function(sec){
      if (sec.matches(VITR)) return;
      Array.prototype.forEach.call(sec.children, function(c){
        if (c.matches('.chapter-mark, .pq, .mx, script') || c.matches(VITR) || c.querySelector(VITR)) return;
        c.classList.add('r7-rv'); rv.push(c);
      });
    });
    // ce e deja pe ecran la încărcare apare imediat
    rv.forEach(function(e){ if (e.getBoundingClientRect().top < window.innerHeight * 0.9) e.classList.add('r7-in'); });
    once(rv.filter(function(e){ return !e.classList.contains('r7-in'); }), 'r7-in');
    once(Array.prototype.slice.call(page.querySelectorAll('.pq')), 'r7-in', '0px 0px -20% 0px');
  }

  // ---------- muzeul: punctele roșii pulsează până la primul clic ----------
  var muz = document.getElementById('sec-muzeu');
  if (muz) muz.addEventListener('click', function(e){ if (e.target.closest('.hotspot')) muz.classList.add('r7-hs-seen'); });

  // ---------- meniul: linia aurie alunecă la capitolul curent ----------
  var nav = document.getElementById('site-nav'), row = document.getElementById('toc-row');
  if (nav && row) {
    var bar = document.createElement('i');
    bar.className = 'r7-bar'; bar.setAttribute('aria-hidden', 'true');
    row.appendChild(bar);
    nav.classList.add('r7-slide');
    var links = Array.prototype.slice.call(row.querySelectorAll('a.toc-link'));
    var place = function(){
      var a = row.querySelector('a.toc-link.active');
      if (!a || !a.offsetWidth) { bar.style.opacity = '0'; return; }
      var pad = parseFloat(getComputedStyle(a).paddingLeft) || 0;
      bar.style.width = (a.offsetWidth - 2 * pad) + 'px';
      bar.style.transform = 'translateX(' + (a.offsetLeft + pad) + 'px)';
      bar.style.opacity = '1';
    };
    var mo = new MutationObserver(place);
    links.forEach(function(a){ mo.observe(a, { attributes: true, attributeFilter: ['class'] }); });
    window.addEventListener('resize', place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    place();
  }
})();
