#!/usr/bin/env node

/**
 * UI Consistency Checker
 * 
 * This script analyzes the UI components and CSS styles to identify and fix:
 * 1. Inconsistent color usage
 * 2. Font size inconsistencies
 * 3. Spacing inconsistencies
 * 4. Missing responsive styles
 * 5. Inconsistent UI component patterns
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const DESIGN_SYSTEM_SPEC = path.join(PROJECT_ROOT, 'docs/design-system.md');

// Extract design system information if available
let designSystem = {
  colors: {},
  fonts: {},
  spacing: {},
  breakpoints: {},
};

// Try to extract design system from the spec file
if (fs.existsSync(DESIGN_SYSTEM_SPEC)) {
  try {
    const content = fs.readFileSync(DESIGN_SYSTEM_SPEC, 'utf8');
    
    // Extract colors
    const colorSectionMatch = content.match(/### Primary Colors([\s\S]*?)(?=###|$)/);
    if (colorSectionMatch) {
      const colorSection = colorSectionMatch[1];
      const colorMatches = colorSection.match(/\*\*(.*?)\*\*:\s*(.*?)\s*\((#[0-9A-Fa-f]{3,8})/g);
      
      if (colorMatches) {
        colorMatches.forEach(match => {
          const parts = match.match(/\*\*(.*?)\*\*:\s*(.*?)\s*\((#[0-9A-Fa-f]{3,8})/);
          if (parts && parts.length >= 4) {
            const key = parts[1].trim().replace(/\s+/g, '-').toLowerCase();
            designSystem.colors[key] = parts[3].trim();
          }
        });
      }
    }
    
    // Extract typography
    const typographyMatch = content.match(/### Headings([\s\S]*?)(?=###|$)/);
    if (typographyMatch) {
      const typographySection = typographyMatch[1];
      const fontMatches = typographySection.match(/\*\*Font\*\*:\s*"([^"]+)"/);
      
      if (fontMatches && fontMatches.length >= 2) {
        designSystem.fonts.heading = fontMatches[1].trim();
      }
      
      const sizeMatches = typographySection.match(/H\d:\s*(\d+)px/g);
      if (sizeMatches) {
        sizeMatches.forEach(match => {
          const parts = match.match(/H(\d):\s*(\d+)px/);
          if (parts && parts.length >= 3) {
            designSystem.fonts[`h${parts[1]}`] = `${parts[2]}px`;
          }
        });
      }
    }
    
    // Extract body typography
    const bodyTypographyMatch = content.match(/### Body Text([\s\S]*?)(?=###|$)/);
    if (bodyTypographyMatch) {
      const bodySection = bodyTypographyMatch[1];
      const fontMatches = bodySection.match(/\*\*Font\*\*:\s*"([^"]+)"/);
      
      if (fontMatches && fontMatches.length >= 2) {
        designSystem.fonts.body = fontMatches[1].trim();
      }
      
      const sizeMatches = bodySection.match(/Body:\s*(\d+)px|Small:\s*(\d+)px|Caption:\s*(\d+)px/g);
      if (sizeMatches) {
        sizeMatches.forEach(match => {
          if (match.includes('Body:')) {
            const size = match.match(/Body:\s*(\d+)px/)[1];
            designSystem.fonts.body = `${size}px`;
          } else if (match.includes('Small:')) {
            const size = match.match(/Small:\s*(\d+)px/)[1];
            designSystem.fonts.small = `${size}px`;
          } else if (match.includes('Caption:')) {
            const size = match.match(/Caption:\s*(\d+)px/)[1];
            designSystem.fonts.caption = `${size}px`;
          }
        });
      }
    }
    
    // Extract breakpoints
    const breakpointsMatch = content.match(/### Breakpoints([\s\S]*?)(?=###|$)/);
    if (breakpointsMatch) {
      const breakpointsSection = breakpointsMatch[1];
      const mobileMatch = breakpointsSection.match(/\*\*Mobile\*\*:\s*(\d+)px\s*-\s*(\d+)px/);
      const tabletMatch = breakpointsSection.match(/\*\*Tablet\*\*:\s*(\d+)px\s*-\s*(\d+)px/);
      const desktopMatch = breakpointsSection.match(/\*\*Desktop\*\*:\s*(\d+)px\+/);
      
      if (mobileMatch) {
        designSystem.breakpoints.mobile = {
          min: parseInt(mobileMatch[1]),
          max: parseInt(mobileMatch[2]),
        };
      }
      
      if (tabletMatch) {
        designSystem.breakpoints.tablet = {
          min: parseInt(tabletMatch[1]),
          max: parseInt(tabletMatch[2]),
        };
      }
      
      if (desktopMatch) {
        designSystem.breakpoints.desktop = {
          min: parseInt(desktopMatch[1]),
        };
      }
    }
    
    console.log('Extracted design system specifications:', JSON.stringify(designSystem, null, 2));
  } catch (e) {
    console.error('Error extracting design system:', e.message);
  }
}

// Find all CSS files
function findAllCssFiles() {
  return glob.sync('**/*.{css,scss}', {
    cwd: SRC_DIR,
    ignore: ['**/node_modules/**', '**/.git/**'],
  });
}

