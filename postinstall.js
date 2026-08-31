const fs = require('fs');
const path = require('path');

const root = path.join(__dirname);
const nextauthDir = path.join(root, 'node_modules', 'next-auth');

try {
  if (!fs.existsSync(nextauthDir)) {
    console.log('POSTINSTALL: next-auth dir not found, skipping');
    process.exit(0);
  }

  let patched = 0;
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
          patched++;
        }
      }
    }
  }
  walkDir(nextauthDir);
  console.log('POSTINSTALL: patched ' + patched + ' next-auth file(s)');
} catch (e) {
  console.error('POSTINSTALL error:', e.message);
}
