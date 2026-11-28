// Runda 17 (28.11): fișa orbitei (imagine întreagă, butoane rotunde), Marea Migrație după RenArt, mecanismul dominoului după Stone Groove: design/runda17.css și runda17.js. Rulează după patch-runda16.
const fs = require('fs');
const path = require('path');
const page = path.join(__dirname, '..', 'atelierul-hunilor.html');
const raw = fs.readFileSync(page, 'utf8');
const crlf = raw.includes('\r\n');
let html = raw.replace(/\r\n/g, '\n');
const read = (f) => fs.readFileSync(path.join(__dirname, 'design', f), 'utf8').replace(/\r\n/g, '\n').trimEnd();
const start = '<!-- runda17:start -->\n', end = '<!-- runda17:end -->\n';
const prev = html.indexOf(start);
if (prev !== -1) html = html.slice(0, prev) + html.slice(html.indexOf(end, prev) + end.length);
const block = start + '<style id="runda17-css">\n' + read('runda17.css') + '\n</style>\n<script id="runda17-js">\n' + read('runda17.js') + '\n</script>\n' + end;
const bodyEnd = html.lastIndexOf('</body>');
if (bodyEnd === -1) throw new Error('Lipsește </body>.');
html = html.slice(0, bodyEnd) + block + html.slice(bodyEnd);
fs.writeFileSync(page, crlf ? html.replace(/\n/g, '\r\n') : html);
