// Integrates the two historical maps the user added to imagini/ (converted
// to JPEG in imagini/muzeu/): the overview "Invasions of the Roman Empire"
// map (MapMaster, 2006, CC BY-SA 2.5) goes into the Marea Migrație section as
// a static complement to the existing interactive arrow-map, with expanded
// text on the domino mechanism and the three Hun attack axes. The "Attila in
// Gaul 451 CE" map (MapMaster, 2006, CC BY-SA 3.0/GFDL) goes into the
// Personalități section, right after the Attila/Aetius duel, as a dedicated
// subsection on the Gaul campaign.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const BODY = path.join(ROOT, 'build', 'story.body.html');
const CSS = path.join(ROOT, 'build', 'story.css');

function b64(file){
  return 'data:image/jpeg;base64,' + fs.readFileSync(path.join(ROOT, 'imagini', 'muzeu', file)).toString('base64');
}

let h = fs.readFileSync(BODY, 'utf8');

function rep(a, b, label){
  if (!h.includes(a)) { console.error('NOT FOUND: ' + label); process.exit(1); }
  h = h.replace(a, b);
  console.log('  ok: ' + label);
}

// ---------- 1. Marea Migrație: domino-effect figure + expanded text ----------
rep(
  '<p class="lede">Șocul de la 375 nu s-a oprit la alani și ostrogoți. Popoarele împinse de huni s-au izbit unele de altele și, în cele din urmă, de granițele Romei — un efect de domino pe care o parte a istoriografiei moderne îl numește Marea Migrație a Popoarelor<sup class="fn" data-n="16">16</sup>. Explicația nu e însă unanimă: istorici precum Guy Halsall și Walter Goffart o contestă, argumentând că slăbiciunile interne ale Imperiului au contat cel puțin la fel de mult ca presiunea venită din stepă.</p>',
  '<p class="lede">Șocul de la 375 nu s-a oprit la alani și ostrogoți. Popoarele împinse de huni s-au izbit unele de altele și, în cele din urmă, de granițele Romei — un efect de domino pe care o parte a istoriografiei moderne îl numește Marea Migrație a Popoarelor<sup class="fn" data-n="16">16</sup>. Explicația nu e însă unanimă: istorici precum Guy Halsall și Walter Goffart o contestă, argumentând că slăbiciunile interne ale Imperiului au contat cel puțin la fel de mult ca presiunea venită din stepă.</p>\n\n      <h3 class="sub-title">Mecanismul efectului de domino</h3>\n      <p>Presiunea nu venea dintr-un singur punct, ci din trei direcții succesive ale expansiunii hunice înseși:</p>\n      <ol class="domino-list">\n        <li><b>Spre Bazinul Carpatic</b> — hunii nu doar împing popoare, ci se și așază: din anii 420–430, centrul lor de putere se mută în Câmpia Panonică, la nord de Dunăre, de unde controlează un areal ce înglobează foste teritorii germanice și sarmatice.</li>\n        <li><b>Spre Balcani, împotriva Răsăritului</b> — campaniile din 441–447 lovesc direct Imperiul Roman de Răsărit, devastând provinciile dunărene până aproape de zidurile Constantinopolului și impunând tributul care avea să ajungă la 2.100 de livre de aur.</li>\n        <li><b>Spre Apus, în 451–452</b> — marea campanie a lui Attila în Galia (oprită la Câmpiile Catalaunice) și invazia Italiei din anul următor, ultimele două lovituri directe date de huni Imperiului, înainte de prăbușirea rapidă a hegemoniei lor.</li>\n      </ol>\n\n      <figure class="fig-map">\n        <img src="' + b64('invasions-final.jpg') + '" alt="Hartă a invaziilor Imperiului Roman între 100 și 500 d.Hr., cu rutele goților, hunilor, vandalilor, vizigoților, ostrogoților, francilor și ale popoarelor anglo-saxone." loading="lazy">\n        <figcaption><b>Invaziile Imperiului Roman, 100–500 d.Hr.</b> Săgeata verde arată drumul hunilor înșiși — din stepă spre capitala lor din Câmpia Panonică, apoi spre Adrianopol (378) și Chalons (451). Săgețile mov și roz sunt vizigoții și ostrogoții, împinși dinaintea hunilor; albastru sunt vandalii, ajunși până la Cartagina. Hartă: MapMaster, 2006, CC BY-SA 2.5, Wikimedia Commons.</figcaption>\n      </figure>',
  'Marea Migrație — figură nouă + text extins'
);

