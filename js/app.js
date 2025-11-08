/**
 * Main Application - Ties together the UI, ImageAnalyzer, and PaintEngine
 */
class StillCanvasApp {
    constructor() {
        this.analyzer = new ImageAnalyzer();
        this.painter = new PaintEngine('paintCanvas');
        this.currentCategory = 'landscape';
        this.fragmentSize = 12; // Smaller pieces for finer brush strokes
        this.isLoading = false;
        this.isCircularMode = true; // Whether to use circular painting (draw then erase)

        // Image paths for each category
        // Will try both .png and .jpg extensions automatically
        this.imagePaths = {
            landscape: ['assets/images/landscape/default.png', 'assets/images/landscape/default.jpg'],
            meditation: ['assets/images/meditation/default.png', 'assets/images/meditation/default.jpg'],
            stilllife: ['assets/images/stilllife/default.png', 'assets/images/stilllife/default.jpg'],
            photography: ['assets/images/photography/default.png', 'assets/images/photography/default.jpg']
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
            circularToggle: document.getElementById('circularToggle'),
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

        // Circular painting toggle
        this.elements.circularToggle.addEventListener('change', (e) => {
            this.isCircularMode = e.target.checked;
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
     * @param {string|Array} imagePaths - Path(s) to the image (tries each in order)
     */
    async loadImage(imagePaths) {
        if (this.isLoading) return;

        // Normalize to array
        const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];

        try {
            this.isLoading = true;
            this.showLoading(true);
            this.painter.pause();

            // Try each path until one succeeds
            let result = null;
            let lastError = null;
            let successfulPath = null;

            for (const imagePath of paths) {
                try {
                    console.log(`Trying to load: ${imagePath}`);
                    // Analyze image
                    result = await this.analyzer.analyze(imagePath, this.fragmentSize);
                    successfulPath = imagePath;
                    console.log(`✓ Successfully analyzed: ${imagePath}`);
                    break; // Success! Stop trying other paths
                } catch (error) {
                    console.log(`✗ Failed to load: ${imagePath}`, error.message);
                    lastError = error;
                    // Continue to next path
                }
            }

            // If none succeeded, throw the last error
            if (!result) {
                throw lastError || new Error('No valid image paths provided');
            }

            // Load into painter
            this.painter.load(result.fragments, result.width, result.height);

            // Update UI
            this.showLoading(false);
            this.elements.progressText.textContent = 'Ready to paint';
            this.elements.progressFill.style.width = '0%';
            this.elements.pauseBtn.textContent = 'Pause';

            console.log(`Successfully loaded: ${successfulPath}`);

            // Auto-start painting
            setTimeout(() => {
                this.painter.start();
                this.elements.pauseBtn.disabled = false;
                this.elements.resetBtn.disabled = false;
            }, 500);

        } catch (error) {
            console.error('Error loading image:', error);
            const pathsList = paths.join(' or ');
            this.showError(`Failed to load image. Please check if an image exists at: ${pathsList}`);
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
        if (this.isCircularMode) {
            // In circular mode, check if we just finished drawing or erasing
            if (this.painter.isErasing) {
                // Just finished erasing, start drawing again
                this.elements.progressText.textContent = 'Restarting...';
                setTimeout(() => {
                    this.painter.reset();
                    this.painter.start();
                    this.elements.pauseBtn.disabled = false;
                }, 500);
            } else {
                // Just finished drawing, start erasing
                this.elements.progressText.textContent = 'Erasing...';
                setTimeout(() => {
                    this.painter.startErasing();
                    this.elements.pauseBtn.disabled = false;
                }, 1000);
            }
        } else {
            // Non-circular mode: just stop
            this.elements.progressText.textContent = 'Complete';
            this.elements.pauseBtn.textContent = 'Pause';
            this.elements.pauseBtn.disabled = true;
        }
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
