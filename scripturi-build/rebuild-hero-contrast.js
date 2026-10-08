// Hero (Acasă): darker scrim + soft shadows so the gold kicker and title read on the fresco.
// Patches the built pages directly (index, atelierul-hunilor, huni-prezentare).
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..');
const PAIRS = [
  ["background: linear-gradient(180deg, rgba(14,9,4,0.08) 0%, rgba(14,9,4,0.22) 38%, rgba(14,9,4,0.92) 100%);",
   "background:\n      linear-gradient(90deg, rgba(14,9,4,0.72) 0%, rgba(14,9,4,0.46) 55%, rgba(14,9,4,0.12) 100%),\n      linear-gradient(180deg, rgba(14,9,4,0.55) 0%, rgba(14,9,4,0.5) 38%, rgba(14,9,4,0.94) 100%);"],
  ["letter-spacing: 0.16em; text-transform: uppercase; color: #e5c158; margin: 0 0 18px;",
   "letter-spacing: 0.16em; text-transform: uppercase; color: #f2d474; margin: 0 0 18px;\n    text-shadow: 0 1px 3px rgba(0,0,0,0.95), 0 0 14px rgba(0,0,0,0.75);"],
  ["margin-bottom: 20px; color: #f0e6d6; font-weight: 600; }",
   "margin-bottom: 20px; color: #f6eddc; font-weight: 600; text-shadow: 0 2px 14px rgba(0,0,0,0.65); }"],
  ["h1.title em{ font-style: italic; font-weight: 500; color: #e5c158; }",
   "h1.title em{ font-style: italic; font-weight: 500; color: #f2d474; }"],
  ["color: #d9cbae; max-width: 54ch; margin: 0; font-family: 'Source Serif 4', serif; }",
   "color: #eadfc6; max-width: 54ch; margin: 0; font-family: 'Source Serif 4', serif; text-shadow: 0 1px 8px rgba(0,0,0,0.8); }"],
];
for (const f of ['index.html', 'atelierul-hunilor.html', 'module-individuale/huni-prezentare.html']) {
  const p = path.join(R, f); let s = fs.readFileSync(p, 'utf8');
  for (const [a, b] of PAIRS) { if (!s.includes(a)) { console.error(f + ': not found: ' + a.slice(0, 40)); process.exit(1); } s = s.replace(a, b); }
  fs.writeFileSync(p, s);
}
console.log('hero: contrast');
