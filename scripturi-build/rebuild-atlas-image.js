// Rebuilds build/atlas.body.html to use the real background image (imagini/*.jpg)
// with hand-calibrated pixel positions (viewBox matches the image's natural 1248x832 px)
// instead of the D3/topojson live-fetched vector map.
const fs = require('fs');
const path = require('path');

const IMG_PATH = path.join(__dirname, '..', 'imagini', 'Clean_antique_map_of_Europe_the_Black_Sea_the_Caucasus_and_t.jpg');
const imgBuf = fs.readFileSync(IMG_PATH);
const imgDataUri = 'data:image/jpeg;base64,' + imgBuf.toString('base64');

// ---- hand-calibrated pixel positions (1248 x 832 viewBox, matches image natural size) ----
const MARKERS = [
  { i: 0, type: 'city',   x: 331, y: 444, year: 0,   label: 'Roma' },
  { i: 1, type: 'city',   x: 364, y: 403, year: 402, label: 'Ravenna' },
  { i: 2, type: 'city',   x: 420, y: 387, year: 452, label: 'Aquileia' },
  { i: 3, type: 'city',   x: 478, y: 444, year: 441, label: 'Naissus' },
  { i: 4, type: 'city',   x: 490, y: 500, year: 0,   label: 'Constantinopol' },
  { i: 5, type: 'camp',   x: 390, y: 360, year: 434, label: 'Tabăra de pe Tisa' },
  { i: 6, type: 'battle', x: 518, y: 509, year: 378, label: 'Adrianopol' },
  { i: 7, type: 'battle', x: 267, y: 309, year: 451, label: 'Câmp. Catalaunice' }
];

const RIVERS = [
  { name: 'Rinul',   d: 'M330,320 Q315,260 293,197' },
  { name: 'Dunărea', d: 'M330,300 Q390,345 420,375 Q460,410 560,430' },
  { name: 'Tisa',    d: 'M400,310 Q390,360 430,405' },
  { name: 'Donul',   d: 'M650,300 Q620,360 590,405' },
  { name: 'Volga',   d: 'M850,280 Q830,350 814,417' }
];
const RIVER_LABELS = [
  { name: 'Rinul',   x: 300, y: 260 },
  { name: 'Dunărea', x: 460, y: 400 },
  { name: 'Tisa',    x: 415, y: 345 },
  { name: 'Donul',   x: 630, y: 345 },
  { name: 'Volga',   x: 840, y: 340 }
];

const ZONES = {
  early: 'M650,340 Q700,320 740,350 Q720,390 670,385 Q640,365 650,340 Z',
  max:   'M390,330 Q450,300 550,290 Q650,300 750,320 Q800,360 750,400 Q650,410 550,405 Q450,395 390,370 Z',
  late:  'M370,340 Q420,325 450,345 Q440,380 390,385 Q365,365 370,340 Z'
};

const ROUTES = [
  { id: 'route-visi',  cls: 'route-visi',  marker: 'arrVisi',  year: 376, d: 'M480,500 Q400,470 300,440 Q220,415 190,370', label: 'Vizigoți',        lx: 260, ly: 430 },
  { id: 'route-ostro', cls: 'route-ostro', marker: 'arrOstro', year: 375, d: 'M420,375 Q400,360 385,350',                 label: 'Ostrogoți',       lx: 400, ly: 335 },
  { id: 'route-vand',  cls: 'route-vand',  marker: 'arrVand',  year: 406, d: 'M293,220 Q260,280 220,340 Q185,400 185,460', label: 'Vandali',         lx: 200, ly: 400 },
  { id: 'route-huni',  cls: 'route-huni',  marker: 'arrHuni',  year: 441, d: 'M420,400 Q460,440 490,470 Q505,485 518,500', label: 'Către Constant.', lx: 460, ly: 460 }
];

