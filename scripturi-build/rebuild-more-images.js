// More real images across the site (all from Wikimedia Commons, public domain
// or free licences, each captioned with author, date and licence):
//   Article  — three small galleries (Balkans & tribute, 452–453, Romania)
//              and an image on each of the Attila / Aetius cards; click to enlarge.
//   Game     — an image on the intro of campaigns I, III and IV.
//   Solia    — images on stages 1 and 8, reused from the article.
//   Atlas    — the detail window of Roma, Aquileia, Constantinopol, the
//              residence and the Catalaunian Plains shows a matching image.
// Images already on the page are reused by reference (no second copy).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const B = path.join(ROOT, 'build');
const IMG = path.join(ROOT, 'imagini', 'reale');
const uri = f => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(IMG, f)).toString('base64');

function edit(file, pairs){
  let s = fs.readFileSync(file, 'utf8');
  for (const [from, to] of pairs) {
    if (!s.includes(from)) { console.error('not found in ' + path.basename(file) + ': ' + from.slice(0, 90)); process.exit(1); }
    s = s.replace(from, to);
  }
  fs.writeFileSync(file, s);
  console.log(path.basename(file) + ': ' + pairs.length + ' inserări');
}

const fig = (id, file, alt, cap) =>
  '<figure class="gal-item"><img id="' + id + '" src="' + uri(file) + '" alt="' + alt + '" loading="lazy"><figcaption>' + cap + '</figcaption></figure>';

