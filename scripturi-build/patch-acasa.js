// Pagina Acasă / Articol, redesenată (din scripturi-build/acasa/):
//  A) fundalul: fără „cutia” articolului, o coloană de lectură de 860 px direct pe un fundal cald; meta theme-color;
//  B) un singur meniu sticky: „Atelierul Hunilor” (Acasă) · capitolele, fără numere (Glosarul și Bibliografia ca „Surse”) ·
//     Jocul, Jocul izvoarelor, Despre proiect;
//     se ascunde la derularea în jos, revine la derularea în sus; pe telefon, un sertar; punct auriu la capitolele citite;
//  C) hero-ul: pictura lui Rafael ca imagine (WebP, două mărimi), metadatele ca trei chip-uri, legenda în colț;
//  D) titlul capitolului: numărul mare și titlul într-un singur bloc (fără eticheta repetată);
//  E) imaginile din articol: doar rama subțire (fără colțul auriu și umbra).
// Folosire: node scripturi-build/patch-acasa.js (după celelalte scripturi; apoi patch-efecte.js și build-web.js).
// Se poate rula de mai multe ori.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const D = path.join(__dirname, 'acasa');
const rd = f => fs.readFileSync(path.join(D, f), 'utf8').split('\r\n').join('\n');
const b64 = f => 'data:image/webp;base64,' + fs.readFileSync(path.join(D, f)).toString('base64');

