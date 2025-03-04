#!/usr/bin/env node

/**
 * Unused File Detector
 * 
 * This script analyzes the project to identify files that are not imported 
 * or referenced anywhere in the codebase and are candidates for removal.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const IGNORED_PATTERNS = [
  '**/node_modules/**',
  '**/.git/**',
  '**/build/**',
  '**/dist/**',
  '**/.next/**',
  '**/out/**',
  '**/_next/**',
  '**/public/**',
  '**/pages/**/*.tsx', // Skip Next.js pages as they're loaded by convention
  '**/api/**/*.ts',    // Skip API routes
  '**/tests/**',       // Skip test files
  '**/__tests__/**',
  '**/*.test.*',
  '**/*.spec.*',
  '**/jest.*',
  '**/next-env.d.ts',
  '**/next.config.js',
  '**/package.json',
  '**/tsconfig.json',
  '**/.eslintrc.*',
  '**/jest.config.*',
  '**/tailwind.config.*',
  '**/postcss.config.*',
  '**/stylelint.config.*',
  '**/babel.config.*',
  '**/.prettierrc*',
  '**/.env*',
  '**/*.md',
  '**/README*',
  '**/LICENSE*',
  '**/*.ico',
  '**/*.svg',
  '**/*.png',
  '**/*.jpg',
  '**/*.jpeg',
  '**/*.gif',
  '**/*.webp',
  '**/*.ttf',
  '**/*.woff',
  '**/*.woff2',
  '**/*.eot',
  '**/*.otf',
];

// Find all source files
function findAllSourceFiles() {
  const files = glob.sync('**/*.{ts,tsx,js,jsx,css,scss,html}', {
    cwd: PROJECT_ROOT,
    ignore: IGNORED_PATTERNS,
  });
  
  return files.filter(file => {
    try {
      const stats = fs.statSync(path.join(PROJECT_ROOT, file));
      return stats.isFile();
    } catch (e) {
      return false;
    }
  });
}

// Find all imports in the code
function findAllImports(files) {
  const imports = new Set();
  const importRegex = /import\s+?(?:(?:{[^}]*})|(?:[^{}]*?))\s+?from\s+?['"]([^'"]*)['"]/g;
  const requireRegex = /require\(\s*['"]([^'"]*)['"]\s*\)/g;
  const cssImportRegex = /@import\s+['"]([^'"]*)['"]/g;
  const urlRegex = /url\(\s*['"]?([^'")]*)['"]\)/g;
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(PROJECT_ROOT, file), 'utf8');
      
      // Find ES6 imports
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        imports.add(match[1]);
      }
      
      // Find require statements
      while ((match = requireRegex.exec(content)) !== null) {
        imports.add(match[1]);
      }
      
      // Find CSS imports
      while ((match = cssImportRegex.exec(content)) !== null) {
        imports.add(match[1]);
      }
      
      // Find URL references
      while ((match = urlRegex.exec(content)) !== null) {
        imports.add(match[1]);
      }
    } catch (e) {
      console.error(`Error reading file ${file}:`, e.message);
    }
  });
  
  return imports;
}

// Resolve all imports to actual files
function resolveImportsToFiles(imports, files) {
  const resolvedImports = new Set();
  
  imports.forEach(importPath => {
    // Handle relative imports
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      // We can't easily resolve all relative paths without knowing the source file,
      // but we can flag files that might match the pattern
      const basename = path.basename(importPath);
      files.forEach(file => {
        if (file.includes(basename)) {
          resolvedImports.add(file);
        }
      });
    } 
    // Handle absolute imports and aliases
    else if (importPath.startsWith('@/') || importPath.startsWith('~/')) {
      const basePath = importPath.replace(/^[@~]\//, '');
      files.forEach(file => {
        if (file.includes(basePath)) {
          resolvedImports.add(file);
        }
      });
    }
    // Handle package imports
    else if (!importPath.startsWith('/')) {
      // These are npm packages, not local files
    }
    // Handle absolute paths
    else {
      // Unlikely in most projects but handle anyway
      const absolutePath = path.relative(PROJECT_ROOT, importPath);
      resolvedImports.add(absolutePath);
    }
  });
  
  return resolvedImports;
}

// Check if a file is used
function isFileReferenced(file, referencedFiles) {
  // Check if the file itself is referenced
  if (referencedFiles.has(file)) {
    return true;
  }
  
  // Check if any similar patterns match
  // This is a heuristic approach to catch some common patterns
  const fileWithoutExt = file.replace(/\.[^.]+$/, '');
  const fileBasename = path.basename(fileWithoutExt);
  
  for (const referenced of referencedFiles) {
    if (referenced.includes(fileBasename)) {
      return true;
    }
  }
  
  return false;
}

// Main function
async function main() {
  console.log('Starting unused file detection...');
  
  // Find all source files
  const allFiles = findAllSourceFiles();
  console.log(`Found ${allFiles.length} source files to analyze`);
  
  // Find all imports
  const allImports = findAllImports(allFiles);
  console.log(`Found ${allImports.size} import statements`);
  
  // Resolve imports to files
  const referencedFiles = resolveImportsToFiles(allImports, allFiles);
  console.log(`Resolved to ${referencedFiles.size} referenced files`);
  
  // Find unused files
  const unusedFiles = allFiles.filter(file => !isFileReferenced(file, referencedFiles));
  
  // Special handling for entry files and configuration files
  const definitelyUnused = unusedFiles.filter(file => {
    // Skip index.* files as they might be entry points
    if (path.basename(file).startsWith('index.')) {
      return false;
    }
    
    // Skip known entry points and config files
    if ([
      'src/index.ts',
      'src/main.ts',
      'src/App.tsx',
      'src/app.tsx',
      'src/index.tsx',
      'src/index.js',
      'src/main.js',
      'next.config.js',
      'webpack.config.js'
    ].includes(file)) {
      return false;
    }
    
    return true;
  });
  
  console.log(`Found ${definitelyUnused.length} potentially unused files`);
  
  // Write the results to a file
  const outputPath = path.join(PROJECT_ROOT, '.github/unused-files.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    unusedFiles: definitelyUnused,
    timestamp: new Date().toISOString(),
    totalFiles: allFiles.length,
    totalUnused: definitelyUnused.length,
  }, null, 2));
  
  console.log(`Unused file detection complete. Results saved to ${outputPath}`);
}

// Run the script
main().catch(error => {
  console.error('Error during unused file detection:', error);
  process.exit(1);
}); 