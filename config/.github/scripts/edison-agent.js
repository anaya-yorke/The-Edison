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
 *   deploy-fix          Run deployment fixer
 *   restructure         Run mini organizer
 * 
 * Flags:
 *   --dry-run           Don't apply changes, just report what would be done
 *   --safety=<level>    Set safety level (safe, moderate, aggressive)
 *   --pr                Create a PR with the changes
 *   --branch=<name>     Create changes on a specific branch
 *   --no-commit         Skip committing changes
 *   --verbose           Show detailed output
 *   --target=<project>  Specify a target project for deployment fixes
 *   --yield-to-cursor   Automatically yield to cursor agent if active
 *   --memory-limit=<MB> Set memory limit in MB (default: 500)
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const readline = require('readline');
const os = require('os');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const SCRIPTS_DIR = path.resolve(__dirname);
const REPORT_DIR = path.join(PROJECT_ROOT, 'config/.github/reports');
const STATE_FILE = path.join(PROJECT_ROOT, 'config/.github/.edison-agent-state.json');

// Import utilities
const { ensureDirectoryExists } = require('./utils');

// Settings
const DEFAULT_SETTINGS = {
  dryRun: true,            // Changed default to true - don't apply changes without explicit approval
  safetyMode: 'safe',      // Safety level: safe, moderate, aggressive
  createPr: true,          // Create PR by default instead of direct commits
  targetBranch: '',        // Target branch for changes
  operation: 'report',     // Changed default to 'report' instead of 'full'
  quiet: false,            // Suppress most output
  interactive: true,       // Ask for confirmation before making changes
  reportOnly: false,       // Only generate reports, don't make changes
  autoCommit: false,       // Changed to false - don't commit changes automatically
  yieldToCursor: true,     // Yield to cursor agent if detected
  memoryLimit: 400,        // Reduced memory limit in MB
  politeMode: true,        // New setting for more respectful messaging
};

// =================================
// Permission Management Subsystem
// =================================

const PermissionManager = {
  // Check if cursor agent is active
  isCursorAgentActive: function() {
    try {
      // Try to detect cursor agent by checking for cursor-specific processes
      // This is a simplified example - adapt based on your detection needs
      const processes = execSync('ps aux').toString();
      return processes.includes('cursor-agent') || 
             // Check for lock files or environment variables
             (process.env.CURSOR_AGENT_ACTIVE === 'true') ||
             fs.existsSync(path.join(os.homedir(), '.cursor-agent.lock'));
    } catch (e) {
      console.log('Error detecting cursor agent:', e.message);
      return false;
    }
  },
  
  // Check if action is allowed
  canPerformAction: function(settings) {
    if (settings.yieldToCursor && this.isCursorAgentActive()) {
      console.log('⚠️ Cursor agent detected. Yielding priority...');
      return false;
    }
    return true;
  }
};

// =================================
// Memory Management Subsystem
// =================================

const MemoryManager = {
  // Check current memory usage
  getCurrentMemoryUsage: function() {
    const used = process.memoryUsage();
    return {
      rss: Math.round(used.rss / 1024 / 1024), // RSS in MB
      heapTotal: Math.round(used.heapTotal / 1024 / 1024), // Heap total in MB
      heapUsed: Math.round(used.heapUsed / 1024 / 1024), // Heap used in MB
      external: Math.round(used.external / 1024 / 1024), // External in MB
    };
  },
  
  // Check if memory usage exceeds limit
  isMemoryExceeded: function(limit) {
    const usage = this.getCurrentMemoryUsage();
    return usage.rss > limit * 0.8; // Add 20% buffer to be more conservative
  },
  
  // Try to free memory
  attemptMemoryCleanup: function() {
    // Force garbage collection if available
    if (global.gc) {
      console.log('Forcing garbage collection...');
      global.gc();
    }
    
    // Log the new memory usage
    console.log('Memory usage after cleanup:', this.getCurrentMemoryUsage());
  },
  
  // Monitor memory periodically during long operations
  startMemoryMonitor: function(limit) {
    const interval = setInterval(() => {
      if (this.isMemoryExceeded(limit)) {
        console.log(`⚠️ Memory approaching limit of ${limit}MB! Current usage:`, this.getCurrentMemoryUsage());
        this.attemptMemoryCleanup();
      }
    }, 3000); // Check more frequently - every 3 seconds
    
    return interval;
  },
  
  // Stop memory monitoring
  stopMemoryMonitor: function(intervalId) {
    if (intervalId) {
      clearInterval(intervalId);
    }
  },
  
  // New: Apply data-saving measures
  applyDataSavingMeasures: function() {
    // Limit max concurrent operations
    process.env.MAX_CONCURRENT_OPERATIONS = '2';
    
    // Use smaller buffers
    process.env.NODE_OPTIONS = '--max-old-space-size=256';
    
    console.log('Applied data-saving measures');
    return true;
  }
};

