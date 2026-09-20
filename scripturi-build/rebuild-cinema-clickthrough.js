// Converts Cinema Hunic from a scroll-driven "scrollytelling" experience
// (tall sections + parallax + scroll-triggered caption reveal) into a
// click-through slideshow ("Următorul cadru →" / "← Înapoi"), so it works
// inside the new page-by-page site structure where pages don't scroll into
// each other. Reuses the two already-embedded photos (Act I river crossing,
// Act II tent freeze-frame) extracted from the current build output.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const IMG_ACT1 = fs.readFileSync(path.join(__dirname, '.cinema_img0.txt'), 'utf8');
const IMG_ACT2 = fs.readFileSync(path.join(__dirname, '.cinema_img1.txt'), 'utf8');

// ============================================================
// BODY
// ============================================================

const body = `

<div class="cinema-shell">
  <div class="top-controls">
    <button class="persp-btn active" id="btn-roman" type="button">Perspectiva Romană</button>
    <button class="persp-btn" id="btn-hun" type="button">Perspectiva Hună</button>
  </div>
  <button class="audio-toggle" id="audio-toggle" type="button" aria-label="Comută atmosfera sonoră">♪</button>

  <div class="cinema-viewport" id="cinema-viewport">

    <div class="beat-group" id="group-act1" style="background-image:url('${IMG_ACT1}')">
      <div class="beat-scrim"></div>
      <div class="beat-content">
        <p class="act-eyebrow">Actul I · 375 d.Hr.</p>
        <h2 class="act-heading">Traversarea Volgăi</h2>
        <div class="caption-stack" id="act1-captions"></div>
      </div>
    </div>

    <div class="beat-group" id="group-act2" style="background-image:url('${IMG_ACT2}')">
      <div class="beat-scrim"></div>
      <p class="act-eyebrow act-eyebrow-freeze">Actul II · 449 d.Hr. · Freeze-frame — apasă pe un detaliu</p>
      <div class="hotspot-mark" id="hs-tent" style="left:50%; top:18%;"><span class="hotspot-tag">Cortul lui Attila</span></div>
      <div class="hotspot-mark" id="hs-dish" style="left:47%; top:62%;"><span class="hotspot-tag">Vesela de lemn</span></div>
      <div class="hotspot-mark" id="hs-guard" style="left:73%; top:46%;"><span class="hotspot-tag">Garda de corp</span></div>
      <div class="freeze-caption"><p id="act2-caption">—</p></div>
    </div>

    <div class="beat-group" id="group-act3">
      <div class="beat-scrim beat-scrim-flat"></div>
      <div class="beat-content">
        <p class="act-eyebrow">Actul III · 451 d.Hr.</p>
        <h2 class="act-heading">Câmpiile Catalaunice</h2>
        <div class="caption-stack" id="act3-captions"></div>
      </div>
    </div>

    <div class="beat-group" id="group-epilogue">
      <div class="beat-scrim beat-scrim-flat"></div>
      <div class="beat-content epilogue-inner">
        <h3>Epilog</h3>
        <p>Attila e oprit, dar nu învins. Doi ani mai târziu moare la nunta sa, iar imperiul pe care l-a construit se destramă la fel de repede pe cât s-a ridicat. Perspectiva pe care ai purtat-o prin acest film — romană sau hună — e doar una dintre miile de povești individuale ale unei lumi în prăbușire.</p>
      </div>
    </div>

  </div>

  <div class="cinema-pager">
    <button class="cine-nav-btn" id="cine-prev" type="button">← Înapoi</button>
    <span class="cine-counter mono" id="cine-counter">1 / 10</span>
    <button class="cine-nav-btn" id="cine-next" type="button">Următorul cadru →</button>
  </div>
</div>

<div class="modal-overlay" id="c-modal-overlay">
  <div class="modal-card">
    <button class="modal-close" id="c-modal-close" type="button" aria-label="Închide">✕</button>
    <p class="modal-tag" id="c-mt-tag">—</p>
    <h3 id="c-mt-title">—</h3>
    <p id="c-mt-desc">—</p>
    <div class="quote-block"><p id="c-mt-quote">—</p><cite id="c-mt-cite">—</cite></div>
    <button class="tts-btn" id="tts-btn" type="button">▶ Ascultă rezumatul</button>
  </div>
</div>
`;

