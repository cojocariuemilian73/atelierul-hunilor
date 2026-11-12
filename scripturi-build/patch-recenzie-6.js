// Recenzia 6 (din scripturi-build/recenzie6/recenzie6.css):
//  A) deschiderea: fără butonul plutitor „Joacă pe telefon” (codul QR rămâne pe pagina jocului); rândul de sus doar cu
//     numele concursului; o frază scurtă, care explică și intervalul (454 la Nedao, 476 în Apus); fără chipurile
//     „Secțiune” și „Interval”; sursele ca un rând discret sub butoane; fresca mai întunecată;
//  B) numele: „Masa istoricului” devine „Jocul izvoarelor”; cardul „Fii tu Attila” poartă numele jocului;
//  C) capitolul 03 fără cele două hărți (traseele sunt în Atlas), cu o trimitere spre Atlas; Atlasul își explică anul 455;
//  D) fișele lui Attila și Aetius fără evaluările „orientative” (rămân faptele-cheie);
//  E) Iordanes citat peste tot pe paragrafe (ed. Mommsen); nota 18 are și sursa pentru Dengizich (469);
//  F) „~15 ani după”; prima literă a capitolului apare o singură dată în text; miturile au toate același format;
//  G) tributul de 2.100 de livre explicat pe larg doar la graficul cu monede.
// Folosire: node scripturi-build/patch-recenzie-6.js (după patch-module.js, înainte de patch-efecte.js; apoi build-web.js).
// Se poate rula de mai multe ori.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const CSS = fs.readFileSync(path.join(__dirname, 'recenzie6', 'recenzie6.css'), 'utf8').split('\r\n').join('\n').replace(/\n+$/, '\n');

const rel = 'atelierul-hunilor.html';
const f = path.join(root, rel);
const raw = fs.readFileSync(f, 'utf8'), crlf = raw.includes('\r\n');
let s = raw.split('\r\n').join('\n');
const fail = m => { console.error(rel + ': ' + m); process.exit(1); };
// înlocuiește o dată; dacă rezultatul e deja acolo, nu face nimic
function swap(a, b, what){ const n = s.split(a).length - 1; if (n === 1) { s = s.replace(a, () => b); return; } if (s.includes(b)) return; fail(what + ' (' + n + ')'); }

// ---------- A) deschiderea ----------
swap('<p class="kicker">Atelierul Hunilor · Concursul Național „Istorie și societate în dimensiune virtuală”</p>',
  '<p class="kicker">Concursul Național „Istorie și societate în dimensiune virtuală”</p>', 'rândul de sus');
swap('<p class="dek">Din stepele de dincolo de Volga, un popor de călăreți a rupt echilibrul lumii antice în mai puțin de un secol, împingând vizigoți, ostrogoți și vandali în inima Imperiului Roman și grăbind sfârșitul Antichității.</p>',
  '<p class="dek">Un popor de călăreți venit din stepe a împins goții, alanii și vandalii peste granițele Romei. Puterea hunilor se frânge în 454, la Nedao, dar urmările țin până la căderea Imperiului de Apus, în 476.</p>', 'paragraful din deschidere');
{
  const by = s.match(/\n *<div class="byline">\n *<span><b>Secțiune<\/b>[\s\S]*?<\/div>/);
  if (by) s = s.replace(by[0], () => '\n      <p class="hero-src">23 de note · izvoare antice și cercetare modernă</p>');
  else if (!s.includes('<p class="hero-src">')) fail('chipurile din deschidere');
}
s = s.replace(/<button type="button" class="qr-fab"[\s\S]*?<\/button>\n/, '');

// ---------- B) numele ----------
s = s.split('Masa istoricului').join('Jocul izvoarelor').split('Izvoarele pe axă').join('Jocul izvoarelor');
s = s.split('certificat-izvoarele-pe-axa.png').join('certificat-jocul-izvoarelor.png');
s = s.split('certificat-masa-istoricului.png').join('certificat-jocul-izvoarelor.png');
swap('<p class="kicker">Componenta interactivă</p>\n      <h3>Fii tu Attila</h3>',
  '<p class="kicker">Jocul</p>\n      <h3>Attila și Marea Migrație</h3>', 'cardul jocului');
swap('<a class="cta-btn" href="#mod-migratie">Joacă „Attila și Marea Migrație” →</a>', '<a class="cta-btn" href="#mod-migratie">Joacă acum →</a>', 'butonul cardului');