// =================================
// Deployment Management Subsystem
// =================================

const DeploymentManager = {
  MAX_RETRIES: 5,
  BASE_DELAY: 60000, // 1 minute base delay
  
  // State
  state: {
    deploymentAttempts: {},
    failedDeployments: {}
  },
  
  // Load state from file
  loadState: function() {
    try {
      if (fs.existsSync(STATE_FILE)) {
        const data = fs.readFileSync(STATE_FILE, 'utf8');
        this.state = JSON.parse(data);
        console.log('Loaded deployment state');
      }
    } catch (e) {
      console.error('Error loading deployment state:', e.message);
    }
    return this.state;
  },
  
  // Save state to file
  saveState: function() {
    try {
      ensureDirectoryExists(path.dirname(STATE_FILE));
      fs.writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2));
    } catch (e) {
      console.error('Error saving deployment state:', e.message);
    }
  },
  
  // Record a deployment attempt
  recordDeployment: function(operation, success) {
    const now = Date.now();
    
    if (!this.state.deploymentAttempts[operation]) {
      this.state.deploymentAttempts[operation] = [];
    }
    
    // Add this attempt
    this.state.deploymentAttempts[operation].push({
      timestamp: now,
      success
    });
    
    // Limit history to last 20 attempts
    if (this.state.deploymentAttempts[operation].length > 20) {
      this.state.deploymentAttempts[operation].shift();
    }
    
    // Update failed deployments count
    if (!success) {
      if (!this.state.failedDeployments[operation]) {
        this.state.failedDeployments[operation] = {
          count: 0,
          lastFailure: 0
        };
      }
      
      this.state.failedDeployments[operation].count++;
      this.state.failedDeployments[operation].lastFailure = now;
    } else {
      // Reset failures on success
      if (this.state.failedDeployments[operation]) {
        this.state.failedDeployments[operation].count = 0;
      }
    }
    
    this.saveState();
  },
  
  // Check if operation should be allowed based on failures
  canDeploy: function(operation) {
    const failures = this.state.failedDeployments?.[operation];
    
    if (!failures || failures.count === 0) {
      return true; // No failures, proceed
    }
    
    // Calculate backoff delay based on failure count
    const backoffDelay = this.calculateBackoff(failures.count);
    const now = Date.now();
    const timeSinceLastFailure = now - failures.lastFailure;
    
    if (timeSinceLastFailure < backoffDelay) {
      const remainingTime = Math.ceil((backoffDelay - timeSinceLastFailure) / 60000);
      console.log(`⚠️ Operation "${operation}" is cooling down after ${failures.count} failures.`);
      console.log(`Try again in approximately ${remainingTime} minute(s).`);
      return false;
    }
    
    return true;
  },
  
  // Calculate exponential backoff delay
  calculateBackoff: function(failureCount) {
    // Exponential backoff: 1min, 2min, 4min, 8min, 16min, ...
    const minutes = Math.min(Math.pow(2, failureCount - 1), 240); // Cap at 4 hours
    return minutes * 60 * 1000; // Convert to milliseconds
  }
};

