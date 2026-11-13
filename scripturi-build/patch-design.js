// Stratul final de design (rulat după patch-tipografie.js, înainte de build-web.js):
//  A) două greutăți de font: 500 → 400, 700/800/bold → 600;
//  B) colțuri: orice rază mai mare de 2px devine 2px (cercurile, 50%, rămân cercuri);
//  C) fără umbre: box-shadow și text-shadow devin none, în afară de inelele de focus (umbre fără blur);
//  C2) spațiere pe scară: margin/padding/gap în px (de la 6px în sus) trec pe 8/16/24/40/64/96;
//     jocurile (Attila, Izvoarele) și desenele SVG nu sunt atinse de A–C2;
//  D) adaugă la sfârșitul stilurilor design/design.css (culorile, scara, lățimea, componentele).
// Se poate rula de mai multe ori.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const rel = 'atelierul-hunilor.html';
const f = path.join(root, rel);
const raw = fs.readFileSync(f, 'utf8'), crlf = raw.includes('\r\n');
let s = raw.split('\r\n').join('\n');
const fail = m => { console.error(rel + ': ' + m); process.exit(1); };
const CSS = fs.readFileSync(path.join(__dirname, 'design', 'design.css'), 'utf8').split('\r\n').join('\n').replace(/\n+$/, '\n');

// scoate stratul vechi, dacă scriptul a mai rulat
const k0 = s.indexOf('  /* ds: stratul final de design');
if (k0 >= 0) { const e = '  /* /ds */\n'; const k1 = s.indexOf(e, k0); if (k1 < 0) fail('sfârșit CSS ds'); s = s.slice(0, k0) + s.slice(k1 + e.length); }

const a = s.indexOf('<style'), b = s.lastIndexOf('</style>');
if (a < 0 || b < 0) fail('<style>');
const head = s.slice(0, a), tail = s.slice(b);
let css = s.slice(a, b);

const SKIP = /mig|#md-|\.md-|imp-|#mod-|atelier|\bsvg\b|(^|[\s,>])(text|path|circle|line|rect|g)\b|@keyframes|^\s*(from|to|\d+%)\s*$/;
const FN = /clamp\(|calc\(|min\(|max\(/;
let nW = 0, nR = 0, nS = 0, nP = 0;
const SP = [8, 16, 24, 40, 64, 96];
const snapSp = px => px < 6 ? px : SP.reduce((b, v) => Math.abs(v - px) < Math.abs(b - px) ? v : b, SP[0]);
css = css.replace(/([^{}]+)\{([^{}]*)\}/g, function(all, sel, body){
  if (SKIP.test(sel)) return all;
  let out = body;
  // A) greutăți
  out = out.replace(/(font-weight\s*:\s*)(500|700|800|900|bold|bolder)\b/g, function(m, p, w){ nW++; return p + (w === '500' ? '400' : '600'); });
  out = out.replace(/(font\s*:\s*(?:italic\s+|normal\s+)?)(500|700|800|900|bold)(\s)/g, function(m, p, w, sp){ nW++; return p + (w === '500' ? '400' : '600') + sp; });
  // B) colțuri
  out = out.replace(/(border(?:-(?:top|bottom)-(?:left|right))?-radius\s*:\s*)([^;!}]+)/g, function(m, p, v){
    const nv = v.replace(/(\d*\.?\d+)px/g, function(x, n){ return parseFloat(n) > 2 ? '2px' : x; }).replace(/(\d*\.?\d+)(em|rem)/g, function(x, n){ return parseFloat(n) > 0.13 ? '2px' : x; });
    if (nv !== v) nR++;
    return p + nv;
  });
  // C) umbre (inelele fără blur rămân: „0 0 0 3px …”)
  out = out.replace(/((?:box|text)-shadow\s*:\s*)([^;}]+)/g, function(m, p, v){
    if (/^\s*none/.test(v) || /^\s*(inset\s+)?0(px)?\s+0(px)?\s+0(px)?\s+\d/.test(v) || /var\(/.test(v)) return m;
    nS++; return p + 'none' + (/!important/.test(v) ? ' !important' : '');
  });
  // C2) spațiere
  out = out.replace(/((?:margin|padding)(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?|(?:row-|column-)?gap)(\s*:\s*)([^;}]+)/g, function(m, p, c, v){
    if (FN.test(v)) return m;
    const nv = v.replace(/(^|[\s,])(\d*\.?\d+)px\b/g, function(x, pre, n){ return pre + snapSp(parseFloat(n)) + 'px'; });
    if (nv !== v) nP++;
    return p + c + nv;
  });
  return out === body ? all : sel + '{' + out + '}';
});
s = head + css + CSS + tail;

fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
console.log(rel + ': designul final (greutăți ' + nW + ', colțuri ' + nR + ', umbre ' + nS + ', spațieri ' + nP + ')');
