// Applies the user-specified color palette (Imperial Gold / Steppe Night /
// Crimson Blood / Parchment / Iron Slate / Amber Ember) across every module,
// and forces dark mode site-wide (the palette is explicitly a dark-mode
// palette, and the site currently has no light/dark toggle — without forcing
// it, most visitors on light-mode OSes would never see it).
//
// Strategy: replace each module's dark-theme CSS variable block (both the
// @media(prefers-color-scheme:dark) version and the :root[data-theme="dark"]
// version — the site forces the latter) with new values. Functional/semantic
// colors (correct/incorrect feedback greens, map sea/land, per-faction route
// colors that need to stay visually distinct) are left untouched on purpose.
// The light theme is left completely untouched.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const P = {
  gold: '#d4af37',
  goldBright: '#e5c158',
  night: '#121214',
  night2: '#1a1a1e',
  crimson: '#8b0000',
  crimsonBright: '#a71d2a',
  parchment: '#e6d7c3',
  parchmentDim: '#a89a85',
  slate: '#2a2a32',
  slateBright: '#3a3a45',
  amber: '#e67e22',
  amberDim: '#b8621a'
};

function replaceBlock(file, oldBlock, newBlock, label){
  const p = path.join(ROOT, 'build', file);
  let s = fs.readFileSync(p, 'utf8');
  if (!s.includes(oldBlock)) { console.error('NOT FOUND in ' + file + ': ' + label); process.exit(1); }
  s = s.split(oldBlock).join(newBlock);
  fs.writeFileSync(p, s);
  console.log('  ' + file + ': ' + label);
}

// ---------- story.css ----------
{
  const old1 =
`  @media (prefers-color-scheme: dark){
    :root:not([data-theme="light"]){
      --paper: #1c150e;
      --paper-2: #241b12;
      --paper-3: #2c2114;
      --ink: #ecdfc7;
      --ink-dim: #b3a17c;
      --line: rgba(236, 223, 199, 0.18);
      --line-strong: rgba(236, 223, 199, 0.38);
      --accent: #d98a7c;
      --accent-2: #d4af37;
      --accent-bg: #3a1f1a;
      --accent2-bg: #362c14;
      --good-bg: #29301f;
      --shadow: rgba(0, 0, 0, 0.5);
    }
  }`;
  const new1 =
`  @media (prefers-color-scheme: dark){
    :root:not([data-theme="light"]){
      --paper: ${P.night};
      --paper-2: ${P.night2};
      --paper-3: ${P.slate};
      --ink: ${P.parchment};
      --ink-dim: ${P.parchmentDim};
      --line: rgba(230, 215, 195, 0.16);
      --line-strong: rgba(230, 215, 195, 0.34);
      --accent: ${P.crimsonBright};
      --accent-2: ${P.gold};
      --accent-bg: #2e1416;
      --accent2-bg: #2c2410;
      --good-bg: #29301f;
      --shadow: rgba(0, 0, 0, 0.5);
    }
  }`;
  replaceBlock('story.css', old1, new1, '@media dark block');

  const old2 =
`  :root[data-theme="dark"]{
    --paper: #1c150e;
    --paper-2: #241b12;
    --paper-3: #2c2114;
    --ink: #ecdfc7;
    --ink-dim: #b3a17c;
    --line: rgba(236, 223, 199, 0.18);
    --line-strong: rgba(236, 223, 199, 0.38);
    --accent: #d98a7c;
    --accent-2: #d4af37;
    --accent-bg: #3a1f1a;
    --accent2-bg: #362c14;
    --good-bg: #29301f;
    --shadow: rgba(0, 0, 0, 0.5);
  }`;
  const new2 =
`  :root[data-theme="dark"]{
    --paper: ${P.night};
    --paper-2: ${P.night2};
    --paper-3: ${P.slate};
    --ink: ${P.parchment};
    --ink-dim: ${P.parchmentDim};
    --line: rgba(230, 215, 195, 0.16);
    --line-strong: rgba(230, 215, 195, 0.34);
    --accent: ${P.crimsonBright};
    --accent-2: ${P.gold};
    --accent-bg: #2e1416;
    --accent2-bg: #2c2410;
    --good-bg: #29301f;
    --shadow: rgba(0, 0, 0, 0.5);
  }`;
  replaceBlock('story.css', old2, new2, '[data-theme=dark] block');

  // Hero/byline literal colors (always-dark section, no light variant) —
  // these hex values don't collide with the light theme's palette.
  const heroMap = [
    ['#f4ead4', '#f0e6d6'], // bright neutral title/byline-bold text -> lightened parchment
    ['#e8c25f', P.goldBright],
    ['#b3a17c', P.parchmentDim],
    ['#d98a7c', P.crimsonBright],
    ['#3a1f1a', '#2e1416'],
    ['#362c14', '#2c2410'],
    ['#e8dcc4', P.parchment],
    ['#241b12', P.night2],
    ['#2c2114', P.slate],
    ['#1c150e', P.night],
    ['#ecdfc7', P.parchment]
  ];
  const p = path.join(ROOT, 'build', 'story.css');
  let s = fs.readFileSync(p, 'utf8');
  heroMap.forEach(([a, b]) => { s = s.split(a).join(b); });
  fs.writeFileSync(p, s);
  console.log('  story.css: hero/byline literals remapped');
}

