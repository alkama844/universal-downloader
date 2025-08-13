const fs = require('fs-extra');
const path = require('path');
const config = require('../config/config');

async function cleanupOldFiles() {
  try {
    const files = await fs.readdir(config.DOWNLOADS_DIR);
    const now = Date.now();
    const maxAge = config.FILE_RETENTION_HOURS * 60 * 60 * 1000; // Convert hours to milliseconds
    
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(config.DOWNLOADS_DIR, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        await fs.remove(filePath);
        deletedCount++;
        console.log(`Deleted old file: ${file}`);
      }
    }
    
    if (deletedCount > 0) {
      console.log(`Cleanup completed: ${deletedCount} files deleted`);
    }
    
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function formatFileSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

module.exports = {
  cleanupOldFiles,
  getFileSize,
  formatFileSize
};