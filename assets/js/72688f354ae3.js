
/* Runda de design și UX din 27.11 (stilurile în ux-hunilor.css):
   3. pe hartă, cartonașul cu informația apare la hover/focus și dispare la ieșire; pe touch rămâne atingerea (fereastra veche);
   4. anul de pe hartă stă într-un cartuș, cu cifrele care se rulează la schimbare;
   7. graficul Aetius–Attila redesenat, cu etichete pe bare;
   9. imaginea lui Delacroix rămâne în vedere lângă cronologie, cu o notă „Știai că…?” sub ea. */
(function () {
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  /* ---------- 3. cartonașul de pe hartă ---------- */
  function mapTips() {
    var data = window.AH_ATLAS_DATA;
    var markers = document.querySelectorAll('#sec-atlas .marker');
    if (!data || !markers.length || document.querySelector('.ux-tip')) return;
    var tip = el('div', 'ux-tip');
    tip.setAttribute('role', 'tooltip');
    tip.id = 'ux-map-tip';
    document.body.appendChild(tip);
    var current = null, hideT = 0;

    function place(m) {
      var r = m.getBoundingClientRect();
      var vw = document.documentElement.clientWidth, vh = window.innerHeight, pad = 12;
      var w = tip.offsetWidth, h = tip.offsetHeight;
      var cx = r.left + r.width / 2;
      var x = Math.max(pad, Math.min(cx - w / 2, vw - w - pad));
      // deasupra punctului; dacă nu încape sub meniul fix, dedesubt
      var top = 96, y = r.top - h - 12, below = false;
      if (y < top) { y = r.bottom + 12; below = true; }
      if (y + h > vh - pad) y = Math.max(top, vh - h - pad);
      tip.classList.toggle('is-below', below);
      tip.style.setProperty('--x', Math.round(x) + 'px');
      tip.style.setProperty('--y', Math.round(y) + 'px');
    }
    function show(m) {
      clearTimeout(hideT);
      var d = data[parseInt(m.getAttribute('data-i'), 10)];
      if (!d) return;
      if (current !== m) {
        tip.innerHTML = '';
        if (d.tag) tip.appendChild(el('p', 'ux-tip-tag')).textContent = d.tag;
        tip.appendChild(el('p', 'ux-tip-title')).textContent = d.title;
        if (d.desc) tip.appendChild(el('p', 'ux-tip-desc')).textContent = d.desc;
        tip.appendChild(el('p', 'ux-tip-more')).textContent = 'Clic pentru imagine și citatul din izvor.';
        current = m;
      }
      m.setAttribute('aria-describedby', tip.id);
      // poziția se calculează cu cartonașul deja completat, dar încă invizibil
      if (!tip.classList.contains('is-on')) {
        tip.style.transition = 'none';
        place(m);
        void tip.offsetWidth;
        tip.style.transition = '';
      } else place(m);
      tip.classList.add('is-on');
    }
    function hide(now) {
      clearTimeout(hideT);
      var go = function () { tip.classList.remove('is-on'); if (current) current.removeAttribute('aria-describedby'); current = null; };
      if (now) go(); else hideT = setTimeout(go, 60);
    }

    Array.prototype.forEach.call(markers, function (m) {
      // doar mouse-ul deschide cartonașul la hover; pe touch, atingerea deschide fereastra veche
      m.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') show(m); });
      m.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hide(); });
      m.addEventListener('focus', function () { if (m.matches(':focus-visible')) show(m); });
      m.addEventListener('blur', function () { hide(true); });
      m.addEventListener('click', function () { hide(true); });
    });
    // tragerea hărții, derularea și Escape îl închid
    var area = document.querySelector('#sec-atlas svg');
    if (area) area.addEventListener('pointerdown', function () { hide(true); });
    addEventListener('scroll', function () { if (current) hide(true); }, { passive: true });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && current) hide(true); });
  }

  /* ---------- 4. cartușul anului ---------- */
  function yearCartouche() {
    var badge = document.getElementById('year-badge');
    if (!badge || badge.closest('.ux-cart')) return;
    var heading = badge.closest('.timebar-heading');
    var label = heading && heading.querySelector('.timebar-label');
    var cart = el('div', 'ux-cart');
    if (label) cart.appendChild(label);
    cart.appendChild(badge);
    heading.insertBefore(cart, heading.firstChild);
    // descrierea epocii stă lângă cartuș, nu sub axă
    var era = document.getElementById('era-label');
    if (era) heading.appendChild(era);

    var last = null, obs;
    function render() {
      var m = badge.textContent.match(/\d+/);
      if (!m) return;
      var y = m[0];
      if (y === last && badge.querySelector('.ux-yr')) return;
      var prev = last; last = y;
      var dir = prev && +y < +prev ? 'down' : 'up';
      var digits = y.split('').map(function (ch, i) {
        var changed = prev && (prev.length !== y.length || prev[i] !== ch);
        return '<span class="ux-d' + (changed ? ' ' + dir : '') + '"><span>' + ch + '</span></span>';
      }).join('');
      obs.disconnect();
      badge.innerHTML = '<span class="ux-yr" aria-hidden="true">' + digits + '</span><span class="ux-era" aria-hidden="true">d.Hr.</span>';
      badge.setAttribute('aria-label', y + ' după Hristos');
      obs.observe(badge, { childList: true, characterData: true, subtree: true });
    }
    obs = new MutationObserver(render);
    render();
  }

  /* ---------- 7. graficul Aetius – Attila ---------- */
  function duelChart() {
    var box = document.querySelector('.duel-lives');
    if (!box || box.classList.contains('dx')) return;
    var Y0 = 388, Y1 = 456;
    function pct(y) { return ((y - Y0) / (Y1 - Y0) * 100).toFixed(2) + '%'; }
    function span(a, b) { return 'left:' + pct(a) + ';width:calc(' + pct(b) + ' - ' + pct(a) + ')'; }
    var reignW = ((453 - 434) / (453 - 406) * 100).toFixed(2) + '%';
    var grid = '', axis = '';
    for (var y = 390; y <= 450; y += 10) {
      grid += '<span class="dx-gridline" style="left:' + pct(y) + '"></span>';
      axis += '<span style="left:' + pct(y) + '"></span><small class="' + ((y / 10) % 2 ? 'dx-odd' : '') + '" style="left:' + pct(y) + '">' + y + '</small>';
    }
    box.classList.add('dx');
    box.innerHTML =
      '<div class="dx-plot">' + grid +
        '<div class="dx-451" style="left:' + pct(451) + '"><span>451 · Câmpiile Catalaunice</span></div>' +
        '<div class="dx-row"><span class="dx-bar dx-aetius" style="' + span(391, 454) + '"><b>Aetius</b><em>c. 391–454</em></span></div>' +
        '<div class="dx-row"><span class="dx-bar dx-attila" style="' + span(406, 453) + '"><b>Attila</b><em>c. 406–453</em>' +
          '<span class="dx-reign" style="width:' + reignW + '"><em><span class="dx-long">domnia </span>434–453</em></span></span></div>' +
      '</div>' +
      '<div class="dx-axis">' + axis + '<small class="dx-unit">d.Hr.</small></div>';
  }

  /* ---------- 9. Delacroix ---------- */
  function delacroix() {
    var img = document.getElementById('img-delacroix');
    var media = img && img.closest('.sr-media');
    if (!media || media.querySelector('.ux-legacy')) return;
    var row = media.closest('.sr-row');
    if (row) row.classList.add('ux-sticky-row');
    media.classList.add('ux-sticky');
    var note = el('aside', 'r9-note r9-in ux-legacy');
    note.setAttribute('aria-label', 'Știai că…? Attila în legende');
    note.innerHTML =
      '<p class="r9n-tag">Știai că…?</p>' +
      '<p class="r9n-title">Attila a intrat în legendă</p>' +
      '<p class="r9n-text">La secole după moartea lui, Attila a ajuns personaj de legendă. În Cântecul Nibelungilor (c. 1200) e regele Etzel, generos și primitor. În poemele nordice din Edda e Atli, un rege lacom după aurul nibelungilor. Aceeași figură a rămas în memorie în două feluri opuse.</p>' +
      '<p class="r9n-src">Sursa: Cântecul Nibelungilor; Edda poetică (Atlakviða)</p>';
    media.appendChild(note);
  }

  function run() {
    [mapTips, yearCartouche, duelChart, delacroix].forEach(function (f) { try { f(); } catch (e) { if (window.console) console.warn('ux-hunilor', e); } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(run, 0); });
  else setTimeout(run, 0);
  addEventListener('load', run);
})();
