// Two additions to the Laborator artifact viewer:
// 1. Replaces the generic MNIR diadem photo with the real Gherăseni piece
//    (Buzău County Museum, inv. 42263) — the exact object the article already
//    discusses by name. The old photo showed a different, unrelated diadem,
//    which the article text carefully distinguished; that distinction is now
//    obsolete and is removed too.
// 2. Adds a fourth artifact: the spatha (long iron sword with a gold-and-
//    garnet hilt fitting) from the same princely grave at Jakuszowice as the
//    bow already on site — same museum, same photographer, so the site's own
//    "reconstituire vs. piesă originală" labelling stays consistent.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const JS = path.join(ROOT, 'build', 'lab.js');
const BODY = path.join(ROOT, 'build', 'story.body.html');

function b64(file){
  return 'data:image/jpeg;base64,' + fs.readFileSync(path.join(ROOT, 'imagini', 'muzeu', file)).toString('base64');
}

let js = fs.readFileSync(JS, 'utf8');

// ---------- 1. locate the diadem object literal precisely ----------
const diademStart = js.indexOf('      "name": "Diadema hunică de aur",');
if (diademStart === -1) { console.error('diadem entry not found'); process.exit(1); }
const diademObjStart = js.lastIndexOf('    {', diademStart);
const diademObjEnd = js.indexOf('\n    }', diademStart) + '\n    }'.length;
const oldDiadem = js.slice(diademObjStart, diademObjEnd);
if (!oldDiadem.includes('"ratio": "1200 / 570"')) { console.error('unexpected diadem block contents'); process.exit(1); }

const newDiadem = `    {
      "name": "Diadema de la Gherăseni",
      "kind": "Piesă originală · descoperire din România",
      "desc": "Diademă din foiță de aur cu incrustații de granat, descoperită în 1965 la Gherăseni (jud. Buzău), într-un mormânt din prima jumătate a secolului al V-lea. Muzeul Județean Buzău, inv. 42263.",
      "credit": "Muzeul Județean Buzău · foto Laci3, CC0, Wikimedia Commons",
      "alt": "Diademă hunică din foiță de aur, montată pe un suport de expunere: bandă lată acoperită cu rânduri de plăcuțe de granat roșu montate în celule, cu o piatră rotundă centrală și bordură aurie perlată.",
      "ratio": "1300 / 884",
      "img": "${b64('diadema-gheraseni-final.jpg')}",
      "hotspots": [
        {
          "x": 49,
          "y": 35,
          "title": "Piatra centrală (cabochon)",
          "desc": "O piatră rotundă, șlefuită în cabochon (fără fațete), marchează axul diademei — singurul element necolțuros din tot ansamblul, probabil un reper de simetrie pentru meșter la montarea celulelor."
        },
        {
          "x": 27,
          "y": 48,
          "title": "Incrustațiile cloisonné",
          "desc": "Celule de aur umplute cu plăcuțe de granat șlefuit, în tehnica „cloisonné” — stilul policrom răspândit în Bazinul Carpatic în perioada hunică. Analiza antropologică a scheletului din mormânt a arătat un craniu deformat artificial."
        },
        {
          "x": 66,
          "y": 34,
          "title": "Urmele de asamblare",
          "desc": "Foița de aur nu e dintr-o singură bucată: se văd cusăturile unde segmentele separate au fost îmbinate. Diadema era montată pe un suport perisabil (piele sau textil), care nu s-a păstrat."
        }
      ]
    }`;

js = js.slice(0, diademObjStart) + newDiadem + js.slice(diademObjEnd);

