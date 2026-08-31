const fs = require('fs');
const path = require('path');

const root = path.join(__dirname);
const nextauthDir = path.join(root, 'node_modules', 'next-auth');

try {
  if (!fs.existsSync(nextauthDir)) {
    console.log('POSTINSTALL: next-auth dir not found, skipping');
    process.exit(0);
  }

  // Add .js extension to any `next/<subpath>` ESM import so bundlers can
  // resolve it, since Next.js 16 package.json has no `exports` mapping.
  const re = /(from\s+["'])(next\/[^"']+)(["'])/g;

  let patched = 0;
  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.name.endsWith('.js')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        const newContent = content.replace(re, (match, p1, p2, p3) => {
          const ext = path.extname(p2);
          return p1 + (ext ? p2 : p2 + '.js') + p3;
        });
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
