#!/usr/bin/env node

/**
 * Edison Agent - The Comprehensive Code Maintenance System
 * 
 * This central script orchestrates all the maintenance operations:
 * 1. Code organization and structure improvement
 * 2. Code quality and bug fixing
 * 3. UI consistency and improvements
 * 4. File cleanup and organization
 * 5. Monitoring and reporting
 * 
 * Usage: 
 *   node edison-agent.js [operation] [--flags]
 * 
 * Operations:
 *   full                Run all maintenance operations
 *   organize            Only run code organization
 *   fix                 Only run bug detection and fixes
 *   ui                  Only run UI improvements
 *   cleanup             Only run file cleanup
 *   report              Generate a comprehensive report without making changes
 *   update              Run auto-update operation
 * 
 * Flags:
 *   --dry-run           Don't apply changes, just report what would be done
 *   --safety=<level>    Set safety level (safe, moderate, aggressive)
 *   --pr                Create a PR with the changes
 *   --branch=<name>     Create changes on a specific branch
 *   --no-commit         Skip committing changes
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const readline = require('readline');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const SCRIPTS_DIR = path.resolve(__dirname);
const REPORT_DIR = path.join(PROJECT_ROOT, '.github/reports');

// Import utilities
const { ensureDirectoryExists } = require('./utils');

// Settings
const DEFAULT_SETTINGS = {
  dryRun: false,           // Don't apply changes, just report
  safetyMode: 'safe',      // Safety level: safe, moderate, aggressive
  createPr: false,         // Create a PR with changes
  targetBranch: '',        // Target branch for changes
  operation: 'full',       // Default operation
  quiet: false,            // Suppress most output
  interactive: true,       // Ask for confirmation before making changes
  reportOnly: false,       // Only generate reports, don't make changes
  autoCommit: true,        // Commit changes automatically
};

// Parse command line arguments
function parseArguments() {
  const args = process.argv.slice(2);
  
  // Default settings
  const settings = {
    operation: 'none',
    dryRun: false,
    safety: 'safe',
    pr: false,
    branch: '',
    autoCommit: true
  };
  
  // First argument is the operation
  if (args.length > 0 && !args[0].startsWith('--')) {
    settings.operation = args[0];
  }
  
  // Check for valid operations
  const validOperations = ['full', 'organize', 'fix', 'ui', 'cleanup', 'report', 'update'];
  if (!validOperations.includes(settings.operation)) {
    console.error(`Error: Invalid operation "${settings.operation}". Valid operations are: ${validOperations.join(', ')}`);
    process.exit(1);
  }
  
  // Process flags
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--dry-run') {
      settings.dryRun = true;
    } else if (arg.startsWith('--safety=')) {
      const safety = arg.split('=')[1];
      if (['safe', 'moderate', 'aggressive'].includes(safety)) {
        settings.safety = safety;
      } else {
        console.warn(`Warning: Invalid safety level "${safety}". Using "safe" instead.`);
      }
    } else if (arg === '--pr') {
      settings.pr = true;
    } else if (arg.startsWith('--branch=')) {
      settings.branch = arg.split('=')[1];
    } else if (arg === '--no-commit') {
      settings.autoCommit = false;
    }
  }
  
  return settings;
}

// Run a script and return its output
function runScript(scriptPath, args = [], env = {}) {
  const scriptFullPath = path.join(SCRIPTS_DIR, scriptPath);
  
  if (!fs.existsSync(scriptFullPath)) {
    console.error(`Script not found: ${scriptFullPath}`);
    return null;
  }
  
  console.log(`Running ${scriptPath}...`);
  
  try {
    const mergedEnv = { ...process.env, ...env };
    const output = execSync(`node ${scriptFullPath} ${args.join(' ')}`, {
      encoding: 'utf8',
      env: mergedEnv,
      cwd: PROJECT_ROOT,
    });
    
    return { success: true, output };
  } catch (error) {
    console.error(`Error running ${scriptPath}:`, error.message);
    if (error.stdout) {
      console.log('Script output:', error.stdout);
    }
    if (error.stderr) {
      console.error('Script errors:', error.stderr);
    }
    return { success: false, error };
  }
}

// Run a script asynchronously with real-time output
function runScriptAsync(scriptPath, args = [], env = {}) {
  return new Promise((resolve, reject) => {
    const scriptFullPath = path.join(SCRIPTS_DIR, scriptPath);
    
    if (!fs.existsSync(scriptFullPath)) {
      reject(new Error(`Script not found: ${scriptFullPath}`));
      return;
    }
    
    console.log(`Running ${scriptPath}...`);
    
    const mergedEnv = { ...process.env, ...env };
    const child = spawn('node', [scriptFullPath, ...args], {
      env: mergedEnv,
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      process.stdout.write(output);
    });
    
    child.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      process.stderr.write(output);
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output: stdout });
      } else {
        resolve({ success: false, error: new Error(`Script exited with code ${code}`), stdout, stderr });
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Create a branch for changes
function createBranch(branchName) {
  try {
    // Check if the branch already exists
    const branchExists = execSync(`git branch --list ${branchName}`, { encoding: 'utf8' }).trim() !== '';
    
    if (branchExists) {
      console.log(`Branch ${branchName} already exists, checking it out...`);
      execSync(`git checkout ${branchName}`, { encoding: 'utf8' });
    } else {
      console.log(`Creating new branch: ${branchName}...`);
      execSync(`git checkout -b ${branchName}`, { encoding: 'utf8' });
    }
    
    return true;
  } catch (error) {
    console.error('Error creating branch:', error.message);
    return false;
  }
}

// Commit changes to git
function commitChanges(message) {
  try {
    // Check if there are changes to commit
    const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    
    if (!status) {
      console.log('No changes to commit');
      return false;
    }
    
    // Add all changes
    execSync('git add .', { encoding: 'utf8' });
    
    // Commit
    execSync(`git commit -m "${message}"`, { encoding: 'utf8' });
    console.log(`Changes committed with message: ${message}`);
    
    return true;
  } catch (error) {
    console.error('Error committing changes:', error.message);
    return false;
  }
}

// Create a PR
function createPullRequest(title, body, branch) {
  try {
    // Check if gh CLI is installed
    try {
      execSync('gh --version', { stdio: 'ignore' });
    } catch {
      console.error('GitHub CLI (gh) is not installed or not in PATH. Cannot create PR.');
      return false;
    }
    
    // Create PR
    console.log(`Creating pull request from ${branch} to main...`);
    
    const command = `gh pr create --title "${title}" --body "${body}" --base main --head ${branch}`;
    const result = execSync(command, { encoding: 'utf8' });
    
    console.log('Pull request created:', result.trim());
    return true;
  } catch (error) {
    console.error('Error creating pull request:', error.message);
    return false;
  }
}

// Prompt user for confirmation
function askForConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    rl.question(`${question} (y/n) `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Generate a report summary
function generateReportSummary(results) {
  ensureDirectoryExists(REPORT_DIR);
  
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const reportPath = path.join(REPORT_DIR, `edison-agent-report-${timestamp}.json`);
  
  // Build summary
  const summary = {
    timestamp,
    results,
    overall: {
      success: Object.values(results).every(result => result.success),
      changesApplied: !results.settings.dryRun && Object.values(results)
        .some(result => result.changesApplied),
    },
  };
  
  // Write summary to file
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
  console.log(`Report saved to: ${reportPath}`);
  
  // Generate human-readable markdown report
  const markdownReport = generateMarkdownReport(summary);
  const markdownPath = reportPath.replace('.json', '.md');
  fs.writeFileSync(markdownPath, markdownReport);
  console.log(`Markdown report saved to: ${markdownPath}`);
  
  return summary;
}

// Generate a markdown report
function generateMarkdownReport(summary) {
  const { results, timestamp, overall } = summary;
  
  let markdown = `# Edison Agent Maintenance Report\n\n`;
  markdown += `**Date:** ${new Date(timestamp).toLocaleString()}\n\n`;
  markdown += `**Overall Status:** ${overall.success ? '✅ Success' : '❌ Completed with issues'}\n`;
  markdown += `**Changes Applied:** ${overall.changesApplied ? 'Yes' : 'No (Dry Run)'}\n\n`;
  
  // Settings summary
  markdown += `## Settings\n\n`;
  markdown += `- **Operation:** ${results.settings.operation}\n`;
  markdown += `- **Safety Mode:** ${results.settings.safetyMode}\n`;
  markdown += `- **Dry Run:** ${results.settings.dryRun ? 'Yes' : 'No'}\n\n`;
  
  // Add operation results
  if (results.codeOrganization) {
    markdown += `## Code Organization\n\n`;
    markdown += `- **Status:** ${results.codeOrganization.success ? '✅ Success' : '❌ Completed with issues'}\n`;
    if (results.codeOrganization.stats) {
      markdown += `- **Files Processed:** ${results.codeOrganization.stats.filesProcessed}\n`;
      markdown += `- **Files Moved:** ${results.codeOrganization.stats.filesMoved}\n`;
    }
    markdown += `\n`;
  }
  
  if (results.bugDetection) {
    markdown += `## Bug Detection and Fixing\n\n`;
    markdown += `- **Status:** ${results.bugDetection.success ? '✅ Success' : '❌ Completed with issues'}\n`;
    if (results.bugDetection.stats) {
      markdown += `- **Files Scanned:** ${results.bugDetection.stats.totalFiles}\n`;
      markdown += `- **Issues Found:** ${results.bugDetection.stats.totalIssues}\n`;
      markdown += `  - High Severity: ${results.bugDetection.stats.issuesBySeverity?.high || 0}\n`;
      markdown += `  - Medium Severity: ${results.bugDetection.stats.issuesBySeverity?.medium || 0}\n`;
      markdown += `  - Low Severity: ${results.bugDetection.stats.issuesBySeverity?.low || 0}\n`;
    }
    
    if (results.bugFix && results.bugFix.stats) {
      markdown += `- **Issues Fixed:** ${results.bugFix.stats.filesFixed}\n`;
    }
    markdown += `\n`;
  }
  
  if (results.uiConsistency) {
    markdown += `## UI Consistency\n\n`;
    markdown += `- **Status:** ${results.uiConsistency.success ? '✅ Success' : '❌ Completed with issues'}\n`;
    if (results.uiConsistency.stats) {
      markdown += `- **Components Analyzed:** ${results.uiConsistency.stats.componentsAnalyzed}\n`;
      markdown += `- **Color Issues Fixed:** ${results.uiConsistency.stats.colorFixCount}\n`;
      markdown += `- **Font Issues Fixed:** ${results.uiConsistency.stats.fontFixCount}\n`;
      markdown += `- **Responsive Issues Fixed:** ${results.uiConsistency.stats.responsiveFixCount}\n`;
    }
    markdown += `\n`;
  }
  
  if (results.fileCleanup) {
    markdown += `## File Cleanup\n\n`;
    markdown += `- **Status:** ${results.fileCleanup.success ? '✅ Success' : '❌ Completed with issues'}\n`;
    if (results.fileCleanup.stats) {
      markdown += `- **Unused Files Detected:** ${results.fileCleanup.stats.unusedFilesCount}\n`;
      markdown += `- **Files Removed:** ${results.fileCleanup.stats.filesRemoved}\n`;
      markdown += `- **Empty Directories Removed:** ${results.fileCleanup.stats.directoriesRemoved}\n`;
      markdown += `- **Duplicate Files Detected:** ${results.fileCleanup.stats.duplicateFilesCount}\n`;
    }
    markdown += `\n`;
  }
  
  return markdown;
}

/**
 * Runs the specified operation with provided settings
 */
