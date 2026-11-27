
/* Mod prezentare: un tur prin opririle importante ale articolului, cu săgeți și cronometru (10–15 minute la concurs).
   Pornire: tasta P sau butonul „Mod prezentare”. Ieșire: Esc sau „Ieșire”. */
(function () {
  var STOPS = [
    { sel: '#acasa', t: 'Coperta' },
    { sel: '#sec-origini', t: 'Originile hunilor' },
    { sel: '#sec-cronologie', t: 'Cronologie interactivă' },
    { sel: '#sec-migratie', t: 'Marea Migrație' },
    { sel: '#domino', t: 'Efectul de domino' },
    { sel: '#gold-story', t: 'Aurul: prețul păcii' },
    { sel: '#sec-atlas', t: 'Atlasul migrației' },
    { sel: '#sec-personalitati', t: 'Attila și Aetius' },
    { text: 'Consecințe de lungă durată', t: 'Consecințe' },
    { sel: '.cta-card', t: 'Jocul' },
    { sel: '#biblio', t: 'Surse și note' }
  ];
  var BUDGET = 15 * 60, WARN = 10 * 60, LATE = 14 * 60;
  var on = false, idx = 0, start = 0, tick = 0, hud, btnOpen, lblStep, lblTitle, lblTime;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function target(s) {
    if (s.sel) return document.querySelector(s.sel);
    var hs = document.querySelectorAll('#page-acasa h3');
    for (var i = 0; i < hs.length; i++) if (hs[i].textContent.trim() === s.text) return hs[i].closest('.sr-row') || hs[i];
    return null;
  }
  function headerOffset() {
    // meniul se ascunde la derulare și poate reapărea la urcare; bara cu călărețul (.ef-ride) rămâne sus
    var n = document.getElementById('site-nav'), r = document.querySelector('.ef-ride');
    var h = Math.max(n ? n.offsetHeight : 0, r ? r.getBoundingClientRect().bottom : 0);
    return Math.max(0, h) + 24;
  }
  function ensureHome() {
    var home = document.getElementById('page-acasa');
    if (home && !home.classList.contains('active')) location.hash = '#page-acasa';
  }
  function go(i) {
    idx = Math.max(0, Math.min(STOPS.length - 1, i));
    var el = target(STOPS[idx]);
    lblStep.textContent = (idx + 1) + ' / ' + STOPS.length;
    lblTitle.textContent = STOPS[idx].t;
    hud.querySelector('.pz-prev').disabled = idx === 0;
    hud.querySelector('.pz-next').disabled = idx === STOPS.length - 1;
    if (!el) return;
    var top = idx === 0 ? 0 : el.getBoundingClientRect().top + window.scrollY - headerOffset();
    window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
  }
  function fmt(s) { var m = Math.floor(s / 60), r = s % 60; return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r; }
  function updateTime() {
    var s = Math.floor((Date.now() - start) / 1000);
    lblTime.textContent = fmt(s) + ' / ' + fmt(BUDGET);
    hud.classList.toggle('is-warn', s >= WARN && s < LATE);
    hud.classList.toggle('is-late', s >= LATE);
  }
  function open() {
    if (on) return;
    ensureHome();
    on = true; start = Date.now();
    document.documentElement.classList.add('pz-on');
    hud.hidden = false; btnOpen.setAttribute('aria-expanded', 'true');
    updateTime(); tick = setInterval(updateTime, 1000);
    go(0);
    hud.querySelector('.pz-next').focus({ preventScroll: true });
  }
  function close() {
    if (!on) return;
    on = false; clearInterval(tick);
    document.documentElement.classList.remove('pz-on');
    hud.hidden = true; btnOpen.setAttribute('aria-expanded', 'false');
    btnOpen.focus({ preventScroll: true });
  }
  function busy(e) {
    var a = e.target;
    if (a && (a.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))) return true;
    // un dialog deschis (Despre proiect, lupa imaginilor, fișele) își păstrează tastele; cele ascunse cu CSS nu contează
    var dl = document.querySelectorAll('dialog[open], [role="dialog"][aria-modal="true"]');
    for (var i = 0; i < dl.length; i++) if (dl[i].getClientRects().length) return true;
    var home = document.getElementById('page-acasa');
    return home && !home.classList.contains('active') && on === false;
  }
  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!on) {
      if ((e.key === 'p' || e.key === 'P') && !busy(e)) { e.preventDefault(); open(); }
      return;
    }
    if (busy(e)) return;
    var k = e.key;
    if (k === 'Escape') { e.preventDefault(); close(); }
    else if (k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && !/^(BUTTON|A)$/.test(e.target.tagName))) { e.preventDefault(); go(idx + 1); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); go(idx - 1); }
    else if (k === 'Home') { e.preventDefault(); go(0); }
    else if (k === 'End') { e.preventDefault(); go(STOPS.length - 1); }
  }
  function build() {
    btnOpen = document.createElement('button');
    btnOpen.type = 'button'; btnOpen.className = 'pz-open';
    btnOpen.setAttribute('aria-controls', 'pz-hud'); btnOpen.setAttribute('aria-expanded', 'false');
    btnOpen.innerHTML = '<span aria-hidden="true">▶</span> Mod prezentare <kbd>P</kbd>';
    btnOpen.addEventListener('click', open);

    hud = document.createElement('div');
    hud.id = 'pz-hud'; hud.className = 'pz-hud'; hud.hidden = true;
    hud.setAttribute('role', 'region'); hud.setAttribute('aria-label', 'Mod prezentare');
    hud.innerHTML =
      '<button type="button" class="pz-prev" aria-label="Oprirea anterioară">‹</button>' +
      '<p class="pz-where" aria-live="polite"><span class="pz-step"></span><span class="pz-title"></span></p>' +
      '<button type="button" class="pz-next" aria-label="Oprirea următoare">›</button>' +
      '<p class="pz-time" aria-label="Timp scurs din 15 minute"></p>' +
      '<button type="button" class="pz-close">Ieșire <kbd>Esc</kbd></button>';
    lblStep = hud.querySelector('.pz-step'); lblTitle = hud.querySelector('.pz-title'); lblTime = hud.querySelector('.pz-time');
    hud.querySelector('.pz-prev').addEventListener('click', function () { go(idx - 1); });
    hud.querySelector('.pz-next').addEventListener('click', function () { go(idx + 1); });
    hud.querySelector('.pz-close').addEventListener('click', close);

    document.body.appendChild(btnOpen);
    document.body.appendChild(hud);
    document.addEventListener('keydown', onKey);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
