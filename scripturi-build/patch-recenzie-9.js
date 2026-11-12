// Recenzia 9: miturile și „Știai că…?” împărțite prin capitole, lângă textul de care țin; la final nu mai rămâne niciunul.
//  - fără secțiunea „Mituri verificate” (și fără intrarea ei din meniu, scoasă în patch-acasa.js);
//  - șase grupuri mici: originea, viața în șa, izvoarele, aurul, Attila, Bazinul Carpatic;
//  - contorul „0 din N verificate” și „Verifică toate” apar doar la grupurile cu cel puțin două mituri.
// Folosire: node scripturi-build/patch-recenzie-9.js (după patch-recenzie-8.js, înainte de patch-efecte.js).
// Se poate rula de mai multe ori.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const CSS = fs.readFileSync(path.join(__dirname, 'recenzie9', 'recenzie9.css'), 'utf8').split('\r\n').join('\n').replace(/\n+$/, '\n');

const rel = 'atelierul-hunilor.html';
const f = path.join(root, rel);
const raw = fs.readFileSync(f, 'utf8'), crlf = raw.includes('\r\n');
let s = raw.split('\r\n').join('\n');
const fail = m => { console.error(rel + ': ' + m); process.exit(1); };
function swap(a, b, what){ const n = s.split(a).length - 1; if (n === 1) { s = s.replace(a, () => b); return; } if (s.includes(b)) return; fail(what + ' (' + n + ')'); }

// ---------- 1) fără secțiunea de la final și fără grupurile vechi ----------
{
  const m0 = s.indexOf('    <section id="sec-mituri">');
  if (m0 >= 0) {
    const orn = s.lastIndexOf('    <div class="ch-orn"', m0);
    const start = orn >= 0 && !s.slice(orn, m0).includes('</section>') && !s.slice(orn, m0).includes('<section') ? orn : m0;
    const e = '    </section>\n', m1 = s.indexOf(e, m0);
    if (m1 < 0) fail('sfârșitul secțiunii cu mituri');
    s = s.slice(0, start) + s.slice(m1 + e.length);
  }
  s = s.replace(/ *<div class="mx(?: mx-all-in-one)?" data-myths="[\d,]+" data-title="[^"]*"><\/div>\n/g, '');
}

// ---------- 2) grupurile, în capitole ----------
const G = (ids, title) => '      <div class="mx mx-inline" data-myths="' + ids + '" data-title="' + title + '"></div>\n';
if (!s.includes('class="mx mx-inline"')) {
  const put = (at, html, what) => { if (at < 0) fail(what); s = s.slice(0, at) + html + s.slice(at); };
  // Origini: după „Teoria legăturii cu Xiongnu” (înaintea rândului cu Neuville)
  { const i = s.indexOf('<img class="img-parchment" id="img-neuville"'); put(i < 0 ? -1 : s.lastIndexOf('      <div class="sr-row', i), G('3,0,2', 'Mituri despre origine'), 'locul: originea'); }
  // Origini: după citatul despre viața în șa, înaintea tabelului cu izvoarele
  put(s.indexOf('      <div class="src-compare sr-reveal">'), G('13,9,12', 'Știai că…? Viața în șa'), 'locul: viața în șa');
  // Origini: după „Izvoarele, față în față”, la capătul capitolului
  { const i = s.indexOf('<div class="src-compare sr-reveal">'); put(i < 0 ? -1 : s.indexOf('    </section>\n', i), G('1,6', 'Mituri despre izvoare'), 'locul: izvoarele'); }
  // Marea Migrație: după graficul cu monede
  { const i = s.indexOf('      <!-- aur:end -->\n'); put(i < 0 ? -1 : i + '      <!-- aur:end -->\n'.length, G('10,11,14', 'Știai că…? Aurul tributului'), 'locul: aurul'); }
  // Personalități: după duel și Câmpiile Catalaunice
  put(s.indexOf('      <h3 class="sub-title">Consecințe de lungă durată</h3>'), G('8,7,5', 'Mituri despre Attila'), 'locul: Attila');
  // Personalități: după „Ecoul în spațiul carpato-danubiano-pontic” și precizarea despre obiectele „hunice”
  { const i = s.indexOf('<p class="source-caution"><b>O precizare necesară.</b>'); put(i < 0 ? -1 : s.indexOf('    </section>\n', i), G('4', 'Un mit despre Bazinul Carpatic'), 'locul: Bazinul Carpatic'); }
}
if ((s.match(/class="mx mx-inline"/g) || []).length !== 6) fail('grupurile de mituri');

// ---------- 3) contorul doar la grupurile cu cel puțin două mituri ----------
swap("      '<p class=\"mx-count\"><b>0</b> din ' + ids.length + ' verificate</p>' +\n      '<button type=\"button\" class=\"mx-all\">Verifică toate</button>';",
  "      (ids.length > 1 ? '<p class=\"mx-count\"><b>0</b> din ' + ids.length + ' verificate</p>' +\n      '<button type=\"button\" class=\"mx-all\">Verifică toate</button>' : '<p class=\"mx-count\" hidden><b>0</b></p><button type=\"button\" class=\"mx-all\" hidden></button>');",
  'contorul miturilor');

// ---------- stilurile ----------
const k0 = s.indexOf('  /* r9: recenzia 9');
if (k0 >= 0) { const e = '  /* /r9 */\n'; const k1 = s.indexOf(e, k0); if (k1 < 0) fail('sfârșit CSS r9'); s = s.slice(0, k0) + s.slice(k1 + e.length); }
const st = s.lastIndexOf('</style>');
if (st < 0) fail('</style>');
s = s.slice(0, st) + CSS + s.slice(st);

fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
console.log(rel + ': recenzia 9 (miturile și „Știai că…?” prin capitole)');
