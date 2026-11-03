import fs from 'fs';
import path from 'path';

function findBareImports(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      findBareImports(full);
    } else if (f.name.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const m = line.match(/(?:import|export)\s+.*?\s+from\s+['"]([^'"]+)['"]/);
        if (m) {
          const spec = m[1];
          if (!spec.startsWith('.') && !spec.startsWith('/')) {
            console.log(`[BARE SPECIFIER] ${full}:${idx + 1} => from '${spec}'`);
          }
        }
      });
    }
  }
}

console.log('Searching for bare imports in public/js...');
findBareImports(path.resolve('public/js'));
console.log('Done.');