// ======================= ARTICLE =======================
{
  const file = path.join(B, 'story.body.html');
  let s = fs.readFileSync(file, 'utf8');
  const listEnd = s.indexOf('</ol>', s.indexOf('<ol class="domino-list">')) + 5;
  if (listEnd < 5) { console.error('domino list not found'); process.exit(1); }
  s = s.slice(0, listEnd) + '\n\n      <div class="fig-gallery g3">' +
    fig('img-ziduri', 'web-ziduri.jpg', 'Zidurile Theodosiene ale Constantinopolului, porțiune păstrată, cu un turn și o poartă.',
      '<b>Zidurile Theodosiene</b> ale Constantinopolului, ridicate în 413 și refăcute în grabă în 447, după un cutremur, când armata lui Attila se apropia. Foto: Carole Raddato, CC BY-SA 2.0.') +
    fig('img-solidus', 'web-solidus.jpg', 'Solid de aur al împăratului Teodosie al II-lea, avers cu bustul împăratului.',
      '<b>Solid de aur al lui Teodosie al II-lea</b> (408–450), moneda tributului. La 72 de solizi la livră, cele 2.100 de livre pe an însemnau peste 150.000 de monede. CC0.') +
    fig('img-aquileia', 'web-aquileia.jpg', 'Miniatură medievală: călăreți în armuri asediază o cetate cu ziduri albe și turnuri.',
      '<b>Attila asediază Aquileia</b> (452), în <i>Cronica pictată de la Viena</i> (c. 1360). Pictorul îi îmbracă pe huni în armuri de cavaleri ai secolului său. Domeniu public.') +
    '</div>' + s.slice(listEnd);
  fs.writeFileSync(file, s);
}
edit(path.join(B, 'story.body.html'), [
  ['<div class="duel-card attila">\n          <p class="dc-role">Regele hunilor</p>',
   '<div class="duel-card attila">\n          <figure class="dc-img"><img id="img-attila" src="' + uri('web-attila-portret.jpg') + '" alt="Miniatură medievală: Attila cu coroană și sabie, într-o inițială decorată." loading="lazy"><figcaption>Attila în <i>Cronica pictată de la Viena</i> (c. 1360) — o imagine medievală, nu un portret. Domeniu public.</figcaption></figure>\n          <p class="dc-role">Regele hunilor</p>'],
  ['<div class="duel-card aetius">\n          <p class="dc-role">Generalul roman</p>',
   '<div class="duel-card aetius">\n          <figure class="dc-img"><img id="img-catalaunice" src="' + uri('web-catalaunice.jpg') + '" alt="Miniatură medievală: două armate de cavaleri se ciocnesc călare." loading="lazy"><figcaption>Bătălia de la Câmpiile Catalaunice în <i>Spieghel Historiael</i> al lui Jacob van Maerlant (c. 1330). Domeniu public.</figcaption></figure>\n          <p class="dc-role">Generalul roman</p>'],
]);
{
  const file = path.join(B, 'story.body.html');
  let s = fs.readFileSync(file, 'utf8');
  const h = s.indexOf('<h3 class="sub-title">Consecințe de lungă durată</h3>');
  if (h === -1) { console.error('Consecinte not found'); process.exit(1); }
  s = s.slice(0, h) + '<div class="fig-gallery g2">' +
    fig('img-delacroix', 'web-delacroix.jpg', 'Pictură romantică: Attila călare, urmat de războinici, trece peste figuri care reprezintă Italia și artele.',
      'Eugène Delacroix, <b><i>Attila și hoardele sale călcând Italia și artele</i></b> (1838–1847, detaliu), Palatul Bourbon, Paris — imaginea romantică a „biciului lui Dumnezeu”. Domeniu public.') +
    fig('img-moartea', 'web-moartea-attila.jpg', 'Pictură: Attila zace mort pe un pat, sub un baldachin roșu.',
      'Ferenc Paczka, <b><i>Moartea lui Attila</i></b> (1884, detaliu). Iordanes, după Priscus, scrie că Attila a murit în noaptea nunții, de o hemoragie. Domeniu public.') +
    '</div>\n\n      ' + s.slice(h);
  const c = s.indexOf('<p class="source-caution"><b>O precizare necesară.</b>');
  if (c === -1) { console.error('precizare not found'); process.exit(1); }
  s = s.slice(0, c) + '<div class="fig-gallery g2">' +
    fig('img-pietroasa', 'web-pietroasa.jpg', 'Planșă litografiată: vase și podoabe de aur din tezaurul de la Pietroasa, pe o draperie roșie.',
      '<b>Tezaurul de la Pietroasa</b> („Cloșca cu puii de aur”), planșă de H. Trenk din monografia lui Alexandru Odobescu (1889–1900). Tezaur gotic, îngropat probabil sub presiunea sosirii hunilor. Domeniu public.') +
    fig('img-craniu', 'web-craniu.jpg', 'Craniu uman alungit prin deformare artificială, expus pe un suport de muzeu.',
      '<b>Craniu deformat artificial</b>, din cimitirul de la Mözs (Ungaria), sec. V, Muzeul Național Maghiar — aceeași practică de elită ca la Gherăseni. Foto: Ceoil, CC0.') +
    '</div>\n      ' + s.slice(c);
  fs.writeFileSync(file, s);
}

