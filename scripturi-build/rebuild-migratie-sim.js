// Înlocuiește „Tabăra lui Attila” (#mod-embassy) cu simularea „Marea Migrație, în timp
// real” (#mod-migratie). Sursele: scripturi-build/jocuri/migratie.{html,js} + jocuri.css.
// Patch pe paginile construite + pagina separată module-individuale/simularea-marii-migratii.html.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), J = path.join(__dirname, 'jocuri');
const read = f => fs.readFileSync(path.join(J, f), 'utf8');
const CSS = read('jocuri.css'), MIG_HTML = read('migratie.html'), MIG_JS = read('migratie.js').trim(), IMP_JS = read('imperiu.js').trim();
function fail(w){ console.error('not found: ' + w); process.exit(1); }

const p = path.join(ROOT, 'index.html');
let s = fs.readFileSync(p, 'utf8').split('\r\n').join('\n');
if (s.includes('id="mig-root"')) { console.error('already applied'); process.exit(1); }
const rep = (a, b, w) => { if (!s.includes(a)) fail(w); s = s.split(a).join(b); };

// pagina
const e0 = s.indexOf('<section id="mod-embassy"'), a0 = s.indexOf('<section id="mod-atelier"');
if (e0 === -1 || a0 === -1 || a0 < e0) fail('sections');
s = s.slice(0, e0) + '<section id="mod-migratie" class="site-page">\n' + MIG_HTML + '</section>\n\n' + s.slice(a0);

// CSS: stilurile jocurilor, la zi
const c0 = s.indexOf('  /* ============ MODULE: JOCURILE (Imperiul lui Attila, Tabăra lui Attila) (.jg) ============ */');
const c1 = s.indexOf('  /* ============ MODULE: ATLASUL MIGRAȚIEI (.m-atlas) ============ */');
if (c0 === -1 || c1 === -1) fail('css markers');
s = s.slice(0, c0) + CSS.replace('(Imperiul lui Attila, Tabăra lui Attila)', '(Imperiul lui Attila, Marea Migrație)').replace('#mod-game, #mod-embassy{', '#mod-game, #mod-migratie{') + '\n' + s.slice(c1);

// JS: scoatem Tabăra, punem simularea; Imperiul la zi (legătura de final)
let removed = 0;
s = s.replace(/<script>\n?[\s\S]*?<\/script>\n?/g, blk => {
  if (blk.includes("getElementById('tab-root')")) { removed++; return ''; }
  if (blk.includes("getElementById('imp-root')")) { removed++; return ''; }
  return blk;
});
if (removed !== 2) fail('old game scripts (' + removed + ')');
const at = s.lastIndexOf('\n</body>');
s = s.slice(0, at) + '\n<script>\n' + IMP_JS + '\n</script>\n<script>\n' + MIG_JS + '\n</script>' + s.slice(at);

// navigare și texte
rep("var PAGE_IDS = ['page-acasa', 'mod-game', 'mod-embassy', 'mod-atelier'];", "var PAGE_IDS = ['page-acasa', 'mod-game', 'mod-migratie', 'mod-atelier'];", 'PAGE_IDS');
rep('<a href="#mod-embassy">Tabăra lui Attila</a>', '<a href="#mod-migratie">Marea Migrație · simulare</a>', 'nav');
rep('<a class="hero-btn" href="#mod-embassy">Tabăra lui Attila</a>', '<a class="hero-btn" href="#mod-migratie">Marea Migrație în timp real</a>', 'hero btn');
rep('<li><strong>Tabăra lui Attila</strong> — joc de explorare după relatarea lui Priscus din Panium (449): tabăra, curtea, ospățul și disputa cu grecul care trăia printre huni.</li>',
    '<li><strong>Marea Migrație, în timp real</strong> — simulare cu peste 1.600 de agenți pe harta reală (370–476): terenul e citit din hartă, drumurile sunt calculate cu algoritmul lui Dijkstra, iar jucătorul ia patru decizii istorice (Valens, Stilicho, Teodosie al II-lea, Aetius) și își compară lumea cu cea reală.</li>', 'about');
rep('jocurile (Imperiul lui Attila, Tabăra lui Attila)', 'jocurile (Imperiul lui Attila, simularea Marii Migrații)', 'about 2');
// atlasul nu mai are pictura lui Than în pagină
s = s.replace(/\n    5: \{ bg: '#mod-embassy \.jg-hero'[^\n]*\n/, '\n');
if (s.includes('#mod-embassy')) fail('leftover #mod-embassy');
// din capitolul 03 (harta Marii Migrații) spre simulare
rep('<p class="map-hint">4 trasee pe hartă · click, atingere sau Tab + Enter pentru detalii</p>',
    '<p class="map-hint">4 trasee pe hartă · click, atingere sau Tab + Enter pentru detalii</p>\n        <a class="sim-link" href="#mod-migratie">▶ Vezi Marea Migrație în timp real: simulare în care decizi tu</a>', 'map hint');
rep('  .migr-legend .sw{', "  .sim-link{ display: inline-flex; align-items: center; gap: 8px; margin: 12px 0 0; min-height: 44px; padding: 10px 16px; border: 1px solid #d4af37; color: #e5c158; text-decoration: none; font: 700 0.86rem 'Cinzel', serif; transition: background 0.2s; }\n  .sim-link:hover{ background: rgba(212, 175, 55, 0.12); }\n  .migr-legend .sw{", 'sim-link css');

fs.writeFileSync(p, s);
fs.copyFileSync(p, path.join(ROOT, 'atelierul-hunilor.html'));
console.log('index.html + atelierul-hunilor.html: simularea Marii Migrații');

// pagina separată
const defs = s.match(/<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>[\s\S]*?<\/defs><\/svg>/);
if (!defs) fail('defs');
const html = '<!DOCTYPE html>\n<html lang="ro">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
  '<meta name="description" content="Simulare a Marii Migrații (370–476): mii de agenți pe harta reală a Europei, drumuri calculate cu algoritmul lui Dijkstra și patru decizii istorice.">\n' +
  '<title>Marea Migrație, în timp real — simulare</title>\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
  '<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Cormorant+Garamond:ital,wght@0,600;1,500&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">\n' +
  '<style>\n  :root{ --nav-h: 0px; }\n  body{ margin: 0; background: #121214; }\n' + CSS + '</style>\n</head>\n<body>\n' + defs[0] + '\n<main id="mod-migratie" class="active">\n' + MIG_HTML + '\n</main>\n<script>\n' + MIG_JS + '\n</script>\n</body>\n</html>\n';
fs.writeFileSync(path.join(ROOT, 'module-individuale', 'simularea-marii-migratii.html'), html);
console.log('module-individuale/simularea-marii-migratii.html: ' + (html.length / 1048576).toFixed(2) + ' MB');
