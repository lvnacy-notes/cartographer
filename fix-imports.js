import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;
  
  // Fix all relative imports: add .js extension if not present and doesn't have any extension
  content = content.replace(/from ['"]([^'"]+)['"]/g, (match, importPath) => {
    // Skip node: modules
    if (importPath.startsWith('node:')) {
      return match;
    }
    // Skip if already has extension
    if (/\.(js|mjs|json|cjs|ts|tsx|jsx)$/.test(importPath)) {
      return match;
    }
    // Add .js extension for relative imports
    if (importPath.startsWith('.')) {
      return `from '${importPath}.js'`;
    }
    return match;
  });
  
  // Fix directory imports: convert ./queries.js to ./queries/index.js
  // But ONLY if the .js file doesn't exist (it's a directory export)
  content = content.replace(/from ['"](\.[^'"]+)\.js['"]/g, (match, dirPath) => {
    const resolvedPath = path.resolve(path.dirname(filePath), dirPath + '.js');
    // If the file doesn't exist, it's probably a directory needing /index.js
    if (!fs.existsSync(resolvedPath)) {
      return `from '${dirPath}/index.js'`;
    }
    return match;
  });
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  return false;
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  let fixed = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixed += walkDirectory(filePath);
    } else if (file.endsWith('.js')) {
      if (fixImportsInFile(filePath)) {
        fixed++;
      }
    }
  }
  return fixed;
}

const testBuildDir = path.join(__dirname, 'test-build');
if (fs.existsSync(testBuildDir)) {
  console.log('Fixing imports in test-build...');
  const fixed = walkDirectory(testBuildDir);
  console.log(`Fixed ${fixed} files`);
}