// ---------- C) capitolul 03 fără hărți; Atlasul ----------
swap('<p class="sec-sub">Harta dinamică: apasă pe o săgeată pentru a urmări presiunea hunică</p>',
  '<p class="sec-sub">Efectul de domino și prețul păcii, plătit în aur</p>', 'subtitlul capitolului 03');
{
  const m0 = s.indexOf('      <figure class="fig-map fig-invazii">');
  if (m0 >= 0) {
    const src0 = s.indexOf('        <p class="section-sources">Surse pentru traseele', m0);
    const src1 = s.indexOf('</p>\n', src0) + '</p>\n'.length;
    const end = '      </div>\n';
    if (src0 < 0 || !s.startsWith(end, src1)) fail('harta din capitolul 03');
    const srcP = s.slice(src0, src1).replace(/^ {8}/, '      ');
    s = s.slice(0, m0) + '      <p class="to-atlas"><a href="#sec-atlas">Traseele vizigoților, ostrogoților, vandalilor și hunilor, an cu an: vezi Atlasul →</a></p>\n' + srcP + s.slice(src1 + end.length);
  } else if (!s.includes('<p class="to-atlas">')) fail('harta din capitolul 03');
}
swap('<p class="sec-sub">De la Volga până în Galia, 370–455 d.Hr. Trage cronologia:',
  '<p class="sec-sub">De la Volga până în Galia: harta urmărește traseele de la sosirea hunilor (370) până la jefuirea Romei de către vandali (455). Trage cronologia:', 'subtitlul Atlasului');

// ---------- D) fișele duelului ----------
s = s.replace(/ *<dl class="dk-stats">[\s\S]*?<\/dl>\n/g, '');
s = s.replace(/ *<p class="dk-note">Barele sunt orientative[\s\S]*?<\/p>\n/, '');

// ---------- E) Iordanes pe paragrafe ----------
swap('Iordanes, <em>Getica</em>, 24, povestește', 'Iordanes, <em>Getica</em>, 129–130, povestește', 'nota 9');
swap('Iordanes, <em>Getica</em>, 41–42 (bătălia Câmpiilor Catalaunice, 451 d.Hr.)', 'Iordanes, <em>Getica</em>, 197–218 (bătălia Câmpiilor Catalaunice, 451 d.Hr.)', 'nota 11');
swap('Iordanes, <em>Getica</em>, 36 (componența celor două tabere', 'Iordanes, <em>Getica</em>, 191 (componența celor două tabere', 'nota 17');
swap('Iordanes, <em>Getica</em>, 260–263 (bătălia de la Nedao, 454 d.Hr.). <a',
  'Iordanes, <em>Getica</em>, 260–263 (bătălia de la Nedao, 454 d.Hr.); pentru Dengizich: Marcellinus Comes, <em>Chronicon</em>, anul 469 (capul lui adus la Constantinopol). <a', 'nota 18');
swap("src: 'Getica, 41: „o bătălie cruntă", "src: 'Getica, 207: „o bătălie cruntă", 'citatul din Atlas');

// ---------- F) corecturi ----------
s = s.split('~15 de ani după').join('~15 ani după');
swap("sp.className = 'dc'; sp.setAttribute('aria-hidden', 'true'); sp.textContent = nd.nodeValue.charAt(i);",
  "sp.className = 'dc'; sp.setAttribute('aria-hidden', 'true'); sp.setAttribute('data-l', nd.nodeValue.charAt(i));", 'prima literă');
swap("    // primul grup din articol e deschis; următoarele încep ca un teanc de dosare închise, cu primul mit ca mostră\n    if (++mxGroup > 1) {",
  "    // toate grupurile de mituri au același format: rânduri deschise (teancul de dosare închise nu se mai folosește)\n    if (++mxGroup < 0) {", 'miturile');
// cititoarele de ecran: litera ascunsă rămâne în rând (font-size 0), ca „În” să se citească dintr-o bucată
swap("sr.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';", "sr.style.cssText = 'font-size:0';", 'prima literă (cititoarele de ecran)');
// harta din capitolul 03 nu mai există: scriptul ei se oprește singur
swap("    var miDesc = document.getElementById('mi-desc');\n", "    var miDesc = document.getElementById('mi-desc');\n    if (!miTag || !miTitle || !miDesc) return;\n", 'harta din 03 (script)');
s = s.replace("'<img src=\"' + src + '\" alt=\"\">' : '<span class=\"mig-mono\"", "'<img src=\"' + src + '\" alt=\"\" aria-hidden=\"true\">' : '<span class=\"mig-mono\"");

// ---------- G) tributul ----------
swap('(408–450), moneda tributului. La 72 de solizi la livră, cele 2.100 de livre pe an însemnau peste 150.000 de monede. CC0.',
  '(408–450), moneda în care se plătea tributul. CC0.', 'legenda solidului');
swap('În astfel de monede s-a plătit tributul către huni: 2.100 de livre pe an însemnau peste 150.000 de solizi.',
  'În astfel de monede s-a plătit tributul către huni.', 'solidul din muzeu');

// ---------- stilurile ----------
const k0 = s.indexOf('  /* r6: recenzia 6');
if (k0 >= 0) { const e = '  /* /r6 */\n'; const k1 = s.indexOf(e, k0); if (k1 < 0) fail('sfârșit CSS r6'); s = s.slice(0, k0) + s.slice(k1 + e.length); }
const st = s.lastIndexOf('</style>');
if (st < 0) fail('</style>');
s = s.slice(0, st) + CSS + s.slice(st);

fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
console.log(rel + ': recenzia 6 (deschiderea, numele, capitolul 03, duelul, citările, corecturile)');
