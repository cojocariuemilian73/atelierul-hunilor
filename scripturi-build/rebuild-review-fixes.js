// Corrections from a full read-through of the site before the contest.
// Every change fixes a factual slip, an inconsistency between modules, or a
// claim the cited sources do not support; nothing is added for decoration.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const B = path.join(ROOT, 'build');

function edit(file, pairs){
  let s = fs.readFileSync(file, 'utf8');
  for (const [from, to] of pairs) {
    if (!s.includes(from)) { console.error('not found in ' + path.basename(file) + ': ' + from.slice(0, 80)); process.exit(1); }
    s = s.split(from).join(to);
  }
  fs.writeFileSync(file, s);
  console.log(path.basename(file) + ': ' + pairs.length + ' corecturi');
}

// ---------------- Acasă / articol ----------------
edit(path.join(B, 'story.body.html'), [
  // The map's green arrow goes to the Balkans, Chalons and Italy; Adrianople (378) sits on the Visigoth arrow.
  ['Săgeata verde arată drumul hunilor înșiși — din stepă spre capitala lor din Câmpia Panonică, apoi spre Adrianopol (378) și Chalons (451). Săgețile mov și roz sunt vizigoții și ostrogoții, împinși dinaintea hunilor; albastru sunt vandalii, ajunși până la Cartagina.',
   'Săgeata verde arată drumul hunilor înșiși — din stepă spre capitala lor din Câmpia Panonică, apoi în Balcani, în Galia, până la Chalons (451), și în Italia. Săgețile mov și roz sunt vizigoții și ostrogoții, împinși dinaintea hunilor (bătălia de la Adrianopol, 378, e marcată pe drumul vizigoților); albastru sunt vandalii, ajunși până la Cartagina.'],
  // Note 9 itself says Procopius' phrase is "the last of the Romans".
  ['Ultimul roman adevărat”', 'Ultimul dintre romani”'],
  ['îi cunoștea limba și tacticile mai bine decât orice alt roman.', 'cunoștea lumea hunică din interior, un avantaj rar printre romanii vremii.'],
  ['Un an mai târziu, moartea lui Attila (453)', 'Doi ani mai târziu, moartea lui Attila (453)'],
  ['Dengizich, un alt fiu al lui Attila,', 'Dengizich, unul dintre fiii lui Attila,'],
  ['Cologne, Tournai, Cambrai', 'Köln, Tournai, Cambrai'],
]);

edit(path.join(B, 'story.js'), [
  ["desc: 'Sub Attila și Bleda, tributul anual plătit de Constantinopol se dublează: de la 350 de livre de aur, cât era în 431, la 700.",
   "desc: 'Moare regele Rua. Noii conducători, frații Attila și Bleda, obțin la Margus (c. 435) dublarea tributului anual plătit de Constantinopol: de la 350 de livre de aur, cât se plătea sub Rua, la 700."],
  ['ajungând până la zidurile Constantinopolului.', 'ajungând până aproape de zidurile Constantinopolului, pe care nu le asediază.'],
  ["desc: 'Tributul anual urcă la 2.100 de livre de aur, plus o restanță de 6.000 de livre.",
   "desc: 'Tributul anual urcă la 2.100 de livre de aur, plus o restanță de 6.000 de livre (pacea e datată de istorici fie în 443, fie în 447)."],
]);

