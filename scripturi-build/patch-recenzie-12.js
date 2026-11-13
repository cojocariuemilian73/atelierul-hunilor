// Recenzia 12: miturile din capitole devin fișe de verdict (mit · imagine · verdict),
// pe pagină o dată normal, o dată în oglindă. Mitul de la Gherăseni rămâne în bandă (recenzia 10).
// Folosire: node scripturi-build/patch-recenzie-12.js (după patch-recenzie-11.js, înainte de patch-efecte.js).
// Se poate rula de mai multe ori.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const dir = path.join(__dirname, 'recenzie12');
const rd = f => fs.readFileSync(path.join(dir, f), 'utf8').split('\r\n').join('\n');
const CSS = rd('recenzie12.css').replace(/\n+$/, '\n'), JS = rd('recenzie12.js').trim();
const FISE = require(path.join(dir, 'fise.js'));

const rel = 'atelierul-hunilor.html';
const f = path.join(root, rel);
const raw = fs.readFileSync(f, 'utf8'), crlf = raw.includes('\r\n');
let s = raw.split('\r\n').join('\n');
const fail = m => { console.error(rel + ': ' + m); process.exit(1); };

// ---------- 1) grupurile de mituri din capitole devin grupuri de fișe ----------
s = s.replace(/<div class="mx mx-inline" data-myths="([\d,]+)" data-title="([^"]*)"><\/div>/g, '<div class="vd-group" data-myths="$1" data-title="$2"></div>');
if ((s.match(/<div class="vd-group" data-myths="/g) || []).length !== 3) fail('grupurile de fișe');
// fișele au nevoie de toată lățimea: un grup ajuns în coloana de text a unui rând cu imagine iese înaintea rândului
{
  const re = / *<div class="vd-group" data-myths="[\d,]+" data-title="[^"]*"><\/div>\n/g; let m, moves = [];
  while ((m = re.exec(s))) {
    const at = m.index, rowStart = s.lastIndexOf('      <div class="sr-row', at), txt = s.lastIndexOf('<div class="sr-text">', at);
    // e în coloana de text dacă după începutul rândului vine <div class="sr-text"> și grupul e chiar primul lucru din ea
    if (rowStart >= 0 && txt > rowStart && /^\s*$/.test(s.slice(txt + '<div class="sr-text">'.length, at))) moves.push({ at: at, len: m[0].length, to: rowStart, html: m[0].trim() });
  }
  moves.reverse().forEach(function(x){ s = s.slice(0, x.at) + s.slice(x.at + x.len); s = s.slice(0, x.to) + '      ' + x.html + '\n' + s.slice(x.to); });
}

// ---------- 2) datele: mitul și sursa din MYTHS, restul din recenzie12/fise.js ----------
{
  const a = s.indexOf('var MYTHS = ['), b = s.indexOf('];', a);
  if (a < 0 || b < 0) fail('lista MYTHS');
  const MY = eval(s.slice(a + 'var MYTHS = '.length, b + 1));
  const D = {};
  Object.keys(FISE).forEach(k => {
    const m = MY[k]; if (!m) fail('mitul ' + k);
    D[k] = Object.assign({ myth: m.myth, src: (m.src || '').replace(/nota (\d+)/g, '<a class="mx-note" href="#note-$1">nota $1</a>') }, FISE[k]);
  });
  s = s.replace(/<script id="r12-data">[\s\S]*?<\/script>\n/, '');
  const i = s.indexOf('</head>'); if (i < 0) fail('</head>');
  s = s.slice(0, i) + '<script id="r12-data">\nwindow.R12 = ' + JSON.stringify(D).replace(/<\//g, '<\\/') + ';\n</script>\n' + s.slice(i);
}

// ---------- stilurile și scriptul ----------
const k0 = s.indexOf('  /* r12: recenzia 12');
if (k0 >= 0) { const e = '  /* /r12 */\n'; const k1 = s.indexOf(e, k0); if (k1 < 0) fail('sfârșit CSS r12'); s = s.slice(0, k0) + s.slice(k1 + e.length); }
const st = s.lastIndexOf('</style>'); if (st < 0) fail('</style>');
s = s.slice(0, st) + CSS + s.slice(st);
s = s.replace(/<script>\n\/\* r12: recenzia 12 \*\/[\s\S]*?<\/script>\n/, '');
const bd = s.lastIndexOf('</body>'); if (bd < 0) fail('</body>');
s = s.slice(0, bd) + '<script>\n/* r12: recenzia 12 */\n' + JS + '\n</script>\n' + s.slice(bd);

fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
console.log(rel + ': recenzia 12 (fișele de verdict)');
