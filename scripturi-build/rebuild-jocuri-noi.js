// Înlocuiește jocurile vechi (Campania Hunilor, Solia la Attila) cu cele noi:
//   #mod-game    → „Imperiul lui Attila” (strategie pe hartă, 8 runde)
//   #mod-embassy → „Tabăra lui Attila” (explorare și dispută, după Priscus)
// Sursele sunt în scripturi-build/jocuri/. Patch pe paginile construite + paginile
// separate module-individuale/imperiul-lui-attila.html și tabara-lui-attila.html.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const J = path.join(__dirname, 'jocuri');
const read = f => fs.readFileSync(path.join(J, f), 'utf8');
const CSS = read('jocuri.css');
const IMP_HTML = read('imperiu.html'), IMP_JS = read('imperiu.js').trim();
const TAB_HTML = read('tabara.html'), TAB_JS = read('tabara.js').trim();

function fail(w){ console.error('not found: ' + w); process.exit(1); }

// ---------- pagina combinată ----------
function patchMain(file){
  const p = path.join(ROOT, file);
  let s = fs.readFileSync(p, 'utf8').split('\r\n').join('\n');
  if (s.includes('id="imp-root"')) { console.error(file + ': already applied'); process.exit(1); }
  const rep = (a, b, w) => { if (!s.includes(a)) fail(file + ' / ' + w); s = s.replace(a, b); };

  const g0 = s.indexOf('<section id="mod-game"'), e0 = s.indexOf('<section id="mod-embassy"'), a0 = s.indexOf('<section id="mod-atelier"');
  if (g0 === -1 || e0 === -1 || a0 === -1 || !(g0 < e0 && e0 < a0)) fail(file + ' / sections');
  const oldGame = s.slice(g0, e0), oldEmb = s.slice(e0, a0);
  const heroOf = (sec, w) => { const m = sec.match(/url\('(data:image\/[a-z]+;base64,[A-Za-z0-9+\/=]+)'\)/); if (!m) fail(file + ' / hero ' + w); return m[1]; };
  const qrA = oldGame.indexOf('<aside class="qr-card"'), qrB = oldGame.indexOf('</aside>', qrA) + 8;
  if (qrA === -1) fail(file + ' / qr card');
  const qr = oldGame.slice(qrA, qrB);
  const imp = '<section id="mod-game" class="site-page">\n' + IMP_HTML.replace('__HERO__', heroOf(oldGame, 'game')).replace('__QR__', qr) + '</section>\n\n';
  const tab = '<section id="mod-embassy" class="site-page">\n' + TAB_HTML.replace('__HERO__', heroOf(oldEmb, 'embassy')) + '</section>\n\n';
  s = s.slice(0, g0) + imp + tab + s.slice(a0);

  // CSS: scoatem modulele vechi (joc + solie), punem stilurile noi
  const c0 = s.indexOf('  /* ============ MODULE: CAMPANIA HUNILOR (.m-game) ============ */');
  const c1 = s.indexOf('  /* ============ MODULE: ATLASUL MIGRAȚIEI (.m-atlas) ============ */');
  if (c0 === -1 || c1 === -1 || c1 < c0) fail(file + ' / css markers');
  s = s.slice(0, c0) + CSS + '\n' + s.slice(c1);

  // JS: scoatem scripturile vechi, adăugăm cele noi
  let removed = 0;
  s = s.replace(/<script>\n?[\s\S]*?<\/script>\n?/g, blk => {
    if (blk.includes("getElementById('start-btn')") || blk.includes('var STAGES = [')) { removed++; return ''; }
    return blk;
  });
  if (removed !== 2) fail(file + ' / old scripts (' + removed + ')');
  const at = s.lastIndexOf('\n</body>');
  s = s.slice(0, at) + '\n<script>\n' + IMP_JS + '\n</script>\n<script>\n' + TAB_JS + '\n</script>' + s.slice(at);

  // nume noi în meniu, antet, articol, „Despre proiect”
  rep('  <a href="#mod-game">Campania Hunilor</a>\n  <a href="#mod-embassy">Solia la Attila</a>\n', '  <a href="#mod-game">Imperiul lui Attila</a>\n  <a href="#mod-embassy">Tabăra lui Attila</a>\n', 'nav');
  rep('<a class="hero-btn primary" href="#mod-game">Începe Campania Hunilor</a>', '<a class="hero-btn primary" href="#mod-game">Joacă „Imperiul lui Attila”</a>', 'hero btn 1');
  rep('<a class="hero-btn" href="#mod-embassy">Solia la Attila</a>', '<a class="hero-btn" href="#mod-embassy">Tabăra lui Attila</a>', 'hero btn 2');
  rep('<h3>Testează aceste fapte în joc</h3>\n      <p>Aceleași surse și evenimente, sub forma unei campanii interactive cu hartă de cucerire, mize și insigne pe patru tărâmuri istorice.</p>',
      '<h3>Fii tu Attila</h3>\n      <p>Opt momente reale, de la Tratatul de la Margus la Italia: fiecare decizie costă aur, renume, loialitate sau cai. La final afli de ce s-a prăbușit, de fapt, imperiul hunilor.</p>', 'cta text');
  rep('<a class="cta-btn" href="#mod-game">Deschide Campania Hunilor →</a>', '<a class="cta-btn" href="#mod-game">Joacă „Imperiul lui Attila” →</a>', 'cta btn');
  rep('<li><strong>Campania Hunilor</strong> — joc de strategie/decizie despre expansiunea hunică.</li>',
      '<li><strong>Imperiul lui Attila</strong> — joc de strategie pe hartă: opt momente reale (435–452), decizii cu consecințe și compararea cu drumul istoric.</li>', 'about 1');
  rep('<li><strong>Solia la Attila</strong> — joc narativ bazat pe relatarea lui Priscus din Panium.</li>',
      '<li><strong>Tabăra lui Attila</strong> — joc de explorare după relatarea lui Priscus din Panium (449): tabăra, curtea, ospățul și disputa cu grecul care trăia printre huni.</li>', 'about 2');
  rep('jocurile de decizie (Campania Hunilor, Solia la Attila) funcționează ca fișe de lucru/teste de verificare a înțelegerii contextului istoric',
      'jocurile (Imperiul lui Attila, Tabăra lui Attila) pun elevul să decidă și să argumenteze în contextul istoric real, cu sursa fiecărei scene', 'about 3');
  const mz = s.indexOf('    <p><strong>Despre mecanica de mize.</strong>');
  if (mz !== -1) { const mzEnd = s.indexOf('</p>', mz) + 5; s = s.slice(0, mz) + s.slice(mzEnd).replace(/^\n/, ''); }
  rep("bg: '#mod-embassy .masthead-bg'", "bg: '#mod-embassy .jg-hero'", 'atlas marker 5');
  rep('  #mod-game, #mod-embassy{ padding-block: 28px; }', '', 'old padding');

  fs.writeFileSync(p, s);
  console.log(file + ': jocuri noi');
  return { gameHero: heroOf(oldGame, 'g'), embHero: heroOf(oldEmb, 'e'), qr };
}

