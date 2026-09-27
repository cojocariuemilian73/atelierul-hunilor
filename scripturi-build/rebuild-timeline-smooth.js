// Rebuilds the "Cronologie interactivă" widget.
//
// The old version was a native <input type=range> with a separate row of
// flex-distributed year labels. The two used different geometry, so the
// thumb never sat above its own year (at 451 it hovered between 451 and 454),
// every change jumped instantly, and the text swapped with no transition.
//
// The new widget draws its own track: each moment is a real button placed at
// exactly i/(n-1) along the rail, the marker glides between them (and follows
// the pointer continuously while dragging, snapping on release), the reading
// panel cross-fades in the direction of travel, and there are prev/next
// buttons, arrow-key support and an optional autoplay walk-through.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const BODY = path.join(ROOT, 'build', 'story.body.html');
const CSS = path.join(ROOT, 'build', 'story.css');
const JS = path.join(ROOT, 'build', 'story.js');

const TICKS = ['370', '375', '434', '441', '447', '451', '454'];

// ---------- HTML ----------
let body = fs.readFileSync(BODY, 'utf8');
const start = body.indexOf('        <input type="range" min="0" max="6" step="1" value="0" class="cron-slider"');
const infoOpen = body.indexOf('<div class="cron-info" id="cron-info">', start);
const end = body.indexOf('        </div>\n', infoOpen) + '        </div>\n'.length;
if (start === -1 || infoOpen === -1 || end < infoOpen) { console.error('timeline markup not found'); process.exit(1); }

const oldInfo = body.slice(infoOpen, end);
const yearP = oldInfo.match(/<p class="ci-year" id="ci-year">[\s\S]*?<\/p>/)[0];
const titleH = oldInfo.match(/<h4 id="ci-title">[\s\S]*?<\/h4>/)[0];
const descP = oldInfo.match(/<p id="ci-desc">[\s\S]*?<\/p>/)[0];

const nodes = TICKS.map(function(t, i){
  const x = (i / (TICKS.length - 1) * 100).toFixed(4).replace(/\.?0+$/, '');
  return '            <button type="button" class="cron-node" data-i="' + i + '" style="--x:' + x + '%" aria-label="Anul ' + t + '"><span class="cron-dot"></span><span class="cron-label">' + t + '</span></button>';
}).join('\n');

const newMarkup =
`        <div class="cron-track" id="cron-track" role="group" aria-label="Momente din cronologia hunilor — folosește săgețile stânga/dreapta">
          <div class="cron-rail"><div class="cron-fill" id="cron-fill"></div></div>
          <div class="cron-nodes">
${nodes}
          </div>
          <div class="cron-handle" id="cron-handle" aria-hidden="true"></div>
        </div>
        <div class="cron-controls">
          <button type="button" class="cron-btn" id="cron-prev" aria-label="Momentul anterior">←</button>
          <span class="cron-count" id="cron-count" aria-hidden="true">1 / ${TICKS.length}</span>
          <button type="button" class="cron-btn" id="cron-next" aria-label="Momentul următor">→</button>
          <button type="button" class="cron-btn cron-play" id="cron-play" aria-pressed="false">▶ Parcurge automat</button>
        </div>
        <div class="cron-info" id="cron-info" aria-live="polite">
          <span class="ci-ghost" id="ci-ghost" aria-hidden="true">${TICKS[0]}</span>
          <div class="ci-body" id="ci-body">
            ${yearP}
            ${titleH}
            ${descP}
          </div>
        </div>
`;
body = body.slice(0, start) + newMarkup + body.slice(end);
body = body.replace(
  '<p class="sec-sub">Trage cursorul sau apasă pe un an pentru a vedea evenimentul</p>',
  '<p class="sec-sub">Trage marcajul, apasă pe un an, folosește săgețile — sau lasă cronologia să se deruleze singură</p>'
);
fs.writeFileSync(BODY, body);
console.log('story.body.html: markup nou pentru cronologie');

// ---------- CSS ----------
let css = fs.readFileSync(CSS, 'utf8');
const cssStart = css.indexOf('  .cron-slider{');
const cssEnd = css.indexOf('  .cron-info p{');
const cssEndLine = css.indexOf('\n', cssEnd) + 1;
if (cssStart === -1 || cssEnd === -1) { console.error('timeline CSS not found'); process.exit(1); }

