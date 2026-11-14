// Corecturi pentru pasajele și modulele păstrate din pagina de bază.
const fs = require('node:fs');
const path = require('node:path');
const file = path.join(__dirname, '..', 'atelierul-hunilor.html');
const original = fs.readFileSync(file, 'utf8');
let html = original.replaceAll('\r\n', '\n');

function replace(old, next) {
  if (!(old instanceof RegExp ? old.test(html) : html.includes(old))) throw new Error('Textul de corectat lipsește: ' + String(old).slice(0, 100));
  html = html.replaceAll(old, next);
}

const priscus = 'https://tianmu.org/good-work-library/scythian/greek-and-roman-sources/priscus-fragments-on-attila-and-the-steppe-court';
const ammianus = 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Ammian/31*.html';
const getica = 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Jordanes/Getica/C*.html';
const genetics = 'https://doi.org/10.1073/pnas.2418485122';
const mapCredit = '<a href="https://commons.wikimedia.org/wiki/File:Europe_relief_laea_location_map.jpg">Alexrk2, Wikimedia Commons</a>, <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>';
const catalog = 'https://www.man.es/man/dam/jcr%3A1b23be3c-39f9-458d-8c9b-7c5b61bff713/2022-tar-en-digital-lrv10.pdf';
const apahida = '<a href="https://commons.wikimedia.org/wiki/File:Saddle_fittings_of_a_Gepid_prince_-_Apahida.jpg">Cristian Chirita, montaj James Steakley</a> (decupaj), <a href="https://commons.wikimedia.org/wiki/File:Saddle_fittings_of_a_Gepid_prince_-_Apahida.jpg#GNU_Free_Documentation_License">GFDL 1.2 sau ulterior</a>';
const commons = 'https://commons.wikimedia.org/wiki/File:';
function photo(title, author, version) {
  return '<a href="' + commons + title + '">' + author + '</a>, <a href="https://creativecommons.org/licenses/by-sa/' + version + '/">CC BY-SA ' + version + '</a>';
}
const walls = photo('Theodosian_Walls_of_Constantinople%2C_Istanbul_%2837905571151%29.jpg', 'Carole Raddato', '2.0');
const honoria = photo('Solidus-Honoria-RIC_2022.jpg', 'Classical Numismatic Group', '2.5');
const solid = '<a href="https://commons.wikimedia.org/wiki/File:Solidus_of_Theodosius_II.jpg">Grzegorz Solecki și Arkadiusz Piętak / Muzeul Național din Szczecin</a>, <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0</a>';

replace('Că ar fi același popor e o ipoteză modernă, comodă, dar nedemonstrată. Numele se aseamănă, locurile nu coincid.', 'Asemănarea numelor a dus la ipoteza că ar fi același popor. Identificarea rămâne incertă.');
replace(/<p>Istoriografia rămâne prudentă[^<]*(?:<sup[^>]*>[^<]*<\/sup>[^<]*)+<\/p>/g,
  '<p>Arheologia lasă deschisă întrebarea despre traseul și amploarea deplasărilor spre vest<sup class="fn" data-n="5">5</sup>. În 2025, Gnecchi-Ruscone și colegii au identificat segmente de ADN moștenite în comun între câțiva indivizi din elita Xiongnu și unii indivizi îngropați în Bazinul Carpatic în secolele V–VI<sup class="fn" data-n="6">6</sup>. Eșantioanele din Bazinul Carpatic arată ascendențe diverse. Studiul a identificat câteva legături genealogice cu elita Xiongnu târzie. Originea conducătorilor huni cunoscuți din texte și continuitatea politică rămân întrebări deschise.</p>');
replace('Priscus, Procopius și Agathias spun același lucru. Ținutul alanilor, dintre Marea Azov și Caucaz (nu Asia de Est) era considerat, în istoriografia bizantină, drept adevărata țară de origine a hunilor',
  'Iordanes îi atribuie lui Priscus informația despre o așezare a hunilor dincolo de Meotida (Marea Azov). În secolul al VI-lea, Procopius descrie grupuri hunice în aceeași regiune, iar Agathias consemnează tradiții despre trecerea lor. Pasajele luminează prezența hunilor în regiunea pontică și lasă deschisă problema originii lor mai îndepărtate');
replace('carne înmuiată sub șa', 'carne pe care, după autor, o încălzeau între coapse și spatele calului');
replace(/<p class="source-caution"><b>Atenție la sursă\.<\/b> Ammianus[^<]*(?:<em>[^<]*<\/em>[^<]*)?<\/p>/g,
  '<p class="source-caution"><b>Atenție la sursă.</b> Ammianus nu spune că i-a întâlnit pe huni. Îi descrie prin tipare romane despre popoarele din afara imperiului, așa că detaliile despre hrană și viața călare trebuie citite în acest context. Arheologia oferă alte tipuri de dovezi, cum ar fi piese de arc, cazane și morminte cu echipament de călărie.</p>');
