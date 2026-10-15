  // Cronologia: o linie a timpului împărțită pe epoci; dedesubt, fila evenimentului ales,
  // ca o pagină de cronică. Se trage de-a lungul liniei sau se merge cu săgețile.
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
  // epocile liniei: fiecare primește o lățime după câte evenimente are, ca anii aglomerați
  // (cei ai lui Attila) să nu se calce unul pe altul; în interiorul epocii, scara e liniară
  // unde s-a petrecut fiecare eveniment (lat, lon, loc), în ordinea din CRON
  var HX_AT = [
    [46.0, 41.5, 'Între Marea Azov și Caucaz'], [47.4, 33.4, 'Regatul lui Ermanaric'], [44.1, 27.4, 'Dunărea, la Durostorum'],
    [41.68, 26.56, 'Adrianopol'], [41.9, 12.5, 'Roma, unde scrie Ammianus'], [39.6, 39.0, 'Armenia și Cappadocia'],
    [50.0, 8.3, 'Rinul, la Mogontiacum'], [43.8, 22.9, 'Castra Martis, în Moesia'], [41.9, 12.5, 'Roma'],
    [41.01, 28.98, 'Constantinopol'], [41.01, 28.98, 'Constantinopol'], [36.0, -5.4, 'Strâmtoarea Gibraltar'],
    [44.62, 21.19, 'Margus, pe Dunăre'], [36.85, 10.2, 'Cartagina'], [43.32, 21.9, 'Naissus (Niš)'],
    [47.0, 20.2, 'Câmpia Panonică'], [43.4, 24.6, 'Râul Utus (Vit)'], [41.01, 28.98, 'Constantinopol'],
    [47.0, 20.2, 'Curtea lui Attila'], [44.42, 12.2, 'Ravenna'], [48.95, 4.4, 'Câmpiile Catalaunice'],
    [45.77, 13.37, 'Aquileia'], [47.0, 20.2, 'Curtea lui Attila'], [46.6, 19.0, 'Nedao, în Pannonia (loc nesigur)'],
    [42.6, 26.0, 'Tracia'], [44.42, 12.2, 'Ravenna']
  ];
  // drumul hunilor, după izvoare (același cu cel din joc)
  var HX_HUNI = [[365, 47.0, 46.5], [370, 46.8, 44.2], [376, 47.2, 35.5], [395, 46.5, 28.5], [420, 47.0, 20.2], [440, 47.0, 20.2], [441.5, 43.4, 21.9], [443, 47.0, 20.2], [447, 43.0, 25.0], [448, 47.0, 20.2], [450.4, 48.6, 12.0], [451.5, 48.95, 4.4], [452, 45.9, 13.4], [453, 47.0, 20.2], [455, 47.0, 20.5], [470, 46.6, 31], [480, 46.6, 32]];
  function hxProj(lat, lon){
    var r = Math.PI / 180, p = lat * r, l = (lon - 10) * r, p0 = 52 * r;
    var k = Math.pow((1 + Math.sin(p) * Math.sin(p0) + Math.cos(p) * Math.cos(p0) * Math.cos(l)) * 0.5, -0.5);
    var x = 131.579 * (Math.cos(p) * Math.sin(l)) * k + 36.388;
    var y = 55.11 - 153.610 * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l)) * k;
    return [x / 100 * 690, y / 100 * 1351 * 690 / 1580];
  }
  var HX_ERAS = [
    { name: 'Sosirea hunilor', short: 'Sosirea', a: 365, b: 392 },
    { name: 'Valul spre Apus', short: 'Spre Apus', a: 392, b: 434 },
    { name: 'Epoca lui Attila', short: 'Attila', a: 434, b: 454 },
    { name: 'După Attila', short: 'După', a: 454, b: 480 }
  ];

  function initTimelineSlider(){
    var root = document.getElementById('hx');
    if (!root) return;
    var rib = document.getElementById('hx-rib'), marksEl = document.getElementById('hx-marks');
    var tip = document.getElementById('hx-tip'), folio = document.getElementById('hx-folio');
    var cur = -1, N = CRON.length;
    function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
    function eraOf(y){ for (var k = 0; k < HX_ERAS.length; k++) if (y < HX_ERAS[k].b) return k; return HX_ERAS.length - 1; }

    // lățimea fiecărei epoci: 2 + numărul de evenimente din ea (cel puțin 6, ca numele să încapă)
    var wsum = 0, edge = 0;
    HX_ERAS.forEach(function(er, k){ er.n = CRON.filter(function(e){ return eraOf(e.y) === k; }).length; er.w = Math.max(6, er.n + 2); wsum += er.w; });
    HX_ERAS.forEach(function(er){ er.x = edge; er.p = er.w / wsum * 100; edge += er.p; });
    function pos(y){ var er = HX_ERAS[eraOf(y)]; return er.x + (y - er.a) / (er.b - er.a) * er.p; }

    var eras = document.getElementById('hx-eras');
    eras.style.gridTemplateColumns = HX_ERAS.map(function(er){ return 'minmax(0, ' + er.w + 'fr)'; }).join(' ');
    eras.innerHTML = HX_ERAS.map(function(er, k){
      return '<button type="button" class="hx-era" data-k="' + k + '"><b><span class="l">' + er.name + '</span><span class="s">' + er.short + '</span></b><small>' + er.a + '–' + er.b + '</small></button>';
    }).join('');
    marksEl.innerHTML = HX_ERAS.slice(1).map(function(er){ return '<span class="hx-sep" style="left:' + er.x.toFixed(3) + '%"></span>'; }).join('') +
      CRON.map(function(e, i){ return '<i class="hx-mk" style="left:' + pos(e.y).toFixed(3) + '%;--c:' + HX_CATS[e.cat].c + '"></i>'; }).join('');
    var marks = marksEl.querySelectorAll('.hx-mk'), eraBtns = eras.querySelectorAll('.hx-era');
    document.getElementById('hx-legend').innerHTML = Object.keys(HX_CATS).map(function(k){
      return '<span style="--c:' + HX_CATS[k].c + '"><i></i>' + HX_CATS[k].name + '</span>';
    }).join('');
    rib.setAttribute('aria-valuemax', N);

    // evenimentul cel mai apropiat de un punct de pe linie
    function nearest(clientX){
      var r = rib.getBoundingClientRect(), p = (clientX - r.left) / r.width * 100, best = 0, bd = 1e9;
      CRON.forEach(function(e, i){ var d = Math.abs(pos(e.y) - p); if (d < bd) { bd = d; best = i; } });
      return best;
    }
    function bigYear(e){ return String(Math.floor(e.y)); }

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function step(n, d){
      if (!n) return '<span></span>';
      return '<button type="button" class="hx-step ' + (d < 0 ? 'prev' : 'next') + '" data-d="' + d + '">' +
        '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="' + (d < 0 ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5') + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '<span><small>' + (d < 0 ? 'Înainte' : 'Apoi') + ' · ' + esc(n.date) + '</small>' + esc(n.title) + '</span></button>';
    }
    // harta: punctele evenimentelor, drumul hunilor până în anul ales, inelul pe locul evenimentului
    var map = document.getElementById('hx-map');
    // o pagină fără harta de bază (modulul separat) afișează doar fila
    if (!document.getElementById('shared-img-0')) map.closest('.hx-main').classList.add('nomap');
    map.innerHTML = '<use href="#shared-img-0"/><rect x="20" y="300" width="600" height="290" fill="rgba(14, 13, 11, 0.3)"/>' +
      '<path class="hx-route" id="hx-route"/>' +
      CRON.map(function(e, i){ var q = hxProj(HX_AT[i][0], HX_AT[i][1]); return '<circle class="hx-pt" data-i="' + i + '" cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="5.5" style="--c:' + HX_CATS[e.cat].c + '"><title>' + esc(e.date + ': ' + e.title) + '</title></circle>'; }).join('') +
      '<g class="hx-hun" id="hx-hun"><circle r="6.5"/><text x="10" y="-9">HUNII</text></g>' +
      '<circle class="hx-ring" id="hx-ring" r="13"/><text class="hx-place" id="hx-place"></text>';
    var pts = map.querySelectorAll('.hx-pt'), ring = document.getElementById('hx-ring'), place = document.getElementById('hx-place');
    var route = document.getElementById('hx-route'), hun = document.getElementById('hx-hun');
    function hunsAt(y){
      var pts2 = [];
      for (var k = 0; k < HX_HUNI.length; k++) {
        var w = HX_HUNI[k];
        if (w[0] <= y) { pts2.push(hxProj(w[1], w[2])); continue; }
        var a = HX_HUNI[k - 1], f = (y - a[0]) / (w[0] - a[0]);
        pts2.push(hxProj(a[1] + (w[1] - a[1]) * f, a[2] + (w[2] - a[2]) * f));
        break;
      }
      return pts2;
    }
    function drawMap(i){
      var e = CRON[i], q = hxProj(HX_AT[i][0], HX_AT[i][1]), h = hunsAt(e.y), end = h[h.length - 1];
      route.setAttribute('d', 'M' + h.map(function(p){ return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L'));
      hun.setAttribute('transform', 'translate(' + end[0].toFixed(1) + ' ' + end[1].toFixed(1) + ')');
      hun.classList.toggle('near', Math.hypot(end[0] - q[0], end[1] - q[1]) < 40);
      Array.prototype.forEach.call(pts, function(c, j){ c.classList.toggle('future', CRON[j].y > e.y); c.setAttribute('r', j === i ? 7.5 : 5.5); });
      ring.setAttribute('cx', q[0].toFixed(1)); ring.setAttribute('cy', q[1].toFixed(1));
      if (!reduce) { ring.classList.remove('pulse'); void ring.getBoundingClientRect(); ring.classList.add('pulse'); }
      var right = q[0] > 430;
      place.textContent = HX_AT[i][2];
      place.setAttribute('x', (q[0] + (right ? -18 : 18)).toFixed(1)); place.setAttribute('y', (q[1] + 6).toFixed(1));
      place.setAttribute('text-anchor', right ? 'end' : 'start');
    }
    map.addEventListener('click', function(ev){ var c = ev.target.closest('.hx-pt'); if (c) select(+c.getAttribute('data-i')); });

    function select(i){
      if (i < 0 || i >= N || i === cur) return;
      var back = i < cur;
      cur = i;
      var e = CRON[i], k = HX_CATS[e.cat], src = '';
      Array.prototype.forEach.call(marks, function(m, j){ m.classList.toggle('cur', j === i); });
      Array.prototype.forEach.call(eraBtns, function(b, j){ b.classList.toggle('on', j === eraOf(e.y)); });
      rib.setAttribute('aria-valuenow', i + 1);
      rib.setAttribute('aria-valuetext', e.date + ': ' + e.title);
      if (e.img) { var node = document.querySelector(e.img); if (node) src = node.getAttribute('src'); }
      var big = bigYear(e);
      folio.style.setProperty('--c', k.c);
      folio.classList.toggle('noimg', !src);
      folio.innerHTML =
        '<div class="hx-yr"><span class="hx-big">' + big + '</span>' +
          '<span class="hx-date">' + (e.date !== big ? esc(e.date) : '&nbsp;') + '</span>' +
          '<span class="hx-cat"><i></i>' + k.name + '</span><span class="hx-count">' + (i + 1) + ' din ' + N + '</span></div>' +
        '<div class="hx-body"><h4>' + esc(e.title) + '</h4><p class="hx-where">' + esc(HX_AT[i][2]) + '</p><p>' + esc(e.desc) + '</p></div>' +
        (src ? '<figure class="hx-img"><img src="' + src + '" alt=""></figure>' : '') +
        '<nav class="hx-nav" aria-label="Evenimentele vecine">' + step(CRON[i - 1], -1) + step(CRON[i + 1], 1) + '</nav>';
      if (!reduce) { folio.classList.remove('in'); void folio.offsetWidth; folio.classList.add('in'); folio.classList.toggle('back', back); }
      drawMap(i);
    }

    folio.addEventListener('click', function(ev){
      var b = ev.target.closest('.hx-step');
      if (b) select(cur + +b.getAttribute('data-d'));
    });
    eras.addEventListener('click', function(ev){
      var b = ev.target.closest('.hx-era');
      if (!b) return;
      var k = +b.getAttribute('data-k');
      for (var i = 0; i < N; i++) if (eraOf(CRON[i].y) === k) { select(i); break; }
    });

    // trasul pe linie: fila se schimbă pe măsură ce treci peste evenimente
    var dragging = false;
    function showTip(i){
      var e = CRON[i], p = pos(e.y);
      tip.textContent = bigYear(e) + ' · ' + e.title;
      tip.style.left = p.toFixed(3) + '%';
      tip.classList.toggle('right', p > 75);
      tip.classList.toggle('left', p < 25);
      tip.classList.add('show');
    }
    rib.addEventListener('pointerdown', function(ev){
      dragging = true;
      try { rib.setPointerCapture(ev.pointerId); } catch (err) {}
      select(nearest(ev.clientX));
      showTip(cur);
      rib.classList.add('drag');
    });
    rib.addEventListener('pointermove', function(ev){
      var i = nearest(ev.clientX);
      if (dragging) select(i);
      if (dragging || ev.pointerType === 'mouse') showTip(i);
    });
    function up(ev){ dragging = false; rib.classList.remove('drag'); if (!ev || ev.pointerType !== 'mouse') tip.classList.remove('show'); }
    rib.addEventListener('pointerup', up);
    rib.addEventListener('pointercancel', up);
    rib.addEventListener('pointerleave', function(){ if (!dragging) tip.classList.remove('show'); });
    rib.addEventListener('keydown', function(ev){
      var n = null;
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') n = cur + 1;
      else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') n = cur - 1;
      else if (ev.key === 'Home') n = 0;
      else if (ev.key === 'End') n = N - 1;
      if (n === null) return;
      ev.preventDefault();
      select(Math.max(0, Math.min(N - 1, n)));
    });
    select(0);
  }
