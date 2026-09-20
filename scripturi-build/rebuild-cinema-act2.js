// Replaces Cinema Act II's abstract SVG freeze-frame (triangle tent, plain
// hotspot dots) with the generated tent-interior photograph, and repositions
// the 3 hotspots onto meaningful points of the actual scene.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const IMG_PATH = path.join(ROOT, 'imagini', 'Freeze-frame_composition_of_a_wooden_royal_tent_interior_Rom.jpg');
const imgDataUri = 'data:image/jpeg;base64,' + fs.readFileSync(IMG_PATH).toString('base64');

const bodyPath = path.join(ROOT, 'build', 'cinema.body.html');
let body = fs.readFileSync(bodyPath, 'utf8');

const oldBlock = `    <div class="freeze-scene">
      <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;">
        <rect width="1000" height="700" fill="var(--bg)"/>
        <ellipse cx="500" cy="640" rx="750" ry="200" fill="var(--bg-2)"/>
        <path d="M400,420 L500,300 L600,420 Z" fill="var(--bg-2)" stroke="var(--accent-dim)" stroke-width="2"/>
        <rect x="470" y="420" width="60" height="90" fill="var(--bg-2)" stroke="var(--accent-dim)" stroke-width="2"/>
      </svg>
      <div class="hotspot-mark" id="hs-tent" style="left:50%; top:52%;"><span class="hotspot-tag">Cortul lui Attila</span></div>
      <div class="hotspot-mark" id="hs-dish" style="left:38%; top:66%;"><span class="hotspot-tag">Vesela de lemn</span></div>
      <div class="hotspot-mark" id="hs-guard" style="left:64%; top:60%;"><span class="hotspot-tag">Garda de corp</span></div>
    </div>`;

const newBlock = `    <div class="freeze-scene" style="background-image:url('${imgDataUri}');">
      <div class="hotspot-mark" id="hs-tent" style="left:50%; top:18%;"><span class="hotspot-tag">Cortul lui Attila</span></div>
      <div class="hotspot-mark" id="hs-dish" style="left:47%; top:62%;"><span class="hotspot-tag">Vesela de lemn</span></div>
      <div class="hotspot-mark" id="hs-guard" style="left:73%; top:46%;"><span class="hotspot-tag">Garda de corp</span></div>
    </div>`;

if (!body.includes(oldBlock)) {
  console.error('OLD FREEZE-SCENE BLOCK NOT FOUND — aborting, file left unchanged.');
  process.exit(1);
}
body = body.replace(oldBlock, newBlock);
fs.writeFileSync(bodyPath, body);
console.log('wrote', bodyPath, '(', (body.length / 1024).toFixed(0), 'KB )');

// ---------- css ----------
const cssPath = path.join(ROOT, 'build', 'cinema.css');
let css = fs.readFileSync(cssPath, 'utf8');

const oldCss = `  .freeze-scene{ position: absolute; inset: 0; }`;
const newCss = `  .freeze-scene{
    position: absolute; inset: 0;
    background-size: cover; background-position: center 40%;
  }
  .freeze-scene::before{
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(10,6,4,0.15) 0%, rgba(10,6,4,0.05) 30%, rgba(10,6,4,0.55) 100%);
    pointer-events: none;
  }`;

if (!css.includes(oldCss)) {
  console.error('OLD FREEZE-SCENE CSS NOT FOUND — aborting, file left unchanged.');
  process.exit(1);
}
css = css.replace(oldCss, newCss);
fs.writeFileSync(cssPath, css);
console.log('wrote', cssPath);
