// Recenzia 10 (din scripturi-build/recenzie10/: recenzie10.css, recenzie10.js):
//  A) totul pe crem: meniul, ferestrele (Atlas, muzeu, imagini, note, glosar, „Despre proiect”), subsolul și cele două
//     jocuri. Regulile lor de stil au culori închise scrise direct; scriptul le copiază la sfârșit cu culorile „întoarse”
//     (fundal închis → pergament, text deschis → maro, aur/roșu deschis → bronz/granat). Originalele rămân neatinse,
//     așa că scriptul se poate rula de oricâte ori (copia se reface de fiecare dată din original);
//  B) deschiderea: pictura rămâne, cu o umbră crem dinspre stânga și textul maro;
//  C) miturile: „mit tăiat, adevăr dedesubt”; banda de la Gherăseni (în recenzie10.css și recenzie10.js).
// Folosire: node scripturi-build/patch-recenzie-10.js (după patch-recenzie-9.js, înainte de patch-efecte.js).
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const D = path.join(__dirname, 'recenzie10');
const rd = f => fs.readFileSync(path.join(D, f), 'utf8').split('\r\n').join('\n');
const CSS = rd('recenzie10.css').replace(/\n+$/, '\n');
const JS = fs.existsSync(path.join(D, 'recenzie10.js')) ? '<script>\n/* r10: recenzia 10 */\n' + rd('recenzie10.js').trim() + '\n</script>\n' : '';

const rel = 'atelierul-hunilor.html';
const f = path.join(root, rel);
const raw = fs.readFileSync(f, 'utf8'), crlf = raw.includes('\r\n');
let s = raw.split('\r\n').join('\n');
const fail = m => { console.error(rel + ': ' + m); process.exit(1); };

// ---------- curățenie: blocurile vechi ale acestui script ----------
function cut(a, b){ const k0 = s.indexOf(a); if (k0 < 0) return; const k1 = s.indexOf(b, k0); if (k1 < 0) fail('sfârșit ' + a); s = s.slice(0, k0) + s.slice(k1 + b.length); }
cut('  /* r10-relight: ', '  /* /r10-relight */\n');
cut('  /* r10: recenzia 10', '  /* /r10 */\n');
{ const j0 = s.indexOf('<script>\n/* r10: recenzia 10 */'); if (j0 >= 0) s = s.slice(0, j0) + s.slice(s.indexOf('</script>\n', j0) + '</script>\n'.length); }

// ---------- A) tema: luminoasă peste tot (variabilele --paper, --ink etc. devin cele de pergament) ----------
s = s.replace('<html lang="ro" data-theme="dark">', '<html lang="ro" data-theme="light">');
if (!s.includes('<html lang="ro" data-theme="light">')) fail('tema paginii');

// ---------- A) culorile întoarse ----------
// zonele vizate: jocurile, ferestrele, meniul și subsolul (nu articolul, nu hărțile, nu pictura din deschidere)
const TARGET = /#mod-migratie|#mod-atelier|\.m-atelier|\.mig-|#mig-|\.md-|#md-|\.jg-|\.jg(?![\w-])|#jg-|\.imp-|about-|\.modal-card|#modal-overlay|#mt-|hs-popover|img-lightbox|\.lb-|fn-tip|gl-tip|site-pager|to-top|pg-curtain|#site-nav|\.site-nav|\.st-|chap-bar|site-final-footer/;
// #mig-root: regulile ghidului din jocuri.css sunt scrise deja pentru tema crem
const SKIP = /\.hero|hx-map|svg|\.mig-map|#mig-map|#mig-root|#md-guide/;
const hex2 = v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
function rgb2hsl(r, g, b){ r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, sa = 0; const l = (mx + mn) / 2;
  if (mx !== mn) { const d = mx - mn; sa = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; }
  return [h, sa, l]; }