// ---------- 2. append the sword as a 4th artifact ----------
const arrayEndMarker = newDiadem.slice(-6); // "\n    }"
const insertPoint = js.indexOf(newDiadem) + newDiadem.length;
const swordEntry = `,
    {
      "name": "Spatha hunică",
      "kind": "Piesă originală · mormânt princiar",
      "desc": "Sabie lungă de fier, cu două tăișuri (tipul ensis din surse), cu garda și mânerul placate cu aur și incrustate cu granate — din același mormânt princiar de la Jakuszowice (Polonia) ca arcul compozit expus alături.",
      "credit": "Muzeul Arheologic din Cracovia · foto Silar, CC BY-SA 4.0, Wikimedia Commons",
      "alt": "Sabie lungă de fier, cu lama dreaptă și gardă scurtă, având mânerul acoperit cu o piesă de aur decorată cu granate montate în celule.",
      "ratio": "3347 / 2211",
      "img": "${b64('spatha-final.jpg')}",
      "hotspots": [
        {
          "x": 77,
          "y": 38,
          "title": "Mânerul placat cu aur și granate",
          "desc": "Ca și arcurile poleite, mânerele de sabie placate cu aur și pietre semiprețioase marcau rangul purtătorului — sabia era, alături de arc, celălalt obiect cu valoare aproape sacră a elitei hunice."
        },
        {
          "x": 36,
          "y": 41,
          "title": "Lama de fier, cu două tăișuri",
          "desc": "Poemul medieval Waltharius, bazat pe legende germanice mai vechi, atestă două tipuri de săbii hunice: ensis — sabia lungă cu două tăișuri, ca aceasta — și semispata, mai scurtă și cu un singur tăiș."
        },
        {
          "x": 75,
          "y": 81,
          "title": "Garda scurtă",
          "desc": "O gardă minimală, abia vizibilă, tipică armelor gândite pentru viteză și pentru lupta călare, nu pentru scrimă de infanterie cu paradă lată."
        }
      ]
    }`;

js = js.slice(0, insertPoint) + swordEntry + js.slice(insertPoint);

fs.writeFileSync(JS, js);
console.log('lab.js: diadema Gherăseni + sabia adăugate (4 artefacte acum)');

// ---------- 3. story.body.html: the Gherăseni paragraph no longer needs the
// "these are different pieces" caveat, since the Lab artifact now IS this piece ----------
let body = fs.readFileSync(BODY, 'utf8');

const oldPara = 'Cea mai grăitoare piesă descoperită pe teritoriul României este însă <b>diadema de la Gherăseni</b> (județul Buzău), găsită în 1965 la Grindul Cremenea, într-un mormânt de înhumație din prima jumătate a secolului al V-lea. E lucrată pe un miez de bronz acoperit cu foiță de aur și împodobită cu almandine montate <em>à cabochon</em>, în stilul policrom al epocii. Analiza antropologică a arătat că scheletul aparținea unei femei cu <b>craniul deformat artificial</b> — aceeași practică de elită despre care vorbesc izvoarele. Piesa face parte din patrimoniul Muzeului Județean Buzău și se înscrie într-o serie de circa 25 de diademe asemănătoare, descoperite pe un areal imens, din Kazahstanul de azi până în Europa Centrală<sup class="fn" data-n="21">21</sup>.';

const newPara = 'Cea mai grăitoare piesă descoperită pe teritoriul României este însă <b>diadema de la Gherăseni</b> (județul Buzău) — expusă și explorabilă în detaliu în modulul <a href="#mod-lab">Laborator &amp; Muzeu</a> al acestui site. Găsită în 1965 la Grindul Cremenea, într-un mormânt de înhumație din prima jumătate a secolului al V-lea, e lucrată pe un miez de bronz acoperit cu foiță de aur și împodobită cu almandine montate <em>à cabochon</em>, în stilul policrom al epocii. Analiza antropologică a arătat că scheletul aparținea unei femei cu <b>craniul deformat artificial</b> — aceeași practică de elită despre care vorbesc izvoarele. Piesa face parte din patrimoniul Muzeului Județean Buzău și se înscrie într-o serie de circa 25 de diademe asemănătoare, descoperite pe un areal imens, din Kazahstanul de azi până în Europa Centrală<sup class="fn" data-n="21">21</sup>.';

if (!body.includes(oldPara)) { console.error('Gherăseni paragraph not found'); process.exit(1); }
body = body.replace(oldPara, newPara);
fs.writeFileSync(BODY, body);
console.log('story.body.html: paragraful Gherăseni legat de artefactul din Laborator');
