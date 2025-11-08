/**
 * Main Application - Ties together the UI, ImageAnalyzer, and PaintEngine
 */
class StillCanvasApp {
    constructor() {
        this.analyzer = new ImageAnalyzer();
        this.painter = new PaintEngine('paintCanvas');
        this.currentCategory = 'landscape';
        this.fragmentSize = 20;
        this.isLoading = false;

        // Image paths for each category
        this.imagePaths = {
            landscape: 'assets/images/landscape/default.jpg',
            meditation: 'assets/images/meditation/default.jpg',
            stilllife: 'assets/images/stilllife/default.jpg',
            photography: 'assets/images/photography/default.jpg'
        };

        this.initializeUI();
        this.setupEventListeners();
        this.loadDefaultImage();
    }

    /**
     * Initialize UI elements
     */
    initializeUI() {
        this.elements = {
            categoryBtns: document.querySelectorAll('.category-btn'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            speedSlider: document.getElementById('speedSlider'),
            fragmentSlider: document.getElementById('fragmentSlider'),
            progressText: document.getElementById('progressText'),
            progressFill: document.getElementById('progressFill'),
            loading: document.getElementById('loading')
        };

        // Setup painter callbacks
        this.painter.onProgress = (current, total) => {
            this.updateProgress(current, total);
        };

        this.painter.onComplete = () => {
            this.onPaintingComplete();
        };
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Category buttons
        this.elements.categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.selectCategory(category);
            });
        });

        // Control buttons
        this.elements.pauseBtn.addEventListener('click', () => {
            this.togglePause();
        });

        this.elements.resetBtn.addEventListener('click', () => {
            this.resetPainting();
        });

        // Speed slider
        this.elements.speedSlider.addEventListener('input', (e) => {
            this.painter.setSpeed(parseInt(e.target.value));
        });

        // Fragment size slider
        this.elements.fragmentSlider.addEventListener('change', (e) => {
            this.fragmentSize = parseInt(e.target.value);
            this.loadImage(this.imagePaths[this.currentCategory]);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePause();
            } else if (e.code === 'KeyR') {
                this.resetPainting();
            }
        });
    }

    /**
     * Select a category and load its image
     * @param {string} category - Category name
     */
    selectCategory(category) {
        if (this.isLoading || category === this.currentCategory) return;

        this.currentCategory = category;

        // Update button states
        this.elements.categoryBtns.forEach(btn => {
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Load category image
        this.loadImage(this.imagePaths[category]);
    }

    /**
     * Load default image on startup
     */
    loadDefaultImage() {
        this.loadImage(this.imagePaths[this.currentCategory]);
    }

    /**
     * Load and analyze an image
     * @param {string} imagePath - Path to the image
     */
    async loadImage(imagePath) {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            this.showLoading(true);
            this.painter.pause();

            // Analyze image
            const result = await this.analyzer.analyze(imagePath, this.fragmentSize);

            // Load into painter
            this.painter.load(result.fragments, result.width, result.height);

            // Update UI
            this.showLoading(false);
            this.elements.progressText.textContent = 'Ready to paint';
            this.elements.progressFill.style.width = '0%';
            this.elements.pauseBtn.textContent = 'Pause';

            // Auto-start painting
            setTimeout(() => {
                this.painter.start();
                this.elements.pauseBtn.disabled = false;
                this.elements.resetBtn.disabled = false;
            }, 500);

        } catch (error) {
            console.error('Error loading image:', error);
            this.showError(`Failed to load image. Please check if the image exists at: ${imagePath}`);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Toggle pause/resume
     */
    togglePause() {
        if (this.painter.isPaused) {
            this.painter.resume();
            this.elements.pauseBtn.textContent = 'Pause';
        } else {
            this.painter.pause();
            this.elements.pauseBtn.textContent = 'Resume';
        }
    }

    /**
     * Reset the painting
     */
    resetPainting() {
        this.painter.reset();
        this.elements.pauseBtn.textContent = 'Pause';
        this.elements.progressText.textContent = 'Ready to paint';
        this.elements.progressFill.style.width = '0%';

        setTimeout(() => {
            this.painter.start();
        }, 300);
    }

    /**
     * Update progress display
     * @param {number} current - Current fragment index
     * @param {number} total - Total fragments
     */
    updateProgress(current, total) {
        const percentage = Math.round((current / total) * 100);
        this.elements.progressFill.style.width = `${percentage}%`;
        this.elements.progressText.textContent = `Painting... ${percentage}%`;
    }

    /**
     * Called when painting is complete
     */
    onPaintingComplete() {
        this.elements.progressText.textContent = 'Complete';
        this.elements.pauseBtn.textContent = 'Pause';
        this.elements.pauseBtn.disabled = true;
    }

    /**
     * Show/hide loading indicator
     * @param {boolean} show - Whether to show loading
     */
    showLoading(show) {
        if (show) {
            this.elements.loading.classList.add('show');
        } else {
            this.elements.loading.classList.remove('show');
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        this.showLoading(false);
        this.elements.progressText.textContent = 'Error';
        this.elements.progressText.style.color = '#d32f2f';
        console.error(message);

        // Show alert with helpful information
        alert(`${message}\n\nPlease add sample images to the assets/images/ folder.`);

        setTimeout(() => {
            this.elements.progressText.style.color = '';
        }, 3000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new StillCanvasApp();
});
