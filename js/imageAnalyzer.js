/**
 * ImageAnalyzer - Analyzes images and creates sorted fragments based on brightness
 */
class ImageAnalyzer {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    /**
     * Load and analyze an image
     * @param {string} imagePath - Path to the image
     * @param {number} fragmentSize - Size of each fragment in pixels
     * @returns {Promise} Resolves with analyzed fragments
     */
    async analyze(imagePath, fragmentSize = 20) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                try {
                    const fragments = this.processImage(img, fragmentSize);
                    resolve({
                        fragments,
                        width: img.width,
                        height: img.height,
                        image: img
                    });
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => {
                reject(new Error(`Failed to load image: ${imagePath}`));
            };

            img.src = imagePath;
        });
    }

    /**
     * Process image into fragments and sort by brightness
     * @param {Image} img - The loaded image
     * @param {number} fragmentSize - Size of each fragment
     * @returns {Array} Sorted array of fragments
     */
    processImage(img, fragmentSize) {
        // Set canvas size to match image
        this.canvas.width = img.width;
        this.canvas.height = img.height;

        // Draw image to canvas
        this.ctx.drawImage(img, 0, 0);

        const fragments = [];
        const cols = Math.ceil(img.width / fragmentSize);
        const rows = Math.ceil(img.height / fragmentSize);

        // Create fragments
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * fragmentSize;
                const y = row * fragmentSize;
                const width = Math.min(fragmentSize, img.width - x);
                const height = Math.min(fragmentSize, img.height - y);

                // Get image data for this fragment
                const imageData = this.ctx.getImageData(x, y, width, height);
                const brightness = this.calculateBrightness(imageData);

                fragments.push({
                    x,
                    y,
                    width,
                    height,
                    brightness,
                    imageData
                });
            }
        }

        // Sort fragments by brightness (lightest first)
        fragments.sort((a, b) => b.brightness - a.brightness);

        return fragments;
    }

    /**
     * Calculate average brightness of a fragment
     * @param {ImageData} imageData - The fragment's image data
     * @returns {number} Average brightness value (0-255)
     */
    calculateBrightness(imageData) {
        const data = imageData.data;
        let totalBrightness = 0;
        let pixelCount = 0;

        // Process every pixel in the fragment
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            // Skip fully transparent pixels
            if (a === 0) continue;

            // Calculate perceived brightness using luminance formula
            // Human eye is more sensitive to green, less to blue
            const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
            totalBrightness += brightness;
            pixelCount++;
        }

        return pixelCount > 0 ? totalBrightness / pixelCount : 0;
    }

    /**
     * Calculate color intensity using HSL
     * @param {ImageData} imageData - The fragment's image data
     * @returns {number} Average lightness value (0-100)
     */
    calculateLightness(imageData) {
        const data = imageData.data;
        let totalLightness = 0;
        let pixelCount = 0;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i] / 255;
            const g = data[i + 1] / 255;
            const b = data[i + 2] / 255;
            const a = data[i + 3];

            if (a === 0) continue;

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const lightness = (max + min) / 2;

            totalLightness += lightness * 100;
            pixelCount++;
        }

        return pixelCount > 0 ? totalLightness / pixelCount : 0;
    }

    /**
     * Get dominant color of a fragment
     * @param {ImageData} imageData - The fragment's image data
     * @returns {Object} RGB color object
     */
    getDominantColor(imageData) {
        const data = imageData.data;
        let r = 0, g = 0, b = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] === 0) continue;
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
        }

        if (count === 0) return { r: 255, g: 255, b: 255 };

        return {
            r: Math.round(r / count),
            g: Math.round(g / count),
            b: Math.round(b / count)
        };
    }
}
