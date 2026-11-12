// Modulele din articol, redesenate (din scripturi-build/module/module.css):
//  A) scoate caseta „Pe scurt” de la capitolul 01;
//  B) „Izvoarele, față în față” devine un tabel comparativ: coloanele sunt cele cinci surse, rândurile sunt
//     distanța în timp, tipul sursei, „Ce aflăm” și „Limite” (textele rămân aceleași); pe ecranele înguste
//     tabelul se derulează pe orizontală, cu prima coloană fixă;
//  C) miturile: rânduri compacte („Verifică →” în dreapta), iar la verificare ștampila „Fals” apare mare peste mit;
//  D) Attila și Aetius: portretul lângă nume și epitet, iar evaluările sunt cinci puncte în loc de bare.
// Folosire: node scripturi-build/patch-module.js (după patch-acasa.js, înainte de patch-efecte.js; apoi build-web.js).
// Se poate rula de mai multe ori.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const CSS = fs.readFileSync(path.join(__dirname, 'module', 'module.css'), 'utf8').split('\r\n').join('\n').replace(/\n+$/, '\n');

const rel = 'atelierul-hunilor.html';
const f = path.join(root, rel);
const raw = fs.readFileSync(f, 'utf8'), crlf = raw.includes('\r\n');
let s = raw.split('\r\n').join('\n');
const fail = m => { console.error(rel + ': ' + m); process.exit(1); };

// ---------- A) fără „Pe scurt” ----------
s = s.replace(/ *<div class="pe-scurt">[\s\S]*?<\/div>\n/g, '');

// ---------- B) izvoarele ca tabel ----------
const g0 = s.indexOf('<div class="sc-grid">');
if (g0 >= 0) {
  const g1 = s.indexOf('</article></div>', g0) + '</article></div>'.length;
  if (g1 < g0 + 30) fail('sfârșitul grilei de izvoare');
  const cards = s.slice(g0, g1).match(/<article class="sc-card [^"]+">[\s\S]*?<\/article>/g) || [];
  if (cards.length !== 5) fail('izvoarele (' + cards.length + ')');
  const C = cards.map(a => {
    const m = a.match(/^<article class="sc-card ([^"]+)"><header><b>([\s\S]*?)<\/b><small>([\s\S]*?)<\/small><\/header>(<span class="sc-gap[\s\S]*?<\/span>)(<p class="sc-w [\s\S]*?<\/p>)<p class="sc-row"><em>Ce aflăm<\/em>([\s\S]*?)<\/p><p class="sc-row"><em>Limite<\/em>([\s\S]*?)<\/p><\/article>$/);
    if (!m) fail('fișa unui izvor: ' + a.slice(0, 80));
    return { k: m[1], name: m[2], meta: m[3], gap: m[4], who: m[5], what: m[6], lim: m[7] };
  });
  const row = (label, key) => '<tr><th scope="row" class="sc-c0">' + label + '</th>' + C.map(c => '<td class="' + c.k + '">' + c[key] + '</td>').join('') + '</tr>';
  const T = '<div class="sc-wrap" role="region" aria-label="Izvoarele, față în față (tabel)" tabindex="0"><table class="sc-table">' +
    '<colgroup><col class="sc-c0">' + C.map(() => '<col>').join('') + '</colgroup>' +
    '<thead><tr><th scope="col" class="sc-c0">Sursa</th>' + C.map(c => '<th scope="col" class="' + c.k + '"><b>' + c.name + '</b><small>' + c.meta + '</small></th>').join('') + '</tr></thead>' +
    '<tbody>' + row('Distanța în timp', 'gap') + row('Tipul sursei', 'who') + row('Ce aflăm', 'what') + row('Limite', 'lim') + '</tbody></table></div>' +
    '<p class="sc-hint" aria-hidden="true">Derulează tabelul spre dreapta →</p>';
  s = s.slice(0, g0) + T + s.slice(g1);
} else if (!s.includes('<table class="sc-table">')) fail('izvoarele, față în față');

// ---------- stilurile ----------
const k0 = s.indexOf('  /* mod: module');
if (k0 >= 0) { const e = '  /* /mod */\n'; const k1 = s.indexOf(e, k0); if (k1 < 0) fail('sfârșit CSS mod'); s = s.slice(0, k0) + s.slice(k1 + e.length); }
const st = s.lastIndexOf('</style>');
if (st < 0) fail('</style>');
s = s.slice(0, st) + CSS + s.slice(st);

fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
console.log(rel + ': module redesenate (fără „Pe scurt”, izvoarele ca tabel, miturile pe rânduri, fișele duelului)');
