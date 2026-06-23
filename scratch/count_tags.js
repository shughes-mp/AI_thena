const fs = require('fs');
const path = require('path');

const filePath = 'src/app/instructor/[sessionId]/analysis/page.tsx';
const content = fs.readFileSync(filePath, 'utf8');

console.log('File length:', content.length);
console.log('Braces {:', (content.match(/\{/g) || []).length);
console.log('Braces }:', (content.match(/\}/g) || []).length);
console.log('Parens (:', (content.match(/\(/g) || []).length);
console.log('Parens ):', (content.match(/\)/g) || []).length);
console.log('Frag <>:', (content.match(/<>/g) || []).length);
console.log('Frag </>:', (content.match(/<\/>/g) || []).length);
console.log('Div <div>:', (content.match(/<div/g) || []).length);
console.log('Div </div>:', (content.match(/<\/div>/g) || []).length);
