/* Stratul editorial: „Despre proiect” împărțit în subsecțiuni aerisite.
   Fiecare <h3> din panouri devine începutul unei secțiuni (ab-sec), iar perechile „Etichetă: valoare”
   de la „Autor & coordonare” devin o listă de definiții. Nodurile se mută, nu se copiază. */
(function () {
  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }

  function sections(panel) {
    if (panel.querySelector('.ab-grid')) return;
    var heads = panel.querySelectorAll(':scope > h3');
    if (!heads.length) return;
    var grid = el('div', 'ab-grid');
    panel.insertBefore(grid, heads[0]);
    Array.prototype.forEach.call(heads, function (h) {
      var sec = el('section', 'ab-sec');
      grid.appendChild(sec);
      var n = h;
      while (n) {
        var next = n.nextSibling;
        sec.appendChild(n);
        n = next;
        if (n && n.nodeType === 1 && n.tagName === 'H3') break;
      }
      // listele lungi (simularea, creditele) ocupă toată lățimea
      var items = sec.querySelectorAll('li').length;
      if (items > 6) sec.classList.add('ab-wide');
      facts(sec);
    });
  }

  // „<p><strong>Elev autor:</strong> Nume</p>” → <dt>Elev autor</dt><dd>Nume</dd>
  function facts(sec) {
    var ps = Array.prototype.filter.call(sec.querySelectorAll(':scope > p'), function (p) {
      var s = p.firstElementChild;
      return s && s.tagName === 'STRONG' && /:\s*$/.test(s.textContent) && p.firstChild === s;
    });
    if (ps.length < 2) return;
    var dl = el('dl', 'ab-facts');
    ps[0].before(dl);
    ps.forEach(function (p) {
      var dt = el('dt'); dt.textContent = p.firstElementChild.textContent.replace(/:\s*$/, '');
      p.firstElementChild.remove();
      var dd = el('dd');
      while (p.firstChild) dd.appendChild(p.firstChild);
      dd.normalize();
      if (dd.firstChild && dd.firstChild.nodeType === 3) dd.firstChild.textContent = dd.firstChild.textContent.replace(/^\s+/, '');
      dl.appendChild(dt); dl.appendChild(dd);
      p.remove();
    });
  }

  function run() {
    Array.prototype.forEach.call(document.querySelectorAll('#about-overlay .ab-panel'), sections);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(run, 0); });
  else setTimeout(run, 0);
  addEventListener('load', run);
})();
