// Moves the Bibliografie section to be the very last thing on the Acasă
// page (after the "Testează în joc" CTA card, right before the footer),
// and makes the citation list more compact (smaller type, tighter spacing,
// two columns on wider screens) instead of one long single-column list.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const bodyPath = path.join(ROOT, 'build', 'story.body.html');
let body = fs.readFileSync(bodyPath, 'utf8');

const biblioBlock = `  <section id="biblio">
    <div class="chapter-mark"><span class="chapter-num">05</span><span class="chapter-slash">/</span><span class="chapter-tag">Bibliografie</span></div>
    <h2 class="sec-title">Surse și note</h2>
    <ol class="biblio">
      <li id="note-1">Ptolemeu, <em>Geografia</em>, 3.5.10. <a class="back" href="#sec-origini">↩</a></li>
      <li id="note-2">Ammianus Marcellinus, <em>Res Gestae</em>, 31.2.1. <a class="back" href="#sec-origini">↩</a></li>
      <li id="note-3">De Guignes, I, 1756, p. 217; cf. Kiessling, col. 2584–85. <a class="back" href="#sec-origini">↩</a></li>
      <li id="note-4">Bivar, 1983, p. 211 (scrisoarea sogdiană și distrugerea Lo-yangului). <a class="back" href="#sec-origini">↩</a></li>
      <li id="note-5">Spuler, p. 262. <a class="back" href="#sec-origini">↩</a></li>
      <li id="note-6">Priscus, frag. 1; Procopius, <em>Bella</em>, 4.5; Agathias, 5.11. <a class="back" href="#sec-origini">↩</a></li>
      <li id="note-7">Ammianus Marcellinus, <em>Res Gestae</em>, 31.2.2–11 (descrierea etnografică a hunilor). <a class="back" href="#sec-origini">↩</a></li>
      <li id="note-8">Epitetul „Flagellum Dei” nu apare la Priscus sau Jordanes; este o atribuire legendară, ulterioară, consacrată abia în cronici medievale târzii — cf. Maenchen-Helfen, <em>The World of the Huns</em>, 1973. <a class="back" href="#sec-personalitati">↩</a></li>
      <li id="note-9">Caracterizare modernă, consacrată de Edward Gibbon, <em>The History of the Decline and Fall of the Roman Empire</em>. <a class="back" href="#sec-personalitati">↩</a></li>
      <li id="note-10">Jordanes, <em>Getica</em>, 36 (componența celor două tabere la Câmpiile Catalaunice). <a class="back" href="#sec-personalitati">↩</a></li>
      <li id="note-11">Jordanes, <em>Getica</em>, 260–263 (bătălia de la Nedao, 454 d.Hr.). <a class="back" href="#sec-personalitati">↩</a></li>
      <li id="note-12">Jordanes, <em>Getica</em>, 24 (înfrângerea ostrogoților și moartea lui Ermanaric, c. 375 d.Hr.). <a class="back" href="#sec-cronologie">↩</a></li>
      <li id="note-13">Ammianus Marcellinus, <em>Res Gestae</em>, 31.4 (trecerea Dunării de către vizigoți, 376 d.Hr.). <a class="back" href="#sec-migratie">↩</a></li>
      <li id="note-14">Jordanes, <em>Getica</em>, 41–42 (bătălia Câmpiilor Catalaunice, 451 d.Hr.); Priscus, relatarea ambasadei la curtea lui Attila, 448 d.Hr. <a class="back" href="#sec-cronologie">↩</a></li>
      <li id="note-15">Procopius, <em>Bellum Vandalicum</em> (traversarea Rinului de vandali, 406 d.Hr., și cucerirea Africii de Nord). <a class="back" href="#sec-migratie">↩</a></li>
      <li id="note-16">Heather, P., <em>The Fall of the Roman Empire</em>, 2005 — sinteză modernă asupra Marii Migrații și a presiunii hunice asupra granițelor romane. <a class="back" href="#sec-migratie">↩</a></li>
    </ol>
  </section>

  <div class="cta-card">
    <div>
      <p class="kicker">Componenta interactivă</p>
      <h3>Testează aceste fapte în joc</h3>
      <p>Aceleași surse și evenimente, sub forma unei campanii interactive cu hartă de cucerire, mize și insigne pe patru tărâmuri istorice.</p>
    </div>
    <a class="cta-btn" href="https://claude.ai/artifact/6BMhTxhCqp6WtcV1kkd5rZ" target="_blank" rel="noopener">Deschide Campania Hunilor →</a>
  </div>`;

