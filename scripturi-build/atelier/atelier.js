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
    { id: 'solid', kind: 'obj', sel: '#img-solidus', year: 430, label: '408–450', name: 'Solid de aur al lui Teodosie al II-lea',
      clue: 'Monedă bătută în timpul vieții lui Attila: cu astfel de monede s-a plătit tributul. Un obiect din epocă.' },
    { id: 'craniu', kind: 'obj', sel: '#img-craniu', year: 450, label: 'sec. V', name: 'Craniu deformat artificial',
      clue: 'Os real, dintr-un cimitir din vremea stăpânirii hunice. Arată un obicei al epocii, nu și originea omului.' },
    { id: 'ziduri', kind: 'obj', sel: '#img-ziduri', year: 447, label: '413 / 447', name: 'Zidurile Theodosiene',
      clue: 'Ridicate în 413 și refăcute în 447, când Attila amenința Constantinopolul. Monument din epocă, fotografiat azi.' },
    { id: 'ammianus', kind: 'txt', year: 390, ev: 375, label: 'c. 390', name: 'Ammianus Marcellinus', work: 'Res Gestae, cartea 31',
      about: 'Descrie sosirea hunilor, în 375.',
      clue: 'Scrie la vreo 15 ani după eveniment, dar nu i-a văzut niciodată pe huni: preia povești și tipare vechi despre „barbari”.' },
    { id: 'priscus', kind: 'txt', year: 475, ev: 449, label: 'după 472', name: 'Priscus din Panium', work: 'Istoria (fragmente)',
      about: 'Povestește solia la curtea lui Attila, din 449.',
      clue: 'Martor ocular: a fost în solie. Cartea lui s-a pierdut; o cunoaștem doar din fragmente copiate de alții.' },
    { id: 'iordanes', kind: 'txt', year: 551, ev: 453, label: '551', name: 'Iordanes', work: 'Getica',
      about: 'Povestește moartea lui Attila, din 453.',
      clue: 'Scrie la un secol după, dar rezumă cartea lui Priscus: un izvor târziu care păstrează unul timpuriu.' },
    { id: 'codex', kind: 'copy', year: 780, ev: 551, label: 'sec. VIII', name: 'Getica, manuscrisul de la Heidelberg', work: 'copie medievală a cărții lui Iordanes',
      about: 'Iordanes și-a scris cartea în 551. Noi o citim din copii făcute de mână, mult mai târziu.',
      after: 'după scrierea cărții', q: 'Cartea e din 551. Când a fost făcută copia aceasta, cea mai veche cunoscută?', hq: 'în ce secol a fost copiată cartea?',
      clue: 'Cea mai veche copie cunoscută a Geticii, păstrată la Heidelberg, era din secolul al VIII-lea. A ars în 1880, în incendiul din casa istoricului Theodor Mommsen, care o împrumutase pentru ediția sa. Textul e din 551, dar orice izvor antic ajunge la noi prin copii: fiecare copist putea greși sau schimba ceva.' },
    { id: 'catal', kind: 'img', sel: '#img-catalaunice', year: 1330, label: 'c. 1330', name: 'Bătălia de la Câmpiile Catalaunice',
      clue: 'Miniatură dintr-o cronică flamandă: hunii apar drept cavaleri medievali, la aproape 900 de ani de bătălie.' },
    { id: 'aquileia', kind: 'img', sel: '#img-aquileia', year: 1360, label: 'c. 1360', name: 'Attila asediază Aquileia',
      clue: 'Cronica pictată de la Viena: pictorul îi îmbracă pe huni în armurile secolului său.' },
    { id: 'delacroix', kind: 'img', sel: '#img-delacroix', year: 1842, label: '1838–1847', name: 'Attila și hoardele sale, de Delacroix',
      clue: 'Imaginea romantică a „biciului lui Dumnezeu”, pictată cu aproape 1.400 de ani mai târziu.' },
    { id: 'neuville', kind: 'img', sel: '#img-neuville', year: 1869, label: '1869', name: 'Hunii la Châlons, de Neuville',
      clue: 'Gravură dintr-o istorie a Franței: arcașii călare, așa cum și-i imagina secolul al XIX-lea.' },
    { id: 'geiger', kind: 'img', sel: '#img-geiger', year: 1873, label: 'c. 1873', name: 'Hunii în luptă cu alanii, de Geiger',
      clue: 'O scenă imaginată la peste 1.400 de ani după evenimente.' },
    { id: 'moartea', kind: 'img', sel: '#img-moartea', year: 1884, label: '1884', name: 'Moartea lui Attila, de Paczka',
      clue: 'Iordanes povestește moartea din noaptea nunții; pictura e imaginea unei scene pe care pictorul n-a văzut-o.' }
  ];
  var KIND = {
    obj: { stamp: 'Din epocă', c: '#8fbd82' },
    txt: { stamp: 'Izvor scris', c: '#e5c158' },
    img: { stamp: 'Mult mai târziu', c: '#e0626c' },
    copy: { stamp: 'Copie târzie', c: '#c79bd9' }
  };
  // izvoarele scrise și copiile lor arată la fel pe masă: o carte
  function isPaper(it){ return it.kind === 'txt' || it.kind === 'copy'; }
  var MAXP = 3;

  // ---------------- axa timpului: secolele IV–VI întinse, restul comprimat ----------------
  var Y0 = 350, YB = 600, Y1 = 1950, FB = 0.42;
  function f(y){ y = Math.max(Y0, Math.min(Y1, y)); return y <= YB ? (y - Y0) / (YB - Y0) * FB : FB + (y - YB) / (Y1 - YB) * (1 - FB); }
  function yOf(fr){ fr = Math.max(0, Math.min(1, fr)); return fr <= FB ? Y0 + fr / FB * (YB - Y0) : YB + (fr - FB) / (1 - FB) * (Y1 - YB); }
  function snap(y){ return y < YB ? Math.round(y / 5) * 5 : Math.round(y / 10) * 10; }
  function pc(y){ return (f(y) * 100).toFixed(3) + '%'; }

  var tl = $('md-tl'), pins = $('md-pins'), cursor = $('md-cursor'), tray = $('md-tray'), insp = $('md-insp');
  var items = [], sel = null, placed = {}, score = 0, curY = 453, drag = null;

  function buildTicks(){
    var h = [375, 400, 500, 550, 600, 800, 1000, 1200, 1400, 1600, 1800].map(function(y){
      return '<span class="md-tick' + (y === 600 ? ' brk' : '') + ([375, 400, 500, 550, 800, 1200, 1600].indexOf(y) >= 0 ? ' minor' : '') + '" style="left:' + pc(y) + '"><em>' + y + '</em></span>';
    }).join('');
    h += '<span class="md-tick att" style="left:' + pc(453) + '"><em>453 · Attila</em></span>';
    $('md-ticks').innerHTML = h;
    var band = $('md-band');
    band.style.left = pc(370); band.style.width = 'calc(' + pc(469) + ' - ' + pc(370) + ')';
  }

  function collect(){
    items = ITEMS.map(function(it){
      if (isPaper(it)) return Object.assign({}, it);
      var node = document.querySelector(it.sel);
      return node && node.getAttribute('src') ? Object.assign({ src: node.getAttribute('src') }, it) : null;
    }).filter(Boolean);
  }
  function byId(id){ for (var k = 0; k < items.length; k++) if (items[k].id === id) return items[k]; return null; }

  // un codex desenat, pentru izvoarele scrise
  var BOOK = '<svg class="md-book" viewBox="0 0 64 48" aria-hidden="true"><path d="M32 10C24 4 12 4 4 7v35c8-3 20-3 28 3 8-6 20-6 28-3V7c-8-3-20-3-28 3z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M32 10v35" stroke="currentColor" stroke-width="2.2"/><path d="M10 16c5-1.5 11-1.5 16 0M10 23c5-1.5 11-1.5 16 0M10 30c5-1.5 11-1.5 16 0M38 16c5-1.5 11-1.5 16 0M38 23c5-1.5 11-1.5 16 0M38 30c5-1.5 11-1.5 16 0" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.6"/></svg>';

  function cardFace(it){
    return isPaper(it)
      ? '<span class="md-paper">' + BOOK + '<b>' + esc(it.name) + '</b><i>' + esc(it.work) + '</i></span>'
      : '<img src="' + it.src + '" alt="" draggable="false">';
  }

  function renderTray(){
    tray.innerHTML = items.map(function(it){
      var p = placed[it.id] && placed[it.id].cls ? placed[it.id] : null, k = KIND[it.kind];
      return '<button type="button" role="listitem" class="md-card' + (isPaper(it) ? ' txt' : '') + (p ? ' done' : '') + (sel === it.id ? ' sel' : '') + '" data-id="' + it.id + '" aria-pressed="' + (sel === it.id) + '" aria-label="' + esc(p ? it.name + ', așezată' : (isPaper(it) ? it.name + ', ' + it.work : 'Sursă fără titlu')) + '">' +
        cardFace(it) + (p ? '<span class="md-stamp" style="--c:' + k.c + '">' + k.stamp + '</span>' : '') + '</button>';
    }).join('');
  }

  function inspectEmpty(){
    insp.innerHTML = '<div class="md-insp-empty"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="26" cy="26" r="16" fill="none" stroke="currentColor" stroke-width="3"/><path d="M38 38l16 16" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>' +
      '<p>Alege o sursă de pe masă ca s-o privești de aproape. Pe imagini, lupa îți arată detaliile: hainele, armele, stilul.</p></div>';
  }

  function inspect(it){
    var p = placed[it.id], k = KIND[it.kind];
    var media = isPaper(it)
      ? '<div class="md-insp-paper">' + BOOK + '<b>' + esc(it.name) + '</b><i>' + esc(it.work) + '</i><p>' + esc(it.about) + '</p></div>'
      : '<div class="md-zoom" id="md-zoom"><img src="' + it.src + '" alt="' + esc(p ? it.name : 'Sursa selectată, încă fără titlu') + '" draggable="false"><span class="md-lens" id="md-lens" hidden></span></div>';
    var body;
    if (!p) {
      body = '<p class="md-q">' + (it.q || (isPaper(it) ? 'Evenimentul e din ' + it.ev + '. Când a fost scrisă cartea?' : 'Când a fost făcută?')) + '</p>' +
        '<p class="md-how">Trage sursa pe axă sau atinge axa în anul ales.<span class="md-kbd"> Cu tastatura: Tab până la axă, săgețile, apoi Enter.</span></p>';
    } else if (!p.cls) {
      body = '<p class="md-q">Ai așezat-o în ' + p.guess + '. Ce fel de sursă e?</p>' +
        '<div class="md-cls" role="group" aria-label="Tipul sursei">' +
          '<button type="button" data-k="obj" style="--c:' + KIND.obj.c + '"><b>Din epocă</b><span>obiect din vremea hunilor</span></button>' +
          '<button type="button" data-k="txt" style="--c:' + KIND.txt.c + '"><b>Izvor scris</b><span>text dintr-o carte veche</span></button>' +
          '<button type="button" data-k="img" style="--c:' + KIND.img.c + '"><b>Mult mai târziu</b><span>imagine făcută după Antichitate</span></button>' +
          '<button type="button" data-k="copy" style="--c:' + KIND.copy.c + '"><b>Copie târzie</b><span>un text vechi, copiat de mână mult mai târziu</span></button>' +
        '</div><p class="md-how">Un punct în plus dacă alegi corect. Abia apoi afli anul real.</p>';
    } else {
      var off = p.guess - it.year, offTxt = Math.abs(off) <= 10 ? 'aproape exact' : (off > 0 ? 'cu ' + ani(Math.abs(off)) + ' prea târziu' : 'cu ' + ani(Math.abs(off)) + ' prea devreme');
      var gapTxt = it.kind === 'img' ? ' La ' + ani(Math.round((it.year - 453) / 10) * 10) + ' după Attila.' : isPaper(it) ? ' La ' + ani(it.year - it.ev) + ' ' + (it.after || 'după eveniment') + '.' : '';
      body = '<h3 class="md-name">' + esc(it.name) + ' <span>' + esc(it.label) + '</span></h3>' +
        '<p class="md-verdict" style="--c:' + k.c + '"><b>' + k.stamp + '</b>' + (p.cls === it.kind ? ' · tip ghicit +1' : ' · tu ai spus: ' + KIND[p.cls].stamp.toLowerCase()) + ' · ai ales ' + p.guess + ', ' + offTxt + ' · <b>+' + (p.pts + (p.cls === it.kind ? 1 : 0)) + '</b></p>' +
        '<p class="md-clue">' + esc(it.clue) + esc(gapTxt) + '</p>';
      var next = nextFree(it.id);
      if (next) body += '<button class="md-btn" type="button" id="md-next">Următoarea sursă</button>';
    }
    insp.innerHTML = media + '<div class="md-insp-body">' + body + '</div>';
    if (it.kind !== 'txt') lens();
    var nb = $('md-next'); if (nb) nb.addEventListener('click', function(){ select(nextFree(it.id)); });
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
    $('md-hint').textContent = armed ? (isPaper(it) ? it.name + ': ' + (it.hq || 'în ce an a fost scrisă cartea?') : 'Unde o așezi pe axă?') : 'Alege o sursă de pe masă, apoi trage-o (sau atinge axa) în anul potrivit.';
  }

  // ---------------- așezarea pe axă ----------------
  function points(guess, truth){
    var d = Math.abs(f(guess) - f(truth));
    return d <= 0.03 ? 3 : d <= 0.08 ? 2 : d <= 0.16 ? 1 : 0;
  }
  function place(id, guess){
    var it = byId(id); if (!it || placed[id]) return;
    guess = snap(guess);
    var pts = points(guess, it.year);
    placed[id] = { guess: guess, pts: pts, cls: null };
    cursor.hidden = true;
    select(id);
  }
  function classify(id, k){
    var it = byId(id), pl = placed[id]; if (!it || !pl || pl.cls) return;
    pl.cls = k;
    score += pl.pts + (k === it.kind ? 1 : 0);
    renderPins(id);
    updateScore();
    select(id);
    var nb = $('md-next'); if (nb) nb.focus({ preventScroll: true });
    if (items.every(function(x){ return placed[x.id] && placed[x.id].cls; })) setTimeout(finale, 900);
  }

  function renderPins(fresh){
    var w = tl.clientWidth || 800, size = w < 500 ? 30 : 40, lanes = [];
    var list = items.filter(function(it){ return placed[it.id] && placed[it.id].cls; }).sort(function(a, b){ return a.year - b.year; });
    pins.innerHTML = list.map(function(it){
      var p = placed[it.id], x = f(it.year) * w, lane = 0;
      while (lanes[lane] !== undefined && x - lanes[lane] < size + 4) lane++;
      lanes[lane] = x;
      var gf = f(p.guess), tf = f(it.year), a = Math.min(gf, tf), b = Math.max(gf, tf), k = KIND[it.kind];
      var col = p.pts >= 2 ? '#8fbd82' : p.pts === 1 ? '#e0b84a' : '#e0626c';
      var face = isPaper(it) ? BOOK : '<img src="' + it.src + '" alt="">';
      function P(v){ return (v * 100).toFixed(3) + '%'; }
      var ev = isPaper(it) ? '<span class="md-arc" style="left:' + P(f(it.ev)) + ';width:' + P(tf - f(it.ev)) + '"></span>' : '';
      return '<div class="md-pin-g' + (it.id === fresh ? ' fresh' : '') + '" style="--lane:' + lane + '">' +
        ((b - a) * w > 2 ? '<span class="md-miss" style="left:' + P(a) + ';width:' + P(b - a) + ';--c:' + col + '"></span><span class="md-guess" style="left:' + P(gf) + ';--c:' + col + '"></span>' : '') + ev +
        '<button type="button" class="md-pin' + (isPaper(it) ? ' txt' : '') + (sel === it.id ? ' sel' : '') + '" data-id="' + it.id + '" style="left:' + P(tf) + ';--c:' + k.c + '" aria-label="' + esc(it.name + ', ' + it.label) + '" title="' + esc(it.name + ' · ' + it.label) + '">' + face + '</button></div>';
    }).join('');
    var maxLane = 0; Array.prototype.forEach.call(pins.children, function(g){ maxLane = Math.max(maxLane, +g.style.getPropertyValue('--lane')); });
    tl.style.setProperty('--lanes', maxLane + 1);
  }

  function updateScore(){
    var n = items.filter(function(x){ return placed[x.id] && placed[x.id].cls; }).length;
    $('md-score').textContent = n + ' / ' + items.length + ' așezate · ' + score + (score === 1 ? ' punct' : ' puncte');
  }

  // ---------------- cursorul de pe axă ----------------
  function frac(clientX){ var r = tl.getBoundingClientRect(); return (clientX - r.left) / r.width; }
  function showCursor(y){
    curY = snap(Math.max(Y0, Math.min(Y1, y)));
    cursor.hidden = false;
    cursor.style.left = pc(curY);
    cursor.querySelector('b').textContent = curY;
    tl.setAttribute('aria-valuenow', curY);
    tl.setAttribute('aria-valuetext', 'anul ' + curY);
  }
  tl.addEventListener('pointermove', function(e){ if (drag || (sel && !placed[sel])) showCursor(yOf(frac(e.clientX))); });
  tl.addEventListener('pointerleave', function(){ if (!drag) cursor.hidden = true; });
  tl.addEventListener('click', function(e){
    var pin = e.target.closest('.md-pin');
    if (pin) { select(pin.getAttribute('data-id')); return; }
    if (sel && !placed[sel]) place(sel, yOf(frac(e.clientX)));
  });
  tl.addEventListener('keydown', function(e){
    if (!sel || placed[sel]) return;
    var step = e.shiftKey ? 50 : (curY < YB ? 5 : 20);
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); showCursor(curY + step); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); showCursor(curY - step); }
    else if (e.key === 'Home') { e.preventDefault(); showCursor(Y0); }
    else if (e.key === 'End') { e.preventDefault(); showCursor(Y1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); place(sel, curY); }
  });
  tl.addEventListener('focus', function(){ if (sel && !placed[sel]) showCursor(curY); });
  tl.addEventListener('blur', function(){ if (!drag) cursor.hidden = true; });

  // ---------------- tragerea cu mouse-ul ----------------
  tray.addEventListener('click', function(e){
    var c = e.target.closest('.md-card'); if (!c) return;
    if (drag && drag.moved) return;
    select(c.getAttribute('data-id'));
    // pe ecrane înguste axa e deasupra mesei: urcăm la ea
    if (!c.classList.contains('done') && window.matchMedia('(max-width: 900px)').matches) {
      var top = tl.getBoundingClientRect().top + window.pageYOffset - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 0) - 40;
      window.scrollTo({ top: top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  });
  tray.addEventListener('pointerdown', function(e){
    var c = e.target.closest('.md-card');
    if (!c || e.pointerType === 'touch' || e.button !== 0 || c.classList.contains('done')) return;
    drag = { id: c.getAttribute('data-id'), x: e.clientX, y: e.clientY, moved: false, ghost: null, card: c };
  });
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
    }
    drag.ghost.style.transform = 'translate(' + (e.clientX - 50) + 'px,' + (e.clientY - 38) + 'px) rotate(-3deg)';
    var r = tl.getBoundingClientRect(), over = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top - 30 && e.clientY <= r.bottom + 30;
    tl.classList.toggle('drop', over);
    if (over) showCursor(yOf(frac(e.clientX))); else cursor.hidden = true;
  });
  window.addEventListener('pointerup', function(e){
    if (!drag) return;
    var d = drag;
    if (d.moved) {
      d.ghost.remove(); root.classList.remove('md-dragging');
      var over = tl.classList.contains('drop'); tl.classList.remove('drop');
      if (over) place(d.id, yOf(frac(e.clientX)));
      setTimeout(function(){ drag = null; }, 0);
    } else drag = null;
  });

  // ---------------- finalul ----------------
  function finale(){
    var late = items.filter(function(it){ return it.kind === 'img'; }).map(function(it){ return it.year; });
    var firstImg = Math.min.apply(null, late);
    var gap = $('md-gap');
    gap.style.left = pc(453); gap.style.width = 'calc(' + pc(firstImg) + ' - ' + pc(453) + ')';
    gap.innerHTML = '<span>' + ani(firstImg - 453) + ' fără nicio imagine a hunilor</span>';
    gap.hidden = false;
    tl.classList.add('done');
    var max = items.length * (MAXP + 1);
    var rank = score >= max * 0.8 ? 'Ochi de istoric' : score >= max * 0.6 ? 'Cercetător atent' : score >= max * 0.38 ? 'Ucenic de arhivă' : 'La început de drum';
    var objs = items.filter(function(it){ return it.kind === 'obj'; }).length, txts = items.filter(function(it){ return it.kind === 'txt' && it.year <= 600; }).length;
    sel = null; renderTray(); tl.classList.remove('armed'); tl.tabIndex = -1;
    insp.innerHTML = '<div class="md-end"><p class="md-big">' + score + ' <span>/ ' + max + '</span></p><p class="md-rank">' + rank + '</p>' +
      '<p class="md-scale">Fiecare sursă valorează 4 puncte: până la 3 pentru an și 1 pentru tip, deci maximul e ' + max + '. Ochi de istoric: cel puțin ' + Math.ceil(max * 0.8) + ' de puncte; Cercetător atent: cel puțin ' + Math.ceil(max * 0.6) + '; Ucenic de arhivă: cel puțin ' + Math.ceil(max * 0.38) + '.</p>' +
      '<p class="md-sum">Din ' + items.length + ' surse, doar ' + objs + ' obiecte și ' + txts + ' cărți sunt din Antichitate. Toate cele ' + late.length + ' imagini sunt făcute la peste ' + ani(Math.floor((firstImg - 453) / 100) * 100) + ' după Attila.' + (byId('codex') ? ' Iar copia Geticii arată o altă capcană: textul e din 551, dar îl citim dintr-un manuscris copiat de mână în secolul al VIII-lea.' : '') + '</p>' +
      '<ul><li>Obiectele (monede, oase, ziduri) au existat în vremea hunilor, dar nu spun singure cine le-a folosit.</li>' +
      '<li>Nu se cunoaște niciun portret al lui Attila făcut în timpul vieții lui.</li>' +
      '<li>O imagine veche nu e, prin asta, o sursă: întreabă „când și pentru cine a fost făcută?”.</li></ul>' +
      '<button class="md-btn" type="button" id="md-again">Așază din nou</button></div>';
    $('md-hint').textContent = 'Toate sursele sunt pe axă. Atinge o miniatură ca s-o revezi.';
    $('md-again').addEventListener('click', reset);
    var end = insp.querySelector('.md-end'); end.setAttribute('tabindex', '-1'); end.focus({ preventScroll: true });
  }

  function reset(){
    placed = {}; score = 0; sel = null;
    $('md-gap').hidden = true; tl.classList.remove('done');
    items = shuffle(items);
    renderPins(); updateScore(); select(null);
  }

  var rz;
  function relayout(){ clearTimeout(rz); rz = setTimeout(function(){ renderPins(); }, 120); }
  window.addEventListener('resize', relayout);
  window.addEventListener('hashchange', relayout);

  buildTicks();
  collect();
  items = shuffle(items);
  renderTray(); inspectEmpty(); updateScore();
})();
