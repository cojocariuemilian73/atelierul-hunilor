/* Efectul de domino: piesele cad o singură dată, când rândul lor ajunge în ecran. „Reia animația” le ridică și le lasă din nou. */
(function () {
  function init() {
    var fig = document.getElementById('domino');
    if (!fig) return;
    var row = fig.querySelector('.dmn-track') || fig.querySelector('.dmn-row');
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function fall() { fig.classList.add('is-fallen'); }
    if (reduce || !('IntersectionObserver' in window)) { fall(); }
    else {
      // urmărește chiar rândul de piese, nu toată figura, ca animația să înceapă când piesele se văd
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { fall(); io.disconnect(); } });
      }, { threshold: 0.6 });
      io.observe(row);
    }
    var btn = fig.querySelector('.dmn-replay');
    if (btn) btn.addEventListener('click', function () {
      fig.classList.remove('is-fallen');
      // ridică piesele fără tranziție, apoi le lasă să cadă din nou
      var pieces = fig.querySelectorAll('.dmn-piece, .dmn-step');
      pieces.forEach(function (p) { p.style.transition = 'none'; });
      void fig.offsetWidth;
      pieces.forEach(function (p) { p.style.transition = ''; });
      setTimeout(fall, 60);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
