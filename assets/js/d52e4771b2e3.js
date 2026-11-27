
(function(){
  // ---------- site-wide page router ----------
  // The site is now page-by-page (one module visible at a time), not one
  // long scroll: exactly one .site-page has .active at any time. The old
  // per-module <section id="mod-X"> ids double as page ids.
  function syncNavH(){ var n = document.querySelector('.site-nav'); if (n) document.documentElement.style.setProperty('--nav-h', n.offsetHeight + 'px'); }
  syncNavH(); window.addEventListener('resize', syncNavH);
  var PAGE_IDS = ['page-acasa', 'mod-migratie', 'mod-atelier'];
  // adresa veche a jocului „Imperiul lui Attila” (și codul QR) duce la jocul unic
  var PAGE_ALIAS = { 'mod-game': 'mod-migratie' };
  var pages = PAGE_IDS.map(function(id){ return document.getElementById(id); });
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a[data-page]'));
  var pager = document.querySelector('.site-pager');
  var prevBtn = document.getElementById('site-prev');
  var nextBtn = document.getElementById('site-next');
  var countEl = document.getElementById('site-page-count');
  var current = 0;

  // record is false when the change came from the URL itself (first load or
  // Back/Forward), so we don't push a duplicate history entry for it.
  function showPage(index, record){
    index = Math.max(0, Math.min(pages.length - 1, index));
    var enteringGame = index !== current && PAGE_IDS[index] === 'mod-migratie';
    current = index;
    pages.forEach(function(p, i){ if (p) p.classList.toggle('active', i === index); });
    navLinks.forEach(function(a, i){ a.classList.toggle('current', i === index); if (i === index) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    pager.hidden = PAGE_IDS[index] === 'mod-atelier';
    prevBtn.disabled = index === 0;
    prevBtn.style.visibility = index === 0 ? 'hidden' : 'visible';
    nextBtn.disabled = index === pages.length - 1;
    nextBtn.style.visibility = index === pages.length - 1 ? 'hidden' : 'visible';
    countEl.textContent = (index + 1) + ' / ' + pages.length;
    var anchor = record === false && index === 0 ? document.getElementById(location.hash.slice(1)) : null;
    if (anchor && pages[0].contains(anchor)) anchor.scrollIntoView({ behavior: 'instant' });
    else window.scrollTo({ top: 0, behavior: 'instant' });

    if (enteringGame) pages[index].dispatchEvent(new CustomEvent('mig-enter', { detail: record !== false }));
    if (record !== false && window.history && window.history.pushState) {
      window.history.pushState({ page: index }, '', '#' + PAGE_IDS[index]);
    }
  }

  // Each page gets its own URL, so Back and Forward step through the modules,
  // a refresh stays where you were, and a single module can be linked directly.
  function pageFromUrl(){
    var h = (location.hash || '').slice(1);
    var idx = PAGE_IDS.indexOf(PAGE_ALIAS[h] || h);
    return idx === -1 ? 0 : idx;
  }

  window.addEventListener('popstate', function(e){
    var idx = (e.state && typeof e.state.page === 'number') ? e.state.page : pageFromUrl();
    showPage(idx, false);
  });

  prevBtn.addEventListener('click', function(){ showPage(current - 1); });
  nextBtn.addEventListener('click', function(){ showPage(current + 1); });

  // ---------- about / fișă tehnică modal ----------
  var aboutTrigger = document.getElementById('about-trigger');
  var aboutOverlay = document.getElementById('about-overlay');
  var aboutClose = document.getElementById('about-close');
  function openAbout(){ aboutOverlay.classList.add('active'); if (aboutClose) aboutClose.focus({ preventScroll: true }); }
  function closeAbout(){ aboutOverlay.classList.remove('active'); if (aboutTrigger) aboutTrigger.focus({ preventScroll: true }); }
  if (aboutTrigger) aboutTrigger.addEventListener('click', openAbout);
  if (aboutClose) aboutClose.addEventListener('click', closeAbout);
  if (aboutOverlay) aboutOverlay.addEventListener('click', function(e){
    if (e.target === aboutOverlay) closeAbout();
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && aboutOverlay && aboutOverlay.classList.contains('active')) { e.preventDefault(); closeAbout(); }
  });

  // Any link whose href points straight at one of the 6 page ids: the nav
  // bar itself, plus in-page links like the story module's "Deschide
  // Campania Hunilor →" card: navigates pages instead of trying to scroll
  // to a section that's hidden (display:none) on another page.
  document.addEventListener('click', function(e){
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var targetId = a.getAttribute('href').slice(1);
    var idx = PAGE_IDS.indexOf(PAGE_ALIAS[targetId] || targetId);
    if (idx === -1) return;
    e.preventDefault();
    showPage(idx);
  });

  // Honour a #mod-… in the address bar on first load, and seed a history entry
  // so the very first Back press has somewhere sensible to go.
  var startIndex = pageFromUrl();
  showPage(startIndex, false);
  if (window.history && window.history.replaceState) {
    window.history.replaceState({ page: startIndex }, '', location.hash || '#' + PAGE_IDS[startIndex]);
  }
})();
