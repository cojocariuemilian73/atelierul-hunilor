// 1) Notele de subsol sunt renumerotate în ordinea în care apar în text
//    (înainte, în Ecoul din spațiul carpato-danubiano-pontic sărea de la 19 la 22
//    și apoi la 21).
// 2) Bibliografia devine o bibliografie academică: note, izvoare antice cu
//    edițiile folosite, literatură modernă cu locul și anul apariției.
// Patch direct pe paginile construite.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
function fail(f, w){ console.error(f + ': not found: ' + w); process.exit(1); }

const REFS_HTML = `
    <h3 class="sub-title">Izvoare antice și ediții folosite</h3>
    <ul class="refs">
      <li><b>Agathias</b>, <em>Historiae</em>, ed. R. Keydell, Corpus Fontium Historiae Byzantinae 2, Berlin, 1967.</li>
      <li><b>Ammianus Marcellinus</b>, <em>Res Gestae</em> (<em>Rerum gestarum libri XXXI</em>), ed. și trad. engl. J. C. Rolfe, 3 vol., Loeb Classical Library, Cambridge (Mass.) – Londra, 1935–1940.</li>
      <li><b>Ieronim</b>, <em>Epistulae</em>, ed. I. Hilberg, Corpus Scriptorum Ecclesiasticorum Latinorum 54–56, Viena, 1910–1918.</li>
      <li><b>Iordanes</b>, <em>Getica</em> (<em>De origine actibusque Getarum</em>), ed. Th. Mommsen, Monumenta Germaniae Historica, Auctores Antiquissimi 5.1, Berlin, 1882; trad. engl. C. C. Mierow, <em>The Gothic History of Jordanes</em>, Princeton, 1915.</li>
      <li><b>Priscus din Panium</b>, fragmentele, în R. C. Blockley, <em>The Fragmentary Classicising Historians of the Later Roman Empire</em>, II, Liverpool, 1983.</li>
      <li><b>Procopius din Cezareea</b>, <em>History of the Wars</em>, ed. și trad. engl. H. B. Dewing, Loeb Classical Library, Londra – Cambridge (Mass.), 1914–1928.</li>
      <li><b>Prosper Tiro</b>, <em>Epitoma chronicon</em>, ed. Th. Mommsen, Monumenta Germaniae Historica, Auctores Antiquissimi 9 (<em>Chronica minora</em> I), Berlin, 1892.</li>
      <li><b>Ptolemeu</b>, <em>Geographia</em>, ed. C. Müller, Paris, 1883–1901.</li>
      <li><b>Sozomen</b>, <em>Historia Ecclesiastica</em>, ed. J. Bidez și G. C. Hansen, Die Griechischen Christlichen Schriftsteller 50, Berlin, 1960.</li>
    </ul>

    <h3 class="sub-title">Literatură modernă</h3>
    <ul class="refs">
      <li>Bivar, A. D. H., „The History of Eastern Iran”, în E. Yarshater (ed.), <em>The Cambridge History of Iran</em>, III/1, Cambridge University Press, 1983, pp. 181–231.</li>
      <li>De Guignes, J., <em>Histoire générale des Huns, des Turcs, des Mogols et des autres Tartares occidentaux</em>, Paris, 1756–1758 (citat după Maenchen-Helfen).</li>
      <li>Gibbon, E., <em>The History of the Decline and Fall of the Roman Empire</em>, Londra, 1776–1789.</li>
      <li>Goffart, W., <em>Barbarian Tides: The Migration Age and the Later Roman Empire</em>, Philadelphia, University of Pennsylvania Press, 2006.</li>
      <li>Halsall, G., <em>Barbarian Migrations and the Roman West, 376–568</em>, Cambridge University Press, 2007.</li>
      <li>Harhoiu, R., <em>The Treasure from Pietroasa, Romania</em>, Oxford, BAR, 1977.</li>
      <li>Harhoiu, R., <em>Die frühe Völkerwanderungszeit in Rumänien</em>, București, 1997.</li>
      <li>Heather, P., <em>The Fall of the Roman Empire: A New History</em>, Londra, Macmillan, 2005.</li>
      <li>Kiessling, M., „Hunnoi”, în <em>Realencyclopädie der classischen Altertumswissenschaft</em> (Pauly–Wissowa), VIII.2, Stuttgart, col. 2584–2585 (citat după Maenchen-Helfen).</li>
      <li>Maenchen-Helfen, O. J., <em>The World of the Huns: Studies in Their History and Culture</em>, Berkeley – Los Angeles – Londra, University of California Press, 1973.</li>
      <li>Maróti, Z. et al., „The genetic origin of Huns, Avars, and conquering Hungarians”, <em>Current Biology</em>, 32 (13), 2022, pp. 2858–2870.</li>
      <li>Neparáczki, E. et al., „Y-chromosome haplogroups from Hun, Avar and conquering Hungarian period nomadic people of the Carpathian Basin”, <em>Scientific Reports</em>, 9, 2019, art. 16569.</li>
      <li>Spuler, B., <em>Geschichte Mittelasiens</em>, Handbuch der Orientalistik, Leiden, Brill, 1966.</li>
    </ul>
    <p class="refs-note">Abrevieri: <b>BAR</b> — British Archaeological Reports; <b>MGH</b> — Monumenta Germaniae Historica; <b>CSEL</b> — Corpus Scriptorum Ecclesiasticorum Latinorum. Sursele imaginilor și ale hărților sunt indicate sub fiecare imagine și în fereastra „Despre proiect”. Kiessling și De Guignes sunt citați după Maenchen-Helfen, deci ca surse de mâna a doua.</p>
    <p class="further-reading"><b>Lecturi suplimentare</b> (consultate pentru orientare generală, fără a fi citate punctual în text): Kim, H. J., <em>The Huns</em>, Londra – New York, Routledge, 2016; Heather, P., <em>Empires and Barbarians</em>, Londra, Macmillan, 2009.</p>
`;

