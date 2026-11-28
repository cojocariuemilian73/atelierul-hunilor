/* Runda 25: după povestea aurului, nota „500 de solizi”, trimiterea spre Atlas și sursele hărții stau împreună
   într-o pagină pe două zone. Prefix: r25-. */
(function () {
  function run() {
    var to = document.querySelector('#page-acasa .to-atlas');
    var page = to && to.closest('.r14-page');
    if (!page || page.querySelector('.r25-after')) return !!page;
    var note = page.querySelector(':scope > aside.r9-note'), src = page.querySelector(':scope > .section-sources');
    var wrap = document.createElement('div'); wrap.className = 'r25-after';
    var side = document.createElement('div'); side.className = 'r25-side';
    page.insertBefore(wrap, note || to);
    if (note) wrap.appendChild(note);
    wrap.appendChild(side);
    side.appendChild(to);
    if (src) side.appendChild(src);
    return true;
  }
  var tries = 0;
  function again() { if (!run() && ++tries < 20) setTimeout(again, 250); }
  if (document.readyState === 'complete') setTimeout(again, 300); else addEventListener('load', function () { setTimeout(again, 300); });
})();
