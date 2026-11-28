
/* Runda 24. Prefix: r24-. */
(function () {
  // 1. hârtia sulurilor (strat propriu, ca marginile rupte să nu taie tijele) + contorul de lângă șină
  function scrolls() {
    var grid = document.querySelector('#page-acasa .r9-car .si-grid');
    if (!grid) return false;
    if (grid.querySelector('.r24-paper')) return true;
    Array.prototype.forEach.call(grid.children, function (c) {
      var p = document.createElement('span'); p.className = 'r24-paper'; p.setAttribute('aria-hidden', 'true'); c.insertBefore(p, c.firstChild);
    });
    var pos = document.querySelector('#page-acasa .r9-pos'), dots = document.querySelector('#page-acasa .r9-dots');
    if (pos && dots) {
      var n = document.createElement('p'); n.className = 'r24-count'; n.setAttribute('aria-hidden', 'true');
      dots.parentNode.insertBefore(n, dots);
      var two = function (x) { return (x < 10 ? '0' : '') + x; };
      var upd = function () { var m = /(\d+) din (\d+)/.exec(pos.textContent); if (m) n.innerHTML = two(+m[1]) + '<span>/ ' + two(+m[2]) + '</span>'; };
      upd(); new MutationObserver(upd).observe(pos, { childList: true, characterData: true, subtree: true });
    }
    return true;
  }
  // 3. centrul orbitei: provocare + piesă la întâmplare
  function hub() {
    var h = document.querySelector('#page-acasa .r10-hub');
    if (!h) return false;
    if (h.querySelector('.r24-go')) return true;
    h.removeAttribute('aria-hidden');
    var q = h.querySelector('.r10-q');
    var k = document.createElement('p'); k.className = 'r24-kick'; k.textContent = '13 povești despre huni';
    h.insertBefore(k, q);
    var d = document.createElement('p'); d.className = 'r24-dare';
    d.textContent = 'Unele sunt adevărate, altele sunt legende născute de dușmanii lor. Le poți deosebi?';
    var b = document.createElement('button'); b.type = 'button'; b.className = 'r24-go'; b.textContent = 'Deschide una la întâmplare';
    var t = document.createElement('p'); t.className = 'r24-tip'; t.textContent = 'sau alege o imagine din cerc';
    h.appendChild(d); h.appendChild(b); h.appendChild(t);
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var its = document.querySelectorAll('#page-acasa .r10-it');
      if (its.length) its[Math.floor(Math.random() * its.length)].click();
    });
    return true;
  }
  function run() {
    var tries = 0;
    (function again() { var a = scrolls(), b = hub(); if (!(a && b) && ++tries < 20) setTimeout(again, 250); })();
  }
  if (document.readyState === 'complete') setTimeout(run, 500); else addEventListener('load', function () { setTimeout(run, 500); });
})();
