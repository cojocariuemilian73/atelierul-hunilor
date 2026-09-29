// Recalibrates the whole Atlas overlay on the antique map underneath.
//
// Before: markers, rivers, zones and routes had been placed as if the picture
// were a different map, so on this image the Catalaunian Plains sat in the
// Netherlands, Aquileia in Slovakia, Ravenna in Austria, Adrianople in Asia
// Minor and the "Hun route" ran through the Baltic. Every coordinate below was
// read off calibration grids laid over the 1248×832 image itself.
//
// Also: the map is cropped by default to the theatre of the story (Hispania →
// Caspian), text is larger and haloed, regions and seas are named so the
// picture reads on its own, and markers no longer jump to the corner on hover
// (the CSS scale used to overwrite the SVG translate).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const BODY = path.join(ROOT, 'build', 'atlas.body.html');
const CSS = path.join(ROOT, 'build', 'atlas.css');
const JS = path.join(ROOT, 'build', 'atlas.js');

function mustReplace(src, from, to, what){
  if (!src.includes(from)) { console.error('not found: ' + what); process.exit(1); }
  return src.replace(from, to);
}

// ---------------- BODY ----------------
let body = fs.readFileSync(BODY, 'utf8');

const VB = '120 280 690 320';
body = mustReplace(body, 'viewBox="0 0 1248 832" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Harta istorică',
  'viewBox="' + VB + '" data-vb="' + VB + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Harta istorică', 'svg viewBox');
// Smaller arrowheads: the map is now shown ~1.8× larger.
body = body.replace(/<marker id="arr(Huni|Visi|Ostro|Vand)" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z"/g,
  '<marker id="arr$1" viewBox="0 0 7 7" markerWidth="3.4" markerHeight="3.4" refX="4.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z"');

const start = body.indexOf('<g id="layer-rivers">');
const endMark = '\n          </g>\n          <rect x="0" y="0" width="1248" height="832" filter="url(#paperNoise)"';
const end = body.indexOf(endMark);
if (start === -1 || end === -1) { console.error('overlay block not found'); process.exit(1); }

const I = '            ';
function river(d){ return I + '<path class="river" d="' + d + '"/>\n'; }
function label(cls, x, y, txt, extra){ return I + '<text class="' + cls + '" x="' + x + '" y="' + y + '"' + (extra || '') + '>' + txt + '</text>\n'; }

function mk(i, type, year, x, y, name, lab, icon, big){
  // lab = [dx, dy, anchor]
  return I + '<g class="marker ' + type + '" data-i="' + i + '" data-year="' + year + '" transform="translate(' + x + ',' + y + ')" aria-label="' + name + '">' +
    '<g class="m-in">' +
    '<circle class="m-badge" cx="0" cy="0" r="' + (big ? 7.5 : 6.5) + '"/>' + (icon || '') +
    '<text class="m-label" x="' + lab[0] + '" y="' + lab[1] + '" text-anchor="' + lab[2] + '">' + name + '</text>' +
    '</g></g>\n';
}
const ICON_CITY = '<path d="M-4,-2.5 h8 v6 h-2 v-2.5 h-1.2 v2.5 h-1.6 v-2.5 h-1.2 v2.5 h-2 z" fill="#4a3520"/>';
const ICON_BATTLE = '<path d="M-3.4,-3.4 L3.4,3.4 M3.4,-3.4 L-3.4,3.4" stroke="var(--imperial)" stroke-width="1.6" stroke-linecap="round"/>';
const ICON_CAMP = '<path d="M0,-4.6 L5,2.6 L-5,2.6 Z" fill="var(--imperial)"/>';
const PULSE = '<circle class="pulse" r="7" fill="none" stroke="var(--imperial)" stroke-width="1.6"/>';

const overlay =
'<g id="layer-regions" aria-hidden="true">\n' +
  label('sea-label', 560, 462, 'Marea Neagră') +
  label('sea-label', 738, 472, 'Marea', '') +
  label('sea-label', 738, 483, 'Caspică', '') +
  label('sea-label', 392, 552, 'Marea Mediterană') +
  label('sea-label', 170, 412, 'Oceanul', ' text-anchor="end"') +
  label('sea-label', 170, 423, 'Atlantic', ' text-anchor="end"') +
  label('region-label', 218, 404, 'GALIA') +
  label('region-label', 172, 490, 'HISPANIA') +
  label('region-label', 356, 470, 'ITALIA', ' transform="rotate(48 356 470)"') +
  label('region-label', 250, 580, 'AFRICA') +
  label('region-label', 318, 330, 'GERMANIA') +
  label('region-label', 600, 362, 'STEPA PONTICĂ') +
  label('region-label', 556, 528, 'IMPERIUL DE RĂSĂRIT') +
  label('region-label', 400, 438, 'PANONIA', ' text-anchor="end"') +
'            </g>\n' +
'            <g id="layer-rivers">\n' +
  river('M292,402 Q274,382 278,358 Q272,338 258,322') +
  river('M298,392 Q345,378 386,392 Q398,412 410,440 Q430,452 452,447 Q480,453 494,440 Q500,430 505,422') +
  river('M456,380 Q428,392 421,410 Q418,428 413,440') +
  river('M702,280 Q672,330 663,375 Q640,392 606,404') +
  river('M772,308 Q738,330 706,340 Q688,372 702,410') +
  label('river-label', 284, 338, 'Rin', ' transform="rotate(-70 284 338)"') +
  label('river-label', 468, 462, 'Dunărea') +
  label('river-label', 438, 398, 'Tisa') +
  label('river-label', 676, 322, 'Don', ' transform="rotate(-62 676 322)"') +
  label('river-label', 718, 358, 'Volga', ' transform="rotate(-80 718 358)"') +
'            </g>\n' +
'            <g id="layer-zones">\n' +
  // 375–434: the Pontic steppe and the lower Danube (alans, greutungi subdued)
I + '<path id="zone-early" class="zone-hun" d="M502,410 Q520,362 600,350 Q680,340 728,368 Q732,396 704,404 Q640,388 582,400 Q540,406 502,414 Z" fill="url(#gradHuni)" opacity="0"/>\n' +
  // 434–453: the Hun hegemony at its widest, Pannonia to the Volga (approx.)
I + '<path id="zone-max" class="zone-hun" d="M360,396 Q378,358 432,338 Q520,312 620,316 Q705,318 748,350 Q758,392 722,406 Q640,388 580,402 Q540,408 506,422 Q472,452 440,450 Q410,448 396,432 Q366,418 360,396 Z" fill="url(#gradHuni)" opacity="0"/>\n' +
  // after Nedao (c. 454): what is left north of the Black Sea
I + '<path id="zone-late" class="zone-hun" d="M522,400 Q560,360 640,358 Q702,362 724,394 Q650,388 590,400 Q552,404 522,410 Z" fill="url(#gradHuni)" opacity="0"/>\n' +
I + '<path id="zone-max-outline" class="zone-max-outline" d="M360,396 Q378,358 432,338 Q520,312 620,316 Q705,318 748,350 Q758,392 722,406 Q640,388 580,402 Q540,408 506,422 Q472,452 440,450 Q410,448 396,432 Q366,418 360,396 Z" fill="none" stroke="var(--imperial)" stroke-width="1.4" stroke-dasharray="5 4"/>\n' +
'            </g>\n' +
'            <g id="layer-routes">\n' +
  // Tervingi: across the Danube (376), Adrianople (378), Italy / Rome (410), Aquitaine (418), Hispania
I + '<path id="route-visi" class="route route-visi" data-year="376" data-year-end="418" d="M497,414 C488,452 482,472 476,488 C440,478 385,462 336,484 C300,470 250,444 212,448 C192,462 178,476 168,490" marker-end="url(#arrVisi)"/>\n' +
  label('route-label rl-visi', 262, 468, 'Vizigoți') +
  // Greutungi: subject to the Huns from c. 375, move west with them into Pannonia
I + '<path id="route-ostro" class="route route-ostro" data-year="375" data-year-end="454" d="M548,402 Q492,396 430,414" marker-end="url(#arrOstro)"/>\n' +
  label('route-label rl-ostro', 520, 390, 'Ostrogoți') +
  // Vandals: Rhine crossing (406), Gaul, Hispania (409), Africa (429), Carthage (439)
I + '<path id="route-vand" class="route route-vand" data-year="401" data-year-end="439" d="M388,350 Q330,340 280,356 Q232,386 206,428 Q176,462 166,500 Q150,534 196,544 Q250,552 294,545" marker-end="url(#arrVand)"/>\n' +
  label('route-label rl-vand', 214, 540, 'Vandali') +
'            <g id="layer-huni-route">\n' +
  // c. 370–376: from beyond the Volga and Don across the Pontic steppe to the lower Danube
I + '<path id="route-huni-0" class="route route-huni-main" data-year="370" data-year-end="376" d="M718,392 Q650,384 580,396 Q536,404 506,414"/>\n' +
  // c. 376–420: along the lower Danube into the Pannonian plain
I + '<path id="route-huni-1" class="route route-huni-main" data-year="376" data-year-end="420" d="M506,414 Q480,444 448,446 Q428,440 422,420"/>\n' +
  // 441–442: Margus, Viminacium, Naissus
I + '<path id="route-huni-2" class="route route-huni-main" data-year="441" data-year-end="442" d="M421,420 Q426,444 431,460" marker-end="url(#arrHuni)"/>\n' +
  // 447: through Thrace up to the walls of Constantinople
I + '<path id="route-huni-3" class="route route-huni-main" data-year="447" data-year-end="448" d="M433,464 Q462,484 488,494" marker-end="url(#arrHuni)"/>\n' +
  // 451: up the Danube, across the Rhine, into Gaul
I + '<path id="route-huni-4" class="route route-huni-main" data-year="450" data-year-end="451" d="M418,412 Q380,384 330,378 Q300,370 280,360 Q258,368 244,378" marker-end="url(#arrHuni)"/>\n' +
  // 452: Aquileia and the Po valley
I + '<path id="route-huni-5" class="route route-huni-main" data-year="452" data-year-end="453" d="M418,416 Q376,420 334,428 Q312,426 294,432" marker-end="url(#arrHuni)"/>\n' +
  label('route-label rl-huni', 646, 402, 'Hunii') +
'            </g>\n' +
'            </g>\n' +
'            <g id="layer-markers">\n' +
  mk(0, 'city', 0, 333, 486, 'Roma', [0, 16, 'middle'], ICON_CITY, true) +
  mk(1, 'city', 402, 321, 445, 'Ravenna', [-10, 3, 'end'], '', false) +
  mk(2, 'city', 452, 331, 426, 'Aquileia', [-10, -4, 'end'], '', false) +
  mk(3, 'city', 441, 432, 463, 'Naissus', [10, 3, 'start'], '', false) +
  mk(4, 'city', 0, 492, 496, 'Constantinopol', [4, 17, 'start'], ICON_CITY, true) +
  mk(5, 'camp', 434, 420, 416, 'Reședința lui Attila', [0, -11, 'middle'], ICON_CAMP, false) +
  mk(6, 'battle', 378, 478, 488, 'Adrianopol', [-10, 3, 'end'], ICON_BATTLE, false) +
  mk(7, 'battle', 451, 240, 380, 'Câmpiile Catalaunice', [0, -11, 'middle'], ICON_BATTLE + PULSE, false) +
'            </g>';

body = body.slice(0, start) + overlay + body.slice(end);

body = mustReplace(body,
  '<p class="sub">Europa, Africa de Nord și stepa eurasiatică, 370–455 d.Hr. Trage cronologia pentru a vedea extinderea controlului hunic și rutele triburilor germanice — apasă pe orice pictogramă pentru sursa istorică din spatele ei.</p>',
  '<p class="sub">De la Volga până în Galia, 370–455 d.Hr. Trage cronologia: traseele se desenează an cu an, iar zona colorată arată cât de departe ajunsese puterea hunilor. Apasă pe orice oraș sau bătălie pentru sursa istorică.</p>',
  'subtitle');
fs.writeFileSync(BODY, body);
console.log('atlas.body.html: overlay recalibrat');

// ---------------- CSS ----------------
let css = fs.readFileSync(CSS, 'utf8');
css = mustReplace(css,
  "  .river{ fill: none; stroke: var(--gold); stroke-width: 1.2; stroke-dasharray: 1 5; opacity: 0.55; }\n  .river-label{ font-family: 'JetBrains Mono', monospace; font-size: 11px; fill: var(--gold); font-style: italic; paint-order: stroke; stroke: rgba(10,6,4,0.55); stroke-width: 3; }",
  "  .river{ fill: none; stroke: #2f6f86; stroke-width: 1.4; stroke-linecap: round; opacity: 0.75; }\n" +
  "  .river-label{ font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 600; font-size: 8px; fill: #1f5467; paint-order: stroke; stroke: rgba(240, 230, 214, 0.85); stroke-width: 2.2px; stroke-linejoin: round; pointer-events: none; }\n" +
  "  .sea-label{ font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 9px; fill: #2f5566; text-anchor: middle; letter-spacing: 0.06em; opacity: 0.85; pointer-events: none; }\n" +
  "  .region-label{ font-family: 'Cinzel', 'Cormorant Garamond', serif; font-size: 7.5px; font-weight: 700; fill: #5a4222; text-anchor: middle; letter-spacing: 0.22em; opacity: 0.7; pointer-events: none; paint-order: stroke; stroke: rgba(240, 230, 214, 0.55); stroke-width: 1.6px; }",
  'river css');
css = mustReplace(css,
  "  .route{ fill: none; stroke-width: 3.2; stroke-linecap: round; }",
  "  .route{ fill: none; stroke-width: 2.8; stroke-linecap: round; stroke-linejoin: round; }",
  'route css');
css = mustReplace(css,
  "  .route-huni-main{ stroke: url(#gradHuni); stroke-width: 4.4; filter: drop-shadow(0 0 2px rgba(0,0,0,0.35)); }",
  "  .route-huni-main{ stroke: var(--route-huni-1); stroke-width: 3.2; }",
  'huni css');
css = mustReplace(css,
  "  .route-label{ font-family: 'JetBrains Mono', monospace; font-size: 9.5px; font-weight: 700; }",
  "  .route-label{ font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 700; transition: opacity 0.3s ease; paint-order: stroke; stroke: rgba(18, 18, 20, 0.85); stroke-width: 2.6px; stroke-linejoin: round; pointer-events: none; }\n" +
  "  .rl-visi{ fill: #d6bdf0; } .rl-ostro{ fill: #f7c48f; } .rl-vand{ fill: #b3d3f4; } .rl-huni{ fill: #f0b3b8; }",
  'route-label css');
css = mustReplace(css,
  "  .marker{ cursor: pointer; opacity: 0.25; transition: opacity 0.4s ease, transform 0.15s ease; transform-box: fill-box; transform-origin: center; }\n  .marker.visible{ opacity: 1; }\n  .marker:hover, .marker.active{ transform: scale(1.25); }",
  "  .marker{ cursor: pointer; opacity: 0.3; transition: opacity 0.4s ease; outline: none; }\n  .marker.visible{ opacity: 1; }\n" +
  "  .m-in{ transition: transform 0.15s ease; }\n" +
  "  .marker:hover .m-in, .marker:focus-visible .m-in, .marker.active .m-in{ transform: scale(1.25); }\n" +
  "  .marker:focus-visible .m-badge{ stroke: var(--gold); stroke-width: 2.2; }",
  'marker css');
css = mustReplace(css,
  "  .m-label{ font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 11px;",
  "  .m-label{ font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 8.5px;",
  'm-label css');
css = css.replace("stroke: #f4e9d3; stroke-width: 3.5; stroke-linejoin: round; }", "stroke: #f4e9d3; stroke-width: 2.6px; stroke-linejoin: round; }");
css = mustReplace(css, "  .m-badge{ fill: #f4e9d3; stroke: #4a3520; stroke-width: 1.6; }", "  .m-badge{ fill: #f4e9d3; stroke: #4a3520; stroke-width: 1.3; }", 'm-badge');
fs.writeFileSync(CSS, css);
console.log('atlas.css: etichete lizibile, markere stabile');

// ---------------- JS ----------------
let js = fs.readFileSync(JS, 'utf8');
js = mustReplace(js,
  "      if (year < 434) return 'Expansiunea inițială: alanii și ostrogoții sunt supuși; vizigoții trec Dunărea (376).';",
  "      if (year < 434) return 'Expansiunea: alanii și greutungii (viitorii ostrogoți) sunt supuși; tervingii (viitorii vizigoți) trec Dunărea în 376, iar hunii se așază treptat în Câmpia Panonică.';",
  'eraText');
js = mustReplace(js,
  "      if (year < 453) return 'Apogeul: Attila conduce singur din 445, imperiul hunic atinge întinderea maximă.';",
  "      if (year < 441) return 'Rua, apoi Bleda și Attila (din 434): tratatul de la Margus și tributul plătit de Constantinopol.';\n" +
  "      if (year < 450) return 'Campaniile din Balcani (441–447): Naissus cade, iar armata hunică ajunge până la zidurile Constantinopolului. Attila conduce singur din c. 445.';\n" +
  "      if (year < 453) return 'Attila se întoarce spre Apus: Galia și Câmpiile Catalaunice (451), apoi Italia și Aquileia (452).';",
  'eraText 2');

// Zoom around the centre of the visible map, in SVG units (the viewBox is cropped now).
js = mustReplace(js,
  "    var zt = { scale: 1, x: 0, y: 0 };\n    function applyZoom(){ zoomGroup.setAttribute('transform', 'translate(' + zt.x + ',' + zt.y + ') scale(' + zt.scale + ')'); }",
  "    var svgEl = document.getElementById('map-svg');\n" +
  "    var vb = (svgEl.getAttribute('data-vb') || '0 0 1248 832').split(' ').map(Number);\n" +
  "    var cx = vb[0] + vb[2] / 2, cy = vb[1] + vb[3] / 2;\n" +
  "    var zt = { scale: 1, x: 0, y: 0 };\n" +
  "    function applyZoom(){\n" +
  "      var maxX = vb[2] * (zt.scale - 1) / 2, maxY = vb[3] * (zt.scale - 1) / 2;\n" +
  "      zt.x = Math.max(-maxX, Math.min(maxX, zt.x)); zt.y = Math.max(-maxY, Math.min(maxY, zt.y));\n" +
  "      zoomGroup.setAttribute('transform', 'translate(' + (cx + zt.x) + ',' + (cy + zt.y) + ') scale(' + zt.scale + ') translate(' + (-cx) + ',' + (-cy) + ')');\n" +
  "    }\n" +
  "    function unitsPerPx(){ var w = svgEl.getBoundingClientRect().width; return w ? vb[2] / w : 1; }",
  'zoom');
js = mustReplace(js,
  "      zt.x += (e.clientX - lastX); zt.y += (e.clientY - lastY);",
  "      var k = unitsPerPx();\n      zt.x += (e.clientX - lastX) * k; zt.y += (e.clientY - lastY) * k;",
  'pan');
fs.writeFileSync(JS, js);
console.log('atlas.js: texte de epocă corecte, zoom pe centrul hărții');

// ---------------- mobile: the map scrolls sideways instead of shrinking ----------------
{
  let b = fs.readFileSync(BODY, 'utf8');
  b = mustReplace(b,
    '<div class="legend-item"><span class="legend-swatch" style="background:linear-gradient(90deg,var(--route-huni-2),var(--route-huni-1))"></span> Înaintarea hunilor</div>',
    '<div class="legend-item"><span class="legend-swatch" style="background:var(--route-huni-1)"></span> Înaintarea hunilor</div>',
    'legend huni');
  b = mustReplace(b, '<div class="map-vignette"></div>\n      </div>',
    '<div class="map-vignette"></div>\n      </div>\n      <p class="map-swipe-hint">← glisează harta →</p>', 'swipe hint');
  fs.writeFileSync(BODY, b);
  let c = fs.readFileSync(CSS, 'utf8');
  c += "\n  .map-swipe-hint{ display: none; }\n" +
    "  @media (max-width: 640px){\n" +
    "    .stage, .stage > *, .frame, .map-area{ min-width: 0; }\n" +
    "    .map-area{ overflow-x: auto; overscroll-behavior-x: contain; -webkit-overflow-scrolling: touch; }\n" +
    "    .map-svg{ width: 680px; max-width: none; }\n" +
    "    .zoom-controls, .map-vignette{ display: none; }\n" +
    "    .map-swipe-hint{ display: block; margin: 6px 0 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: var(--ink-dim); letter-spacing: 0.08em; }\n" +
    "  }\n";
  fs.writeFileSync(CSS, c);
  console.log('atlas: hartă glisabilă pe mobil');
}
