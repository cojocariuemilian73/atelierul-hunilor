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

    // fiecare izvor are culoarea lui în antetul fișei
    var TONES = ['#7a1c1c', '#8a5a1f', '#4a3a2b', '#9a7a2e', '#3f6b78'];
    Array.prototype.forEach.call(heads, function (th, k) {
      var kind = th.classList.contains('sc-obj') ? 'obj' : th.classList.contains('sc-dna') ? 'dna' : 'text';
      var card = el('article', 'si si-' + kind);
      card.setAttribute('role', 'listitem');
      card.style.setProperty('--tone', TONES[k % TONES.length]);
      var band = el('div', 'si-band');
      band.setAttribute('aria-hidden', 'true');
      band.appendChild(el('span', 'si-no', 'Fișa ' + (k < 9 ? '0' : '') + (k + 1)));
      band.appendChild(el('span', 'si-kind', kind === 'text' ? 'Izvor scris' : kind === 'dna' ? 'Cercetare de laborator' : 'Izvor material'));
      card.appendChild(band);
      var head = el('header', 'si-head');
      var name = el('h4', 'si-name'); var b = th.querySelector('b'); if (b) moveKids(b, name);
      var meta = el('p', 'si-meta'); var sm = th.querySelector('small'); if (sm) moveKids(sm, meta);
      head.appendChild(name); head.appendChild(meta);
      card.appendChild(head);

      // tipul sursei: o insignă scurtă, apoi formularea exactă din tabel
      var typeCell = rowCells[1] && rowCells[1][k];
      if (typeCell) {
        var wp = typeCell.querySelector('.sc-w');
        var yes = wp && wp.classList.contains('sc-w-yes'), obj = wp && wp.classList.contains('sc-w-obj');
        var txt = (wp || typeCell).textContent;
        var badge = yes ? 'Martor ocular' : obj ? (/modern/i.test(txt) ? 'Analiză modernă' : 'Dovadă din epocă')
          : (/contemporan/i.test(txt) ? 'Contemporan, nu martor' : 'Nu a fost martor');
        var t = el('div', 'si-type' + (yes ? ' is-yes' : obj ? ' is-obj' : ' is-no'));
        t.appendChild(el('span', 'si-badge', badge));
        var mark = wp && wp.querySelector('span[aria-hidden]'); if (mark) mark.remove();
        t.appendChild(moveKids(wp || typeCell, el('p', 'si-type-t')));
        card.appendChild(t);
      }

      // distanța în timp: o mică axă de la eveniment la ~100 de ani după, cu un punct pe ea
      var gapCell = rowCells[0] && rowCells[0][k];
      if (gapCell) {
        var g = gapCell.querySelector('.sc-gap');
        var fill = g && g.querySelector('i'); var w = fill ? parseFloat(fill.style.width) || 0 : 0;
        var label = (g ? g.textContent : gapCell.textContent).trim();
        var modern = g && g.classList.contains('modern');
        var dist = el('div', 'si-dist' + (modern ? ' is-modern' : w === 0 ? ' is-zero' : ''));
        dist.appendChild(el('p', 'si-label', 'Distanța față de evenimente'));
        var axis = el('div', 'si-axis'); axis.setAttribute('aria-hidden', 'true');
        axis.appendChild(el('span', 'si-line'));
        axis.appendChild(el('span', 'si-fill')).style.setProperty('--w', (modern ? 100 : w) + '%');
        [[0, 'eveniment'], [50, '50 ani'], [100, modern ? 'azi' : '100 ani']].forEach(function (tk) {
          var s = el('span', 'si-tick', '<small>' + tk[1] + '</small>'); s.style.left = tk[0] + '%'; axis.appendChild(s);
        });
        if (modern) axis.appendChild(el('span', 'si-break'));
        axis.appendChild(el('span', 'si-dot')).style.left = (modern ? 100 : w) + '%';
        dist.appendChild(axis);
        dist.appendChild(el('p', 'si-dist-v', label));
        card.appendChild(dist);
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
