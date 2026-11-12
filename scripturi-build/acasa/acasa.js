/* ah: acasa (meniul unic: sertarul de pe telefon, ascunderea la derulare, capitolele din alte pagini) */
(function(){
  var nav = document.getElementById('site-nav'); if (!nav) return;
  var btn = document.getElementById('st-menu'), links = document.getElementById('st-links'), row = document.getElementById('toc-row');
  var mqM = window.matchMedia('(max-width: 767px)');
  var raf = window.requestAnimationFrame || function(f){ return setTimeout(f, 16); };
  function on(mq, fn){ if (mq.addEventListener) mq.addEventListener('change', fn); else if (mq.addListener) mq.addListener(fn); }

  // ---------- bara: dispare la derularea în jos, revine la derularea în sus ----------
  function show(){ nav.classList.remove('st-hide'); }
  function keep(){ return nav.classList.contains('open') || nav.contains(document.activeElement) || !!document.querySelector('.about-overlay.active'); }
  var lastY = window.pageYOffset, ticking = false;
  window.addEventListener('scroll', function(){
    if (ticking) return; ticking = true;
    raf(function(){
      ticking = false;
      var y = window.pageYOffset;
      if (y < 120 || keep()) show();
      else if (y > lastY + 6) nav.classList.add('st-hide');
      else if (y < lastY - 6) show();
      lastY = y;
    });
  }, { passive: true });
  nav.addEventListener('focusin', show);

  // ---------- telefon: sertarul cu toate linkurile ----------
  function setOpen(o){
    nav.classList.toggle('open', o);
    btn.setAttribute('aria-expanded', o ? 'true' : 'false');
    btn.querySelector('span').textContent = o ? 'Închide' : 'Meniu';
    if (o) { show(); var a = links.querySelector('a.active') || links.querySelector('a'); if (a) a.focus({ preventScroll: true }); }
  }
  if (btn) btn.addEventListener('click', function(){ setOpen(!nav.classList.contains('open')); });
  links.addEventListener('click', function(e){ if (mqM.matches && e.target.closest('a, button')) setOpen(false); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); btn.focus(); } });
  document.addEventListener('click', function(e){ if (nav.classList.contains('open') && !nav.contains(e.target)) setOpen(false); });
  on(mqM, function(){ setOpen(false); fit(); });

  // „↑ Cuprins” de după fiecare capitol: aduce bara înapoi (pe telefon, deschide sertarul)
  document.addEventListener('click', function(e){
    if (!(e.target.closest && e.target.closest('.ch-up'))) return;
    show();
    if (mqM.matches) setOpen(true);
  });

  // ---------- un capitol ales din paginile jocurilor: întâi articolul, apoi capitolul ----------
  nav.addEventListener('click', function(e){
    var a = e.target.closest('a.toc-link'); if (!a) return;
    var page = document.getElementById('page-acasa');
    if (!page || page.classList.contains('active')) return;
    e.preventDefault();
    var id = a.getAttribute('href').slice(1), home = nav.querySelector('.st-brand');
    if (home) home.click();
    raf(function(){ raf(function(){ var t = document.getElementById(id); if (t) t.scrollIntoView(); }); });
  });

  // ---------- capitolele care nu încap: lista se derulează, cu marginile estompate ----------
  function fit(){ if (row) row.classList.toggle('ovf', !mqM.matches && row.scrollWidth > row.clientWidth + 2); }
  window.addEventListener('resize', fit);
  window.addEventListener('load', fit);
  fit();

  // ---------- capitolul curent, recalculat când apare articolul ----------
  // la pornire, cuprinsul se măsoară cât articolul e încă ascuns: toate capitolele par la 0 și „08” ar rămâne marcat.
  // Când pagina devine vizibilă, recalculăm (cuprinsul ascultă de „resize”); fără capitol activ, rândul revine la început.
  var home = document.getElementById('page-acasa');
  function respy(){
    raf(function(){
      if (!home || !home.classList.contains('active')) return;
      window.dispatchEvent(new Event('resize'));
      if (row && !row.querySelector('a.active')) row.scrollLeft = 0;
    });
  }
  if (home && 'MutationObserver' in window) new MutationObserver(respy).observe(home, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('load', respy);
  respy();

  // ---------- notele pe margine: pe ecranele late, fiecare notă stă în dreapta paragrafului care o citează ----------
  // (cititoarele de ecran și ecranele mici le au ca până acum, la clic pe număr; aici sunt doar o copie vizuală)
  (function(){
    var shell = home && home.querySelector('.page-shell'); if (!shell) return;
    var mqW = window.matchMedia('(min-width: 1360px)');
    var WIDE = '#sec-cronologie, #sec-atlas, #sec-muzeu, .biblio';
    var text = {};
    Array.prototype.forEach.call(home.querySelectorAll('.biblio li[id^="note-"]'), function(li){
      var c = li.cloneNode(true), b = c.querySelector('a.back'); if (b) b.remove();
      text[li.id.slice(5)] = c.textContent.replace(/\s+/g, ' ').trim();
    });
    var seen = {}, items = [];
    Array.prototype.forEach.call(home.querySelectorAll('sup.fn[data-n]'), function(sup){
      var n = sup.getAttribute('data-n');
      if (seen[n] || !text[n] || sup.closest(WIDE)) return;
      seen[n] = true;
      var el = document.createElement('p'); el.className = 'ah-sn';
      el.innerHTML = '<b></b><span></span>';
      el.firstChild.textContent = n; el.lastChild.textContent = text[n];
      items.push({ sup: sup, el: el, n: n });
    });
    if (!items.length) return;
    var layer = document.createElement('div');
    layer.className = 'ah-sn-layer'; layer.setAttribute('aria-hidden', 'true'); layer.hidden = true;
    items.forEach(function(it){ layer.appendChild(it.el); });
    document.body.appendChild(layer);

    var queued = false;
    function place(){
      queued = false;
      var vw = document.documentElement.clientWidth, sr = shell.getBoundingClientRect(), sy = window.pageYOffset;
      var w = Math.min(290, vw - sr.right - 56);
      var on = mqW.matches && home.classList.contains('active') && w >= 170;
      layer.hidden = !on; if (!on) return;
      layer.style.setProperty('--sn-w', Math.round(w) + 'px');
      layer.style.setProperty('--sn-x', Math.round(sr.right + 28) + 'px');
      // modulele late (cronologia, atlasul, muzeul) ocupă și marginea: notele trec sub ele
      var blocks = Array.prototype.map.call(home.querySelectorAll(WIDE), function(b){ var r = b.getBoundingClientRect(); return [r.top + sy - 12, r.bottom + sy + 12]; });
      var next = -Infinity;
      items.forEach(function(it){
        var r = it.sup.getBoundingClientRect();
        if (!r.height) { it.el.hidden = true; return; }
        it.el.hidden = false;
        var h = it.el.offsetHeight, t = Math.max(r.top + sy - 6, next);
        blocks.forEach(function(b){ if (t + h > b[0] && t < b[1]) t = b[1]; });
        it.el.style.top = Math.round(t) + 'px';
        next = t + h + 14;
      });
    }
    function queue(){ if (!queued) { queued = true; raf(place); } }
    window.addEventListener('resize', queue);
    window.addEventListener('load', queue);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(queue);
    if ('ResizeObserver' in window) new ResizeObserver(queue).observe(shell);
    if ('MutationObserver' in window) new MutationObserver(queue).observe(home, { attributes: true, attributeFilter: ['class'] });
    on(mqW, queue);
    // nota se aprinde cât timp ești cu mouse-ul pe numărul ei din text
    home.addEventListener('mouseover', function(e){
      var s = e.target.closest && e.target.closest('sup.fn'); if (!s) return;
      items.forEach(function(it){ it.el.classList.toggle('hl', it.n === s.getAttribute('data-n')); });
    });
    home.addEventListener('mouseout', function(e){ if (e.target.closest && e.target.closest('sup.fn')) items.forEach(function(it){ it.el.classList.remove('hl'); }); });
    queue();
  })();
})();
