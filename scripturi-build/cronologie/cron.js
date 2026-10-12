  // Cronologia: fiecare eveniment e un punct așezat la anul lui real.
  // Fereastra de jos alege intervalul mărit; filtrele ascund categorii întregi.
  var HX_CATS = {
    militar: { name: 'Militar', c: '#e0626c' },
    politic: { name: 'Politic', c: '#7ab0e8' },
    aur:     { name: 'Diplomație și aur', c: '#e5c158' },
    izvoare: { name: 'Izvoare', c: '#8fbd82' }
  };
  /** @typedef {{y:number, date:string, cat:string, short:string, title:string, desc:string, img?:string}} HxEvent */
  /** @type {HxEvent[]} */
  var CRON = [
    { y: 370, date: 'c. 370', cat: 'militar', short: 'Alanii', title: 'Hunii îi supun pe alani', desc: 'Hunii trec Volga și îi înfrâng pe alani, între Marea Azov și Caucaz. Alanii supuși vor lupta de acum alături de ei.' },
    { y: 375, date: '375', cat: 'politic', short: 'Ermanaric', title: 'Sfârșitul regatului lui Ermanaric', desc: 'Greutungii, strămoșii ostrogoților, sunt zdrobiți. Regele lor, Ermanaric, își ia viața, după Ammianus; Iordanes dă o altă versiune.' },
    { y: 376, date: '376', cat: 'politic', short: 'Dunărea', title: 'Tervingii trec Dunărea', desc: 'Fugind de huni, tervingii, strămoșii vizigoților, cer azil. Împăratul Valens îi primește în Imperiu, dar aprovizionarea lor e lăsată pe mâna unor comandanți corupți.' },
    { y: 378, date: '9 august 378', cat: 'militar', short: 'Adrianopol', title: 'Bătălia de la Adrianopol', desc: 'Goții revoltați zdrobesc armata Răsăritului, iar împăratul Valens moare în luptă. Ammianus compară dezastrul cu înfrângerea de la Cannae.' },
    { y: 390, date: 'c. 390', cat: 'izvoare', short: 'Ammianus', title: 'Ammianus Marcellinus scrie despre huni', desc: 'Cartea 31 a Istoriei sale cuprinde prima descriere amplă a hunilor, plină de tipare vechi despre „barbari”. Ammianus nu i-a văzut niciodată.' },
    { y: 395, date: '395–397', cat: 'militar', short: 'Caucaz', title: 'Raidul peste Caucaz', desc: 'Cete hunice trec Caucazul și jefuiesc Armenia, Cappadocia și Siria, semănând panică până la Antiohia.' },
    { y: 406.9, date: '31 decembrie 406', cat: 'militar', short: 'Rinul', title: 'Trecerea Rinului', desc: 'Vandalii, alanii și suebii trec Rinul și intră în Galia. Mulți istorici leagă plecarea lor de presiunea hunilor, mutați în Câmpia Panonică.' },
    { y: 408, date: '408', cat: 'militar', short: 'Uldin', title: 'Uldin trece Dunărea', desc: 'Regele hun Uldin cucerește Castra Martis, în Moesia. Romanii îi cumpără o parte din oameni, iar armata lui se destramă.' },
    { y: 410.6, date: '24 august 410', cat: 'politic', short: 'Roma', title: 'Alaric jefuiește Roma', desc: 'Vizigoții lui Alaric intră în Roma: prima cucerire a orașului de către un dușman străin în aproape 800 de ani.' },
    { y: 413, date: '413', cat: 'militar', short: 'Zidurile', title: 'Zidurile Theodosiene', desc: 'Constantinopolul primește un nou zid de uscat, care va rezista peste un mileniu. În 447 va fi refăcut în grabă, când se apropie Attila.', img: '#img-ziduri' },
    { y: 422, date: 'c. 422–430', cat: 'aur', short: '350 livre', title: 'Primul tribut cunoscut', desc: 'Sub regele Rua, Constantinopolul plătește hunilor 350 de livre de aur pe an, după Priscus. Data exactă e discutată.' },
    { y: 429, date: '429', cat: 'politic', short: 'Africa', title: 'Vandalii trec în Africa', desc: 'Conduși de Genseric, vandalii și alanii trec strâmtoarea Gibraltar și înaintează spre provinciile bogate ale Africii romane.' },
    { y: 435, date: 'c. 435', cat: 'aur', short: 'Margus', title: 'Tratatul de la Margus', desc: 'Noii regi, frații Attila și Bleda, obțin dublarea tributului, la 700 de livre de aur pe an, și deschiderea târgurilor de la graniță.' },
    { y: 439.8, date: '19 octombrie 439', cat: 'politic', short: 'Cartagina', title: 'Vandalii cuceresc Cartagina', desc: 'Al doilea oraș al Apusului cade aproape fără luptă. Regatul vandal din Africa va dura aproape un secol.' },
    { y: 441, date: '441–442', cat: 'militar', short: 'Naissus', title: 'Prima campanie în Balcani', desc: 'Attila și Bleda cuceresc Viminacium și Naissus (Niš). Cu trupele trimise în Sicilia împotriva vandalilor, Constantinopolul cere pace.' },
    { y: 445, date: 'c. 445', cat: 'politic', short: 'Bleda', title: 'Moartea lui Bleda', desc: 'Bleda moare, probabil ucis din ordinul fratelui său. Attila rămâne singur stăpân peste huni și peste popoarele supuse.', img: '#img-attila' },
    { y: 447, date: '447', cat: 'militar', short: 'Utus', title: 'A doua campanie în Balcani', desc: 'Un cutremur dărâmă o parte din zidurile Constantinopolului, refăcute apoi în circa două luni. Attila învinge armata romană la râul Utus și ajunge până la Termopile.', img: '#img-ziduri' },
    { y: 447.6, date: '443 sau 447', cat: 'aur', short: '2.100 livre', title: 'Pacea lui Anatolius', desc: 'Tributul urcă la 2.100 de livre de aur pe an, plus 6.000 de livre restanță. Istoricii datează pacea fie în 443, fie în 447.', img: '#img-solidus' },
    { y: 449, date: '449', cat: 'izvoare', short: 'Priscus', title: 'Solia lui Priscus', desc: 'Priscus din Panium însoțește o solie la curtea lui Attila și lasă singura descriere a ei făcută de un martor.' },
    { y: 450, date: 'c. 450', cat: 'politic', short: 'Honoria', title: 'Inelul Honoriei', desc: 'Honoria, sora împăratului Valentinian al III-lea, îi trimite lui Attila un inel și o cerere de ajutor. Attila o cere de soție, cu jumătate din Apus ca zestre.' },
    { y: 451.5, date: 'iunie 451', cat: 'militar', short: 'Catalaunice', title: 'Câmpiile Catalaunice', desc: 'Aetius și regele vizigot Teodoric I îl opresc pe Attila în Galia. Teodoric moare în luptă; Attila se retrage cu armata încă întreagă.', img: '#img-catalaunice' },
    { y: 452, date: '452', cat: 'militar', short: 'Aquileia', title: 'Invazia Italiei', desc: 'Attila distruge Aquileia și pustiește nordul Italiei. Se întoarce după întâlnirea cu o solie romană din care face parte papa Leon I.', img: '#img-aquileia' },
    { y: 453, date: '453', cat: 'politic', short: 'Attila †', title: 'Moartea lui Attila', desc: 'Attila moare în noaptea nunții cu Ildico, de o hemoragie, după Iordanes, care îl rezumă pe Priscus.', img: '#img-moartea' },
    { y: 454.5, date: 'c. 454', cat: 'militar', short: 'Nedao', title: 'Bătălia de la Nedao', desc: 'Popoarele supuse, conduse de gepidul Ardaric, se răscoală. Ellac, fiul cel mare al lui Attila, cade în luptă, iar imperiul hunic se destramă.' },
    { y: 469, date: '469', cat: 'militar', short: 'Dengizich', title: 'Sfârșitul lui Dengizich', desc: 'Dengizich, un alt fiu al lui Attila, e ucis în luptă cu romanii, iar capul lui e purtat prin Constantinopol: ultimul episod important al hunilor în Europa.' },
    { y: 476, date: '476', cat: 'politic', short: 'Odoacru', title: 'Sfârșitul Imperiului de Apus', desc: 'Odoacru, fost ofițer în armata romană, îl depune pe Romulus Augustulus. Tatăl lui, Edeco, fusese probabil unul dintre oamenii de încredere ai lui Attila.' }
  ];
  var HX_PERIODS = [
    { name: 'Toată perioada', a: 365, b: 480 },
    { name: 'Sosirea hunilor', a: 367, b: 382 },
    { name: 'Valul spre Apus', a: 392, b: 442 },
    { name: 'Epoca lui Attila', a: 433, b: 456 },
    { name: 'După Attila', a: 450, b: 479 }
  ];

  function initTimelineSlider(){
    var root = document.getElementById('hx');
    if (!root) return;
    var A0 = 365, B0 = 480, MIN = 6;
    var stage = document.getElementById('hx-stage'), dotsEl = document.getElementById('hx-dots'), grid = document.getElementById('hx-grid');
    var over = document.getElementById('hx-over'), win = document.getElementById('hx-win');
    var card = document.getElementById('hx-card'), rangeEl = document.getElementById('hx-range');
    var a = A0, b = B0, on = { militar: true, politic: true, aur: true, izvoare: true }, cur = -1;
    function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

    // benzile: câte una pentru fiecare tip de eveniment; numele benzii o ascunde sau o arată
    var CATS = Object.keys(HX_CATS), rowEl = {};
    document.getElementById('hx-names').innerHTML = CATS.map(function(k){
      var n = CRON.filter(function(e){ return e.cat === k; }).length;
      return '<button type="button" class="hx-lname" data-cat="' + k + '" aria-pressed="true" title="' + HX_CATS[k].name + ': arată sau ascunde" style="--c:' + HX_CATS[k].c + '"><i></i><b>' + HX_CATS[k].name + '</b><span>' + n + '</span></button>';
    }).join('');
    dotsEl.innerHTML = CATS.map(function(k){ return '<div class="hx-row" data-cat="' + k + '" style="--c:' + HX_CATS[k].c + '"></div>'; }).join('');
    CATS.forEach(function(k){ rowEl[k] = dotsEl.querySelector('.hx-row[data-cat="' + k + '"]'); });
    document.getElementById('hx-periods').innerHTML = HX_PERIODS.map(function(p, i){
      return '<button type="button" class="hx-per' + (i === 0 ? ' on' : '') + '" data-i="' + i + '" aria-pressed="' + (i === 0) + '">' + p.name + '</button>';
    }).join('');

    // punctele (create o singură dată, apoi doar mutate)
    var dots = CRON.map(function(e, i){
      var d = document.createElement('button');
      d.type = 'button'; d.className = 'hx-dot'; d.setAttribute('role', 'listitem');
      d.style.setProperty('--c', HX_CATS[e.cat].c);
      d.setAttribute('aria-label', e.date + ': ' + e.title);
      d.innerHTML = '<i></i><span>' + esc(e.short) + '</span>';
      d.addEventListener('click', function(){ select(i, true); });
      d.addEventListener('mouseenter', function(){ if (window.matchMedia('(hover: hover)').matches) select(i, false); });
      d.addEventListener('keydown', function(ev){
        var dir = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
        if (!dir) return;
        ev.preventDefault();
        var vis = visible(), k = vis.indexOf(i), n = vis[k + dir];
        if (n !== undefined) { select(n, true); dots[n].focus(); }
      });
      rowEl[e.cat].appendChild(d);
      return d;
    });
    // punctele mici, pe toată perioada
    document.getElementById('hx-over-dots').innerHTML = CRON.map(function(e){
      return '<i data-cat="' + e.cat + '" style="left:' + ((e.y - A0) / (B0 - A0) * 100).toFixed(2) + '%;--c:' + HX_CATS[e.cat].c + '"></i>';
    }).join('');
    document.getElementById('hx-over-ticks').innerHTML = [375, 400, 425, 450, 475].map(function(y){
      return '<span style="left:' + ((y - A0) / (B0 - A0) * 100).toFixed(2) + '%">' + y + '</span>';
    }).join('');

    function visible(){
      return CRON.map(function(e, i){ return i; }).filter(function(i){ var e = CRON[i]; return on[e.cat] && e.y >= a && e.y <= b; });
    }

    // fiecare eveniment stă pe banda lui, la anul lui; numele apare doar unde încape,
    // celelalte se citesc la trecerea mouse-ului sau în fișa de dedesubt
    function layout(){
      var w = stage.clientWidth || 800, span = b - a, compact = w < 420;
      var step = span > 70 ? 10 : span > 30 ? 5 : span > 14 ? 2 : 1, h = '';
      for (var y = Math.ceil(a / step) * step; y <= b; y += step) {
        h += '<span style="left:' + ((y - a) / span * 100).toFixed(3) + '%"><em>' + y + '</em></span>';
      }
      grid.innerHTML = h;
      var perCat = {};
      CATS.forEach(function(k){ perCat[k] = []; rowEl[k].classList.toggle('off', !on[k]); });
      CRON.forEach(function(e, i){
        var d = dots[i], show = on[e.cat] && e.y >= a - 0.01 && e.y <= b + 0.01;
        var x = (e.y - a) / span;
        d.style.left = (Math.max(-0.05, Math.min(1.05, x)) * 100).toFixed(3) + '%';
        d.classList.toggle('off', !show);
        d.tabIndex = show ? 0 : -1;
        d.setAttribute('aria-hidden', show ? 'false' : 'true');
        if (show) perCat[e.cat].push({ i: i, px: x * w, need: 16 + e.short.length * 7.4 });
      });
      // pe fiecare bandă: o etichetă apare doar dacă nu atinge nici eticheta dinainte, nici punctul următor
      CATS.forEach(function(k){
        var list = perCat[k].sort(function(p, q){ return p.px - q.px; }), lastEnd = -1e9;
        list.forEach(function(it, n){
          var d = dots[it.i], next = list[n + 1], prev = list[n - 1];
          var flip = it.px + it.need > w;
          var st = flip ? it.px - it.need : it.px - 8, en = flip ? it.px + 8 : it.px + it.need;
          var clearNext = flip || !next || next.px - 10 > en;
          var clearPrev = !flip || !prev || prev.px + 10 < st;
          var fits = !compact && st > lastEnd + 6 && clearNext && clearPrev;
          d.classList.toggle('nolab', !fits);
          d.classList.toggle('flip', flip);
          lastEnd = fits ? en : Math.max(lastEnd, it.px + 8);
        });
      });
      win.style.left = ((a - A0) / (B0 - A0) * 100).toFixed(3) + '%';
      win.style.width = ((b - a) / (B0 - A0) * 100).toFixed(3) + '%';
      win.setAttribute('aria-valuenow', Math.round(a));
      win.setAttribute('aria-valuetext', Math.round(a) + '–' + Math.round(b));
      var n = visible().length;
      rangeEl.textContent = Math.round(a) + '–' + Math.round(b) + ' · ' + (n === 1 ? 'un eveniment' : n + ' evenimente');
      if (cur >= 0 && dots[cur].classList.contains('off')) { var v = visible(); select(v.length ? v[0] : -1, false); }
    }

    function select(i, sticky){
      cur = i;
      dots.forEach(function(d, k){ d.classList.toggle('cur', k === i); d.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      if (i < 0) { card.innerHTML = '<p class="hx-empty">Niciun eveniment în intervalul și categoriile alese.</p>'; return; }
      var e = CRON[i], k = HX_CATS[e.cat], src = '';
      if (e.img) { var node = document.querySelector(e.img); if (node) src = node.getAttribute('src'); }
      var vis = visible(), pos = vis.indexOf(i);
      card.style.setProperty('--c', k.c);
      card.innerHTML = (src ? '<figure class="hx-img"><img src="' + src + '" alt=""></figure>' : '') +
        '<div class="hx-body"><p class="hx-meta"><b>' + esc(e.date) + '</b><span class="hx-cat"><i></i>' + k.name + '</span></p>' +
        '<h4>' + esc(e.title) + '</h4><p>' + esc(e.desc) + '</p>' +
        '<div class="hx-nav"><button type="button" class="hx-step" data-d="-1"' + (pos <= 0 ? ' disabled' : '') + ' aria-label="Evenimentul anterior"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
        '<span>' + (pos + 1) + ' / ' + vis.length + '</span>' +
        '<button type="button" class="hx-step" data-d="1"' + (pos >= vis.length - 1 ? ' disabled' : '') + ' aria-label="Evenimentul următor"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div></div>';
      card.classList.toggle('noimg', !src);
      Array.prototype.forEach.call(card.querySelectorAll('.hx-step'), function(btn){
        btn.addEventListener('click', function(){ var v = visible(), p = v.indexOf(cur), n = v[p + +btn.getAttribute('data-d')]; if (n !== undefined) select(n, true); });
      });
    }

    function setRange(na, nb, keepPeriod){
      var span = Math.max(MIN, Math.min(B0 - A0, nb - na));
      na = Math.max(A0, Math.min(B0 - span, na));
      a = na; b = na + span;
      if (!keepPeriod) Array.prototype.forEach.call(document.querySelectorAll('.hx-per'), function(p){ p.classList.remove('on'); p.setAttribute('aria-pressed', 'false'); });
      layout();
    }

    root.addEventListener('click', function(ev){
      var chip = ev.target.closest('.hx-lname');
      if (chip) {
        var c = chip.getAttribute('data-cat');
        on[c] = !on[c];
        chip.setAttribute('aria-pressed', on[c] ? 'true' : 'false');
        Array.prototype.forEach.call(document.querySelectorAll('#hx-over-dots i[data-cat="' + c + '"]'), function(d){ d.classList.toggle('off', !on[c]); });
        layout();
        return;
      }
      var per = ev.target.closest('.hx-per');
      if (per) {
        var p = HX_PERIODS[+per.getAttribute('data-i')];
        Array.prototype.forEach.call(document.querySelectorAll('.hx-per'), function(x){ x.classList.toggle('on', x === per); x.setAttribute('aria-pressed', x === per ? 'true' : 'false'); });
        setRange(p.a, p.b, true);
        var v = visible(); if (v.length) select(v[0], false);
      }
    });

    // fereastra de jos: trage corpul ca s-o muți, marginile ca s-o lărgești
    var drag = null;
    function yearAt(clientX){ var r = over.getBoundingClientRect(); return A0 + (clientX - r.left) / r.width * (B0 - A0); }
    over.addEventListener('pointerdown', function(ev){
      var h = ev.target.getAttribute && ev.target.getAttribute('data-h');
      var y = yearAt(ev.clientX);
      if (!h && !win.contains(ev.target)) { var s = b - a; setRange(y - s / 2, y + s / 2); }
      drag = { h: h, y0: y, a0: a, b0: b };
      try { over.setPointerCapture(ev.pointerId); } catch (err) {}
      over.classList.add('drag');
      ev.preventDefault();
    });
    over.addEventListener('pointermove', function(ev){
      if (!drag) return;
      var d = yearAt(ev.clientX) - drag.y0;
      if (drag.h === 'l') setRange(Math.min(drag.a0 + d, drag.b0 - MIN), drag.b0);
      else if (drag.h === 'r') setRange(drag.a0, Math.max(drag.b0 + d, drag.a0 + MIN));
      else setRange(drag.a0 + d, drag.b0 + d);
    });
    function end(){ drag = null; over.classList.remove('drag'); }
    over.addEventListener('pointerup', end);
    over.addEventListener('pointercancel', end);
    win.addEventListener('keydown', function(ev){
      var d = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      ev.preventDefault();
      var st = Math.max(1, Math.round((b - a) / 10));
      if (ev.shiftKey) setRange(a - d * st, b + d * st); else setRange(a + d * st, b + d * st);
    });

    var rz;
    function relayout(){ clearTimeout(rz); rz = setTimeout(layout, 100); }
    window.addEventListener('hashchange', relayout);
    var lastW = 0;
    if ('ResizeObserver' in window) new ResizeObserver(function(){ if (stage.clientWidth !== lastW) { lastW = stage.clientWidth; relayout(); } }).observe(stage);
    else window.addEventListener('resize', relayout);
    layout();
    select(0, false);
  }

