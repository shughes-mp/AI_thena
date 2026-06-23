const fs = require('fs');
const filePath = 'src/app/instructor/[sessionId]/analysis/page.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

function count(start, end) {
    const sub = lines.slice(start - 1, end).join('\n');
    return {
        braces: (sub.match(/\{/g) || []).length - (sub.match(/\}/g) || []).length,
        parens: (sub.match(/\(/g) || []).length - (sub.match(/\)/g) || []).length,
        frags: (sub.match(/<>/g) || []).length - (sub.match(/<\/>/g) || []).length,
        divs: (sub.match(/<div/g) || []).length - (sub.match(/<\/div>/g) || []).length
    };
}

console.log('Header (1-765):', count(1, 765));
console.log('Live (766-860):', count(766, 860));
console.log('Quick (861-902):', count(861, 902));
console.log('Brief (903-1478):', count(903, 1478));
console.log('Students (1479-1626):', count(1479, 1626));
