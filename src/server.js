const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs-extra');
const cron = require('node-cron');

const downloadRoutes = require('./routes/download');
const { cleanupOldFiles } = require('./utils/fileManager');
const config = require('./config/config');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/alldl', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure downloads directory exists
fs.ensureDirSync(config.DOWNLOADS_DIR);
fs.ensureDirSync(config.TEMP_DIR);

// Static file serving for downloads
app.use('/files', express.static(config.DOWNLOADS_DIR));

// Serve frontend files
app.use(express.static('public'));

// Routes
app.use('/', downloadRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Cleanup old files every 30 minutes
cron.schedule('*/30 * * * *', () => {
  console.log('Running cleanup job...');
  cleanupOldFiles();
});

// Initial cleanup on startup
cleanupOldFiles();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Downloads directory: ${config.DOWNLOADS_DIR}`);
  console.log(`🧹 Cleanup job scheduled every 30 minutes`);
});

module.exports = app;