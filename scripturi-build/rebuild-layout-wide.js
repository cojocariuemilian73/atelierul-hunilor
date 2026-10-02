// Wide screens: every page kept its content in a narrow centred column (the
// game at 720px, the Solia at 980px, the museum at 1100px), so on a 1920px
// monitor most of the screen was empty. From 1200px up the pages now use
// more of the width, and the extra room is filled with layout rather than
// longer lines: picture beside text in the Solia and on the campaign intros,
// a list of the four campaigns beside the game's start button, three columns
// of museum pieces. Phones and small laptops are unchanged.
const fs = require('fs');
const path = require('path');
const B = path.join(__dirname, '..', 'build');

function edit(file, pairs){
  let s = fs.readFileSync(file, 'utf8');
  for (const [from, to] of pairs) {
    if (!s.includes(from)) { console.error('not found in ' + path.basename(file) + ': ' + from.slice(0, 70)); process.exit(1); }
    s = s.split(from).join(to);
  }
  fs.writeFileSync(file, s);
}

// Rules are written unscoped; for the combined page each selector gets the
// module class in front (inside @media blocks too).
function scopeRule(rule, scope){
  const m = rule.match(/^(@media[^{]+)\{ ([\s\S]*) \}$/);
  if (m) return m[1] + '{ ' + m[2].split(/(?<=\})\s+/).map(r => scopeRule(r, scope)).join(' ') + ' }';
  const brace = rule.indexOf('{');
  return rule.slice(0, brace).split(',').map(sel => '.' + scope + ' ' + sel.trim()).join(', ') + ' ' + rule.slice(brace);
}
function appendCss(mod, scope, rules){
  fs.appendFileSync(path.join(B, mod + '.css'), '\n  /* ecrane late */\n' + rules.map(r => '  ' + r).join('\n') + '\n');
  if (scope) fs.appendFileSync(path.join(B, mod + '.scoped.css'), '\n' + rules.map(r => '  ' + scopeRule(r, scope)).join('\n') + '\n');
}

// ---------- Campania Hunilor ----------
edit(path.join(B, 'game.body.html'), [
  ['<div class="panel start-panel" id="start-panel">\n',
   '<div class="panel start-panel" id="start-panel">\n    <div class="sp-main">\n'],
  ['o scrisoare sogdiană din 311 d.Hr.</p>\n  </div>',
   'o scrisoare sogdiană din 311 d.Hr.</p>\n    </div>\n    <ol class="sp-camps" id="sp-camps" aria-label="Cele patru campanii"></ol>\n  </div>'],
]);
edit(path.join(B, 'game.js'), [
  ['  bnNext.addEventListener(\'click\', showLevelComplete);\n',
   '  bnNext.addEventListener(\'click\', showLevelComplete);\n\n' +
   '  // Pe ecranul de start: cele patru campanii, cu tema și minijocul fiecăreia.\n' +
   '  (function(){\n' +
   '    var list = document.getElementById(\'sp-camps\');\n' +
   '    if (!list) return;\n' +
   '    LEVELS.forEach(function(lv, i){\n' +
   '      var li = el(\'li\', \'sp-camp\');\n' +
   '      var ic = el(\'span\', \'sp-icon\', lv.icon);\n' +
   '      ic.style.background = \'var(--\' + lv.zone + \'-bg)\';\n' +
   '      li.appendChild(ic);\n' +
   '      var tx = el(\'span\', \'sp-text\');\n' +
   '      tx.appendChild(el(\'span\', \'sp-kicker\', lv.kicker));\n' +
   '      tx.appendChild(el(\'span\', \'sp-title\', lv.title));\n' +
   '      tx.appendChild(el(\'span\', \'sp-meta\', lv.questions.length + \' întrebări · minijoc: \' + (BONUS[i] ? BONUS[i].name : \'Linia timpului\')));\n' +
   '      li.appendChild(tx);\n' +
   '      list.appendChild(li);\n' +
   '    });\n' +
   '  })();\n'],
]);
appendCss('game', 'm-game', [
  '.sp-camps{ list-style: none; margin: 26px 0 0; padding: 0; display: grid; gap: 10px; text-align: left; }',
  '.sp-camp{ display: flex; gap: 14px; align-items: center; padding: 12px 14px; background: var(--surface-2); border: 1px solid var(--line-bright); border-radius: 2px; }',
  '.sp-icon{ flex: 0 0 44px; height: 44px; display: flex; align-items: center; justify-content: center; font-family: \'Cinzel\', serif; font-weight: 700; font-size: 1.05rem; color: var(--gold); clip-path: polygon(50% 0%, 100% 22%, 100% 78%, 50% 100%, 0% 78%, 0% 22%); }',
  '.sp-text{ display: flex; flex-direction: column; gap: 2px; min-width: 0; }',
  '.sp-kicker{ font-family: \'JetBrains Mono\', monospace; font-size: 0.64rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ember); }',
  '.sp-title{ font-family: \'Cinzel\', serif; font-weight: 700; font-size: 1.02rem; color: var(--ink); }',
  '.sp-meta{ font-size: 0.8rem; color: var(--ink-dim2); }',
  '@media (min-width: 1200px){ .wrap{ max-width: 1160px; } .start-panel{ display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 40px; align-items: center; } .sp-camps{ margin-top: 0; } .sp-main{ text-align: center; } }',
  '@media (min-width: 1200px){ #level-intro:has(> .li-fig:not([hidden])){ display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); column-gap: 36px; align-items: start; } #level-intro:has(> .li-fig:not([hidden])) > *{ grid-column: 1; } #level-intro:has(> .li-fig:not([hidden])) > .li-fig{ grid-column: 2; grid-row: 1 / span 6; margin: 0; } .li-fig img{ height: 380px; } }',
  // the shooting range keeps about the height it had in the 720px column, so
  // the answers stay on screen
  '@media (min-width: 1200px){ .range{ aspect-ratio: 3 / 1; } }',
  '@media (min-width: 1200px){ .bn-sort{ display: grid; grid-template-columns: 1fr 1fr; } .bn-list{ max-width: 860px; margin: 0 auto; } }',
]);

// ---------- Solia la Attila: picture on the left, story and choices on the right ----------
appendCss('embassy', 'm-embassy', [
  '@media (min-width: 1200px){ .wrap{ max-width: 1240px; } #stage-view:has(> .stage-fig){ display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); column-gap: 36px; align-items: start; } #stage-view:has(> .stage-fig) > *{ grid-column: 2; } #stage-view:has(> .stage-fig) > .stage-fig{ grid-column: 1; grid-row: 1 / span 8; margin: 0; position: sticky; top: 80px; } #stage-view .stage-fig img{ max-height: 520px; } }',
]);

// ---------- Muzeu: wider, three pieces per row ----------
appendCss('lab', 'm-lab', [
  '@media (min-width: 1200px){ .wrap{ max-width: 1440px; } }',
  '@media (min-width: 1300px){ .artifact-grid{ grid-template-columns: repeat(3, 1fr); } }',
  // 15 myth cards: five per row fills three rows exactly
  '@media (min-width: 1400px){ .flip-grid{ grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 18px; } }',
]);

// ---------- Acasă / Articol: use more of very wide screens ----------
appendCss('story', null, [
  '@media (min-width: 1700px){ .page-shell{ max-width: 1680px; grid-template-columns: 240px minmax(0, 1240px); } .main-col{ max-width: 1240px; } .hero-inner{ max-width: 1480px; } }',
]);

console.log('wide-screen layout applied to game, embassy, lab and story');