// ---------------- Campania Hunilor ----------------
edit(path.join(B, 'game.js'), [
  ['o dezbatere veche de 250 de ani', 'o dezbatere veche de peste 250 de ani'],
  ['Distrugerea capitalei chineze Lo-yang', 'Distrugerea capitalei chineze Luoyang'],
  ['distrugerea orașului Lo-yang de niște', 'distrugerea orașului Luoyang de niște'],
  ['a fost distrus orașul chinez Lo-yang,', 'a fost distrus orașul chinez Luoyang,'],
  ['Ammianus Marcellinus afirmă — greu de crezut — că teritoriul hunilor se întindea până la:', 'Ammianus Marcellinus afirmă — greu de crezut — că hunii locuiau până lângă:'],
  ['"Oceanul Arctic"', '"„Oceanul înghețat” din nordul extrem"'],
  ['Afirmația despre extinderea până la Oceanul Arctic e considerată', 'Formula lui Ammianus, „lângă oceanul înghețat” (Res Gestae, 31.2.1), e considerată'],
  ['"În ce an au pornit hunii expansiunea bruscă asupra alanilor, spre Europa?"', '"În jurul cărui an zdrobesc hunii regatul greutungilor lui Ermanaric?"'],
  ['"Sursele nu dau o dată exactă: expansiunea începe undeva între 370 și 376 d.Hr. Anul convențional de referință, folosit pentru trecerea Volgăi și înfrângerea alanilor și ostrogoților, este 375."',
   '"Sursele nu dau o dată exactă. Convențional: alanii sunt supuși c. 370, regatul lui Ermanaric cade c. 375, iar tervingii trec Dunărea în 376."'],
  ['"Sub Attila, imperiul hunic atinge apogeul: capturează orașe bogate precum Marcianopolis, Naissus sau Viminacium, ocupă bucăți întregi din Panonia, Moesia și Tracia (430–440), iar tributul bizantin urcă de la 350 la 2.100 de livre de aur. Generalul roman Aetius — cândva aliat cu mercenari huni — devine, în 451, adversarul care îl oprește la Câmpiile Catalaunice. Fără să fie distrus însă: Attila se retrage, invadează Italia în 452, iar la moartea sa (453) și la Nedao (c. 454) — unde fiul său Ellac moare în luptă împotriva unei coaliții de gepizi și goți răsculați — imperiul hunic se prăbușește la fel de brusc cum apăruse, lăsând goții, burgunzii și vandalii pe care îi ținuse în frâu să fie absorbiți brusc în Imperiu, cu consecințe dezastruoase asupra stabilității acestuia."',
   '"Sub Attila, puterea hunică atinge apogeul. În campaniile din 441–447 cad orașe bogate precum Viminacium, Naissus și Marcianopolis, iar tributul plătit de Constantinopol urcă de la 350 la 2.100 de livre de aur. Generalul roman Aetius — care folosise ani la rând mercenari huni — devine în 451 adversarul care îl oprește la Câmpiile Catalaunice, fără să-l distrugă: Attila se retrage și invadează Italia în 452. După moartea sa (453), la Nedao (c. 454), gepizii regelui Ardaric și alte popoare supuse se răscoală, fiul său Ellac cade în luptă, iar hegemonia hunică se destramă aproape la fel de repede cum se formase."'],
  ['conform Păcii lui Anatolius (447 d.Hr.)?', 'conform Păcii lui Anatolius (443 sau 447 d.Hr. — datarea e discutată)?'],
  ['"Tributul a crescut constant: 350 de livre de aur în 431, 700 după Tratatul de la Margus (434) și 2.100 de livre — plus 6.000 restanțe — prin Pacea lui Anatolius (447), obligând Constantinopolul să mărească drastic taxele."',
   '"Tributul a crescut constant: 350 de livre de aur sub Rua, 700 după Tratatul de la Margus (c. 435) și 2.100 de livre — plus 6.000 restanțe — prin Pacea lui Anatolius (443 sau 447), obligând Constantinopolul să mărească drastic taxele."'],
  ['"Cum s-a folosit generalul roman Flavius Aetius de huni, în anii 430, înainte de a le deveni adversar?"', '"Cum s-a folosit generalul roman Flavius Aetius de huni, în anii 420–430, înainte de a le deveni adversar?"'],
  ['"Aetius, ostatic la huni în tinerețe, le cunoștea limba și tacticile — i-a folosit ca „as din mânecă”: mercenari împotriva uzurpatorului Ioannes, a bagauzilor din Armorica și a burgunzilor.',
   '"Aetius, ostatic la huni în tinerețe, cunoștea bine lumea lor — și i-a folosit ca „as din mânecă”: mercenari în sprijinul uzurpatorului Ioannes (425), apoi împotriva bagauzilor din Armorica și a burgunzilor (436–437).'],
  ['"I-a angajat ca mercenari împotriva uzurpatorului Ioannes, a răsculaților bagauzi și a burgunzilor"', '"I-a angajat ca mercenari: în sprijinul uzurpatorului Ioannes, apoi împotriva răsculaților bagauzi și a burgunzilor"'],
  ['"Ce schimbare în compoziția armatei hunice, sub Attila, a contribuit la victoria romano-vizigotă de la Câmpiile Catalaunice?"', '"Ce schimbare în compoziția armatei hunice, sub Attila, a contribuit — după unii istorici — la eșecul lui Attila în Galia (451)?"'],
  ['(goți, sciri, carpi)', '(goți, gepizi, sciri)'],
  ['"Mașina de război hunică s-a schimbat sub Attila: tot mai multă infanterie din popoare supuse, combinată cu dificultatea de a hrăni cai mulți pe campanii lungi, a redus exact avantajul care făcuse din huni o forță imbatabilă — mobilitatea cavaleriei ușoare."',
   '"Este teza lui R. P. Lindner (1981), discutată, dar influentă: sub Attila, armata se sprijinea tot mai mult pe infanteria popoarelor supuse, iar hrănirea multor cai pe campanii lungi, departe de stepă, devenea dificilă. Asta a redus exact avantajul care făcuse din huni o forță de temut — mobilitatea cavaleriei ușoare."'],
]);

