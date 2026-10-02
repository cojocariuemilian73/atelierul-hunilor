// Campania Hunilor: every campaign ended with the same bonus round (the pin on
// the timeline), so the four campaigns felt like one game played four times.
// Each campaign now ends with its own mini-game, tied to its theme:
//   I   Izvoare grecești și romane → potrivește autorul cu opera
//   II  Istoriografie              → dovadă sau ipoteză?
//   III Marea Migrație             → ordinea cronologică a evenimentelor
//   IV  Attila și Aetius           → pionul pe linia timpului (ca înainte)
// All three new games are played with clicks/taps and the keyboard (no
// dragging), and pay solidi like the timeline: 5 for a perfect round, 2 for
// at least half right.
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

// ---------- markup: one panel shared by the three new games ----------
edit(path.join(B, 'game.body.html'), [
  ['  <div class="panel" id="level-complete">',
   '  <div class="panel" id="bonus-panel" hidden>\n' +
   '    <p class="yr-intro" id="bn-kicker">Minijoc</p>\n' +
   '    <p class="yr-q" id="bn-title">—</p>\n' +
   '    <p class="yr-hint bn-hint" id="bn-hint">—</p>\n' +
   '    <div class="bn-board" id="bn-board"></div>\n' +
   '    <div class="yr-lock-row"><button class="cta" id="bn-check" type="button" disabled>Verifică</button></div>\n' +
   '    <div class="yr-result" id="bn-result" aria-live="polite">\n' +
   '      <span class="tag" id="bn-tag">—</span>\n' +
   '      <span id="bn-fb"></span>\n' +
   '    </div>\n' +
   '    <div class="next-row" style="justify-content:center; margin-top:16px;">\n' +
   '      <button class="next-btn" id="bn-next" type="button" style="display:none;">Continuă →</button>\n' +
   '    </div>\n' +
   '  </div>\n\n' +
   '  <div class="panel" id="level-complete">'],
]);