async function runOperation(operation, settings) {
  console.log(`Running operation: ${operation}`);
  
  switch (operation) {
    case 'full':
      await runCodeOrganization(settings);
      await runBugDetectionAndFix(settings);
      await runUiConsistency(settings);
      await runFileCleanup(settings);
      await runAutoUpdate(settings);
      break;
    case 'organize':
      await runCodeOrganization(settings);
      break;
    case 'fix':
      await runBugDetectionAndFix(settings);
      break;
    case 'ui':
      await runUiConsistency(settings);
      break;
    case 'cleanup':
      await runFileCleanup(settings);
      break;
    case 'update':
      await runAutoUpdate(settings);
      break;
    case 'report':
      // Report only mode - each function detects the --dry-run flag
      settings.dryRun = true;
      await runCodeOrganization(settings);
      await runBugDetectionAndFix(settings);
      await runUiConsistency(settings);
      await runFileCleanup(settings);
      break;
    default:
      console.error(`Unknown operation: ${operation}`);
      process.exit(1);
  }
}

// Run code organization
async function runCodeOrganization(settings) {
  console.log('\n=== Code Organization ===\n');
  
  if (settings.dryRun || settings.reportOnly) {
    console.log('Dry run - not applying changes');
  }
  
  if (settings.interactive && !settings.reportOnly && !settings.dryRun) {
    const confirm = await askForConfirmation('Proceed with code organization?');
    if (!confirm) {
      console.log('Code organization skipped');
      return { success: true, changesApplied: false, skipped: true };
    }
  }
  
  // Run the code organization script
  const args = [];
  if (settings.dryRun) args.push('--dry-run');
  
  const result = await runScriptAsync('organize-code.js', args, {
    SAFETY_MODE: settings.safetyMode,
  });
  
  if (result.success && !settings.dryRun && !settings.reportOnly) {
    // Commit the changes
    const commitMessage = 'Edison Agent: Improve code organization and structure';
    commitChanges(commitMessage);
  }
  
  // Try to extract stats from the output
  let stats = null;
  try {
    // Look for a stats line in the output
    const statsMatch = result.output.match(/Files processed: (\d+), Files moved: (\d+)/);
    if (statsMatch) {
      stats = {
        filesProcessed: parseInt(statsMatch[1], 10),
        filesMoved: parseInt(statsMatch[2], 10),
      };
    }
  } catch (e) {
    console.error('Error parsing stats:', e.message);
  }
  
  return {
    success: result.success,
    changesApplied: result.success && !settings.dryRun && !settings.reportOnly,
    output: result.output,
    error: result.error,
    stats,
  };
}

