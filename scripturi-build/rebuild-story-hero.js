// Turns the Acasă hero from a small side-diagram into a full-bleed banner
// using the generated "Hunnic horsemen crossing the steppe" image.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const IMG_PATH = path.join(ROOT, 'imagini', 'Wide_panoramic_scene_of_Hunnic_horsemen_crossing_the_steppe.jpg');
const imgDataUri = 'data:image/jpeg;base64,' + fs.readFileSync(IMG_PATH).toString('base64');

// ---------- body: replace the hero section markup ----------
const bodyPath = path.join(ROOT, 'build', 'story.body.html');
let body = fs.readFileSync(bodyPath, 'utf8');

const oldHero = `  <section id="acasa" class="hero">
    <div class="hero-inner">
      <p class="kicker">Concursul Național „Istorie și societate în dimensiune virtuală”</p>
      <h1 class="title">Invazia din <em>Stepe</em>: Hunii și prăbușirea ordinii antice</h1>
      <p class="dek">Din stepele de dincolo de Volga, un popor de călăreți a rupt echilibrul lumii antice în mai puțin de un secol — împingând vizigoți, ostrogoți și vandali în inima Imperiului Roman și grăbind sfârșitul Antichității.</p>
    </div>
    <figure class="hero-map" aria-hidden="true">
      <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="220" fill="var(--paper-2)"/>
        <path d="M0,150 Q60,130 110,145 Q160,120 220,140 Q270,115 320,138 Q360,125 400,140" stroke="var(--line-strong)" stroke-width="1" fill="none"/>
        <path class="hero-route" d="M20,165 Q120,100 220,120 Q290,135 380,60" stroke="var(--accent)" stroke-width="1.4" fill="none" stroke-dasharray="1 7"/>
        <circle cx="20" cy="165" r="3" fill="var(--accent)"/>
        <circle cx="220" cy="120" r="3" fill="var(--accent)"/>
        <circle cx="380" cy="60" r="3.5" fill="var(--accent-2)"/>
        <text x="20" y="182" class="mono" font-size="9" fill="var(--ink-dim)">Volga</text>
        <text x="220" y="106" class="mono" font-size="9" fill="var(--ink-dim)">Pannonia</text>
        <text x="365" y="46" class="mono" font-size="9" fill="var(--ink-dim)" text-anchor="end">Galia · 451</text>
      </svg>
      <figcaption>Ruta expansiunii hunice, 375–451 d.Hr.</figcaption>
    </figure>
    <div class="byline">
      <span><b>Secțiune</b> — Istorie, Pagini Web</span>
      <span><b>Interval</b> — 375–454 d.Hr.</span>
      <span><b>Surse</b> — 16 autori antici și moderni</span>
    </div>
  </section>`;

const newHero = `  <section id="acasa" class="hero">
    <div class="hero-bg" style="background-image:url('${imgDataUri}')"></div>
    <div class="hero-scrim"></div>
    <div class="hero-inner">
      <p class="kicker">Concursul Național „Istorie și societate în dimensiune virtuală”</p>
      <h1 class="title">Invazia din <em>Stepe</em>: Hunii și prăbușirea ordinii antice</h1>
      <p class="dek">Din stepele de dincolo de Volga, un popor de călăreți a rupt echilibrul lumii antice în mai puțin de un secol — împingând vizigoți, ostrogoți și vandali în inima Imperiului Roman și grăbind sfârșitul Antichității.</p>
      <div class="byline">
        <span><b>Secțiune</b> — Istorie, Pagini Web</span>
        <span><b>Interval</b> — 375–454 d.Hr.</span>
        <span><b>Surse</b> — 16 autori antici și moderni</span>
      </div>
    </div>
  </section>`;

if (!body.includes(oldHero)) {
  console.error('OLD HERO BLOCK NOT FOUND — aborting, file left unchanged.');
  process.exit(1);
}
body = body.replace(oldHero, newHero);
fs.writeFileSync(bodyPath, body);
console.log('wrote', bodyPath);

// ---------- css: replace hero-related rules ----------
const cssPath = path.join(ROOT, 'build', 'story.css');
let css = fs.readFileSync(cssPath, 'utf8');

