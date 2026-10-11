// Scoate liniile de pauză („—” și „ – ” folosit ca pauză) din site, înlocuindu-le după context
// cu virgulă, două puncte, paranteze sau punct și virgulă. Cratimele din cuvinte (s-a, într-un)
// și liniuțele din intervale (370–476) rămân.
// Folosire: node scripturi-build/fara-linii-de-pauza.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

// [vechi, nou]: întâi cazurile cu două linii (incizii), apoi cele simple; toate se aplică peste tot.
const R = [
  // incizii între două linii
  [' — nu Asia de Est — era considerat', ' (nu Asia de Est) era considerat'],
  [' — aceleași pe care Herodot le folosise, cu opt secole înainte, pentru sciți — al căror', ' (aceleași pe care Herodot le folosise, cu opt secole înainte, pentru sciți), al căror'],
  ['ostrogoții — vasali ai lui Attila — au luptat', 'ostrogoții, vasali ai lui Attila, au luptat'],
  ['(c. 454) — în care popoarele subjugate se răscoală și destramă hegemonia hunică — pun capăt', '(c. 454), în care popoarele subjugate se răscoală și destramă hegemonia hunică, pun capăt'],
  ['elite germanice — probabil gepide — din secolele', 'elite germanice (probabil gepide) din secolele'],
  ['medievală — fiind legat, între altele, de legenda Sfântului Lupus de Troyes — și abia', 'medievală (fiind legat, între altele, de legenda Sfântului Lupus de Troyes) și abia'],
  ['Teodoric I — incluzând și franci, burgunzi și alani — îl oprește', 'Teodoric I, incluzând și franci, burgunzi și alani, îl oprește'],
  ['genetică mare — amestec de ascendență est-asiatică și europeană/locală — nu un popor', 'genetică mare: amestec de ascendență est-asiatică și europeană/locală, nu un popor'],
  ['sicriu triplu — aur, argint și fier —, iar', 'sicriu triplu (aur, argint și fier), iar'],

  // titlu, etichete, subtitluri
  ['Atelierul Hunilor — ', 'Atelierul Hunilor: '],
  ['Harta dinamică — apasă', 'Harta dinamică: apasă'],
  ['Attila și Aetius — două fețe', 'Attila și Aetius: două fețe'],
  ['Înaintea expansiunii hunice — stepa pontică', 'Înaintea expansiunii hunice: stepa pontică'],
  ['„Flagellum Dei” — Biciul', '„Flagellum Dei”, Biciul'],
  ['dimensiune virtuală” — Secțiunea', 'dimensiune virtuală”, Secțiunea'],
  ['>—<', '><'],
  [" + ' — ' + ", " + ', ' + "],
  ["(d.quote.src ? ' — ' + d.quote.src", "(d.quote.src ? ', ' + d.quote.src"],

  // text
  ['la <em>sursă</em> — scripturile', 'la <em>sursă</em>: scripturile'],
  ['mai puțin de un secol — împingând', 'mai puțin de un secol, împingând'],
  ['</sup> — o localizare', '</sup>: o localizare'],
  ['bastarni și roxolani — adică', 'bastarni și roxolani, adică'],
  ['granițele Romei — un efect', 'granițele Romei: un efect'],
  ['hunilor înșiși — din stepă', 'hunilor înșiși, din stepă'],
  ['jefuiesc Roma — apoi', 'jefuiesc Roma, apoi'],
  ['(c. 1360) — o imagine', '(c. 1360): o imagine'],
  ['curtea hunilor — cunoștea', 'curtea hunilor: cunoștea'],
  ['Câmpiile Catalaunice — nu doar', 'Câmpiile Catalaunice: nu doar'],
  ['în 454 — la trei ani', 'în 454, la trei ani'],
  ['spre Orléans — asediat, dar nu cucerit', 'spre Orléans (asediat, dar nu cucerit)'],
  ['Palatul Bourbon, Paris — imaginea', 'Palatul Bourbon, Paris: imaginea'],
  ['este detronat — data', 'este detronat: data'],
  ['în Galia — harta etnică', 'în Galia; harta etnică'],
  ['Muzeul Național Maghiar — aceeași', 'Muzeul Național Maghiar: aceeași'],
  ['</sup> — aceleași obiecte', '</sup>: aceleași obiecte'],
  ['(județul Buzău) — expusă', '(județul Buzău), expusă'],
  ['artificial</b> — aceeași', 'artificial</b>, aceeași'],
  ['purtătorului — iar', 'purtătorului, iar'],
  ['2005 — teza', '2005: teza'],
  ['izvoarele antice — este o reconstituire', 'izvoarele antice; este o reconstituire'],
  ['1.3.15 — expresia', '1.3.15: expresia'],
  ['Ioannes Malalas — și cercetări', 'Ioannes Malalas, precum și cercetări'],
  ['împinse de huni — hunii înșiși', 'împinse de huni: hunii înșiși'],
  ['la Ravenna — Roma nu mai era', 'la Ravenna; Roma nu mai era'],
  ['Getica, 41 — „', 'Getica, 41: „'],
  ['foiță de aur — arma', 'foiță de aur: arma'],
  ['Placarea cu aur — simbol', 'Placarea cu aur, simbol'],
  ['superior — o soluție', 'superior, o soluție'],
  ['lângă râuri — posibil', 'lângă râuri, posibil'],
  ['kotle” — Descoperiri', 'kotle”: Descoperiri'],
  ['axul diademei — singurul', 'axul diademei, singurul'],
  ['„cloisonné” — stilul', '„cloisonné”: stilul'],
  ['cu granate — din același', 'cu granate, din același'],
  ['rangul purtătorului — sabia', 'rangul purtătorului: sabia'],
  ['spathei — arma', 'spathei, arma'],
  ['toată viața — un semn', 'toată viața: un semn'],
  ['pe umăr — imaginea', 'pe umăr: imaginea'],
  ['P F AVG — „', 'P F AVG: „'],
  ['dușmanul — un mesaj', 'dușmanul: un mesaj'],
  ['Gherăseni — dovada', 'Gherăseni, dovada'],
  ['una câte una — tehnica', 'una câte una: tehnica'],
  ['un vultur — pasăre', 'un vultur, pasăre'],
  ['imperiului hunic — o elită', 'imperiului hunic: o elită'],
  ['la înfățișare — o relatare', 'la înfățișare, o relatare'],
  ['etnografică romană — un topos', 'etnografică romană, un topos'],
  ['unii germanici — e un marker', 'unii germanici; e un marker'],
  ['spațiul Xiongnu — deci', 'spațiul Xiongnu, deci'],
  ['autohtone — nu o înlocuire', 'autohtone, nu o înlocuire'],
  ['aur și granate — adevărate', 'aur și granate, adevărate'],
  ['războinici — femeile', 'războinici; femeile'],
  ['nordul Italiei — factori', 'nordul Italiei, factori'],
  ['din fier — un detaliu', 'din fier, un detaliu'],
  ['capturat — o sumă', 'capturat: o sumă'],
  ['curtea sa restrânsă — restul', 'curtea sa restrânsă; restul'],
  ['al II-lea — exact 20', 'al II-lea, adică exact 20'],
  ['mai elaborat — vizibil', 'mai elaborat, vizibil'],
  ['dormeau în șa — o simbioză', 'dormeau în șa: o simbioză'],
  ['Dimpotrivă — aurul', 'Dimpotrivă: aurul'],

  // listă cu termen în bold urmat de explicație (meniul „Despre”, efectul de domino, abrevieri, semnătură)
  ['</strong> — ', '</strong>: '],
  ['</b> — ', '</b>: '],

  // bibliografie: orașele de apariție
  ['Cambridge (Mass.) – Londra', 'Cambridge (Mass.), Londra'],
  ['Londra – Cambridge (Mass.)', 'Londra, Cambridge (Mass.)'],
  ['Berkeley – Los Angeles – Londra', 'Berkeley, Los Angeles, Londra'],
  ['Londra – New York', 'Londra, New York'],
  ['sf. sec. IV – sec. V', 'sf. sec. IV–V']
];

