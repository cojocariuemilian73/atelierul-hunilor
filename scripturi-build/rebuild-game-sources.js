// Campania Hunilor: fiecare răspuns afișează un rând separat „Sursa: …”, cu izvorul
// sau lucrarea pe care se sprijină întrebarea. Patch direct pe paginile construite.
const fs = require('fs'), path = require('path');
// cheie = începutul textului întrebării (unic)
const SRC = [
  ['Cine i-a menționat primul, în literatura antică', 'Ptolemeu, Geografia 3.5.10'],
  ['Între ce popoare îi plasează Ptolemeu', 'Ptolemeu, Geografia 3.5.10'],
  ['Cum se raportează descrierea lui Ammianus', 'Ammianus Marcellinus, Res Gestae 31.2.1; Ptolemeu, Geografia 3.5.10'],
  ['Ce eveniment din 311 d.Hr.', 'scrisoarea sogdiană (c. 313), după A. D. H. Bivar, The Cambridge History of Iran III/1 (1983)'],
  ['Cine a sugerat pentru prima dată, în secolul XVIII', 'J. De Guignes, Histoire générale des Huns (1756)'],
  ['Unde se află astăzi dezbaterea Xiongnu–huni', 'Maróti et al., Current Biology 32 (2022); Neparáczki et al., Scientific Reports 9 (2019)'],
  ['Ce popor iranian-sarmatic', 'Ammianus Marcellinus, Res Gestae 31.3.1'],
  ['Ammianus Marcellinus afirmă', 'Ammianus Marcellinus, Res Gestae 31.2.1'],
  ['Ce au în comun sursele bizantine', 'Priscus, fr. 1; Procopius, Bella 4.5; Agathias 5.11'],
  ['Cât ajunsese tributul anual', 'Priscus din Panium, fragmentele despre tratatele cu Constantinopolul'],
  ['Cum s-a folosit generalul roman Flavius Aetius', 'Philostorgius, Historia Ecclesiastica 12.14; Prosper Tiro, Epitoma chronicon'],
  ['Care afirmație descrie corect folosirea hunilor', 'Ambrozie din Milano, scrisorile către Valentinian al II-lea; Zosimus, Historia Nova 5.22'],
  ['Care a fost rezultatul real al bătăliei', 'Iordanes, Getica 36–41'],
  ['Ce arată moartea regelui hunic Uptar', 'Socrates Scholasticus, Historia Ecclesiastica VII.30'],
  ['Ce schimbare în compoziția armatei hunice', 'R. P. Lindner, „Nomadism, Horses and Huns”, Past & Present 92 (1981)'],
  ['În ce an, aproximativ, l-a menționat Ptolemeu', 'Ptolemeu, Geografia'],
  ['În ce an a fost distrus orașul chinez Luoyang', 'scrisoarea sogdiană (c. 313), după A. D. H. Bivar (1983)'],
  ['În jurul cărui an zdrobesc hunii regatul', 'Ammianus Marcellinus, Res Gestae 31.3.1–2'],
  ['În ce an a avut loc bătălia de la Câmpiile Catalaunice', 'Iordanes, Getica 36–41']
];
const CSS = '\n  .m-game .fb-src{ display: block; margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(212,175,55,0.35); font-family: \'JetBrains Mono\', monospace; font-size: 0.72rem; line-height: 1.55; color: #e5c158; letter-spacing: 0.02em; }\n  .m-game .fb-src:empty{ display: none; }\n';
for (const f of ['index.html', 'atelierul-hunilor.html']) {
  const p = path.join(__dirname, '..', f);
  let s = fs.readFileSync(p, 'utf8').split('\r\n').join('\n');
  if (s.includes('id="fb-src"')) { console.error(f + ': already applied'); process.exit(1); }
  const rep = (a, b, w) => { if (!s.includes(a)) { console.error(f + ': not found ' + w); process.exit(1); } s = s.replace(a, b); };
  for (const [key, src] of SRC) {
    const i = s.indexOf('q: "' + key);
    if (i === -1) { console.error(f + ': question not found: ' + key); process.exit(1); }
    const fb = s.indexOf('fb: "', i), end = s.indexOf('"', fb + 5);
    s = s.slice(0, end + 1) + ',\n          src: ' + JSON.stringify(src) + s.slice(end + 1);
  }
  rep('        <span id="fb-text"></span>\n', '        <span id="fb-text"></span>\n        <span class="fb-src" id="fb-src"></span>\n', 'fb html');
  rep('      <span id="yr-fb"></span>\n', '      <span id="yr-fb"></span>\n      <span class="fb-src" id="yr-src"></span>\n', 'yr html');
  rep("  var fbText = document.getElementById('fb-text');", "  var fbText = document.getElementById('fb-text');\n  var fbSrc = document.getElementById('fb-src');", 'fb var');
  rep("    fbText.textContent = q.fb + coinMsg;", "    fbText.textContent = q.fb + coinMsg;\n    fbSrc.textContent = q.src ? 'Sursa: ' + q.src : '';", 'fb set');
  rep("  var yrFb = document.getElementById('yr-fb');", "  var yrFb = document.getElementById('yr-fb');\n  var yrSrc = document.getElementById('yr-src');", 'yr var');
  rep("tq.unit + '. ' + tq.fb;", "tq.unit + '. ' + tq.fb;\n    yrSrc.textContent = tq.src ? 'Sursa: ' + tq.src : '';", 'yr set');
  const marker = '  /* ============ MODULE: CAMPANIA HUNILOR (.m-game) ============ */';
  rep(marker, CSS + marker, 'css');
  fs.writeFileSync(p, s);
  console.log(f + ': ' + SRC.length + ' surse');
}
