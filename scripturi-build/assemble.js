const fs = require('fs');
const path = require('path');
const BUILD = process.argv[2];

function read(name) { return fs.readFileSync(path.join(BUILD, name), 'utf8'); }
function stripImport(css) { return css.replace(/@import\s+url\([^)]*\)\s*;/g, ''); }

const storyCss = stripImport(read('story.css'));
const gameCss = stripImport(read('game.scoped.css'));
const embassyCss = stripImport(read('embassy.scoped.css'));
const atlasCss = stripImport(read('atlas.scoped.css'));
const labCss = stripImport(read('lab.scoped.css'));

const storyBody = read('story.body.html');
const gameBody = read('game.body.html');
const embassyBody = read('embassy.body.html');
const atlasBody = read('atlas.body.html');
const labBody = read('lab.body.html');

const storyJs = read('story.js');
const gameJs = read('game.js');
const embassyJs = read('embassy.js');
const atlasJs = read('atlas.js');
const labJs = read('lab.js');

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Cinzel:wght@600;700;800;900&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&family=IM+Fell+English:ital@0;1&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');`;

const NAV_CSS = `
  /* ---------- SITE NAV (page-by-page — one module visible at a time) ---------- */
  .site-nav{
    position: sticky; top: 0; z-index: 200;
    display: flex; gap: 2px; overflow-x: auto;
    background: #1c150e; border-bottom: 1px solid rgba(236,223,199,0.18);
    padding: 0 12px;
  }
  .site-nav a{
    flex-shrink: 0;
    font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; font-weight: 700;
    letter-spacing: 0.04em; text-transform: uppercase; text-decoration: none;
    color: #c2ab84; padding: 13px 14px; border-bottom: 2px solid transparent; white-space: nowrap;
  }
  .site-nav a:hover{ color: #f0e6cf; }
  .site-nav a.current{ color: #e8c25f; border-bottom-color: #e8c25f; }
  #mod-game, #mod-embassy, #mod-atlas, #mod-lab{ padding-block: 28px; }

  /* only the active page is shown — others are fully removed from flow/scroll */
  .site-page{ display: none; }
  .site-page.active{ display: block; }

  .site-pager{
    position: sticky; bottom: 0; z-index: 150;
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    background: #14100a; border-top: 1px solid rgba(236,223,199,0.18);
    padding: 10px clamp(14px, 4vw, 28px);
  }
  .site-pager-btn{
    font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.02em;
    background: #e8c25f; color: #1c150e; border: none; padding: 10px 18px; border-radius: 2px; cursor: pointer;
  }
  .site-pager-btn:disabled{ background: rgba(236,223,199,0.18); color: #8a7860; cursor: default; }
  .site-pager-count{ font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: #8a7860; letter-spacing: 0.05em; white-space: nowrap; }

  .site-final-footer{
    text-align: center; padding: 30px 16px 40px; font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem; color: #8a7860; background: #14100a; line-height: 1.7;
  }
  .mod-chapter{
    display: flex; align-items: baseline; gap: 14px; margin: 0 0 4px;
    max-width: 720px; margin-left: auto; margin-right: auto; padding: 0 18px;
  }
  .mod-chapter .n{
    font-family: 'Cormorant Garamond', serif; font-weight: 600;
    font-size: clamp(2.2rem, 6vw, 3rem); line-height: 1;
    color: var(--imperial, var(--ember, var(--accent, #7a1c1c)));
  }
  .mod-chapter .t{
    font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--gold, var(--accent-2, var(--gold-dim, #b89242)));
  }

  /* ---------- ABOUT MODAL (Despre proiect / Fișă tehnică) ---------- */
  .about-trigger{
    margin-left: auto; flex-shrink: 0;
    font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; font-weight: 700;
    letter-spacing: 0.04em; text-transform: uppercase;
    color: #1c150e; background: #e8c25f; border: none; cursor: pointer;
    padding: 8px 14px; align-self: center; margin-right: 4px; border-radius: 2px;
  }
  .about-trigger:hover{ background: #f0d27a; }
  .about-overlay{
    display: none; position: fixed; inset: 0; z-index: 500;
    background: rgba(10,7,4,0.78); padding: 24px; overflow-y: auto;
  }
  .about-overlay.active{ display: flex; align-items: flex-start; justify-content: center; }
  .about-modal{
    background: #1c150e; color: #e8dcc4; max-width: 720px; width: 100%;
    margin-top: clamp(16px, 4vh, 60px); border: 1px solid rgba(236,223,199,0.22);
    border-radius: 4px; padding: clamp(20px, 4vw, 40px);
    font-family: 'Source Serif 4', serif; line-height: 1.65;
  }
  .about-modal h2{
    font-family: 'Cinzel', serif; font-size: 1.4rem; color: #e8c25f;
    margin: 0 0 18px; letter-spacing: 0.02em;
  }
  .about-modal h3{
    font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; text-transform: uppercase;
    letter-spacing: 0.08em; color: #b89242; margin: 26px 0 10px;
  }
  .about-modal h3:first-of-type{ margin-top: 0; }
  .about-modal p{ margin: 0 0 10px; font-size: 0.96rem; color: #d9cbae; }
  .about-modal ul{ margin: 0 0 10px; padding-left: 20px; font-size: 0.96rem; color: #d9cbae; }
  .about-modal li{ margin-bottom: 6px; }
  .about-modal .placeholder{ color: #8a7860; font-style: italic; }
  .about-close{
    position: absolute; top: 14px; right: 16px;
    background: none; border: none; color: #c2ab84; font-size: 1.3rem; cursor: pointer;
    line-height: 1; padding: 4px 8px;
  }
  .about-close:hover{ color: #f0e6cf; }
  .about-modal{ position: relative; }
`;