// ---------- game.css (single always-dark theme) ----------
{
  const p = path.join(ROOT, 'build', 'game.css');
  let s = fs.readFileSync(p, 'utf8');
  const map = [
    ['--bg: #100b07;', `--bg: ${P.night};`],
    ['--bg-2: #1a1109;', `--bg-2: ${P.night2};`],
    ['--surface: #1f150c;', `--surface: ${P.night2};`],
    ['--surface-2: #2a1d10;', `--surface-2: ${P.slate};`],
    ['--surface-3: #352513;', `--surface-3: ${P.slateBright};`],
    ['--ink: #f1e6d3;', `--ink: ${P.parchment};`],
    ['--ink-dim: #a4927460;', `--ink-dim: #a89a8560;`],
    ['--ink-dim2: #a89474;', `--ink-dim2: ${P.parchmentDim};`],
    ['--line: #3c2c17;', `--line: ${P.slate};`],
    ['--line-bright: #55401f;', `--line-bright: ${P.slateBright};`],
    ['--ember: #ff6a35;', `--ember: ${P.amber};`],
    ['--ember-dim: #b8461f;', `--ember-dim: ${P.amberDim};`],
    ['--gold: #e9b94a;', `--gold: ${P.goldBright};`],
    ['--gold-dim: #a67f2a;', `--gold-dim: ${P.gold};`],
    ['--bad: #e5473d;', `--bad: ${P.crimsonBright};`],
    ['--bad-bg: #2c1512;', `--bad-bg: #2e1416;`]
  ];
  let n = 0;
  map.forEach(([a, b]) => { if (s.includes(a)) { s = s.split(a).join(b); n++; } else console.error('  game.css: NOT FOUND ' + a); });
  fs.writeFileSync(p, s);
  console.log('  game.css: ' + n + '/' + map.length + ' variables remapped');
}

// ---------- embassy.css & lab.css (identical dark-theme shape) ----------
['embassy.css', 'lab.css'].forEach(file => {
  const p = path.join(ROOT, 'build', file);
  let s = fs.readFileSync(p, 'utf8');

  const darkBlockRe = /(:root(?:\[data-theme="dark"\]|:not\(\[data-theme="light"\]\)))\{([^}]*)\}/g;
  let count = 0;
  s = s.replace(darkBlockRe, function(full, selector, body){
    if (!body.includes('--parchment:')) return full; // only touch the theme-color blocks
    count++;
    let b = body;
    b = b.replace('--parchment: #201607;', `--parchment: ${P.night};`);
    b = b.replace('--parchment-2: #2a1d0d;', `--parchment-2: ${P.night2};`);
    b = b.replace('--parchment-3: #362512;', `--parchment-3: ${P.slate};`);
    b = b.replace('--ink: #ecd8a6;', `--ink: ${P.parchment};`);
    b = b.replace('--ink-dim: #ab9366;', `--ink-dim: ${P.parchmentDim};`);
    b = b.replace('--border-nomad: #a8763f;', `--border-nomad: ${P.slateBright};`);
    b = b.replace(/--imperial: #e2938f;/g, `--imperial: ${P.crimsonBright};`);
    b = b.replace(/--imperial-bg: #3a1f1f;/g, `--imperial-bg: #2e1416;`);
    b = b.replace('--gold-bright: #e8c25f;', `--gold-bright: ${P.goldBright};`);
    b = b.replace(/--bad: #e2938f;/g, `--bad: ${P.crimsonBright};`);
    b = b.replace(/--bad-bg: #3a1f1a;/g, `--bad-bg: #2e1416;`);
    return selector + '{' + b + '}';
  });
  fs.writeFileSync(p, s);
  console.log('  ' + file + ': ' + count + ' dark-theme block(s) remapped');
});

// ---------- atlas.css (map colors stay functional; only chrome remapped) ----------
{
  const p = path.join(ROOT, 'build', 'atlas.css');
  let s = fs.readFileSync(p, 'utf8');
  let n = 0;
  const pairs = [
    [/--ink: #ecd8a6;/g, `--ink: ${P.parchment};`],
    [/--ink-dim: #ab9366;/g, `--ink-dim: ${P.parchmentDim};`],
    [/--imperial: #e2938f;/g, `--imperial: ${P.crimsonBright};`],
    [/--gold: #e8c25f;/g, `--gold: ${P.goldBright};`],
    [/--route-huni-1: #e2938f;/g, `--route-huni-1: ${P.crimsonBright};`],
    [/--route-huni-2: #e8c25f;/g, `--route-huni-2: ${P.goldBright};`],
    [/--paper-frame: #2a1d0d;/g, `--paper-frame: ${P.night2};`]
  ];
  pairs.forEach(([re, rep]) => { const before = s; s = s.replace(re, rep); if (s !== before) n++; });
  fs.writeFileSync(p, s);
  console.log('  atlas.css: ' + n + ' chrome rule group(s) remapped (sea/land/faction routes left functional)');
}

console.log('Done.');
