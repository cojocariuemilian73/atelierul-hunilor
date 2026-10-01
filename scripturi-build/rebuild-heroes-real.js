// Replaces the three AI-generated header backgrounds with real works of art
// (all public domain, Wikimedia Commons), each with a visible credit line:
//   Acasă            — Raphael, The Meeting of Leo the Great and Attila (1514)
//   Campania Hunilor — J. N. Geiger, Huns in battle with the Alans (c. 1873)
//   Solia la Attila  — Mór Than, The Feast of Attila (1870), after Priscus
// It also rewrites the "Despre imagini" note: no AI image is left on the site.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const B = path.join(ROOT, 'build');
const IMG = path.join(ROOT, 'imagini', 'reale');
const uri = f => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(IMG, f)).toString('base64');

function swapBg(file, marker, newUri, credit){
  let s = fs.readFileSync(file, 'utf8');
  const at = s.indexOf(marker);
  if (at === -1) { console.error('marker not found in ' + path.basename(file)); process.exit(1); }
  const u0 = s.indexOf("url('data:image/", at), u1 = s.indexOf("')", u0);
  if (u0 === -1 || u0 - at > 200) { console.error('background not found near marker in ' + path.basename(file)); process.exit(1); }
  s = s.slice(0, u0) + "url('" + newUri + s.slice(u1);
  // credit right after the background element
  const close = s.indexOf('</div>', u0) + 6;
  s = s.slice(0, close) + '\n    <p class="hero-credit">' + credit + '</p>' + s.slice(close);
  fs.writeFileSync(file, s);
}

swapBg(path.join(B, 'story.body.html'), '<div class="hero-bg"', uri('hero-acasa-rafael.jpg'),
  'Rafael, <i>Întâlnirea lui Leon cel Mare cu Attila</i> (1514), Vatican · domeniu public');
swapBg(path.join(B, 'game.body.html'), '<div class="hero-bg"', uri('hero-joc-geiger.jpg'),
  'J. N. Geiger, <i>Hunii în luptă cu alanii</i> (c. 1873) · domeniu public');
swapBg(path.join(B, 'embassy.body.html'), '<div class="masthead-bg"', uri('hero-solie-than.jpg'),
  'Mór Than, <i>Ospățul lui Attila</i> (1870) · domeniu public');

const CREDIT_CSS = "\n  .hero-credit{ position: absolute; right: 12px; bottom: 8px; z-index: 2; margin: 0; max-width: min(92%, 560px); text-align: right;\n" +
  "    font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; line-height: 1.4; color: rgba(230, 215, 195, 0.78);\n" +
  "    text-shadow: 0 1px 2px rgba(0,0,0,0.9); pointer-events: none; }\n" +
  "  @media (max-width: 640px){ .hero-credit{ font-size: 0.56rem; right: 8px; bottom: 6px; } }\n";
for (const f of ['story.css', 'game.css', 'embassy.css']) {
  const p = path.join(B, f);
  let c = fs.readFileSync(p, 'utf8');
  if (!c.includes('.hero-credit')) fs.writeFileSync(p, c + CREDIT_CSS);
}
// room under the Solia intro for the credit line
{
  const p = path.join(B, 'embassy.css');
  let c = fs.readFileSync(p, 'utf8');
  if (!c.includes('.masthead{ padding-bottom')) fs.writeFileSync(p, c + '  .masthead{ padding-bottom: clamp(40px, 6vw, 52px); }\n');
}
console.log('fundaluri: Rafael, Geiger, Than');

// ---------- "Despre imagini" ----------
const A = path.join(__dirname, 'assemble.js');
let a = fs.readFileSync(A, 'utf8');
const i0 = a.indexOf('    <h3>Despre imagini — ce e document și ce e ilustrație</h3>');
const i1 = a.indexOf('    <h3>Standarde respectate</h3>');
if (i0 === -1 || i1 === -1) { console.error('Despre imagini section not found'); process.exit(1); }
a = a.slice(0, i0) +
`    <h3>Despre imagini</h3>
    <ul>
      <li><strong>Fotografiile de artefact</strong> din Muzeu sunt documente reale: piese din colecții publice, cu muzeul, locul descoperirii, autorul fotografiei și licența afișate sub fiecare imagine (Wikimedia Commons, CC BY-SA sau CC0).</li>
      <li><strong>Imaginile din antetele modulelor</strong> sunt opere de artă reale, în domeniul public: fresca lui Rafael <em>Întâlnirea lui Leon cel Mare cu Attila</em> (1514), gravura lui J. N. Geiger <em>Hunii în luptă cu alanii</em> (c. 1873) și pictura lui Mór Than <em>Ospățul lui Attila</em> (1870). Sunt interpretări artistice târzii, nu surse despre secolul al V-lea.</li>
      <li><strong>Hărțile istorice din articol</strong> (Ptolemeu–Porro, 1596; invaziile Imperiului Roman; campania lui Attila în Galia) sunt reproduse de pe Wikimedia Commons, cu licența afișată.</li>
      <li><strong>Fondul hărților interactive</strong> (Atlas, Marea Migrație, harta campaniilor) este o hartă fizică reală a Europei (Alexrk2, Wikimedia Commons, CC BY-SA 3.0). Orașele, zonele și traseele sunt calculate din latitudine și longitudine, cu proiecția hărții.</li>
    </ul>

` + a.slice(i1);
fs.writeFileSync(A, a);
console.log('assemble.js: secțiunea despre imagini actualizată');
