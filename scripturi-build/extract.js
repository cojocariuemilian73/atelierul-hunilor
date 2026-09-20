// Splits one of our single-file artifacts into: external <script src> tags (if any),
// the <style>...</style> body, the HTML between </style> and the inline <script>,
// and the inline <script>...</script> body. Writes each part to its own file.
const fs = require('fs');
const [,, inFile, outPrefix] = process.argv;
const src = fs.readFileSync(inFile, 'utf8');

const styleStart = src.indexOf('<style>');
const styleEnd = src.indexOf('</style>');
const preStyle = src.slice(0, styleStart); // title + any leading <script src=...></script>
const cssText = src.slice(styleStart + '<style>'.length, styleEnd);

const afterStyle = src.slice(styleEnd + '</style>'.length);
const scriptStart = afterStyle.indexOf('<script>');
const scriptEnd = afterStyle.lastIndexOf('</script>');
const bodyHtml = afterStyle.slice(0, scriptStart);
const jsText = afterStyle.slice(scriptStart + '<script>'.length, scriptEnd);

const extScripts = [...preStyle.matchAll(/<script[^>]*src="[^"]+"[^>]*><\/script>/g)].map(m => m[0]);

fs.writeFileSync(outPrefix + '.css', cssText);
fs.writeFileSync(outPrefix + '.body.html', bodyHtml);
fs.writeFileSync(outPrefix + '.js', jsText);
fs.writeFileSync(outPrefix + '.extscripts.txt', extScripts.join('\n'));
console.log(outPrefix, 'css:', cssText.length, 'body:', bodyHtml.length, 'js:', jsText.length, 'extScripts:', extScripts.length);
