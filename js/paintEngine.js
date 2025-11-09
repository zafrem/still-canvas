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
        this.isErasing = false; // Track if we're in erase mode
        this.drawnFragments = []; // Track which fragments have been drawn
        this.currentFragmentColumn = 0; // Current column being drawn in fragment
        this.currentFragmentDirection = 1; // 1 for left-to-right, -1 for right-to-left
        this.columnsPerFrame = 5; // Number of columns to draw per frame (increased for faster painting)
        
        // Memory optimization: reuse temp canvas instead of creating new ones
        this.tempCanvas = document.createElement('canvas');
        this.tempCtx = this.tempCanvas.getContext('2d', { willReadFrequently: true });
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
        this.isErasing = false;
        this.drawnFragments = [];
        this.currentFragmentColumn = 0;
        this.currentFragmentDirection = 1;

        // Set canvas dimensions
        this.canvas.width = width;
        this.canvas.height = height;

        // Clear canvas with black background
        this.ctx.fillStyle = '#000000';
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
        this.isErasing = false;
        this.drawnFragments = [];
        this.currentFragmentColumn = 0;
        this.currentFragmentDirection = 1;

        if (this.canvas.width > 0 && this.canvas.height > 0) {
            this.ctx.fillStyle = '#000000';
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

            if (this.isErasing) {
                // Erase fragments in reverse order
                let fragmentsErased = 0;
                while (fragmentsErased < this.fragmentsPerFrame && this.currentIndex >= 0) {
                    this.eraseFragment(this.currentIndex);
                    this.currentIndex--;
                    fragmentsErased++;
                }

                // Update progress (show as reverse)
                if (this.onProgress) {
                    this.onProgress(Math.max(0, this.currentIndex + 1), this.fragments.length);
                }

                // Check if erasing complete
                if (this.currentIndex < 0) {
                    this.isErasing = false;
                    this.currentIndex = 0;
                    this.drawnFragments = [];
                    // Notify completion so it can restart
                    if (this.onComplete) {
                        this.onComplete();
                    }
                    return;
                }
            } else {
                // Draw fragments column by column
                if (this.currentIndex < this.fragments.length) {
                    const fragment = this.fragments[this.currentIndex];
                    
                    // Start new fragment - choose random direction
                    if (this.currentFragmentColumn === 0) {
                        this.currentFragmentDirection = Math.random() > 0.5 ? 1 : -1;
                        if (this.currentFragmentDirection === -1) {
                            this.currentFragmentColumn = fragment.width - 1;
                        }
                    }
                    
                    // Adaptive columns per frame based on fragment size
                    // Larger fragments draw more columns per frame to maintain consistent speed
                    const adaptiveColumnsPerFrame = Math.max(5, Math.ceil(fragment.width / 10));
                    
                    // Draw multiple columns per frame
                    let columnsDrawn = 0;
                    while (columnsDrawn < adaptiveColumnsPerFrame) {
                        this.drawFragmentColumn(fragment, this.currentFragmentColumn);
                        this.currentFragmentColumn += this.currentFragmentDirection;
                        columnsDrawn++;
                        
                        // Check if fragment is complete
                        if (this.currentFragmentDirection === 1 && this.currentFragmentColumn >= fragment.width) {
                            // Left-to-right complete
                            this.currentFragmentColumn = 0;
                            this.currentIndex++;
                            this.drawnFragments.push(this.currentIndex - 1);
                            break;
                        } else if (this.currentFragmentDirection === -1 && this.currentFragmentColumn < 0) {
                            // Right-to-left complete
                            this.currentFragmentColumn = 0;
                            this.currentIndex++;
                            this.drawnFragments.push(this.currentIndex - 1);
                            break;
                        }
                    }
                }

                // Update progress
                if (this.onProgress) {
                    this.onProgress(this.currentIndex, this.fragments.length);
                }

                // Check if drawing complete
                if (this.currentIndex >= this.fragments.length) {
                    this.isPlaying = false;
                    if (this.onComplete) {
                        this.onComplete();
                    }
                    return;
                }
            }
        }

        // Continue animation
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Start erasing mode (reverse painting)
     */
    startErasing() {
        if (this.isErasing) return;
        this.isErasing = true;
        this.currentIndex = this.fragments.length - 1;
        this.isPlaying = true;
        this.isPaused = false;
        this.lastFrameTime = performance.now();
        this.animate();
    }

    /**
     * Erase a fragment by redrawing the canvas without it
     * @param {number} index - Index of fragment to erase
     */
    eraseFragment(index) {
        // Clear the entire canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Redraw all fragments except those from index onwards
        // Use batch rendering for better performance
        for (let i = 0; i < index; i++) {
            this.drawFragmentDirect(this.fragments[i]);
        }
    }
    
    /**
     * Clean up resources to free memory
     */
    cleanup() {
        // Clear fragments array to free memory
        this.drawnFragments = [];
        
        // Reset temp canvas to minimal size
        if (this.tempCanvas) {
            this.tempCanvas.width = 1;
            this.tempCanvas.height = 1;
        }
    }

    /**
     * Draw a single column of a fragment
     * @param {Object} fragment - Fragment data
     * @param {number} column - Column index to draw
     */
    drawFragmentColumn(fragment, column) {
        if (column < 0 || column >= fragment.width) return;
        
        const imageData = fragment.imageData;
        const data = imageData.data;
        
        // Batch pixel operations for better performance
        this.ctx.save();
        this.ctx.globalAlpha = 0.9 + Math.random() * 0.1;
        
        // Draw each pixel in this column
        for (let y = 0; y < fragment.height; y++) {
            const idx = (y * fragment.width + column) * 4;
            const a = data[idx + 3];
            
            // Skip transparent pixels
            if (a === 0) continue;
            
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            
            this.ctx.fillStyle = `rgb(${r},${g},${b})`;
            this.ctx.fillRect(
                fragment.x + column,
                fragment.y + y,
                1.2,
                1.2
            );
        }
        
        this.ctx.restore();
    }

    /**
     * Draw a single fragment on the canvas with brush-like effect
     * @param {Object} fragment - Fragment data
     */
    drawFragment(fragment) {
        // Log brush effect on first fragment
        if (this.currentIndex === 0) {
            console.log('🖌️ Brush rendering active: opacity variation, position jitter, smoothing');
        }

        // Reuse temp canvas instead of creating new one (memory optimization)
        if (this.tempCanvas.width !== fragment.width || this.tempCanvas.height !== fragment.height) {
            this.tempCanvas.width = fragment.width;
            this.tempCanvas.height = fragment.height;
        }

        // Draw fragment to temporary canvas
        this.tempCtx.putImageData(fragment.imageData, 0, 0);

        // Save current context state
        this.ctx.save();

        // Add opacity variation for organic brush feel
        const opacityVariation = 0.80 + Math.random() * 0.20; // 0.80 to 1.0
        this.ctx.globalAlpha = opacityVariation;

        // Use source-over for natural blending
        this.ctx.globalCompositeOperation = 'source-over';

        // Add position jitter for more organic feel
        const jitterX = (Math.random() - 0.5) * 1.5;
        const jitterY = (Math.random() - 0.5) * 1.5;

        // Draw with slight blur for softer brush strokes
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';

        // Draw the fragment from temp canvas
        this.ctx.drawImage(
            this.tempCanvas,
            0, 0, fragment.width, fragment.height,
            fragment.x + jitterX, fragment.y + jitterY, fragment.width, fragment.height
        );

        // Restore context state
        this.ctx.restore();
    }

    /**
     * Draw a fragment directly without brush effects (for erasing redraw)
     * @param {Object} fragment - Fragment data
     */
    drawFragmentDirect(fragment) {
        // Reuse temp canvas instead of creating new one
        if (this.tempCanvas.width !== fragment.width || this.tempCanvas.height !== fragment.height) {
            this.tempCanvas.width = fragment.width;
            this.tempCanvas.height = fragment.height;
        }
        this.tempCtx.putImageData(fragment.imageData, 0, 0);
        
        this.ctx.drawImage(
            this.tempCanvas,
            0, 0, fragment.width, fragment.height,
            fragment.x, fragment.y, fragment.width, fragment.height
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
