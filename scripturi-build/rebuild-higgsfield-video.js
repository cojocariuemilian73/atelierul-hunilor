// Short AI-generated video reconstructions (Higgsfield): a background clip in
// the Acasă header, one clip on the intro screen of each game campaign, and a
// background clip in the Solia masthead. Every clip is a separate file in
// video/ (not base64 inside the page) and is always labelled on screen
// "Reconstituire generată cu AI (Higgsfield)", so it can never be mistaken for
// a historical document. The header clips are only loaded when the visitor
// allows motion; until one actually plays, the painting and its credit stay.
// Run on a fresh build/ (see restore-build.js), then assemble + standalone.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const B = path.join(ROOT, 'build');

// CSS goes to both the module stylesheet (standalone page) and its scoped copy
// (combined page): earlier rebuild scripts edited the scoped files directly,
// so they are not regenerated from the module stylesheet.
function appendCss(mod, scope, rules){
  fs.appendFileSync(path.join(B, mod + '.css'), '\n' + rules.map(r => '  ' + r).join('\n') + '\n');
  if (!scope) return;
  const scoped = rules.map(r => {
    const brace = r.indexOf('{');
    return r.slice(0, brace).split(', ').map(sel => '.' + scope + ' ' + sel).join(', ') + r.slice(brace);
  });
  fs.appendFileSync(path.join(B, mod + '.scoped.css'), '\n' + scoped.map(r => '  ' + r).join('\n') + '\n');
}

function edit(file, pairs){
  let s = fs.readFileSync(file, 'utf8');
  for (const [from, to] of pairs) {
    if (!s.includes(from)) { console.error('not found in ' + path.basename(file) + ': ' + from.slice(0, 70)); process.exit(1); }
    s = s.split(from).join(to);
  }
  fs.writeFileSync(file, s);
}

const AI = 'Reconstituire generată cu AI (Higgsfield)';

// ---------- Acasă: header background ----------
edit(path.join(B, 'story.body.html'), [
  ['<p class="hero-credit">Rafael, <i>Întâlnirea lui Leon cel Mare cu Attila</i> (1514), Vatican · domeniu public</p>\n    <div class="hero-scrim"></div>',
   '<video class="hero-video" data-src="video/acasa.mp4" muted loop playsinline preload="none" aria-hidden="true"></video>\n' +
   '    <p class="hero-credit">Rafael, <i>Întâlnirea lui Leon cel Mare cu Attila</i> (1514), Vatican · domeniu public</p>\n' +
   '    <p class="hero-credit hero-ai-note">' + AI + ' · călăreți huni în stepa pontică, scenă imaginată</p>\n' +
   '    <div class="hero-scrim"></div>'],
]);
appendCss('story', null, [
  '.hero-video{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.8s ease; }',
  '.hero.has-video .hero-video{ opacity: 1; }',
  '.hero-ai-note, .hero.has-video .hero-credit{ display: none; }',
  '.hero.has-video .hero-ai-note{ display: block; }',
]);
fs.appendFileSync(path.join(B, 'story.js'), `
// Header video (AI reconstruction, a separate file in video/). Not loaded at
// all when the visitor asks for reduced motion; the painting stays until the
// clip really plays, so a missing file or a blocked autoplay changes nothing.
(function(){
  var v = document.querySelector('.hero-video');
  if (!v) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  v.addEventListener('playing', function(){ v.parentNode.classList.add('has-video'); });
  v.src = v.getAttribute('data-src');
  var p = v.play();
  if (p && p.catch) p.catch(function(){});
})();
`);

// ---------- Solia: masthead background ----------
edit(path.join(B, 'embassy.body.html'), [
  ['<p class="hero-credit">Mór Than, <i>Ospățul lui Attila</i> (1870) · domeniu public</p>\n    <div class="masthead-scrim"></div>',
   '<video class="masthead-video" data-src="video/solia.mp4" muted loop playsinline preload="none" aria-hidden="true"></video>\n' +
   '    <p class="hero-credit">Mór Than, <i>Ospățul lui Attila</i> (1870) · domeniu public</p>\n' +
   '    <p class="hero-credit masthead-ai-note">' + AI + ' · solia bizantină ajunge la reședința lui Attila (449), după descrierea lui Priscus; scenă imaginată</p>\n' +
   '    <div class="masthead-scrim"></div>'],
]);
appendCss('embassy', 'm-embassy', [
  '.masthead-video{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.8s ease; }',
  '.masthead.has-video .masthead-video{ opacity: 1; }',
  '.masthead-ai-note, .masthead.has-video .hero-credit{ display: none; }',
  '.masthead.has-video .masthead-ai-note{ display: block; }',
]);
fs.appendFileSync(path.join(B, 'embassy.js'), `
// Opening scene of the Solia (AI reconstruction, a separate file in video/),
// loaded only when motion is allowed; the painting stays until it plays.
(function(){
  var v = document.querySelector('.masthead-video');
  if (!v) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  v.addEventListener('playing', function(){ v.parentNode.classList.add('has-video'); });
  v.src = v.getAttribute('data-src');
  var p = v.play();
  if (p && p.catch) p.catch(function(){});
})();
`);

