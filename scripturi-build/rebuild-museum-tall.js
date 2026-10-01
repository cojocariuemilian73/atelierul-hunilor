// Tall photos (the Apahida eagle, the Mözs skull) made their cards very long:
// the stage is now never taller than 460px — its width shrinks with the
// photo's own ratio and it is centred, so hotspots keep their positions.
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'build', 'lab.css');
let s = fs.readFileSync(FILE, 'utf8');
const from = '    position: relative; width: 100%; aspect-ratio: var(--ar, 4 / 3);';
if (!s.includes(from)) { console.error('viewer-stage rule not found'); process.exit(1); }
s = s.replace(from, '    position: relative; width: min(100%, calc(460px * (var(--ar, 4 / 3)))); margin: 0 auto; aspect-ratio: var(--ar, 4 / 3);');
fs.writeFileSync(FILE, s);
console.log('lab.css: imaginile verticale limitate la 460px');