replace('Ammianus Marcellinus notează, ca mare curiozitate, că hunii foloseau și vârfuri de săgeți sculptate din os, pe lângă cele din fier, un detaliu tehnic care i s-a părut demn de menționat unui observator roman obișnuit cu armamentul metalic.',
  'Ammianus Marcellinus descrie săgeți cu vârfuri ascuțite din os, folosite la lupta de la distanță.');
replace('Toate vârfurile de săgeți hunice erau din fier, ca la majoritatea popoarelor stepei.', 'Ce tip de vârf de săgeată descrie Ammianus?');
replace('pe lângă cele de fier: un detaliu care l-a mirat pe Ammianus', 'vârfurile descrise de Ammianus');
replace('Tot ce știm despre huni vine din cinci tipuri de surse. Niciuna nu e completă. Un martor ocular are interesele lui, un rezumat târziu poate păstra surse pierdute, iar un obiect arată ce a existat, dar nu cine l-a folosit.',
  'Tabelul compară câteva exemple de izvoare scrise, descoperiri arheologice și cercetări genetice. Fiecare răspunde la alte întrebări despre huni.');
replace('Neparáczki 2019, Maróti 2022 · 2019–2022', 'Neparáczki 2019, Maróti 2022, Gnecchi-Ruscone 2025');
replace('O populație amestecată: câteva linii est-asiatice într-o masă majoritar locală.', 'Ascendențe diverse și legături genealogice între câțiva indivizi din Bazinul Carpatic și membri ai elitei Xiongnu.');
replace('Eșantioane mici, mai ales din morminte de elită; ADN-ul nu arată identitatea asumată.', 'Eșantioanele descriu indivizii analizați. Identitatea, rangul și continuitatea politică se cercetează și cu alte izvoare.');
replace('Contemporan, dar nu i-a văzut pe huni', 'Contemporan al evenimentelor, fără o întâlnire consemnată');
replace('Ammianus nu i-a văzut niciodată.', 'Ammianus nu spune că i-ar fi întâlnit.');
replace('Hunii trec Volga și îi înfrâng pe alani, între Marea Azov și Caucaz. Alanii supuși vor lupta de acum alături de ei.', 'Ammianus consemnează atacul hunilor asupra alanilor din zona Donului și alianța cu supraviețuitorii. Traseul anterior este reconstituit.');
replace('Vandalii, alanii și suebii trec Rinul și intră în Galia. Mulți istorici leagă plecarea lor de presiunea hunilor, mutați în Câmpia Panonică.', 'Prosper consemnează trecerea Rinului de către vandali și alani. Ieronim amintește mai multe grupuri și devastarea Galiei. Locul trecerii rămâne incert. Centrul puterii hunice se mută în Câmpia Panonică în deceniile următoare.');
replace('Rinul, la Mogontiacum', 'Rinul, lângă Mogontiacum (reconstituire)');
replace("date: 'c. 435', cat: 'aur', short: 'Margus'", "date: 'anii 430', cat: 'aur', short: 'Margus'");
replace('De la Volga până în Galia: harta urmărește traseele de la sosirea hunilor (370) până la jefuirea Romei de către vandali (455).', 'Harta urmărește trasee reconstituite de la expansiunea hunilor (în jur de 370) până la jefuirea Romei de către vandali (455). Ammianus atestă atacul asupra alanilor din zona Donului.');
replace('și traversarea Rinului de către vandali, alani și suebi', 'și trecerea Rinului, consemnată de Prosper pentru vandali și alani');
replace('Pe lângă tributul de stat, prețul se negocia și pentru fiecare prizonier: Onegesius, unul dintre cei mai de încredere oameni ai lui Attila, a cerut 500 de solizi de aur doar pentru răscumpărarea soției și copiilor unui singur cetățean roman capturat: o sumă uriașă pentru o singură familie.',
  'Priscus povestește că Onegesius a eliberat-o pe soția lui Syllus pentru 500 de monede de aur. Copiii ei au fost trimiși împăratului roman ca dar.');
