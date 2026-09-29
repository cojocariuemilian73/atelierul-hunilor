// Redesigns the Campania Hunilor shooting range.
//
// Before: a mostly empty dark box with four small circles and an "ARC" text
// chip; the answers (some over 200 characters long) were squeezed into tiny
// labels hanging off the targets, overlapping each other and the box edges.
//
// Now: the range is a scene — dusk over the steppe, a ground plane, painted
// straw targets on stands at different distances — and the weapon is drawn:
// an asymmetric composite bow (the Hunnic type, longer upper limb) that turns
// with the aim, its string pulled back while you draw. The answers sit in a
// clear A–D list under the scene; the target you are aiming at lights up its
// answer card, and every card is also a button, so a question can be answered
// by aiming, by clicking the card, or from the keyboard.
const fs = require('fs');
const path = require('path');
const B = path.join(__dirname, '..', 'build');
const BODY = path.join(B, 'game.body.html');
const CSS = path.join(B, 'game.css');
const JS = path.join(B, 'game.js');

function mustReplace(src, from, to, what){
  if (!src.includes(from)) { console.error('not found: ' + what); process.exit(1); }
  return src.replace(from, to);
}

// ---------------- BODY ----------------
let body = fs.readFileSync(BODY, 'utf8');
body = mustReplace(body,
`      <div class="range" id="range">
        <div class="range-weapon" id="range-weapon">ARC</div>
        <div class="aim-line" id="aim-line"></div>
        <div class="nock" id="nock"></div>
        <div class="range-targets" id="range-targets"></div>
      </div>`,
`      <div class="range" id="range">
        <div class="range-sky" aria-hidden="true"></div>
        <div class="range-hills" aria-hidden="true"></div>
        <div class="range-ground" aria-hidden="true"></div>
        <div class="range-targets" id="range-targets"></div>
        <div class="aim-line" id="aim-line"></div>
        <div class="nock" id="nock"></div>
        <div class="range-weapon" id="range-weapon" aria-hidden="true"></div>
        <p class="range-hint" id="range-hint" aria-hidden="true">Trage înapoi din armă, țintește și eliberează</p>
      </div>
      <div class="answer-list" id="answer-list" role="group" aria-label="Variante de răspuns"></div>`,
  'range markup');
fs.writeFileSync(BODY, body);
console.log('game.body.html: scenă + listă de răspunsuri');

// ---------------- CSS ----------------
let css = fs.readFileSync(CSS, 'utf8');
const cStart = css.indexOf('  .range{\n');
const cEndStr = '  @media (prefers-reduced-motion: reduce){ .range-weapon{ transition: none; } }\n';
const cEnd = css.indexOf(cEndStr);
if (cStart === -1 || cEnd === -1) { console.error('range css not found'); process.exit(1); }

// Low hills on the horizon (inline SVG, drawn once).
const hills = "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 120" preserveAspectRatio="none">' +
  '<path d="M0,80 C120,52 220,70 330,58 C450,44 540,72 660,60 C790,46 880,30 1000,48 C1120,66 1230,40 1350,50 C1450,58 1530,46 1600,52 L1600,120 L0,120 Z" fill="#2a2230"/>' +
  '<path d="M0,96 C160,80 280,94 420,86 C560,78 700,98 860,88 C1010,78 1150,92 1290,84 C1420,76 1520,90 1600,86 L1600,120 L0,120 Z" fill="#221c20"/>' +
  '</svg>');

