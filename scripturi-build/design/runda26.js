/* Runda 26: bara de sus devine transparentă cât timp stă peste copertă. Prefix: r26-. */
(function () {
  function run() {
    var nav = document.getElementById('site-nav'), hero = document.querySelector('#page-acasa #acasa');
    if (!nav || !hero) return;
    var tick = false;
    function upd() {
      tick = false;
      var page = document.getElementById('page-acasa');
      var on = !!(page && page.classList.contains('active')) && hero.getBoundingClientRect().bottom > nav.offsetHeight + 8;
      nav.classList.toggle('r26-over', on);
    }
    addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    addEventListener('resize', upd);
    addEventListener('hashchange', function () { setTimeout(upd, 60); });
    document.addEventListener('click', function () { setTimeout(upd, 120); });
    upd();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