function hsl2rgb(h, sa, l){ if (!sa) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + sa) : l + sa - l * sa, p = 2 * l - q;
  const t = x => { x = (x + 1) % 1; return 255 * (x < 1 / 6 ? p + (q - p) * 6 * x : x < 0.5 ? q : x < 2 / 3 ? p + (q - p) * (2 / 3 - x) * 6 : p); };
  return [t(h + 1 / 3), t(h), t(h - 1 / 3)]; }
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
const PAPER = [243, 234, 215], PAPER3 = [216, 199, 163], INK = [43, 29, 18], INK2 = [107, 85, 64];
// fiecare fel de proprietate se întoarce altfel: doar ce era gândit pentru fundal închis se schimbă
//  bg: fundalurile închise devin pergament (cele deschise, ca hârtiile și ramele foto, rămân);
//  text: textele deschise devin maro, aurul și roșul deschis devin bronz și granat (textul închis rămâne);
//  border: liniile deschise și neutre devin maro (liniile aurii rămân); shadow: umbrele textului devin halou crem;
//  variabilele (--x) se judecă după nume: cerneală/text ca text, linii ca linii, restul ca fundal
function relight(r, g, b, kind){
  const [h, sa, l] = rgb2hsl(r, g, b);
  const dark = () => mix(PAPER, PAPER3, l / 0.3);
  const ink = () => sa < 0.5 ? mix(INK2, INK, (l - 0.3) / 0.7) : hsl2rgb(h, Math.min(sa, 0.75), Math.max(0.16, Math.min(0.27, 1 - l)));
  if (kind === 'bg') return l <= 0.3 ? dark() : null;
  if (kind === 'text') return l >= 0.45 ? ink() : null;
  if (kind === 'border') return l >= 0.6 && sa < 0.5 ? mix(INK2, INK, 0.5) : null;
  if (kind === 'shadow') return l <= 0.3 ? PAPER : null;
  if (kind === 'box') return l <= 0.3 ? [60, 40, 20] : null;
  return null;
}
function out(c, a){ return a < 1 ? 'rgba(' + c.map(Math.round).join(', ') + ', ' + +a.toFixed(3) + ')' : '#' + c.map(hex2).join(''); }
function kindOf(prop){
  if (/^--/.test(prop)) return /ink|text|fg|dim|muted|gold|accent|red|hl|hot/.test(prop) ? 'text' : /line|border|rule/.test(prop) ? 'border' : 'bg';
  if (/^background/.test(prop)) return 'bg';
  if (/^border|^outline/.test(prop)) return 'border';
  if (prop === 'text-shadow') return 'shadow';
  if (prop === 'box-shadow') return 'box';
  return 'text';
}
function relightValue(d){
  const k = d.indexOf(':'), prop = d.slice(0, k).trim().toLowerCase(), kind = kindOf(prop);
  if (!kind) return null;
  let changed = false;
  // umbrele de sub casete rămân umbre, dar maro și mult mai slabe, ca pe hârtie
  const one = (m, r, g, b, a) => { const c = relight(r, g, b, kind); if (!c) return m; changed = true; return out(c, kind === 'box' ? Math.min(a * 0.35, 0.18) : a); };
  const v = d.slice(k + 1)
    .replace(/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g, (m, x) => {
      if (x.length <= 4) x = x.split('').map(c => c + c).join('');
      return one(m, parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16), x.length === 8 ? parseInt(x.slice(6), 16) / 255 : 1); })
    .replace(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,\/]\s*([\d.]+%?))?\s*\)/g, (m, r, g, b, a) =>
      one(m, +r, +g, +b, a === undefined ? 1 : a.endsWith('%') ? parseFloat(a) / 100 : +a))
    .replace(/\b(white|black)\b/g, (m, w) => { const x = w === 'white' ? 255 : 0; return one(m, x, x, x, 1); });
  return changed ? prop + ':' + v : null;
}
// împarte declarațiile la „;” din afara parantezelor (url-urile cu date conțin „;”)
function decls(body){ const res = []; let d = 0, cur = '';
  for (const ch of body) { if (ch === '(') d++; else if (ch === ')') d--; if (ch === ';' && d === 0) { res.push(cur); cur = ''; } else cur += ch; }
  if (cur.trim()) res.push(cur); return res; }