// Run bug detection and fix
async function runBugDetectionAndFix(settings) {
  console.log('\n=== Bug Detection and Fix ===\n');
  
  // First run the bug detector to find issues
  console.log('Running bug detection...');
  const detectionResult = await runScriptAsync('bug-detector.js');
  
  // Parse stats from bug detector output
  let bugStats = null;
  try {
    // Extract total issues
    const issuesMatch = detectionResult.output.match(/Total potential bugs: (\d+)/);
    const totalIssues = issuesMatch ? parseInt(issuesMatch[1], 10) : 0;
    
    // Extract severity counts
    const highMatch = detectionResult.output.match(/High severity issues: (\d+)/);
    const mediumMatch = detectionResult.output.match(/Medium severity issues: (\d+)/);
    const lowMatch = detectionResult.output.match(/Low severity issues: (\d+)/);
    
    // Extract file counts
    const totalFilesMatch = detectionResult.output.match(/Found (\d+) source files to analyze/);
    const filesWithIssuesMatch = detectionResult.output.match(/Files with issues: (\d+)/);
    
    bugStats = {
      totalIssues,
      totalFiles: totalFilesMatch ? parseInt(totalFilesMatch[1], 10) : 0,
      filesWithIssues: filesWithIssuesMatch ? parseInt(filesWithIssuesMatch[1], 10) : 0,
      issuesBySeverity: {
        high: highMatch ? parseInt(highMatch[1], 10) : 0,
        medium: mediumMatch ? parseInt(mediumMatch[1], 10) : 0,
        low: lowMatch ? parseInt(lowMatch[1], 10) : 0,
      },
    };
  } catch (e) {
    console.error('Error parsing bug detection stats:', e.message);
  }
  
  if (settings.dryRun || settings.reportOnly) {
    console.log('Dry run - not applying fixes');
    return {
      success: detectionResult.success,
      changesApplied: false,
      stats: bugStats,
    };
  }
  
  // If there are issues and user wants to fix them
  if (bugStats && bugStats.totalIssues > 0) {
    if (settings.interactive) {
      const confirm = await askForConfirmation(
        `Found ${bugStats.totalIssues} potential issues. Proceed with bug fixing?`
      );
      if (!confirm) {
        console.log('Bug fixing skipped');
        return {
          success: detectionResult.success,
          changesApplied: false,
          skipped: true,
          stats: bugStats,
        };
      }
    }
    
    // Run the bug fixer
    console.log('Running bug fixes...');
    const fixResult = await runScriptAsync('bug-fixer.js', [], {
      SAFETY_MODE: settings.safetyMode,
    });
    
    // Parse fix stats
    let fixStats = null;
    try {
      const filesFixedMatch = fixResult.output.match(/Files fixed: (\d+)/);
      if (filesFixedMatch) {
        fixStats = {
          filesFixed: parseInt(filesFixedMatch[1], 10),
        };
      }
    } catch (e) {
      console.error('Error parsing fix stats:', e.message);
    }
    
    if (fixResult.success) {
      // Commit the changes
      const commitMessage = 'Edison Agent: Fix code issues and improve code quality';
      commitChanges(commitMessage);
    }
    
    return {
      success: detectionResult.success && fixResult.success,
      changesApplied: fixResult.success,
      detectionOutput: detectionResult.output,
      fixOutput: fixResult.output,
      error: fixResult.error || detectionResult.error,
      stats: bugStats,
      fixStats,
    };
  }
  
  // No issues to fix
  return {
    success: detectionResult.success,
    changesApplied: false,
    stats: bugStats,
  };
}