const ABOUT_HTML = `
<div class="about-overlay" id="about-overlay">
  <div class="about-modal" role="dialog" aria-modal="true" aria-labelledby="about-title">
    <button class="about-close" id="about-close" type="button" aria-label="Închide">✕</button>
    <h2 id="about-title">Despre proiect / Fișă tehnică</h2>

    <h3>Ghid rapid de navigare</h3>
    <ul>
      <li><strong>Acasă / Articol</strong> — studiu academic cu note de subsol, cronologie și bibliografie.</li>
      <li><strong>Campania Hunilor</strong> — joc de strategie/decizie despre expansiunea hunică.</li>
      <li><strong>Solia la Attila</strong> — joc narativ bazat pe relatarea lui Priscus din Panium.</li>
      <li><strong>Atlasul Migrației</strong> — hartă interactivă cu rutele Marii Migrații.</li>
      <li><strong>Laborator &amp; Muzeu</strong> — artefacte hunice explorabile și dezbaterea mit vs. adevăr paleogenetic.</li>
    </ul>
    <p>Navighezi cu meniul de sus sau cu butoanele „Pagina anterioară / următoare” de jos.</p>

    <h3>Tehnologii utilizate</h3>
    <ul>
      <li>HTML5, CSS3, JavaScript vanilla (fără framework-uri externe)</li>
      <li>SVG pentru hărți, diagrame și hotspot-uri interactive</li>
      <li>Imagini generate AI (Flux/Midjourney), încorporate direct în pagină</li>
    </ul>

    <h3>Standarde respectate</h3>
    <ul>
      <li>HTML5/CSS3 valid, fără dependințe de build extern — pagina rulează local, offline, din orice browser</li>
      <li>Layout responsive (mobil, tabletă, desktop)</li>
      <li>Atribute alt/aria pentru accesibilitate și navigare cu cititor de ecran</li>
    </ul>

    <h3>Valoare educațională</h3>
    <p>Proiectul poate fi folosit la orele de istorie de gimnaziu/liceu ca material interactiv: jocurile de decizie (Campania Hunilor, Solia la Attila) funcționează ca fișe de lucru/teste de verificare a înțelegerii contextului istoric, iar Atlasul și Laboratorul susțin localizarea geografică și analiza de sursă istorică.</p>

    <h3>Echipă &amp; coordonare</h3>
    <p class="placeholder">[Numele elevului/elevilor autori]</p>
    <p class="placeholder">[Profesor îndrumător]</p>
    <p class="placeholder">[Unitatea de învățământ]</p>
  </div>
</div>
`;

const NAV_HTML = `
<nav class="site-nav" aria-label="Navigare proiect">
  <a href="#page-acasa">Acasă / Articol</a>
  <a href="#mod-game">Campania Hunilor</a>
  <a href="#mod-embassy">Solia la Attila</a>
  <a href="#mod-atlas">Atlasul Migrației</a>
  <a href="#mod-lab">Laborator &amp; Muzeu</a>
  <button class="about-trigger" id="about-trigger" type="button">ℹ Despre proiect</button>
</nav>
`;

// Retarget the story module's CTA card so it links to the embedded game section
// instead of the old standalone-artifact URL.
const storyBodyPatched = storyBody.replace(
  /<a class="cta-btn" href="https:\/\/claude\.ai\/artifact\/[^"]*" target="_blank" rel="noopener">Deschide Campania Hunilor →<\/a>/,
  '<a class="cta-btn" href="#mod-game">Deschide Campania Hunilor →</a>'
);

const combinedCss = `<style>
  *{ box-sizing: border-box; }
  html{ scroll-behavior: smooth; }
  @media (prefers-reduced-motion: reduce){ html{ scroll-behavior: auto; } }
  ${FONT_IMPORT}
${NAV_CSS}
  /* ============ MODULE: ACASĂ / ARTICOL (poveste, bază de pagină) ============ */
${storyCss}
  /* ============ MODULE: CAMPANIA HUNILOR (.m-game) ============ */
${gameCss}
  /* ============ MODULE: SOLIA LA ATTILA (.m-embassy) ============ */
${embassyCss}
  /* ============ MODULE: ATLASUL MIGRAȚIEI (.m-atlas) ============ */
${atlasCss}
  /* ============ MODULE: LABORATOR ȘI MUZEU VIRTUAL (.m-lab) ============ */
${labCss}
</style>`;

