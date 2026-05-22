const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('src/app/pages');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    content = content.replace(/getDisplayNameForEmail\(\s*user\?\.email\s*,\s*('[^']+'|"[^"]+")\s*\)/g, '(user?.name || $1)');
    content = content.replace(/getDisplayNameForEmail\(\s*user\?\.email\s*,\s*user\?\.name\s*\|\|\s*('[^']+'|"[^"]+")\s*\)/g, '(user?.name || $1)');
    content = content.replace(/getDisplayNameForEmail\(\s*user\?\.email\s*,\s*readStoredValue\('[^']+',\s*sampleDisplayName\)\)/g, '(user?.name || sampleDisplayName)');

    content = content.replace(/import\s*\{\s*getDisplayNameForEmail\s*\}\s*from\s*'[^']+';?\r?\n?/g, '');

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
    }
});
