// Adds a 5th campaign to "Campania Hunilor" covering Attila's reign proper —
// the exact tribute figures (350 -> 700 -> 2.100 livre de aur), the
// Aetius-Huns relationship (mercenary allies before 451), the real outcome
// of the Catalaunian Fields (a tactical draw/withdrawal, not a crushing
// Hun victory), and the morale example of king Uptar's death — none of
// which the previous 4 levels touched (they stop at 370-375 d.Hr., the
// origins/onset of the migration).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const BODY_PATH = path.join(ROOT, 'build', 'game.body.html');
const JS_PATH = path.join(ROOT, 'build', 'game.js');
const CSS_PATH = path.join(ROOT, 'build', 'game.css');

// ---------- 1. body.html: route path, stats, sources, subtitle ----------
let body = fs.readFileSync(BODY_PATH, 'utf8');

function replaceOrDie(str, oldS, newS, label){
  if (!str.includes(oldS)) { console.error('NOT FOUND (' + label + ')'); process.exit(1); }
  return str.replace(oldS, newS);
}

body = replaceOrDie(body,
  '<p class="sub">370 d.Hr. Un popor de călăreți iese brusc din stepă și schimbă harta Europei. Parcurge 4 campanii istorice, răspunde corect și cucerește fiecare teritoriu.</p>',
  '<p class="sub">370 d.Hr. Un popor de călăreți iese brusc din stepă și schimbă harta Europei. Parcurge 5 campanii istorice, răspunde corect și cucerește fiecare teritoriu.</p>',
  'subtitle');

body = replaceOrDie(body,
  '<div class="stat"><b>4</b><span>Campanii</span></div>',
  '<div class="stat"><b>5</b><span>Campanii</span></div>',
  'stat count');

body = replaceOrDie(body,
  '<p class="sources"><b>Surse:</b> Ptolemeu (Geografia, 3.5.10), Ammianus Marcellinus (Res Gestae, 31.2.1), Priscus, Procopius, Agathias, cronici chineze despre Hsiung-nu, o scrisoare sogdiană din 311 d.Hr.</p>',
  '<p class="sources"><b>Surse:</b> Ptolemeu (Geografia, 3.5.10), Ammianus Marcellinus (Res Gestae, 31.2.1), Priscus, Procopius, Agathias, Iordanes (Getica), cronici chineze despre Hsiung-nu, o scrisoare sogdiană din 311 d.Hr.</p>',
  'sources');

// route: extend both the faint base path and the gold progress path with a
// 5th leg, ending at (780,100) — clear of the existing Caspică/Azov labels.
body = replaceOrDie(body,
  '<path id="route-base" d="M430,150 Q275,80 120,95 Q275,25 430,55 Q565,35 700,115" fill="none" stroke="var(--line-bright)" stroke-width="2" stroke-dasharray="1 8" stroke-linecap="round"/>',
  '<path id="route-base" d="M430,150 Q275,80 120,95 Q275,25 430,55 Q565,35 700,115 Q745,155 780,100" fill="none" stroke="var(--line-bright)" stroke-width="2" stroke-dasharray="1 8" stroke-linecap="round"/>',
  'route-base');

body = replaceOrDie(body,
  '<path id="route-progress" d="M430,150 Q275,80 120,95 Q275,25 430,55 Q565,35 700,115" fill="none" stroke="var(--gold)" stroke-width="3" stroke-linecap="round"/>',
  '<path id="route-progress" d="M430,150 Q275,80 120,95 Q275,25 430,55 Q565,35 700,115 Q745,155 780,100" fill="none" stroke="var(--gold)" stroke-width="3" stroke-linecap="round"/>',
  'route-progress');

fs.writeFileSync(BODY_PATH, body);
console.log('game.body.html updated');

// ---------- 2. game.js: WAYPOINTS_PCT + new LEVELS[4] entry ----------
let js = fs.readFileSync(JS_PATH, 'utf8');

js = replaceOrDie(js,
  "  var WAYPOINTS_PCT = [\n" +
  "    [430 / 800 * 100, 150 / 220 * 100],\n" +
  "    [120 / 800 * 100, 95 / 220 * 100],\n" +
  "    [430 / 800 * 100, 55 / 220 * 100],\n" +
  "    [700 / 800 * 100, 115 / 220 * 100]\n" +
  "  ];",
  "  var WAYPOINTS_PCT = [\n" +
  "    [430 / 800 * 100, 150 / 220 * 100],\n" +
  "    [120 / 800 * 100, 95 / 220 * 100],\n" +
  "    [430 / 800 * 100, 55 / 220 * 100],\n" +
  "    [700 / 800 * 100, 115 / 220 * 100],\n" +
  "    [780 / 800 * 100, 100 / 220 * 100]\n" +
  "  ];",
  'WAYPOINTS_PCT');

