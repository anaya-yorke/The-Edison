#!/usr/bin/env node

/**
 * Auto Cleanup Script
 * 
 * This script performs automated cleanup of the codebase:
 * 1. Removes unused files (based on unused-file-detector.js results)
 * 2. Cleans up empty directories
 * 3. Removes duplicate files
 * 4. Removes deprecated code comments
 * 5. Removes console.log statements in production code
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const UNUSED_FILES_PATH = path.join(PROJECT_ROOT, '.github/unused-files.json');
const BACKUP_DIR = path.join(PROJECT_ROOT, '.backup-before-cleanup');

// Safety thresholds
const MAX_DELETE_PERCENTAGE = 10; // Don't delete more than 10% of files without confirmation
const MAX_DELETE_COUNT = 10;     // Don't delete more than 10 files without confirmation
const SAFETY_MODE = process.env.SAFETY_MODE || 'safe'; // 'safe', 'moderate', or 'aggressive'

// Ensure the backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Backup a file before deleting it
function backupFile(filePath) {
  const relativePath = path.relative(PROJECT_ROOT, filePath);
  const backupPath = path.join(BACKUP_DIR, relativePath);
  const backupDir = path.dirname(backupPath);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  fs.copyFileSync(filePath, backupPath);
  console.log(`Backed up: ${relativePath}`);
}

// Remove an unused file
function removeFile(filePath) {
  const relativePath = path.relative(PROJECT_ROOT, filePath);
  
  try {
    // Backup the file first
    backupFile(filePath);
    
    // Delete the file
    fs.unlinkSync(filePath);
    console.log(`Deleted: ${relativePath}`);
    return true;
  } catch (e) {
    console.error(`Error deleting ${relativePath}: ${e.message}`);
    return false;
  }
}

// Clean up empty directories
function cleanEmptyDirs(directory) {
  const files = fs.readdirSync(directory);
  
  if (files.length === 0) {
    // This directory is empty, remove it
    try {
      fs.rmdirSync(directory);
      console.log(`Removed empty directory: ${path.relative(PROJECT_ROOT, directory)}`);
      return true;
    } catch (e) {
      console.error(`Error removing directory ${directory}: ${e.message}`);
      return false;
    }
  } else {
    // Check subdirectories
    let empty = true;
    let removedAny = false;
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        const removed = cleanEmptyDirs(filePath);
        removedAny = removedAny || removed;
        
        // Check if the directory still exists after attempting cleanup
        if (fs.existsSync(filePath)) {
          empty = false;
        }
      } else {
        empty = false;
      }
    }
    
    // If this directory is now empty after cleaning subdirectories, remove it
    if (empty) {
      try {
        fs.rmdirSync(directory);
        console.log(`Removed empty directory: ${path.relative(PROJECT_ROOT, directory)}`);
        return true;
      } catch (e) {
        console.error(`Error removing directory ${directory}: ${e.message}`);
        return false;
      }
    }
    
    return removedAny;
  }
}

// Remove console.log statements from production code
function removeConsoleStatements(filePath) {
  if (!filePath.match(/\.(js|jsx|ts|tsx)$/)) {
    return false;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace console statements
    const consoleRegex = /(console\.log|console\.debug|console\.info)\s*\([\s\S]*?\);?/g;
    content = content.replace(consoleRegex, (match) => {
      // Keep comments for what was removed in dev mode only
      return SAFETY_MODE === 'aggressive' ? '' : `/* ${match.trim()} */`;
    });
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Removed console statements from: ${path.relative(PROJECT_ROOT, filePath)}`);
      return true;
    }
    
    return false;
  } catch (e) {
    console.error(`Error processing ${filePath}: ${e.message}`);
    return false;
  }
}

