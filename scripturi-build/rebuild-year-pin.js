// Year minigame (Campania Hunilor): the pin used to start at the middle of the
// range, which for three of the four campaigns already lay inside the "exact"
// tolerance, so pressing "Fixează anul" without moving it scored full marks.
// Now the pin starts at the left end, the lock button stays disabled until the
// pin has been moved, and the pin is a keyboard-operable slider (arrows,
// PageUp/PageDown, Home/End) with the matching ARIA attributes.
const fs = require('fs');
const path = require('path');
const B = path.join(__dirname, '..', 'build');

function edit(file, pairs){
  let s = fs.readFileSync(file, 'utf8');
  for (const [from, to] of pairs) {
    if (!s.includes(from)) { console.error('not found in ' + path.basename(file) + ': ' + from.slice(0, 80)); process.exit(1); }
    s = s.replace(from, to);
  }
  fs.writeFileSync(file, s);
  console.log(path.basename(file) + ': ' + pairs.length + ' modificări');
}

edit(path.join(B, 'game.body.html'), [
  ['<div class="yr-pin" id="yr-pin">', '<div class="yr-pin" id="yr-pin" tabindex="0" role="slider" aria-label="Anul ales pe axa timpului">'],
  ['<p class="yr-hint">Trage pionul auriu pe anul potrivit, apoi fixează-l.', '<p class="yr-hint">Trage pionul auriu pe anul potrivit (sau mută-l cu săgețile de la tastatură), apoi fixează-l.'],
]);

edit(path.join(B, 'game.js'), [
  ["  var yrState = { min: 0, max: 1, value: 0, locked: false, dragging: false };",
   "  var yrState = { min: 0, max: 1, value: 0, locked: false, dragging: false, moved: false };"],
  ["    yrPin.style.left = yrValueToPct(v) + '%';\n    yrPinLabel.textContent = v;",
   "    yrPin.style.left = yrValueToPct(v) + '%';\n    yrPinLabel.textContent = v;\n    yrPin.setAttribute('aria-valuenow', v);"],
  ["  function onYrMove(e){\n    if (!yrState.dragging) return;\n    yrSetPin(yrPointerToValue(e.clientX));\n  }",
   "  function onYrMove(e){\n    if (!yrState.dragging) return;\n    yrSetPin(yrPointerToValue(e.clientX));\n    markYrMoved();\n  }\n" +
   "  // The lock only becomes available once the player has actually placed the pin.\n" +
   "  function markYrMoved(){\n    if (yrState.moved || yrState.locked) return;\n    yrState.moved = true;\n    yrLock.disabled = false;\n  }\n" +
   "  yrPin.addEventListener('keydown', function(e){\n" +
   "    if (yrState.locked) return;\n" +
   "    var step = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -10, PageUp: 10 }[e.key];\n" +
   "    if (e.key === 'Home') yrSetPin(yrState.min);\n" +
   "    else if (e.key === 'End') yrSetPin(yrState.max);\n" +
   "    else if (step) yrSetPin(yrState.value + step);\n" +
   "    else return;\n" +
   "    e.preventDefault();\n" +
   "    markYrMoved();\n" +
   "  });"],
  ["    if (yrState.locked || e.target === yrPin) return;\n    yrSetPin(yrPointerToValue(e.clientX));",
   "    if (yrState.locked || e.target === yrPin) return;\n    yrSetPin(yrPointerToValue(e.clientX));\n    markYrMoved();"],
  ["    yrState.min = tq.min; yrState.max = tq.max; yrState.locked = false;",
   "    yrState.min = tq.min; yrState.max = tq.max; yrState.locked = false; yrState.moved = false;\n    yrPin.setAttribute('aria-valuemin', tq.min);\n    yrPin.setAttribute('aria-valuemax', tq.max);"],
  ["    yrSetPin((tq.min + tq.max) / 2);", "    yrSetPin(tq.min);"],
  ["    yrLock.hidden = false;\n    yrNext.style.display = 'none';", "    yrLock.hidden = false;\n    yrLock.disabled = true;\n    yrNext.style.display = 'none';"],
  ["  yrLock.addEventListener('click', function(){\n    if (yrState.locked) return;", "  yrLock.addEventListener('click', function(){\n    if (yrState.locked || !yrState.moved) return;"],
]);

edit(path.join(B, 'game.css'), [
  ["  button.cta:active{ transform: translateY(0); }",
   "  button.cta:active{ transform: translateY(0); }\n  button.cta:disabled{ opacity: 0.45; cursor: not-allowed; transform: none; filter: none; }\n  .yr-pin:focus-visible{ outline: 2px solid var(--gold); outline-offset: 3px; }"],
]);
