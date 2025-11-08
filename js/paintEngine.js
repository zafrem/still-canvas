/**
 * PaintEngine - Handles the animated painting process on canvas
 */
class PaintEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.fragments = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.animationId = null;
        this.speed = 50; // 1-100
        this.onProgress = null;
        this.onComplete = null;
        this.lastFrameTime = 0;
        this.fragmentsPerFrame = 1;
    }

    /**
     * Load fragments and prepare for painting
     * @param {Array} fragments - Array of image fragments sorted by brightness
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    load(fragments, width, height) {
        this.fragments = fragments;
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isPaused = false;

        // Set canvas dimensions
        this.canvas.width = width;
        this.canvas.height = height;

        // Clear canvas with white background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, width, height);

        this.updateFragmentsPerFrame();
    }

    /**
     * Update how many fragments to draw per frame based on speed
     */
    updateFragmentsPerFrame() {
        // Speed 1-100 maps to 1-20 fragments per frame
        this.fragmentsPerFrame = Math.max(1, Math.floor(this.speed / 5));
    }

    /**
     * Start the painting animation
     */
    start() {
        if (this.isPlaying && !this.isPaused) return;

        this.isPlaying = true;
        this.isPaused = false;
        this.lastFrameTime = performance.now();
        this.animate();
    }

    /**
     * Pause the animation
     */
    pause() {
        this.isPaused = true;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Resume the animation
     */
    resume() {
        if (!this.isPaused) return;
        this.isPaused = false;
        this.lastFrameTime = performance.now();
        this.animate();
    }

    /**
     * Reset the painting
     */
    reset() {
        this.pause();
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isPaused = false;

        if (this.canvas.width > 0 && this.canvas.height > 0) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        if (this.onProgress) {
            this.onProgress(0, this.fragments.length);
        }
    }

    /**
     * Set painting speed
     * @param {number} speed - Speed value (1-100)
     */
    setSpeed(speed) {
        this.speed = Math.max(1, Math.min(100, speed));
        this.updateFragmentsPerFrame();
    }

    /**
     * Main animation loop
     */
    animate() {
        if (!this.isPlaying || this.isPaused) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;

        // Target 60 FPS
        if (deltaTime >= 16.67) {
            this.lastFrameTime = currentTime;

            // Draw multiple fragments based on speed
            let fragmentsDrawn = 0;
            while (fragmentsDrawn < this.fragmentsPerFrame && this.currentIndex < this.fragments.length) {
                this.drawFragment(this.fragments[this.currentIndex]);
                this.currentIndex++;
                fragmentsDrawn++;
            }

            // Update progress
            if (this.onProgress) {
                this.onProgress(this.currentIndex, this.fragments.length);
            }

            // Check if complete
            if (this.currentIndex >= this.fragments.length) {
                this.isPlaying = false;
                if (this.onComplete) {
                    this.onComplete();
                }
                return;
            }
        }

        // Continue animation
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Draw a single fragment on the canvas
     * @param {Object} fragment - Fragment data
     */
    drawFragment(fragment) {
        this.ctx.putImageData(
            fragment.imageData,
            fragment.x,
            fragment.y
        );
    }

    /**
     * Draw all fragments instantly (skip animation)
     */
    drawAll() {
        this.pause();
        while (this.currentIndex < this.fragments.length) {
            this.drawFragment(this.fragments[this.currentIndex]);
            this.currentIndex++;
        }
        if (this.onProgress) {
            this.onProgress(this.currentIndex, this.fragments.length);
        }
        if (this.onComplete) {
            this.onComplete();
        }
    }

    /**
     * Get current progress as percentage
     * @returns {number} Progress (0-100)
     */
    getProgress() {
        if (this.fragments.length === 0) return 0;
        return Math.round((this.currentIndex / this.fragments.length) * 100);
    }

    /**
     * Check if painting is complete
     * @returns {boolean}
     */
    isComplete() {
        return this.currentIndex >= this.fragments.length;
    }

    /**
     * Export canvas as image
     * @param {string} format - Image format (png, jpeg, webp)
     * @returns {string} Data URL
     */
    exportImage(format = 'png') {
        return this.canvas.toDataURL(`image/${format}`);
    }

    /**
     * Download canvas as image file
     * @param {string} filename - Name of the file
     */
    downloadImage(filename = 'still-canvas-art.png') {
        const link = document.createElement('a');
        link.download = filename;
        link.href = this.exportImage();
        link.click();
    }
}
