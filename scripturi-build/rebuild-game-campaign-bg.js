// Swaps the flat gradient background of the campaign progress-map for the
// generated parchment-landscape texture. The route path / stop markers are
// left untouched — this is a decorative backdrop, not a literal top-down map.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const IMG_PATH = path.join(ROOT, 'imagini', 'Small_stylized_territorial_map_fragment_showing_generic_step.jpg');
const imgDataUri = 'data:image/jpeg;base64,' + fs.readFileSync(IMG_PATH).toString('base64');

const cssPath = path.join(ROOT, 'build', 'game.css');
let css = fs.readFileSync(cssPath, 'utf8');

const oldCss = `  .cmap-inner{
    position: relative;
    width: 100%;
    aspect-ratio: 800 / 220;
    border-radius: 2px;
    overflow: hidden;
    background: linear-gradient(180deg, var(--surface) 0%, var(--surface-2) 100%);
    border: 1px solid var(--line);
  }`;

const newCss = `  .cmap-inner{
    position: relative;
    width: 100%;
    aspect-ratio: 800 / 220;
    border-radius: 2px;
    overflow: hidden;
    background: linear-gradient(180deg, rgba(16,11,7,0.35), rgba(16,11,7,0.55)), url('${imgDataUri}');
    background-size: cover;
    background-position: center 55%;
    border: 1px solid var(--line);
  }`;

if (!css.includes(oldCss)) {
  console.error('OLD CSS BLOCK NOT FOUND — aborting, file left unchanged.');
  process.exit(1);
}
css = css.replace(oldCss, newCss);
fs.writeFileSync(cssPath, css);
console.log('wrote', cssPath, '(', (css.length / 1024).toFixed(0), 'KB )');
