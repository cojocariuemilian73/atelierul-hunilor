// Revizia după observațiile juriului (design/revizie.css|js). Rulează după patch-miscare, înainte de build-web.
// 1. Scara de mărimi: toate font-size / font în px sau rem din <style> trec pe 7 trepte fixe (14–44 px; titlurile mari rămân).
//    Interfețele dense (jocuri, piesele de domino, axele mici) au voie și la treapta de 12 px.
// 2. Scriptul „Animații pornite”: în <head>, înaintea oricărui alt script (vezi revizie.js pentru comutator).
// 3. Stilurile și scriptul reviziei, înainte de </body>. Se poate rula de mai multe ori.
const fs = require('fs');
const path = require('path');

const page = path.join(__dirname, '..', 'atelierul-hunilor.html');
const raw = fs.readFileSync(page, 'utf8');
const crlf = raw.includes('\r\n');
let html = raw.replace(/\r\n/g, '\n');
const read = (f) => fs.readFileSync(path.join(__dirname, 'design', f), 'utf8').replace(/\r\n/g, '\n').trimEnd();

// 1. scara de mărimi
const STEPS = [14, 16, 18, 21, 26, 34, 44];
const DENSE = /mig-|jg-|md-|dmn-|si-tick|si-no|dx-|kbd|ef-r|hx-|legend|time-tick|mv-margin|journey|pz-|zoom-btn/;
function snap(px, dense) {
  if (px >= 52) return px;                       // titlurile de afiș rămân cum sunt
  const steps = dense ? [12].concat(STEPS) : STEPS;
  if (px <= steps[0]) return steps[0];
  return steps.reduce((a, b) => (Math.abs(b - px) < Math.abs(a - px) ? b : a));
}
function toPx(n, unit) { return unit === 'rem' ? n * 16 : n; }
let changed = 0;
function normalizeCss(css) {
  // fiecare regulă cea mai interioară: selector { declarații }
  return css.replace(/([^{}]*)\{([^{}]*)\}/g, (m, sel, body) => {
    if (/@font-face|@keyframes|^\s*(from|to|\d+%)/.test(sel)) return m;
    const dense = DENSE.test(sel);
    const nb = body
      .replace(/(font-size\s*:\s*)(\d*\.?\d+)(px|rem)\b/g, (mm, pre, n, u) => {
        const v = snap(toPx(parseFloat(n), u), dense); if (v !== toPx(parseFloat(n), u)) changed++; return pre + v + 'px';
      })
      .replace(/(font\s*:\s*(?:italic\s+|normal\s+|oblique\s+)?(?:small-caps\s+)?(?:\d{3}\s+|bold\s+|normal\s+)?)(\d*\.?\d+)(px|rem)\b/g, (mm, pre, n, u) => {
        const v = snap(toPx(parseFloat(n), u), dense); if (v !== toPx(parseFloat(n), u)) changed++; return pre + v + 'px';
      });
    return sel + '{' + nb + '}';
  });
}
html = html.replace(/(<style(?:\s[^>]*)?>)([\s\S]*?)(<\/style>)/g, (m, a, css, b) => a + normalizeCss(css) + b);

// 2. comutatorul de animații: rulează primul în <head>
const HEAD_MARK = '<script id="ah-motion">';
if (!html.includes(HEAD_MARK)) {
  const i = html.indexOf('<head>');
  if (i === -1) throw new Error('Lipsește <head>.');
  html = html.slice(0, i + 6) + '\n' + HEAD_MARK + '\n' + read('revizie-head.js') + '\n</script>' + html.slice(i + 6);
} else {
  html = html.replace(/<script id="ah-motion">[\s\S]*?<\/script>/, HEAD_MARK + '\n' + read('revizie-head.js') + '\n</script>');
}

// 3. stratul reviziei
const start = '<!-- revizie:start -->\n', end = '<!-- revizie:end -->\n';
const prev = html.indexOf(start);
if (prev !== -1) html = html.slice(0, prev) + html.slice(html.indexOf(end, prev) + end.length);
const block = start +
  '<style id="revizie-css">\n' + read('revizie.css') + '\n</style>\n' +
  '<script id="revizie-js">\n' + read('revizie.js') + '\n</script>\n' + end;
const bodyEnd = html.lastIndexOf('</body>');
if (bodyEnd === -1) throw new Error('Lipsește </body>.');
html = html.slice(0, bodyEnd) + block + html.slice(bodyEnd);

fs.writeFileSync(page, crlf ? html.replace(/\n/g, '\r\n') : html);
console.log('mărimi de font aduse pe scară: ' + changed);
