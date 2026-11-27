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
  // fiecare carte are o culoare și un desen cu linii pe fundal, după tema mitului (ca o carte poștală de muzeu)
  var ART = {
    crown: '<ellipse cx="100" cy="190" rx="70" ry="22"/><ellipse cx="100" cy="172" rx="58" ry="17"/><ellipse cx="100" cy="155" rx="46" ry="13"/><path d="M60 190c0-40 80-40 80 0"/><path d="M100 140c-6-30 14-46 34-44-8 10-12 22-34 44z"/><path d="M100 140c-14-22-34-24-46-18 14 2 26 8 46 18z"/><circle cx="124" cy="104" r="3"/>',
    rider: '<path d="M40 200c10-36 34-56 66-58l34-4c14-2 24-14 30-28l8 6c-4 18-14 30-30 38l2 46"/><path d="M60 196l-6 34M150 196l6 34M88 200l-4 30"/><path d="M106 142c-2-22 8-40 24-48l10 26"/><path d="M128 70a10 10 0 1 1 0 .1"/><path d="M118 96l-34-46M84 50l-6-10"/>',
    skull: '<path d="M60 120c0-46 30-70 64-70s56 26 56 64c0 22-10 36-22 44v26H86v-26c-16-8-26-20-26-38z"/><circle cx="104" cy="118" r="13"/><circle cx="146" cy="118" r="13"/><path d="M124 136l-6 14h14z"/><path d="M96 168v16M112 168v16M128 168v16M144 168v16"/><path d="M78 74c10-14 26-22 44-24"/>',
    page: '<path d="M50 30h90l24 24v186H50z"/><path d="M140 30v24h24"/><path d="M66 74h80M66 90h84M66 106h70M66 122h84M66 138h76M66 154h84M66 170h60M66 186h80M66 202h70"/>',
    diadem: '<path d="M30 150c30-20 110-20 140 0v40c-30-20-110-20-140 0z"/><path d="M44 146l10-22 10 20M74 140l10-24 10 22M106 138l10-24 10 22M138 142l10-22 10 22"/><circle cx="60" cy="168" r="5"/><circle cx="100" cy="164" r="6"/><circle cx="140" cy="168" r="5"/>',
    meet: '<path d="M40 230V120a60 60 0 0 1 120 0v110"/><path d="M70 230V140M130 230V140"/><path d="M100 60v-26M88 44h24"/><path d="M60 230h80"/><path d="M84 180c6-14 26-14 32 0"/>',
    mound: '<path d="M20 210c30-60 130-60 160 0z"/><path d="M100 152V96M84 112h32"/><path d="M50 60l4 8 8 1-6 6 2 8-8-4-8 4 2-8-6-6 8-1zM150 44l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z"/>'
  };
  var TONES = ['#a9c2a4', '#e3a585', '#aeb7d6', '#ddb06a', '#d7a3a3', '#9cc2b8', '#d9c48f'];
  function artFor(t, k) {
    if (/Xiongnu/i.test(t)) return 'crown';
    if (/armata|luptau|călăre/i.test(t)) return 'rider';
    if (/crani/i.test(t)) return 'skull';
    if (/Ammianus|Res Gestae|izvoar.*scris|monstru/i.test(t)) return 'page';
    if (/femei|diadem/i.test(t)) return 'diadem';
    if (/Leon|Romei|Papa/i.test(t)) return 'meet';
    if (/înmormânt|mormânt/i.test(t)) return 'mound';
    return ['crown', 'rider', 'skull', 'page', 'diadem', 'meet', 'mound'][k % 7];
  }
  function paint() {
    $$('.fc').forEach(function (c, k) {
      if (c.dataset.r2art) return;
      var front = c.querySelector('.fc-front'); if (!front) return;
      var key = artFor(c.textContent, k);
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity=".8">' + ART[key] + '</svg>';
      c.dataset.r2art = key;
      c.classList.add('r2-card');
      c.style.setProperty('--r2-c', TONES[k % TONES.length]);
      c.style.setProperty('--r2-art', 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")');
    });
  }
  function cards() {
    paint();
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

  // antetul capitolului: titlul și subtitlul în stânga, „Ce trebuie să reții” în dreapta (fără gol pe dreapta)
  function heads() {
    $$('#page-acasa section[id^="sec-"]').forEach(function (sec) {
      var key = sec.querySelector(':scope > .ah-r-key'), mark = sec.querySelector(':scope > .chapter-mark');
      if (!key || !mark || sec.querySelector(':scope > .r2-head')) return;
      var head = document.createElement('div'); head.className = 'r2-head';
      var left = document.createElement('div'); left.className = 'r2-head-l';
      mark.before(head);
      left.appendChild(mark);
      var sub = sec.querySelector(':scope > .sec-sub'); if (sub) left.appendChild(sub);
      head.appendChild(left); head.appendChild(key);
    });
  }
  // Ptolemeu: textul și legenda într-o singură coloană lângă hartă, centrată pe înălțimea ei
  function ptol() {
    var box = $('#page-acasa .ptol-map');
    if (!box || box.querySelector('.r2-ptol-side')) return;
    var side = document.createElement('div'); side.className = 'r2-ptol-side';
    Array.prototype.slice.call(box.children).forEach(function (c) { if (c.tagName.toLowerCase() !== 'svg') side.appendChild(c); });
    box.appendChild(side);
  }

  function run() { [navEdge, heads, ptol, cards, photoTips, domino, chrono, blends, diadem, atlas].forEach(safe); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(run, 60); });
  else setTimeout(run, 60);
  addEventListener('load', function () { [paint, domino, atlas, blends].forEach(safe); });
})();
