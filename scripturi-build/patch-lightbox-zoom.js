// Fereastra cu imaginea mărită primește zoom (rotiță, dublu-clic, tragere, ciupit cu două degete,
// butoane + / − / 1:1); hărțile intră și ele în fereastră; buton „Înapoi sus” pe pagina Acasă.
// Folosire: node scripturi-build/patch-lightbox-zoom.js (se poate rula de mai multe ori)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const JS = `  // Click (or Enter) on an article image opens it larger, with its caption; lb-zoom: the image can be zoomed and panned.
  (function initLightbox(){
    var imgs = document.querySelectorAll('.fig-gallery img, .dc-img img, .sr-fig img, .fig-map img');
    if (!imgs.length) return;
    var box = document.createElement('div');
    box.className = 'img-lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Imagine mărită');
    var I = function(d){ return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="' + d + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'; };
    box.innerHTML = '<div class="lb-tools"><button class="lb-z" type="button" data-z="-1" aria-label="Micșorează">' + I('M3 8h10') + '</button>' +
      '<span class="lb-pct" aria-live="polite">100%</span>' +
      '<button class="lb-z" type="button" data-z="1" aria-label="Mărește">' + I('M3 8h10M8 3v10') + '</button>' +
      '<button class="lb-z" type="button" data-z="0" aria-label="Mărime inițială">' + I('M3 6V3h3M10 3h3v3M13 10v3h-3M6 13H3v-3') + '</button>' +
      '<button class="lb-close" type="button" aria-label="Închide">' + I('M4 4l8 8M12 4l-8 8') + '</button></div>' +
      '<figure><div class="lb-view"><img alt="" draggable="false"></div><figcaption></figcaption></figure>' +
      '<p class="lb-hint">Rotița sau dublu-clic pentru zoom, apoi trage imaginea. Pe telefon: ciupește cu două degete.</p>';
    document.body.appendChild(box);
    var view = box.querySelector('.lb-view'), bImg = box.querySelector('img'), bCap = box.querySelector('figcaption'), pct = box.querySelector('.lb-pct'), lastFocus = null;
    var s = 1, tx = 0, ty = 0, MAX = 6, ptrs = {}, pan = null, pinch = null, tgt = bImg, svgCopy = null;
    function clamp(){
      var w = view.clientWidth, h = view.clientHeight;
      var mx = Math.max(0, (tgt.offsetWidth * s - w) / 2), my = Math.max(0, (tgt.offsetHeight * s - h) / 2);
      tx = Math.max(-mx, Math.min(mx, tx)); ty = Math.max(-my, Math.min(my, ty));
    }
    function apply(anim){
      if (s <= 1.001) { s = 1; tx = 0; ty = 0; }
      clamp();
      tgt.style.transition = anim ? 'transform 0.3s cubic-bezier(.16,1,.3,1)' : 'none';
      tgt.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')';
      view.classList.toggle('zoomed', s > 1);
      pct.textContent = Math.round(s * 100) + '%';
    }
    // zoom around a point given in viewport coordinates
    function zoomAt(ns, cx, cy, anim){
      ns = Math.max(1, Math.min(MAX, ns));
      var r = view.getBoundingClientRect(), px = cx - (r.left + r.width / 2), py = cy - (r.top + r.height / 2);
      tx = px - (px - tx) * ns / s; ty = py - (py - ty) * ns / s; s = ns;
      apply(anim);
    }
    function center(){ var r = view.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
    function open(img){
      lastFocus = img;
      if (svgCopy) { svgCopy.remove(); svgCopy = null; }
      var svg = img.tagName !== 'IMG' && img.querySelector('svg');
      if (svg) {
        svgCopy = svg.cloneNode(true); svgCopy.classList.add('lb-svg');
        var holder = document.createElement('div'); holder.className = img.className + ' lb-svg-wrap'; holder.appendChild(svgCopy);
        svgCopy = holder; view.appendChild(holder); bImg.hidden = true; tgt = holder;
      } else { bImg.hidden = false; bImg.src = img.src; bImg.alt = img.alt; tgt = bImg; }
      var cap = (img.closest('figure') || img).querySelector('figcaption');
      bCap.innerHTML = cap ? cap.innerHTML : '';
      s = 1; tx = 0; ty = 0; apply(false);
      box.classList.add('show');
      document.documentElement.classList.add('lb-open');
      box.querySelector('.lb-close').focus();
    }
    function close(){ box.classList.remove('show'); document.documentElement.classList.remove('lb-open'); if (lastFocus) lastFocus.focus(); }
    var svgs = document.querySelectorAll('.ptol-map');
    Array.prototype.forEach.call(svgs, function(d){
      d.tabIndex = 0; d.classList.add('lb-able');
      d.addEventListener('click', function(){ open(d); });
      d.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(d); } });
    });
    imgs.forEach(function(img){
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'Mărește imaginea: ' + img.alt);
      img.addEventListener('click', function(){ open(img); });
      img.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(img); } });
    });
    box.addEventListener('click', function(e){
      if (e.target.closest('.lb-close') || e.target === box) { close(); return; }
      var z = e.target.closest('.lb-z');
      if (z) { var d = +z.getAttribute('data-z'), c = center(); if (d === 0) { s = 1; apply(true); } else zoomAt(s * (d > 0 ? 1.6 : 1 / 1.6), c[0], c[1], true); }
    });
    view.addEventListener('wheel', function(e){ e.preventDefault(); zoomAt(s * Math.exp(-e.deltaY * 0.0022), e.clientX, e.clientY, false); }, { passive: false });
    view.addEventListener('dblclick', function(e){ if (s > 1) { s = 1; apply(true); } else zoomAt(2.5, e.clientX, e.clientY, true); });
    view.addEventListener('pointerdown', function(e){
      ptrs[e.pointerId] = [e.clientX, e.clientY];
      try { view.setPointerCapture(e.pointerId); } catch (err) {}
      var ids = Object.keys(ptrs);
      if (ids.length === 2) {
        var p = ptrs[ids[0]], q = ptrs[ids[1]];
        pinch = { d: Math.hypot(p[0] - q[0], p[1] - q[1]), s: s }; pan = null;
      } else if (s > 1) pan = { x: e.clientX, y: e.clientY, tx: tx, ty: ty };
      e.preventDefault();
    });
    view.addEventListener('pointermove', function(e){
      if (!ptrs[e.pointerId]) return;
      ptrs[e.pointerId] = [e.clientX, e.clientY];
      var ids = Object.keys(ptrs);
      if (pinch && ids.length === 2) {
        var p = ptrs[ids[0]], q = ptrs[ids[1]], d = Math.hypot(p[0] - q[0], p[1] - q[1]);
        zoomAt(pinch.s * d / pinch.d, (p[0] + q[0]) / 2, (p[1] + q[1]) / 2, false);
      } else if (pan) { tx = pan.tx + e.clientX - pan.x; ty = pan.ty + e.clientY - pan.y; apply(false); }
    });
    function up(e){ delete ptrs[e.pointerId]; if (Object.keys(ptrs).length < 2) pinch = null; pan = null; }
    view.addEventListener('pointerup', up);
    view.addEventListener('pointercancel', up);
    document.addEventListener('keydown', function(e){
      if (!box.classList.contains('show')) return;
      var c = center();
      if (e.key === 'Escape') close();
      else if (e.key === '+' || e.key === '=') zoomAt(s * 1.6, c[0], c[1], true);
      else if (e.key === '-') zoomAt(s / 1.6, c[0], c[1], true);
      else if (e.key === 'Tab') {
        var f = box.querySelectorAll('button'), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener('resize', function(){ if (box.classList.contains('show')) apply(false); });
  })();

  // Înapoi sus: apare după ce ai coborât mult pe pagina Acasă.
  (function initToTop(){
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'to-top'; b.setAttribute('aria-label', 'Înapoi sus');
    b.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 10l5-5 5 5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    document.body.appendChild(b);
    var home = document.getElementById('page-acasa');
    function upd(){ var vis = window.pageYOffset > 1400 && (!home || !home.hidden && home.offsetParent !== null); b.classList.toggle('show', vis); b.tabIndex = vis ? 0 : -1; }
    window.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('hashchange', function(){ setTimeout(upd, 50); });
    b.addEventListener('click', function(){
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
    upd();
  })();
`;

const CSS = `  /* lb-zoom: zoom în fereastra imaginii; buton „Înapoi sus” */
  .img-lightbox figure{ width: min(1100px, 100%); }
  .img-lightbox .lb-view{ position: relative; width: 100%; height: calc(100vh - 190px); display: flex; align-items: center; justify-content: center; overflow: hidden; touch-action: none; cursor: zoom-in; }
  .img-lightbox .lb-view.zoomed{ cursor: grab; }
  .img-lightbox .lb-view.zoomed:active{ cursor: grabbing; }
  .img-lightbox .lb-view img{ max-width: 100%; max-height: 100%; transform-origin: center; will-change: transform; user-select: none; -webkit-user-drag: none; }
  .lb-tools{ position: absolute; top: 12px; right: 14px; display: flex; align-items: center; gap: 6px; z-index: 2; }
  .lb-tools button{ position: static; display: inline-grid; place-items: center; width: 40px; height: 40px; padding: 0; background: rgba(14, 14, 16, 0.75); border: 1px solid rgba(212, 175, 55, 0.5); color: #e6d7c3; cursor: pointer; }
  .lb-tools button svg{ width: 16px; height: 16px; }
  .lb-tools button:hover, .lb-tools button:focus-visible{ border-color: #d4af37; color: #d4af37; outline: none; }
  .lb-pct{ min-width: 48px; text-align: center; font: 700 0.74rem 'JetBrains Mono', monospace; color: #e6d7c3; font-variant-numeric: tabular-nums; }
  .lb-hint{ position: absolute; left: 50%; bottom: 10px; transform: translateX(-50%); margin: 0; font: 0.72rem 'JetBrains Mono', monospace; color: rgba(230, 215, 195, 0.6); white-space: nowrap; }
  html.lb-open{ overflow: hidden; }
  .lb-able{ cursor: zoom-in; }
  .lb-able:focus-visible{ outline: 2px solid var(--accent-2); outline-offset: 4px; }
  .img-lightbox .lb-svg-wrap{ width: min(100%, calc((100vh - 190px) * 1.5)); max-width: none; margin: 0; transform-origin: center; }
  .img-lightbox .lb-svg-wrap figcaption{ display: none; }
  .img-lightbox .lb-svg-wrap svg{ display: block; width: 100%; height: auto; }
  .to-top{ position: fixed; right: 18px; bottom: 86px; z-index: 90; display: grid; place-items: center; width: 44px; height: 44px; padding: 0; border: 1px solid var(--accent-2); background: color-mix(in srgb, var(--paper) 88%, transparent); color: var(--accent-2); cursor: pointer; opacity: 0; transform: translateY(10px); pointer-events: none; transition: opacity 0.25s, transform 0.25s; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4); }
  .to-top svg{ width: 18px; height: 18px; }
  .to-top.show{ opacity: 1; transform: none; pointer-events: auto; }
  .to-top:hover{ background: var(--accent-2); color: var(--paper); }
  .to-top:focus-visible{ outline: 2px solid var(--accent-2); outline-offset: 3px; }
  @media (max-width: 640px){ .lb-hint{ display: none; } .img-lightbox .lb-view{ height: calc(100vh - 170px); } .to-top{ right: 12px; bottom: 92px; } }
  @media (prefers-reduced-motion: reduce){ .to-top{ transition: none; } }
  /* /lb-zoom */
`;

for (const rel of ['index.html', 'atelierul-hunilor.html', 'module-individuale/huni-prezentare.html']) {
  const f = path.join(root, rel);
  if (!fs.existsSync(f)) continue;
  const raw = fs.readFileSync(f, 'utf8');
  const crlf = raw.includes('\r\n');
  let s = raw.split('\r\n').join('\n');
  const j0 = s.indexOf('  // Click (or Enter) on an article image opens it larger');
  if (j0 < 0) { console.log(rel + ': fără lightbox, sărit'); continue; }
  // capătul: până la „initToTop” inclusiv (dacă a fost deja aplicat) sau până la sfârșitul lui initLightbox
  let j1;
  const tt = s.indexOf('  (function initToTop(){', j0);
  if (tt >= 0) j1 = s.indexOf('\n  })();\n', tt) + '\n  })();\n'.length;
  else j1 = s.indexOf('\n  })();\n', j0) + '\n  })();\n'.length;
  s = s.slice(0, j0) + JS + s.slice(j1);

  const c0 = s.indexOf('  /* lb-zoom:');
  if (c0 >= 0) { const e = '  /* /lb-zoom */\n'; s = s.slice(0, c0) + CSS + s.slice(s.indexOf(e, c0) + e.length); }
  else {
    const at = s.indexOf('  .lb-close:hover, .lb-close:focus-visible{');
    if (at < 0) { console.error(rel + ': CSS lightbox negăsit'); process.exit(1); }
    const eol = s.indexOf('\n', at) + 1;
    s = s.slice(0, eol) + CSS + s.slice(eol);
  }
  fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
  console.log(rel + ': zoom și „Înapoi sus”');
}