const parts = patchMain('index.html');
fs.copyFileSync(path.join(ROOT, 'index.html'), path.join(ROOT, 'atelierul-hunilor.html'));

// ---------- pagini separate ----------
const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const defs = idx.match(/<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>[\s\S]*?<\/defs><\/svg>/);
if (!defs) fail('shared defs');
function standalone(file, title, desc, body, js, withMap){
  const html = '<!DOCTYPE html>\n<html lang="ro">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '<meta name="description" content="' + desc + '">\n<title>' + title + '</title>\n' +
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
    '<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Cormorant+Garamond:ital,wght@0,600;1,500&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">\n' +
    '<style>\n  :root{ --nav-h: 0px; }\n  body{ margin: 0; background: #121214; }\n' + CSS + '</style>\n</head>\n<body>\n' + (withMap ? defs[0] + '\n' : '') + '<main>\n' + body.replace('href="qr-joc.html"', 'href="../qr-joc.html"') + '\n</main>\n<script>\n' + js + '\n</script>\n</body>\n</html>\n';
  fs.writeFileSync(path.join(ROOT, 'module-individuale', file), html);
  console.log('module-individuale/' + file + ': ' + (html.length / 1048576).toFixed(2) + ' MB');
}
standalone('imperiul-lui-attila.html', 'Imperiul lui Attila — joc de strategie', 'Joc de strategie despre imperiul hunilor (435–453): opt momente reale, decizii cu consecințe și compararea cu istoria.',
  IMP_HTML.replace('__HERO__', parts.gameHero).replace('__QR__', parts.qr), IMP_JS, true);
standalone('tabara-lui-attila.html', 'Tabăra lui Attila — joc după Priscus', 'Joc de explorare după relatarea lui Priscus din Panium (449): tabăra lui Attila, ospățul și disputa cu grecul.',
  TAB_HTML.replace('__HERO__', parts.embHero), TAB_JS, false);