replace('Priscus, relatarea soliei din 449 (<a class=', 'Priscus, fr. 8, partea 10 (Müller) (<a class=');
replace('Priscus, relatarea soliei din 449 (nota 11)', 'Priscus, fr. 8, partea 10 (Müller), nota 11');
replace('răscumpărarea unei singure familii costa 500 de solizi?', 'soția lui Syllus a fost eliberată pentru 500 de monede de aur?');
replace('prețul cerut pentru o singură familie de prizonieri', 'răscumpărarea soției lui Syllus');
replace('Doi ani mai târziu, moartea lui Attila (453) și bătălia de la Nedao (c. 454), în care popoarele subjugate se răscoală și destramă hegemonia hunică, pun capăt apogeului puterii hunice în Europa.',
  'Attila moare în 453. În jurul anului 454, la Nedao, răscoala popoarelor supuse înfrânge fiii lui Attila și destramă hegemonia hunică.');
replace(/<p>O bună parte din aceste evenimente[^<]*(?:<[^>]*>[^<]*)+?<\/p>/g,
  '<p>Campaniile lui Uldin și Attila lovesc cetăți romane de la sud de Dunăre. În 408, Uldin cucerește <em>Castra Martis</em> (Dacia Ripensis), identificată tradițional cu <a href="https://vidin.government.bg/en/kula-municipality">Kula, în Bulgaria</a><sup class="fn" data-n="19">19</sup>. Campaniile din anii 440 lovesc <a href="https://whc.unesco.org/en/tentativelists/6475">Viminacium</a> și <a href="https://narodnimuzejnis.rs/wp-content/uploads/2015/07/katalog-jagodin-mala1.pdf">Naissus (Niš)</a>, ambele în Serbia de azi.</p>');
replace('Urmele materiale sunt la fel de concrete.', 'La nord de Dunăre, descoperirile din România de azi documentează legăturile cu lumea romană și cu elitele epocii hunice.');
replace('atribuite de obicei unei elite germanice (probabil gepide)', 'atribuite unei elite din epoca migrațiilor');
replace('aceleași obiecte de cult și prestigiu ca în Bazinul Carpatic', 'obiecte cunoscute și în alte părți ale Bazinului Carpatic');
replace('este un tezaur gotic', 'a fost atribuit unei elite gotice');
replace('e lucrată pe un miez de bronz acoperit cu foiță de aur și împodobită cu almandine montate <em>à cabochon</em>', 'are o bandă de aur împodobită cu granate roșii');
replace('aceeași practică de elită despre care vorbesc izvoarele', 'o practică documentată și în alte cimitire ale epocii');
replace('și se înscrie într-o serie de circa 25 de diademe asemănătoare, descoperite pe un areal imens, din Kazahstanul de azi până în Europa Centrală', 'și are analogii în stepa eurasiatică și în Europa Centrală');
replace('Diademe asemănătoare (circa 25 cunoscute) au fost găsite de la Kazahstan până în Europa Centrală. Cea de la Volga și cea de la Gherăseni marchează două capete ale aceluiași drum.', 'Diademe cu elemente asemănătoare sunt cunoscute din stepa eurasiatică până în Europa Centrală. Asemănările ajută la compararea tehnicii și a podoabelor de rang.');
replace('aceeași practică de elită ca la Gherăseni', 'un alt exemplu al practicii documentate la Gherăseni');

