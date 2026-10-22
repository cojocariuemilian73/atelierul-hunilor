// Varianta pentru web: atelierul-hunilor.html rămâne livrabilul de concurs (un singur fișier, cu imaginile
// încorporate în base64), iar index.html, pagina publicată pe GitHub Pages, se face din el cu imaginile scoase
// în media/ (fișiere WebP/JPEG/PNG obișnuite). Prima încărcare e mult mai mică, iar imaginile intră în cache.
// Deschis direct de pe disc (file://), index.html trimite la atelierul-hunilor.html: acolo browserul nu lasă
// canvasul jocului să citească pixelii unei imagini locale.
// Folosire: node scripturi-build/build-web.js (ultimul pas, după toate celelalte scripturi)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.join(__dirname, '..');
const MEDIA = path.join(root, 'media');
const EXT = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/svg+xml': 'svg', 'image/gif': 'gif' };

const src = fs.readFileSync(path.join(root, 'atelierul-hunilor.html'), 'utf8');
if (!fs.existsSync(MEDIA)) fs.mkdirSync(MEDIA);
const used = new Set();
let saved = 0;
let out = src.replace(/data:(image\/[a-z+]+);base64,([A-Za-z0-9+/=]+)/g, (m, type, b64) => {
  const ext = EXT[type]; if (!ext) return m;
  const buf = Buffer.from(b64, 'base64');
  const name = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 12) + '.' + ext;
  const f = path.join(MEDIA, name);
  if (!fs.existsSync(f)) fs.writeFileSync(f, buf);
  used.add(name); saved += m.length;
  return 'media/' + name;
});
// imaginile din conținut se încarcă doar când ajungi la ele
out = out.replace(/<img (?![^>]*\bloading=)/g, '<img loading="lazy" ');
// deschis de pe disc: varianta într-un singur fișier
const nl = out.includes('\r\n') ? '\r\n' : '\n';
out = out.replace(/<head>\r?\n/, m => m + '<script>if (location.protocol === \'file:\') location.replace(\'atelierul-hunilor.html\' + location.hash);</script>' + nl);
fs.writeFileSync(path.join(root, 'index.html'), out);
// fișierele vechi din media/ pe care nu le mai folosește nimeni
fs.readdirSync(MEDIA).forEach(n => { if (!used.has(n)) fs.unlinkSync(path.join(MEDIA, n)); });
console.log('index.html: ' + (out.length / 1e6).toFixed(2) + ' MB (era ' + (src.length / 1e6).toFixed(2) + ' MB), ' + used.size + ' imagini în media/');
