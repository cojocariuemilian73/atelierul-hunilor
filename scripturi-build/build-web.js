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
// stilurile și scripturile mari ies în assets/ (rămân în cache între vizite), în aceeași ordine și în același loc;
// rămân în pagină: cele din <svg> sau <template>, cele mici (scriptul de pornire din <head>) și datele JSON
const ASSETS = path.join(root, 'assets');
['', 'js'].forEach(d => { const p = path.join(ASSETS, d); if (!fs.existsSync(p)) fs.mkdirSync(p); });
const usedAssets = new Set();
let ranges = [];
function mapRanges() {
  ranges = [];
  for (const tag of ['svg', 'template']) {
    const re = new RegExp('<' + tag + '\\b[\\s\\S]*?</' + tag + '>', 'g'); let m;
    while ((m = re.exec(out))) ranges.push([m.index, m.index + m[0].length]);
  }
}
const inside = (i) => ranges.some(r => i > r[0] && i < r[1]);
function asset(kind, body) {
  const name = crypto.createHash('sha1').update(body).digest('hex').slice(0, 12) + '.' + kind;
  const f = path.join(ASSETS, kind, name);
  if (!fs.existsSync(f)) fs.writeFileSync(f, body);
  usedAssets.add(kind + '/' + name);
  return 'assets/' + kind + '/' + name;
}
let moved = 0;
mapRanges();
// toate stilurile mari devin o singură foaie, stil-<hash>.css, lângă index.html: adresele relative din CSS și din
// SVG-urile pe care le stilizează (media/…) rămân valabile; ordinea cascadei e aceeași (foile se lipesc în ordine)
const sheets = [];
out = out.replace(/<style([^>]*)>([\s\S]*?)<\/style>/g, (m, attrs, css, at) => {
  if (inside(at) || css.length < 2500) return m;
  const media = (attrs.match(/media=["']([^"']+)["']/) || [])[1];
  sheets.push(media ? '@media ' + media + '{\n' + css + '\n}' : css);
  moved++;
  return sheets.length === 1 ? '<!--AH-CSS-->' : '';
});
if (sheets.length) {
  // @import trebuie să stea la începutul foii
  const imports = [];
  const body = sheets.join('\n').replace(/@import\s+(?:url\([^)]*\)|"[^"]*"|'[^']*')[^;{}]*;/g, (m) => { imports.push(m); return ''; });
  const css = imports.join('\n') + '\n' + body;
  const name = 'stil-' + crypto.createHash('sha1').update(css).digest('hex').slice(0, 12) + '.css';
  if (!fs.existsSync(path.join(root, name))) fs.writeFileSync(path.join(root, name), css);
  fs.readdirSync(root).forEach(n => { if (/^stil-[0-9a-f]{12}\.css$/.test(n) && n !== name) fs.unlinkSync(path.join(root, n)); });
  out = out.replace('<!--AH-CSS-->', '<link rel="stylesheet" href="' + name + '">');
}
mapRanges();
out = out.replace(/<script([^>]*)>([\s\S]*?)<\/script>/g, (m, attrs, js, at) => {
  if (/\bsrc=/.test(attrs) || inside(at) || js.length < 2500) return m;
  const type = (attrs.match(/\btype=["']?([^"'\s>]+)/) || [])[1];
  if (type && !/^(text\/javascript|module|application\/javascript)$/i.test(type)) return m;
  moved++;
  return '<script' + attrs + ' src="' + asset('js', js) + '"></script>';
});
fs.readdirSync(path.join(ASSETS, 'js')).forEach(n => { if (!usedAssets.has('js/' + n)) fs.unlinkSync(path.join(ASSETS, 'js', n)); });
console.log(moved + ' blocuri CSS/JS mutate în assets/');
// deschis de pe disc: varianta într-un singur fișier
const nl = out.includes('\r\n') ? '\r\n' : '\n';
out = out.replace(/<head>\r?\n/, m => m + '<script>if (location.protocol === \'file:\') location.replace(\'atelierul-hunilor.html\' + location.hash);</script>' + nl);
fs.writeFileSync(path.join(root, 'index.html'), out);
// fișierele vechi din media/ pe care nu le mai folosește nimeni
fs.readdirSync(MEDIA).forEach(n => { if (!used.has(n)) fs.unlinkSync(path.join(MEDIA, n)); });
console.log('index.html: ' + (out.length / 1e6).toFixed(2) + ' MB (era ' + (src.length / 1e6).toFixed(2) + ' MB), ' + used.size + ' imagini în media/');