function note(id, content, section) {
  replace(new RegExp('<li id="note-' + id + '">[^\\n]+?</li>', 'g'),
    '<li id="note-' + id + '">' + content + ' <a class="back" href="#sec-' + section + '">↩</a></li>');
}
note(4, 'Scrisoarea sogdiană nr. II, <a href="https://depts.washington.edu/silkroad/texts/sogdlet.html">trad. Nicholas Sims-Williams</a> (menționează devastarea orașului Luoyang).', 'origini');
note(6, '<a href="' + genetics + '">Gnecchi-Ruscone și colab., <em>PNAS</em> 122 (9), 2025, e2418485122</a> (legăturile genealogice și limitele eșantioanelor). Studii anterioare: <a href="https://pubmed.ncbi.nlm.nih.gov/35617951/">Maróti și colab., 2022, pp. 2858–2870</a> și <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6851379/">Neparáczki și colab., 2019, art. 16569</a> (linii paterne).', 'origini');
note(7, '<a href="https://topostext.org/work/744">Iordanes, <em>Getica</em> §123</a> (informație atribuită lui Priscus); <a href="https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Procopius/Wars/8A*.html">Procopius, <em>Războaiele</em> VIII.4–5</a> (grupuri hunice lângă Meotida); Agathias, <em>Istorii</em> V.11.1–4 (tradiția trecerii Meotidei).', 'origini');
note(8, '<a href="' + ammianus + '">Ammianus Marcellinus, <em>Res Gestae</em> 31.2.3</a> (carnea) și 31.2.9 (vârfurile de os).', 'origini');
note(11, 'Solia din 449: <a href="' + priscus + '">Priscus, fr. 8</a>, în special părțile 9–10 (ospățul și răscumpărarea), numerotarea Müller. Bătălia din 451: <a href="' + getica + '">Iordanes, <em>Getica</em> §§197–218</a>.', 'cronologie');
note(12, 'P. Heather, <em>The Fall of the Roman Empire</em>, cap. 4–5 (efectul presiunii hunice asupra goților și migrațiile spre Imperiu); G. Halsall, <em>Barbarian Migrations and the Roman West</em>, cap. 6, în special secțiunea „The Hunnic storm”, p. 170 și urm. (contextul roman și hunic); W. Goffart, <em>Barbarian Tides</em>, cap. 5, „The Great Rhine Crossing, A.D. 400–420” (trecerea Rinului în contextul mai larg al migrațiilor).', 'migratie');
note(14, '<a href="https://www.degruyterbrill.com/document/doi/10.1515/9783111507958-009/pdf">Prosper, <em>Epitoma chronicon</em> §1230</a> (trecerea Rinului); <a href="https://www.newadvent.org/fathers/3001123.htm">Ieronim, <em>Epistula</em> 123.15–16</a> (devastarea Galiei, inclusiv Mainz). În <a href="https://www.ccel.org/g/gibbon/decline/volume1/chap30.htm">cap. 30 din <em>Decline and Fall</em></a>, Gibbon prezintă înghețul ca ipoteză.', 'migratie');
note(17, '<a href="' + getica + '">Iordanes, <em>Getica</em> §§191, 195, 197–200 și 209–210</a> (componența taberelor, pozițiile și participarea goților la luptă).', 'personalitati');
note(18, 'Iordanes, <em>Getica</em> §§260–263 (Nedao, c. 454); Marcellinus Comes, <em>Chronicon</em>, anul 469 (moartea lui Dengizich).', 'personalitati');
note(19, '<a href="https://www.newadvent.org/fathers/26029.htm">Sozomen, <em>Historia Ecclesiastica</em> IX.5</a> (ocuparea cetății și incursiunea în Tracia). Pentru anul 408, O. Maenchen-Helfen, <em>The World of the Huns</em>, 1973, p. 64.', 'personalitati');
note(20, '<a href="https://mnm.hu/en/en/collection/department-archaeology/migration-period-collection">Muzeul Național Maghiar, colecția epocii migrațiilor</a>; R. Harhoiu, <a href="https://biblioteca-digitala.ro/reviste/dacia/37_dacia_revue-archeologie-historie-ancienne_SN_XXXVII_1993_228.pdf">„Die Medaillone aus dem Schatzfund von Şimleul Silvaniei”, <em>Dacia</em> 37, 1993, pp. 221, 232</a>; Harhoiu, <em>Die frühe Völkerwanderungszeit in Rumänien</em>, pp. 158–160 (trimitere din catalogul de la Madrid, p. 712); M. Martin, „Die 24 Scheiben”, în <a href="https://archiv.ub.uni-heidelberg.de/propylaeumdok/3604/1/Martin_24_Scheiben_1999.pdf"><em>Barbarenschmuck und Römergold</em>, 1999</a> (componența celor două descoperiri).', 'personalitati');
note(21, 'R. Harhoiu, <em>Die frühe Völkerwanderungszeit in Rumänien</em>, Editura Enciclopedică, București, 1997, pp. 168, 173, 178 (cazane; trimiteri date de autor în <a href="https://biblioteca-digitala.ro/reviste/mca/Materiale-Cercetari-Arheologice_SN-IV_2008-04_Harhoiu-Lower-Danube.pdf">studiul din 2008, nota 32</a>). Vezi și Zs. Masek, <a href="https://files01.core.ac.uk/download/pdf/85132024.pdf">„A Fresh Look at Hunnic Cauldrons”</a>, repertoriul pentru România.', 'personalitati');
note(22, 'R. Harhoiu, <a href="https://www.barpublishing.com/book/the-fifth-century-a.d.-treasure-from-pietroasa-romania-in-the-light-of-recent-research/"><em>The Fifth Century A.D. Treasure from Pietroasa, Romania, in the Light of Recent Research</em></a>, BAR Supplementary Series 24, Oxford, 1977. Vezi și <a href="' + catalog + '"><em>Archaeological Treasures of Romania</em>, pp. 702–704</a>, pentru compoziția tezaurului și discuția atribuirii.', 'personalitati');
note(23, '<a href="' + catalog + '#page=701"><em>Archaeological Treasures of Romania: Dacian and Roman Roots</em>, Madrid, 2022, p. 701</a> (diadema MJBZ 42263; bibliografia fișei trimite la Harhoiu, pp. 57–59, 176, pl. LXXVII/B1–4).', 'personalitati');
replace('<li>Maróti, Z. et al.,', '<li>Gnecchi-Ruscone, G. A., Rácz, Z. et al., <a href="' + genetics + '">„Ancient genomes reveal trans-Eurasian connections between the European Huns and the Xiongnu Empire”</a>, <em>Proceedings of the National Academy of Sciences</em>, 122 (9), 2025, e2418485122.</li>\n      <li>Maróti, Z. et al.,');

