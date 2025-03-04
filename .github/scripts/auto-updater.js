#!/usr/bin/env node

/**
 * Auto Updater
 * 
 * This script automatically:
 * 1. Updates all dependencies to their latest versions
 * 2. Updates citation style formatting rules
 * 3. Checks and updates UI components
 * 4. Refreshes any external data sources
 * 
 * It's designed to run on a schedule to keep The Edison always updated.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const fetch = require('node-fetch');
const { getAllFiles, safeWriteFile } = require('./utils');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const BACKUP_DIR = path.join(PROJECT_ROOT, '.github/backups');
const CITATION_STYLES_DIR = path.join(PROJECT_ROOT, 'src/data/citation-styles');
const FORMAT_RULES_PATH = path.join(PROJECT_ROOT, 'src/utils/essayFormatter.ts');

// Remote resources
const CITATION_STYLES_REPO = 'https://api.github.com/repos/citation-style-language/styles/contents';
const FORMATTING_UPDATES_URL = 'https://api.github.com/repos/anaya-yorke/The-Edison/contents/docs/citation-styles.md';

// Tracking
const logger = {
  updates: [],
  packageUpdates: [],
  styleUpdates: [],
  uiUpdates: [],
  errors: [],
  log(message) {
    console.log(message);
    this.updates.push(message);
  },
  error(message) {
    console.error(message);
    this.errors.push(message);
  }
};

/**
 * Update all NPM dependencies
 */
