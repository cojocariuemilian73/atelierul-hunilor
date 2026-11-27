/* Revizia juriului (patch-revizie.js), stilurile în revizie.css:
   1. o singură bară fixă (firul de progres), butonul de prezentare și comutatorul de animații în meniu;
   2. coperta: titlul sub meniu, intrarea pe articol pornește de sus;
   3. imagini: punctele apar după poză; cărțile nu mai repetă imaginile din articol;
   4. „Ce trebuie să reții” la începutul capitolelor; paginile inactive primesc hidden;
   5. animații: cifrele se numără, scorul din Jocul izvoarelor, harta jocului pe telefon. */
(function () {
  var mq = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)');
  function reduced() { return !!(mq && mq.matches); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function safe(f) { try { f(); } catch (e) { if (window.console) console.warn('revizie', e); } }

  /* ---------- 1. bara, butoanele din meniu ---------- */
  function progress() {
    if ($('.ah-r-progress')) return;
    var bar = el('div', 'ah-r-progress'); bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var nav = $('.site-nav'), ticking = false;
    function upd() {
      ticking = false;
      if (nav) bar.style.top = Math.round(nav.getBoundingClientRect().bottom) + 'px';
      var h = document.documentElement.scrollHeight - innerHeight;
      bar.style.setProperty('--ah-p', h > 0 ? Math.min(1, Math.max(0, scrollY / h)).toFixed(4) : 0);
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    addEventListener('resize', upd); upd();
  }
  function navTools() {
    var links = $('#st-links') || $('.site-nav');
    if (!links || $('.ah-r-navtools')) return;
    var box = el('div', 'ah-r-navtools');
    var pz = $('.pz-open');
    if (pz) {
      pz.classList.add('ah-r-innav');
      pz.setAttribute('aria-label', 'Mod prezentare (tasta P)');
      pz.title = 'Mod prezentare (tasta P)';
      var txt = Array.prototype.filter.call(pz.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); })[0];
      if (txt) { var s = el('span', 'ah-r-lab', txt.textContent.trim()); pz.replaceChild(s, txt); }
      box.appendChild(pz);
    }
    var M = window.AH_MOTION || {};
    if (M.systemReduce) {
      // sistemul cere mișcare redusă: animațiile rămân oprite, dar vizitatorul le poate porni explicit
      var b = el('button', 'ah-r-motion', M.forced ? 'Animații: pornite' : 'Animații: oprite');
      b.type = 'button';
      b.setAttribute('aria-pressed', M.forced ? 'true' : 'false');
      b.title = 'Sistemul tău cere mișcare redusă. Poți porni animațiile site-ului.';
      b.addEventListener('click', function () {
        try { if (M.forced) localStorage.removeItem('ah-motion'); else localStorage.setItem('ah-motion', 'on'); } catch (e) {}
        location.reload();
      });
      box.appendChild(b);
    }
    if (box.children.length) links.appendChild(box);
  }

  /* ---------- 2. coperta și paginile ---------- */
  function pages() {
    var list = $$('.site-page');
    function sync() {
      list.forEach(function (p) {
        var on = p.classList.contains('active');
        if (on && p.hidden) p.hidden = false;
        if (!on && !p.hidden && list.some(function (x) { return x.classList.contains('active'); })) p.hidden = true;
      });
    }
    var wasHome = $('#page-acasa.active') != null;
    new MutationObserver(function () {
      sync();
      var home = $('#page-acasa.active') != null;
      // de la un joc înapoi la articol: pornești de la copertă, cu titlul întreg sub meniu
      if (home && !wasHome && (!location.hash || location.hash === '#page-acasa' || location.hash === '#acasa')) scrollTo(0, 0);
      wasHome = home;
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
    sync();
  }
  function heroPad() {
    var nav = $('.site-nav'), inner = $('#acasa .hero-inner');
    if (!nav || !inner) return;
    function f() { document.documentElement.style.setProperty('--ah-hero-pad', Math.round(nav.getBoundingClientRect().height + 32) + 'px'); }
    addEventListener('resize', f); f();
  }

  /* ---------- 3. imagini ---------- */
  function photoPoints() {
    $$('.photo-points').forEach(function (box) {
      var img = box.querySelector('img');
      if (!img || (img.complete && img.naturalWidth)) return;
      box.classList.add('ah-r-wait');
      function done() { box.classList.remove('ah-r-wait'); }
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
  }
  function cardImages() {
    var page = $('#page-acasa');
    if (!page) return;
    var seen = {};
    $$('img', page).forEach(function (i) { if (!i.closest('.fc')) seen[i.getAttribute('src')] = 1; });
    $$('.fc', page).forEach(function (c, k) {
      var fig = c.querySelector('.fc-fig'), img = fig && fig.querySelector('img');
      if (!img || !seen[img.getAttribute('src')]) return;
      // imaginea e deja în articol (cu legenda completă): cartea rămâne doar cu întrebarea
      fig.remove();
      c.classList.add('ah-r-noimg');
      var front = c.querySelector('.fc-front') || c;
      front.setAttribute('data-ah-n', ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][k] || String(k + 1));
    });
  }

  /* ---------- 4. „Ce trebuie să reții” ---------- */
  var KEY = {
    'sec-origini': 'Hunii apar în izvoarele romane în jurul anului 370, venind din stepa de la nord de Marea Neagră. Legătura cu Xiongnu e susținută de ADN, dar privește o elită conducătoare puțin numeroasă, nu un popor întreg mutat dintr-un loc în altul.',
    'sec-cronologie': 'Cronologia acoperă un secol, 370–476: de la primele atacuri ale hunilor asupra alanilor și goților până la sfârșitul Imperiului Roman de Apus.',
    'sec-migratie': 'Efectul de domino: fugind de huni, goții trec Dunărea în 376 și înving Roma la Adrianopol în 378. Din 382 devin federați ai Imperiului, iar Roma ajunge să plătească hunilor tribut în aur.',
    'sec-atlas': 'Harta arată drumurile hunilor între 370 și 455. Zonele desenate sunt aproximative, reconstituite din izvoare.',
    'sec-personalitati': 'Attila și Aetius s-au înfruntat la Câmpiile Catalaunice, în 451. Attila moare în 453, iar după bătălia de la Nedao (c. 454) puterea hunilor se destramă.'
  };
  function keyPoints() {
    Object.keys(KEY).forEach(function (id) {
      var sec = document.getElementById(id);
      if (!sec || sec.querySelector('.ah-r-key')) return;
      var after = sec.querySelector('.sec-sub') || sec.querySelector('.sec-head');
      if (!after) return;
      var box = el('div', 'ah-r-key');
      box.setAttribute('role', 'note');
      var p = el('p'); p.appendChild(el('b', null, 'Ce trebuie să reții'));
      p.appendChild(document.createTextNode(KEY[id]));
      box.appendChild(p);
      after.parentNode.insertBefore(box, after.nextSibling);
    });
  }

  /* ---------- 5. animații ---------- */
  function fmt(n, dots) { var s = String(Math.round(n)); return dots ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : s; }
  function countText(node, to, dots, ms) {
    var t0 = performance.now(), safeT = setTimeout(function () { node.textContent = fmt(to, dots); }, ms + 200);
    (function step(now) {
      var u = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - u, 3);
      node.textContent = fmt(to * e, dots);
      if (u < 1) requestAnimationFrame(step); else clearTimeout(safeT);
    })(t0);
  }
  // titlurile cu sume: „350 de livre”, „700 de livre”, „2.100 de livre”, „151.000 de monede”
  function countUps() {
    var page = $('#page-acasa');
    if (!page || reduced() || !('IntersectionObserver' in window)) return;
    var hs = $$('h3', page).filter(function (h) { return /\d[\d.]*\s+de\s+(livre|monede)/.test(h.textContent) && !h.querySelector('.ah-r-count'); });
    hs.forEach(function (h) {
      // primul număr din titlu primește un <span> propriu; restul textului rămâne neatins
      var walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT), t;
      while ((t = walker.nextNode())) {
        var m = t.textContent.match(/\d{1,3}(?:\.\d{3})+|\d+/);
        if (!m) continue;
        var span = el('span', 'ah-r-count', m[0]);
        span.setAttribute('aria-hidden', 'true');
        var after = t.splitText(m.index); after.textContent = after.textContent.slice(m[0].length);
        t.parentNode.insertBefore(span, after);
        // cititorul de ecran aude valoarea finală, nu numărătoarea
        var sr = el('span', 'sr-only', m[0]);
        sr.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap';
        t.parentNode.insertBefore(sr, span);
        span.dataset.to = m[0];
        break;
      }
    });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        var s = e.target.querySelector('.ah-r-count');
        io.unobserve(e.target);
        if (!s) return;
        var raw = s.dataset.to, dots = raw.indexOf('.') > -1;
        countText(s, parseInt(raw.replace(/\./g, ''), 10), dots, raw.length > 3 ? 1400 : 900);
      });
    }, { threshold: 0.6 });
    hs.forEach(function (h) { if (h.getClientRects().length) io.observe(h); });
    // pașii graficului ascund o parte din titluri: când apare unul, se numără atunci
    document.addEventListener('click', function (ev) {
      if (!ev.target.closest || !ev.target.closest('.gs-nav button')) return;
      setTimeout(function () { hs.forEach(function (h) { if (h.getClientRects().length && !h.dataset.ahObs) { h.dataset.ahObs = 1; io.observe(h); } }); }, 40);
    });
  }
  function scoreBump() {
    var sc = $('#md-score');
    if (!sc || sc.dataset.ah) return;
    sc.dataset.ah = '1';
    var shown = parseInt(sc.textContent, 10) || 0, raf = 0;
    var obs = new MutationObserver(function () {
      var target = parseInt(sc.textContent, 10);
      if (isNaN(target) || target === shown) return;
      var from = shown; shown = target;
      sc.classList.remove('ah-r-bump'); void sc.offsetWidth; sc.classList.add('ah-r-bump');
      if (reduced()) return;
      var tail = sc.textContent.replace(/^\s*\d+/, ''), t0 = performance.now();
      cancelAnimationFrame(raf); clearTimeout(sc._ahSafe);
      sc._ahSafe = setTimeout(function () { cancelAnimationFrame(raf); sc.textContent = target + tail; obs.takeRecords(); }, 800);
      (function step(now) {
        var u = Math.min(1, (now - t0) / 650), e = 1 - Math.pow(1 - u, 3);
        sc.textContent = Math.round(from + (target - from) * e) + tail; obs.takeRecords();
        if (u < 1) raf = requestAnimationFrame(step);
      })(t0);
    });
    obs.observe(sc, { childList: true, characterData: true, subtree: true });
  }
  // jocul Attila pe telefon: harta umple înălțimea liberă (cel puțin 56% din ecran) și se derulează pe orizontală,
  // centrată la început; numai harta se derulează, panourile jocului rămân pe loc
  function mobileMap() {
    var mql = matchMedia('(max-width: 767px)'), busy = false;
    function apply() {
      if (busy) return;
      var view = $('#mod-migratie .mig-view'), cv = view && view.querySelector('canvas');
      if (!cv || !view.getClientRects().length) return;
      busy = true;
      var wrap = cv.parentElement.classList.contains('ah-r-scroll') ? cv.parentElement : null;
      if (mql.matches && !wrap) { wrap = el('div', 'ah-r-scroll'); cv.parentNode.insertBefore(wrap, cv); wrap.appendChild(cv); }
      view.classList.toggle('ah-r-pan', mql.matches);
      if (mql.matches) {
        var top = wrap.getBoundingClientRect().top - view.getBoundingClientRect().top;
        var free = view.clientHeight - top - 76;
        view.style.setProperty('--ah-r-h', Math.max(innerHeight * 0.56, Math.min(free, innerHeight * 0.78)) + 'px');
        if (!wrap.dataset.ahCentered && wrap.scrollWidth > wrap.clientWidth) {
          wrap.dataset.ahCentered = '1';
          wrap.scrollLeft = (wrap.scrollWidth - wrap.clientWidth) / 2;
        }
      }
      busy = false;
    }
    if (mql.addEventListener) mql.addEventListener('change', apply);
    addEventListener('resize', apply);
    new MutationObserver(apply).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
    apply();
  }

  function run() {
    [progress, navTools, pages, heroPad, photoPoints, keyPoints, scoreBump, mobileMap].forEach(safe);
  }
  function start() { run(); setTimeout(function () { safe(countUps); }, 120); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 30); });
  else setTimeout(start, 30);
  addEventListener('load', function () { [scoreBump, mobileMap].forEach(safe); });
})();
