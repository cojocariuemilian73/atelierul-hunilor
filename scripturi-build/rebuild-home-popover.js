// Muzeul e acum în articol: fereastra cu detalii a punctelor se închide la derulare.
const fs = require('fs'), path = require('path');
for (const f of ['index.html', 'atelierul-hunilor.html']) {
  const p = path.join(__dirname, '..', f);
  let s = fs.readFileSync(p, 'utf8').split('\r\n').join('\n');
  if (s.includes('hs-popover-scroll')) { console.error(f + ': already applied'); process.exit(1); }
  const tail = '\n</body>';
  if (!s.includes(tail)) { console.error('no </body> in ' + f); process.exit(1); }
  s = s.replace(tail, '\n<script>\n/* hs-popover-scroll */\n(function(){\n  var pop = document.getElementById(\'hs-popover\');\n  if (!pop) return;\n  window.addEventListener(\'scroll\', function(){ if (pop.classList.contains(\'show\')) pop.classList.remove(\'show\'); }, { passive: true });\n})();\n</script>\n</body>');
  fs.writeFileSync(p, s);
}
console.log('popover: se închide la derulare');
