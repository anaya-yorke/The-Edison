#!/usr/bin/env node

/**
 * The Edison Code Organization Agent
 * 
 * This script analyzes the codebase and reorganizes files according to best practices.
 * It creates a more maintainable file structure by:
 * 1. Grouping related components
 * 2. Applying consistent naming conventions
 * 3. Ensuring proper directory structure
 * 4. Separating concerns (UI, logic, types, etc.)
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const CATEGORIES = {
  components: ['*.tsx', '!**/pages/**'],
  pages: ['pages/**/*.tsx'],
  hooks: ['hooks/**/*.ts', '**/use*.ts', '**/use*.tsx'],
  utils: ['utils/**/*.ts', '**/*.util.ts', '**/*Utils.ts'],
  types: ['types/**/*.ts', '**/*.types.ts', '**/*.d.ts'],
  styles: ['**/*.css', '**/*.scss', '**/*.module.css', '**/*.module.scss'],
  assets: ['assets/**/*'],
  contexts: ['**/context/**/*.ts', '**/context/**/*.tsx', '**/*Context.ts', '**/*Context.tsx'],
  services: ['services/**/*.ts', '**/*.service.ts'],
  constants: ['constants/**/*.ts', '**/constants.ts', '**/*.constants.ts'],
};

// Create directories if they don't exist
function ensureDirectoryExists(dir) {
  const fullPath = path.join(SRC_DIR, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${fullPath}`);
  }
}

// Find files that belong to a specific category
function findFilesByCategory(category, patterns) {
  const files = [];
  patterns.forEach(pattern => {
    const matches = glob.sync(pattern, { cwd: SRC_DIR });
    files.push(...matches);
  });
  return [...new Set(files)]; // Remove duplicates
}

// Analyze imports to determine dependencies
function analyzeImports(filePath) {
  const fullPath = path.join(SRC_DIR, filePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const importRegex = /import\s+?(?:(?:{[^}]*})|(?:[^{}]*?))\s+?from\s+?['"]([^'"]*)['"]/g;
  
  const imports = [];
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  return imports;
}

// Generate an optimal path for a file based on its content and dependencies
function generateOptimalPath(filePath, content) {
  // Extract component name, hook name, etc.
  const filename = path.basename(filePath);
  const extension = path.extname(filePath);
  const nameWithoutExt = filename.replace(extension, '');
  
  // Determine file type and ideal location
  if (filePath.includes('/pages/')) {
    // Keep pages in their original location
    return filePath;
  } else if (nameWithoutExt.startsWith('use') && (extension === '.ts' || extension === '.tsx')) {
    return `hooks/${nameWithoutExt}${extension}`;
  } else if (extension === '.tsx' && !filePath.includes('/components/')) {
    return `components/${nameWithoutExt}/${nameWithoutExt}${extension}`;
  } else if (filePath.includes('.module.css') || filePath.includes('.module.scss')) {
    const styleName = nameWithoutExt.replace('.module', '');
    // Keep styles with their components if they're component styles
    if (fs.existsSync(path.join(SRC_DIR, `components/${styleName}/${styleName}.tsx`))) {
      return `components/${styleName}/${nameWithoutExt}${extension}`;
    } else {
      return `styles/${nameWithoutExt}${extension}`;
    }
  } else if (nameWithoutExt.includes('Context') && (extension === '.ts' || extension === '.tsx')) {
    return `contexts/${nameWithoutExt}${extension}`;
  } else if (nameWithoutExt.includes('Service') || nameWithoutExt.includes('Api') || nameWithoutExt.includes('Client')) {
    return `services/${nameWithoutExt}${extension}`;
  } else if (filePath.includes('.types.') || filePath.includes('.d.ts')) {
    return `types/${nameWithoutExt}${extension}`;
  } else if (nameWithoutExt.includes('Utils') || nameWithoutExt.includes('Util') || filePath.includes('/utils/')) {
    return `utils/${nameWithoutExt}${extension}`;
  } else if (nameWithoutExt.includes('Constants') || nameWithoutExt === 'constants') {
    return `constants/${nameWithoutExt}${extension}`;
  }
  
  // Default: leave in current location
  return filePath;
}

// Update imports in all files after reorganizing
function updateImportsInFile(filePath, oldToNewPathMap) {
  const fullPath = path.join(SRC_DIR, filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  Object.entries(oldToNewPathMap).forEach(([oldPath, newPath]) => {
    const oldImport = oldPath.replace(/(\.ts|\.tsx|\.js|\.jsx)$/, '');
    const newImport = newPath.replace(/(\.ts|\.tsx|\.js|\.jsx)$/, '');
    
    // Handle different import patterns
    const importPatterns = [
      // Regular imports
      new RegExp(`from\\s+['"]([\\./]*)${oldImport}['"]`, 'g'),
      // Alias imports (assuming some common Next.js alias patterns)
      new RegExp(`from\\s+['"]@/[\\w-]+/${path.basename(oldImport)}['"]`, 'g')
    ];
    
    importPatterns.forEach(pattern => {
      content = content.replace(pattern, (match) => {
        const relativePath = path.relative(
          path.dirname(fullPath),
          path.join(SRC_DIR, newImport)
        ).replace(/\\/g, '/');
        
        // Ensure we have a proper relative path
        const prefix = relativePath.startsWith('.') ? '' : './';
        return `from "${prefix}${relativePath}"`;
      });
    });
  });
  
  fs.writeFileSync(fullPath, content, 'utf8');
}

