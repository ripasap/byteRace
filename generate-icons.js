const fs = require('fs');

function convert(name, inPath, outPath) {
    let svg = fs.readFileSync(inPath, 'utf8');
    // Remove xml declaration
    svg = svg.replace(/<\?xml.*?\?>/g, '').trim();
    // Replace opening <svg ...> with our react version
    svg = svg.replace(/<svg[^>]*>/, '<svg viewBox="0 0 512 512" width="1em" height="1em" {...props}>');
    // wrap
    const comp = `import React from 'react';\n\nconst ${name}: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (\n${svg}\n);\nexport default ${name};\n`;
    fs.writeFileSync(outPath, comp);
    console.log(`Created ${outPath}`);
}

convert('DeleteIcon', 'c:/Users/tommy/Downloads/coderace-main/src/app/icons/delete.svg', 'c:/Users/tommy/Downloads/coderace-main/src/app/icons/DeleteIcon.tsx');
convert('StopWatchIcon', 'c:/Users/tommy/Downloads/coderace-main/src/app/icons/stop-watch.svg', 'c:/Users/tommy/Downloads/coderace-main/src/app/icons/StopWatchIcon.tsx');