// ---------- Campania Hunilor: one clip on each campaign intro ----------
const CAMPAIGN = [
  ['video/campania-1.mp4', 'un geograf grec din Alexandria desenând o hartă, în secolul al II-lea. Scenă imaginată, nu un portret al lui Ptolemeu.'],
  ['video/campania-2.mp4', 'o caravană de negustori sogdieni pe Drumul Mătăsii, la începutul secolului al IV-lea, epoca scrisorilor sogdiene.'],
  ['video/campania-3.mp4', 'goți cu care și vite pe malul de nord al Dunării, în 376, așteptând să treacă în Imperiu. Scenă imaginată.'],
  ['video/campania-4.mp4', 'două armate față în față pe o câmpie din Galia, în 451, înaintea bătăliei de la Câmpiile Catalaunice. Scenă imaginată.'],
];
edit(path.join(B, 'game.body.html'), [
  ['    <p class="level-lore" id="li-lore">—</p>\n',
   '    <figure class="li-video" id="li-vfig" hidden>\n' +
   CAMPAIGN.map((c, i) => '      <video id="li-video-' + i + '" data-src="' + c[0] + '" data-cap="' + c[1] + '" muted playsinline controls preload="none" hidden></video>\n').join('') +
   '      <figcaption><b>' + AI + '</b> — <span id="li-vcap"></span></figcaption>\n' +
   '    </figure>\n' +
   '    <p class="level-lore" id="li-lore">—</p>\n'],
]);
appendCss('game', 'm-game', [
  '.li-video{ margin: 4px 0 18px; }',
  '.li-video[hidden], .li-video video[hidden]{ display: none; }',
  '.li-video video{ width: 100%; aspect-ratio: 16 / 9; height: auto; max-height: 360px; object-fit: cover; background: #0e0e10; display: block; border: 1px solid var(--line-bright); border-radius: 2px; }',
  '.li-video figcaption{ margin-top: 7px; font-size: 0.76rem; line-height: 1.5; color: var(--ink-dim2); }',
  '.li-video figcaption b{ color: var(--gold); font-weight: 700; }',
]);
edit(path.join(B, 'game.js'), [
  ['    liKicker.textContent = lv.kicker;\n',
   '    showLevelVideo(state.levelIndex);\n' +
   '    liKicker.textContent = lv.kicker;\n'],
  ['  function renderLevelIntro(){\n',
   '  // Short AI reconstruction (a separate file in video/) at the start of each\n' +
   '  // campaign. It plays once, muted, and only on its own when motion is allowed;\n' +
   '  // the controls let the player watch it again. A missing file hides it.\n' +
   '  function showLevelVideo(i){\n' +
   '    var fig = document.getElementById(\'li-vfig\');\n' +
   '    if (!fig) return;\n' +
   '    var vids = fig.querySelectorAll(\'video\');\n' +
   '    for (var k = 0; k < vids.length; k++) { vids[k].pause(); vids[k].hidden = true; }\n' +
   '    var v = document.getElementById(\'li-video-\' + i);\n' +
   '    if (!v) { fig.hidden = true; return; }\n' +
   '    if (!v.getAttribute(\'src\')) {\n' +
   '      v.addEventListener(\'error\', function(){ fig.hidden = true; });\n' +
   '      v.src = v.getAttribute(\'data-src\');\n' +
   '    }\n' +
   '    v.hidden = false;\n' +
   '    document.getElementById(\'li-vcap\').textContent = v.getAttribute(\'data-cap\');\n' +
   '    fig.hidden = false;\n' +
   '    var reduced = window.matchMedia && window.matchMedia(\'(prefers-reduced-motion: reduce)\').matches;\n' +
   '    if (!reduced) { try { v.currentTime = 0; } catch (e) {} var p = v.play(); if (p && p.catch) p.catch(function(){}); }\n' +
   '  }\n\n' +
   '  function renderLevelIntro(){\n'],
]);

// ---------- Despre proiect: say where the videos come from ----------
edit(path.join(ROOT, 'scripturi-build', 'assemble.js'), [
  ['      <li><strong>Hărțile istorice din articol</strong>',
   '      <li><strong>Secvențele video</strong> (fundalul antetului din Acasă, introducerile celor patru campanii din joc și scena de la începutul Soliei) sunt <em>reconstituiri generate cu AI (Higgsfield)</em>, nu documente istorice: fiecare are pe ecran mențiunea „' + AI + '”. Sunt fișiere separate, în folderul <code>video/</code>; pagina funcționează și fără ele.</li>\n' +
   '      <li><strong>Hărțile istorice din articol</strong>'],
]);

// ---------- standalone pages live in module-individuale/, one level down ----------
edit(path.join(ROOT, 'scripturi-build', 'build-standalone.js'), [
  ["  for (const [from, to] of Object.entries(LINKS)) body = body.split('href=\"' + from + '\"').join('href=\"' + to + '\"');\n",
   "  for (const [from, to] of Object.entries(LINKS)) body = body.split('href=\"' + from + '\"').join('href=\"' + to + '\"');\n" +
   "  body = body.split('data-src=\"video/').join('data-src=\"../video/');\n"],
]);

console.log('video reconstructions added to story, embassy, game and the about modal');
