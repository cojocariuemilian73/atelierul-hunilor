(function(){
  // ---------- accesibilitatea: nicio imagine fără text alternativ, niciun titlu gol ----------
  // ferestrele (Atlasul, mărirea imaginilor) își completează titlurile la deschidere; până atunci au un text implicit
  var DEF = { 'mt-title': 'Detalii despre locul ales', 'mt-cap': 'Imagine din sursa istorică' };
  function txt(el){ return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }
  function fix(){
    Object.keys(DEF).forEach(function(id){ var el = document.getElementById(id); if (el && !txt(el)) el.textContent = DEF[id]; });
    Array.prototype.forEach.call(document.querySelectorAll('.img-lightbox figcaption'), function(c){ if (!txt(c)) c.textContent = 'Imagine mărită'; });
    Array.prototype.forEach.call(document.querySelectorAll('img'), function(img){
      // ferestrele își schimbă imaginea la fiecare deschidere: textul lor se recalculează mereu
      var live = img.matches('#mt-img, .img-lightbox img');
      if (!live && (img.getAttribute('alt') || '').trim()) return;
      var fig = img.closest('figure'), cap = fig && fig.querySelector('figcaption');
      var lab = img.closest('[aria-label]'), now = img.closest('.mig-now-c');
      var alt = (now && txt(now.querySelector('b'))) || txt(cap) || (lab && lab.getAttribute('aria-label')) || '';
      if (img.id === 'mt-img') alt = txt(document.getElementById('mt-title'));
      img.setAttribute('alt', alt || 'Imagine din articol');
    });
  }
  fix();
  var t = 0;
  new MutationObserver(function(){ clearTimeout(t); t = setTimeout(fix, 120); })
    .observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
})();
