// Adds a full-bleed background photo (Attila's tent) to the Solia la Attila
// masthead, matching the hero treatment already used elsewhere.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const IMG_PATH = path.join(ROOT, 'imagini', 'Interior_of_a_large_wooden_nomadic_royal_tent_modest_wooden.jpg');
const imgDataUri = 'data:image/jpeg;base64,' + fs.readFileSync(IMG_PATH).toString('base64');

const bodyPath = path.join(ROOT, 'build', 'embassy.body.html');
let body = fs.readFileSync(bodyPath, 'utf8');

const oldMasthead = `  <div class="masthead">
    <p class="eyebrow">Concursul Național „Istorie și societate în dimensiune virtuală”</p>
    <div class="mod-chapter"><span class="n">03</span><span class="t">Joc &middot; Solia la Attila</span></div>
    <h1 class="title">Solia la Attila</h1>
    <p class="sub">448 d.Hr. Ești membru al ambasadei bizantine trimise de Teodosie al II-lea la curtea lui Attila. Fiecare alegere e verificată cu izvoarele lui Priscus din Panium, Ammianus Marcellinus și Jordanes.</p>
  </div>`;

const newMasthead = `  <div class="masthead">
    <div class="masthead-bg" style="background-image:url('${imgDataUri}')"></div>
    <div class="masthead-scrim"></div>
    <div class="masthead-content">
      <p class="eyebrow">Concursul Național „Istorie și societate în dimensiune virtuală”</p>
      <div class="mod-chapter"><span class="n">03</span><span class="t">Joc &middot; Solia la Attila</span></div>
      <h1 class="title">Solia la Attila</h1>
      <p class="sub">448 d.Hr. Ești membru al ambasadei bizantine trimise de Teodosie al II-lea la curtea lui Attila. Fiecare alegere e verificată cu izvoarele lui Priscus din Panium, Ammianus Marcellinus și Jordanes.</p>
    </div>
  </div>`;

if (!body.includes(oldMasthead)) {
  console.error('OLD MASTHEAD NOT FOUND — aborting, file left unchanged.');
  process.exit(1);
}
body = body.replace(oldMasthead, newMasthead);
fs.writeFileSync(bodyPath, body);
console.log('wrote', bodyPath, '(', (body.length / 1024).toFixed(0), 'KB )');

// ---------- css ----------
const cssPath = path.join(ROOT, 'build', 'embassy.css');
let css = fs.readFileSync(cssPath, 'utf8');

const oldCss = `  .masthead{ text-align: center; margin-bottom: 14px; }
  .eyebrow{ font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--imperial); margin: 0 0 8px; }
  h1.title{ font-size: clamp(1.6rem, 4.5vw, 2.2rem); margin-bottom: 6px; }
  .sub{ color: var(--ink-dim); font-size: 0.95rem; max-width: 60ch; margin: 0 auto; }`;

const newCss = `  .masthead{
    position: relative; text-align: center; overflow: hidden;
    width: 100vw; margin: 0 calc(50% - 50vw) 14px;
    padding: clamp(50px, 12vw, 90px) 16px clamp(26px, 5vw, 38px);
  }
  .masthead-bg{ position: absolute; inset: 0; background-size: cover; background-position: center 42%; }
  .masthead-scrim{
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(20,13,5,0.5) 0%, rgba(20,13,5,0.68) 55%, rgba(20,13,5,0.92) 100%);
  }
  .masthead-content{ position: relative; z-index: 1; }
  .eyebrow{ font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #e8c25f; margin: 0 0 8px; }
  h1.title{ font-size: clamp(1.6rem, 4.5vw, 2.2rem); margin-bottom: 6px; color: #f4ead4; }
  .sub{ color: #d9cbae; font-size: 0.95rem; max-width: 60ch; margin: 0 auto; }`;

if (!css.includes(oldCss)) {
  console.error('OLD MASTHEAD CSS NOT FOUND — aborting, file left unchanged.');
  process.exit(1);
}
css = css.replace(oldCss, newCss);
fs.writeFileSync(cssPath, css);
console.log('wrote', cssPath);
