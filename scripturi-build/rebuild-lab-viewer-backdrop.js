// Swaps the flat radial-gradient background of each artifact viewer stage
// for the generated museum-pedestal spotlight backdrop.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const IMG_PATH = path.join(ROOT, 'imagini', 'Dark_museum_display_backdrop_soft_directional_spotlight_on_e.jpg');
const imgDataUri = 'data:image/jpeg;base64,' + fs.readFileSync(IMG_PATH).toString('base64');

const cssPath = path.join(ROOT, 'build', 'lab.css');
let css = fs.readFileSync(cssPath, 'utf8');

const oldCss = `  .viewer-stage{
    position: relative; height: 220px; perspective: 900px; cursor: grab;
    background: radial-gradient(ellipse at 50% 60%, var(--parchment-2), var(--parchment-3));
    border-radius: 2px; touch-action: none; user-select: none;
  }`;

const newCss = `  .viewer-stage{
    position: relative; height: 220px; perspective: 900px; cursor: grab;
    background: linear-gradient(rgba(20,14,8,0.15), rgba(20,14,8,0.15)), url('${imgDataUri}');
    background-size: cover; background-position: center 60%;
    border-radius: 2px; touch-action: none; user-select: none;
  }`;

if (!css.includes(oldCss)) {
  console.error('OLD CSS BLOCK NOT FOUND — aborting, file left unchanged.');
  process.exit(1);
}
css = css.replace(oldCss, newCss);
fs.writeFileSync(cssPath, css);
console.log('wrote', cssPath, '(', (css.length / 1024).toFixed(0), 'KB )');
