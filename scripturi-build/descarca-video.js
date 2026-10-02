// Downloads the six Higgsfield clips (AI reconstructions) into video/, under
// the names the pages expect. Needs Node 18+ (built-in fetch).
//   node scripturi-build/descarca-video.js
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'video');
const BASE = 'https://d8j0ntlcm91z4.cloudfront.net/user_3AOz5V0edWi8nu1E2J1moKB3Ezn/';
const CLIPS = {
  'acasa.mp4':      'hf_20261002_183346_30e2fc65-cbbd-4e6e-9042-e2b513b0e13a.mp4',
  'campania-1.mp4': 'hf_20261002_183107_7db9678d-699b-4bee-8f6a-07dcacb749ef.mp4',
  'campania-2.mp4': 'hf_20261002_183107_ffeaf880-2e75-48c8-9360-a90b2939a304.mp4',
  'campania-3.mp4': 'hf_20261002_183540_b63800b2-44cf-42b7-b651-de219f60d091.mp4',
  'campania-4.mp4': 'hf_20261002_183346_55d8bfb3-94c4-4964-979a-63eca58d03ad.mp4',
  'solia.mp4':      'hf_20261002_183107_d1505d07-afa7-41b8-b7d6-5192d85cdc30.mp4',
};

(async () => {
  fs.mkdirSync(DIR, { recursive: true });
  for (const [name, file] of Object.entries(CLIPS)) {
    const res = await fetch(BASE + file);
    if (!res.ok) { console.error(name + ': HTTP ' + res.status); process.exitCode = 1; continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(path.join(DIR, name), buf);
    console.log('video/' + name, (buf.length / 1024 / 1024).toFixed(1) + ' MB');
  }
})();
