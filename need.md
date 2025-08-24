Create a 2025-ready video downloader web application using Node.js + Express and a minimal HTML frontend (no React).

Backend requirements

Deployable on Render.com.

Routes:

GET / → serves index.html.

GET /api/health → {ok:true} for health check.

GET /api/info?url=... → returns JSON with video metadata (title, uploader, duration, thumbnail) and array of available formats (formatId, container, qualityLabel, codecs, bitrate, filesize, flags for audio-only/video-only, and direct /api/download?... links).

GET /api/download?url=...&formatId=...&container=... → streams the chosen video/audio with correct MIME type and filename. Must support progressive formats and fallback to video-only/audio-only if needed.

Extractor strategy:

Try ytdl-core (YouTube).

Fallback @distube/ytdl-core.

Fallback youtube-dl-exec.

For TikTok, Instagram, Twitter/X, others → youtube-dl-exec (optional fallback: tiktok-scraper, instagram-private-api, twitter-api-v2).

Ensure the quality dropdown actually updates the download link.

Add security: helmet, cors, express-rate-limit. Optional API key via process.env.API_KEY.

Errors return {ok:false,message,stage}.




Use process.env.PORT || 3000.

index.html requirements (served at /)

Responsive, minimal design (plain HTML/JS/CSS).

Elements:

Input field #mediaUrl for video link.

Button #fetchInfoBtn to call /api/info.

Dropdown #qualitySelect (disabled until info loaded).

Button #downloadBtn (disabled until a quality is chosen) → updates to correct /api/download?... link.

Panel showing title, duration, uploader, and thumbnail.

Table listing all formats with quality, container, codecs, bitrate, filesize, and direct Download links.

JavaScript flow:

On click Fetch Info, call /api/info?url=..., parse response.

Populate #qualitySelect with available formats.

Enable dropdown + Download button.

On dropdown change, update Download button href.

Populate metadata panel and formats table.

Show errors in a div #error.

Footer notice:

“Download only content you own or have rights to. DRM/Paywalled content not supported.”
