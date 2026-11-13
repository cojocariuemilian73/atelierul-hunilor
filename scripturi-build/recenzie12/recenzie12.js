(function(){
  // fișele de verdict: mit · imagine · verdict; pe pagină alternează, o dată normal, o dată în oglindă
  var D = window.R12 || {}, n = 0;
  function src(sel){ var el = document.querySelector(sel); return el ? (el.getAttribute('src') || el.currentSrc || '') : ''; }
  function card(k, title, first){
    var m = D[k]; if (!m) return '';
    var flip = n++ % 2 === 1, im = src(m.img);
    return '<article class="vd' + (flip ? ' vd-flip' : '') + '" aria-label="Mit verificat: ' + m.myth.replace(/"/g, '&quot;') + '">' +
      (first ? '<p class="vd-head"><i aria-hidden="true"></i>' + title + '</p>' : '') +
      '<div class="vd-grid"><div class="vd-myth"><div class="vd-say"><p class="vd-k">Se spune că</p><p class="vd-q">' + m.myth + '</p></div>' +
        '<div class="vd-from"><p class="vd-k">De unde vine</p><p>' + m.from + '</p></div></div>' +
      '<figure class="vd-fig">' + (im ? '<img src="' + im + '" alt="" loading="lazy"' + (m.pos ? ' style="object-position:' + m.pos + '"' : '') + '>' : '') + '<figcaption>' + m.cap + '</figcaption></figure>' +
      '<div class="vd-truth"><p class="vd-verdict"><small>Verdict</small><b>' + m.verdict + '</b></p>' +
        '<div class="vd-izv"><p class="vd-k">Ce spun izvoarele</p><p>' + m.izv + '</p></div>' +
        '<p class="vd-src">Sursa: ' + m.src + '</p></div></div>' +
    '</article>';
  }
  function draw(){
    n = 0;
    Array.prototype.forEach.call(document.querySelectorAll('.vd-group[data-myths]'), function(g){
      var t = g.getAttribute('data-title');
      g.innerHTML = g.getAttribute('data-myths').split(',').map(function(k, i){ return card(k, t, i === 0); }).join('');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', draw); else draw();
})();
