// Cărțile cu mituri (design/fise-carti.*) și fișele de izvor (design/fise-izvoare.*). Rulează după patch-retusuri, înainte de build-web.
// Ambele transformă la încărcare conținutul existent; textele rămân cele din pagină. Se poate rula de mai multe ori.
const fs = require('fs');
const path = require('path');

const page = path.join(__dirname, '..', 'atelierul-hunilor.html');
const raw = fs.readFileSync(page, 'utf8');
const crlf = raw.includes('\r\n');
let html = raw.replace(/\r\n/g, '\n');
const read = (f) => fs.readFileSync(path.join(__dirname, 'design', f), 'utf8').replace(/\r\n/g, '\n').trimEnd();

const start = '<!-- fise:start -->\n', end = '<!-- fise:end -->\n';
const prev = html.indexOf(start);
if (prev !== -1) html = html.slice(0, prev) + html.slice(html.indexOf(end, prev) + end.length);
const block = start +
  '<style id="fise-carti-css">\n' + read('fise-carti.css') + '\n</style>\n' +
  '<style id="fise-izvoare-css">\n' + read('fise-izvoare.css') + '\n</style>\n' +
  '<script id="fise-carti-js">\n' + read('fise-carti.js') + '\n</script>\n' +
  '<script id="fise-izvoare-js">\n' + read('fise-izvoare.js') + '\n</script>\n' + end;
const bodyEnd = html.lastIndexOf('</body>');
if (bodyEnd === -1) throw new Error('Lipsește </body>.');
html = html.slice(0, bodyEnd) + block + html.slice(bodyEnd);

fs.writeFileSync(page, crlf ? html.replace(/\n/g, '\r\n') : html);