// Move a file to its new location
function moveFile(oldPath, newPath) {
  const oldFullPath = path.join(SRC_DIR, oldPath);
  const newFullPath = path.join(SRC_DIR, newPath);
  
  // Create the directory if it doesn't exist
  const newDir = path.dirname(newFullPath);
  if (!fs.existsSync(newDir)) {
    fs.mkdirSync(newDir, { recursive: true });
  }
  
  // Move the file
  fs.renameSync(oldFullPath, newFullPath);
  console.log(`Moved: ${oldPath} -> ${newPath}`);
  
  // Clean up empty directories
  const oldDir = path.dirname(oldFullPath);
  if (fs.existsSync(oldDir) && fs.readdirSync(oldDir).length === 0) {
    fs.rmdirSync(oldDir);
    console.log(`Removed empty directory: ${oldDir}`);
  }
}

// Main function
async function main() {
  console.log('Starting code organization...');
  
  // Ensure all necessary directories exist
  Object.keys(CATEGORIES).forEach(ensureDirectoryExists);
  
  // Gather all files and their optimal locations
  const oldToNewPathMap = {};
  
  // Scan all source files
  const allFiles = glob.sync('**/*.{ts,tsx,js,jsx,css,scss}', { cwd: SRC_DIR });
  console.log(`Found ${allFiles.length} files to analyze`);
  
  // Determine optimal location for each file
  allFiles.forEach(filePath => {
    const fullPath = path.join(SRC_DIR, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    const optimalPath = generateOptimalPath(filePath, content);
    
    if (optimalPath !== filePath) {
      oldToNewPathMap[filePath] = optimalPath;
    }
  });
  
  console.log(`Reorganizing ${Object.keys(oldToNewPathMap).length} files`);
  
  // Move all files to their new locations
  Object.entries(oldToNewPathMap).forEach(([oldPath, newPath]) => {
    moveFile(oldPath, newPath);
  });
  
  // Update imports in all files
  console.log('Updating imports...');
  const updatedFiles = glob.sync('**/*.{ts,tsx,js,jsx}', { cwd: SRC_DIR });
  updatedFiles.forEach(filePath => {
    updateImportsInFile(filePath, oldToNewPathMap);
  });
  
  console.log('Code organization complete!');
}

// Run the script
main().catch(error => {
  console.error('Error during code organization:', error);
  process.exit(1);
}); 