// Nuance the "just as abruptly" line in the duel section, consistent with
// the same fix already applied to Campania V's lore.
rep(
  'Un an mai târziu, moartea lui Attila (453) și bătălia de la Nedao (454) — în care popoarele subjugate se răscoală și destramă imperiul hun — pun capăt aventurii hunice în Europa la fel de brusc cum începuse<sup class="fn" data-n="11">11</sup>.',
  'Un an mai târziu, moartea lui Attila (453) și bătălia de la Nedao (c. 454) — în care popoarele subjugate se răscoală și destramă hegemonia hunică — pun capăt apogeului puterii hunice în Europa, deși nu instantaneu: Dengizich, un alt fiu al lui Attila, mai luptă cu Bizanțul până în 469<sup class="fn" data-n="11">11</sup>.',
  'nuanțare „la fel de brusc” din secțiunea Personalități'
);

// ---------- 2. Personalități: Attila in Gaul map, right after the duel ----------
rep(
  '<p>Ironia istorică e completă: la Câmpiile Catalaunice, ostrogoții — vasali ai lui Attila — au luptat de partea hunilor, în timp ce vizigoții, cei dintâi fugari din calea acestora, s-au aliat cu Roma pentru a-i opri<sup class="fn" data-n="10">10</sup>.',
  '<figure class="fig-map">\n        <img src="' + b64('attila-gaul-final.jpg') + '" alt="Hartă a campaniei lui Attila în Galia, 451 d.Hr., cu orașele jefuite (Strasbourg, Worms, Mainz, Trier, Metz, Reims, Cologne, Tournai, Cambrai, Amiens), orașele doar amenințate (Paris, Troyes) și contraofensiva romano-vizigotă spre Orléans și Chalons." loading="lazy">\n        <figcaption><b>Campania lui Attila în Galia, 451 d.Hr.</b> Săgețile negre urmăresc traseul hunilor și al aliaților lor: trec Rinul și jefuiesc pe rând Strasbourg, Worms, Mainz, Trier, Metz și Reims, apoi Cologne, Tournai, Cambrai și Amiens, înaintând spre Orléans — asediat, dar nu cucerit. Paris și Troyes apar drept „amenințate”, nu „jefuite”: legenda locală atribuie salvarea Parisului rugăciunilor Sfintei Geneviève, dar motivul real a fost probabil strategic. Săgeata gri arată contraofensiva coaliției romano-vizigote condusă de Flavius Aetius și regele Theodoric I, care ridică asediul Orléans-ului și împinge hunii înapoi, spre bătălia decisivă de la Chalons (Câmpiile Catalaunice). Hartă: MapMaster, 2006, CC BY-SA 3.0 / GFDL, Wikimedia Commons.</figcaption>\n      </figure>\n\n      <p>Ironia istorică e completă: la Câmpiile Catalaunice, ostrogoții — vasali ai lui Attila — au luptat de partea hunilor, în timp ce vizigoții, cei dintâi fugari din calea acestora, s-au aliat cu Roma pentru a-i opri<sup class="fn" data-n="10">10</sup>.',
  'Personalități — harta Attila in Gaul'
);

fs.writeFileSync(BODY, h);

// ---------- 3. CSS for the new <figure class="fig-map"> ----------
let css = fs.readFileSync(CSS, 'utf8');
const cssAnchor = '  .further-reading{';
if (!css.includes(cssAnchor)) { console.error('CSS anchor not found'); process.exit(1); }
const figCss = `  .fig-map{ margin: 28px 0; }
  .fig-map img{ width: 100%; height: auto; display: block; border: 1px solid var(--line-strong); border-radius: 2px; background: #f4ead4; }
  .fig-map figcaption{
    font-family: 'JetBrains Mono', monospace; font-size: 0.74rem; line-height: 1.65; color: var(--ink-dim);
    margin-top: 10px;
  }
  .fig-map figcaption b{ color: var(--ink); font-weight: 700; }
  .domino-list{ margin: 0 0 18px; padding-left: 22px; }
  .domino-list li{ margin-bottom: 10px; line-height: 1.6; }
`;
css = css.replace(cssAnchor, figCss + cssAnchor);
fs.writeFileSync(CSS, css);

console.log('story.css: stiluri pentru figuri adaugate');
