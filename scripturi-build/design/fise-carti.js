/* Fișele „Ce se spune…” devin cărți care se întorc: în față mitul (cu imaginea), pe spate verdictul, dovada și sursa.
   Nodurile existente sunt mutate, nu copiate, ca notele și glosarul să rămână funcționale. */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var uid = 0;

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function mythText(p) {
    // „Mit respins: <s>…</s>” sau „Se spune că <s>…</s>.” → doar afirmația
    var s = p && p.querySelector('s');
    // ghilimelele din interior devin «…», ca să nu se dubleze cu „…” din jurul mitului
    return s ? s.textContent.trim().replace(/\.$/, '').replace(/„([^”]*)”/g, '«$1»') : '';
  }

  function makeCard(o) {
    var id = 'fc-' + (++uid);
    var card = el('article', 'fc');
    card.setAttribute('aria-labelledby', id + '-q');
    var inner = el('div', 'fc-inner');
    var front = el('div', 'fc-face fc-front');
    var back = el('div', 'fc-face fc-back');
    back.setAttribute('inert', '');
    back.setAttribute('aria-hidden', 'true');

    if (o.fig) { o.fig.className = 'fc-fig'; front.appendChild(o.fig); }
    var fbody = el('div', 'fc-body');
    if (o.question) fbody.appendChild(el('h4', 'fc-question', o.question)).id = id + '-q';
    fbody.appendChild(el('p', 'fc-k', 'Se spune că'));
    var myth = el('p', 'fc-myth', '„' + o.myth + '”');
    if (!o.question) myth.id = id + '-q';
    fbody.appendChild(myth);
    var bFlip = el('button', 'fc-btn', 'Ce spun izvoarele? <span aria-hidden="true">↻</span>');
    bFlip.type = 'button';
    bFlip.setAttribute('aria-controls', id + '-back');
    bFlip.setAttribute('aria-expanded', 'false');
    fbody.appendChild(bFlip);
    front.appendChild(fbody);

    back.id = id + '-back';
    var bbody = el('div', 'fc-body');
    bbody.appendChild(el('p', 'fc-stamp', 'Mitul, verificat'));
    bbody.appendChild(el('p', 'fc-myth-x', '<s>' + o.myth + '</s>'));
    if (o.answer) { o.answer.className = 'fc-answer'; bbody.appendChild(o.answer); }
    (o.extra || []).forEach(function (n) { bbody.appendChild(n); });
    var bBack = el('button', 'fc-btn fc-btn-back', '<span aria-hidden="true">↺</span> Înapoi la mit');
    bBack.type = 'button';
    bbody.appendChild(bBack);
    back.appendChild(bbody);

    inner.appendChild(front); inner.appendChild(back); card.appendChild(inner);

    function flip(toBack) {
      card.classList.toggle('is-flipped', toBack);
      bFlip.setAttribute('aria-expanded', toBack ? 'true' : 'false');
      if (toBack) { front.setAttribute('inert', ''); front.setAttribute('aria-hidden', 'true'); back.removeAttribute('inert'); back.removeAttribute('aria-hidden'); }
      else { back.setAttribute('inert', ''); back.setAttribute('aria-hidden', 'true'); front.removeAttribute('inert'); front.removeAttribute('aria-hidden'); }
      // focusul trece pe butonul feței care se vede acum
      setTimeout(function () { (toBack ? bBack : bFlip).focus({ preventScroll: true }); }, reduce ? 0 : 60);
    }
    bFlip.addEventListener('click', function () { flip(true); });
    bBack.addEventListener('click', function () { flip(false); });
    return card;
  }

  function fromResearch(a) {
    var fig = a.querySelector('figure');
    var q = a.querySelector('h4');
    var ans = a.querySelector('.vd-research-answer');
    var myth = mythText(a.querySelector('.vd-research-myth'));
    var extra = [];
    var ev = a.querySelector('.vd-evidence > div');
    if (ev) { var box = el('div', 'fc-evidence'); box.appendChild(el('p', 'fc-label', 'Dovada')); while (ev.firstChild) box.appendChild(ev.firstChild); extra.push(box); }
    return makeCard({ fig: fig, question: q ? q.textContent.trim() : '', myth: myth, answer: ans, extra: extra });
  }
  function fromVd(a) {
    var fig = a.querySelector('figure');
    var ans = a.querySelector('.vd-ans');
    var myth = mythText(a.querySelector('.vd-q'));
    var extra = [];
    var from = a.querySelector('.vd-from');
    if (from) {
      var box = el('div', 'fc-evidence');
      box.appendChild(el('p', 'fc-label', 'Context'));
      var p = el('p');
      // primul <span>Context</span> e doar eticheta veche
      var lead = from.querySelector('span');
      if (lead && /^Context/.test(lead.textContent.trim())) lead.textContent = lead.textContent.replace(/^Context\s*/, '');
      while (from.firstChild) p.appendChild(from.firstChild);
      box.appendChild(p); extra.push(box);
    }
    var src = a.querySelector('.vd-src'); if (src) { src.className = 'fc-src'; extra.push(src); }
    return makeCard({ fig: fig, question: '', myth: myth, answer: ans, extra: extra });
  }

  function convert(g) {
    if (g.classList.contains('fc-done')) return;
    var cards = g.querySelectorAll('article.vd-research-card, article.vd');
    if (!cards.length) return;
    var head = g.querySelector('h3');
    var grid = el('div', 'fc-grid');
    Array.prototype.forEach.call(cards, function (a) {
      grid.appendChild(a.classList.contains('vd-research-card') ? fromResearch(a) : fromVd(a));
    });
    var title = el('h3', 'fc-head', head ? head.textContent.trim() : 'Ce se spune');
    g.innerHTML = '';
    g.appendChild(title);
    g.appendChild(el('p', 'fc-hint', 'Citește ce se spune, apoi întoarce cartea ca să vezi ce arată izvoarele.'));
    g.appendChild(grid);
    g.classList.add('fc-done');
    g.classList.remove('vd-research');
  }
  function run() { Array.prototype.forEach.call(document.querySelectorAll('.vd-group'), convert); }
  function start() {
    run();
    // fișele se desenează de alt script; dacă nu erau gata, mai încearcă după încărcare
    if (document.querySelector('.vd-group:not(.fc-done)')) addEventListener('load', run);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 0); }); else setTimeout(start, 0);
})();
