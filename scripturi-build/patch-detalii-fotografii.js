// Mută fotografiile și adnotările din colecția veche lângă pasajele articolului.
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const mainFile = 'atelierul-hunilor.html';
const standalone = 'module-individuale/huni-prezentare.html';
const simulation = 'module-individuale/simularea-marii-migratii.html';
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
const write = (file, contents) => fs.writeFileSync(path.join(root, file), contents);
const style = read('scripturi-build/design/detalii-fotografii.css');
const styleTag = '<style id="photo-points-style">\n' + style + '</style>\n';
const interaction = read('scripturi-build/design/detalii-fotografii.js');
const exists = file => fs.existsSync(path.join(root, file));
const escape = text => String(text).replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));

let main = read(mainFile);
const collection = main.match(/  var ARTIFACTS = (\[[\s\S]*?\n  \]);/);
if (!collection) throw new Error('Lipsesc datele fotografiilor și ale punctelor.');
const artifacts = JSON.parse(collection[1]);
const ids = ['img-arc','img-cazan','img-diadema','img-spatha','img-craniu','img-solidus','img-diadema-stepa','img-apahida'];
if (artifacts.length !== ids.length) throw new Error('Colecția de fotografii s-a schimbat.');
const photos = Object.fromEntries(artifacts.map((photo, index) => [ids[index], photo]));

const instruction = '<span class="photo-hint">Apasă pe punctele roșii pentru detalii.</span>';
const notes = '<dialog id="photo-detail" class="photo-detail" aria-labelledby="photo-detail-title">' +
  '<form method="dialog"><button type="submit" autofocus>Închide</button></form>' +
  '<h2 id="photo-detail-title"></h2><p class="photo-detail-text"></p></dialog>';
function annotate(img, photo) {
  const pins = photo.hotspots.map(point =>
    '<button type="button" class="photo-point" aria-haspopup="dialog" aria-label="' + escape(point.title) +
    '" data-title="' + escape(point.title) + '" data-detail="' + escape(point.desc) +
    '" style="--point-x:' + point.x + '%;--point-y:' + point.y + '%"></button>'
  ).join('');
  return '<div class="photo-points">' + img + pins + '</div>';
}
function figure(id, caption) {
  const photo = photos[id];
  const [width, height] = photo.ratio.split(' / ');
  const img = '<img id="' + id + '" src="' + photo.img + '" width="' + width + '" height="' + height +
    '" alt="' + escape(photo.alt) + '" loading="lazy">';
  return '<figure class="photo-evidence">' + annotate(img, photo) +
    '<figcaption><strong>' + escape(photo.name) + '</strong>. ' + escape(caption || photo.desc) +
    ' <small>' + photo.credit + '.</small> ' + instruction + '</figcaption></figure>';
}
function annotateExisting(html, id) {
  const image = new RegExp('<img\\b[^>]*\\bid="' + id + '"[^>]*>');
  if (!image.test(html)) throw new Error('Lipsește fotografia ' + id);
  const photo = photos[id];
  const [width, height] = photo.ratio.split(' / ');
  return html.replace(image, img => {
    if (!/\bwidth=/.test(img)) img = img.replace(/>$/, ' width="' + width + '" height="' + height + '">');
    return annotate(img, photo);
  }).replace(
    new RegExp('(id="' + id + '"[^>]*>[\\s\\S]*?<figcaption>[\\s\\S]*?)(</figcaption>)'),
    (_, caption, end) => caption + ' ' + instruction + end
  );
}
function rowEnd(html, marker) {
  const start = html.indexOf(marker);
  const end = start < 0 ? -1 : html.indexOf('\n      </div>', start);
  if (end < 0) throw new Error('Lipsește pasajul pentru ' + marker);
  return end;
}
function afterRow(html, marker, markup) {
  const insert = rowEnd(html, marker) + '\n      </div>'.length;
  return html.slice(0, insert) + '\n      ' + markup + html.slice(insert);
}