fs.writeFileSync(path.join(ROOT, 'build', 'cinema.body.html'), body);
console.log('wrote cinema.body.html (', (body.length / 1024).toFixed(0), 'KB )');

// ============================================================
// CSS
// ============================================================

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@500;700&display=swap');

  :root{
    --bg: #170a08;
    --bg-2: #2a1210;
    --ink: #f0e0d0;
    --ink-dim: #c7a898;
    --accent: #d4af37;
    --accent-dim: #8a6a1f;
    --line: rgba(240,224,208,0.25);
    --shadow: rgba(0,0,0,0.6);
  }
  html[data-persp="hun"]{
    --bg: #171008;
    --bg-2: #2a2010;
    --ink: #f0e6cf;
    --ink-dim: #c2ab84;
    --accent: #c17a3a;
    --accent-dim: #8a5a28;
  }

  *{ box-sizing: border-box; }
  .mono{ font-family: 'JetBrains Mono', monospace; }
  .m-cinema h1, .m-cinema h2, .m-cinema h3{ font-family: 'Cinzel', Georgia, serif; margin: 0; text-wrap: balance; }

  /* ---------- SHELL ---------- */
  .cinema-shell{
    position: relative;
    background: var(--bg); color: var(--ink);
    font-family: 'Source Serif 4', Georgia, serif;
    transition: background 0.5s ease, color 0.5s ease;
    display: flex; flex-direction: column;
    min-height: calc(100vh - 48px);
  }

  /* ---------- TOP CONTROLS (absolute within the shell, not viewport-fixed —
     they disappear for free when the page router hides #mod-cinema) ---------- */
  .top-controls{
    position: absolute; top: 14px; left: 50%; transform: translateX(-50%); z-index: 20;
    display: flex; gap: 8px; background: rgba(10,6,4,0.82);
    border: 1px solid var(--line); border-radius: 2px; padding: 5px;
  }
  .persp-btn{
    font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.03em;
    background: transparent; border: none; color: var(--ink-dim); padding: 8px 16px; border-radius: 2px; cursor: pointer;
  }
  .persp-btn.active{ background: var(--accent); color: #1a1006; }

  .audio-toggle{
    position: absolute; bottom: 76px; right: 16px; z-index: 20;
    width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--line);
    background: rgba(10,6,4,0.6); color: var(--ink); font-size: 1.1rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .audio-toggle.on{ border-color: var(--accent); color: var(--accent); }
  .audio-toggle:disabled{ opacity: 0.35; cursor: default; }

  /* ---------- VIEWPORT (one beat-group visible at a time) ---------- */
  .cinema-viewport{ position: relative; flex: 1; min-height: 62vh; overflow: hidden; }
  .beat-group{
    position: absolute; inset: 0; display: none;
    background-size: cover; background-position: center 55%;
    align-items: flex-end;
  }
  .beat-group.active{ display: flex; animation: beat-in 0.35s ease both; }
  @keyframes beat-in{ from{ opacity: 0; } to{ opacity: 1; } }
  @media (prefers-reduced-motion: reduce){ .beat-group.active{ animation: none; } }

  .beat-scrim{
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(14,9,4,0.25) 0%, rgba(14,9,4,0.15) 35%, rgba(14,9,4,0.85) 100%);
  }
  .beat-scrim-flat{ background: linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 100%); }

  .beat-content{ position: relative; z-index: 1; width: 100%; padding: clamp(20px, 6vw, 80px) clamp(20px, 6vw, 80px) clamp(50px, 10vh, 90px); }
  .act-eyebrow{
    font-family: 'JetBrains Mono', monospace; font-size: 0.74rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent);
    margin: 0 0 14px; text-align: center;
  }
  .act-heading{ font-size: clamp(1.8rem, 6vw, 3rem); text-align: center; text-shadow: 0 4px 24px rgba(0,0,0,0.6); margin-bottom: 22px; }

  .caption-stack{ position: relative; min-height: 3.6em; }
  .caption-line{
    display: none;
    max-width: 640px; margin: 0 auto; font-size: clamp(1.05rem, 2.6vw, 1.4rem); line-height: 1.5; text-align: center;
    color: var(--ink);
  }
  .caption-line.current{ display: block; animation: line-in 0.4s ease both; }
  @keyframes line-in{ from{ opacity: 0; transform: translateY(8px); } to{ opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce){ .caption-line.current{ animation: none; } }

  /* ---------- ACT II: FREEZE FRAME ---------- */
  .act-eyebrow-freeze{ position: absolute; top: 14px; left: 0; right: 0; z-index: 1; }
  .hotspot-mark{
    position: absolute; width: 22px; height: 22px; border-radius: 50%; background: var(--accent);
    border: 3px solid rgba(240,224,208,0.7); cursor: pointer; transform: translate(-50%, -50%); z-index: 5;
  }
  .hotspot-mark::after{
    content: ''; position: absolute; inset: -8px; border-radius: 50%; border: 2px solid var(--accent);
    animation: hs-ping 1.8s ease-out infinite;
  }
  @keyframes hs-ping{ 0%{ opacity: 0.7; transform: scale(0.7); } 100%{ opacity: 0; transform: scale(2.2); } }
  @media (prefers-reduced-motion: reduce){ .hotspot-mark::after{ animation: none; } }
  .hotspot-tag{
    position: absolute; top: 26px; left: 50%; transform: translateX(-50%);
    font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; white-space: nowrap; color: var(--ink);
    background: rgba(10,6,4,0.6); padding: 3px 8px; border-radius: 4px;
  }
  .freeze-caption{ position: absolute; bottom: clamp(50px, 10vh, 90px); left: 0; right: 0; text-align: center; z-index: 2; padding: 0 20px; }
  .freeze-caption p{ max-width: 560px; margin: 0 auto; font-size: 1.05rem; background: rgba(0,0,0,0.4); display: inline-block; padding: 8px 16px; border-radius: 2px; }

  /* ---------- EPILOGUE ---------- */
  .epilogue-inner{ max-width: 600px; margin: 0 auto; text-align: center; }
  .epilogue-inner p{ color: var(--ink-dim); font-size: 1.02rem; line-height: 1.7; margin: 16px 0 0; }

  /* ---------- PAGER ---------- */
  .cinema-pager{
    position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 12px clamp(16px, 4vw, 32px); background: #100907; border-top: 1px solid var(--line);
  }
  .cine-nav-btn{
    font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.02em;
    background: var(--accent); color: #1a1006; border: none; padding: 10px 18px; border-radius: 2px; cursor: pointer;
  }
  .cine-nav-btn:disabled{ background: var(--line); color: var(--ink-dim); cursor: default; }
  .cine-counter{ font-size: 0.76rem; color: var(--ink-dim); letter-spacing: 0.05em; }

  /* ---------- MODAL ---------- */
  .modal-overlay{ position: fixed; inset: 0; background: rgba(5,3,2,0.7); z-index: 200; display: none; align-items: center; justify-content: center; padding: 20px; }
  .modal-overlay.show{ display: flex; }
  .modal-card{
    background: var(--bg-2); border: 1px solid var(--accent-dim); border-radius: 2px; max-width: 480px; width: 100%;
    padding: 24px 26px; position: relative;
    animation: modal-in 0.22s ease both;
  }
  @keyframes modal-in{ from{ opacity: 0; transform: scale(0.94); } to{ opacity: 1; transform: scale(1); } }
  @media (prefers-reduced-motion: reduce){ .modal-card{ animation: none; } }
  .modal-close{ position: absolute; top: 10px; right: 14px; background: none; border: none; font-size: 1.3rem; cursor: pointer; color: var(--ink-dim); }
  .modal-tag{ font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); margin: 0 0 8px; }
  .modal-card h3{ font-size: 1.2rem; margin: 0 0 12px; }
  .modal-card p{ font-size: 0.95rem; line-height: 1.6; margin: 0 0 14px; color: var(--ink); }
  .quote-block{ background: rgba(255,255,255,0.05); border-left: 3px solid var(--accent); border-radius: 0; padding: 10px 12px; margin: 0 0 14px; }
  .quote-block p{ font-style: italic; font-size: 0.9rem; margin: 0 0 6px; }
  .quote-block cite{ font-family: 'JetBrains Mono', monospace; font-style: normal; font-size: 0.7rem; color: var(--ink-dim); }
  .tts-btn{
    font-family: 'JetBrains Mono', monospace; font-size: 0.76rem; font-weight: 700; background: var(--accent); color: #1a1006;
    border: none; padding: 8px 16px; border-radius: 2px; cursor: pointer;
  }
  .tts-btn:disabled{ background: var(--line); color: var(--ink-dim); cursor: default; }
