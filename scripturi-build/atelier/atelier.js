(function(){
  var root = document.getElementById('mod-atelier');
  if (!root || !document.getElementById('md-tl')) return;

  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function shuffle(a){ a = a.slice(); for (var k = a.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var t = a[k]; a[k] = a[j]; a[j] = t; } return a; }
  function fmt(n){ return n.toLocaleString('ro-RO'); }
  // „15 ani”, dar „20 de ani”, „929 de ani”
  function ani(n){ var r = n % 100; return n === 1 ? 'un an' : fmt(n) + (r >= 1 && r <= 19 ? ' ani' : ' de ani'); }

  // ---------------- sursele de pe masă ----------------
  // kind: 'obj' = obiect din epocă, 'txt' = izvor scris, 'img' = imagine făcută mai târziu
  var ITEMS = [
    { id: 'solid', hint: 'Pe monedă e numele unui împărat roman: THEODOSIUS.', kind: 'obj', sel: '#img-solidus', year: 430, label: '408–450', name: 'Solid de aur al lui Teodosie al II-lea',
      clue: 'Monedă bătută în timpul vieții lui Attila: cu astfel de monede s-a plătit tributul. Un obiect din epocă.' },
    { id: 'craniu', hint: 'E un os adevărat, găsit într-un mormânt: o descoperire arheologică, nu un desen.', kind: 'obj', sel: '#img-craniu', year: 450, label: 'sec. V', name: 'Craniu deformat artificial',
      clue: 'Os real, dintr-un cimitir din vremea stăpânirii hunice. Arată un obicei al epocii, nu și originea omului.' },
    { id: 'ziduri', hint: 'Pietrele și cărămizile romane se văd și azi la Istanbul.', kind: 'obj', sel: '#img-ziduri', year: 447, label: '413 / 447', name: 'Zidurile Theodosiene',
      clue: 'Ridicate în 413 și refăcute în 447, când Attila amenința Constantinopolul. Monument din epocă, fotografiat azi.' },
    { id: 'ammianus', hint: 'Ammianus a fost ofițer roman, contemporan cu sosirea hunilor.', kind: 'txt', ms: '#img-ms-ammianus', msNote: 'Pagina: Res gestae 31.2, despre huni, într-o copie din secolul al IX-lea (Codex Fuldensis, Biblioteca Apostolică Vaticană, Vat. lat. 1873) · domeniu public, Wikimedia Commons.', year: 390, ev: 375, label: 'c. 390', name: 'Ammianus Marcellinus', work: 'Res Gestae, cartea 31',
      about: 'Descrie sosirea hunilor, în 375.',
      clue: 'Scrie la vreo 15 ani după eveniment, dar nu i-a văzut niciodată pe huni: preia povești și tipare vechi despre „barbari”.' },
    { id: 'priscus', hint: 'Priscus a fost chiar în solia la curtea lui Attila, în 449.', kind: 'txt', qt: 'Când Vigilas s-a întors la curte, oamenii lui Attila l-au prins și i-au găsit în bagaje aurul adus pentru Edeco.', qtSrc: 'Priscus, relatarea soliei din 449', year: 475, ev: 449, label: 'după 472', name: 'Priscus din Panium', work: 'Istoria (fragmente)',
      about: 'Povestește solia la curtea lui Attila, din 449.',
      clue: 'Martor ocular: a fost în solie. Cartea lui s-a pierdut; o cunoaștem doar din fragmente copiate de alții.' },
    { id: 'iordanes', hint: 'Iordanes scrie la Constantinopol, în vremea împăratului Iustinian.', kind: 'txt', qt: 'Acolo puteai vedea gotul luptând cu sulița, gepidul dezlănțuit cu sabia, suevul pe jos, hunul cu arcul.', qtSrc: 'Iordanes, Getica 261', year: 551, ev: 453, label: '551', name: 'Iordanes', work: 'Getica',
      about: 'Povestește moartea lui Attila, din 453.',
      clue: 'Scrie la un secol după, dar rezumă cartea lui Priscus: un izvor târziu care păstrează unul timpuriu.' },
    { id: 'codex', hint: 'Scrisul de mână pe pergament e al unui copist medieval, nu al autorului.', kind: 'copy', ms: '#img-ms-getica', strip: true, msNote: 'Pe imagine: începutul Geticii într-o altă copie, din secolul al IX-lea (Biblioteca Apostolică Vaticană, Pal. lat. 920, f. 49r) · domeniu public, Wikimedia Commons. Manuscrisul de la Heidelberg nu mai există: a ars în 1880.', year: 780, ev: 551, label: 'sec. VIII', name: 'Getica, manuscrisul de la Heidelberg', work: 'copie medievală a cărții lui Iordanes',
      about: 'Iordanes și-a scris cartea în 551. Noi o citim din copii făcute de mână, mult mai târziu.',
      after: 'după scrierea cărții', q: 'Cartea e din 551. Când a fost făcută copia aceasta, cea mai veche cunoscută?', hq: 'în ce secol a fost copiată cartea?',
      clue: 'Cea mai veche copie cunoscută a Geticii, păstrată la Heidelberg, era din secolul al VIII-lea. A ars în 1880, în incendiul din casa istoricului Theodor Mommsen, care o împrumutase pentru ediția sa. Textul e din 551, dar orice izvor antic ajunge la noi prin copii: fiecare copist putea greși sau schimba ceva.' },
    { id: 'catal', hint: 'Uită-te la armuri și la scuturile cu blazoane: sunt cavaleri medievali.', kind: 'img', sel: '#img-catalaunice', year: 1330, label: 'c. 1330', name: 'Bătălia de la Câmpiile Catalaunice',
      clue: 'Miniatură dintr-o cronică flamandă: hunii apar drept cavaleri medievali, la aproape 900 de ani de bătălie.' },
    { id: 'aquileia', hint: 'Coifurile și armurile pictate sunt cele din secolul pictorului, nu din al lui Attila.', kind: 'img', sel: '#img-aquileia', year: 1360, label: 'c. 1360', name: 'Attila asediază Aquileia',
      clue: 'Cronica pictată de la Viena: pictorul îi îmbracă pe huni în armurile secolului său.' },
    { id: 'delacroix', hint: 'Culorile aprinse și mișcarea violentă sunt ale romantismului francez.', kind: 'img', sel: '#img-delacroix', year: 1842, label: '1838–1847', name: 'Attila și hoardele sale, de Delacroix',
      clue: 'Imaginea romantică a „biciului lui Dumnezeu”, pictată cu aproape 1.400 de ani mai târziu.' },
    { id: 'neuville', hint: 'E o gravură tipărită, ca ilustrațiile din cărțile de istorie ale secolului al XIX-lea.', kind: 'img', sel: '#img-neuville', year: 1869, label: '1869', name: 'Hunii la Châlons, de Neuville',
      clue: 'Gravură dintr-o istorie a Franței: arcașii călare, așa cum și-i imagina secolul al XIX-lea.' },
    { id: 'geiger', hint: 'Stilul academic, cu trupuri și cai ca de muzeu, e al secolului al XIX-lea.', kind: 'img', sel: '#img-geiger', year: 1873, label: 'c. 1873', name: 'Hunii în luptă cu alanii, de Geiger',
      clue: 'O scenă imaginată la peste 1.400 de ani după evenimente.' },
    { id: 'moartea', hint: 'Pictură în ulei, cu lumină de teatru: stilul secolului al XIX-lea.', kind: 'img', sel: '#img-moartea', year: 1884, label: '1884', name: 'Moartea lui Attila, de Paczka',
      clue: 'Iordanes povestește moartea din noaptea nunții; pictura e imaginea unei scene pe care pictorul n-a văzut-o.' }
  ];
  var KIND = {
    obj: { stamp: 'Obiect din epocă', many: 'Obiecte din epocă', c: '#8fbd82' },
    txt: { stamp: 'Text antic', many: 'Texte antice', c: '#e5c158' },
    img: { stamp: 'Imagine târzie', many: 'Imagini târzii', c: '#e0626c' },
    copy: { stamp: 'Copie târzie', many: 'Copii târzii', c: '#c79bd9' }
  };
  // izvoarele scrise și copiile lor arată la fel pe masă: o carte
  function isPaper(it){ return it.kind === 'txt' || it.kind === 'copy'; }
  var MAXP = 3;

  // ---------------- axa timpului ----------------
  // Punctajul se calculează pe scara de până acum (secolele IV–VI întinse, restul comprimat).
  // Zoomul pe epoci schimbă doar desenul axei, nu și distanța față de anul corect.
  var Y0 = 350, YB = 600, Y1 = 1950, FB = 0.42;
  function f(y){ y = Math.max(Y0, Math.min(Y1, y)); return y <= YB ? (y - Y0) / (YB - Y0) * FB : FB + (y - YB) / (Y1 - YB) * (1 - FB); }
  function snap(y){ return y < YB ? Math.round(y / 5) * 5 : Math.round(y / 10) * 10; }

  // epocile mari: la început axa le arată doar pe ele; una deschisă se mărește și primește gradațiile
  var ERAS = [
    { name: 'Epoca hunilor', short: 'Hunii', a: 350, b: 470 },
    { name: 'Antichitatea târzie', short: 'Antich. târzie', a: 470, b: 600 },
    { name: 'Evul Mediu timpuriu', short: 'Ev. Mediu timp.', a: 600, b: 1000 },
    { name: 'Evul Mediu', short: 'Evul Mediu', a: 1000, b: 1500 },
    { name: 'Epoca modernă', short: 'Ep. modernă', a: 1500, b: 1950 }
  ];
  var LAST = ERAS.length - 1;
  function grad(e){ return e.b <= YB ? 25 : 50; }
  var zoom = -1, kEra = 0, vert = false, zt = 0;
  var mqV = window.matchMedia('(max-width: 767px)'), mqC = window.matchMedia('(pointer: coarse)'), mqR = window.matchMedia('(prefers-reduced-motion: reduce)');
  function weights(){
    return ERAS.map(function(e, k){
      if (zoom < 0) return vert ? 1 : [1.25, 1, 1, 1, 1.1][k];
      return k === zoom ? (vert ? 9.5 : 8) : (vert ? 1 : 0.55);
    });
  }
  function sum(a){ return a.reduce(function(s, x){ return s + x; }, 0); }
  function eraOf(y){ for (var k = 0; k < LAST; k++) if (y < ERAS[k].b) return k; return LAST; }
  // anul → poziția pe axa desenată (0…1)
  function view(y){
    y = Math.max(Y0, Math.min(Y1, y));
    var w = weights(), k = eraOf(y), acc = 0, e = ERAS[k];
    for (var j = 0; j < k; j++) acc += w[j];
    return (acc + (y - e.a) / (e.b - e.a) * w[k]) / sum(w);
  }
  // poziția pe axa desenată → epoca și anul
  function eraAt(v){
    var w = weights(), x = Math.max(0, Math.min(1, v)) * sum(w), acc = 0;
    for (var k = 0; k < LAST; k++) { acc += w[k]; if (x <= acc) return k; }
    return LAST;
  }
  function yAt(v){
    var w = weights(), x = Math.max(0, Math.min(1, v)) * sum(w), k = eraAt(v), acc = 0, e = ERAS[k];
    for (var j = 0; j < k; j++) acc += w[j];
    return e.a + Math.max(0, Math.min(1, (x - acc) / w[k])) * (e.b - e.a);
  }
  function inEra(y){ var e = ERAS[zoom < 0 ? eraOf(y) : zoom]; return Math.max(e.a, Math.min(e.b, y)); }
  function pv(v){ return v.toFixed(5); }
  function posStyle(y, y2){ var a = view(y); return '--p:' + pv(a) + ';' + (y2 !== undefined ? '--w:' + pv(view(y2) - a) + ';' : ''); }
  function posAttr(y, y2){ return ' data-y="' + y + '"' + (y2 !== undefined ? ' data-y2="' + y2 + '"' : ''); }
  function reposition(){
    Array.prototype.forEach.call(tl.querySelectorAll('[data-y]'), function(el){
      var a = view(+el.getAttribute('data-y'));
      el.style.setProperty('--p', pv(a));
      if (el.hasAttribute('data-y2')) el.style.setProperty('--w', pv(view(+el.getAttribute('data-y2')) - a));
    });
  }

  // margini rupte: un poligon cu marginile ușor neregulate, același pentru aceeași sursă
  function hash(s){ var h = 2166136261; for (var k = 0; k < s.length; k++) h = Math.imul(h ^ s.charCodeAt(k), 16777619); return h >>> 0; }
  function rng(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function torn(r, nx, ny, ax, ay){
    var p = [], k;
    for (k = 0; k <= nx; k++) p.push([k / nx * 100, r() * ay]);
    for (k = 1; k < ny; k++) p.push([100 - r() * ax, k / ny * 100]);
    for (k = nx; k >= 0; k--) p.push([k / nx * 100, 100 - r() * ay]);
    for (k = ny - 1; k > 0; k--) p.push([r() * ax, k / ny * 100]);
    return 'polygon(' + p.map(function(q){ return q[0].toFixed(2) + '% ' + q[1].toFixed(2) + '%'; }).join(',') + ')';
  }
  var tornCache = {};
  function tornOf(id){ return tornCache[id] || (tornCache[id] = torn(rng(hash(id) + 11), 12, 8, 2.4, 3.6)); }

  var tl = $('md-tl'), pins = $('md-pins'), cursor = $('md-cursor'), tray = $('md-tray'), insp = $('md-insp');
  var items = [], sel = null, placed = {}, score = 0, curY = 453, drag = null, hintUsed = {}, adjustOn = false, order = [], fx = {}, dwell = null;
  function gained(it, p){ return Math.max(0, p.pts + (p.cls === it.kind ? 1 : 0) - (p.hint ? 1 : 0)); }

  function buildAxis(){
    $('md-eras').innerHTML = ERAS.map(function(e, k){
      return '<div class="md-era e' + k + '" data-k="' + k + '"' + posAttr(e.a, e.b) + ' style="' + posStyle(e.a, e.b) + '"><b>' + e.name + '</b><small>' + e.a + '–' + e.b + '</small><i>' + e.short + '</i></div>';
    }).join('');
    var h = '';
    ERAS.forEach(function(e, k){
      var g = grad(e), list = [e.a];
      for (var y = Math.ceil((e.a + 1) / g) * g; y < e.b; y += g) if (y - e.a >= 10 && e.b - y >= 10) list.push(y);
      list.push(e.b);
      list.forEach(function(y){ h += '<span class="md-tick' + (y === e.a || y === e.b ? ' edge' : '') + '" data-era="' + k + '"' + posAttr(y) + ' style="' + posStyle(y) + '"><em>' + y + '</em></span>'; });
      h += '<span class="md-scl" data-era="' + k + '">o gradație = ' + g + ' de ani</span>';
    });
    h += '<span class="md-tick att" data-era="0"' + posAttr(453) + ' style="' + posStyle(453) + '"><em>453 · Attila</em></span>';
    $('md-ticks').innerHTML = h;
  }
  function sizeTl(){ tl.style.height = vert ? (zoom < 0 ? 5 * 64 : 44 * (9.5 + LAST)) + 'px' : ''; }
  function setOrient(){
    vert = mqV.matches;
    tl.classList.toggle('vert', vert);
    $('md-ribbon').style.clipPath = vert ? torn(rng(7), 3, 60, 3.2, 0.2) : torn(rng(7), 90, 3, 0.15, 7);
    sizeTl(); reposition(); renderPins();
  }

  function collect(){
    items = ITEMS.map(function(it){
      if (isPaper(it)) { var ms = it.ms && document.querySelector(it.ms); return Object.assign(ms && ms.getAttribute('src') ? { msrc: ms.getAttribute('src') } : {}, it); }
      var node = document.querySelector(it.sel);
      return node && node.getAttribute('src') ? Object.assign({ src: node.getAttribute('src') }, it) : null;
    }).filter(Boolean);
  }
  function byId(id){ for (var k = 0; k < items.length; k++) if (items[k].id === id) return items[k]; return null; }

  // un codex desenat, pentru izvoarele scrise
  var BOOK = '<svg class="md-book" viewBox="0 0 64 48" aria-hidden="true"><path d="M32 10C24 4 12 4 4 7v35c8-3 20-3 28 3 8-6 20-6 28-3V7c-8-3-20-3-28 3z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M32 10v35" stroke="currentColor" stroke-width="2.2"/><path d="M10 16c5-1.5 11-1.5 16 0M10 23c5-1.5 11-1.5 16 0M10 30c5-1.5 11-1.5 16 0M38 16c5-1.5 11-1.5 16 0M38 23c5-1.5 11-1.5 16 0M38 30c5-1.5 11-1.5 16 0" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.6"/></svg>';

  function cardFace(it){
    if (it.qt) return '<span class="md-paper qt" style="clip-path:' + tornOf(it.id) + '"><q>' + esc(it.qt) + '</q><span class="md-ms-band"><small>Izvor scris · ' + esc(it.name) + '</small><i>' + esc(it.work) + '</i></span></span>';
    return isPaper(it)
      ? (it.msrc ? '<span class="md-paper ms' + (it.strip ? ' strip' : '') + '" style="clip-path:' + tornOf(it.id) + ';background-image:url(' + it.msrc + ')"><span class="md-ms-band"><small>Izvor scris · ' + esc(it.name) + '</small><i>' + esc(it.work) + '</i></span></span>'
        : '<span class="md-paper" style="clip-path:' + tornOf(it.id) + '">' + BOOK + '<b>' + esc(it.name) + '</b><i>' + esc(it.work) + '</i></span>')
      : '<img src="' + it.src + '" alt="" draggable="false">';
  }

  function renderTray(){
    tray.innerHTML = items.map(function(it){
      var p = placed[it.id] && placed[it.id].cls ? placed[it.id] : null, k = KIND[it.kind], r = rng(hash(it.id));
      var lay = '--r:' + (r() * 8 - 4).toFixed(2) + 'deg;--dx:' + (r() * 8 - 4).toFixed(1) + 'px;--dy:' + (r() * 6 - 3).toFixed(1) + 'px';
      return '<button type="button" role="listitem" style="' + lay + '" class="md-card' + (isPaper(it) ? ' txt' : '') + (p ? ' done' : '') + (sel === it.id ? ' sel' : '') + '" data-id="' + it.id + '" aria-pressed="' + (sel === it.id) + '" aria-label="' + esc(p ? it.name + ', așezată' : (isPaper(it) ? it.name + ', ' + it.work + ', izvor scris' : 'Imagine fără titlu, încă neașezată')) + '">' +
        cardFace(it) + (p ? '<span class="md-stamp" style="--c:' + k.c + '">' + k.stamp + '</span>' : '') + '</button>';
    }).join('');
  }

  function inspectEmpty(){
    insp.innerHTML = '<div class="md-insp-empty"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="26" cy="26" r="16" fill="none" stroke="currentColor" stroke-width="3"/><path d="M38 38l16 16" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>' +
      '<p>Alege o sursă de pe masă ca s-o vezi de aproape.</p><button type="button" class="md-link" id="md-how-b">Cum se joacă?</button></div>';
    $('md-how-b').addEventListener('click', function(){ openHelp(false); });
  }

  function inspect(it){
    var p = placed[it.id], k = KIND[it.kind];
    var media = it.qt
      ? '<div class="md-insp-paper qt"><blockquote class="md-ink">' + ('„' + esc(it.qt) + '”').split(' ').map(function(w, k){ return '<span style="--i:' + k + '">' + w + '</span>'; }).join(' ') + '</blockquote><small>' + esc(it.qtSrc) + ' · traducere adaptată</small><b>' + esc(it.name) + '</b><i>' + esc(it.work) + '</i><p>' + esc(it.about) + '</p></div>'
      : isPaper(it)
      ? (it.msrc ? '<div class="md-insp-paper ms"><div class="md-insp-page' + (it.strip ? ' strip' : '') + '"><img src="' + it.msrc + '" alt="' + esc(it.msNote) + '"></div><b>' + esc(it.name) + '</b><i>' + esc(it.work) + '</i><p>' + esc(it.about) + '</p><small>' + esc(it.msNote) + '</small></div>'
        : '<div class="md-insp-paper">' + BOOK + '<b>' + esc(it.name) + '</b><i>' + esc(it.work) + '</i><p>' + esc(it.about) + '</p></div>')
      : '<div class="md-zoom" id="md-zoom"><img src="' + it.src + '" alt="' + esc(p ? it.name : 'Sursa selectată, încă fără titlu') + '" draggable="false"><span class="md-lens" id="md-lens" hidden></span>' +
        '<button type="button" class="md-zbtn" id="md-zbtn" aria-pressed="false"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="6.5" cy="6.5" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 10l4 4M6.5 4.5v4M4.5 6.5h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><span>Mărește</span></button><span class="md-ztip">Lupa: treci cu mouse-ul peste imagine</span></div>';
    var body;
    if (!p) {
      body = '<p class="md-q">' + (it.q || (isPaper(it) ? 'Evenimentul e din ' + it.ev + '. Când a fost scrisă cartea?' : 'Când a fost făcută?')) + '</p>' +
        '<p class="md-how">' + (vert ? 'Atinge epoca potrivită pe axa de mai jos, apoi anul.' : 'Atinge epoca potrivită pe axă, apoi anul. Sau trage sursa până acolo.') + '<span class="md-kbd"> Cu tastatura: săgețile aleg epoca, Enter o deschide, apoi săgețile mută anul și Enter așază sursa.</span></p>' +
        (vert ? '<button type="button" class="md-btn ghost md-to-axis" id="md-to-axis">La axă ↓</button>' : '') +
        (it.hint ? (hintUsed[it.id] ? '<p class="md-hintx"><b>Indiciu:</b> ' + esc(it.hint) + '</p>' : '<button type="button" class="md-hintb" id="md-hintb">Vreau un indiciu (−1 punct)</button>') : '');
    } else if (!p.cls) {
      body = '<p class="md-q">Ai așezat-o în ' + p.guess + '. Ce fel de sursă e?</p>' +
        '<div class="md-cls" role="group" aria-label="Tipul sursei">' +
          '<button type="button" data-k="obj" style="--c:' + KIND.obj.c + '"><b>Obiect din epocă</b><span>lucru făcut în vremea hunilor: monedă, os, zid</span></button>' +
          '<button type="button" data-k="txt" style="--c:' + KIND.txt.c + '"><b>Text antic</b><span>carte scrisă în Antichitate (sec. IV–VI)</span></button>' +
          '<button type="button" data-k="img" style="--c:' + KIND.img.c + '"><b>Imagine târzie</b><span>pictură sau gravură făcută mult după Attila</span></button>' +
          '<button type="button" data-k="copy" style="--c:' + KIND.copy.c + '"><b>Copie târzie a unui text</b><span>text antic, copiat de mână în Evul Mediu</span></button>' +
        '</div><p class="md-how">Un punct în plus dacă alegi corect. Abia apoi afli anul real.</p>';
    } else {
      var off = p.guess - it.year, offTxt = Math.abs(off) <= 10 ? 'aproape exact' : (off > 0 ? 'cu ' + ani(Math.abs(off)) + ' prea târziu' : 'cu ' + ani(Math.abs(off)) + ' prea devreme');
      var gapTxt = it.kind === 'img' ? ' La ' + ani(Math.round((it.year - 453) / 10) * 10) + ' după Attila.' : isPaper(it) ? ' La ' + ani(it.year - it.ev) + ' ' + (it.after || 'după eveniment') + '.' : '';
      body = '<h3 class="md-name">' + esc(it.name) + ' <span>' + esc(it.label) + '</span></h3>' +
        '<p class="md-verdict" style="--c:' + k.c + '"><b>' + k.stamp + '</b>' + (p.cls === it.kind ? ' · tip ghicit +1' : ' · tu ai spus: ' + KIND[p.cls].stamp.toLowerCase()) + ' · ai ales ' + p.guess + ', ' + offTxt + (p.hint ? ' · indiciu −1' : '') + ' · <b>+' + gained(it, p) + '</b></p>' +
        '<p class="md-clue">' + esc(it.clue) + esc(gapTxt) + '</p>';
      var next = nextFree(it.id);
      if (next) body += '<button class="md-btn" type="button" id="md-next">Următoarea sursă</button>';
    }
    insp.innerHTML = media + '<div class="md-insp-body">' + body + '</div>';
    if (it.kind !== 'txt') lens();
    var zb = $('md-zbtn'); if (zb) zb.addEventListener('click', function(){ var z = $('md-zoom'), on = z.classList.toggle('zoomed'); zb.setAttribute('aria-pressed', on ? 'true' : 'false'); zb.querySelector('span').textContent = on ? 'Micșorează' : 'Mărește'; });
    var hb = $('md-hintb'); if (hb) hb.addEventListener('click', function(){ hintUsed[it.id] = true; inspect(it); });
    var nb = $('md-next'); if (nb) nb.addEventListener('click', function(){ select(nextFree(it.id)); if (vert) insp.scrollIntoView({ behavior: mqR.matches ? 'auto' : 'smooth', block: 'start' }); });
    var ta = $('md-to-axis'); if (ta) ta.addEventListener('click', function(){ root.querySelector('.md-top').scrollIntoView({ behavior: mqR.matches ? 'auto' : 'smooth', block: 'start' }); });
    Array.prototype.forEach.call(insp.querySelectorAll('.md-cls button'), function(b){
      b.addEventListener('click', function(){ classify(it.id, b.getAttribute('data-k')); });
    });
    var first = insp.querySelector('.md-cls button'); if (first) first.focus({ preventScroll: true });
  }

  function nextFree(from){
    var ix = 0; for (var k = 0; k < items.length; k++) if (items[k].id === from) ix = k;
    for (var j = 1; j <= items.length; j++) { var it = items[(ix + j) % items.length]; if (!placed[it.id]) return it.id; }
    return null;
  }

  // lupa: mărește de 2,6 ori zona de sub cursor
  function lens(){
    var box = $('md-zoom'), L = $('md-lens'); if (!box || !L) return;
    var img = box.querySelector('img'), Z = 2.6;
    function move(e){
      if (e.pointerType === 'touch') return;
      var r = img.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) { L.hidden = true; return; }
      L.hidden = false;
      L.style.left = x + 'px'; L.style.top = y + 'px';
      L.style.backgroundImage = 'url("' + img.src + '")';
      L.style.backgroundSize = (r.width * Z) + 'px ' + (r.height * Z) + 'px';
      L.style.backgroundPosition = (-(x * Z - 70)) + 'px ' + (-(y * Z - 70)) + 'px';
    }
    box.addEventListener('pointermove', move);
    box.addEventListener('pointerleave', function(){ L.hidden = true; });
  }

  function armedNow(){ return !!(sel && !placed[sel]); }
  function select(id){
    sel = id;
    var it = id && byId(id);
    renderTray();
    Array.prototype.forEach.call(pins.querySelectorAll('.md-pin'), function(p){ p.classList.toggle('sel', p.getAttribute('data-id') === id); });
    var armed = !!(it && !placed[id]);
    tl.classList.toggle('armed', armed);
    tl.tabIndex = armed ? 0 : -1;
    tl.setAttribute('aria-disabled', armed ? 'false' : 'true');
    if (it) inspect(it); else inspectEmpty();
    var nDone = items.filter(function(x){ return placed[x.id] && placed[x.id].cls; }).length;
    $('md-hint').textContent = armed ? (isPaper(it) ? it.name + ': ' + (it.hq || 'în ce an a fost scrisă cartea?') : 'Unde o așezi pe axă?') : it && !placed[id].cls ? 'Așezată în ' + placed[id].guess + '. Acum spune ce fel de sursă e.' : nDone ? 'Bine. Alege următoarea sursă de pe masă (' + nDone + ' din ' + items.length + ' așezate).' : 'Alege o sursă de pe masă, apoi așaz-o pe axă, în anul potrivit.';
    if (!armed) setAdjust(false);
    note();
  }

  // ---------------- zoomul pe epoci ----------------
  function note(){
    var armed = armedNow(), e = ERAS[zoom];
    $('md-tl-note').textContent = zoom < 0
      ? (armed ? 'Atinge epoca în care crezi că a fost făcută sursa.' : 'Atinge o epocă ca s-o vezi de aproape.')
      : (armed ? 'Acum alege anul: ' + e.name + ', ' + e.a + '–' + e.b + ' (o gradație = ' + grad(e) + ' de ani).' : e.name + ', ' + e.a + '–' + e.b + '.');
    tl.setAttribute('aria-valuemin', zoom < 0 ? Y0 : e.a);
    tl.setAttribute('aria-valuemax', zoom < 0 ? Y1 : e.b);
    if (zoom < 0) { var k = ERAS[kEra]; tl.setAttribute('aria-valuetext', k.name + ', ' + k.a + '–' + k.b + '. Săgețile schimbă epoca, Enter o deschide.'); }
  }
  function markEra(){ Array.prototype.forEach.call(tl.querySelectorAll('.md-era'), function(el, j){ el.classList.toggle('kf', zoom < 0 && j === kEra && document.activeElement === tl); }); note(); }
  function openEra(k){
    if (k === zoom) return;
    zoom = k; if (k >= 0) kEra = k;
    tl.classList.toggle('zoomed', k >= 0);
    tl.setAttribute('data-zoom', k);
    tl.classList.add('zooming'); clearTimeout(zt);
    zt = setTimeout(function(){ tl.classList.remove('zooming'); renderPins(); }, mqR.matches ? 0 : 480);
    sizeTl(); reposition();
    $('md-back').hidden = k < 0;
    Array.prototype.forEach.call(tl.querySelectorAll('.md-era'), function(el, j){ el.classList.toggle('open', j === k); });
    if (k >= 0) {
      var e = ERAS[k];
      if (curY < e.a || curY > e.b) curY = snap((e.a + e.b) / 2);
      if (adjustOn || document.activeElement === tl) showCursor(curY); else cursor.hidden = true;
    } else { cursor.hidden = true; setAdjust(false); }
    markEra();
  }
  $('md-back').addEventListener('click', function(){ openEra(-1); if (armedNow()) tl.focus({ preventScroll: true }); });

  // ---------------- așezarea pe axă ----------------
  function points(guess, truth){
    var d = Math.abs(f(guess) - f(truth));
    return d <= 0.03 ? 3 : d <= 0.08 ? 2 : d <= 0.16 ? 1 : 0;
  }
  function place(id, guess){
    var it = byId(id); if (!it || placed[id]) return;
    guess = snap(guess);
    var pts = points(guess, it.year);
    placed[id] = { guess: guess, pts: pts, cls: null, hint: !!hintUsed[id] };
    order.push(id);
    fx[id] = pts >= 2 ? 'snap' : pts === 1 ? 'settle' : 'shake';
    cursor.hidden = true; setAdjust(false);
    select(id);
    renderPins(); updateScore();
    // pe telefon, întrebarea despre tipul sursei e deasupra axei
    if (vert) insp.scrollIntoView({ behavior: mqR.matches ? 'auto' : 'smooth', block: 'start' });
  }
  function classify(id, k){
    var it = byId(id), pl = placed[id]; if (!it || !pl || pl.cls) return;
    pl.cls = k;
    var g = gained(it, pl); score += g;
    renderPins(id);
    updateScore(g);
    if (g >= 3 || g <= 1) { tl.classList.remove('md-ok', 'md-bad'); void tl.offsetWidth; tl.classList.add(g >= 3 ? 'md-ok' : 'md-bad'); }
    select(id);
    var nb = $('md-next'); if (nb) nb.focus({ preventScroll: true });
    if (items.every(function(x){ return placed[x.id] && placed[x.id].cls; })) setTimeout(finale, 900);
  }

  function faceOf(it){ return isPaper(it) ? BOOK : '<img src="' + it.src + '" alt="">'; }
  function renderPins(fresh){
    var len = (vert ? tl.clientHeight : tl.clientWidth) || 800, size = vert ? 36 : (len < 500 ? 30 : 42), lanes = [];
    var list = items.filter(function(it){ return placed[it.id] && placed[it.id].cls; }).sort(function(a, b){ return a.year - b.year; });
    // grupurile de cel puțin trei pini aproape unul de altul devin un singur cerc „×N”, care se desface la mouse sau la atingere
    var clu = {}, runs = [], cur = [];
    list.forEach(function(it, k){ if (k && (view(it.year) - view(list[k - 1].year)) * len >= size + 4) { runs.push(cur); cur = []; } cur.push(it); });
    if (cur.length) runs.push(cur);
    runs.forEach(function(r){ if (r.length >= 3 && !r.some(function(it){ return it.id === fresh; })) r.forEach(function(it){ clu[it.id] = r; }); });
    var cluHtml = runs.filter(function(r){ return clu[r[0].id] === r; }).map(function(r){
      var mid = Math.round(r.reduce(function(a, it){ return a + it.year; }, 0) / r.length);
      return '<div class="md-clu"' + posAttr(mid) + ' style="' + posStyle(mid) + '"><button type="button" class="md-clu-b" aria-expanded="false" aria-label="' + r.length + ' surse apropiate: ' + esc(r.map(function(it){ return it.name; }).join(', ')) + '">' + faceOf(r[0]) + '<b>×' + r.length + '</b></button>' +
        '<div class="md-clu-pop">' + r.map(function(it){ var k = KIND[it.kind]; return '<button type="button" class="md-pin' + (isPaper(it) ? ' txt' : '') + (sel === it.id ? ' sel' : '') + '" data-id="' + it.id + '" style="--c:' + k.c + '" aria-label="' + esc(it.name + ', ' + it.label) + '" title="' + esc(it.name + ' · ' + it.label) + '">' + faceOf(it) + '<span class="md-pin-lab">' + esc(it.label) + '</span></button>'; }).join('') + '</div></div>';
    }).join('');
    var html = list.map(function(it){
      var p = placed[it.id], x = view(it.year) * len, lane = 0, inClu = !!clu[it.id];
      if (!inClu) { while (lanes[lane] !== undefined && x - lanes[lane] < size + 4) lane++; lanes[lane] = x; }
      var a = Math.min(p.guess, it.year), b = Math.max(p.guess, it.year), k = KIND[it.kind];
      var col = p.pts >= 2 ? '#8fbd82' : p.pts === 1 ? '#e0b84a' : '#e0626c';
      var spanPx = (view(b) - view(a)) * len, isNew = it.id === fresh;
      var ev = isPaper(it) ? '<span class="md-arc"' + posAttr(it.ev, it.year) + ' style="' + posStyle(it.ev, it.year) + '"></span>' : '';
      var dist = isNew && spanPx > 40 ? '<span class="md-dist" style="--c:' + col + '">' + ani(b - a) + '</span>' : '';
      return '<div class="md-pin-g' + (isNew ? ' fresh' : '') + '" style="--lane:' + lane + '">' +
        (spanPx > 2 ? '<span class="md-miss"' + posAttr(a, b) + ' style="' + posStyle(a, b) + '--c:' + col + '">' + dist + '</span><span class="md-guess"' + posAttr(p.guess) + ' style="' + posStyle(p.guess) + '--c:' + col + '"></span>' : '') + ev +
        (inClu ? '' : '<button type="button" class="md-pin' + (isPaper(it) ? ' txt' : '') + (sel === it.id ? ' sel' : '') + '" data-id="' + it.id + '"' + (isNew ? ' data-to="' + it.year + '" style="' + posStyle(p.guess) : posAttr(it.year) + ' style="' + posStyle(it.year)) + '--c:' + k.c + '" aria-label="' + esc(it.name + ', ' + it.label) + '" title="' + esc(it.name + ' · ' + it.label) + '">' + faceOf(it) + '<span class="md-pin-lab">' + esc(it.label) + '</span></button>') + '</div>';
    }).join('');
    // sursa așezată, dar încă neclasificată: stă pe axă în anul ales (fără să arate anul real)
    var pend = items.filter(function(it){ return placed[it.id] && !placed[it.id].cls; }).map(function(it){
      var p = placed[it.id], e = fx[it.id] || ''; delete fx[it.id];
      return '<div class="md-pin-g" style="--lane:0"><button type="button" class="md-pin md-pend' + (isPaper(it) ? ' txt' : '') + (sel === it.id ? ' sel' : '') + (e ? ' ' + e : '') + '" data-id="' + it.id + '"' + posAttr(p.guess) + ' style="' + posStyle(p.guess) + '--c:#f2d474" aria-label="' + esc((isPaper(it) ? it.name : 'Sursa aleasă') + ', așezată în ' + p.guess + ', încă neclasificată') + '">' + faceOf(it) + '</button></div>';
    }).join('');
    pins.innerHTML = html + cluHtml + pend;
    // pinul nou pornește din anul ales și alunecă până la anul real
    var mv = pins.querySelector('.md-pin[data-to]');
    if (mv) requestAnimationFrame(function(){ requestAnimationFrame(function(){ mv.setAttribute('data-y', mv.getAttribute('data-to')); mv.style.setProperty('--p', pv(view(+mv.getAttribute('data-to')))); }); });
    var maxLane = 0; Array.prototype.forEach.call(pins.querySelectorAll('.md-pin-g'), function(g){ maxLane = Math.max(maxLane, +g.style.getPropertyValue('--lane') || 0); });
    tl.style.setProperty('--lanes', maxLane + 1);
  }

  // 13 puncte care se umplu, în ordinea în care așezi sursele, și scorul alături
  function updateScore(g){
    var n = items.filter(function(x){ return placed[x.id] && placed[x.id].cls; }).length, el = $('md-score'), dots = $('md-dots');
    el.textContent = score + (score === 1 ? ' punct' : ' puncte');
    var html = '';
    for (var k = 0; k < items.length; k++) {
      var id = order[k], p = id && placed[id], it = id && byId(id);
      html += '<i class="' + (!p ? '' : !p.cls ? 'pend' : 'on g' + Math.min(3, gained(it, p))) + (p && p.cls && id === order[order.length - 1] && g !== undefined ? ' pop' : '') + '"></i>';
    }
    dots.innerHTML = html;
    dots.setAttribute('aria-label', n + ' din ' + items.length + ' surse așezate');
    if (g !== undefined) {
      el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
      var fl = document.createElement('span'); fl.className = 'md-plus' + (g ? '' : ' zero'); fl.textContent = '+' + g; el.appendChild(fl);
      setTimeout(function(){ fl.remove(); }, 1600);
    }
  }

  // ---------------- cursorul de pe axă ----------------
  function frac(e){ var r = tl.getBoundingClientRect(); return vert ? (e.clientY - r.top) / r.height : (e.clientX - r.left) / r.width; }
  function showCursor(y){
    curY = snap(Math.max(Y0, Math.min(Y1, zoom >= 0 ? inEra(y) : y)));
    if (zoom >= 0) curY = inEra(curY);
    cursor.hidden = false;
    var it = sel && byId(sel), sh = cursor.querySelector('i');
    if (!sh) { sh = document.createElement('i'); sh.setAttribute('aria-hidden', 'true'); cursor.appendChild(sh); }
    if (sh.getAttribute('data-id') !== (sel || '')) { sh.setAttribute('data-id', sel || ''); sh.innerHTML = it ? faceOf(it) : ''; sh.hidden = !it; }
    cursor.setAttribute('data-y', curY);
    cursor.style.setProperty('--p', pv(view(curY)));
    cursor.querySelector('b').textContent = curY;
    if (adjustOn) $('md-adj-y').textContent = curY;
    tl.setAttribute('aria-valuenow', curY);
    tl.setAttribute('aria-valuetext', 'anul ' + curY + ', ' + ERAS[eraOf(curY)].name);
  }
  tl.addEventListener('pointermove', function(e){
    if (drag || !armedNow() || e.pointerType === 'touch') return;
    var v = frac(e);
    if (zoom >= 0 && eraAt(v) === zoom) showCursor(yAt(v)); else if (!adjustOn) cursor.hidden = true;
  });
  tl.addEventListener('pointerleave', function(){ if (!drag && !adjustOn && document.activeElement !== tl) cursor.hidden = true; });
  tl.addEventListener('click', function(e){
    var cb = e.target.closest('.md-clu-b');
    if (cb) { var open = cb.parentNode.classList.toggle('open'); cb.setAttribute('aria-expanded', open ? 'true' : 'false'); return; }
    var pin = e.target.closest('.md-pin');
    if (pin) { select(pin.getAttribute('data-id')); return; }
    var v = frac(e), k = eraAt(v);
    if (k !== zoom) { openEra(k); if (armedNow() && (vert || mqC.matches)) { showCursor(curY); setAdjust(true); } return; }
    if (armedNow()) {
      if (vert || mqC.matches) { showCursor(yAt(v)); setAdjust(true); }
      else place(sel, inEra(yAt(v)));
    }
  });
  var adj = $('md-adjust');
  function setAdjust(on){ adjustOn = on; if (adj) adj.hidden = !on; if (on) $('md-adj-y').textContent = curY; }
  if (adj) adj.addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b || !armedNow()) return;
    if (b.id === 'md-adj-ok') { setAdjust(false); place(sel, curY); return; }
    var ny = curY + +b.getAttribute('data-d'), k = eraOf(Math.max(Y0, Math.min(Y1, ny)));
    if (zoom >= 0 && k !== zoom) openEra(k);
    showCursor(ny);
  });
  tl.addEventListener('keydown', function(e){
    var fw = e.key === 'ArrowRight' || e.key === 'ArrowDown', bw = e.key === 'ArrowLeft' || e.key === 'ArrowUp', go = e.key === 'Enter' || e.key === ' ';
    if (e.key === 'Escape' && zoom >= 0) { e.preventDefault(); openEra(-1); return; }
    if (!armedNow()) return;
    if (zoom < 0) {
      if (fw || bw) { e.preventDefault(); kEra = Math.max(0, Math.min(LAST, kEra + (fw ? 1 : -1))); markEra(); }
      else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); kEra = e.key === 'Home' ? 0 : LAST; markEra(); }
      else if (go) { e.preventDefault(); openEra(kEra); showCursor(curY); }
      return;
    }
    var en = ERAS[zoom], step = e.shiftKey ? 50 : (curY < YB ? 5 : 20);
    if (fw || bw) {
      e.preventDefault();
      var ny = curY + (fw ? step : -step);
      if (ny > en.b && zoom < LAST) { openEra(zoom + 1); ny = ERAS[zoom].a; }
      else if (ny < en.a && zoom > 0) { openEra(zoom - 1); ny = ERAS[zoom].b; }
      showCursor(ny);
    }
    else if (e.key === 'Home') { e.preventDefault(); showCursor(en.a); }
    else if (e.key === 'End') { e.preventDefault(); showCursor(en.b); }
    else if (e.key === 'PageDown' && zoom < LAST) { e.preventDefault(); openEra(zoom + 1); showCursor(ERAS[zoom].a); }
    else if (e.key === 'PageUp' && zoom > 0) { e.preventDefault(); openEra(zoom - 1); showCursor(ERAS[zoom].a); }
    else if (go) { e.preventDefault(); place(sel, curY); }
  });
  tl.addEventListener('focus', function(){ if (zoom < 0) { kEra = eraOf(curY); markEra(); } else if (armedNow()) showCursor(curY); });
  tl.addEventListener('blur', function(){ markEra(); if (!drag && !adjustOn) cursor.hidden = true; });

  // ---------------- alegerea și tragerea cărților ----------------
  tray.addEventListener('click', function(e){
    var c = e.target.closest('.md-card'); if (!c) return;
    if (drag && drag.moved) return;
    select(c.getAttribute('data-id'));
    if (c.classList.contains('done')) return;
    // de la tastatură: după Enter pe carte, focusul trece pe axă
    if (e.detail === 0) { tl.focus({ preventScroll: true }); tl.scrollIntoView({ block: 'nearest', behavior: 'auto' }); return; }
    // pe ecrane înguste, dar cu axa orizontală, axa e deasupra mesei: urcăm la ea
    if (!vert && window.matchMedia('(max-width: 900px)').matches) {
      var top = tl.getBoundingClientRect().top + window.pageYOffset - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 0) - 60;
      window.scrollTo({ top: top, behavior: mqR.matches ? 'auto' : 'smooth' });
    }
  });
  tray.addEventListener('pointerdown', function(e){
    var c = e.target.closest('.md-card');
    if (!c || e.pointerType === 'touch' || e.button !== 0 || c.classList.contains('done')) return;
    drag = { id: c.getAttribute('data-id'), x: e.clientX, y: e.clientY, moved: false, ghost: null };
  });
  function clearDwell(){ if (dwell) { clearTimeout(dwell.t); var el = tl.querySelector('.md-era.dwell'); if (el) el.classList.remove('dwell'); dwell = null; } }
  function dwellOn(k){
    if (dwell && dwell.k === k) return;
    clearDwell();
    var el = tl.querySelector('.md-era[data-k="' + k + '"]'); if (el) el.classList.add('dwell');
    dwell = { k: k, t: setTimeout(function(){ clearDwell(); openEra(k); }, 380) };
  }
  function overTl(e){
    var r = tl.getBoundingClientRect();
    return vert ? e.clientX >= r.left - 30 && e.clientX <= r.right + 30 && e.clientY >= r.top && e.clientY <= r.bottom
      : e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top - 30 && e.clientY <= r.bottom + 30;
  }
  window.addEventListener('pointermove', function(e){
    if (!drag) return;
    if (!drag.moved) {
      if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return;
      drag.moved = true;
      if (sel !== drag.id) select(drag.id);
      var it = byId(drag.id), g = document.createElement('div');
      g.className = 'md-ghost' + (isPaper(it) ? ' txt' : '');
      g.innerHTML = cardFace(it);
      document.body.appendChild(g); drag.ghost = g;
      root.classList.add('md-dragging');
      var src = tray.querySelector('.md-card[data-id="' + drag.id + '"]'); if (src) src.classList.add('lifted');
    }
    drag.ghost.style.transform = 'translate(' + (e.clientX - 55) + 'px,' + (e.clientY - 42) + 'px) rotate(-2deg) scale(1.04)';
    var over = overTl(e);
    tl.classList.toggle('drop', over);
    if (!over) { cursor.hidden = true; clearDwell(); return; }
    var v = frac(e), k = eraAt(v);
    if (k === zoom) { clearDwell(); showCursor(yAt(v)); }
    else { cursor.hidden = true; dwellOn(k); }
  });
  window.addEventListener('pointerup', function(e){
    if (!drag) return;
    var d = drag;
    if (d.moved) {
      d.ghost.remove(); root.classList.remove('md-dragging');
      var over = tl.classList.contains('drop'); tl.classList.remove('drop');
      clearDwell();
      var lf = tray.querySelector('.md-card.lifted'); if (lf) lf.classList.remove('lifted');
      if (over) {
        var v = frac(e), k = eraAt(v);
        if (k === zoom) place(d.id, inEra(yAt(v)));
        else { openEra(k); $('md-hint').textContent = 'Epoca e deschisă: acum las-o în anul potrivit.'; }
      }
      setTimeout(function(){ drag = null; }, 0);
    } else drag = null;
  });

  // ---------------- „Cum se joacă”: fereastra și turul de la prima vizită ----------------
  var help = $('md-help'), hStep = 0, hTour = false, hRet = null, TOUR = 'ah-masa-tur';
  function seen(){ try { return !!localStorage.getItem(TOUR); } catch (e) { return true; } }
  function openHelp(tour){
    hRet = document.activeElement; hTour = !!tour; hStep = 0;
    help.classList.toggle('tour', hTour);
    help.hidden = false; stepHelp();
    $('md-help-next').focus({ preventScroll: true });
  }
  function closeHelp(){
    help.hidden = true;
    try { localStorage.setItem(TOUR, '1'); } catch (e) {}
    if (hRet && hRet.focus && document.contains(hRet)) hRet.focus({ preventScroll: true });
  }
  function stepHelp(){
    Array.prototype.forEach.call(help.querySelectorAll('.md-steps li'), function(li, k){ li.classList.toggle('on', !hTour || k === hStep); });
    Array.prototype.forEach.call(help.querySelectorAll('.md-modal-pips i'), function(p, k){ p.classList.toggle('on', k === hStep); });
    $('md-help-prev').style.visibility = hTour && hStep > 0 ? 'visible' : 'hidden';
    $('md-help-pips').style.visibility = hTour ? 'visible' : 'hidden';
    $('md-help-next').textContent = !hTour || hStep === 2 ? 'Am înțeles' : 'Mai departe';
  }
  $('md-help-b').addEventListener('click', function(){ openHelp(false); });
  $('md-help-x').addEventListener('click', closeHelp);
  $('md-help-next').addEventListener('click', function(){ if (hTour && hStep < 2) { hStep++; stepHelp(); } else closeHelp(); });
  $('md-help-prev').addEventListener('click', function(){ if (hStep > 0) { hStep--; stepHelp(); } });
  help.addEventListener('click', function(e){ if (e.target === help) closeHelp(); });
  help.addEventListener('keydown', function(e){
    if (e.key === 'Escape') { e.preventDefault(); closeHelp(); return; }
    if (e.key !== 'Tab') return;
    var fs = Array.prototype.filter.call(help.querySelectorAll('button'), function(b){ return b.offsetParent && getComputedStyle(b).visibility !== 'hidden'; });
    if (!fs.length) return;
    var a = fs[0], z = fs[fs.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  });
  if (!seen() && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(en){
      if (en.some(function(x){ return x.isIntersecting; }) && help.hidden && !seen()) { io.disconnect(); openHelp(true); }
    }, { threshold: 0.35 });
    io.observe(root.querySelector('.md-board'));
  }

  // ---------------- finalul ----------------
  function finale(){
    var late = items.filter(function(it){ return it.kind === 'img'; }).map(function(it){ return it.year; });
    var firstImg = Math.min.apply(null, late);
    var gap = $('md-gap');
    openEra(-1);
    gap.setAttribute('data-y', 453); gap.setAttribute('data-y2', firstImg); gap.setAttribute('style', posStyle(453, firstImg));
    gap.innerHTML = '<span><b>' + ani(firstImg - 453) + ' de tăcere</b><small>nicio imagine a hunilor</small></span>';
    gap.hidden = false;
    tl.classList.add('done');
    countUp(gap.querySelector('b'), firstImg - 453);
    var max = items.length * (MAXP + 1);
    var rank = score >= max * 0.8 ? 'Ochi de istoric' : score >= max * 0.6 ? 'Cercetător atent' : score >= max * 0.38 ? 'Ucenic de arhivă' : 'La început de drum';
    var objs = items.filter(function(it){ return it.kind === 'obj'; }).length, txts = items.filter(function(it){ return it.kind === 'txt' && it.year <= 600; }).length;
    sel = null; renderTray(); tl.classList.remove('armed'); tl.tabIndex = -1;
    insp.innerHTML = '<div class="md-end"><p class="md-big">' + score + ' <span>/ ' + max + '</span></p><p class="md-rank">' + rank + '</p>' +
      ladder(max, rank) +
      '<ul class="md-cats">' + ['obj', 'txt', 'copy', 'img'].map(function(k){ var all = items.filter(function(it){ return it.kind === k; }), ok = all.filter(function(it){ return placed[it.id].cls === k; }).length; return all.length ? '<li style="--c:' + KIND[k].c + '"><b>' + KIND[k].many + '</b><span>' + ok + ' din ' + all.length + ' recunoscute</span></li>' : ''; }).join('') + '</ul>' +
      '<p class="md-sum">Din ' + items.length + ' surse, doar ' + objs + ' obiecte și ' + txts + ' cărți sunt din Antichitate. Toate cele ' + late.length + ' imagini sunt făcute la peste ' + ani(Math.floor((firstImg - 453) / 100) * 100) + ' după Attila.' + (byId('codex') ? ' Iar copia Geticii arată o altă capcană: textul e din 551, dar îl citim dintr-un manuscris copiat de mână în secolul al VIII-lea.' : '') + '</p>' +
      '<ul><li>Obiectele (monede, oase, ziduri) au existat în vremea hunilor, dar nu spun singure cine le-a folosit.</li>' +
      '<li>Nu se cunoaște niciun portret al lui Attila făcut în timpul vieții lui.</li>' +
      '<li>O imagine veche nu e, prin asta, o sursă: întreabă „când și pentru cine a fost făcută?”.</li></ul>' +
      '<div class="md-end-btns"><button class="md-btn" type="button" id="md-ans" aria-pressed="false">Vezi răspunsurile pe axă</button><button class="md-btn" type="button" id="md-cert">Certificatul tău (imagine)</button><button class="md-btn ghost" type="button" id="md-share">Copiază rezultatul</button><button class="md-btn ghost" type="button" id="md-again">Așază din nou</button></div><p class="md-shared" id="md-shared" aria-live="polite"></p></div>';
    $('md-hint').textContent = 'Toate sursele sunt pe axă. Atinge o miniatură ca s-o revezi.';
    $('md-again').addEventListener('click', reset);
    $('md-ans').addEventListener('click', function(){ var on = tl.classList.toggle('answers'); this.setAttribute('aria-pressed', on ? 'true' : 'false'); this.textContent = on ? 'Ascunde răspunsurile' : 'Vezi răspunsurile pe axă'; });
    $('md-share').addEventListener('click', function(){
      var txt = 'Masa istoricului: ' + rank + ', ' + score + ' din ' + max + ' puncte. ' + location.href.split('#')[0] + '#mod-atelier', out = $('md-shared');
      function ok(){ out.textContent = 'Copiat: ' + txt; }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, function(){ out.textContent = txt; }); else out.textContent = txt;
    });
    var end = insp.querySelector('.md-end'); end.setAttribute('tabindex', '-1'); end.focus({ preventScroll: true });
    countUp(insp.querySelector('.md-big'), score);
    try { localStorage.setItem('ah-masa', rank); document.dispatchEvent(new CustomEvent('ah-progres')); } catch (e) {}
    $('md-cert').addEventListener('click', function(){ certificate(rank, score, max, this); });
  }

  // un număr dintr-un text urcă de la 0 la valoarea lui (fără mișcare pe ecran, doar cifre)
  function countUp(el, to){
    if (!el) return;
    var txt = el.innerHTML, t0 = 0, re = new RegExp(fmt(to).replace('.', '\\.'));
    function step(ts){
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / 1100);
      el.innerHTML = k < 1 ? txt.replace(re, fmt(Math.round(to * (1 - Math.pow(1 - k, 3))))) : txt;
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  // certificatul: desenat într-un canvas, ca imaginea să poată fi salvată sau trimisă
  function certificate(rank, sc, max, btn){
    var box = $('md-cert-box');
    if (!box) {
      box = document.createElement('div'); box.id = 'md-cert-box'; box.className = 'md-cert-box';
      box.innerHTML = '<label for="md-cert-name">Numele de pe certificat (nu pleacă nicăieri, rămâne în imagine)</label><div class="md-cert-row"><input id="md-cert-name" type="text" maxlength="40" autocomplete="name" placeholder="de exemplu, Ana Popescu"><button class="md-btn" type="button" id="md-cert-go">Fă imaginea</button></div><div id="md-cert-out"></div>';
      btn.parentNode.insertAdjacentElement('afterend', box);
      $('md-cert-go').addEventListener('click', function(){ draw($('md-cert-name').value.trim()); });
      $('md-cert-name').addEventListener('keydown', function(e){ if (e.key === 'Enter') draw(this.value.trim()); });
    }
    $('md-cert-name').focus();
    function draw(name){
      var W = 1400, H = 990, c = document.createElement('canvas'); c.width = W; c.height = H;
      var g = c.getContext('2d');
      var bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#f1e4c6'); bg.addColorStop(1, '#dcc59a');
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.strokeStyle = '#8a6a1c'; g.lineWidth = 6; g.strokeRect(36, 36, W - 72, H - 72);
      g.lineWidth = 1.5; g.strokeRect(54, 54, W - 108, H - 108);
      g.textAlign = 'center'; g.fillStyle = '#5a4214';
      g.font = '600 30px Cinzel, Georgia, serif'; g.fillText('ATELIERUL HUNILOR · MASA ISTORICULUI', W / 2, 150);
      g.fillStyle = '#2a1d0e'; g.font = '700 84px Cinzel, Georgia, serif'; g.fillText('Certificat de istoric', W / 2, 280);
      g.font = 'italic 34px "Cormorant Garamond", Georgia, serif'; g.fillStyle = '#5a4214';
      g.fillText(name ? 'se acordă lui' : 'se acordă celui care a așezat', W / 2, 370);
      g.fillStyle = '#2a1d0e'; g.font = (name ? '600 66px' : 'italic 44px') + ' "Cormorant Garamond", Georgia, serif';
      g.fillText(name || 'toate cele ' + items.length + ' surse pe axa timpului', W / 2, 460);
      g.strokeStyle = '#8a6a1c'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(W / 2 - 300, 492); g.lineTo(W / 2 + 300, 492); g.stroke();
      g.fillStyle = '#a0281f'; g.font = '700 60px Cinzel, Georgia, serif'; g.fillText(rank, W / 2, 600);
      g.fillStyle = '#2a1d0e'; g.font = '600 40px "Source Serif 4", Georgia, serif'; g.fillText(sc + ' din ' + max + ' puncte', W / 2, 670);
      g.font = '28px "Source Serif 4", Georgia, serif'; g.fillStyle = '#5a4214';
      g.fillText('A deosebit obiectele din epocă și textele antice', W / 2, 740);
      g.fillText('de copiile târzii și de imaginile făcute la secole după Attila.', W / 2, 780);
      // sigiliul de ceară
      var sx = W - 200, sy = H - 165, sg = g.createRadialGradient(sx - 18, sy - 22, 6, sx, sy, 92);
      sg.addColorStop(0, '#e2525c'); sg.addColorStop(0.6, '#a5232d'); sg.addColorStop(1, '#6b1018');
      g.fillStyle = sg; g.beginPath(); for (var k = 0; k <= 40; k++) { var a = k / 40 * Math.PI * 2, r = 86 + (k % 2 ? 6 : 0); g.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); } g.fill();
      g.strokeStyle = 'rgba(255, 220, 200, 0.5)'; g.lineWidth = 2; g.beginPath(); g.arc(sx, sy, 60, 0, 7); g.stroke();
      g.fillStyle = '#ffe6dc'; g.font = '700 30px Cinzel, Georgia, serif'; g.fillText('AH', sx, sy + 11);
      g.textAlign = 'left'; g.fillStyle = '#5a4214'; g.font = '24px "Source Serif 4", Georgia, serif';
      g.fillText(new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }), 120, H - 150);
      g.fillText(location.href.split('#')[0].replace(/^https?:\/\//, ''), 120, H - 112);
      var url = c.toDataURL('image/png');
      $('md-cert-out').innerHTML = '<img src="' + url + '" alt="Certificatul tău: ' + esc(rank) + ', ' + sc + ' din ' + max + ' puncte"><a class="md-btn" download="certificat-masa-istoricului.png" href="' + url + '">Salvează imaginea</a>';
    }
  }
  // scara rangurilor, cu poziția ta
  function ladder(max, rank){
    var R = [['La început de drum', 0], ['Ucenic de arhivă', Math.ceil(max * 0.38)], ['Cercetător atent', Math.ceil(max * 0.6)], ['Ochi de istoric', Math.ceil(max * 0.8)]];
    return '<div class="md-ladder" role="img" aria-label="' + esc('Rangurile: ' + R.map(function(r){ return r[0] + ' de la ' + r[1] + ' puncte'; }).join(', ') + '. Tu ai ' + score + ' puncte.') + '"><div class="md-lad-track"><i style="width:' + (score / max * 100).toFixed(1) + '%"></i><em style="left:' + (score / max * 100).toFixed(1) + '%">Tu · ' + score + '</em></div>' +
      '<ol>' + R.map(function(r){ return '<li class="' + (score >= r[1] ? 'on' : '') + (r[0] === rank ? ' me' : '') + '"><b>' + r[0] + '</b><span>' + (r[1] ? 'de la ' + r[1] : 'de la 0') + '</span></li>'; }).join('') + '</ol></div>';
  }
  function reset(){
    placed = {}; score = 0; sel = null; hintUsed = {}; order = []; fx = {}; tl.classList.remove('answers');
    $('md-gap').hidden = true; tl.classList.remove('done');
    items = shuffle(items);
    openEra(-1);
    renderPins(); updateScore(); select(null);
  }

  var rz;
  function relayout(){ clearTimeout(rz); rz = setTimeout(function(){ if (mqV.matches !== vert) setOrient(); else renderPins(); }, 120); }
  window.addEventListener('resize', relayout);
  window.addEventListener('hashchange', relayout);

  buildAxis();
  collect();
  items = shuffle(items);
  renderTray(); inspectEmpty(); updateScore();
  setOrient(); note();
})();
