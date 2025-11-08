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
            // Only set crossOrigin for external URLs, not local files
            if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                img.crossOrigin = 'anonymous';
            }

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
     * @param {number} fragmentSize - Size of each fragment (used as target size)
     * @returns {Array} Sorted array of fragments
     */
    processImage(img, fragmentSize) {
        // Set canvas size to match image
        this.canvas.width = img.width;
        this.canvas.height = img.height;

        // Draw image to canvas
        this.ctx.drawImage(img, 0, 0);

        // Get full image data for color-based segmentation
        const fullImageData = this.ctx.getImageData(0, 0, img.width, img.height);
        
        // Create organic brush-shaped fragments based on color similarity
        const fragments = this.createOrganicFragments(fullImageData, fragmentSize);

        // Sort fragments by brightness (lightest to darkest)
        fragments.sort((a, b) => b.brightness - a.brightness);

        console.log('🎨 Created', fragments.length, 'organic brush-shaped fragments');
        console.log('✓ Painting from light to dark colors');

        return fragments;
    }

    /**
     * Create organic brush-shaped fragments based on color similarity
     * @param {ImageData} fullImageData - The complete image data
     * @param {number} targetSize - Target size for fragments
     * @returns {Array} Array of organic fragments
     */
    createOrganicFragments(fullImageData, targetSize) {
        const width = fullImageData.width;
        const height = fullImageData.height;
        const data = fullImageData.data;
        const visited = new Uint8Array(width * height);
        let fragments = [];
        
        // Color similarity threshold (higher = larger fragments with more color variation)
        const colorThreshold = 100; // 더 큰 색상 유사도 범위
        
        // Minimum and maximum fragment size
        const minSize = Math.max(16, Math.floor(targetSize * 5)); // 최소 크기를 targetSize * 5로 설정
        const maxSize = targetSize * targetSize * 10; // 더 큰 최대 크기
        
        // Sample starting points in a semi-random pattern (wider spacing)
        const step = Math.max(12, Math.floor(targetSize * 1.2)); // 더 넓은 간격
        
        for (let startY = 0; startY < height; startY += step) {
            for (let startX = 0; startX < width; startX += step) {
                // Add some randomness to starting points
                const x = Math.min(width - 1, startX + Math.floor(Math.random() * step));
                const y = Math.min(height - 1, startY + Math.floor(Math.random() * step));
                const idx = y * width + x;
                
                if (visited[idx]) continue;
                
                // Grow an organic region from this point
                const region = this.growOrganicRegion(
                    data, width, height, x, y, 
                    visited, colorThreshold, maxSize
                );
                
                if (region.pixels.length >= minSize) {
                    // Create fragment from region
                    const fragment = this.createFragmentFromRegion(
                        region, data, width, height
                    );
                    if (fragment) {
                        fragments.push(fragment);
                    }
                }
            }
        }
        
        // Fill any remaining unvisited pixels with small fragments
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                if (!visited[idx]) {
                    const region = this.growOrganicRegion(
                        data, width, height, x, y,
                        visited, colorThreshold, maxSize
                    );
                    
                    if (region.pixels.length > 0) {
                        const fragment = this.createFragmentFromRegion(
                            region, data, width, height
                        );
                        if (fragment) {
                            fragments.push(fragment);
                        }
                    }
                }
            }
        }
        
        // Merge small fragments with nearby fragments
        fragments = this.mergeSmallFragments(fragments, minSize * 2);
        
        return fragments;
    }
    
    /**
     * Grow an organic region from a seed point using flood fill with color similarity
     * @param {Uint8ClampedArray} data - Image data
     * @param {number} width - Image width
     * @param {number} height - Image height
     * @param {number} seedX - Starting x coordinate
     * @param {number} seedY - Starting y coordinate
     * @param {Uint8Array} visited - Visited pixels array
     * @param {number} threshold - Color similarity threshold
     * @param {number} maxSize - Maximum region size
     * @returns {Object} Region object with pixels and bounds
     */
    growOrganicRegion(data, width, height, seedX, seedY, visited, threshold, maxSize) {
        const pixels = [];
        const queue = [{x: seedX, y: seedY}];
        const seedIdx = seedY * width + seedX;
        
        // Get seed color
        const seedR = data[seedIdx * 4];
        const seedG = data[seedIdx * 4 + 1];
        const seedB = data[seedIdx * 4 + 2];
        
        let minX = seedX, maxX = seedX;
        let minY = seedY, maxY = seedY;
        
        while (queue.length > 0 && pixels.length < maxSize) {
            const {x, y} = queue.shift();
            const idx = y * width + x;
            
            if (x < 0 || x >= width || y < 0 || y >= height) continue;
            if (visited[idx]) continue;
            
            // Check color similarity
            const r = data[idx * 4];
            const g = data[idx * 4 + 1];
            const b = data[idx * 4 + 2];
            
            const colorDiff = Math.sqrt(
                Math.pow(r - seedR, 2) +
                Math.pow(g - seedG, 2) +
                Math.pow(b - seedB, 2)
            );
            
            if (colorDiff > threshold) continue;
            
            // Mark as visited and add to region
            visited[idx] = 1;
            pixels.push({x, y});
            
            // Update bounds
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
            
            // Add neighbors with some randomness for organic shape
            const neighbors = [
                {x: x + 1, y: y},
                {x: x - 1, y: y},
                {x: x, y: y + 1},
                {x: x, y: y - 1}
            ];
            
            // Occasionally add diagonal neighbors for more natural shapes
            if (Math.random() > 0.5) {
                neighbors.push(
                    {x: x + 1, y: y + 1},
                    {x: x - 1, y: y - 1},
                    {x: x + 1, y: y - 1},
                    {x: x - 1, y: y + 1}
                );
            }
            
            // Shuffle neighbors for more organic growth
            for (let i = neighbors.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
            }
            
            queue.push(...neighbors);
        }
        
        return {
            pixels,
            bounds: {
                x: minX,
                y: minY,
                width: maxX - minX + 1,
                height: maxY - minY + 1
            }
        };
    }
    
    /**
     * Create a fragment from a region of pixels
     * @param {Object} region - Region object with pixels and bounds
     * @param {Uint8ClampedArray} data - Original image data
     * @param {number} imgWidth - Image width
     * @param {number} imgHeight - Image height
     * @returns {Object} Fragment object
     */
    createFragmentFromRegion(region, data, imgWidth, imgHeight) {
        const {pixels, bounds} = region;
        if (pixels.length === 0) return null;
        
        // Create imageData directly without temp canvas (memory optimization)
        const imageData = new ImageData(bounds.width, bounds.height);
        
        // Fill with transparent pixels
        for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i + 3] = 0;
        }
        
        // Copy pixels from region
        let totalBrightness = 0;
        for (const {x, y} of pixels) {
            const srcIdx = (y * imgWidth + x) * 4;
            const dstX = x - bounds.x;
            const dstY = y - bounds.y;
            const dstIdx = (dstY * bounds.width + dstX) * 4;
            
            imageData.data[dstIdx] = data[srcIdx];
            imageData.data[dstIdx + 1] = data[srcIdx + 1];
            imageData.data[dstIdx + 2] = data[srcIdx + 2];
            imageData.data[dstIdx + 3] = data[srcIdx + 3];
            
            // Calculate brightness
            const r = data[srcIdx];
            const g = data[srcIdx + 1];
            const b = data[srcIdx + 2];
            totalBrightness += (0.299 * r + 0.587 * g + 0.114 * b);
        }
        
        const brightness = totalBrightness / pixels.length;
        
        return {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            brightness,
            imageData
        };
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

    /**
     * Merge small fragments with nearby fragments to avoid tiny isolated pieces
     * @param {Array} fragments - Array of fragments
     * @param {number} minSize - Minimum size threshold for merging
     * @returns {Array} Array with merged fragments
     */
    mergeSmallFragments(fragments, minSize) {
        // Target minimum size for final fragments (더 큰 최소 크기)
        const targetMinSize = minSize * 5; // 3에서 5로 증가
        let currentFragments = fragments;
        let iteration = 0;
        const maxIterations = 5; // 3에서 5로 증가
        
        // 작은 조각이 없을 때까지 반복 병합
        while (iteration < maxIterations) {
            const merged = [];
            const toMerge = [];
            
            // Separate small and normal fragments
            for (const fragment of currentFragments) {
                const pixelCount = fragment.width * fragment.height;
                if (pixelCount < targetMinSize) {
                    toMerge.push(fragment);
                } else {
                    merged.push(fragment);
                }
            }
            
            // If no small fragments, we're done
            if (toMerge.length === 0) {
                console.log(`✓ All fragments meet minimum size after ${iteration} iterations`);
                return currentFragments;
            }
            
            console.log(`🔗 Iteration ${iteration + 1}: Merging ${toMerge.length} small fragments`);
            
            // Group small fragments by proximity and similar brightness
            const groups = [];
            const used = new Set();
            
            for (let i = 0; i < toMerge.length; i++) {
                if (used.has(i)) continue;
                
                const group = [toMerge[i]];
                used.add(i);
                let currentSize = toMerge[i].width * toMerge[i].height;
                
                // 목표 크기에 도달할 때까지 가까운 조각들을 계속 추가
                for (let j = i + 1; j < toMerge.length && currentSize < targetMinSize; j++) {
                    if (used.has(j)) continue;
                    
                    // 그룹의 중심점 계산
                    let centerX = 0, centerY = 0;
                    for (const frag of group) {
                        centerX += frag.x + frag.width / 2;
                        centerY += frag.y + frag.height / 2;
                    }
                    centerX /= group.length;
                    centerY /= group.length;
                    
                    const frag2 = toMerge[j];
                    const frag2CenterX = frag2.x + frag2.width / 2;
                    const frag2CenterY = frag2.y + frag2.height / 2;
                    
                    // Check distance from group center
                    const distance = Math.sqrt(
                        Math.pow(centerX - frag2CenterX, 2) + 
                        Math.pow(centerY - frag2CenterY, 2)
                    );
                    
                    // 평균 밝기 계산
                    let avgBrightness = 0;
                    for (const frag of group) {
                        avgBrightness += frag.brightness;
                    }
                    avgBrightness /= group.length;
                    
                    const brightnessDiff = Math.abs(avgBrightness - frag2.brightness);
                    
                    // 거리와 밝기 조건을 더 관대하게 (작은 조각을 적극적으로 병합)
                    if (distance < targetMinSize * 4 && brightnessDiff < 70) {
                        group.push(frag2);
                        used.add(j);
                        currentSize += frag2.width * frag2.height;
                        
                        // 너무 큰 그룹 방지
                        if (group.length >= 30) break;
                    }
                }
                
                groups.push(group);
            }
            
            // Merge each group into a single fragment
            for (const group of groups) {
                const mergedFragment = this.mergeFragmentGroup(group);
                if (mergedFragment) {
                    merged.push(mergedFragment);
                }
            }
            
            console.log(`   → Created ${groups.length} merged fragments`);
            
            currentFragments = merged;
            iteration++;
        }
        
        console.log(`✓ Final result: ${currentFragments.length} fragments after ${iteration} iterations`);
        return currentFragments;
    }
    
    /**
     * Merge a group of fragments into a single fragment
     * @param {Array} group - Array of fragments to merge
     * @returns {Object} Merged fragment
     */
    mergeFragmentGroup(group) {
        if (group.length === 0) return null;
        if (group.length === 1) return group[0];
        
        // Calculate bounding box for all fragments
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        for (const frag of group) {
            minX = Math.min(minX, frag.x);
            minY = Math.min(minY, frag.y);
            maxX = Math.max(maxX, frag.x + frag.width);
            maxY = Math.max(maxY, frag.y + frag.height);
        }
        
        const width = maxX - minX;
        const height = maxY - minY;
        
        // Create new imageData for merged fragment
        const imageData = new ImageData(width, height);
        
        // Fill with transparent pixels
        for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i + 3] = 0;
        }
        
        // Copy all fragments into the merged imageData
        let totalBrightness = 0;
        let pixelCount = 0;
        
        for (const frag of group) {
            const srcData = frag.imageData.data;
            
            for (let y = 0; y < frag.height; y++) {
                for (let x = 0; x < frag.width; x++) {
                    const srcIdx = (y * frag.width + x) * 4;
                    const dstX = frag.x - minX + x;
                    const dstY = frag.y - minY + y;
                    const dstIdx = (dstY * width + dstX) * 4;
                    
                    // Only copy non-transparent pixels
                    if (srcData[srcIdx + 3] > 0) {
                        imageData.data[dstIdx] = srcData[srcIdx];
                        imageData.data[dstIdx + 1] = srcData[srcIdx + 1];
                        imageData.data[dstIdx + 2] = srcData[srcIdx + 2];
                        imageData.data[dstIdx + 3] = srcData[srcIdx + 3];
                        
                        // Calculate brightness
                        const r = srcData[srcIdx];
                        const g = srcData[srcIdx + 1];
                        const b = srcData[srcIdx + 2];
                        totalBrightness += (0.299 * r + 0.587 * g + 0.114 * b);
                        pixelCount++;
                    }
                }
            }
        }
        
        const brightness = pixelCount > 0 ? totalBrightness / pixelCount : group[0].brightness;
        
        return {
            x: minX,
            y: minY,
            width: width,
            height: height,
            brightness: brightness,
            imageData: imageData
        };
    }

    /**
     * Shuffle fragments within brightness groups to create organic brush-like appearance
     * @param {Array} fragments - Sorted array of fragments
     */
    shuffleWithinBrightnessGroups(fragments) {
        // Group size - fragments within this range will be shuffled together
        const groupSize = 30; // Smaller = more random, larger = more structured

        for (let i = 0; i < fragments.length; i += groupSize) {
            const end = Math.min(i + groupSize, fragments.length);
            const group = fragments.slice(i, end);

            // Fisher-Yates shuffle within the group
            for (let j = group.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [group[j], group[k]] = [group[k], group[j]];
            }

            // Copy shuffled group back
            for (let j = 0; j < group.length; j++) {
                fragments[i + j] = group[j];
            }
        }
    }
}