const combinedBody = `
${NAV_HTML}
${ABOUT_HTML}

<div id="page-acasa" class="site-page">
${storyBodyPatched}
<footer class="site-final-footer">
  Proiect realizat individual pentru Concursul Național „Istorie și societate în dimensiune virtuală” — Secțiunea I, Istorie.<br>
  Cinci module: articol cu note și bibliografie, două jocuri interactive, o hartă istorică și un laborator/muzeu virtual.<br>
  Surse: Ptolemeu, Ammianus Marcellinus, Priscus din Panium, Procopius, Agathias, Jordanes — și cercetări moderne (Kiessling, Altheim, Werner, Sinor, Haussig, De Guignes, Bivar, Spuler, Maenchen-Helfen, Gibbon, Heather, Neparáczki, Maróti).
</footer>
</div>

<section id="mod-game" class="m-game site-page">
${gameBody}
</section>

<section id="mod-embassy" class="m-embassy site-page">
${embassyBody}
</section>

<section id="mod-atlas" class="m-atlas site-page">
${atlasBody}
</section>

<section id="mod-lab" class="m-lab site-page">
${labBody}
</section>

<div class="site-pager">
  <button class="site-pager-btn" id="site-prev" type="button">← Pagina anterioară</button>
  <span class="site-pager-count mono" id="site-page-count">1 / 5</span>
  <button class="site-pager-btn" id="site-next" type="button">Pagina următoare →</button>
</div>
`;

const combinedJs = `<script>
${storyJs}
</script>
<script>
${gameJs}
</script>
<script>
${embassyJs}
</script>
<script>
${atlasJs}
</script>
<script>
${labJs}
</script>
`;

const navScrollspy = `
<script>
(function(){
  // ---------- site-wide page router ----------
  // The site is now page-by-page (one module visible at a time), not one
  // long scroll: exactly one .site-page has .active at any time. The old
  // per-module <section id="mod-X"> ids double as page ids.
  var PAGE_IDS = ['page-acasa', 'mod-game', 'mod-embassy', 'mod-atlas', 'mod-lab'];
  var pages = PAGE_IDS.map(function(id){ return document.getElementById(id); });
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a'));
  var prevBtn = document.getElementById('site-prev');
  var nextBtn = document.getElementById('site-next');
  var countEl = document.getElementById('site-page-count');
  var current = 0;

  function showPage(index){
    index = Math.max(0, Math.min(pages.length - 1, index));
    current = index;
    pages.forEach(function(p, i){ if (p) p.classList.toggle('active', i === index); });
    navLinks.forEach(function(a, i){ a.classList.toggle('current', i === index); });
    prevBtn.disabled = index === 0;
    prevBtn.style.visibility = index === 0 ? 'hidden' : 'visible';
    nextBtn.disabled = index === pages.length - 1;
    nextBtn.style.visibility = index === pages.length - 1 ? 'hidden' : 'visible';
    countEl.textContent = (index + 1) + ' / ' + pages.length;
    window.scrollTo(0, 0);
  }

  prevBtn.addEventListener('click', function(){ showPage(current - 1); });
  nextBtn.addEventListener('click', function(){ showPage(current + 1); });

  // ---------- about / fișă tehnică modal ----------
  var aboutTrigger = document.getElementById('about-trigger');
  var aboutOverlay = document.getElementById('about-overlay');
  var aboutClose = document.getElementById('about-close');
  function openAbout(){ aboutOverlay.classList.add('active'); }
  function closeAbout(){ aboutOverlay.classList.remove('active'); }
  if (aboutTrigger) aboutTrigger.addEventListener('click', openAbout);
  if (aboutClose) aboutClose.addEventListener('click', closeAbout);
  if (aboutOverlay) aboutOverlay.addEventListener('click', function(e){
    if (e.target === aboutOverlay) closeAbout();
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && aboutOverlay && aboutOverlay.classList.contains('active')) closeAbout();
  });

  // Any link whose href points straight at one of the 6 page ids — the nav
  // bar itself, plus in-page links like the story module's "Deschide
  // Campania Hunilor →" card — navigates pages instead of trying to scroll
  // to a section that's hidden (display:none) on another page.
  document.addEventListener('click', function(e){
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var targetId = a.getAttribute('href').slice(1);
    var idx = PAGE_IDS.indexOf(targetId);
    if (idx === -1) return;
    e.preventDefault();
    showPage(idx);
  });

  showPage(0);
})();
</script>
`;

const finalHtml = `<!DOCTYPE html>
<title>Atelierul Hunilor</title>
${combinedCss}
${combinedBody}
${combinedJs}
${navScrollspy}
`;

fs.writeFileSync(path.join(BUILD, 'FINAL.html'), finalHtml);
console.log('wrote FINAL.html, length', finalHtml.length);
