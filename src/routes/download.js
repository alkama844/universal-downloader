const express = require('express');
const { downloadMedia } = require('../services/downloader');
const { validateUrl } = require('../utils/validation');

const router = express.Router();

router.get('/alldl', async (req, res) => {
  try {
    const { url, format, quality } = req.query;
    
    // Validate URL parameter
    if (!url) {
      return res.status(400).json({ 
        error: 'Missing required parameter: url' 
      });
    }
    
    // Validate and sanitize URL
    const validation = validateUrl(url);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: validation.error 
      });
    }
    
    // Download the media
    const result = await downloadMedia(validation.cleanUrl, {
      format: format || 'video',
      quality: quality || 'best'
    });
    
    res.json(result);
    
  } catch (error) {
    console.error('Download error:', error);
    
    if (error.message.includes('Unsupported URL')) {
      return res.status(400).json({ error: error.message });
    }
    
    if (error.message.includes('No video formats found')) {
      return res.status(404).json({ error: 'Content not found or unavailable' });
    }
    
    res.status(500).json({ 
      error: 'Download failed',
      message: error.message 
    });
  }
});

// Get file info endpoint
router.get('/info', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ 
        error: 'Missing required parameter: url' 
      });
    }
    
    const validation = validateUrl(url);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: validation.error 
      });
    }
    
    const { getMediaInfo } = require('../services/downloader');
    const info = await getMediaInfo(validation.cleanUrl);
    
    res.json(info);
    
  } catch (error) {
    console.error('Info error:', error);
    res.status(500).json({ 
      error: 'Failed to get media info',
      message: error.message 
    });
  }
});

module.exports = router;