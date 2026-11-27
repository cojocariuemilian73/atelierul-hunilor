

(function(){
  // fișele de verdict: mitul tăiat, verdictul într-un cuvânt și explicația, direct pe pergament;
  // imaginea mică alternează, o dată la stânga, o dată la dreapta
  var D = window.R12 || {}, n = 0;
  function figure(m, cls){
    var image = document.querySelector(m.img);
    var src = image && (image.getAttribute('src') || image.currentSrc);
    if (!src) return '';
    var pos = m.pos ? ' style="object-position:' + m.pos + '"' : '';
    return '<figure class="' + cls + '"><img src="' + src + '" alt="" loading="lazy"' + pos + '><figcaption>' + m.cap + '</figcaption></figure>';
  }
  function researchCard(k){
    var m = D[k];
    return '<article class="vd-research-card" aria-labelledby="vd-question-' + k + '">' +
      figure(m, 'vd-research-fig') +
      '<h4 id="vd-question-' + k + '">' + m.question + '</h4>' +
      '<p class="vd-research-answer"><b>' + m.answer + '</b> ' + m.izv + '</p>' +
      '<p class="vd-research-myth"><span class="vd-sr">Mit respins. </span>Se spune că <s>' + m.shortMyth + '</s>.</p>' +
      '<details class="vd-evidence"><summary>Vezi dovada</summary><div><p>' + m.from + '</p><p>' + m.src + '</p></div></details>' +
      '</article>';
  }
  function card(k){
    var m = D[k]; if (!m) return '';
    var flip = n++ % 2 === 1, fig = figure(m, 'vd-fig');
    return '<article class="vd' + (flip ? ' vd-flip' : '') + (fig ? '' : ' vd-noimg') + '" aria-label="Mit verificat">' +
      '<div class="vd-body">' + fig +
        '<div class="vd-text">' +
          '<p class="vd-k">Se spune că</p>' +
          '<p class="vd-q"><span class="vd-sr">Mit respins: </span><s>' + m.myth + '</s></p>' +
          '<p class="vd-ans"><b class="vd-verdict">' + m.verdict + '.</b> ' + m.izv + '</p>' +
          '<p class="vd-from"><span>Context</span> ' + m.from + '</p>' +
          '<p class="vd-src">Sursa: ' + m.src + '</p>' +
        '</div></div>' +
    '</article>';
  }
  function draw(){
    n = 0;
    Array.prototype.forEach.call(document.querySelectorAll('.vd-group[data-myths]'), function(g){
      var t = g.getAttribute('data-title');
      var ids = g.getAttribute('data-myths').split(',');
      if (ids.every(function(k){ return D[k] && D[k].question; })) {
        g.classList.add('vd-research');
        g.innerHTML = '<h3 class="vd-research-head">' + t + '</h3><div class="vd-research-grid">' +
          ids.map(researchCard).join('') + '</div>';
      } else {
        g.innerHTML = '<h3 class="vd-head"><i aria-hidden="true"></i>' + t + '</h3>' + ids.map(card).join('');
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', draw); else draw();
})();