const files = ['index.html', 'atelierul-hunilor.html', 'ghid-profesor.html', 'qr-joc.html', 'README.md']
  .concat(fs.readdirSync(path.join(root, 'module-individuale')).filter(f => f.endsWith('.html')).map(f => 'module-individuale/' + f))
  .concat(['scripturi-build/jocuri/migratie.js', 'scripturi-build/jocuri/imperiu.js', 'scripturi-build/jocuri/migratie.html', 'scripturi-build/jocuri/imperiu.html',
    'scripturi-build/atelier/atelier.js', 'scripturi-build/cronologie/cron.js', 'scripturi-build/aur/aur.html']);

for (const rel of files) {
  const f = path.join(root, rel);
  if (!fs.existsSync(f)) continue;
  let s = fs.readFileSync(f, 'utf8');
  const before = (s.match(/—| – /g) || []).length;
  for (const [a, b] of R) s = s.split(a).join(b);
  // comentariile din cod: pauza devine două puncte
  s = s.replace(/(\/\/[^\n]*?|\/\*[^\n]*?) — /g, '$1: ');
  s = s.replace(/(\/\/[^\n]*?|\/\*[^\n]*?) — /g, '$1: ');
  const after = (s.match(/—| – /g) || []).length;
  fs.writeFileSync(f, s);
  console.log(rel + ': ' + before + ' → ' + after);
}