// parcurge un CSS și cheamă cb(selector, corp, @media-uri)
function walk(css, cb){
  let i = 0, buf = ''; const stack = [], n = css.length;
  while (i < n) {
    const c = css[i];
    if (c === '/' && css[i + 1] === '*') { const e = css.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; continue; }
    if (c === '{') {
      const head = buf.trim(); buf = '';
      if (head.startsWith('@')) { stack.push(head); i++; continue; }
      let dep = 1, j = i + 1; while (j < n && dep) { if (css[j] === '{') dep++; else if (css[j] === '}') dep--; j++; }
      cb(head, css.slice(i + 1, j - 1), stack.slice()); i = j; continue;
    }
    if (c === '}') { stack.pop(); buf = ''; i++; continue; }
    if (c === ';' && buf.trim().startsWith('@')) { buf = ''; i++; continue; }
    buf += c; i++;
  }
}
{
  const groups = new Map();
  const re = /<style[^>]*>([\s\S]*?)<\/style>/g; let m;
  while ((m = re.exec(s))) {
    walk(m[1], (sel, body, media) => {
      if (media.some(x => /keyframes/.test(x))) return;
      // din lista de selectori rămân doar cei din zonele vizate (și nu hărțile sau deschiderea)
      sel = sel.split(',').map(x => x.trim()).filter(x => TARGET.test(x) && !SKIP.test(x)).join(', ');
      if (!sel) return;
      const dd = decls(body).filter(d => !/url\(/.test(d) && /#[0-9a-fA-F]{3,8}\b|rgba?\(|\b(white|black)\b/.test(d) &&
        /^\s*(color|background|background-color|background-image|border|border-[a-z-]*color|border(-top|-right|-bottom|-left)?|outline|outline-color|box-shadow|text-shadow|fill|stroke|caret-color|text-decoration-color|accent-color|--[a-z0-9-]+)\s*:/i.test(d));
      const nd = dd.map(d => relightValue(d.trim())).filter(Boolean);
      if (!nd.length) return;
      const key = media.join(' ');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push('  ' + sel.replace(/\s+/g, ' ') + '{ ' + nd.join('; ') + '; }');
    });
  }
  let block = '  /* r10-relight: culorile jocurilor, ferestrelor, meniului și subsolului, întoarse pe pergament (generat) */\n';
  for (const [k, rules] of groups) block += k ? '  ' + k + '{\n' + rules.join('\n') + '\n  }\n' : rules.join('\n') + '\n';
  block += '  /* /r10-relight */\n';
  const st = s.lastIndexOf('</style>'); if (st < 0) fail('</style>');
  s = s.slice(0, st) + block + s.slice(st);
}

// ---------- C) Gherăseni: diadema lângă paragraful ei; precizarea devine o bandă pe toată lățimea ----------
if (!s.includes('class="r10-band"')) {
  // fotografia diademei, din fișa muzeului
  const ai = s.indexOf('"name": "Diadema de la Gherăseni"');
  const im = ai < 0 ? null : s.slice(ai, ai + 400000).match(/"alt": "([^"]*)"[\s\S]*?"img": "(data:image\/[^"]+)"/);
  if (!im) fail('fotografia diademei');
  const craniu = s.match(/<figure class="sr-fig"><img id="img-craniu"[\s\S]*?<\/figure>/);
  if (!craniu) fail('fotografia craniului');
  s = s.replace(craniu[0], () => '<figure class="sr-fig"><img id="img-diadema" src="' + im[2] + '" alt="' + im[1] + '" loading="lazy"><figcaption><b>Diadema de la Gherăseni</b> (jud. Buzău), prima jumătate a sec. V, Muzeul Județean Buzău. Foto: Laci3, CC0.</figcaption></figure>');
  // precizarea: întrebarea (mitul despre Bazinul Carpatic), apoi răspunsul, lângă craniul deformat
  const pc = s.match(/ *<p class="source-caution"><b>O precizare necesară\.<\/b> ([\s\S]*?)<\/p>\n/);
  if (!pc) fail('precizarea de la Gherăseni');
  const a = s.indexOf('var MYTHS = ['), b = s.indexOf('];', a);
  const M4 = eval(s.slice(a + 'var MYTHS = '.length, b + 1))[4];
  const src = M4.src ? '<p class="r10-band-src">Sursa: ' + M4.src.replace(/nota (\d+)/g, '<a class="mx-note" href="#note-$1">nota $1</a>') + '</p>' : '';
  s = s.replace(pc[0], () =>
    '      <section class="r10-band" aria-label="O precizare necesară">\n' +
    '        ' + craniu[0].replace('<figure class="sr-fig">', '<figure class="r10-band-img">') + '\n' +
    '        <div class="r10-band-text">\n' +
    '          <p class="r10-band-label">Ce se spune</p>\n' +
    '          <p class="r10-band-q"><i class="r10-x" aria-hidden="true"></i>„' + M4.myth.replace(/\.$/, '') + '”</p>\n' +
    '          <p class="r10-band-label">O precizare necesară</p>\n' +
    '          <p class="r10-band-a">' + pc[1] + '</p>\n' +
    '          <p class="r10-band-more">' + M4.truth + '</p>\n' +
    '          ' + src + '\n' +
    '        </div>\n' +
    '      </section>\n');
}

// ---------- stilurile și scriptul recenziei ----------
{ const st = s.lastIndexOf('</style>'); s = s.slice(0, st) + CSS + s.slice(st); }
if (JS) { const b = s.lastIndexOf('</body>'); s = s.slice(0, b) + JS + s.slice(b); }

fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
console.log(rel + ': recenzia 10 (totul pe crem, miturile tăiate, banda de la Gherăseni)');
