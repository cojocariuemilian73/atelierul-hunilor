// Retușuri cerute pe 24.11.2026: harta lui Ptolemeu cu text și legendă alături + stratul design/retusuri.css.
// Rulează după patch-domino-prezentare, înainte de build-web. Se poate rula de mai multe ori.
const fs = require('fs');
const path = require('path');

const page = path.join(__dirname, '..', 'atelierul-hunilor.html');
const raw = fs.readFileSync(page, 'utf8');
const crlf = raw.includes('\r\n');
let html = raw.replace(/\r\n/g, '\n');

// 1. Harta lui Ptolemeu: titlu mic, textul existent, legenda punctelor, creditul separat
const capOld = '<figcaption>Harta Sarmației Europene după Ptolemeu, gravată de Girolamo Porro (Veneția, 1596). Pe ea apare chiar numele <b>Chuni</b>, lângă Amadoca și Borysthenes (Nipru), între bastarni și roxolani, adică exact localizarea din Geografia 3.5.10, nu pe malul Mării Azov, cum se repetă adesea. Imagine în domeniul public (Wikimedia Commons).</figcaption>';
if (!html.includes('class="ptol-legend"')) {
  const i = html.indexOf(capOld);
  if (i === -1 || html.indexOf(capOld, i + 1) !== -1) throw new Error('Nu găsesc o singură legendă a hărții lui Ptolemeu.');
  // legenda rămâne neschimbată (scriptul de credite mută „Imagine în domeniul public…” în butonul ⓘ);
  // titlul mic și lista punctelor stau separat, în coloana din dreapta
  const capNew = '<p class="ptol-kicker">Unde îi așază Ptolemeu?</p>' + capOld +
    '<ul class="ptol-legend">' +
    '<li><span class="pt-dot gold" aria-hidden="true"></span><span><b>Chuni</b>: numele notat de Ptolemeu, la mijlocul secolului al II-lea.</span></li>' +
    '<li><span class="pt-dot red" aria-hidden="true"></span><span><b>Bastarnae, Roxolani</b>: vecinii între care îi așază Ptolemeu.</span></li>' +
    '<li><span class="pt-dot red" aria-hidden="true"></span><span><b>Tanais (Don), Mæotis (Azov)</b>: reperele lui Ammianus, care, cu aproximativ 240 de ani mai târziu, îi plasează pe huni dincolo de Meotida.</span></li>' +
    '</ul>';
  html = html.slice(0, i) + capNew + html.slice(i + capOld.length);
}

// 2. Stratul de stiluri
const start = '<!-- retusuri:start -->\n', end = '<!-- retusuri:end -->\n';
const prev = html.indexOf(start);
if (prev !== -1) html = html.slice(0, prev) + html.slice(html.indexOf(end, prev) + end.length);
const css = fs.readFileSync(path.join(__dirname, 'design', 'retusuri.css'), 'utf8').replace(/\r\n/g, '\n').trimEnd();
const bodyEnd = html.lastIndexOf('</body>');
if (bodyEnd === -1) throw new Error('Lipsește </body>.');
html = html.slice(0, bodyEnd) + start + '<style id="retusuri">\n' + css + '\n</style>\n' + end + html.slice(bodyEnd);

fs.writeFileSync(page, crlf ? html.replace(/\n/g, '\r\n') : html);
