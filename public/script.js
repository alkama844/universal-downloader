class VideoDownloader {
    constructor() {
        this.form = document.getElementById('downloadForm');
        this.urlInput = document.getElementById('urlInput');
        this.qualitySelect = document.getElementById('qualitySelect');
        this.formatSelect = document.getElementById('formatSelect');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.btnText = document.querySelector('.btn-text');
        this.spinner = document.getElementById('spinner');
        this.alertBox = document.getElementById('alertBox');
        this.mediaInfo = document.getElementById('mediaInfo');
        this.urlError = document.getElementById('urlError');

        this.supportedDomains = [
            'vt.tiktok.com',
            'tiktok.com',
            'www.tiktok.com',
            'vm.tiktok.com',
            'youtu.be',
            'youtube.com',
            'www.youtube.com',
            'm.youtube.com',
            'instagram.com',
            'www.instagram.com',
            'facebook.com',
            'www.facebook.com',
            'fb.watch',
            'm.facebook.com',
            'twitter.com',
            'www.twitter.com',
            'x.com',
            'www.x.com',
            'mobile.twitter.com',
            'pin.it',
            'pinterest.com',
            'www.pinterest.com'
        ];

        this.init();
    }

    init() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.urlInput.addEventListener('input', this.validateUrl.bind(this));
        this.urlInput.addEventListener('blur', this.validateUrl.bind(this));
    }

    validateUrl() {
        const url = this.urlInput.value.trim();
        this.urlError.textContent = '';

        if (!url) {
            return true; // Empty is valid (required attribute will handle it)
        }

        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname.toLowerCase();

            const isSupported = this.supportedDomains.some(domain => 
                hostname === domain || hostname.endsWith('.' + domain)
            );

            if (!isSupported) {
                this.urlError.textContent = 'Unsupported platform. Please use TikTok, YouTube, Instagram, Facebook, X/Twitter, or Pinterest URLs.';
                return false;
            }

            return true;
        } catch (error) {
            this.urlError.textContent = 'Please enter a valid URL.';
            return false;
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateUrl()) {
            return;
        }

        const url = this.urlInput.value.trim();
        const quality = this.qualitySelect.value;
        const format = this.formatSelect.value;

        this.setLoading(true);
        this.hideAlert();
        this.hideMediaInfo();

        try {
            // First, get media info
            await this.getMediaInfo(url);

            // Then download
            const response = await this.downloadMedia(url, quality, format);
            
            if (response.result) {
                this.showSuccess('Download ready! Opening download link...');
                
                // Open download link in new tab
                setTimeout(() => {
                    window.open(response.result, '_blank');
                }, 1000);
            } else {
                throw new Error(response.error || 'Download failed');
            }

        } catch (error) {
            console.error('Download error:', error);
            this.showError(error.message || 'Download failed. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    async getMediaInfo(url) {
        try {
            const response = await fetch(`/info?url=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (response.ok && data.title) {
                this.showMediaInfo(data);
            }
        } catch (error) {
            console.log('Could not fetch media info:', error);
            // Don't show error for info request, it's optional
        }
    }

    async downloadMedia(url, quality, format) {
        const params = new URLSearchParams({
            url: url,
            quality: quality,
            format: format
        });

        const response = await fetch(`/alldl?${params}`);
        const data = await response.json();

        console.log('API Response:', data);

        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }

        return data;
    }

    showMediaInfo(info) {
        const formatFileSize = (bytes) => {
            if (!bytes) return 'Unknown';
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            if (bytes === 0) return '0 Bytes';
            const i = Math.floor(Math.log(bytes) / Math.log(1024));
            return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
        };

        const formatDuration = (seconds) => {
            if (!seconds) return 'Unknown';
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };

        this.mediaInfo.innerHTML = `
            <h3>Media Information</h3>
            <div class="info-item">
                <span class="info-label">Title:</span>
                <span class="info-value">${info.title || 'Unknown'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Uploader:</span>
                <span class="info-value">${info.uploader || 'Unknown'}</span>
            </div>
            ${info.duration ? `
            <div class="info-item">
                <span class="info-label">Duration:</span>
                <span class="info-value">${formatDuration(info.duration)}</span>
            </div>
            ` : ''}
            <div class="info-item">
                <span class="info-label">Available Formats:</span>
                <span class="info-value">${info.formats || 'Unknown'}</span>
            </div>
        `;
        this.mediaInfo.classList.add('show');
    }

    hideMediaInfo() {
        this.mediaInfo.classList.remove('show');
    }

    setLoading(loading) {
        this.downloadBtn.disabled = loading;
        
        if (loading) {
            this.btnText.classList.add('loading');
            this.spinner.classList.add('loading');
        } else {
            this.btnText.classList.remove('loading');
            this.spinner.classList.remove('loading');
        }
    }

    showSuccess(message) {
        this.alertBox.className = 'alert success';
        this.alertBox.textContent = message;
    }

    showError(message) {
        this.alertBox.className = 'alert error';
        this.alertBox.textContent = message;
    }

    hideAlert() {
        this.alertBox.className = 'alert';
        this.alertBox.style.display = 'none';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VideoDownloader();
});