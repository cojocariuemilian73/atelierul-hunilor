// Removes the "Printează raportul" button from the end of the Solia.
const fs = require('fs');
const path = require('path');
const B = path.join(__dirname, '..', 'build');
function edit(f, from, to){
  const p = path.join(B, f); let s = fs.readFileSync(p, 'utf8');
  if (!s.includes(from)) { console.error('not found in ' + f); process.exit(1); }
  fs.writeFileSync(p, s.replace(from, to));
}
edit('embassy.body.html', '      <button class="print-btn" id="print-btn" type="button">Printează raportul (sau salvează ca PDF)</button>\n', '');
edit('embassy.js', "    document.getElementById('print-btn').addEventListener('click', function(){ window.print(); });\n", '');
console.log('solia: butonul de printare scos');
