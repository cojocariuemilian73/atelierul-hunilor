// Adds an honest "Cum a fost realizat proiectul" section to the Despre proiect
// modal: the code and most of the texts were written with an AI assistant,
// under the author's direction and review. Better stated plainly than guessed
// at by the jury.
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'assemble.js');
let s = fs.readFileSync(FILE, 'utf8');

function rep(from, to){
  if (!s.includes(from)) { console.error('not found: ' + from.slice(0, 80)); process.exit(1); }
  s = s.replace(from, to);
}

// The overlay was placed by calibrating against the map, not "by hand".
rep('a fost poziționat manual, pe coordonatele geografice reale, și se sprijină pe sursele citate.',
    'a fost poziționat pe coordonatele geografice reale, verificate pe grile de calibrare suprapuse peste hartă, și se sprijină pe sursele citate.');

rep('    <h3>Standarde respectate</h3>',
`    <h3>Cum a fost realizat proiectul</h3>
    <p>Proiectul a fost construit cu ajutorul unui asistent AI (Claude, Anthropic), folosit ca unealtă de programare și de redactare. Codul și cea mai mare parte a textelor au fost scrise cu ajutorul lui, la cererea și sub coordonarea autorului.</p>
    <ul>
      <li><strong>Autorul</strong> a ales tema și a stabilit cerințele: conținut strict despre migrația hunilor și societatea lor, rigoare istorică, cele cinci module și paleta de culori. A testat fiecare modul, a semnalat ce nu funcționa sau nu arăta bine și a decis ce rămâne în proiect — de exemplu, a scos o campanie întreagă din joc fiindcă ieșea din temă.</li>
      <li><strong>Asistentul AI</strong> a scris codul (HTML, CSS, JavaScript și scripturile de asamblare), a redactat textele pe baza surselor citate în note și a generat imaginile de atmosferă.</li>
      <li><strong>Verificarea</strong>: datele, citatele și atribuirile au fost confruntate cu izvoarele și cu lucrările din bibliografie. Afirmațiile disputate sunt marcate ca atare în text, iar citatele care nu puteau fi verificate au fost eliminate.</li>
    </ul>
    <p>Istoricul complet al modificărilor, pas cu pas, se poate consulta în depozitul public al proiectului.</p>

    <h3>Standarde respectate</h3>`);

fs.writeFileSync(FILE, s);
console.log('assemble.js: secțiunea „Cum a fost realizat proiectul”');