// Find all component files
function findAllComponentFiles() {
  return glob.sync('**/*.{tsx,jsx}', {
    cwd: SRC_DIR,
    ignore: ['**/node_modules/**', '**/.git/**', '**/pages/**/*.tsx'],
  });
}

// Extract colors from CSS files
function extractColorsFromCss(files) {
  const colorMap = new Map();
  const hexColorRegex = /#[0-9A-Fa-f]{3,8}\b/g;
  const rgbColorRegex = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)/g;
  const hslColorRegex = /hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(?:,\s*[\d.]+\s*)?\)/g;
  
  files.forEach(file => {
    const fullPath = path.join(SRC_DIR, file);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Extract hex colors
      let match;
      while ((match = hexColorRegex.exec(content)) !== null) {
        const color = match[0].toLowerCase();
        colorMap.set(color, (colorMap.get(color) || 0) + 1);
      }
      
      // Extract RGB colors
      while ((match = rgbColorRegex.exec(content)) !== null) {
        const color = match[0].toLowerCase();
        colorMap.set(color, (colorMap.get(color) || 0) + 1);
      }
      
      // Extract HSL colors
      while ((match = hslColorRegex.exec(content)) !== null) {
        const color = match[0].toLowerCase();
        colorMap.set(color, (colorMap.get(color) || 0) + 1);
      }
    } catch (e) {
      console.error(`Error reading file ${file}:`, e.message);
    }
  });
  
  return colorMap;
}

// Extract font styles from CSS files
function extractFontStylesFromCss(files) {
  const fontMap = new Map();
  const fontSizeRegex = /font-size\s*:\s*([\d.]+)(?:px|rem|em|pt)/g;
  const fontFamilyRegex = /font-family\s*:\s*([^;]+)/g;
  
  files.forEach(file => {
    const fullPath = path.join(SRC_DIR, file);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Extract font sizes
      let match;
      while ((match = fontSizeRegex.exec(content)) !== null) {
        const fontSize = match[1];
        fontMap.set(`font-size:${fontSize}`, (fontMap.get(`font-size:${fontSize}`) || 0) + 1);
      }
      
      // Extract font families
      while ((match = fontFamilyRegex.exec(content)) !== null) {
        const fontFamily = match[1].trim();
        fontMap.set(`font-family:${fontFamily}`, (fontMap.get(`font-family:${fontFamily}`) || 0) + 1);
      }
    } catch (e) {
      console.error(`Error reading file ${file}:`, e.message);
    }
  });
  
  return fontMap;
}

// Check for responsive design issues
function checkResponsiveDesign(files) {
  const issues = [];
  const mediaQueryRegex = /@media\s*\([^)]+\)/g;
  
  files.forEach(file => {
    const fullPath = path.join(SRC_DIR, file);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check if file has media queries
      const hasMediaQueries = mediaQueryRegex.test(content);
      
      if (!hasMediaQueries && file.endsWith('.css')) {
        issues.push({
          file,
          issue: 'No media queries found',
          suggestion: 'Add responsive styles for mobile and tablet viewports',
        });
      }
    } catch (e) {
      console.error(`Error reading file ${file}:`, e.message);
    }
  });
  
  return issues;
}

// Fix color inconsistencies
function fixColorInconsistencies(file, colorMap, designSystem) {
  const fullPath = path.join(SRC_DIR, file);
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    let changed = false;
    
    // Get a list of similar colors (colors that are very close to each other)
    const colorEntries = Array.from(colorMap.entries());
    for (let i = 0; i < colorEntries.length; i++) {
      const [color, count] = colorEntries[i];
      
      // Skip colors that are used widely (likely intentional)
      if (count > 5) continue;
      
      // Find a similar color in the design system
      let closestMatch = null;
      let closestDistance = Infinity;
      
      for (const [name, designColor] of Object.entries(designSystem.colors)) {
        const distance = calculateColorDistance(color, designColor);
        if (distance < closestDistance && distance < 30) { // Threshold for similarity
          closestDistance = distance;
          closestMatch = designColor;
        }
      }
      
      // Replace the color with the design system color
      if (closestMatch) {
        const escapedColor = color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedColor, 'g');
        content = content.replace(regex, closestMatch);
        changed = true;
      }
    }
    
    if (changed && content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Fixed color inconsistencies in: ${file}`);
      return true;
    }
    
    return false;
  } catch (e) {
    console.error(`Error processing file ${file}:`, e.message);
    return false;
  }
}

// Fix font inconsistencies
function fixFontInconsistencies(file, fontMap, designSystem) {
  const fullPath = path.join(SRC_DIR, file);
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    let changed = false;
    
    // Replace non-standard font sizes with the closest design system font size
    const fontSizes = [];
    for (const [key, value] of fontMap.entries()) {
      if (key.startsWith('font-size:')) {
        fontSizes.push({
          size: key.replace('font-size:', ''),
          count: value,
        });
      }
    }
    
    for (const { size, count } of fontSizes) {
      // Skip widely used font sizes (likely intentional)
      if (count > 5) continue;
      
      // Find closest design system font size
      let closestMatch = null;
      let closestDistance = Infinity;
      
      for (const [name, designSize] of Object.entries(designSystem.fonts)) {
        if (typeof designSize === 'string' && designSize.includes('px')) {
          const sizePx = parseInt(designSize.replace('px', ''));
          const currentSize = parseInt(size);
          const distance = Math.abs(sizePx - currentSize);
          
          if (distance < closestDistance && distance <= 2) { // Within 2px
            closestDistance = distance;
            closestMatch = designSize;
          }
        }
      }
      
      // Replace the font size with the design system font size
      if (closestMatch) {
        const regex = new RegExp(`font-size\\s*:\\s*${size}(?:px|rem|em|pt)`, 'g');
        content = content.replace(regex, `font-size: ${closestMatch}`);
        changed = true;
      }
    }
    
    if (changed && content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Fixed font inconsistencies in: ${file}`);
      return true;
    }
    
    return false;
  } catch (e) {
    console.error(`Error processing file ${file}:`, e.message);
    return false;
  }
}