replace('Monedă de aur originală · 408–450', 'Monedă de aur originală · 441–450');
replace('</b> (408–450), moneda în care se plătea tributul. CC0.', '</b> (441–450; domnia: 408–450), inv. MNS/A/22212. Foto: ' + solid + '.');
replace('Solid de aur bătut pentru împăratul Teodosie al II-lea, contemporanul lui Attila. În astfel de monede s-a plătit tributul către huni.',
  'Piesa a fost bătută în anii 441–450, în timpul domniei lui Teodosie al II-lea (408–450). Romanii foloseau astfel de monede pentru plăți în aur.');
replace('"Muzeul Național din Szczecin, Polonia (inv. MNS/A/22212) · foto CC0, Wikimedia Commons"', JSON.stringify('Inv. MNS/A/22212 · foto: ' + solid));
replace('"Muzeul Național de Istorie a României · foto CC BY-SA 4.0, Wikimedia Commons"', JSON.stringify('Muzeul Național de Istorie a României · foto: ' + apahida));
replace('foto J. Steakley, GFDL', apahida);
replace('Foto: Carole Raddato, CC BY-SA 2.0.', 'Foto: ' + walls + '.');
replace('CNG, CC BY-SA 2.5), aplicele', honoria + '), aplicele');
replace(/"Muzeul Arheologic din Cracovia · foto Silar, CC BY-SA 4\.0, Wikimedia Commons"(?=,\n      "alt": "Reconstituirea)/g,
  JSON.stringify('Muzeul Arheologic din Cracovia · foto: ' + photo('02019_0565_Reflexbogen%2C_F%C3%BCrsten-Grab_von_Jakuszowice.jpg', 'Silar', '4.0') + ' (decupaj)'));
replace('"Muzeul Arheologic din Cracovia · foto Silar, CC BY-SA 4.0, Wikimedia Commons"',
  JSON.stringify('Muzeul Arheologic din Cracovia · foto: ' + photo('02019_0555_%282%29_Die_Spatha%2C_F%C3%BCrsten-Grab_von_Jakuszowice.jpg', 'Silar', '4.0')));
replace('"Slezské zemské muzeum, Opava · foto Karel Frydrýšek (Fry72), CC BY-SA 4.0, Wikimedia Commons"',
  JSON.stringify('Slezské zemské muzeum, Opava · foto: ' + photo('Hunsk%C3%A9_kotle,_Slezsk%C3%A9_zemsk%C3%A9_muzeum,_Opava,_Moravskoslezsk%C3%BD_kraj_01.jpg', 'Karel Frydrýšek (Fry72)', '4.0') + ' (decupaj)'));
replace('"Ermitajul de Stat, Sankt Petersburg · foto Netelo, CC BY-SA 4.0, Wikimedia Commons"',
  JSON.stringify('Ermitajul de Stat, Sankt Petersburg · foto: ' + photo('Hermitage_hall_033_-_02.jpg', 'Netelo', '4.0')));
replace('Opt artefacte din epoca hunilor, în fotografii reale din colecții muzeale.', 'Opt fișe despre epoca hunilor, cu fotografii ale pieselor din colecții muzeale și ale unui arc reconstituit.');
replace('Alexrk2, Wikimedia Commons, CC BY-SA 3.0', mapCredit);
replace('artefacte hunice reale, explorabile pe fotografie (capitolul 06), și opt mituri despre huni, verificate cu izvoarele și genetica, și șapte fapte puțin cunoscute („Știai că…?”), la sfârșitul capitolelor de care țin.',
  'fotografii de obiecte și o reconstituire de arc (capitolul 06), șapte mituri despre huni și șapte casete „Știai că…?”.');
replace('Fotografiile de artefact</strong> din Muzeu sunt documente reale: piese din colecții publice, cu muzeul, locul descoperirii, autorul fotografiei și licența afișate sub fiecare imagine (Wikimedia Commons, CC BY-SA sau CC0).',
  'Fotografiile din Muzeu</strong> prezintă piese din colecții publice și o reconstituire de arc. Creditele sunt sub fiecare fișă.');
replace('iar totul e combinat într-un singur fișier', 'iar modulele sunt reunite în pagina HTML');
replace(/<p><strong>Precizare:<\/strong> proiectul are un pas de build[^]*?<\/p>/g,
  '<p>Varianta autonomă, <code>atelierul-hunilor.html</code>, include codul și imaginile și se deschide direct în browser. Versiunea publicată, <code>index.html</code>, încarcă imaginile din <code>media/</code>. Ambele încarcă foaia de stil Google Fonts când conexiunea o permite și au fonturi de rezervă. <a href="https://github.com/cojocariuemilian73/atelierul-hunilor">Codul sursă al proiectului</a>.</p>');
replace('; un cadru costă circa 3,6 ms.', '.');
replace('Pagina rulează dintr-un singur fișier, fără server și fără instalare; singura resursă externă este fontul de pe Google Fonts (fără el, textul se afișează cu fonturi de rezervă)', 'Preferința pentru mișcare redusă este preluată din setările browserului');
replace('au trecut Rinul împreună, în 406, dar erau popoare diferite. E o simplificare a modelului.', 'gruparea simplifică simularea. În 429, vandalii și alanii au trecut în Africa, iar suebii au rămas în Hispania.');
replace('pe harta reală a Europei (370–476)', 'pe o hartă fizică a Europei (370–476)');
replace('iar la final îți compari lumea cu cea reală', 'iar la final compari pozițiile din joc cu repere istorice estimate');
replace('Țintele popoarelor urmează pozițiile lor reale din izvoare;', 'Țintele popoarelor sunt repere aproximative stabilite pe baza izvoarelor;');
replace('Reper <code>&lt;main&gt;</code>, atribute <code>aria-label</code> pe hărțile SVG și hotspot-uri activabile de la tastatură (Enter/Space)', 'Reper <code>&lt;main&gt;</code>, etichete pentru hărțile SVG și acces de la tastatură la fișele de pe axa cronologiei și la punctele Muzeului');

replace("cu ieșire la mare.', quote: null", "cu ieșire la mare.', source: 'Codex Theodosianus VII.13.15 (Ravenna, 6 decembrie 402); S. Cosentino, The Structural Features of Ravenna’s Socioeconomic History in Late Antiquity, pp. 59–60, n. 2', quote: null");
replace("src: 'Getica' } },", "src: 'Getica §§219–222, în special §221 (traducere adaptată)' } },");
replace("src: 'Fragmenta' } },", "src: 'Fr. 8, partea 1 (Müller; traducere adaptată)' } },");
replace("quote: { text: 'solii cereau, în numele lui Attila, predarea dezertorilor și plata tributului restant', author: 'Priscus din Panium', src: 'Fr. 8, partea 1 (Müller; traducere adaptată)' }",
  "source: 'Priscus, fr. 5 (Müller), pentru pace și tribut; Marcellinus Comes, Chronicon, anul 447, pentru cutremur', quote: null");
replace("src: 'frag. 13 (ed. Blockley)'", "src: 'Fr. 8, partea 9 (Müller; traducere adaptată)'");
replace("document.getElementById('mt-quote-wrap').style.display = 'none';",
  "document.getElementById('mt-quote-wrap').style.display = d.source ? 'block' : 'none';\n        document.getElementById('mt-quote').textContent = '';\n        document.getElementById('mt-cite').textContent = d.source || '';");
replace('Punctele: unde s-au petrecut evenimentele', 'Pentru acces din tastatură, alege un eveniment pe axă. Punctele: locurile evenimentelor');
replace('Orice sursă din epoca studiată: text, monedă, mormânt, inscripție. Cărțile istoricilor de azi sunt surse secundare, care interpretează izvoarele.',
  'Mărturie folosită pentru a cerceta trecutul: text, monedă, mormânt sau inscripție. Un text retrospectiv poate fi un izvor: Iordanes relatează în Getica, redactată în jurul anului 551, bătălia de la Nedao, din jurul anului 454. Manuscrisul ilustrat în joc este o copie din secolul al IX-lea. Data evenimentului, data redactării și data copiei sunt repere diferite.');
replace(/Alungirea craniului prin bandaje strânse în primii ani de viață\. Era un semn de rang, practicat de mai m[^'<]+/g,
  'Modelarea craniului prin bandajare în primii ani de viață. În unele morminte a fost interpretată ca semn de rang, în funcție de podoabe, rit și context. La Mözs, practica apare în mai multe grupuri din aceeași comunitate (Knipper și colab., 2020, doi:10.1371/journal.pone.0231760).');
replace('Zidurile Theodosiene', 'Zidurile lui Teodosie');
replace('descrie grupuri hunice în aceeași regiune', 'descrie grupuri hunice lângă Meotida');
replace('Attila și Bleda cuceresc Viminacium și Naissus (Niš). Cu trupele trimise în Sicilia împotriva vandalilor, Constantinopolul cere pace.', 'Attila și Bleda cuceresc Viminacium și lovesc alte cetăți. Naissus este devastat în cursul campaniilor din anii 440; Priscus îl găsește aproape pustiu în 449.');
replace('Devastat de huni · 441 d.Hr.', 'Devastat în campaniile hunice din anii 440');
replace('Regele hun Uldin cucerește Castra Martis, în Moesia.', 'Uldin ocupă Castra Martis (Dacia Ripensis), cetate identificată cu Kula, în Bulgaria de azi.');
replace('<h4>Attila</h4>', '<h3>Attila</h3>');
replace('<h4>Flavius Aetius</h4>', '<h3>Flavius Aetius</h3>');
replace('.duel-card h4', '.duel-card h3');
replace('.duel-card.attila h4', '.duel-card.attila h3');
replace('.duel-card.aetius h4', '.duel-card.aetius h3');
replace('.duel.dk h4', '.duel.dk h3');
replace("'cap-cr-' + (n++)", "'credit-foto-' + (n++)");
replace("function openAbout(){ aboutOverlay.classList.add('active'); }",
  "function openAbout(){ aboutOverlay.classList.add('active'); if (aboutClose) aboutClose.focus({ preventScroll: true }); }");
replace("function closeAbout(){ aboutOverlay.classList.remove('active'); }",
  "function closeAbout(){ aboutOverlay.classList.remove('active'); if (aboutTrigger) aboutTrigger.focus({ preventScroll: true }); }");
replace("    current = index;\n    pages.forEach", "    var enteringGame = index !== current && PAGE_IDS[index] === 'mod-migratie';\n    current = index;\n    pages.forEach");
replace("    if (record !== false && window.history && window.history.pushState) {", "    if (enteringGame) pages[index].dispatchEvent(new CustomEvent('mig-enter', { detail: record !== false }));\n    if (record !== false && window.history && window.history.pushState) {");
replace('    window.scrollTo(0, 0);', "    var anchor = record === false && index === 0 ? document.getElementById(location.hash.slice(1)) : null;\n    if (anchor && pages[0].contains(anchor)) anchor.scrollIntoView({ behavior: 'instant' });\n    else window.scrollTo({ top: 0, behavior: 'instant' });");
replace("'#' + PAGE_IDS[startIndex]", "location.hash || '#' + PAGE_IDS[startIndex]");
replace("if (e.key === 'Escape' && aboutOverlay && aboutOverlay.classList.contains('active')) closeAbout();",
  "if (e.key === 'Escape' && aboutOverlay && aboutOverlay.classList.contains('active')) { e.preventDefault(); closeAbout(); }");
replace('<div class="timebar">', '<div class="timebar"><label class="timebar-label" for="time-slider">Anul pe hartă</label>');
replace(' id="time-slider" aria-label="Selectează anul pe cronologie"', ' id="time-slider"');
replace("    popoverEl.style.top = (y + 14) + 'px';",
  "    var ph = popoverEl.offsetHeight;\n    var below = y + 14;\n    var top = below + ph + 12 <= window.innerHeight ? below : y - ph - 14;\n    popoverEl.style.top = Math.max(12, Math.min(top, window.innerHeight - ph - 12)) + 'px';");

replace('Castra Martis, în Moesia', 'Castra Martis (Dacia Ripensis)');
replace('Tatăl lui, Edeco', 'Tatăl lui Odoacru, Edeco');
replace('între anii 420 și 450', 'între c. 422 și 450');
replace('Vizigoții, împinși de huni peste Dunăre', 'Tervingii (viitorii vizigoți), împinși de huni peste Dunăre');
replace('Marea Migrație, harta campaniilor', 'Marea Migrație');
replace('Ilustrațiile din articol, joc, solie și atlas', 'Ilustrațiile din articol, joc și atlas');
replace('fresca lui Rafael <em>Întâlnirea lui Leon cel Mare cu Attila</em> (1514), gravura lui J. N. Geiger <em>Hunii în luptă cu alanii</em> (c. 1873) și pictura lui Mór Than <em>Ospățul lui Attila</em> (1870).',
  'fresca lui Rafael <em>Întâlnirea lui Leon cel Mare cu Attila</em> (1514) și gravura lui J. N. Geiger <em>Hunii în luptă cu alanii</em> (c. 1873).');
replace('Hărțile istorice din articol</strong> (Ptolemeu–Porro, 1596; invaziile Imperiului Roman) sunt reproduse',
  'Harta istorică din articol</strong> (Ptolemeu–Porro, 1596) este reprodusă');
replace('Genetica (ADN antic)', '<span class="sc-nowrap">Genetica (ADN antic)</span>');
replace('<main id="site-main">', '<main id="site-main" tabindex="-1">');
replace(/<body[^>]*>/g, '$&\n<a class="skip-to-main" href="#site-main">Sari la conținut</a>');
replace('hx-body"><h4>', 'hx-body"><h3>');
replace("</h4><p class=\"hx-where\">", "</h3><p class=\"hx-where\">");
replace('.hx-body h4', '.hx-body h3');

replace(/    document\.querySelectorAll\('\.vt-btn'\)\.forEach\(function\(btn\)\{[\s\S]*?^    \}\);\n/gm, '');
replace('    var layers = { routes: true, battles: true, maxextent: true };\n', '');
replace("zoneMaxOutline.classList.toggle('show', layers.maxextent)", "zoneMaxOutline.classList.add('show')");
replace("        if (!layers.routes) { r.style.opacity = 0; return; }\n", '');
replace("routeLabels.forEach(function(l){ l.style.opacity = layers.routes ? 1 : 0; });", "routeLabels.forEach(function(l){ l.style.opacity = 1; });");
replace("        var isBattle = m.classList.contains('battle') || m.classList.contains('camp');\n        if (isBattle && !layers.battles) { m.classList.remove('visible'); return; }\n", '');
replace(/\.m-atlas \.(?:vt-btn[^{}]*|view-toggles)\{[^{}]*\}/g, '');
replace(/\/\*\s*\/?r\d+(?:-relight)?(?::[^*]*)?\s*\*\//g, '');

// Grupăm portretele cu biografiile și imaginile cu explicațiile lor.
{
  replace(/^ {6}(<aside class="r9-note" aria-label="Știai că…\? Zi și noapte călare">[^\n]+<\/aside>)\n {6}(<!-- pq:start --><figure class="pq"><blockquote><p>Socotind că[^\n]+<!-- pq:end -->)/gm,
    (_, note, quote) => [
      '      <div class="margus-context">',
      '        ' + quote,
      '        ' + note,
      '      </div>'
    ].join('\n'));

  const gold = html.match(/^ +(<aside class="r9-note" aria-label="Știai că…\? 1\/72 de livră">[^\n]+<\/aside>)\n +(<figure class="sr-fig sr-fig-inline"><img id="img-solidus"[^\n]+<\/figure>)\n        <\/div>\n      <\/div>\n\n      <!-- aur:start -->/m);
  if (!gold) throw new Error('Lipsește nota sau imaginea solidului.');
  const [, note, figure] = gold;
  replace(gold[0], () => [
    '        </div>',
    '      </div>',
    '      <div class="gold-context">',
    '        ' + figure,
    '        ' + note,
    '      </div>',
    '',
    '      <!-- aur:start -->'
  ].join('\n'));

  const weapon = html.match(/^ +<div class="r9-facts">\n([\s\S]*?<\/ul>)\n +(<aside class="r9-note r9-in r9-side"[^\n]+<\/aside>)\n<\/div>/m);
  if (!weapon) throw new Error('Lipsește nota „Sabia lui Marte”.');
  replace(weapon[0], () => '          ' + weapon[1].trim());

  const profile = /^( +<article class="duel-card (?:attila|aetius) dk-card">)\n( +<figure class="dc-img">[^\n]+<\/figure>)\n([\s\S]+?^ +<\/ul>)\n( +<\/article>)/gm;
  if ([...html.matchAll(profile)].length !== 2) throw new Error('Lipsesc fișele celor două personalități.');
  replace(profile, (_, start, portrait, details, end) => [
    start, portrait, '          <div class="dk-profile">',
    details.split('\n').map(line => '  ' + line).join('\n'),
    '          </div>', end
  ].join('\n'));

  replace(/^      (<div class="duel-lives"[^\n]+)\n/gm, (_, timeline) => [
    '      <div class="duel-context">',
    '        ' + timeline,
    '        ' + weapon[2],
    '      </div>',
    ''
  ].join('\n'));
}

replace('  html:not(#x) .m-lab{ --parchment: #16120e; --parchment-2: #1d1813; --parchment-3: #2b241b; }', '');
const style = fs.readFileSync(path.join(__dirname, 'predare.css'), 'utf8');
replace('</head>', '<style id="corecturi-predare">\n' + style + '</style>\n</head>');
html = html.replace(/^[ \t]+$/gm, '');
fs.writeFileSync(file, original.includes('\r\n') ? html.replaceAll('\n', '\r\n') : html);
