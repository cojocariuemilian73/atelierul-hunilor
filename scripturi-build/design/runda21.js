/* Runda 21: în rândul „Moartea lui Attila”, reperul temporal stă în secțiune, deasupra textului. Prefix: r21-. */
(function () {
  function run() {
    var row = document.querySelector('#page-acasa .sr-row.r16-bleed');
    var txt = row && row.querySelector('.sr-text');
    if (!txt || txt.querySelector('.r21-year')) return;
    var y = document.createElement('p'); y.className = 'r21-year';
    y.innerHTML = '<span class="r21-k">Sfârșitul hegemoniei</span>453 – 469 <em>d.Hr.</em>';
    txt.insertBefore(y, txt.firstChild);
  }
  if (document.readyState === 'complete') setTimeout(run, 400); else addEventListener('load', function () { setTimeout(run, 400); });
})();
