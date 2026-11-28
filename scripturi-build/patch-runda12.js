// Runda 12 (28.11): Personalități după două șabloane (Attila ieșind din panou, Aetius cu titlu în două culori) și titlul mare al Marii Migrații în spatele imaginii: design/runda12.css și runda12.js. Rulează după patch-runda11.
const fs = require('fs');
const path = require('path');
const page = path.join(__dirname, '..', 'atelierul-hunilor.html');
const raw = fs.readFileSync(page, 'utf8');
const crlf = raw.includes('\r\n');
let html = raw.replace(/\r\n/g, '\n');
const read = (f) => fs.readFileSync(path.join(__dirname, 'design', f), 'utf8').replace(/\r\n/g, '\n').trimEnd();
const start = '<!-- runda12:start -->\n', end = '<!-- runda12:end -->\n';
const prev = html.indexOf(start);
if (prev !== -1) html = html.slice(0, prev) + html.slice(html.indexOf(end, prev) + end.length);
const block = start + '<style id="runda12-css">\n' + read('runda12.css') + '\n</style>\n<script id="runda12-js">\n' + read('runda12.js').replace('__ATTILA_OVAL__', 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, 'design', 'attila-oval.webp')).toString('base64')) + '\n</script>\n' + end;
const bodyEnd = html.lastIndexOf('</body>');
if (bodyEnd === -1) throw new Error('Lipsește </body>.');
html = html.slice(0, bodyEnd) + block + html.slice(bodyEnd);
fs.writeFileSync(page, crlf ? html.replace(/\n/g, '\r\n') : html);