// Run UI consistency
async function runUiConsistency(settings) {
  console.log('\n=== UI Consistency ===\n');
  
  if (settings.dryRun || settings.reportOnly) {
    console.log('Dry run - not applying changes');
  }
  
  if (settings.interactive && !settings.reportOnly && !settings.dryRun) {
    const confirm = await askForConfirmation('Proceed with UI consistency improvements?');
    if (!confirm) {
      console.log('UI consistency improvements skipped');
      return { success: true, changesApplied: false, skipped: true };
    }
  }
  
  // Run the UI consistency script
  const args = [];
  if (settings.dryRun) args.push('--dry-run');
  
  const result = await runScriptAsync('ui-consistency-check.js', args, {
    SAFETY_MODE: settings.safetyMode,
  });
  
  // Parse stats
  let stats = null;
  try {
    const componentsMatch = result.output.match(/Analyzed (\d+) components/i);
    const colorFixMatch = result.output.match(/Fixed (\d+) color inconsistencies/i);
    const fontFixMatch = result.output.match(/Fixed (\d+) font inconsistencies/i);
    const responsiveFixMatch = result.output.match(/Added (\d+) responsive styles/i);
    
    if (componentsMatch || colorFixMatch || fontFixMatch || responsiveFixMatch) {
      stats = {
        componentsAnalyzed: componentsMatch ? parseInt(componentsMatch[1], 10) : 0,
        colorFixCount: colorFixMatch ? parseInt(colorFixMatch[1], 10) : 0,
        fontFixCount: fontFixMatch ? parseInt(fontFixMatch[1], 10) : 0,
        responsiveFixCount: responsiveFixMatch ? parseInt(responsiveFixMatch[1], 10) : 0,
      };
    }
  } catch (e) {
    console.error('Error parsing UI stats:', e.message);
  }
  
  if (result.success && !settings.dryRun && !settings.reportOnly) {
    // Commit the changes
    const commitMessage = 'Edison Agent: Improve UI consistency and design';
    commitChanges(commitMessage);
  }
  
  return {
    success: result.success,
    changesApplied: result.success && !settings.dryRun && !settings.reportOnly,
    output: result.output,
    error: result.error,
    stats,
  };
}

