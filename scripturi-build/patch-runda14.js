// Runda 14 (28.11): pagini cât ecranul, titluri scrise literă cu literă, două familii de litere (Source Serif 4 devine Source Sans 3): design/runda14.css și runda14.js. Rulează după patch-runda13.
const fs = require('fs');
const path = require('path');
const page = path.join(__dirname, '..', 'atelierul-hunilor.html');
const raw = fs.readFileSync(page, 'utf8');
const crlf = raw.includes('\r\n');
let html = raw.replace(/\r\n/g, '\n');
const read = (f) => fs.readFileSync(path.join(__dirname, 'design', f), 'utf8').replace(/\r\n/g, '\n').trimEnd();
const start = '<!-- runda14:start -->\n', end = '<!-- runda14:end -->\n';
const prev = html.indexOf(start);
if (prev !== -1) html = html.slice(0, prev) + html.slice(html.indexOf(end, prev) + end.length);
const block = start + '<style id="runda14-css">\n' + read('runda14.css') + '\n</style>\n<script id="runda14-js">\n' + read('runda14.js') + '\n</script>\n' + end;
// o singură familie pentru textul mărunt: Source Serif 4 iese din toate stilurile
html = html.split("'Source Serif 4', Georgia, serif").join("'Source Sans 3', system-ui, sans-serif").split("'Source Serif 4'").join("'Source Sans 3'");
const bodyEnd = html.lastIndexOf('</body>');
if (bodyEnd === -1) throw new Error('Lipsește </body>.');
html = html.slice(0, bodyEnd) + block + html.slice(bodyEnd);
fs.writeFileSync(page, crlf ? html.replace(/\n/g, '\r\n') : html);