// Add missing responsive styles
function addResponsiveStyles(file, designSystem) {
  const fullPath = path.join(SRC_DIR, file);
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // Check if the file already has media queries
    const hasMediaQueries = /@media\s*\([^)]+\)/.test(content);
    
    if (!hasMediaQueries && file.endsWith('.css')) {
      // Add basic responsive media queries at the end of the file
      const mobileMax = designSystem.breakpoints.mobile?.max || 767;
      const tabletMin = designSystem.breakpoints.tablet?.min || 768;
      const tabletMax = designSystem.breakpoints.tablet?.max || 1023;
      const desktopMin = designSystem.breakpoints.desktop?.min || 1024;
      
      const responsiveTemplate = `\n\n/* Responsive styles added by UI consistency checker */\n@media (max-width: ${mobileMax}px) {\n  /* Mobile styles */\n}\n\n@media (min-width: ${tabletMin}px) and (max-width: ${tabletMax}px) {\n  /* Tablet styles */\n}\n\n@media (min-width: ${desktopMin}px) {\n  /* Desktop styles */\n}\n`;
      
      content += responsiveTemplate;
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Added responsive media queries to: ${file}`);
      return true;
    }
    
    return false;
  } catch (e) {
    console.error(`Error processing file ${file}:`, e.message);
    return false;
  }
}

// Calculate distance between two colors
function calculateColorDistance(color1, color2) {
  // Convert to RGB
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return Infinity;
  
  // Calculate Euclidean distance
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
}

// Convert hex color to RGB
function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Main function
async function main() {
  console.log('Starting UI consistency check...');
  
  // Find all CSS and component files
  const cssFiles = findAllCssFiles();
  const componentFiles = findAllComponentFiles();
  
  console.log(`Found ${cssFiles.length} CSS files and ${componentFiles.length} component files`);
  
  // Extract colors and font styles
  const colorMap = extractColorsFromCss(cssFiles);
  const fontMap = extractFontStylesFromCss(cssFiles);
  
  console.log(`Found ${colorMap.size} unique colors and ${fontMap.size} unique font styles`);
  
  // Check for responsive design issues
  const responsiveIssues = checkResponsiveDesign(cssFiles);
  console.log(`Found ${responsiveIssues.length} files with potential responsive design issues`);
  
  // Fix issues
  let fixedColorCount = 0;
  let fixedFontCount = 0;
  let addedResponsiveCount = 0;
  
  // Fix color inconsistencies
  cssFiles.forEach(file => {
    if (fixColorInconsistencies(file, colorMap, designSystem)) {
      fixedColorCount++;
    }
  });
  
  // Fix font inconsistencies
  cssFiles.forEach(file => {
    if (fixFontInconsistencies(file, fontMap, designSystem)) {
      fixedFontCount++;
    }
  });
  
  // Add missing responsive styles
  responsiveIssues.forEach(({ file }) => {
    if (addResponsiveStyles(file, designSystem)) {
      addedResponsiveCount++;
    }
  });
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    cssFilesAnalyzed: cssFiles.length,
    componentFilesAnalyzed: componentFiles.length,
    uniqueColors: colorMap.size,
    uniqueFontStyles: fontMap.size,
    responsiveIssuesFound: responsiveIssues.length,
    fixes: {
      colorInconsistenciesFixed: fixedColorCount,
      fontInconsistenciesFixed: fixedFontCount,
      responsiveStylesAdded: addedResponsiveCount,
    },
  };
  
  const reportPath = path.join(PROJECT_ROOT, '.github/ui-consistency-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`UI consistency report saved to: ${reportPath}`);
  
  // Success summary
  console.log('\nUI Consistency Check Summary:');
  console.log(`- Color inconsistencies fixed: ${fixedColorCount}`);
  console.log(`- Font inconsistencies fixed: ${fixedFontCount}`);
  console.log(`- Responsive styles added: ${addedResponsiveCount}`);
  
  console.log('\nUI consistency check complete!');
}

// Run the script
main().catch(error => {
  console.error('Error during UI consistency check:', error);
  process.exit(1);
}); 