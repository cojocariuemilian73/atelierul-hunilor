// Replaces the 3 flat SVG artifact illustrations in the Lab module's 3D
// viewer with the generated museum-photograph images, and repositions each
// artifact's hotspots onto real visible features of the new photos.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

function dataUri(file){
  return 'data:image/jpeg;base64,' + fs.readFileSync(path.join(ROOT, 'imagini', file)).toString('base64');
}

const BOW_IMG = dataUri('A_Hunnic_composite_recurve_bow_unstrung_view_showing_its_dis.jpg');
const CAULDRON_IMG = dataUri('A_Hunnic_ritual_bronze_cauldron_tall_conical_hollow_base_sup.jpg');
const DIADEM_IMG = dataUri('museum_artifact_photograph_dramatic_single-source_lighting_f.jpg');

const jsPath = path.join(ROOT, 'build', 'lab.js');
let js = fs.readFileSync(jsPath, 'utf8');

// ---- Arcul Recurbat ----
const oldBow = `      svg: '<svg viewBox="0 0 200 200"><path d="M60,20 Q140,60 130,100 Q140,140 60,180" fill="none" stroke="#5a3a1a" stroke-width="6" stroke-linecap="round"/><line x1="60" y1="20" x2="60" y2="180" stroke="#c9b27a" stroke-width="1.6"/><ellipse cx="122" cy="100" rx="10" ry="18" fill="#e8d9a0" stroke="#5a3a1a" stroke-width="2"/><rect x="55" y="15" width="10" height="10" fill="#e8d9a0" stroke="#5a3a1a" stroke-width="1.5"/><rect x="55" y="175" width="10" height="10" fill="#e8d9a0" stroke="#5a3a1a" stroke-width="1.5"/></svg>',
      hotspots: [
        { x: 61, y: 50, title: 'Vârfurile întărite cu os', desc: 'Capetele arcului (siyah) erau întărite cu plăcuțe de os sau corn, rigide, care măreau brusc tensiunea în ultima parte a tragerii — sursa vitezei mari a săgeții.' },
        { x: 63, y: 100, title: 'Mânerul asimetric', desc: 'Brațul inferior era adesea mai scurt decât cel superior, pentru a permite tragerea comodă de pe cal, fără ca arcul să lovească gâtul animalului.' },
        { x: 88, y: 92, title: 'Coarda din tendon', desc: 'Confecționată din tendoane animale răsucite, coarda rezista la tensiuni mari și oferea o eliberare rapidă, esențială pentru tragerea din șa, în plină mișcare.' }
      ]`;
const newBow = `      img: '${BOW_IMG}',
      hotspots: [
        { x: 9, y: 31, title: 'Vârfurile întărite cu os', desc: 'Capetele arcului (siyah) erau întărite cu plăcuțe de os sau corn, rigide, care măreau brusc tensiunea în ultima parte a tragerii — sursa vitezei mari a săgeții.' },
        { x: 49, y: 58, title: 'Mânerul asimetric', desc: 'Brațul inferior era adesea mai scurt decât cel superior, pentru a permite tragerea comodă de pe cal, fără ca arcul să lovească gâtul animalului.' },
        { x: 61, y: 57, title: 'Legăturile din tendon', desc: 'Fâșiile de tendon animal răsucit, vizibile ca înfășurări la îmbinările arcului, întăreau structura compozită și îi ofereau elasticitatea necesară unei eliberări rapide, esențială pentru tragerea din șa, în plină mișcare.' }
      ]`;

// ---- Cazanul Hunic ----
const oldCauldron = `      svg: '<svg viewBox="0 0 200 200"><path d="M70,70 Q100,50 130,70 L138,120 Q100,140 62,120 Z" fill="#6b5030" stroke="#3a2b17" stroke-width="3"/><path d="M85,120 L75,185 M115,120 L125,185" stroke="#3a2b17" stroke-width="5"/><path d="M60,66 Q45,50 55,40 Q60,50 68,58" fill="none" stroke="#3a2b17" stroke-width="4"/><path d="M140,66 Q155,50 145,40 Q140,50 132,58" fill="none" stroke="#3a2b17" stroke-width="4"/></svg>',
      hotspots: [
        { x: 50, y: 46, title: 'Toarta „în formă de ciupercă”', desc: 'Toartele masive, cu profil de ciupercă, sunt un element diagnostic al cazanelor hunice — le deosebesc clar de cazanele scitice sau sarmatice anterioare.' },
        { x: 100, y: 95, title: 'Corpul cilindric', desc: 'Corpul, relativ simplu, contrastează cu baza elaborată — sugerând o funcție mai degrabă simbolică sau rituală decât strict culinară.' },
        { x: 100, y: 150, title: 'Baza conică înaltă', desc: 'Multe cazane hunice au fost găsite fără urme clare de utilizare culinară intensă, adesea depuse izolat lângă râuri — posibil ofrande rituale.' }
      ]`;