async function updateDependencies(mode = 'safe') {
  logger.log('Updating dependencies...');
  
  try {
    // First backup package.json
    const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
    const backupPath = path.join(BACKUP_DIR, `package.json.${new Date().toISOString().replace(/:/g, '-')}.bak`);
    fs.copyFileSync(packageJsonPath, backupPath);
    logger.log(`Backed up package.json to ${backupPath}`);
    
    // Determine update command based on mode
    let updateCommand;
    switch (mode) {
      case 'safe':
        updateCommand = 'npm run update-deps:safe'; // Only minor and patch updates
        break;
      case 'interactive':
        updateCommand = 'npm run update-deps:interactive'; // Interactive mode
        break;
      case 'aggressive':
        updateCommand = 'npm run update-deps'; // All updates including major versions
        break;
      default:
        updateCommand = 'npm run update-deps:safe'; // Default to safe
    }
    
    // Run the update command
    logger.log(`Running ${updateCommand}...`);
    const result = execSync(updateCommand, { encoding: 'utf8', cwd: PROJECT_ROOT });
    logger.log(result);
    
    // Check for actual updates made
    const updatedPackages = result.match(/[\\s\\-]+([a-zA-Z0-9@\\/-]+)[\\s]+([\\d\\.]+)[\\s]+→[\\s]+([\\d\\.]+)/g);
    if (updatedPackages && updatedPackages.length > 0) {
      updatedPackages.forEach(pkg => {
        const parts = pkg.trim().split(/\s+/);
        logger.packageUpdates.push({
          name: parts[0],
          from: parts[1],
          to: parts[3]
        });
      });
      logger.log(`Updated ${logger.packageUpdates.length} packages`);
    } else {
      logger.log('No package updates needed.');
    }
    
    // Run npm install to apply updates
    logger.log('Running npm install to apply updates...');
    execSync('npm install', { encoding: 'utf8', cwd: PROJECT_ROOT });
    
    // Run tests to ensure everything still works
    logger.log('Running tests to ensure updates are compatible...');
    try {
      execSync('npm test', { encoding: 'utf8', cwd: PROJECT_ROOT });
      logger.log('Tests passed! Updates are compatible.');
    } catch (testError) {
      logger.error('Tests failed after updating dependencies.');
      // Revert to backup if tests fail
      logger.log('Reverting to previous package.json and reinstalling...');
      fs.copyFileSync(backupPath, packageJsonPath);
      execSync('npm install', { encoding: 'utf8', cwd: PROJECT_ROOT });
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error(`Error updating dependencies: ${error.message}`);
    return false;
  }
}

/**
 * Fetch and update citation style formatting rules
 */
async function updateCitationStyles() {
  logger.log('Updating citation style formatting rules...');
  
  try {
    // Ensure citation styles directory exists
    if (!fs.existsSync(CITATION_STYLES_DIR)) {
      fs.mkdirSync(CITATION_STYLES_DIR, { recursive: true });
    }
    
    // Fetch the latest citation styles info
    const majorStyles = ['mla', 'apa', 'chicago', 'harvard'];
    const stylesToFetch = [];
    
    // Find the latest version of each major style
    for (const style of majorStyles) {
      try {
        const response = await fetch(`${CITATION_STYLES_REPO}/${style}.csl`);
        if (response.ok) {
          const data = await response.json();
          stylesToFetch.push({
            style,
            url: data.download_url,
            sha: data.sha
          });
        }
      } catch (e) {
        logger.error(`Failed to fetch ${style} style: ${e.message}`);
      }
    }
    
    // Download and update each style
    for (const styleInfo of stylesToFetch) {
      try {
        const response = await fetch(styleInfo.url);
        if (response.ok) {
          const styleContent = await response.text();
          const stylePath = path.join(CITATION_STYLES_DIR, `${styleInfo.style}.csl`);
          
          // Check if we already have this version
          let currentSha = '';
          if (fs.existsSync(stylePath)) {
            const currentContent = fs.readFileSync(stylePath, 'utf8');
            // Simple hash check
            currentSha = require('crypto').createHash('sha1').update(currentContent).digest('hex');
          }
          
          if (currentSha !== styleInfo.sha) {
            fs.writeFileSync(stylePath, styleContent);
            logger.styleUpdates.push({
              style: styleInfo.style,
              updated: true,
              version: new Date().toISOString()
            });
            logger.log(`Updated ${styleInfo.style} citation style.`);
          } else {
            logger.log(`${styleInfo.style} citation style is already up to date.`);
          }
        }
      } catch (e) {
        logger.error(`Failed to update ${styleInfo.style} style: ${e.message}`);
      }
    }
    
    // Check if there were any updates
    return logger.styleUpdates.length > 0;
  } catch (error) {
    logger.error(`Error updating citation styles: ${error.message}`);
    return false;
  }
}

/**
 * Update formatting rules based on latest standards
 */
async function updateFormattingRules() {
  logger.log('Updating essay formatting rules...');
  
  try {
    // Fetch latest formatting guidelines from our docs
    const response = await fetch(FORMATTING_UPDATES_URL);
    if (!response.ok) {
      logger.error(`Failed to fetch formatting updates: ${response.statusText}`);
      return false;
    }
    
    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    
    // Parse the markdown content to extract formatting rules
    const formattingRules = {};
    
    // Extract style sections
    const styleSections = content.split('##').slice(1); // Skip the first part (intro)
    
    for (const section of styleSections) {
      const lines = section.trim().split('\n');
      const styleName = lines[0].trim().toLowerCase();
      
      // Skip if it's not one of our main styles
      if (!['mla', 'apa', 'chicago', 'harvard'].some(s => styleName.includes(s))) {
        continue;
      }
      
      // Extract formatting rules
      const style = {};
      let currentSection = 'general';
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // New section
        if (line.startsWith('###')) {
          currentSection = line.replace('###', '').trim().toLowerCase();
          style[currentSection] = {};
          continue;
        }
        
        // Rule line
        if (line.startsWith('- **')) {
          const match = line.match(/- \*\*([^*]+)\*\*:(.+)/);
          if (match) {
            const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
            const value = match[2].trim();
            
            if (currentSection === 'general') {
              style[key] = value;
            } else {
              style[currentSection][key] = value;
            }
          }
        }
      }
      
      // Add parsed style to our formatting rules
      const styleKey = styleName.split('(')[0].trim().toLowerCase();
      formattingRules[styleKey] = style;
    }
    
    // Now update the formatter utils with these rules
    if (Object.keys(formattingRules).length > 0) {
      // Read current formatter file
      const formatterContent = fs.readFileSync(FORMAT_RULES_PATH, 'utf8');
      
      // Look for the format rules section
      const rulesRegex = /export\s+const\s+CITATION_RULES\s*=\s*{[\s\S]*?};/;
      const rulesMatch = formatterContent.match(rulesRegex);
      
      if (rulesMatch) {
        // Generate new rules as JSON
        const newRulesJson = JSON.stringify(formattingRules, null, 2);
        const newRulesCode = `export const CITATION_RULES = ${newRulesJson};`;
        
        // Replace the rules in the file
        const updatedContent = formatterContent.replace(rulesRegex, newRulesCode);
        
        // Backup the original file
        const backupPath = path.join(BACKUP_DIR, `essayFormatter.ts.${new Date().toISOString().replace(/:/g, '-')}.bak`);
        fs.writeFileSync(backupPath, formatterContent);
        
        // Write the updated content
        fs.writeFileSync(FORMAT_RULES_PATH, updatedContent);
        logger.log('Updated essay formatting rules successfully!');
        return true;
      } else {
        logger.error('Could not locate the CITATION_RULES section in the formatter file.');
      }
    }
    
    return false;
  } catch (error) {
    logger.error(`Error updating formatting rules: ${error.message}`);
    return false;
  }
}

