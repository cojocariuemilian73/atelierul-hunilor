// Trei efecte pe tot site-ul, din scripturi-build/efecte/ (efecte.css, efecte.js):
//  A) cursorul tematic: un punct auriu cu un inel care îl urmează și o urmă scurtă (doar cu mouse, fără „reducerea mișcării”);
//  B) linia timpului: o linie aurie pe marginea stângă a articolului, care se trasează la derulare, cu reperele 375, 441–447,
//     451, 453 și 476 (din cronologia site-ului); fiecare punct se aprinde când paragraful lui intră în ecran;
//  C) pergamentul: pe ilustrațiile medievale și pe picturi (clasa .img-parchment), margini neregulate, arse și îngălbenite,
//     iar imaginea se desface ca un manuscris când ajungi la ea;
//  D) călărețul de sub meniu: un hun călare care merge de la 370 la 476 pe măsură ce citești articolul; drumul auriu
//     se trasează în urma lui și reperele apar abia când ajunge la ele.
// Folosire: node scripturi-build/patch-efecte.js (după celelalte scripturi, inclusiv patch-recenzie-5.js; apoi build-web.js).
// Se poate rula de mai multe ori: înlocuiește blocurile lui, fără să le dubleze.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const E = path.join(__dirname, 'efecte');
const rd = f => fs.readFileSync(path.join(E, f), 'utf8').split('\r\n').join('\n');

// marginea neregulată: un dreptunghi alb deformat cu zgomot (feTurbulence + feDisplacementMap), folosit ca mască
const MASK_SVG = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' preserveAspectRatio='none'>" +
  "<filter id='r' x='-5%' y='-5%' width='110%' height='110%'><feTurbulence type='fractalNoise' baseFrequency='0.035' numOctaves='3' seed='7'/>" +
  "<feDisplacementMap in='SourceGraphic' scale='14' xChannelSelector='R' yChannelSelector='G'/><feGaussianBlur stdDeviation='0.7'/></filter>" +
  "<rect x='8' y='8' width='384' height='284' fill='white' filter='url(#r)'/></svg>";
const MASK = 'url("data:image/svg+xml,' + encodeURIComponent(MASK_SVG).replace(/'/g, '%27') + '")';

const CSS = rd('efecte.css').replace(/__MASK__/g, MASK).replace(/\n+$/, '\n');
const JS = '<script>\n' + rd('efecte.js').trim() + '\n</script>\n';
// ilustrațiile medievale și picturile; nu fotografiile de obiecte, monede, craniu, hărți
const PARCH = ['img-aquileia', 'img-attila', 'img-catalaunice', 'img-geiger', 'img-neuville', 'img-moartea', 'img-delacroix'];

const rel = 'atelierul-hunilor.html';
const f = path.join(root, rel);
const raw = fs.readFileSync(f, 'utf8'), crlf = raw.includes('\r\n');
let s = raw.split('\r\n').join('\n');
const fail = m => { console.error(rel + ': ' + m); process.exit(1); };

// stilurile
const c0 = s.indexOf('  /* ef: efecte');
if (c0 >= 0) { const e = '  /* /ef */\n'; const c1 = s.indexOf(e, c0); if (c1 < 0) fail('sfârșit CSS ef'); s = s.slice(0, c0) + s.slice(c1 + e.length); }
const st = s.lastIndexOf('</style>');
if (st < 0) fail('</style>');
s = s.slice(0, st) + CSS + s.slice(st);

// scriptul, ultimul înainte de </body>
const j0 = s.indexOf('<script>\n/* ef: efecte');
if (j0 >= 0) s = s.slice(0, j0) + s.slice(s.indexOf('</script>\n', j0) + '</script>\n'.length);
const b = s.lastIndexOf('</body>');
if (b < 0) fail('</body>');
s = s.slice(0, b) + JS + s.slice(b);

// clasa .img-parchment pe imaginile alese
PARCH.forEach(id => {
  const re = new RegExp('<img\\b[^>]*\\bid="' + id + '"[^>]*>');
  const m = s.match(re); if (!m) fail('imaginea #' + id);
  let tag = m[0];
  if (/\bimg-parchment\b/.test(tag)) return;
  tag = /\bclass="/.test(tag) ? tag.replace(/\bclass="/, 'class="img-parchment ') : tag.replace('<img ', '<img class="img-parchment" ');
  s = s.replace(m[0], tag);
});

fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
console.log(rel + ': efectele (cursor, linia timpului, pergament pe ' + PARCH.length + ' imagini)');