const newCauldron = `      img: '${CAULDRON_IMG}',
      hotspots: [
        { x: 16, y: 23, title: 'Toarta „în formă de ciupercă”', desc: 'Toartele masive, cu profil de ciupercă, sunt un element diagnostic al cazanelor hunice — le deosebesc clar de cazanele scitice sau sarmatice anterioare.' },
        { x: 50, y: 27, title: 'Corpul cilindric', desc: 'Corpul, relativ simplu, contrastează cu baza elaborată — sugerând o funcție mai degrabă simbolică sau rituală decât strict culinară.' },
        { x: 50, y: 68, title: 'Baza conică înaltă', desc: 'Multe cazane hunice au fost găsite fără urme clare de utilizare culinară intensă, adesea depuse izolat lângă râuri — posibil ofrande rituale.' }
      ]`;

// ---- Diadema de Aur ----
const oldDiadem = `      svg: '<svg viewBox="0 0 200 200"><path d="M30,110 Q100,40 170,110 L160,130 Q100,70 40,130 Z" fill="#d4af37" stroke="#8a6a1f" stroke-width="2"/><polygon points="70,95 78,80 86,95" fill="#8b2020"/><polygon points="95,80 103,65 111,80" fill="#8b2020"/><polygon points="120,95 128,80 136,95" fill="#8b2020"/></svg>',
      hotspots: [
        { x: 50, y: 65, title: 'Incrustații cu granat (cloisonné)', desc: 'Tehnica „cloisonné” — celule metalice umplute cu plăcuțe de granat șlefuit — e o marcă a stilului policrom răspândit în Bazinul Carpatic în perioada hunică.' },
        { x: 100, y: 40, title: 'Filigranul de aur', desc: 'Firele fine de aur răsucite și lipite formează modele decorative — o tehnică ce cerea meșteri specializați, semn al statutului purtătoarei.' },
        { x: 140, y: 65, title: 'Context funerar', desc: 'Piese similare au fost găsite în morminte feminine bogat înzestrate, indicând un statut social ridicat, posibil legat de elita conducătoare.' }
      ]`;
const newDiadem = `      img: '${DIADEM_IMG}',
      hotspots: [
        { x: 50, y: 40, title: 'Incrustații cu granat (cloisonné)', desc: 'Tehnica „cloisonné” — celule metalice umplute cu plăcuțe de granat șlefuit — e o marcă a stilului policrom răspândit în Bazinul Carpatic în perioada hunică.' },
        { x: 30, y: 48, title: 'Filigranul de aur', desc: 'Firele fine de aur răsucite și lipite formează modele decorative — o tehnică ce cerea meșteri specializați, semn al statutului purtătoarei.' },
        { x: 78, y: 52, title: 'Context funerar', desc: 'Piese similare au fost găsite în morminte feminine bogat înzestrate, indicând un statut social ridicat, posibil legat de elita conducătoare.' }
      ]`;

const replacements = [[oldBow, newBow], [oldCauldron, newCauldron], [oldDiadem, newDiadem]];
replacements.forEach(([oldS, newS], i) => {
  if (!js.includes(oldS)) {
    console.error('BLOCK', i, 'NOT FOUND — aborting, file left unchanged.');
    process.exit(1);
  }
  js = js.split(oldS).join(newS);
});

// The render function still references `art.svg` — switch it to build an <img>.
const oldRender = `      '<div class="viewer-stage" id="stage-' + index + '">' +
        '<div class="viewer-object" id="obj-' + index + '">' +
          '<div class="viewer-face front">' + art.svg + '</div>' +
        '</div>' +
      '</div>' +`;
const newRender = `      '<div class="viewer-stage" id="stage-' + index + '">' +
        '<div class="viewer-object" id="obj-' + index + '">' +
          '<div class="viewer-face front"><img src="' + art.img + '" alt="' + art.name + '"/></div>' +
        '</div>' +
      '</div>' +`;
if (!js.includes(oldRender)) {
  console.error('RENDER BLOCK NOT FOUND — aborting, file left unchanged.');
  process.exit(1);
}
js = js.split(oldRender).join(newRender);

fs.writeFileSync(jsPath, js);
console.log('wrote', jsPath, '(', (js.length / 1024).toFixed(0), 'KB )');

// ---- css: size the <img> like the old inline <svg> ----
const cssPath = path.join(ROOT, 'build', 'lab.css');
let css = fs.readFileSync(cssPath, 'utf8');
const oldCss = `  .viewer-face svg{ width: 100%; height: 100%; }`;
const newCss = `  .viewer-face svg{ width: 100%; height: 100%; }
  .viewer-face img{ width: 100%; height: 100%; object-fit: contain; border-radius: 2px; }`;
if (!css.includes(oldCss)) {
  console.error('CSS BLOCK NOT FOUND — aborting, file left unchanged.');
  process.exit(1);
}
css = css.replace(oldCss, newCss);
fs.writeFileSync(cssPath, css);
console.log('wrote', cssPath);
