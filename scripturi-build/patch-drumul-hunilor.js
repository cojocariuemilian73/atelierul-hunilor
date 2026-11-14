// Adaugă traseul ilustrativ în articol după aplicarea stilurilor, înainte de build-web.
const fs = require('fs');
const path = require('path');

const page = path.join(__dirname, '..', 'atelierul-hunilor.html');
const raw = fs.readFileSync(page, 'utf8');
const crlf = raw.includes('\r\n');
let html = raw.replace(/\r\n/g, '\n');
const start = '<!-- drum-huni:start -->\n';
const end = '<!-- drum-huni:end -->\n';
const previousStart = html.indexOf(start);
if (previousStart !== -1) {
  const previousEnd = html.indexOf(end, previousStart);
  if (previousEnd === -1) throw new Error('Lipsește marcajul de final pentru drumul hunilor.');
  html = html.slice(0, previousStart) + html.slice(previousEnd + end.length);
}
const fragment = fs.readFileSync(path.join(__dirname, 'design', 'drumul-hunilor.html'), 'utf8').replace(/\r\n/g, '\n').trimEnd();
const bodyEnd = html.lastIndexOf('</body>');
if (bodyEnd === -1) throw new Error('Lipsește finalul paginii.');
html = html.slice(0, bodyEnd) + start + fragment + '\n' + end + html.slice(bodyEnd);

fs.writeFileSync(page, crlf ? html.replace(/\n/g, '\r\n') : html);