// lightbox for article images
{
  const file = path.join(B, 'story.js');
  let s = fs.readFileSync(file, 'utf8');
  if (!s.includes('img-lightbox')) {
    s = s.replace(/\}\)\(\);\s*$/, `
  // Click (or Enter) on an article image opens it larger, with its caption.
  (function initLightbox(){
    var imgs = document.querySelectorAll('.fig-gallery img, .dc-img img');
    if (!imgs.length) return;
    var box = document.createElement('div');
    box.className = 'img-lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.innerHTML = '<button class="lb-close" type="button" aria-label="Închide">✕</button><figure><img alt=""><figcaption></figcaption></figure>';
    document.body.appendChild(box);
    var bImg = box.querySelector('img'), bCap = box.querySelector('figcaption'), lastFocus = null;
    function open(img){
      lastFocus = img;
      bImg.src = img.src; bImg.alt = img.alt;
      var cap = img.closest('figure').querySelector('figcaption');
      bCap.innerHTML = cap ? cap.innerHTML : '';
      box.classList.add('show');
      box.querySelector('.lb-close').focus();
    }
    function close(){ box.classList.remove('show'); if (lastFocus) lastFocus.focus(); }
    imgs.forEach(function(img){
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'Mărește imaginea: ' + img.alt);
      img.addEventListener('click', function(){ open(img); });
      img.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(img); } });
    });
    box.addEventListener('click', function(e){ if (e.target === box || e.target.classList.contains('lb-close')) close(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && box.classList.contains('show')) close(); });
  })();
})();
`);
    if (!s.includes('img-lightbox')) { console.error('story.js end not found'); process.exit(1); }
    fs.writeFileSync(file, s);
  }
}
{
  const file = path.join(B, 'story.css');
  let s = fs.readFileSync(file, 'utf8');
  if (!s.includes('.fig-gallery')) s += `
  /* ---------- galerii de imagini în articol ---------- */
  .fig-gallery{ display: grid; gap: 14px; margin: 26px 0 30px; }
  .fig-gallery.g3{ grid-template-columns: repeat(3, 1fr); }
  .fig-gallery.g2{ grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 760px){ .fig-gallery.g3, .fig-gallery.g2{ grid-template-columns: 1fr; } }
  .gal-item{ margin: 0; display: flex; flex-direction: column; background: var(--paper-2, #1a1a1e); border: 1px solid var(--line-strong); border-radius: 2px; overflow: hidden; }
  .gal-item img{ width: 100%; height: 220px; object-fit: cover; display: block; cursor: zoom-in; transition: transform 0.35s ease, filter 0.35s ease; filter: saturate(0.92); }
  .fig-gallery.g2 .gal-item img{ height: 280px; }
  .gal-item img:hover, .gal-item img:focus-visible{ filter: saturate(1.05); }
  .gal-item img:focus-visible, .dc-img img:focus-visible{ outline: 2px solid var(--gold, #d4af37); outline-offset: -2px; }
  .gal-item figcaption{ padding: 10px 12px 12px; font-size: 0.8rem; line-height: 1.5; color: var(--ink-dim); }
  .gal-item figcaption b{ color: var(--ink); }
  .dc-img{ margin: 0 0 14px; }
  .dc-img img{ width: 100%; height: 170px; object-fit: cover; display: block; border: 1px solid var(--line-strong); border-radius: 2px; cursor: zoom-in; }
  .duel-card.attila .dc-img img{ object-position: center 30%; }
  .dc-img figcaption{ margin-top: 6px; font-size: 0.72rem; line-height: 1.45; color: var(--ink-dim); }
  .img-lightbox{ position: fixed; inset: 0; z-index: 400; display: none; align-items: center; justify-content: center; padding: 24px; background: rgba(10, 10, 12, 0.92); }
  .img-lightbox.show{ display: flex; }
  .img-lightbox figure{ margin: 0; max-width: min(1100px, 100%); max-height: 100%; display: flex; flex-direction: column; align-items: center; }
  .img-lightbox img{ max-width: 100%; max-height: calc(100vh - 150px); object-fit: contain; border: 1px solid rgba(212, 175, 55, 0.4); }
  .img-lightbox figcaption{ margin-top: 12px; max-width: 760px; text-align: center; font-size: 0.86rem; line-height: 1.5; color: #e6d7c3; }
  .lb-close{ position: absolute; top: 14px; right: 16px; background: none; border: 1px solid rgba(212, 175, 55, 0.5); color: #e6d7c3; font-size: 1.1rem; width: 40px; height: 40px; border-radius: 2px; cursor: pointer; }
  .lb-close:hover, .lb-close:focus-visible{ border-color: #d4af37; color: #d4af37; outline: none; }
`;
  fs.writeFileSync(file, s);
}

