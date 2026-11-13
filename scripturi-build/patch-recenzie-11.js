// Recenzia 11: coperta scurtă, intrarea directă în „Originile hunilor”, fișele Muzeului aliniate,
// două fonturi (EB Garamond pentru titluri, Source Serif 4 pentru rest) și butoane scrise normal.
// Folosire: node scripturi-build/patch-recenzie-11.js (după patch-recenzie-10.js, înainte de patch-efecte.js).
// Se poate rula de mai multe ori.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const CSS = fs.readFileSync(path.join(__dirname, 'recenzie11', 'recenzie11.css'), 'utf8').split('\r\n').join('\n').replace(/\n+$/, '\n');

const rel = 'atelierul-hunilor.html';
const f = path.join(root, rel);
const raw = fs.readFileSync(f, 'utf8'), crlf = raw.includes('\r\n');
let s = raw.split('\r\n').join('\n');
const fail = m => { console.error(rel + ': ' + m); process.exit(1); };
function swap(a, b, what){ const n = s.split(a).length - 1; if (n === 1) { s = s.replace(a, () => b); return; } if (s.includes(b)) return; fail(what + ' (' + n + ')'); }

// ---------- 1) coperta: titlu, perioada, o frază, două butoane; creditul sub imagine ----------
{
  const a = s.indexOf('    <div class="hero-inner">\n'), b = a < 0 ? -1 : s.indexOf('    </div>\n  </section>', a);
  if (a < 0 || b < 0) fail('coperta');
  const INNER = '    <div class="hero-inner">\n' +
    '      <h1 class="title">Hunii și Marea Migrație</h1>\n' +
    '      <p class="hero-years">370–476</p>\n' +
    '      <p class="dek">Sosirea hunilor împinge goții spre Dunăre și schimbă echilibrul la granițele Romei.</p>\n' +
    '      <div class="hero-cta">\n' +
    '        <a class="hero-btn primary" href="#sec-origini">Citește articolul</a>\n' +
    '        <a class="hero-btn" href="#mod-migratie">Joacă simularea</a>\n' +
    '      </div>\n';
  s = s.slice(0, a) + INNER + s.slice(b);
  // creditul picturii: imediat sub imagine, nu peste ea
  const cr = s.match(/    <p class="hero-credit">[^\n]*<\/p>\n/);
  if (cr) { s = s.replace(cr[0], ''); const e = s.indexOf('    </div>\n  </section>', s.indexOf('<section id="acasa" class="hero">')) + '    </div>\n  </section>\n'.length; s = s.slice(0, e) + cr[0].replace('    <p class="hero-credit">', '  <p class="hero-credit">') + s.slice(e); }
  else if (!s.includes('  <p class="hero-credit">')) fail('creditul picturii');
}
// numele concursului: în „Despre proiect”
swap('    <h2 id="about-title">Despre proiect / Fișă tehnică</h2>\n',
  '    <h2 id="about-title">Despre proiect / Fișă tehnică</h2>\n    <p class="about-contest">Proiect realizat pentru Concursul Național „Istorie și societate în dimensiune virtuală”.</p>\n', 'concursul în Despre proiect');
s = s.replace('<strong>Jocul izvoarelor</strong>: treisprezece surse despre huni', '<strong>Jocul izvoarelor</strong>: cincisprezece surse despre huni');

// ---------- 2) capitolul 01: „Originile hunilor”, fără subtitlul italic ----------
swap('<h2 class="sec-title">Context istoric &amp; origini</h2></div>\n      <p class="sec-sub">O origine disputată, un mod de viață construit în șa</p>\n',
  '<h2 class="sec-title">Originile hunilor</h2></div>\n', 'titlul capitolului 01');

// ---------- 3) Muzeul: o singură instrucțiune ----------
swap('<p class="lab-how"><span class="lab-dot" aria-hidden="true"></span>Apasă pe punctele roșii de pe fotografii ca să afli detaliile fiecărei piese.</p>',
  '<p class="lab-how"><span class="lab-dot" aria-hidden="true"></span>Apasă pe punctele roșii pentru detalii.</p>', 'instrucțiunea Muzeului');

// ---------- stilurile ----------
const k0 = s.indexOf('  /* r11: recenzia 11');
if (k0 >= 0) { const e = '  /* /r11 */\n'; const k1 = s.indexOf(e, k0); if (k1 < 0) fail('sfârșit CSS r11'); s = s.slice(0, k0) + s.slice(k1 + e.length); }
const st = s.lastIndexOf('</style>');
if (st < 0) fail('</style>');
s = s.slice(0, st) + CSS + s.slice(st);

fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
console.log(rel + ': recenzia 11 (copertă, Origini, Muzeu, fonturi)');
