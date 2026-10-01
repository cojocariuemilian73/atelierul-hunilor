// Mit vs. adevăr: richer cards. Each card gets a number, a theme with an icon,
// a large quotation mark and a wax-seal "?" on the front; the back carries a
// "mit demontat" stamp. Above the grid: a progress bar (how many myths were
// turned) and a button that turns them all. Cards glide in as they appear.
const fs = require('fs');
const path = require('path');
const B = path.join(__dirname, '..', 'build');
function fail(w){ console.error('not found: ' + w); process.exit(1); }

// ---------- JS ----------
{
  const p = path.join(B, 'lab.js');
  let j = fs.readFileSync(p, 'utf8');
  const i0 = j.indexOf('  function renderFlipCard(m){');
  const i1 = j.indexOf('  // ============================================================\n  // Pornire');
  if (i0 === -1 || i1 === -1) fail('flip card code');
  j = j.slice(0, i0) + `  // Theme of each myth, in the order of MYTHS.
  var MYTH_THEMES = ['gen', 'izv', 'arh', 'ori', 'gen', 'arm', 'izv', 'att', 'att', 'arm', 'aur', 'aur', 'arm', 'izv', 'aur'];
  var THEME = {
    gen: { label: 'Genetică', icon: '<path d="M7 3c0 6 10 6 10 12s-10 6-10 6M17 3c0 6-10 6-10 12M8 7h8M8 17h8"/>' },
    izv: { label: 'Izvoare', icon: '<path d="M6 3h9l3 3v15H6zM9 9h6M9 13h6M9 17h4"/>' },
    arh: { label: 'Arheologie', icon: '<path d="M4 20h16M7 20l2-9h6l2 9M12 4v7M9 7h6"/>' },
    ori: { label: 'Origini', icon: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16"/>' },
    arm: { label: 'Arme', icon: '<path d="M5 19C5 10 10 5 19 5M5 19l14-14M15 5h4v4M3 21l3-3"/>' },
    att: { label: 'Attila', icon: '<path d="M4 17l2-9 4 4 2-7 2 7 4-4 2 9zM4 20h16"/>' },
    aur: { label: 'Aur & tribut', icon: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/>' }
  };
  var mythTurned = 0;

  function svgIcon(d){ return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'; }

  function renderFlipCard(m, i, onTurn){
    var th = THEME[MYTH_THEMES[i]] || THEME.izv;
    var num = 'Nº ' + (i < 9 ? '0' : '') + (i + 1);
    var card = document.createElement('div');
    card.className = 'flip-card theme-' + (MYTH_THEMES[i] || 'izv');
    card.style.setProperty('--d', (i % 3) * 90 + 'ms');
    card.innerHTML =
      '<div class="flip-inner">' +
        '<div class="flip-face flip-front">' +
          '<div class="fc-top"><span class="fc-num">' + num + '</span><span class="fc-cat">' + svgIcon(th.icon) + th.label + '</span></div>' +
          '<span class="fc-quote" aria-hidden="true">„</span>' +
          '<p class="flip-tag">Mitul cronicilor</p><h4>' + m.myth + '</h4>' +
          '<div class="fc-foot"><span class="fc-seal" aria-hidden="true">?</span><span class="flip-hint">Întoarce cardul</span><span class="fc-arrow" aria-hidden="true">↻</span></div>' +
        '</div>' +
        '<div class="flip-face flip-back">' +
          '<div class="fc-top"><span class="fc-num">' + num + '</span><span class="fc-stamp">Mit demontat</span></div>' +
          '<p class="flip-tag">Ce arată sursele și cercetarea</p><p class="fc-truth">' + m.truth + '</p>' +
        '</div>' +
      '</div>';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-pressed', 'false');
    card.setAttribute('aria-label', num + ', ' + th.label + ': ' + m.myth);
    var seen = false;
    function turn(){
      var on = card.classList.toggle('flipped');
      card.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on && !seen) { seen = true; card.classList.add('seen'); onTurn(); }
    }
    card.addEventListener('click', function(e){
      if (e.target.closest('.fc-truth') && card.classList.contains('flipped') && window.getSelection && String(window.getSelection()).length) return;
      turn();
    });
    card.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); turn(); }
    });
    card._turn = turn;
    return card;
  }

  function initMythModule(){
    var flipGrid = document.getElementById('flip-grid');
    var bar = document.createElement('div');
    bar.className = 'myth-progress';
    bar.innerHTML =
      '<p class="mp-text"><b id="mp-count">0</b> din ' + MYTHS.length + ' mituri demontate</p>' +
      '<div class="mp-track" aria-hidden="true"><i id="mp-fill"></i></div>' +
      '<button type="button" class="mp-all" id="mp-all">Întoarce toate</button>';
    flipGrid.parentNode.insertBefore(bar, flipGrid);
    var countEl = bar.querySelector('#mp-count'), fillEl = bar.querySelector('#mp-fill'), allBtn = bar.querySelector('#mp-all');
    function onTurn(){
      mythTurned++;
      countEl.textContent = mythTurned;
      fillEl.style.width = (mythTurned / MYTHS.length * 100) + '%';
      if (mythTurned === MYTHS.length) bar.classList.add('done');
    }
    var cards = MYTHS.map(function(m, i){ var c = renderFlipCard(m, i, onTurn); flipGrid.appendChild(c); return c; });
    allBtn.addEventListener('click', function(){
      var anyFront = cards.some(function(c){ return !c.classList.contains('flipped'); });
      cards.forEach(function(c, i){
        if (c.classList.contains('flipped') !== anyFront) setTimeout(c._turn, i * 45);
      });
      allBtn.textContent = anyFront ? 'Arată miturile' : 'Întoarce toate';
    });
    if ('IntersectionObserver' in window) {
      flipGrid.classList.add('fc-anim');
      var io = new IntersectionObserver(function(es){
        es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('fc-in'); io.unobserve(e.target); } });
      }, { threshold: 0.12 });
      cards.forEach(function(c){ io.observe(c); });
    }
  }

` + j.slice(i1);
  fs.writeFileSync(p, j);
}

