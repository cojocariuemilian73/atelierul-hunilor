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
    { year: 376, id: 'd1', at: [44.1, 27.4], place: 'Dunărea, la Durostorum', title: 'Goții la Dunăre', who: 'Ești împăratul Valens',
      text: 'Fugind din calea hunilor, zeci de mii de goți tervingi s-au strâns pe malul stâng al Dunării și cer să fie primiți în Imperiu.',
      src: 'Ammianus Marcellinus, Res Gestae 31.4–5',
      opts: [
        { t: 'Îi primești și le asiguri hrană și pământ', fx: { stab: 5 }, set: { d1: 'A' } },
        { t: 'Îi primești, dar îi lași pe mâna comandanților locali', real: true, fx: {}, set: { d1: 'B' }, note: 'Ammianus scrie că Lupicinus și Maximus i-au înfometat și exploatat pe refugiați. Goții s-au răsculat.' },
        { t: 'Închizi granița', fx: { stab: -3 }, set: { d1: 'C' } }
      ] },
    { year: 402, id: 'd2', at: [45.46, 9.19], place: 'Mediolanum', title: 'Rinul sau Italia?', who: 'Ești generalul Stilicho',
      text: 'Alaric și vizigoții au intrat în Italia. Ca s-o aperi, ai nevoie de trupele care păzesc granița de pe Rin.',
      src: 'Claudian, Războiul gotic (De bello Gothico)',
      opts: [
        { t: 'Aduci trupele de pe Rin în Italia', real: true, fx: { stab: 0 }, set: { d2: 'A' }, note: 'Granița de pe Rin rămâne slab apărată. În noaptea de 31 decembrie 406, vandalii, alanii și suebii o trec. Legătura dintre retragerea trupelor și trecerea din 406 e însă o teză discutată: unii istorici cred că granița era slăbită de mai mult timp.' },
        { t: 'Lași armata pe Rin', fx: { stab: -6 }, set: { d2: 'B' } }
      ] },
    { year: 441, id: 'd3', at: [41.01, 28.98], place: 'Constantinopol', title: 'Hunii cer tribut', who: 'Ești împăratul Teodosie al II-lea',
      text: 'Attila și Bleda cer aur și fugarii. Armata ta e prinsă în alte războaie, dar Constantinopolul are ziduri puternice.',
      src: 'Priscus din Panium (fragmentele despre tratatele cu hunii)',
      opts: [
        { t: 'Plătești tributul cerut', fx: { stab: -3 }, set: { d3: 'A' } },
        { t: 'Amâni plata și te bazezi pe ziduri', real: true, fx: { stab: -10 }, set: { d3: 'B' }, note: 'Hunii pustiesc Balcanii în 441–447. Pacea lui Anatolius îi obligă apoi pe romani la un tribut de trei ori mai mare.' }
      ] },
    { year: 450.6, id: 'd4', at: [48.95, 4.4], place: 'Câmpiile Catalaunice', title: 'Attila în Galia', who: 'Ești generalul Aetius',
      text: 'Attila a trecut Rinul cu o armată uriașă. Singur, nu-l poți opri. Vizigoții din Galia sunt vechii tăi adversari.',
      src: 'Iordanes, Getica',
      opts: [
        { t: 'Faci alianță cu vizigoții regelui Teodoric', real: true, fx: { stab: 4 }, set: { d4: 'A' }, note: 'Coaliția îl oprește pe Attila la Câmpiile Catalaunice (451). Teodoric moare în luptă.' },
        { t: 'Lupți doar cu armata romană', fx: { stab: -10 }, set: { d4: 'B' } }
      ] },
    { year: 454, id: 'd5', at: [47.6, 21.8], place: 'Țara gepizilor', title: 'După moartea lui Attila', who: 'Ești Ardaric, regele gepizilor',
      text: 'Attila a murit. Fiii lui își împart neamurile supuse ca pe o moștenire de familie. Tu ai fost unul dintre cei mai de încredere oameni ai lui Attila.',
      src: 'Iordanes, Getica 259–264',
      opts: [
        { t: 'Ridici neamurile supuse împotriva fiilor lui Attila', real: true, fx: { stab: 3 }, set: { d5: 'A' }, note: 'La Nedao, gepizii și aliații lor îi înving pe huni; Ellac, fiul cel mare al lui Attila, cade în luptă. Gepizii se așază la est de Tisa și în Transilvania, unde rămân până în 567.' },
        { t: 'Rămâi credincios fiilor lui Attila', fx: {}, set: { d5: 'B' } },
        { t: 'Îți duci neamul spre apus, în slujba Romei', fx: { stab: 2 }, set: { d5: 'C' } }
      ] }
  ];
  var EVENTS = [
    { year: 375, at: [47.4, 33.4], place: 'Regatul lui Ermanaric', t: '375 · Hunii zdrobesc regatul goților lui Ermanaric', src: 'Ammianus 31.3' },
    { year: 378, at: [41.68, 26.56], place: 'Adrianopol', cond: function(){ return choice.d1 === 'B'; }, t: '378 · Adrianopol: goții răsculați distrug armata romană; împăratul Valens moare', src: 'Ammianus 31.13', fx: { stab: -20 } },
    { year: 378, cond: function(){ return choice.d1 === 'A'; }, t: '378 · Fără răscoală, la Adrianopol nu are loc nicio bătălie (scenariu ipotetic)' },
    { year: 378, cond: function(){ return choice.d1 === 'C'; }, t: '378 · Goții se îngrămădesc pe malul stâng al Dunării, prinși între huni și Imperiu (scenariu ipotetic)' },
    { year: 406.9, at: [50.0, 8.3], place: 'Rinul, la Mogontiacum', t: '406 · Noaptea de 31 decembrie: vandalii, alanii și suebii ajung la Rin' },
    { year: 410, at: [41.9, 12.5], place: 'Roma', check: 'roma', t: '410 · Alaric și vizigoții jefuiesc Roma', src: 'Orosius; Ieronim', fx: { stab: -10 } },
    { year: 429, at: [36.0, -5.4], place: 'Strâmtoarea Gibraltar', check: 'africa', t: '429 · Vandalii trec în Africa, sub regele Genseric' },
    { year: 439, at: [36.85, 10.2], place: 'Cartagina', check: 'cartagina', t: '439 · Vandalii cuceresc Cartagina' },
    { year: 453, at: [47.0, 20.2], place: 'Moartea lui Attila', t: '453 · Attila moare. Imperiul hunilor începe să se destrame', src: 'Iordanes, Getica' },
    { year: 454.6, cond: function(){ return choice.d5 === 'A'; }, t: '454 · Nedao: gepizii lui Ardaric îi înving pe fiii lui Attila', src: 'Iordanes, Getica 260–262' },
    { year: 454.6, cond: function(){ return choice.d5 === 'B'; }, t: '454 · Fără Nedao: neamurile rămân sub fiii lui Attila (scenariu ipotetic)' },
    { year: 454.6, cond: function(){ return choice.d5 === 'C'; }, t: '454 · Gepizii pleacă spre apus; neamurile rămase se răscoală fără ei (scenariu ipotetic)' },
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
  var fieldCache = {}, plans = {}, choice = {}, stab, t, running = false, speed = 1, seed, rnd, eventIx, decIx, crossings, log, finished, auto = false;
  var layers = { real: true, terrain: false, flow: false, press: false }, flowGroup = 2;
  var pressGrid, PW = 60, PH = 29;

  function mulberry(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; var t2 = Math.imul(a ^ a >>> 15, 1 | a); t2 = t2 + Math.imul(t2 ^ t2 >>> 7, 61 | t2) ^ t2; return ((t2 ^ t2 >>> 14) >>> 0) / 4294967296; }; }

  // =====================================================================
  // 4. Interfață
  // =====================================================================
  root.innerHTML =
    '<div class="mig-bar">' +
      '<div class="mig-year"><small>Anul</small><b id="mig-year">370</b></div>' +
      '<div class="mig-ctl"><button class="jg-btn" id="mig-play" type="button" aria-pressed="false">Pornește</button>' +
      '<div class="mig-speed" role="group" aria-label="Viteza simulării"><button type="button" data-s="1" class="on" aria-pressed="true">1×</button><button type="button" data-s="2" aria-pressed="false">2×</button><button type="button" data-s="4" aria-pressed="false">4×</button></div>' +
      '<button class="jg-btn ghost" id="mig-reset" type="button"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 8a4.8 4.8 0 1 0 1.5-3.5M3 2.2v3.1h3.1" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>De la capăt</button></div>' +
      '<div class="mig-stab"><label>Stabilitatea Imperiului <b id="mig-stab-v">70</b></label><div class="jg-bar"><i id="mig-stab" style="width:70%"></i></div></div>' +
    '</div>' +
    '<div class="mig-main">' +
      '<div class="mig-stage">' +
        '<canvas id="mig-canvas" width="' + CW + '" height="' + CH + '" role="img" aria-label="Simularea Marii Migrații: puncte colorate reprezintă popoarele care se deplasează pe harta Europei între 370 și 476"></canvas>' +
        '<div class="mig-toast" id="mig-toast" aria-live="polite"></div><div class="mig-tip" id="mig-tip" hidden></div>' +
        '<div class="mig-over" id="mig-over"></div>' +
        '<span class="mig-credit">Hartă: Alexrk2, Wikimedia Commons, CC BY-SA 3.0</span>' +
        '<div class="mig-tl" id="mig-tl" aria-label="Cronologia simulării: deciziile și evenimentele"></div>' +
      '</div>' +
      '<aside class="mig-side">' +
        '<p class="jg-eyebrow">Popoarele</p><ul class="mig-legend" id="mig-legend">' + GROUPS.map(function(g){ return '<li><i style="background:' + g.color + '"></i><span>' + g.name + '<small id="mig-where-' + g.id + '"></small></span></li>'; }).join('') + '<li><i class="ghost"></i>Unde erau în realitate</li></ul>' +
        '<p class="jg-eyebrow">Straturi</p><div class="mig-layers">' +
          '<label><input type="checkbox" data-l="real" checked> Lumea reală (reper)</label>' +
          '<label><input type="checkbox" data-l="terrain"> Terenul calculat din hartă</label>' +
          '<label><input type="checkbox" data-l="flow"> Drumurile calculate (Dijkstra)</label>' +
          '<label><input type="checkbox" data-l="press"> Presiunea hunilor</label>' +
          '<button type="button" class="mig-flowg" id="mig-flowg">Drumuri pentru: Vizigoții</button>' +
        '</div>' +
        '<p class="jg-eyebrow">Calculatorul tău</p><button type="button" class="mig-flowg mig-lite" id="mig-lite" aria-pressed="' + LITE + '">' + (LITE ? 'Mod ușor activ: ' + N.toLocaleString('ro-RO') + ' de agenți. Treci la modul complet' : 'Merge greu? Mod ușor: ' + Math.round(FULL_N * 0.4).toLocaleString('ro-RO') + ' de agenți') + '</button>' +
        '<p class="jg-eyebrow">Grupuri care au trecut granița</p><div class="mig-cross"><span>Dunărea <b id="mig-cd">0</b></span><span>Rinul <b id="mig-cr">0</b></span></div>' +
        '<p class="jg-eyebrow">Deciziile tale</p><ol class="mig-log" id="mig-log"></ol>' +
      '</aside>' +
    '</div>' +
    '<details class="mig-how"><summary>Cum funcționează simularea</summary>' +
      '<ul>' +
        '<li><b>' + N.toLocaleString('ro-RO') + ' de agenți</b>, fiecare un grup de oameni, se mișcă independent, de 50 de ori pe an simulat.</li>' +
        '<li><b>Terenul e citit din pixelii hărții reale:</b> marea e de netrecut, câmpia e ușoară, dealurile și munții încetinesc (straturi: „Terenul calculat”).</li>' +
        '<li><b>Drumurile nu sunt desenate de mână.</b> Pentru fiecare țintă, algoritmul lui Dijkstra calculează pe o grilă de 300 × 145 de celule (circa 14 km fiecare) cel mai ușor drum din orice punct; agenții urmează aceste câmpuri de drum.</li>' +
        '<li><b>Granițele romane</b> (Rinul și Dunărea) sunt linii pe care un agent le poate trece doar cu o anumită probabilitate, care depinde de decizii și de stabilitatea Imperiului.</li>' +
        '<li><b>Presiunea hunilor</b> e un câmp de densitate: celelalte popoare sunt împinse departe de zonele cu mulți huni. De aici vine efectul de domino.</li>' +
        '<li><b>Vandalii, alanii și suebii</b> apar ca un singur grup: au trecut Rinul împreună, în 406, dar erau popoare diferite. E o simplificare a modelului.</li>' +
        '<li>Generatorul de numere aleatoare are o sămânță fixă: <b>aceleași decizii dau mereu aceeași istorie</b>.</li>' +
        '<li>Țintele popoarelor urmează pozițiile lor reale din izvoare; deciziile schimbă granițele și stabilitatea, iar restul se petrece de la sine. Rezultatul e un <b>model didactic</b>, nu o reconstituire.</li>' +
      '</ul></details>';

  var cv = document.getElementById('mig-canvas'), ctx = cv.getContext('2d');
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
    if (choice.d3 === 'A') plans.huni = [[370, 46.8, 44.2], [376, 47.2, 35.5], [395, 46.5, 28.5], [420, 47.0, 20.2], [441, 47.0, 20.2], [443, 43.8, 22.5], [445, 47.0, 20.2], [451, 48.9, 4.4], [452, 45.8, 13.4], [454, 47.0, 20.5], [470, 46.6, 31], [476, 46.6, 32]];
    if (choice.d3 === 'B') plans.huni = [[370, 46.8, 44.2], [376, 47.2, 35.5], [395, 46.5, 28.5], [420, 47.0, 20.2], [441, 47.0, 20.2], [444, 43.3, 22.0], [447, 41.6, 27.4], [449, 47.0, 20.2], [451, 48.9, 4.4], [452, 45.8, 13.4], [454, 47.0, 20.5], [470, 46.6, 31], [476, 46.6, 32]];
    if (choice.d4 === 'B') {
      plans.huni = plans.huni.filter(function(w){ return w[0] < 451; }).concat([[451, 47.9, 1.9], [453, 47.6, 3.0], [460, 47.0, 20.5], [470, 46.6, 31], [476, 46.6, 32]]);
      if (choice.d1 !== 'A') plans.vizi = plans.vizi.filter(function(w){ return w[0] < 451; }).concat([[454, 40.6, -3.8], [476, 40.0, -4.0]]);
    }
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
      if (gid === 'huni' && ((choice.d3 === 'A' && t >= 441 && t < 446) || (choice.d3 !== 'A' && t >= 441 && t < 450))) r = 60;
      if (gid === 'ostro' && t >= 455) r = 40;
    } else {
      if (gid === 'vand' && t >= 406.9) r = choice.d2 === 'B' ? 0.12 * inst : 60;
      if (gid === 'huni' && t >= 450.5 && t < 454) r = 60;
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
    choice = {};
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
    pressGrid = new Float32Array(PW * PH);
    updateHud(); renderLog(); draw();
  }

  function groupSpeed(gid, gi){
    // viteza grupului: cât să ajungă la țintă până la anul ei (distanța e luată din câmpul Dijkstra)
    var tg = target(gid), f = field(tg[1], tg[2]), sum = 0, n = 0;
    for (var i = gi.start; i < gi.end; i += 7) { var c = toCell(ax[i], ay[i]); if (c >= 0 && f.dist[c] < Infinity) { sum += f.dist[c]; n++; } }
    var d = n ? sum / n * G : 0, yrs = Math.max(0.6, tg[0] - t);
    // gepizii trec prin dealurile din nord-vestul Transilvaniei: viteza minimă e mai mare
    return { f: f, v: Math.max(gid === 'gep' && t > 454 ? 12 : 4, Math.min(160, d / yrs)) };
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
  var vignette = (function(){ var g = ctx.createRadialGradient(CW / 2, CH / 2, CH * 0.35, CW / 2, CH / 2, CW * 0.72); g.addColorStop(0, 'rgba(10,8,6,0)'); g.addColorStop(1, 'rgba(10,8,6,0.62)'); return g; })();
  function pulse(at, text, color){ var p = proj(at[0], at[1]); pulses.push({ x: p[0], y: p[1], text: text, color: color || '#f2d474', t0: performance.now() }); }

  function draw(){
    var now = performance.now();
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(baseCv, 0, 0);
    ctx.fillStyle = 'rgba(24, 16, 8, 0.30)'; ctx.fillRect(0, 0, CW, CH);
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, CW, CH);
    if (layers.terrain) { ctx.imageSmoothingEnabled = false; ctx.globalAlpha = 0.75; ctx.drawImage(terrCv, 0, 0, CW, CH); ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = true; }
    // urmele: fiecare popor își lasă drumul pe hartă
    tctx.globalCompositeOperation = 'destination-out'; tctx.fillStyle = 'rgba(0,0,0,0.03)'; tctx.fillRect(0, 0, CW, CH);
    tctx.globalCompositeOperation = 'source-over'; tctx.globalAlpha = 0.32;
    for (var i = 0; i < N; i += lowFx ? 4 : 2) { tctx.fillStyle = GROUPS[ag[i]].color; var q = W2C(ax[i], ay[i]); tctx.fillRect(q[0] - 1, q[1] - 1, 2, 2); }
    tctx.globalAlpha = 1;
    ctx.drawImage(trailCv, 0, 0);
    // limesul: o linie aurie cu halou
    Object.keys(FRONT).forEach(function(k){
      ctx.beginPath(); FRONT[k].forEach(function(p, j){ var q2 = W2C.apply(null, proj(p[0], p[1])); if (j) ctx.lineTo(q2[0], q2[1]); else ctx.moveTo(q2[0], q2[1]); });
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.setLineDash([]); ctx.lineWidth = 11; ctx.strokeStyle = 'rgba(229, 193, 88, 0.16)'; ctx.stroke();
      ctx.setLineDash([12, 7]); ctx.lineWidth = 2.6; ctx.strokeStyle = 'rgba(242, 212, 116, 0.95)'; ctx.stroke();
      ctx.setLineDash([]);
    });
    label('LIMES · RINUL', proj(49.4, 7.2), '#f2d474', 'right', 12);
    label('LIMES · DUNĂREA', proj(43.35, 24.4), '#f2d474', 'center', 12);
    label('IMPERIUL ROMAN', proj(42.6, 13.6), 'rgba(246,237,220,0.55)', 'center', 16, 4);
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
    // agenții: un halou discret și un miez luminos
    ctx.globalCompositeOperation = 'lighter';
    for (var j = 0; j < N; j += lowFx ? 2 : 1) {
      var q3 = W2C(ax[j], ay[j]), gc = GROUPS[ag[j]].color;
      ctx.fillStyle = gc;
      if (!lowFx) { ctx.globalAlpha = 0.16; ctx.fillRect(q3[0] - 3.5, q3[1] - 3.5, 7, 7); }
      ctx.globalAlpha = 0.95; ctx.fillRect(q3[0] - 1.4, q3[1] - 1.4, 2.8, 2.8);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    // lumea reală (cercuri punctate) și numele popoarelor lângă grupuri
    cents = GROUPS.map(function(g){ var cc = centroid(g.id); return W2C(cc[0], cc[1]); });
    if (layers.real && !showCompare) GROUPS.forEach(function(g){
      var h = interp(HIST[g.id], t), q4 = W2C.apply(null, proj(h[0], h[1]));
      ctx.setLineDash([5, 4]); ctx.lineWidth = 2.5; ctx.strokeStyle = g.color;
      ctx.beginPath(); ctx.arc(q4[0], q4[1], 17, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(q4[0], q4[1], 3, 0, 7); ctx.fillStyle = '#fff8e8'; ctx.fill();
    });
    if (showCompare) GROUPS.forEach(function(g, gi){
      var h2 = HIST[g.id][HIST[g.id].length - 1], r2 = W2C.apply(null, proj(h2[1], h2[2])), m = cents[gi];
      ctx.setLineDash([7, 5]); ctx.lineWidth = 2.4; ctx.strokeStyle = g.color;
      ctx.beginPath(); ctx.moveTo(m[0], m[1]); ctx.lineTo(r2[0], r2[1]); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(r2[0], r2[1], 15, 0, 7); ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath(); ctx.arc(m[0], m[1], 7, 0, 7); ctx.fillStyle = g.color; ctx.fill(); ctx.strokeStyle = '#121214'; ctx.lineWidth = 2; ctx.stroke();
      label('în realitate', [r2[0] / SC + VB.x, r2[1] / SC + VB.y + 14], '#fff8e8', 'center', 11);
    });
    GROUPS.forEach(function(g, gi){
      var m = cents[gi]; if (m[0] < 0 || m[0] > CW || m[1] < 0 || m[1] > CH) return;
      label(SHORT[g.id], [m[0] / SC + VB.x, m[1] / SC + VB.y - 13], g.color, 'center', 12, 3);
    });
    // momentele istorice, pe locul lor
    pulses = pulses.filter(function(p){ return now - p.t0 < 4200; });
    pulses.forEach(function(p){
      var k = (now - p.t0) / 4200, q5 = W2C(p.x, p.y);
      for (var r = 0; r < 2; r++) { var kk = (k * 2 + r * 0.5) % 1; ctx.beginPath(); ctx.arc(q5[0], q5[1], 8 + kk * 46, 0, 7); ctx.strokeStyle = p.color; ctx.globalAlpha = (1 - kk) * (1 - k * 0.6); ctx.lineWidth = 2.5; ctx.stroke(); }
      ctx.globalAlpha = 1 - Math.max(0, k - 0.75) * 4;
      ctx.beginPath(); ctx.arc(q5[0], q5[1], 5, 0, 7); ctx.fillStyle = p.color; ctx.fill();
      label(p.text, [p.x, p.y - 18 / SC * 2], '#fff8e8', 'center', 13);
      ctx.globalAlpha = 1;
    });
  }
  function label(text, p, color, align, size, spacing){
    var q = W2C(p[0], p[1]);
    ctx.font = '700 ' + (size || 13) + 'px "JetBrains Mono", monospace'; ctx.textAlign = align || 'left';
    if ('letterSpacing' in ctx) ctx.letterSpacing = (spacing || 0.5) + 'px';
    ctx.lineJoin = 'round'; ctx.lineWidth = 4.5; ctx.strokeStyle = 'rgba(12,10,8,0.92)'; ctx.strokeText(text, q[0], q[1]); ctx.fillStyle = color; ctx.fillText(text, q[0], q[1]);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }

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
    acc += dt * YPS * speed;
    var steps = 0;
    while (acc >= DT && steps < 12) {
      acc -= DT; steps++; step();
      if (checkEvents()) break;
      if (t >= T1) { finish(); break; }
    }
    draw(); updateHud();
    // calculator lent: după ~2 secunde cu cadre de peste 35 ms, propune modul ușor
    slowEma = slowEma * 0.9 + (performance.now() - c0) * 0.1; slowN++;
    if (!LITE && !slowWarned && slowN > 90 && slowEma > 35) { slowWarned = true; toast('Simularea merge greu pe acest calculator', 'Apasă „Mod ușor” din dreapta: mai puțini agenți, aceeași istorie.'); document.getElementById('mig-lite').classList.add('hint'); }
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
    if (decIx < DECISIONS.length && t >= DECISIONS[decIx].year) { decide(DECISIONS[decIx]); decIx++; return true; }
    while (eventIx < EVENTS.length && t >= EVENTS[eventIx].year) {
      var e = EVENTS[eventIx++];
      if (e.cond && !e.cond()) continue;
      if (e.check === 'roma' && !near('vizi', 41.9, 12.6, 450)) { toast('410 · Roma scapă: vizigoții nu au ajuns în Italia (scenariu ipotetic)'); continue; }
      if (e.check === 'africa' && !near('vand', 36.4, 0, 900)) { toast('429 · Vandalii nu ajung în Africa (scenariu ipotetic)'); continue; }
      if (e.check === 'cartagina' && !near('vand', 36.85, 10.1, 450)) continue;
      if (e.check === 'gep' && !near('gep', 46.8, 23.6, 250)) continue;
      if (e.fx && e.fx.stab) setStab(stab + e.fx.stab);
      toast(e.t, e.src);
      if (e.at) pulse(e.at, e.place, e.fx && e.fx.stab < 0 ? '#e0626c' : '#f2d474');
      markTimeline(e);
    }
    return false;
  }
  function setStab(v){ stab = Math.max(0, Math.min(100, v)); }
  function toast(text, src){
    var el = document.createElement('div'); el.className = 'mig-t'; el.innerHTML = '<b>' + text + '</b>' + (src ? '<small>' + src + '</small>' : '');
    toastEl.appendChild(el); setTimeout(function(){ el.classList.add('out'); }, 4600); setTimeout(function(){ el.remove(); }, 5400);
    while (toastEl.children.length > 3) toastEl.firstChild.remove();
  }

  function decide(d){
    pause();
    if (d.at) pulse(d.at, d.place);
    if (auto) { var o = d.opts.filter(function(x){ return x.real; })[0]; apply(d, o); setTimeout(play, 700); return; }
    over.className = 'mig-over show';
    over.innerHTML = '<div class="mig-dec" role="dialog" aria-modal="true" aria-labelledby="mig-dt"><h3 id="mig-dt"><span class="mig-yr">' + Math.floor(d.year) + '</span>' + d.title + '</h3><p class="mig-who">' + d.who + '</p><p>' + d.text + '</p>' +
      '<div class="jg-choices">' + d.opts.map(function(o, i){ return '<button class="jg-choice" type="button" data-i="' + i + '"><i>' + 'ABC'[i] + '</i><span>' + o.t + '</span></button>'; }).join('') + '</div>' +
      '<p class="jg-src">Sursa: ' + d.src + '</p></div>';
    Array.prototype.forEach.call(over.querySelectorAll('.jg-choice'), function(b){
      b.addEventListener('click', function(){ var o = d.opts[+b.getAttribute('data-i')]; over.className = 'mig-over'; over.innerHTML = ''; apply(d, o); play(); document.getElementById('mig-play').focus({ preventScroll: true }); });
    });
    var fb = over.querySelector('.jg-choice'); if (fb) fb.focus({ preventScroll: true });
  }
  function apply(d, o){
    Object.keys(o.set).forEach(function(k){ choice[k] = o.set[k]; });
    if (o.fx && o.fx.stab) setStab(stab + o.fx.stab);
    buildPlans();
    log.push({ y: Math.floor(d.year), title: d.title, t: o.t, real: !!o.real, note: o.note });
    renderLog(); markTimeline(d, o.real);
    if (o.note) toast(o.note);
  }
  function renderLog(){
    var el = document.getElementById('mig-log');
    el.innerHTML = log.length ? log.map(function(l){ return '<li><b>' + l.y + ' · ' + l.title + '</b>' + l.t + '<em class="' + (l.real ? '' : 'alt') + '">' + (l.real ? 'ca în istorie' : 'altă istorie') + '</em></li>'; }).join('') : '<li class="empty">Deciziile tale apar aici, pe măsură ce le iei.</li>';
  }

  // cronologia de sub hartă
  var tlEl = document.getElementById('mig-tl');
  function pct(y){ return ((y - T0) / (T1 - T0) * 100).toFixed(2) + '%'; }
  function buildTimeline(){
    var h = '<div class="mig-tl-track"><i class="mig-tl-fill" id="mig-tl-fill"></i></div>';
    [375, 400, 425, 450, 475].forEach(function(y){ h += '<span class="mig-tl-tick" style="left:' + pct(y) + '">' + y + '</span>'; });
    EVENTS.forEach(function(e, i){ h += '<span class="mig-tl-ev" data-e="' + i + '" style="left:' + pct(e.year) + '" title="' + e.t.replace(/"/g, '&quot;') + '"></span>'; });
    DECISIONS.forEach(function(d, i){ h += '<span class="mig-tl-dec" data-d="' + i + '" style="left:' + pct(d.year) + '" title="' + Math.floor(d.year) + ' · ' + d.title + '"><b>' + Math.floor(d.year) + '</b></span>'; });
    h += '<span class="mig-tl-head" id="mig-tl-head"></span>';
    tlEl.innerHTML = h;
  }
  function markTimeline(item, real){
    var di = DECISIONS.indexOf(item), ei = EVENTS.indexOf(item);
    if (di !== -1) { var d = tlEl.querySelector('[data-d="' + di + '"]'); if (d) d.className = 'mig-tl-dec done' + (real ? '' : ' alt'); }
    if (ei !== -1) { var e = tlEl.querySelector('[data-e="' + ei + '"]'); if (e) e.className = 'mig-tl-ev done'; }
  }
  function resetTimeline(){ buildTimeline(); }

  function updateHud(){
    document.getElementById('mig-year').textContent = Math.min(T1, Math.floor(t));
    document.getElementById('mig-stab-v').textContent = Math.round(stab);
    var sb = document.getElementById('mig-stab'); sb.style.width = stab + '%'; sb.style.background = stab < 35 ? '#e0626c' : stab < 60 ? '#e5c158' : '#8fbd82';
    document.getElementById('mig-cd').textContent = crossings.dunare;
    document.getElementById('mig-cr').textContent = crossings.rin;
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
    pause(); finished = true; t = T1; showCompare = true; updateHud(); draw(); setPlayLabel();
    document.getElementById('mig-play').disabled = true;
    var allReal = log.length === DECISIONS.length && log.every(function(l){ return l.real; });
    var rows = GROUPS.map(function(g){
      var c = centroid(g.id), h = HIST[g.id][HIST[g.id].length - 1], hp = proj(h[1], h[2]);
      var km = Math.round(Math.hypot(c[0] - hp[0], c[1] - hp[1]) * KM / 50) * 50;
      return '<tr><td><i style="background:' + g.color + '"></i>' + g.name + '</td><td>' + regionOf(c) + '</td><td>' + regionOf(hp) + '</td><td class="num">' + (km <= 150 ? 'același loc' : '~' + km.toLocaleString('ro-RO') + ' km') + '</td></tr>';
    }).join('');
    over.className = 'mig-over show dock';
    over.innerHTML = '<div class="mig-dec mig-end" role="dialog" aria-labelledby="mig-et"><h3 id="mig-et"><span class="mig-yr">476</span>' + (allReal ? 'Ai refăcut drumul istoric' : 'Ai scris o altă istorie') + '</h3>' +
      '<p class="mig-who">Sfârșitul Imperiului Roman de Apus. Pe hartă, fiecare linie unește lumea ta de lumea reală.</p>' +
      '<table class="mig-table"><thead><tr><th>Popor</th><th>Lumea ta</th><th>Lumea reală</th><th>Distanța</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<p class="mig-stats">Stabilitatea Imperiului: <b>' + Math.round(stab) + '</b> · grupuri care au trecut Dunărea: <b>' + crossings.dunare + '</b>, Rinul: <b>' + crossings.rin + '</b> (din ' + N.toLocaleString('ro-RO') + ')</p>' +
      '<p class="mig-lesson">' + (allReal ? 'Aceleași decizii, aceeași istorie: presiunea hunilor și slăbirea granițelor au împins popoarele, unele după altele, în Imperiu.' : 'Ce s-a schimbat prin deciziile tale? Istoricii pun aceeași întrebare când discută dacă hunii au provocat căderea Romei sau doar au grăbit-o.') + '</p>' +
      '<div class="mig-end-btns"><button class="jg-btn" id="mig-again" type="button">' + ICON.reset + 'Joacă din nou</button><button class="jg-btn ghost" id="mig-hist" type="button">Arată istoria reală</button><button class="jg-btn ghost" id="mig-hide" type="button">Ascunde tabelul</button></div></div>';
    document.getElementById('mig-again').addEventListener('click', function(){ auto = false; restart(); intro(); });
    document.getElementById('mig-hist').addEventListener('click', function(){ auto = true; restart(); play(); });
    document.getElementById('mig-hide').addEventListener('click', function(){
      var d = over.querySelector('.mig-end'); var hid = d.classList.toggle('min'); this.textContent = hid ? 'Arată tabelul' : 'Ascunde tabelul';
    });
  }
  function restart(){ over.className = 'mig-over'; over.innerHTML = ''; showCompare = false; pulses = []; document.getElementById('mig-play').disabled = !ready; reset(); resetTimeline(); setPlayLabel(); }

  function intro(){
    over.className = 'mig-over show';
    over.innerHTML = '<div class="mig-dec mig-intro" role="dialog" aria-modal="true" aria-labelledby="mig-it"><h3 id="mig-it">Marea Migrație, în timp real</h3>' +
      '<p class="mig-who">370–476 · cinci decizii · o hartă reală</p>' +
      '<p>Peste ' + (Math.floor(N / 100) * 100).toLocaleString('ro-RO') + ' de puncte sunt popoare în mișcare. Hunii vin din răsărit; goții, vandalii și ceilalți sunt împinși spre granițele Imperiului. De cinci ori, istoria se oprește și decizi tu: ești Valens, Stilicho, Teodosie al II-lea, Aetius și, la sfârșit, Ardaric, regele gepizilor.</p>' +
      '<p>Cercurile punctate arată mereu <b>unde erau popoarele în realitate</b>. Treci cu mouse-ul peste un popor (pe telefon, atinge-l) ca să vezi unde a ajuns.</p>' +
      '<div class="mig-end-btns"><button class="jg-btn" id="mig-go" type="button">' + ICON.play + 'Pornește simularea</button><button class="jg-btn ghost" id="mig-auto" type="button">Arată istoria reală</button></div>' +
      '<p class="mig-prep" id="mig-prep" aria-live="polite"></p></div>';
    prepUi();
    document.getElementById('mig-go').addEventListener('click', function(){ auto = false; restart(); play(); });
    document.getElementById('mig-auto').addEventListener('click', function(){ auto = true; restart(); play(); });
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
  document.getElementById('mig-flowg').addEventListener('click', function(){
    flowGroup = (flowGroup + 1) % GROUPS.length;
    this.textContent = 'Drumuri pentru: ' + GROUPS[flowGroup].name.split(',')[0];
    layers.flow = true; root.querySelector('.mig-layers input[data-l="flow"]').checked = true;
    if (!running) draw();
  });
  document.addEventListener('keydown', function(e){
    if (!page || !page.classList.contains('active') || e.target.closest('input, button, textarea, select')) return;
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
      else if (dlg.classList.contains('mig-end')) { e.preventDefault(); var h = document.getElementById('mig-hide'); if (h) h.click(); }
      else { var t0 = dlg.querySelector('.jg-choice'); if (t0) t0.focus(); }
    }
  });
  document.addEventListener('visibilitychange', function(){ if (document.hidden && running) pause(); });
  var page = document.getElementById('mod-migratie');
  if (page && 'MutationObserver' in window) new MutationObserver(function(){ if (!page.classList.contains('active') && running) pause(); }).observe(page, { attributes: true, attributeFilter: ['class'] });

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
    var saved = choice; ['A', 'B', 'C'].forEach(function(o){ choice = { d1: o, d3: o === 'C' ? 'A' : o, d4: o === 'C' ? 'B' : 'A', d5: o }; buildPlans(); all.push(plans.huni, plans.vizi, plans.ostro, plans.gep); });
    choice = saved; buildPlans();
    all.forEach(function(list){ list.forEach(function(w){ var k = w[1] + ',' + w[2]; if (!seen[k]) { seen[k] = 1; q.push(w); } }); });
    prepTotal = q.length || 1; prepDone = 0; prepUi();
    (function next(){ if (!q.length) { ready = true; prepUi(); return; } var w = q.shift(); field(w[1], w[2]); prepDone++; if (prepDone % 3 === 0) prepUi(); setTimeout(next, 0); })();
  }
  img.src = href;
})();