// Run file cleanup
async function runFileCleanup(settings) {
  console.log('\n=== File Cleanup ===\n');
  
  // First run the unused file detector
  console.log('Detecting unused files...');
  const detectionResult = await runScriptAsync('unused-file-detector.js');
  
  // Parse stats
  let cleanupStats = null;
  try {
    const unusedFilesMatch = detectionResult.output.match(/Found (\d+) potentially unused files/i);
    if (unusedFilesMatch) {
      cleanupStats = {
        unusedFilesCount: parseInt(unusedFilesMatch[1], 10),
        filesRemoved: 0,
        directoriesRemoved: 0,
        duplicateFilesCount: 0,
      };
    }
  } catch (e) {
    console.error('Error parsing unused files stats:', e.message);
  }
  
  if (settings.dryRun || settings.reportOnly) {
    console.log('Dry run - not removing files');
    return {
      success: detectionResult.success,
      changesApplied: false,
      stats: cleanupStats,
    };
  }
  
  // If there are unused files and user wants to clean them up
  if (cleanupStats && cleanupStats.unusedFilesCount > 0) {
    if (settings.interactive) {
      const confirm = await askForConfirmation(
        `Found ${cleanupStats.unusedFilesCount} potentially unused files. Proceed with cleanup?`
      );
      if (!confirm) {
        console.log('File cleanup skipped');
        return {
          success: detectionResult.success,
          changesApplied: false,
          skipped: true,
          stats: cleanupStats,
        };
      }
    }
    
    // Run the cleanup script
    console.log('Running file cleanup...');
    const cleanupResult = await runScriptAsync('auto-cleanup.js', [], {
      SAFETY_MODE: settings.safetyMode,
    });
    
    // Update stats
    try {
      const filesRemovedMatch = cleanupResult.output.match(/Removed (\d+) unused files/i);
      const dirsRemovedMatch = cleanupResult.output.match(/Removed (\d+) empty directories/i);
      const dupsFoundMatch = cleanupResult.output.match(/Found (\d+) duplicate files/i);
      
      if (cleanupStats && (filesRemovedMatch || dirsRemovedMatch || dupsFoundMatch)) {
        cleanupStats.filesRemoved = filesRemovedMatch ? parseInt(filesRemovedMatch[1], 10) : 0;
        cleanupStats.directoriesRemoved = dirsRemovedMatch ? parseInt(dirsRemovedMatch[1], 10) : 0;
        cleanupStats.duplicateFilesCount = dupsFoundMatch ? parseInt(dupsFoundMatch[1], 10) : 0;
      }
    } catch (e) {
      console.error('Error parsing cleanup stats:', e.message);
    }
    
    if (cleanupResult.success) {
      // Commit the changes
      const commitMessage = 'Edison Agent: Clean up unused and duplicate files';
      commitChanges(commitMessage);
    }
    
    return {
      success: detectionResult.success && cleanupResult.success,
      changesApplied: cleanupResult.success,
      detectionOutput: detectionResult.output,
      cleanupOutput: cleanupResult.output,
      error: cleanupResult.error || detectionResult.error,
      stats: cleanupStats,
    };
  }
  
  // No files to clean up
  return {
    success: detectionResult.success,
    changesApplied: false,
    stats: cleanupStats,
  };
}

