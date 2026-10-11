(function(){
  var root = document.getElementById('tab-root');
  if (!root) return;

  // ---------------- harta taberei (desenată, după descrierea lui Priscus) ----------------
  function yurt(x, y, s){ s = s || 1; return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><ellipse class="yurt" cx="0" cy="0" rx="11" ry="7"/><path class="yurt" d="M-11,0 L0,-11 L11,0 Z"/></g>'; }
  function house(x, y, w, h){ return '<rect class="wood" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"/><path class="wood" d="M' + (x - 3) + ',' + y + ' L' + (x + w / 2) + ',' + (y - h * 0.55) + ' L' + (x + w + 3) + ',' + y + ' Z"/>'; }
  var CAMP =
    '<defs><pattern id="tab-grass" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M3,11 l1,-4 M9,6 l1,-3 M12,13 l-1,-3" stroke="#4a5a2a" stroke-width="1" stroke-linecap="round"/></pattern>' +
    '<radialGradient id="tab-vig" cx="50%" cy="50%" r="70%"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.55"/></radialGradient></defs>' +
    '<rect class="ground" x="0" y="0" width="600" height="380"/><rect x="0" y="0" width="600" height="380" fill="url(#tab-grass)"/>' +
    '<path class="road" d="M128,292 C180,280 230,262 262,236 S300,200 322,176"/>' +
    '<path class="river" d="M-20,30 C110,70 40,190 120,250 S210,350 120,400"/><path class="river2" d="M-20,30 C110,70 40,190 120,250 S210,350 120,400"/>' +
    [[60, 320], [95, 345], [210, 320], [250, 345], [290, 315], [300, 290], [180, 60], [230, 40], [270, 75], [560, 300], [520, 330], [575, 50], [150, 120], [240, 115]].map(function(p){ return yurt(p[0], p[1], 1); }).join('') +
    // casa lui Onegesius și baia de piatră
    house(176, 186, 58, 34) + '<rect class="stone" x="244" y="196" width="34" height="24"/><circle class="stone" cx="261" cy="196" r="9"/>' +
    // incinta lui Attila: gard de lemn cu turnuri
    '<rect class="fence" x="320" y="72" width="246" height="186" rx="6"/>' +
    [[320, 72], [566, 72], [320, 258], [566, 258], [443, 72]].map(function(p){ return '<rect class="tower" x="' + (p[0] - 6) + '" y="' + (p[1] - 14) + '" width="12" height="16"/>'; }).join('') +
    house(360, 120, 92, 50) + house(468, 190, 64, 34) + house(360, 205, 40, 26) +
    // focul și cortul soliei
    '<circle class="fire" cx="140" cy="290" r="4"/><path class="smoke" d="M140,284 c-6,-8 6,-12 0,-20 c-6,-8 6,-12 0,-20"/>' + yurt(118, 285, 1.25) +
    '<path class="smoke" d="M286,312 c-5,-7 5,-10 0,-17 c-5,-7 5,-10 0,-17"/>' +
    '<g class="cartouche"><rect x="412" y="312" width="174" height="52" rx="3"/><text x="499" y="334">Tabăra lui Attila</text><text class="small" x="499" y="351">anul 449 · după descrierea lui Priscus</text></g>' +
    '<rect x="0" y="0" width="600" height="380" fill="url(#tab-vig)" pointer-events="none"/>';
  var SPOTS = [
    { id: 'onegesius', x: 228, y: 196, r: 52, label: 'Casa lui Onegesius', sub: 'și baia de piatră' },
    { id: 'kreka', x: 500, y: 196, r: 44, label: 'Casa reginei Kreka', sub: 'în incinta de lemn' },
    { id: 'palat', x: 406, y: 124, r: 50, label: 'Palatul lui Attila', sub: 'audiența' }
  ];
  // the scene picture: the whole camp with the current place marked; the feast uses Mór Than's painting
  function vignette(id){
    if (id === 'ospat') {
      var hero = document.querySelector('#mod-embassy .jg-hero') || document.querySelector('.jg-hero');
      var m = hero && (hero.style.backgroundImage || '').match(/url\(["']?(.*?)["']?\)$/);
      if (m) return '<figure class="tab-paint"><img src="' + m[1] + '" alt="Pictura lui Mór Than: Attila la ospăț, înconjurat de oaspeți."><figcaption>Mór Than, <i>Ospățul lui Attila</i> (1870), pictat după descrierea lui Priscus. Domeniu public.</figcaption></figure>';
    }
    var s = SPOTS.filter(function(x){ return x.id === id; })[0];
    var mark = s ? '<circle class="here-ring" cx="' + s.x + '" cy="' + s.y + '" r="' + (s.r + 6) + '"/><circle class="here" cx="' + s.x + '" cy="' + s.y + '" r="' + s.r + '"/>' +
      '<text class="lbl" x="' + s.x + '" y="' + (s.y + s.r + 16) + '">' + s.label + '</text>' : '';
    return campSvg(null, false).replace('</svg>', mark + '</svg>');
  }
  function campSvg(view, interactive){
    var spots = interactive ? SPOTS.map(function(s){
      var done = visited.indexOf(s.id) !== -1, isFeast = s.id === 'palat' && feastReady();
      var locked = done && !isFeast;
      var lab = isFeast ? 'Ospățul de seară' : s.label, sub = isFeast ? 'ziua 4' : s.sub;
      return '<g class="jg-spot' + (done && !isFeast ? ' done' : '') + (locked ? ' locked' : '') + '" data-id="' + (isFeast ? 'ospat' : s.id) + '" tabindex="' + (locked ? '-1' : '0') + '" role="button" aria-label="' + lab + (locked ? ' (vizitat)' : '') + '">' +
        '<circle class="halo" cx="' + s.x + '" cy="' + s.y + '" r="' + s.r + '"/>' +
        '<text class="lbl" x="' + s.x + '" y="' + (s.y + s.r + 14) + '">' + lab + '</text><text class="sub" x="' + s.x + '" y="' + (s.y + s.r + 25) + '">' + sub + '</text>' +
        (locked ? '<text class="check" x="' + (s.x + s.r - 8) + '" y="' + (s.y - s.r + 14) + '">✓</text>' : '') + '</g>';
    }).join('') + '<text class="lbl" x="118" y="315">Cortul soliei</text><text class="sub" x="70" y="22">Râul</text>' : '';
    return '<svg viewBox="' + (view || '0 0 600 380') + '" role="img" aria-label="Plan ilustrat al taberei lui Attila, după descrierea lui Priscus">' + CAMP + spots + '</svg>';
  }

  // ---------------- scenele ----------------
  // fiecare pas: { narr, say: {who, text}, ask, opts: [{t, score: 2|1|0 sau trust: n, reply}], card }
  var SCENES = {
    onegesius: { title: 'Casa lui Onegesius', steps: [
      { narr: 'Onegesius, cel mai puternic om după Attila, e plecat. Lângă casa lui se află singura clădire de piatră din tabără: o baie, ridicată de un arhitect luat prizonier la Sirmium. Omul spera ca, drept răsplată, să fie eliberat; a ajuns să încălzească baia.',
        card: { t: 'Baia de piatră', d: 'Singura clădire de piatră din tabără, construită de un arhitect prizonier din Sirmium, care spera la libertate și a ajuns slujitorul ei.' } },
      { narr: 'Pe când aștepți, un bărbat îmbrăcat ca un hun te salută în greacă. A fost negustor la Viminacium; luat prizonier, a luptat pentru huni, și-a câștigat libertatea, are o soție hună și copii. „Aici trăiesc mai bine decât sub romani”, spune el. Îl provoci la o dispută.',
        say: { who: 'Grecul, prima acuzație', text: 'La romani, oamenii nu au voie să poarte arme. Își lasă viața în mâna altora, iar generalii lor, adesea lași, nu-i pot apăra.' },
        ask: 'Cum îi răspunzi?', debate: true,
        opts: [
          { t: 'Statul roman a împărțit sarcinile: unii păzesc granițele ca soldați, alții lucrează pământul și plătesc impozite din care sunt hrăniți soldații.', score: 2, reply: 'Grecul tace o clipă: argumentul tău e chiar cel pe care Priscus îl notează în istoria lui.' },
          { t: 'Romanii sunt cei mai buni soldați din lume.', score: 0, reply: '„Atunci de ce plătiți tribut?”, râde grecul. O laudă nu e un argument.' },
          { t: 'Hunii nici măcar nu au orașe.', score: 0, reply: '„Și ce-i cu asta?” Ai schimbat subiectul în loc să răspunzi.' }
        ] },
      { say: { who: 'Grecul, a doua acuzație', text: 'Impozitele sunt grele, iar cei puternici îi jecmănesc pe ceilalți. În pace, romanii suferă mai mult decât în război.' },
        ask: 'Ce răspunzi?', debate: true,
        opts: [
          { t: 'Și aici primești doar ce vrea stăpânul să-ți dea.', score: 0, reply: '„Eu am primit libertatea”, spune grecul. Comparația îl avantajează pe el.' },
          { t: 'Impozitele plătesc armata și pe cei care judecă; fără ele, nimeni nu ar mai fi apărat.', score: 2, reply: 'Grecul admite că o armată are nevoie de cineva care s-o hrănească.' },
          { t: 'Cine nu vrea să plătească să plece.', score: 0, reply: '„Am plecat”, răspunde grecul, zâmbind.' }
        ] },
      { say: { who: 'Grecul, a treia acuzație', text: 'Legile nu sunt aceleași pentru toți: bogatul scapă, săracul care nu știe procedurile e pedepsit, iar procesele durează ani și costă o avere.' },
        ask: 'Ultimul tău argument:', debate: true,
        opts: [
          { t: 'La noi nu există nedreptate.', score: 0, reply: 'Grecul ridică din umeri: nici tu nu crezi asta.' },
          { t: 'Hunii nu au legi scrise.', score: 0, reply: '„Nici nu le trebuie, ca să fii nedreptățit.” Argumentul nu-ți apără legile.' },
          { t: 'Procesele sunt lente ca să nu se greșească, iar legile îi apără chiar și pe sclavi: un stăpân nu-și poate ucide sclavul fără să dea socoteală.', score: 2, reply: 'Aici grecul cedează.' }
        ],
        after: 'Priscus notează că grecul a plâns și a spus că legile sunt bune și statul roman e bine întocmit, dar conducătorii lui îl strică, pentru că nu mai sunt ca înaintașii lor.',
        card: { t: 'Grecul de la Viminacium', d: 'Un fost negustor grec, ajuns om liber printre huni. Legile romane sunt bune, spune el, dar conducătorii le strică.' } }
    ] },
    kreka: { title: 'Casa reginei Kreka', steps: [
      { narr: 'Kreka, soția lui Attila și mama a trei dintre fiii lui, își are casa în incinta de lemn. Podeaua e acoperită cu covoare de pâslă; regina stă întinsă pe un pat moale, iar în jurul ei servitoarele brodează pânză colorată, pentru podoabele hainelor.',
        ask: 'Cum te prezinți?',
        opts: [
          { t: 'Oferi daruri și o saluți cu respect, prin interpret.', trust: 12, reply: 'Regina primește darurile. Așa a făcut și Priscus: darurile erau limba curții.' },
          { t: 'Îi ceri, înainte de toate, să intervină la Attila pentru solie.', trust: -6, reply: 'O cerere fără daruri pare o lipsă de respect. Ușa rămâne deschisă, dar mai rece.' },
          { t: 'Nu aduci nimic: o solie se poartă doar cu regele.', trust: -12, reply: 'Curtea observă. La huni, cine vine fără daruri nu e luat în serios.' }
        ],
        card: { t: 'Casa reginei Kreka', d: 'Covoare de pâslă, un pat moale și servitoare care brodează pânză colorată: Priscus descrie casa reginei ca pe un loc de rang, nu ca pe un cort.' } }
    ] },
    palat: { title: 'Palatul lui Attila', steps: [
      { narr: 'Locuința lui Attila e făcută din scânduri lustruite, într-o incintă de lemn cu turnuri ridicate pentru frumusețe, nu pentru apărare. Attila vă primește furios: vrea fugarii pe care romanii încă nu i-au predat.',
        say: { who: 'Attila', text: 'De ce n-ați predat fugarii? Nu voi îngădui ca oamenii mei să lupte împotriva mea!' },
        ask: 'Ce răspunzi?',
        opts: [
          { t: 'Calm: solul principal, Maximin, va duce cererea la împărat.', trust: 10, reply: 'Attila se liniștește. Fermitatea fără sfidare era ce aștepta.' },
          { t: 'Spui că romanii au predat deja tot ce li s-a cerut.', trust: -10, reply: 'Exact asta a susținut interpretul Vigilas, iar Attila l-a acoperit cu insulte.' },
          { t: 'Oferi aur pe loc pentru fugari.', trust: -4, reply: 'Nu ai împuternicire pentru asta. Attila ia aminte că solia se poate cumpăra.' }
        ],
        card: { t: 'Curtea de lemn', d: 'Case din scânduri lustruite, într-o incintă cu turnuri făcute pentru frumusețe, nu pentru apărare.' } }
    ] },
    ospat: { title: 'Ospățul de seară', steps: [
      { narr: 'Seara, ospățul. Oaspeții stau pe scaune de-a lungul pereților; locurile din dreapta lui Attila sunt cele mai onorate, voi stați la stânga. Paharnicul aduce cupa, iar Attila bea, pe rând, în sănătatea oaspeților.',
        ask: 'Attila ridică cupa spre tine. Ce faci?',
        opts: [
          { t: 'Te ridici, bei și îi întorci salutul, apoi te așezi.', trust: 10, reply: 'Așa cereau rânduielile ospățului, descrise de Priscus.' },
          { t: 'Bei rămânând așezat.', trust: -8, reply: 'Toți ceilalți s-au ridicat. Gestul tău se vede.' },
          { t: 'Refuzi vinul.', trust: -12, reply: 'Refuzul unei cupe oferite de rege e o jignire.' }
        ] },
      { narr: 'Oaspeților li se aduc bucate alese pe vase de argint și vin în cupe de aur și argint.',
        ask: 'Ce observi la Attila?',
        opts: [
          { t: 'Mănâncă doar carne, dintr-o farfurie de lemn, bea dintr-o cupă de lemn, iar hainele lui sunt simple, fără aur.', trust: 4, ok: true, reply: 'Exact ce a notat Priscus: simplitatea lui Attila era ea însăși un mesaj.' },
          { t: 'Poartă o coroană de aur și mănâncă din vase de argint.', trust: 0, ok: false, reply: 'Priscus scrie opusul: doar Attila folosea lemn, în timp ce oaspeții aveau argint și aur.' },
          { t: 'Nu mănâncă deloc în fața oaspeților.', trust: 0, ok: false, reply: 'Attila mânca, dar simplu: carne, pe o farfurie de lemn.' }
        ],
        card: { t: 'Masa lui Attila', d: 'Oaspeții mănâncă din argint și beau din aur; Attila mănâncă doar carne, dintr-o farfurie de lemn, și bea dintr-o cupă de lemn. Hainele lui sunt simple.' } },
      { narr: 'Doi cântăreți cântă victoriile lui Attila. Apoi intră bufonul Zercon, iar sala izbucnește în râs.',
        ask: 'Cine nu râde?',
        opts: [
          { t: 'Attila: rămâne serios și se îmblânzește doar când își mângâie fiul cel mic, Ernak.', trust: 4, ok: true, reply: 'Priscus a observat același lucru.' },
          { t: 'Regina Kreka.', trust: 0, ok: false, reply: 'Priscus nu o pomenește la ospăț. Cel care rămâne serios este chiar Attila.' },
          { t: 'Nimeni: râd toți.', trust: 0, ok: false, reply: 'Toți, mai puțin unul: Attila.' }
        ],
        card: { t: 'Zercon și Ernak', d: 'Bufonul Zercon îi face pe toți să râdă. Attila rămâne serios și se îmblânzește doar privindu-și fiul cel mic, Ernak.' } }
    ] }
  };
  var EPILOG = 'Abia la sfârșitul soliei afli adevărul. La Constantinopol, eunucul Chrysaphius îi promisese aur lui Edeco, omul lui Attila, ca să-l ucidă pe rege, iar Vigilas era intermediarul. Edeco i-a dezvăluit totul lui Attila încă de la început. Tu și Maximin nu știați nimic. Vigilas se întoarce cu 50 de livre de aur, e prins, iar fiul lui e răscumpărat cu încă 50.';

  // ---------------- stare ----------------
  var trust, debate, visited, journal, sceneId, stepIx, picked;
  function feastReady(){ return visited.length >= 3; }

  function start(){
    trust = 40; debate = []; visited = []; journal = [];
    hub();
  }

  function statsHtml(){
    var days = [0, 1, 2, 3].map(function(i){ return '<i class="' + (i < Math.min(visited.length, 4) ? 'used' : '') + '"></i>'; }).join('');
    return '<p class="jg-eyebrow">Ziua ' + Math.min(visited.length + 1, 4) + ' din 4</p><div class="jg-day" aria-hidden="true">' + days + '</div>' +
      '<div class="tab-stat"><div><small>Încrederea curții</small><b>' + trust + '</b></div><div><small>Disputa cu grecul</small><b>' + debate.filter(function(x){ return x; }).length + ' / 3</b></div></div>';
  }
  function journalHtml(){
    return '<p class="jg-eyebrow" style="margin-top:4px">Jurnalul tău</p><ul class="tab-journal">' +
      (journal.length ? journal.map(function(c){ return '<li><b>' + c.t + '</b>' + c.d + '</li>'; }).join('') : '<li class="empty">Încă nimic. Cercetează tabăra.</li>') + '</ul>';
  }

  function intro(){
    root.innerHTML =
      '<div class="jg-panel"><div class="tab-hub"><div class="tab-camp">' + campSvg(null, false) + '</div><div>' +
        '<p class="jg-eyebrow">Anul 449 · după relatarea lui Priscus</p><h2 class="jg-h2">Solia lui Maximin</h2>' +
        '<p class="jg-lead">După zile de drum și râuri trecute cu bărci scobite dintr-un trunchi, solia condusă de Maximin ajunge la tabăra lui Attila, dincolo de Dunăre. Tu ești Priscus.</p>' +
        '<ul class="jg-how"><li><b>Patru zile</b>Trei locuri de cercetat, apoi ospățul de seară.</li><li><b>Încrederea curții</b>Gesturile potrivite o cresc, gafele o scad.</li><li><b>Disputa</b>Un grec îți atacă lumea romană. Răspunde cu argumente, nu cu laude.</li></ul>' +
        '<button class="jg-btn" id="tab-start" type="button">Intră în tabără →</button>' +
      '</div></div></div>';
    document.getElementById('tab-start').addEventListener('click', start);
  }

  function hub(){
    root.innerHTML =
      '<div class="jg-panel"><div class="tab-hub"><div class="tab-camp">' + campSvg(null, true) + '</div>' +
      '<div class="tab-side">' + statsHtml() +
        '<p class="jg-lead" style="font-size:0.95rem">' + (feastReady() ? 'S-a lăsat seara. Ești chemat la ospățul de la palat.' : 'Alege unde mergi azi: apasă pe un loc din tabără.') + '</p>' +
        journalHtml() + '</div></div></div>';
    Array.prototype.forEach.call(root.querySelectorAll('.jg-spot'), function(g){
      if (g.classList.contains('locked')) return;
      var go = function(){ enter(g.getAttribute('data-id')); };
      g.addEventListener('click', go);
      g.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
  }

  function enter(id){ sceneId = id; stepIx = 0; step(); root.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

  function step(){
    var sc = SCENES[sceneId], s = sc.steps[stepIx]; picked = false;
    var bar = s.debate ? '<div class="tab-debate" aria-label="Disputa">' + [0, 1, 2].map(function(i){ return '<i class="' + (debate[i] === true ? 'win' : debate[i] === false ? 'lose' : '') + '"></i>'; }).join('') + '</div>' : '';
    root.innerHTML =
      '<div class="jg-panel"><div class="tab-scene"><div class="tab-vignette' + (sceneId === 'ospat' ? ' paint' : ' tab-camp') + '">' + vignette(sceneId) + '</div><div>' +
        '<p class="jg-eyebrow">' + (sceneId === 'ospat' ? 'Ziua 4 · seara' : 'Ziua ' + (visited.length + 1)) + '</p><h2 class="tab-place">' + sc.title + '</h2>' + bar +
        (s.narr ? '<p class="tab-narr">' + s.narr + '</p>' : '') +
        (s.say ? '<div class="tab-say"><b>' + s.say.who + '</b>„' + s.say.text + '”</div>' : '') +
        (s.ask ? '<p class="jg-eyebrow" style="margin-top:14px">' + s.ask + '</p><div class="jg-choices" id="tab-ch">' + s.opts.map(function(o, i){ return '<button class="jg-choice" type="button" data-i="' + i + '"><i>' + 'ABC'[i] + '</i><span>' + o.t + '</span></button>'; }).join('') + '</div>' : '') +
        '<div id="tab-out" aria-live="polite"></div>' +
      '</div></div></div>';
    if (!s.ask) { done(s, null); return; }
    Array.prototype.forEach.call(root.querySelectorAll('#tab-ch .jg-choice'), function(b){
      b.addEventListener('click', function(){ answer(+b.getAttribute('data-i')); });
    });
  }

  function answer(i){
    if (picked) return; picked = true;
    var s = SCENES[sceneId].steps[stepIx], o = s.opts[i];
    var good = s.debate ? o.score === 2 : (o.ok !== undefined ? o.ok : (o.trust || 0) > 0);
    Array.prototype.forEach.call(root.querySelectorAll('#tab-ch .jg-choice'), function(b, k){
      b.disabled = true;
      var ok = s.debate ? s.opts[k].score === 2 : (s.opts[k].ok !== undefined ? s.opts[k].ok : (s.opts[k].trust || 0) > 0);
      if (k === i) b.classList.add('picked', good ? 'good' : 'bad');
      else if (ok) b.classList.add('good');
    });
    if (s.debate) debate.push(o.score === 2);
    if (o.trust) trust = Math.max(0, Math.min(100, trust + o.trust));
    done(s, o, good);
  }

  function done(s, o, good){
    var sc = SCENES[sceneId], last = stepIx === sc.steps.length - 1;
    if (s.card) journal.push(s.card);
    var head = o ? (good ? 'Bine ales' : 'Nu tocmai') : 'Notat în jurnal';
    var delta = o && o.trust ? ' <span style="font-family:JetBrains Mono,monospace;font-size:0.8rem;color:' + (o.trust > 0 ? '#8fbd82' : '#e0626c') + '">(încredere ' + (o.trust > 0 ? '+' : '') + o.trust + ')</span>' : '';
    document.getElementById('tab-out').innerHTML =
      '<div class="jg-reveal" style="--c:' + (o ? (good ? '#8fbd82' : '#e0626c') : '#e5c158') + '">' +
        '<h3>' + head + delta + '</h3>' + (o ? '<p>' + o.reply + '</p>' : '') +
        (s.after ? '<p><i>' + s.after + '</i></p>' : '') +
        (s.card ? '<p><b>Jurnal:</b> ' + s.card.t + '</p>' : '') +
        '<p class="jg-src">Sursa: Priscus din Panium, relatarea soliei din 449</p>' +
        '<button class="jg-btn jg-next" id="tab-next" type="button">' + (last ? (sceneId === 'ospat' ? 'Sfârșitul soliei →' : 'Înapoi în tabără →') : 'Continuă →') + '</button></div>';
    var nx = document.getElementById('tab-next');
    nx.addEventListener('click', function(){
      if (!last) { stepIx++; step(); return; }
      if (sceneId === 'ospat') { report(); return; }
      visited.push(sceneId); hub();
    });
    nx.focus({ preventScroll: true });
  }

  function report(){
    journal.push({ t: 'Complotul lui Vigilas', d: 'Planul de asasinat pus la cale la Constantinopol fusese dezvăluit lui Attila de Edeco. Solii nu știau nimic.' });
    var wins = debate.filter(function(x){ return x; }).length;
    var score = trust + wins * 12 + journal.length * 2;
    var rank = score >= 110 ? 'Sol desăvârșit' : score >= 85 ? 'Diplomat atent' : score >= 60 ? 'Observator norocos' : 'Sol nepriceput';
    root.innerHTML =
      '<div class="jg-panel"><div class="tab-hub"><div>' +
        '<p class="jg-eyebrow">Sfârșitul soliei</p><p class="imp-verdict">' + rank + '</p>' +
        '<p class="jg-lead">' + EPILOG + '</p>' +
        '<div class="tab-stat"><div><small>Încrederea curții</small><b>' + trust + '</b></div><div><small>Disputa cu grecul</small><b>' + wins + ' / 3</b></div></div>' +
        '<ul class="imp-lessons">' +
          '<li><b>Tot ce ai văzut vine dintr-o singură sursă: Priscus.</b> E un martor ocular excepțional, dar un diplomat bizantin, care scrie pentru cititori romani.</li>' +
          '<li><b>Disputa cu grecul e o lecție de argumentare.</b> Priscus nu răspunde cu laude, ci explică rostul instituțiilor; grecul îi dă dreptate legilor, dar nu conducătorilor.</li>' +
          '<li><b>Simplitatea lui Attila era un mesaj.</b> Lemnul în locul aurului, la o masă plină de argint, arăta cine are puterea și cine o împarte.</li>' +
        '</ul>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="jg-btn" id="tab-again" type="button">Joacă din nou</button><a class="jg-btn ghost" href="#mod-game">Joacă „Imperiul lui Attila” →</a></div>' +
      '</div><div class="tab-side">' + journalHtml() + '</div></div></div>';
    document.getElementById('tab-again').addEventListener('click', start);
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  intro();
})();
