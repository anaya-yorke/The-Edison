#!/usr/bin/env node

/**
 * Bug Fixer
 * 
 * This script automatically fixes common bugs detected by bug-detector.js.
 * It reads the bug report and applies fixes for patterns that can be safely
 * auto-fixed without human intervention.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const BUG_REPORT_PATH = path.join(PROJECT_ROOT, '.github/bug-report.json');
const BACKUP_DIR = path.join(PROJECT_ROOT, '.github/backups');

// Safety settings
const SAFETY_MODE = process.env.SAFETY_MODE || 'safe'; // 'safe', 'moderate', 'aggressive'
const SAFETY_THRESHOLDS = {
  safe: {
    maxChangesPercent: 10, // Don't modify more than 10% of files
    maxFilesChanged: 5,    // Don't modify more than 5 files in safe mode
  },
  moderate: {
    maxChangesPercent: 25, // Don't modify more than 25% of files
    maxFilesChanged: 15,   // Don't modify more than 15 files in moderate mode
  },
  aggressive: {
    maxChangesPercent: 50, // Don't modify more than 50% of files
    maxFilesChanged: 50,   // Don't modify more than 50 files in aggressive mode
  },
};

// Configure which bug types we can fix based on safety mode
const FIXABLE_BUGS = {
  safe: [
    'missingAwait',
    'emptyPromiseCatch',
    'typeAssertion',
    'unreachableCode',
    'eslint-semicolon',
    'eslint-spacing',
    'eslint-no-unused-vars'
  ],
  moderate: [
    // Include all 'safe' bugs
    'missingAwait',
    'emptyPromiseCatch',
    'typeAssertion',
    'unreachableCode',
    'eslint-semicolon',
    'eslint-spacing',
    'eslint-no-unused-vars',
    // Plus these additional bugs
    'nonNullAssertion',
    'missingPropValidation',
    'eslint-quotes',
    'eslint-prefer-const'
  ],
  aggressive: [
    // Include all 'moderate' bugs
    'missingAwait',
    'emptyPromiseCatch',
    'typeAssertion',
    'unreachableCode',
    'eslint-semicolon',
    'eslint-spacing',
    'eslint-no-unused-vars',
    'nonNullAssertion',
    'missingPropValidation',
    'eslint-quotes',
    'eslint-prefer-const',
    // Plus these additional bugs
    'useStateWithoutDeps',
    'eventListenerLeak',
    'missingCleanup',
    'clientSideReferenceInSSR',
    'eslint-no-console'
  ],
};

// Helper functions
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function backupFile(filePath) {
  ensureBackupDir();
  const fileName = path.basename(filePath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `${fileName}.${timestamp}.bak`);
  
  try {
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  } catch (e) {
    console.error(`Failed to backup file ${filePath}:`, e.message);
    return null;
  }
}

function readBugReport() {
  try {
    if (!fs.existsSync(BUG_REPORT_PATH)) {
      console.error(`Bug report not found at ${BUG_REPORT_PATH}`);
      console.error(`Please run bug-detector.js first to generate a bug report.`);
      process.exit(1);
    }
    
    const reportData = fs.readFileSync(BUG_REPORT_PATH, 'utf8');
    return JSON.parse(reportData);
  } catch (e) {
    console.error(`Error reading bug report:`, e.message);
    process.exit(1);
  }
}

// Fix functions for specific bug types
const bugFixers = {
  // Add missing await to async function calls
  missingAwait: (content, issue) => {
    const lines = content.split('\n');
    const line = lines[issue.line - 1];
    
    // Extract the variable name from the async function call
    const match = line.match(/(?:const|let|var)\s+(\w+)\s*=\s*\basync\b/);
    if (match && match[1]) {
      const varName = match[1];
      
      // Find the next line that uses this variable (if any)
      for (let i = issue.line; i < lines.length; i++) {
        if (lines[i].includes(varName)) {
          // Add await before the variable
          lines[i] = lines[i].replace(
            new RegExp(`\\b${varName}\\b(?!\s*=)`, 'g'),
            `await ${varName}`
          );
          return lines.join('\n');
        }
      }
    }
    
    // If we can't safely fix it, return the original content
    return content;
  },
  
  // Fix empty catch blocks
  emptyPromiseCatch: (content, issue) => {
    return content.replace(
      /\.catch\s*\(\s*\(\s*(\w*)\s*\)\s*=>\s*\{\s*\}\s*\)/g,
      `.catch((${/(\w+)/.test("$1") ? "$1" : "error"}) => {
        console.error("Caught error:", $1);
      })`
    );
  },
  
  // Fix type assertions
  typeAssertion: (content, issue) => {
    return content.replace(
      /as\s+any/g,
      'as unknown' // More type-safe alternative
    );
  },
  
  // Fix non-null assertions
  nonNullAssertion: (content, issue) => {
    // Replace non-null assertion with null check
    return content.replace(
      /(\w+)!\./g,
      "$1 && $1."
    );
  },
  
  // Fix props validation
  missingPropValidation: (content, issue) => {
    // This requires more context to fix properly - we'll add a simple default
    // for the prop as a basic fix
    const lines = content.split('\n');
    const line = lines[issue.line - 1];
    
    const propPattern = /const\s*\{([^}]+)\}\s*=\s*props/;
    const match = line.match(propPattern);
    
    if (match && match[1]) {
      const props = match[1].split(',').map(p => p.trim());
      const propsWithDefaults = props.map(p => {
        if (!p.includes('=')) {
          // Add a simple default value based on the prop name
          if (p.toLowerCase().includes('enabled') || p.toLowerCase().includes('visible')) {
            return `${p} = false`;
          } else if (p.toLowerCase().includes('count') || p.toLowerCase().includes('index')) {
            return `${p} = 0`;
          } else if (p.toLowerCase().includes('list') || p.toLowerCase().includes('items')) {
            return `${p} = []`;
          } else {
            return `${p} = undefined`;
          }
        }
        return p;
      });
      
      // Replace the props line with the new version
      lines[issue.line - 1] = line.replace(
        propPattern,
        `const {${propsWithDefaults.join(', ')}} = props`
      );
      
      return lines.join('\n');
    }
    
    return content;
  },
  
  // Fix unreachable code
  unreachableCode: (content, issue) => {
    // For unreachable code, we simply remove it
    const lines = content.split('\n');
    const lineContent = lines[issue.line - 1];
    
    // Find where the first return statement ends
    const returnEndIndex = lineContent.indexOf(';') + 1;
    
    // Keep only the code up to the first return statement
    if (returnEndIndex > 0) {
      lines[issue.line - 1] = lineContent.substring(0, returnEndIndex);
    }
    
    return lines.join('\n');
  },
  
  // Fix useEffect without dependency array
  useStateWithoutDeps: (content, issue) => {
    return content.replace(
      /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{([^}]*(?:setState|setCount|setValue|setData|setLoading|setError)[^}]*)\}\s*\)/g,
      // Add empty dependency array
      'useEffect(() => {$1}, [])'
    );
  },
  
  // Fix event listener memory leaks
  eventListenerLeak: (content, issue) => {
    // This is a complex fix that requires analyzing function scope
    // For now, we'll add a basic comment warning about the leak
    const lines = content.split('\n');
    const lineIndex = issue.line - 1;
    
    // Add a comment warning about the potential memory leak
    lines.splice(lineIndex, 0, 
      '// TODO: Potential memory leak - ensure this event listener is removed when component unmounts');
    
    return lines.join('\n');
  },
  
  // Fix missing cleanup in useEffect
  missingCleanup: (content, issue) => {
    return content.replace(
      /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{([^}]*(?:setInterval|setTimeout)[^}]*)\}\s*,\s*(\[[^\]]*\])\s*\)/g,
      (match, body, deps) => {
        // Extract the timer variable if it exists
        const timerMatch = body.match(/(const|let|var)?\s*(\w+)\s*=\s*(setInterval|setTimeout)/);
        if (timerMatch && timerMatch[2]) {
          const timerVar = timerMatch[2];
          return `useEffect(() => {${body}
            return () => {
              // Cleanup function to prevent memory leaks
              ${timerMatch[3] === 'setInterval' ? 'clearInterval' : 'clearTimeout'}(${timerVar});
            };
          }, ${deps})`;
        } else {
          // Generic cleanup
          return `useEffect(() => {
            ${body}
            return () => {
              // Cleanup function to prevent memory leaks
              // TODO: Add proper cleanup for timers/listeners
            };
          }, ${deps})`;
        }
      }
    );
  },
  
  // Fix client-side API usage in server-side functions
  clientSideReferenceInSSR: (content, issue) => {
    // Add a check for server-side rendering
    return content.replace(
      /(export\s+(?:async\s+)?function\s+(?:getServerSideProps|getStaticProps)[^{]*\{[^]*?)(?:window|document|localStorage|sessionStorage)/g,
      '$1typeof window !== "undefined" && window'
    );
  },
  
  // Fix ESLint issues
  'eslint-semicolon': (content, issue) => {
    // Add missing semicolons
    const lines = content.split('\n');
    const line = lines[issue.line - 1];
    
    if (!line.trimEnd().endsWith(';') && !line.trimEnd().endsWith('{') && !line.trimEnd().endsWith('}')) {
      lines[issue.line - 1] = line + ';';
    }
    
    return lines.join('\n');
  },
  
  'eslint-spacing': (content, issue) => {
    // Basic spacing fixes
    return content
      .replace(/\s+,/g, ',')       // Remove space before comma
      .replace(/,(?=\S)/g, ', ')   // Add space after comma
      .replace(/\s+;/g, ';')       // Remove space before semicolon
      .replace(/;(?=\S)/g, '; ')   // Add space after semicolon
      .replace(/\(\s+/g, '(')      // Remove space after opening parenthesis
      .replace(/\s+\)/g, ')')      // Remove space before closing parenthesis
      .replace(/{\s+/g, '{ ')      // Format space after opening brace
      .replace(/\s+}/g, ' }')      // Format space before closing brace
      .replace(/\s{2,}/g, ' ');    // Collapse multiple spaces
  },
  
  'eslint-no-unused-vars': (content, issue) => {
    // For unused vars, we'll comment them out
    if (issue.code) {
      const varMatch = issue.code.match(/(?:const|let|var)\s+(\w+)/);
      if (varMatch && varMatch[1]) {
        const varName = varMatch[1];
        return content.replace(
          new RegExp(`(?:const|let|var)\\s+${varName}\\s*=`, 'g'),
          `// Unused: const ${varName} =`
        );
      }
    }
    return content;
  },
  
  'eslint-quotes': (content, issue) => {
    // Convert double quotes to single quotes for string literals
    return content
      .replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, "'$1'")
      .replace(/`([^`${}\\]*(?:\\.[^`${}\\]*)*)`/g, (match, captured) => {
        // Only convert template literals that don't have expressions
        if (!captured.includes('${')) {
          return `'${captured}'`;
        }
        return match;
      });
  },
  
  'eslint-prefer-const': (content, issue) => {
    // Convert let to const for variables that are never reassigned
    return content.replace(
      /let\s+(\w+)\s*=\s*([^;]+);(?![^]*\1\s*=)/g,
      'const $1 = $2;'
    );
  },
  
  'eslint-no-console': (content, issue) => {
    // Replace console.log with a commented out version
    return content.replace(
      /console\.log\(/g,
      '// console.log('
    );
  }
};

// Fix the bugs in a file
function fixBugsInFile(filePath, issues) {
  const fullPath = path.join(SRC_DIR, filePath);
  
  try {
    // Make sure file exists
    if (!fs.existsSync(fullPath)) {
      console.error(`File not found: ${fullPath}`);
      return false;
    }
    
    // Read the original content
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // Backup the file before making changes
    const backupPath = backupFile(fullPath);
    if (!backupPath) {
      console.error(`Skipping ${filePath} - backup failed`);
      return false;
    }
    
    // Get list of fixable issues for our safety mode
    const fixableBugTypes = FIXABLE_BUGS[SAFETY_MODE];
    const fixableIssues = issues.filter(issue => {
      // Check if it's a known ESLint rule
      if (issue.name && issue.name.startsWith('eslint')) {
        // Map ESLint rules to our fixable types
        const ruleName = issue.name.split('/').pop();
        return fixableBugTypes.some(bugType => 
          bugType === `eslint-${ruleName}` || 
          bugType === issue.name
        );
      }
      
      return fixableBugTypes.includes(issue.name);
    });
    
    if (fixableIssues.length === 0) {
      console.log(`No fixable issues found in ${filePath}`);
      return false;
    }
    
    console.log(`Fixing ${fixableIssues.length} issues in ${filePath}...`);
    
    // Apply fixes
    let fixCount = 0;
    for (const issue of fixableIssues) {
      // Find the appropriate fixer
      let fixer;
      
      if (issue.name.startsWith('eslint')) {
        // Map ESLint rules to our fixers
        const ruleName = issue.name.split('/').pop();
        const fixerName = `eslint-${ruleName}`;
        fixer = bugFixers[fixerName];
      } else {
        fixer = bugFixers[issue.name];
      }
      
      if (fixer) {
        const newContent = fixer(content, issue);
        if (newContent !== content) {
          content = newContent;
          fixCount++;
        }
      }
    }
    
    // If content was modified, write it back
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content);
      console.log(`Applied ${fixCount} fixes to ${filePath}`);
      return true;
    } else {
      console.log(`No changes applied to ${filePath}`);
      return false;
    }
    
  } catch (e) {
    console.error(`Error fixing bugs in ${filePath}:`, e.message);
    return false;
  }
}

// Fix TypeScript/ESLint issues using the standard tools
function runAutoFixTools() {
  console.log('Running automatic fixes with ESLint and TypeScript...');
  
  try {
    // Run ESLint with --fix flag
    console.log('Running ESLint auto-fix...');
    execSync('npx eslint --fix src', { stdio: 'inherit' });
    
    // Run TypeScript compiler to check for errors
    console.log('Running TypeScript compiler...');
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    
    return true;
  } catch (e) {
    console.log('Auto-fix tools completed with some errors');
    return false;
  }
}

// Main function
async function main() {
  console.log(`Starting bug fixer in ${SAFETY_MODE} mode...`);
  
  // Read the bug report
  const bugReport = readBugReport();
  console.log(`Read bug report with ${bugReport.totalIssues} issues in ${bugReport.totalFiles} files`);
  
  // Get the list of files with issues
  const filesWithIssues = Object.keys(bugReport.issuesByFile);
  
  // Check safety thresholds
  const safetyThreshold = SAFETY_THRESHOLDS[SAFETY_MODE];
  const percentageOfFiles = (filesWithIssues.length / bugReport.totalFiles) * 100;
  
  if (percentageOfFiles > safetyThreshold.maxChangesPercent) {
    console.error(`Safety check failed: ${percentageOfFiles.toFixed(2)}% of files would be modified, threshold is ${safetyThreshold.maxChangesPercent}%`);
    console.error(`To override, set SAFETY_MODE=moderate or SAFETY_MODE=aggressive`);
    process.exit(1);
  }
  
  if (filesWithIssues.length > safetyThreshold.maxFilesChanged) {
    console.error(`Safety check failed: ${filesWithIssues.length} files would be modified, threshold is ${safetyThreshold.maxFilesChanged}`);
    console.error(`To override, set SAFETY_MODE=moderate or SAFETY_MODE=aggressive`);
    process.exit(1);
  }
  
  console.log(`Safety checks passed. Proceeding to fix up to ${filesWithIssues.length} files`);
  
  // Fix issues in each file
  const fixedFiles = [];
  
  for (const filePath of filesWithIssues) {
    const issues = bugReport.issuesByFile[filePath];
    const wasFixed = fixBugsInFile(filePath, issues);
    
    if (wasFixed) {
      fixedFiles.push(filePath);
    }
  }
  
  // Run automatic fix tools if there are any issues
  if (bugReport.totalIssues > 0) {
    runAutoFixTools();
  }
  
  // Summary
  console.log('\nBug Fixing Summary:');
  console.log(`- Total files processed: ${filesWithIssues.length}`);
  console.log(`- Files fixed: ${fixedFiles.length}`);
  console.log(`- Backup location: ${BACKUP_DIR}`);
  
  if (fixedFiles.length > 0) {
    console.log('\nFixed files:');
    fixedFiles.forEach(file => console.log(`- ${file}`));
  }
  
  console.log('\nBug fixing complete!');
}

// Run the script
main().catch(error => {
  console.error('Error during bug fixing:', error);
  process.exit(1);
}); 