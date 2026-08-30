const fs = require('fs');
const path = require('path');

// Patch next/package.json to add exports field for next/server
const nextPkgPath = path.join(__dirname, 'node_modules', 'next', 'package.json');
if (fs.existsSync(nextPkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(nextPkgPath, 'utf8'));
  if (!pkg.exports || !pkg.exports['./server']) {
    pkg.exports = pkg.exports || {};
    pkg.exports['./server'] = './server.js';
    fs.writeFileSync(nextPkgPath, JSON.stringify(pkg, null, 2));
    console.log('Postinstall: patched next/package.json exports');
  }
}

// Patch next-auth files to use next/server.js instead of next/server
const nextauthDir = path.join(__dirname, 'node_modules', 'next-auth');
if (fs.existsSync(nextauthDir)) {
  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.name.endsWith('.js')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        const newContent = content.replace(/from "next\/server"/g, 'from "next/server.js"');
        if (newContent !== content) {
          fs.writeFileSync(fullPath, newContent);
          console.log('Postinstall: patched', fullPath);
        }
      }
    }
  }
  walkDir(nextauthDir);
}