const newLevel = `        }
      ]
    },
    {
      zone: "z5",
      short: "Apogeu",
      kicker: "Campania V · Attila și Aetius",
      title: "Apogeul și declinul",
      icon: "V",
      badgeName: "Judecătorul Bătăliilor",
      mechanic: "charge",
      mechIcon: "ȘARJĂ",
      mechLabel: "Șarjează spre stindardul cu răspunsul corect",
      timelineQ: {
        q: "În ce an a avut loc bătălia de la Câmpiile Catalaunice, care oprește avansul lui Attila spre vest?",
        min: 430, max: 460, correct: 451, tolerance: 4, unit: "d.Hr.",
        fb: "Bătălia de la Câmpiile Catalaunice a avut loc în 451 d.Hr. — ultima mare confruntare a lui Attila pe teritoriul Imperiului de Apus înainte de invazia Italiei, din anul următor."
      },
      lore: "Sub Attila, imperiul hunic atinge apogeul: tributul bizantin urcă de la 350 la 2.100 de livre de aur, iar generalul roman Aetius — cândva aliat cu mercenari huni — devine, în 451, adversarul care îl oprește la Câmpiile Catalaunice. Fără să fie distrus însă: Attila se retrage, invadează Italia în 452, iar la moartea sa (453) și la Nedao (454) imperiul hunic se prăbușește la fel de brusc cum apăruse.",
      meta: "4 întrebări · Priscus, Iordanes, Prosper de Aquitania",
      questions: [
        {
          era: "Economie · tribut bizantin",
          q: "Cât ajunsese tributul anual plătit de Constantinopol lui Attila, conform Păcii lui Anatolius (447 d.Hr.)?",
          opts: ["700 de livre de aur", "2.100 de livre de aur, plus 6.000 de livre restanțe", "350 de livre de aur", "Niciun tribut — doar daruri protocolare"],
          correct: 1,
          fb: "Tributul a crescut constant: 350 de livre de aur în 431, 700 după Tratatul de la Margus (434) și 2.100 de livre — plus 6.000 restanțe — prin Pacea lui Anatolius (447), obligând Constantinopolul să mărească drastic taxele."
        },
        {
          era: "Relația cu Roma de Apus",
          q: "Cum s-a folosit generalul roman Flavius Aetius de huni, în anii 430, înainte de a le deveni adversar?",
          opts: ["I-a angajat ca mercenari împotriva uzurpatorului Ioannes, a răsculaților bagauzi și a burgunzilor", "I-a atacat imediat ce a preluat comanda armatei romane", "A refuzat orice contact diplomatic sau militar cu ei", "I-a convertit la creștinism prin misionari romani"],
          correct: 0,
          fb: "Aetius, ostatic la huni în tinerețe, le cunoștea limba și tacticile — i-a folosit ca „as din mânecă”: mercenari împotriva uzurpatorului Ioannes, a bagauzilor din Armorica și a burgunzilor. Abia invazia Galiei (451) îi transformă în dușmani."
        },
        {
          era: "Câmpiile Catalaunice · 451 d.Hr.",
          q: "Care a fost rezultatul real al bătăliei de la Câmpiile Catalaunice?",
          opts: ["O victorie zdrobitoare a lui Attila, urmată de cucerirea Galiei", "Un rezultat nedecis — coaliția romano-vizigotă oprește avansul lui Attila, dar nu îl distruge, iar el se retrage teafăr", "O înfrângere totală a hunilor, cu capturarea lui Attila", "O pace semnată imediat pe câmpul de luptă"],
          correct: 1,
          fb: "Aetius și regele vizigot Teodoric I (mort în luptă) opresc expansiunea hunică spre vest — dar Aetius nu îl urmărește pe Attila, care se retrage intact și invadează Italia în 452. Nu a fost o victorie zdrobitoare romană, ci o remiză tactică cu retragere hunică."
        },
        {
          era: "Structura militară · moralul trupelor",
          q: "Ce arată moartea regelui hunic Uptar, într-o campanie împotriva burgunzilor, despre structura armatei hunice?",
          opts: ["Că hunii aveau o structură de comandă solidă, independentă de orice lider", "Că moartea liderului putea demoraliza complet o armată hunică — cei 10.000 de oameni ai lui Uptar au fost nimiciți de doar 3.000 de inamici, imediat după", "Că burgunzii erau aliați tradiționali, nu adversari, ai hunilor", "Că Attila l-a răzbunat personal pe Uptar la scurt timp"],
          correct: 1,
          fb: "Unitățile hunice de cavalerie erau construite pe legături de rudenie de sânge, cu liderul drept liant absolut — la moartea lui Uptar, cei 10.000 de soldați ai săi s-au demoralizat atât de tare încât au fost nimiciți de o armată de doar 3.000 de oameni."
        }
      ]
    }
  ];`;

js = replaceOrDie(js,
  `        }
      ]
    }
  ];`,
  newLevel,
  'LEVELS array tail');

fs.writeFileSync(JS_PATH, js);
console.log('game.js updated');

// ---------- 3. game.css: --z5 / --z5-bg zone colors ----------
let css = fs.readFileSync(CSS_PATH, 'utf8');
css = replaceOrDie(css,
  '    --z4: #4fb07a;\n    --z4-bg: #12271b;',
  '    --z4: #4fb07a;\n    --z4-bg: #12271b;\n    --z5: #c94f4f;\n    --z5-bg: #2a1414;',
  'z5 css vars');
fs.writeFileSync(CSS_PATH, css);
console.log('game.css updated');
