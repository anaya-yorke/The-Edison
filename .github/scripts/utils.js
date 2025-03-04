/**
 * Utility functions for Edison Agent scripts
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Ensures that a directory exists, creating it if necessary
 * @param {string} dirPath - The directory path to check/create
 * @returns {boolean} True if directory exists or was created successfully
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      return true;
    } catch (error) {
      console.error(`Error creating directory ${dirPath}:`, error.message);
      return false;
    }
  }
  return true;
}

/**
 * Calculates a SHA-256 hash for a file's contents
 * @param {string} filePath - Path to the file
 * @returns {string|null} SHA-256 hash as hex string, or null if error
 */
function getFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  } catch (error) {
    console.error(`Error hashing file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Gets all files in a directory recursively
 * @param {string} dir - The directory to search
 * @param {RegExp} [ignore] - Optional regex pattern to ignore
 * @returns {string[]} Array of file paths
 */
function getAllFiles(dir, ignore = null) {
  let results = [];
  
  if (!fs.existsSync(dir)) return results;
  
  const list = fs.readdirSync(dir);
  
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // Skip ignored paths
    if (ignore && ignore.test(filePath)) {
      continue;
    }
    
    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, ignore));
    } else {
      results.push(filePath);
    }
  }
  
  return results;
}

/**
 * Checks if a string could be valid JSON
 * @param {string} str - String to check
 * @returns {boolean} True if string is valid JSON
 */
function isValidJson(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Takes a backup of a file before modifying it
 * @param {string} filePath - Path to the file
 * @param {string} backupDir - Directory to store backups
 * @returns {string|null} Path to the backup file, or null if failed
 */
function backupFile(filePath, backupDir) {
  ensureDirectoryExists(backupDir);
  
  const fileName = path.basename(filePath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `${fileName}.${timestamp}.bak`);
  
  try {
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  } catch (error) {
    console.error(`Error backing up file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Safely writes content to a file with backup
 * @param {string} filePath - Path to write to
 * @param {string} content - Content to write
 * @param {string} backupDir - Directory for backups
 * @returns {boolean} True if successful
 */
function safeWriteFile(filePath, content, backupDir) {
  if (fs.existsSync(filePath)) {
    const backup = backupFile(filePath, backupDir);
    if (!backup) {
      return false;
    }
  } else {
    ensureDirectoryExists(path.dirname(filePath));
  }
  
  try {
    fs.writeFileSync(filePath, content);
    return true;
  } catch (error) {
    console.error(`Error writing to file ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Formats a file size in bytes to a human-readable string
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = {
  ensureDirectoryExists,
  getFileHash,
  getAllFiles,
  isValidJson,
  backupFile,
  safeWriteFile,
  formatFileSize,
}; 