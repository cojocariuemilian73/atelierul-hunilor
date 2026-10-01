// Acasă as a scrolling presentation: every block of prose gets a picture on
// its left (the picture stays in view while its text scrolls), and the blocks
// glide in as they reach the screen. The gallery images move next to the text
// they illustrate; three new pictures go in chapter 01.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const B = path.join(ROOT, 'build');
const IMG = path.join(ROOT, 'imagini', 'reale');
const BODY = path.join(B, 'story.body.html');
const uri = f => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(IMG, f)).toString('base64');

let s = fs.readFileSync(BODY, 'utf8');
if (s.includes('class="sr-row')) { console.error('already applied'); process.exit(1); }

function fail(what){ console.error('not found: ' + what); process.exit(1); }

// Removes a one-line gallery and returns its figures, restyled for a row.
function takeGallery(marker){
  const i0 = s.indexOf(marker); if (i0 === -1) fail(marker.slice(0, 80));
  const i1 = s.indexOf('</figure></div>', i0) + '</figure></div>'.length;
  const figs = s.slice(i0, i1).match(/<figure class="gal-item">[\s\S]*?<\/figure>/g);
  s = s.slice(0, i0).replace(/\s*$/, '') + s.slice(i1);
  return figs.map(f => f.replace('<figure class="gal-item">', '<figure class="sr-fig">'));
}
const fig = (file, alt, cap) => '<figure class="sr-fig"><img src="' + uri(file) + '" alt="' + alt + '" loading="lazy"><figcaption>' + cap + '</figcaption></figure>';

// Wraps the text from `start` up to (not including) `end` in a row with figures on the left.
function row(start, end, figs){
  const i0 = s.indexOf(start); if (i0 === -1) fail(start);
  let i1 = s.indexOf(end, i0); if (i1 === -1) fail(end);
  const text = s.slice(i0, i1).replace(/\s*$/, '');
  i1 = i0 + s.slice(i0, i1).replace(/\s*$/, '').length;
  s = s.slice(0, i0) +
    '<div class="sr-row sr-reveal">\n        <div class="sr-media">' + figs.join('') + '</div>\n        <div class="sr-text">\n      ' +
    text + '\n        </div>\n      </div>' + s.slice(i1);
}

const g3 = takeGallery('<div class="fig-gallery g3"><figure class="gal-item"><img id="img-ziduri"');
const [ziduri, solidus, aquileia] = g3;
const [delacroix, paczka] = takeGallery('<div class="fig-gallery g2"><figure class="gal-item"><img id="img-delacroix"');
const [pietroasa, craniu] = takeGallery('<div class="fig-gallery g2"><figure class="gal-item"><img id="img-pietroasa"');

// 01 — Context istoric & origini
row('<p class="lede">În literatura antică', '<h3 class="sub-title">Teoria legăturii', [fig('row-geiger.jpg',
  'Gravură: călăreți huni cu arcuri și lănci atacă războinici alani.',
  'J. N. Geiger, <b><i>Hunii în luptă cu alanii</i></b> (c. 1873). La Ammianus, alanii sunt primii loviți de huni. Domeniu public.')]);
row('<h3 class="sub-title">Teoria legăturii', '<h3 class="sub-title">Viața nomadă', [fig('row-xiongnu.jpg',
  'Coroană de aur cu un vultur din aur și turcoaz așezat deasupra unei calote decorate.',
  '<b>Coroana de aur de la Aluchaideng</b> (Mongolia Interioară, sec. IV–III î.Hr.), piesă Xiongnu, cu secole mai veche decât hunii europeni. Foto: Gary Todd, CC0.')]);
row('<h3 class="sub-title">Viața nomadă', '<div class="diagram"', [fig('row-neuville.jpg',
  'Ilustrație: călăreți huni cu arcuri, în galop, în plină bătălie.',
  'Alphonse de Neuville, <b><i>Hunii la bătălia de la Châlons</i></b> (1869), din <i>Istoria Franței</i> a lui Guizot: arcașii călare, așa cum și-i imagina secolul al XIX-lea. Domeniu public.')]);

// 03 — Marea Migrație
row('<p class="lede">Șocul de la 375', '<h3 class="sub-title">Mecanismul', [aquileia]);
row('<h3 class="sub-title">Mecanismul', '<figure class="fig-map">', [ziduri, solidus]);

// 04 — Personalități & impact
row('<p>Ironia istorică', '<h3 class="sub-title">Consecințe', [paczka]);
row('<h3 class="sub-title">Consecințe', '<h3 class="sub-title">Ecoul', [delacroix]);
row('<h3 class="sub-title">Ecoul', '<p class="source-caution"><b>O precizare', [pietroasa, craniu]);