// ---------- logic ----------
const BONUS_JS = `
  // ============================================================
  // MINIJOCURI BONUS — câte unul diferit la finalul campaniilor I–III
  // (Campania IV păstrează pionul pe linia timpului, renderYearPanel)
  // ============================================================

  var BONUS = [
    {
      type: 'match',
      name: 'Potrivește izvoarele',
      title: 'Leagă fiecare autor antic de opera în care vorbește despre huni.',
      hint: 'Apasă pe un autor, apoi pe opera lui. Poți schimba perechile oricât, până apeși „Verifică”.',
      pairs: [
        ['Ptolemeu (sec. II)', 'Geografia: „Khounoi”, între bastarni și roxolani'],
        ['Ammianus Marcellinus (c. 390)', 'Res Gestae: hunii, „dincolo de mlaștinile Meotide”'],
        ['Priscus din Panium (sec. V)', 'Istoria: solia la curtea lui Attila, în 449'],
        ['Iordanes (551)', 'Getica: istoria goților și bătălia de la Câmpiile Catalaunice']
      ],
      fb: 'Ptolemeu și Ammianus sunt cele două izvoare ale acestei campanii. Priscus este singurul martor ocular de la curtea lui Attila (vezi Solia), iar Iordanes scrie un secol mai târziu, folosind printre altele relatarea lui Priscus.'
    },
    {
      type: 'sort',
      name: 'Dovadă sau ipoteză?',
      title: 'Ce știm sigur și ce rămâne doar ipoteză despre legătura Xiongnu–huni?',
      hint: 'Pentru fiecare afirmație alege „Dovadă” (atestată de un izvor sau de o descoperire) sau „Ipoteză” (o interpretare nedovedită).',
      labels: ['Dovadă', 'Ipoteză'],
      items: [
        { t: 'O scrisoare sogdiană de pe la 313 îi numește „Xwn” pe cei care distruseseră orașul Luoyang.', a: 0,
          why: 'Scrisoarea există și poate fi citită. Ce nu știm sigur este dacă acei „Xwn” sunt strămoșii hunilor europeni.' },
        { t: 'Elita hunilor lui Attila descinde direct din conducătorii Xiongnu.', a: 1,
          why: 'Nu există nicio dovadă a unei continuități directe a elitei sau a instituțiilor.' },
        { t: 'Unii huni îngropați în Bazinul Carpatic aveau o ascendență est-asiatică ce poate fi urmărită până în spațiul Xiongnu.', a: 0,
          why: 'Asta arată studiile genetice (Neparáczki et al. 2019, Maróti et al. 2022): o legătură de populație, nu o genealogie a regilor.' },
        { t: 'Hunii au migrat compact, ca un singur popor, din Mongolia până la Volga.', a: 1,
          why: 'Nu există dovezi ale unei migrații compacte; drumul spre vest a fost, cel mai probabil, lung și cu multe amestecuri.' },
        { t: 'Faptul că numele „Xiongnu” și „huni” seamănă dovedește că sunt același popor.', a: 1,
          why: 'Asemănarea numelor a fost argumentul lui De Guignes (1756), dar un nume prestigios poate fi preluat de popoare diferite.' }
      ],
      fb: 'Concluzia campaniei: legătură de populație probabilă, descendență directă a elitei nedovedită.'
    },
    {
      type: 'order',
      name: 'Ordinea evenimentelor',
      title: 'Așază în ordine cronologică pașii prin care hunii au pus în mișcare Marea Migrație.',
      hint: 'Mută evenimentele cu săgețile ↑ ↓, de la cel mai vechi (sus) la cel mai nou (jos), apoi apasă „Verifică”.',
      items: [
        { t: 'Hunii îi supun pe alanii de lângă Don', y: 'c. 370' },
        { t: 'Cade regatul greutungilor lui Ermanaric', y: 'c. 375' },
        { t: 'Tervingii trec Dunărea în Imperiul Roman', y: '376' },
        { t: 'Bătălia de la Adrianopol: împăratul Valens moare', y: '378' },
        { t: 'Vizigoții lui Alaric jefuiesc Roma', y: '410' }
      ],
      fb: 'Lanțul se vede în izvoare: presiunea hunilor împinge alanii și goții spre Dunăre, criza goților din Imperiu duce la Adrianopol, iar peste o generație Roma însăși este jefuită.'
    }
  ];

  var bonusPanel = document.getElementById('bonus-panel');
  var bnKicker = document.getElementById('bn-kicker');
  var bnTitle = document.getElementById('bn-title');
  var bnHint = document.getElementById('bn-hint');
  var bnBoard = document.getElementById('bn-board');
  var bnCheck = document.getElementById('bn-check');
  var bnResult = document.getElementById('bn-result');
  var bnTag = document.getElementById('bn-tag');
  var bnFb = document.getElementById('bn-fb');
  var bnNext = document.getElementById('bn-next');
  var bn = null; // starea minijocului curent

  function shuffled(n){
    var a = [];
    for (var i = 0; i < n; i++) a.push(i);
    for (var j = n - 1; j > 0; j--) { var k = Math.floor(Math.random() * (j + 1)); var t = a[j]; a[j] = a[k]; a[k] = t; }
    return a;
  }
  function el(tag, cls, text){
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function renderBonusPanel(){
    var g = BONUS[state.levelIndex];
    bn = { g: g, done: false };
    bnKicker.textContent = 'Minijoc · ' + g.name;
    bnTitle.textContent = g.title;
    bnHint.textContent = g.hint;
    bnBoard.innerHTML = '';
    bnBoard.className = 'bn-board bn-' + g.type;
    bnResult.classList.remove('show');
    bnCheck.hidden = false;
    bnNext.style.display = 'none';
    if (g.type === 'match') buildMatch(g);
    else if (g.type === 'sort') buildSort(g);
    else buildOrder(g);
    updateBonusCheck();

    hideAllPanels();
    campaignMap.hidden = false;
    bonusPanel.hidden = false;
  }

  // --- potrivire: autor → operă ---
  function buildMatch(g){
    bn.pick = -1;             // autorul selectat
    bn.link = g.pairs.map(function(){ return -1; }); // autor → operă aleasă
    bn.rightOrder = shuffled(g.pairs.length);
    var left = el('div', 'bn-col'), right = el('div', 'bn-col');
    bn.leftBtns = g.pairs.map(function(p, i){
      var b = el('button', 'bn-item bn-left');
      b.type = 'button';
      b.appendChild(el('span', 'bn-num', ''));
      b.appendChild(el('span', 'bn-txt', p[0]));
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function(){ if (bn.done) return; bn.pick = (bn.pick === i) ? -1 : i; paintMatch(); });
      left.appendChild(b);
      return b;
    });
    bn.rightBtns = [];
    bn.rightOrder.forEach(function(w){
      var b = el('button', 'bn-item bn-right');
      b.type = 'button';
      b.appendChild(el('span', 'bn-num', ''));
      b.appendChild(el('span', 'bn-txt', g.pairs[w][1]));
      b.addEventListener('click', function(){
        if (bn.done) return;
        var owner = bn.link.indexOf(w);
        if (bn.pick === -1) { if (owner !== -1) bn.link[owner] = -1; }
        else { if (owner !== -1) bn.link[owner] = -1; bn.link[bn.pick] = w; bn.pick = -1; }
        paintMatch();
      });
      bn.rightBtns[w] = b;
      right.appendChild(b);
    });
    left.insertBefore(el('p', 'bn-colhead', 'Autor'), left.firstChild);
    right.insertBefore(el('p', 'bn-colhead', 'Operă'), right.firstChild);
    bnBoard.appendChild(left);
    bnBoard.appendChild(right);
    paintMatch();
  }
  function paintMatch(){
    bn.leftBtns.forEach(function(b, i){
      var w = bn.link[i];
      b.classList.toggle('picked', bn.pick === i);
      b.setAttribute('aria-pressed', bn.pick === i ? 'true' : 'false');
      b.classList.toggle('linked', w !== -1);
      b.querySelector('.bn-num').textContent = w !== -1 ? String(i + 1) : '';
    });
    bn.rightBtns.forEach(function(b, w){
      var owner = bn.link.indexOf(w);
      b.classList.toggle('linked', owner !== -1);
      b.querySelector('.bn-num').textContent = owner !== -1 ? String(owner + 1) : '';
    });
    updateBonusCheck();
  }

  // --- sortare: dovadă / ipoteză ---
  function buildSort(g){
    bn.choice = g.items.map(function(){ return -1; });
    bn.rows = g.items.map(function(it, i){
      var row = el('div', 'bn-row');
      row.appendChild(el('p', 'bn-txt', it.t));
      var btns = el('div', 'bn-choices');
      row.btns = g.labels.map(function(lab, c){
        var b = el('button', 'bn-choice', lab);
        b.type = 'button';
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function(){
          if (bn.done) return;
          bn.choice[i] = c;
          row.btns.forEach(function(x, k){ x.classList.toggle('on', k === c); x.setAttribute('aria-pressed', k === c ? 'true' : 'false'); });
          updateBonusCheck();
        });
        btns.appendChild(b);
        return b;
      });
      row.appendChild(btns);
      bnBoard.appendChild(row);
      return row;
    });
  }

  // --- ordonare cronologică ---
  function buildOrder(g){
    var n = g.items.length, order;
    do { order = shuffled(n); } while (order.every(function(v, i){ return v === i; }));
    bn.order = order;
    bn.list = el('ol', 'bn-list');
    bnBoard.appendChild(bn.list);
    paintOrder(-1);
  }
  function paintOrder(focusIdx, focusDir){
    var g = bn.g;
    bn.list.innerHTML = '';
    bn.order.forEach(function(item, pos){
      var li = el('li', 'bn-row bn-orow');
      li.appendChild(el('span', 'bn-pos', String(pos + 1)));
      li.appendChild(el('span', 'bn-txt', g.items[item].t));
      var ctl = el('span', 'bn-ctl');
      [['↑', -1, 'mai devreme'], ['↓', 1, 'mai târziu']].forEach(function(d){
        var b = el('button', 'bn-move', d[0]);
        b.type = 'button';
        b.setAttribute('aria-label', 'Mută „' + g.items[item].t + '” ' + d[2]);
        b.disabled = bn.done || pos + d[1] < 0 || pos + d[1] >= bn.order.length;
        b.addEventListener('click', function(){
          var to = pos + d[1];
          var t = bn.order[pos]; bn.order[pos] = bn.order[to]; bn.order[to] = t;
          paintOrder(to, d[1]);
        });
        ctl.appendChild(b);
        if (focusIdx === pos && focusDir === d[1]) setTimeout(function(){ (b.disabled ? ctl.querySelector('button:not([disabled])') : b).focus(); }, 0);
      });
      li.appendChild(ctl);
      bn.list.appendChild(li);
      li.dataset.item = item;
    });
  }

  function updateBonusCheck(){
    var g = bn.g, ready = true;
    if (g.type === 'match') ready = bn.link.every(function(w){ return w !== -1; });
    else if (g.type === 'sort') ready = bn.choice.every(function(c){ return c !== -1; });
    bnCheck.disabled = !ready;
  }

  bnCheck.addEventListener('click', function(){
    if (!bn || bn.done || bnCheck.disabled) return;
    bn.done = true;
    bnCheck.hidden = true;
    var g = bn.g, right = 0, total = 0;
    if (g.type === 'match') {
      total = g.pairs.length;
      bn.leftBtns.forEach(function(b, i){
        var ok = bn.link[i] === i;
        if (ok) right++;
        b.classList.add(ok ? 'correct' : 'wrong');
        bn.rightBtns[bn.link[i]].classList.add(ok ? 'correct' : 'wrong');
        if (!ok) b.appendChild(el('span', 'bn-why', 'Corect: ' + g.pairs[i][1]));
        b.disabled = true;
      });
      bn.rightBtns.forEach(function(b){ b.disabled = true; });
    } else if (g.type === 'sort') {
      total = g.items.length;
      bn.rows.forEach(function(row, i){
        var ok = bn.choice[i] === g.items[i].a;
        if (ok) right++;
        row.classList.add(ok ? 'correct' : 'wrong');
        row.btns.forEach(function(b){ b.disabled = true; });
        row.appendChild(el('p', 'bn-why', (ok ? '' : 'Răspuns corect: ' + g.labels[g.items[i].a] + '. ') + g.items[i].why));
      });
    } else {
      total = g.items.length;
      paintOrder(-1);
      Array.prototype.forEach.call(bn.list.children, function(li, pos){
        var item = +li.dataset.item, ok = item === pos;
        if (ok) right++;
        li.classList.add(ok ? 'correct' : 'wrong');
        li.querySelector('.bn-txt').appendChild(el('span', 'bn-year', ' · ' + g.items[item].y + (ok ? '' : ' (locul corect: ' + (item + 1) + ')')));
      });
    }
    var reward = 0, tag;
    if (right === total) { reward = 5; tag = 'Perfect'; }
    else if (right * 2 >= total) { reward = 2; tag = 'Aproape'; }
    else { tag = 'Pe alături'; }
    state.coins += reward;
    coinPill.textContent = state.coins + ' solidi';
    bnTag.textContent = tag + ': ' + right + ' din ' + total + (reward > 0 ? ' (+' + reward + ' solidi)' : '');
    bnFb.textContent = g.fb;
    bnResult.classList.add('show');
    bnNext.style.display = 'inline-block';
    if (reward === 5) spawnSparks(18);
  });

  bnNext.addEventListener('click', showLevelComplete);
`;