// ---------------- Solia la Attila ----------------
edit(path.join(B, 'embassy.js'), [
  ["Miza e uriașă: tributul anual către Attila urcase deja de la 350 de livre de aur (431 d.Hr.) la 700 (Tratatul de la Margus, 434) și apoi la 2.100 de livre, plus 6.000 restanțe (Pacea lui Anatolius, 447)",
   "Miza e uriașă: tributul anual către Attila urcase deja de la 350 de livre de aur (sub Rua) la 700 (Tratatul de la Margus, c. 435) și apoi la 2.100 de livre, plus 6.000 restanțe (Pacea lui Anatolius, 443 sau 447)"],
  ["label: 'Oferi darurile respectând ierarhia locală: întâi Kreka, apoi Attila, apoi curtenii apropiați.'",
   "label: 'Oferi darurile respectând ierarhia curții: lui Attila, dar și reginei Kreka și curtenilor apropiați, fiecăruia separat.'"],
  // Attila did not confront Maximin and Priscus: the plot surfaced when Vigilas came back alone with the gold.
  ["'Attila vă confruntă brusc: descoperă că interpretul soliei, Vigilas, a fost trimis — cu știrea eunucului Chrysaphius de la curtea imperială, dar fără știrea ta sau a lui Maximin — cu 50 de livre de aur pentru a mitui un curtean hunic, Edeco, în vederea asasinării lui Attila. Edeco l-a trădat pe Vigilas, dezvăluind totul regelui.'",
   "'Ceva nu e în regulă: Attila vă primește cu răceală și vă pune la încercare. Tu și Maximin nu știți ce s-a pus la cale la Constantinopol: eunucul Chrysaphius l-a mituit pe Edeco, un curtean hunic venit în solie, să-l asasineze pe Attila, cu interpretul vostru, Vigilas, drept complice. Edeco i-a dezvăluit însă totul regelui.'"],
  ["'Cum răspunzi acuzației, în fața lui Attila?'", "'Cum te porți când bănuielile lui Attila cad asupra soliei?'"],
  ["explain: 'Corect. Istoric, Maximin și Priscus chiar nu știau de plan — reacția lor sinceră de negare, urmată de cooperare, i-a convins pe huni de nevinovăția solilor oficiali, spre deosebire de Vigilas.'",
   "explain: 'Corect. Istoric, Maximin și Priscus chiar nu știau de plan, iar Attila nu i-a acuzat pe ei. L-a lăsat pe Vigilas să plece și l-a prins la întoarcere, cu cele 50 de livre de aur ale mitei asupra lui; apoi a cerut încă 50 de livre pentru răscumpărarea fiului acestuia.'"],
  ["'Îl denunți public pe Vigilas chiar înainte ca Attila să aducă acuzația.'", "'Îl denunți pe Vigilas pe baza unor simple bănuieli, înainte să ai vreo dovadă.'"],
  ["'În timpul tratativelor apare o problemă de protocol care pare măruntă, dar nu este. Diplomații occidentali îl trataseră pe Attila ca pe un general plătit de Imperiu — negociatorul apusean Constantiolus îl considera un fel de comandant în solda Romei, care își primea leafa ca orice general. Attila cerea însă să fie recunoscut ca rege suveran.'",
   "'În timpul tratativelor apare o problemă de protocol care pare măruntă, dar nu este. Imperiul de Apus îi acordase lui Attila titlul de general roman (magister militum), cu leafa aferentă, iar aurul trimis putea fi prezentat, la Roma, ca soldă. Attila vedea însă în el tributul unor supuși și cerea să fie tratat ca rege suveran.'"],
  ["'Îl numești rege și te adresezi soliei ca între doi suverani, deși Constantinopolul preferă formula de „general”.'",
   "'Îl numești rege și vorbești ca între doi suverani, deși în actele romane el apare doar ca „general”.'"],
  ["author: 'Attila, redat de solul roman Constantiolus', src: 'sinteză după Priscus, Fragmenta' },\n          explain: 'Corect. Pentru Attila",
   "author: 'Attila, după relatarea lui Constantiolus, secretarul său pannonian', src: 'sinteză după Priscus, Fragmenta' },\n          explain: 'Corect. Pentru Attila"],
  // What Attila actually demanded in 449 (Priscus): fugitives back and a strip south of the Danube emptied.
  ["'Attila își prezintă condițiile finale: predarea dezertorilor huni refugiați la romani și un tribut anual sporit. De răspunsul tău depinde dacă solia se încheie cu un tratat sau cu un nou război.'",
   "'Attila își repetă cererile: predarea tuturor dezertorilor huni refugiați la romani, plata la timp a tributului și evacuarea unei fâșii de teritoriu la sud de Dunăre, „lată de cinci zile de drum”. Altfel, războiul.'"],
  ["label: 'Accepți integral condițiile lui Attila, pentru a asigura pacea imediată a Răsăritului.'",
   "label: 'Recomanzi acceptarea cererilor și plata tributului, pentru a câștiga timp și pace pentru Răsărit.'"],
  ["author: 'Attila, redat de solul roman Constantiolus', src: 'sinteză după Priscus, Fragmenta' },\n          explain: 'Corect din perspectiva",
   "author: 'Attila, după relatarea lui Constantiolus, secretarul său pannonian', src: 'sinteză după Priscus, Fragmenta' },\n          explain: 'Corect din perspectiva"],
  ["explain: 'Corect din perspectiva realpolitik-ului bizantin al anului 449: Teodosie al II-lea a acceptat exact aceste condiții (tributul anual de 2.100 de livre de aur, fixat prin Pacea lui Anatolius din 447), evitând un nou război pe care Imperiul de Răsărit nu și-l putea permite atunci. Pentru Attila, aurul însemna supunerea romanilor; pentru romani, era mai degrabă plata unui „general” subvenționat — o percepție care îl scotea din sărite pe Attila, dornic de titlu regal, nu de statut de mercenar.'",
   "explain: 'Corect din perspectiva realpolitik-ului bizantin: Teodosie al II-lea a ales calea aurului, nu a războiului, și a continuat plata celor 2.100 de livre pe an. În 450, o nouă solie (Anatolius și Nomus), cu daruri bogate, a obținut chiar concesii: Attila a renunțat la fâșia de la sud de Dunăre și la o parte din cererile privind dezertorii.'"],
  ["label: 'Continuarea plății tributului, pentru a menține pacea obținută cu greu la Tisa.'", "label: 'Continuarea plății tributului, pentru a menține pacea obținută cu greu la curtea lui Attila.'"],
  ["explain: 'Corect. Exact aceasta a fost politica reală a lui Marcian din 450 — motivul pentru care Attila și-a redirecționat, în 451, atenția spre Galia, în loc să reia atacul asupra Răsăritului.'",
   "explain: 'Corect. Exact aceasta a fost politica reală a lui Marcian din 450. Attila nu a mai atacat Răsăritul: în 451 și-a îndreptat armata spre Galia.'"],
]);
edit(path.join(B, 'embassy.body.html'), [
  ['<span class="stage-tag mono" id="stage-tag">Etapa 1/7</span>', '<span class="stage-tag mono" id="stage-tag">Etapa 1/9</span>'],
  ['<span>7 etape</span>', '<span>9 etape</span>'],
  ['<span class="mono" id="vb-count">0/7</span>', '<span class="mono" id="vb-count">0/9</span>'],
]);