/**
 * Update UI components and styles 
 */
async function updateUIComponents() {
  logger.log('Checking for UI component updates...');
  
  try {
    // Make sure we have the latest design system
    const designSystemPath = path.join(PROJECT_ROOT, 'docs/design-system.md');
    if (!fs.existsSync(designSystemPath)) {
      logger.error('Design system file not found, skipping UI updates.');
      return false;
    }
    
    // Read the design system
    const designSystemContent = fs.readFileSync(designSystemPath, 'utf8');
    
    // Parse design system into usable object
    const designSystem = parseDesignSystem(designSystemContent);
    
    // Update CSS variables to match design system
    const globalCssPath = path.join(PROJECT_ROOT, 'src/styles/globals.css');
    if (fs.existsSync(globalCssPath)) {
      const cssContent = fs.readFileSync(globalCssPath, 'utf8');
      
      // Look for :root CSS variables
      const cssVarsRegex = /:root\s*{([^}]*)}/;
      const cssVarsMatch = cssContent.match(cssVarsRegex);
      
      if (cssVarsMatch) {
        let cssVars = cssVarsMatch[1];
        let updated = false;
        
        // Update color variables
        if (designSystem.colors) {
          // For each color in design system
          for (const [name, value] of Object.entries(designSystem.colors)) {
            // Convert name to CSS variable format
            const varName = `--color-${name.toLowerCase().replace(/\s+/g, '-')}`;
            
            // Check if variable exists
            const varRegex = new RegExp(`${varName}:\\s*[^;]*;`);
            if (cssContent.match(varRegex)) {
              // Update existing variable
              cssVars = cssVars.replace(varRegex, `${varName}: ${value};`);
              updated = true;
            } else {
              // Add new variable
              cssVars += `\n  ${varName}: ${value};`;
              updated = true;
            }
          }
        }
        
        // Update spacing/sizing variables (similar logic as colors)
        if (designSystem.spacing) {
          for (const [name, value] of Object.entries(designSystem.spacing)) {
            const varName = `--spacing-${name.toLowerCase()}`;
            const varRegex = new RegExp(`${varName}:\\s*[^;]*;`);
            if (cssContent.match(varRegex)) {
              cssVars = cssVars.replace(varRegex, `${varName}: ${value};`);
              updated = true;
            } else {
              cssVars += `\n  ${varName}: ${value};`;
              updated = true;
            }
          }
        }
        
        // Typography variables
        if (designSystem.typography) {
          for (const [name, fontInfo] of Object.entries(designSystem.typography)) {
            if (typeof fontInfo === 'string') {
              const varName = `--font-${name.toLowerCase()}`;
              const varRegex = new RegExp(`${varName}:\\s*[^;]*;`);
              if (cssContent.match(varRegex)) {
                cssVars = cssVars.replace(varRegex, `${varName}: ${fontInfo};`);
                updated = true;
              } else {
                cssVars += `\n  ${varName}: ${fontInfo};`;
                updated = true;
              }
            }
          }
        }
        
        // If any updates were made, write the new CSS
        if (updated) {
          const updatedCss = cssContent.replace(cssVarsRegex, `:root {${cssVars}}`);
          
          // Backup original file
          const backupPath = path.join(BACKUP_DIR, `globals.css.${new Date().toISOString().replace(/:/g, '-')}.bak`);
          fs.writeFileSync(backupPath, cssContent);
          
          // Write updated content
          fs.writeFileSync(globalCssPath, updatedCss);
          logger.log('Updated CSS variables in globals.css');
          logger.uiUpdates.push({
            file: 'globals.css',
            updated: true,
            type: 'css-variables'
          });
        }
      }
    }
    
    // Success if we made any UI updates
    return logger.uiUpdates.length > 0;
  } catch (error) {
    logger.error(`Error updating UI components: ${error.message}`);
    return false;
  }
}

