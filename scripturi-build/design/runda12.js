/* Runda 12: Personalități după două șabloane. Prefix: r12-.
   Nu schimbă textul ; adaugă doar repere decorative. */
(function () {
  var OVAL = '__ATTILA_OVAL__';
  function el(tag, cls, html) { var e = document.createElement(tag); e.className = cls; if (html) e.innerHTML = html; return e; }

  function personalitati() {
    var duel = document.querySelector('#page-acasa #sec-personalitati .duel.dk');
    if (!duel || duel.classList.contains('r12')) return;
    duel.classList.add('r12');
    // Attila: medalionul decupat „iese” din panoul în două tonuri, anul morții în contur, mare, în spate
    var a = duel.querySelector('.dk-card.attila');
    if (a) {
      a.classList.add('r12-a');
      var img = a.querySelector('.dc-img img');
      if (img && OVAL.indexOf('__') !== 0) { img.removeAttribute('srcset'); img.src = OVAL; }
      var g = el('p', 'r12-ghost'); g.setAttribute('aria-hidden', 'true'); g.textContent = '453';
      a.insertBefore(g, a.firstChild);
      a.appendChild(el('p', 'r12-reign', '<b>434–453</b>la conducerea hunilor'));
    }
    // Aetius: imaginea în centru, numele mare în două culori trece puțin peste ea, repere scurte pe margini
    var b = duel.querySelector('.dk-card.aetius');
    if (b) {
      b.classList.add('r12-b');
      var h = b.querySelector('h3');
      if (h && !h.querySelector('.r12-acc')) {
        var w = h.textContent.trim().split(/\s+/);
        if (w.length > 1) {
          var last = w.pop(); h.textContent = w.join(' ') + ' ';
          h.appendChild(el('span', 'r12-acc')).textContent = last;
        }
      }
      var tags = el('ul', 'r12-tags'); tags.setAttribute('aria-hidden', 'true');
      ['Ostatic la huni', 'Coaliția din 451', 'Ucis în 454'].forEach(function (t) { tags.appendChild(el('li', '')).textContent = t; });
      b.appendChild(tags);
      b.appendChild(el('p', 'r12-badge', '<b>451</b>Câmpiile Catalaunice'));
    }
  }

  function run() {
    try { personalitati(); } catch (e) { if (window.console) console.warn('runda12', e); }
  }
  if (document.readyState === 'complete') setTimeout(run, 120); else addEventListener('load', function () { setTimeout(run, 120); });
})();
