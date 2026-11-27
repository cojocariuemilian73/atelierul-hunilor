/* Runda 6: fiecare capitol își spune anii și etapa, ca pagina să se citească drept un singur fir cronologic. */
(function () {
  var SPANS = {
    'sec-origini': ['sec. III î.Hr. – 370 d.Hr.', 'Înainte de Europa: de unde vin hunii'],
    'sec-cronologie': ['370–476', 'Toată epoca, an cu an'],
    'sec-migratie': ['376–453', 'Valul de popoare și prețul păcii'],
    'sec-atlas': ['370–455', 'Drumurile, pe hartă'],
    'sec-personalitati': ['c. 391–454', 'Attila și Aetius']
  };
  function run() {
    Object.keys(SPANS).forEach(function (id) {
      var sec = document.getElementById(id); if (!sec) return;
      var head = sec.querySelector('.r2-head .r2-head-l'); if (!head || head.querySelector('.r6-span')) return;
      var p = document.createElement('p'); p.className = 'r6-span';
      p.innerHTML = '<b>' + SPANS[id][0] + '</b><i>' + SPANS[id][1] + '</i>';
      var mark = head.querySelector('.chapter-mark');
      if (mark && mark.nextSibling) head.insertBefore(p, mark.nextSibling); else head.appendChild(p);
    });
  }
  // benzile de capitol sunt construite de runda2 după încărcare
  function later() { run(); setTimeout(run, 400); }
  if (document.readyState === 'complete') later(); else addEventListener('load', later);
})();