/**
 * Parse design system markdown into a structured object
 */
function parseDesignSystem(content) {
  const designSystem = {
    colors: {},
    typography: {},
    spacing: {},
    breakpoints: {}
  };
  
  try {
    // Extract color information
    const colorSection = content.match(/## 🌈 Color Palette([\s\S]*?)##/);
    if (colorSection) {
      // Parse primary colors
      const primaryColors = colorSection[1].match(/### Primary Colors([\s\S]*?)###/);
      if (primaryColors) {
        // Extract each color definition (- **Name**: value)
        const colorRegex = /- \*\*([^*]+)\*\*:\s*([^(]+)/g;
        let match;
        while ((match = colorRegex.exec(primaryColors[1])) !== null) {
          const name = match[1].trim();
          // Extract just the hex code
          const value = match[2].trim().match(/(#[a-fA-F0-9]{6})/);
          if (value) {
            designSystem.colors[name] = value[1];
          }
        }
      }
      
      // Similar parsing for gradients, etc. if needed
    }
    
    // Extract typography information
    const typographySection = content.match(/## 🖋️ Typography([\s\S]*?)##/);
    if (typographySection) {
      // Extract font family information
      const fontRegex = /\*\*Font\*\*:\s*"([^"]+)"/g;
      let match;
      while ((match = fontRegex.exec(typographySection[1])) !== null) {
        const fontName = match[1].trim();
        // Just store the font name
        designSystem.typography[fontName] = `"${fontName}", sans-serif`;
      }
      
      // Extract sizing information - this could get more sophisticated
      const sizeRegex = /H(\d):\s*(\d+)px/g;
      while ((match = sizeRegex.exec(typographySection[1])) !== null) {
        designSystem.typography[`h${match[1]}`] = `${match[2]}px`;
      }
    }
    
    // Extract breakpoints
    const responsiveSection = content.match(/## 📱 Responsive Design([\s\S]*?)##/);
    if (responsiveSection) {
      const breakpointRegex = /\*\*([^*]+)\*\*:\s*(\d+px[^*]+)/g;
      let match;
      while ((match = breakpointRegex.exec(responsiveSection[1])) !== null) {
        const name = match[1].trim().toLowerCase();
        const value = match[2].trim();
        designSystem.breakpoints[name] = value;
      }
    }
    
    return designSystem;
  } catch (error) {
    logger.error(`Error parsing design system: ${error.message}`);
    return designSystem; // Return what we have so far
  }
}

/**
 * Generate a report of all updates
 */
function generateUpdateReport() {
  const timestamp = new Date().toISOString();
  const reportPath = path.join(PROJECT_ROOT, '.github/reports/auto-update-report.md');
  
  let report = `# Auto-Update Report\n\n`;
  report += `**Date:** ${new Date().toLocaleString()}\n\n`;
  
  if (logger.packageUpdates.length > 0) {
    report += `## Package Updates\n\n`;
    report += `| Package | From | To |\n`;
    report += `|---------|------|----|\n`;
    logger.packageUpdates.forEach(pkg => {
      report += `| ${pkg.name} | ${pkg.from} | ${pkg.to} |\n`;
    });
    report += `\n`;
  } else {
    report += `## Package Updates\n\nNo package updates were made at this time.\n\n`;
  }
  
  if (logger.styleUpdates.length > 0) {
    report += `## Citation Style Updates\n\n`;
    report += `| Style | Updated | Version |\n`;
    report += `|-------|---------|--------|\n`;
    logger.styleUpdates.forEach(style => {
      report += `| ${style.style} | ${style.updated ? '✅' : '❌'} | ${style.version} |\n`;
    });
    report += `\n`;
  } else {
    report += `## Citation Style Updates\n\nNo citation style updates were made at this time.\n\n`;
  }
  
  if (logger.uiUpdates.length > 0) {
    report += `## UI Updates\n\n`;
    report += `| File | Type | Updated |\n`;
    report += `|------|------|--------|\n`;
    logger.uiUpdates.forEach(update => {
      report += `| ${update.file} | ${update.type} | ${update.updated ? '✅' : '❌'} |\n`;
    });
    report += `\n`;
  } else {
    report += `## UI Updates\n\nNo UI updates were made at this time.\n\n`;
  }
  
  if (logger.errors.length > 0) {
    report += `## Errors\n\n`;
    logger.errors.forEach(error => {
      report += `- ${error}\n`;
    });
    report += `\n`;
  }
  
  // Ensure reports directory exists
  const reportsDir = path.dirname(reportPath);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Write the report
  fs.writeFileSync(reportPath, report);
  console.log(`Update report saved to: ${reportPath}`);
  
  return reportPath;
}

/**
 * Run tests to ensure updates haven't broken anything
 */
async function runTests() {
  logger.log('Running tests to verify updates...');
  
  try {
    execSync('npm test', { encoding: 'utf8', cwd: PROJECT_ROOT });
    logger.log('All tests passed! Updates are compatible.');
    return true;
  } catch (error) {
    logger.error(`Tests failed after updates: ${error.message}`);
    return false;
  }
}

/**
 * Commit changes to git
 */
function commitChanges() {
  logger.log('Committing changes to git...');
  
  try {
    // Check if there are changes to commit
    const status = execSync('git status --porcelain', { encoding: 'utf8', cwd: PROJECT_ROOT }).trim();
    if (!status) {
      logger.log('No changes to commit.');
      return false;
    }
    
    // Add all changes
    execSync('git add .', { encoding: 'utf8', cwd: PROJECT_ROOT });
    
    // Create commit message
    let commitMessage = 'Update: ';
    
    if (logger.packageUpdates.length > 0) {
      commitMessage += `updated ${logger.packageUpdates.length} packages, `;
    }
    
    if (logger.styleUpdates.length > 0) {
      commitMessage += `updated ${logger.styleUpdates.length} citation styles, `;
    }
    
    if (logger.uiUpdates.length > 0) {
      commitMessage += `updated ${logger.uiUpdates.length} UI components, `;
    }
    
    // Trim trailing comma and space
    commitMessage = commitMessage.replace(/, $/, '');
    
    // Commit
    execSync(`git commit -m "${commitMessage}"`, { encoding: 'utf8', cwd: PROJECT_ROOT });
    logger.log(`Changes committed with message: ${commitMessage}`);
    
    return true;
  } catch (error) {
    logger.error(`Error committing changes: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting auto-updater...');
  
  // Create backups directory if it doesn't exist
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  // Get update mode from command line
  const args = process.argv.slice(2);
  const mode = args[0] || 'safe';
  
  // Update packages
  const packagesUpdated = await updateDependencies(mode);
  
  // Update citation styles
  const stylesUpdated = await updateCitationStyles();
  
  // Update formatting rules
  const formattingUpdated = await updateFormattingRules();
  
  // Update UI components
  const uiUpdated = await updateUIComponents();
  
  // Run tests to make sure everything is working
  if (packagesUpdated || stylesUpdated || formattingUpdated || uiUpdated) {
    const testsPass = await runTests();
    
    if (testsPass) {
      // Commit changes
      await commitChanges();
    } else {
      logger.log('Tests failed. Not committing changes.');
    }
  } else {
    logger.log('No updates were made.');
  }
  
  // Generate update report
  const reportPath = generateUpdateReport();
  logger.log(`Update report generated at ${reportPath}`);
  
  console.log('Auto-updater complete!');
}

// Run the script
main().catch(error => {
  console.error('Error during auto-update:', error);
  process.exit(1);
}); 