// Remove deprecation comments and old code
function cleanupDeprecatedCode(filePath) {
  if (!filePath.match(/\.(js|jsx|ts|tsx|css|scss)$/)) {
    return false;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace deprecation comments and commented code blocks
    const patterns = [
      // Deprecated comments
      /\/\/ DEPRECATED:[\s\S]*?\n/g,
      /\/\/ TODO: Remove[\s\S]*?\n/g,
      /\/\*\s*DEPRECATED[\s\S]*?\*\//g,
      
      // Old IE conditional comments in CSS
      /\/\*\s*IE[\d\s]*?conditional[\s\S]*?\*\//gi,
      
      // Commented out code blocks (only in aggressive mode)
      ...(SAFETY_MODE === 'aggressive' ? [/\/\*[\s\S]*?\*\//g, /\/\/[^\n]*\n/g] : []),
    ];
    
    for (const pattern of patterns) {
      content = content.replace(pattern, '');
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Cleaned deprecated code from: ${path.relative(PROJECT_ROOT, filePath)}`);
      return true;
    }
    
    return false;
  } catch (e) {
    console.error(`Error processing ${filePath}: ${e.message}`);
    return false;
  }
}

// Find duplicate files based on content hash
function findDuplicateFiles() {
  const files = glob.sync('**/*.{js,jsx,ts,tsx,css,scss}', {
    cwd: SRC_DIR,
    ignore: ['**/node_modules/**', '**/.git/**'],
  });
  
  const contentMap = new Map();
  const duplicates = [];
  
  files.forEach(file => {
    const fullPath = path.join(SRC_DIR, file);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const hash = require('crypto').createHash('md5').update(content).digest('hex');
      
      if (contentMap.has(hash)) {
        duplicates.push({
          original: contentMap.get(hash),
          duplicate: file,
        });
      } else {
        contentMap.set(hash, file);
      }
    } catch (e) {
      console.error(`Error reading ${file}: ${e.message}`);
    }
  });
  
  return duplicates;
}

// Main function
async function main() {
  console.log(`Starting auto-cleanup in ${SAFETY_MODE} mode...`);
  
  // Create a cleanup report
  const report = {
    timestamp: new Date().toISOString(),
    filesRemoved: [],
    consoleStatementsRemoved: 0,
    deprecationCommentsRemoved: 0,
    emptyDirectoriesRemoved: 0,
    duplicatesRemoved: [],
  };
  
  // 1. Remove unused files
  if (fs.existsSync(UNUSED_FILES_PATH)) {
    const unusedFilesData = JSON.parse(fs.readFileSync(UNUSED_FILES_PATH, 'utf8'));
    const unusedFiles = unusedFilesData.unusedFiles || [];
    
    console.log(`Found ${unusedFiles.length} unused files to analyze`);
    
    // Safety check
    if (unusedFiles.length > MAX_DELETE_COUNT || 
        (unusedFiles.length / unusedFilesData.totalFiles) * 100 > MAX_DELETE_PERCENTAGE) {
      console.log(`Safety threshold exceeded. Would delete ${unusedFiles.length} files.`);
      
      if (SAFETY_MODE !== 'aggressive') {
        console.log('Skipping mass file deletion. Set SAFETY_MODE=aggressive to override.');
        // Only delete a few files for safety
        const limitedFiles = unusedFiles.slice(0, MAX_DELETE_COUNT);
        console.log(`Deleting only ${limitedFiles.length} files...`);
        
        limitedFiles.forEach(file => {
          const fullPath = path.join(PROJECT_ROOT, file);
          if (fs.existsSync(fullPath)) {
            if (removeFile(fullPath)) {
              report.filesRemoved.push(file);
            }
          }
        });
      } else {
        console.log('AGGRESSIVE mode enabled. Proceeding with all deletions.');
        unusedFiles.forEach(file => {
          const fullPath = path.join(PROJECT_ROOT, file);
          if (fs.existsSync(fullPath)) {
            if (removeFile(fullPath)) {
              report.filesRemoved.push(file);
            }
          }
        });
      }
    } else {
      // Safe to delete all
      unusedFiles.forEach(file => {
        const fullPath = path.join(PROJECT_ROOT, file);
        if (fs.existsSync(fullPath)) {
          if (removeFile(fullPath)) {
            report.filesRemoved.push(file);
          }
        }
      });
    }
    
    console.log(`Removed ${report.filesRemoved.length} unused files`);
  } else {
    console.log('No unused files data found. Run unused-file-detector.js first.');
  }
  
  // 2. Remove duplicate files
  const duplicates = findDuplicateFiles();
  console.log(`Found ${duplicates.length} duplicate files`);
  
  duplicates.forEach(({ original, duplicate }) => {
    const fullPath = path.join(SRC_DIR, duplicate);
    if (removeFile(fullPath)) {
      report.duplicatesRemoved.push({
        duplicate,
        original,
      });
    }
  });
  
  // 3. Clean up production code
  const sourceFiles = glob.sync('**/*.{js,jsx,ts,tsx,css,scss}', {
    cwd: SRC_DIR,
    ignore: ['**/node_modules/**', '**/.git/**', '**/tests/**', '**/__tests__/**', '**/*.test.*', '**/*.spec.*'],
  });
  
  console.log(`Scanning ${sourceFiles.length} source files for cleanup...`);
  
  sourceFiles.forEach(file => {
    const fullPath = path.join(SRC_DIR, file);
    
    // Remove console.log statements
    if (removeConsoleStatements(fullPath)) {
      report.consoleStatementsRemoved++;
    }
    
    // Clean up deprecated code
    if (cleanupDeprecatedCode(fullPath)) {
      report.deprecationCommentsRemoved++;
    }
  });
  
  // 4. Clean up empty directories
  if (cleanEmptyDirs(SRC_DIR)) {
    report.emptyDirectoriesRemoved++;
  }
  
  // Save the report
  const reportPath = path.join(PROJECT_ROOT, '.github/cleanup-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Cleanup report saved to ${reportPath}`);
  
  // Success summary
  console.log('\nCleanup Summary:');
  console.log(`- Removed unused files: ${report.filesRemoved.length}`);
  console.log(`- Removed duplicate files: ${report.duplicatesRemoved.length}`);
  console.log(`- Removed console statements: ${report.consoleStatementsRemoved}`);
  console.log(`- Cleaned deprecated code: ${report.deprecationCommentsRemoved}`);
  console.log(`- Removed empty directories: ${report.emptyDirectoriesRemoved}`);
  
  console.log('\nAuto cleanup complete!');
}

// Run the script
main().catch(error => {
  console.error('Error during auto cleanup:', error);
  process.exit(1);
}); 