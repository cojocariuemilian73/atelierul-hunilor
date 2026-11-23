// Efectul de domino (capitolul Marea Migrație) + modul prezentare. Rulează după patch-ordine-spatiere, înainte de build-web.
// Surse: design/domino.html|css|js și design/prezentare.css|js. Se poate rula de mai multe ori.
const fs = require('fs');
const path = require('path');

const page = path.join(__dirname, '..', 'atelierul-hunilor.html');
const raw = fs.readFileSync(page, 'utf8');
const crlf = raw.includes('\r\n');
let html = raw.replace(/\r\n/g, '\n');
const read = (f) => fs.readFileSync(path.join(__dirname, 'design', f), 'utf8').replace(/\r\n/g, '\n').trimEnd();

function strip(startMark, endMark) {
  const i = html.indexOf(startMark);
  if (i === -1) return;
  const j = html.indexOf(endMark, i);
  if (j === -1) throw new Error('Lipsește marcajul ' + endMark);
  html = html.slice(0, i) + html.slice(j + endMark.length);
}

// 1. Schema domino: după rândul cu Adrianopol, înaintea citatului lui Ieronim
strip('      <!-- domino:start -->\n', '<!-- domino:end -->\n');
const adr = html.indexOf('După dezastrul de la Adrianopol (378)');
if (adr === -1) throw new Error('Nu găsesc paragraful Adrianopol.');
const rowEnd = '\n        </div>\n      </div>\n';
const iRowEnd = html.indexOf(rowEnd, adr);
if (iRowEnd === -1) throw new Error('Nu găsesc finalul rândului cu Adrianopol.');
const at = iRowEnd + rowEnd.length;
html = html.slice(0, at) + '      <!-- domino:start -->\n' + read('domino.html') + '\n<!-- domino:end -->\n' + html.slice(at);

// 2. Stiluri și scripturi, înainte de </body> (după tot restul paginii)
strip('<!-- domino-prezentare:start -->\n', '<!-- domino-prezentare:end -->\n');
const block = '<!-- domino-prezentare:start -->\n' +
  '<style id="domino-css">\n' + read('domino.css') + '\n</style>\n' +
  '<style id="prezentare-css">\n' + read('prezentare.css') + '\n</style>\n' +
  '<script id="domino-js">\n' + read('domino.js') + '\n</script>\n' +
  '<script id="prezentare-js">\n' + read('prezentare.js') + '\n</script>\n' +
  '<!-- domino-prezentare:end -->\n';
const bodyEnd = html.lastIndexOf('</body>');
if (bodyEnd === -1) throw new Error('Lipsește </body>.');
html = html.slice(0, bodyEnd) + block + html.slice(bodyEnd);

fs.writeFileSync(page, crlf ? html.replace(/\n/g, '\r\n') : html);
