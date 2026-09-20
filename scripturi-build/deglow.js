// Strips the "floating card" / "glow halo" box-shadow + backdrop-filter tropes from
// each module's CSS, and converts pill badges (border-radius:999px) and oversized card
// corners into sharp/near-sharp ones — while leaving small functional shadows
// (slider thumbs, drag pins, hotspot pings, the atlas's aged-map vignette) alone.
const fs = require('fs');

function apply(file, replacements) {
  let t = fs.readFileSync(file, 'utf8');
  replacements.forEach(([from, to], i) => {
    if (!t.includes(from)) { console.log('MISS', file, i, JSON.stringify(from.slice(0, 60))); return; }
    t = t.split(from).join(to);
  });
  fs.writeFileSync(file, t);
}

apply('build/game.css', [
  ['box-shadow: 0 20px 44px -26px var(--shadow);\n  }', '\n  }'],
  ['box-shadow: 0 10px 24px -10px rgba(233, 185, 74, 0.35);\n    transition: transform 0.12s ease, box-shadow 0.12s ease;',
   'transition: transform 0.12s ease, background 0.12s ease;'],
  ['button.cta:hover{ transform: translateY(-2px); box-shadow: 0 14px 28px -10px rgba(233, 185, 74, 0.45); }',
   'button.cta:hover{ transform: translateY(-2px); filter: brightness(1.05); }'],
  ['box-shadow: 0 0 0 1px var(--ember) inset, 0 0 16px -3px var(--ember);',
   'box-shadow: 0 0 0 1px var(--ember) inset;'],
  ['0%{ box-shadow: 0 0 0 0 rgba(92,193,127,0.55), 0 20px 44px -26px var(--shadow); }\n  100%{ box-shadow: 0 0 0 34px rgba(92,193,127,0), 0 20px 44px -26px var(--shadow); }',
   '0%{ box-shadow: 0 0 0 0 rgba(92,193,127,0.55); }\n  100%{ box-shadow: 0 0 0 34px rgba(92,193,127,0); }'],
  ['0%{ box-shadow: 0 0 0 0 rgba(229,71,61,0.5), 0 20px 44px -26px var(--shadow); }\n  100%{ box-shadow: 0 0 0 26px rgba(229,71,61,0), 0 20px 44px -26px var(--shadow); }',
   '0%{ box-shadow: 0 0 0 0 rgba(229,71,61,0.5); }\n  100%{ box-shadow: 0 0 0 26px rgba(229,71,61,0); }'],
  ['.envelope.picked .seal2{ border-color: var(--gold); box-shadow: 0 0 16px -4px var(--gold); }',
   '.envelope.picked .seal2{ border-color: var(--gold); border-width: 2px; }'],
  ['box-shadow: 0 0 30px -8px var(--gold);\n    animation: badge-pop', 'animation: badge-pop'],
  ['box-shadow: 0 0 30px -6px var(--gold);\n    animation: seal-stamp', 'animation: seal-stamp'],
]);

apply('build/embassy.css', [
  ['padding: 10px 14px; margin: 18px 0; box-shadow: 0 14px 30px -20px var(--shadow);',
   'padding: 10px 14px; margin: 18px 0;'],
  ['position: relative; box-shadow: 0 20px 44px -28px var(--shadow);\n    padding: clamp(18px, 4vw, 30px);',
   'position: relative;\n    padding: clamp(18px, 4vw, 30px);'],
]);

apply('build/atlas.css', [
  ['box-shadow: 0 20px 44px -28px var(--shadow); padding: 10px;', 'padding: 10px;'],
  ['padding: 22px 24px; position: relative; box-shadow: 0 30px 60px -20px rgba(0,0,0,0.5);',
   'padding: 22px 24px; position: relative;'],
]);

apply('build/lab.css', [
  ['border-radius: 10px; position: relative; box-shadow: 0 20px 44px -28px var(--shadow); padding: clamp(16px, 4vw, 26px);',
   'border-radius: 2px; position: relative; padding: clamp(16px, 4vw, 26px);'],
  ['border-radius: 8px; padding: 12px 14px; box-shadow: 0 16px 32px -14px var(--shadow); display: none;',
   'border-radius: 2px; padding: 12px 14px; display: none;'],
]);

apply('build/cinema.css', [
  ['padding: 24px 26px; position: relative; box-shadow: 0 30px 70px -20px rgba(0,0,0,0.7);',
   'padding: 24px 26px; position: relative;'],
  ['background: rgba(10,6,4,0.55); backdrop-filter: blur(6px);\n    border: 1px solid var(--line); border-radius: 999px;',
   'background: rgba(10,6,4,0.82);\n    border: 1px solid var(--line); border-radius: 2px;'],
]);

console.log('deglow pass complete');
