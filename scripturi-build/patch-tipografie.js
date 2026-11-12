// Tipografia, pe tot site-ul (rulat ultimul, după patch-efecte.js; apoi build-web.js):
//  A) două fonturi: EB Garamond (titluri și etichete, în locul lui Cormorant Garamond și Cinzel) și Source Serif 4 (text).
//     JetBrains Mono iese peste tot,
//     iar butoanele și câmpurile nu mai cad pe fontul sistemului (Arial), ci moștenesc fontul textului;
//  B) o scară de opt mărimi: 13, 14, 16, 18, 21, 26, 34, 48 px. Orice mărime fixă (px sau rem) din CSS e mutată pe treapta
//     cea mai apropiată, iar nimic nu coboară sub 13 px; mărimile relative mai mici de 1em devin max(13px, …em).
//     Rămân neatinse: titlurile fluide (clamp), literele mari (≥ 1em) și textele din hărțile și graficele SVG,
//     unde mărimea e în unitățile desenului, nu pe ecran.
// Se poate rula de mai multe ori: o mărime deja pe scară rămâne pe loc.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const rel = 'atelierul-hunilor.html';
const f = path.join(root, rel);
const raw = fs.readFileSync(f, 'utf8'), crlf = raw.includes('\r\n');
let s = raw.split('\r\n').join('\n');

const STEPS = [13, 14, 16, 18, 21, 26, 34, 48];
const MIN = 13;
function snapPx(px){
  if (px < MIN) return MIN;
  let best = STEPS[0];
  for (const v of STEPS) if (Math.abs(v - px) < Math.abs(best - px)) best = v;
  return px > STEPS[STEPS.length - 1] ? px : best;
}
const fmt = px => (px / 16).toFixed(4).replace(/0+$/, '').replace(/\.$/, '') + 'rem';
// regulile cu text în SVG (hărți, grafice): mărimea e în unitățile desenului
const SVG_RULE = /\bsvg\b|(^|[\s,>])text\b|\.(region|m|sea|river|route|stop|city|mk|map-pt)-label\b|\.rl-|\.gs-(lab|who|unit|coins-lab|stop)|\.hv-|\.mh-|\.qrline/;

function size(tok){
  const m = tok.match(/^(\d*\.?\d+)(px|rem|em)$/);
  if (!m) return tok;
  const v = parseFloat(m[1]);
  if (m[2] === 'em') return v < 1 ? 'max(' + MIN + 'px, ' + tok + ')' : tok;
  const px = m[2] === 'rem' ? v * 16 : v;
  if (px <= 0) return tok;
  return fmt(snapPx(px));
}

let changed = 0;
function css(block){
  // fiecare regulă: selector { declarații }
  return block.replace(/([^{}]+)\{([^{}]*)\}/g, (all, sel, body) => {
    const bare = sel.replace(/\/\*[\s\S]*?\*\//g, ' ');
    if (SVG_RULE.test(bare) || /@font-face|@keyframes|^\s*(from|to|\d+%)/.test(bare.trim())) return all;
    const nb = body
      .replace(/(font-size\s*:\s*)(\d*\.?\d+(?:px|rem|em))(?=\s*(?:!important)?\s*[;}]|\s*$)/g, (m, p, t) => p + size(t))
      .replace(/(\bfont\s*:\s*(?:(?:italic|normal|oblique|small-caps|bold|bolder|lighter|\d{3})\s+)*)(\d*\.?\d+(?:px|rem|em))(?=\s*\/|\s+['"A-Za-z])/g, (m, p, t) => p + size(t));
    if (nb !== body) changed++;
    return sel + '{' + nb + '}';
  });
}

// A) fonturile
s = s.replace(/&family=JetBrains\+Mono[^&'")]*/g, '').replace(/family=JetBrains\+Mono[^&'")]*&/g, '');
s = s.split("'JetBrains Mono', monospace").join("'Source Serif 4', Georgia, serif")
  .split('"JetBrains Mono", monospace').join('"Source Serif 4", Georgia, serif')
  .split('JetBrains Mono').join('Source Serif 4');
s = s.replace(/font-family:\s*system-ui[^;}"]*/g, "font-family: 'Source Serif 4', Georgia, serif");
s = s.replace(/system-ui,\s*sans-serif/g, "'Source Serif 4', Georgia, serif");
// titlurile și etichetele: EB Garamond (Cinzel era cel mai recognoscibil font „istoric”)
s = s.replace(/family=Cormorant\+Garamond[^&'")]*/g, 'family=EB+Garamond:ital,wght@0,400..800;1,400..800').replace(/&family=Cinzel[^&'")]*/g, '');
s = s.split('Cormorant Garamond').join('EB Garamond').split('Cinzel').join('EB Garamond');

// B) mărimile, în toate blocurile <style>
s = s.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (m, a, b, c) => a + css(b) + c);

// butoanele și câmpurile: fontul textului, nu Arial
const BASE = '  /* tp: tipografia */\n  button, input, select, textarea, kbd{ font-family: inherit; }\n  /* /tp */\n';
const k0 = s.indexOf('  /* tp: tipografia */');
if (k0 >= 0) { const e = '  /* /tp */\n'; s = s.slice(0, k0) + s.slice(s.indexOf(e, k0) + e.length); }
const h = s.indexOf('</style>');
s = s.slice(0, h) + BASE + s.slice(h);

fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
console.log(rel + ': tipografia (3 fonturi, scara de 8 mărimi, minimum 13 px; ' + changed + ' reguli atinse)');
