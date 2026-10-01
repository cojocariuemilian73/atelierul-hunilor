// Moves the Atlas from its own page into the Acasă article, as chapter 04
// right after "Marea Migrație" (Personalități and Bibliografie become 05 and
// 06), with entries in both tables of contents. The site now has four pages.
// The change lives in assemble.js, so the standalone atlas-hunic.html built
// from build/atlas.* is unaffected.
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'assemble.js');
let s = fs.readFileSync(FILE, 'utf8');

function rep(from, to, what){
  if (!s.includes(from)) { console.error('not found: ' + what); process.exit(1); }
  s = s.replace(from, to);
}

// 1. Build the in-article atlas section and splice it into the story body.
rep(`// @import must be the FIRST thing inside <style>`,
`// The Atlas is part of the Acasă article (chapter 04), not a page of its own.
// Its masthead is replaced by the article's own chapter heading.
const atlasMastStart = atlasBody.indexOf('<div class="masthead">');
const atlasMastEnd = atlasBody.indexOf('<div class="stage">');
if (atlasMastStart === -1 || atlasMastEnd === -1) throw new Error('atlas masthead not found');
const atlasSub = (atlasBody.slice(atlasMastStart, atlasMastEnd).match(/<p class="sub">([\\s\\S]*?)<\\/p>/) || [, ''])[1];
const atlasSection =
  '\\n    <section id="sec-atlas" class="m-atlas atlas-in-article">\\n' +
  '      <div class="chapter-mark"><span class="chapter-num">04</span><span class="chapter-slash">/</span><span class="chapter-tag">Atlasul migrației</span></div>\\n' +
  '      <h2 class="sec-title">Atlasul migrației hunice</h2>\\n' +
  '      <p class="sec-sub">' + atlasSub + '</p>\\n' +
  atlasBody.slice(0, atlasMastStart) + atlasBody.slice(atlasMastEnd) +
  '\\n    </section>\\n';
function withAtlas(body){
  const migr = body.indexOf('<section id="sec-migratie">');
  const end = body.indexOf('</section>', migr) + '</section>'.length;
  if (migr === -1) throw new Error('sec-migratie not found');
  body = body.slice(0, end) + '\\n' + atlasSection + body.slice(end);
  body = body
    .replace('<span class="chapter-num">04</span><span class="chapter-slash">/</span><span class="chapter-tag">Personalități', '<span class="chapter-num">05</span><span class="chapter-slash">/</span><span class="chapter-tag">Personalități')
    .replace('<span class="chapter-num">05</span><span class="chapter-slash">/</span><span class="chapter-tag">Bibliografie', '<span class="chapter-num">06</span><span class="chapter-slash">/</span><span class="chapter-tag">Bibliografie')
    .replace('<a href="#sec-migratie" data-sec="sec-migratie" class="toc-link">Marea Migrație</a>\\n      <a href="#sec-personalitati" data-sec="sec-personalitati" class="toc-link">Personalități &amp; Impact</a>',
             '<a href="#sec-migratie" data-sec="sec-migratie" class="toc-link">Marea Migrație</a>\\n      <a href="#sec-atlas" data-sec="sec-atlas" class="toc-link">Atlasul Migrației</a>\\n      <a href="#sec-personalitati" data-sec="sec-personalitati" class="toc-link">Personalități &amp; Impact</a>')
    .replace('<a href="#sec-migratie" data-sec="sec-migratie" class="toc-link">Marea Migrație</a>\\n      <a href="#sec-personalitati" data-sec="sec-personalitati" class="toc-link">Personalități</a>',
             '<a href="#sec-migratie" data-sec="sec-migratie" class="toc-link">Marea Migrație</a>\\n      <a href="#sec-atlas" data-sec="sec-atlas" class="toc-link">Atlas</a>\\n      <a href="#sec-personalitati" data-sec="sec-personalitati" class="toc-link">Personalități</a>');
  if (body.indexOf('data-sec="sec-atlas"') === -1) throw new Error('TOC not updated');
  return body;
}

// @import must be the FIRST thing inside <style>`, 'insert atlas section');

rep('<div id="page-acasa" class="site-page">\n${storyBodyPatched}', '<div id="page-acasa" class="site-page">\n${withAtlas(storyBodyPatched)}', 'story with atlas');

// 2. No separate Atlas page any more.
rep('<section id="mod-atlas" class="m-atlas site-page">\n${atlasBody}\n</section>\n', '', 'atlas page section');
rep('  <a href="#mod-atlas">Atlasul Migrației</a>\n', '', 'nav link');
rep("var PAGE_IDS = ['page-acasa', 'mod-game', 'mod-embassy', 'mod-atlas', 'mod-lab'];", "var PAGE_IDS = ['page-acasa', 'mod-game', 'mod-embassy', 'mod-lab'];", 'PAGE_IDS');
rep('<span class="site-pager-count mono" id="site-page-count">1 / 5</span>', '<span class="site-pager-count mono" id="site-page-count">1 / 4</span>', 'pager count');
rep('  #mod-game, #mod-embassy, #mod-atlas, #mod-lab{ padding-block: 28px; }', '  #mod-game, #mod-embassy, #mod-lab{ padding-block: 28px; }\n  .atlas-in-article{ margin-top: 8px; }\n  .atlas-in-article > .wrap{ padding: 0; max-width: none; }\n  .m-atlas.atlas-in-article .stage{ grid-template-columns: 1fr; margin-top: 14px; }\n  .m-atlas.atlas-in-article .sidebar{ display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }\n  @media (max-width: 640px){ .m-atlas.atlas-in-article .sidebar{ grid-template-columns: 1fr; } }', 'page padding css');
rep('<li><strong>Atlasul Migrației</strong> — hartă interactivă cu rutele Marii Migrații.</li>', '<li><strong>Atlasul Migrației</strong> — hartă interactivă cu rutele Marii Migrații, în pagina Acasă (capitolul 04 al articolului).</li>', 'about guide');

fs.writeFileSync(FILE, s);
console.log('assemble.js: Atlasul e acum capitolul 04 din Acasă');
