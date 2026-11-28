/* Runda 17: capul capitolului „Marea Migrație” după șablonul RenArt (imagine în arcadă, monedă rotundă, anul mare)
   și „Mecanismul efectului de domino” după șablonul Stone Groove (poză mare la mijloc, titlu mare, listă numerotată).
   Rulează înaintea literelor scrise din runda 14, ca titlurile să fie deja în forma finală. Prefix: r17-. */
(function () {
  function migratie() {
    var head = document.querySelector('#page-acasa #sec-migratie .r2-head');
    var aq = document.getElementById('img-aquileia');
    if (!head || !aq || head.classList.contains('r17-ren')) return;
    var fig = aq.closest('.sr-fig'), row = aq.closest('.sr-row');
    if (!fig || !row) return;
    head.classList.add('r17-ren');
    var arch = document.createElement('div'); arch.className = 'r17-arch';
    arch.appendChild(fig);
    var coin = document.getElementById('img-solidus');
    if (coin) {
      var c = coin.cloneNode(false);
      c.removeAttribute('id'); c.alt = ''; c.setAttribute('aria-hidden', 'true'); c.removeAttribute('tabindex'); c.removeAttribute('role');
      c.className = 'r17-coin'; c.loading = 'eager';
      arch.appendChild(c);
    }
    head.appendChild(arch);
    var y = document.createElement('p'); y.className = 'r17-year'; y.setAttribute('aria-hidden', 'true'); y.textContent = '—376';
    head.appendChild(y);
    row.classList.add('r17-solo');
  }

  function domino() {
    var z = document.getElementById('img-ziduri');
    var row = z && z.closest('.sr-row');
    if (!row || row.classList.contains('r17-big')) return;
    row.classList.add('r17-big');
    var h = row.querySelector('.sr-text > h3');
    if (h && !h.querySelector('.r17-acc')) {
      var w = h.textContent.trim().split(/\s+/);
      if (w.length > 2) {
        var tail = w.splice(1).join(' ');
        h.textContent = w.join(' ') + ' ';
        var s = document.createElement('span'); s.className = 'r17-acc'; s.textContent = tail; h.appendChild(s);
      }
    }
  }

  function run() {
    try { migratie(); } catch (e) { if (window.console) console.warn('runda17', e); }
    try { domino(); } catch (e) { if (window.console) console.warn('runda17', e); }
  }
  if (document.readyState === 'complete') setTimeout(run, 200); else addEventListener('load', function () { setTimeout(run, 200); });
})();