const newCss =
`  /* ---------- Cronologie: pistă proprie, noduri aliniate exact ---------- */
  .cron-track{
    position: relative; height: 64px; margin: 6px 12px 4px;
    cursor: pointer; touch-action: none; user-select: none; -webkit-user-select: none;
  }
  .cron-rail{
    position: absolute; left: 0; right: 0; top: 18px; height: 3px; border-radius: 3px;
    background: var(--line-strong); overflow: hidden;
  }
  .cron-fill{
    position: absolute; inset: 0 auto 0 0; width: 0%;
    background: linear-gradient(90deg, var(--accent-2) 0%, #e5c158 100%);
    box-shadow: 0 0 12px rgba(212, 175, 55, 0.55);
    transition: width 0.55s cubic-bezier(.22,.8,.25,1);
  }
  .cron-nodes{ position: absolute; inset: 0; }
  .cron-node{
    position: absolute; left: var(--x); top: 0; transform: translateX(-50%);
    width: 44px; height: 64px; padding: 0; border: none; background: none; cursor: pointer;
    display: flex; flex-direction: column; align-items: center; color: var(--ink-dim);
  }
  .cron-dot{
    margin-top: 13px; width: 13px; height: 13px; border-radius: 50%;
    background: var(--paper); border: 2px solid var(--line-strong);
    transition: background 0.35s ease, border-color 0.35s ease, transform 0.35s ease, box-shadow 0.35s ease;
  }
  .cron-label{
    margin-top: 12px; font-family: 'JetBrains Mono', monospace; font-size: 0.72rem;
    letter-spacing: 0.02em; transition: color 0.3s ease, transform 0.3s ease;
  }
  .cron-node:hover .cron-dot{ border-color: var(--accent-2); transform: scale(1.2); }
  .cron-node:hover .cron-label{ color: var(--ink); }
  .cron-node:focus-visible{ outline: none; }
  .cron-node:focus-visible .cron-dot{ box-shadow: 0 0 0 3px var(--paper), 0 0 0 5px var(--accent-2); }
  .cron-node.is-past .cron-dot{ background: var(--accent-2); border-color: var(--accent-2); }
  .cron-node.is-current .cron-label{ color: var(--accent-2); font-weight: 700; transform: translateY(2px) scale(1.12); }

  .cron-handle{
    position: absolute; top: 11px; left: 0; width: 17px; height: 17px; margin-left: -8.5px;
    transform: rotate(45deg); background: var(--accent); border: 2px solid #e5c158; border-radius: 2px;
    box-shadow: 0 0 0 5px rgba(167, 29, 42, 0.18), 0 0 18px rgba(167, 29, 42, 0.55);
    transition: left 0.55s cubic-bezier(.22,.8,.25,1);
    pointer-events: none; z-index: 2;
  }
  .cron-handle::after{
    content: ''; position: absolute; inset: -9px; border-radius: 3px;
    border: 1px solid rgba(229, 193, 88, 0.55);
    animation: cron-pulse 2.2s ease-out infinite;
  }
  @keyframes cron-pulse{ 0%{ opacity: 0.9; transform: scale(0.7); } 100%{ opacity: 0; transform: scale(1.5); } }
  .cron-track.is-dragging{ cursor: grabbing; }
  .cron-track.is-dragging .cron-handle,
  .cron-track.is-dragging .cron-fill{ transition: none; }

  .cron-controls{ display: flex; align-items: center; gap: 8px; margin: 10px 0 22px; flex-wrap: wrap; }
  .cron-btn{
    font-family: 'JetBrains Mono', monospace; font-size: 0.74rem; font-weight: 700;
    background: transparent; color: var(--ink); border: 1px solid var(--line-strong);
    border-radius: 2px; padding: 7px 12px; cursor: pointer; line-height: 1;
    transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
  }
  .cron-btn:hover:not(:disabled){ border-color: var(--accent-2); color: var(--accent-2); }
  .cron-btn:disabled{ opacity: 0.35; cursor: default; }
  .cron-btn:focus-visible{ outline: 2px solid var(--accent-2); outline-offset: 2px; }
  .cron-play{ margin-left: auto; }
  .cron-play[aria-pressed="true"]{ background: var(--accent-2); color: var(--paper); border-color: var(--accent-2); }
  .cron-count{ font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: var(--ink-dim); min-width: 44px; text-align: center; }

  .cron-info{
    position: relative; overflow: hidden; min-height: 168px;
    padding: 4px 0 4px 18px; border-left: 2px solid var(--accent);
  }
  .ci-ghost{
    position: absolute; right: -4px; top: 50%; transform: translateY(-50%);
    font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: clamp(4.5rem, 14vw, 7.5rem);
    line-height: 1; color: var(--accent-2); opacity: 0.09; pointer-events: none;
    transition: opacity 0.3s ease, transform 0.45s cubic-bezier(.22,.8,.25,1);
  }
  .ci-body{ position: relative; transition: opacity 0.26s ease, transform 0.32s cubic-bezier(.22,.8,.25,1); }
  .cron-info.is-out-next .ci-body{ opacity: 0; transform: translateX(-18px); }
  .cron-info.is-out-prev .ci-body{ opacity: 0; transform: translateX(18px); }
  .cron-info.is-in-next .ci-body{ opacity: 0; transform: translateX(18px); transition: none; }
  .cron-info.is-in-prev .ci-body{ opacity: 0; transform: translateX(-18px); transition: none; }
  .cron-info.is-out-next .ci-ghost, .cron-info.is-out-prev .ci-ghost{ opacity: 0; transform: translateY(-50%) scale(0.92); }
  .cron-info .ci-year{ font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; font-weight: 700; color: var(--accent-2); letter-spacing: 0.05em; text-transform: uppercase; margin: 0 0 6px; }
  .cron-info h4{ font-family: 'Cormorant Garamond', serif; font-size: 1.45rem; font-weight: 600; margin: 0 0 8px; }
  .cron-info p{ font-size: 0.96rem; color: var(--ink-dim); margin: 0; line-height: 1.6; max-width: 58ch; }
  @media (prefers-reduced-motion: reduce){
    .cron-fill, .cron-handle, .ci-body, .ci-ghost, .cron-dot, .cron-label{ transition: none; }
    .cron-handle::after{ animation: none; display: none; }
  }
`;
css = css.slice(0, cssStart) + newCss + css.slice(cssEndLine);
css = css.replace('  .cron-wrap{ margin: 28px 0 10px; border-top: 1px solid var(--line-strong); border-bottom: 1px solid var(--line-strong); padding: 26px 0 22px; }',
                  '  .cron-wrap{ margin: 28px 0 10px; border-top: 1px solid var(--line-strong); border-bottom: 1px solid var(--line-strong); padding: 22px 0 22px; }');
