// Replaces Act I's abstract SVG shapes (flat ellipses standing in for
// sky/river/riders) with the generated river-crossing illustration. Keeps
// the same 3-layer parallax structure (same element ids, same JS) — the
// back layer now carries the photo, mid/front become soft gradient washes
// for depth and caption legibility instead of fake shapes.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const IMG_PATH = path.join(ROOT, 'imagini', 'Panoramic_wide_shot_of_a_river_crossing_at_night_riders_and.jpg');
const imgDataUri = 'data:image/jpeg;base64,' + fs.readFileSync(IMG_PATH).toString('base64');

const bodyPath = path.join(ROOT, 'build', 'cinema.body.html');
let body = fs.readFileSync(bodyPath, 'utf8');

const oldBlock = `<section class="act" id="act1">
  <div class="parallax-layer" id="p1-back">
    <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;">
      <rect width="1000" height="700" fill="var(--bg)"/>
      <ellipse cx="500" cy="620" rx="700" ry="220" fill="var(--bg-2)"/>
    </svg>
  </div>
  <div class="parallax-layer" id="p1-mid">
    <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;">
      <path d="M0,520 Q200,480 400,510 Q600,470 800,505 Q900,490 1000,510 L1000,700 L0,700 Z" fill="var(--bg-2)" opacity="0.7"/>
      <path d="M0,560 Q250,600 500,565 Q750,610 1000,575" stroke="var(--accent)" stroke-width="3" fill="none" opacity="0.55"/>
    </svg>
  </div>
  <div class="parallax-layer" id="p1-front">
    <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;">
      <g opacity="0.85" fill="var(--bg)">
        <ellipse cx="620" cy="600" rx="20" ry="34"/>
        <ellipse cx="660" cy="610" rx="16" ry="26"/>
        <ellipse cx="700" cy="605" rx="18" ry="30"/>
      </g>
    </svg>
  </div>
  <p class="act-eyebrow">Actul I · 375 d.Hr.</p>
  <h2 class="act-heading">Traversarea Volgăi</h2>
  <div class="caption-stack" id="act1-captions"></div>
</section>`;

const newBlock = `<section class="act" id="act1">
  <div class="parallax-layer act-photo" id="p1-back" style="background-image:url('${imgDataUri}')"></div>
  <div class="parallax-layer act-wash-mid" id="p1-mid"></div>
  <div class="parallax-layer act-wash-front" id="p1-front"></div>
  <p class="act-eyebrow">Actul I · 375 d.Hr.</p>
  <h2 class="act-heading">Traversarea Volgăi</h2>
  <div class="caption-stack" id="act1-captions"></div>
</section>`;

if (!body.includes(oldBlock)) {
  console.error('OLD ACT I BLOCK NOT FOUND — aborting, file left unchanged.');
  process.exit(1);
}
body = body.replace(oldBlock, newBlock);
fs.writeFileSync(bodyPath, body);
console.log('wrote', bodyPath, '(', (body.length / 1024).toFixed(0), 'KB )');

// ---------- css ----------
const cssPath = path.join(ROOT, 'build', 'cinema.css');
let css = fs.readFileSync(cssPath, 'utf8');

const oldCss = `  .parallax-layer{ position: absolute; inset: -10% -5%; will-change: transform; }`;
const newCss = `  .parallax-layer{ position: absolute; inset: -10% -5%; will-change: transform; }
  .act-photo{ background-size: cover; background-position: center 55%; }
  .act-wash-mid{ background: linear-gradient(180deg, transparent 40%, rgba(10,6,4,0.35) 100%); }
  .act-wash-front{ background: linear-gradient(180deg, transparent 55%, rgba(10,6,4,0.6) 100%); }`;

if (!css.includes(oldCss)) {
  console.error('OLD PARALLAX CSS NOT FOUND — aborting, file left unchanged.');
  process.exit(1);
}
css = css.replace(oldCss, newCss);
fs.writeFileSync(cssPath, css);
console.log('wrote', cssPath);
