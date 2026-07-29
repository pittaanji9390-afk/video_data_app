const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace mode
      content = content.replace(/mode:\s*'dark'/g, "mode: 'light'");
      
      // Replace background
      content = content.replace(/background:\s*\{\s*default:\s*'#0f172a',\s*paper:\s*'#1e293b',?\s*\}/g, "background: {\n      default: '#f8fafc',\n      paper: '#ffffff',\n    }");
      
      // Replace text colors
      content = content.replace(/text:\s*\{\s*primary:\s*'#f8fafc',\s*secondary:\s*'#94a3b8',?\s*\}/g, "text: {\n      primary: '#0f172a',\n      secondary: '#475569',\n    }");
      
      // Replace rgba borders, dividers, hovers
      content = content.replace(/rgba\(255,\s*255,\s*255,\s*(0\.\d+)\)/g, "rgba(0, 0, 0, $1)");
      
      fs.writeFileSync(fullPath, content);
      console.log('Updated:', fullPath);
    }
  }
}

processDir(path.join(__dirname, 'src'));
console.log('Done');
