(function(){
  // fișele de verdict: mitul tăiat, verdictul într-un cuvânt și explicația, direct pe pergament;
  // imaginea mică alternează, o dată la stânga, o dată la dreapta
  var D = window.R12 || {}, n = 0;
  function src(sel){ var el = document.querySelector(sel); return el ? (el.getAttribute('src') || el.currentSrc || '') : ''; }
  function card(k, title, first){
    var m = D[k]; if (!m) return '';
    var flip = n++ % 2 === 1, im = src(m.img);
    var fig = im ? '<figure class="vd-fig"><img src="' + im + '" alt="" loading="lazy"' + (m.pos ? ' style="object-position:' + m.pos + '"' : '') + '><figcaption>' + m.cap + '</figcaption></figure>' : '';
    return '<article class="vd' + (flip ? ' vd-flip' : '') + (im ? '' : ' vd-noimg') + '" aria-label="Mit verificat">' +
      (first ? '<p class="vd-head"><i aria-hidden="true"></i>' + title + '</p>' : '') +
      '<div class="vd-body">' + fig +
        '<div class="vd-text">' +
          '<p class="vd-k">Se spune că</p>' +
          '<p class="vd-q"><span class="vd-sr">Mit respins: </span><s>' + m.myth + '</s></p>' +
          '<p class="vd-ans"><b class="vd-verdict">' + m.verdict + '.</b> ' + m.izv + '</p>' +
          '<p class="vd-from"><span>De unde vine mitul:</span> ' + m.from + '</p>' +
          '<p class="vd-src">Sursa: ' + m.src + '</p>' +
        '</div></div>' +
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
