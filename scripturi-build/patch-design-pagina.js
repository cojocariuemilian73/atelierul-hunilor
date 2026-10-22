// Designul articolului: titlul ca o copertă de carte (anii 370—476 sub el, fresca mai luminoasă în dreapta),
// un ornament între capitole, citate mari din izvoare între paragrafe, „VS” între Attila și Aetius și
// viețile lor pe aceeași linie a timpului.
// Folosire: node scripturi-build/patch-design-pagina.js (se poate rula de mai multe ori; înainte de patch-animatii.js)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

// citatele: aceleași fragmente (și aceleași traduceri adaptate) ca în joc
const PQ = [
  { before: '      <div class="src-compare sr-reveal">', q: 'Socotind că nu se cuvine să coboare de pe cai, barbarii au ținut sfatul călare; iar romanii, ca să nu se arate mai prejos, au vorbit și ei tot din șa.', who: 'Priscus', src: 'fr. 2, despre tratatul de la Margus (c. 435)' },
  { before: '      <figure class="fig-map fig-invazii">', q: 'Orașul care a cucerit lumea întreagă a fost cucerit el însuși.', who: 'Ieronim', src: 'Scrisoarea 127, despre jefuirea Romei (410)' },
  { before: '      <figure class="fig-map gal-fig">', q: 'O luptă cumplită, schimbătoare, crudă și îndârjită, cum n-a mai povestit nimeni din vechime.', who: 'Iordanes', src: 'Getica 207, despre Câmpiile Catalaunice (451)' }
];
const pqHtml = p => '      <!-- pq:start --><figure class="pq"><blockquote><p>' + p.q + '</p></blockquote><figcaption><b>' + p.who + '</b>, ' + p.src + ' · traducere adaptată</figcaption></figure><!-- pq:end -->\n';

// ornamentul dintre capitole: două linii, două romburi și o monedă
const ORN = '    <div class="ch-orn" aria-hidden="true"><svg viewBox="0 0 240 24"><path d="M6 12H92M148 12H234"/><path class="d" d="M100 12l5-5 5 5-5 5zM130 12l5-5 5 5-5 5z"/><circle cx="120" cy="12" r="8.5"/><circle class="i" cx="120" cy="12" r="5"/></svg></div>\n';
const ORN_BEFORE = ['sec-cronologie', 'sec-migratie', 'sec-atlas', 'sec-personalitati', 'sec-muzeu'];

// Attila și Aetius pe aceeași linie: 390–455
const L0 = 388, L1 = 456, X = y => ((y - L0) / (L1 - L0) * 100).toFixed(2) + '%';
const LIVES = '      <div class="duel-lives" role="img" aria-label="Viețile lor, alături: Aetius, c. 391–454; Attila, c. 406–453. S-au înfruntat la Câmpiile Catalaunice, în 451.">' +
  '<div class="dl-row aetius"><b>Aetius</b><span class="dl-track"><i style="left:' + X(391) + ';width:calc(' + X(454) + ' - ' + X(391) + ')"></i></span><em>c. 391–454</em></div>' +
  '<div class="dl-row attila"><b>Attila</b><span class="dl-track"><i style="left:' + X(406) + ';width:calc(' + X(453) + ' - ' + X(406) + ')"></i><i class="r" style="left:' + X(434) + ';width:calc(' + X(453) + ' - ' + X(434) + ')"></i></span><em>c. 406–453</em></div>' +
  '<div class="dl-axis"><span class="dl-track">' + [400, 420, 440].map(y => '<small style="left:' + X(y) + '">' + y + '</small>').join('') +
  '<span class="dl-451" style="left:' + X(451) + '"><small>451 · Câmpiile Catalaunice</small></span></span></div>' +
  '<p class="dl-key"><span class="k1"></span>viața <span class="k2"></span>domnia lui Attila (434–453)</p></div>\n';

