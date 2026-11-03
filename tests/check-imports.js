import fs from 'fs';
import path from 'path';

function checkImports(filePath, visited = new Set()) {
  if (visited.has(filePath)) return;
  visited.add(filePath);

  const content = fs.readFileSync(filePath, 'utf-8');
  const importRegex = /(?:import|export)\s+.*?\s+from\s+['"](.*?)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    const resolved = path.resolve(path.dirname(filePath), importPath);
    if (!fs.existsSync(resolved)) {
      console.error(`[ERROR] Missing import: "${importPath}" in ${filePath}`);
    } else if (resolved.endsWith('.js')) {
      checkImports(resolved, visited);
    }
  }
}

console.log('Checking all frontend module imports starting from public/js/app.js...');
checkImports(path.resolve('public/js/app.js'));
console.log('Finished checking imports.');
