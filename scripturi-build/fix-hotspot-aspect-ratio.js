// Second, simpler take on hotspot alignment. Positioning the dots from JS
// failed because the Laborator page is display:none at load: the image box
// measures 0x0, so nothing could be computed, and neither the load event nor a
// ResizeObserver reliably re-ran once the page was shown.
//
// Instead, give the image wrapper the photo's own aspect-ratio and let CSS fit
// it inside the stage. The wrapper box then *is* the rendered picture, so plain
// percentage offsets land exactly where they should — no measurement, no
// observers, and it works while the page is still hidden.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const JS = path.join(ROOT, 'build', 'lab.js');
const CSS = path.join(ROOT, 'build', 'lab.css');

// Natural sizes of the three museum photos, used for the CSS aspect ratios.
const RATIOS = ['1126 / 1200', '1200 / 949', '1200 / 570'];

let js = fs.readFileSync(JS, 'utf8');

// 1. Card markup carries the ratio as a custom property.
const oldFace = `          '<div class="viewer-face front"><img src="' + art.img + '" alt="' + art.alt + '"/></div>' +`;
const newFace = `          '<div class="viewer-face front" style="--ar: ' + art.ratio + '"><img src="' + art.img + '" alt="' + art.alt + '"/></div>' +`;
if (!js.includes(oldFace)) { console.error('face markup not found'); process.exit(1); }
js = js.replace(oldFace, newFace);

// 2. Add the ratio to each artifact, right before its image payload.
let i = 0;
js = js.replace(/(\n\s*)"img": "data:image\/jpeg;base64,/g, function(m, indent){
  const r = RATIOS[i++];
  return indent + '"ratio": "' + r + '",' + m;
});
if (i !== 3) { console.error('expected 3 artifacts, patched ' + i); process.exit(1); }

// 3. Percentages again, and drop the measuring machinery entirely.
const measureStart = js.indexOf('    var faceEl = stage.querySelector');
const measureEnd = js.indexOf('    art.hotspots.forEach(function(hs){', measureStart);
if (measureStart === -1 || measureEnd === -1) { console.error('measure block not found'); process.exit(1); }
js = js.slice(0, measureStart) + '    var faceEl = stage.querySelector(\'.viewer-face.front\');\n\n' + js.slice(measureEnd);

js = js.replace(`      dot.className = 'hotspot';
      dot.setAttribute('role', 'button');`,
`      dot.className = 'hotspot';
      dot.style.left = hs.x + '%';
      dot.style.top = hs.y + '%';
      dot.setAttribute('role', 'button');`);

js = js.replace(`      dots.push({ el: dot, hs: hs });
      faceEl.appendChild(dot);
    });

    if (imgEl.complete) placeDots();
    imgEl.addEventListener('load', placeDots);
    window.addEventListener('resize', placeDots);
    // The Laborator page starts hidden (display:none), so at first render the
    // image box measures 0x0 and the dots cannot be placed. Observing the stage
    // re-runs the layout the moment the page is actually shown.
    if (window.ResizeObserver) { new ResizeObserver(placeDots).observe(stage); }
`,
`      faceEl.appendChild(dot);
    });
`);

fs.writeFileSync(JS, js);
console.log('lab.js: pozitionare pe baza de aspect-ratio, fara masuratori JS');

// 4. CSS: the face box now fits the photo exactly.
let css = fs.readFileSync(CSS, 'utf8');
const oldCss = `  .viewer-object{
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .viewer-face{
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
  }`;
const newCss = `  .viewer-object{
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
  }
  /* The face box takes the photo's own aspect ratio and is capped by the stage,
     so it ends up exactly the size of the rendered picture — which is what makes
     the percentage-positioned hotspots line up with the object. */
  .viewer-face{
    position: relative;
    width: 100%; height: auto;
    max-width: 100%; max-height: 100%;
    aspect-ratio: var(--ar, 1);
  }`;
if (!css.includes(oldCss)) { console.error('viewer CSS not found'); process.exit(1); }
css = css.replace(oldCss, newCss);
css = css.replace('  .viewer-face img{ width: 100%; height: 100%; object-fit: contain; border-radius: 2px; }',
                  '  .viewer-face img{ display: block; width: 100%; height: 100%; object-fit: fill; border-radius: 2px; }');
fs.writeFileSync(CSS, css);
console.log('lab.css: .viewer-face foloseste aspect-ratio');