// ---------------- Atlas ----------------
edit(path.join(B, 'atlas.js'), [
  ['iar armata hunică ajunge până la zidurile Constantinopolului.', 'iar armata hunică ajunge până aproape de zidurile Constantinopolului.'],
]);

// ---------------- Muzeu ----------------
edit(path.join(B, 'lab.js'), [
  ['"desc": "Sabie lungă de fier, cu două tăișuri (tipul ensis din surse), cu garda', '"desc": "Sabie lungă de fier, cu două tăișuri (spatha), cu garda'],
  ['"desc": "Poemul medieval Waltharius, bazat pe legende germanice mai vechi, atestă două tipuri de săbii hunice: ensis — sabia lungă cu două tăișuri, ca aceasta — și semispata, mai scurtă și cu un singur tăiș."',
   '"desc": "Lama dreaptă, lungă, cu două tăișuri, e cea a spathei — arma de rang a întregii Europe a epocii, nu doar a hunilor. Ce o face „princiară” nu e forma lamei, ci garnitura de aur și granate a mânerului."'],
  ["truth: 'Surse precum poemul medieval Waltharius atestă două tipuri de săbii hunice: ensis (sabie lungă, cu două tăișuri) și semispata (sabie scurtă, cu un singur tăiș). Ca și arcul compozit, sabia avea și valoare de obiect sacru/de rang, nu doar utilitară.'",
   "truth: 'Mormintele princiare, ca cel de la Jakuszowice, păstrează săbii lungi cu mânerul placat cu aur și granate — adevărate însemne de rang. Iar Iordanes (Getica, 183, după Priscus) povestește că Attila își sprijinea autoritatea pe „sabia lui Marte”, găsită de un păstor: sabia era și simbol al puterii, nu doar armă.'"],
  ["truth: 'Priscus din Panium o menționează explicit pe Kreka (Hereca), soția principală a lui Attila: avea propria ei curte, primea soli în nume propriu și administra proprietăți extinse — un statut diplomatic și economic ridicat pentru femeile din elita hunică.'",
   "truth: 'Priscus din Panium o descrie pe Kreka (Hereca), soția principală a lui Attila, în propria ei casă, înconjurată de slujnice, primind darurile soliei romane; tot el povestește cum văduva lui Bleda, stăpâna unui sat, a găzduit și ospătat solia. Femeile din elita hunică aveau un rol social și chiar diplomatic vizibil.'"],
  // The river-diversion burial is Alaric's (Getica 158), not Attila's.
  ["truth: 'Iordanes (Getica) povestește că Attila a fost așezat într-un sicriu triplu — aur, argint și fier — iar un râu a fost deviat temporar pentru ca mormântul să fie săpat chiar în albia lui. Sclavii care au făcut săpăturile ar fi fost uciși ca locul să rămână secret — motiv pentru care mormântul lui Attila nu a fost identificat până azi.'",
   "truth: 'Iordanes (Getica, 256–258) povestește că Attila a fost îngropat noaptea, într-un sicriu triplu — aur, argint și fier —, iar cei care au săpat mormântul au fost uciși, ca locul să rămână secret. Mormântul nu a fost identificat nici azi. Povestea cu râul deviat, atribuită adesea lui Attila, e de fapt a înmormântării lui Alaric (Getica, 158).'"],
  ["tezaurul de la Szikáncs, la est de Tisa, cuprinde peste 1.400 de monede — unele grupate la o greutate de exact 20 de livre, posibil folosite ca etalon. Monede și piese similare au ajuns și mai spre est, până la Dolhești (Moldova) și Șimleul Silvaniei (Transilvania) — dovadă că aurul roman circula și dincolo de Panonia, în tot spațiul carpatic sub influență hunică.'",
   "tezaurul de la Szikáncs, lângă Tisa, cuprinde cca. 1.440 de solidi, majoritatea ai lui Teodosie al II-lea — exact 20 de livre romane (72 de solidi la livră), probabil o plată rotundă, ajunsă direct din tribut în mâinile unui membru al elitei, nu în vistieria lui Attila.'"],
  ["truth: 'Dimpotrivă — aurul era prin excelență bunul caracteristic împăratului. Valentinian I și Valens creează funcția de comes sacrarum largitionum și impun solidul cu greutate fixă și puritate garantată, asigurând casei imperiale un monopol strict asupra metalului — motiv suplimentar pentru care tributul cerut de Attila lovea direct autoritatea și prestigiul imperial, nu doar visteria.'",
   "truth: 'Dimpotrivă — aurul era prin excelență bunul împăratului. Solidul, introdus de Constantin cel Mare, avea greutate fixă (1/72 dintr-o livră), iar Valentinian I și Valens au impus, după 366, ca aurul strâns din taxe să fie topit în lingouri de puritate garantată, sub controlul lui comes sacrarum largitionum. Tributul cerut de Attila lovea deci direct autoritatea și prestigiul imperial, nu doar vistieria.'"],
  ['<p class="flip-tag">Adevărul paleogenetic</p>', '<p class="flip-tag">Ce arată sursele și cercetarea</p>'],
  ['apasă pentru adevărul genetic →', 'apasă pentru a vedea adevărul →'],
]);
edit(path.join(B, 'lab.body.html'), [
  ['Mit vs. Adevăr Paleogenetic', 'Mit vs. adevăr'],
  ['Apasă pe fiecare card pentru a compara imaginea din cronicile antice cu ce arată, azi, ADN-ul antic și analiza izotopică.', 'Apasă pe fiecare card pentru a compara o idee răspândită despre huni cu ce arată izvoarele antice, arheologia și ADN-ul antic.'],
]);

