# Testing Guide

This document outlines testing procedures for the Still Canvas project.

## Pre-Testing Setup

Before testing the application, ensure you have added sample images:

1. Open `create-placeholder-images.html` in a browser
2. Save all four generated images to their respective folders
3. Or use your own images (800x600 to 1200x900 recommended)

## Manual Testing Checklist

### Image Loading and Analysis

- [ ] Open `index.html` in browser
- [ ] Verify "Analyzing image..." appears briefly
- [ ] Confirm canvas initializes with white background
- [ ] Check console for any JavaScript errors

### Painting Animation

- [ ] Verify animation starts automatically after image loads
- [ ] Confirm painting begins with light tones
- [ ] Check that darker tones appear progressively
- [ ] Verify smooth animation (no stuttering)
- [ ] Confirm progress bar updates correctly
- [ ] Check that percentage counter increments (0-100%)

### Category Selection

- [ ] Click "Meditation" button
  - Button becomes semi-transparent (active state)
  - Previous category button returns to normal
  - New image loads and paints
- [ ] Repeat for "Still Life" and "Photography"
- [ ] Verify landscape remains selected on page load

### Playback Controls

#### Pause/Resume
- [ ] Click "Pause" during animation
  - Animation stops
  - Button text changes to "Resume"
- [ ] Click "Resume"
  - Animation continues from where it stopped
  - Button text changes to "Pause"
- [ ] Test Space key for pause/resume

#### Reset
- [ ] Let animation run partially
- [ ] Click "Reset"
  - Canvas clears to white
  - Animation restarts from beginning
  - Progress resets to 0%
- [ ] Test 'R' key for reset

### Speed Control

- [ ] Move speed slider to minimum (1)
  - Animation should be very slow
- [ ] Move speed slider to maximum (100)
  - Animation should be much faster
- [ ] Test mid-range values
- [ ] Verify change takes effect immediately

### Fragment Size Control

- [ ] Move fragment slider from 20 to 5
  - Confirm new image loads
  - Verify smaller, more detailed fragments
- [ ] Move to 40
  - Confirm larger, faster-painting fragments
- [ ] Return to default (20)

### Completion Behavior

- [ ] Let animation complete fully
- [ ] Verify "Complete" message appears
- [ ] Confirm "Pause" button becomes disabled
- [ ] Check that progress bar shows 100%

### Error Handling

- [ ] Temporarily rename an image file
- [ ] Select that category
- [ ] Verify error message appears
- [ ] Check console for helpful error information
- [ ] Restore image file

## Performance Testing

### Frame Rate
- [ ] Open browser DevTools > Performance
- [ ] Record during painting
- [ ] Verify 30-60 FPS maintained
- [ ] Check for dropped frames

### Memory Usage
- [ ] Open DevTools > Memory
- [ ] Take heap snapshot before loading
- [ ] Load and paint image
- [ ] Take another snapshot
- [ ] Verify no significant memory leaks
- [ ] Switch categories multiple times
- [ ] Confirm memory stabilizes

### Large Images
- [ ] Test with 1920x1080 image
- [ ] Verify performance remains acceptable
- [ ] Check that canvas scales properly

## Browser Compatibility

Test on the following browsers:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest - Mac only)
- [ ] Edge (latest)

For each browser:
- [ ] Verify all features work
- [ ] Check visual consistency
- [ ] Test keyboard shortcuts
- [ ] Verify responsive behavior

## Responsive Design

### Desktop (1920x1080)
- [ ] All elements visible
- [ ] Proper spacing and layout
- [ ] Canvas scales appropriately

### Tablet (768x1024)
- [ ] Layout adjusts properly
- [ ] Buttons remain accessible
- [ ] Canvas fits viewport
- [ ] Controls wrap correctly

### Small Screens (Below 768px)
- [ ] Category buttons stack or wrap
- [ ] Settings controls remain usable
- [ ] Canvas resizes appropriately
- [ ] Text remains readable

## Code Quality Checks

### JavaScript
```bash
# Check for syntax errors
node -c js/imageAnalyzer.js
node -c js/paintEngine.js
node -c js/app.js
```

### Console Output
- [ ] No errors in console
- [ ] No warnings (except expected CORS for file://)
- [ ] Helpful error messages when issues occur

## Known Limitations

1. **CORS Issues**: Loading from `file://` may cause CORS errors. Use a local server for testing.
2. **Fragment Size**: Very small fragments (<5px) may cause performance issues on older devices.
3. **Image Size**: Images over 2000x2000 may slow down analysis on slower devices.

## Performance Benchmarks

Expected performance on modern hardware:

| Image Size | Fragment Size | Analysis Time | Painting Time (Speed 50) |
|------------|---------------|---------------|--------------------------|
| 800x600    | 20px          | <100ms       | ~5-10s                   |
| 1200x900   | 20px          | <200ms       | ~10-20s                  |
| 1920x1080  | 20px          | <400ms       | ~20-30s                  |

## Troubleshooting

### Issue: Images don't load
- Check that image files exist in correct folders
- Verify file names match paths in `app.js`
- Use browser DevTools Network tab to check requests

### Issue: Animation is jerky
- Reduce image size
- Increase fragment size
- Lower speed setting
- Close other browser tabs

### Issue: "Canvas tainted by cross-origin data"
- Ensure running from a web server, not `file://`
- Use `python -m http.server` or similar

## Test Results Template

```
Date: ___________
Browser: _________
OS: ______________

✓ Image Loading
✓ Animation Performance
✓ Category Switching
✓ Playback Controls
✓ Speed Adjustment
✓ Fragment Size
✓ Responsive Design
✓ Error Handling

Notes:
________________
________________
```

## Automated Testing (Future)

Consider adding:
- Unit tests for ImageAnalyzer brightness calculations
- Integration tests for PaintEngine animation
- End-to-end tests with Cypress or Playwright
- Performance regression tests
