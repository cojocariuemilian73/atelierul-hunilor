// Un singur joc: „Imperiul lui Attila” devine actul II al simulării Marii Migrații.
// Pagina separată #mod-game dispare (adresa veche duce la #mod-migratie, ca să meargă și codul QR),
// codul QR trece sub joc, iar meniul, butoanele și „Despre proiect” vorbesc despre un singur joc.
// Folosire: node scripturi-build/splice-joc-unic.js (după splice-jocuri.js; se poate rula de mai multe ori)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const TITLE = 'Attila și Marea Migrație';
const SUB = '370–476 · trei acte · ești Valens, Stilicho, Attila și Ardaric · popoarele se mișcă pe harta reală a Europei.';

for (const rel of ['index.html', 'atelierul-hunilor.html']) {
  const f = path.join(root, rel);
  const raw = fs.readFileSync(f, 'utf8');
  const crlf = raw.includes('\r\n');
  let s = raw.split('\r\n').join('\n');
  const fail = m => { console.error(rel + ': ' + m); process.exit(1); };
  const rep = (a, b) => { if (s.includes(a)) s = s.split(a).join(b); };

  // 1. pagina separată a jocului dispare; codul QR trece sub simulare
  const g0 = s.indexOf('<section id="mod-game" class="site-page">');
  if (g0 >= 0) {
    const g1 = s.indexOf('</section>\n', g0) + '</section>\n'.length;
    const page = s.slice(g0, g1);
    const q0 = page.indexOf('    <aside class="qr-card"'), q1 = page.indexOf('</aside>', q0) + '</aside>'.length;
    const qr = q0 >= 0 ? page.slice(q0, q1) + '\n' : '';
    s = s.slice(0, g0) + s.slice(g1).replace(/^\n/, '');
    if (qr && !s.includes('<aside class="qr-card"')) {
      const m = '    <div id="mig-root"></div>\n';
      if (!s.includes(m)) fail('mig-root');
      s = s.replace(m, m + qr);
    }
  }
  // scriptul vechi al jocului separat nu mai are pagină
  s = s.replace(/<script>\n\(function\(\)\{\n  var root = document\.getElementById\('imp-root'\);[\s\S]*?\n<\/script>\n?/, '');

  // 2. navigarea între pagini: trei pagini; #mod-game duce la joc
  rep("var PAGE_IDS = ['page-acasa', 'mod-game', 'mod-migratie', 'mod-atelier'];", "var PAGE_IDS = ['page-acasa', 'mod-migratie', 'mod-atelier'];\n  // adresa veche a jocului „Imperiul lui Attila” (și codul QR) duce la jocul unic\n  var PAGE_ALIAS = { 'mod-game': 'mod-migratie' };");
  rep("    var idx = PAGE_IDS.indexOf((location.hash || '').slice(1));\n    return idx === -1 ? 0 : idx;", "    var h = (location.hash || '').slice(1);\n    var idx = PAGE_IDS.indexOf(PAGE_ALIAS[h] || h);\n    return idx === -1 ? 0 : idx;");
  rep("    var targetId = a.getAttribute('href').slice(1);\n    var idx = PAGE_IDS.indexOf(targetId);", "    var targetId = a.getAttribute('href').slice(1);\n    var idx = PAGE_IDS.indexOf(PAGE_ALIAS[targetId] || targetId);");
  s = s.replace(/\n  <a href="#mod-game"><span class="nav-long">Imperiul lui Attila<\/span><span class="nav-short" aria-hidden="true">Attila<\/span><\/a>/, '');
  rep('<a href="#mod-migratie"><span class="nav-long">Marea Migrație · simulare</span><span class="nav-short" aria-hidden="true">Simulare</span></a>',
      '<a href="#mod-migratie"><span class="nav-long">Jocul: Attila și Marea Migrație</span><span class="nav-short" aria-hidden="true">Jocul</span></a>');

  // 3. antetul paginii jocului
  s = s.replace(/(<header class="mig-head">\n    <div class="jg-wrap">\n      <h1>)[^<]*(<\/h1>\n      <p>)[^<]*(<\/p>)/, '$1' + TITLE + '$2' + SUB + '$3');

  // 4. butoanele din articol
  rep('<a class="hero-btn primary" href="#mod-game">Joacă „Imperiul lui Attila”</a>', '<a class="hero-btn primary" href="#mod-migratie">Joacă „' + TITLE + '”</a>');
  s = s.replace(/\n        <a class="hero-btn" href="#mod-migratie">Marea Migrație în timp real<\/a>/, '');
  rep('<p>Opt momente reale, de la Tratatul de la Margus la Italia: fiecare decizie costă aur, renume, loialitate sau cai. La final afli de ce s-a prăbușit, de fapt, imperiul hunilor.</p>',
      '<p>Un singur joc, în trei acte, pe harta reală a Europei: ești Valens și Stilicho când vin hunii, apoi Attila în opt momente reale (aur, renume, loialitate, cai), apoi Ardaric, după moartea lui. Popoarele se mișcă după deciziile tale.</p>');
  rep('<a class="cta-btn" href="#mod-game">Joacă „Imperiul lui Attila” →</a>', '<a class="cta-btn" href="#mod-migratie">Joacă „' + TITLE + '” →</a>');
  rep('<a class="sim-link" href="#mod-migratie">▶ Vezi Marea Migrație în timp real: simulare în care decizi tu</a>', '<a class="sim-link" href="#mod-migratie">Joacă „' + TITLE + '”: popoarele se mișcă după deciziile tale →</a>');

  rep('Patru pagini: articolul cu note și bibliografie (cu cronologie, atlas, muzeu virtual și mituri verificate), jocul de strategie Imperiul lui Attila, simularea Marii Migrații și Masa istoricului.', 'Trei pagini: articolul cu note și bibliografie (cu cronologie, atlas, muzeu virtual și mituri verificate), jocul „' + TITLE + '” și Masa istoricului.');
  rep('cronologie, muzeu virtual, jocul Imperiul lui Attila, simularea Marii Migrații și Masa istoricului.', 'cronologie, muzeu virtual, jocul „' + TITLE + '” (o simulare în trei acte) și Masa istoricului.');

  // 5. „Despre proiect”
  s = s.replace(/      <li><strong>Imperiul lui Attila<\/strong>:[^\n]*<\/li>\n      <li><strong>Marea Migrație, în timp real<\/strong>:[^\n]*<\/li>/,
    '      <li><strong>' + TITLE + '</strong>: un singur joc, în trei acte, pe harta reală a Europei (370–476), cu peste 1.800 de agenți. Actul I: ești Valens și Stilicho. Actul II: ești Attila, în opt momente reale (435–452), cu aur, renume, loialitate, cavalerie și moștenire; alegerile tale mută hunii pe hartă și schimbă stabilitatea Imperiului. Actul III: ești Ardaric, la Nedao. Terenul e citit din hartă, drumurile sunt calculate cu algoritmul lui Dijkstra, iar la final îți compari lumea cu cea reală.</li>');

  fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
  console.log(rel + ': un singur joc');
}

// pagina separată a simulării și sursa ei: același antet
for (const rel of ['scripturi-build/jocuri/migratie.html', 'module-individuale/simularea-marii-migratii.html']) {
  const f = path.join(root, rel);
  if (!fs.existsSync(f)) continue;
  const raw = fs.readFileSync(f, 'utf8'), crlf = raw.includes('\r\n');
  let s = raw.split('\r\n').join('\n');
  s = s.replace(/(<header class="mig-head">\n    <div class="jg-wrap">\n      <h1>)[^<]*(<\/h1>\n      <p>)[^<]*(<\/p>)/, '$1' + TITLE + '$2' + SUB + '$3');
  s = s.replace(/<title>[^<]*<\/title>/, m => m.includes('Migra') ? '<title>' + TITLE + '</title>' : m);
  fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
  console.log(rel + ': antet');
}

// pagina de tipărit cu codul QR
const qf = path.join(root, 'qr-joc.html');
let q = fs.readFileSync(qf, 'utf8');
q = q.replace('<h1>Imperiul <span>lui Attila</span></h1>', '<h1>Attila <span>și Marea Migrație</span></h1>')
     .replace('Fii tu Attila: un joc de strategie despre huni. Scanează codul și joacă pe telefon.', 'Un joc în trei acte despre huni și Marea Migrație: fii tu Attila. Scanează codul și joacă pe telefon.');
fs.writeFileSync(qf, q);
console.log('qr-joc.html: titlul jocului');
