
/* Runda 3: marchează alternanța (stânga/dreapta) și intrările la derulare. Fără JS, pagina rămâne în ordinea de bază. */
(function () {
  function run() {
    var root = document.getElementById('page-acasa'); if (!root) return;
    // rândurile imagine + text: unul da, unul nu; rândul lipit (Delacroix) își păstrează așezarea
    function flips() {
      var n = 0;
      root.querySelectorAll('.sr-row').forEach(function (r) {
        r.classList.remove('r3-flip');
        if (r.classList.contains('ux-sticky-row')) return;
        if (n++ % 2 === 1) r.classList.add('r3-flip');
      });
    }
    flips();
    root.querySelectorAll('.r2-head').forEach(function (h, i) { if (i % 2 === 1) h.classList.add('r3-alt'); });
    var free = Array.prototype.filter.call(root.querySelectorAll('.page-shell .pq'), function (q) { return !q.closest('.margus-context, .duel-context, .gold-context, .r10-band, .r2-band'); });
    free.forEach(function (q, i) { q.classList.add(i % 2 ? 'r3-right' : 'r3-left'); });
    root.querySelectorAll('.margus-context, .gold-context, .r2-band').forEach(function (b, i) { b.classList.add(i % 2 ? 'r3-in-l' : 'r3-in-r'); });

    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var els = Array.prototype.slice.call(root.querySelectorAll('.r2-head')).concat(free);
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.remove('r3-wait'); io.unobserve(e.target); } });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) {
      var r = e.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) return; // deja în ecran: fără ascundere
      e.classList.add('r3-wait'); io.observe(e);
    });
    // plasă: nimic nu rămâne ascuns dacă observatorul nu se declanșează (ex. salt cu ancoră)
    addEventListener('hashchange', function () { els.forEach(function (e) { e.classList.remove('r3-wait'); }); });
  }
  // antetele .r2-head și rândul lipit se definitivează abia la încărcare (runda2, ux-hunilor): rulăm după ele
  // runda2 își construiește antetele cu 60 ms după DOMContentLoaded; așteptăm și antetele, și încărcarea
  var tries = 0;
  function later() { if ((document.querySelector('#page-acasa .r2-head') && document.querySelector('#page-acasa .r2-band')) || ++tries > 20) run(); else setTimeout(later, 100); }
  if (document.readyState === 'complete') setTimeout(later, 100); else addEventListener('load', function () { setTimeout(later, 100); });
})();