const ctaFirstThenBiblio = `  <div class="cta-card">
    <div>
      <p class="kicker">Componenta interactivă</p>
      <h3>Testează aceste fapte în joc</h3>
      <p>Aceleași surse și evenimente, sub forma unei campanii interactive cu hartă de cucerire, mize și insigne pe patru tărâmuri istorice.</p>
    </div>
    <a class="cta-btn" href="https://claude.ai/artifact/6BMhTxhCqp6WtcV1kkd5rZ" target="_blank" rel="noopener">Deschide Campania Hunilor →</a>
  </div>

  <section id="biblio">
    <div class="chapter-mark"><span class="chapter-num">05</span><span class="chapter-slash">/</span><span class="chapter-tag">Bibliografie</span></div>
    <h2 class="sec-title">Surse și note</h2>
    <ol class="biblio">
      <li id="note-1">Ptolemeu, <em>Geografia</em>, 3.5.10. <a class="back" href="#sec-origini">↩</a></li>
      <li id="note-2">Ammianus Marcellinus, <em>Res Gestae</em>, 31.2.1. <a class="back" href="#sec-origini">↩</a></li>
      <li id="note-3">De Guignes, I, 1756, p. 217; cf. Kiessling, col. 2584–85. <a class="back" href="#sec-origini">↩</a></li>
      <li id="note-4">Bivar, 1983, p. 211 (scrisoarea sogdiană și distrugerea Lo-yangului). <a class="back" href="#sec-origini">↩</a></li>
      <li id="note-5">Spuler, p. 262. <a class="back" href="#sec-origini">↩</a></li>
      <li id="note-6">Priscus, frag. 1; Procopius, <em>Bella</em>, 4.5; Agathias, 5.11. <a class="back" href="#sec-origini">↩</a></li>
      <li id="note-7">Ammianus Marcellinus, <em>Res Gestae</em>, 31.2.2–11 (descrierea etnografică a hunilor). <a class="back" href="#sec-origini">↩</a></li>
      <li id="note-8">Epitetul „Flagellum Dei” nu apare la Priscus sau Jordanes; este o atribuire legendară, ulterioară, consacrată abia în cronici medievale târzii — cf. Maenchen-Helfen, <em>The World of the Huns</em>, 1973. <a class="back" href="#sec-personalitati">↩</a></li>
      <li id="note-9">Caracterizare modernă, consacrată de Edward Gibbon, <em>The History of the Decline and Fall of the Roman Empire</em>. <a class="back" href="#sec-personalitati">↩</a></li>
      <li id="note-10">Jordanes, <em>Getica</em>, 36 (componența celor două tabere la Câmpiile Catalaunice). <a class="back" href="#sec-personalitati">↩</a></li>
      <li id="note-11">Jordanes, <em>Getica</em>, 260–263 (bătălia de la Nedao, 454 d.Hr.). <a class="back" href="#sec-personalitati">↩</a></li>
      <li id="note-12">Jordanes, <em>Getica</em>, 24 (înfrângerea ostrogoților și moartea lui Ermanaric, c. 375 d.Hr.). <a class="back" href="#sec-cronologie">↩</a></li>
      <li id="note-13">Ammianus Marcellinus, <em>Res Gestae</em>, 31.4 (trecerea Dunării de către vizigoți, 376 d.Hr.). <a class="back" href="#sec-migratie">↩</a></li>
      <li id="note-14">Jordanes, <em>Getica</em>, 41–42 (bătălia Câmpiilor Catalaunice, 451 d.Hr.); Priscus, relatarea ambasadei la curtea lui Attila, 448 d.Hr. <a class="back" href="#sec-cronologie">↩</a></li>
      <li id="note-15">Procopius, <em>Bellum Vandalicum</em> (traversarea Rinului de vandali, 406 d.Hr., și cucerirea Africii de Nord). <a class="back" href="#sec-migratie">↩</a></li>
      <li id="note-16">Heather, P., <em>The Fall of the Roman Empire</em>, 2005 — sinteză modernă asupra Marii Migrații și a presiunii hunice asupra granițelor romane. <a class="back" href="#sec-migratie">↩</a></li>
    </ol>
  </section>`;

if (!body.includes(biblioBlock)) {
  console.error('ORIGINAL BIBLIO+CTA BLOCK NOT FOUND — aborting, file left unchanged.');
  process.exit(1);
}
body = body.replace(biblioBlock, ctaFirstThenBiblio);
fs.writeFileSync(bodyPath, body);
console.log('reordered biblio to last, wrote', bodyPath);

// ---------- css: compact the list ----------
const cssPath = path.join(ROOT, 'build', 'story.css');
let css = fs.readFileSync(cssPath, 'utf8');

const oldCss = `  .biblio{ list-style: none; margin: 0; padding: 0; counter-reset: bib; }
  .biblio li{
    counter-increment: bib; display: grid; grid-template-columns: 28px 1fr; gap: 10px; padding: 11px 0;
    border-bottom: 1px solid var(--line); font-size: 0.94rem; line-height: 1.55; scroll-margin-top: 20px;
  }
  .biblio li:last-child{ border-bottom: none; }
  .biblio li::before{ content: counter(bib); font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--accent-2); }
  .biblio a.back{ font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; margin-left: 6px; text-decoration: none; }`;

const newCss = `  .biblio{ list-style: none; margin: 0; padding: 0; counter-reset: bib; column-count: 1; }
  @media (min-width: 640px){ .biblio{ column-count: 2; column-gap: 28px; } }
  .biblio li{
    counter-increment: bib; display: grid; grid-template-columns: 20px 1fr; gap: 7px; padding: 6px 0;
    border-bottom: 1px solid var(--line); font-size: 0.78rem; line-height: 1.4; scroll-margin-top: 20px;
    break-inside: avoid;
  }
  .biblio li:last-child{ border-bottom: none; }
  .biblio li::before{ content: counter(bib); font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 0.72rem; color: var(--accent-2); }
  .biblio a.back{ font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; margin-left: 4px; text-decoration: none; }`;

if (!css.includes(oldCss)) {
  console.error('OLD BIBLIO CSS NOT FOUND — aborting, file left unchanged.');
  process.exit(1);
}
css = css.replace(oldCss, newCss);
fs.writeFileSync(cssPath, css);
console.log('compacted biblio CSS, wrote', cssPath);
