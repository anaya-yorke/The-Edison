#!/usr/bin/env node

/**
 * Bug Detector
 * 
 * This script analyzes the codebase to detect potential bugs, including:
 * 1. React state management issues
 * 2. Undefined variables and references
 * 3. Memory leaks
 * 4. Async/await misuse
 * 5. Potential type errors
 * 6. Common logic flaws
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

// Common bug patterns
const BUG_PATTERNS = {
  // React state bugs
  setStateInRender: {
    pattern: /\brender\s*\(\s*\)[^}]*\bsetState\s*\(/g,
    message: 'setState called inside render() - can cause infinite loop',
    severity: 'high',
  },
  useStateWithoutDeps: {
    pattern: /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[^}]*(?:setState|setCount|setValue|setData|setLoading|setError)[^}]*\}\s*\)/g,
    message: 'useEffect without dependency array but changes state - can cause infinite loop',
    severity: 'high',
  },
  missingAwait: {
    pattern: /(?:const|let|var)\s+\w+\s*=\s*\basync\b[^;]*?;\s*(?!await)/g,
    message: 'Async function call without await',
    severity: 'medium',
  },
  
  // Memory leaks
  eventListenerLeak: {
    pattern: /addEventListener\s*\([^)]*\)[^]*?(?!removeEventListener)/g,
    message: 'Event listener added without cleanup',
    severity: 'medium',
  },
  missingCleanup: {
    pattern: /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[^}]*(?:addEventListener|setInterval|setTimeout)[^}]*\}\s*,\s*\[[^\]]*\]\s*\)/g,
    message: 'useEffect with timer or event listener without cleanup function',
    severity: 'medium',
  },
  
  // Logic flaws
  emptyPromiseCatch: {
    pattern: /\.catch\s*\(\s*\(\s*\w*\s*\)\s*=>\s*\{\s*\}\s*\)/g,
    message: 'Empty catch block silently swallows errors',
    severity: 'medium',
  },
  directStateAccess: {
    pattern: /this\.state\.\w+\s*=[^=]/g,
    message: 'Direct state mutation instead of setState',
    severity: 'high',
  },
  invalidHookCall: {
    pattern: /(?:if|for|while)\s*\([^)]*\)\s*\{[^}]*(?:useState|useEffect|useContext|useReducer|useCallback|useMemo)/g,
    message: 'Hook called conditionally - violates Rules of Hooks',
    severity: 'high',
  },
  
  // TypeScript issues
  typeAssertion: {
    pattern: /\bas\s+any\b/g,
    message: 'Type assertion to any - bypasses type checking',
    severity: 'low',
  },
  nonNullAssertion: {
    pattern: /\w+!\./g,
    message: 'Non-null assertion operator used - may cause runtime errors',
    severity: 'low',
  },
  
  // Next.js specific issues
  clientSideReferenceInSSR: {
    pattern: /(?:getServerSideProps|getStaticProps)[^}]*(?:window|document|localStorage|sessionStorage)/g,
    message: 'Client-side API used in server-side function',
    severity: 'high',
  },
};

// Find all TypeScript/JavaScript files
function findSourceFiles() {
  return glob.sync('**/*.{ts,tsx,js,jsx}', {
    cwd: SRC_DIR,
    ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**'],
  });
}

// Analyze file for potential bugs
function analyzeBugs(file) {
  const fullPath = path.join(SRC_DIR, file);
  const issues = [];
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for each bug pattern
    for (const [name, { pattern, message, severity }] of Object.entries(BUG_PATTERNS)) {
      const matches = content.match(pattern);
      
      if (matches && matches.length > 0) {
        matches.forEach(match => {
          // Find line number by counting newlines before match position
          const matchPosition = content.indexOf(match);
          const lineNumber = content.substring(0, matchPosition).split('\n').length;
          
          issues.push({
            file,
            line: lineNumber,
            name,
            message,
            severity,
            code: match.slice(0, 100).trim() + (match.length > 100 ? '...' : ''),
          });
        });
      }
    }
    
    // Custom logic checks
    
    // Check for props destructuring without defaults for required props
    if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      const propsDestructuring = content.match(/const\s*{([^}]+)}\s*=\s*props/g);
      if (propsDestructuring) {
        propsDestructuring.forEach(match => {
          const props = match.match(/const\s*{([^}]+)}\s*=\s*props/)[1].split(',');
          
          // If there are props with no default values, check if they're validated
          const propsWithoutDefaults = props
            .map(p => p.trim())
            .filter(p => !p.includes('='));
          
          const hasPropTypes = content.includes('propTypes') || content.includes('PropTypes');
          const hasTypeScript = file.endsWith('.tsx');
          
          if (propsWithoutDefaults.length > 0 && !hasPropTypes && !hasTypeScript) {
            const line = content.substring(0, content.indexOf(match)).split('\n').length;
            issues.push({
              file,
              line,
              name: 'missingPropValidation',
              message: 'Props destructured without default values or type validation',
              severity: 'medium',
              code: match.trim(),
            });
          }
        });
      }
    }
    
    // Check for unreachable return statements
    const returnAfterReturn = content.match(/return[^;]*;\s*[^\n}]*return/g);
    if (returnAfterReturn) {
      returnAfterReturn.forEach(match => {
        const line = content.substring(0, content.indexOf(match)).split('\n').length;
        issues.push({
          file,
          line,
          name: 'unreachableCode',
          message: 'Unreachable code after return statement',
          severity: 'medium',
          code: match.trim(),
        });
      });
    }
    
  } catch (e) {
    console.error(`Error analyzing file ${file}:`, e.message);
  }
  
  return issues;
}