const newCss = `  .range{
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 8;
    border: 1px solid var(--line-bright);
    border-radius: 3px;
    overflow: hidden;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    cursor: crosshair;
    margin: 0 0 14px;
    background: #16141a;
    box-shadow: inset 0 0 0 1px rgba(0,0,0,0.6), 0 10px 30px rgba(0,0,0,0.35);
  }
  .range-sky{
    position: absolute; inset: 0 0 38% 0;
    background:
      radial-gradient(ellipse 22% 38% at 80% 100%, rgba(230, 126, 34, 0.55), rgba(230, 126, 34, 0) 70%),
      radial-gradient(ellipse 60% 70% at 78% 105%, rgba(167, 29, 42, 0.35), rgba(167, 29, 42, 0) 70%),
      linear-gradient(180deg, #121214 0%, #1c1822 45%, #3a2630 78%, #6b3b26 100%);
  }
  .range-sky::after{ /* a few stars */
    content: ''; position: absolute; inset: 0;
    background-image:
      radial-gradient(1px 1px at 12% 18%, rgba(230,215,195,0.7), transparent 60%),
      radial-gradient(1px 1px at 27% 34%, rgba(230,215,195,0.45), transparent 60%),
      radial-gradient(1.2px 1.2px at 46% 12%, rgba(230,215,195,0.6), transparent 60%),
      radial-gradient(1px 1px at 63% 28%, rgba(230,215,195,0.4), transparent 60%),
      radial-gradient(1px 1px at 88% 14%, rgba(230,215,195,0.55), transparent 60%),
      radial-gradient(1px 1px at 94% 40%, rgba(230,215,195,0.35), transparent 60%);
  }
  .range-hills{
    position: absolute; left: 0; right: 0; top: 50%; height: 14%;
    background: url("${hills}") center bottom / 100% 100% no-repeat;
  }
  .range-ground{
    position: absolute; left: 0; right: 0; bottom: 0; top: 62%;
    background:
      linear-gradient(180deg, rgba(18,18,20,0) 0%, rgba(18,18,20,0.55) 100%),
      linear-gradient(180deg, #2b2418 0%, #221c14 55%, #1a1610 100%);
    overflow: hidden;
  }
  .range-ground::before{ /* distance lines receding to the horizon */
    content: ''; position: absolute; left: -40%; right: -40%; top: 0; bottom: -60%;
    background:
      repeating-linear-gradient(90deg, rgba(212,175,55,0.10) 0 1px, transparent 1px 9%),
      repeating-linear-gradient(180deg, rgba(212,175,55,0.08) 0 1px, transparent 1px 18%);
    transform: perspective(260px) rotateX(58deg);
    transform-origin: 50% 0;
  }
  .range-hint{
    position: absolute; left: 50%; top: 5%; transform: translateX(-50%); margin: 0; z-index: 5; white-space: nowrap;
    font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; letter-spacing: 0.04em;
    color: var(--gold); background: rgba(18,18,20,0.72); border: 1px solid rgba(212,175,55,0.35);
    padding: 4px 8px; border-radius: 2px; pointer-events: none;
    transition: opacity 0.25s ease;
  }
  .range.is-aiming .range-hint, .range.is-done .range-hint{ opacity: 0; }

  /* ---- weapon (drawn per mechanic, turns with the aim) ---- */
  .range-weapon{
    position: absolute;
    left: 9%; top: 80%;
    width: clamp(54px, 9vw, 84px); height: clamp(54px, 9vw, 84px);
    transform: translate(-50%, -50%) rotate(var(--aim, -24deg));
    z-index: 4;
    pointer-events: none;
    filter: drop-shadow(0 3px 4px rgba(0,0,0,0.6));
    transition: transform 0.08s linear;
  }
  .range-weapon svg{ width: 100%; height: 100%; overflow: visible; display: block; }
  .range-weapon .string-drawn{ opacity: 0; }
  .range.is-aiming .range-weapon .string-rest{ opacity: 0; }
  .range.is-aiming .range-weapon .string-drawn{ opacity: 1; }
  .range-weapon::before{ /* archer's mark on the ground */
    content: ''; position: absolute; left: 50%; top: 50%; width: 140%; height: 34%;
    transform: translate(-50%, 70%) rotate(calc(-1 * var(--aim, -24deg)));
    background: radial-gradient(ellipse at center, rgba(0,0,0,0.5), rgba(0,0,0,0) 70%);
    z-index: -1;
  }

  /* The nocked arrow: shaft + head + fletching, pivoting at the weapon. */
  .nock{
    position: absolute;
    left: 9%; top: 80%;
    width: 38px; height: 10px;
    transform-origin: 0 50%;
    transform: translateY(-50%) rotate(0deg);
    opacity: 0;
    transition: opacity 0.15s ease;
    z-index: 5;
    pointer-events: none;
    background:
      linear-gradient(90deg, transparent 0 74%, #e5c158 74% 100%) center / 100% 100% no-repeat,
      linear-gradient(180deg, transparent 0 42%, #c9a36a 42% 58%, transparent 58%) 0 0 / 76% 100% no-repeat,
      linear-gradient(160deg, transparent 0 30%, #a71d2a 30% 70%, transparent 70%) 0 0 / 22% 50% no-repeat,
      linear-gradient(20deg, transparent 0 30%, #a71d2a 30% 70%, transparent 70%) 0 100% / 22% 50% no-repeat;
    clip-path: polygon(0 0, 22% 30%, 74% 42%, 74% 8%, 100% 50%, 74% 92%, 74% 58%, 22% 70%, 0 100%);
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.6));
  }
  .nock.show{ opacity: 1; }
  .aim-line{
    position: absolute;
    left: 9%; top: 80%;
    height: 2px;
    width: 0;
    background: repeating-linear-gradient(90deg, rgba(229,193,88,0.85) 0 7px, transparent 7px 13px);
    transform-origin: 0 50%;
    z-index: 3;
    pointer-events: none;
  }

  /* ---- targets: painted straw butts on stands ---- */
  .range-targets{ position: absolute; inset: 0; z-index: 2; }
  .target{
    position: absolute;
    width: calc(var(--s, 1) * clamp(46px, 8.4vw, 78px));
    transform: translate(-50%, -50%);
    pointer-events: none;
    transition: opacity 0.3s ease, filter 0.3s ease;
  }
  .target .butt{
    position: relative; z-index: 1;
    width: 100%; aspect-ratio: 1; border-radius: 50%;
    background: radial-gradient(circle,
      #a71d2a 0 17%, #7a1520 17% 19%,
      #e6d7c3 19% 36%, #1a1a1e 36% 39%,
      #e6d7c3 39% 56%, #8b0000 56% 60%,
      #d9c39a 60% 86%, #b69866 86% 100%);
    border: 3px solid #6b4a2a;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.55), inset 0 -4px 8px rgba(0,0,0,0.3), 0 6px 10px rgba(0,0,0,0.45);
    display: flex; align-items: center; justify-content: center;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }
  .target .butt b{
    font-family: 'Cinzel', serif; font-weight: 800;
    font-size: calc(var(--s, 1) * clamp(0.72rem, 1.4vw, 1.05rem));
    color: #f6ecd9; text-shadow: 0 1px 2px rgba(0,0,0,0.8);
    line-height: 1;
  }
  .target .stand{
    position: relative; z-index: 0;
    width: 70%; height: calc(var(--s, 1) * clamp(16px, 2.6vw, 26px)); margin: -6% auto 0;
    background:
      linear-gradient(72deg, transparent 0 44%, #4a3520 44% 52%, transparent 52%),
      linear-gradient(-72deg, transparent 0 44%, #4a3520 44% 52%, transparent 52%);
  }
  .target .stand::after{ /* shadow on the ground */
    content: ''; position: absolute; left: -10%; right: -10%; bottom: -4px; height: 8px;
    background: radial-gradient(ellipse at center, rgba(0,0,0,0.55), rgba(0,0,0,0) 70%);
  }
  .target.aimed .butt{ box-shadow: 0 0 0 3px var(--gold-bright, #e5c158), 0 0 18px 4px rgba(229,193,88,0.55), 0 6px 10px rgba(0,0,0,0.45); transform: scale(1.06); }
  .target.correct .butt{ box-shadow: 0 0 0 3px var(--good), 0 0 22px 6px rgba(92,193,127,0.5), 0 6px 10px rgba(0,0,0,0.45); }
  .target.wrong .butt{ box-shadow: 0 0 0 3px var(--bad), 0 0 18px 4px rgba(167,29,42,0.55), 0 6px 10px rgba(0,0,0,0.45); }
  .target.dim{ opacity: 0.45; filter: grayscale(0.6); }
  .target.hit .butt{ animation: target-hit 0.35s ease; }
  .target .stuck{ /* the arrow left in the target */
    position: absolute; left: 50%; top: 50%; width: 60%; height: 4px; z-index: 2;
    background: linear-gradient(90deg, #a71d2a 0 22%, #c9a36a 22% 100%);
    transform-origin: 100% 50%; transform: translate(-100%, -50%) rotate(var(--hit-angle, 0deg));
    border-radius: 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.6);
  }
  @keyframes target-hit{ 0%{ transform: scale(1); } 40%{ transform: scale(1.14) rotate(-3deg); } 100%{ transform: scale(1); } }

  /* ---- answers: readable list under the scene ---- */
  .answer-list{ display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 0 0 6px; }
  .ans{
    display: flex; align-items: flex-start; gap: 12px; text-align: left;
    background: var(--surface-2); border: 1px solid var(--surface-3); border-radius: 3px;
    color: var(--ink, #e6d7c3); font: inherit; font-size: 0.92rem; line-height: 1.45;
    padding: 12px 14px; cursor: pointer;
    transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
  }
  .ans:hover:not(:disabled), .ans.aimed{ border-color: var(--gold); background: rgba(212,175,55,0.10); }
  .ans:focus-visible{ outline: 2px solid var(--gold); outline-offset: 2px; }
  .ans:disabled{ cursor: default; }
  .ans-letter{
    flex: 0 0 auto; width: 28px; height: 28px; border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
    font-family: 'Cinzel', serif; font-weight: 800; font-size: 0.85rem;
    color: #f6ecd9; background: #8b0000; border: 2px solid #d9c39a;
  }
  .ans-txt{ padding-top: 3px; }
  .ans.correct{ border-color: var(--good); background: var(--good-bg); }
  .ans.correct .ans-letter{ background: var(--good); border-color: var(--good); color: #0f1a12; }
  .ans.wrong{ border-color: var(--bad); background: rgba(167,29,42,0.14); }
  .ans.dim{ opacity: 0.5; }
  @media (max-width: 640px){
    .range{ aspect-ratio: 4 / 3; }
    .answer-list{ grid-template-columns: 1fr; }
    .ans{ font-size: 0.9rem; }
  }

  /* Campania II — Lupa: sigilii în loc de ținte pictate */
  .range.mech-lens .target .butt{
    background: radial-gradient(circle at 40% 35%, #c4323f 0 40%, #8b0000 70%, #5e0a12 100%);
    border: 3px double #e5c158;
  }
  /* Campaniile III–IV — Șarjă: stindarde */
  .range.mech-charge .target .butt{
    border-radius: 3px 3px 50% 50% / 3px 3px 22% 22%;
    background: linear-gradient(180deg, #8b0000 0 70%, #6d0000 100%);
    border: 3px solid #d4af37;
  }
  .range.mech-charge .target .stand{
    width: 8%; height: calc(var(--s, 1) * clamp(22px, 3.4vw, 34px));
    background: #4a3520;
  }

  .projectile{ position: fixed; z-index: 70; pointer-events: none; will-change: left, top; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.55)); }
  .projectile.proj-arrow{ width: 34px; height: 8px; background: linear-gradient(90deg, #a71d2a 0 20%, #c9a36a 20% 76%, #e5c158 76%); clip-path: polygon(0 0, 20% 30%, 76% 38%, 76% 0, 100% 50%, 76% 100%, 76% 62%, 20% 70%, 0 100%); }
  .projectile.proj-stone{ width: 13px; height: 13px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #b6ad9c, #675e51); animation: proj-spin 0.4s linear infinite; }
  @keyframes proj-spin{ to{ transform: rotate(360deg); } }
  .projectile.proj-lens{ width: 16px; height: 16px; border-radius: 50%; border: 3px solid #e5c158; box-shadow: 0 0 10px rgba(229,193,88,0.7); animation: proj-pulse 0.35s ease-in-out infinite; }
  @keyframes proj-pulse{ 50%{ transform: scale(1.3); } }
  .projectile.proj-charge{ width: 30px; height: 6px; background: linear-gradient(90deg, #6b4a2a 0 78%, #d9d9d9 78%); clip-path: polygon(0 30%, 78% 30%, 78% 0, 100% 50%, 78% 100%, 78% 70%, 0 70%); }
  @media (prefers-reduced-motion: reduce){ .range-weapon, .target, .target .butt, .ans{ transition: none; } .target.hit .butt{ animation: none; } }
`;
css = css.slice(0, cStart) + newCss + css.slice(cEnd + cEndStr.length);
fs.writeFileSync(CSS, css);
console.log('game.css: poligon nou');