const CSS = `
  .refs{ list-style: none; margin: 0 0 6px; padding: 0; }
  .refs li{ padding: 0 0 0 1.9em; text-indent: -1.9em; margin: 0 0 9px; font-size: 0.88rem; line-height: 1.55; color: var(--ink-dim); }
  .refs li b{ color: var(--ink); font-weight: 600; }
  .refs-note{ font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; line-height: 1.65; color: var(--ink-dim); margin: 16px 0 0; }
  .refs-note b{ color: var(--ink); }
  #biblio h3.sub-title{ margin-top: 34px; }
`;

function patch(file){
  const p = path.join(ROOT, file);
  let s = fs.readFileSync(p, 'utf8').split('\r\n').join('\n');
  if (s.includes('class="refs"')) { console.error(file + ': already applied'); process.exit(1); }

  // ---- 1. renumber the footnotes by first appearance ----
  const b0 = s.indexOf('<section id="biblio">');
  if (b0 === -1) fail(file, 'biblio section');
  const body = s.slice(0, b0);
  const re = /<sup class="fn" data-n="(\d+)">(\d+)<\/sup>/g;
  const map = {}; let next = 0, m;
  while ((m = re.exec(body))) { if (!(m[1] in map)) map[m[1]] = ++next; }
  let tail = s.slice(b0);
  const newBody = body.replace(re, (all, n) => '<sup class="fn" data-n="' + map[n] + '">' + map[n] + '</sup>');

  // notes
  const olA = tail.indexOf('<ol class="biblio">'), olB = tail.indexOf('</ol>', olA);
  if (olA === -1 || olB === -1) fail(file, 'ol.biblio');
  const notes = {};
  tail.slice(olA, olB).replace(/<li id="note-(\d+)">([\s\S]*?)<\/li>/g, (all, n, html) => { notes[n] = html; return all; });
  const used = Object.keys(map);
  const missing = Object.keys(notes).filter(n => !(n in map));
  if (missing.length) { console.error(file + ': notes never cited: ' + missing.join(',')); process.exit(1); }
  if (used.some(n => !(n in notes))) { console.error(file + ': citations without a note'); process.exit(1); }

  const fixed = Object.assign({}, notes);
  // note 17 (old numbering): correct title + add the 2019 paper
  fixed['17'] = 'Maróti, Z. et al., „The genetic origin of Huns, Avars, and conquering Hungarians”, <em>Current Biology</em>, 32 (13), 2022, pp. 2858–2870; cf. Neparáczki, E. et al., „Y-chromosome haplogroups from Hun, Avar and conquering Hungarian period nomadic people of the Carpathian Basin”, <em>Scientific Reports</em>, 9, 2019, art. 16569. <a class="back" href="#sec-origini">↩</a>';
  // note 13 (old): its first use is in the chronology section
  if (fixed['13']) fixed['13'] = fixed['13'].replace('href="#sec-migratie"', 'href="#sec-cronologie"');

  const ordered = Object.keys(map).sort((a, b) => map[a] - map[b])
    .map(old => '      <li id="note-' + map[old] + '">' + fixed[old].trim() + '</li>').join('\n');
  const ol = '<h3 class="sub-title">Note de subsol</h3>\n    <ol class="biblio">\n' + ordered + '\n    </ol>';

  // replace notes list + old "further reading" paragraph by the new blocks
  const frA = tail.indexOf('<p class="further-reading">', olB);
  const frB = tail.indexOf('</p>', frA) + 4;
  if (frA === -1) fail(file, 'further-reading');
  tail = tail.slice(0, olA) + ol + '\n' + REFS_HTML + tail.slice(frB);

  s = newBody + tail;
  // ---- 2. css ----
  const cssAnchor = '  .biblio a.back{';
  if (!s.includes(cssAnchor)) fail(file, 'biblio css');
  const cEnd = s.indexOf('\n', s.indexOf(cssAnchor)) + 1;
  s = s.slice(0, cEnd) + CSS + s.slice(cEnd);

  fs.writeFileSync(p, s);
  console.log(file + ': note renumerotate (' + used.map(o => o + '→' + map[o]).join(', ') + ')');
}
for (const f of ['index.html', 'atelierul-hunilor.html', 'module-individuale/huni-prezentare.html']) patch(f);
