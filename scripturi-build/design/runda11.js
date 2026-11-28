/* Runda 11: marchează cele două rânduri care primesc compoziții după șabloane și adaugă anul mare (decorativ). Prefix: r11-. */
(function () {
  function run() {
    var sec = document.getElementById('sec-origini'); if (!sec) return;
    var rows = Array.prototype.slice.call(sec.querySelectorAll(':scope > .sr-row'));
    // deschiderea capitolului: primul rând (gravura + începutul textului)
    if (rows[0]) rows[0].classList.add('r11-mission');
    // „Viața nomadă și arta războiului”: an mare, cerc de teracotă, titlu amplu
    var tour = rows.filter(function (r) { var h = r.querySelector('h3'); return h && /^Viața nomadă/i.test(h.textContent.trim()); })[0];
    if (tour && !tour.querySelector('.r11-year')) {
      tour.classList.add('r11-tour');
      var media = tour.querySelector('.sr-media');
      if (media) {
        var y = document.createElement('p'); y.className = 'r11-year'; y.setAttribute('aria-hidden', 'true');
        y.textContent = 'c. 370';
        media.insertBefore(y, media.firstChild);
      }
    }
  }
  // Ptolemeu: un buton spre atlas, ca în compoziția de muzeu
  function ptol() {
    var side = document.querySelector('#page-acasa .ptol-map .r2-ptol-side');
    if (!side || side.querySelector('.r11-btn') || !document.getElementById('sec-atlas')) return;
    var a = document.createElement('a'); a.className = 'r11-btn'; a.href = '#sec-atlas'; a.textContent = 'Vezi drumurile în atlas →';
    side.appendChild(a);
  }
  var _run = run; run = function () { _run(); try { ptol(); } catch (e) {} };
  if (document.readyState === 'complete') setTimeout(run, 100); else addEventListener('load', function () { setTimeout(run, 100); });
})();
