// The Campania Hunilor hero image had "EMPIRE FALLS" baked into its sky (an
// artefact of the generated picture), hidden only by pushing the crop down —
// on tall screens it still showed. The image is now cut permanently below the
// text band (imagini/Stepa_calareti_hero_decupat.jpg: clouds, the line of
// riders on the horizon and the ruins), so no viewport can reveal it.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const uri = f => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(ROOT, 'imagini', f)).toString('base64');
const oldUri = uri('Dramatic_steppe_landscape_under_a_stormy_amber_sky_distant_s.jpg');
const newUri = uri('Stepa_calareti_hero_decupat.jpg');

const bodyPath = path.join(ROOT, 'build', 'game.body.html');
let body = fs.readFileSync(bodyPath, 'utf8');
if (!body.includes(oldUri)) { console.error('old hero image not found'); process.exit(1); }
body = body.split(oldUri).join(newUri);
fs.writeFileSync(bodyPath, body);

const cssPath = path.join(ROOT, 'build', 'game.css');
let css = fs.readFileSync(cssPath, 'utf8');
const from = 'background-size: cover; background-position: center 78%;';
if (!css.includes(from)) { console.error('hero-bg css not found'); process.exit(1); }
css = css.replace(from, 'background-size: cover; background-position: center 55%;');
fs.writeFileSync(cssPath, css);
console.log('hero: imagine decupată, fără textul „EMPIRE FALLS”');

// The Acasă stylesheet is global and its `.hero{ display:flex }` also reaches
// this hero, so the content box shrank to its text and sat left of centre.
{
  let c = fs.readFileSync(cssPath, 'utf8');
  const a = '  .hero-content{ position: relative; z-index: 1; }';
  if (!c.includes(a)) { console.error('hero-content css not found'); process.exit(1); }
  c = c.replace(a, '  .hero-content{ position: relative; z-index: 1; width: 100%; max-width: 900px; margin: 0 auto; }');
  fs.writeFileSync(cssPath, c);
  let b = fs.readFileSync(bodyPath, 'utf8');
  const s = 'Parcurge 5 campanii istorice';
  if (!b.includes(s)) { console.error('campaign count text not found'); process.exit(1); }
  b = b.replace(s, 'Parcurge 4 campanii istorice');
  fs.writeFileSync(bodyPath, b);
  console.log('hero: conținut centrat, 4 campanii');
}
