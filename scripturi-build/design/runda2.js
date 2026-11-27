/* Runda 2 (cererile utilizatorului din 27.11), stilurile în runda2.css:
   1. cărțile cu mituri se întorc la click oriunde pe ele;
   2. punctele roșii de pe fotografii: descrierea apare lângă punct la hover / focus (pe telefon, la atingere);
   3. dominoul se întinde pe toată lățimea rândului cu anii;
   4. harta din cronologie umple înălțimea fișei; imaginile cu fond alb se topesc în pergament;
   5. Atlasul încape în ecran (legendă + hartă + bara de ani). */
(function () {
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function safe(f) { try { f(); } catch (e) { if (window.console) console.warn('runda2', e); } }

  /* ---------- 1. cărțile ---------- */
  function cards() {
    if (document.body.dataset.r2cards) return;
    document.body.dataset.r2cards = '1';
    document.addEventListener('click', function (e) {
      var card = e.target.closest && e.target.closest('.fc');
      if (!card) return;
      // linkurile, notele și butoanele proprii își păstrează acțiunea
      if (e.target.closest('a, button, sup.fn, .gl, input, [role="button"]')) return;
      if (window.getSelection && String(window.getSelection()).length > 2) return;
      var back = card.querySelector('.fc-back');
      var flipped = back && !back.hasAttribute('inert');
      var btn = flipped ? back.querySelector('button') : card.querySelector('.fc-front .fc-btn');
      if (btn) btn.click();
    });
  }

  /* ---------- 2. punctele de pe fotografii ---------- */
  function photoTips() {
    if ($('.r2-tip')) return;
    var tip = document.createElement('div');
    tip.className = 'r2-tip'; tip.setAttribute('role', 'tooltip'); tip.id = 'r2-tip'; tip.hidden = true;
    tip.innerHTML = '<b></b><p></p>';
    document.body.appendChild(tip);
    var cur = null, hideT = 0;
    function place(p) {
      var r = p.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight, gap = 14;
      var x = r.right + gap, y = r.top + r.height / 2 - th / 2;
      if (x + tw > innerWidth - 12) x = r.left - gap - tw;               // nu încape în dreapta: în stânga punctului
      if (x < 12) { x = Math.max(12, Math.min(innerWidth - tw - 12, r.left + r.width / 2 - tw / 2)); y = r.bottom + gap; }
      y = Math.max(64, Math.min(innerHeight - th - 12, y));
      tip.style.left = Math.round(x) + 'px'; tip.style.top = Math.round(y) + 'px';
    }
    function show(p) {
      clearTimeout(hideT);
      if (cur && cur !== p) cur.removeAttribute('aria-describedby');
      cur = p;
      tip.querySelector('b').textContent = p.dataset.title || '';
      tip.querySelector('p').textContent = p.dataset.detail || '';
      tip.hidden = false; tip.classList.remove('r2-in');
      place(p);
      void tip.offsetWidth; tip.classList.add('r2-in');
      p.setAttribute('aria-describedby', 'r2-tip');
      p.classList.add('r2-on');
    }
    function hide(now) {
      clearTimeout(hideT);
      hideT = setTimeout(function () {
        tip.classList.remove('r2-in'); tip.hidden = true;
        if (cur) { cur.classList.remove('r2-on'); cur.removeAttribute('aria-describedby'); }
        cur = null;
      }, now ? 0 : 120);
    }
    document.addEventListener('pointerover', function (e) { var p = e.target.closest && e.target.closest('.photo-point'); if (p && e.pointerType !== 'touch') show(p); }, true);
    document.addEventListener('pointerout', function (e) { var p = e.target.closest && e.target.closest('.photo-point'); if (p && e.pointerType !== 'touch' && !p.contains(e.relatedTarget)) hide(); }, true);
    document.addEventListener('focusin', function (e) { var p = e.target.closest && e.target.closest('.photo-point'); if (p) show(p); });
    document.addEventListener('focusout', function (e) { var p = e.target.closest && e.target.closest('.photo-point'); if (p) hide(); });
    // clicul nu mai deschide fereastra: pe telefon, atingerea arată sau ascunde descrierea
    window.addEventListener('click', function (e) {
      var p = e.target.closest && e.target.closest('.photo-point');
      if (p) { e.stopPropagation(); e.preventDefault(); if (cur === p && !tip.hidden && e.pointerType === 'touch') hide(true); else show(p); return; }
      if (cur && !e.target.closest('.r2-tip')) hide(true);
    }, true);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && cur) hide(true); });
    addEventListener('scroll', function () { if (cur) place(cur); }, { passive: true });
    addEventListener('resize', function () { if (cur) place(cur); });
  }

  /* ---------- 3. dominoul pe toată lățimea ---------- */
  function domino() {
    var track = $('#domino .dmn-track'), pcs = track && track.querySelector('.dmn-pieces');
    if (!pcs) return;
    function fit() {
      pcs.style.transform = ''; track.style.height = '';
      var cs = getComputedStyle(track);
      var w = parseFloat(cs.getPropertyValue('--w')), h = parseFloat(cs.getPropertyValue('--h')), pitch = parseFloat(cs.getPropertyValue('--pitch'));
      var n = pcs.children.length;
      if (!w || !h || !pitch || !n) return;
      var span = pcs.offsetWidth + h * 0.92;               // rândul întreg, cu ultima piesă culcată
      var avail = track.clientWidth;
      var s = Math.max(1, Math.min(1.6, avail / span));
      var natH = track.offsetHeight;
      pcs.style.transformOrigin = '0 100%';
      pcs.style.transform = 'translateX(' + Math.round((avail - span * s) / 2 - pcs.offsetLeft) + 'px) scale(' + s.toFixed(3) + ')';
      track.style.height = Math.round(natH * s + 12) + 'px';
    }
    fit();
    addEventListener('resize', fit);
  }

  /* ---------- 4. cronologie și imagini ---------- */
  function chrono() {
    var svg = $('#hx-map');
    if (svg) svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  }
  function blends() {
    $$('#page-acasa img').forEach(function (i) {
      if (/Apahida/i.test(i.alt || '') || /Apahida/i.test((i.closest('figure') || {}).textContent || '')) {
        if (i.closest('.photo-evidence')) i.classList.add('r2-blend');
      }
    });
  }

  // diadema de la Gherăseni: iese din coloana de imagini și stă lângă paragraful ei, pe toată lățimea
  function diadem() {
    if ($('.r2-band')) return;
    var cap = $$('#page-acasa .sr-media figcaption').filter(function (f) { return /Gherăseni/.test(f.textContent); })[0];
    var fig = cap && cap.closest('figure'), row = fig && fig.closest('.sr-row');
    if (!row || row.querySelectorAll('.sr-media > figure').length < 2) return;
    var para = $$('.sr-text > p', row).filter(function (p) { return /Gherăseni/.test(p.textContent); })[0];
    if (!para) return;
    var band = document.createElement('div');
    band.className = 'r2-band';
    band.appendChild(fig);
    band.appendChild(para);
    row.after(band);
  }

  /* ---------- 5. Atlasul încape în ecran ---------- */
  function atlas() {
    var frame = $('#sec-atlas .frame'), stage = $('#sec-atlas .stage');
    if (!frame || !stage) return;
    var ratio = 0;
    function fit() {
      stage.style.maxWidth = '';
      var r = frame.getBoundingClientRect();
      if (!r.width || !r.height) return;
      if (!ratio) ratio = r.width / r.height;
      var nav = $('.site-nav'), top = nav ? nav.getBoundingClientRect().height : 54;
      var avail = innerHeight - top - 32;
      if (r.height <= avail || innerWidth < 768) return;
      var side = stage.getBoundingClientRect().width - r.width;
      stage.style.maxWidth = Math.round(avail * ratio + side) + 'px';
    }
    fit();
    addEventListener('resize', function () { ratio = 0; fit(); });
  }

  // meniul trece peste marginea interioară a paginii, ca să fie închis pe toată lățimea
  function navEdge() {
    function f() { document.documentElement.style.setProperty('--r2-bp', (parseFloat(getComputedStyle(document.body).paddingLeft) || 0) + 'px'); }
    f(); addEventListener('resize', f);
  }

  function run() { [navEdge, cards, photoTips, domino, chrono, blends, diadem, atlas].forEach(safe); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(run, 60); });
  else setTimeout(run, 60);
  addEventListener('load', function () { [domino, atlas, blends].forEach(safe); });
})();