// ---------------- JS ----------------
let js = fs.readFileSync(JS, 'utf8');

js = mustReplace(js, "  var targetsEl = document.getElementById('range-targets');",
  "  var targetsEl = document.getElementById('range-targets');\n  var answerListEl = document.getElementById('answer-list');", 'answer list el');

// Weapon drawings, pointing to +x (the aim direction).
const WEAPONS = `
  // Armele desenate — toate îndreptate spre +x (direcția de țintire).
  // Arcul e cel compozit asimetric, specific hunilor: brațul de sus e mai lung.
  var WEAPON_SVG = {
    arrow: '<svg viewBox="-40 -40 80 80" xmlns="http://www.w3.org/2000/svg">' +
      '<path class="string-rest" d="M-6,-31 L-6,24" stroke="#e6d7c3" stroke-width="1.2"/>' +
      '<path class="string-drawn" d="M-6,-31 L-18,0 L-6,24" stroke="#e6d7c3" stroke-width="1.2" fill="none"/>' +
      '<path d="M-6,-31 C0,-33 2,-30 3,-26 C8,-16 10,-6 7,0 C10,6 8,14 3,20 C2,24 0,26 -6,24" fill="none" stroke="#5a3a1c" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M-6,-31 C0,-33 2,-30 3,-26 C8,-16 10,-6 7,0 C10,6 8,14 3,20 C2,24 0,26 -6,24" fill="none" stroke="#b07a3a" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M-7,-33 L-2,-29 M-7,26 L-2,23" stroke="#e6d7c3" stroke-width="2" stroke-linecap="round"/>' +
      '<rect x="4" y="-4" width="6" height="8" rx="1.5" fill="#8b0000"/>' +
      '</svg>',
    lens: '<svg viewBox="-40 -40 80 80" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M-26,0 L-4,0" stroke="#5a3a1c" stroke-width="6" stroke-linecap="round"/>' +
      '<circle cx="10" cy="0" r="13" fill="rgba(230,215,195,0.18)" stroke="#d4af37" stroke-width="4"/>' +
      '<path d="M4,-6 A8,8 0 0 1 12,-8" stroke="#f6ecd9" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '</svg>',
    charge: '<svg viewBox="-40 -40 80 80" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M-30,0 L22,0" stroke="#5a3a1c" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M20,-5 L34,0 L20,5 Z" fill="#d9d9d9" stroke="#6b6b6b" stroke-width="1"/>' +
      '<path d="M-14,-1 L-14,-16 L4,-11 L-4,-8 L4,-4 L-14,-1 Z" fill="#8b0000" stroke="#d4af37" stroke-width="1"/>' +
      '</svg>'
  };
`;

