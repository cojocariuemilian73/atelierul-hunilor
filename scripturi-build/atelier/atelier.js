(function(){
  var root = document.getElementById('mod-atelier');
  if (!root) return;

  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function shuffle(a){ a = a.slice(); for (var k = a.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var t = a[k]; a[k] = a[j]; a[j] = t; } return a; }
  function fmt(n){ return n.toLocaleString('ro-RO'); }

  // ---------------- tabs ----------------
  var tabs = [1, 2, 3].map(function(n){ return $('at-tab-' + n); });
  var panels = [1, 2, 3].map(function(n){ return $('at-g' + n); });
  function showTab(i){
    tabs.forEach(function(t, k){
      t.classList.toggle('active', k === i);
      t.setAttribute('aria-selected', k === i ? 'true' : 'false');
      t.tabIndex = k === i ? 0 : -1;
      panels[k].hidden = k !== i;
    });
  }
  tabs.forEach(function(t, i){
    t.addEventListener('click', function(){ showTab(i); });
    t.addEventListener('keydown', function(e){
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var n = (i + d + tabs.length) % tabs.length;
      showTab(n); tabs[n].focus();
    });
  });

  // =====================================================================
  // JOC 1 — Dosarul sursei
  // =====================================================================
  var LEVELS = {
    dovedit:   { n: 3, c: '#8fbd82', label: 'Dovedit' },
    probabil:  { n: 2, c: '#e0b84a', label: 'Probabil' },
    nedovedit: { n: 1, c: '#e0626c', label: 'Nedovedit' }
  };
  var CLAIMS = [
    { claim: 'Hunii mâncau carne înmuiată sub șa.',
      src: 'Ammianus Marcellinus, Res Gestae 31.2', kind: 'Relatare scrisă', witness: 'nu i-a văzut niciodată pe huni',
      ev: 375, wr: 390, verdict: 'nedovedit',
      why: 'Ammianus nu i-a văzut pe huni. Detaliul reia tipare etnografice vechi, folosite și pentru sciți, al căror rol literar este să marcheze „barbaria”. Arheologia confirmă arcul compozit și cazanele de bronz, nu carnea înmuiată sub șa.' },
    { claim: 'Tributul plătit hunilor a ajuns la 2.100 de livre de aur pe an.',
      src: 'Priscus din Panium (fragmente)', kind: 'Relatare scrisă', witness: 'contemporan; a fost în solia de la curtea lui Attila, în 449',
      ev: 447, wr: 470, verdict: 'probabil',
      why: 'Priscus e contemporan și a ajuns chiar la curtea lui Attila. Dar cifra vine dintr-o singură sursă, păstrată doar în fragmente, iar cifrele din izvoarele antice pot fi rotunjite. Rămâne „probabil”, nu „dovedit”.' },
    { claim: 'Attila a murit în noaptea nunții, de o hemoragie.',
      src: 'Iordanes, Getica 254', kind: 'Rezumat scris', witness: 'nu a fost martor; folosește un autor mai vechi',
      ev: 453, wr: 551, verdict: 'probabil',
      why: 'Iordanes scrie la aproape un secol distanță, dar rezumă un autor contemporan cu faptele, Priscus. Alte surse dau versiuni diferite despre moartea lui Attila, așa că răspunsul cinstit este „probabil”.' },
    { claim: 'Un craniu deformat artificial dovedește că cel îngropat era hun.',
      src: 'Descoperiri din cimitire (Mözs, Gherăseni)', kind: 'Dovadă materială', witness: 'obiect din epocă, fără text',
      ev: 450, wr: 450, verdict: 'nedovedit',
      why: 'Deformarea craniului era practicată și de alte popoare, printre care germanici și alani. Ea arată apartenența la o lume politică dominată de huni, nu neapărat originea etnică a celui îngropat.' },
    { claim: 'Hunii europeni sunt urmașii direcți ai Xiongnu din China antică.',
      src: 'Ipoteză modernă (De Guignes, 1756)', kind: 'Interpretare modernă', witness: 'nu e o sursă din epocă',
      ev: 375, wr: 1756, verdict: 'nedovedit',
      why: 'Numele seamănă, iar genetica a găsit la câțiva indivizi ascendență est-asiatică. Nu există însă dovada unei migrații compacte, nici a unei continuități directe a elitei. O legătură de populație e probabilă; descendența directă rămâne nedovedită.' },
    { claim: 'Zidurile Constantinopolului au fost refăcute în grabă în 447, când Attila se apropia.',
      src: 'Inscripții și monumentul însuși', kind: 'Dovadă materială', witness: 'inscripții datate pe ziduri',
      ev: 447, wr: 447, verdict: 'dovedit',
      why: 'Inscripțiile de pe ziduri datează refacerea, iar cronicile confirmă cutremurul și amenințarea hunilor. Aici dovada materială se sprijină pe texte contemporane.' }
  ];
  var LESSONS = [
    'Un martor direct cântărește mai mult decât un rezumat scris un secol mai târziu, dar niciun martor nu scapă de interesele lui.',
    'Obiectele nu mint, dar nici nu vorbesc: spun ce a existat, nu și cine a fost omul îngropat lângă ele.',
    '„Probabil” nu e o slăbiciune. Pentru Antichitatea târzie, e adesea cel mai onest răspuns.'
  ];

  function gauge(level){
    var l = LEVELS[level], h = '<span class="at-gauge" style="--c:' + l.c + '" aria-hidden="true">';
    for (var k = 1; k <= 3; k++) h += '<s' + (k <= l.n ? ' class="on"' : '') + '></s>';
    return h + '</span>';
  }

  function timeline(c){
    var A = 350, B = 560;
    function pos(y){ return Math.max(2, Math.min(97, (y - A) / (B - A) * 100)); }
    var ticks = [400, 450, 500, 550].map(function(y){ return '<div class="at-tl-tick" style="left:' + pos(y) + '%"><em>' + y + '</em></div>'; }).join('');
    var h = '<div class="at-tl" role="img" aria-label="Distanța în timp dintre eveniment și sursă"><div class="at-tl-track"></div>' + ticks;
    var same = c.ev === c.wr, far = c.wr > B;
    if (!same) h += '<div class="at-tl-gap" style="left:' + pos(c.ev) + '%;width:' + Math.max(0.8, pos(c.wr) - pos(c.ev)) + '%"></div>';
    h += '<div class="at-tl-mark" style="left:' + pos(c.ev) + '%"><b>' + (same ? 'Obiectul · sec. V' : 'Evenimentul · c. ' + c.ev) + '</b><i></i></div>';
    if (!same) h += '<div class="at-tl-mark src" style="left:' + pos(c.wr) + '%"><b>' + (far ? 'Sursa · ' + c.wr + ' →' : 'Sursa · c. ' + c.wr) + '</b><i></i></div>';
    var note = same ? 'Dovada e din aceeași epocă cu faptele.'
      : far ? 'Sursa apare la peste ' + fmt(Math.round((c.wr - c.ev) / 100) * 100) + ' de ani după eveniment.'
      : 'Decalaj între eveniment și sursă: ≈ ' + (c.wr - c.ev) + ' de ani.';
    return h + '<div class="at-tl-note">' + note + '</div></div>';
  }

  function game1(){
    var el = $('at-g1'), order, i, score, answered;
    function intro(){
      el.innerHTML =
        '<div class="at-head"><h2 class="at-h2">Dosarul sursei</h2><span class="at-pill">6 afirmații</span></div>' +
        '<p class="at-lead">Un istoric nu întreabă „e adevărat?”, ci „cât de sigur putem fi?”. La fiecare afirmație despre huni vezi dosarul dovezii: cine o spune, de unde știe și cât de aproape e de eveniment. Hotărăște dacă afirmația este <b>dovedită</b>, <b>probabilă</b> sau <b>nedovedită</b>.</p>' +
        '<button class="at-btn" id="at1-start" type="button">Deschide primul dosar</button>';
      $('at1-start').addEventListener('click', start);
    }
    function start(){ order = shuffle(CLAIMS); i = 0; score = 0; round(); }
    function round(){
      var c = order[i]; answered = false;
      el.innerHTML =
        '<div class="at-head"><h2 class="at-h2">Dosarul sursei</h2><span class="at-pill">Afirmația ' + (i + 1) + ' / ' + order.length + ' · ' + score + ' puncte</span></div>' +
        '<div class="at-progress"><i style="width:' + (i / order.length * 100) + '%"></i></div>' +
        '<p class="at-claim">„' + esc(c.claim) + '”</p>' +
        '<div class="at-file"><span class="at-chip"><small>Sursa</small>' + esc(c.src) + '</span><span class="at-chip"><small>Tip</small>' + esc(c.kind) + '</span><span class="at-chip"><small>Martor</small>' + esc(c.witness) + '</span></div>' +
        timeline(c) +
        '<p class="at-ask">Cât de sigură e afirmația?</p>' +
        '<div class="at-verdict" id="at1-v">' +
          ['dovedit', 'probabil', 'nedovedit'].map(function(k){ return '<button type="button" data-v="' + k + '">' + gauge(k) + LEVELS[k].label + '</button>'; }).join('') +
        '</div><div id="at1-r"></div>';
      Array.prototype.forEach.call(el.querySelectorAll('#at1-v button'), function(b){
        b.addEventListener('click', function(){ pick(b.getAttribute('data-v')); });
      });
    }
    function pick(v){
      if (answered) return; answered = true;
      var c = order[i], ok = c.verdict, d = Math.abs(LEVELS[v].n - LEVELS[ok].n), pts = d === 0 ? 2 : d === 1 ? 1 : 0;
      score += pts;
      Array.prototype.forEach.call(el.querySelectorAll('#at1-v button'), function(b){
        b.disabled = true;
        if (b.getAttribute('data-v') === v) b.classList.add('picked');
      });
      var l = LEVELS[ok], last = i === order.length - 1;
      $('at1-r').innerHTML =
        '<div class="at-reveal" style="--c:' + l.c + '"><h3>' + (pts === 2 ? 'Exact: ' : 'Verdictul istoricului: ') + l.label.toLowerCase() + '</h3><p>' + esc(c.why) + '</p>' +
        '<span class="at-pts">' + (pts === 2 ? '+2 puncte' : pts === 1 ? '+1 punct · aproape' : '0 puncte') + '</span>' +
        '<button class="at-btn" id="at1-next" type="button">' + (last ? 'Vezi rezultatul' : 'Următorul dosar →') + '</button></div>';
      $('at1-next').addEventListener('click', function(){ if (last) end(); else { i++; round(); } });
      $('at1-next').focus();
    }
    function end(){
      var max = order.length * 2, rank = score >= 11 ? 'Istoric' : score >= 8 ? 'Cercetător' : score >= 5 ? 'Ucenic de arhivă' : 'La început de drum';
      el.innerHTML =
        '<div class="at-end"><p class="at-eyebrow">Rezultat</p><p class="at-big">' + score + ' / ' + max + '</p><p class="at-rank">' + rank + '</p>' +
        '<ul>' + LESSONS.map(function(t){ return '<li>' + t + '</li>'; }).join('') + '</ul>' +
        '<button class="at-btn" id="at1-again" type="button">Joacă din nou</button></div>';
      $('at1-again').addEventListener('click', start);
    }
    intro();
  }

  // =====================================================================
  // JOC 2 — Efectul de domino (două teze, aceeași hartă)
  // =====================================================================
  var NODES = {
    huni:  { x: 610, y: 275, t: 'HUNI', cls: 'huni' },
    alani: { x: 594, y: 365, t: 'ALANI' },
    ostro: { x: 493, y: 340, t: 'OSTROGOȚI' },
    vizi:  { x: 439, y: 388, t: 'VIZIGOȚI' },
    romE:  { x: 436, y: 438, t: 'IMPERIUL DE RĂSĂRIT', cls: 'rome' },
    vand:  { x: 327, y: 351, t: 'VANDALI · SUEBI' },
    romV:  { x: 234, y: 360, t: 'IMPERIUL DE APUS', cls: 'rome' }
  };
  var EDGES = [
    { id: 'HO', a: 'huni', b: 'ostro', c: [555, 290] },
    { id: 'HA', a: 'huni', b: 'alani', c: [622, 322] },
    { id: 'OV', a: 'ostro', b: 'vizi', c: [470, 360] },
    { id: 'VR', a: 'vizi', b: 'romE', cross: true },
    { id: 'HW', a: 'huni', b: 'vand', c: [470, 246] },
    { id: 'WR', a: 'vand', b: 'romV', c: [282, 348], cross: true }
  ];
  var T = 45, WT = { A: [0.75, 0.25], B: [0.25, 0.75] };
  function evalThesis(P, S, th){
    var w = WT[th];
    var oPush = P >= 35, aPush = P >= 35;
    var pV = 0.6 * P + (oPush ? 30 : 0);
    var vCross = w[0] * pV + w[1] * (100 - S) >= T;
    var pW = 0.45 * P + (vCross ? 25 : 0) + (aPush ? 10 : 0);
    var wCross = w[0] * pW + w[1] * (100 - S) >= T;
    return { ostro: oPush, alani: aPush, vizi: pV >= 35, vand: pW >= 35, Vc: vCross, Wc: wCross };
  }
  function edgePath(e){
    var a = NODES[e.a], b = NODES[e.b], from = e.c ? { x: e.c[0], y: e.c[1] } : a;
    var dx = b.x - from.x, dy = b.y - from.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
    var ex = b.x - dx / len * 13, ey = b.y - dy / len * 13;
    return e.c ? 'M' + a.x + ',' + a.y + ' Q' + e.c[0] + ',' + e.c[1] + ' ' + ex.toFixed(1) + ',' + ey.toFixed(1) : 'M' + a.x + ',' + a.y + ' L' + ex.toFixed(1) + ',' + ey.toFixed(1);
  }

  function game2(){
    var el = $('at-g2'), thesis = 'A', found = {}, foundN = 0, won = false;
    var svg =
      '<svg viewBox="180 262 510 230" role="img" aria-label="Harta Europei de Est și Centrale, cu hunii, popoarele împinse de ei și cele două granițe ale Imperiului Roman">' +
      '<defs><marker id="at-ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#f0a25c"/></marker>' +
      '<marker id="at-ah2" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#e0626c"/></marker></defs>' +
      '<use href="#shared-img-0"/><rect x="180" y="262" width="510" height="230" fill="#0e0e10" opacity="0.42"/>' +
      EDGES.map(function(e){ return '<path id="at-e-' + e.id + '" class="at-edge' + (e.cross ? ' cross' : '') + '" d="' + edgePath(e) + '"/>'; }).join('') +
      Object.keys(NODES).map(function(k){
        var n = NODES[k];
        return '<g class="at-node ' + (n.cls || '') + '" id="at-n-' + k + '"><circle class="pulse" cx="' + n.x + '" cy="' + n.y + '" r="11"/><circle cx="' + n.x + '" cy="' + n.y + '" r="9"/><text x="' + n.x + '" y="' + (n.y + 22) + '">' + n.t + '</text></g>';
      }).join('') +
      '</svg><span class="at-map-credit">Hartă: Alexrk2, Wikimedia Commons, CC BY-SA 3.0</span>';
    el.innerHTML =
      '<div class="at-head"><h2 class="at-h2">Efectul de domino</h2><span class="at-pill">model didactic</span></div>' +
      '<p class="at-lead">Prin 376 și 406, popoare întregi trec granițele Imperiului. De ce? Istoricii nu sunt de acord: unii dau vina pe <b>șocul venit din stepă</b>, alții pe <b>slăbiciunea dinăuntrul Imperiului</b>. Mișcă cele două glisoare și vezi ce prevede fiecare teză. <b>Găsește 3 situații în care cele două teze nu cad de acord.</b></p>' +
      '<div class="at-dom"><div class="at-map">' + svg + '</div><div class="at-ctl">' +
        '<div class="at-slider"><label for="at2-p">Presiunea hunică <b id="at2-pv">85</b></label><input type="range" id="at2-p" min="0" max="100" step="5" value="85"></div>' +
        '<div class="at-slider"><label for="at2-s">Stabilitatea Imperiului <b id="at2-sv">35</b></label><input type="range" id="at2-s" min="0" max="100" step="5" value="35"></div>' +
        '<div class="at-presets"><button type="button" data-p="85" data-s="35">Situația reală, c. 375–406</button><button type="button" data-p="0" data-s="35">Fără huni</button><button type="button" data-p="100" data-s="90">Imperiu puternic</button></div>' +
        '<div class="at-theses" role="group" aria-label="Alege teza afișată pe hartă">' +
          '<button type="button" class="at-thesis sel" id="at2-tA" data-t="A"><small>Teza 1</small><b>Presiunea hunică</b><em id="at2-rA"></em></button>' +
          '<button type="button" class="at-thesis" id="at2-tB" data-t="B"><small>Teza 2</small><b>Slăbiciunea Imperiului</b><em id="at2-rB"></em></button>' +
        '</div>' +
        '<div class="at-verdict-box" id="at2-box" aria-live="polite"></div>' +
        '<div class="at-found"><span>Dezacorduri găsite</span><span class="dots" id="at2-dots"><s></s><s></s><s></s></span></div>' +
        '<div id="at2-win"></div>' +
      '</div></div>' +
      '<p class="at-note">Model didactic: valorile sunt ilustrative, nu măsurători. Teza 1 e asociată cu Peter Heather, teza 2 cu Guy Halsall și Walter Goffart. Datele trecerilor reale: Dunărea, 376; Rinul, 31 decembrie 406.</p>';

    var pEl = $('at2-p'), sEl = $('at2-s');
    function line(ok, text){ return '<span class="' + (ok ? 'y' : 'n') + '">' + (ok ? '● ' : '○ ') + text + '</span>'; }
    function update(){
      var P = +pEl.value, S = +sEl.value;
      $('at2-pv').textContent = P; $('at2-sv').textContent = S;
      var A = evalThesis(P, S, 'A'), B = evalThesis(P, S, 'B');
      $('at2-rA').innerHTML = line(A.Vc, 'Dunărea: ' + (A.Vc ? 'trece' : 'ține')) + line(A.Wc, 'Rinul: ' + (A.Wc ? 'trece' : 'ține'));
      $('at2-rB').innerHTML = line(B.Vc, 'Dunărea: ' + (B.Vc ? 'trece' : 'ține')) + line(B.Wc, 'Rinul: ' + (B.Wc ? 'trece' : 'ține'));
      var s = thesis === 'A' ? A : B;
      ['ostro', 'alani', 'vizi', 'vand'].forEach(function(k){ $('at-n-' + k).classList.toggle('pushed', !!s[k]); });
      $('at-n-vizi').classList.toggle('crossed', s.Vc);
      $('at-n-vand').classList.toggle('crossed', s.Wc);
      $('at-n-romE').classList.toggle('breached', s.Vc);
      $('at-n-romV').classList.toggle('breached', s.Wc);
      var on = { HO: s.ostro, HA: s.alani, OV: s.vizi, VR: s.Vc, HW: s.vand, WR: s.Wc };
      EDGES.forEach(function(e){
        var p = $('at-e-' + e.id); p.classList.toggle('on', !!on[e.id]);
        p.style.markerEnd = on[e.id] ? 'url(#' + (e.cross ? 'at-ah2' : 'at-ah') + ')' : 'none';
      });
      var diff = A.Vc !== B.Vc || A.Wc !== B.Wc, any = A.Vc || A.Wc || B.Vc || B.Wc, box = $('at2-box');
      box.classList.toggle('diff', diff);
      box.textContent = diff
        ? 'Dezacord! Teza 1 prevede ' + count(A) + ', teza 2 prevede ' + count(B) + '. Exact aici se poartă disputa dintre istorici.'
        : any ? 'Cele două teze prevăd aceleași treceri. În realitate, în 376 și 406 erau prezente și presiunea hunică, și un Imperiu slăbit, de aceea cauzele nu se pot despărți ușor.'
              : 'Nicio teză nu prevede treceri: graniță apărată și presiune mică.';
      if (diff) {
        var key = Math.round(P / 20) + '-' + Math.round(S / 20);
        if (!found[key] && foundN < 3) {
          found[key] = 1; foundN++;
          var dots = $('at2-dots').children;
          for (var k = 0; k < dots.length; k++) dots[k].classList.toggle('on', k < foundN);
          if (foundN === 3 && !won) {
            won = true;
            $('at2-win').innerHTML = '<div class="at-win"><b>Ai găsit trei situații în care teoriile se despart.</b> Istoricii caută dovezi care să arate dacă a contat mai mult șocul din stepă sau starea Imperiului. Dovezile arheologice și izvoarele sugerează că au contat amândouă.</div>';
          }
        }
      }
    }
    function count(r){ var n = (r.Vc ? 1 : 0) + (r.Wc ? 1 : 0); return n === 0 ? 'nicio trecere' : n === 1 ? 'o trecere' : 'două treceri'; }
    pEl.addEventListener('input', update); sEl.addEventListener('input', update);
    Array.prototype.forEach.call(el.querySelectorAll('.at-presets button'), function(b){
      b.addEventListener('click', function(){ pEl.value = b.getAttribute('data-p'); sEl.value = b.getAttribute('data-s'); update(); });
    });
    Array.prototype.forEach.call(el.querySelectorAll('.at-thesis'), function(b){
      b.addEventListener('click', function(){
        thesis = b.getAttribute('data-t');
        Array.prototype.forEach.call(el.querySelectorAll('.at-thesis'), function(x){ x.classList.toggle('sel', x === b); });
        update();
      });
    });
    update();
  }

  // =====================================================================
  // JOC 3 — Document sau ilustrație?
  // =====================================================================
  var ITEMS = [
    { sel: '#img-solidus', label: '408–450', year: 430, doc: true, name: 'Solid de aur al lui Teodosie al II-lea', clue: 'Monedă bătută de contemporanul lui Attila: moneda cu care s-a plătit tributul. Document din epocă.' },
    { sel: '#img-craniu', label: 'sec. V', year: 450, doc: true, name: 'Craniu de la Mözs', clue: 'Os real, dintr-un cimitir din perioada stăpânirii hunice. Document din epocă.' },
    { sel: '#img-ziduri', label: '413 / 447', year: 447, doc: true, name: 'Zidurile Theodosiene', clue: 'Zidurile construite în 413 și refăcute în 447, când Attila amenința orașul. Monument din epocă, fotografiat azi.' },
    { sel: '#img-aquileia', label: 'c. 1360', year: 1360, name: 'Attila asediază Aquileia', clue: 'Cronica pictată de la Viena: pictorul îi îmbracă pe huni în armuri de cavaleri ai secolului său.' },
    { sel: '#img-catalaunice', label: 'c. 1330', year: 1330, name: 'Bătălia de la Câmpiile Catalaunice', clue: 'Miniatură din Spieghel Historiael: cavaleri medievali, la aproape 900 de ani de bătălie.' },
    { sel: '#img-delacroix', label: '1838–1847', year: 1842, name: 'Attila și hoardele sale, de Delacroix', clue: 'Imaginea romantică a „biciului lui Dumnezeu”, pictată cu aproape 1.400 de ani mai târziu.' },
    { sel: 'img[alt^="Ilustrație: călăreți huni"]', label: '1869', year: 1869, name: 'Hunii la Châlons, de Neuville', clue: 'Gravură din Istoria Franței a lui Guizot: arcașii călare, așa cum și-i imagina secolul al XIX-lea.' },
    { sel: 'img[alt^="Gravură: călăreți huni"]', label: 'c. 1873', year: 1873, name: 'Hunii în luptă cu alanii, de Geiger', clue: 'O scenă imaginată la peste 1.400 de ani după evenimente.' },
    { sel: '#img-moartea', label: '1884', year: 1884, name: 'Moartea lui Attila, de Paczka', clue: 'Iordanes, după Priscus, povestește moartea din noaptea nunții. Pictura e imaginea târzie a scenei.' }
  ];
  var ATT = 453;

  function game3(){
    var el = $('at-g3'), list, i, score, step, items;
    function collect(){
      items = ITEMS.map(function(it){
        var node = document.querySelector(it.sel);
        return node && node.getAttribute('src') ? Object.assign({ src: node.getAttribute('src') }, it) : null;
      }).filter(Boolean);
    }
    function intro(){
      el.innerHTML =
        '<div class="at-head"><h2 class="at-h2">Document sau ilustrație?</h2><span class="at-pill">8 imagini</span></div>' +
        '<p class="at-lead">Imaginile despre huni de pe internet par toate „vechi”, dar foarte puține sunt din epoca lor. La fiecare imagine hotărăște: e <b>din vremea lui Attila</b> sau a fost <b>făcută mai târziu</b>? Dacă ai ales „mai târziu”, încearcă să ghicești și anul.</p>' +
        '<button class="at-btn" id="at3-start" type="button">Arată prima imagine</button>';
      $('at3-start').addEventListener('click', start);
    }
    function start(){ collect(); list = shuffle(items).slice(0, 8); i = 0; score = 0; round(); }
    function round(){
      var it = list[i]; step = 0;
      el.innerHTML =
        '<div class="at-head"><h2 class="at-h2">Document sau ilustrație?</h2><span class="at-pill">Imaginea ' + (i + 1) + ' / ' + list.length + ' · ' + score + ' puncte</span></div>' +
        '<div class="at-progress"><i style="width:' + (i / list.length * 100) + '%"></i></div>' +
        '<div class="at-g3"><figure class="at-frame"><img id="at3-img" alt="Imagine misterioasă, fără titlu, despre huni"><figcaption id="at3-cap">&nbsp;</figcaption></figure>' +
        '<div><p class="at-q">Când a fost făcută această imagine?</p>' +
        '<div class="at-two" id="at3-two"><button type="button" data-k="doc"><i aria-hidden="true">🏺</i>Din vremea lui Attila (sec. V)</button><button type="button" data-k="late"><i aria-hidden="true">🖼</i>Făcută mult mai târziu</button></div>' +
        '<div id="at3-year"></div><div id="at3-r"></div></div></div>';
      $('at3-img').src = it.src;
      Array.prototype.forEach.call(el.querySelectorAll('#at3-two button'), function(b){
        b.addEventListener('click', function(){ choose(b.getAttribute('data-k'), b); });
      });
    }
    function choose(k, btn){
      var it = list[i];
      Array.prototype.forEach.call(el.querySelectorAll('#at3-two button'), function(b){ b.disabled = true; });
      btn.classList.add('picked');
      var right = (k === 'doc') === !!it.doc;
      if (!right) { reveal(it, 0, false, null); return; }
      if (it.doc) { reveal(it, 2, true, null); return; }
      // "later": ask for the year
      $('at3-year').innerHTML =
        '<div class="at-year"><div class="at-year-val"><span>Anul estimat</span><b id="at3-yv">1200</b></div>' +
        '<input type="range" id="at3-y" min="450" max="1900" step="5" value="1200" aria-label="Anul estimat">' +
        '<div class="at-year-scale"><span class="att" style="left:0.2%">Attila · 453</span><span style="left:37.9%">1000</span><span style="left:72.4%">1500</span><span style="left:98%">1900</span></div>' +
        '<button class="at-btn" id="at3-ok" type="button">Confirmă anul</button></div>';
      var y = $('at3-y');
      y.addEventListener('input', function(){ $('at3-yv').textContent = y.value; });
      $('at3-ok').addEventListener('click', function(){
        var guess = +y.value, pts = 1 + (Math.abs(guess - it.year) <= 150 ? 1 : 0);
        $('at3-year').innerHTML = '';
        reveal(it, pts, true, guess);
      });
    }
    function reveal(it, pts, right, guess){
      score += pts;
      $('at3-cap').textContent = it.name + ' · ' + it.label;
      var after = it.doc ? '' : ' La ' + fmt(Math.round((it.year - ATT) / 10) * 10) + ' de ani după Attila.';
      var head = right ? (it.doc ? 'Corect: document din epocă.' : 'Corect: ilustrație târzie.') : (it.doc ? 'De fapt, e din epoca lui Attila.' : 'De fapt, e o ilustrație târzie.');
      var c = right ? '#8fbd82' : '#e0626c', last = i === list.length - 1;
      $('at3-r').innerHTML =
        '<div class="at-reveal" style="--c:' + c + '"><h3>' + head + '</h3><p>' + esc(it.clue) + esc(after) + (guess !== null ? ' Ai estimat ' + guess + '.' : '') + '</p>' +
        '<span class="at-pts">' + (pts ? '+' + pts + (pts === 1 ? ' punct' : ' puncte') : '0 puncte') + '</span>' +
        '<button class="at-btn" id="at3-next" type="button">' + (last ? 'Vezi rezultatul' : 'Următoarea imagine →') + '</button></div>';
      $('at3-next').addEventListener('click', function(){ if (last) end(); else { i++; round(); } });
      $('at3-next').focus();
    }
    function end(){
      var docs = list.filter(function(it){ return it.doc; }).length, max = list.length * 2;
      var sorted = list.slice().sort(function(a, b){ return a.year - b.year; });
      el.innerHTML =
        '<div class="at-end"><p class="at-eyebrow">Rezultat</p><p class="at-big">' + score + ' / ' + max + '</p>' +
        '<p class="at-rank">Din ' + list.length + ' imagini, doar ' + docs + (docs === 1 ? ' e din epoca hunilor' : ' sunt din epoca hunilor') + '</p>' +
        '<div class="at-strip">' + sorted.map(function(it){ return '<figure class="' + (it.doc ? 'doc' : '') + '"><img src="' + it.src + '" alt="' + esc(it.name) + '"><figcaption>' + esc(it.label) + '</figcaption></figure>'; }).join('') + '</div>' +
        '<ul><li>Obiectele (monede, oase, ziduri) sunt documente: ele au existat în vremea hunilor.</li>' +
        '<li>Nu se cunoaște niciun portret al lui Attila făcut în timpul vieții lui. Tot ce vedem sunt imagini făcute de generații care nu l-au văzut niciodată.</li>' +
        '<li>O imagine veche nu e, prin asta, o sursă: întreabă mereu „când și pentru cine a fost făcută?”.</li></ul>' +
        '<button class="at-btn" id="at3-again" type="button">Joacă din nou</button></div>';
      $('at3-again').addEventListener('click', start);
    }
    intro();
  }

  game1(); game2(); game3();
})();
