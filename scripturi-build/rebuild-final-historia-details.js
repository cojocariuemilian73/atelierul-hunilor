// Final pass integrating the remaining details from the Historia.ro article
// that weren't yet covered: bone arrowheads, Onegesius' ransom demand, the
// Huns' ethnic-amalgam composition, and — most substantively — the tactical
// shift under Attila (more subject-people infantry, harder to feed cavalry
// horses on long campaigns) that explains WHY Rome could win at the
// Catalaunian Fields, plus naming Ellac's death at Nedao.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

function replaceOrDie(str, oldS, newS, label){
  if (!str.includes(oldS)) { console.error('NOT FOUND (' + label + ')'); process.exit(1); }
  return str.replace(oldS, newS);
}

// ---------- 1. lab.js: two more myth/truth entries ----------
const LAB_JS = path.join(ROOT, 'build', 'lab.js');
let lab = fs.readFileSync(LAB_JS, 'utf8');

lab = replaceOrDie(lab,
  "      myth: 'Attila s-a oprit înaintea Romei, în 452, exclusiv din respect pentru intervenția Papei Leon I.',\n" +
  "      truth: 'Întâlnirea cu Leon I a contat, dar istoricii moderni subliniază și o cauză materială decisivă: o epidemie de ciumă/dizenterie și lipsa de provizii au decimat armata hunică în nordul Italiei — factori care, alături de diplomația papală, au grăbit retragerea lui Attila.'\n" +
  "    }\n" +
  "  ];",
  "      myth: 'Attila s-a oprit înaintea Romei, în 452, exclusiv din respect pentru intervenția Papei Leon I.',\n" +
  "      truth: 'Întâlnirea cu Leon I a contat, dar istoricii moderni subliniază și o cauză materială decisivă: o epidemie de ciumă/dizenterie și lipsa de provizii au decimat armata hunică în nordul Italiei — factori care, alături de diplomația papală, au grăbit retragerea lui Attila.'\n" +
  "    },\n" +
  "    {\n" +
  "      myth: 'Toate vârfurile de săgeți hunice erau din fier, ca la majoritatea popoarelor stepei.',\n" +
  "      truth: 'Ammianus Marcellinus notează, ca mare curiozitate, că hunii foloseau și vârfuri de săgeți sculptate din os, pe lângă cele din fier — un detaliu tehnic care i s-a părut demn de menționat unui observator roman obișnuit cu armamentul metalic.'\n" +
  "    },\n" +
  "    {\n" +
  "      myth: 'Aurul cerut de huni era doar tribut de stat, plătit exclusiv între Attila și împărat.',\n" +
  "      truth: 'Prețul se negocia și la nivel individual: Onegesius, unul dintre cei mai de încredere oameni ai lui Attila, a cerut 500 de solidi de aur doar pentru răscumpărarea soției și copiilor unui singur cetățean roman capturat — o sumă uriașă pentru o singură familie.'\n" +
  "    }\n" +
  "  ];",
  'lab myths tail');

fs.writeFileSync(LAB_JS, lab);
console.log('lab.js: added 2 more myth/truth entries');

// ---------- 2. game.js: enrich Campania V lore + add a 5th question about the tactical shift ----------
const GAME_JS = path.join(ROOT, 'build', 'game.js');
let game = fs.readFileSync(GAME_JS, 'utf8');

game = replaceOrDie(game,
  'lore: "Sub Attila, imperiul hunic atinge apogeul: tributul bizantin urcă de la 350 la 2.100 de livre de aur, iar generalul roman Aetius — cândva aliat cu mercenari huni — devine, în 451, adversarul care îl oprește la Câmpiile Catalaunice. Fără să fie distrus însă: Attila se retrage, invadează Italia în 452, iar la moartea sa (453) și la Nedao (454) imperiul hunic se prăbușește la fel de brusc cum apăruse.",',
  'lore: "Sub Attila, imperiul hunic atinge apogeul: tributul bizantin urcă de la 350 la 2.100 de livre de aur, iar generalul roman Aetius — cândva aliat cu mercenari huni — devine, în 451, adversarul care îl oprește la Câmpiile Catalaunice. Fără să fie distrus însă: Attila se retrage, invadează Italia în 452, iar la moartea sa (453) și la Nedao (454) — unde fiul său Ellac moare în luptă împotriva unei coaliții de gepizi și goți răsculați — imperiul hunic se prăbușește la fel de brusc cum apăruse.",',
  'Campania V lore');

game = replaceOrDie(game,
  '          fb: "Unitățile hunice de cavalerie erau construite pe legături de rudenie de sânge, cu liderul drept liant absolut — la moartea lui Uptar, cei 10.000 de soldați ai săi s-au demoralizat atât de tare încât au fost nimiciți de o armată de doar 3.000 de oameni."\n' +
  '        }\n' +
  '      ]\n' +
  '    }\n' +
  '  ];',
  '          fb: "Unitățile hunice de cavalerie erau construite pe legături de rudenie de sânge, cu liderul drept liant absolut — la moartea lui Uptar, cei 10.000 de soldați ai săi s-au demoralizat atât de tare încât au fost nimiciți de o armată de doar 3.000 de oameni."\n' +
  '        },\n' +
  '        {\n' +
  '          era: "Evoluția tacticii sub Attila",\n' +
  '          q: "Ce schimbare în compoziția armatei hunice, sub Attila, a contribuit la victoria romano-vizigotă de la Câmpiile Catalaunice?",\n' +
  '          opts: ["Hunii au renunțat complet la cavalerie", "Armata s-a bazat tot mai mult pe infanterie recrutată din popoarele supuse (goți, sciri, carpi), iar hrănirea unui număr mare de cai în campanii lungi a devenit tot mai greu de susținut, scăzând mobilitatea specifică hunilor", "Romanii au adoptat arcul compozit hunic", "Attila a desființat unitățile de cavalerie de rudenie de sânge"],\n' +
  '          correct: 1,\n' +
  '          fb: "Mașina de război hunică s-a schimbat sub Attila: tot mai multă infanterie din popoare supuse, combinată cu dificultatea de a hrăni cai mulți pe campanii lungi, a redus exact avantajul care făcuse din huni o forță imbatabilă — mobilitatea cavaleriei ușoare."\n' +
  '        }\n' +
  '      ]\n' +
  '    }\n' +
  '  ];',
  'Campania V 5th question');

game = replaceOrDie(game,
  'meta: "4 întrebări · Priscus, Iordanes, Prosper de Aquitania",',
  'meta: "5 întrebări · Priscus, Iordanes, Prosper de Aquitania",',
  'Campania V meta count');

fs.writeFileSync(GAME_JS, game);
console.log('game.js: Campania V lore enriched (Ellac/Nedao) + 5th question added');

// ---------- 3. game.body.html: qcount/meta text stays dynamic (TOTAL_Q, lv.meta) — but level meta string needs updating to "5 întrebări" ----------