js = mustReplace(js,
`  // [left%, top%] positions for the 4 targets, fanned out from the weapon anchor (bottom-left).
  var TARGET_POS = [[34, 14], [70, 20], [82, 58], [56, 86]];
  var WEAPON_ANCHOR_PCT = [10, 84];
  var letters = ['A', 'B', 'C', 'D'];

  function buildTargets(){
    targetsEl.innerHTML = '';
    var lv = LEVELS[state.levelIndex];
    var q = lv.questions[state.qIndex];
    q.opts.forEach(function(optText, i){
      var t = document.createElement('div');
      t.className = 'target';
      t.id = 'target-' + i;
      t.style.left = TARGET_POS[i][0] + '%';
      t.style.top = TARGET_POS[i][1] + '%';
      t.innerHTML = '<div class="ring">' + letters[i] + '</div><div class="txt">' + optText + '</div>';
      targetsEl.appendChild(t);
    });
  }`,
`  // [left%, top%, scale] for the 4 targets: farther ones sit higher and look smaller.
  var TARGET_POS = [[36, 52, 0.78], [57, 50, 0.68], [78, 56, 0.86], [62, 78, 0.98]];
  var WEAPON_ANCHOR_PCT = [9, 80];
  var letters = ['A', 'B', 'C', 'D'];
` + WEAPONS + `
  function targetCenter(i){
    var te = document.getElementById('target-' + i);
    if (!te) return null;
    var tr = te.querySelector('.butt').getBoundingClientRect();
    return { x: tr.left + tr.width / 2, y: tr.top + tr.height / 2 };
  }

  function setAimed(i){
    for (var k = 0; k < 4; k++) {
      var te = document.getElementById('target-' + k), ae = document.getElementById('ans-' + k);
      if (te) te.classList.toggle('aimed', k === i);
      if (ae) ae.classList.toggle('aimed', k === i);
    }
  }

  function nearestTarget(angle){
    var anchor = rangeAnchorPx();
    var best = -1, bestDiff = Infinity;
    for (var i = 0; i < 4; i++) {
      var c = targetCenter(i);
      if (!c) continue;
      var ta = Math.atan2(c.y - anchor.y, c.x - anchor.x);
      var diff = Math.abs(Math.atan2(Math.sin(ta - angle), Math.cos(ta - angle)));
      if (diff < bestDiff) { bestDiff = diff; best = i; }
    }
    return best;
  }

  function buildTargets(){
    targetsEl.innerHTML = '';
    answerListEl.innerHTML = '';
    var lv = LEVELS[state.levelIndex];
    var q = lv.questions[state.qIndex];
    weaponEl.innerHTML = WEAPON_SVG[lv.mechanic] || WEAPON_SVG.arrow;
    weaponEl.style.setProperty('--aim', '-24deg');
    q.opts.forEach(function(optText, i){
      var t = document.createElement('div');
      t.className = 'target';
      t.id = 'target-' + i;
      t.style.left = TARGET_POS[i][0] + '%';
      t.style.top = TARGET_POS[i][1] + '%';
      t.style.setProperty('--s', TARGET_POS[i][2]);
      t.innerHTML = '<div class="butt"><b>' + letters[i] + '</b></div><div class="stand"></div>';
      targetsEl.appendChild(t);

      var a = document.createElement('button');
      a.type = 'button';
      a.className = 'ans';
      a.id = 'ans-' + i;
      a.innerHTML = '<span class="ans-letter" aria-hidden="true">' + letters[i] + '</span><span class="ans-txt"></span>';
      a.querySelector('.ans-txt').textContent = optText;
      a.setAttribute('aria-label', 'Varianta ' + letters[i] + ': ' + optText);
      a.addEventListener('mouseenter', function(){ if (!state.answered && !drag.active) setAimed(i); });
      a.addEventListener('mouseleave', function(){ if (!state.answered && !drag.active) setAimed(-1); });
      a.addEventListener('click', function(){ shootAtTarget(i); });
      answerListEl.appendChild(a);
    });
  }

  // Answering from the list (or keyboard): turn the weapon toward that target and loose.
  function shootAtTarget(i){
    if (state.answered) return;
    var anchor = rangeAnchorPx();
    var c = targetCenter(i);
    if (!c) return;
    var ang = Math.atan2(c.y - anchor.y, c.x - anchor.x);
    drag.lastAngle = ang;
    weaponEl.style.setProperty('--aim', (ang * 180 / Math.PI) + 'deg');
    setAimed(i);
    fireAt(i);
  }`,
  'buildTargets');