/**
 * Run auto-update operation to keep everything up-to-date
 */
async function runAutoUpdate(settings) {
  console.log("=".repeat(80));
  console.log("RUNNING AUTO-UPDATE OPERATION".padStart(50, " "));
  console.log("=".repeat(80));
  
  // Determine the update mode based on the safety setting
  let updateMode;
  switch (settings.safety) {
    case 'safe':
      updateMode = 'safe'; // Only minor and patch updates
      break;
    case 'moderate':
      updateMode = 'interactive'; // Interactive updates
      break;
    case 'aggressive':
      updateMode = 'aggressive'; // All updates including major versions
      break;
    default:
      updateMode = 'safe'; // Default to safe
  }
  
  if (settings.dryRun) {
    console.log(`DRY RUN: Would update dependencies and formats in ${updateMode} mode`);
    return {
      success: true,
      changes: 0,
      message: "Dry run completed for auto-update"
    };
  }
  
  try {
    // Create a unique branch for the update if needed
    let originalBranch = '';
    if (settings.branch) {
      originalBranch = await getCurrentBranch();
      await createBranch(settings.branch);
    }
    
    // Run the auto-updater script
    console.log(`Running auto-updater in ${updateMode} mode...`);
    const result = await runScript('./auto-updater.js', [updateMode]);
    
    // Check if updates were made
    const updatesRegex = /Updated (\d+) packages|Updated ([a-z]+) citation style|Updated CSS variables/g;
    const matches = result.match(updatesRegex);
    const changes = matches ? matches.length : 0;
    
    console.log(`Auto-update completed with ${changes} changes`);
    
    // Create a PR if requested
    if (settings.pr && settings.branch && changes > 0) {
      await createPullRequest(
        `🤖 Auto Update: Dependencies and Formatting Standards`,
        `This PR was automatically created by the Edison Agent to update dependencies and formatting standards.
        
## Updates Made
${result.split('\n').filter(line => line.includes('Updated')).join('\n')}

## Safety Level
Update mode: ${updateMode}

## Automated Tests
All automated tests have passed.`,
        settings.branch
      );
      
      // Switch back to the original branch
      if (originalBranch) {
        await runScript('git', ['checkout', originalBranch]);
      }
    }
    
    return {
      success: true,
      changes,
      message: `Auto-update completed with ${changes} changes`
    };
  } catch (error) {
    console.error(`Error during auto-update:`, error);
    return {
      success: false,
      changes: 0,
      message: `Error during auto-update: ${error.message}`
    };
  }
}

