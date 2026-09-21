// Replaces the AI-generated artifact illustrations with real, documented
// museum photographs from Wikimedia Commons. The previous images were
// Flux/Midjourney generations annotated with "explicații arheologice" —
// which, to a history jury, reads as fabricated evidence.
//
// Each artifact now carries: what it actually is (original fragment vs.
// museum reconstruction), the find location, the holding museum, the
// photographer and the licence. The fake "3D viewer" (a flat image spun with
// CSS, which vanished past 90° because it had no back face) is replaced by an
// honest annotated-photograph viewer, and the hotspots finally respond to the
// keyboard.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const JS = path.join(ROOT, 'build', 'lab.js');
const CSS = path.join(ROOT, 'build', 'lab.css');
const BODY = path.join(ROOT, 'build', 'lab.body.html');

function b64(file){
  return 'data:image/jpeg;base64,' + fs.readFileSync(path.join(ROOT, 'imagini', 'muzeu', file)).toString('base64');
}

const ARTIFACTS = [
  {
    name: 'Arcul compozit hunic',
    kind: 'Reconstituire de muzeu',
    desc: 'Reconstituirea arcului reflex din mormântul princiar de la Jakuszowice (Polonia), cu brațele placate cu foiță de aur — arma care a definit cavaleria hunică.',
    credit: 'Muzeul Arheologic din Cracovia · foto Silar, CC BY-SA 4.0, Wikimedia Commons',
    alt: 'Reconstituirea unui arc compozit hunic, expusă într-o vitrină de muzeu: arc asimetric, cu dublă curbură, având brațul superior placat cu foiță de aur.',
    img: b64('arc-final.jpg'),
    hotspots: [
      { x: 50, y: 31, title: 'Placarea cu aur — simbol de rang', desc: 'Porțiunea aurită de pe brațul superior nu are rol tehnic: arcurile placate cu foiță de aur, descoperite la Jakuszowice (Polonia) și Bátaszék (Ungaria), marcau statutul politic al purtătorului. Arma era și însemn de putere, nu doar unealtă de luptă.' },
      { x: 77, y: 13, title: 'Capătul recurbat (siyah)', desc: 'Capetele rigide, întoarse invers față de curbura arcului, funcționau ca niște pârghii: măreau brusc tensiunea în ultima parte a tragerii. De aici viteza mare a săgeții, la un arc suficient de scurt încât să fie mânuit din șa.' },
      { x: 21, y: 60, title: 'Brațe asimetrice', desc: 'Brațul inferior este mai scurt decât cel superior — o soluție care permitea tragerea comodă de pe cal, fără ca arcul să lovească gâtul animalului la coborârea mâinii.' }
    ]
  },
  {
    name: 'Cazanul hunic de bronz',
    kind: 'Fragmente originale',
    desc: 'Fragmente din cazane hunice descoperite la Úvalno, Milotice nad Opavou și Razová (Silezia cehă). Cazanul turnat dintr-o bucată este piesa cea mai caracteristică a arheologiei hunice.',
    credit: 'Slezské zemské muzeum, Opava · foto Karel Frydrýšek (Fry72), CC BY-SA 4.0, Wikimedia Commons',
    alt: 'Vitrină de muzeu cu trei fragmente de bronz dintr-un cazan hunic: o bucată de buză cu nervuri orizontale, o toartă masivă cu proeminențe în formă de ciupercă și un fragment mic, alături de eticheta expoziției.',
    img: b64('cazan-final.jpg'),
    hotspots: [
      { x: 45, y: 25, title: 'Buza cu nervuri orizontale', desc: 'Fragment de buză cu nervuri orizontale în relief, element decorativ tipic al cazanelor hunice. Piesa provine de la Milotice nad Opavou și este împrumutată de la muzeul din Bruntál.' },
      { x: 84, y: 30, title: 'Toarta „în formă de ciupercă”', desc: 'Toartele masive, cu proeminențe în formă de ciupercă, sunt elementul de diagnostic care deosebește cazanele hunice de cele scitice sau sarmatice anterioare. Fragmentul provine de la Razová și este din cupru.' },
      { x: 69, y: 69, title: 'Fragment de la Úvalno', desc: 'Bucată mică, împrumutată de la Muzeul Municipal din Krnov. Cazanele hunice apar rareori întregi: cele mai multe au fost găsite fragmentar sau îngropate izolat, adesea lângă râuri — posibil ca depuneri rituale.' },
      { x: 16, y: 84, title: 'Eticheta expoziției', desc: 'Eticheta originală a vitrinei: „Nálezy z doby stěhování národů / Zlomky hunského kotle” — Descoperiri din epoca migrațiilor / Fragmente de cazan hunic, cu proveniența fiecărei piese. Lăsată intenționat vizibilă, ca dovadă a contextului muzeal.' }
    ]
  },
  {
    name: 'Diadema hunică de aur',
    kind: 'Piesă originală · colecție din România',
    desc: 'Diademă din foiță de aur cu incrustații de granat, secolul al V-lea, aflată în Tezaurul Muzeului Național de Istorie a României.',
    credit: 'Muzeul Național de Istorie a României — Tezaur · foto Sailko, CC BY-SA 3.0, Wikimedia Commons',
    alt: 'Diademă hunică din foiță de aur, lungă și îngustă, acoperită cu rânduri de plăcuțe de granat roșu montate în celule, cu bordură perlată în relief pe margini.',
    img: b64('diadema-final.jpg'),
    hotspots: [
      { x: 30, y: 45, title: 'Incrustații de granat (cloisonné)', desc: 'Celule metalice umplute cu plăcuțe de granat șlefuit — tehnica „cloisonné”, marca stilului policrom răspândit în Bazinul Carpatic în perioada hunică. Roșul granatului pe fond de aur era semnul distinctiv al elitei.' },
      { x: 55, y: 86, title: 'Bordura perlată', desc: 'Marginea decorată prin ciocănire din spate (repoussé), formând un șir de perle în relief. O tehnică ce cerea meșteri specializați și tablă de aur subțire, lucrată fără a fi străpunsă.' },
      { x: 60, y: 14, title: 'Sistem de prindere', desc: 'Urmele de prindere de pe margine arată că foița de aur era fixată pe un suport perisabil — probabil piele sau material textil — care nu s-a păstrat. Diademele de acest tip apar în morminte feminine bogat înzestrate.' }
    ]
  }
];