// Aim: turn the weapon, light up the target being aimed at.
js = mustReplace(js,
`    nockEl.style.transform = 'translateY(-50%) rotate(' + angleDeg + 'deg)';
`,
`    nockEl.style.transform = 'translateY(-50%) rotate(' + angleDeg + 'deg)';
    weaponEl.style.setProperty('--aim', angleDeg + 'deg');
    rangeEl.classList.add('is-aiming');
    if (rawDist >= 22) setAimed(nearestTarget(angleRad)); else setAimed(-1);
`, 'updateAim');

js = mustReplace(js,
`    if (dist < 22) {
      aimLineEl.style.width = '0';
      nockEl.classList.remove('show');
      return;
    }
    var shootAngle = Math.atan2(dy, dx);
    drag.lastAngle = shootAngle;
    var best = -1, bestDiff = Infinity;
    for (var i = 0; i < 4; i++) {
      var te = document.getElementById('target-' + i);
      if (!te) continue;
      var tr = te.getBoundingClientRect();
      var tx = tr.left + tr.width / 2, ty = tr.top + tr.height / 2;
      var ta = Math.atan2(ty - anchor.y, tx - anchor.x);
      var diff = Math.abs(Math.atan2(Math.sin(ta - shootAngle), Math.cos(ta - shootAngle)));
      if (diff < bestDiff) { bestDiff = diff; best = i; }
    }
    if (best < 0) { aimLineEl.style.width = '0'; nockEl.classList.remove('show'); return; }`,
`    rangeEl.classList.remove('is-aiming');
    if (dist < 22) {
      aimLineEl.style.width = '0';
      nockEl.classList.remove('show');
      setAimed(-1);
      return;
    }
    var shootAngle = Math.atan2(dy, dx);
    drag.lastAngle = shootAngle;
    var best = nearestTarget(shootAngle);
    if (best < 0) { aimLineEl.style.width = '0'; nockEl.classList.remove('show'); setAimed(-1); return; }`,
  'onRangeUp');

