

(function(){
  'use strict';

  // ============================================================
  // DATE (conținut static: nu e "mock", e conținutul real al paginii)
  // ============================================================

  /**
   * @typedef {Object} MythFact
   * @property {string} myth
   * @property {string} truth
   */
  /** @type {MythFact[]} */
  var MYTHS = [
    {
      myth: 'Hunii erau un popor unitar, de origine exclusiv est-asiatică, sosit dintr-o singură migrație.',
      truth: 'Analizele de ADN antic pe schelete din perioada hunică a Bazinului Carpatic (Neparáczki et al. 2019; Maróti et al. 2022) arată o eterogenitate genetică mare: amestec de ascendență est-asiatică și europeană/locală, nu un popor genetic omogen.',
      src: 'Neparáczki et al. 2019; Maróti et al. 2022 (nota 6)'
    },
    {
      myth: 'Ammianus Marcellinus descrie hunii ca fiind aproape non-umani la înfățișare, o relatare obiectivă a unui popor „monstruos”.',
      truth: 'Istoricii moderni citesc pasajul lui Ammianus ca retorică etnografică romană, un topos literar folosit pentru a marca „barbaria”, nu o descriere antropologică fidelă. Nu există dovezi osteologice care să confirme trăsăturile exagerate descrise.',
      src: 'Ammianus Marcellinus, Res Gestae 31.2 (nota 8)'
    },
    {
      myth: 'Craniile deformate artificial găsite în morminte din epocă dovedesc, prin ele însele, apartenența etnică hunică.',
      truth: 'Deformarea craniană intenționată (prin bandaje aplicate în copilărie) era practicată de mai multe populații ale stepei și Europei Centrale din acea vreme, inclusiv de unii germanici; e un marker cultural, transmis și împrumutat, nu un indicator etnic exclusiv. Un exemplu chiar din România: femeia înmormântată cu diadema de la Gherăseni (Buzău, sec. V) avea craniul puternic deformat, dar originea ei etnică rămâne deschisă.',
      src: 'nota 23 (Gherăseni); Knipper et al. 2020 (Mözs)'
    },
    {
      myth: 'Legătura dintre huni și Xiongnu din China antică e doar o coincidență de nume, fără nicio bază reală.',
      truth: 'Maróti et al. (2022) și Neparáczki et al. (2019) arată că nucleul de imigranți al hunilor avea ascendență est-asiatică ce poate fi urmărită până în spațiul Xiongnu, deci nu e doar o coincidență de nume. Ce rămâne nedovedit este continuitatea directă a elitei conducătoare și o migrație compactă spre vest. Legătură de populație: probabilă. Descendență dinastică: nedemonstrată.',
      src: 'Maróti et al. 2022; Neparáczki et al. 2019 (nota 6)'
    },
    {
      myth: 'Sosirea hunilor a însemnat o înlocuire totală a populației din Bazinul Carpatic.',
      truth: 'Multe eșantioane genetice din perioada hunică arată ascendență predominant locală/europeană. Datele sugerează o elită conducătoare relativ redusă numeric, care domina politic populații majoritar autohtone, nu o înlocuire demografică completă.',
      src: 'Maróti et al. 2022 (nota 6)'
    },
    {
      myth: 'Hunii foloseau un singur tip de sabie, simplă și fără valoare simbolică.',
      truth: 'Mormintele princiare, ca cel de la Jakuszowice, păstrează săbii lungi cu mânerul placat cu aur și granate, adevărate însemne de rang. Iar Iordanes (Getica, 183, după Priscus) povestește că Attila își sprijinea autoritatea pe „sabia lui Marte”, găsită de un păstor: sabia era și simbol al puterii, nu doar armă.',
      src: 'Iordanes, Getica 183; Godłowski 1991 (Jakuszowice)',
      fact: 'Știai că sabia era și un semn al puterii?', num: '„Sabia lui Marte”', lead: 'găsită de un păstor, îi arăta lui Attila dreptul de a domni'
    },
    {
      myth: 'Sursele romane vorbesc doar despre războinici; femeile hunice nu apar în istorie.',
      truth: 'Priscus din Panium o descrie pe Kreka (Hereca), soția principală a lui Attila, în propria ei casă, înconjurată de slujnice, primind darurile soliei romane; tot el povestește cum văduva lui Bleda, stăpâna unui sat, a găzduit și ospătat solia. Femeile din elita hunică aveau un rol social și chiar diplomatic vizibil.',
      src: 'Priscus, fr. 8, partea 10 (Müller), nota 11'
    },
    {
      myth: 'Se cunoaște exact locul unde a fost înmormântat Attila.',
      truth: 'Iordanes (Getica, 256–258) povestește că Attila a fost îngropat noaptea, într-un sicriu triplu (aur, argint și fier), iar cei care au săpat mormântul au fost uciși, ca locul să rămână secret. Mormântul nu a fost identificat nici azi. Povestea cu râul deviat, atribuită adesea lui Attila, e de fapt a înmormântării lui Alaric (Getica, 158).',
      src: 'Iordanes, Getica 158 și 256–258'
    },
    {
      myth: 'Attila s-a oprit înaintea Romei, în 452, exclusiv din respect pentru intervenția Papei Leon I.',
      truth: 'Întâlnirea cu Leon I a contat, dar izvoarele pomenesc și cauze materiale: cronicarul Hydatius scrie despre foamete și boală în armata hunică din nordul Italiei, iar împăratul Marcian atacase între timp ținuturile hunilor. Toate acestea, alături de diplomația papală, au grăbit retragerea lui Attila.',
      src: 'Prosper Tiro și Hydatius, anul 452'
    },
    {
      myth: 'Ce tip de vârf de săgeată descrie Ammianus?',
      truth: 'Ammianus Marcellinus descrie săgeți cu vârfuri ascuțite din os, folosite la lupta de la distanță.',
      src: 'Ammianus Marcellinus, Res Gestae 31.2.9 (nota 8)',
      fact: 'Știai că hunii foloseau și vârfuri de săgeți din os?', num: 'Săgeți cu vârf de os', lead: 'vârfurile descrise de Ammianus'
    },
    {
      myth: 'Aurul cerut de huni era doar tribut de stat, plătit exclusiv între Attila și împărat.',
      truth: 'Priscus povestește că Onegesius a eliberat-o pe soția lui Syllus pentru 500 de monede de aur. Copiii ei au fost trimiși împăratului roman ca dar.',
      src: 'Priscus, fr. 8, partea 10 (Müller), nota 11',
      fact: 'Știai că soția lui Syllus a fost eliberată pentru 500 de monede de aur?', num: '500 de solizi', lead: 'răscumpărarea soției lui Syllus'
    },
    {
      myth: 'Aurul de tribut rămânea la Attila și la curtea sa restrânsă; restul hunilor nu vedeau nimic din el.',
      truth: 'Descoperirile arheologice arată o circulație mai largă a aurului în societatea hunică: tezaurul de la Szikáncs, lângă Tisa, cuprinde 1.439 de solizi, dintre care 1.405 ai lui Teodosie al II-lea. Asta înseamnă aproape exact 20 de livre romane (72 de solizi la livră), probabil o plată rotundă ajunsă din tribut în mâinile unui membru al elitei, nu în vistieria lui Attila.',
      src: 'Bíró-Sey 1976 (tezaurul de la Szikáncs)',
      fact: 'Știai că aurul tributului ajungea și la alți huni, nu doar la Attila?', num: '1.439 de solizi', lead: 'într-un singur tezaur, la Szikáncs, lângă Tisa: aur ajuns și la alți huni, nu doar la Attila'
    },
    {
      myth: 'Hunii purtau mereu armuri grele, ca orice cavalerie „serioasă” a Antichității târzii.',
      truth: 'Izvoarele îi descriu mai ales ca arcași călare, care atacau de la distanță, iar în mormintele hunice s-au găsit puține piese de armură. Zalele și coifurile apar totuși la elite, adesea luate de la romani. Cât de des purtau hunii armură e încă discutat de istorici.',
      src: 'Maenchen-Helfen 1973, capitolul despre război',
      fact: 'Știai că armura hunilor e încă o întrebare deschisă?', num: 'Puține armuri', lead: 's-au găsit în mormintele hunice; cât de des le purtau e încă discutat'
    },
    {
      myth: 'Descrierile antice ale hunilor călare sunt doar o figură de stil fără substanță.',
      truth: 'Ammianus și Zosimus scriu că hunii luptau, se sfătuiau, mâncau și chiar dormeau pe cal. Sidonius Apollinaris îi descrie ca și cum omul și calul ar fi crescut împreună. Exagerarea literară există, dar arată cât de străină le părea romanilor această viață călare.',
      src: 'Ammianus 31.2.6 (nota 8); Zosimus 4.20; Sidonius Apollinaris, Carmina 2',
      fact: 'Știai că romanii credeau că hunii trăiesc călare?', num: 'Zi și noapte călare', lead: 'luptau, se sfătuiau, mâncau și dormeau pe cal, scriu Ammianus și Zosimus'
    },
    {
      myth: 'Controlul aurului în Imperiul Roman era descentralizat, oricine putea bate sau distribui monedă de aur.',
      truth: 'Aurul era prin excelență bunul împăratului. Solidul, introdus de Constantin cel Mare, avea greutate fixă (1/72 dintr-o livră), iar Valentinian I și Valens au impus, după 366, ca aurul strâns din taxe să fie topit în lingouri de puritate garantată, sub controlul lui comes sacrarum largitionum. Tributul cerut de Attila lovea deci direct autoritatea și prestigiul imperial, nu doar vistieria.',
      src: 'Codex Theodosianus 12.6.12–13',
      fact: 'Știai că aurul Imperiului era controlat de împărat?', num: '1/72 de livră', lead: 'greutatea fixă a solidului, moneda de aur controlată de împărat'
    }
  ];

  // ============================================================

  // ============================================================
  // MODULE 2: Mit vs. Adevăr: randare DOM
  // ============================================================

  // Theme of each myth, in the order of MYTHS.
  var MYTH_THEMES = ['gen', 'izv', 'arh', 'ori', 'gen', 'arm', 'izv', 'att', 'att', 'arm', 'aur', 'aur', 'arm', 'izv', 'aur'];
  var THEME = {
    gen: { label: 'Genetică', icon: '<path d="M7 3c0 6 10 6 10 12s-10 6-10 6M17 3c0 6-10 6-10 12M8 7h8M8 17h8"/>' },
    izv: { label: 'Izvoare', icon: '<path d="M6 3h9l3 3v15H6zM9 9h6M9 13h6M9 17h4"/>' },
    arh: { label: 'Arheologie', icon: '<path d="M4 20h16M7 20l2-9h6l2 9M12 4v7M9 7h6"/>' },
    ori: { label: 'Origini', icon: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16"/>' },
    arm: { label: 'Arme', icon: '<path d="M5 19C5 10 10 5 19 5M5 19l14-14M15 5h4v4M3 21l3-3"/>' },
    att: { label: 'Attila', icon: '<path d="M4 17l2-9 4 4 2-7 2 7 4-4 2 9zM4 20h16"/>' },
    aur: { label: 'Aur & tribut', icon: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/>' }
  };
  var mythTurned = 0;

  function svgIcon(d){ return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'; }

  // mx: miturile, puse în capitolele de care țin; faptele puțin cunoscute apar ca „Știai că…?”
  // Mitul e un card cu două fețe: în stânga afirmația, în dreapta ce arată sursele.
  var MX_X = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  // „dovada” din dreapta cardului: o imagine din site, dacă se potrivește; altfel, sigiliul temei
  var MX_PIC = { 1: ['#img-ms-ammianus', 'Res Gestae, copie din sec. IX'], 2: ['#img-craniu', 'Craniu deformat, sec. V'], 7: ['#img-moartea', 'Moartea lui Attila, Paczka, 1884'], 8: ['#img-aquileia', 'Asediul Aquileiei, c. 1360'] };
  function mxEvidence(i, th, nr){
    var p = MX_PIC[i], el = p && document.querySelector(p[0]), src = el && el.getAttribute('src');
    if (src) return '<figure class="mx-ev" aria-hidden="true"><img src="' + src + '" alt="" loading="lazy"><figcaption>' + p[1] + '</figcaption></figure>';
    return '<span class="mx-ev mx-seal" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' + th.icon + '</svg><small>Dosar ' + nr + '</small></span>';
  }
  function mxSrc(m){
    if (!m.src) return '';
    return '<p class="mx-src">Sursa: ' + m.src.replace(/nota (\d+)/g, '<a class="mx-note" href="#note-$1">nota $1</a>') + '</p>';
  }
  var mxFile = 0, mxGroup = 0;
  function renderMythGroup(host){
    var all = host.getAttribute('data-myths').split(',').map(Number), done = 0;
    var ids = all.filter(function(i){ return !MYTHS[i].fact; }), facts = all.filter(function(i){ return MYTHS[i].fact; });
    var head = document.createElement('div');
    head.className = 'mx-head';
    head.innerHTML = '<h3 class="mx-title">' + host.getAttribute('data-title') + '</h3>' +
      (ids.length > 1 ? '<p class="mx-count"><b>0</b> din ' + ids.length + ' verificate</p>' +
      '<button type="button" class="mx-all">Verifică toate</button>' : '<p class="mx-count" hidden><b>0</b></p><button type="button" class="mx-all" hidden></button>');
    host.appendChild(head);
    // toate grupurile de mituri au același format: rânduri deschise (teancul de dosare închise nu se mai folosește)
    if (++mxGroup < 0) {
      var nf = all.length - ids.length;
      host.classList.add('mx-closed');
      var tz = document.createElement('div');
      tz.className = 'mx-teaser';
      tz.innerHTML = '<p class="mx-teaser-q">„' + MYTHS[ids[0]].myth.replace(/[.]$/, '') + '”</p>' +
        '<button type="button" class="mx-open">Deschide dosarul: ' + ids.length + (ids.length === 1 ? ' mit' : ' mituri') + (nf ? ' și ' + nf + (nf === 1 ? ' curiozitate' : ' curiozități') : '') + ' →</button>';
      tz.querySelector('.mx-open').addEventListener('click', function(){
        host.classList.remove('mx-closed');
        var b = host.querySelector('.mx-item .mx-btn'); if (b) b.focus({ preventScroll: true });
      });
      host.appendChild(tz);
    }
    var countEl = head.querySelector('b'), allBtn = head.querySelector('.mx-all');
    var items = ids.map(function(i){
      var m = MYTHS[i], th = THEME[MYTH_THEMES[i]] || THEME.izv, id = 'mx-a-' + i;
      var it = document.createElement('article');
      // dosarele sunt numerotate în ordinea citirii, de-a lungul întregului articol
      var k = ++mxFile, nr = (k < 10 ? '0' : '') + k;
      it.className = 'mx-item';
      it.setAttribute('data-file', 'Dosar nr. ' + nr);
      it.innerHTML =
        '<div class="mx-q"><p class="mx-meta"><span class="mx-tag">Mit</span><span class="mx-theme">' + th.label + '</span></p>' +
        '<p class="mx-myth">' + m.myth + '</p><span class="mx-stamp" aria-hidden="true">Fals</span></div>' + mxEvidence(i, th, nr) +
        '<button type="button" class="mx-btn" aria-expanded="false" aria-controls="' + id + '">Verifică →</button>' +
        '<div class="mx-a" id="' + id + '" role="region" aria-label="Ce arată sursele"><p class="mx-meta"><span class="mx-theme">Ce arată sursele</span></p>' +
        '<p class="mx-truth">' + m.truth + '</p>' + mxSrc(m) + '</div>' +
        '<button type="button" class="mx-x" aria-label="Ascunde răspunsul">' + MX_X + '</button>';
      var btn = it.querySelector('.mx-btn'), x = it.querySelector('.mx-x'), seen = false;
      it._set = function(on, focus){
        it.classList.toggle('open', on);
        btn.setAttribute('aria-expanded', on ? 'true' : 'false');
        if (focus) (on ? x : btn).focus();
        if (on && !seen) { seen = true; done++; countEl.textContent = done; head.classList.toggle('all', done === ids.length); }
      };
      btn.addEventListener('click', function(){ it._set(true, true); });
      x.addEventListener('click', function(){ it._set(false, true); });
      host.appendChild(it);
      return it;
    });
    if (facts.length) {
      var box = document.createElement('div');
      box.className = 'mx-facts';
      box.innerHTML = facts.map(function(i){
        var m = MYTHS[i], th = THEME[MYTH_THEMES[i]] || THEME.izv, id = 'mx-f-' + i;
        return '<article class="mx-fact"><p class="mx-meta"><span class="mx-tag stiai">Știai că…?</span><span class="mx-theme">' + th.label + '</span></p>' +
          '<p class="mx-num">' + m.num.replace(/^[\d.,\/]+/, '<b>$&</b>') + '</p><p class="mx-lead">' + m.lead + '</p>' +
          '<div class="mx-more-body" id="' + id + '"><div><p class="mx-truth">' + m.truth + '</p></div></div>' +
          '<button type="button" class="mx-more" aria-expanded="false" aria-controls="' + id + '">Citește mai mult</button>' + mxSrc(m) + '</article>';
      }).join('');
      box.addEventListener('click', function(ev){
        var b = ev.target.closest('.mx-more');
        if (!b) return;
        var on = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', on ? 'true' : 'false');
        b.textContent = on ? 'Citește mai puțin' : 'Citește mai mult';
        b.closest('.mx-fact').classList.toggle('open', on);
      });
      host.appendChild(box);
    }
    allBtn.addEventListener('click', function(){
      var any = items.some(function(x){ return !x.classList.contains('open'); });
      items.forEach(function(x, k){ setTimeout(function(){ x._set(any, false); }, any ? k * 90 : 0); });
      allBtn.textContent = any ? 'Ascunde toate' : 'Verifică toate';
    });
  }

  function initMythModule(){
    Array.prototype.forEach.call(document.querySelectorAll('.mx[data-myths]'), renderMythGroup);
    // „nota N” din surse: derulează la notă și o luminează scurt, fără să schimbe pagina
    document.addEventListener('click', function(ev){
      var a = ev.target.closest('.mx-note');
      if (!a) return;
      var li = document.querySelector(a.getAttribute('href'));
      if (!li) return;
      ev.preventDefault();
      li.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
      li.classList.remove('mx-flash'); void li.offsetWidth; li.classList.add('mx-flash');
    });
  }

  // ============================================================
  // Pornire
  // ============================================================

  initMythModule();
})();