function marker(m) {
  let inner = `<circle class="m-badge" cx="0" cy="0" r="${m.type === 'city' && (m.i === 0 || m.i === 4) ? 11 : 9}"/>`;
  if (m.type === 'camp') {
    inner += `<path d="M0,-9 L10,3 L-10,3 Z" fill="var(--imperial)"/>`;
  } else if (m.type === 'battle') {
    inner += `<path d="M-5,-5 L5,5 M5,-5 L-5,5" stroke="var(--imperial)" stroke-width="2"/>`;
    if (m.year === 451) inner += `<circle class="pulse" r="10" fill="none" stroke="var(--imperial)" stroke-width="2"/>`;
  } else if (m.i === 0) {
    inner += `<path d="M-6,-4 h12 v10 h-3 v-4 h-2 v4 h-2 v-4 h-2 v4 h-3 z" fill="var(--land-edge)" transform="translate(0,-5)"/>`;
  }
  inner += `<text class="m-label" x="0" y="-16" text-anchor="middle">${m.label}</text>`;
  return `<g class="marker ${m.type}" data-i="${m.i}" data-year="${m.year}" transform="translate(${m.x},${m.y})">${inner}</g>`;
}

const layerRivers = RIVERS.map(r => `<path class="river" d="${r.d}"/>`).join('\n            ')
  + '\n            ' + RIVER_LABELS.map(l => `<text class="river-label" x="${l.x}" y="${l.y}">${l.name}</text>`).join('\n            ');

const layerZones =
  `<path id="zone-early" class="zone-hun" d="${ZONES.early}" fill="url(#gradHuni)" opacity="0"/>\n` +
  `            <path id="zone-max" class="zone-hun" d="${ZONES.max}" fill="url(#gradHuni)" opacity="0"/>\n` +
  `            <path id="zone-late" class="zone-hun" d="${ZONES.late}" fill="url(#gradHuni)" opacity="0"/>\n` +
  `            <path id="zone-max-outline" class="zone-max-outline" d="${ZONES.max}" fill="none" stroke="var(--imperial)" stroke-width="2" stroke-dasharray="5 5"/>`;

const layerRoutes = ROUTES.map(r =>
  `<path id="${r.id}" class="route ${r.cls}" data-year="${r.year}" d="${r.d}" marker-end="url(#${r.marker})"/>\n` +
  `            <text class="route-label" x="${r.lx}" y="${r.ly}" fill="var(--route-${r.cls.replace('route-', '')})">${r.label}</text>`
).join('\n            ');

const layerMarkers = MARKERS.map(marker).join('\n            ');

const svgBlock = `<svg class="map-svg" id="map-svg" viewBox="0 0 1248 832" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Harta istorică a migrației hunilor, pe fond de hartă antică ilustrată">
          <defs>
            <linearGradient id="gradHuni" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="var(--route-huni-2)"/>
              <stop offset="100%" stop-color="var(--route-huni-1)"/>
            </linearGradient>
            <marker id="arrHuni" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="var(--route-huni-1)"/></marker>
            <marker id="arrVisi" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="var(--route-visi)"/></marker>
            <marker id="arrOstro" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="var(--route-ostro)"/></marker>
            <marker id="arrVand" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="var(--route-vand)"/></marker>
            <filter id="paperNoise" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise"/>
              <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.16  0 0 0 0 0.11  0 0 0 0 0.05  0 0 0 0.05 0"/>
              <feComposite operator="over" in2="SourceGraphic"/>
            </filter>
          </defs>

          <g id="zoom-group">
            <image href="${imgDataUri}" x="0" y="0" width="1248" height="832" preserveAspectRatio="xMidYMid slice"/>
            <g id="layer-rivers">
            ${layerRivers}
            </g>
            <g id="layer-zones">
            ${layerZones}
            </g>
            <g id="layer-routes">
            ${layerRoutes}
            </g>
            <g id="layer-markers">
            ${layerMarkers}
            </g>
          </g>
          <rect x="0" y="0" width="1248" height="832" filter="url(#paperNoise)" class="paper-grain"/>
        </svg>`;

const bodyPath = path.join(__dirname, '..', 'build', 'atlas.body.html');
let body = fs.readFileSync(bodyPath, 'utf8');

// drop the D3/topojson script tags (no longer needed — no live fetch)
body = body.replace(
  `<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"></script>\n<script src="https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js"></script>\n`,
  ''
);

// replace the whole <svg ...>...</svg> block
body = body.replace(/<svg class="map-svg"[\s\S]*?<\/svg>/, svgBlock);

// drop the loading-status paragraph (no async load anymore)
body = body.replace(/\s*<p class="map-status"[^>]*>.*?<\/p>\n/, '\n');

fs.writeFileSync(bodyPath, body);
console.log('wrote', bodyPath, '(', (body.length / 1024).toFixed(0), 'KB )');
