# Multi-Format Image Support

The Still Canvas application now supports both JPG and PNG image formats with automatic detection.

## How It Works

### Automatic Format Detection
The app tries to load images in the following order:
1. First attempts `.jpg` extension
2. If that fails, tries `.png` extension
3. Uses whichever format exists

### No Configuration Required
Simply place your image files with either extension:
- `assets/images/landscape/default.jpg` OR
- `assets/images/landscape/default.png`

The app automatically finds and loads the correct file.

## Implementation Details

### Code Changes (js/app.js:14-19)
```javascript
this.imagePaths = {
    landscape: ['assets/images/landscape/default.jpg', 'assets/images/landscape/default.png'],
    meditation: ['assets/images/meditation/default.jpg', 'assets/images/meditation/default.png'],
    stilllife: ['assets/images/stilllife/default.jpg', 'assets/images/stilllife/default.png'],
    photography: ['assets/images/photography/default.jpg', 'assets/images/photography/default.png']
};
```

### Loading Logic (js/app.js:127-185)
- Accepts both string and array of paths
- Tries each path sequentially
- Uses first successful load
- Reports which format was loaded in console
- Shows helpful error if all formats fail

## Benefits

1. **Flexibility**: Use JPG for photos, PNG for graphics with transparency
2. **No Code Changes**: Just drop in your preferred format
3. **Fallback Support**: Can have multiple image options per category
4. **Clear Errors**: Helpful messages show all attempted paths

## Examples

### Single Format
```javascript
// Just .jpg
landscape: ['assets/images/landscape/default.jpg', 'assets/images/landscape/default.png']
// Only default.jpg exists - works fine!
```

### Mixed Formats
```javascript
// Some categories use JPG, others PNG
landscape: default.jpg exists
meditation: default.png exists
stilllife: default.jpg exists
photography: default.png exists
// All work automatically!
```

### Custom Paths
```javascript
this.imagePaths = {
    landscape: ['assets/images/landscape/mountain.jpg', 'assets/images/landscape/forest.png'],
    // Tries mountain.jpg first, then forest.png
};
```

## Console Output

When an image loads successfully:
```
Successfully loaded: assets/images/landscape/default.jpg
```

On error (tries all paths):
```
Failed to load image. Please check if an image exists at: 
assets/images/landscape/default.jpg or assets/images/landscape/default.png
```