// Articolul separat poate conține deja fotografiile dintr-un build anterior.
function arrangePhotos(html) {
  const figureStart = '<figure class="photo-evidence">';
  const inline = markup => markup.replace(figureStart, '<figure class="photo-evidence photo-evidence--inline">');
  function move(id, place) {
    const start = html.indexOf(figureStart + '<div class="photo-points"><img id="' + id + '"');
    if (start < 0) return;
    const close = html.indexOf('</figure>', start);
    if (close < 0) throw new Error('Lipsește sfârșitul fotografiei ' + id);
    const end = close + '</figure>'.length;
    const markup = html.slice(start, end);
    const line = html.lastIndexOf('\n', start);
    html = html.slice(0, line) + html.slice(end);
    html = place(markup);
  }
  move('img-arc', markup => {
    const mediaEnd = '</figure></div>';
    const engraving = html.indexOf('id="img-neuville"');
    const end = engraving < 0 ? -1 : html.indexOf(mediaEnd, engraving);
    if (end < 0) throw new Error('Lipsește gravura despre cavalerie.');
    const insert = end + '</figure>'.length;
    return html.slice(0, insert) + inline(markup) + html.slice(insert);
  });
  move('img-apahida', markup => {
    const death = html.indexOf('id="img-moartea"');
    const insert = html.lastIndexOf('\n        </div>', rowEnd(html, 'id="img-moartea"'));
    if (insert < death) throw new Error('Lipsește textul despre Nedao.');
    return html.slice(0, insert) + '\n          ' + inline(markup) + html.slice(insert);
  });
  move('img-spatha', markup => {
    const context = html.indexOf('class="duel-context"');
    if (context < 0) {
      const row = html.lastIndexOf('      <div class="sr-row', html.indexOf('id="img-moartea"'));
      if (row < 0) throw new Error('Lipsește rândul despre moartea lui Attila.');
      return html.slice(0, row) + '      ' + inline(markup) + '\n' + html.slice(row);
    }
    const note = html.indexOf('\n        <aside', context);
    if (note < 0 || note >= rowEnd(html, 'class="duel-context"')) throw new Error('Lipsește nota despre Sabia lui Marte.');
    const sword = markup.replace(figureStart, '<figure class="photo-evidence photo-evidence--sword">');
    return html.slice(0, note) + '\n        ' + sword + html.slice(note);
  });
  return html;
}
function addPhotos(html) {
  for (const id of ['img-diadema', 'img-craniu', 'img-solidus']) {
    if (html.includes('id="' + id + '"')) html = annotateExisting(html, id);
    else if (id === 'img-diadema') {
      html = afterRow(html, 'Cea mai grăitoare piesă descoperită', figure(id));
    } else throw new Error('Lipsește fotografia ' + id);
  }
  html = afterRow(html, '<b>arcul recurbat compozit</b>', figure('img-arc'));
  html = afterRow(html, 'id="img-moartea"', figure('img-apahida'));
  if (html.includes('class="duel-context"')) {
    html = afterRow(html, 'class="duel-context"', figure('img-spatha',
      'Sabie din mormântul princiar de la Jakuszowice, cu două tăișuri și mâner decorat cu aur și granate. Piesa ilustrează armele de rang ale epocii. Legenda „Sabiei lui Marte” vine dintr-un izvor scris.'));
  } else {
    const death = html.indexOf('id="img-moartea"');
    const row = html.lastIndexOf('      <div class="sr-row', death);
    if (row < 0) throw new Error('Lipsește rândul despre moartea lui Attila.');
    html = html.slice(0, row) + '      ' + figure('img-spatha') + '\n' + html.slice(row);
  }
  const skull = html.indexOf('id="img-craniu"');
  const bandEnd = html.indexOf('\n      </section>', skull);
  const rowEnd = html.indexOf('\n      </div>', skull);
  const boundary = bandEnd >= 0 && html.lastIndexOf('class="r10-band"', skull) > html.lastIndexOf('id="sec-personalitati"', skull)
    ? bandEnd + '\n      </section>'.length
    : rowEnd + '\n      </div>'.length;
  if (skull < 0 || rowEnd < 0 || (boundary < skull)) throw new Error('Lipsește locul pentru analogiile arheologice.');
  const pair = '<div class="photo-evidence-pair">' + figure('img-diadema-stepa') + figure('img-cazan') + '</div>';
  html = html.slice(0, boundary) + '\n      ' + pair + html.slice(boundary);
  return html.replace('.fig-gallery img, .dc-img img, .sr-fig img, .fig-map img',
    '.fig-gallery img, .dc-img img, .sr-fig img, .fig-map img, .photo-evidence img, .photo-points img')
    .replace('</head>', styleTag + '</head>')
    .replace('</body>', notes + '\n<script>\n' + interaction + '</script>\n</body>');
}