// Load deployment state at startup
DeploymentManager.loadState();

// =================================
// Original agent code with enhancements
// =================================

// Helper functions (existing)
// (Keep your existing helper functions)

// Existing parseArguments function with new arguments
function parseArguments() {
  const args = process.argv.slice(2);
  const settings = { ...DEFAULT_SETTINGS };

  // First non-flag argument is the operation
  if (args.length > 0 && !args[0].startsWith('-')) {
    settings.operation = args[0];
    
    if (settings.operation === 'report') {
      settings.reportOnly = true;
    }
  }
  
  // Process flags
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--dry-run') {
      settings.dryRun = true;
    } else if (arg === '--pr') {
      settings.createPr = true;
    } else if (arg === '--no-commit') {
      settings.autoCommit = false;
    } else if (arg === '--verbose') {
      settings.quiet = false;
    } else if (arg.startsWith('--safety=')) {
      settings.safetyMode = arg.split('=')[1];
    } else if (arg.startsWith('--branch=')) {
      settings.targetBranch = arg.split('=')[1];
    } else if (arg.startsWith('--target=')) {
      settings.targetProject = arg.split('=')[1];
    } else if (arg === '--no-interactive') {
      settings.interactive = false;
    } else if (arg.startsWith('--memory-limit=')) {
      const limit = parseInt(arg.split('=')[1], 10);
      if (!isNaN(limit) && limit > 0) {
        settings.memoryLimit = limit;
      }
    } else if (arg === '--no-yield') {
      settings.yieldToCursor = false;
    }
  }
  
  return settings;
}

// Enhanced commit function with deployment tracking
function commitChanges(message, isDeployment = false) {
  if (!process.env.CI) {
    try {
      // Check if there are changes to commit
      const status = execSync('git status --porcelain').toString();
      
      if (status.trim() === '') {
        console.log('No changes to commit');
        return false;
      }
      
      // Add and commit changes
      execSync('git add .');
      execSync(`git commit -m "${message}"`);
      
      console.log('Changes committed successfully');
      
      if (isDeployment) {
        // Record successful deployment
        DeploymentManager.recordDeployment(message, true);
      }
      
      return true;
    } catch (error) {
      console.error('Error committing changes:', error.message);
      
      if (isDeployment) {
        // Record failed deployment
        DeploymentManager.recordDeployment(message, false);
      }
      
      return false;
    }
  } else {
    console.log('Running in CI environment, skipping commit');
    return true;
  }
}

