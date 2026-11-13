// Recenzia 9: miturile și „Știai că…?” împărțite prin capitole, lângă textul de care țin; la final nu mai rămâne niciunul.
//  - fără secțiunea „Mituri verificate” (și fără intrarea ei din meniu, scoasă în patch-acasa.js);
//  - patru grupuri mici de mituri: originea, izvoarele, Attila, Bazinul Carpatic;
//  - cele șapte „Știai că…?” sunt note pe margine, fiecare singură, lângă paragraful ei (două în fișele muzeului);
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

// ---------- 2) grupurile de mituri, în capitole (se refac de fiecare dată) ----------
s = s.replace(/ *<div class="mx mx-inline" data-myths="[\d,]+" data-title="[^"]*"><\/div>\n/g, '');
const put = (at, html, what) => { if (at < 0) fail(what); s = s.slice(0, at) + html + s.slice(at); };
const G = (ids, title) => '      <div class="mx mx-inline" data-myths="' + ids + '" data-title="' + title + '"></div>\n';
// Origini: după „Teoria legăturii cu Xiongnu” (înaintea rândului cu Neuville)
{ const i = s.indexOf('<img class="img-parchment" id="img-neuville"'); put(i < 0 ? -1 : s.lastIndexOf('      <div class="sr-row', i), G('3,0,2', 'Ce se spune despre originea hunilor'), 'locul: originea'); }
// Origini: după „Izvoarele, față în față”, la capătul capitolului
{ const i = s.indexOf('<div class="src-compare sr-reveal">'); put(i < 0 ? -1 : s.indexOf('    </section>\n', i), G('1,6', 'Ce se spune despre izvoare'), 'locul: izvoarele'); }
// Personalități: după duel și Câmpiile Catalaunice
put(s.indexOf('      <h3 class="sub-title">Consecințe de lungă durată</h3>'), G('8,7', 'Ce se spune și ce se știe'), 'locul: Attila');
// (mitul despre Bazinul Carpatic e întrebarea din banda de la Gherăseni, în patch-recenzie-10.js)
if ((s.match(/class="mx mx-inline"/g) || []).length !== 3) fail('grupurile de mituri');

// ---------- 2b) „Știai că…?”: note pe margine, fiecare singură, lângă paragraful ei ----------
{
  const a = s.indexOf('var MYTHS = ['), b = s.indexOf('];', a);
  if (a < 0 || b < 0) fail('lista MYTHS');
  const MY = eval(s.slice(a + 'var MYTHS = '.length, b + 1));
  const note = (k, cls) => {
    const m = MY[k]; if (!m || !m.fact) fail('faptul ' + k);
    const n = m.num.match(/^([\d.,\/]+)\s+(.*)$/);
    const head = n ? '<p class="r9n-num">' + n[1] + '</p><p class="r9n-unit">' + n[2] + '</p>' : '<p class="r9n-title">' + m.num + '</p>';
    const src = m.src ? '<p class="r9n-src">Sursa: ' + m.src.replace(/nota (\d+)/g, '<a class="mx-note" href="#note-$1">nota $1</a>') + '</p>' : '';
    return '<aside class="r9-note' + (cls ? ' ' + cls : '') + '" aria-label="Știai că…? ' + m.num.replace(/["„”]/g, '') + '"><p class="r9n-tag">Știai că…?</p>' + head + '<p class="r9n-text">' + m.truth + '</p>' + src + '</aside>';
  };
  // curățenie: notele și dicționarul muzeului se refac de fiecare dată
  s = s.replace(/ *<aside class="r9-note[^"]*"[\s\S]*?<\/aside>\n/g, '');
  s = s.replace(/<div class="r9-facts">\n([\s\S]*?)<\/div>\n/, '$1');
  s = s.replace(/<script id="r9-notes">[\s\S]*?<\/script>\n/, '');
  const before = (anchor, k, what) => { const i = s.indexOf(anchor); if (i < 0) fail(what); const ls = s.lastIndexOf('\n', i) + 1; put(ls, s.slice(ls, i).replace(/\S/g, '') + note(k) + '\n', what); };
  // Origini: lângă paragraful despre arcul compozit și, la un ecran mai jos, lângă citatul lui Priscus despre tratativele
  // purtate călare (paragraful lui Ammianus e chiar lângă cel despre arc, așa că cele două note s-ar fi lipit)
  before('<p>Avantajul lor în luptă venea din <b>arcul recurbat compozit</b>', 9, 'nota: săgeți de os');
  before('<!-- pq:start --><figure class="pq"><blockquote><p>Socotind că nu se cuvine să coboare de pe cai', 13, 'nota: zi și noapte călare');
  // Marea Migrație: lângă imaginea solidului și imediat după graficul cu monede
  before('<figure class="sr-fig sr-fig-inline"><img id="img-solidus"', 14, 'nota: 1/72 de livră');
  { const e = '      <!-- aur:end -->\n', i = s.indexOf(e); put(i < 0 ? -1 : i + e.length, '      ' + note(10) + '\n', 'nota: 500 de solizi'); }
  // Personalități: în fișa lui Attila, ca notă pe margine lângă faptele-cheie (un rând cu două coloane)
  { const i = s.indexOf('<ul class="dk-facts">'), j = i < 0 ? -1 : s.indexOf('</ul>\n', i); if (j < 0) fail('nota: sabia lui Marte');
    const e = j + '</ul>\n'.length;
    s = s.slice(0, i) + '<div class="r9-facts">\n' + s.slice(i, e) + '          ' + note(5, 'r9-in r9-side') + '\n</div>\n' + s.slice(e); }
  // Muzeu: în fișele Solidului lui Teodosie și Spathei (fișele se construiesc în script, deci notele merg într-un dicționar)
  const NOTES = { 'Solidul lui Teodosie al II-lea': note(11, 'r9-in'), 'Spatha hunică': note(12, 'r9-in') };
  put(s.indexOf('</head>'), '<script id="r9-notes">\nwindow.R9_NOTES = ' + JSON.stringify(NOTES).replace(/<\//g, '<\\/') + ';\n</script>\n', 'nota: muzeul');
  swap("      '<p class=\"artifact-desc\">' + art.desc + '</p>' +\n",
    "      '<p class=\"artifact-desc\">' + art.desc + '</p>' + ((window.R9_NOTES || {})[art.name] || '') +\n", 'nota: fișele muzeului');
  if ((s.match(/<aside class="r9-note/g) || []).length !== 5) fail('notele pe margine');
}

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
