// Ordine cronologică + ritmul spațierii (23.11.2026). Rulează după patch-drumul-hunilor, înainte de build-web.
// A: „Consecințe de lungă durată” trece la finalul capitolului Personalități, după „Ecoul…” (408, anii 440).
// B: citatul lui Ieronim (410) urcă lângă paragraful despre Adrianopol (378) și foederati (382).
// C: la Attila, Balcanii (441–447) înaintea domniei singur (445).
// Doar mută blocuri; textul rămâne neschimbat. Se poate rula de mai multe ori.
const fs = require('fs');
const path = require('path');

const page = path.join(__dirname, '..', 'atelierul-hunilor.html');
const raw = fs.readFileSync(page, 'utf8');
const crlf = raw.includes('\r\n');
let html = raw.replace(/\r\n/g, '\n');

function once(hay, needle, what) {
  const i = hay.indexOf(needle);
  if (i === -1) throw new Error('Nu găsesc: ' + what);
  if (hay.indexOf(needle, i + 1) !== -1) throw new Error('Apare de mai multe ori: ' + what);
  return i;
}

// C — ordinea faptelor-cheie la Attila
const liSingur = '<li>Conduce imperiul hunic singur din 445 d.Hr., după înlăturarea fratelui său, Bleda.</li>';
const liBalcani = '<li>Devastează Balcanii (441–447) și obține tribut anual uriaș de la Constantinopol.</li>';
const iS = once(html, liSingur, 'Attila 445');
const iB = once(html, liBalcani, 'Attila 441–447');
if (iS < iB) {
  const between = html.slice(iS + liSingur.length, iB);
  html = html.slice(0, iS) + liBalcani + between + liSingur + html.slice(iB + liBalcani.length);
}

// B — citatul lui Ieronim după rândul cu Adrianopol
const pqStart = '<!-- pq:start --><figure class="pq"><blockquote><p>Orașul care a cucerit lumea';
const pqEnd = '<!-- pq:end -->';
const iPq = once(html, pqStart, 'citatul lui Ieronim');
const iPqEnd = html.indexOf(pqEnd, iPq) + pqEnd.length;
const pqBlock = html.slice(iPq, iPqEnd);
const adrianopol = once(html, 'După dezastrul de la Adrianopol (378)', 'paragraful Adrianopol');
// capătul rândului sr-row care conține paragraful
const rowEnd = '\n        </div>\n      </div>\n';
const iRowEnd = html.indexOf(rowEnd, adrianopol);
if (iRowEnd === -1) throw new Error('Nu găsesc finalul rândului cu Adrianopol.');
const insertAt = iRowEnd + rowEnd.length;
if (iPq > insertAt) {
  // scoate citatul din vechiul loc (cu linia lui), apoi îl inserează
  const lineStart = html.lastIndexOf('\n', iPq) + 1;
  const lineEnd = html.indexOf('\n', iPqEnd) + 1;
  html = html.slice(0, lineStart) + html.slice(lineEnd);
  html = html.slice(0, insertAt) + '      ' + pqBlock + '\n' + html.slice(insertAt);
}

// A — „Consecințe” după tot blocul „Ecoul…”
const iCons = once(html, '<h3 class="sub-title">Consecințe de lungă durată</h3>', 'Consecințe');
const iEcou = once(html, '<h3 class="sub-title">Ecoul în spațiul carpato-danubiano-pontic</h3>', 'Ecoul');
if (iCons < iEcou) {
  const rowOpen = '      <div class="sr-row sr-reveal">\n';
  const consStart = html.lastIndexOf(rowOpen, iCons);
  const consEnd = html.indexOf(rowEnd, iCons) + rowEnd.length;
  let consBlock = html.slice(consStart, consEnd);
  // linia goală de după bloc
  let cut = consEnd;
  if (html[cut] === '\n') cut++;
  html = html.slice(0, consStart) + html.slice(cut);
  // finalul secțiunii Personalități
  const secStart = once(html, '<section id="sec-personalitati"', 'secțiunea Personalități');
  const secEnd = html.indexOf('\n    </section>\n', secStart);
  if (secEnd === -1) throw new Error('Nu găsesc finalul secțiunii Personalități.');
  html = html.slice(0, secEnd + 1) + '\n' + consBlock + html.slice(secEnd + 1);
}

// Stratul de ritm: spațiere, tipografie, etichetele hărților
const start = '<!-- ritm:start -->\n';
const end = '<!-- ritm:end -->\n';
const prev = html.indexOf(start);
if (prev !== -1) html = html.slice(0, prev) + html.slice(html.indexOf(end, prev) + end.length);
const css = fs.readFileSync(path.join(__dirname, 'design', 'ritm.css'), 'utf8').replace(/\r\n/g, '\n').trimEnd();
const headEnd = html.lastIndexOf('</head>');
if (headEnd === -1) throw new Error('Lipsește </head>.');
// scara etichetelor de pe hartă: viewBox / lățimea afișată
const js = "(function(){function k(){document.querySelectorAll('.map-svg').forEach(function(s){var w=s.getBoundingClientRect().width,v=s.viewBox&&s.viewBox.baseVal;if(w>0&&v&&v.width)s.style.setProperty('--map-k',(v.width/w).toFixed(3));});}" +
  "addEventListener('load',k);addEventListener('resize',k);" +
  // harta se desenează după încărcare și își schimbă lățimea: observă fiecare hartă nouă
  "if(window.ResizeObserver){var r=new ResizeObserver(k),seen=new WeakSet();function watch(){document.querySelectorAll('.map-svg').forEach(function(s){if(!seen.has(s)){seen.add(s);r.observe(s);}});k();}" +
  "document.addEventListener('DOMContentLoaded',function(){watch();var t=0;new MutationObserver(function(){if(!t)t=setTimeout(function(){t=0;watch();},200);}).observe(document.body,{childList:true,subtree:true});});}})();";
html = html.slice(0, headEnd) + start + '<style id="ritm">\n' + css + '\n</style>\n<script id="ritm-js">' + js + '</script>\n' + end + html.slice(headEnd);

fs.writeFileSync(page, crlf ? html.replace(/\n/g, '\r\n') : html);
