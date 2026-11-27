
/* fx: animațiile site-ului */
(function(){
  if (!('IntersectionObserver' in window)) return;
  var de = document.documentElement;
  de.classList.add('fx');
  // mișcările mari (paralaxă, înclinare, împărțirea cărților) doar fără „reducerea mișcării”
  var move = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (move) de.classList.add('fx-move');
  function each(sel, fn){ Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }
  function once(el, fn, opt){
    if (!el) return;
    var o = new IntersectionObserver(function(e){ if (e[0].isIntersecting) { o.disconnect(); fn(); } }, opt || { threshold: 0.3 });
    o.observe(el);
  }

  // titlurile: fiecare cuvânt devine un <span class="fw">; elementele din titlu (em) se împart și ele
  var n = 0;
  function split(el){
    Array.prototype.slice.call(el.childNodes).forEach(function(nd){
      if (nd.nodeType === 1) { if (!/^(SUP|BR|SVG|IMG)$/i.test(nd.nodeName)) split(nd); return; }
      if (nd.nodeType !== 3 || !nd.nodeValue.trim()) return;
      var frag = document.createDocumentFragment();
      nd.nodeValue.split(/(\s+)/).forEach(function(w){
        if (!w) return;
        if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
        var s = document.createElement('span');
        s.className = 'fw'; s.style.setProperty('--i', n++); s.textContent = w;
        frag.appendChild(s);
      });
      el.replaceChild(frag, nd);
    });
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('fw-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -12% 0px' });
  Array.prototype.slice.call(document.querySelectorAll('h1.title, .sec-title, .sub-title, .md-title, .dc-epithet, .pq blockquote p')).forEach(function(el){
    n = 0; split(el);
    el.classList.add('fw-host');
    if (el.classList.contains('dc-epithet') || el.closest('.pq')) el.classList.add('ink');
    io.observe(el);
  });

  // harta marilor migrații se desenează când e pe jumătate pe ecran; săgețile apar la capătul drumurilor
  var hv = document.querySelector('.fig-invazii');
  if (hv) {
    var hio = new IntersectionObserver(function(e){
      if (!e[0].isIntersecting) return;
      hio.disconnect();
      hv.classList.add('hv-on');
      setTimeout(function(){ hv.classList.add('hv-end'); }, 4700);
    }, { threshold: 0.45 });
    hio.observe(hv);
  }

  // prima literă a capitolului se pictează: o scoatem din ::first-letter într-un <span>
  each('.lede', function(p){
    var w = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, null), nd;
    while ((nd = w.nextNode()) && !nd.nodeValue.trim());
    if (!nd) return;
    var i = nd.nodeValue.search(/\S/), sp = document.createElement('span');
    sp.className = 'dc'; sp.setAttribute('aria-hidden', 'true'); sp.setAttribute('data-l', nd.nodeValue.charAt(i));
    // cititoarele de ecran citesc cuvântul întreg, din textul rămas
    var sr = document.createElement('span'); sr.className = 'sr-only'; sr.style.cssText = 'font-size:0'; sr.textContent = nd.nodeValue.charAt(i);
    nd.nodeValue = nd.nodeValue.slice(i + 1);
    nd.parentNode.insertBefore(sp, nd); nd.parentNode.insertBefore(sr, nd);
    p.classList.add('dcx');
    once(p, function(){ p.classList.add('dc-in'); });
  });

  if (move) {
    // imaginea din deschidere coboară mai încet decât pagina
    var hb = document.querySelector('.hero-bg'), hero = hb && hb.parentNode, hraf = 0;
    if (hb) window.addEventListener('scroll', function(){
      if (hraf) return;
      hraf = requestAnimationFrame(function(){
        hraf = 0;
        var y = window.pageYOffset;
        if (y <= hero.offsetTop + hero.offsetHeight) hb.style.transform = 'translate3d(0,' + (y * 0.32).toFixed(1) + 'px,0)';
      });
    }, { passive: true });

    // dosarele de mituri: când se deschide teancul, se revarsă unul după altul
    each('.mx-closed', function(host){
      var mo = new MutationObserver(function(){
        if (host.classList.contains('mx-closed')) return;
        mo.disconnect();
        var k = 0;
        Array.prototype.forEach.call(host.children, function(c){ if (c.matches('.mx-item, .mx-facts')) c.style.setProperty('--k', k++); });
        host.classList.add('mx-fan');
        setTimeout(function(){ host.classList.remove('mx-fan'); }, 600 + k * 90);
      });
      mo.observe(host, { attributes: true, attributeFilter: ['class'] });
    });

    // cronologia: punctele răsar pe rând, de la stânga la dreapta
    var hm = document.getElementById('hx-marks');
    once(hm, function(){
      var k = 0;
      Array.prototype.slice.call(hm.querySelectorAll('.hx-mk')).sort(function(a, b){ return parseFloat(a.style.left) - parseFloat(b.style.left); }).forEach(function(m){ m.style.setProperty('--k', k++); });
      hm.classList.add('hx-seen', 'hx-up');
      setTimeout(function(){ hm.classList.remove('hx-up'); }, 600 + k * 45);
    }, { threshold: 0.6 });

    // muzeul și fișele lui Attila și Aetius: înclinarea după mouse (doar cu mouse-ul, nu la atingere)
    if (window.matchMedia('(hover: hover)').matches) {
      document.addEventListener('pointermove', function(e){
        if (e.pointerType !== 'mouse') return;
        var st = e.target.closest && e.target.closest('.m-lab .viewer-stage, .duel-card .dc-img');
        each('.tilt', function(o){ if (!st || o.parentNode !== st) { o.classList.remove('tilt'); o.style.transform = ''; } });
        if (!st) return;
        var o = st.querySelector('.viewer-object') || st.querySelector('img'), r = st.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        o.classList.add('tilt');
        o.style.transform = 'perspective(900px) rotateX(' + ((0.5 - y) * 7).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 9).toFixed(2) + 'deg)';
        o.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); o.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      }, { passive: true });
    }

    // Jocul izvoarelor: prima dată când vezi masa, sursele sunt împărțite una câte una
    var tray = document.getElementById('md-tray');
    once(tray, function(){
      var k = 0;
      each('#md-tray .md-card', function(c){ c.style.setProperty('--k', k++); });
      tray.classList.add('md-deal');
      setTimeout(function(){ tray.classList.remove('md-deal'); }, 700 + k * 55);
    }, { threshold: 0.2 });
  }

  // cortina dintre pagini, cu numele paginii noi
  var pages = Array.prototype.slice.call(document.querySelectorAll('.site-page'));
  var names = Array.prototype.slice.call(document.querySelectorAll('.site-nav a')).map(function(a){ return (a.querySelector('.nav-long') || a).textContent.trim(); });
  if (!pages.length || !('MutationObserver' in window)) return;
  function active(){ for (var k = 0; k < pages.length; k++) if (pages[k].classList.contains('active')) return k; return -1; }
  var was = active(), cur = document.createElement('div');
  cur.className = 'pg-curtain'; cur.setAttribute('aria-hidden', 'true'); cur.innerHTML = '<b></b>';
  document.body.appendChild(cur);
  cur.addEventListener('animationend', function(e){ if (e.target === cur) cur.classList.remove('go'); });
  var mo = new MutationObserver(function(){
    var k = active();
    if (k < 0 || k === was) return;
    was = k;
    cur.querySelector('b').textContent = names[k] || '';
    cur.classList.remove('go'); void cur.offsetWidth; cur.classList.add('go');
  });
  pages.forEach(function(p){ mo.observe(p, { attributes: true, attributeFilter: ['class'] }); });
})();
