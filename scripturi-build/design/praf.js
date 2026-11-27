/* „Praf de stepă”: pe suprafețele de antracit, o ceață caldă (aur stins + teracotă) urmărește cursorul cu întârziere.
   Doar cu mouse (pointer: fine) și fără „mișcare redusă”. Stratul e sub conținut și nu primește clicuri. Prefix: pr-. */
(function () {
  var HOSTS = '#page-acasa .r2-head, .cta-card, #mod-migratie.site-page, [data-praf]';
  var LERP = 0.12;
  var mqFine = window.matchMedia ? matchMedia('(pointer: fine)') : null;
  var mqReduce = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  var cur = null, raf = 0, x = 0, y = 0, tx = 0, ty = 0;

  function allowed() { return !!(mqFine && mqFine.matches) && !(mqReduce && mqReduce.matches); }
  function layer(host) {
    var d = host.querySelector(':scope > .pr-dust');
    if (d) return d;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.classList.add('pr-host');
    d = document.createElement('span'); d.className = 'pr-dust'; d.setAttribute('aria-hidden', 'true');
    d.innerHTML = '<span class="pr-blob"></span>';
    host.insertBefore(d, host.firstChild);
    return d;
  }
  function tick() {
    raf = 0; if (!cur) return;
    x += (tx - x) * LERP; y += (ty - y) * LERP;
    cur.blob.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
    if (cur.on || Math.abs(tx - x) + Math.abs(ty - y) > 0.5) raf = requestAnimationFrame(tick);
  }
  function aim(e) {
    var r = cur.dust.getBoundingClientRect();
    tx = e.clientX - r.left; ty = e.clientY - r.top;
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function enter(e) {
    if (!allowed()) return;
    var host = e.target.closest && e.target.closest(HOSTS); if (!host) return;
    if (cur && cur.host === host) { cur.on = true; return; }
    if (cur) cur.dust.classList.remove('pr-on');
    var dust = layer(host);
    cur = { host: host, dust: dust, blob: dust.firstChild, on: true };
    var r = dust.getBoundingClientRect();
    x = tx = e.clientX - r.left; y = ty = e.clientY - r.top;
    cur.blob.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    dust.classList.add('pr-on');
  }
  document.addEventListener('pointerover', enter, { passive: true });
  document.addEventListener('pointermove', function (e) {
    if (!cur || e.pointerType !== 'mouse') return;
    if (!cur.host.contains(e.target)) { cur.on = false; cur.dust.classList.remove('pr-on'); cur = null; return; }
    aim(e);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', function () { if (cur) { cur.dust.classList.remove('pr-on'); cur = null; } });
  if (mqReduce && mqReduce.addEventListener) mqReduce.addEventListener('change', function () { if (cur) { cur.dust.classList.remove('pr-on'); cur = null; } });
})();
