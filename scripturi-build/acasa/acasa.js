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
  links.addEventListener('click', function(e){
    if (mqM.matches && e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', function(e){
    if (e.key !== 'Escape' || e.defaultPrevented || !nav.classList.contains('open')) return;
    setOpen(false);
    btn.focus();
  });
  document.addEventListener('click', function(e){ if (nav.classList.contains('open') && !nav.contains(e.target) && !e.target.closest('.about-overlay')) setOpen(false); });
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

})();
