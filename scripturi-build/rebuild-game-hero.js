// Adds a full-bleed background photo to the Campania Hunilor hero, matching
// the treatment already applied to the Acasă hero. The generated image has
// baked-in placeholder text ("EMPIRE FALLS") in its upper-middle band, so the
// crop is pushed down (background-position) to keep only the sunset/riders/
// ruins portion visible and hide the text band above the fold.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const IMG_PATH = path.join(ROOT, 'imagini', 'Dramatic_steppe_landscape_under_a_stormy_amber_sky_distant_s.jpg');
const imgDataUri = 'data:image/jpeg;base64,' + fs.readFileSync(IMG_PATH).toString('base64');

const bodyPath = path.join(ROOT, 'build', 'game.body.html');
let body = fs.readFileSync(bodyPath, 'utf8');

const oldHero = `  <div class="hero">
    <div class="hero-content">
      <p class="eyebrow">Simulare istorică interactivă</p>
      <div class="mod-chapter"><span class="n">02</span><span class="t">Joc &middot; Campania Hunilor</span></div>
      <h1>Campania <span>Hunilor</span></h1>
      <p class="sub">370 d.Hr. Un popor de călăreți iese brusc din stepă și schimbă harta Europei. Parcurge 4 campanii istorice, răspunde corect și cucerește fiecare teritoriu.</p>
    </div>
  </div>`;

const newHero = `  <div class="hero">
    <div class="hero-bg" style="background-image:url('${imgDataUri}')"></div>
    <div class="hero-scrim"></div>
    <div class="hero-content">
      <p class="eyebrow">Simulare istorică interactivă</p>
      <div class="mod-chapter"><span class="n">02</span><span class="t">Joc &middot; Campania Hunilor</span></div>
      <h1>Campania <span>Hunilor</span></h1>
      <p class="sub">370 d.Hr. Un popor de călăreți iese brusc din stepă și schimbă harta Europei. Parcurge 4 campanii istorice, răspunde corect și cucerește fiecare teritoriu.</p>
    </div>
  </div>`;

if (!body.includes(oldHero)) {
  console.error('OLD HERO NOT FOUND — aborting, file left unchanged.');
  process.exit(1);
}
body = body.replace(oldHero, newHero);
fs.writeFileSync(bodyPath, body);
console.log('wrote', bodyPath, '(', (body.length / 1024).toFixed(0), 'KB )');

// ---------- css ----------
const cssPath = path.join(ROOT, 'build', 'game.css');
let css = fs.readFileSync(cssPath, 'utf8');

const oldCss = `  /* ---------- HERO ---------- */
  .hero{ position: relative; text-align: center; padding-block: 6px 4px; overflow: hidden; }
  .hero-content{ position: relative; z-index: 1; }`;

const newCss = `  /* ---------- HERO ---------- */
  .hero{
    position: relative; text-align: center; overflow: hidden;
    width: 100vw; margin: 0 calc(50% - 50vw); padding: clamp(70px, 16vw, 130px) 18px clamp(30px, 5vw, 44px);
  }
  .hero-bg{
    position: absolute; inset: 0; background-size: cover; background-position: center 78%;
  }
  .hero-scrim{
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(16,11,7,0.55) 0%, rgba(16,11,7,0.72) 55%, rgba(16,11,7,0.94) 100%);
  }
  .hero-content{ position: relative; z-index: 1; }`;

if (!css.includes(oldCss)) {
  console.error('OLD HERO CSS NOT FOUND — aborting, file left unchanged.');
  process.exit(1);
}
css = css.replace(oldCss, newCss);
fs.writeFileSync(cssPath, css);
console.log('wrote', cssPath);
