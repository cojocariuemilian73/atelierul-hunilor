// Scopes a CSS stylesheet under an ancestor class, handling :root vars,
// @media blocks, and leaving @keyframes untouched. Hand-rolled brace walker
// (not a full parser) tailored to the hand-written stylesheets in this project.
const fs = require('fs');

const [,, inFile, outFile, scopeClass] = process.argv;
const css = fs.readFileSync(inFile, 'utf8');

function scopeSelectorList(selText) {
  return selText.split(',').map(s => {
    let sel = s.trim();
    if (sel === '') return sel;

    // Exact-root forms (the vast majority of cases).
    if (sel === ':root') return '.' + scopeClass;
    if (sel === ':root:not([data-theme="light"])') return 'html:not([data-theme="light"]) .' + scopeClass;
    if (sel === ':root[data-theme="dark"]') return 'html[data-theme="dark"] .' + scopeClass;

    // Compound forms with a trailing descendant part, e.g.
    // `:root[data-theme="dark"] .river` or `:root:not([data-theme="light"]) .foo`.
    const rootNotPrefix = ':root:not([data-theme="light"])';
    const rootDarkPrefix = ':root[data-theme="dark"]';
    if (sel.startsWith(rootNotPrefix + ' ')) {
      return 'html:not([data-theme="light"]) .' + scopeClass + sel.slice(rootNotPrefix.length);
    }
    if (sel.startsWith(rootDarkPrefix + ' ')) {
      return 'html[data-theme="dark"] .' + scopeClass + sel.slice(rootDarkPrefix.length);
    }
    if (sel.startsWith(':root ')) {
      return '.' + scopeClass + sel.slice(':root'.length);
    }

    if (sel === 'body') return '.' + scopeClass;
    if (sel === 'html') return '.' + scopeClass; // shouldn't normally occur besides scroll-behavior; harmless fallback
    if (sel.startsWith('.' + scopeClass)) return sel; // already scoped (defensive)
    if (sel === '*') return '.' + scopeClass + ' *';
    if (sel.startsWith('::')) return '.' + scopeClass + ' ' + sel; // ::selection etc
    return '.' + scopeClass + ' ' + sel;
  }).join(', ');
}

// Walk top-level (and recursively @media) blocks by brace depth.
function transform(text) {
  let out = '';
  let i = 0;
  const n = text.length;
  while (i < n) {
    // skip comments
    if (text[i] === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      const stop = end === -1 ? n : end + 2;
      out += text.slice(i, stop);
      i = stop;
      continue;
    }
    // find next '{' to isolate a selector
    const braceIdx = text.indexOf('{', i);
    if (braceIdx === -1) { out += text.slice(i); break; }
    // a statement-terminated at-rule (e.g. `@import url(...);`) has no braces of
    // its own — if a ';' appears before the next '{', flush up to and including it.
    const semiIdx = text.indexOf(';', i);
    if (semiIdx !== -1 && semiIdx < braceIdx) {
      out += text.slice(i, semiIdx + 1);
      i = semiIdx + 1;
      continue;
    }
    const selector = text.slice(i, braceIdx);
    // find matching closing brace by depth
    let depth = 1;
    let j = braceIdx + 1;
    while (j < n && depth > 0) {
      if (text[j] === '{') depth++;
      else if (text[j] === '}') depth--;
      j++;
    }
    const body = text.slice(braceIdx + 1, j - 1);
    const trimmedSel = selector.trim();

    if (trimmedSel.startsWith('@keyframes')) {
      out += selector + '{' + body + '}';
    } else if (trimmedSel.startsWith('@media')) {
      out += selector + '{' + transform(body) + '}';
    } else if (trimmedSel.startsWith('@')) {
      // @import, @font-face, etc: leave untouched
      out += selector + '{' + body + '}';
    } else {
      out += scopeSelectorList(selector) + '{' + body + '}';
    }
    i = j;
  }
  return out;
}

fs.writeFileSync(outFile, transform(css));
console.log('scoped', inFile, '->', outFile, 'as .' + scopeClass);
