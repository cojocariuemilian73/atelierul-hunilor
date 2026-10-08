// Fiecare apariție a unei note primește un număr nou, în ordinea din text, deci numerotarea
// crește strict (1, 2, 3 …), fără reveniri. O sursă citată a doua oară devine o notă nouă,
// cu același text. Săgeata ↩ duce la capitolul în care apare citarea.
const fs = require('fs'), path = require('path');
for (const f of ['index.html', 'atelierul-hunilor.html', 'module-individuale/huni-prezentare.html']) {
  const p = path.join(__dirname, '..', f);
  let s = fs.readFileSync(p, 'utf8').split('\r\n').join('\n');
  const b0 = s.indexOf('<section id="biblio">');
  if (b0 === -1) { console.error(f + ': no biblio'); process.exit(1); }
  let body = s.slice(0, b0), tail = s.slice(b0);
  const olA = tail.indexOf('<ol class="biblio">'), olB = tail.indexOf('</ol>', olA);
  const notes = {};
  tail.slice(olA, olB).replace(/<li id="note-(\d+)">([\s\S]*?)<\/li>/g, (a, n, h) => { notes[n] = h.replace(/\s*<a class="back"[^>]*>↩<\/a>\s*$/, '').trim(); return a; });
  const re = /<sup class="fn" data-n="(\d+)">(\d+)<\/sup>/g;
  const occ = []; let m;
  while ((m = re.exec(body))) {
    const before = body.slice(0, m.index), sec = before.match(/<section id="([^"]+)"/g);
    const secId = sec ? sec[sec.length - 1].match(/id="([^"]+)"/)[1] : 'acasa';
    occ.push({ old: m[1], secId });
  }
  let k = 0;
  body = body.replace(re, () => { k++; return '<sup class="fn" data-n="' + k + '">' + k + '</sup>'; });
  if (occ.some(o => !(o.old in notes))) { console.error(f + ': missing note'); process.exit(1); }
  const items = occ.map((o, i) => '      <li id="note-' + (i + 1) + '">' + notes[o.old] + ' <a class="back" href="#' + o.secId + '">↩</a></li>').join('\n');
  tail = tail.slice(0, olA) + '<ol class="biblio">\n' + items + '\n    </ol>' + tail.slice(olB + 5);
  fs.writeFileSync(p, body + tail);
  console.log(f + ': ' + occ.length + ' note în ordine (' + occ.map(o => o.old).join(',') + ')');
}
