// Adds more real objects to the Muzeu (photos from Wikimedia Commons, free
// licences), each with numbered hotspots like the first four.
// Usage: node rebuild-museum-more.js <key> [<key> ...]   (keys below)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const IMG = path.join(ROOT, 'imagini', 'reale');
const JS = path.join(ROOT, 'build', 'lab.js');
const BODY = path.join(ROOT, 'build', 'lab.body.html');
const PY = 'C:/Users/cojoc/AppData/Local/Programs/Python/Python312/python';

function web(src, out, w, crop){
  execFileSync(PY, ['-c', `
from PIL import Image
im = Image.open(r'${path.join(IMG, src)}').convert('RGB')
${crop ? `im = im.crop((${crop.join(',')}))` : ''}
if im.width > ${w}: im = im.resize((${w}, round(im.height * ${w} / im.width)), Image.LANCZOS)
im.save(r'${path.join(IMG, out)}', quality=80, optimize=True, progressive=True)
print(im.size)
`]);
  const b = fs.readFileSync(path.join(IMG, out));
  const dim = execFileSync(PY, ['-c', `from PIL import Image; im=Image.open(r'${path.join(IMG, out)}'); print(im.width, im.height)`]).toString().trim().split(' ');
  return { uri: 'data:image/jpeg;base64,' + b.toString('base64'), ratio: dim[0] + ' / ' + dim[1] };
}

const PIECES = {
  craniu: () => { const w = web('craniu-mozs.jpg', 'muzeu-craniu.jpg', 800); return {
    name: 'Craniu deformat artificial',
    kind: 'Piesă originală · sec. V',
    desc: 'Craniu din cimitirul de la Mözs (Ungaria), din a doua treime a secolului al V-lea, perioada stăpânirii hunice. Muzeul Național Maghiar, Budapesta.',
    credit: 'Muzeul Național Maghiar · foto Ceoil, CC0, Wikimedia Commons',
    alt: 'Craniu uman cu bolta mult alungită în sus, expus pe un suport transparent de muzeu.',
    ratio: w.ratio, img: w.uri,
    hotspots: [
      { x: 52, y: 13, title: 'Bolta alungită', desc: 'Forma nu e naturală: în primii ani de viață, capul copilului era strâns cu bandaje, iar craniul, încă moale, creștea în sus și în spate. Practica e atestată la popoarele din sfera hunică, dar și la germanici și alani.' },
      { x: 50, y: 31, title: 'Fruntea înaltă și îngustă', desc: 'Presiunea bandajelor pe frunte și pe ceafă împingea creșterea spre creștet. Rezultatul era vizibil toată viața — un semn de apartenență la elită, care nu putea fi ascuns sau imitat la maturitate.' },
      { x: 36, y: 52, title: 'Fața, neschimbată', desc: 'Deformarea modifica doar bolta craniului; orbitele și oasele feței rămân normale. Cercetările moderne nu au găsit dovezi că practica afecta inteligența celor care o purtau.' },
    ] }; },
  solidus: () => { const w = web('solidus-teodosie2.jpg', 'muzeu-solidus.jpg', 700); return {
    name: 'Solidul lui Teodosie al II-lea',
    kind: 'Monedă de aur originală · 408–450',
    desc: 'Solid de aur bătut pentru împăratul Teodosie al II-lea, contemporanul lui Attila. În astfel de monede s-a plătit tributul către huni: 2.100 de livre pe an însemnau peste 150.000 de solizi.',
    credit: 'Colecție publică (inv. MNS/A/22212) · foto CC0, Wikimedia Commons',
    alt: 'Monedă de aur uzată, cu bustul frontal al unui împărat cu coif și o inscripție circulară.',
    ratio: w.ratio, img: w.uri,
    hotspots: [
      { x: 50, y: 40, title: 'Bustul împăratului', desc: 'Teodosie al II-lea e înfățișat din față, cu coif și diademă de perle, ținând o lance pe umăr — imaginea unui împărat-războinic, deși el nu a condus niciodată personal o campanie.' },
      { x: 27, y: 38, title: 'Inscripția', desc: 'De jur împrejur se citește D N THEODOSIVS P F AVG — „Stăpânul nostru Teodosie, pios și fericit, Augustus”. Formula e aceeași pe toate monedele imperiale ale epocii.' },
      { x: 50, y: 73, title: 'Scutul', desc: 'Împăratul ține un scut decorat cu un călăreț care își străpunge dușmanul — un mesaj de victorie, plătit, ironic, chiar dușmanilor pe care Imperiul nu-i putea învinge.' },
      { x: 89, y: 55, title: 'Greutatea fixă', desc: 'Solidul cântărea 1/72 dintr-o livră romană, adică aproximativ 4,5 g de aur aproape pur. Valoarea lui stabilă l-a făcut moneda de referință a lumii mediteraneene timp de secole.' },
    ] }; },
};

const keys = process.argv.slice(2);
if (!keys.length) { console.error('usage: node rebuild-museum-more.js <key> ...'); process.exit(1); }
let js = fs.readFileSync(JS, 'utf8');
const end = js.indexOf('\n  ];', js.indexOf('ARTIFACTS = ['));
if (end === -1) { console.error('ARTIFACTS end not found'); process.exit(1); }
let add = '';
for (const k of keys) {
  if (!PIECES[k]) { console.error('unknown piece ' + k); process.exit(1); }
  const p = PIECES[k]();
  if (js.includes('"name": ' + JSON.stringify(p.name))) { console.log('deja există: ' + p.name); continue; }
  add += ',\n    ' + JSON.stringify(p, null, 2).replace(/\n/g, '\n    ');
  console.log('adăugat: ' + p.name);
}
js = js.slice(0, end) + add + js.slice(end);
fs.writeFileSync(JS, js);

// subtitle: count the pieces
const count = (js.match(/"hotspots":/g) || []).length;
const words = ['', 'Un artefact', 'Două artefacte', 'Trei artefacte', 'Patru artefacte', 'Cinci artefacte', 'Șase artefacte', 'Șapte artefacte', 'Opt artefacte', 'Nouă artefacte', 'Zece artefacte'];
let body = fs.readFileSync(BODY, 'utf8');
body = body.replace(/<p class="sub">[^<]*? (artefacte|artefact) hunice/, '<p class="sub">' + words[count] + ' din epoca hunilor');
body = body.replace(/<p class="sub">(Un|Două|Trei|Patru|Cinci|Șase|Șapte|Opt|Nouă|Zece) (artefacte|artefact) din epoca hunilor/, '<p class="sub">' + words[count] + ' din epoca hunilor');
fs.writeFileSync(BODY, body);
console.log('Muzeu: ' + count + ' piese');
