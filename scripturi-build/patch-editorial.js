// Stratul editorial (design/editorial.css|js). Rulează ultimul, după patch-ux-hunilor, înainte de build-web.
// 1. Adaugă Source Sans 3 la Google Fonts și îl folosește pentru textul de corp (titlurile rămân EB Garamond).
// 2. Trece roșul vișiniu al interfeței în teracotă / rugină de fier.
// 3. Inserează stilurile și scriptul stratului, înainte de </body>. Se poate rula de mai multe ori.
const fs = require('fs');
const path = require('path');

const page = path.join(__dirname, '..', 'atelierul-hunilor.html');
const raw = fs.readFileSync(page, 'utf8');
const crlf = raw.includes('\r\n');
let html = raw.replace(/\r\n/g, '\n');
const read = (f) => fs.readFileSync(path.join(__dirname, 'design', f), 'utf8').replace(/\r\n/g, '\n').trimEnd();

// 1. fonturi
const FONT_URL = "family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap";
const FONT_NEW = "family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap";
if (!html.includes('Source+Sans+3')) {
  if (!html.includes(FONT_URL)) throw new Error('Nu găsesc importul Google Fonts.');
  html = html.split(FONT_URL).join(FONT_NEW);
}
// 'Source Serif 4', Georgia, serif (și variantele) → Source Sans 3 cu rezerve sans; ghilimelele rămân de același fel,
// ca șirurile din JavaScript să nu se rupă
html = html.replace(/(['"])Source Serif 4\1(\s*,\s*(?:Georgia|ui-monospace|serif)(?:\s*,\s*(?:'Times New Roman'|"Times New Roman"|serif|monospace))*)?/g,
  (m, q) => `${q}Source Sans 3${q}, ${q}Segoe UI${q}, system-ui, sans-serif`);

// 2. culori: vișiniu → teracotă / rugină
const REDS = { '#7a1c1c': '#8a3520', '#8a2a1f': '#9a3f24', '#5f1414': '#6e2817', '#6f281c': '#7d321c', '#74271f': '#7d321c' };
for (const [from, to] of Object.entries(REDS)) html = html.replace(new RegExp(from, 'gi'), to);

// 3. stratul
const start = '<!-- editorial:start -->\n', end = '<!-- editorial:end -->\n';
const prev = html.indexOf(start);
if (prev !== -1) html = html.slice(0, prev) + html.slice(html.indexOf(end, prev) + end.length);
const block = start +
  '<style id="editorial-css">\n' + read('editorial.css') + '\n</style>\n' +
  '<script id="editorial-js">\n' + read('editorial.js') + '\n</script>\n' + end;
const bodyEnd = html.lastIndexOf('</body>');
if (bodyEnd === -1) throw new Error('Lipsește </body>.');
html = html.slice(0, bodyEnd) + block + html.slice(bodyEnd);

fs.writeFileSync(page, crlf ? html.replace(/\n/g, '\r\n') : html);
