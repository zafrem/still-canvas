# Changelog

All notable changes to Still Canvas project.

## [Unreleased]

### Added - Brush-Like Painting Effect
- **Organic Fragment Shuffling**: Fragments now shuffled within brightness groups for natural appearance
  - Configurable group size (default: 50 fragments)
  - Maintains light-to-dark progression while appearing random
  - Implemented in `imageAnalyzer.js:shuffleWithinBrightnessGroups()`

- **Brush Stroke Effects**: Each fragment painted with variations
  - Random opacity (88-100%) for natural brush feel
  - Subtle position jitter (±0.25px) for hand-painted appearance
  - High-quality image smoothing for softer edges
  - Implemented in `paintEngine.js:drawFragment()`

- **Documentation**:
  - Created `BRUSH_EFFECT.md` with detailed explanation and customization guide
  - Updated README with brush effect features

### Added - Multi-Format Image Support
- **Automatic Format Detection**: App tries both JPG and PNG formats
  - No configuration needed - just drop in images
  - Tries .jpg first, then .png
  - Clear console logging of which format loaded
  - Helpful error messages showing all attempted paths

- **Flexible Path Configuration**:
  - Supports both single string and array of paths
  - Backward compatible with existing code
  - Easy to add fallback images

- **Documentation**:
  - Created `FORMAT_SUPPORT.md` with implementation details
  - Updated README, QUICKSTART, and assets/images/README

### Changed
- Image loading now accepts string or array of paths
- Fragment rendering uses temporary canvas for effects
- Error messages now show all attempted file paths

### Technical Details

**Files Modified**:
- `js/imageAnalyzer.js`: Added `shuffleWithinBrightnessGroups()` method
- `js/paintEngine.js`: Enhanced `drawFragment()` with brush effects
- `js/app.js`: Updated `loadImage()` for multi-format support
- `README.md`: Added brush effect and multi-format features
- `QUICKSTART.md`: Updated image format instructions
- `assets/images/README.md`: Clarified format support

**Files Added**:
- `BRUSH_EFFECT.md`: Comprehensive brush effect documentation
- `FORMAT_SUPPORT.md`: Multi-format support documentation
- `CHANGELOG.md`: This file

**Performance Impact**:
- Minimal: Shuffling happens once during analysis
- Brush effects use GPU-accelerated canvas operations
- Maintains target 30-60 FPS

## [1.0.0] - Initial Release

### Added
- Color-based painting animation (light to dark)
- Four category system (Landscape, Meditation, Still Life, Photography)
- Real-time playback controls (pause, resume, reset)
- Adjustable speed and fragment size
- Responsive design
- Keyboard shortcuts (Space for pause, R for reset)
- Progress tracking with visual feedback
- GitHub Pages deployment ready
- Placeholder image generator tool

**Initial Files**:
- `index.html`: Main application interface
- `css/style.css`: Complete styling and responsive design
- `js/imageAnalyzer.js`: Image analysis and fragmentation
- `js/paintEngine.js`: Canvas painting engine
- `js/app.js`: Application logic and UI controls
- `create-placeholder-images.html`: Image generation tool
- `README.md`: Full documentation
- `QUICKSTART.md`: Quick start guide
- `TESTING.md`: Testing procedures
- `LICENSE`: MIT License