edit(path.join(B, 'game.js'), [
  // the bonus panel is one more panel to hide
  ['    yearPanel.hidden = true;\n    quizPanel.hidden = true;\n',
   '    yearPanel.hidden = true;\n    if (bonusPanel) bonusPanel.hidden = true;\n    quizPanel.hidden = true;\n'],
  // after the last question: the campaign's own mini-game, or the timeline
  ['    if (state.qIndex >= lv.questions.length) {\n      renderYearPanel();\n',
   '    if (state.qIndex >= lv.questions.length) {\n      if (BONUS[state.levelIndex]) renderBonusPanel(); else renderYearPanel();\n'],
  // the intro says which mini-game closes the campaign
  ['    liMeta.textContent = lv.meta;\n',
   '    liMeta.textContent = lv.meta + ' + "' · minijoc: '" + ' + (BONUS[state.levelIndex] ? BONUS[state.levelIndex].name : ' + "'Linia timpului'" + ');\n'],
  ['  yrNext.addEventListener(\'click\', showLevelComplete);\n',
   '  yrNext.addEventListener(\'click\', showLevelComplete);\n' + BONUS_JS],
]);

// ---------- styles (module stylesheet + its scoped copy) ----------
const RULES = [
  '#bonus-panel{ padding: clamp(24px, 6vw, 40px); margin-top: 10px; }',
  '#bonus-panel[hidden]{ display: none; }',
  '.bn-hint{ margin-bottom: 18px; }',
  '.bn-board{ margin: 0 0 18px; }',
  '.bn-match{ display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }',
  '.bn-col{ display: flex; flex-direction: column; gap: 8px; }',
  '.bn-colhead{ font-family: \'JetBrains Mono\', monospace; font-size: 0.66rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-dim2); margin: 0 0 2px; }',
  '.bn-item{ display: flex; align-items: flex-start; flex-wrap: wrap; gap: 8px; text-align: left; font: inherit; font-size: 0.9rem; line-height: 1.4; color: var(--ink); background: var(--surface-2); border: 1px solid var(--line-bright); border-radius: 2px; padding: 10px 12px; cursor: pointer; }',
  '.bn-item:hover:not(:disabled){ border-color: var(--gold-dim); }',
  '.bn-item:focus-visible, .bn-choice:focus-visible, .bn-move:focus-visible{ outline: 2px solid var(--gold); outline-offset: 2px; }',
  '.bn-item.picked{ border-color: var(--gold); box-shadow: 0 0 0 1px var(--gold); }',
  '.bn-item.linked{ background: var(--surface-3); }',
  '.bn-num{ flex: 0 0 22px; height: 22px; border-radius: 50%; border: 1px dashed var(--line-bright); font-family: \'JetBrains Mono\', monospace; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; color: #121214; }',
  '.bn-item.linked .bn-num{ background: var(--gold); border: none; }',
  '.bn-item .bn-txt{ flex: 1; min-width: 0; }',
  '.bn-item:disabled{ cursor: default; }',
  '.bn-item.correct, .bn-row.correct{ border-color: var(--good); background: var(--good-bg); }',
  '.bn-item.wrong, .bn-row.wrong{ border-color: var(--bad); background: var(--bad-bg); }',
  '.bn-why{ flex-basis: 100%; display: block; font-size: 0.8rem; line-height: 1.45; color: var(--ink-dim2); margin: 6px 0 0; }',
  '.bn-sort{ display: flex; flex-direction: column; gap: 10px; }',
  '.bn-row{ border: 1px solid var(--line-bright); border-radius: 2px; background: var(--surface-2); padding: 12px 14px; }',
  '.bn-row > .bn-txt{ margin: 0 0 10px; font-size: 0.92rem; line-height: 1.45; }',
  '.bn-choices{ display: flex; gap: 8px; flex-wrap: wrap; }',
  '.bn-choice{ font-family: \'JetBrains Mono\', monospace; font-size: 0.74rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--ink); background: transparent; border: 1px solid var(--line-bright); border-radius: 2px; padding: 8px 14px; cursor: pointer; }',
  '.bn-choice.on{ background: var(--gold); border-color: var(--gold); color: #121214; }',
  '.bn-choice:disabled{ cursor: default; }',
  '.bn-list{ list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }',
  '.bn-orow{ display: flex; align-items: center; gap: 12px; padding: 10px 12px; }',
  '.bn-pos{ flex: 0 0 26px; height: 26px; border-radius: 50%; background: var(--surface-3); font-family: \'JetBrains Mono\', monospace; font-weight: 700; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; color: var(--gold); }',
  '.bn-orow .bn-txt{ flex: 1; min-width: 0; font-size: 0.92rem; line-height: 1.4; }',
  '.bn-year{ font-family: \'JetBrains Mono\', monospace; font-size: 0.78rem; font-weight: 700; color: var(--gold); }',
  '.bn-ctl{ display: flex; gap: 6px; flex-shrink: 0; }',
  '.bn-move{ width: 36px; height: 36px; font-size: 1rem; font-weight: 700; color: var(--ink); background: var(--surface-3); border: 1px solid var(--line-bright); border-radius: 2px; cursor: pointer; }',
  '.bn-move:disabled{ opacity: 0.3; cursor: default; }',
  '.bn-orow.correct .bn-ctl, .bn-orow.wrong .bn-ctl{ display: none; }',
  '@media (max-width: 640px){ .bn-match{ grid-template-columns: 1fr; } }',
];
fs.appendFileSync(path.join(B, 'game.css'), '\n  /* ---------- MINIJOCURI BONUS ---------- */\n' + RULES.map(r => '  ' + r).join('\n') + '\n');
function scope(rule){
  if (rule.startsWith('@media')) return rule.replace(/\{ (.*) \}$/, (m, inner) => '{ ' + scope(inner) + ' }');
  const brace = rule.indexOf('{');
  return rule.slice(0, brace).split(', ').map(sel => '.m-game ' + sel.trim()).join(', ') + ' ' + rule.slice(brace);
}
fs.appendFileSync(path.join(B, 'game.scoped.css'), '\n' + RULES.map(r => '  ' + scope(r)).join('\n') + '\n');
console.log('game: one mini-game per campaign (match, sort, order, timeline)');
