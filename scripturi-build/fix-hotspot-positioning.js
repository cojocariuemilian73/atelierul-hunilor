// Hotspots were positioned as a percentage of the viewer stage, but the photo
// inside it is laid out with `object-fit: contain`, so it is letterboxed: the
// rendered picture is smaller than the box and offset inside it. Percentages
// therefore landed beside the object rather than on it — badly for the wide
// diadem strip, where the dots fell outside the picture entirely.
// Fix: compute the contained rect from the image's natural size and place each
// dot in pixels against that rect, re-running on load and on resize.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const JS = path.join(ROOT, 'build', 'lab.js');

let js = fs.readFileSync(JS, 'utf8');

const oldLoop = `    art.hotspots.forEach(function(hs){
      var dot = document.createElement('div');
      dot.className = 'hotspot';
      dot.style.left = hs.x + '%';
      dot.style.top = hs.y + '%';`;

const newLoop = `    var faceEl = stage.querySelector('.viewer-face.front');
    var imgEl = faceEl.querySelector('img');
    var dots = [];

    // The photo is letterboxed by object-fit: contain, so map each hotspot's
    // percentage onto the rendered picture rect rather than onto the stage box.
    function placeDots(){
      var nw = imgEl.naturalWidth, nh = imgEl.naturalHeight;
      if (!nw || !nh) return;
      var bw = imgEl.clientWidth, bh = imgEl.clientHeight;
      if (!bw || !bh) return;
      var scale = Math.min(bw / nw, bh / nh);
      var rw = nw * scale, rh = nh * scale;
      var ox = (bw - rw) / 2, oy = (bh - rh) / 2;
      dots.forEach(function(d){
        d.el.style.left = (ox + rw * d.hs.x / 100) + 'px';
        d.el.style.top = (oy + rh * d.hs.y / 100) + 'px';
      });
    }

    art.hotspots.forEach(function(hs){
      var dot = document.createElement('div');
      dot.className = 'hotspot';`;

if (!js.includes(oldLoop)) { console.error('hotspot loop not found'); process.exit(1); }
js = js.replace(oldLoop, newLoop);

const oldAppend = `      stage.querySelector('.viewer-face.front').appendChild(dot);
    });`;
const newAppend = `      dots.push({ el: dot, hs: hs });
      faceEl.appendChild(dot);
    });

    if (imgEl.complete) placeDots();
    imgEl.addEventListener('load', placeDots);
    window.addEventListener('resize', placeDots);`;

if (!js.includes(oldAppend)) { console.error('append block not found'); process.exit(1); }
js = js.replace(oldAppend, newAppend);

// Re-point the diadem hotspots at the new, tighter crop of the piece. The
// artifacts array is JSON-serialised, so each coordinate sits on its own line.
[
  ['Incrustații de granat', 40, 45],
  ['Bordura perlată', 30, 84],
  ['Sistem de prindere', 61, 24]
].forEach(function(entry){
  const title = entry[0], nx = entry[1], ny = entry[2];
  const re = new RegExp('("x": )\\d+(,\\s*"y": )\\d+(,\\s*"title": "' + title + ')');
  if (!re.test(js)) { console.error('coord not found for: ' + title); process.exit(1); }
  js = js.replace(re, '$1' + nx + '$2' + ny + '$3');
});

fs.writeFileSync(JS, js);
console.log('lab.js: hotspot-urile se poziționează acum pe imaginea randată, nu pe container');