fs.writeFileSync(CSS, css);
console.log('story.css: stiluri noi pentru cronologie');

// ---------- JS ----------
let js = fs.readFileSync(JS, 'utf8');
const fnStart = js.indexOf('  function initTimelineSlider(){');
const fnEnd = js.indexOf('\n  }\n', fnStart) + '\n  }\n'.length;
if (fnStart === -1) { console.error('initTimelineSlider not found'); process.exit(1); }

const newFn =
`  function initTimelineSlider(){
    var track = document.getElementById('cron-track');
    if (!track) return;
    var nodes = Array.prototype.slice.call(track.querySelectorAll('.cron-node'));
    var handle = document.getElementById('cron-handle');
    var fill = document.getElementById('cron-fill');
    var info = document.getElementById('cron-info');
    var ghost = document.getElementById('ci-ghost');
    var ciYear = document.getElementById('ci-year');
    var ciTitle = document.getElementById('ci-title');
    var ciDesc = document.getElementById('ci-desc');
    var prevBtn = document.getElementById('cron-prev');
    var nextBtn = document.getElementById('cron-next');
    var playBtn = document.getElementById('cron-play');
    var countEl = document.getElementById('cron-count');
    var last = CRON.length - 1;
    var current = 0;
    var swapTimer = null, playTimer = null;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function pctOf(i){ return i / last * 100; }

    function placeMarker(pct){
      handle.style.left = pct + '%';
      fill.style.width = pct + '%';
    }

    function paintNodes(i){
      nodes.forEach(function(n, k){
        n.classList.toggle('is-past', k < i);
        n.classList.toggle('is-current', k === i);
        if (k === i) n.setAttribute('aria-current', 'step'); else n.removeAttribute('aria-current');
      });
      prevBtn.disabled = i === 0;
      nextBtn.disabled = i === last;
      countEl.textContent = (i + 1) + ' / ' + CRON.length;
    }

    // Slide the reading panel out in the direction of travel, swap the text,
    // then slide the new text in from the opposite side.
    function showText(i, dir){
      var c = CRON[i];
      var label = nodes[i] ? nodes[i].querySelector('.cron-label').textContent : '';
      if (reduced) {
        ciYear.textContent = c.year; ciTitle.textContent = c.title; ciDesc.textContent = c.desc;
        ghost.textContent = label;
        return;
      }
      clearTimeout(swapTimer);
      info.classList.remove('is-in-next', 'is-in-prev');
      info.classList.add(dir > 0 ? 'is-out-next' : 'is-out-prev');
      swapTimer = setTimeout(function(){
        ciYear.textContent = c.year; ciTitle.textContent = c.title; ciDesc.textContent = c.desc;
        ghost.textContent = label;
        info.classList.remove('is-out-next', 'is-out-prev');
        info.classList.add(dir > 0 ? 'is-in-next' : 'is-in-prev');
        void info.offsetWidth;
        info.classList.remove('is-in-next', 'is-in-prev');
      }, 200);
    }

    function go(i, opts){
      i = Math.max(0, Math.min(last, i));
      var changed = i !== current;
      var dir = i >= current ? 1 : -1;
      current = i;
      if (!opts || !opts.keepMarker) placeMarker(pctOf(i));
      paintNodes(i);
      if (changed || (opts && opts.force)) showText(i, dir);
    }

    // ---------- pointer: click anywhere on the track, or drag the marker ----------
    var dragging = false;
    function fractionAt(clientX){
      var r = track.getBoundingClientRect();
      if (!r.width) return current / last;
      return Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    }
    track.addEventListener('pointerdown', function(e){
      if (e.button !== undefined && e.button !== 0) return;
      stopPlay();
      dragging = true;
      track.classList.add('is-dragging');
      if (track.setPointerCapture) { try { track.setPointerCapture(e.pointerId); } catch(err){} }
      var f = fractionAt(e.clientX);
      placeMarker(f * 100);
      go(Math.round(f * last), { keepMarker: true });
      e.preventDefault();
    });
    track.addEventListener('pointermove', function(e){
      if (!dragging) return;
      var f = fractionAt(e.clientX);
      placeMarker(f * 100);
      go(Math.round(f * last), { keepMarker: true });
    });
    function endDrag(){
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      void track.offsetWidth;
      placeMarker(pctOf(current));
    }
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);

    // Nodes are real buttons, so Tab reaches them and Enter/Space selects.
    nodes.forEach(function(n){
      n.addEventListener('click', function(){ stopPlay(); go(parseInt(n.getAttribute('data-i'), 10)); });
    });
    track.addEventListener('keydown', function(e){
      var k = e.key, i = current;
      if (k === 'ArrowRight' || k === 'ArrowDown') i = current + 1;
      else if (k === 'ArrowLeft' || k === 'ArrowUp') i = current - 1;
      else if (k === 'Home') i = 0;
      else if (k === 'End') i = last;
      else return;
      e.preventDefault();
      stopPlay();
      go(i);
      if (nodes[current]) nodes[current].focus();
    });

    prevBtn.addEventListener('click', function(){ stopPlay(); go(current - 1); });
    nextBtn.addEventListener('click', function(){ stopPlay(); go(current + 1); });

    // ---------- autoplay walk-through ----------
    function stopPlay(){
      if (!playTimer) return;
      clearInterval(playTimer); playTimer = null;
      playBtn.setAttribute('aria-pressed', 'false');
      playBtn.textContent = '▶ Parcurge automat';
    }
    function startPlay(){
      if (current === last) go(0);
      playBtn.setAttribute('aria-pressed', 'true');
      playBtn.textContent = '❚❚ Pauză';
      playTimer = setInterval(function(){
        if (current >= last) { stopPlay(); return; }
        go(current + 1);
      }, 4200);
    }
    playBtn.addEventListener('click', function(){ if (playTimer) stopPlay(); else startPlay(); });

    // Leaving the page (router hides the section) should not keep a timer running.
    document.addEventListener('visibilitychange', function(){ if (document.hidden) stopPlay(); });

    placeMarker(0);
    paintNodes(0);
    ghost.textContent = nodes[0] ? nodes[0].querySelector('.cron-label').textContent : '';
  }
`;
js = js.slice(0, fnStart) + newFn + js.slice(fnEnd);
fs.writeFileSync(JS, js);
console.log('story.js: logică nouă pentru cronologie');
