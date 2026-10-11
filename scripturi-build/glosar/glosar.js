(function(){
  // gl: glosar. Prima apariție a fiecărui termen din articol primește o definiție la trecerea
  // mouse-ului, la focus sau la atingere; capitolul „Glosar” le adună pe toate.
  var GL = [
    { k: 'limes', t: 'Limes', re: /\blimes\b/i, d: 'Granița fortificată a Imperiului Roman, cu forturi și turnuri de pază. În Europa urma mai ales Rinul și Dunărea.' },
    { k: 'foederati', t: 'Foederati (federați)', re: /foederati/i, d: 'Popoare sau grupuri legate de Roma printr-un tratat (în latină, foedus). Primeau pământ sau plăți și luptau pentru Imperiu sub propriii conducători.' },
    { k: 'tribut', t: 'Tribut', re: /\btribut(ul|ului)?\b/i, d: 'Plată periodică, aici în aur, făcută de un stat altuia ca preț al păcii. Constantinopolul a plătit hunilor tribut între anii 420 și 450.' },
    { k: 'solid', t: 'Solid (solidus)', re: /\bsolid(ul)? de aur\b/i, d: 'Moneda romană de aur introdusă de Constantin cel Mare. Dintr-o livră de aur se băteau 72 de solizi, așa că unul cântărea circa 4,5 g.' },
    { k: 'livra', t: 'Livră romană', re: /\blivre de aur\b/i, d: 'Unitate de greutate de aproximativ 327 g. Tributul plătit hunilor se socotea în livre de aur.' },
    { k: 'hegemonie', t: 'Hegemonie', re: /\bhegemoni(a|ei|e)\b/i, d: 'Dominația unui popor asupra altora, care își păstrează conducătorii și teritoriile, dar plătesc tribut și dau războinici. Așa a stăpânit Attila popoarele din Câmpia Panonică.' },
    { k: 'arc', t: 'Arc compozit', re: /\barc(ul)? (recurbat )?compozit\b/i, d: 'Arc făcut din straturi de lemn, corn sau os și tendoane, lipite între ele. E mai scurt și mai puternic decât un arc simplu, deci potrivit pentru tras de pe cal.' },
    { k: 'policrom', t: 'Stil policrom', re: /\bstilul policrom\b/i, d: 'Podoabe de aur cu pietre colorate, mai ales granate, prinse în celule mici de metal (tehnica cloisonné). A fost moda elitelor din epoca migrațiilor.' },
    { k: 'deformare', t: 'Deformare craniană artificială', re: /\bcraniu(l)? deformat artificial\b/i, d: 'Alungirea craniului prin bandaje strânse în primii ani de viață. Era un semn de rang, practicat de mai multe popoare, nu doar de huni.' },
    { k: 'adn', t: 'ADN antic', re: /\bADN antic\b/, d: 'Material genetic extras din oase vechi. Arată din ce populații se trăgeau cei îngropați, dar nu și ce limbă vorbeau sau cum își spuneau.' },
    { k: 'izvor', t: 'Izvor istoric', re: /\bizvoarele antice\b/i, d: 'Orice sursă din epoca studiată: text, monedă, mormânt, inscripție. Cărțile istoricilor de azi sunt surse secundare, care interpretează izvoarele.' }
  ];
  var article = document.getElementById('page-acasa');
  if (!article) return;
  var SKIP = 'h1,h2,h3,h4,a,sup,button,figcaption,script,style,svg,.mx,.hx,.gs,.toc,.gl,.gl-list,#biblio,.chapter-mark,.sec-sub,.byline';

  // prima apariție a fiecărui termen, în ordinea textului
  function wrapFirst(item){
    var w = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, {
      acceptNode: function(n){
        var p = n.parentElement;
        if (!p || p.closest(SKIP) || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = w.nextNode())) {
      var m = item.re.exec(n.nodeValue);
      if (!m) continue;
      var after = n.splitText(m.index);
      after.splitText(m[0].length);
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'gl'; b.id = 'gl-in-' + item.k;
      b.setAttribute('data-gl', item.k);
      b.setAttribute('aria-describedby', 'gl-tip');
      b.textContent = after.nodeValue;
      after.parentNode.replaceChild(b, after);
      return b;
    }
    return null;
  }
  var found = {};
  GL.forEach(function(it){ found[it.k] = wrapFirst(it); });

  // lista din capitolul „Glosar”
  var list = document.getElementById('gl-list');
  if (list) {
    list.innerHTML = GL.slice().sort(function(a, b){ return a.t.localeCompare(b.t, 'ro'); }).map(function(it){
      return '<div class="gl-row"><dt>' + it.t + '</dt><dd>' + it.d +
        (found[it.k] ? ' <a class="gl-back" href="#gl-in-' + it.k + '" data-gl-go="' + it.k + '">vezi în text</a>' : '') + '</dd></div>';
    }).join('');
    list.addEventListener('click', function(e){
      var a = e.target.closest('[data-gl-go]'); if (!a) return;
      e.preventDefault();
      var el = found[a.getAttribute('data-gl-go')]; if (!el) return;
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
      el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
      setTimeout(function(){ el.focus({ preventScroll: true }); }, reduce ? 0 : 500);
    });
  }

  // definiția plutitoare
  var tip = document.createElement('div');
  tip.id = 'gl-tip'; tip.className = 'gl-tip'; tip.setAttribute('role', 'tooltip'); tip.hidden = true;
  document.body.appendChild(tip);
  var cur = null, hideT;
  function byKey(k){ for (var i = 0; i < GL.length; i++) if (GL[i].k === k) return GL[i]; return null; }
  function show(el){
    clearTimeout(hideT);
    var it = byKey(el.getAttribute('data-gl')); if (!it) return;
    cur = el;
    tip.innerHTML = '<b>' + it.t + '</b>' + it.d;
    tip.hidden = false;
    var r = el.getBoundingClientRect(), w = Math.min(320, window.innerWidth - 24);
    tip.style.width = w + 'px';
    var x = Math.max(12, Math.min(window.innerWidth - w - 12, r.left + r.width / 2 - w / 2));
    var h = tip.offsetHeight, y = r.top - h - 10;
    tip.classList.toggle('below', y < 70);
    if (y < 70) y = r.bottom + 10;
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  function hide(){ hideT = setTimeout(function(){ tip.hidden = true; cur = null; }, 80); }
  article.addEventListener('mouseover', function(e){ var g = e.target.closest('.gl'); if (g) show(g); });
  article.addEventListener('mouseout', function(e){ if (e.target.closest('.gl')) hide(); });
  article.addEventListener('focusin', function(e){ var g = e.target.closest('.gl'); if (g) show(g); });
  article.addEventListener('focusout', function(e){ if (e.target.closest('.gl')) hide(); });
  article.addEventListener('click', function(e){ var g = e.target.closest('.gl'); if (g) { if (cur === g && !tip.hidden) { tip.hidden = true; cur = null; } else show(g); } });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !tip.hidden) { tip.hidden = true; cur = null; } });
  window.addEventListener('scroll', function(){ if (!tip.hidden && cur) show(cur); }, { passive: true });
})();