js = mustReplace(js,
`    var te = document.getElementById('target-' + i);
    var tr = te.getBoundingClientRect();
    var endX = tr.left + tr.width / 2, endY = tr.top + tr.height / 2;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { nockEl.classList.remove('show'); revealAnswer(i); return; }
    var proj = document.createElement('div');
    proj.className = 'projectile proj-' + lv.mechanic;
    var icons = { arrow: '➤', stone: '', lens: '◎', charge: '▲' };
    proj.textContent = icons[lv.mechanic] || '';
    proj.style.left = startPt.x + 'px';
    proj.style.top = startPt.y + 'px';
    var angle = Math.atan2(endY - startPt.y, endX - startPt.x) * 180 / Math.PI;
    proj.style.transform = 'translate(-50%,-50%) rotate(' + (lv.mechanic === 'arrow' ? angle : 0) + 'deg)';`,
`    var te = document.getElementById('target-' + i);
    var c = targetCenter(i);
    var endX = c.x, endY = c.y;
    var angle = Math.atan2(endY - startPt.y, endX - startPt.x) * 180 / Math.PI;
    rangeEl.classList.remove('is-aiming');
    rangeEl.classList.add('is-done');
    answerListEl.querySelectorAll('.ans').forEach(function(b){ b.disabled = true; });
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { nockEl.classList.remove('show'); stickArrow(te, angle, lv.mechanic); revealAnswer(i); return; }
    var proj = document.createElement('div');
    proj.className = 'projectile proj-' + lv.mechanic;
    proj.style.left = startPt.x + 'px';
    proj.style.top = startPt.y + 'px';
    proj.style.transform = 'translate(-50%,-50%) rotate(' + (lv.mechanic === 'lens' ? 0 : angle) + 'deg)';`,
  'fireAt start');

