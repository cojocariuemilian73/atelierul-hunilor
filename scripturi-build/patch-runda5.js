// Runda 5 (27.11): „Praf de stepă” (design/praf.*), finalul jocului Attila cu profil și cronică (design/joc-cronica.*),
// scrollytelling-ul „Drumul hunilor” (design/scrolly.*), inserat imediat după copertă, înaintea capitolului Origini.
// Rulează după patch-runda4, înainte de build-web. Se poate rula de mai multe ori.
const fs = require('fs');
const path = require('path');
const page = path.join(__dirname, '..', 'atelierul-hunilor.html');
const raw = fs.readFileSync(page, 'utf8');
const crlf = raw.includes('\r\n');
let html = raw.replace(/\r\n/g, '\n');
const read = (f) => fs.readFileSync(path.join(__dirname, 'design', f), 'utf8').replace(/\r\n/g, '\n').trimEnd();
const start = '<!-- runda5:start -->\n', end = '<!-- runda5:end -->\n';
const prev = html.indexOf(start);
if (prev !== -1) html = html.slice(0, prev) + html.slice(html.indexOf(end, prev) + end.length);
// secțiunea goală; scrolly.js o construiește
html = html.replace(/<section id="sec-drum"[^>]*><\/section>\n?/g, '');
// imediat după copertă: primul scroll în jos intră direct în prima etapă a drumului, apoi urmează capitolele
const anchor = '<section id="sec-origini">';
if (!html.includes(anchor)) throw new Error('Lipsește capitolul Origini.');
html = html.replace(anchor, '<section id="sec-drum" class="sc" aria-label="Drumul hunilor, 370–476"></section>\n' + anchor);
const css = ['praf.css', 'joc-cronica.css', 'scrolly.css'].map(read).join('\n');
const js = ['praf.js', 'joc-cronica.js', 'scrolly.js'].map(read).join('\n');
const block = start + '<style id="runda5-css">\n' + css + '\n</style>\n<script id="runda5-js">\n' + js + '\n</script>\n' + end;
const bodyEnd = html.lastIndexOf('</body>');
if (bodyEnd === -1) throw new Error('Lipsește </body>.');
html = html.slice(0, bodyEnd) + block + html.slice(bodyEnd);
fs.writeFileSync(page, crlf ? html.replace(/\n/g, '\r\n') : html);
