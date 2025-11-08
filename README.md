# Still Canvas

**Art slowly completed on a quiet screen**

A color-driven generative art web application that gradually "paints" images on a canvas by analyzing color intensity. The painting begins with lighter areas and progresses toward darker tones, creating a mesmerizing artistic reveal.

[View Live Demo](#) <!-- Add your GitHub Pages URL here -->

## Features

- **Color-Based Animation**: Images are painted from light to dark tones, simulating a natural painting process
- **Brush-Like Appearance**: Organic, hand-painted look with randomized strokes and subtle blending
- **Multiple Categories**: Choose from Landscape, Meditation, Still Life, or Photography
- **Multiple Format Support**: Automatically loads JPG or PNG images - no configuration needed
- **Real-time Controls**: Pause, resume, and reset animations
- **Adjustable Settings**: Control painting speed and fragment size
- **Responsive Design**: Works on desktop and tablet devices
- **No Dependencies**: Pure vanilla JavaScript with no external libraries
- **GitHub Pages Ready**: Fully static, client-side application

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Still-canvas.git
cd Still-canvas
```

### 2. Add Sample Images

You have two options:

**Option A: Generate Placeholder Images**
1. Open `create-placeholder-images.html` in your browser
2. Right-click each canvas and save images to:
   - `assets/images/landscape/default.jpg`
   - `assets/images/meditation/default.jpg`
   - `assets/images/stilllife/default.jpg`
   - `assets/images/photography/default.jpg`

**Option B: Use Your Own Images**
1. Place your images in the appropriate category folders
2. Rename them to `default.jpg` or `default.png`
3. The app automatically tries both formats - no code changes needed!
4. Recommended size: 800x600 to 1200x900 pixels

### 3. Run Locally

Simply open `index.html` in a modern web browser, or use a local server:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (with http-server)
npx http-server
```

Then visit `http://localhost:8000`

### 4. Deploy to GitHub Pages

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Select main branch as source
4. Your site will be live at `https://yourusername.github.io/Still-canvas/`

## How It Works

### Image Analysis (`imageAnalyzer.js`)
1. Divides source images into small fragments (default 20x20 pixels)
2. Calculates average brightness for each fragment using luminance formula
3. Sorts fragments from lightest to darkest
4. Shuffles fragments within brightness groups for organic, brush-like appearance

### Painting Engine (`paintEngine.js`)
1. Renders fragments sequentially on HTML5 canvas with brush effects
2. Applies random opacity variations (88-100%) for natural strokes
3. Adds subtle position jitter for hand-painted feel
4. Maintains 30-60 FPS for smooth animation
5. Supports speed control (1-100, affecting fragments per frame)

### Application Flow (`app.js`)
1. User selects a category
2. Image is loaded and analyzed
3. Painting animation starts automatically
4. Progress updates in real-time
5. User can control playback and settings

## Project Structure

```
Still-canvas/
├── index.html              # Main HTML file
├── css/
│   └── style.css          # Styles and responsive layout
├── js/
│   ├── imageAnalyzer.js   # Image analysis and fragmentation
│   ├── paintEngine.js     # Canvas painting engine
│   └── app.js             # Main application logic
├── assets/
│   └── images/
│       ├── landscape/
│       ├── meditation/
│       ├── stilllife/
│       └── photography/
└── create-placeholder-images.html  # Helper tool
```

## Controls

- **Category Buttons**: Select image category
- **Pause/Resume**: Toggle animation (or press Space)
- **Reset**: Restart painting from beginning (or press R)
- **Speed Slider**: Adjust painting speed (1-100)
- **Fragment Size**: Change fragment size (requires reload)

## Customization

### Change Image Paths

Edit `js/app.js`:

```javascript
this.imagePaths = {
    // Single image (will try both .jpg and .png automatically)
    landscape: ['assets/images/landscape/your-image.jpg', 'assets/images/landscape/your-image.png'],

    // Or use a single string - both formats work
    meditation: 'assets/images/meditation/your-image.jpg',

    // Add multiple fallback options
    stilllife: ['assets/images/stilllife/image1.jpg', 'assets/images/stilllife/image2.png'],
    // ...
};
```

### Adjust Default Settings

In `js/app.js` constructor:

```javascript
this.fragmentSize = 20;  // Fragment size in pixels
```

In `index.html` sliders:

```html
<input type="range" id="speedSlider" min="1" max="100" value="50">
```

### Modify Colors

Edit CSS variables in `css/style.css`:

```css
/* Gradient backgrounds */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Button colors */
border: 2px solid #667eea;
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires modern browser with HTML5 Canvas and ES6 support.

## Performance Tips

1. **Image Size**: Keep images under 2000x1500 for smooth performance
2. **Fragment Size**: Larger fragments = faster painting, less detail
3. **Speed Setting**: Adjust based on device capability
4. **Image Format**: JPEG recommended for faster loading
5. **Brush Effect**: See [BRUSH_EFFECT.md](BRUSH_EFFECT.md) for customization options

## Future Enhancements

- [ ] Color-based filters (warm, cool, grayscale)
- [ ] Audio integration (ambient sounds per category)
- [ ] Save/export final image
- [ ] Multiple images per category
- [ ] WebGL acceleration for smoother effects
- [ ] Mobile touch controls
- [ ] Social sharing capabilities

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by generative art and algorithmic painting techniques
- Built with vanilla JavaScript for maximum compatibility
- No external dependencies or frameworks

---

Made with care for the beauty of slow art 🎨