// ---------- CSS ----------
{
  const p = path.join(B, 'lab.css');
  let c = fs.readFileSync(p, 'utf8');
  const i0 = c.indexOf('  .flip-grid{');
  const i1 = c.indexOf('  footer{', i0);
  if (i0 === -1 || i1 === -1) fail('flip css');
  c = c.slice(0, i0) + `  .myth-progress{ display: flex; align-items: center; gap: 16px; flex-wrap: wrap; justify-content: center; margin: 0 auto 26px; max-width: 760px; }
  .mp-text{ margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 0.74rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-dim); }
  .mp-text b{ color: var(--gold-bright); font-size: 1.05rem; }
  .mp-track{ flex: 1 1 200px; height: 6px; background: var(--parchment-3); border-radius: 3px; overflow: hidden; }
  .mp-track i{ display: block; height: 100%; width: 0; background: linear-gradient(90deg, var(--imperial), var(--gold-bright)); transition: width 0.5s ease; }
  .myth-progress.done .mp-track i{ box-shadow: 0 0 12px var(--gold-glow); }
  .mp-all{ font-family: 'Cinzel', serif; font-weight: 700; font-size: 0.8rem; letter-spacing: 0.04em; color: var(--gold-bright); background: transparent; border: 1px solid var(--gold); padding: 8px 16px; border-radius: 2px; cursor: pointer; transition: background 0.2s, color 0.2s; }
  .mp-all:hover, .mp-all:focus-visible{ background: var(--gold); color: var(--parchment); }

  .flip-grid{ display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr)); gap: 22px; }
  .flip-card{ --c: var(--imperial); perspective: 1400px; height: 362px; cursor: pointer; border-radius: 4px; outline: none; transition: transform 0.35s ease; }
  .flip-card.theme-gen{ --c: #5f9ea8; } .flip-card.theme-izv{ --c: #c08a4a; } .flip-card.theme-arh{ --c: #9a7bb8; }
  .flip-card.theme-ori{ --c: #c9a227; } .flip-card.theme-arm{ --c: #b5413a; } .flip-card.theme-att{ --c: #d4af37; } .flip-card.theme-aur{ --c: #e0b84a; }
  .flip-card:hover{ transform: translateY(-5px); }
  .flip-card:focus-visible .flip-face{ outline: 2px solid var(--gold-bright); outline-offset: 3px; }
  .flip-inner{ position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform 0.7s cubic-bezier(.3,.1,.2,1); }
  .flip-card.flipped .flip-inner{ transform: rotateY(180deg); }
  .flip-face{
    position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; border-radius: 4px; padding: 20px 20px 18px;
    display: flex; flex-direction: column; overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--c) 45%, transparent);
    box-shadow: 0 14px 34px var(--shadow), inset 0 1px 0 rgba(255,255,255,0.04);
    transition: box-shadow 0.35s ease, border-color 0.35s ease;
  }
  .flip-card:hover .flip-face{ border-color: var(--c); box-shadow: 0 22px 44px var(--shadow), 0 0 0 1px color-mix(in srgb, var(--c) 40%, transparent), 0 0 28px color-mix(in srgb, var(--c) 22%, transparent); }
  /* corner ornaments */
  .flip-face::before, .flip-face::after{ content: ''; position: absolute; width: 22px; height: 22px; pointer-events: none; opacity: 0.85; }
  .flip-face::before{ top: 8px; left: 8px; border-top: 2px solid var(--c); border-left: 2px solid var(--c); }
  .flip-face::after{ bottom: 8px; right: 8px; border-bottom: 2px solid var(--c); border-right: 2px solid var(--c); }

  .flip-front{
    background:
      radial-gradient(120% 80% at 100% 0%, color-mix(in srgb, var(--c) 22%, transparent), transparent 60%),
      linear-gradient(165deg, var(--parchment-2), var(--parchment) 85%);
  }
  .flip-back{
    transform: rotateY(180deg);
    background:
      radial-gradient(110% 70% at 0% 100%, color-mix(in srgb, var(--good) 20%, transparent), transparent 60%),
      linear-gradient(165deg, var(--good-bg), var(--parchment) 95%);
    border-color: color-mix(in srgb, var(--good) 55%, transparent);
  }
  .flip-back::before, .flip-back::after{ border-color: var(--good); }

  .fc-top{ display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 0 0 14px; position: relative; z-index: 1; }
  .fc-num{ font-family: 'Cinzel', serif; font-weight: 700; font-size: 0.92rem; color: var(--c); letter-spacing: 0.06em; }
  .flip-back .fc-num{ color: var(--good); }
  .fc-cat{ display: inline-flex; align-items: center; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--c); border: 1px solid color-mix(in srgb, var(--c) 50%, transparent); background: color-mix(in srgb, var(--c) 10%, transparent); padding: 4px 9px 4px 7px; border-radius: 999px; }
  .fc-cat svg{ width: 14px; height: 14px; }
  .fc-quote{ position: absolute; right: 14px; top: 26px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 9rem; line-height: 1; color: var(--c); opacity: 0.13; pointer-events: none; }
  .flip-tag{ font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin: 0 0 10px; position: relative; }
  .flip-front .flip-tag{ color: var(--imperial); }
  .flip-back .flip-tag{ color: var(--good); }
  .flip-front h4{ font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.32rem; font-weight: 600; line-height: 1.28; margin: 0; color: var(--ink); position: relative; flex: 1; }
  .fc-foot{ display: flex; align-items: center; gap: 10px; margin-top: 14px; padding-top: 12px; border-top: 1px dashed color-mix(in srgb, var(--c) 35%, transparent); }
  .fc-seal{ width: 30px; height: 30px; flex: none; display: grid; place-items: center; border-radius: 50%; font-family: 'Cinzel', serif; font-weight: 700; font-size: 0.95rem; color: #f4e4bc;
    background: radial-gradient(circle at 35% 30%, #c0392b, #7a0f0f 70%); box-shadow: 0 2px 6px rgba(0,0,0,0.45), inset 0 0 0 2px rgba(0,0,0,0.18); }
  .flip-hint{ font-family: 'JetBrains Mono', monospace; font-size: 0.66rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-dim); flex: 1; }
  .fc-arrow{ color: var(--c); font-size: 1.1rem; transition: transform 0.5s ease; }
  .flip-card:hover .fc-arrow{ transform: rotate(180deg); }
  .flip-card.seen .fc-seal{ background: radial-gradient(circle at 35% 30%, #6fa564, #2f5a2a 70%); }
  .flip-card.seen .fc-seal::after{ content: '✓'; }
  .flip-card.seen .fc-seal{ font-size: 0; }
  .flip-card.seen .fc-seal::after{ font-size: 0.95rem; }

  .fc-stamp{ font-family: 'Cinzel', serif; font-weight: 700; font-size: 0.66rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--imperial);
    border: 2px solid var(--imperial); padding: 3px 9px; border-radius: 2px; transform: rotate(-4deg); opacity: 0.9; }
  .fc-truth{ font-size: 0.9rem; line-height: 1.58; margin: 0; color: var(--ink); flex: 1; overflow-y: auto; padding-right: 4px; position: relative; scrollbar-width: thin; }

  .fc-anim .flip-card{ opacity: 0; transform: translateY(26px); transition: opacity 0.6s ease var(--d, 0ms), transform 0.6s cubic-bezier(.2,.7,.2,1) var(--d, 0ms); }
  .fc-anim .flip-card.fc-in{ opacity: 1; transform: none; }
  .fc-anim .flip-card.fc-in:hover{ transform: translateY(-5px); transition-delay: 0ms; }
  @media (prefers-reduced-motion: reduce){
    .flip-inner, .flip-card, .fc-arrow{ transition: none !important; }
    .fc-anim .flip-card{ opacity: 1; transform: none; }
  }
  @media (max-width: 520px){ .flip-card{ height: 400px; } .flip-front h4{ font-size: 1.22rem; } }

` + c.slice(i1);
  fs.writeFileSync(p, c);
}
console.log('lab: carduri mit vs. adevăr refăcute');
