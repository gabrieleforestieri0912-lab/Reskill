const fs = require('fs');
const path = require('path');

const root = path.join(__dirname);

// 1) Patch next/package.json to add exports field for next/server
const nextPkgPath = path.join(root, 'node_modules', 'next', 'package.json');
try {
  if (fs.existsSync(nextPkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(nextPkgPath, 'utf8'));
    if (!pkg.exports) pkg.exports = {};
    if (!pkg.exports['./server']) {
      pkg.exports['./server'] = './server.js';
      fs.writeFileSync(nextPkgPath, JSON.stringify(pkg, null, 2));
      console.log('POSTINSTALL: patched next/package.json exports');
    }
  }
} catch (e) {
  console.error('POSTINSTALL: failed to patch next/package.json:', e.message);
}

// 2) Patch next-auth files to use next/server.js instead of next/server
const nextauthDir = path.join(root, 'node_modules', 'next-auth');
try {
  if (fs.existsSync(nextauthDir)) {
    let patched = false;
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
            patched = true;
          }
        }
      }
    }
    walkDir(nextauthDir);
    if (patched) console.log('POSTINSTALL: patched next-auth imports');
  }
} catch (e) {
  console.error('POSTINSTALL: failed to patch next-auth:', e.message);
}