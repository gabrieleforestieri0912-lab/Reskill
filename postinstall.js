const fs = require('fs');
const path = require('path');

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