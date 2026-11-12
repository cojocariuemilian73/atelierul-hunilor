// Recenzia 7 (din scripturi-build/recenzie7/: recenzie7.css, recenzie7.js):
//  A) varianta B: articolul pe pergament deschis (crem, text maro-închis), granatul ca accent rar; deschiderea rămâne
//     întunecată, iar cronologia, graficul aurului, Atlasul și muzeul sunt „vitrine” pe fundal închis;
//  B) curățenie: fără numerele capitolelor și fără chipurile rotunjite, separator cu romb între secțiuni,
//     aceeași ramă și legendă la toate imaginile, fără codul QR;
//  C) mișcare (o singură dată, 200–600 ms, nimic cu „reducerea mișcării”): apariția la derulare, linia 370–476
//     care se desenează cu rombul până la 453, ghilimeaua citatelor, lupa din muzeu, miturile care se întorc,
//     linia aurie care alunecă în meniu;
//  D) formulările mai directe și miturile adunate într-un singur loc.
// Folosire: node scripturi-build/patch-recenzie-7.js (după patch-recenzie-6.js, înainte de patch-efecte.js).
// Se poate rula de mai multe ori.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const D = path.join(__dirname, 'recenzie7');
const rd = f => fs.readFileSync(path.join(D, f), 'utf8').split('\r\n').join('\n');
const CSS = rd('recenzie7.css').replace(/\n+$/, '\n');
const JS = fs.existsSync(path.join(D, 'recenzie7.js')) ? '<script>\n/* r7: recenzia 7 */\n' + rd('recenzie7.js').trim() + '\n</script>\n' : '';

const rel = 'atelierul-hunilor.html';
const f = path.join(root, rel);
const raw = fs.readFileSync(f, 'utf8'), crlf = raw.includes('\r\n');
let s = raw.split('\r\n').join('\n');
const fail = m => { console.error(rel + ': ' + m); process.exit(1); };
function swap(a, b, what){ const n = s.split(a).length - 1; if (n === 1) { s = s.replace(a, () => b); return; } if (s.includes(b)) return; fail(what + ' (' + n + ')'); }

// ---------- D) formulările mai directe ----------
require('./recenzie7/formulari.js').forEach(([a, b], k) => swap(a, b, 'formularea ' + (k + 1)));

// ---------- B) curățenie ----------
// separatorul dintre capitole: o linie cu romb, ca în logo (locul pentru motivul de pe diadema de la Gherăseni)
s = s.replace(/<div class="ch-orn" aria-hidden="true"><svg viewBox="0 0 240 24">[\s\S]*?<\/svg><\/div>/g,
  '<div class="ch-orn" aria-hidden="true"><svg viewBox="0 0 240 24"><path d="M8 12H108M132 12H232"/><path class="d" d="M120 4l8 8-8 8-8-8z"/></svg></div>');
// fără codul QR: nici în antetul jocului, nici fereastra lui
s = s.replace(/ *<aside class="hero-qr"[\s\S]*?<\/aside>\n/g, '');
s = s.replace(/<dialog class="qr-dialog"[\s\S]*?<\/dialog>\n?/g, '');
// linia din deschidere: rombul arată 453, moartea lui Attila
s = s.replace('<p class="hero-years" aria-label="370–476">', '<p class="hero-years" aria-label="370–476; rombul marchează anul 453, moartea lui Attila">');

// ---------- D) miturile, adunate într-o secțiune proprie, „Mituri verificate” (după muzeu, cu intrare în meniu) ----------
{
  // grupurile vechi (patru) sau blocul comun de dinainte de secțiune; ambele se mută în secțiunea „Mituri verificate”
  const groups = [...s.matchAll(/ *<div class="mx(?: mx-all-in-one)?" data-myths="([\d,]+)" data-title="[^"]*"><\/div>\n/g)];
  if (!s.includes('<section id="sec-mituri">') && groups.length) {
    const ids = groups.map(g => g[1]).join(',');
    groups.forEach(g => { s = s.replace(g[0], ''); });
    // sfârșitul articolului principal (atenție: „  </article>” apare și la capătul fișelor din duel)
    const at = s.indexOf('\n  </article>\n') + 1;
    if (at < 1) fail('sfârșitul articolului');
    s = s.slice(0, at) +
      '    <div class="ch-orn" aria-hidden="true"><svg viewBox="0 0 240 24"><path d="M8 12H108M132 12H232"/><path class="d" d="M120 4l8 8-8 8-8-8z"/></svg></div>\n' +
      '    <section id="sec-mituri">\n' +
      '      <div class="chapter-mark sec-head"><span class="chapter-num" aria-hidden="true">07</span><h2 class="sec-title">Mituri verificate</h2></div>\n' +
      '      <p class="sec-sub">Ce se spune adesea despre huni și ce arată, de fapt, izvoarele, arheologia și genetica.</p>\n' +
      '      <div class="mx mx-all-in-one" data-myths="' + ids + '" data-title="Opt mituri și șapte curiozități"></div>\n' +
      '    </section>\n' + s.slice(at);
  } else if (!s.includes('<section id="sec-mituri">')) fail('miturile');
}
// locurile pentru textele autorului (le scrie elevul; nu se văd pe site până nu sunt completate)
if (!s.includes('<!-- TEXTUL TĂU')) {
  swap('    <h3>Ghid rapid de navigare</h3>', '    <!-- TEXTUL TĂU: „Cum am lucrat” (cât a durat, ce ai făcut tu, ce unelte ai folosit). Scrie-l aici, ca <h3> și un paragraf. -->\n    <h3>Ghid rapid de navigare</h3>', 'Despre proiect: locul pentru „Cum am lucrat”');
  const at = s.indexOf('\n  </article>\n') + 1;
  s = s.slice(0, at) + '    <!-- TEXTUL TĂU: un final personal (ce ai învățat, ce n-ai reușit să lămurești, ce ai citi mai departe). Scrie-l aici, într-un <section id="sec-final">. -->\n' + s.slice(at);
}


// ---------- stilurile și scriptul ----------
const k0 = s.indexOf('  /* r7: recenzia 7');
if (k0 >= 0) { const e = '  /* /r7 */\n'; const k1 = s.indexOf(e, k0); if (k1 < 0) fail('sfârșit CSS r7'); s = s.slice(0, k0) + s.slice(k1 + e.length); }
const st = s.lastIndexOf('</style>');
if (st < 0) fail('</style>');
s = s.slice(0, st) + CSS + s.slice(st);
const j0 = s.indexOf('<script>\n/* r7: recenzia 7 */');
if (j0 >= 0) s = s.slice(0, j0) + s.slice(s.indexOf('</script>\n', j0) + '</script>\n'.length);
if (JS) { const b = s.lastIndexOf('</body>'); s = s.slice(0, b) + JS + s.slice(b); }

fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
console.log(rel + ': recenzia 7 (pergament și granat, curățenie, mișcare, formulări)');