const museum = /\n    <div class="ch-orn" aria-hidden="true">[^\n]*<\/div>\n    <section id="sec-muzeu"[\s\S]*?\n    <\/section>/;
if (!museum.test(main)) throw new Error('Lipsește vechea secțiune de artefacte.');
main = main.replace(museum, '');
main = main.replace(/^ +<a\b[^>\n]*href="#sec-muzeu"[^>\n]*>[^<]*<\/a>\n/gm, '')
  .replace(', expusă și explorabilă în detaliu în modulul <a href="#sec-muzeu">Muzeul virtual</a> al acestui site', ' (<a href="#img-diadema">vezi detaliile fotografiei</a>)')
  .replace(/<li><strong>Muzeul virtual și miturile<\/strong>:[^\n]+<\/li>/, '<li><strong>Fotografii adnotate și mituri</strong>: obiectele sunt prezentate în articol, lângă pasajele relevante. Punctele roșii explică detaliile pieselor.</li>')
  .replace('Fotografiile din Muzeu', 'Fotografiile pieselor din articol')
  .replace('Creditele sunt sub fiecare fișă.', 'Creditele sunt sub fiecare fotografie.')
  .replace('la punctele Muzeului', 'la punctele de pe fotografii')
  .replace('muzeu virtual cu artefacte reale', 'fotografii adnotate ale pieselor arheologice')
  .replace('muzeu virtual și mituri', 'fotografii adnotate și mituri')
  .replace('cronologie, muzeu virtual,', 'cronologie, fotografii adnotate,')
  .replace('id="sec-glosar">\n    <div class="chapter-mark sec-head"><span class="chapter-num" aria-hidden="true">07', 'id="sec-glosar">\n    <div class="chapter-mark sec-head"><span class="chapter-num" aria-hidden="true">06')
  .replace('id="biblio">\n    <div class="chapter-mark sec-head"><span class="chapter-num" aria-hidden="true">08', 'id="biblio">\n    <div class="chapter-mark sec-head"><span class="chapter-num" aria-hidden="true">07');

// Miturile folosesc același script în pagina de bază. Păstrăm datele și funcțiile lor.
const definitionsStart = main.indexOf('  /**\n   * @typedef {Object} ArtifactHotspot');
const definitionsEnd = main.indexOf('  /**\n   * @typedef {Object} MythFact', definitionsStart);
if (definitionsStart < 0 || definitionsEnd < 0) throw new Error('Lipsesc reperele din scriptul comun.');
main = main.slice(0, definitionsStart) + main.slice(definitionsEnd);
const viewer = /  \/\/ =+\n  \/\/ MODULE 1: Fotografii de artefact adnotate: randare DOM\n[\s\S]*?(?=  \/\/ =+\n  \/\/ MODULE 2:)/;
if (!viewer.test(main)) throw new Error('Lipsește codul vechi al vizualizatorului.');
main = main.replace(viewer, '').replace('  initArtifactModule();\n', '')
  .replace(/<script>\n\/\* hs-popover-scroll \*\/[\s\S]*?<\/script>\n/, '')
  .replace(/  \/\/ ---------- muzeul: punctele roșii pulsează până la primul clic ----------\n  var muz = [^\n]*\n  if \(muz\)[^\n]*\n\n/, '')
  .replace("media.querySelectorAll('.sr-fig img')", "media.querySelectorAll('.sr-fig img:not(.photo-points img)')")
  .replace("var VITR = '.hx, .gs, #sec-atlas, #sec-muzeu';", "var VITR = '.hx, .gs, #sec-atlas';");
write(mainFile, arrangePhotos(addPhotos(main)));

const oldSource = 'vezi Muzeul, capitolul 06';
if (exists(simulation)) write(simulation, read(simulation).replaceAll(oldSource, 'vezi garnitura de șa de la Apahida, în articol'));
if (exists(standalone)) {
  let article = read(standalone);
  const addedStyle = /<style id="photo-points-style">[\s\S]*?<\/style>\n/;
  if (!addedStyle.test(article)) {
    article = article.replace(/^ +<a\b[^>\n]*href="laborator-muzeu.html"[^>\n]*>[^<]*<\/a>\n/gm, '')
      .replace(', expusă și explorabilă în detaliu în modulul <a href="laborator-muzeu.html">Muzeu</a> al acestui site', ' (<a href="#img-diadema">vezi detaliile fotografiei</a>)');
    article = addPhotos(article);
  } else {
    article = article.replace(addedStyle, () => styleTag);
  }
  write(standalone, arrangePhotos(article));
}