const oldCss = `  /* ---------- HERO / ACASĂ ---------- */
  .hero{
    position: relative;
    max-width: 1180px;
    margin: 40px auto 0;
    display: grid;
    grid-template-columns: 1.7fr 1fr;
    gap: clamp(24px, 5vw, 56px);
    align-items: end;
    padding-bottom: 34px;
    border-bottom: 1px solid var(--line-strong);
  }
  @media (max-width: 820px){ .hero{ grid-template-columns: 1fr; } }
  .hero-inner{ position: relative; z-index: 1; }
  .kicker{
    font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; font-weight: 700;
    letter-spacing: 0.16em; text-transform: uppercase; color: var(--accent); margin: 0 0 18px;
    display: inline-flex; align-items: center; gap: 8px;
  }
  h1.title{ font-size: clamp(2.4rem, 6.6vw, 4rem); line-height: 1.04; margin-bottom: 20px; color: var(--ink); font-weight: 600; }
  h1.title em{ font-style: italic; font-weight: 500; color: var(--accent); }
  .dek{ font-size: 1.18rem; line-height: 1.6; color: var(--ink-dim); max-width: 54ch; margin: 0; font-family: 'Source Serif 4', serif; }

  .hero-map{ position: relative; border: 1px solid var(--line-strong); background: var(--paper-2); }
  .hero-map svg{ width: 100%; height: auto; display: block; }
  .hero-route{ stroke-dasharray: 6 10; animation: route-drift 22s linear infinite; }
  @keyframes route-drift{ to{ stroke-dashoffset: -320; } }
  @media (prefers-reduced-motion: reduce){ .hero-route{ animation: none; } }
  .hero-map figcaption{
    font-family: 'JetBrains Mono', monospace; font-size: 0.66rem; color: var(--ink-dim);
    padding: 8px 10px; border-top: 1px solid var(--line);
  }

  .byline{
    grid-column: 1 / -1;
    display: flex; flex-wrap: wrap; gap: 0;
    font-family: 'JetBrains Mono', monospace; font-size: 0.74rem; color: var(--ink-dim);
    border-top: 1px solid var(--line); margin-top: 26px;
  }
  .byline span{ padding: 10px 22px 0 0; border-right: 1px solid var(--line); margin-right: 22px; }
  .byline span:last-child{ border-right: none; margin-right: 0; }
  .byline b{ color: var(--ink); font-weight: 700; }`;

const newCssBlock = `  /* ---------- HERO / ACASĂ ---------- */
  .hero{
    position: relative;
    width: 100vw;
    margin: 0 calc(50% - 50vw) 0;
    min-height: clamp(440px, 58vw, 640px);
    display: flex;
    align-items: flex-end;
    overflow: hidden;
    border-bottom: 1px solid var(--line-strong);
    background: #1c150e;
  }
  .hero-bg{
    position: absolute; inset: 0;
    background-size: cover;
    background-position: center 62%;
  }
  .hero-scrim{
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(14,9,4,0.08) 0%, rgba(14,9,4,0.22) 38%, rgba(14,9,4,0.92) 100%);
  }
  .hero-inner{
    position: relative; z-index: 1;
    max-width: 1180px; margin: 0 auto; width: 100%;
    padding: 0 18px clamp(26px, 5vw, 40px);
  }
  .kicker{
    font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; font-weight: 700;
    letter-spacing: 0.16em; text-transform: uppercase; color: #e8c25f; margin: 0 0 18px;
    display: inline-flex; align-items: center; gap: 8px;
  }
  h1.title{ font-size: clamp(2.4rem, 6.6vw, 4rem); line-height: 1.04; margin-bottom: 20px; color: #f4ead4; font-weight: 600; }
  h1.title em{ font-style: italic; font-weight: 500; color: #e8c25f; }
  .dek{ font-size: 1.18rem; line-height: 1.6; color: #d9cbae; max-width: 54ch; margin: 0; font-family: 'Source Serif 4', serif; }

  .byline{
    display: flex; flex-wrap: wrap; gap: 0;
    font-family: 'JetBrains Mono', monospace; font-size: 0.74rem; color: #b3a17c;
    border-top: 1px solid rgba(236,223,199,0.22); margin-top: 26px; padding-top: 10px;
  }
  .byline span{ padding: 10px 22px 0 0; border-right: 1px solid rgba(236,223,199,0.22); margin-right: 22px; }
  .byline span:last-child{ border-right: none; margin-right: 0; }
  .byline b{ color: #f4ead4; font-weight: 700; }`;

if (!css.includes(oldCss)) {
  console.error('OLD HERO CSS BLOCK NOT FOUND — aborting, file left unchanged.');
  process.exit(1);
}
css = css.replace(oldCss, newCssBlock);
fs.writeFileSync(cssPath, css);
console.log('wrote', cssPath);