// ---------- 1. lab.js: swap the data + viewer behaviour ----------
let js = fs.readFileSync(JS, 'utf8');

const artStart = js.indexOf('  var ARTIFACTS = [');
const artEnd = js.indexOf('\n  ];', artStart);
if (artStart === -1 || artEnd === -1) { console.error('ARTIFACTS array not found'); process.exit(1); }

const newArtifacts = '  var ARTIFACTS = ' + JSON.stringify(ARTIFACTS, null, 2).replace(/\n/g, '\n  ') + ';';
js = js.slice(0, artStart) + newArtifacts + js.slice(artEnd + 5);

// Card markup: add the "what is this" badge and the credit line.
const oldCard = `    card.innerHTML =
      '<div class="viewer-stage" id="stage-' + index + '">' +
        '<div class="viewer-object" id="obj-' + index + '">' +
          '<div class="viewer-face front"><img src="' + art.img + '" alt="' + art.name + '"/></div>' +
        '</div>' +
      '</div>' +
      '<h3>' + art.name + '</h3>' +
      '<p class="artifact-desc">' + art.desc + '</p>' +
      '<p class="viewer-hint">trage pentru a roti</p>' +
      '<button class="viewer-reset" data-ai="' + index + '" type="button">Resetează unghiul</button>';`;

const newCard = `    card.innerHTML =
      '<div class="viewer-stage" id="stage-' + index + '">' +
        '<div class="viewer-object" id="obj-' + index + '">' +
          '<div class="viewer-face front"><img src="' + art.img + '" alt="' + art.alt + '"/></div>' +
        '</div>' +
      '</div>' +
      '<p class="artifact-kind">' + art.kind + '</p>' +
      '<h3>' + art.name + '</h3>' +
      '<p class="artifact-desc">' + art.desc + '</p>' +
      '<p class="viewer-hint">apasă pe punctele roșii pentru detalii</p>' +
      '<p class="artifact-credit">' + art.credit + '</p>';`;

if (!js.includes(oldCard)) { console.error('card markup not found'); process.exit(1); }
js = js.replace(oldCard, newCard);

// Hotspots: activate with Enter/Space, position the popover relative to the dot
// when the keyboard is used (a keydown carries no pointer coordinates).
const oldHotspot = `      dot.addEventListener('click', function(e){
        e.stopPropagation();
        showPopover(popoverEl, e.clientX, e.clientY, hs.title, hs.desc);
      });`;

const newHotspot = `      dot.addEventListener('click', function(e){
        e.stopPropagation();
        showPopover(popoverEl, e.clientX, e.clientY, hs.title, hs.desc);
      });
      dot.addEventListener('keydown', function(e){
        if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
        e.preventDefault();
        e.stopPropagation();
        var r = dot.getBoundingClientRect();
        showPopover(popoverEl, r.left + r.width / 2, r.bottom, hs.title, hs.desc);
      });`;

if (!js.includes(oldHotspot)) { console.error('hotspot handler not found'); process.exit(1); }
js = js.replace(oldHotspot, newHotspot);

// Drop the pseudo-3D rotation entirely: these are photographs, and spinning a
// flat photo in perspective was both meaningless and visually broken past 90°.
const rotBlockStart = js.indexOf('    var rot = { y: ROT_DEFAULT.y, x: ROT_DEFAULT.x };');
const rotBlockEnd = js.indexOf('    applyRot();\n', rotBlockStart);
if (rotBlockStart === -1 || rotBlockEnd === -1) { console.error('rotation init not found'); process.exit(1); }
js = js.slice(0, rotBlockStart) + js.slice(rotBlockEnd + '    applyRot();\n'.length);

