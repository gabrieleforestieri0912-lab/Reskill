const fs = require('fs');
const path = require('path');

const debug = (msg) => {
  console.log('POSTINSTALL:', msg);
  try {
    fs.writeFileSync(path.join(__dirname, '.postinstall-debug'), new Date().toISOString() + ': ' + msg);
  } catch(e) {}
};

debug('postinstall started');

// Patch next-auth files to use next/server.js instead of next/server
const nextauthDir = path.join(__dirname, 'node_modules', 'next-auth');
try {
  if (fs.existsSync(nextauthDir)) {
    debug('next-auth dir found');
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
            debug('patched: ' + fullPath);
          }
        }
      }
    }
    walkDir(nextauthDir);
    debug('next-auth patching complete');
  } else {
    debug('next-auth dir NOT found at: ' + nextauthDir);
  }
} catch (e) {
  debug('failed to patch next-auth: ' + e.message);
}

debug('postinstall finished');