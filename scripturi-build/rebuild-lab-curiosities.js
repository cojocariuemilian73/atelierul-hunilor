// Adds new historically-accurate content to the Laborator module, text-only
// (no new photos needed): one extra hotspot on the existing bow artifact
// (gilded ceremonial bows as rank symbols) and four new myth/truth entries
// (swords, women's status, Attila's secret tomb, the 452 plague in Italy).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const JS_PATH = path.join(ROOT, 'build', 'lab.js');

let js = fs.readFileSync(JS_PATH, 'utf8');

// ---------- 1. new hotspot on the recurved bow ----------
const oldHotspot =
  "        { x: 61, y: 57, title: 'Legăturile din tendon', desc: 'Fâșiile de tendon animal răsucit, vizibile ca înfășurări la îmbinările arcului, întăreau structura compozită și îi ofereau elasticitatea necesară unei eliberări rapide, esențială pentru tragerea din șa, în plină mișcare.' }\n      ]";

if (!js.includes(oldHotspot)) { console.error('OLD bow hotspot block not found'); process.exit(1); }

const newHotspot =
  "        { x: 61, y: 57, title: 'Legăturile din tendon', desc: 'Fâșiile de tendon animal răsucit, vizibile ca înfășurări la îmbinările arcului, întăreau structura compozită și îi ofereau elasticitatea necesară unei eliberări rapide, esențială pentru tragerea din șa, în plină mișcare.' },\n" +
  "        { x: 20, y: 65, title: 'Arcuri placate cu aur — simbol de rang', desc: 'Nu toate arcurile compozite erau identice: exemplare descoperite la Jakuszowice (Polonia) și Bátaszék (Ungaria) au foiță de aur pe siyah, semn că arma nu era doar armă, ci și marcă de statut politic al purtătorului, în elita hunică și a popoarelor sub influența ei.' }\n      ]";

js = js.replace(oldHotspot, newHotspot);

// ---------- 2. four new myth/truth entries ----------
const oldTail =
  "      myth: 'Sosirea hunilor a însemnat o înlocuire totală a populației din Bazinul Carpatic.',\n" +
  "      truth: 'Multe eșantioane genetice din perioada hunică arată ascendență predominant locală/europeană. Datele sugerează o elită conducătoare relativ redusă numeric, care domina politic populații majoritar autohtone — nu o înlocuire demografică completă.'\n" +
  "    }\n" +
  "  ];";

if (!js.includes(oldTail)) { console.error('OLD myths tail not found'); process.exit(1); }

const newTail =
  "      myth: 'Sosirea hunilor a însemnat o înlocuire totală a populației din Bazinul Carpatic.',\n" +
  "      truth: 'Multe eșantioane genetice din perioada hunică arată ascendență predominant locală/europeană. Datele sugerează o elită conducătoare relativ redusă numeric, care domina politic populații majoritar autohtone — nu o înlocuire demografică completă.'\n" +
  "    },\n" +
  "    {\n" +
  "      myth: 'Hunii foloseau un singur tip de sabie, simplă și fără valoare simbolică.',\n" +
  "      truth: 'Surse precum poemul medieval Waltharius atestă două tipuri de săbii hunice: ensis (sabie lungă, cu două tăișuri) și semispata (sabie scurtă, cu un singur tăiș). Ca și arcul compozit, sabia avea și valoare de obiect sacru/de rang, nu doar utilitară.'\n" +
  "    },\n" +
  "    {\n" +
  "      myth: 'Sursele romane vorbesc doar despre războinici — femeile hunice nu apar în istorie.',\n" +
  "      truth: 'Priscus din Panium o menționează explicit pe Kreka (Hereca), soția principală a lui Attila: avea propria ei curte, primea soli în nume propriu și administra proprietăți extinse — un statut diplomatic și economic ridicat pentru femeile din elita hunică.'\n" +
  "    },\n" +
  "    {\n" +
  "      myth: 'Se cunoaște exact locul unde a fost înmormântat Attila.',\n" +
  "      truth: 'Jordanes (Getica) povestește că Attila a fost așezat într-un sicriu triplu — aur, argint și fier — iar un râu a fost deviat temporar pentru ca mormântul să fie săpat chiar în albia lui. Sclavii care au făcut săpăturile ar fi fost uciși ca locul să rămână secret — motiv pentru care mormântul lui Attila nu a fost identificat până azi.'\n" +
  "    },\n" +
  "    {\n" +
  "      myth: 'Attila s-a oprit înaintea Romei, în 452, exclusiv din respect pentru intervenția Papei Leon I.',\n" +
  "      truth: 'Întâlnirea cu Leon I a contat, dar istoricii moderni subliniază și o cauză materială decisivă: o epidemie de ciumă/dizenterie și lipsa de provizii au decimat armata hunică în nordul Italiei — factori care, alături de diplomația papală, au grăbit retragerea lui Attila.'\n" +
  "    }\n" +
  "  ];";

js = js.replace(oldTail, newTail);
fs.writeFileSync(JS_PATH, js);
console.log('lab.js: added 1 bow hotspot + 4 myth/truth entries');
