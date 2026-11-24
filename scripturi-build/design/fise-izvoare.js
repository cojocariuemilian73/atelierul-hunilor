/* „Izvoarele, față în față”: tabelul devine câte o fișă pentru fiecare izvor. Datele se citesc din tabelul existent;
   celulele se mută, nu se copiază (glosarul rămâne funcțional), iar tabelul golit se ascunde. Fără JavaScript rămâne tabelul. */
(function () {
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function moveKids(from, to) { while (from.firstChild) to.appendChild(from.firstChild); return to; }

  function build() {
    var table = document.querySelector('.src-compare .sc-table');
    var wrap = document.querySelector('.src-compare .sc-wrap');
    if (!table || !wrap || document.querySelector('.si-grid')) return;
    var heads = table.querySelectorAll('thead th:not(.sc-c0)');
    var rows = table.querySelectorAll('tbody tr');
    var rowCells = Array.prototype.map.call(rows, function (r) { return r.querySelectorAll('td'); });
    var grid = el('div', 'si-grid');
    grid.setAttribute('role', 'list');

    Array.prototype.forEach.call(heads, function (th, k) {
      var kind = th.classList.contains('sc-obj') ? 'obj' : th.classList.contains('sc-dna') ? 'dna' : 'text';
      var card = el('article', 'si si-' + kind);
      card.setAttribute('role', 'listitem');
      var head = el('header', 'si-head');
      var name = el('h4', 'si-name'); var b = th.querySelector('b'); if (b) moveKids(b, name);
      var meta = el('p', 'si-meta'); var sm = th.querySelector('small'); if (sm) moveKids(sm, meta);
      head.appendChild(name); head.appendChild(meta);
      card.appendChild(head);

      // distanța în timp: bară proporțională (0 = din epocă, plin = ~100 de ani)
      var gapCell = rowCells[0] && rowCells[0][k];
      if (gapCell) {
        var g = gapCell.querySelector('.sc-gap');
        var fill = g && g.querySelector('i'); var w = fill ? parseFloat(fill.style.width) || 0 : 0;
        var label = (g ? g.textContent : gapCell.textContent).trim();
        var modern = g && g.classList.contains('modern');
        var dist = el('div', 'si-dist' + (modern ? ' is-modern' : w === 0 ? ' is-zero' : ''));
        dist.appendChild(el('p', 'si-label', 'Distanța față de evenimente'));
        var track = el('div', 'si-track'); track.setAttribute('aria-hidden', 'true');
        var bar = el('i'); bar.style.setProperty('--w', (modern ? 100 : w) + '%'); track.appendChild(bar);
        dist.appendChild(track);
        dist.appendChild(el('p', 'si-dist-v', label));
        card.appendChild(dist);
      }
      // tipul sursei
      var typeCell = rowCells[1] && rowCells[1][k];
      if (typeCell) {
        var wp = typeCell.querySelector('.sc-w');
        var t = el('p', 'si-type' + (wp && wp.classList.contains('sc-w-yes') ? ' is-yes' : wp && wp.classList.contains('sc-w-obj') ? ' is-obj' : ' is-no'));
        var mark = wp && wp.querySelector('span[aria-hidden]'); if (mark) mark.remove();
        moveKids(wp || typeCell, t);
        card.appendChild(t);
      }
      // ce aflăm / limite
      [['Ce aflăm', 2, 'si-learn'], ['Limite', 3, 'si-limit']].forEach(function (d) {
        var c = rowCells[d[1]] && rowCells[d[1]][k]; if (!c) return;
        var box = el('div', 'si-block ' + d[2]);
        box.appendChild(el('p', 'si-label', d[0]));
        box.appendChild(moveKids(c, el('p', 'si-text')));
        card.appendChild(box);
      });
      grid.appendChild(card);
    });
    wrap.after(grid);
    // celulele s-au mutat în fișe; tabelul gol nu mai are rost
    wrap.hidden = true;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