// ======================= GAME =======================
edit(path.join(B, 'game.body.html'), [
  ['<p class="level-lore" id="li-lore">—</p>',
   '<p class="level-lore" id="li-lore">—</p>\n    <figure class="li-fig" id="li-fig" hidden><img id="li-img" alt=""><figcaption id="li-cap"></figcaption></figure>'],
]);
edit(path.join(B, 'game.js'), [
  ['  function renderLevelIntro(){\n    var lv = LEVELS[state.levelIndex];',
   `  // One real image per campaign (none for II). The map and the engraving are
  // already on the page, so they are reused instead of being stored twice.
  var NEUVILLE_SRC = '${uri('web-neuville.jpg')}';
  function bgUrl(sel){
    var el = document.querySelector(sel);
    if (!el) return '';
    var m = (el.style.backgroundImage || getComputedStyle(el).backgroundImage || '').match(/url\\(["']?(.*?)["']?\\)$/);
    return m ? m[1] : '';
  }
  function levelArt(i){
    if (i === 0) {
      var map = document.querySelector('#sec-origini svg image');
      var src = map ? (map.getAttribute('href') || map.getAttribute('xlink:href')) : '';
      return src ? { src: src, alt: 'Hartă gravată a Sarmației Europene, după Ptolemeu.', cap: 'Sarmația Europeană după Ptolemeu, gravură de Girolamo Porro (Veneția, 1596): între bastarni și roxolani apare numele <i>Chuni</i>. Domeniu public.' } : null;
    }
    if (i === 2) {
      var g = bgUrl('#mod-game .hero-bg') || bgUrl('.hero-bg');
      return g ? { src: g, alt: 'Gravură colorată: călăreți huni atacă războinici alani.', cap: 'J. N. Geiger, <i>Hunii în luptă cu alanii</i> (c. 1873) — scena din Campania III. Domeniu public.' } : null;
    }
    if (i === 3) return { src: NEUVILLE_SRC, alt: 'Gravură: călăreți huni în plină luptă, cu lănci și scuturi.', cap: 'Alphonse de Neuville, <i>Hunii la bătălia de la Châlons</i> (1869), ilustrație din <i>Istoria Franței</i> a lui Guizot. Domeniu public.' };
    return null;
  }

  function renderLevelIntro(){
    var lv = LEVELS[state.levelIndex];
    var art = levelArt(state.levelIndex), liFig = document.getElementById('li-fig');
    if (art && liFig) {
      document.getElementById('li-img').src = art.src;
      document.getElementById('li-img').alt = art.alt;
      document.getElementById('li-cap').innerHTML = art.cap;
      liFig.hidden = false;
    } else if (liFig) { liFig.hidden = true; }`],
]);
{
  const file = path.join(B, 'game.css');
  let s = fs.readFileSync(file, 'utf8');
  if (!s.includes('.li-fig')) s += `
  .li-fig{ margin: 4px 0 20px; }
  .li-fig[hidden]{ display: none; }
  .li-fig img{ width: 100%; height: 300px; object-fit: contain; background: #0e0e10; display: block; border: 1px solid var(--line-bright); border-radius: 2px; }
  .li-fig figcaption{ margin-top: 7px; font-size: 0.76rem; line-height: 1.5; color: var(--ink-dim2); }
`;
  fs.writeFileSync(file, s);
}

// ======================= SOLIA =======================
edit(path.join(B, 'embassy.js'), [
  ["      '<div class=\"stage-text\">' + s.text.map(function(p){ return '<p>' + p + '</p>'; }).join('') + '</div>' +",
   "      '<div class=\"stage-text\">' + s.text.map(function(p){ return '<p>' + p + '</p>'; }).join('') + '</div>' +\n      stageArt(state.stage) +"],
  ['  function renderStage(state, onChoose){',
   `  // Real images for some stages, reused from the article when it is on the page.
  var STAGE_ART = {
    0: { id: 'img-ziduri', cap: 'Zidurile Theodosiene ale Constantinopolului, de unde pleacă solia. Foto: Carole Raddato, CC BY-SA 2.0.' },
    7: { id: 'img-solidus', cap: 'Solid de aur al lui Teodosie al II-lea — moneda în care se plătea tributul cerut de Attila. CC0.' }
  };
  function stageArt(i){
    var a = STAGE_ART[i], img = a && document.getElementById(a.id);
    if (!img) return '';
    return '<figure class="stage-fig"><img src="' + img.src + '" alt="' + img.alt.replace(/"/g, '&quot;') + '"><figcaption>' + a.cap + '</figcaption></figure>';
  }

  function renderStage(state, onChoose){`],
]);
{
  const file = path.join(B, 'embassy.css');
  let s = fs.readFileSync(file, 'utf8');
  if (!s.includes('.stage-fig')) s += `
  .stage-fig{ margin: 4px 0 20px; }
  .stage-fig img{ width: 100%; max-height: 260px; object-fit: cover; display: block; border: 1px solid var(--line, #3a3a45); border-radius: 2px; }
  .stage-fig figcaption{ margin-top: 7px; font-size: 0.76rem; line-height: 1.5; color: var(--ink-dim, #a89a85); }
`;
  fs.writeFileSync(file, s);
}

