const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');
const { sanitizeFilename } = require('../utils/validation');

async function getMediaInfo(url) {
  return new Promise((resolve, reject) => {
    const args = [
      '--dump-json',
      '--no-download',
      '--no-warnings',
      url
    ];
    
    const process = spawn('yt-dlp', args);
    let stdout = '';
    let stderr = '';
    
    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`yt-dlp failed: ${stderr}`));
        return;
      }
      
      try {
        const info = JSON.parse(stdout.trim());
        resolve({
          title: info.title || 'Unknown',
          description: info.description || '',
          duration: info.duration || null,
          uploader: info.uploader || 'Unknown',
          thumbnail: info.thumbnail || null,
          formats: info.formats ? info.formats.length : 0
        });
      } catch (error) {
        reject(new Error('Failed to parse media info'));
      }
    });
    
    // Set timeout
    setTimeout(() => {
      process.kill();
      reject(new Error('Request timeout'));
    }, 30000);
  });
}

async function downloadMedia(url, options = {}) {
  const { format = 'video', quality = 'best' } = options;
  const downloadId = uuidv4();
  
  // Get media info first
  const info = await getMediaInfo(url);
  
  // Prepare download arguments
  let formatSelector;
  let extension;
  
  if (format === 'audio') {
    formatSelector = 'bestaudio[ext=m4a]/bestaudio/best';
    extension = 'm4a';
  } else {
    // Video format
    switch (quality) {
      case '720p':
        formatSelector = 'best[height<=720][ext=mp4]/best[height<=720]/best[ext=mp4]/best';
        break;
      case '1080p':
        formatSelector = 'best[height<=1080][ext=mp4]/best[height<=1080]/best[ext=mp4]/best';
        break;
      default:
        formatSelector = 'best[ext=mp4]/best';
    }
    extension = 'mp4';
  }
  
  const tempFilename = `${downloadId}.%(ext)s`;
  const tempPath = path.join(config.TEMP_DIR, tempFilename);
  
  return new Promise((resolve, reject) => {
    const args = [
      '--format', formatSelector,
      '--max-filesize', config.MAX_FILE_SIZE,
      '--output', tempPath,
      '--no-playlist',
      '--no-warnings',
      url
    ];
    
    const process = spawn('yt-dlp', args);
    let stderr = '';
    
    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', async (code) => {
      if (code !== 0) {
        reject(new Error(`Download failed: ${stderr}`));
        return;
      }
      
      try {
        // Find the downloaded file
        const tempFiles = await fs.readdir(config.TEMP_DIR);
        const downloadedFile = tempFiles.find(file => file.startsWith(downloadId));
        
        if (!downloadedFile) {
          reject(new Error('Downloaded file not found'));
          return;
        }
        
        const tempFilePath = path.join(config.TEMP_DIR, downloadedFile);
        
        // Generate final filename
        const safeTitle = sanitizeFilename(info.title.substring(0, 50));
        const finalExtension = path.extname(downloadedFile) || `.${extension}`;
        const finalFilename = `${safeTitle}_${downloadId}${finalExtension}`;
        const finalPath = path.join(config.DOWNLOADS_DIR, finalFilename);
        
        // Move file from temp to downloads directory
        await fs.move(tempFilePath, finalPath);
        
        // Generate download URL
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
        const downloadUrl = `${baseUrl}/files/${finalFilename}`;
        
        // Optional: Generate TinyURL
        let shortUrl = downloadUrl;
        try {
          const TinyURL = require('tinyurl');
          shortUrl = await TinyURL.shorten(downloadUrl);
        } catch (error) {
          console.log('TinyURL generation failed:', error.message);
          // Continue with regular URL
        }
        
        resolve({
          result: shortUrl,
          cp: info.title,
          filename: finalFilename,
          size: (await fs.stat(finalPath)).size,
          format: format,
          quality: quality
        });
        
      } catch (error) {
        reject(error);
      }
    });
    
    // Set timeout
    setTimeout(() => {
      process.kill();
      reject(new Error('Download timeout'));
    }, 120000); // 2 minutes timeout
  });
}

module.exports = {
  getMediaInfo,
  downloadMedia
};