// Runda 10 (28.11): fără linii despărțitoare și fără „Următorul”, bara în 3 zone („Imperiul Hunilor” în centru), atlas lat, tranziții între capitole, curiozități pe orbită: design/runda10.css și runda10.js. Rulează după patch-runda9.
const fs = require('fs');
const path = require('path');
const page = path.join(__dirname, '..', 'atelierul-hunilor.html');
const raw = fs.readFileSync(page, 'utf8');
const crlf = raw.includes('\r\n');
let html = raw.replace(/\r\n/g, '\n');
const read = (f) => fs.readFileSync(path.join(__dirname, 'design', f), 'utf8').replace(/\r\n/g, '\n').trimEnd();
const start = '<!-- runda10:start -->\n', end = '<!-- runda10:end -->\n';
const prev = html.indexOf(start);
if (prev !== -1) html = html.slice(0, prev) + html.slice(html.indexOf(end, prev) + end.length);
const block = start + '<style id="runda10-css">\n' + read('runda10.css') + '\n</style>\n<script id="runda10-js">\n' + read('runda10.js') + '\n</script>\n' + end;
const bodyEnd = html.lastIndexOf('</body>');
if (bodyEnd === -1) throw new Error('Lipsește </body>.');
html = html.slice(0, bodyEnd) + block + html.slice(bodyEnd);
fs.writeFileSync(page, crlf ? html.replace(/\n/g, '\r\n') : html);