// ---------------- Despre proiect ----------------
edit(path.join(ROOT, 'scripturi-build', 'assemble.js'), [
  ['Muzeu</strong> — artefacte hunice reale, explorabile pe fotografie, și dezbaterea mit vs. adevăr paleogenetic.', 'Muzeu</strong> — artefacte hunice reale, explorabile pe fotografie, și mituri despre huni verificate cu izvoarele și genetica.'],
  ['(Wikimedia Commons, licențe CC BY-SA)', '(Wikimedia Commons, licențe libere CC BY-SA sau CC0)'],
  ['Pagina rulează dintr-un singur fișier, fără server sau pas de build;', 'Pagina rulează dintr-un singur fișier, fără server și fără instalare;'],
  ['iar Atlasul și Laboratorul susțin', 'iar Atlasul și Muzeul susțin'],
  // Be explicit that the map background of the Atlas and of the Marea Migrație map is an AI-drawn illustration.
  ['reprodusă cu indicarea sursei.</li>', 'reprodusă cu indicarea sursei. Tot documente publicate sunt și cele două hărți istorice din articol (Wikimedia Commons, cu licența afișată).</li>\n      <li><strong>Fondul de hartă în stil antic</strong> din Atlas și din harta interactivă a Marii Migrații este o ilustrație generată cu AI, fără nicio inscripție. Tot ce se află peste el — orașe, bătălii, râuri, zone și trasee — a fost poziționat manual, pe coordonatele geografice reale, și se sprijină pe sursele citate.</li>'],
]);
console.log('gata');
