// Rândurile „imagine în stânga, text în dreapta” de pe pagina Acasă: pe ecrane late,
// imaginile nu mai sunt mai înalte decât textul de lângă ele (se taie din margini, cu centrul păstrat),
// ca să nu rămână spațiu gol sub text.
// Folosire: node scripturi-build/patch-sr-fit.js (se poate rula de mai multe ori)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const JS = `<script>
(function(){
  // sr-fit: imaginea din stânga nu depășește înălțimea textului din dreapta
  var rows = Array.prototype.slice.call(document.querySelectorAll('.sr-row'));
  if (!rows.length) return;
  var wide = window.matchMedia('(min-width: 761px)'), MIN = 220, t;
  function fit(){
    rows.forEach(function(r){
      var media = r.querySelector('.sr-media'), text = r.querySelector('.sr-text');
      if (!media || !text) return;
      var imgs = Array.prototype.slice.call(media.querySelectorAll('.sr-fig img'));
      r.classList.remove('cap-over');
      imgs.forEach(function(i){ i.style.maxHeight = ''; });
      if (!wide.matches || !text.offsetHeight) return;
      function shrink(){
        var over = media.offsetHeight - text.offsetHeight, total = 0;
        if (over <= 16) return true;
        imgs.forEach(function(i){ total += i.offsetHeight; });
        if (!total) return true;
        imgs.forEach(function(i){
          var h = i.offsetHeight;
          i.style.maxHeight = Math.round(Math.max(MIN, h - over * h / total)) + 'px';
        });
        return media.offsetHeight - text.offsetHeight <= 16;
      }
      // textul e prea scurt: legenda trece peste partea de jos a imaginii
      if (!shrink()) { r.classList.add('cap-over'); shrink(); }
    });
  }
  function later(){ clearTimeout(t); t = setTimeout(fit, 80); }
  rows.forEach(function(r){
    Array.prototype.forEach.call(r.querySelectorAll('img'), function(i){ if (!i.complete) i.addEventListener('load', later); });
  });
  window.addEventListener('resize', later);
  window.addEventListener('hashchange', later);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
  window.addEventListener('load', later);
  fit();
})();
</script>`;

const CSS = `  /* sr-fit: legenda peste imagine, când textul de alături e scurt */
  .sr-row.cap-over .sr-fig figcaption{ position: absolute; left: 8px; right: 8px; bottom: 8px; margin: 0; padding: 34px 12px 10px; background: linear-gradient(180deg, transparent, rgba(10, 9, 8, 0.9) 42%); color: #e8dcc8; pointer-events: none; }
  .sr-row.cap-over .sr-fig figcaption b{ color: #f6eddc; }
  /* /sr-fit */
`;

for (const rel of ['index.html', 'atelierul-hunilor.html', 'module-individuale/huni-prezentare.html']) {
  const f = path.join(root, rel);
  if (!fs.existsSync(f)) continue;
  const raw = fs.readFileSync(f, 'utf8');
  const crlf = raw.includes('\r\n');
  let s = raw.split('\r\n').join('\n');
  if (!s.includes('class="sr-row')) { console.log(rel + ': fără rânduri, sărit'); continue; }
  let n = 0;
  s = s.replace(/<script>\n\(function\(\)\{\n  \/\/ sr-fit:[\s\S]*?\n<\/script>/g, () => { n++; return JS; });
  if (!n) { const at = s.lastIndexOf('\n</body>'); s = s.slice(0, at) + '\n' + JS + s.slice(at); }
  const c0 = s.indexOf('  /* sr-fit:');
  if (c0 >= 0) { const e = '  /* /sr-fit */\n'; s = s.slice(0, c0) + CSS + s.slice(s.indexOf(e, c0) + e.length); }
  else {
    const at = s.indexOf('  .sr-text > :first-child{');
    if (at < 0) { console.error(rel + ': CSS sr negăsit'); process.exit(1); }
    s = s.slice(0, at) + CSS + s.slice(at);
  }
  fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
  console.log(rel + ': imaginile se potrivesc cu textul');
}
