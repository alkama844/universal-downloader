const validator = require('validator');
const config = require('../config/config');

function validateUrl(url) {
  try {
    // Basic URL validation
    if (!validator.isURL(url, { 
      protocols: ['http', 'https'],
      require_protocol: true
    })) {
      return { isValid: false, error: 'Invalid URL format' };
    }
    
    // Parse URL to get hostname
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Check if domain is supported
    const isSupported = config.SUPPORTED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
    
    if (!isSupported) {
      return { 
        isValid: false, 
        error: 'Unsupported URL. Supported platforms: TikTok, YouTube, Instagram, Facebook, X/Twitter, Pinterest' 
      };
    }
    
    // Clean and normalize URL
    const cleanUrl = url.trim();
    
    return { 
      isValid: true, 
      cleanUrl,
      hostname 
    };
    
  } catch (error) {
    return { 
      isValid: false, 
      error: 'Invalid URL format' 
    };
  }
}

function sanitizeFilename(filename) {
  // Remove path traversal attempts and invalid characters
  return filename
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
    .replace(/\.\./g, '') // Remove path traversal attempts
    .replace(/^\./, '') // Remove leading dots
    .substring(0, 255); // Limit length
}

module.exports = {
  validateUrl,
  sanitizeFilename
};