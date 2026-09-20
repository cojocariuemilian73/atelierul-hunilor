// The museum-pedestal backdrop image + each artifact's own studio photo
// (with its own dark background) created a visible "photo pasted on a
// photo" seam. Fix: drop the redundant pedestal backdrop and let each
// artifact photo fill the whole stage edge-to-edge (object-fit: cover,
// no inset), since the photos already carry a good dark studio background.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const cssPath = path.join(ROOT, 'build', 'lab.css');
let css = fs.readFileSync(cssPath, 'utf8');

const stageRe = /\.viewer-stage\{[^}]*\}/;
const stageMatch = css.match(stageRe);
if (!stageMatch) { console.error('viewer-stage rule not found'); process.exit(1); }
const newStage = `.viewer-stage{
    position: relative; height: 220px; perspective: 900px; cursor: grab;
    background: linear-gradient(180deg, #1c1712 0%, #0d0a07 100%);
    border-radius: 2px; touch-action: none; user-select: none;
  }`;
css = css.replace(stageRe, newStage);

const faceRe = /\.viewer-face\{[^}]*\}/;
if (!faceRe.test(css)) { console.error('viewer-face rule not found'); process.exit(1); }
css = css.replace(faceRe, `.viewer-face{
    position: absolute; inset: 0; backface-visibility: hidden;
    display: flex; align-items: center; justify-content: center;
  }`);

const imgRe = /\.viewer-face img\{[^}]*\}/;
if (!imgRe.test(css)) { console.error('viewer-face img rule not found'); process.exit(1); }
css = css.replace(imgRe, `.viewer-face img{ width: 100%; height: 100%; object-fit: cover; border-radius: 2px; }`);

fs.writeFileSync(cssPath, css);
console.log('patched', cssPath, '(', (css.length / 1024).toFixed(0), 'KB )');
