// Recenzia 8 (din scripturi-build/recenzie8/: recenzie8.css, recenzie8.js):
//  A) portretele lui Attila și Aetius mai mari, lângă nume; rândul cu sursele din deschidere lizibil; letrina granat;
//     subtitlurile din capitole cu o treaptă mai mari; muzeul pe 4 coloane;
//  B) accesibilitatea: toate imaginile au text alternativ, iar titlurile ferestrelor au un text implicit până la deschidere.
// (Monedele, banda călărețului, meniul și secțiunea „Mituri verificate” sunt în aur/, efecte/, patch-acasa.js și patch-recenzie-7.js.)
// Folosire: node scripturi-build/patch-recenzie-8.js (după patch-recenzie-7.js, înainte de patch-efecte.js).
// Se poate rula de mai multe ori.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const D = path.join(__dirname, 'recenzie8');
const rd = f => fs.readFileSync(path.join(D, f), 'utf8').split('\r\n').join('\n');
const CSS = rd('recenzie8.css').replace(/\n+$/, '\n');
const JS = fs.existsSync(path.join(D, 'recenzie8.js')) ? '<script>\n/* r8: recenzia 8 */\n' + rd('recenzie8.js').trim() + '\n</script>\n' : '';

const rel = 'atelierul-hunilor.html';
const f = path.join(root, rel);
const raw = fs.readFileSync(f, 'utf8'), crlf = raw.includes('\r\n');
let s = raw.split('\r\n').join('\n');
const fail = m => { console.error(rel + ': ' + m); process.exit(1); };
function swap(a, b, what){ const n = s.split(a).length - 1; if (n === 1) { s = s.replace(a, () => b); return; } if (s.includes(b)) return; fail(what + ' (' + n + ')'); }

// ---------- modul luminos: browserele cu „mod întunecat forțat” (Chrome/Edge, Dark Reader) nu mai recolorează pagina ----------
swap('<meta charset="utf-8">\n', '<meta charset="utf-8">\n<meta name="color-scheme" content="only light">\n<meta name="darkreader-lock">\n', 'modul luminos');

// ---------- stilurile și scriptul ----------
const k0 = s.indexOf('  /* r8: recenzia 8');
if (k0 >= 0) { const e = '  /* /r8 */\n'; const k1 = s.indexOf(e, k0); if (k1 < 0) fail('sfârșit CSS r8'); s = s.slice(0, k0) + s.slice(k1 + e.length); }
const st = s.lastIndexOf('</style>');
if (st < 0) fail('</style>');
s = s.slice(0, st) + CSS + s.slice(st);
const j0 = s.indexOf('<script>\n/* r8: recenzia 8 */');
if (j0 >= 0) s = s.slice(0, j0) + s.slice(s.indexOf('</script>\n', j0) + '</script>\n'.length);
if (JS) { const b = s.lastIndexOf('</body>'); s = s.slice(0, b) + JS + s.slice(b); }

fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
console.log(rel + ': recenzia 8 (portrete, letrină, subtitluri, muzeu, accesibilitate)');