// ======================= ATLAS =======================
edit(path.join(B, 'atlas.body.html'), [
  ['    <h3 id="mt-title">—</h3>',
   '    <h3 id="mt-title">—</h3>\n    <figure class="mt-fig" id="mt-fig" hidden><img id="mt-img" alt=""><figcaption id="mt-cap"></figcaption></figure>'],
]);
edit(path.join(B, 'atlas.js'), [
  ['  function initMarkerModal(){\n    var overlay = document.getElementById(\'modal-overlay\');',
   `  // Images for some places, reused from the rest of the site when it is on the page.
  var MARKER_ART = {
    0: { bg: '#acasa .hero-bg', alt: 'Fresca lui Rafael: papa Leon cel Mare și Attila, cu Roma în fundal.', cap: 'Rafael, <i>Întâlnirea lui Leon cel Mare cu Attila</i> (1514). Pictorul plasează scena sub zidurile Romei; în realitate, întâlnirea a avut loc în nordul Italiei, pe Mincio. Domeniu public.' },
    2: { id: 'img-aquileia', cap: 'Attila asediază Aquileia, în <i>Cronica pictată de la Viena</i> (c. 1360). Domeniu public.' },
    4: { id: 'img-ziduri', cap: 'Zidurile Theodosiene ale Constantinopolului. Foto: Carole Raddato, CC BY-SA 2.0.' },
    5: { bg: '#mod-embassy .masthead-bg', alt: 'Pictura lui Mór Than: Attila pe tron, la ospăț, înconjurat de oaspeți.', cap: 'Mór Than, <i>Ospățul lui Attila</i> (1870), după descrierea lui Priscus. Domeniu public.' },
    7: { id: 'img-catalaunice', cap: 'Bătălia de la Câmpiile Catalaunice în <i>Spieghel Historiael</i> (c. 1330). Domeniu public.' }
  };
  function markerArt(i){
    var a = MARKER_ART[i];
    if (!a) return null;
    if (a.id) { var img = document.getElementById(a.id); return img ? { src: img.src, alt: img.alt, cap: a.cap } : null; }
    var el = document.querySelector(a.bg);
    var m = el && (el.style.backgroundImage || '').match(/url\\(["']?(.*?)["']?\\)$/);
    return m ? { src: m[1], alt: a.alt, cap: a.cap } : null;
  }

  function initMarkerModal(){
    var overlay = document.getElementById('modal-overlay');`],
  ["      document.getElementById('mt-desc').textContent = d.desc;",
   "      document.getElementById('mt-desc').textContent = d.desc;\n      var art = markerArt(i), mtFig = document.getElementById('mt-fig');\n      if (art) { document.getElementById('mt-img').src = art.src; document.getElementById('mt-img').alt = art.alt; document.getElementById('mt-cap').innerHTML = art.cap; mtFig.hidden = false; }\n      else { mtFig.hidden = true; }"],
]);
{
  const file = path.join(B, 'atlas.css');
  let s = fs.readFileSync(file, 'utf8');
  if (!s.includes('.mt-fig')) s += `
  .mt-fig{ margin: 6px 0 14px; }
  .mt-fig[hidden]{ display: none; }
  .mt-fig img{ width: 100%; max-height: 220px; object-fit: cover; display: block; border-radius: 2px; border: 1px solid var(--land-edge); }
  .mt-fig figcaption{ margin-top: 6px; font-size: 0.74rem; line-height: 1.45; color: var(--ink-dim); }
`;
  fs.writeFileSync(file, s);
}
console.log('gata');

// (applied once, by hand-run step) the "Despre imagini" list in assemble.js also
// names these illustrations; see the bullet beginning "Ilustrațiile din articol".
