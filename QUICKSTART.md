# Quick Start Guide

Get Still Canvas running in 5 minutes!

## Step 1: Get the Code

You already have it if you're reading this file.

## Step 2: Add Images

### Option A: Generate Test Images (Fastest)

1. Open `create-placeholder-images.html` in your web browser
2. Four placeholder images will appear
3. Right-click each canvas image and select "Save Image As..."
4. Save them to:
   - First image → `assets/images/landscape/default.jpg`
   - Second image → `assets/images/meditation/default.jpg`
   - Third image → `assets/images/stilllife/default.jpg`
   - Fourth image → `assets/images/photography/default.jpg`

### Option B: Use Real Images (Better Results)

1. Find 4 images you like (recommended: 800x600 to 1200x900 pixels)
2. Rename them to `default.jpg` or `default.png` (both formats work!)
3. Place them in the category folders above
4. The app automatically detects which format you used

**Pro tip**: Download free stock photos from:
- [Unsplash](https://unsplash.com) - Beautiful free photos
- [Pexels](https://pexels.com) - Free stock photography
- [Pixabay](https://pixabay.com) - Free images

## Step 3: Run the App

### Method 1: Simple (Just open the file)
- Double-click `index.html`
- Works in most cases, but may have CORS issues with some browsers

### Method 2: Local Server (Recommended)

**If you have Python installed:**
```bash
# In the project directory
python -m http.server 8000
```
Then visit: http://localhost:8000

**If you have Node.js:**
```bash
npx http-server
```
Then visit: http://localhost:8080

**If you have PHP:**
```bash
php -S localhost:8000
```
Then visit: http://localhost:8000

## Step 4: Enjoy!

1. Click category buttons to switch images
2. Use the pause/resume button to control animation
3. Adjust speed and fragment size with sliders
4. Press **Space** to pause/resume
5. Press **R** to reset

## Troubleshooting

**Problem**: Images don't load
- **Solution**: Make sure you saved images to the correct folders with correct names

**Problem**: Console shows CORS errors
- **Solution**: Run with a local server (see Method 2 above)

**Problem**: Animation is slow
- **Solution**: Increase the speed slider or use smaller images

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [TESTING.md](TESTING.md) for testing procedures
- Customize colors in `css/style.css`
- Add your own images in `assets/images/`

## Deploy to GitHub Pages

1. Commit all files to your repository:
   ```bash
   git add .
   git commit -m "Initial Still Canvas setup"
   git push
   ```

2. Go to GitHub repository Settings → Pages

3. Select `main` branch and click Save

4. Your site will be live at:
   `https://yourusername.github.io/Still-canvas/`

That's it! You're ready to create beautiful generative art.
