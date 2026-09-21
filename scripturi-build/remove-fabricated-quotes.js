// Removes invented "quotes" from the two games. The site put paraphrases and
// didactic commentary inside quotation marks with pseudo-authors such as
// "interpretare istorico-didactică" or "sinteză istoriografică modernă" —
// which reads, to a history jury, as fabricated evidence. Only quotes that
// come from an actual ancient source are kept, and those get a real citation.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// Authors that correspond to a genuine ancient source and must be preserved.
const REAL_SOURCES = [
  'Priscus din Panium',
  'Ammianus Marcellinus',
  'Iordanes',
  'Jordanes',
  'Attila, redat de solul roman Constantiolus'
];

function isReal(author){
  return REAL_SOURCES.some(function(s){ return author.indexOf(s) !== -1; });
}

function stripQuotes(file){
  let src = fs.readFileSync(file, 'utf8');
  let removed = 0;

  // Matches a whole `quote: { text: '…', author: '…', src: '…' }` literal.
  src = src.replace(
    /quote:\s*\{\s*text:\s*'((?:[^'\\]|\\.)*)',\s*author:\s*'((?:[^'\\]|\\.)*)',\s*src:\s*'((?:[^'\\]|\\.)*)'\s*\}/g,
    function(full, text, author, srcRef){
      if (isReal(author)) return full;
      removed++;
      return 'quote: null';
    }
  );

  fs.writeFileSync(file, src);
  console.log(path.basename(file) + ': removed ' + removed + ' fabricated quote(s)');
}

stripQuotes(path.join(ROOT, 'build', 'embassy.js'));
stripQuotes(path.join(ROOT, 'build', 'atlas.js'));
