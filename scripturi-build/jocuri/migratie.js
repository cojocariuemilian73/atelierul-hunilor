(function(){
  'use strict';
  var root = document.getElementById('mig-root');
  if (!root) return;

  // =====================================================================
  // 1. Geografie: aceeași proiecție ca hărțile site-ului (Lambert azimutală
  //    echivalentă, centrată pe 52°N 10°E), în unitățile hărții (1 unitate ≈ 7 km).
  // =====================================================================
  var KM = 7.0;
  function proj(lat, lon){
    var r = Math.PI / 180, p = lat * r, l = (lon - 10) * r, p0 = 52 * r;
    var k = Math.pow((1 + Math.sin(p) * Math.sin(p0) + Math.cos(p) * Math.cos(p0) * Math.cos(l)) * 0.5, -0.5);
    var x = 131.579 * (Math.cos(p) * Math.sin(l)) * k + 36.388;
    var y = 55.11 - 153.610 * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l)) * k;
    var S = 690 / 1580;
    return [x / 100 * 1580 * S, y / 100 * 1351 * S];
  }
  var VB = { x: 20, y: 300, w: 600, h: 290 };   // fereastra hărții (unități)
  var SC = 2, CW = VB.w * SC, CH = VB.h * SC;   // canvas intern 1200 × 580
  var G = 2, GW = VB.w / G, GH = VB.h / G;      // grilă de 300 × 145 celule (≈ 14 km)
  function toCell(x, y){ var gx = Math.floor((x - VB.x) / G), gy = Math.floor((y - VB.y) / G); return (gx < 0 || gy < 0 || gx >= GW || gy >= GH) ? -1 : gy * GW + gx; }

  // =====================================================================
  // 2. Date istorice
  // =====================================================================
  // Poziția reală a fiecărui popor de-a lungul timpului (an, lat, lon): ținta agenților
  // și reperul „în realitate” afișat pe hartă.
  var HIST = {
    huni:  [[370, 46.8, 44.2], [376, 47.2, 35.5], [395, 46.5, 28.5], [420, 47.0, 20.2], [440, 47.0, 20.2], [451, 48.9, 4.4], [452, 45.8, 13.4], [454, 47.0, 20.5], [470, 46.6, 31], [476, 46.6, 32]],
    ostro: [[370, 47.6, 33.6], [376, 47.3, 31], [400, 46.9, 24.5], [427, 46.8, 19.8], [454, 46.7, 19.6], [460, 45.9, 18.0], [473, 43.6, 25.4], [476, 43.6, 25.4]],
    vizi:  [[370, 46.8, 28.2], [376, 44.4, 27.5], [378, 41.7, 26.6], [382, 43.3, 25.0], [395, 39.6, 22.4], [401, 45.8, 13.4], [410, 41.9, 12.6], [413, 43.4, 6.2], [418, 43.6, 1.4], [476, 42.0, -1.0]],
    gep:   [[370, 48.3, 22.6], [400, 48.0, 22.3], [454, 47.6, 21.8], [457, 47.1, 22.4], [463, 46.6, 24.3], [476, 46.6, 24.3]],
    vand:  [[370, 50.6, 17.0], [401, 48.9, 15.8], [406, 50.0, 8.3], [409, 42.6, -1.2], [420, 37.8, -4.2], [429, 36.0, -5.4], [435, 36.4, 3.0], [439, 36.85, 10.1], [476, 36.85, 10.1]]
  };
  var GROUPS = [
    { id: 'huni', name: 'Hunii', color: '#e0505c', n: 440 },
    { id: 'ostro', name: 'Ostrogoții', color: '#f0a25c', n: 340 },
    { id: 'vizi', name: 'Vizigoții', color: '#b98ae6', n: 440 },
    { id: 'vand', name: 'Vandalii, alanii și suebii', color: '#6fb3f2', n: 400 },
    { id: 'gep', name: 'Gepizii', color: '#7fd08a', n: 200 }
  ];
  var GI = {}; GROUPS.forEach(function(g, i){ GI[g.id] = i; });
  // Granițele romane (limes): Rinul și Dunărea.
  var FRONT = {
    rin: [[51.9, 6.1], [51.0, 6.9], [50.4, 7.6], [50.0, 8.3], [49.0, 8.4], [47.6, 7.6], [47.6, 9.4]],
    dunare: [[48.4, 10.0], [49.0, 12.1], [48.6, 14.3], [48.2, 16.4], [47.8, 18.0], [47.5, 19.05], [46.0, 18.9], [45.3, 19.4], [44.8, 20.45], [44.6, 22.5], [43.8, 24.6], [44.1, 27.3], [45.3, 28.0], [45.2, 29.6]]
  };
  var REGIONS = [
    ['stepa nord-pontică', 47.2, 34], ['Moldova și Muntenia', 46.0, 26.5], ['Câmpia Panonică', 47.0, 19.8], ['Balcani (Moesia, Tracia)', 43.0, 25.0],
    ['Iliria', 43.5, 18.5], ['Grecia', 39.5, 22.0], ['Italia', 42.6, 12.6], ['nordul Galiei', 48.6, 3.0], ['Aquitania (sudul Galiei)', 44.0, 0.8],
    ['Hispania', 40.0, -3.8], ['Africa (Cartagina)', 36.6, 9.5], ['Germania', 51.0, 10.5], ['Noricum și Raetia', 47.6, 12.5], ['Tisa superioară', 48.2, 22.4], ['Transilvania', 46.7, 23.9], ['Crișana', 47.0, 21.8]
  ];
  var DECISIONS = [
    { year: 376, id: 'd1', pic: 'valens', at: [44.1, 27.4], place: 'Dunărea, la Durostorum', title: 'Goții la Dunăre', who: 'Ești împăratul Valens',
      text: 'Fugind din calea hunilor, zeci de mii de goți tervingi s-au strâns pe malul stâng al Dunării și cer să fie primiți în Imperiu.',
      src: 'Ammianus Marcellinus, Res Gestae 31.4–5',
      q: 'Comandanții au adunat toți câinii pe care i-au putut găsi și au dat câte unul pentru fiecare sclav; printre cei luați erau și fii de căpetenii.', qs: 'Ammianus Marcellinus, Res Gestae 31.4.11',
      opts: [
        { t: 'Îi primești și le asiguri hrană și pământ', fx: { stab: 5 }, set: { d1: 'A' } },
        { t: 'Îi primești, dar îi lași pe mâna comandanților locali', real: true, fx: {}, set: { d1: 'B' }, note: 'Ammianus scrie că Lupicinus și Maximus i-au înfometat și exploatat pe refugiați. Goții s-au răsculat.' },
        { t: 'Închizi granița', fx: { stab: -3 }, set: { d1: 'C' } }
      ] },
    { year: 402, id: 'd2', pic: 'stilicho', at: [45.46, 9.19], place: 'Mediolanum', title: 'Rinul sau Italia?', who: 'Ești generalul Stilicho',
      text: 'Alaric și vizigoții au intrat în Italia. Ca s-o aperi, ai nevoie de trupele care păzesc granița de pe Rin.',
      src: 'Claudian, Războiul gotic (De bello Gothico)',
      q: 'Neamuri nenumărate și sălbatice au ocupat toată Galia. Tot ce se află între Alpi și Pirinei, între Ocean și Rin, a fost pustiit.', qs: 'Ieronim, Scrisoarea 123, scrisă în 409',
      opts: [
        { t: 'Aduci trupele de pe Rin în Italia', real: true, fx: { stab: 0 }, set: { d2: 'A' }, note: 'Granița de pe Rin rămâne slab apărată. În noaptea de 31 decembrie 406, vandalii, alanii și suebii o trec. Legătura dintre retragerea trupelor și trecerea din 406 e însă o teză discutată: unii istorici cred că granița era slăbită de mai mult timp.' },
        { t: 'Lași armata pe Rin', fx: { stab: -6 }, set: { d2: 'B' } }
      ] },
    { year: 409.6, id: 'dh', at: [44.42, 12.2], place: 'Ravenna', title: 'Alaric la porțile Romei', who: 'Ești împăratul Honorius, la Ravenna',
      text: 'Vizigoții lui Alaric au asediat Roma de două ori. Cer pământ pentru neamul lor, grâu și aur. Tu ești în siguranță, dincolo de mlaștinile Ravennei.',
      src: 'Zosimus, Istoria nouă 5.48–51; Orosius, Istorii 7.39',
      q: 'Orașul care a cucerit lumea întreagă a fost cucerit el însuși.', qs: 'Ieronim, Scrisoarea 127, despre anul 410',
      opts: [
        { t: 'Refuzi orice înțelegere și rămâi la Ravenna', real: true, fx: {}, set: { dh: 'A' }, note: 'Pe 24 august 410, vizigoții intră în Roma și o jefuiesc trei zile: prima cucerire a orașului de către un dușman străin în aproape 800 de ani.' },
        { t: 'Le dai pământ în Noricum și grâu, ca aliați ai Imperiului', fx: { stab: -3 }, set: { dh: 'B' }, note: 'Vizigoții se așază în Noricum, iar Roma nu e jefuită (scenariu ipotetic). Prețul: Imperiul cedează un ținut întreg unui rege care nu-i datorează nimic.' },
        { t: 'Ceri ajutor de la Constantinopol și aștepți', fx: { stab: -2 }, set: { dh: 'C' }, note: 'Ajutorul nu vine la timp: Roma e jefuită, ca în istorie.' }
      ] },
    // ---------- ACTUL II: ești Attila (rundele din „Imperiul lui Attila”, pe aceeași hartă) ----------
    { kind: 'act', year: 434.9, id: 'a2', pic: 'attila', at: [47.0, 20.2], place: 'Câmpia Panonică', title: 'Actul II: ești Attila', opts: [{ t: 'Începe domnia', real: true, set: {} }] },
    { kind: 'att', year: 435.2, id: 'r1', pic: 'solid', yl: '435 (sau 439)', at: [44.62, 21.19], place: 'Margus', title: 'Tratatul de la Margus',
      text: 'Regele Rua a murit. Tu și fratele tău Bleda moșteniți conducerea hunilor. La Margus, pe Dunăre, vă întâlniți cu solii Constantinopolului. Hunii negociază călare, iar romanii, ca să nu pară mai prejos, rămân și ei în șa.',
      opts: [
        { t: 'Ceri dublarea tributului, predarea fugarilor și piețe deschise la Dunăre', fx: { aur: 20, prestigiu: 10, loial: 5 }, sim: { stab: -2 }, real: true },
        { t: 'Ceri doar piețe deschise: comerțul îi leagă pe negustori de tine', fx: { aur: 8, loial: 8, most: 25 }, sim: { stab: 1 } },
        { t: 'Refuzi negocierea și treci Dunărea după pradă', fx: { aur: 12, prestigiu: 5, cai: -8, loial: 3 }, sim: { stab: -4, path: [[436.3, 43.9, 22.2], [437.6, 47.0, 20.2]] } }
      ],
      real: 'Tratatul de la Margus dublează tributul la 700 de livre de aur pe an. Romanii promit să predea fugarii și să nu se alieze cu dușmanii hunilor. Data e discutată: cei mai mulți istorici o pun în 435, alții în 439.',
      src: 'Priscus din Panium, fragmentul despre tratatul de la Margus',
      q: 'Socotind că nu se cuvine să coboare de pe cai, barbarii au ținut sfatul călare; iar romanii, ca să nu se arate mai prejos, au vorbit și ei tot din șa.', qs: 'Priscus, fr. 2' },
    { kind: 'att', year: 441, id: 'r2', pic: 'geiger', yl: '441', at: [43.32, 21.9], place: 'Viminacium · Naissus', title: 'Episcopul din Margus',
      text: 'Romanii întârzie plata. Mai mult, episcopul din Margus a trecut Dunărea și a jefuit morminte regale hunice. Ceri predarea lui, iar Constantinopolul refuză.',
      opts: [
        { t: 'Treci Dunărea: Viminacium și Margus sunt primele ținte', fx: { aur: 15, prestigiu: 12, loial: 8, cai: -6 }, sim: { stab: -3, path: [[442, 44.3, 21.4], [443, 43.3, 21.9], [444.3, 47.0, 20.2]] }, real: true },
        { t: 'Ceri doar despăgubiri și predarea episcopului', fx: { aur: 5, prestigiu: -6, loial: -4 }, sim: {} },
        { t: 'Îți trimiți călăreții ca mercenari în slujba Romei de Apus', fx: { aur: 10, loial: -3, prestigiu: 2 }, sim: { stab: 2 } }
      ],
      real: 'Hunii atacă. Temându-se că va fi predat, episcopul le deschide chiar el porțile orașului Margus. Cad Viminacium, apoi Naissus; campaniile pustiesc Balcanii.',
      src: 'Priscus din Panium, fragmentul despre episcopul din Margus',
      q: 'Hunii spuneau că episcopul din Margus trecuse în țara lor și, scotocind prin mormintele regilor, furase comorile îngropate acolo.', qs: 'Priscus, fragmentul despre episcop' },
    { kind: 'att', year: 445, id: 'r3', pic: 'delacroix', yl: 'c. 445', at: [47.0, 20.2], place: 'Câmpia Panonică', title: 'Doi regi, un singur imperiu',
      text: 'Bleda, fratele tău, conduce o parte din neamuri. Doi regi înseamnă două curți, două rânduri de daruri și două voințe care nu se potrivesc mereu.',
      opts: [
        { t: 'Rămâi singur la conducere', fx: { prestigiu: 12, loial: -8, aur: 5 }, sim: {}, real: true },
        { t: 'Păstrezi domnia comună și împarți darurile', fx: { loial: 10, prestigiu: -6, aur: -6, most: 25 }, sim: {} },
        { t: 'Împarți puterea cu sfetnici de încredere, ca Onegesius', fx: { loial: 5, prestigiu: 2, most: 50 }, sim: {} }
      ],
      real: 'Bleda moare în jurul anului 445; cronicarul Prosper Tiro scrie că a fost ucis de Attila. De acum, Attila conduce singur un imperiu ținut laolaltă de loialitatea față de persoana lui.',
      src: 'Prosper Tiro, Epitoma chronicon',
      q: 'Bleda, regele hunilor, a fost ucis prin uneltirile fratelui său, Attila.', qs: 'Marcellinus Comes, Chronicon, anul 445' },
    { kind: 'att', year: 447, id: 'r4', pic: 'ziduri', yl: '447', at: [41.01, 28.98], place: 'Constantinopol', title: 'Zidurile au căzut',
      text: 'Un cutremur dărâmă o parte din zidurile Constantinopolului. Armata ta coboară prin Balcani spre capitala Răsăritului.',
      opts: [
        { t: 'Asediezi capitala cât zidurile sunt la pământ', fx: { prestigiu: 6, cai: -15, loial: -5 }, sim: { stab: -6, path: [[447.5, 43.5, 25.5], [448.1, 41.2, 28.4], [448.9, 47.0, 20.2]] } },
        { t: 'Pustiești provinciile și ceri un tribut uriaș', fx: { aur: 28, prestigiu: 10, loial: 6, cai: -5 }, sim: { stab: -5, path: [[447.5, 43.4, 24.0], [448.1, 42.4, 26.5], [448.9, 47.0, 20.2]] }, real: true },
        { t: 'Negociezi fără luptă, ca să-ți păstrezi caii', fx: { aur: 12, cai: 5 }, sim: { stab: -2 } }
      ],
      real: 'Prefectul Constantinus reface zidurile în circa două luni. Attila nu asediază capitala, dar prin Pacea lui Anatolius primește 6.000 de livre de aur restanțe, un tribut de 2.100 de livre pe an și o fâșie pustie la sud de Dunăre.',
      src: 'Priscus din Panium, fragmentul despre Pacea lui Anatolius; inscripțiile de pe zidurile Theodosiene',
      q: 'Un cutremur puternic a dărâmat cea mai mare parte a zidurilor orașului imperial, împreună cu 57 de turnuri.', qs: 'Marcellinus Comes, Chronicon, anul 447' },
    { kind: 'att', year: 449, id: 'r5', yl: '449', at: [47.0, 20.2], place: 'Curtea lui Attila', title: 'Complotul',
      text: 'O solie romană sosește la curte, cu interpretul Vigilas. Edeco, unul dintre oamenii tăi, îți dezvăluie că la Constantinopol i s-a promis aur ca să te ucidă.',
      opts: [
        { t: 'Aștepți ca Vigilas să aducă aurul mitei și îl prinzi asupra faptei', fx: { prestigiu: 15, aur: 5 }, sim: {}, real: true },
        { t: 'Ordoni executarea solilor', fx: { prestigiu: 4, loial: 3, aur: -12 }, sim: { stab: -2 } },
        { t: 'Taci, ca să nu pierzi tributul', fx: { prestigiu: -12, loial: -5 }, sim: {} }
      ],
      real: 'Vigilas se întoarce cu 50 de livre de aur și e prins. Își scapă fiul plătind încă 50 de livre, iar Attila trimite soli la Constantinopol să-i reproșeze împăratului complotul.',
      src: 'Priscus din Panium, relatarea soliei din 449',
      q: 'Când Vigilas s-a întors la curte, oamenii lui Attila l-au prins și i-au găsit în bagaje aurul pe care îl adusese pentru Edeco.', qs: 'Priscus, relatarea soliei din 449' },
    { kind: 'att', year: 449.7, id: 'r6', pic: 'honoria', yl: '450', at: [44.42, 12.2], place: 'Ravenna', title: 'Inelul Honoriei',
      text: 'Noul împărat al Răsăritului, Marcian, refuză să mai plătească tributul. În Apus, Honoria, sora împăratului Valentinian al III-lea, îți trimite un inel și îți cere ajutorul.',
      opts: [
        { t: 'Spre Apus: ceri mâna Honoriei și jumătate din Imperiul de Apus ca zestre', fx: { prestigiu: 10, aur: 8, cai: -12, loial: 5 }, sim: { stab: -2, path: [[450.3, 48.3, 13.0], [451.2, 48.95, 4.4], [451.75, 48.95, 4.4]] }, set: { r6: 'A' }, real: true },
        { t: 'Spre Răsărit: îl forțezi pe Marcian să plătească', fx: { aur: 5, cai: -8, prestigiu: -2 }, sim: { stab: -4, path: [[450.8, 43.6, 23.5], [451.6, 42.5, 26.0], [452.4, 47.0, 20.2]] }, set: { r6: 'B' } },
        { t: 'Aștepți și refaci caii și rezervele', fx: { cai: 10, aur: -10, loial: -10, most: 25 }, sim: { stab: 2 }, set: { r6: 'C' } }
      ],
      real: 'Attila alege Apusul. În 451 trece Rinul cu o armată în care luptă ostrogoți, gepizi și alte neamuri supuse. Departe de stepă, caii găsesc greu pășune.',
      src: 'Priscus din Panium, fragmentul despre Honoria; Iordanes, Getica',
      q: 'Honoria l-a trimis la Attila pe eunucul Hyacinthus, cu bani și cu inelul ei, rugându-l să o scape de căsătoria la care era silită.', qs: 'Priscus, fragmentul despre Honoria, păstrat de Ioan din Antiohia' },
    { kind: 'att', year: 451.6, id: 'r7', pic: 'catal', yl: '451', at: [48.95, 4.4], place: 'Câmpiile Catalaunice', title: 'Câmpiile Catalaunice', west: true,
      text: 'Generalul Aetius a strâns o coaliție: romani, vizigoți, franci, burgunzi, alani. Bătălia începe după-amiaza târziu și ține până noaptea.',
      opts: [
        { t: 'Lupți până la capăt, pe câmp deschis', fx: { cai: -18, loial: -10, prestigiu: -4 }, sim: { stab: -3, path: [[452.0, 48.6, 7.0], [452.75, 45.9, 13.4], [452.95, 45.8, 13.4]] } },
        { t: 'Te retragi în cercul de căruțe și aștepți', fx: { cai: -10, prestigiu: -8, loial: -4 }, sim: { stab: 4, path: [[452.0, 48.6, 7.0], [452.75, 45.9, 13.4], [452.95, 45.8, 13.4]] }, real: true },
        { t: 'Eviți bătălia și pleci cu prada', fx: { prestigiu: -14, aur: 8, cai: -4 }, sim: { stab: 2, path: [[452.0, 48.6, 7.0], [452.75, 45.9, 13.4], [452.95, 45.8, 13.4]] } }
      ],
      real: 'Iordanes scrie că Attila, închis în tabăra de căruțe, pregătise un rug din șei, ca să nu cadă viu în mâinile dușmanilor. Coaliția nu atacă tabăra, iar hunii se retrag peste Rin.',
      src: 'Iordanes, Getica',
      q: 'O luptă cumplită, schimbătoare, crudă și îndârjită, cum n-a mai povestit nimeni din vechime.', qs: 'Iordanes, Getica, 207' },
    { kind: 'att', year: 452.85, id: 'r8', pic: 'aquileia', yl: '452', at: [45.77, 13.37], place: 'Aquileia', title: 'Italia', west: true,
      text: 'Treci Alpii. Aquileia cade după un asediu lung. Dar în armată bântuie foametea și boala, iar Marcian trimite trupe peste Dunăre, în ținuturile tale.',
      opts: [
        { t: 'Mergi spre Roma', fx: { prestigiu: 8, cai: -18, loial: -8 }, sim: { stab: -8, path: [[453.2, 41.9, 12.5], [453.8, 47.0, 20.2]] } },
        { t: 'Primești solia papei Leon și te retragi cu prada', fx: { aur: 12, prestigiu: 3, cai: -4 }, sim: { stab: -1, path: [[453.4, 47.0, 20.2]] }, real: true },
        { t: 'Te întorci imediat să-ți aperi casa', fx: { loial: 5, prestigiu: -6, most: 25 }, sim: { stab: 1, path: [[453.2, 47.0, 20.2]] } }
      ],
      real: 'Attila se retrage. Tradiția pune retragerea pe seama papei Leon; cronicarul Hydatius vorbește despre foamete, boală și atacul trupelor lui Marcian.',
      src: 'Prosper Tiro, Epitoma chronicon; Hydatius, Chronicon',
      q: 'Regele a primit cu cinste întreaga solie și, după ce a promis pacea, s-a retras dincolo de Dunăre.', qs: 'Prosper Tiro, Epitoma chronicon, anul 452' },
    // ---------- ACTUL III: după Attila ----------
    { kind: 'act', year: 453.3, id: 'a3', pic: 'moartea', at: [47.0, 20.2], place: 'Moartea lui Attila', title: 'Actul III: după Attila', opts: [{ t: 'Continuă', real: true, set: {} }] },
    { year: 467.6, id: 'dl', at: [36.85, 10.2], place: 'Cartagina', title: 'Flota împotriva vandalilor', who: 'Ești împăratul Leon I, la Constantinopol',
      text: 'Genseric și vandalii din Africa jefuiesc coastele Mediteranei; în 455 au jefuit chiar Roma. Răsăritul și Apusul pot strânge împreună cea mai mare flotă a epocii.',
      src: 'Procopius, Războiul vandalic 1.6',
      q: 'Vandalii au umplut corăbii goale cu lemne uscate, le-au dat foc și le-au lăsat să plutească, cu vântul din spate, spre flota romană strânsă laolaltă.', qs: 'Procopius, Războiul vandalic 1.6',
      opts: [
        { t: 'Trimiți marea flotă a lui Basiliscus spre Cartagina', real: true, fx: {}, set: { dl: 'A' }, note: 'În 468, la Capul Bon, vandalii dau foc flotei cu corăbii incendiare. Pierderea e uriașă, iar Apusul rămâne fără sprijin în ultimii lui ani.' },
        { t: 'Faci pace cu Genseric și îi recunoști regatul', fx: { stab: 2 }, set: { dl: 'B' }, note: 'Fără război, Răsăritul își păstrează aurul și corăbiile (scenariu ipotetic). Vandalii rămân însă stăpânii Mediteranei de vest.' },
        { t: 'Aperi doar coastele Răsăritului', fx: { stab: -3 }, set: { dl: 'C' }, note: 'Răsăritul se apără, dar Apusul e lăsat singur în fața vandalilor (scenariu ipotetic).' }
      ] },
    { year: 454, id: 'd5', pic: 'apahida', at: [47.6, 21.8], place: 'Țara gepizilor', title: 'Nedao', who: 'Ești Ardaric, regele gepizilor',
      text: 'Attila a murit. Fiii lui își împart neamurile supuse ca pe o moștenire de familie. Tu ai fost unul dintre cei mai de încredere oameni ai lui Attila.',
      more: function(){ var v = verdict(); return v[2] === 2 ? 'În jocul tău, Attila a lăsat o moștenire solidă: neamurile au motive să rămână alături de fiii lui.' : revolted ? 'În jocul tău, neamurile s-au răsculat încă din timpul domniei lui Attila.' : 'Ca în istorie, imperiul ținea doar prin persoana lui Attila.'; },
      src: 'Iordanes, Getica 259–264',
      q: 'Acolo puteai vedea gotul luptând cu sulița, gepidul dezlănțuit cu sabia, suevul pe jos, hunul cu arcul.', qs: 'Iordanes, Getica 261',
      opts: [
        { t: 'Ridici neamurile supuse împotriva fiilor lui Attila', real: true, fx: { stab: 3 }, set: { d5: 'A' }, note: 'La Nedao, gepizii și aliații lor îi înving pe huni; Ellac, fiul cel mare al lui Attila, cade în luptă. Gepizii se așază la est de Tisa și în Transilvania, unde rămân până în 567.' },
        { t: 'Rămâi credincios fiilor lui Attila', fx: {}, set: { d5: 'B' } },
        { t: 'Îți duci neamul spre apus, în slujba Romei', fx: { stab: 2 }, set: { d5: 'C' } }
      ] }
  ];
  DECISIONS.sort(function(a, b){ return a.year - b.year; });
  var METERS = [
    { k: 'aur', label: 'Aur', c: '#e5c158', hint: 'tributul și prada din care Attila își răsplătește războinicii' },
    { k: 'prestigiu', label: 'Renume', c: '#e0626c', hint: 'teama și respectul pe care le inspiră' },
    { k: 'loial', label: 'Loialitate', c: '#8fbd82', hint: 'neamurile supuse: ostrogoți, gepizi, alani…' },
    { k: 'cai', label: 'Cavalerie', c: '#7ab0e8', hint: 'caii au nevoie de pășuni; departe de stepă, cavaleria slăbește' },
    { k: 'most', label: 'Moștenire', c: '#b98ae6', hint: 'ce rămâne în picioare după tine: putere împărțită și legături care nu depind doar de persoana ta. De la 50 în sus, imperiul poate să-ți supraviețuiască' }
  ];
  var ATT0 = { aur: 30, prestigiu: 25, loial: 60, cai: 80, most: 0 }, UPKEEP = 8;
  var ROUNDS = DECISIONS.filter(function(d){ return d.kind === 'att'; });
  var LESSONS = [
    '<b>Aurul tributului ținea imperiul în viață.</b> Din el primeau căpeteniile daruri. Când Marcian a oprit plata, Attila a trebuit să caute aur tot mai departe.',
    '<b>Loialitatea era față de Attila, nu față de un stat.</b> La moartea lui, neamurile supuse s-au răsculat: la Nedao (c. 454), gepizii lui Ardaric i-au învins pe fiii lui Attila.',
    '<b>Departe de stepă, cavaleria își pierdea avantajul.</b> Caii aveau nevoie de pășuni întinse; în Galia și Italia, armata depindea tot mai mult de infanteria popoarelor supuse (teza lui R. P. Lindner).'
  ];
  // portretele personajelor și iconițele indicatorilor (din joc-imagini.json, puse la asamblare)
  var JOC_IMG = /*__JOC_IMAGINI__*/null || { portrete: {}, iconite: {} };
  var PICS = {
    valens: { src: 'valens', coin: true, credit: 'Valens pe un solid de aur · The Metropolitan Museum of Art, CC0' },
    stilicho: { src: 'stilicho', credit: 'Stilicho pe dipticul de fildeș de la Monza (c. 400) · domeniu public' },
    honoria: { src: 'honoria', coin: true, credit: 'Honoria pe un solid bătut la Ravenna (c. 430–450) · CNG, CC BY-SA 2.5' },
    apahida: { src: 'apahida', credit: 'Aplice de șa ale unui principe gepid, Apahida (sec. V), MNIR · J. Steakley, GFDL' },
    attila: { src: '#img-attila', credit: 'Attila în Cronica pictată de la Viena (c. 1360): imagine medievală, nu portret' },
    solid: { src: '#img-solidus', coin: true, credit: 'Solid al lui Teodosie al II-lea, moneda tributului · CC0' },
    ziduri: { src: '#img-ziduri', credit: 'Zidurile Theodosiene · foto Carole Raddato, CC BY-SA 2.0' },
    catal: { src: '#img-catalaunice', credit: 'Spieghel Historiael (c. 1330) · domeniu public' },
    aquileia: { src: '#img-aquileia', credit: 'Asediul Aquileiei, Cronica pictată (c. 1360) · domeniu public' },
    geiger: { src: '#img-geiger', credit: 'J. N. Geiger, Hunii în luptă cu alanii (c. 1873) · domeniu public' },
    delacroix: { src: '#img-delacroix', credit: 'E. Delacroix, Attila și hoardele sale (1838–1847) · domeniu public' },
    moartea: { src: '#img-moartea', credit: 'F. Paczka, Moartea lui Attila (1884) · domeniu public' }
  };
  function picHtml(key){
    var pc = PICS[key]; if (!pc) return '';
    var src = pc.src.charAt(0) === '#' ? (document.querySelector(pc.src) || {}).src : JOC_IMG.portrete[pc.src];
    if (!src) return '';
    return '<figure class="mig-pic' + (pc.coin ? ' coin' : '') + '"><img src="' + src + '" alt=""><figcaption>' + pc.credit + '</figcaption></figure>';
  }
  function ico(k){ var d = JOC_IMG.iconite[k]; return d ? '<svg class="mig-ico" viewBox="0 0 512 512" aria-hidden="true"><path d="' + d + '" fill="currentColor"/></svg>' : ''; }
  var EVENTS = [
    { year: 375, at: [47.4, 33.4], place: 'Regatul lui Ermanaric', t: '375 · Hunii zdrobesc regatul goților lui Ermanaric', src: 'Ammianus 31.3' },
    { year: 378, at: [41.68, 26.56], place: 'Adrianopol', cond: function(){ return choice.d1 === 'B'; }, t: '378 · Adrianopol: goții răsculați distrug armata romană; împăratul Valens moare', src: 'Ammianus 31.13', fx: { stab: -20 } },
    { year: 378, cond: function(){ return choice.d1 === 'A'; }, t: '378 · Fără răscoală, la Adrianopol nu are loc nicio bătălie (scenariu ipotetic)' },
    { year: 378, cond: function(){ return choice.d1 === 'C'; }, t: '378 · Goții se îngrămădesc pe malul stâng al Dunării, prinși între huni și Imperiu (scenariu ipotetic)' },
    { year: 406.9, at: [50.0, 8.3], place: 'Rinul, la Mogontiacum', cond: function(){ return choice.d2 !== 'B'; }, t: '406 · Noaptea de 31 decembrie: vandalii, alanii și suebii trec Rinul' },
    { year: 406.9, at: [50.0, 8.3], place: 'Rinul, la Mogontiacum', cond: function(){ return choice.d2 === 'B'; }, t: '406 · Armata rămasă pe Rin îi ține pe vandali, alani și suebi la graniță (scenariu ipotetic)' },
    { year: 410, at: [41.9, 12.5], place: 'Roma', cond: function(){ return choice.d1 !== 'A' && choice.dh !== 'B'; }, t: '410 · Alaric și vizigoții jefuiesc Roma', src: 'Orosius; Ieronim', fx: { stab: -10 } },
    { year: 429, at: [36.0, -5.4], place: 'Strâmtoarea Gibraltar', cond: function(){ return choice.d2 !== 'B'; }, t: '429 · Vandalii trec în Africa, sub regele Genseric' },
    { year: 439, at: [36.85, 10.2], place: 'Cartagina', cond: function(){ return choice.d2 !== 'B'; }, t: '439 · Vandalii cuceresc Cartagina' },
    { year: 454.6, cond: function(){ return choice.d5 === 'A'; }, t: '454 · Nedao: gepizii lui Ardaric îi înving pe fiii lui Attila', src: 'Iordanes, Getica 260–262' },
    { year: 454.6, cond: function(){ return choice.d5 === 'B'; }, t: '454 · Fără Nedao: neamurile rămân sub fiii lui Attila (scenariu ipotetic)' },
    { year: 454.6, cond: function(){ return choice.d5 === 'C'; }, t: '454 · Gepizii pleacă spre apus; neamurile rămase se răscoală fără ei (scenariu ipotetic)' },
    { year: 468.4, at: [37.08, 11.04], place: 'Capul Bon', cond: function(){ return choice.dl === 'A'; }, t: '468 · La Capul Bon, vandalii dau foc flotei romane', src: 'Procopius, Războiul vandalic 1.6', fx: { stab: -8 } },
    { year: 470, at: [46.8, 23.6], place: 'Apahida', cond: function(){ return choice.d5 === 'A'; }, check: 'gep', t: 'c. 470 · Un principe gepid e îngropat la Apahida, lângă Cluj, cu podoabe de aur', src: 'vezi Muzeul, capitolul 06' },
    { year: 476, at: [44.42, 12.2], place: 'Ravenna', t: '476 · Ultimul împărat al Apusului, Romulus Augustulus, este înlăturat' }
  ];

  // =====================================================================
  // 3. Stare
  // =====================================================================
  var T0 = 370, T1 = 476, DT = 0.02;
  // mod ușor: 40% din agenți, pentru calculatoare lente; se alege din buton, din adresă (?usor)
  // sau automat, prima dată, pe procesoare cu cel mult două nuclee
  var FULL_N = GROUPS.reduce(function(s, g){ return s + g.n; }, 0), LITE = false, litePref = null;
  try { litePref = localStorage.getItem('mig-lite'); } catch (e) {}
  if (/[?&]usor/.test(location.search)) LITE = true;
  else if (litePref !== null) LITE = litePref === '1';
  else LITE = (navigator.hardwareConcurrency || 8) <= 2;
  if (LITE) GROUPS.forEach(function(g){ g.n = Math.round(g.n * 0.4); });
  var N = GROUPS.reduce(function(s, g){ return s + g.n; }, 0);
  var crossed = new Uint8Array(N), ax = new Float32Array(N), ay = new Float32Array(N), avx = new Float32Array(N), avy = new Float32Array(N), ag = new Uint8Array(N), aw = new Float32Array(N);
  var terrain = new Float32Array(GW * GH), frontMask = new Uint8Array(GW * GH), frontSeg = [];
  var fieldCache = {}, plans = {}, choice = {}, att, attPicks, revolted, stab, t, running = false, speed = 1, seed, rnd, eventIx, decIx, crossings, log, finished, auto = false;
  var layers = { real: true, terrain: false, flow: false, press: false }, flowGroup = 2;
  var pressGrid, PW = 60, PH = 29;
  // pentru reluarea de la final: pozițiile tuturor agenților, o dată pe an
  var snaps = [], recY = T0, replayY = null, replayRaf = 0, replayTok = 0, cpath = null;
  function rec(){ while (t >= recY && recY <= T1) { var a = new Float32Array(N * 2); a.set(ax); a.set(ay, N); snaps.push(a); recY++; } }

  function mulberry(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; var t2 = Math.imul(a ^ a >>> 15, 1 | a); t2 = t2 + Math.imul(t2 ^ t2 >>> 7, 61 | t2) ^ t2; return ((t2 ^ t2 >>> 14) >>> 0) / 4294967296; }; }

  // =====================================================================
  // 4. Interfață
  // =====================================================================
  var SVG = function(d, fill){ return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="' + d + '" ' + (fill ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"') + '/></svg>'; };
  // harta e elementul principal: comenzile stau peste ea, într-o bară subțire; legenda, în colțul din stânga jos;
  // straturile tehnice și modul ușor se deschid doar din „Straturi”
  root.innerHTML =
    '<div class="mig-main">' +
      '<div class="mig-stage">' +
        '<canvas id="mig-canvas" width="' + CW + '" height="' + CH + '" role="img" aria-label="Simularea Marii Migrații: puncte colorate reprezintă popoarele care se deplasează pe harta Europei între 370 și 476"></canvas>' +
        '<div class="mig-hud">' +
          '<div class="mig-year" aria-live="off"><b id="mig-year">370</b></div>' +
          '<button class="mig-play" id="mig-play" type="button" aria-pressed="false">Pornește</button>' +
          '<div class="mig-speed" role="group" aria-label="Viteza simulării"><button type="button" data-s="1" class="on" aria-pressed="true">1×</button><button type="button" data-s="2" aria-pressed="false">2×</button><button type="button" data-s="4" aria-pressed="false">4×</button></div>' +
          '<span class="mig-hud-sp"></span>' +
          '<button class="mig-ib" id="mig-reset" type="button" aria-label="De la capăt" title="De la capăt">' + SVG('M3.2 8a4.8 4.8 0 1 0 1.5-3.5M3 2.2v3.1h3.1') + '</button>' +
          '<button class="mig-ib" id="mig-lay" type="button" aria-label="Straturi" title="Straturi" aria-expanded="false" aria-controls="mig-pop">' + SVG('M8 2l6 3-6 3-6-3zM2 8l6 3 6-3M2 11l6 3 6-3') + '</button>' +
          '<button class="mig-ib mig-fs" id="mig-fs" type="button" aria-label="Ecran complet" title="Ecran complet">' + SVG('M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10') + '</button>' +
        '</div>' +
        '<div class="mig-pop" id="mig-pop" hidden>' +
          '<p class="mig-pop-h">Straturi</p><div class="mig-layers">' +
            '<label><input type="checkbox" data-l="real" checked> Lumea reală (reper)</label>' +
            '<label><input type="checkbox" data-l="terrain"> Terenul calculat din hartă</label>' +
            '<label><input type="checkbox" data-l="flow"> Drumurile calculate (Dijkstra)</label>' +
            '<label><input type="checkbox" data-l="press"> Presiunea hunilor</label>' +
          '</div>' +
          '<label class="mig-flowl">Drumuri pentru <select id="mig-flowg">' + GROUPS.map(function(g, i){ return '<option value="' + i + '"' + (i === 2 ? ' selected' : '') + '>' + g.name.split(',')[0] + '</option>'; }).join('') + '</select></label>' +
          '<p class="mig-pop-h">Calculatorul tău</p><button type="button" class="mig-lite" id="mig-lite" aria-pressed="' + LITE + '">' + (LITE ? 'Mod ușor: ' + N.toLocaleString('ro-RO') + ' de agenți. Treci la modul complet' : 'Mod ușor: ' + Math.round(FULL_N * 0.4).toLocaleString('ro-RO') + ' de agenți, dacă merge greu') + '</button>' +
          '<p class="mig-pop-note">Cum funcționează modelul: <b>Despre proiect</b>, la „Fișă tehnică”.</p>' +
        '</div>' +
        '<ul class="mig-legend" id="mig-legend" aria-label="Popoarele">' + GROUPS.map(function(g){ return '<li title="' + g.name + '"><i style="background:' + g.color + '"></i>' + g.name.split(',')[0] + '<small id="mig-where-' + g.id + '" hidden></small></li>'; }).join('') + '<li><i class="ghost"></i>Unde erau în realitate</li></ul>' +
        '<div class="mig-toast" id="mig-toast" aria-live="polite"></div><div class="mig-tip" id="mig-tip" hidden></div>' +
        '<div class="mig-over" id="mig-over"></div>' +
        '<div class="mig-replay" id="mig-replay" hidden><button class="mig-ib" id="mig-rp-play" type="button" aria-label="Pornește reluarea" title="Pornește reluarea"></button>' +
          '<input type="range" id="mig-rp" min="' + T0 + '" max="' + T1 + '" step="1" value="' + T1 + '" aria-label="Anul reluării"><b id="mig-rp-y">' + T1 + '</b>' +
          '<span class="mig-rp-key"><i class="solid"></i>drumul tău <i></i>drumul real</span></div>' +
        '<span class="mig-credit">Hartă: Alexrk2, Wikimedia Commons, CC BY-SA 3.0</span>' +
        '<div class="mig-tl" id="mig-tl" aria-label="Cronologia simulării: deciziile și evenimentele"></div>' +
      '</div>' +
      '<aside class="mig-side">' +
        '<div class="mig-stab"><p class="mig-side-h"><span>' + ico('stab') + 'Stabilitatea Imperiului</span> <b id="mig-stab-v">70</b></p><div class="jg-bar"><i id="mig-stab" style="width:70%"></i></div></div>' +
        '<div class="mig-att" id="mig-att" hidden><p class="mig-side-h">Imperiul lui Attila</p>' + METERS.map(function(m){ return '<div class="jg-meter" id="mig-m-' + m.k + '" style="--c:' + m.c + '" title="' + m.label + ': ' + m.hint + '"><label><span>' + ico(m.k) + m.label + '</span> <b>0</b></label><div class="jg-bar"><i></i></div><span class="jg-delta"></span></div>'; }).join('') + '</div>' +
        '<div><p class="mig-side-h">Deciziile tale</p><ol class="mig-log" id="mig-log"></ol></div>' +
      '</aside>' +
    '</div>';

  var cv = document.getElementById('mig-canvas'), ctx = cv.getContext('2d', { alpha: false });
  var baseCv = document.createElement('canvas'); baseCv.width = CW; baseCv.height = CH;
  var trailCv = document.createElement('canvas'); trailCv.width = CW; trailCv.height = CH;
  var terrCv = document.createElement('canvas'); terrCv.width = GW; terrCv.height = GH;
  var tctx = trailCv.getContext('2d');
  var over = document.getElementById('mig-over'), toastEl = document.getElementById('mig-toast');
  function W2C(x, y){ return [(x - VB.x) * SC, (y - VB.y) * SC]; }

  // =====================================================================
  // 5. Terenul, citit din harta de bază
  // =====================================================================
  function buildTerrain(img){
    var bctx = baseCv.getContext('2d');
    var p0 = W2C(0, 244.6);
    bctx.fillStyle = '#0e0e10'; bctx.fillRect(0, 0, CW, CH);
    bctx.drawImage(img, p0[0], p0[1], 690 * SC, 345.4 * SC);
    // eșantionare: medie pe fiecare celulă de 4 × 4 pixeli
    var data = bctx.getImageData(0, 0, CW, CH).data, cs = G * SC;
    var tc = terrCv.getContext('2d'), timg = tc.createImageData(GW, GH);
    for (var gy = 0; gy < GH; gy++) for (var gx = 0; gx < GW; gx++) {
      var r = 0, g = 0, b = 0, n = 0;
      for (var dy = 0; dy < cs; dy++) for (var dx = 0; dx < cs; dx++) {
        var o = ((gy * cs + dy) * CW + gx * cs + dx) * 4; r += data[o]; g += data[o + 1]; b += data[o + 2]; n++;
      }
      r /= n; g /= n; b /= n;
      var mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx - mn, lum = (r + g + b) / 3, c, col;
      if (b > g + 4 && b > r + 28) { c = Infinity; col = [0, 0, 0, 0]; }
      else if (g - r >= 20) { c = 1; col = [120, 200, 110, 120]; }
      else if (g - r >= 8) { c = 1.5; col = [170, 210, 120, 120]; }
      else if (sat < 40 && lum < 165) { c = 6; col = [150, 90, 60, 170]; }
      else if (r > g && r - b > 45 && lum < 160) { c = 4; col = [190, 120, 70, 150]; }
      else if (r >= g) { c = 2.5; col = [230, 200, 110, 130]; }
      else { c = 2; col = [220, 220, 140, 120]; }
      var i = gy * GW + gx; terrain[i] = c;
      timg.data[i * 4] = col[0]; timg.data[i * 4 + 1] = col[1]; timg.data[i * 4 + 2] = col[2]; timg.data[i * 4 + 3] = col[3];
    }
    // strâmtoarea Gibraltar: vandalii au trecut-o cu corăbii
    for (var la = 35.6; la <= 36.3; la += 0.05) for (var lo = -6.2; lo <= -4.9; lo += 0.05) {
      var pp = proj(la, lo), ci = toCell(pp[0], pp[1]);
      if (ci >= 0 && terrain[ci] === Infinity) { terrain[ci] = 3; timg.data[ci * 4 + 3] = 0; }
    }
    tc.putImageData(timg, 0, 0);
    // granițele: segmente + celulele din apropiere (doar acolo verificăm trecerea)
    Object.keys(FRONT).forEach(function(k){
      var pts = FRONT[k].map(function(p){ return proj(p[0], p[1]); });
      for (var s = 0; s < pts.length - 1; s++) {
        frontSeg.push({ k: k, x1: pts[s][0], y1: pts[s][1], x2: pts[s + 1][0], y2: pts[s + 1][1] });
        var steps = Math.ceil(Math.hypot(pts[s + 1][0] - pts[s][0], pts[s + 1][1] - pts[s][1]) / (G / 2));
        for (var q = 0; q <= steps; q++) {
          var fx = pts[s][0] + (pts[s + 1][0] - pts[s][0]) * q / steps, fy = pts[s][1] + (pts[s + 1][1] - pts[s][1]) * q / steps;
          for (var oy = -2; oy <= 2; oy++) for (var ox = -2; ox <= 2; ox++) {
            var cc = toCell(fx + ox * G, fy + oy * G); if (cc >= 0) frontMask[cc] = (ox === 0 && oy === 0) ? 2 : Math.max(frontMask[cc], 1);
          }
        }
      }
    });
  }

  // =====================================================================
  // 6. Câmpuri de drum: Dijkstra pe grilă, de la țintă spre toate celulele
  // =====================================================================
  function field(lat, lon){
    var key = lat + ',' + lon;
    if (fieldCache[key]) return fieldCache[key];
    // Float64: cu Float32, rotunjirea face ca același nod să reintre mereu în coadă
    var dist = new Float64Array(GW * GH).fill(Infinity), dir = new Int8Array(GW * GH * 2);
    var heap = [], hp = function(i, d){ heap.push([d, i]); var k = heap.length - 1; while (k > 0) { var pk = (k - 1) >> 1; if (heap[pk][0] <= heap[k][0]) break; var tmp = heap[pk]; heap[pk] = heap[k]; heap[k] = tmp; k = pk; } };
    var pop = function(){ var top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; var k = 0; for (;;) { var l = 2 * k + 1, r = l + 1, m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break; var tmp = heap[m]; heap[m] = heap[k]; heap[k] = tmp; k = m; } } return top; };
    var tp = proj(lat, lon), tc0 = toCell(tp[0], tp[1]);
    var tx = Math.floor((tp[0] - VB.x) / G), ty = Math.floor((tp[1] - VB.y) / G), R = 4;
    for (var dy = -R; dy <= R; dy++) for (var dx = -R; dx <= R; dx++) {
      if (dx * dx + dy * dy > R * R) continue;
      var gx = tx + dx, gy = ty + dy; if (gx < 0 || gy < 0 || gx >= GW || gy >= GH) continue;
      var c = gy * GW + gx; if (terrain[c] === Infinity) continue;
      dist[c] = 0; hp(c, 0);
    }
    if (!heap.length && tc0 >= 0) { dist[tc0] = 0; hp(tc0, 0); }
    var NB = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [-1, 1, 1.414], [1, -1, 1.414], [-1, -1, 1.414]];
    while (heap.length) {
      var e = pop(), d = e[0], i = e[1];
      if (d > dist[i]) continue;
      var x = i % GW, y = (i - x) / GW;
      for (var n = 0; n < 8; n++) {
        var nx = x + NB[n][0], ny = y + NB[n][1];
        if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
        var j = ny * GW + nx, tj = terrain[j]; if (tj === Infinity) continue;
        // a trece granița costă cât un ocol de ~80 km: drumurile nu o trec decât dacă trebuie
        var nd = d + NB[n][2] * (terrain[i] + tj) / 2 + (frontMask[j] === 2 ? 12 : 0);
        if (nd < dist[j]) { dist[j] = nd; hp(j, nd); }
      }
    }
    for (var c2 = 0; c2 < GW * GH; c2++) {
      if (dist[c2] === Infinity || dist[c2] === 0) continue;
      var x2 = c2 % GW, y2 = (c2 - x2) / GW, best = dist[c2], bx = 0, by = 0;
      for (var n2 = 0; n2 < 8; n2++) {
        var nx2 = x2 + NB[n2][0], ny2 = y2 + NB[n2][1];
        if (nx2 < 0 || ny2 < 0 || nx2 >= GW || ny2 >= GH) continue;
        var dj = dist[ny2 * GW + nx2]; if (dj < best) { best = dj; bx = NB[n2][0]; by = NB[n2][1]; }
      }
      dir[c2 * 2] = bx; dir[c2 * 2 + 1] = by;
    }
    return (fieldCache[key] = { dist: dist, dir: dir });
  }

  // =====================================================================
  // 7. Planuri, decizii, granițe
  // =====================================================================
  function interp(list, yr){
    if (yr <= list[0][0]) return [list[0][1], list[0][2]];
    for (var i = 0; i < list.length - 1; i++) {
      var a = list[i], b = list[i + 1];
      if (yr <= b[0]) { var f = (yr - a[0]) / (b[0] - a[0]); return [a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]; }
    }
    var l = list[list.length - 1]; return [l[1], l[2]];
  }
  function buildPlans(){
    plans = JSON.parse(JSON.stringify(HIST));
    if (choice.d1 === 'A') plans.vizi = [[370, 46.8, 28.2], [376, 44.4, 27.5], [380, 43.3, 25.0], [476, 43.0, 24.5]];
    if (choice.d1 === 'C') plans.vizi = [[370, 46.8, 28.2], [376, 44.6, 27.0], [395, 45.6, 21.0], [401, 45.8, 13.4], [410, 41.9, 12.6], [413, 43.4, 6.2], [418, 43.6, 1.4], [476, 42.0, -1.0]];
    if (choice.dh === 'B') plans.vizi = plans.vizi.filter(function(w){ return w[0] < 410; }).concat([[411.5, 47.3, 14.2], [476, 47.3, 14.2]]);
    if (choice.d2 === 'B') plans.vand = [[370, 50.6, 17.0], [401, 48.9, 15.8], [406, 49.9, 9.4], [476, 50.2, 9.8]];
    // hunii: până în 435, drumul real; apoi, drumurile alese în rundele lui Attila; după 453, drumul real
    var hp = [[370, 46.8, 44.2], [376, 47.2, 35.5], [395, 46.5, 28.5], [420, 47.0, 20.2], [435, 47.0, 20.2]];
    attPicks.forEach(function(x){ if (x.o.sim && x.o.sim.path) hp = hp.concat(x.o.sim.path); });
    if (revolted) hp.push([hp[hp.length - 1][0] + 0.8, 47.0, 20.2]);
    plans.huni = hp.concat([[454, 47.0, 20.5], [470, 46.6, 31], [476, 46.6, 32]]);
    planD5();
  }
  function planD5(){
    var cut = function(list){ return list.filter(function(w){ return w[0] < 454; }); };
    if (choice.d5 === 'B') {
      plans.huni = cut(plans.huni).concat([[454, 47.0, 20.5], [476, 47.0, 20.3]]);
      plans.ostro = cut(plans.ostro).concat([[454, 46.7, 19.6], [476, 46.6, 19.2]]);
      plans.gep = cut(plans.gep).concat([[454, 47.6, 21.8], [476, 47.9, 22.3]]);
    }
    if (choice.d5 === 'C') plans.gep = cut(plans.gep).concat([[454, 47.6, 21.8], [458, 46.9, 18.2], [466, 46.6, 16.4], [476, 46.4, 15.2]]);
  }
  function target(gid){
    var p = plans[gid];
    for (var i = 0; i < p.length; i++) if (p[i][0] > t) return p[i];
    return p[p.length - 1];
  }
  // probabilitatea (pe an) ca un agent care împinge în graniță s-o treacă
  function rate(gid, k){
    var inst = 1 + (100 - stab) / 35, r = 0.04 * inst;
    if (k === 'dunare') {
      if (gid === 'vizi' && t >= 376 && t < 381) r = choice.d1 === 'C' ? 0.05 * inst : 60;
      if (gid === 'vizi' && choice.d1 === 'C' && t >= 381) r = 0.25 * inst;
      if (gid === 'huni' && t >= 435 && t < 454) r = 60;
      if (gid === 'ostro' && t >= 455) r = 40;
    } else {
      if (gid === 'vand' && t >= 406.9) r = choice.d2 === 'B' ? 0.12 * inst : 60;
      if (gid === 'huni' && t >= 435 && t < 454) r = 60;
    }
    return r;
  }
  function segX(ax1, ay1, ax2, ay2, s){
    var d1x = ax2 - ax1, d1y = ay2 - ay1, d2x = s.x2 - s.x1, d2y = s.y2 - s.y1, den = d1x * d2y - d1y * d2x;
    if (Math.abs(den) < 1e-9) return false;
    var u = ((s.x1 - ax1) * d2y - (s.y1 - ay1) * d2x) / den, v = ((s.x1 - ax1) * d1y - (s.y1 - ay1) * d1x) / den;
    return u >= 0 && u <= 1 && v >= 0 && v <= 1;
  }

  // =====================================================================
  // 8. Pornire și pasul simulării
  // =====================================================================
  function reset(){
    seed = 20260; rnd = mulberry(seed); t = T0; stab = 70; eventIx = 0; decIx = 0; crossings = { dunare: 0, rin: 0 }; log = []; finished = false;
    choice = {}; att = Object.assign({}, ATT0); attPicks = []; revolted = false;
    buildPlans();
    var k = 0;
    GROUPS.forEach(function(g, gi){
      var c = proj(HIST[g.id][0][1], HIST[g.id][0][2]);
      for (var i = 0; i < g.n; i++) {
        var x, y, tries = 0;
        do { var a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * 16; x = c[0] + Math.cos(a) * r; y = c[1] + Math.sin(a) * r * 0.7; tries++; }
        while (tries < 30 && (toCell(x, y) < 0 || terrain[toCell(x, y)] === Infinity));
        ax[k] = x; ay[k] = y; avx[k] = 0; avy[k] = 0; ag[k] = gi; aw[k] = 0.75 + rnd() * 0.5; k++;
      }
    });
    crossed.fill(0); tctx.clearRect(0, 0, CW, CH);
    snaps = []; recY = T0; replayY = null; cpath = null; rec();
    pressGrid = new Float32Array(PW * PH);
    updateHud(); renderLog(); draw();
  }

  function groupSpeed(gid, gi){
    // viteza grupului: cât să ajungă la țintă până la anul ei (distanța e luată din câmpul Dijkstra)
    var tg = target(gid), f = field(tg[1], tg[2]), sum = 0, n = 0;
    for (var i = gi.start; i < gi.end; i += 7) { var c = toCell(ax[i], ay[i]); if (c >= 0 && f.dist[c] < Infinity) { sum += f.dist[c]; n++; } }
    var d = n ? sum / n * G : 0, yrs = Math.max(0.6, tg[0] - t);
    // gepizii trec prin dealurile din nord-vestul Transilvaniei: viteza minimă e mai mare
    // cavaleria lui Attila (actul II) poate merge mai repede decât un popor care migrează cu tot cu familii
    return { f: f, v: Math.max(gid === 'gep' && t > 454 ? 12 : 4, Math.min(gid === 'huni' && t >= 435 && t < 454 ? 240 : 160, d / yrs)) };
  }
  var ranges = []; (function(){ var s = 0; GROUPS.forEach(function(g){ ranges.push({ start: s, end: s + g.n }); s += g.n; }); })();

  function step(){
    // densitatea hunilor (grilă grosieră)
    pressGrid.fill(0);
    var hr = ranges[GI.huni];
    for (var h = hr.start; h < hr.end; h++) {
      var px = Math.floor((ax[h] - VB.x) / 10), py = Math.floor((ay[h] - VB.y) / 10);
      if (px >= 0 && py >= 0 && px < PW && py < PH) pressGrid[py * PW + px] += 1;
    }
    var pressOn = t > 374 && t < 454;
    var sp = GROUPS.map(function(g, gi){ return groupSpeed(g.id, ranges[gi]); });
    for (var i = 0; i < N; i++) {
      var gi = ag[i], g = GROUPS[gi], s = sp[gi], c = toCell(ax[i], ay[i]);
      var dx = 0, dy = 0, cost = 1;
      if (c >= 0) {
        cost = terrain[c] === Infinity ? 1 : terrain[c];
        if (s.f.dist[c] > 6) { dx = s.f.dir[c * 2]; dy = s.f.dir[c * 2 + 1]; var dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl; }
      }
      var want = s.v * aw[i] / Math.sqrt(cost);
      var tvx = dx * want + (rnd() - 0.5) * 14, tvy = dy * want + (rnd() - 0.5) * 14;
      if (pressOn && g.id !== 'huni' && g.id !== 'ostro' && g.id !== 'gep') {
        var qx = Math.floor((ax[i] - VB.x) / 10), qy = Math.floor((ay[i] - VB.y) / 10);
        if (qx > 0 && qy > 0 && qx < PW - 1 && qy < PH - 1) {
          var gxp = pressGrid[qy * PW + qx + 1] - pressGrid[qy * PW + qx - 1], gyp = pressGrid[(qy + 1) * PW + qx] - pressGrid[(qy - 1) * PW + qx];
          tvx -= gxp * 3.2; tvy -= gyp * 3.2;
        }
      }
      avx[i] += (tvx - avx[i]) * 0.18; avy[i] += (tvy - avy[i]) * 0.18;
      var nx = ax[i] + avx[i] * DT, ny = ay[i] + avy[i] * DT, nc = toCell(nx, ny);
      if (nc < 0 || terrain[nc] === Infinity) { avx[i] *= -0.3; avy[i] *= -0.3; continue; }
      if (frontMask[c] || frontMask[nc]) {
        var blocked = false;
        for (var fs = 0; fs < frontSeg.length; fs++) {
          var sg = frontSeg[fs];
          if (segX(ax[i], ay[i], nx, ny, sg)) {
            var p = 1 - Math.exp(-rate(g.id, sg.k) * DT);
            if (rnd() < p) { var bit = sg.k === "rin" ? 2 : 1; if (!(crossed[i] & bit)) { crossed[i] |= bit; crossings[sg.k]++; } } else { blocked = true; }
            break;
          }
        }
        if (blocked) { avx[i] = (rnd() - 0.5) * 20; avy[i] = (rnd() - 0.5) * 20; continue; }
      }
      ax[i] = nx; ay[i] = ny;
    }
    t += DT;
  }

  // =====================================================================
  // 9. Desen
  // =====================================================================
  var SHORT = { huni: 'HUNII', ostro: 'OSTROGOȚII', vizi: 'VIZIGOȚII', vand: 'VANDALII', gep: 'GEPIZII' };
  var pulses = [], cents = [], showCompare = false;
  function pulse(at, text, color){ var p = proj(at[0], at[1]); pulses.push({ x: p[0], y: p[1], text: text, color: color || '#f2d474', t0: performance.now() }); }

  // Harta e desenată pe 1200 px, dar pe pagină apare mai mică: textul se scrie la o mărime
  // calculată după lățimea afișată, ca să rămână lizibil (circa 11–13 px pe ecran).
  var txtScale = 1;
  function measureScale(){ var w = cv.clientWidth || CW; var s = Math.max(1, Math.min(2.6, CW / w)); if (Math.abs(s - txtScale) > 0.04) { txtScale = s; labelCache = {}; bgKey = ''; } }

  // Fundalul fix (harta tonifiată, vigneta, limesul, numele fixe) se desenează o singură dată,
  // nu la fiecare cadru; se reface doar când se schimbă stratul de teren sau mărimea textului.
  var bgCv = document.createElement('canvas'); bgCv.width = CW; bgCv.height = CH;
  var GLW = CW / 4, GLH = Math.ceil(CH / 4), glowCv = document.createElement('canvas'); glowCv.width = GLW; glowCv.height = GLH;
  var gctx = glowCv.getContext('2d'), glowImg = gctx.createImageData(GLW, GLH), gd = glowImg.data;
  // punctele, la jumătate de rezoluție: fiecare agent e un pătrat de 2 × 2 pixeli (4 × 4 pe harta mare)
  var DW = CW / 2, DH = Math.ceil(CH / 2), dotCv = document.createElement('canvas'); dotCv.width = DW; dotCv.height = DH;
  var dctx = dotCv.getContext('2d'), dotImg = dctx.createImageData(DW, DH), dot32 = new Uint32Array(dotImg.data.buffer);
  var GRGB = GROUPS.map(function(g){ var h = parseInt(g.color.slice(1), 16); return [h >> 16 & 255, h >> 8 & 255, h & 255]; });
  var G32 = GRGB.map(function(c){ return (0xF0 << 24 | c[2] << 16 | c[1] << 8 | c[0]) >>> 0; });
  function rasterAgents(stp){
    dot32.fill(0); gd.fill(0);
    for (var gi = 0; gi < GROUPS.length; gi++) {
      var r = ranges[gi], col = G32[gi], rgb = GRGB[gi], cr = rgb[0] * 0.28, cg = rgb[1] * 0.28, cb = rgb[2] * 0.28;
      for (var i = r.start; i < r.end; i += stp) {
        var x = ((ax[i] - VB.x) * SC * 0.5) | 0, y = ((ay[i] - VB.y) * SC * 0.5) | 0;
        if (x < 0 || y < 0 || x >= DW - 1 || y >= DH - 1) continue;
        var o = y * DW + x; dot32[o] = col; dot32[o + 1] = col; dot32[o + DW] = col; dot32[o + DW + 1] = col;
        if (!lowFx) { var q = ((y >> 1) * GLW + (x >> 1)) * 4; gd[q] += cr; gd[q + 1] += cg; gd[q + 2] += cb; gd[q + 3] = 255; }
      }
    }
    dctx.putImageData(dotImg, 0, 0);
    if (!lowFx) gctx.putImageData(glowImg, 0, 0);
  }
  var bctx = bgCv.getContext('2d'), bgKey = '';
  function buildBackdrop(){
    var b = bctx;
    b.globalCompositeOperation = 'source-over'; b.globalAlpha = 1;
    b.fillStyle = '#0e0d0b'; b.fillRect(0, 0, CW, CH);
    // harta, mai închisă și mai caldă, ca popoarele colorate să iasă în față
    if ('filter' in b) { b.filter = 'sepia(0.8) saturate(0.62) brightness(0.62) contrast(1.1)'; b.drawImage(baseCv, 0, 0); b.filter = 'none'; }
    else { b.drawImage(baseCv, 0, 0); b.fillStyle = 'rgba(18, 13, 8, 0.5)'; b.fillRect(0, 0, CW, CH); }
    var vg = b.createRadialGradient(CW / 2, CH / 2, CH * 0.32, CW / 2, CH / 2, CW * 0.72);
    vg.addColorStop(0, 'rgba(10,8,6,0)'); vg.addColorStop(1, 'rgba(10,8,6,0.66)');
    b.fillStyle = vg; b.fillRect(0, 0, CW, CH);
    // granulația hârtiei: zgomot fin, desenat o singură dată
    var gn = document.createElement('canvas'); gn.width = gn.height = 96; var gx = gn.getContext('2d'), gd = gx.createImageData(96, 96);
    for (var gi = 0; gi < gd.data.length; gi += 4) { var gv = 120 + Math.random() * 90; gd.data[gi] = gv; gd.data[gi + 1] = gv * 0.86; gd.data[gi + 2] = gv * 0.62; gd.data[gi + 3] = 16; }
    gx.putImageData(gd, 0, 0); b.fillStyle = b.createPattern(gn, 'repeat'); b.fillRect(0, 0, CW, CH);
    // cadrul dublu, ca la hărțile vechi
    b.strokeStyle = 'rgba(212, 175, 55, 0.55)'; b.lineWidth = 2; b.strokeRect(9, 9, CW - 18, CH - 18);
    b.strokeStyle = 'rgba(212, 175, 55, 0.3)'; b.lineWidth = 1; b.strokeRect(15, 15, CW - 30, CH - 30);
    // roza vânturilor, în colțul din dreapta jos
    (function(cx, cy, r){
      b.save(); b.translate(cx, cy); b.strokeStyle = 'rgba(242, 212, 116, 0.55)'; b.fillStyle = 'rgba(242, 212, 116, 0.32)'; b.lineWidth = 1.2;
      b.beginPath(); b.arc(0, 0, r * 0.62, 0, Math.PI * 2); b.stroke();
      for (var k = 0; k < 8; k++) { var a = k * Math.PI / 4, l = k % 2 ? r * 0.55 : r, w = r * 0.12;
        b.beginPath(); b.moveTo(Math.cos(a) * l, Math.sin(a) * l); b.lineTo(Math.cos(a + Math.PI / 2) * w, Math.sin(a + Math.PI / 2) * w); b.lineTo(0, 0); b.closePath(); b.fill(); b.stroke(); }
      b.fillStyle = 'rgba(242, 212, 116, 0.8)'; b.font = 'italic 600 ' + Math.round(r * 0.42) + 'px "Cormorant Garamond", Georgia, serif'; b.textAlign = 'center'; b.fillText('N', 0, -r - 6);
      b.restore();
    })(CW - 70, CH - 120, 34);
    if (layers.terrain) { b.imageSmoothingEnabled = false; b.globalAlpha = 0.7; b.drawImage(terrCv, 0, 0, CW, CH); b.globalAlpha = 1; b.imageSmoothingEnabled = true; }
    // limesul: o linie aurie cu halou
    Object.keys(FRONT).forEach(function(k){
      b.beginPath(); FRONT[k].forEach(function(p, j){ var q = proj(p[0], p[1]), x = (q[0] - VB.x) * SC, y = (q[1] - VB.y) * SC; if (j) b.lineTo(x, y); else b.moveTo(x, y); });
      b.lineCap = 'round'; b.lineJoin = 'round';
      b.setLineDash([]); b.lineWidth = 12; b.strokeStyle = 'rgba(229, 193, 88, 0.14)'; b.stroke();
      b.setLineDash([12, 7]); b.lineWidth = 2.6; b.strokeStyle = 'rgba(242, 212, 116, 0.9)'; b.stroke();
      b.setLineDash([]);
    });
    // pe hărțile foarte mici (telefon) rămân doar numele popoarelor, ca să nu se calce
    if (txtScale < 2.5) {
      label('LIMES · RINUL', proj(49.4, 7.2), '#f2d474', 'right', 11, 0.5, b);
      label('LIMES · DUNĂREA', proj(43.35, 24.4), '#f2d474', 'center', 11, 0.5, b);
      // provinciile și mările, în latină, ca pe o hartă veche
      [['GALLIA', 46.9, 2.6], ['HISPANIA', 40.3, -4.0], ['ITALIA', 42.7, 13.0], ['PANNONIA', 46.9, 17.6], ['THRACIA', 42.1, 26.2], ['GERMANIA', 51.2, 10.5], ['SCYTHIA', 47.6, 39.0], ['DACIA', 46.1, 24.4]].forEach(function(r){ label(r[0], proj(r[1], r[2]), 'rgba(246, 237, 220, 0.5)', 'center', 15, 4, b, true); });
      [['Pontus Euxinus', 43.4, 34.6], ['Mare Nostrum', 37.2, 19.6], ['Oceanus', 46.0, -6.5]].forEach(function(r){ label(r[0], proj(r[1], r[2]), 'rgba(170, 205, 235, 0.6)', 'center', 15, 1, b, true); });
    }
    bgKey = layers.terrain + '|' + txtScale;
  }

  // etichetele: fiecare text e desenat o dată într-o imagine mică, apoi doar copiat
  var labelCache = {};
  function labelSprite(text, color, size, spacing, serif){
    var px = Math.round(size * txtScale), key = text + '|' + color + '|' + px + '|' + spacing + '|' + !!serif, s = labelCache[key];
    if (s) return s;
    var c = document.createElement('canvas'), x = c.getContext('2d'), font = serif ? 'italic 600 ' + px + 'px "Cormorant Garamond", Georgia, serif' : '700 ' + px + 'px "JetBrains Mono", monospace';
    x.font = font; if ('letterSpacing' in x) x.letterSpacing = (spacing * txtScale) + 'px';
    var pad = Math.ceil(px * 0.45), w = Math.ceil(x.measureText(text).width) + pad * 2, h = Math.ceil(px * 1.5) + pad;
    c.width = w; c.height = h;
    x.font = font; if ('letterSpacing' in x) x.letterSpacing = (spacing * txtScale) + 'px';
    x.textBaseline = 'middle'; x.lineJoin = 'round'; x.lineWidth = serif ? Math.max(2, px * 0.16) : Math.max(3, px * 0.32);
    x.strokeStyle = 'rgba(12,10,8,0.92)'; x.strokeText(text, pad, h / 2); x.fillStyle = color; x.fillText(text, pad, h / 2);
    return (labelCache[key] = { c: c, w: w, h: h, pad: pad });
  }
  function label(text, p, color, align, size, spacing, target, serif){
    var s = labelSprite(text, color, size || 13, spacing === undefined ? 0.5 : spacing, serif), c = target || ctx;
    var x = (p[0] - VB.x) * SC, y = (p[1] - VB.y) * SC;
    var left = align === 'center' ? x - s.w / 2 : align === 'right' ? x - s.w + s.pad : x - s.pad;
    c.drawImage(s.c, Math.round(left), Math.round(y - s.h / 2 - s.h * 0.12));
  }

  function draw(){
    if (!visible) { dirty = true; return; }
    dirty = false;
    var now = performance.now();
    measureScale();
    if (bgKey !== layers.terrain + '|' + txtScale) buildBackdrop();
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    ctx.drawImage(bgCv, 0, 0);
    var i, x, y, gi, g, r, stp = lowFx ? 2 : 1;
    // toate punctele, scrise direct ca pixeli: un singur transfer pe cadru, nu mii de apeluri de desen
    rasterAgents(stp);
    // urmele: imaginea punctelor se adaugă, slab, peste urmele care se estompează
    tctx.globalCompositeOperation = 'destination-out'; tctx.fillStyle = 'rgba(0,0,0,0.035)'; tctx.fillRect(0, 0, CW, CH);
    tctx.globalCompositeOperation = 'source-over'; tctx.globalAlpha = 0.3; tctx.imageSmoothingEnabled = false;
    tctx.drawImage(dotCv, 0, 0, CW, CH); tctx.globalAlpha = 1;
    ctx.drawImage(trailCv, 0, 0);
    if (layers.press && pressGrid) {
      for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
        var v = pressGrid[py * PW + px]; if (v < 1) continue;
        ctx.fillStyle = 'rgba(224, 80, 92,' + Math.min(0.5, v / 30) + ')'; ctx.fillRect(px * 10 * SC, py * 10 * SC, 10 * SC, 10 * SC);
      }
    }
    if (layers.flow) {
      var tg = target(GROUPS[flowGroup].id), f = field(tg[1], tg[2]), col = GROUPS[flowGroup].color;
      ctx.fillStyle = 'rgba(10,10,12,0.35)'; ctx.fillRect(0, 0, CW, CH);
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.2;
      for (var gy = 3; gy < GH; gy += 7) for (var gx = 3; gx < GW; gx += 7) {
        var c = gy * GW + gx, ddx = f.dir[c * 2], ddy = f.dir[c * 2 + 1]; if (!ddx && !ddy) continue;
        var cx = (gx + 0.5) * G * SC, cy = (gy + 0.5) * G * SC, l = Math.hypot(ddx, ddy), ex = cx + ddx / l * 10, ey = cy + ddy / l * 10;
        ctx.beginPath(); ctx.moveTo(cx - ddx / l * 6, cy - ddy / l * 6); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.beginPath(); ctx.arc(ex, ey, 2.4, 0, 7); ctx.fill();
      }
      var tq = W2C.apply(null, proj(tg[1], tg[2])); ctx.beginPath(); ctx.arc(tq[0], tq[1], 10, 0, 7); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    }
    // strălucirea: densitatea pe harta mică, întinsă și estompată; miezurile: imaginea punctelor, fără netezire
    if (!lowFx) { ctx.globalCompositeOperation = 'lighter'; ctx.imageSmoothingEnabled = true; ctx.drawImage(glowCv, 0, 0, CW, CH); ctx.globalCompositeOperation = 'source-over'; }
    ctx.imageSmoothingEnabled = false; ctx.drawImage(dotCv, 0, 0, CW, CH); ctx.imageSmoothingEnabled = true;
    // lumea reală (cercuri punctate) și numele popoarelor lângă grupuri
    cents = GROUPS.map(function(gr){ var cc = centroid(gr.id); return W2C(cc[0], cc[1]); });
    if (layers.real && !showCompare) GROUPS.forEach(function(gr){
      var h = interp(HIST[gr.id], t), q4 = W2C.apply(null, proj(h[0], h[1]));
      ctx.setLineDash([5, 4]); ctx.lineWidth = 2.5; ctx.strokeStyle = gr.color;
      ctx.beginPath(); ctx.arc(q4[0], q4[1], 17, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(q4[0], q4[1], 3, 0, 7); ctx.fillStyle = '#fff8e8'; ctx.fill();
    });
    if (showCompare) GROUPS.forEach(function(gr, k){
      var h2 = HIST[gr.id][HIST[gr.id].length - 1], r2 = W2C.apply(null, proj(h2[1], h2[2])), m = cents[k];
      ctx.setLineDash([7, 5]); ctx.lineWidth = 2.4; ctx.strokeStyle = gr.color;
      ctx.beginPath(); ctx.moveTo(m[0], m[1]); ctx.lineTo(r2[0], r2[1]); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(r2[0], r2[1], 15, 0, 7); ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath(); ctx.arc(m[0], m[1], 7, 0, 7); ctx.fillStyle = gr.color; ctx.fill(); ctx.strokeStyle = '#121214'; ctx.lineWidth = 2; ctx.stroke();
      label('în realitate', [r2[0] / SC + VB.x, r2[1] / SC + VB.y + 14], '#fff8e8', 'center', 10);
    });
    if (replayY !== null && cpath) GROUPS.forEach(function(gr, k){
      var n = Math.min(cpath[k].length, Math.floor(replayY - T0) + 1), j;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.setLineDash([6, 6]); ctx.lineWidth = 2; ctx.strokeStyle = gr.color; ctx.globalAlpha = 0.55; ctx.beginPath();
      for (j = 0; j < n; j++) { var h = interp(HIST[gr.id], T0 + j), q = W2C.apply(null, proj(h[0], h[1])); if (j) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }
      ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 0.95; ctx.lineWidth = 3.2; ctx.beginPath();
      for (j = 0; j < n; j++) { if (j) ctx.lineTo(cpath[k][j][0], cpath[k][j][1]); else ctx.moveTo(cpath[k][j][0], cpath[k][j][1]); }
      ctx.lineTo(cents[k][0], cents[k][1]); ctx.stroke(); ctx.globalAlpha = 1;
    });
    // actul II: hunii, încercuiți, ca să se vadă unde îi trimiți
    if (t >= 434.8 && t < 453.3 && !showCompare && replayY === null) { var hc = cents[GI.huni], pr = 30 + 5 * Math.sin(performance.now() / 260);
      ctx.strokeStyle = 'rgba(224, 98, 108, 0.9)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(hc[0], hc[1], pr, 0, 7); ctx.stroke();
      ctx.strokeStyle = 'rgba(224, 98, 108, 0.35)'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(hc[0], hc[1], pr + 6, 0, 7); ctx.stroke(); }
    // numele popoarelor: când două grupuri sunt aproape, etichetele se dau la o parte, cu o linie spre grup
    // (pe hărțile foarte mici, ca pe telefon, rămâne doar legenda colorată)
    var tags = [];
    if (txtScale < 2.2)
    GROUPS.forEach(function(gr, k){
      var m = cents[k]; if (m[0] < 0 || m[0] > CW || m[1] < 0 || m[1] > CH) return;
      var sp = labelSprite(SHORT[gr.id], gr.color, 11, 2);
      tags.push({ s: sp, ax: m[0], ay: m[1], x: m[0] - sp.w / 2, y: m[1] - sp.h - 6 * txtScale, c: gr.color });
    });
    tags.sort(function(a, b){ return b.ay - a.ay; });
    for (var ti = 0; ti < tags.length; ti++) {
      for (var guard = 0; guard < 8; guard++) {
        var hit = false;
        for (var tj = 0; tj < ti; tj++) {
          var A = tags[ti], B = tags[tj];
          if (A.x < B.x + B.s.w && A.x + A.s.w > B.x && A.y < B.y + B.s.h * 0.86 && A.y + A.s.h * 0.86 > B.y) { A.y = B.y - A.s.h * 0.86; hit = true; }
        }
        if (!hit) break;
      }
    }
    tags.forEach(function(tg){
      var ly = tg.y + tg.s.h * 0.62;
      if (tg.ay - ly > 14 * txtScale) { ctx.strokeStyle = tg.c; ctx.globalAlpha = 0.55; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(tg.ax, tg.ay - 3); ctx.lineTo(tg.ax, ly); ctx.stroke(); ctx.globalAlpha = 1; }
      ctx.drawImage(tg.s.c, Math.round(tg.x), Math.round(tg.y));
    });
    // momentele istorice, pe locul lor
    pulses = pulses.filter(function(p){ return now - p.t0 < 4200; });
    pulses.forEach(function(p){
      var k = (now - p.t0) / 4200, q5 = W2C(p.x, p.y);
      for (var rr = 0; rr < 2; rr++) { var kk = (k * 2 + rr * 0.5) % 1; ctx.beginPath(); ctx.arc(q5[0], q5[1], 8 + kk * 46, 0, 7); ctx.strokeStyle = p.color; ctx.globalAlpha = (1 - kk) * (1 - k * 0.6); ctx.lineWidth = 2.5; ctx.stroke(); }
      ctx.globalAlpha = 1 - Math.max(0, k - 0.75) * 4;
      ctx.beginPath(); ctx.arc(q5[0], q5[1], 5, 0, 7); ctx.fillStyle = p.color; ctx.fill();
      label(p.text, [p.x, p.y - 12 - 6 * txtScale], '#fff8e8', 'center', 12);
      ctx.globalAlpha = 1;
    });
  }
  // harta nu se desenează când nu e pe ecran; se redesenează când revine
  var visible = true, dirty = false;
  if ('IntersectionObserver' in window) new IntersectionObserver(function(es){
    visible = es[0].isIntersecting;
    if (visible && dirty && !running) draw();
  }).observe(cv);

  // =====================================================================
  // 10. Bucla, evenimente, decizii, final
  // =====================================================================
  var last = 0, acc = 0, YPS = 1.1, idleRaf = 0, ready = false, prepDone = 0, prepTotal = 1;
  var slowEma = 0, slowN = 0, slowWarned = false, lowFx = false, fpsT0 = 0, fpsN = 0;
  function loop(ts){
    if (!running) return;
    var c0 = performance.now();
    // în primele 2 secunde măsurăm cadrele pe secundă; sub 30, desenul se simplifică
    if (!fpsT0) fpsT0 = c0; else if (fpsN >= 0) { fpsN++; if (c0 - fpsT0 > 2000) { if (fpsN / ((c0 - fpsT0) / 1000) < 30) lowFx = true; fpsN = -1; } }
    var dt = Math.min(0.1, (ts - (last || ts)) / 1000); last = ts;
    // actele I și III au ani lungi fără decizii: între decizii depărtate, timpul trece mai repede; actul II merge cel mult cu 1×
    var nx = decIx < DECISIONS.length ? DECISIONS[decIx].year : T1, actII = t >= 434.8 && t < 453.3;
    acc += dt * YPS * (actII ? Math.min(speed, 1) : speed * (nx - t > 8 ? 1.8 : 1));
    var steps = 0;
    while (acc >= DT && steps < 12) {
      // după o rundă a lui Attila, harta mai rulează ~2,5 s înainte de runda următoare
      if (holdUntil > performance.now() && decIx < DECISIONS.length && t >= DECISIONS[decIx].year - 0.05) { acc = 0; break; }
      acc -= DT; steps++; step(); rec();
      if (checkEvents()) break;
      if (t >= T1) { finish(); break; }
    }
    draw(); updateHud();
    // calculator lent: după ~2 secunde cu cadre de peste 35 ms, propune modul ușor
    slowEma = slowEma * 0.9 + (performance.now() - c0) * 0.1; slowN++;
    if (!LITE && !slowWarned && slowN > 90 && slowEma > 35) { slowWarned = true; toast('Simularea merge greu pe acest calculator', 'Deschide „Straturi” de pe hartă și alege „Mod ușor”: mai puțini agenți, aceeași istorie.'); document.getElementById('mig-lite').classList.add('hint'); document.getElementById('mig-lay').classList.add('hint'); }
    if (running) requestAnimationFrame(loop);
  }
  // pe pauză, harta continuă să fie desenată cât timp mai „pulsează” un moment istoric
  function idle(){ if (running || !pulses.length) { idleRaf = 0; return; } draw(); idleRaf = requestAnimationFrame(idle); }
  var ICON = {
    play: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" fill="currentColor"/></svg>',
    reset: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 8a4.8 4.8 0 1 0 1.5-3.5M3 2.2v3.1h3.1" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  // până se calculează toate drumurile, butoanele de pornire așteaptă
  function prepUi(){
    var go = document.getElementById('mig-go'), au = document.getElementById('mig-auto'), pr = document.getElementById('mig-prep');
    if (go) go.disabled = !ready; if (au) au.disabled = !ready;
    document.getElementById('mig-play').disabled = !ready || finished;
    if (pr) pr.textContent = ready ? '' : 'Se pregătește harta: se calculează drumurile popoarelor (' + Math.round(prepDone / prepTotal * 100) + '%)…';
  }
  function setPlayLabel(){ var b = document.getElementById('mig-play'); b.innerHTML = running ? ICON.pause + 'Pauză' : ICON.play + (finished ? 'Final' : t > T0 + 0.01 ? 'Continuă' : 'Pornește'); b.setAttribute('aria-pressed', running ? 'true' : 'false'); }
  function play(){ if (finished || !ready) return; running = true; last = 0; if (fpsN >= 0) { fpsT0 = 0; fpsN = 0; } setPlayLabel(); requestAnimationFrame(loop); }
  function pause(){ running = false; setPlayLabel(); if (!idleRaf) idleRaf = requestAnimationFrame(idle); }

  function centroid(gid){
    var r = ranges[GI[gid]], sx = 0, sy = 0; for (var i = r.start; i < r.end; i++) { sx += ax[i]; sy += ay[i]; } var n = r.end - r.start; return [sx / n, sy / n];
  }
  function near(gid, lat, lon, km){ var c = centroid(gid), p = proj(lat, lon); return Math.hypot(c[0] - p[0], c[1] - p[1]) * KM < km; }

  function checkEvents(){
    while (decIx < DECISIONS.length && t >= DECISIONS[decIx].year && skipped(DECISIONS[decIx])) {
      var sk = DECISIONS[decIx++];
      if (sk.kind === 'att' && !revolted && sk.west) toast(sk.yl + ' · ' + sk.title + ': nu are loc, pentru că Attila nu a pornit spre Apus (scenariu ipotetic)');
      markTimeline(sk, null);
    }
    if (decIx < DECISIONS.length && t >= DECISIONS[decIx].year) { decide(DECISIONS[decIx]); decIx++; return true; }
    while (eventIx < EVENTS.length && t >= EVENTS[eventIx].year) {
      var e = EVENTS[eventIx++];
      if (e.cond && !e.cond()) {
        if (e.year === 410 && choice.dh === 'B') toast('410 · Roma nu e jefuită: vizigoții au primit pământ în Noricum (scenariu ipotetic)');
        if (e.year === 429 && choice.d2 === 'B') toast('429 · Vandalii rămân dincolo de Rin: nu ajung în Africa (scenariu ipotetic)');
        continue;
      }
      if (e.check === 'gep' && !near('gep', 46.8, 23.6, 250)) continue;
      if (e.fx && e.fx.stab) setStab(stab + e.fx.stab);
      toast(e.t, e.src);
      if (e.at) pulse(e.at, e.place, e.fx && e.fx.stab < 0 ? '#e0626c' : '#f2d474');
      markTimeline(e);
    }
    return false;
  }
  function skipped(d){ return (d.kind === 'att' && (revolted || (d.west && choice.r6 !== 'A'))) || (d.id === 'dh' && choice.d1 === 'A') || (d.id === 'dl' && choice.d2 === 'B'); }
  // stabilitatea pe drumul istoric: aceleași calcule, cu alegerile din istorie
  function histStab(){
    var saved = choice, v = 70;
    choice = {}; DECISIONS.forEach(function(d){ var o = (d.opts || []).filter(function(x){ return x.real; })[0]; if (o && o.set) Object.keys(o.set).forEach(function(k){ choice[k] = o.set[k]; }); });
    DECISIONS.forEach(function(d){ var o = (d.opts || []).filter(function(x){ return x.real; })[0]; if (!o || d.kind === 'act') return; v += (o.fx && o.fx.stab && d.kind !== 'att' ? o.fx.stab : 0) + (o.sim && o.sim.stab ? o.sim.stab : 0); });
    EVENTS.forEach(function(e){ if (e.fx && e.fx.stab && (!e.cond || e.cond())) v += e.fx.stab; });
    choice = saved;
    return Math.max(0, Math.min(100, v));
  }
  function setStab(v){ stab = Math.max(0, Math.min(100, v)); }
  function toast(text, src){
    var el = document.createElement('div'); el.className = 'mig-t'; el.innerHTML = '<b>' + text + '</b>' + (src ? '<small>' + src + '</small>' : '');
    toastEl.appendChild(el); setTimeout(function(){ el.classList.add('out'); }, 4600); setTimeout(function(){ el.remove(); }, 5400);
    while (toastEl.children.length > 3) toastEl.firstChild.remove();
  }

  function verdict(){
    var score = att.loial * 0.4 + att.aur * 0.3 + att.prestigiu * 0.2 + att.cai * 0.1;
    if (revolted) return ['Neamurile supuse s-au răsculat', 'Fără aur și fără loialitate, imperiul s-a destrămat încă din timpul domniei tale. În realitate, asta s-a întâmplat abia după moartea lui Attila, la Nedao.', 0];
    if (att.most >= 50 && att.loial >= 50 && att.aur >= 20) return ['Imperiul tău îți supraviețuiește (scenariu ipotetic)', 'Ai împărțit puterea (moștenire ' + att.most + ') și ai legat neamurile prin altceva decât prin persoana ta, cu loialitate ' + att.loial + ' și aur ' + att.aur + '. Așa, moartea ta nu mai înseamnă sfârșitul. Attila nu a făcut acest lucru.', 2];
    // ce lipsește pentru ca imperiul să supraviețuiască: moștenire 50, loialitate 50, aur 20
    var miss = [];
    if (att.most < 50) miss.push('moștenirea (' + att.most + ' din 50 necesar)');
    if (att.loial < 50) miss.push('loialitatea (' + att.loial + ' din 50 necesar)');
    if (att.aur < 20) miss.push('aurul (' + att.aur + ' din 20 necesar)');
    var why = att.most >= 50 ? ' Ai construit o moștenire (' + att.most + '), dar îți lipsea ' + miss.join(' și ') + '.' : ' Ca să-ți supraviețuiască, imperiului îi lipsea ' + miss.join(', ') + '.';
    if (score >= 50) return ['Un imperiu puternic, care se destramă la moartea ta', 'Ai lăsat renume și neamuri supuse, ca Attila. Dar loialitatea era față de tine, nu față de un stat: fiii tăi își împart neamurile, iar acestea se răscoală, cum s-a întâmplat după 453.' + why, 1];
    var low = [];
    if (att.aur < 20) low.push('aurul s-a terminat (' + att.aur + ')');
    if (att.cai < 40) low.push('caii sunt sleiți (cavalerie ' + att.cai + ')');
    if (att.loial < 50) low.push('neamurile supuse nu mai au motive să-ți urmeze fiii (loialitate ' + att.loial + ')');
    if (att.prestigiu < 30) low.push('nimeni nu se mai teme de numele tău (renume ' + att.prestigiu + ')');
    var lt = low.length ? low.join(', ') : 'niciun indicator nu e destul de puternic';
    return ['Imperiul se prăbușește chiar după moartea ta', lt.charAt(0).toUpperCase() + lt.slice(1) + '.' + why, 0];
  }
  function histAtt(){
    var h = Object.assign({}, ATT0);
    ROUNDS.forEach(function(r){ var c = r.opts.filter(function(x){ return x.real; })[0]; attFx(h, c.fx); h.aur = Math.max(0, h.aur - UPKEEP); if (h.aur < 15) h.loial = Math.max(0, h.loial - 10); });
    return h;
  }
  function attFx(st, fx){ Object.keys(fx || {}).forEach(function(k){ st[k] = Math.max(0, Math.min(100, st[k] + fx[k])); }); }
  function meterChips(d, ds){
    return '<div class="imp-fx">' + METERS.filter(function(m){ return d[m.k]; }).map(function(m){ var v = d[m.k]; return '<span class="' + (v > 0 ? 'up' : 'down') + '">' + m.label + ' ' + (v > 0 ? '+' : '') + v + '</span>'; }).join('') +
      (ds ? '<span class="' + (ds > 0 ? 'up' : 'down') + '">Imperiul ' + (ds > 0 ? '+' : '') + ds + '</span>' : '') + '</div>';
  }
  function dialog(html, label, side){
    over.className = 'mig-over show big' + (side ? ' side' : '');
    over.innerHTML = '<div class="mig-dec" role="dialog" aria-modal="true" aria-labelledby="' + label + '">' + html + '</div>';
  }
  function quote(d){ return d.q ? '<blockquote class="imp-q"><p>„' + d.q + '”</p><cite>' + d.qs + ' · traducere adaptată</cite></blockquote>' : ''; }
  function cont(text){ return '<div class="mig-end-btns"><button class="jg-btn" id="mig-cont" type="button">' + text + '</button></div>'; }
  var holdUntil = 0;
  function onCont(fn){ var b = document.getElementById('mig-cont'); b.addEventListener('click', function(){ over.className = 'mig-over'; over.innerHTML = ''; fn(); if (t >= 434.8 && t < 453.3) holdUntil = performance.now() + 2600; play(); document.getElementById('mig-play').focus({ preventScroll: true }); }); b.focus({ preventScroll: true }); }

  function decide(d){
    pause();
    if (d.at) pulse(d.at, d.place, d.kind === 'att' ? '#e0626c' : null);
    if (auto) { var o = d.opts.filter(function(x){ return x.real; })[0]; apply(d, o); if (d.kind === 'att') toast(d.yl + ' · ' + d.title + ': ' + o.t.charAt(0).toLowerCase() + o.t.slice(1), d.src); if (d.kind === 'act') toast(d.title); setTimeout(play, 700); return; }
    if (d.kind === 'act') { apply(d, d.opts[0]); return actDialog(d); }
    if (d.kind === 'att') return roundDialog(d);
    over.className = 'mig-over show big side';
    over.innerHTML = '<div class="mig-dec" role="dialog" aria-modal="true" aria-labelledby="mig-dt">' + picHtml(d.pic) + '<h3 id="mig-dt"><span class="mig-yr">' + Math.floor(d.year) + '</span>' + d.title + '</h3><p class="mig-who">' + d.who + '</p><p>' + d.text + (d.more ? ' <b>' + d.more() + '</b>' : '') + '</p>' +
      '<div class="jg-choices">' + d.opts.map(function(o, i){ return '<button class="jg-choice" type="button" data-i="' + i + '"><i>' + 'ABC'[i] + '</i><span>' + o.t + '</span></button>'; }).join('') + '</div>' +
      '<p class="jg-src">Sursa: ' + d.src + '</p></div>';
    Array.prototype.forEach.call(over.querySelectorAll('.jg-choice'), function(b){
      b.addEventListener('click', function(){
        var i = +b.getAttribute('data-i'), o = d.opts[i], ro = d.opts.filter(function(x){ return x.real; })[0];
        Array.prototype.forEach.call(over.querySelectorAll('.jg-choice'), function(x, k){
          x.disabled = true; if (k === i) x.classList.add('picked');
          if (d.opts[k].real) { x.classList.add('attila'); x.insertAdjacentHTML('beforeend', '<em class="imp-tag">Alegerea din istorie</em>'); }
        });
        var before = stab; apply(d, o); var ds = Math.round(stab - before);
        var out = document.createElement('div'); out.setAttribute('aria-live', 'polite');
        out.innerHTML = '<div class="jg-reveal" style="--c:#c9b48a"><h3>' + (o.real ? 'Ai ales ce s-a întâmplat în istorie' : 'Ce s-a întâmplat în realitate') + '</h3>' +
          (ds ? '<div class="imp-fx"><span class="' + (ds > 0 ? 'up' : 'down') + '">Stabilitatea Imperiului ' + (ds > 0 ? '+' : '') + ds + '</span></div>' : '') +
          (o.real ? '' : '<p><i>' + (o.note || 'Alegerea ta schimbă drumul popoarelor (scenariu ipotetic).') + '</i></p>') +
          '<p>' + (o.real ? (o.note || '') : (ro ? ro.t + '. ' + (ro.note || '') : '')) + '</p>' + quote(d) + '</div>' + cont('Continuă →');
        over.querySelector('.mig-dec').appendChild(out);
        onCont(function(){});
        if (out.scrollIntoView) out.scrollIntoView({ block: 'nearest' });
      });
    });
    var fb = over.querySelector('.jg-choice'); if (fb) fb.focus({ preventScroll: true });
  }
  function actDialog(d){
    var h, btn;
    if (d.id === 'a2') {
      h = picHtml(d.pic) + '<h3 id="mig-dt"><span class="mig-yr">434</span>' + d.title + '</h3><p class="mig-who">Regele Rua a murit · opt momente reale, 435–452</p>' +
        '<p>Hunii stăpânesc acum Câmpia Panonică. De aici înainte nu mai ești de partea Romei: ești Attila. Opt momente din istoria hunilor, la fiecare trei decizii; după fiecare afli ce s-a întâmplat în realitate și din ce izvor știm. Alegerile tale mută hunii pe hartă și schimbă stabilitatea Imperiului.</p>' +
        '<p class="mig-note">Etichetele arată schimbarea totală după fiecare rundă, cu darurile pentru războinici (aur −' + UPKEEP + ') incluse.</p><ul class="jg-how">' + METERS.map(function(m){ return '<li><b style="color:' + m.c + '">' + ico(m.k) + m.label + '</b>' + m.hint.charAt(0).toUpperCase() + m.hint.slice(1) + (/[.…]$/.test(m.hint) ? '' : '.') + '</li>'; }).join('') + '</ul>' +
        '<p>După fiecare rundă, războinicii trebuie răsplătiți: aurul scade cu ' + UPKEEP + '. Dacă loialitatea neamurilor supuse coboară la 10, se răscoală înainte de vreme. Și gândește-te din timp: ce rămâne din imperiu după tine?</p>';
      btn = 'Începe domnia →';
    } else {
      var v = verdict();
      h = picHtml(d.pic) + '<h3 id="mig-dt"><span class="mig-yr">453</span>' + d.title + '</h3><p class="mig-who">' + (revolted ? 'Domnia ta s-a încheiat mai devreme' : 'Attila moare în noaptea nunții cu Ildico') + '</p>' +
        '<p class="imp-verdict">' + v[0] + '</p><p>' + v[1] + '</p>' + attTable() +
        '<p>Acum ești Ardaric, regele gepizilor, unul dintre cei mai de încredere oameni ai lui Attila. Simularea merge mai departe, până la sfârșitul Imperiului de Apus, în 476.</p>';
      btn = 'Continuă: ești Ardaric →';
    }
    dialog(h + cont(btn), 'mig-dt');
    onCont(function(){});
  }
  function attTable(){
    var hs = histAtt();
    return '<div class="mig-attcmp">' + METERS.map(function(m){ return '<span><b>' + ico(m.k) + m.label + '</b><i style="--c:' + m.c + '"><s style="width:' + att[m.k] + '%"></s></i>' + att[m.k] + '<small>Attila: ' + hs[m.k] + '</small></span>'; }).join('') + '</div>';
  }
  function roundDialog(d){
    var n = ROUNDS.indexOf(d) + 1;
    dialog(picHtml(d.pic) + '<h3 id="mig-dt"><span class="mig-yr">' + d.yl + '</span>' + d.title + '</h3><p class="mig-who">Ești Attila · runda ' + n + ' din ' + ROUNDS.length + ' · ' + d.place + '</p><p>' + d.text + '</p>' +
      '<div class="jg-choices" id="mig-ch">' + d.opts.map(function(o, i){ return '<button class="jg-choice" type="button" data-i="' + i + '"><i>' + 'ABC'[i] + '</i><span>' + o.t + '</span></button>'; }).join('') + '</div><div id="mig-out" aria-live="polite"></div>', 'mig-dt', true);
    Array.prototype.forEach.call(over.querySelectorAll('#mig-ch .jg-choice'), function(b){
      b.addEventListener('click', function(){
        var i = +b.getAttribute('data-i'), o = d.opts[i];
        Array.prototype.forEach.call(over.querySelectorAll('#mig-ch .jg-choice'), function(x, k){
          x.disabled = true; if (k === i) x.classList.add('picked');
          if (d.opts[k].real) { x.classList.add('attila'); x.insertAdjacentHTML('beforeend', '<em class="imp-tag">Alegerea lui Attila</em>'); }
        });
        var r = apply(d, o), last = n === ROUNDS.length;
        document.getElementById('mig-out').innerHTML = '<div class="jg-reveal" style="--c:#c9b48a"><h3>' + (o.real ? 'Ai ales ce a ales și Attila' : 'Ce s-a întâmplat în realitate') + '</h3>' + meterChips(r.delta, o.sim && o.sim.stab) +
          (r.poor ? '<p class="imp-warn">Aurul nu mai ajunge pentru darurile căpeteniilor: loialitate −10.</p>' : '') +
          (revolted ? '<p class="imp-warn"><b>Neamurile supuse se răscoală.</b> Domnia ta se încheie aici; hunii se întorc în Câmpia Panonică.</p>' : att.loial < 30 ? '<p class="imp-warn"><b>Atenție:</b> loialitatea neamurilor e ' + att.loial + '. La 10, se răscoală și domnia ta se încheie.</p>' : '') +
          '<p>' + d.real + '</p>' + quote(d) +
          '<p class="jg-src">Sursa: ' + d.src + '</p></div>' + cont(revolted || last ? 'Mai departe →' : 'Continuă spre runda următoare →');
        onCont(function(){});
        var out = document.getElementById('mig-out'); if (out.scrollIntoView) out.scrollIntoView({ block: 'nearest' });
      });
    });
    var fb = over.querySelector('.jg-choice'); if (fb) fb.focus({ preventScroll: true });
  }
  function apply(d, o){
    if (d.kind === 'act') { markTimeline(d, true); return; }
    if (d.kind === 'att') {
      var before = Object.assign({}, att), poor = false;
      attFx(att, o.fx); att.aur = Math.max(0, att.aur - UPKEEP);
      if (att.aur < 15) { att.loial = Math.max(0, att.loial - 10); poor = true; }
      if (att.loial <= 10) revolted = true;
      var delta = {}; METERS.forEach(function(m){ var x = att[m.k] - before[m.k]; if (x) delta[m.k] = x; });
      if (o.set) Object.keys(o.set).forEach(function(k){ choice[k] = o.set[k]; });
      attPicks.push({ d: d, o: o });
      if (o.sim && o.sim.stab) setStab(stab + o.sim.stab);
      buildPlans();
      log.push({ y: d.yl, title: d.title, t: o.t, real: !!o.real, att: true });
      renderLog(); markTimeline(d, o.real); updateAtt(delta);
      if (revolted) toast('Neamurile supuse se răscoală: domnia lui Attila se încheie mai devreme (scenariu ipotetic)');
      return { delta: delta, poor: poor };
    }
    Object.keys(o.set).forEach(function(k){ choice[k] = o.set[k]; });
    if (o.fx && o.fx.stab) setStab(stab + o.fx.stab);
    buildPlans();
    log.push({ y: Math.floor(d.year), title: d.title, t: o.t, real: !!o.real, note: o.note });
    renderLog(); markTimeline(d, o.real);
  }
  function renderLog(){
    var el = document.getElementById('mig-log');
    el.innerHTML = log.length ? log.map(function(l){ return '<li class="' + (l.real ? '' : 'alt') + (l.att ? ' att' : '') + '"><b>' + l.y + ' · ' + l.title + '</b><span>' + l.t + '</span><em>' + (l.real ? 'ca în istorie' : 'altă istorie') + '</em></li>'; }).join('') : '<li class="empty">Deciziile tale apar aici, pe măsură ce le iei.</li>';
  }

  // cronologia de sub hartă
  var tlEl = document.getElementById('mig-tl');
  function pct(y){ return ((y - T0) / (T1 - T0) * 100).toFixed(2) + '%'; }
  function buildTimeline(){
    var h = '<div class="mig-tl-track"><i class="mig-tl-fill" id="mig-tl-fill"></i></div>';
    [375, 400, 425, 450, 475].forEach(function(y){ h += '<span class="mig-tl-tick" style="left:' + pct(y) + '">' + y + '</span>'; });
    EVENTS.forEach(function(e, i){ h += '<span class="mig-tl-ev" data-e="' + i + '" style="left:' + pct(e.year) + '" title="' + e.t.replace(/"/g, '&quot;') + '"></span>'; });
    DECISIONS.forEach(function(d, i){ if (d.kind === 'act') return; h += '<span class="mig-tl-dec' + (d.kind === 'att' ? ' att' : '') + '" data-d="' + i + '" style="left:' + pct(d.year) + '" title="' + (d.yl || Math.floor(d.year)) + ' · ' + d.title + '"><b>' + Math.floor(d.year) + '</b></span>'; });
    h += '<span class="mig-tl-head" id="mig-tl-head"></span>';
    tlEl.innerHTML = h;
  }
  function markTimeline(item, real){
    var di = DECISIONS.indexOf(item), ei = EVENTS.indexOf(item);
    if (di !== -1) { var d = tlEl.querySelector('[data-d="' + di + '"]'); if (d) d.className = 'mig-tl-dec' + (item.kind === 'att' ? ' att' : '') + (real === null ? ' skip' : ' done' + (real ? '' : ' alt')); }
    if (ei !== -1) { var e = tlEl.querySelector('[data-e="' + ei + '"]'); if (e) e.className = 'mig-tl-ev done'; }
  }
  function resetTimeline(){ buildTimeline(); }

  function updateAtt(fx){
    var box = document.getElementById('mig-att'); if (!box) return;
    box.hidden = t < 434.8;
    METERS.forEach(function(m){
      var el = document.getElementById('mig-m-' + m.k); if (!el) return;
      el.querySelector('b').textContent = att[m.k]; el.querySelector('.jg-bar i').style.width = att[m.k] + '%';
      el.classList.toggle('low', m.k !== 'most' && att[m.k] < 20);
      var d = fx && fx[m.k], dl = el.querySelector('.jg-delta');
      if (d) { dl.textContent = (d > 0 ? '+' : '') + d; dl.className = 'jg-delta'; void dl.offsetWidth; dl.className = 'jg-delta show ' + (d > 0 ? 'up' : 'down'); }
    });
  }
  function updateHud(){
    var ab = document.getElementById('mig-att'); if (ab && ab.hidden !== (t < 434.8)) updateAtt();
    document.getElementById('mig-year').textContent = Math.min(T1, Math.floor(t));
    document.getElementById('mig-stab-v').textContent = Math.round(stab);
    var sb = document.getElementById('mig-stab'); sb.style.width = stab + '%'; sb.style.background = stab < 35 ? '#e0626c' : stab < 60 ? '#e5c158' : '#8fbd82';
    var p = pct(Math.min(T1, t)), fill = document.getElementById('mig-tl-fill'), head = document.getElementById('mig-tl-head');
    if (fill) fill.style.width = p; if (head) head.style.left = p;
    if (!updateHud.n || ++updateHud.n % 20 === 0) {
      GROUPS.forEach(function(g){ var el = document.getElementById('mig-where-' + g.id); if (el) el.textContent = regionOf(centroid(g.id)); });
      updateHud.n = updateHud.n || 1;
    }
  }
  function regionOf(p){
    var best = null, bd = Infinity;
    REGIONS.forEach(function(r){ var q = proj(r[1], r[2]), d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d < bd) { bd = d; best = r[0]; } });
    return best;
  }

  // informații la trecerea mouse-ului (sau la atingere) peste un popor
  var tip = document.getElementById('mig-tip');
  function showTip(ev){
    var rect = cv.getBoundingClientRect(), mx = (ev.clientX - rect.left) * CW / rect.width, my = (ev.clientY - rect.top) * CH / rect.height;
    var best = -1, bd = 70;
    cents.forEach(function(c, gi){ var d = Math.hypot(c[0] - mx, c[1] - my); if (d < bd) { bd = d; best = gi; } });
    if (best === -1) { tip.hidden = true; return; }
    var g = GROUPS[best], r = ranges[best], inside = 0;
    for (var i = r.start; i < r.end; i++) if (crossed[i]) inside++;
    var h = interp(HIST[g.id], t), hp = proj(h[0], h[1]);
    tip.innerHTML = '<b style="color:' + g.color + '">' + g.name + '</b><span>Acum: ' + regionOf(centroid(g.id)) + '</span><span>În realitate: ' + regionOf(hp) + '</span><span>Au trecut granița: ' + Math.round(inside / g.n * 100) + '%</span>';
    tip.hidden = false;
    var x = ev.clientX - rect.left + 14, y = ev.clientY - rect.top + 14;
    tip.style.left = Math.min(x, rect.width - 220) + 'px'; tip.style.top = Math.min(y, rect.height - 96) + 'px';
  }
  cv.addEventListener('mousemove', showTip);
  cv.addEventListener('click', showTip);
  cv.addEventListener('mouseleave', function(){ tip.hidden = true; });

  function finish(){
    pause(); if (!finished) rec(); finished = true; t = T1; showCompare = true; updateHud(); draw(); setPlayLabel();
    // drumul fiecărui popor, an de an (centrul grupului), pentru reluare
    cpath = GROUPS.map(function(g, gi){ var r = ranges[gi]; return snaps.map(function(a){ var sx = 0, sy = 0; for (var i = r.start; i < r.end; i++) { sx += a[i]; sy += a[N + i]; } return W2C(sx / g.n, sy / g.n); }); });
    var ttl = titles(allRealOf(), verdict());
    toastEl.innerHTML = '';
    document.getElementById('mig-play').disabled = true;
    var allReal = allRealOf(), v = verdict();
    var far = [];
    var rows = GROUPS.map(function(g){
      var c = centroid(g.id), h = HIST[g.id][HIST[g.id].length - 1], hp = proj(h[1], h[2]);
      var km = Math.round(Math.hypot(c[0] - hp[0], c[1] - hp[1]) * KM / 50) * 50;
      if (km > 300) far.push(g.name.split(',')[0].toLowerCase() + ' au ajuns la ~' + km.toLocaleString('ro-RO') + ' km');
      return '<tr><td><i style="background:' + g.color + '"></i>' + g.name + '</td><td>' + regionOf(c) + '</td><td>' + regionOf(hp) + '</td><td class="num">' + (km <= 150 ? 'același loc' : '~' + km.toLocaleString('ro-RO') + ' km') + '</td></tr>';
    }).join('');
    var hs = Math.round(histStab()), st = Math.round(stab), dst = st - hs;
    document.documentElement.classList.remove('mig-playing');
    over.className = 'mig-over show big';
    over.innerHTML = '<div class="mig-dec mig-end" role="dialog" aria-labelledby="mig-et"><h3 id="mig-et"><span class="mig-yr">476</span>' + (allReal ? 'Ai urmat drumul istoric. Iată cât de aproape a ajuns modelul.' : 'Ai scris o altă istorie') + '</h3>' +
      '<p class="mig-who">Sfârșitul Imperiului Roman de Apus. Pe hartă, fiecare linie unește lumea ta de lumea reală.</p>' +
      '<div class="mig-title"><small>Titlul tău</small><b>' + ttl[0].n + '</b><span>' + ttl[0].d + '</span></div>' +
      '<table class="mig-table"><thead><tr><th>Popor</th><th>Lumea ta</th><th>Lumea reală</th><th>Distanța</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<p class="mig-lesson">' + (allReal ? 'Aceleași decizii, aceeași istorie: presiunea hunilor și slăbirea granițelor au împins popoarele, unele după altele, în Imperiu.' : 'Ce s-a schimbat prin deciziile tale? Istoricii pun aceeași întrebare când discută dacă hunii au provocat căderea Romei sau doar au grăbit-o.') + '</p>' +
      '<p class="mig-stats">' + (allReal ? 'Stabilitatea Imperiului: <b>' + st + '</b>, ca pe drumul istoric.' : dst >= 8 ? 'Cu stabilitatea <b>' + st + '</b>, mai mare decât în istorie (' + hs + '), Imperiul de Apus ar fi putut rezista câțiva ani în plus (scenariu ipotetic).' : dst <= -8 ? 'Cu stabilitatea <b>' + st + '</b>, mai mică decât în istorie (' + hs + '), Imperiul de Apus s-ar fi prăbușit probabil mai devreme (scenariu ipotetic).' : 'Stabilitatea <b>' + st + '</b> e apropiată de cea din istorie (' + hs + '): deciziile tale au schimbat drumurile popoarelor, nu și soarta Imperiului de Apus.') + '</p>' +
      (allReal && far.length ? '<p class="mig-stats">Cu aceleași decizii, modelul nu reproduce perfect toate drumurile: ' + far.join(', iar ') + ' de locul real. E o simplificare, nu o reconstituire.</p>' : '') +
      '<h4 class="mig-end-h">Imperiul lui Attila: ' + v[0].charAt(0).toLowerCase() + v[0].slice(1) + '</h4>' + attTable() +
      '<ul class="imp-lessons">' + LESSONS.map(function(l){ return '<li>' + l + '</li>'; }).join('') + '</ul>' +
      '<div class="mig-end-btns"><button class="jg-btn" id="mig-card" type="button">Cronica ta (imagine)</button><button class="jg-btn ghost" id="mig-hide" type="button">Revezi totul pe hartă</button><button class="jg-btn ghost" id="mig-again" type="button">' + ICON.reset + 'Joacă din nou</button><button class="jg-btn ghost" id="mig-hist" type="button">Arată istoria reală</button></div></div>';
    document.getElementById('mig-again').addEventListener('click', function(){ auto = false; restart(); intro(); });
    document.getElementById('mig-hist').addEventListener('click', function(){ auto = true; restart(); play(); });
    document.getElementById('mig-hide').addEventListener('click', function(){
      var d = over.querySelector('.mig-end'); var hid = d.classList.toggle('min'); over.className = 'mig-over show ' + (hid ? 'dock' : 'big'); this.textContent = hid ? 'Arată rezultatul' : 'Revezi totul pe hartă';
      // pe hartă: reluarea pornește de la 370; la întoarcere, harta rămâne pe 476
      if (hid) { replayShow(true); replayGo(T0); replayPlay(true); } else { replayShow(false); replayGo(T1); }
    });
    document.getElementById('mig-card').addEventListener('click', function(){ showCard(ttl, v); });
  }
  function allRealOf(){ return log.length > 0 && log.every(function(l){ return l.real; }); }
  // titlul jucătorului, după alegerile cele mai neobișnuite (primul care se potrivește e titlul principal)
  function titles(allReal, v){
    var pick = function(id){ var x = attPicks.filter(function(p){ return p.d.id === id; })[0]; return x ? 'ABC'[x.d.opts.indexOf(x.o)] : null; }, L = [];
    if (allReal) L.push({ n: 'Cronicarul fidel', d: 'Ai luat fiecare decizie ca în istorie. Lumea ta e cea din cărți.' });
    if (choice.dh === 'B') L.push({ n: 'Salvatorul Romei', d: 'Ca Honorius, le-ai dat vizigoților pământ: Roma nu e jefuită în 410.' });
    if (choice.d1 === 'A') L.push({ n: 'Împăratul primitor', d: 'Ca Valens, i-ai hrănit pe goți: fără răscoală și fără Adrianopol.' });
    if (choice.d1 === 'C') L.push({ n: 'Paznicul Dunării', d: 'Ca Valens, ai închis granița în fața goților.' });
    if (choice.d2 === 'B') L.push({ n: 'Străjerul Rinului', d: 'Ca Stilicho, ai lăsat armata pe Rin: vandalii nu ajung nici în Galia, nici în Africa.' });
    if (v[2] === 2) L.push({ n: 'Attila întemeietorul', d: 'Imperiul hunilor îți supraviețuiește. Attila nu a reușit asta.' });
    if (revolted) L.push({ n: 'Attila cel părăsit', d: 'Neamurile supuse s-au răsculat încă din timpul domniei tale.' });
    if (pick('r4') === 'A') L.push({ n: 'Asediatorul Constantinopolului', d: 'Ca Attila, ai atacat capitala Răsăritului când zidurile erau la pământ.' });
    if (choice.r6 === 'B') L.push({ n: 'Attila al Răsăritului', d: 'Nu ai pornit spre Apus: fără Câmpiile Catalaunice, fără Italia.' });
    if (choice.r6 === 'C') L.push({ n: 'Attila cel răbdător', d: 'În 450 ai așteptat și ți-ai refăcut caii.' });
    if (pick('r8') === 'A') L.push({ n: 'Attila la porțile Romei', d: 'În 452 ai mers spre Roma, nu înapoi spre casă.' });
    if (choice.d5 === 'B') L.push({ n: 'Ardaric cel credincios', d: 'Ca Ardaric, ai rămas alături de fiii lui Attila: fără Nedao.' });
    if (choice.d5 === 'C') L.push({ n: 'Ardaric pribeagul', d: 'Ca Ardaric, ți-ai dus neamul spre apus.' });
    if (choice.dl === 'B') L.push({ n: 'Leon împăciuitorul', d: 'Ca Leon I, ai făcut pace cu vandalii: fără dezastrul de la Capul Bon.' });
    if (!L.length) L.push({ n: 'Cronicarul unei alte istorii', d: 'Câteva alegeri diferite au fost de ajuns ca popoarele să o ia pe alte drumuri.' });
    return L;
  }

  // reluarea: pozițiile înregistrate, cu trecere lină între doi ani
  function replayGo(y){
    if (!snaps.length) return;
    y = Math.max(T0, Math.min(T1, y)); var i = Math.min(snaps.length - 1, Math.floor(y - T0)), f = y - T0 - i, a = snaps[i], b = snaps[Math.min(snaps.length - 1, i + 1)];
    if (replayY === null || Math.abs(y - replayY) > 1.5) tctx.clearRect(0, 0, CW, CH);
    for (var k = 0; k < N; k++) { ax[k] = a[k] + (b[k] - a[k]) * f; ay[k] = a[N + k] + (b[N + k] - a[N + k]) * f; }
    replayY = y >= T1 ? null : y; t = y; showCompare = y >= T1;
    document.getElementById('mig-year').textContent = Math.floor(y);
    document.getElementById('mig-rp').value = Math.floor(y); document.getElementById('mig-rp-y').textContent = Math.floor(y);
    var pc = pct(y), fill = document.getElementById('mig-tl-fill'), head = document.getElementById('mig-tl-head'); if (fill) fill.style.width = pc; if (head) head.style.left = pc;
    draw();
  }
  function replayPlay(on){
    cancelAnimationFrame(replayRaf); replayRaf = 0; var tok = ++replayTok;
    var b = document.getElementById('mig-rp-play'), lb = on ? 'Oprește reluarea' : 'Pornește reluarea';
    b.innerHTML = on ? ICON.pause : ICON.play; b.setAttribute('aria-label', lb); b.title = lb;
    if (!on) return;
    var y = replayY === null ? T0 : replayY, l0 = 0;
    (function fr(ts){
      if (tok !== replayTok) return;
      var dt = l0 ? Math.min(0.1, (ts - l0) / 1000) : 0; l0 = ts;
      y += dt * 9; replayGo(y);
      if (y < T1) replayRaf = requestAnimationFrame(fr); else replayPlay(false);
    })(0);
  }
  function replayShow(on){ document.getElementById('mig-replay').hidden = !on; if (!on) replayPlay(false); }

  // cronica: o imagine cu titlul, harta finală și deciziile, de salvat sau de tipărit
  function showCard(ttl, v){
    replayShow(false); replayGo(T1);
    var W = 1200, P = 56, cvs = document.createElement('canvas'); cvs.width = W; cvs.height = 2400;
    var c = cvs.getContext('2d'), y = 0, MW = W - P * 2;
    var fit = function(txt, mw){ if (c.measureText(txt).width <= mw) return txt; while (txt.length > 1 && c.measureText(txt + '…').width > mw) txt = txt.slice(0, -1); return txt.replace(/\s+\S*$/, '') + '…'; };
    var wrap = function(txt, x, mw, lh){ var w = txt.split(' '), line = ''; w.forEach(function(word){ var tst = line ? line + ' ' + word : word; if (c.measureText(tst).width > mw && line) { c.fillText(line, x, y); y += lh; line = word; } else line = tst; }); if (line) { c.fillText(line, x, y); y += lh; } };
    c.fillStyle = '#16120d'; c.fillRect(0, 0, W, cvs.height);
    c.textBaseline = 'alphabetic';
    y = P + 14; c.fillStyle = '#d4af37'; c.font = '700 18px "JetBrains Mono", monospace'; c.fillText('ATELIERUL HUNILOR · ATTILA ȘI MAREA MIGRAȚIE · 370–476', P, y);
    y += 60; c.fillStyle = '#f2d474'; c.font = '700 54px "Cinzel", Georgia, serif'; c.fillText(fit(ttl[0].n, MW), P, y);
    y += 44; c.fillStyle = '#e8dcc4'; c.font = 'italic 26px "Source Serif 4", Georgia, serif'; wrap(ttl[0].d, P, MW, 34);
    if (ttl.length > 1) { y += 4; c.fillStyle = '#b8a888'; c.font = '20px "Source Serif 4", Georgia, serif'; wrap('Și: ' + ttl.slice(1, 4).map(function(x){ return x.n; }).join(' · '), P, MW, 28); }
    y += 16; var mh = Math.round(MW * CH / CW); c.drawImage(cv, P, y, MW, mh); c.strokeStyle = 'rgba(212, 175, 55, 0.6)'; c.lineWidth = 2; c.strokeRect(P, y, MW, mh); y += mh + 52;
    c.fillStyle = '#d4af37'; c.font = '700 22px "Cinzel", Georgia, serif'; c.fillText('Deciziile tale', P, y); y += 40;
    log.forEach(function(l){
      c.font = '700 20px "JetBrains Mono", monospace'; c.fillStyle = l.real ? '#8fbd82' : '#e5c158'; c.fillText(l.real ? 'ca în istorie' : 'altă istorie', W - P - c.measureText(l.real ? 'ca în istorie' : 'altă istorie').width, y);
      c.fillStyle = '#9d907a'; c.fillText((String(l.y).match(/\d{3}/) || [''])[0], P, y);
      c.font = '700 22px "Source Serif 4", Georgia, serif'; c.fillStyle = '#f0e2c6'; var head = l.title + ': '; c.fillText(head, P + 64, y);
      var hw = c.measureText(head).width; c.font = '22px "Source Serif 4", Georgia, serif'; c.fillStyle = '#d6c9b0'; c.fillText(fit(l.t, MW - 64 - hw - 190), P + 64 + hw, y);
      y += 36;
    });
    var hs = Math.round(histStab()), st = Math.round(stab), nr = log.filter(function(l){ return l.real; }).length;
    y += 22; c.fillStyle = 'rgba(212, 175, 55, 0.35)'; c.fillRect(P, y - 30, MW, 1); y += 16;
    c.font = '24px "Source Serif 4", Georgia, serif'; c.fillStyle = '#f0e2c6';
    wrap(nr + ' din ' + log.length + ' decizii ca în istorie. Stabilitatea Imperiului: ' + st + ' (în istorie: ' + hs + '). Imperiul lui Attila: ' + v[0].charAt(0).toLowerCase() + v[0].slice(1) + '.', P, MW, 34);
    y += 18; c.fillStyle = '#8a7e68'; c.font = '17px "JetBrains Mono", monospace'; c.fillText('cojocariuemilian73.github.io/atelierul-hunilor · un model simplificat, nu o reconstituire', P, y);
    y += P - 10;
    var out = document.createElement('canvas'); out.width = W; out.height = y; var oc = out.getContext('2d'); oc.drawImage(cvs, 0, 0);
    oc.strokeStyle = 'rgba(212, 175, 55, 0.7)'; oc.lineWidth = 3; oc.strokeRect(14, 14, W - 28, y - 28); oc.strokeStyle = 'rgba(212, 175, 55, 0.3)'; oc.lineWidth = 1; oc.strokeRect(22, 22, W - 44, y - 44);
    var url = out.toDataURL('image/png'), end = over.innerHTML, cls = over.className;
    over.className = 'mig-over show big';
    over.innerHTML = '<div class="mig-dec mig-card" role="dialog" aria-modal="true" aria-labelledby="mig-ct"><h3 id="mig-ct">Cronica ta</h3><p class="mig-who">O poți salva ca imagine, ca s-o arăți colegilor sau s-o tipărești.</p>' +
      '<img src="' + url + '" alt="Cronica ta: ' + ttl[0].n + ', harta finală și deciziile luate">' +
      '<div class="mig-end-btns"><a class="jg-btn" id="mig-save" href="' + url + '" download="cronica-attila-si-marea-migratie.png">Salvează imaginea</a><button class="jg-btn ghost" id="mig-back" type="button">Înapoi la rezultat</button></div></div>';
    document.getElementById('mig-back').addEventListener('click', function(){ finish(); });
    document.getElementById('mig-save').focus({ preventScroll: true });
  }
  function playing(on){ document.documentElement.classList.toggle('mig-playing', on); }
  function restart(){ replayShow(false); over.className = 'mig-over'; over.innerHTML = ''; showCompare = false; pulses = []; document.getElementById('mig-play').disabled = !ready; reset(); resetTimeline(); setPlayLabel(); }

  function intro(){
    over.className = 'mig-over show';
    over.innerHTML = '<div class="mig-dec mig-intro" role="dialog" aria-modal="true" aria-labelledby="mig-it"><h3 id="mig-it">Attila și Marea Migrație</h3>' +
      '<p class="mig-who">370–476 · trei acte · o hartă reală</p>' +
      '<p>Sute de puncte sunt popoare în mișcare. Istoria se oprește din când în când și decizi tu.</p>' +
      '<ol class="mig-acts"><li><b>Actul I, 370–434: Roma în fața valului.</b> Ești împăratul Valens, generalul Stilicho și împăratul Honorius.</li><li><b>Actul II, 435–452: ești Attila.</b> Opt momente reale; hunii merg pe hartă unde îi trimiți.</li><li><b>Actul III, 453–476: după Attila.</b> Ești Ardaric, regele gepizilor, apoi împăratul Leon I.</li></ol>' +
      '<p>Cercurile punctate arată <b>unde erau popoarele în realitate</b>.</p>' +
      '<p class="mig-note mig-keys">Tastatura: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> pentru alegeri, <kbd>Enter</kbd> ca să continui, <kbd>Spațiu</kbd> pentru pauză.</p>' +
      (window.matchMedia('(max-width: 700px)').matches && document.getElementById('mig-fs') && !document.getElementById('mig-fs').hidden ? '<p class="mig-note">Pe telefon, harta e mică: întoarce telefonul și joacă pe ecran complet.</p><div class="mig-end-btns"><button class="jg-btn" id="mig-go-fs" type="button">Pornește pe ecran complet</button></div>' : '') +
      '<div class="mig-end-btns mig-go-row"><button class="jg-btn" id="mig-go" type="button">' + ICON.play + 'Pornește simularea</button><button class="jg-btn ghost" id="mig-auto" type="button">Arată istoria reală</button></div>' +
      '<p class="mig-prep" id="mig-prep" aria-live="polite"></p></div>';
    prepUi();
    document.getElementById('mig-go').addEventListener('click', function(){ auto = false; restart(); playing(true); play(); });
    document.getElementById('mig-auto').addEventListener('click', function(){ auto = true; restart(); playing(true); play(); });
    var gf = document.getElementById('mig-go-fs');
    if (gf) gf.addEventListener('click', function(){ document.getElementById('mig-fs').click(); auto = false; restart(); playing(true); play(); });
  }

  // =====================================================================
  // 11. Comenzi
  // =====================================================================
  document.getElementById('mig-play').addEventListener('click', function(){
    if (finished) return;
    if (over.querySelector('.mig-intro')) { auto = false; restart(); play(); return; }
    if (over.querySelector('[aria-modal]')) return;
    if (running) pause(); else play();
  });
  // ecran complet: harta și dialogurile ocupă tot ecranul; pe telefon încercăm și orientarea orizontală
  (function(){
    var btn = document.getElementById('mig-fs'), stage = root.querySelector('.mig-stage');
    var req = stage.requestFullscreen || stage.webkitRequestFullscreen;
    if (!req) { btn.hidden = true; return; }
    btn.addEventListener('click', function(){
      if (document.fullscreenElement || document.webkitFullscreenElement) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
      var r = req.call(stage);
      if (r && r.then) r.then(function(){ if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function(){}); }).catch(function(){});
    });
    function onFs(){ var on = !!(document.fullscreenElement || document.webkitFullscreenElement); var lb = on ? 'Ieși din ecran complet' : 'Ecran complet'; btn.setAttribute('aria-label', lb); btn.title = lb; bgKey = ''; labelCache = {}; setTimeout(function(){ draw(); }, 60); }
    document.addEventListener('fullscreenchange', onFs); document.addEventListener('webkitfullscreenchange', onFs);
  })();
  document.getElementById('mig-rp').addEventListener('input', function(){ replayPlay(false); replayGo(+this.value); });
  document.getElementById('mig-rp-play').addEventListener('click', function(){ if (replayRaf) replayPlay(false); else { if (replayY === null) replayGo(T0); replayPlay(true); } });
  document.getElementById('mig-reset').addEventListener('click', function(){ pause(); auto = false; restart(); intro(); });
  Array.prototype.forEach.call(root.querySelectorAll('.mig-speed button'), function(b){
    b.addEventListener('click', function(){ speed = +b.getAttribute('data-s'); Array.prototype.forEach.call(root.querySelectorAll('.mig-speed button'), function(x){ x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); });
  });
  Array.prototype.forEach.call(root.querySelectorAll('.mig-layers input'), function(cb){
    cb.addEventListener('change', function(){ layers[cb.getAttribute('data-l')] = cb.checked; if (!running) draw(); });
  });
  document.getElementById('mig-lite').addEventListener('click', function(){
    var next = !LITE;
    try { localStorage.setItem('mig-lite', next ? '1' : '0'); } catch (e) {}
    // agenții se alocă la încărcare, deci pagina se reîncarcă, pe aceeași simulare
    location.href = location.pathname + (next ? '?usor' : '') + '#mod-migratie';
  });
  document.getElementById('mig-flowg').addEventListener('change', function(){
    flowGroup = +this.value;
    layers.flow = true; root.querySelector('.mig-layers input[data-l="flow"]').checked = true;
    if (!running) draw();
  });
  (function(){
    var lay = document.getElementById('mig-lay'), pop = document.getElementById('mig-pop');
    function setPop(on){ pop.hidden = !on; lay.setAttribute('aria-expanded', on ? 'true' : 'false'); lay.classList.toggle('on', on); }
    lay.addEventListener('click', function(e){ e.stopPropagation(); setPop(pop.hidden); lay.classList.remove('hint'); });
    pop.addEventListener('click', function(e){ e.stopPropagation(); });
    document.addEventListener('click', function(){ if (!pop.hidden) setPop(false); });
    pop.addEventListener('keydown', function(e){ if (e.key === 'Escape') { setPop(false); lay.focus(); } });
  })();
  document.addEventListener('keydown', function(e){
    if (!page || !page.classList.contains('active') || e.ctrlKey || e.altKey || e.metaKey) return;
    // 1, 2, 3 sau A, B, C aleg varianta din fereastra deschisă
    var tg = e.target && e.target.closest ? e.target : document.body;
    var k = '123'.indexOf(e.key) + 1 || 'abc'.indexOf((e.key || '').toLowerCase()) + 1;
    if (k && over.classList.contains('show') && !tg.closest('input, textarea, select')) {
      var ch = over.querySelectorAll('.jg-choice:not(:disabled)');
      if (ch[k - 1]) { e.preventDefault(); ch[k - 1].click(); return; }
    }
    if (tg.closest('input, button, textarea, select')) return;
    if (e.key === ' ') { e.preventDefault(); document.getElementById('mig-play').click(); }
  });
  over.addEventListener('keydown', function(e){
    if (!over.classList.contains('show')) return;
    var dlg = over.querySelector('[role="dialog"]'); if (!dlg) return;
    if (e.key === 'Tab' && !over.classList.contains('dock')) {
      var f = Array.prototype.filter.call(dlg.querySelectorAll('button, a[href]'), function(x){ return !x.disabled; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
    if (e.key === 'Escape') {
      // o decizie nu se poate sări: istoria nu merge mai departe fără ea
      if (dlg.classList.contains('mig-intro')) { e.preventDefault(); over.className = 'mig-over'; over.innerHTML = ''; restart(); document.getElementById('mig-play').focus(); }
      else if (dlg.classList.contains('mig-card')) { e.preventDefault(); finish(); }
      else if (dlg.classList.contains('mig-end')) { e.preventDefault(); var h = document.getElementById('mig-hide'); if (h) h.click(); }
      else { var t0 = dlg.querySelector('.jg-choice:not(:disabled), #mig-cont'); if (t0) t0.focus(); }
    }
  });
  document.addEventListener('visibilitychange', function(){ if (document.hidden && running) pause(); });
  var page = document.getElementById('mod-migratie');
  if (page && 'MutationObserver' in window) new MutationObserver(function(){ if (!page.classList.contains('active')) { if (running) pause(); playing(false); } }).observe(page, { attributes: true, attributeFilter: ['class'] });

  // =====================================================================
  // 12. Încărcarea hărții de bază
  // =====================================================================
  var baseEl = document.getElementById('shared-img-0');
  var href = baseEl && (baseEl.getAttribute('href') || baseEl.getAttribute('xlink:href'));
  if (!href) { root.innerHTML = '<p class="jg-lead">Harta de bază nu a putut fi încărcată.</p>'; return; }
  var img = new Image();
  img.onload = function(){ buildTerrain(img); reset(); buildTimeline(); setPlayLabel(); intro(); warm(); };
  // precalculăm câmpurile de drum în fundal, câte unul pe rând, ca simularea să nu sacadeze
  function warm(){
    var q = [], seen = {};
    var all = [HIST.huni, HIST.ostro, HIST.vizi, HIST.vand, HIST.gep];
    var saved = choice; ['A', 'B', 'C'].forEach(function(o){ choice = { d1: o === 'A' ? 'B' : o, d5: o, dh: o, d2: o === 'B' ? 'B' : 'A' }; buildPlans(); all.push(plans.vizi, plans.ostro, plans.gep, plans.vand); });
    ROUNDS.forEach(function(r){ r.opts.forEach(function(o){ if (o.sim && o.sim.path) all.push(o.sim.path); }); });
    all.push([[0, 47.0, 20.2], [0, 47.0, 20.5], [0, 46.6, 31]]);
    choice = saved; buildPlans();
    all.forEach(function(list){ list.forEach(function(w){ var k = w[1] + ',' + w[2]; if (!seen[k]) { seen[k] = 1; q.push(w); } }); });
    prepTotal = q.length || 1; prepDone = 0; prepUi();
    (function next(){ if (!q.length) { ready = true; prepUi(); return; } var w = q.shift(); field(w[1], w[2]); prepDone++; if (prepDone % 3 === 0) prepUi(); setTimeout(next, 0); })();
  }
  img.src = href;
})();
