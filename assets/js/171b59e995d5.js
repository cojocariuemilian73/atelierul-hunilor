
/* „Izvoarele, față în față”: tabelul devine un caiet de cercetare. Sus, o axă comună a distanței față de evenimente
   (0 → 100 de ani), cu câte un nod pentru fiecare izvor; dedesubt, câte o coloană pe izvor, fără cutii, cu o linie
   fină în stânga colorată după statut. Nodul și coloana se evidențiază împreună (hover, focus, click).
   Datele se citesc din tabelul existent; celulele se mută, nu se copiază (glosarul rămâne funcțional).
   Fără JavaScript rămâne tabelul. */
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

    var box = el('div', 'si-wrap');
    var axisBox = el('div', 'si-ax');
    axisBox.appendChild(el('p', 'si-ax-label', 'Distanța față de evenimentele descrise'));
    var track = el('div', 'si-ax-track');
    track.appendChild(el('span', 'si-ax-line'));
    [[0, '0 ani'], [50, '50 ani'], [100, '100 ani']].forEach(function (t) {
      var s = el('span', 'si-ax-tick', '<small>' + t[1] + '</small>'); s.style.left = t[0] + '%'; track.appendChild(s);
    });
    track.appendChild(el('span', 'si-ax-azi', '<small>azi</small>'));
    axisBox.appendChild(track);
    var grid = el('div', 'si-grid');
    grid.setAttribute('role', 'list');
    var nodes = [], cards = [], used = {}, pinned = -1;

    function select(k, on, sticky) {
      cards.forEach(function (c, i) {
        var hit = on && i === k;
        c.classList.toggle('si-on', hit);
        nodes[i].classList.toggle('si-on', hit);
        nodes[i].setAttribute('aria-pressed', sticky && hit ? 'true' : 'false');
      });
      box.classList.toggle('si-focus', !!on);
    }

    Array.prototype.forEach.call(heads, function (th, k) {
      var kind = th.classList.contains('sc-obj') ? 'obj' : th.classList.contains('sc-dna') ? 'dna' : 'text';
      var card = el('article', 'si si-' + kind);
      card.setAttribute('role', 'listitem');
      card.style.setProperty('--k', k);
      var head = el('header', 'si-head');
      var name = el('h4', 'si-name'); var b = th.querySelector('b'); if (b) moveKids(b, name);
      var meta = el('p', 'si-meta'); var sm = th.querySelector('small'); if (sm) moveKids(sm, meta);
      head.appendChild(name); head.appendChild(meta);
      card.appendChild(head);

      // distanța: valoarea din tabel + poziția pe axa comună
      var gapCell = rowCells[0] && rowCells[0][k];
      var w = 0, modern = false, label = '';
      if (gapCell) {
        var g = gapCell.querySelector('.sc-gap');
        var fill = g && g.querySelector('i'); w = fill ? parseFloat(fill.style.width) || 0 : 0;
        label = (g ? g.textContent : gapCell.textContent).trim();
        modern = !!(g && g.classList.contains('modern'));
      }
      if (label) {
        var dv = el('p', 'si-dist-v');
        dv.appendChild(el('span', 'si-label', 'Distanța'));
        dv.appendChild(el('span', 'si-num', label));
        card.appendChild(dv);
      }

      // statutul sursei: insignă scurtă + formularea exactă din tabel; culoarea liniei vine de aici
      var typeCell = rowCells[1] && rowCells[1][k];
      var status = 'far';
      if (typeCell) {
        var wp = typeCell.querySelector('.sc-w');
        var yes = wp && wp.classList.contains('sc-w-yes'), obj = wp && wp.classList.contains('sc-w-obj');
        var txt = (wp || typeCell).textContent;
        var contemp = /contemporan/i.test(txt);
        var badge = yes ? 'Martor ocular' : obj ? (/modern/i.test(txt) ? 'Analiză modernă' : 'Dovadă din epocă')
          : (contemp ? 'Contemporan, fără întâlnire consemnată' : 'Relatare târzie');
        status = modern ? 'modern' : (yes || obj) ? 'witness' : (contemp || w < 40) ? 'contemp' : 'far';
        var t = el('div', 'si-type');
        t.appendChild(el('span', 'si-badge', badge));
        var mark = wp && wp.querySelector('span[aria-hidden]'); if (mark) mark.remove();
        t.appendChild(moveKids(wp || typeCell, el('p', 'si-type-t')));
        card.appendChild(t);
      }
      card.classList.add('si-st-' + status);
      [['Ce aflăm', 2, 'si-learn'], ['Limite', 3, 'si-limit']].forEach(function (d) {
        var c = rowCells[d[1]] && rowCells[d[1]][k]; if (!c) return;
        var bl = el('div', 'si-block ' + d[2]);
        bl.appendChild(el('p', 'si-label', d[0]));
        bl.appendChild(moveKids(c, el('p', 'si-text')));
        card.appendChild(bl);
      });

      // nodul de pe axă; izvoarele cu aceeași distanță se așază pe rânduri diferite
      var pos = Math.max(0, Math.min(100, w));
      var slot = modern ? 'azi' : Math.round(pos / 8);
      var lane = used[slot] = (used[slot] || 0) + 1;
      var node = el('button', 'si-node si-st-' + status + (modern ? ' si-node-azi' : pos > 70 ? ' si-node-end' : ''));
      node.type = 'button';
      node.style.left = (modern ? 100 : pos) + '%';
      node.style.setProperty('--lane', lane - 1);
      var nm = name.textContent.trim();
      node.setAttribute('aria-label', nm + ': ' + (label || 'distanță necunoscută'));
      node.setAttribute('aria-pressed', 'false');
      node.appendChild(el('span', 'si-node-dot'));
      node.appendChild(el('span', 'si-node-lab', nm.split(/[\s,]+/)[0]));
      track.appendChild(node);
      nodes.push(node); cards.push(card);
      card.dataset.pos = modern ? 101 : pos;
      card.dataset.st = status;

      function enter() { if (pinned === -1) select(k, true, false); }
      function leave() { if (pinned === -1) select(k, false, false); }
      [node, card].forEach(function (x) {
        x.addEventListener('pointerenter', enter);
        x.addEventListener('pointerleave', leave);
      });
      node.addEventListener('focus', enter);
      node.addEventListener('blur', leave);
      node.addEventListener('click', function () {
        pinned = pinned === k ? -1 : k;
        select(k, pinned === k, pinned === k);
        if (pinned === k && matchMedia('(max-width: 899px)').matches) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
      grid.appendChild(card);
    });
    // fișele stau în ordinea distanței, ca fiecare să „atârne” sub nodul ei de pe axă
    cards.slice().sort(function (a, b) { return a.dataset.pos - b.dataset.pos; }).forEach(function (c) { grid.appendChild(c); });
    var hang = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    hang.setAttribute('class', 'si-hang'); hang.setAttribute('aria-hidden', 'true');
    box.appendChild(axisBox);
    box.appendChild(hang);
    box.appendChild(grid);
    wrap.after(box);
    wrap.hidden = true;
    // firele: din fiecare nod coboară o linie fină până la începutul fișei lui
    function hangs() {
      var br = box.getBoundingClientRect(), gr = grid.getBoundingClientRect();
      var one = getComputedStyle(grid).gridTemplateColumns.split(' ').length < 2;
      hang.style.display = one ? 'none' : '';
      if (one) return;
      hang.setAttribute('width', br.width); hang.setAttribute('height', br.height);
      hang.innerHTML = '';
      cards.forEach(function (c, i) {
        var d = nodes[i].querySelector('.si-node-dot').getBoundingClientRect(), cr = c.getBoundingClientRect();
        var x1 = d.left + d.width / 2 - br.left, y1 = d.bottom - br.top + 2;
        var x2 = cr.left + 1 - br.left, y2 = gr.top - br.top - 2;
        var mid = y2 - 18;
        var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('d', 'M' + x1 + ' ' + y1 + ' V' + mid + ' H' + x2 + ' V' + y2);
        p.setAttribute('class', 'si-st-' + c.dataset.st + (c.classList.contains('si-on') ? ' si-on' : ''));
        p.dataset.k = i;
        hang.appendChild(p);
      });
    }
    var _sel = select;
    select = function (k, on, sticky) { _sel(k, on, sticky); Array.prototype.forEach.call(hang.childNodes, function (p) { p.classList.toggle('si-on', on && +p.dataset.k === k); }); box.classList.toggle('si-focus', !!on); };
    // rândurile nodurilor se aleg după lățimea reală a etichetelor: două noduri nu se suprapun niciodată
    function lanes() {
      nodes.forEach(function (n) { n.style.setProperty('--lane', 0); });
      var ends = [];
      nodes.map(function (n) { return { n: n, r: n.getBoundingClientRect() }; })
        .sort(function (a, b) { return a.r.left - b.r.left; })
        .forEach(function (it) {
          var L = 0;
          while (ends[L] != null && ends[L] > it.r.left - 12) L++;
          ends[L] = it.r.right;
          it.n.style.setProperty('--lane', L);
        });
      track.style.setProperty('--lanes', Math.max(1, ends.length));
    }
    function layout() { lanes(); hangs(); }
    layout();
    addEventListener('resize', layout);
    addEventListener('load', layout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    if ('ResizeObserver' in window) new ResizeObserver(function () { hangs(); }).observe(grid);
    // apariția în cascadă când secțiunea intră în ecran
    if ('IntersectionObserver' in window) {
      box.classList.add('si-wait');
      var io = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        box.classList.remove('si-wait'); box.classList.add('si-in'); io.disconnect();
      }, { threshold: 0.12 });
      io.observe(box);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