fs.writeFileSync(BODY, s);
console.log('story.body.html: ' + (s.match(/class="sr-row/g) || []).length + ' rânduri cu imagine');

// ---------- CSS ----------
const CSS = `
  /* Acasă as a scrolling presentation: picture on the left, text on the right */
  @media (min-width: 1020px){
    .page-shell{ grid-template-columns: 200px minmax(0, 860px); }
  }
  @media (min-width: 1400px){
    .page-shell{ max-width: 1440px; grid-template-columns: 230px minmax(0, 960px); }
  }
  .main-col{ max-width: 960px; }
  .sr-row{ display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: clamp(22px, 3vw, 44px); align-items: start; margin: 34px 0 40px; }
  .sr-media{ position: sticky; top: 78px; display: flex; flex-direction: column; gap: 20px; }
  .sr-fig{ margin: 0; padding: 8px; background: var(--paper); border: 1px solid var(--line-strong); box-shadow: 0 18px 40px rgba(0, 0, 0, 0.38); position: relative; }
  .sr-fig::before{ content: ''; position: absolute; inset: -6px auto auto -6px; width: 34px; height: 34px; border-top: 2px solid var(--accent-2); border-left: 2px solid var(--accent-2); pointer-events: none; }
  .sr-fig img{ display: block; width: 100%; height: auto; max-height: 460px; object-fit: cover; cursor: zoom-in; filter: saturate(0.92); transition: filter 0.35s ease; }
  .sr-fig img:hover, .sr-fig img:focus-visible{ filter: saturate(1.06); }
  .sr-fig figcaption{ margin-top: 9px; font-size: 0.76rem; line-height: 1.5; color: var(--ink-dim); }
  .sr-fig figcaption b{ color: var(--ink); }
  .sr-text > :first-child{ margin-top: 0; }
  .sr-text .impact-grid{ grid-template-columns: repeat(2, 1fr); }
  .sr-text .impact-tile:nth-child(2n){ border-right: none; }
  .sr-text .impact-tile{ border-bottom: 1px solid var(--line); padding-right: 16px; }
  @media (max-width: 760px){
    .sr-row{ grid-template-columns: 1fr; gap: 18px; }
    .sr-media{ position: static; }
    .sr-media .sr-fig + .sr-fig{ display: none; }
    .sr-fig img{ max-height: 320px; }
  }
  /* blocks glide in as they reach the screen (only when the script runs) */
  .js-sr .sr-reveal{ opacity: 0; transform: translateY(36px); transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.2, 0.7, 0.2, 1); }
  .js-sr .sr-row.sr-reveal .sr-media{ opacity: 0; transform: translateX(-36px); transition: opacity 0.9s ease 0.12s, transform 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) 0.12s; }
  .js-sr .sr-reveal.sr-in, .js-sr .sr-row.sr-reveal.sr-in .sr-media{ opacity: 1; transform: none; }
  @media (prefers-reduced-motion: reduce){
    .js-sr .sr-reveal, .js-sr .sr-row.sr-reveal .sr-media{ opacity: 1; transform: none; transition: none; }
  }
`;
{
  const p = path.join(B, 'story.css');
  const c = fs.readFileSync(p, 'utf8');
  if (!c.includes('.sr-row')) fs.writeFileSync(p, c + CSS);
}

// ---------- JS ----------
{
  const p = path.join(B, 'story.js');
  let j = fs.readFileSync(p, 'utf8');
  const from = "var imgs = document.querySelectorAll('.fig-gallery img, .dc-img img');";
  if (!j.includes(from)) fail('lightbox selector');
  j = j.replace(from, "var imgs = document.querySelectorAll('.fig-gallery img, .dc-img img, .sr-fig img');");
  const anchor = '  // Click (or Enter) on an article image opens it larger, with its caption.';
  if (!j.includes(anchor)) fail('lightbox anchor');
  j = j.replace(anchor, `  // Blocks of the article glide in as they reach the screen.
  (function initReveal(){
    if (!('IntersectionObserver' in window)) return;
    var more = document.querySelectorAll('article .fig-map, article .duel, article .diagram, article .sec-title');
    for (var k = 0; k < more.length; k++) more[k].classList.add('sr-reveal');
    var items = document.querySelectorAll('.sr-reveal');
    if (!items.length) return;
    document.documentElement.classList.add('js-sr');
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) { e.target.classList.add('sr-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    for (var i = 0; i < items.length; i++) io.observe(items[i]);
  })();

` + anchor);
  fs.writeFileSync(p, j);
}
console.log('story.css / story.js actualizate');