const CSS = `  /* dp: designul articolului */
  /* titlul ca o copertă: mare, pe două rânduri, cu anii dedesubt; fresca mai luminoasă în dreapta */
  .hero-scrim{ background: linear-gradient(90deg, rgba(14, 9, 4, 0.86) 0%, rgba(14, 9, 4, 0.6) 38%, rgba(14, 9, 4, 0.12) 72%, rgba(14, 9, 4, 0.02) 100%), linear-gradient(180deg, rgba(14, 9, 4, 0.5) 0%, rgba(14, 9, 4, 0.08) 40%, rgba(14, 9, 4, 0.92) 100%) !important; }
  .hero{ min-height: clamp(480px, 60vw, 740px); }
  .hero-inner{ padding-top: 36px; }
  h1.title{ font-size: clamp(2.6rem, 7vw, 4.7rem); line-height: 0.98; letter-spacing: -0.01em; max-width: 13ch; margin-bottom: 14px; }
  h1.title .t-sub{ display: block; margin-top: 12px; font-size: 0.4em; line-height: 1.2; font-weight: 500; letter-spacing: 0.01em; color: #e6d7c3; max-width: 24ch; }
  .t-sep{ position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  .hero-years{ display: flex; align-items: center; gap: 14px; max-width: 420px; margin: 0 0 20px; font: 600 0.95rem 'Cinzel', Georgia, serif; letter-spacing: 0.14em; color: #e5c158; font-variant-numeric: lining-nums; }
  .hero-years i{ flex: 1; height: 1px; background: linear-gradient(90deg, #e5c158, rgba(229, 193, 88, 0.25)); position: relative; }
  .hero-years i::after{ content: ''; position: absolute; left: 50%; top: -3px; width: 7px; height: 7px; transform: translateX(-50%) rotate(45deg); border: 1px solid #e5c158; background: #1a140c; }
  /* ornamentul dintre capitole */
  .ch-orn{ display: flex; justify-content: center; margin: 46px 0 10px; }
  .ch-orn svg{ width: 220px; height: 22px; overflow: visible; }
  .ch-orn path{ fill: none; stroke: rgba(229, 193, 88, 0.55); stroke-width: 1; }
  .ch-orn path.d{ fill: #1a1612; stroke: #c9a13a; }
  .ch-orn circle{ fill: #1a1612; stroke: #c9a13a; stroke-width: 1.2; }
  .ch-orn circle.i{ fill: none; stroke: rgba(229, 193, 88, 0.5); stroke-dasharray: 1.5 1.6; }
  /* citatele mari, între paragrafe */
  .pq{ position: relative; max-width: 760px; margin: 40px auto 44px; padding: 26px 30px 22px 74px; border-top: 1px solid rgba(229, 193, 88, 0.35); border-bottom: 1px solid rgba(229, 193, 88, 0.35); background: radial-gradient(ellipse at 20% 0%, rgba(229, 193, 88, 0.07), transparent 65%); }
  .pq::before{ content: '„'; position: absolute; left: 14px; top: -6px; font: 600 6.4rem/1 'Cormorant Garamond', serif; color: #c9a13a; opacity: 0.85; }
  .pq blockquote{ margin: 0; padding: 0; border: 0; background: none; }
  .pq blockquote p{ margin: 0; font: italic 500 clamp(1.35rem, 2.4vw, 1.75rem)/1.38 'Cormorant Garamond', Georgia, serif; color: #f1e6d0; text-wrap: balance; }
  .pq figcaption{ margin-top: 12px; font-size: 0.86rem; color: var(--ink-dim); }
  .pq figcaption b{ font: 600 0.92rem 'Cinzel', Georgia, serif; letter-spacing: 0.04em; color: #e5c158; }
  @media (max-width: 620px){ h1.title{ font-size: 2.5rem; } h1.title .t-sub{ font-size: 0.56em; } .hero-years{ font-size: 0.82rem; margin-bottom: 16px; } }
  @media (max-width: 620px){ .pq{ padding: 22px 16px 18px 50px; } .pq::before{ left: 6px; font-size: 4.6rem; } }
  /* Attila și Aetius: „VS” în mijloc */
  .duel{ position: relative; }
  .duel-vs{ display: grid !important; place-items: center; position: absolute; left: 52.38%; top: 0; z-index: 2; width: 58px; height: 58px; transform: translate(-50%, -50%) rotate(-6deg); border: 1px solid #c9a13a; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #2a2219, #14110d 70%); box-shadow: 0 0 0 5px var(--paper), 0 8px 20px rgba(0, 0, 0, 0.5); font: 700 1.1rem 'Cinzel', Georgia, serif; letter-spacing: 0.04em; color: #f2d474; text-transform: uppercase; }
  @media (max-width: 620px){ .duel-vs{ position: static; justify-self: center; margin: -29px 0; transform: rotate(-6deg); } }
  /* viețile lor, pe aceeași linie */
  .duel-lives{ max-width: 760px; margin: -6px auto 30px; padding: 16px 18px 12px; border: 1px solid var(--line-strong); background: color-mix(in srgb, var(--ink) 3%, transparent); }
  .dl-row, .dl-axis{ display: grid; grid-template-columns: 74px 1fr 92px; align-items: center; gap: 12px; }
  .dl-row{ margin-bottom: 9px; }
  .dl-row b{ font: 600 1.05rem 'Cormorant Garamond', serif; }
  .dl-row.attila b{ color: var(--accent); } .dl-row.aetius b{ color: var(--accent-2); }
  .dl-row em{ font: 0.78rem 'JetBrains Mono', monospace; font-style: normal; color: var(--ink-dim); }
  .dl-track{ position: relative; display: block; height: 10px; background: rgba(230, 215, 195, 0.06); }
  .dl-track i{ position: absolute; top: 0; bottom: 0; background: var(--c); opacity: 0.45; }
  .dl-track i.r{ opacity: 1; }
  .dl-row.attila{ --c: #e0626c; } .dl-row.aetius{ --c: #e5c158; }
  .dl-row.aetius .dl-track i{ opacity: 0.8; }
  .dl-axis{ margin-top: 4px; } .dl-axis .dl-track{ grid-column: 2; height: 34px; background: none; border-top: 1px solid rgba(230, 215, 195, 0.25); }
  .dl-axis small{ position: absolute; top: 4px; transform: translateX(-50%); font: 0.72rem 'JetBrains Mono', monospace; color: var(--ink-dim); }
  .dl-451{ position: absolute; top: -58px; bottom: 14px; width: 0; border-left: 1px dashed rgba(242, 212, 116, 0.8); }
  .dl-451 small{ top: auto; bottom: -16px; left: 0; transform: translateX(-100%); padding-right: 6px; color: #f2d474; font-weight: 700; white-space: nowrap; }
  .dl-key{ display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; margin: 2px 0 0 86px; font-size: 0.78rem; color: var(--ink-dim); }
  .dl-key span{ display: inline-block; width: 18px; height: 8px; background: #e0626c; opacity: 0.45; }
  .dl-key span.k2{ opacity: 1; margin-left: 8px; }
  @media (max-width: 620px){ .dl-row, .dl-axis{ grid-template-columns: 56px 1fr; } .dl-row em{ display: none; } .dl-key{ margin-left: 0; } .dl-axis small:not(.x){ font-size: 0.64rem; } }
  @media print{ .ch-orn, .duel-vs{ display: none !important; } .pq{ break-inside: avoid; } }
  /* /dp */
`;

