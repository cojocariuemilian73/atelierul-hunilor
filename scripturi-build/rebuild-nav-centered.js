// Top bar: the page links sit in the middle of the bar; "Despre proiect"
// stays pinned on the right (on wide screens it is taken out of the flow, so
// the links are centred on the page itself). Auto margins are used instead of
// justify-content:center so that, on a phone, the scrollable bar never cuts
// off its first link.
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'assemble.js');
let s = fs.readFileSync(FILE, 'utf8');
function rep(from, to, what){ if (!s.includes(from)) { console.error('not found: ' + what); process.exit(1); } s = s.replace(from, to); }
rep("  .site-nav a:hover{ color: #f0e6d6; }",
    "  .site-nav a:hover{ color: #f0e6d6; }\n  .site-nav > a:first-of-type{ margin-left: auto; }\n  .site-nav > a:last-of-type{ margin-right: auto; }", 'nav centring');
rep("  .about-trigger{\n    margin-left: auto; flex-shrink: 0;",
    "  .about-trigger{\n    margin-left: 8px; flex-shrink: 0;", 'trigger margin');
rep("  .about-trigger:hover{ background: #edcb77; }\n",
    "  .about-trigger:hover{ background: #edcb77; }\n  @media (min-width: 900px){ .about-trigger{ position: absolute; right: 16px; top: 50%; transform: translateY(-50%); margin: 0; } }\n", 'trigger pinned');
fs.writeFileSync(FILE, s);
console.log('assemble.js: meniu centrat');