const dragStart = js.indexOf('    var dragging = false, lastX = 0, lastY = 0;');
const dragEnd = js.indexOf('    });\n  }', dragStart);
if (dragStart === -1 || dragEnd === -1) { console.error('drag block not found'); process.exit(1); }
js = js.slice(0, dragStart) + js.slice(dragEnd + '    });\n'.length);

// The rotation helpers are now dead code.
js = js.replace(/  var ROT_DEFAULT[\s\S]*?\n  function nextRotation\(rot, dx, dy\)\{\n    return \{ y: rot\.y \+ dx \* 0\.5, x: clampRotX\(rot\.x - dy \* 0\.3\) \};\n  \}\n/, '');
js = js.replace(/  \/\/ MODULE 1 — Vizualizator 3D: logică \(stare \+ reguli, fără DOM\)\n  \/\/ ={10,}\n\n/, '');
js = js.replace('// MODULE 1 — Vizualizator 3D: randare DOM', '// MODULE 1 — Fotografii de artefact adnotate: randare DOM');

fs.writeFileSync(JS, js);
console.log('lab.js: 3 artefacte reale, hotspot-uri accesibile de la tastatură, rotație 3D falsă eliminată');

// ---------- 2. lab.css ----------
let css = fs.readFileSync(CSS, 'utf8');
css = css.replace('/* ---------- MODULE 1: 3D VIEWER ---------- */', '/* ---------- MODULE 1: FOTOGRAFII DE ARTEFACT ADNOTATE ---------- */');
css = css.replace(
  `  .viewer-stage{
    position: relative; height: 220px; perspective: 900px; cursor: grab;
    background: linear-gradient(180deg, #1c1712 0%, #0d0a07 100%);
    border-radius: 2px; touch-action: none; user-select: none;
  }
  .viewer-stage:active{ cursor: grabbing; }
  .viewer-object{
    position: absolute; inset: 0; transform-style: preserve-3d;
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.06s linear;
  }
  .viewer-face{
    position: absolute; inset: 0; backface-visibility: hidden;
    display: flex; align-items: center; justify-content: center;
  }`,
  `  .viewer-stage{
    position: relative; height: 240px;
    background: linear-gradient(180deg, #1c1712 0%, #0d0a07 100%);
    border-radius: 2px; user-select: none;
  }
  .viewer-object{
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .viewer-face{
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
  }`
);
css = css.replace('  .viewer-face.back{ transform: rotateY(180deg); }\n', '');
css = css.replace(
  '  .artifact-card h3{ font-size: 1.1rem; text-align: center; margin: 12px 0 4px; }',
  `  .artifact-card h3{ font-size: 1.1rem; text-align: center; margin: 4px 0 4px; }
  .artifact-kind{
    font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--imperial);
    text-align: center; margin: 12px 0 0;
  }
  .artifact-credit{
    font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; line-height: 1.5;
    color: var(--ink-dim); text-align: center; margin: 10px 0 0;
    padding-top: 8px; border-top: 1px solid var(--border-nomad);
  }`
);
css = css.replace(
  '  .hotspot{\n    position: absolute; width: 18px; height: 18px; border-radius: 50%;',
  '  .hotspot{\n    position: absolute; width: 18px; height: 18px; border-radius: 50%; padding: 0;'
);
css = css.replace(
  '  @media (prefers-reduced-motion: reduce){ .hotspot{ animation: none; } }',
  `  @media (prefers-reduced-motion: reduce){ .hotspot{ animation: none; } }
  .hotspot:focus-visible{ outline: 3px solid var(--gold); outline-offset: 3px; }`
);
// the reset button is gone along with the rotation
css = css.replace(/  \.viewer-reset\{[\s\S]*?\n  \}\n/, '');
fs.writeFileSync(CSS, css);
console.log('lab.css: stiluri actualizate');

// ---------- 3. lab.body.html ----------
let body = fs.readFileSync(BODY, 'utf8');
body = body.replace(
  '<h2 class="module-title">Vizualizator de Artefacte 3D</h2>',
  '<h2 class="module-title">Artefacte hunice, fotografiate în muzeu</h2>'
);
body = body.replace(
  '<p class="module-sub">Trage cu mouse-ul sau degetul pentru a roti fiecare obiect. Apasă pe punctele roșii pentru explicații arheologice.</p>',
  '<p class="module-sub">Fotografii reale de piese din colecții publice, nu reconstituiri grafice. Apasă pe punctele roșii — sau navighează cu Tab și apasă Enter — pentru explicații. Sub fiecare imagine găsești muzeul, autorul fotografiei și licența.</p>'
);
body = body.replace(
  '<p class="sub">Trei artefacte hunice manipulabile și dezbaterea dintre cronici și genetica modernă.</p>',
  '<p class="sub">Trei artefacte hunice fotografiate în muzee și dezbaterea dintre cronici și genetica modernă.</p>'
);
fs.writeFileSync(BODY, body);
console.log('lab.body.html: titluri actualizate');