// Run ESLint to find bugs
function runEslint() {
  try {
    console.log('Running ESLint...');
    const result = execSync('npx eslint --format json src', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    return JSON.parse(result);
  } catch (e) {
    // ESLint returns exit code 1 when it finds issues, we still want the output
    if (e.stdout) {
      try {
        return JSON.parse(e.stdout);
      } catch (parseError) {
        console.error('Error parsing ESLint output:', parseError.message);
      }
    }
    console.error('Error running ESLint:', e.message);
    return [];
  }
}

// Main function
async function main() {
  console.log('Starting bug detection...');
  
  // Find all source files
  const sourceFiles = findSourceFiles();
  console.log(`Found ${sourceFiles.length} source files to analyze`);
  
  // Collect issues from pattern-based analysis
  const patternIssues = [];
  sourceFiles.forEach(file => {
    const fileIssues = analyzeBugs(file);
    patternIssues.push(...fileIssues);
  });
  
  console.log(`Found ${patternIssues.length} potential bugs from pattern analysis`);
  
  // Run ESLint for additional static analysis
  let eslintIssues = [];
  try {
    eslintIssues = runEslint();
    console.log(`Found ${eslintIssues.length} issues from ESLint`);
  } catch (e) {
    console.log('ESLint analysis skipped:', e.message);
  }
  
  // Convert ESLint issues to our format
  const eslintFormattedIssues = (eslintIssues || []).flatMap(fileResult => {
    return (fileResult.messages || []).map(message => {
      return {
        file: path.relative(SRC_DIR, fileResult.filePath),
        line: message.line,
        name: message.ruleId || 'eslintError',
        message: message.message,
        severity: message.severity === 2 ? 'high' : message.severity === 1 ? 'medium' : 'low',
        code: message.source || '',
      };
    });
  });
  
  // Combine all issues
  const allIssues = [...patternIssues, ...eslintFormattedIssues];
  
  // Group issues by file
  const issuesByFile = allIssues.reduce((acc, issue) => {
    if (!acc[issue.file]) {
      acc[issue.file] = [];
    }
    acc[issue.file].push(issue);
    return acc;
  }, {});
  
  // Generate a report
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: sourceFiles.length,
    totalIssues: allIssues.length,
    issuesBySeverity: {
      high: allIssues.filter(i => i.severity === 'high').length,
      medium: allIssues.filter(i => i.severity === 'medium').length,
      low: allIssues.filter(i => i.severity === 'low').length,
    },
    issuesByFile,
  };
  
  // Save the report
  const reportPath = path.join(PROJECT_ROOT, '.github/bug-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Bug detection report saved to: ${reportPath}`);
  
  // Summary
  console.log('\nBug Detection Summary:');
  console.log(`- Total potential bugs: ${allIssues.length}`);
  console.log(`- High severity issues: ${report.issuesBySeverity.high}`);
  console.log(`- Medium severity issues: ${report.issuesBySeverity.medium}`);
  console.log(`- Low severity issues: ${report.issuesBySeverity.low}`);
  console.log(`- Files with issues: ${Object.keys(issuesByFile).length}`);
  
  console.log('\nBug detection complete!');
}

// Run the script
main().catch(error => {
  console.error('Error during bug detection:', error);
  process.exit(1);
}); 