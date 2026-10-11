(function(){
  var root = document.getElementById('imp-root');
  if (!root) return;

  // ---------------- date ----------------
  var METERS = [
    { k: 'aur', label: 'Aur', c: '#e5c158', hint: 'tributul și prada din care Attila își răsplătește războinicii' },
    { k: 'prestigiu', label: 'Renume', c: '#e0626c', hint: 'teama și respectul pe care le inspiră' },
    { k: 'loial', label: 'Loialitate', c: '#8fbd82', hint: 'neamurile supuse: ostrogoți, gepizi, alani…' },
    { k: 'cai', label: 'Cavalerie', c: '#7ab0e8', hint: 'caii au nevoie de pășuni; departe de stepă, cavaleria slăbește' }
  ];
  var START = { aur: 30, prestigiu: 40, loial: 60, cai: 80, stab: 0 };
  var UPKEEP = 8;

  var ROUNDS = [
    { year: 'c. 435', title: 'Tratatul de la Margus', at: [376.9, 431.1], place: 'Margus',
      text: 'Regele Rua a murit. Tu și fratele tău Bleda moșteniți conducerea hunilor. La Margus, pe Dunăre, vă întâlniți cu solii Constantinopolului. Hunii negociază călare, iar romanii, ca să nu pară mai prejos, rămân și ei în șa.',
      choices: [
        { t: 'Ceri dublarea tributului, predarea fugarilor și piețe deschise la Dunăre', fx: { aur: 20, prestigiu: 10, loial: 5 }, real: true },
        { t: 'Ceri doar piețe deschise: comerțul îi leagă pe negustori de tine', fx: { aur: 8, loial: 8, stab: 1 } },
        { t: 'Refuzi negocierea și treci Dunărea după pradă', fx: { aur: 12, prestigiu: 5, cai: -8, loial: 3 } }
      ],
      real: 'Tratatul de la Margus dublează tributul la 700 de livre de aur pe an. Romanii promit să predea fugarii și să nu se alieze cu dușmanii hunilor.',
      src: 'Priscus din Panium, fragmentul despre tratatul de la Margus' },
    { year: '441', title: 'Episcopul din Margus', at: [388, 451.4], place: 'Viminacium · Naissus',
      text: 'Romanii întârzie plata. Mai mult, episcopul din Margus a trecut Dunărea și a jefuit morminte regale hunice. Ceri predarea lui, iar Constantinopolul refuză.',
      choices: [
        { t: 'Treci Dunărea: Viminacium și Margus sunt primele ținte', fx: { aur: 15, prestigiu: 12, loial: 8, cai: -6 }, real: true },
        { t: 'Ceri doar despăgubiri și predarea episcopului', fx: { aur: 5, prestigiu: -6, loial: -4 } },
        { t: 'Îți trimiți călăreții ca mercenari în slujba Romei de Apus', fx: { aur: 10, loial: -3, prestigiu: 2 } }
      ],
      real: 'Hunii atacă. Temându-se că va fi predat, episcopul le deschide chiar el porțile orașului Margus. Cad Viminacium, apoi Naissus; campaniile pustiesc Balcanii.',
      src: 'Priscus din Panium, fragmentul despre episcopul din Margus' },
    { year: 'c. 445', title: 'Doi regi, un singur imperiu', at: [361, 396.6], place: 'Câmpia Panonică',
      text: 'Bleda, fratele tău, conduce o parte din neamuri. Doi regi înseamnă două curți, două rânduri de daruri și două voințe care nu se potrivesc mereu.',
      choices: [
        { t: 'Rămâi singur la conducere', fx: { prestigiu: 12, loial: -8, aur: 5 }, real: true },
        { t: 'Păstrezi domnia comună și împarți darurile', fx: { loial: 10, prestigiu: -6, aur: -6, stab: 1 } },
        { t: 'Împarți puterea cu sfetnici de încredere, ca Onegesius', fx: { loial: 5, prestigiu: 2, stab: 2 } }
      ],
      real: 'Bleda moare în jurul anului 445; cronicarul Prosper Tiro scrie că a fost ucis de Attila. De acum, Attila conduce singur un imperiu ținut laolaltă de loialitatea față de persoana lui.',
      src: 'Prosper Tiro, Epitoma chronicon' },
    { year: '447', title: 'Zidurile au căzut', at: [476.6, 470.3], place: 'Constantinopol',
      text: 'Un cutremur dărâmă o parte din zidurile Constantinopolului. Armata ta coboară prin Balcani spre capitala Răsăritului.',
      choices: [
        { t: 'Asediezi capitala cât zidurile sunt la pământ', fx: { prestigiu: 6, cai: -15, loial: -5 } },
        { t: 'Pustiești provinciile și ceri un tribut uriaș', fx: { aur: 28, prestigiu: 10, loial: 6, cai: -5 }, real: true },
        { t: 'Negociezi fără luptă, ca să-ți păstrezi caii', fx: { aur: 12, cai: 5 } }
      ],
      real: 'Prefectul Constantinus reface zidurile în circa două luni. Attila nu asediază capitala, dar prin Pacea lui Anatolius primește 6.000 de livre de aur restanțe, un tribut de 2.100 de livre pe an și o fâșie pustie la sud de Dunăre.',
      src: 'Priscus din Panium, fragmentul despre Pacea lui Anatolius; inscripțiile de pe zidurile Theodosiene' },
    { year: '449', title: 'Complotul', at: [366.2, 402.3], place: 'Curtea lui Attila',
      text: 'O solie romană sosește la curte, cu interpretul Vigilas. Edeco, unul dintre oamenii tăi, îți dezvăluie că la Constantinopol i s-a promis aur ca să te ucidă.',
      choices: [
        { t: 'Aștepți ca Vigilas să aducă aurul mitei și îl prinzi asupra faptei', fx: { prestigiu: 15, aur: 5 }, real: true },
        { t: 'Ordoni executarea solilor', fx: { prestigiu: 4, loial: 3, aur: -12 } },
        { t: 'Taci, ca să nu pierzi tributul', fx: { prestigiu: -12, loial: -5 } }
      ],
      real: 'Vigilas se întoarce cu 50 de livre de aur și e prins. Își scapă fiul plătind încă 50 de livre, iar Attila trimite soli la Constantinopol să-i reproșeze împăratului complotul.',
      src: 'Priscus din Panium, relatarea soliei din 449' },
    { year: '450', title: 'Inelul Honoriei', at: [276, 444.6], place: 'Ravenna',
      text: 'Noul împărat al Răsăritului, Marcian, refuză să mai plătească tributul. În Apus, Honoria, sora împăratului Valentinian al III-lea, îți trimite un inel și îți cere ajutorul.',
      choices: [
        { t: 'Spre Apus: ceri mâna Honoriei și jumătate din Imperiul de Apus ca zestre', fx: { prestigiu: 10, aur: 8, cai: -12, loial: 5 }, real: true },
        { t: 'Spre Răsărit: îl forțezi pe Marcian să plătească', fx: { aur: 5, cai: -8, prestigiu: -2 } },
        { t: 'Aștepți și refaci caii și rezervele', fx: { cai: 10, aur: -10, loial: -10, stab: 1 } }
      ],
      real: 'Attila alege Apusul. În 451 trece Rinul cu o armată în care luptă ostrogoți, gepizi și alte neamuri supuse. Departe de stepă, caii găsesc greu pășune.',
      src: 'Priscus din Panium, fragmentul despre Honoria; Iordanes, Getica' },
    { year: '451', title: 'Câmpiile Catalaunice', at: [192.4, 371.1], place: 'Câmpiile Catalaunice',
      text: 'Generalul Aetius a strâns o coaliție: romani, vizigoți, franci, burgunzi, alani. Bătălia începe după-amiaza târziu și ține până noaptea.',
      choices: [
        { t: 'Lupți până la capăt, pe câmp deschis', fx: { cai: -18, loial: -10, prestigiu: -4 } },
        { t: 'Te retragi în cercul de căruțe și aștepți', fx: { cai: -10, prestigiu: -8, loial: -4 }, real: true },
        { t: 'Eviți bătălia și pleci cu prada', fx: { prestigiu: -14, aur: 8, cai: -4 } }
      ],
      real: 'Iordanes scrie că Attila, închis în tabăra de căruțe, pregătise un rug din șei, ca să nu cadă viu în mâinile dușmanilor. Coaliția nu atacă tabăra, iar hunii se retrag peste Rin.',
      src: 'Iordanes, Getica' },
    { year: '452', title: 'Italia', at: [288.4, 422.8], place: 'Aquileia',
      text: 'Treci Alpii. Aquileia cade după un asediu lung. Dar în armată bântuie foametea și boala, iar Marcian trimite trupe peste Dunăre, în ținuturile tale.',
      choices: [
        { t: 'Mergi spre Roma', fx: { prestigiu: 8, cai: -18, loial: -8 } },
        { t: 'Primești solia papei Leon și te retragi cu prada', fx: { aur: 12, prestigiu: 3, cai: -4 }, real: true },
        { t: 'Te întorci imediat să-ți aperi casa', fx: { loial: 5, prestigiu: -6, stab: 1 } }
      ],
      real: 'Attila se retrage. Tradiția pune retragerea pe seama papei Leon; cronicarul Hydatius vorbește despre foamete, boală și atacul trupelor lui Marcian.',
      src: 'Prosper Tiro, Epitoma chronicon; Hydatius, Chronicon' }
  ];
  var LESSONS = [
    '<b>Aurul tributului ținea imperiul în viață.</b> Din el primeau căpeteniile daruri. Când Marcian a oprit plata, Attila a trebuit să caute aur tot mai departe.',
    '<b>Loialitatea era față de Attila, nu față de un stat.</b> La moartea lui, neamurile supuse s-au răsculat: la Nedao (c. 454), gepizii lui Ardaric i-au învins pe fiii lui Attila.',
    '<b>Departe de stepă, cavaleria își pierdea avantajul.</b> Caii aveau nevoie de pășuni întinse; în Galia și Italia, armata depindea tot mai mult de infanteria popoarelor supuse (teza lui R. P. Lindner).'
  ];

  // ---------------- stare ----------------
  var st, hist, round, trail;
  function clamp(v){ return Math.max(0, Math.min(100, v)); }
  function apply(state, fx){ Object.keys(fx).forEach(function(k){ state[k] = clamp(state[k] + fx[k]); }); }
  function upkeep(state){
    var notes = [];
    state.aur = clamp(state.aur - UPKEEP);
    if (state.aur < 15) { state.loial = clamp(state.loial - 10); notes.push('Aurul nu ajunge pentru darurile căpeteniilor: loialitatea scade.'); }
    return notes;
  }
  function historicPath(){
    var h = Object.assign({}, START);
    ROUNDS.forEach(function(r){ var c = r.choices.filter(function(x){ return x.real; })[0]; apply(h, c.fx); upkeep(h); });
    return h;
  }

  // ---------------- interfață ----------------
  function metersHtml(){
    return '<div class="jg-meters" id="imp-meters">' + METERS.map(function(m){
      return '<div class="jg-meter" id="imp-m-' + m.k + '" style="--c:' + m.c + '" title="' + m.label + ': ' + m.hint + '"><label>' + m.label + ' <b>' + st[m.k] + '</b></label><div class="jg-bar"><i style="width:' + st[m.k] + '%"></i></div><span class="jg-delta"></span></div>';
    }).join('') + '</div>';
  }
  function updateMeters(fx){
    METERS.forEach(function(m){
      var el = document.getElementById('imp-m-' + m.k);
      if (!el) return;
      el.querySelector('b').textContent = st[m.k];
      el.querySelector('.jg-bar i').style.width = st[m.k] + '%';
      el.classList.toggle('low', st[m.k] < 20);
      var d = fx && fx[m.k], dl = el.querySelector('.jg-delta');
      if (d) { dl.textContent = (d > 0 ? '+' : '') + d; dl.className = 'jg-delta show ' + (d > 0 ? 'up' : 'down'); void dl.offsetWidth; }
    });
  }

  function mapSvg(){
    var pins = trail.map(function(r, i){
      var now = i === trail.length - 1;
      return '<g class="imp-pin' + (now ? ' now' : '') + '">' + (now ? '<circle class="ring" cx="' + r.at[0] + '" cy="' + r.at[1] + '" r="4"/>' : '') +
        '<circle class="dot" cx="' + r.at[0] + '" cy="' + r.at[1] + '" r="2.8"/>' +
        (now ? '<text x="' + (r.at[0] + 7) + '" y="' + (r.at[1] - 6) + '">' + r.place + '</text>' : '') + '</g>';
    }).join('');
    var line = trail.length > 1 ? '<polyline class="imp-trail" points="' + trail.map(function(r){ return r.at.join(','); }).join(' ') + '"/>' : '';
    return '<svg viewBox="150 290 470 200" role="img" aria-label="Harta Europei cu locul evenimentului din această rundă și traseul campaniilor de până acum">' +
      '<use href="#shared-img-0"/><rect x="150" y="290" width="470" height="200" fill="rgba(14,14,16,0.25)"/>' +
      '<path class="imp-realm" d="M315.7,373 C322.7,361 348.9,357.7 368.2,350.7 C387.5,343.8 409.2,336.4 431.6,331.3 C453.9,326.1 479.9,323 502.2,319.7 C524.4,316.3 549.8,308.4 565,311.2 C580.3,314.1 598.1,326.1 593.6,336.7 C589.2,347.2 558.7,363.8 538.2,374.3 C517.8,384.8 492.6,390.8 470.9,399.7 C449.3,408.5 426.2,421.5 408.3,427.3 C390.4,433.1 377.4,435.3 363.8,434.6 C350.1,433.8 334.5,433.1 326.5,422.9 C318.5,412.6 308.8,385.1 315.7,373 Z"/>' +
      '<text class="imp-realm-label" x="470" y="352">STĂPÂNIREA HUNILOR (APROX.)</text>' +
      line + pins + '</svg><span class="credit">Hartă: Alexrk2, Wikimedia Commons, CC BY-SA 3.0</span>';
  }

  function intro(){
    root.innerHTML =
      '<div class="jg-panel">' +
        '<p class="jg-eyebrow">Cum se joacă</p><h2 class="jg-h2">Opt momente, opt decizii</h2>' +
        '<p class="jg-lead">Ești Attila. Între 435 și 452 vei trece prin opt momente reale din istoria hunilor. La fiecare alegi una din trei decizii, apoi afli ce s-a întâmplat în realitate și din ce izvor știm.</p>' +
        '<ul class="jg-how">' + METERS.map(function(m){ return '<li><b style="color:' + m.c + '">' + m.label + '</b>' + m.hint.charAt(0).toUpperCase() + m.hint.slice(1) + (/[.…]$/.test(m.hint) ? '' : '.') + '</li>'; }).join('') + '</ul>' +
        '<p class="jg-lead">După fiecare rundă, războinicii trebuie răsplătiți: aurul scade. Dacă loialitatea neamurilor supuse se prăbușește, se răscoală înainte de final. Și gândește-te din timp: ce rămâne din imperiu după tine?</p>' +
        '<button class="jg-btn" id="imp-start" type="button">Începe domnia →</button>' +
      '</div>';
    document.getElementById('imp-start').addEventListener('click', start);
  }

  function start(){
    st = Object.assign({}, START); round = 0; trail = [];
    hist = historicPath();
    show();
  }

  function fxHtml(fx){
    return '<div class="imp-fx">' + METERS.filter(function(m){ return fx[m.k]; }).map(function(m){
      var v = fx[m.k]; return '<span class="' + (v > 0 ? 'up' : 'down') + '">' + m.label + ' ' + (v > 0 ? '+' : '') + v + '</span>';
    }).join('') + '</div>';
  }

  function show(){
    var r = ROUNDS[round];
    trail.push(r);
    var steps = ROUNDS.map(function(x, i){ return '<i class="' + (i < round ? 'done' : i === round ? 'now' : '') + '"></i>'; }).join('');
    root.innerHTML = metersHtml() +
      '<div class="jg-panel"><div class="imp-steps" aria-hidden="true">' + steps + '</div>' +
      '<div class="imp-round"><div class="imp-map">' + mapSvg() + '</div><div>' +
        '<span class="imp-year">' + r.year + ' · runda ' + (round + 1) + ' din ' + ROUNDS.length + '</span>' +
        '<h2 class="imp-title">' + r.title + '</h2><p class="imp-text">' + r.text + '</p>' +
        '<div class="jg-choices" id="imp-ch">' + r.choices.map(function(c, i){ return '<button class="jg-choice" type="button" data-i="' + i + '"><i>' + 'ABC'[i] + '</i><span>' + c.t + '</span></button>'; }).join('') + '</div>' +
        '<div id="imp-out" aria-live="polite"></div>' +
      '</div></div></div>';
    updateMeters();
    Array.prototype.forEach.call(root.querySelectorAll('#imp-ch .jg-choice'), function(b){
      b.addEventListener('click', function(){ choose(+b.getAttribute('data-i')); });
    });
  }

  function choose(i){
    var r = ROUNDS[round], c = r.choices[i];
    Array.prototype.forEach.call(root.querySelectorAll('#imp-ch .jg-choice'), function(b, k){
      b.disabled = true;
      if (k === i) b.classList.add('picked');
      if (r.choices[k].real) b.classList.add('good');
    });
    var before = Object.assign({}, st);
    apply(st, c.fx);
    var notes = upkeep(st);
    var total = {};
    METERS.forEach(function(m){ var d = st[m.k] - before[m.k]; if (d) total[m.k] = d; });
    updateMeters(total);
    var last = round === ROUNDS.length - 1, revolt = st.loial <= 10;
    document.getElementById('imp-out').innerHTML =
      '<div class="jg-reveal" style="--c:' + (c.real ? '#8fbd82' : '#e5c158') + '">' +
        '<h3>' + (c.real ? 'Ai ales ce a ales și Attila' : 'Ce s-a întâmplat în realitate') + '</h3>' +
        fxHtml(total) +
        (notes.length ? '<p><i>' + notes.join(' ') + '</i></p>' : '<p><i>Războinicii au primit darurile lor: aur −' + UPKEEP + '.</i></p>') +
        '<p>' + r.real + '</p><p class="jg-src">Sursa: ' + r.src + '</p>' +
        '<button class="jg-btn jg-next" id="imp-next" type="button">' + (revolt ? 'Neamurile se răscoală →' : last ? 'Anul 453 →' : 'Runda următoare →') + '</button>' +
      '</div>';
    var nx = document.getElementById('imp-next');
    nx.addEventListener('click', function(){ if (revolt) end(true); else if (last) end(false); else { round++; show(); root.scrollIntoView({ behavior: 'smooth', block: 'start' }); } });
    nx.focus({ preventScroll: true });
  }

  // Puterea măsurată de indicatori nu ajunge: imperiul supraviețuiește morții lui Attila
  // doar dacă a fost construit ceva dincolo de persoana lui (stab = putere împărțită, legături).
  function verdict(){
    var score = st.loial * 0.4 + st.aur * 0.3 + st.prestigiu * 0.2 + st.cai * 0.1;
    if (st.stab >= 2 && st.loial >= 50 && st.aur >= 20) return ['Imperiul tău îți supraviețuiește (scenariu ipotetic)', 'Ai împărțit puterea și ai legat neamurile prin altceva decât prin persoana ta. Așa, moartea ta nu mai înseamnă sfârșitul. Attila nu a făcut acest lucru.'];
    if (score >= 50) return ['Un imperiu puternic, care se destramă la moartea ta', 'Ai lăsat aur, renume și neamuri loiale, ca Attila. Dar loialitatea era față de tine, nu față de un stat: fiii tăi își împart neamurile, iar acestea se răscoală. Exact asta s-a întâmplat după 453.'];
    return ['Imperiul se prăbușește chiar după moartea ta', 'Aurul s-a terminat, caii sunt sleiți, iar neamurile supuse nu mai au motive să-ți urmeze fiii.'];
  }

  function end(revolt){
    var v = revolt ? ['Neamurile supuse s-au răsculat', 'Fără aur și fără loialitate, imperiul s-a destrămat încă din timpul domniei tale. În realitate, asta s-a întâmplat abia după moartea lui Attila, la Nedao.'] : verdict();
    var rows = METERS.map(function(m){
      return '<div class="imp-cmp"><b>' + m.label + '</b><div class="bars">' +
        '<div class="you"><s><i style="width:' + st[m.k] + '%"></i></s>' + st[m.k] + '</div>' +
        '<div class="hist"><s><i style="width:' + hist[m.k] + '%"></i></s>' + hist[m.k] + '</div></div></div>';
    }).join('');
    root.innerHTML = metersHtml() +
      '<div class="jg-panel">' +
        '<p class="jg-eyebrow">' + (revolt ? 'Sfârșit înainte de vreme' : '453 · Attila moare în noaptea nunții cu Ildico') + '</p>' +
        '<p class="imp-verdict">' + v[0] + '</p><p class="jg-lead">' + v[1] + '</p>' +
        '<p class="jg-lead"><b>Ai construit ceva care să-ți supraviețuiască?</b> ' + (st.stab >= 2 ? 'Da: ai împărțit puterea sau ai creat legături care nu depind doar de tine.' : st.stab === 1 ? 'Doar puțin: o singură decizie a mers în această direcție.' : 'Nu: totul a depins de tine, ca la Attila.') + '</p>' +
        '<div class="imp-legend"><span><i style="background:#e5c158"></i>Drumul tău</span><span><i style="background:rgba(230,215,195,0.45)"></i>Drumul lui Attila, după izvoare</span></div>' +
        '<div class="imp-compare">' + rows + '</div>' +
        '<h3 class="jg-h2" style="font-size:1.1rem">De ce s-a prăbușit, de fapt, imperiul hunilor?</h3>' +
        '<ul class="imp-lessons">' + LESSONS.map(function(l){ return '<li>' + l + '</li>'; }).join('') + '</ul>' +
        '<p class="jg-src">Surse: Priscus din Panium; Iordanes, Getica; Prosper Tiro; Hydatius. Valorile indicatorilor sunt ilustrative: jocul compară decizii, nu măsoară trecutul.</p>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px"><button class="jg-btn" id="imp-again" type="button">Joacă din nou</button><a class="jg-btn ghost" href="#mod-embassy">Mergi în tabăra lui Attila →</a></div>' +
      '</div>';
    updateMeters();
    document.getElementById('imp-again').addEventListener('click', start);
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  intro();
})();