// zgomot fin peste degrade, ca fundalul să nu facă benzi de culoare
const NOISE_SVG = "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.9  0 0 0 0 0.8  0 0 0 0 0.6  0 0 0 0.05 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>";
const NOISE = 'url("data:image/svg+xml,' + encodeURIComponent(NOISE_SVG).replace(/'/g, '%27') + '")';
const CSS = rd('acasa.css').replace(/__NOISE__/g, NOISE).replace(/\n+$/, '\n');
const JS = '<script>\n' + rd('acasa.js').trim() + '\n</script>\n';

const rel = 'atelierul-hunilor.html';
const f = path.join(root, rel);
const raw = fs.readFileSync(f, 'utf8'), crlf = raw.includes('\r\n');
let s = raw.split('\r\n').join('\n');
const fail = m => { console.error(rel + ': ' + m); process.exit(1); };
function swap(a, b, what){ const n = s.split(a).length - 1; if (n === 1) { s = s.replace(a, () => b); return true; } if (s.includes(b)) return false; fail(what + ' (' + n + ')'); }

// ---------- A) theme-color ----------
if (!/<meta name="theme-color"/.test(s)) s = s.replace('<head>\n', '<head>\n<meta name="theme-color" content="#0c0a08">\n');

// ---------- B) meniul unic: capitolele intră în bara de sus ----------
const nav0 = s.indexOf('<nav class="site-nav"');
if (nav0 < 0) fail('meniul de sus');
const nav1 = s.indexOf('</nav>\n', nav0) + '</nav>\n'.length;
const oldNav = s.slice(nav0, nav1);
const about = (oldNav.match(/<button class="about-trigger"[\s\S]*?<\/button>/) || [])[0];
if (!about) fail('butonul „Despre proiect”');
let chap = '';
const c0 = s.indexOf('<nav class="chap-bar" aria-label="Cuprins">');
if (c0 >= 0) {
  const c1 = s.indexOf('</nav>\n', c0) + '</nav>\n'.length;
  chap = s.slice(c0, c1);
  s = s.slice(0, c0) + s.slice(c1);
} else {
  chap = (oldNav.match(/<div class="chap-bar" id="chap-bar">[\s\S]*?<\/div>\n    <\/div>/) || [])[0];
  if (!chap) fail('capitolele');
}
// capitolele, fără numere; Glosarul și Bibliografia sunt un singur item, „Surse” (activ în ambele)
const CH = [['sec-origini', 'Origini'], ['sec-cronologie', 'Cronologie'], ['sec-migratie', 'Marea Migrație'], ['sec-atlas', 'Atlas'],
  ['sec-personalitati', 'Personalități'], ['sec-muzeu', 'Muzeu'], ['sec-glosar', 'Surse', 'biblio']];
CH.forEach(c => { if (!s.includes('id="' + c[0] + '"')) fail('capitolul ' + c[0]); });
const chapLinks = CH.map(c => '<a href="#' + c[0] + '" data-sec="' + c[0] + '"' + (c[2] ? ' data-also="' + c[2] + '"' : '') + ' class="toc-link">' + c[1] + '</a>');
const NAV = `<nav class="site-nav" id="site-nav" aria-label="Navigare principală">
  <a class="st-brand" href="#page-acasa" data-page><span class="st-mark" aria-hidden="true"></span>Atelierul Hunilor</a>
  <div class="st-links" id="st-links">
    <div class="chap-bar" id="chap-bar">
      <div class="chap-bar-row" id="toc-row" aria-label="Capitolele articolului">
        ${chapLinks.join('\n        ')}
      </div>
    </div>
    <div class="st-pages">
      <a href="#mod-migratie" data-page aria-label="Jocul: Attila și Marea Migrație"><span class="nav-long">Attila</span><span class="nav-short" aria-hidden="true">Attila</span></a>
      <a href="#mod-atelier" data-page aria-label="Jocul izvoarelor"><span class="nav-long">Izvoarele</span><span class="nav-short" aria-hidden="true">Izvoarele</span></a>
      ${about}
    </div>
  </div>
  <button type="button" class="st-menu" id="st-menu" aria-expanded="false" aria-controls="st-links"><i aria-hidden="true"></i><span>Meniu</span></button>
</nav>
`;
s = s.replace(oldNav, () => NAV);

// comutatorul de pagini: doar cele trei linkuri de pagină, cu aria-current
swap("var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a'));",
  "var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a[data-page]'));", 'router: linkurile');
swap("navLinks.forEach(function(a, i){ a.classList.toggle('current', i === index); });",
  "navLinks.forEach(function(a, i){ a.classList.toggle('current', i === index); if (i === index) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });", 'router: pagina curentă');
// capitolul curent: niciunul cât timp ești în deschidere; aria-current pe cel activ
swap('var current = sections[0];', 'var current = null;', 'cuprins: începutul');
// capitolul activ (și „Surse” când citești bibliografia)
{
  const A = "a.classList.toggle('active', current && a.getAttribute('data-sec') === current.id);";
  const B1 = "var on = !!(current && a.getAttribute('data-sec') === current.id); a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');";
  const B = "var on = !!(current && (a.getAttribute('data-sec') === current.id || a.getAttribute('data-also') === current.id)); a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');";
  const B2 = "var hp = document.getElementById('page-acasa'), on = !!(current && (!hp || hp.classList.contains('active')) && (a.getAttribute('data-sec') === current.id || a.getAttribute('data-also') === current.id)); a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');";
  if (s.includes(B1)) s = s.replace(B1, () => B); else if (!s.includes(B2)) swap(A, B, 'cuprins: activ');
  if (s.includes(B)) s = s.replace(B, () => B2);
}

// ---------- C) hero-ul: pictura ca imagine reală ----------
const IMG = '<img id="hero-img" class="hero-img" src="' + b64('hero-1310.webp') + '" srcset="' + b64('hero-900.webp') + ' 900w, ' + b64('hero-1310.webp') + ' 1310w" sizes="100vw" width="1310" height="700" alt="Fresca lui Rafael: papa Leon cel Mare și Attila, cu Roma în fundal." loading="eager" fetchpriority="high" decoding="async">';
const hb = s.match(/<div class="hero-bg" style="background-image:url\('data:image\/[a-z]+;base64,[^']+'\)"><\/div>/);
if (hb) s = s.replace(hb[0], () => '<div class="hero-bg">' + IMG + '</div>');
else {
  const hi = s.match(/<div class="hero-bg"><img id="hero-img"[^>]*><\/div>/);
  if (!hi) fail('imaginea din deschidere');
  s = s.replace(hi[0], () => '<div class="hero-bg">' + IMG + '</div>');
}
// codul QR „Joacă pe telefon”: din deschiderea articolului în antetul paginii jocului
{
  const qr = s.match(/ {6}<aside class="hero-qr"[\s\S]*?<\/aside>\n/);
  const head = '  <header class="mig-head">\n    <div class="jg-wrap">\n      <h1>Attila și Marea Migrație</h1>\n';
  const h0 = s.indexOf(head);
  if (h0 < 0) fail('antetul jocului');
  const inHead = qr && s.indexOf(qr[0]) > h0 && s.indexOf(qr[0]) < s.indexOf('  </header>\n', h0);
  if (qr && !inHead) {
    s = s.replace(qr[0], '');
    const p1 = s.indexOf('</p>\n', s.indexOf(head)) + '</p>\n'.length;
    s = s.slice(0, p1) + qr[0] + s.slice(p1);
  } // fără cod QR (scos în recenzia 7): nimic de mutat
}
// atlasul refolosește pictura: acum o ia din imagine
swap("bg: '#acasa .hero-bg',", "id: 'hero-img',", 'atlas: pictura');

// ---------- D) titlul capitolului ----------
s = s.replace(/<div class="chapter-mark"><span class="chapter-num">(\d+)<\/span><span class="chapter-slash">\/<\/span><span class="chapter-tag">[^<]*<\/span><\/div>\s*<h2 class="sec-title">([\s\S]*?)<\/h2>/g,
  (m, n, t) => '<div class="chapter-mark sec-head"><span class="chapter-num" aria-hidden="true">' + n + '</span><h2 class="sec-title">' + t + '</h2></div>');
const heads = (s.match(/class="chapter-mark sec-head"/g) || []).length;
if (heads !== 8 && !(heads === 9 && s.includes('<section id="sec-mituri">'))) fail('titlurile capitolelor (' + heads + ')');

// ---------- stilurile și scriptul ----------
const k0 = s.indexOf('  /* ah: acasa');
if (k0 >= 0) { const e = '  /* /ah */\n'; const k1 = s.indexOf(e, k0); if (k1 < 0) fail('sfârșit CSS ah'); s = s.slice(0, k0) + s.slice(k1 + e.length); }
const st = s.lastIndexOf('</style>');
if (st < 0) fail('</style>');
s = s.slice(0, st) + CSS + s.slice(st);
const j0 = s.indexOf('<script>\n/* ah: acasa');
if (j0 >= 0) s = s.slice(0, j0) + s.slice(s.indexOf('</script>\n', j0) + '</script>\n'.length);
const b = s.lastIndexOf('</body>');
if (b < 0) fail('</body>');
s = s.slice(0, b) + JS + s.slice(b);

fs.writeFileSync(f, crlf ? s.split('\n').join('\r\n') : s);
console.log(rel + ': Acasă redesenată (meniu unic, hero, titluri, fundal, rame)');
