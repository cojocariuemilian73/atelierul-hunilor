// Solia la Attila: sub analiza fiecărei etape apare izvorul pe care se sprijină etapa.
const fs = require('fs'), path = require('path');
const MAIN = 'Priscus din Panium, relatarea soliei la Attila din 449, păstrată în fragmente (Excerpta de legationibus)';
const SRC = [MAIN, MAIN, MAIN, MAIN, MAIN, MAIN, MAIN, MAIN,
  'Priscus din Panium, fragmentele despre domnia lui Marcian (refuzul tributului, 450)'];
const CSS = "\n  .m-embassy .explain-src{ margin: 10px 0 0; padding-top: 8px; border-top: 1px dashed rgba(212,175,55,0.35); font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; line-height: 1.55; color: #b8902a; }\n  html[data-theme=\"dark\"] .m-embassy .explain-src{ color: #e5c158; }\n  @media (prefers-color-scheme: dark){ html:not([data-theme=\"light\"]) .m-embassy .explain-src{ color: #e5c158; } }\n";
for (const f of ['index.html', 'atelierul-hunilor.html']) {
  const p = path.join(__dirname, '..', f);
  let s = fs.readFileSync(p, 'utf8').split('\r\n').join('\n');
  if (s.includes('explain-src')) { console.error(f + ': already applied'); process.exit(1); }
  const rep = (a, b, w) => { if (!s.includes(a)) { console.error(f + ': not found ' + w); process.exit(1); } s = s.replace(a, b); };
  rep("  var STAGES = [", "  var STAGE_SRC = " + JSON.stringify(SRC) + ";\n  var STAGES = [", 'STAGES');
  rep("      '<p class=\"explain\">' + choice.explain + '</p>' +\n",
      "      '<p class=\"explain\">' + choice.explain + '</p>' +\n      (STAGE_SRC[state.stage] ? '<p class=\"explain-src\">Sursa: ' + STAGE_SRC[state.stage] + '</p>' : '') +\n", 'explain');
  const marker = '  /* ============ MODULE: CAMPANIA HUNILOR (.m-game) ============ */';
  rep(marker, CSS + marker, 'css');
  fs.writeFileSync(p, s);
  console.log(f + ': surse în Solie');
}
