// Joc pe telefon: butoanele de miză au zonă de atingere de 44 px, iar nota despre miză
// trece pe rând propriu în loc să fie strivită într-o coloană îngustă.
const fs = require('fs'), path = require('path');
const CSS = `
  /* joc pe telefon: zone de atingere mari, notă de miză pe rând propriu */
  @media (max-width: 640px), (pointer: coarse){
    .m-game .wager-row{ flex-wrap: wrap; row-gap: 8px; }
    .m-game .wager-btn{ width: 44px; height: 44px; font-size: 1.3rem; }
    .m-game .wager-note{ flex: 1 1 100%; }
    .m-game .timer-toggle, .m-game .next-btn, .m-game .cta{ min-height: 44px; }
  }
`;
const marker = '  /* ============ MODULE: CAMPANIA HUNILOR (.m-game) ============ */';
// must come after the game CSS so it wins; append right before </style> of the game block instead
for (const f of ['index.html', 'atelierul-hunilor.html']) {
  const p = path.join(__dirname, '..', f);
  let s = fs.readFileSync(p, 'utf8').split('\r\n').join('\n');
  if (s.includes('joc pe telefon: zone de atingere')) { console.error(f + ': already applied'); process.exit(1); }
  const a = s.indexOf('.m-game .wager-btn{');
  if (a === -1) { console.error(f + ': wager css not found'); process.exit(1); }
  // end of the game CSS = the next module marker after it
  const nextMarker = s.indexOf('/* ============ MODULE', a);
  const at = nextMarker === -1 ? s.indexOf('</style>', a) : s.lastIndexOf('\n', nextMarker);
  s = s.slice(0, at) + '\n' + CSS + s.slice(at);
  fs.writeFileSync(p, s);
}
console.log('joc: atingere pe telefon');