`;

fs.writeFileSync(path.join(ROOT, 'build', 'cinema.css'), css);
console.log('wrote cinema.css (', (css.length / 1024).toFixed(0), 'KB )');

// ============================================================
// JS
// ============================================================

const js = `
(function(){
  'use strict';

  // ============================================================
  // DATE — replicile fiecărui act, în funcție de perspectiva aleasă
  // ============================================================

  var CONTENT = {
    act1: {
      roman: [
        'Anul 375. Un zvon cutremurător ajunge la Roma.',
        'Un popor necunoscut a apărut din adâncul stepei, dincolo de orice hartă cunoscută.',
        'Groaza barbară amenință să distrugă lumea civilizată — sau așa scriu cronicarii noștri.'
      ],
      hun: [
        'Anul 375. Traversăm apele reci ale Volgăi, în noapte.',
        'În urma noastră, stepa uscată nu mai hrănește turmele — pășunile s-au împuținat.',
        'Nu căutăm distrugere. Căutăm pășuni noi și eliberare de sub cei care ne-au asuprit.'
      ]
    },
    act2Intro: {
      roman: 'Ambasada romană intră, cu prudență, în tabăra de lemn a regelui hunilor.',
      hun: 'Solii romanilor pășesc, cu teamă vizibilă, în inima puterii noastre.'
    },
    act3: {
      roman: [
        'Aetius unește Roma și pe vizigoți într-un singur zid de scuturi.',
        'Bătălia cea mai sângeroasă a veacului începe la Câmpiile Catalaunice.',
        'Attila e oprit — Europa creștină respiră, pentru moment, ușurată.'
      ],
      hun: [
        'Aliații noștri de ieri, ostrogoții, luptă azi alături de noi, împotriva propriilor frați de sânge.',
        'Câmpul se umple de morți din ambele tabere, până la asfințit.',
        'Ne retragem spre est — dar spiritul stepei nu poate fi înfrânt într-o singură zi.'
      ]
    },
    hotspots: {
      tent: {
        roman: { title: 'Cortul lui Attila', desc: 'Solia romană se așteaptă la un palat somptuos — dar găsește o structură de lemn, impunătoare prin mărime, nu prin lux.',
          quote: 'în timp ce celorlalți li se serveau bucate alese pe farfurii de argint, lui Attila i se aducea doar carne, pe o tavă de lemn', cite: 'Priscus din Panium, Fragmenta' },
        hun: { title: 'Cortul regelui', desc: 'Attila nu are nevoie de piatră și aur pentru a-și arăta puterea — oamenii și loialitatea lor sunt adevărata sa avuție.',
          quote: 'în timp ce celorlalți li se serveau bucate alese pe farfurii de argint, lui Attila i se aducea doar carne, pe o tavă de lemn', cite: 'Priscus din Panium, Fragmenta' }
      },
      dish: {
        roman: { title: 'Vesela de lemn', desc: 'Priscus notează, cu oarecare uimire, contrastul dintre luxul oferit oaspeților și modestia personală a gazdei.',
          quote: 'pe când oaspeții beau din cupe de aur, cupa lui Attila era de lemn', cite: 'Priscus din Panium, Fragmenta' },
        hun: { title: 'Vasul de lemn al regelui', desc: 'Pentru noi, modestia lui Attila nu e sărăcie — e o alegere care îi arată disprețul față de fastul gol al curților străine.',
          quote: 'pe când oaspeții beau din cupe de aur, cupa lui Attila era de lemn', cite: 'Priscus din Panium, Fragmenta' }
      },
      guard: {
        roman: { title: 'Garda de corp', desc: 'Curtenii apropiați ai lui Attila veghează atent fiecare mișcare a solilor străini, mai ales după descoperirea complotului lui Vigilas.',
          quote: 'Edeco a dezvăluit regelui întregul plan al romanilor', cite: 'sinteză după relatarea lui Priscus, Fragmenta' },
        hun: { title: 'Gărzile regelui', desc: 'Loialitatea lui Edeco față de Attila, mai puternică decât aurul roman oferit pentru trădare, arată coeziunea reală a curții hunice.',
          quote: 'Edeco a dezvăluit regelui întregul plan al romanilor', cite: 'sinteză după relatarea lui Priscus, Fragmenta' }
      }
    }
  };

  /** @typedef {{group:string, mode:'title'|'line'|'freeze'|'static', line?:number}} Beat */
  /** @type {Beat[]} */
  var BEATS = [
    { group: 'act1', mode: 'title' },
    { group: 'act1', mode: 'line', line: 0 },
    { group: 'act1', mode: 'line', line: 1 },
    { group: 'act1', mode: 'line', line: 2 },
    { group: 'act2', mode: 'freeze' },
    { group: 'act3', mode: 'title' },
    { group: 'act3', mode: 'line', line: 0 },
    { group: 'act3', mode: 'line', line: 1 },
    { group: 'act3', mode: 'line', line: 2 },
    { group: 'epilogue', mode: 'static' }
  ];

  // ============================================================
  // Comutator de perspectivă (Roman / Hun)
  // ============================================================

  function initPerspectiveToggle(onChange){
    var persp = 'roman';
    var btnRoman = document.getElementById('btn-roman');
    var btnHun = document.getElementById('btn-hun');

    function setPersp(p){
      persp = p;
      document.documentElement.setAttribute('data-persp', p);
      btnRoman.classList.toggle('active', p === 'roman');
      btnHun.classList.toggle('active', p === 'hun');
      onChange();
    }

    btnRoman.addEventListener('click', function(){ setPersp('roman'); });
    btnHun.addEventListener('click', function(){ setPersp('hun'); });

    return { getPersp: function(){ return persp; }, setPersp: setPersp };
  }

  // ============================================================
  // Randare captions (o singură linie vizibilă per beat)
  // ============================================================

  function renderCaptionLines(containerId, key, persp, activeLine){
    var el = document.getElementById(containerId);
    el.innerHTML = CONTENT[key][persp].map(function(line, i){
      return '<p class="caption-line' + (i === activeLine ? ' current' : '') + '" data-i="' + i + '">' + line + '</p>';
    }).join('');
  }

  // ============================================================
  // Motorul de beat-uri (click-through, în locul derulării)
  // ============================================================

  function initBeatEngine(perspective){
    var groups = {
      act1: document.getElementById('group-act1'),
      act2: document.getElementById('group-act2'),
      act3: document.getElementById('group-act3'),
      epilogue: document.getElementById('group-epilogue')
    };
    var prevBtn = document.getElementById('cine-prev');
    var nextBtn = document.getElementById('cine-next');
    var counterEl = document.getElementById('cine-counter');
    var current = 0;

    function render(){
      var beat = BEATS[current];
      Object.keys(groups).forEach(function(key){ groups[key].classList.toggle('active', key === beat.group); });

      if (beat.group === 'act1') {
        renderCaptionLines('act1-captions', 'act1', perspective.getPersp(), beat.mode === 'line' ? beat.line : -1);
      } else if (beat.group === 'act3') {
        renderCaptionLines('act3-captions', 'act3', perspective.getPersp(), beat.mode === 'line' ? beat.line : -1);
      } else if (beat.group === 'act2') {
        document.getElementById('act2-caption').textContent = CONTENT.act2Intro[perspective.getPersp()];
      }

      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === BEATS.length - 1;
      nextBtn.textContent = current === BEATS.length - 1 ? 'Sfârșit' : 'Următorul cadru →';
      counterEl.textContent = (current + 1) + ' / ' + BEATS.length;
    }

    prevBtn.addEventListener('click', function(){ if (current > 0) { current--; render(); } });
    nextBtn.addEventListener('click', function(){ if (current < BEATS.length - 1) { current++; render(); } });

    document.addEventListener('keydown', function(e){
      var cinemaPage = document.getElementById('mod-cinema');
      if (!cinemaPage || getComputedStyle(cinemaPage).display === 'none') return;
      if (e.key === 'ArrowRight' && current < BEATS.length - 1) { current++; render(); }
      if (e.key === 'ArrowLeft' && current > 0) { current--; render(); }
    });

    render();
    return { rerender: render };
  }

  // ============================================================
  // Modal de detaliu (freeze-frame) + citire cu voce (TTS)
  // ============================================================

  function initHotspotModal(getPersp){
    var overlay = document.getElementById('c-modal-overlay');
    var ttsBtn = document.getElementById('tts-btn');
    var ttsLabel = ttsBtn.textContent;
    var currentQuoteText = '';

    function openHotspot(key){
      var d = CONTENT.hotspots[key][getPersp()];
      document.getElementById('c-mt-tag').textContent = key === 'tent' ? 'Freeze-frame · Actul II' : 'Detaliu · Actul II';
      document.getElementById('c-mt-title').textContent = d.title;
      document.getElementById('c-mt-desc').textContent = d.desc;
      document.getElementById('c-mt-quote').textContent = '“' + d.quote + '”';
      document.getElementById('c-mt-cite').textContent = d.cite;
      currentQuoteText = d.title + '. ' + d.desc;
      overlay.classList.add('show');
    }
    function closeHotspot(){
      overlay.classList.remove('show');
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    }

    ['tent', 'dish', 'guard'].forEach(function(key){
      document.getElementById('hs-' + key).addEventListener('click', function(){ openHotspot(key); });
    });
    document.getElementById('c-modal-close').addEventListener('click', closeHotspot);
    overlay.addEventListener('click', function(e){ if (e.target === overlay) closeHotspot(); });

    ttsBtn.addEventListener('click', function(){
      if (!window.speechSynthesis) {
        ttsBtn.textContent = 'Citirea cu voce nu e susținută de acest browser';
        ttsBtn.disabled = true;
        return;
      }
      try {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(currentQuoteText);
        u.lang = 'ro-RO';
        u.rate = 0.95;
        window.speechSynthesis.speak(u);
      } catch (err) {
        ttsBtn.textContent = 'Redarea a eșuat — încearcă din nou';
        setTimeout(function(){ ttsBtn.textContent = ttsLabel; }, 2500);
      }
    });
  }

  // ============================================================
  // Atmosferă sonoră ambientală (sintetizată, fără fișiere externe)
  // ============================================================

  function initAmbientAudio(){
    var audioBtn = document.getElementById('audio-toggle');
    var AudioCtor = window.AudioContext || window.webkitAudioContext;
    var actx = null, nodes = null, playing = false;

    if (!AudioCtor) {
      audioBtn.disabled = true;
      audioBtn.setAttribute('aria-label', 'Atmosfera sonoră nu e susținută de acest browser');
      return;
    }

    function startAmbient(){
      actx = new AudioCtor();
      var master = actx.createGain(); master.gain.value = 0.05; master.connect(actx.destination);
      var o1 = actx.createOscillator(); o1.type = 'sine'; o1.frequency.value = 82;
      var o2 = actx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 110;
      var lfo = actx.createOscillator(); lfo.frequency.value = 0.08;
      var lfoGain = actx.createGain(); lfoGain.gain.value = 0.02;
      lfo.connect(lfoGain); lfoGain.connect(master.gain);
      o1.connect(master); o2.connect(master);
      o1.start(); o2.start(); lfo.start();
      nodes = { o1: o1, o2: o2, lfo: lfo, master: master };
    }
    function stopAmbient(){
      if (!nodes) return;
      nodes.o1.stop(); nodes.o2.stop(); nodes.lfo.stop();
      actx.close();
      nodes = null;
    }

    audioBtn.addEventListener('click', function(){
      if (!playing) {
        try {
          startAmbient();
          playing = true;
          audioBtn.classList.add('on');
        } catch (err) {
          audioBtn.classList.remove('on');
          audioBtn.setAttribute('aria-label', 'Atmosfera sonoră nu a putut porni în acest browser');
        }
      } else {
        stopAmbient();
        playing = false;
        audioBtn.classList.remove('on');
      }
    });
  }

  // ============================================================
  // Pornire
  // ============================================================

  var beatEngine;
  var perspective = initPerspectiveToggle(function(){ if (beatEngine) beatEngine.rerender(); });
  beatEngine = initBeatEngine(perspective);
  initHotspotModal(perspective.getPersp);
  initAmbientAudio();
})();
`;

fs.writeFileSync(path.join(ROOT, 'build', 'cinema.js'), js);
console.log('wrote cinema.js (', (js.length / 1024).toFixed(0), 'KB )');