for (const rel of ['index.html', 'atelierul-hunilor.html']) {
  const f = path.join(root, rel);
  const raw = fs.readFileSync(f, 'utf8'), crlf = raw.includes('\r\n');
  let s = raw.split('\r\n').join('\n');
  const fail = m => { console.error(rel + ': ' + m); process.exit(1); };
  const once = (x, msg) => { const i = s.indexOf(x); if (i < 0 || s.indexOf(x, i + 1) >= 0) fail(msg + ' (' + (i < 0 ? 'lipsește' : 'apare de mai multe ori') + ')'); return i; };

  // 1. titlul: „Invazia din Stepe” mare, restul pe rândul de dedesubt, apoi anii
  s = s.replace('<h1 class="title">Invazia din <em>Stepe</em>: Hunii și prăbușirea ordinii antice</h1>',
    '<h1 class="title">Invazia din <em>Stepe</em><span class="t-sep">: </span><span class="t-sub">Hunii și prăbușirea ordinii antice</span></h1>');
  once('<span class="t-sub">Hunii și prăbușirea ordinii antice</span></h1>', 'titlul');
  s = s.replace(/\n {6}<p class="hero-years"[^\n]*<\/p>/, '');
  const h1 = once('<span class="t-sub">Hunii și prăbușirea ordinii antice</span></h1>', 'titlul') + '<span class="t-sub">Hunii și prăbușirea ordinii antice</span></h1>'.length;
  s = s.slice(0, h1) + '\n      <p class="hero-years" aria-label="370–476"><span>370</span><i></i><span>476</span></p>' + s.slice(h1);

  // 2. ornamentele dintre capitole
  s = s.split(ORN).join('');
  ORN_BEFORE.forEach(id => { const i = s.lastIndexOf('\n', once('<section id="' + id + '"', id)) + 1; s = s.slice(0, i) + ORN + s.slice(i); });

  // 3. citatele mari
  s = s.replace(/ {6}<!-- pq:start -->.*?<!-- pq:end -->\n/g, '');
  PQ.forEach(p => { const i = once(p.before, 'locul citatului din ' + p.who); s = s.slice(0, i) + pqHtml(p) + s.slice(i); });

  // 4. viețile lui Attila și Aetius, sub fișe
  s = s.replace(/ {6}<div class="duel-lives"[^\n]*\n/, '');
  const gal = s.indexOf('<!-- pq:start --><figure class="pq"><blockquote><p>O luptă cumplită');
  if (gal < 0) fail('citatul din Iordanes');
  const at = s.lastIndexOf('\n', gal) + 1;
  s = s.slice(0, at) + LIVES + s.slice(at);

  // 5. stilurile, la sfârșitul ultimului <style>
  const c0 = s.indexOf('  /* dp: designul articolului */');
  if (c0 >= 0) { const e = '  /* /dp */\n'; s = s.slice(0, c0) + s.slice(s.indexOf(e, c0) + e.length); }
  const st = s.lastIndexOf('</style>');
  if (st < 0) fail('</style>');
  s = s.slice(0, st) + CSS + s.slice(st);

  fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
  console.log(rel + ': designul articolului');
}
