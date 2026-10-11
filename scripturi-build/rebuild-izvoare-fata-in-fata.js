// Acasă, capitolul 01: „Izvoarele, față în față” — compararea vizuală a celor trei autori
// antici cu arheologia și genetica: când, cât de departe de evenimente, martor sau nu,
// ce aflăm și unde sunt limitele.
const fs = require('fs'), path = require('path');
const CARDS = [
  { k: 'text', name: 'Ammianus Marcellinus', work: 'Res Gestae, cartea 31', when: 'c. 390', gap: 15, witness: 'no', witnessT: 'Contemporan, dar nu i-a văzut pe huni',
    gives: 'Cea mai veche descriere amănunțită a hunilor și a șocului din 375–378.',
    limit: 'Folosește tipare vechi despre „barbari”: imaginea e literară, nu observație de teren.' },
  { k: 'text', name: 'Priscus din Panium', work: 'Istorie, păstrată în fragmente', when: 'după 450', gap: 0, witness: 'yes', witnessT: 'Martor ocular: în solia din 449',
    gives: 'Curtea lui Attila văzută din interior: ospățul, diplomația, tributul.',
    limit: 'Avem doar fragmente copiate de alții; privește lumea hunică cu ochi de diplomat bizantin.' },
  { k: 'text', name: 'Iordanes', work: 'Getica', when: '551', gap: 100, witness: 'no', witnessT: 'Nu a fost martor; rezumă autori mai vechi',
    gives: 'Câmpiile Catalaunice, moartea lui Attila, bătălia de la Nedao.',
    limit: 'Scrie o istorie a goților, la un secol distanță, și are interesul să-i pună în lumină.' },
  { k: 'obj', name: 'Arheologia', work: 'morminte, cazane, diademe, arcuri', when: 'sec. IV–V', gap: 0, witness: 'obj', witnessT: 'Obiecte din epocă',
    gives: 'Ce purtau, ce foloseau și cât de departe ajungea moda elitelor din lumea hunică.',
    limit: 'Obiectele nu spun etnia: aceeași diademă putea fi purtată de un hun, un got sau un alan.' },
  { k: 'dna', name: 'Genetica (ADN antic)', work: 'Neparáczki 2019, Maróti 2022', when: '2019–2022', gap: null, witness: 'obj', witnessT: 'Analiză modernă pe schelete din epocă',
    gives: 'O populație amestecată: câteva linii est-asiatice într-o masă majoritar locală.',
    limit: 'Eșantioane mici, mai ales din morminte de elită; ADN-ul nu arată identitatea asumată.' }
];
const W = { yes: ['●', 'Martor'], no: ['○', 'Nu e martor'], obj: ['◆', 'Material'] };
function card(c){
  const gap = c.gap === null ? '<span class="sc-gap modern">cercetare modernă</span>'
    : c.gap === 0 ? '<span class="sc-gap zero">din epocă</span>'
    : '<span class="sc-gap"><i style="width:' + Math.min(100, c.gap) + '%"></i>~' + c.gap + ' de ani după</span>';
  return '<article class="sc-card sc-' + c.k + '">' +
    '<header><b>' + c.name + '</b><small>' + c.work + ' · ' + c.when + '</small></header>' +
    gap +
    '<p class="sc-w sc-w-' + c.witness + '"><span aria-hidden="true">' + W[c.witness][0] + '</span>' + c.witnessT + '</p>' +
    '<p class="sc-row"><em>Ce aflăm</em>' + c.gives + '</p>' +
    '<p class="sc-row"><em>Limite</em>' + c.limit + '</p>' +
  '</article>';
}
const HTML = '\n      <div class="src-compare sr-reveal">\n' +
  '        <h3 class="sub-title">Izvoarele, față în față</h3>\n' +
  '        <p class="sc-lead">Tot ce știm despre huni vine din cinci tipuri de surse. Niciuna nu e completă: un martor ocular are interesele lui, un rezumat târziu poate păstra surse pierdute, iar un obiect arată ce a existat, dar nu cine l-a folosit.</p>\n' +
  '        <div class="sc-grid">' + CARDS.map(card).join('') + '</div>\n' +
  '        <p class="section-sources">Distanța e socotită față de evenimentele descrise (375–378 pentru Ammianus, 451–454 pentru Iordanes). Edițiile și studiile sunt în bibliografia de la final.</p>\n' +
  '      </div>\n';
const CSS = `
  /* Izvoarele, față în față (capitolul 01) */
  .src-compare{ margin: 46px 0 0; }
  .sc-lead{ max-width: 70ch; color: var(--ink-dim); }
  .sc-grid{ display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin: 20px 0 6px; }
  @media (max-width: 1180px){ .sc-grid{ grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  @media (max-width: 760px){ .sc-grid{ grid-template-columns: 1fr; } }
  .sc-card{ display: flex; flex-direction: column; gap: 10px; padding: 14px 14px 16px; background: var(--paper); border: 1px solid var(--line-strong); border-top: 3px solid var(--accent-2); }
  .sc-card.sc-obj{ border-top-color: #8fbd82; } .sc-card.sc-dna{ border-top-color: #7ab0e8; }
  .sc-card header b{ display: block; font-family: 'Cormorant Garamond', serif; font-size: 1.22rem; line-height: 1.15; color: var(--ink); }
  .sc-card header small{ display: block; margin-top: 3px; font-family: 'JetBrains Mono', monospace; font-size: 0.64rem; color: var(--ink-dim); letter-spacing: 0.03em; }
  .sc-gap{ position: relative; display: block; padding: 4px 8px; font-family: 'JetBrains Mono', monospace; font-size: 0.66rem; font-weight: 700; color: var(--ink); background: var(--paper-2); border: 1px solid var(--line); overflow: hidden; }
  .sc-gap i{ position: absolute; inset: 0 auto 0 0; background: rgba(224, 98, 108, 0.28); }
  .sc-gap.zero{ color: #8fbd82; } .sc-gap.modern{ color: #7ab0e8; }
  .sc-gap{ isolation: isolate; } .sc-gap i{ z-index: -1; }
  .sc-w{ margin: 0; font-size: 0.82rem; line-height: 1.4; display: flex; gap: 7px; align-items: baseline; }
  .sc-w span{ font-size: 0.8rem; }
  .sc-w-yes span{ color: #8fbd82; } .sc-w-no span{ color: #e0626c; } .sc-w-obj span{ color: #7ab0e8; }
  .sc-row{ margin: 0; font-size: 0.86rem; line-height: 1.5; color: var(--ink-dim); }
  .sc-row em{ display: block; font-style: normal; font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent-2); margin-bottom: 2px; }
`;
for (const f of ['index.html', 'atelierul-hunilor.html', 'module-individuale/huni-prezentare.html']) {
  const p = path.join(__dirname, '..', f);
  let s = fs.readFileSync(p, 'utf8').split('\r\n').join('\n');
  if (s.includes('class="src-compare')) { console.error(f + ': already applied'); process.exit(1); }
  const a = s.indexOf('<section id="sec-origini">');
  const b = s.indexOf('    </section>', a);
  if (a === -1 || b === -1) { console.error(f + ': sec-origini'); process.exit(1); }
  s = s.slice(0, b) + HTML + s.slice(b);
  const anchor = '  .sr-row{';
  if (!s.includes(anchor)) { console.error(f + ': css anchor'); process.exit(1); }
  s = s.replace(anchor, CSS + anchor);
  fs.writeFileSync(p, s);
  console.log(f + ': izvoarele față în față');
}
