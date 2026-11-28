/* Runda 16: imaginea „Moartea lui Attila” până la marginea dreaptă a ecranului. Prefix: r16-. */
(function () {
  function run() {
    var img = Array.prototype.filter.call(document.querySelectorAll('#page-acasa .sr-row .sr-fig img'), function (i) { return /Attila zace mort/i.test(i.alt || ''); })[0];
    var row = img && img.closest('.sr-row');
    if (!row) return;
    row.classList.add('r16-bleed');
    function fit() {
      row.style.setProperty('--r16-bleed', '0px');
      var gap = document.documentElement.clientWidth - row.getBoundingClientRect().right;
      row.style.setProperty('--r16-bleed', Math.max(0, Math.round(gap)) + 'px');
    }
    fit();
    addEventListener('resize', fit);
  }
  if (document.readyState === 'complete') setTimeout(run, 300); else addEventListener('load', function () { setTimeout(run, 300); });
})();
