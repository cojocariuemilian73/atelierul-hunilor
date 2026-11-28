/* Runda 27. Prefix: r27-.
   1. „Drumul hunilor” (#sec-drum) se mută chiar înainte de „Personalități”.
   2. Orbita „Mit sau adevăr?” primește praful de stepă care urmărește cursorul (praf.js lucrează pe orice [data-praf]). */
(function () {
  function drum() {
    var d = document.getElementById('sec-drum'), p = document.getElementById('sec-personalitati');
    if (!d || !p || d.nextElementSibling === p) return;
    p.parentNode.insertBefore(d, p);
  }
  function praf() {
    var s = document.getElementById('sec-curiozitati');
    if (!s) return false;
    s.setAttribute('data-praf', '');
    return true;
  }
  drum();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', drum);
  var tries = 0;
  function again() { if (!praf() && ++tries < 40) setTimeout(again, 250); }
  if (document.readyState === 'complete') again(); else addEventListener('load', again);
})();
