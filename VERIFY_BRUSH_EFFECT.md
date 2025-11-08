# Verify Brush Effect is Working

If you're not seeing the brush effect, follow these steps:

## 1. Clear Browser Cache

**Chrome/Edge:**
- Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
- Select "Cached images and files"
- Click "Clear data"
- OR simply do a hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

**Firefox:**
- Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
- Check "Cache"
- Click "Clear Now"
- OR hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`

**Safari:**
- Safari → Preferences → Advanced → Check "Show Develop menu"
- Develop → Empty Caches
- OR hard refresh: `Cmd+Option+R`

## 2. Verify Files Changed

Run these commands to confirm the changes are in place:

```bash
# Check shuffle group size (should show 30)
grep "groupSize = " js/imageAnalyzer.js

# Check opacity variation (should show 0.80)
grep "opacityVariation = " js/paintEngine.js

# Check jitter (should show 1.5)
grep "jitterX = " js/paintEngine.js
```

Expected output:
```
const groupSize = 30;
const opacityVariation = 0.80 + Math.random() * 0.20;
const jitterX = (Math.random() - 0.5) * 1.5;
```

## 3. What You Should See

### Grid Pattern (OLD - What you DON'T want to see):
- Fragments fill in row by row, column by column
- Very predictable, mechanical pattern
- Clean horizontal and vertical lines visible
- No variation in appearance

### Brush Effect (NEW - What you SHOULD see):
- Fragments appear randomly across the canvas
- No obvious grid pattern
- Light areas fill in first, but scattered across image
- Slight transparency variations
- Organic, painterly appearance
- Some fragments slightly offset from perfect grid

## 4. Test Steps

1. **Open in browser** (use local server):
   ```bash
   python -m http.server 8000
   ```
   Visit: http://localhost:8000

2. **Hard refresh** the page (`Ctrl+F5` or `Cmd+Shift+R`)

3. **Open DevTools Console** (`F12`)
   - Look for: `Successfully loaded: [path]`
   - No errors should appear

4. **Watch the painting animation**:
   - Should NOT paint in neat rows/columns
   - Should appear random and organic
   - Light patches should appear scattered, not in order

## 5. Visual Test

Take a screenshot at 25% completion:

**Grid Pattern (Old):**
```
■ ■ ■ ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■ ■ ■
□ □ □ □ □ □ □ □
□ □ □ □ □ □ □ □
```
Top rows completely filled, bottom empty.

**Brush Effect (New):**
```
■ □ ■ ■ □ ■ □ ■
□ ■ ■ □ ■ ■ □ ■
■ ■ □ ■ □ ■ ■ □
□ ■ □ □ ■ □ ■ ■
■ □ ■ □ □ ■ □ □
```
Scattered throughout canvas.

## 6. Troubleshooting

### Still seeing grid pattern?

**A. Check browser console for errors:**
```javascript
// Press F12, go to Console tab
// Should see: "Successfully loaded: assets/images/[category]/default.jpg"
// Should NOT see any JavaScript errors
```

**B. Verify script versions loaded:**
```javascript
// In browser console, type:
console.log('Test shuffle:', new ImageAnalyzer().shuffleWithinBrightnessGroups ? 'YES' : 'NO');
```
Should output: `Test shuffle: YES`

**C. Force reload scripts:**
- Open DevTools (F12)
- Go to Network tab
- Check "Disable cache"
- Reload page

**D. Try incognito/private mode:**
- Opens without cache
- If it works here, it's a caching issue

### Changes ARE working but effect is subtle?

The current settings are VERY pronounced:
- Group size: 30 (quite random)
- Opacity: 80-100% (noticeable variation)
- Jitter: ±0.75 pixels (visible offset)

If you want even MORE dramatic effect, edit:

**`js/imageAnalyzer.js:185`** - Make it MORE chaotic:
```javascript
const groupSize = 10; // Very random!
```

**`js/paintEngine.js:170`** - More transparency:
```javascript
const opacityVariation = 0.60 + Math.random() * 0.40; // 60-100%
```

**`js/paintEngine.js:177-178`** - More position variation:
```javascript
const jitterX = (Math.random() - 0.5) * 3.0; // ±1.5 pixels
const jitterY = (Math.random() - 0.5) * 3.0;
```

## 7. Comparison Test

Create a test to see the difference:

**Disable brush effect temporarily:**

Comment out in `js/imageAnalyzer.js:88`:
```javascript
// this.shuffleWithinBrightnessGroups(fragments);
```

Reload → You'll see the OLD grid pattern.

Uncomment → Reload → You'll see the NEW brush effect.

The difference should be immediately obvious!