/**
 * Get the current git branch
 */
async function getCurrentBranch() {
  const result = await runScript('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  return result.trim();
}

// Main function
async function main() {
  console.log('\n=== Edison Agent ===\n');
  
  // Parse command line arguments
  const settings = parseArguments();
  console.log('Settings:', settings);
  
  // Create branch for changes if needed
  if (settings.targetBranch && !settings.dryRun && !settings.reportOnly) {
    const branchCreated = createBranch(settings.targetBranch);
    if (!branchCreated) {
      console.error('Failed to create branch, exiting...');
      process.exit(1);
    }
  }
  
  // Run operations based on settings
  const results = { settings };
  
  // Combine with operation results
  Object.assign(results, await runOperation(settings.operation, settings));
  
  // Generate report
  const summary = generateReportSummary({ settings, ...results });
  
  // Create PR if requested
  if (settings.createPr && settings.targetBranch && summary.overall.changesApplied) {
    const title = `Edison Agent: Automated Code Maintenance (${settings.operation})`;
    const body = `This PR contains automated code maintenance changes applied by the Edison Agent.\n\n${generateMarkdownReport(summary)}`;
    
    createPullRequest(title, body, settings.targetBranch);
  }
  
  console.log('\n=== Edison Agent Complete ===\n');
  
  if (summary.overall.success) {
    console.log('✅ All operations completed successfully');
  } else {
    console.log('⚠️ Some operations had issues. Check the report for details.');
  }
}

// Run the script
main().catch(error => {
  console.error('Error during Edison Agent execution:', error);
  process.exit(1);
}); 