// Enhanced runOperation function with permission and memory checks
async function runOperation(settings) {
  // Apply data saving measures
  MemoryManager.applyDataSavingMeasures();
  
  // Start memory monitor with reduced limit
  const memMonitor = MemoryManager.startMemoryMonitor(settings.memoryLimit * 0.8);
  
  // Check if cursor agent is active before proceeding
  if (!PermissionManager.canPerformAction(settings)) {
    MemoryManager.stopMemoryMonitor(memMonitor);
    return {
      cursorYield: {
        success: false,
        message: 'Operation skipped because cursor agent is active',
        changesApplied: false,
      }
    };
  }
  
  // Check deployment manager for cooldown periods
  if (!DeploymentManager.canDeploy(settings.operation)) {
    MemoryManager.stopMemoryMonitor(memMonitor);
    return {
      deploymentCooling: {
        success: false,
        message: 'Operation in cooldown period due to previous failures',
        changesApplied: false,
      }
    };
  }

  try {
    // Run the selected operation
    const results = {};
    
    switch (settings.operation) {
      case 'organize':
        results.organize = await runOrganizer(settings);
        break;
      case 'fix':
        results.bugFix = await runBugFixer(settings);
        break;
      case 'ui':
        results.uiImprovement = await runUIImprover(settings);
        break;
      case 'cleanup':
        results.fileCleanup = await runUnusedFileDetector(settings);
        break;
      case 'report':
        // Only generate a report without making changes
        results.organize = await runOrganizer({ ...settings, dryRun: true });
        results.bugFix = await runBugFixer({ ...settings, dryRun: true });
        results.uiImprovement = await runUIImprover({ ...settings, dryRun: true });
        results.fileCleanup = await runUnusedFileDetector({ ...settings, dryRun: true });
        break;
      case 'update':
        results.update = await runAutoUpdate(settings);
        break;
      case 'deploy-fix':
        results.deployFix = await runDeploymentFixer(settings);
        break;
      case 'restructure':
        results.restructure = await runMiniOrganizer(settings);
        break;
      case 'full':
      default:
        // Run all operations
        results.organize = await runOrganizer(settings);
        
        // After each operation, check memory usage
        if (MemoryManager.isMemoryExceeded(settings.memoryLimit)) {
          MemoryManager.attemptMemoryCleanup();
        }
        
        results.bugFix = await runBugFixer(settings);
        
        if (MemoryManager.isMemoryExceeded(settings.memoryLimit)) {
          MemoryManager.attemptMemoryCleanup();
        }
        
        results.uiImprovement = await runUIImprover(settings);
        
        if (MemoryManager.isMemoryExceeded(settings.memoryLimit)) {
          MemoryManager.attemptMemoryCleanup();
        }
        
        results.fileCleanup = await runUnusedFileDetector(settings);
        break;
    }
    
    // Record deployment result for the operation
    const deploymentSuccessful = Object.values(results).every(r => r.success === true);
    DeploymentManager.recordDeployment(settings.operation, deploymentSuccessful);
    
    return results;
  } finally {
    // Stop memory monitoring
    MemoryManager.stopMemoryMonitor(memMonitor);
  }
}

// Enhanced main function
async function main() {
  console.log('\n=== Edison Agent ===\n');
  
  // Parse command line arguments
  const settings = parseArguments();
  console.log('Settings:', settings);
  
  // Log current memory usage at start
  console.log('Initial memory usage:', MemoryManager.getCurrentMemoryUsage());
  
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
  Object.assign(results, await runOperation(settings));
  
  // Generate report
  const summary = generateReportSummary({ settings, ...results });
  
  // Create PR if requested
  if (settings.createPr && settings.targetBranch && summary.overall.changesApplied) {
    const title = `Edison Agent: Automated Code Maintenance (${settings.operation})`;
    const body = `This PR contains automated code maintenance changes applied by the Edison Agent.\n\n${generateMarkdownReport(summary)}`;
    
    createPullRequest(title, body, settings.targetBranch);
  }
  
  // Final memory usage
  console.log('Final memory usage:', MemoryManager.getCurrentMemoryUsage());
  
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
  
  // Record deployment failure
  DeploymentManager.recordDeployment('main', false);
  
  process.exit(1);
});

// Add this function somewhere appropriate, like after parseArguments() function
function formatMessage(message, settings) {
  if (settings.politeMode) {
    // Replace forceful language with more respectful alternatives
    return message
      .replace(/automatically (fixed|resolved|detected)/gi, "suggested fixes for")
      .replace(/fixing|resolving/gi, "addressing")
      .replace(/detected and fixed/gi, "identified potential issues with")
      .replace(/^(!|❗)/gi, "Note:")
      .replace(/must|should|need to/gi, "may want to consider")
      .replace(/automatically/gi, "as requested");
  }
  return message;
}

// Then find places where the agent outputs messages and wrap them in formatMessage
// For example, in the log or console.log functions:

// Add this near the top with other utility functions
const log = (message, settings, level = 'info') => {
  const formattedMessage = formatMessage(message, settings);
  if (level === 'error') {
    console.error(formattedMessage);
  } else if (level === 'warn') {
    console.warn(formattedMessage);
  } else {
    console.log(formattedMessage);
  }
}; 