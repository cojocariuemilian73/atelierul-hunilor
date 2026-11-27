// Runda de design și UX din 27.11 (design/ux-hunilor.css|js). Rulează după patch-fise, înainte de build-web.
// Mai face două schimbări punctuale în pagină: expune datele punctelor din Atlas (pentru cartonașul la hover)
// și înlocuiește textul de prezentare al jocului. Se poate rula de mai multe ori.
const fs = require('fs');
const path = require('path');

const page = path.join(__dirname, '..', 'atelierul-hunilor.html');
const raw = fs.readFileSync(page, 'utf8');
const crlf = raw.includes('\r\n');
let html = raw.replace(/\r\n/g, '\n');
const read = (f) => fs.readFileSync(path.join(__dirname, 'design', f), 'utf8').replace(/\r\n/g, '\n').trimEnd();

function swap(from, to, what) {
  if (html.includes(to)) return;
  const n = html.split(from).length - 1;
  if (n !== 1) throw new Error('Nu găsesc o singură dată ' + what + ' (' + n + ').');
  html = html.replace(from, to);
}

// 1. datele punctelor din Atlas, vizibile pentru ux-hunilor.js
swap('  var DATA = [\n', '  var DATA = window.AH_ATLAS_DATA = [\n', 'lista DATA din Atlas');

// 2. textul de prezentare al jocului
swap(
  '<p>Un singur joc, în trei acte, pe harta reală a Europei: ești Valens, Stilicho și Honorius când vin hunii, apoi Attila în opt momente reale (aur, renume, loialitate, cai), apoi Ardaric și Leon I, după moartea lui. Popoarele se mișcă după deciziile tale.</p>',
  '<p>Joci trei roluri pe harta reală a Europei. Mai întâi aperi Imperiul în fața hunilor, ca Valens, Stilicho și Honorius. Apoi conduci hunii ca Attila, prin opt momente reale în care alegi între aur, renume, loialitate și cai. La final, după moartea lui, preiei rolul lui Ardaric și al lui Leon I. Fiecare decizie schimbă drumul popoarelor.</p>',
  'textul jocului'
);

// 3. stilurile și scriptul, înainte de </body>
const start = '<!-- ux-hunilor:start -->\n', end = '<!-- ux-hunilor:end -->\n';
const prev = html.indexOf(start);
if (prev !== -1) html = html.slice(0, prev) + html.slice(html.indexOf(end, prev) + end.length);
const block = start +
  '<style id="ux-hunilor-css">\n' + read('ux-hunilor.css') + '\n</style>\n' +
  '<script id="ux-hunilor-js">\n' + read('ux-hunilor.js') + '\n</script>\n' + end;
const bodyEnd = html.lastIndexOf('</body>');
if (bodyEnd === -1) throw new Error('Lipsește </body>.');
html = html.slice(0, bodyEnd) + block + html.slice(bodyEnd);

fs.writeFileSync(page, crlf ? html.replace(/\n/g, '\r\n') : html);
