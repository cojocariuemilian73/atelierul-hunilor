
/* Stratul de mișcare (28.11), stilurile în miscare.css. Totul cu prefixul mv-:
   1. notele marginale pe capitole + fundalul de relief care alunecă lent la scroll (numai în articol);
   2. aparițiile la scroll pentru titluri, citate și blocurile despre surse (o singură dată);
   3. în jocul Attila: cifrele indicatorilor se numără, iar straturile se schimbă printr-o estompare;
   4. evidențieri la note, glosar și punctele de pe fotografii.
   La prefers-reduced-motion nu pornește nimic legat de scroll și nu se numără nimic. */
(function () {
  var mq = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)');
  function reduced() { return !!(mq && mq.matches); }
  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
  var page = document.getElementById('page-acasa');

  /* ---------- 1a. note marginale ---------- */
  var NOTES = {
    'sec-origini': [['Stepa pontică', 'între Don și Nipru'], ['c. 150', 'Ptolemeu: „Khounoi”'], ['Meotida', 'Marea Azov de azi'], ['c. 390', 'scrie Ammianus']],
    'sec-cronologie': [['370–476', 'un secol de migrații'], ['Don → Rin', 'drumul presiunii']],
    'sec-migratie': [['376', 'goții trec Dunărea'], ['378', 'Adrianopol'], ['406', 'trecerea Rinului'], ['410', 'Roma jefuită']],
    'sec-atlas': [['Pannonia', 'reședința lui Attila'], ['451', 'Câmpiile Catalaunice'], ['452', 'Aquileia']],
    'sec-personalitati': [['434', 'Bleda și Attila'], ['451', 'campania din Galia'], ['453', 'moartea lui Attila'], ['c. 454', 'Nedao']]
  };
  function marginNotes() {
    if (!page || page.querySelector('.mv-margin')) return;
    var boxes = [];
    Object.keys(NOTES).forEach(function (id) {
      var sec = document.getElementById(id);
      if (!sec) return;
      sec.classList.add('mv-host');
      var box = el('aside', 'mv-margin');
      box.setAttribute('aria-hidden', 'true'); // repere decorative: aceleași date sunt în text
      var ol = el('ol');
      NOTES[id].forEach(function (n, k) {
        var li = el('li'); li.style.setProperty('--k', k);
        var b = el('b'); b.textContent = n[0];
        li.appendChild(b); li.appendChild(document.createTextNode(n[1]));
        ol.appendChild(li);
      });
      box.appendChild(ol);
      sec.insertBefore(box, sec.firstChild);
      boxes.push([sec, box]);
    });
    // lățimea notelor vine din spațiul liber real din stânga capitolului; sub 96 px nu se arată
    function fit() {
      boxes.forEach(function (p) {
        var free = p[0].getBoundingClientRect().left - 44;
        p[1].style.setProperty('--mv-w', Math.min(176, Math.round(free)) + 'px');
        p[1].classList.toggle('mv-narrow', free < 96);
      });
    }
    // capitolul activ: cel care trece prin linia de la 45% din înălțimea ecranului
    var ticking = false;
    function active() {
      ticking = false;
      var y = window.innerHeight * 0.45;
      boxes.forEach(function (p) { var r = p[0].getBoundingClientRect(); p[1].classList.toggle('is-active', r.top <= y && r.bottom >= y); });
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(active); } }, { passive: true });
    addEventListener('resize', function () { fit(); active(); });
    fit(); active();
  }

  /* ---------- 1b. fundalul de relief ---------- */
  function relief() {
    if (!page || page.querySelector(':scope > .mv-relief')) return;
    var bg = el('div', 'mv-relief'); bg.setAttribute('aria-hidden', 'true');
    page.insertBefore(bg, page.firstChild);
    var ticking = false;
    function apply() {
      ticking = false;
      if (reduced()) { document.documentElement.style.removeProperty('--mv-drift'); return; }
      // liniile urcă de 14 ori mai încet decât textul
      document.documentElement.style.setProperty('--mv-drift', (-(window.scrollY || 0) / 14).toFixed(1));
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(apply); } }, { passive: true });
    apply();
  }

  /* ---------- 2. apariții la scroll ---------- */
  var REVEAL = [
    '.sec-title', '.sec-sub', '.fc-head', '.fc-hint', '.fc', '.si', '.r9-note', '.pq', '.src-compare > h3',
    '.duel-lives', '.cta-card', '.dmn-head', '.hx', '.biblio'
  ].join(',');
  function reveals() {
    if (!page || reduced() || !('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('mv-js');
    var vh = window.innerHeight;
    var items = Array.prototype.filter.call(page.querySelectorAll(REVEAL), function (e) {
      if (e.classList.contains('mv-rv') || e.classList.contains('mv-in')) return false;
      // elementele care au deja o apariție proprie nu primesc a doua
      if (e.matches('.r7-rv, .sr-reveal, .fw-host') || e.closest('.fw-host')) return false;
      // într-un bloc mic care apare deodată, elementul apare odată cu blocul; în blocurile lungi apare separat
      var grp = e.parentElement && e.parentElement.closest('.r7-rv, .sr-reveal');
      if (grp && grp.getBoundingClientRect().height < vh * 1.2) return false;
      // ce se vede deja la încărcare rămâne pe loc
      var r = e.getBoundingClientRect();
      return r.top > vh * 0.92 && e.getClientRects().length;
    });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target;
        // frații din aceeași grilă apar unul după altul, cu 60 ms între ei
        var sibs = t.parentElement ? Array.prototype.filter.call(t.parentElement.children, function (c) { return c.classList.contains('mv-rv'); }) : [];
        var k = Math.max(0, sibs.indexOf(t));
        t.style.setProperty('--mv-d', Math.min(k, 5) * 60 + 'ms');
        t.classList.add('mv-in');
        io.unobserve(t);
        // după apariție, elementul nu mai păstrează tranziția (hover-ele proprii rămân rapide)
        setTimeout(function () { t.classList.remove('mv-rv'); t.classList.remove('mv-in'); t.style.removeProperty('--mv-d'); }, 1100);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (e) { e.classList.add('mv-rv'); io.observe(e); });
  }

  /* ---------- 3. jocul Attila ---------- */
  function meters() {
    var box = document.getElementById('mig-att');
    if (!box || box.dataset.mv) return;
    box.dataset.mv = '1';
    Array.prototype.forEach.call(box.querySelectorAll('.jg-meter'), function (m) {
      var b = m.querySelector('label b');
      if (!b) return;
      var shown = parseInt(b.textContent, 10) || 0, raf = 0, clearT = 0;
      var obs = new MutationObserver(function () {
        var target = parseInt(b.textContent, 10);
        if (isNaN(target) || target === shown) return;
        var from = shown; shown = target;
        m.classList.toggle('mv-up', target > from); m.classList.toggle('mv-down', target < from);
        clearTimeout(clearT); clearT = setTimeout(function () { m.classList.remove('mv-up', 'mv-down'); }, 1400);
        if (reduced()) return;
        // cifra urcă sau coboară până la valoarea nouă, în 600 ms
        cancelAnimationFrame(raf); clearTimeout(m._mvSafe);
        // plasă de siguranță: dacă fila nu desenează cadre (e în fundal), valoarea finală se scrie oricum
        m._mvSafe = setTimeout(function () { cancelAnimationFrame(raf); b.textContent = target; obs.takeRecords(); }, 700);
        var t0 = performance.now();
        (function step(now) {
          var u = Math.min(1, (now - t0) / 600), e = 1 - Math.pow(2, -10 * u);
          // scrierile proprii nu trebuie să pornească o nouă numărătoare: înregistrările lor se golesc pe loc
          b.textContent = Math.round(from + (target - from) * (u === 1 ? 1 : e)); obs.takeRecords();
          if (u < 1) raf = requestAnimationFrame(step);
        })(t0);
      });
      obs.observe(b, { childList: true, characterData: true, subtree: true });
    });
  }
  function layers() {
    var root = document.getElementById('mig-root');
    if (!root || root.dataset.mvLayers) return;
    root.dataset.mvLayers = '1';
    // capturarea rulează înaintea jocului: copiem harta veche, jocul o redesenează, copia se estompează deasupra
    root.addEventListener('change', function (ev) {
      var input = ev.target;
      if (!input.matches || !input.matches('.mig-layers input, #mig-flowg')) return;
      var lab = input.closest('label');
      if (lab) { lab.classList.remove('mv-flash'); void lab.offsetWidth; lab.classList.add('mv-flash'); setTimeout(function () { lab.classList.remove('mv-flash'); }, 500); }
      if (reduced()) return;
      var cv = root.querySelector('.mig-view canvas');
      if (!cv || !cv.width) return;
      var r = cv.getBoundingClientRect();
      if (!r.width) return;
      var g = el('canvas', 'mv-layer-ghost');
      g.width = cv.width; g.height = cv.height;
      try { g.getContext('2d').drawImage(cv, 0, 0); } catch (e) { return; }
      g.style.left = r.left + 'px'; g.style.top = r.top + 'px'; g.style.width = r.width + 'px'; g.style.height = r.height + 'px';
      g.style.borderRadius = getComputedStyle(cv).borderRadius;
      document.body.appendChild(g);
      requestAnimationFrame(function () { requestAnimationFrame(function () { g.classList.add('mv-out'); }); });
      setTimeout(function () { g.remove(); }, 420);
    }, true);
  }

  /* ---------- 4. evidențieri ---------- */
  function highlights() {
    if (document.body.dataset.mvHi) return;
    document.body.dataset.mvHi = '1';
    // trimiterea (nota sau termenul din glosar) rămâne marcată cât e deschisă fereastra ei
    var last = null;
    function pick(e) { var t = e.target.closest && e.target.closest('sup.fn, .gl'); if (t) last = t; }
    document.addEventListener('pointerover', pick, true);
    document.addEventListener('focusin', pick, true);
    document.addEventListener('click', pick, true);
    ['.fn-tip', '#gl-tip'].forEach(function (sel) {
      var tip = document.querySelector(sel);
      if (!tip) return;
      var marked = null;
      new MutationObserver(function () {
        var open = tip.classList.contains('show') || (tip.style.display && tip.style.display !== 'none' && tip.getClientRects().length > 0);
        if (open && last && last !== marked) { if (marked) marked.classList.remove('mv-ref-on'); marked = last; marked.classList.add('mv-ref-on'); }
        if (!open && marked) { marked.classList.remove('mv-ref-on'); marked = null; }
      }).observe(tip, { attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
    });
    // punctul de pe fotografie: un inel la deschiderea detaliului
    document.addEventListener('click', function (e) {
      var p = e.target.closest && e.target.closest('.photo-point');
      if (!p) return;
      p.classList.remove('mv-picked'); void p.offsetWidth; p.classList.add('mv-picked');
      setTimeout(function () { p.classList.remove('mv-picked'); }, 760);
    });
  }

  function run() {
    [marginNotes, relief, highlights, meters, layers].forEach(function (f) { try { f(); } catch (e) { if (window.console) console.warn('miscare', e); } });
  }
  function start() {
    run();
    // aparițiile se pregătesc după ce celelalte scripturi și-au construit fișele și cărțile
    setTimeout(function () { try { reveals(); } catch (e) {} }, 60);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 0); });
  else setTimeout(start, 0);
  addEventListener('load', run);
})();