js = mustReplace(js,
`      proj.remove();
      nockEl.classList.remove('show');
      te.classList.add('hit');
      revealAnswer(i);
    }, 340);
  }`,
`      proj.remove();
      nockEl.classList.remove('show');
      te.classList.add('hit');
      stickArrow(te, angle, lv.mechanic);
      revealAnswer(i);
    }, 340);
  }

  function stickArrow(te, angle, mechanic){
    if (mechanic === 'lens' || !te) return;
    var s = document.createElement('span');
    s.className = 'stuck';
    s.style.setProperty('--hit-angle', angle + 'deg');
    te.querySelector('.butt').appendChild(s);
  }`,
  'fireAt end');

// Reveal: mark the answer cards too.
js = mustReplace(js,
`      if (idx === q.correct) te.classList.add('correct');
      else if (idx === i && !isTimeout) te.classList.add('wrong');
      else te.classList.add('dim');
    }`,
`      var ae = document.getElementById('ans-' + idx);
      te.classList.remove('aimed');
      if (ae) { ae.classList.remove('aimed'); ae.disabled = true; }
      if (idx === q.correct) { te.classList.add('correct'); if (ae) ae.classList.add('correct'); }
      else if (idx === i && !isTimeout) { te.classList.add('wrong'); if (ae) ae.classList.add('wrong'); }
      else { te.classList.add('dim'); if (ae) ae.classList.add('dim'); }
    }
    rangeEl.classList.remove('is-aiming');
    rangeEl.classList.add('is-done');`,
  'revealAnswer');

// renderQuestion no longer overwrites the weapon with a text label.
js = mustReplace(js, "    weaponEl.textContent = lv.mechIcon;\n", "", 'weapon text');
fs.writeFileSync(JS, js);
console.log('game.js: armă desenată, țintire evidențiată, răspunsuri ca butoane');
