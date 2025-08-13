# AllDL - Universal Social Media Downloader API

A Node.js backend service that provides a REST API for downloading videos and images from popular social media platforms including TikTok, YouTube, Instagram, Facebook, X/Twitter, and Pinterest.

## Features

- ✅ **Universal Support**: Download from TikTok, YouTube, Instagram, Facebook, X/Twitter, Pinterest
- ✅ **Multiple Formats**: Video (MP4) and audio-only (M4A) downloads
- ✅ **Quality Options**: Choose between 720p, 1080p, or best available quality
- ✅ **Security**: URL validation, CORS, rate limiting, file size limits
- ✅ **Auto Cleanup**: Files automatically deleted after 1 hour
- ✅ **Docker Ready**: Easy deployment with Docker Compose
- ✅ **TinyURL Integration**: Optional URL shortening for downloads

## Quick Start

### Using Docker (Recommended)

```bash
# Clone and start the service
git clone <your-repo>
cd alldl-backend
docker-compose up -d

# Service will be available at http://localhost:3000
```

### Manual Installation

```bash
# Install yt-dlp (required dependency)
pip install yt-dlp

# Install Node.js dependencies
npm install

# Start development server
npm run dev

# Or start production server
npm start
```

## API Usage

### Download Video/Image

```http
GET /alldl?url=<video-url>&format=<format>&quality=<quality>
```

**Parameters:**
- `url` (required): Full public URL from supported platform
- `format` (optional): `video` (default) or `audio`
- `quality` (optional): `best` (default), `720p`, or `1080p`

**Example:**
```bash
curl "http://localhost:3000/alldl?url=https://www.tiktok.com/@user/video/12345"
```

**Response:**
```json
{
  "result": "https://yourdomain.com/files/video_abc123.mp4",
  "cp": "Amazing TikTok Video",
  "filename": "amazing_video_abc123.mp4",
  "size": 15728640,
  "format": "video",
  "quality": "best"
}
```

### Get Media Information

```http
GET /info?url=<video-url>
```

**Response:**
```json
{
  "title": "Video Title",
  "description": "Video description...",
  "duration": 30,
  "uploader": "Username",
  "thumbnail": "https://example.com/thumb.jpg",
  "formats": 5
}
```

### Health Check

```http
GET /health
```

## Supported Platforms

| Platform | Supported URLs |
|----------|----------------|
| **TikTok** | `tiktok.com`, `vt.tiktok.com`, `vm.tiktok.com` |
| **YouTube** | `youtube.com`, `youtu.be`, `m.youtube.com` |
| **Instagram** | `instagram.com` |
| **Facebook** | `facebook.com`, `fb.watch`, `m.facebook.com` |
| **X/Twitter** | `twitter.com`, `x.com`, `mobile.twitter.com` |
| **Pinterest** | `pinterest.com`, `pin.it` |

## Configuration

Environment variables can be set in docker-compose.yml or .env file:

```env
NODE_ENV=production
PORT=3000
DOWNLOADS_DIR=/app/downloads
TEMP_DIR=/tmp
MAX_FILE_SIZE=100M
FILE_RETENTION_HOURS=1
BASE_URL=http://localhost:3000
```

## Error Handling

| Status Code | Description |
|-------------|-------------|
| `200` | Success |
| `400` | Invalid URL or unsupported platform |
| `404` | Content not found or unavailable |
| `429` | Rate limit exceeded |
| `500` | Server error or download failed |

**Error Response:**
```json
{
  "error": "Unsupported URL. Supported platforms: TikTok, YouTube, Instagram, Facebook, X/Twitter, Pinterest"
}
```

## Deployment

### Docker Compose (Recommended)

```bash
docker-compose up -d
```

### Manual Deployment

1. **Install yt-dlp**: `pip install yt-dlp`
2. **Install dependencies**: `npm install --production`
3. **Start service**: `npm start`

### Cloud Platforms

**Render/Railway/VPS:**
- Set environment variables
- Ensure yt-dlp is installed in the environment
- Configure BASE_URL to your domain

**Example for Render:**
- Build Command: `npm install && pip install yt-dlp`
- Start Command: `npm start`

## Rate Limiting

- **50 requests per 15 minutes** per IP address
- Configurable via express-rate-limit middleware

## File Management

- Files stored in `/downloads` directory
- Automatic cleanup every 30 minutes
- Files older than 1 hour are automatically deleted
- Maximum file size: 100MB

## Security Features

- **URL Validation**: Only whitelisted domains allowed
- **CORS Protection**: Configurable cross-origin requests
- **Rate Limiting**: Prevents abuse
- **File Sanitization**: Prevents path traversal attacks
- **Helmet.js**: Security headers
- **File Size Limits**: Prevents large file attacks

## API Examples

### Download TikTok Video
```bash
curl "http://localhost:3000/alldl?url=https://vt.tiktok.com/ZSFxxxxxx"
```

### Download YouTube Audio
```bash
curl "http://localhost:3000/alldl?url=https://youtu.be/dQw4w9WgXcQ&format=audio"
```

### Download Instagram with Quality
```bash
curl "http://localhost:3000/alldl?url=https://instagram.com/p/xxxxxx&quality=720p"
```

## Troubleshooting

### Common Issues

1. **"Unsupported URL" Error**
   - Verify the URL is from a supported platform
   - Check if URL is public and accessible

2. **Download Fails**
   - Content might be private or deleted
   - Check yt-dlp logs for specific errors

3. **Rate Limited**
   - Wait 15 minutes or implement request queuing

### Logs

```bash
# View Docker logs
docker-compose logs -f alldl-backend

# View application logs
npm run dev
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details.

## Disclaimer

This tool is for downloading public content only. Respect platform terms of service and copyright laws. Users are responsible for ensuring they have permission to download content.