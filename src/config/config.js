const path = require('path');

module.exports = {
  // Directory configuration
  DOWNLOADS_DIR: process.env.DOWNLOADS_DIR || path.join(__dirname, '../../downloads'),
  TEMP_DIR: process.env.TEMP_DIR || '/tmp',
  
  // File configuration
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '100M',
  FILE_RETENTION_HOURS: process.env.FILE_RETENTION_HOURS || 1,
  
  // Supported domains
  SUPPORTED_DOMAINS: [
    // TikTok
    'vt.tiktok.com',
    'tiktok.com',
    'www.tiktok.com',
    'vm.tiktok.com',
    
    // YouTube
    'youtu.be',
    'youtube.com',
    'www.youtube.com',
    'm.youtube.com',
    
    // Instagram
    'instagram.com',
    'www.instagram.com',
    
    // Facebook
    'facebook.com',
    'www.facebook.com',
    'fb.watch',
    'm.facebook.com',
    
    // Twitter/X
    'twitter.com',
    'www.twitter.com',
    'x.com',
    'www.x.com',
    'mobile.twitter.com',
    
    // Pinterest
    'pin.it',
    'pinterest.com',
    'www.pinterest.com'
  ],
  
  // yt-dlp configuration
  YTDLP_OPTIONS: {
    maxFilesize: '100M',
    writeInfoJson: false,
    writeDescription: false,
    writeThumbnail: false,
    extractFlat: false,
    noWarnings: false,
    ignoreerrors: false
  }
};