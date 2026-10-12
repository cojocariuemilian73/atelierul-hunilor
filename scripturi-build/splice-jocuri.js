// Pune la zi, în paginile publicate, stilurile jocurilor (jocuri.css), scriptul simulării (migratie.js)
// și scriptul jocului Imperiul lui Attila (imperiu.js).
// Folosire: node scripturi-build/splice-jocuri.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const J = path.join(__dirname, 'jocuri');
const rd = f => fs.readFileSync(path.join(J, f), 'utf8').split('\r\n').join('\n');
const CSS = rd('jocuri.css').replace(/\n+$/, '\n');
const MIG_JS = rd('migratie.js').replace(/\n+$/, '');
const IMP_JS = rd('imperiu.js').replace(/\n+$/, '');
const MARK = '  /* ============ MODULE: JOCURILE';
const END = '  /* ============ MODULE: ATLASUL MIGRAȚIEI (.m-atlas) ============ */';
const files = ['index.html', 'atelierul-hunilor.html', 'module-individuale/imperiul-lui-attila.html', 'module-individuale/simularea-marii-migratii.html'];

for (const rel of files) {
  const f = path.join(root, rel);
  const raw = fs.readFileSync(f, 'utf8');
  const crlf = raw.includes('\r\n');
  let s = raw.split('\r\n').join('\n');
  const c0 = s.indexOf(MARK);
  if (c0 < 0) { console.error(rel + ': marcaj CSS negăsit'); process.exit(1); }
  let c1 = s.indexOf(END, c0);
  if (c1 < 0) c1 = s.indexOf('</style>', c0);
  s = s.slice(0, c0) + CSS + s.slice(c1);
  let mig = 0, imp = 0;
  s = s.replace(/<script>\n[\s\S]*?\n<\/script>/g, blk => {
    if (blk.includes("getElementById('mig-root')")) { mig++; return '<script>\n' + MIG_JS + '\n</script>'; }
    if (blk.includes("getElementById('imp-root')")) { imp++; return '<script>\n' + IMP_JS + '\n</script>'; }
    return blk;
  });
  fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
  console.log(rel + ': CSS la zi' + (mig ? ', simularea la zi' : '') + (imp ? ', Imperiul la zi' : ''));
}
