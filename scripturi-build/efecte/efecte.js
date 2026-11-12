/* ef: efecte (cursorul tematic, linia timpului, pergamentul imaginilor, călărețul de sub meniu) */
(function(){
  var doc = document.documentElement;
  var mqR = window.matchMedia('(prefers-reduced-motion: reduce)');
  function reduced(){ return mqR.matches; }
  function on(mq, fn){ if (mq.addEventListener) mq.addEventListener('change', fn); else if (mq.addListener) mq.addListener(fn); }
  var raf = window.requestAnimationFrame || function(f){ return setTimeout(f, 16); };

  // ---------------- A) cursorul tematic (doar mouse, fără „reducerea mișcării”) ----------------
  (function(){
    var mqF = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!mqF.matches) return;
    var NATIVE = 'input, textarea, select, [contenteditable="true"], .md-card:not(.done), .hx-rib, .img-lightbox .lb-view.zoomed, .md-zoom.zoomed';
    var HOT = 'a[href], button, [role="button"], summary, label, .md-card, .md-era, .md-pin, .md-clu-b, .lb-able, .toc-link, [tabindex]:not([tabindex="-1"])';
    var N = 4, built = false, dot, ring, trail = [], mx = -100, my = -100, rx = -100, ry = -100, pts = [], running = false, target = null;
    var atel = document.getElementById('mod-atelier');
    function build(){
      dot = document.createElement('div'); dot.className = 'ef-dot';
      ring = document.createElement('div'); ring.className = 'ef-ring'; ring.innerHTML = '<span></span>';
      [ring, dot].forEach(function(el){ el.setAttribute('aria-hidden', 'true'); document.body.appendChild(el); });
      for (var k = 0; k < N; k++) {
        var t = document.createElement('div'); t.className = 'ef-trail'; t.setAttribute('aria-hidden', 'true');
        document.body.appendChild(t); trail.push(t); pts.push({ x: mx, y: my });
      }
      built = true;
    }
    function active(){ return mqF.matches && !reduced(); }
    function setHidden(h){ [dot, ring].concat(trail).forEach(function(el){ el.classList.toggle('off', h); }); }
    function look(el){
      if (!el || !el.closest) return;
      var nat = !!el.closest(NATIVE) || !!(atel && atel.classList.contains('md-dragging'));
      setHidden(nat);
      ring.classList.toggle('hot', !nat && !!el.closest(HOT));
    }
    function frame(){
      rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
      var px = mx, py = my, moving = Math.abs(mx - rx) + Math.abs(my - ry) > 0.3;
      for (var k = 0; k < N; k++) {
        var p = pts[k]; p.x += (px - p.x) * 0.45; p.y += (py - p.y) * 0.45;
        var d = Math.abs(px - p.x) + Math.abs(py - p.y);
        trail[k].style.transform = 'translate3d(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px,0) scale(' + (0.9 - k * 0.17).toFixed(2) + ')';
        trail[k].style.opacity = Math.min(0.5 - k * 0.1, d / 40).toFixed(2);
        if (d > 0.3) moving = true;
        px = p.x; py = p.y;
      }
      if (moving) raf(frame); else running = false;
    }
    window.addEventListener('pointermove', function(e){
      if (e.pointerType && e.pointerType !== 'mouse') return;
      if (!active()) return;
      if (!built) { build(); rx = e.clientX; ry = e.clientY; pts.forEach(function(p){ p.x = e.clientX; p.y = e.clientY; }); }
      doc.classList.add('ef-cur'); doc.classList.remove('ef-off');
      mx = e.clientX; my = e.clientY;
      if (e.target !== target) { target = e.target; look(target); }
      if (!running) { running = true; raf(frame); }
    }, { passive: true });
    // după un clic, starea (de ex. tragerea unei cărți) se poate schimba sub cursor
    window.addEventListener('pointerdown', function(e){ if (ring) { ring.classList.add('press'); look(e.target); } }, { passive: true });
    window.addEventListener('pointerup', function(e){ if (ring) { ring.classList.remove('press'); setTimeout(function(){ look(e.target); }, 0); } }, { passive: true });
    document.addEventListener('mouseleave', function(){ doc.classList.add('ef-off'); });
    document.addEventListener('mouseenter', function(){ doc.classList.remove('ef-off'); });
    function sync(){ if (!active()) doc.classList.remove('ef-cur'); }
    on(mqR, sync); on(mqF, sync);
  })();

  // ---------------- B) linia timpului ----------------
  (function(){
    var home = document.getElementById('acasa'), page = home && home.closest('.site-page');
    if (!home || !page) return;
    // reperele din cronologia site-ului și locul din articol unde e povestit fiecare
    var REP = [
      { y: '375', aria: '375 d.Hr.', name: 'Sfârșitul regatului lui Ermanaric', sec: 'sec-migratie', cap: '03 · Marea Migrație', find: 'Șocul de la 375' },
      { y: '441–447', aria: '441–447 d.Hr.', name: 'Campaniile din Balcani', sec: 'sec-migratie', cap: '03 · Marea Migrație', find: 'campaniile din 441' },
      { y: '451', aria: '451 d.Hr.', name: 'Câmpiile Catalaunice', sec: 'sec-personalitati', cap: '05 · Personalități', find: 'Formează, în 451' },
      { y: '453', aria: '453 d.Hr.', name: 'Moartea lui Attila', sec: 'sec-personalitati', cap: '05 · Personalități', find: 'moare în 453' },
      { y: '476', aria: '476 d.Hr.', name: 'Sfârșitul Imperiului de Apus', sec: 'sec-personalitati', cap: '05 · Personalități', find: '476 d.Hr.' }
    ];
    function norm(s){ return s.replace(/\s+/g, ' '); }
    function locate(r){
      var sec = document.getElementById(r.sec); if (!sec) return null;
      var best = null, bl = Infinity;
      Array.prototype.forEach.call(sec.querySelectorAll('p, li, dd, dt, h3, h4, figcaption, span, div'), function(el){
        var t = el.textContent; if (t.length >= bl) return;
        if (norm(t).indexOf(r.find) >= 0) { best = el; bl = t.length; }
      });
      return best;
    }
    REP.forEach(function(r){ r.el = locate(r); });
    REP = REP.filter(function(r){ return r.el; });
    if (!REP.length) return;

    var nav = document.createElement('nav');
    nav.className = 'ef-line'; nav.setAttribute('aria-label', 'Repere pe linia timpului');
    nav.innerHTML = '<div class="ef-track" aria-hidden="true"><i class="ef-fill"></i></div>' + REP.map(function(r, k){
      var id = r.el.id || (r.el.id = 'reper-' + r.y.replace(/\D+/g, '-'));
      return '<a class="ef-pt" href="#' + id + '" data-k="' + k + '" aria-label="' + r.aria + ', ' + r.name + '"><span class="ef-lab" aria-hidden="true"><b>' + r.y + '</b>' + r.name + '<small>' + r.cap + '</small></span></a>';
    }).join('');
    document.body.appendChild(nav);
    var fill = nav.querySelector('.ef-fill'), links = nav.querySelectorAll('.ef-pt');

    nav.addEventListener('click', function(e){
      var a = e.target.closest('.ef-pt'); if (!a) return;
      e.preventDefault(); e.stopPropagation();
      var r = REP[+a.getAttribute('data-k')];
      r.el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
      if (!r.el.hasAttribute('tabindex')) r.el.setAttribute('tabindex', '-1');
      r.el.focus({ preventScroll: true });
    });

    function light(k){ var a = links[k]; if (a && !a.classList.contains('lit')) { a.classList.add('lit', 'flash'); setTimeout(function(){ a.classList.remove('flash'); }, 1000); } }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function(en){
        en.forEach(function(x){ if (x.isIntersecting) { light(+x.target.getAttribute('data-ef-k')); io.unobserve(x.target); } });
      }, { rootMargin: '0px 0px -40% 0px' });
      REP.forEach(function(r, k){ r.el.setAttribute('data-ef-k', k); io.observe(r.el); });
    }

    // ---------- D) călărețul de sub meniu: merge de la 370 la 476 pe măsură ce citești ----------
    // un hun călare, cu arcul în mână; picioarele calului (.lg) galopează doar cât derulezi
    var LEG = function(x, c){ return '<path class="lg ' + c + '" d="M' + x + ' 17.6 L' + x + ' 27.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'; };
    var SVG = '<svg viewBox="0 0 38 28" aria-hidden="true" focusable="false">' +
      '<g opacity="0.55">' + LEG(24.8, 'lg-b') + LEG(12.6, 'lg-a') + '</g>' + LEG(23, 'lg-a') + LEG(10.6, 'lg-b') +
      '<g class="ef-body" fill="currentColor">' +
        '<ellipse cx="17" cy="15" rx="9" ry="4.6"/>' +
        '<polygon points="22,13 27,5.5 30.5,6.5 26.5,15.5"/>' +
        '<polygon points="27,4.5 31,4 35.5,7.5 34.5,9.5 30,8.2"/>' +
        '<polygon points="28.4,4.8 29,2.2 30.2,4.5"/>' +
        '<path d="M8.7 12.8 Q5.2 13.8 4.4 19.6 Q6.6 16.6 9.2 15.4 Z"/>' +
        '<path d="M16 11.4 L18.6 16.6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>' +
        '<polygon points="15.2,11.6 17.2,4 19.7,4.4 18.7,11.9"/>' +
        '<circle cx="18.6" cy="2.4" r="1.75"/>' +
        '<polygon points="16.8,1.9 18.9,-1.8 20.5,1.7"/>' +
        '<path d="M18.4 6 L22.4 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
        '<path d="M21.9 -0.4 Q25.8 5 21.9 10.4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' +
        '<path d="M21.9 -0.4 L21.9 10.4" stroke="currentColor" stroke-width="0.5" opacity="0.7"/>' +
      '</g></svg>';
    var ride = document.createElement('div');
    ride.className = 'ef-ride'; ride.setAttribute('aria-hidden', 'true');
    ride.innerHTML = '<div class="ef-rtrack"><i class="ef-rfill"></i>' + REP.map(function(r, k){
      return '<span class="ef-rtick' + (k === REP.length - 1 ? ' last' : '') + '"><b>' + r.y + '</b><i></i></span>';
    }).join('') + '<div class="ef-rider">' + SVG + '<span class="ef-ryr">370 d.Hr.</span></div></div>';
    document.body.appendChild(ride);
    var rtrack = ride.querySelector('.ef-rtrack'), rfill = ride.querySelector('.ef-rfill'), rider = ride.querySelector('.ef-rider'),
        ryr = ride.querySelector('.ef-ryr'), ticks = ride.querySelectorAll('.ef-rtick');
    var siteNav = document.querySelector('.site-nav'), hero = home.querySelector('.hero');
    var rideW = 0, heroEnd = 0, lastU = -1, lastYr = '', goT = null;
    function navBottom(){ return siteNav && !siteNav.classList.contains('st-hide') ? siteNav.offsetHeight : 0; }
    // anul: crește între reperele din text (370 la început, apoi 375, 441, 451, 453, 476 la paragrafele lor)
    function yearAt(p){
      var a = [0, 370];
      for (var k = 0; k < REP.length; k++) {
        var b = [REP[k].raw, parseInt(REP[k].y, 10)];
        if (p <= b[0]) return Math.round(a[1] + (b[1] - a[1]) * Math.max(0, (p - a[0]) / Math.max(1e-6, b[0] - a[0])));
        a = b;
      }
      return a[1];
    }
    function rideFrame(p){
      ride.style.setProperty('--ef-ride-y', navBottom() + 'px');
      ride.classList.toggle('on', window.pageYOffset > heroEnd);
      var end = REP[REP.length - 1].raw || 1, u = Math.max(0, Math.min(1, p / end));
      rfill.style.transform = 'scaleX(' + u.toFixed(4) + ')';
      rider.style.transform = 'translateX(' + (u * rideW).toFixed(1) + 'px)';
      Array.prototype.forEach.call(ticks, function(t, k){ t.classList.toggle('on', u >= REP[k].x - 0.0005); });
      var yr = yearAt(p) + ' d.Hr.'; if (yr !== lastYr) { ryr.textContent = yr; lastYr = yr; }
      if (lastU >= 0 && Math.abs(u - lastU) > 0.00005) {
        ride.classList.toggle('back', u < lastU);
        if (!reduced() && u > 0 && u < 1) {
          ride.classList.add('go'); clearTimeout(goT);
          goT = setTimeout(function(){ ride.classList.remove('go'); }, 200);
        }
      }
      if (u >= 1) ride.classList.remove('back');
      // spre capătul drumului, anul trece în stânga călărețului, ca să nu iasă din ecran
      ride.classList.toggle('lft', u * rideW > rideW - 96);
      lastU = u;
    }

    // pozițiile punctelor: vârful liniei ajunge la un punct când paragraful lui intră în 60% din ecran
    var max = 1, dirty = true, ticking = false;
    function measure(){
      var H = window.innerHeight, sy = window.pageYOffset;
      max = Math.max(1, doc.scrollHeight - H);
      // linia începe sub meniul de sus și sub banda călărețului (chiar dacă meniul e ascuns la derulare)
      var sn = document.querySelector('.site-nav'), top = (sn ? Math.max(sn.offsetHeight, 44) : 60) + ride.offsetHeight;
      nav.style.setProperty('--ef-top', Math.round(top + 12) + 'px');
      // punctele prea apropiate (451 și 453 sunt în paragrafe vecine) se depărtează cu cel puțin 26 px pe linie
      var trackH = Math.max(100, H - top - 12 - 28), gap = 26 / trackH, prev = -1, prevRaw = -1;
      REP.forEach(function(r, k){
        var y = r.el.getBoundingClientRect().top + sy;
        r.f = r.raw = Math.max(0, Math.min(1, (y - H * 0.6) / max));
        if (r.raw <= prevRaw) r.raw = prevRaw + 0.0001;
        prevRaw = r.raw;
        if (prev >= 0 && r.f < prev + gap) r.f = Math.min(1, prev + gap);
        prev = r.f;
        links[k].style.setProperty('--y', r.f.toFixed(4));
      });
      // reperele pe drumul călărețului: 476 e capătul drumului
      var end = REP[REP.length - 1].raw || 1;
      rideW = rtrack.clientWidth;
      // reperele apropiate (451 și 453) se depărtează cu cel puțin 34 px, ca anii să nu se suprapună
      var g = 34 / Math.max(100, rideW), n = REP.length;
      REP.forEach(function(r, k){ r.x = Math.max(r.raw / end, k ? REP[k - 1].x + g : 0); });
      REP[n - 1].x = 1;
      for (var k = n - 2; k >= 0; k--) REP[k].x = Math.min(REP[k].x, REP[k + 1].x - g);
      REP.forEach(function(r, k){ ticks[k].style.setProperty('--x', r.x.toFixed(4)); });
      heroEnd = hero ? Math.max(0, hero.getBoundingClientRect().bottom + sy - 160) : 0;
      dirty = false;
    }
    function frame(){
      ticking = false;
      if (!page.classList.contains('active')) { nav.classList.remove('on'); ride.classList.remove('on'); return; }
      nav.classList.add('on');
      if (dirty) measure();
      var raw = Math.max(0, Math.min(1, window.pageYOffset / max)), p = reduced() ? 1 : raw;
      fill.style.transform = 'scaleY(' + p.toFixed(4) + ')';
      REP.forEach(function(r, k){ if (reduced() || p >= r.f - 0.001) light(k); });
      rideFrame(raw);
    }
    function tick(){ if (!ticking) { ticking = true; raf(frame); } }
    function remeasure(){ dirty = true; tick(); }
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', remeasure);
    window.addEventListener('load', remeasure);
    window.addEventListener('hashchange', remeasure);
    if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(document.body);
    if ('MutationObserver' in window) {
      new MutationObserver(remeasure).observe(page, { attributes: true, attributeFilter: ['class'] });
      // meniul se ascunde sau revine: banda călărețului îl urmează
      if (siteNav) new MutationObserver(tick).observe(siteNav, { attributes: true, attributeFilter: ['class'] });
    }
    on(mqR, remeasure);
    remeasure();
  })();

  // ---------------- C) pergamentul imaginilor ----------------
  (function(){
    var imgs = document.querySelectorAll('img.img-parchment');
    if (!imgs.length) return;
    var io = !reduced() && 'IntersectionObserver' in window ? new IntersectionObserver(function(en){
      en.forEach(function(x){
        if (!x.isIntersecting) return;
        io.unobserve(x.target);
        var w = x.target.__efParch; if (!w) return;
        w.classList.add('ef-open');
        raf(function(){ w.classList.remove('ef-wait'); });
        setTimeout(function(){ w.classList.remove('ef-open'); }, 1600);
      });
    }, { threshold: 0.25 }) : null;
    Array.prototype.forEach.call(imgs, function(img){
      var w = img.parentNode;
      if (!w.classList.contains('ef-parch')) {
        w = document.createElement('span'); w.className = 'ef-parch';
        img.parentNode.insertBefore(w, img); w.appendChild(img);
      }
      // observăm figura din jur: imaginea încă strânsă (clip-path) nu „intră” niciodată în ecran
      if (io) { var host = w.parentNode; host.__efParch = w; w.classList.add('ef-wait'); io.observe(host); }
    });
  })();
})();
